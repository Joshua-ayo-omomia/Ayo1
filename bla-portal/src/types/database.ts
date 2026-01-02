// Enum types for the database
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

// Table row types
export interface User {
  id: string;
  email: string;
  full_name: string;
  national_id: string;
  date_of_birth: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  submitted_at: string | null;
  updated_at: string;
  data: Record<string, unknown>;
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
  score: number;
  passed: boolean;
  completed_at: string;
}

// Insert types (for creating new records)
export type UserInsert = Omit<User, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type ApplicationInsert = Omit<Application, 'id' | 'updated_at'> & {
  id?: string;
  updated_at?: string;
};

export type DocumentInsert = Omit<Document, 'id' | 'uploaded_at'> & {
  id?: string;
  uploaded_at?: string;
};

export type AppointmentInsert = Omit<Appointment, 'id'> & {
  id?: string;
};

export type TestResultInsert = Omit<TestResult, 'id'> & {
  id?: string;
};

// Update types (for updating existing records)
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;
export type ApplicationUpdate = Partial<Omit<Application, 'id'>>;
export type DocumentUpdate = Partial<Omit<Document, 'id' | 'uploaded_at'>>;
export type AppointmentUpdate = Partial<Omit<Appointment, 'id'>>;
export type TestResultUpdate = Partial<Omit<TestResult, 'id'>>;

// Database type for Supabase client
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
