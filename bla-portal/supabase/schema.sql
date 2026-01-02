-- BLA Portal Database Schema
-- Run this in the Supabase SQL Editor to set up the database

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE application_type AS ENUM (
  'learner_permit',
  'driver_licence',
  'renewal'
);

CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'documents_verified',
  'test_scheduled',
  'approved',
  'rejected'
);

CREATE TYPE document_type AS ENUM (
  'photo',
  'proof_of_age',
  'proof_of_residence',
  'medical_certificate'
);

CREATE TYPE document_status AS ENUM (
  'pending',
  'verified',
  'rejected'
);

CREATE TYPE appointment_type AS ENUM (
  'regulations_test',
  'driving_test'
);

CREATE TYPE appointment_status AS ENUM (
  'scheduled',
  'completed',
  'cancelled',
  'no_show'
);

CREATE TYPE test_type AS ENUM (
  'regulations_test',
  'driving_test'
);

CREATE TYPE notification_type AS ENUM (
  'application_update',
  'document_request',
  'appointment_reminder',
  'test_result',
  'licence_expiry',
  'general'
);

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type application_type NOT NULL,
  status application_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data JSONB,

  CONSTRAINT valid_submitted_at CHECK (
    (status = 'draft' AND submitted_at IS NULL) OR
    (status != 'draft' AND submitted_at IS NOT NULL)
  )
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  file_url TEXT NOT NULL,
  status document_status NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(application_id, type)
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type appointment_type NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  location TEXT NOT NULL,
  status appointment_status NOT NULL DEFAULT 'scheduled'
);

-- Test Results table
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  test_type test_type NOT NULL,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(application_id, test_type)
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Preferences table
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  application_update BOOLEAN NOT NULL DEFAULT TRUE,
  document_request BOOLEAN NOT NULL DEFAULT TRUE,
  appointment_reminder BOOLEAN NOT NULL DEFAULT TRUE,
  test_result BOOLEAN NOT NULL DEFAULT TRUE,
  licence_expiry BOOLEAN NOT NULL DEFAULT TRUE,
  general BOOLEAN NOT NULL DEFAULT TRUE,
  email_application_update BOOLEAN NOT NULL DEFAULT TRUE,
  email_document_request BOOLEAN NOT NULL DEFAULT TRUE,
  email_appointment_reminder BOOLEAN NOT NULL DEFAULT TRUE,
  email_test_result BOOLEAN NOT NULL DEFAULT TRUE,
  email_licence_expiry BOOLEAN NOT NULL DEFAULT TRUE,
  email_general BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_type ON applications(type);
CREATE INDEX idx_documents_application_id ON documents(application_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_appointments_application_id ON appointments(application_id);
CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);
CREATE INDEX idx_test_results_application_id ON test_results(application_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Applications policies
CREATE POLICY "Users can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft applications"
  ON applications FOR UPDATE
  USING (auth.uid() = user_id AND status = 'draft');

-- Documents policies
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM applications WHERE id = application_id
    )
  );

CREATE POLICY "Users can upload documents to own applications"
  ON documents FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT user_id FROM applications WHERE id = application_id
    )
  );

-- Appointments policies
CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM applications WHERE id = application_id
    )
  );

-- Test Results policies
CREATE POLICY "Users can view own test results"
  ON test_results FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id FROM applications WHERE id = application_id
    )
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Notification Preferences policies
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create a storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Storage policies
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
