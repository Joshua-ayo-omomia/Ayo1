// Enums
export type ApplicationType = 'learner_permit' | 'driver_licence' | 'renewal';

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'documents_verified'
  | 'test_scheduled'
  | 'approved'
  | 'rejected';

export type DocumentType =
  | 'photo'
  | 'proof_of_age'
  | 'proof_of_residence'
  | 'medical_certificate';

export type DocumentStatus = 'pending' | 'verified' | 'rejected';

export type AppointmentType = 'regulations_test' | 'driving_test';

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export type TestType = 'regulations_test' | 'driving_test';

// Table Row Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  submitted_at: string | null;
  updated_at: string;
  data: Record<string, unknown> | null;
}

export interface Document {
  id: string;
  application_id: string;
  type: DocumentType;
  file_url: string;
  status: DocumentStatus;
  uploaded_at: string;
}

export interface Appointment {
  id: string;
  application_id: string;
  type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  status: AppointmentStatus;
}

export interface TestResult {
  id: string;
  application_id: string;
  test_type: TestType;
  score: number | null;
  passed: boolean;
  completed_at: string;
}

// Insert Types (for creating new records)
export interface UserInsert {
  id?: string;
  email: string;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
}

export interface ApplicationInsert {
  id?: string;
  user_id: string;
  type: ApplicationType;
  status?: ApplicationStatus;
  submitted_at?: string | null;
  updated_at?: string;
  data?: Record<string, unknown> | null;
}

export interface DocumentInsert {
  id?: string;
  application_id: string;
  type: DocumentType;
  file_url: string;
  status?: DocumentStatus;
  uploaded_at?: string;
}

export interface AppointmentInsert {
  id?: string;
  application_id: string;
  type: AppointmentType;
  scheduled_date: string;
  scheduled_time: string;
  location: string;
  status?: AppointmentStatus;
}

export interface TestResultInsert {
  id?: string;
  application_id: string;
  test_type: TestType;
  score?: number | null;
  passed: boolean;
  completed_at?: string;
}

// Update Types (for updating existing records)
export interface UserUpdate {
  email?: string;
  full_name?: string;
  national_id?: string;
  date_of_birth?: string;
  phone?: string | null;
  address?: string | null;
}

export interface ApplicationUpdate {
  type?: ApplicationType;
  status?: ApplicationStatus;
  submitted_at?: string | null;
  updated_at?: string;
  data?: Record<string, unknown> | null;
}

export interface DocumentUpdate {
  type?: DocumentType;
  file_url?: string;
  status?: DocumentStatus;
}

export interface AppointmentUpdate {
  scheduled_date?: string;
  scheduled_time?: string;
  location?: string;
  status?: AppointmentStatus;
}

export interface TestResultUpdate {
  score?: number | null;
  passed?: boolean;
}

// Database Schema Type (for Supabase client)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      applications: {
        Row: Application;
        Insert: ApplicationInsert;
        Update: ApplicationUpdate;
      };
      documents: {
        Row: Document;
        Insert: DocumentInsert;
        Update: DocumentUpdate;
      };
      appointments: {
        Row: Appointment;
        Insert: AppointmentInsert;
        Update: AppointmentUpdate;
      };
      test_results: {
        Row: TestResult;
        Insert: TestResultInsert;
        Update: TestResultUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_type: ApplicationType;
      application_status: ApplicationStatus;
      document_type: DocumentType;
      document_status: DocumentStatus;
      appointment_type: AppointmentType;
      appointment_status: AppointmentStatus;
      test_type: TestType;
    };
  };
}

// Helper types for queries with relations
export interface ApplicationWithDocuments extends Application {
  documents: Document[];
}

export interface ApplicationWithAppointments extends Application {
  appointments: Appointment[];
}

export interface ApplicationWithTestResults extends Application {
  test_results: TestResult[];
}

export interface ApplicationFull extends Application {
  user: User;
  documents: Document[];
  appointments: Appointment[];
  test_results: TestResult[];
}
