-- ==============================================
-- SoT Command Center - Complete Database Setup
-- ==============================================
-- This file contains the complete SQL setup for the Summer of Tech Command Center
-- Run this entire script in Supabase SQL Editor for a fresh installation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================
-- CREATE STORAGE BUCKET
-- ==============================================

-- Create documents bucket for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents', 
    true,
    52428800, -- 50MB in bytes
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- CREATE CUSTOM ENUMS
-- ==============================================
CREATE TYPE student_status AS ENUM ('pending', 'approved', 'rejected', 'draft');
CREATE TYPE employer_status AS ENUM ('pending', 'approved', 'rejected', 'draft');
CREATE TYPE job_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'published', 'closed');
CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE attendance_status AS ENUM ('registered', 'attended', 'no_show', 'cancelled');
CREATE TYPE match_status AS ENUM ('suggested', 'viewed', 'interested', 'not_interested', 'matched');
CREATE TYPE availability_type AS ENUM ('full-time', 'part-time', 'internship', 'contract');
CREATE TYPE company_size AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise');
CREATE TYPE event_type AS ENUM ('workshop', 'meetup', 'webinar', 'networking', 'interview');
CREATE TYPE metric_type AS ENUM ('count', 'percentage', 'score', 'rate');
CREATE TYPE metric_category AS ENUM ('students', 'employers', 'jobs', 'events', 'matches');
CREATE TYPE period_type AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

-- ==============================================
-- CREATE TABLES
-- ==============================================

-- STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    university VARCHAR(200) NOT NULL,
    degree VARCHAR(200) NOT NULL,
    graduation_year INTEGER NOT NULL CHECK (graduation_year >= 2020 AND graduation_year <= 2030),
    phone VARCHAR(20),
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,
    profile_photo_url TEXT,
    cv_url TEXT,
    academic_records_url TEXT,
    skills TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    availability availability_type NOT NULL,
    availability_options availability_type[] DEFAULT '{}',
    location VARCHAR(200) NOT NULL,
    bio TEXT,
    status student_status DEFAULT 'pending',
    ai_validation_score DECIMAL(3,2) CHECK (ai_validation_score >= 0 AND ai_validation_score <= 10),
    ai_validation_notes TEXT,
    cv_analysis_score DECIMAL(4,2) CHECK (cv_analysis_score >= 0 AND cv_analysis_score <= 10),
    cv_analysis_notes TEXT,
    academic_records_analysis_score DECIMAL(4,2) CHECK (academic_records_analysis_score >= 0 AND academic_records_analysis_score <= 10),
    academic_records_analysis_notes TEXT,
    documents_uploaded_at TIMESTAMP WITH TIME ZONE,
    documents_analyzed_at TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMPLOYERS TABLE
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    company_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_name VARCHAR(200) NOT NULL,
    contact_title VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    website TEXT,
    industry VARCHAR(100) NOT NULL,
    company_size company_size NOT NULL,
    location VARCHAR(200) NOT NULL,
    description TEXT,
    logo_url TEXT,
    status employer_status DEFAULT 'pending',
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- JOB POSTINGS TABLE
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    skills_required TEXT[] DEFAULT '{}',
    location VARCHAR(200) NOT NULL,
    employment_type availability_type NOT NULL,
    salary_min INTEGER CHECK (salary_min >= 0),
    salary_max INTEGER CHECK (salary_max >= 0),
    application_deadline TIMESTAMP WITH TIME ZONE,
    status job_status DEFAULT 'draft',
    ai_enhancement_score DECIMAL(3,2) CHECK (ai_enhancement_score >= 0 AND ai_enhancement_score <= 10),
    ai_enhancement_notes TEXT,
    original_description TEXT,
    enhanced_description TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT salary_range_check CHECK (salary_max IS NULL OR salary_min IS NULL OR salary_max >= salary_min)
);

-- EVENTS TABLE
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    zoom_url TEXT,
    max_attendees INTEGER CHECK (max_attendees > 0),
    status event_status DEFAULT 'draft',
    organizer_id UUID NOT NULL,
    ai_summary TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT event_date_check CHECK (end_date > start_date)
);

-- EVENT ATTENDANCES TABLE
CREATE TABLE event_attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    status attendance_status DEFAULT 'registered',
    check_in_time TIMESTAMP WITH TIME ZONE,
    CONSTRAINT attendance_participant_check CHECK (
        (student_id IS NOT NULL AND employer_id IS NULL) OR 
        (student_id IS NULL AND employer_id IS NOT NULL)
    )
);

-- MATCHES TABLE (AI Matchmaking)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    match_score DECIMAL(5,2) NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
    status match_status DEFAULT 'suggested',
    ai_notes TEXT,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_match UNIQUE (student_id, employer_id, job_posting_id)
);

-- ANALYTICS TABLE
CREATE TABLE analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_type metric_type NOT NULL,
    category metric_category NOT NULL,
    period period_type NOT NULL,
    period_date DATE NOT NULL,
    metadata JSONB DEFAULT '{}'
);

-- ORGANIZERS/ADMINS TABLE
CREATE TABLE organizers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'organizer' CHECK (role IN ('admin', 'organizer')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE
);

-- APPLICATIONS TABLE (Student Job Applications)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'reviewed', 'interviewed', 'accepted', 'rejected')),
    cover_letter TEXT,
    notes TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_application UNIQUE (student_id, job_posting_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('student', 'employer', 'organizer')),
    recipient_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- AI INTERACTIONS TABLE (Track AI tool usage)
CREATE TABLE ai_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tool_type VARCHAR(50) NOT NULL CHECK (tool_type IN ('student_validator', 'job_enhancer', 'matchmaking')),
    user_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'employer', 'organizer')),
    input_data JSONB NOT NULL,
    output_data JSONB,
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- DOCUMENT ANALYSIS TABLE
CREATE TABLE document_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('cv', 'academic_records', 'resume')),
    document_url TEXT NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(100),
    extracted_text TEXT,
    ai_analysis JSONB,
    analysis_score DECIMAL(4,2) CHECK (analysis_score >= 0 AND analysis_score <= 10),
    analysis_notes TEXT,
    processing_status VARCHAR(50) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- ==============================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==============================================

-- Students indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_university ON students(university);
CREATE INDEX idx_students_graduation_year ON students(graduation_year);
CREATE INDEX idx_students_skills ON students USING GIN(skills);
CREATE INDEX idx_students_interests ON students USING GIN(interests);
CREATE INDEX idx_students_location ON students(location);
CREATE INDEX idx_students_last_activity ON students(last_activity);

-- Employers indexes
CREATE INDEX idx_employers_company_name ON employers(company_name);
CREATE INDEX idx_employers_status ON employers(status);
CREATE INDEX idx_employers_industry ON employers(industry);
CREATE INDEX idx_employers_company_size ON employers(company_size);
CREATE INDEX idx_employers_location ON employers(location);
CREATE INDEX idx_employers_last_activity ON employers(last_activity);

-- Job postings indexes
CREATE INDEX idx_job_postings_employer_id ON job_postings(employer_id);
CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_location ON job_postings(location);
CREATE INDEX idx_job_postings_employment_type ON job_postings(employment_type);
CREATE INDEX idx_job_postings_skills_required ON job_postings USING GIN(skills_required);
CREATE INDEX idx_job_postings_application_deadline ON job_postings(application_deadline);
CREATE INDEX idx_job_postings_last_activity ON job_postings(last_activity);

-- Events indexes
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_end_date ON events(end_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_organizer_id ON events(organizer_id);

-- Event attendances indexes
CREATE INDEX idx_event_attendances_event_id ON event_attendances(event_id);
CREATE INDEX idx_event_attendances_student_id ON event_attendances(student_id);
CREATE INDEX idx_event_attendances_employer_id ON event_attendances(employer_id);
CREATE INDEX idx_event_attendances_status ON event_attendances(status);

-- Matches indexes
CREATE INDEX idx_matches_student_id ON matches(student_id);
CREATE INDEX idx_matches_employer_id ON matches(employer_id);
CREATE INDEX idx_matches_job_posting_id ON matches(job_posting_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_match_score ON matches(match_score);
CREATE INDEX idx_matches_last_activity ON matches(last_activity);

-- Analytics indexes
CREATE INDEX idx_analytics_category ON analytics(category);
CREATE INDEX idx_analytics_period ON analytics(period);
CREATE INDEX idx_analytics_period_date ON analytics(period_date);
CREATE INDEX idx_analytics_metric_name ON analytics(metric_name);

-- Applications indexes
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_job_posting_id ON applications(job_posting_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_type, recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- AI interactions indexes
CREATE INDEX idx_ai_interactions_tool_type ON ai_interactions(tool_type);
CREATE INDEX idx_ai_interactions_user ON ai_interactions(user_type, user_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at);

-- Document analysis indexes
CREATE INDEX idx_document_analysis_student_id ON document_analysis(student_id);
CREATE INDEX idx_document_analysis_document_type ON document_analysis(document_type);
CREATE INDEX idx_document_analysis_processing_status ON document_analysis(processing_status);
CREATE INDEX idx_document_analysis_created_at ON document_analysis(created_at);

-- ==============================================
-- CREATE TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_organizers_updated_at BEFORE UPDATE ON organizers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update last_activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply last_activity triggers
CREATE TRIGGER update_students_last_activity BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_last_activity();
CREATE TRIGGER update_employers_last_activity BEFORE UPDATE ON employers FOR EACH ROW EXECUTE FUNCTION update_last_activity();
CREATE TRIGGER update_job_postings_last_activity BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_last_activity();
CREATE TRIGGER update_events_last_activity BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_last_activity();
CREATE TRIGGER update_matches_last_activity BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_last_activity();

-- ==============================================
-- CREATE FUNCTIONS
-- ==============================================

-- Function to check if user is organizer/admin
CREATE OR REPLACE FUNCTION is_organizer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organizers 
        WHERE auth_user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role FROM organizers 
        WHERE auth_user_id = auth.uid() 
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate student completion rate
CREATE OR REPLACE FUNCTION get_student_completion_rate()
RETURNS DECIMAL AS $$
DECLARE
    total_students INTEGER;
    completed_students INTEGER;
    completion_rate DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_students FROM students WHERE status != 'draft';
    SELECT COUNT(*) INTO completed_students FROM students WHERE status = 'approved';
    
    IF total_students = 0 THEN
        RETURN 0;
    END IF;
    
    completion_rate := (completed_students::DECIMAL / total_students::DECIMAL) * 100;
    RETURN completion_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get match success rate
CREATE OR REPLACE FUNCTION get_match_success_rate()
RETURNS DECIMAL AS $$
DECLARE
    total_matches INTEGER;
    successful_matches INTEGER;
    success_rate DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_matches FROM matches WHERE status IN ('interested', 'matched');
    SELECT COUNT(*) INTO successful_matches FROM matches WHERE status = 'matched';
    
    IF total_matches = 0 THEN
        RETURN 0;
    END IF;
    
    success_rate := (successful_matches::DECIMAL / total_matches::DECIMAL) * 100;
    RETURN success_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get event attendance rate
CREATE OR REPLACE FUNCTION get_event_attendance_rate(event_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_registrations INTEGER;
    attended_count INTEGER;
    attendance_rate DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_registrations 
    FROM event_attendances 
    WHERE event_id = event_id_param AND status IN ('registered', 'attended', 'no_show');
    
    SELECT COUNT(*) INTO attended_count 
    FROM event_attendances 
    WHERE event_id = event_id_param AND status = 'attended';
    
    IF total_registrations = 0 THEN
        RETURN 0;
    END IF;
    
    attendance_rate := (attended_count::DECIMAL / total_registrations::DECIMAL) * 100;
    RETURN attendance_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to create organizer user and link to auth
CREATE OR REPLACE FUNCTION create_organizer_user(
    user_email TEXT,
    user_password TEXT,
    first_name TEXT,
    last_name TEXT,
    user_role TEXT DEFAULT 'organizer'
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    organizer_id UUID;
    result JSON;
BEGIN
    -- Get the auth user ID (you'll need to replace this with actual auth.uid())
    SELECT id INTO new_user_id FROM auth.users WHERE email = user_email;
    
    IF new_user_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Auth user not found. Please create the user through Supabase Auth first.'
        );
    END IF;
    
    -- Create organizer record
    INSERT INTO organizers (email, first_name, last_name, role, auth_user_id)
    VALUES (user_email, first_name, last_name, user_role, new_user_id)
    RETURNING id INTO organizer_id;
    
    -- Update last login
    UPDATE organizers 
    SET last_login = NOW() 
    WHERE id = organizer_id;
    
    RETURN json_build_object(
        'success', true,
        'organizer_id', organizer_id,
        'auth_user_id', new_user_id,
        'message', 'Organizer user created successfully'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update organizer role
CREATE OR REPLACE FUNCTION update_organizer_role(
    organizer_email TEXT,
    new_role TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Validate role
    IF new_role NOT IN ('organizer', 'admin', 'super_admin') THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid role. Must be organizer, admin, or super_admin'
        );
    END IF;
    
    -- Update role
    UPDATE organizers 
    SET role = new_role, updated_at = NOW()
    WHERE email = organizer_email;
    
    IF FOUND THEN
        RETURN json_build_object(
            'success', true,
            'message', 'Role updated successfully'
        );
    ELSE
        RETURN json_build_object(
            'success', false,
            'error', 'Organizer not found'
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Function to deactivate organizer
CREATE OR REPLACE FUNCTION deactivate_organizer(
    organizer_email TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE organizers 
    SET is_active = false, updated_at = NOW()
    WHERE email = organizer_email;
    
    IF FOUND THEN
        RETURN json_build_object(
            'success', true,
            'message', 'Organizer deactivated successfully'
        );
    ELSE
        RETURN json_build_object(
            'success', false,
            'error', 'Organizer not found'
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- Helper function to validate file paths
CREATE OR REPLACE FUNCTION validate_document_path(file_path TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if path starts with documents/ and has student ID
  RETURN file_path ~ '^documents/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$';
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate document uploads
CREATE OR REPLACE FUNCTION validate_document_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Only validate documents bucket
  IF NEW.bucket_id = 'documents' THEN
    -- Check if file path follows the expected format
    -- Allow both documents/{student_id}/{filename} and temp/{student_id}/{filename}
    IF NOT (NEW.name ~ '^documents/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$' OR 
            NEW.name ~ '^temp/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$') THEN
      RAISE EXCEPTION 'Invalid file path format. Must be: documents/{student_id}/{filename} or temp/{student_id}/{filename}';
    END IF;
    
    -- Only check if student exists for documents/ path, not temp/ path
    IF NEW.name LIKE 'documents/%' THEN
      -- Check if student exists
      IF NOT EXISTS (
        SELECT 1 FROM students 
        WHERE id::text = (string_to_array(NEW.name, '/'))[2]
      ) THEN
        RAISE EXCEPTION 'Student ID in file path does not exist';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the document upload trigger
CREATE TRIGGER validate_document_upload_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION validate_document_upload();

-- Function to get document URLs for a student
CREATE OR REPLACE FUNCTION get_student_documents(student_uuid UUID)
RETURNS TABLE (
  document_type TEXT,
  file_name TEXT,
  file_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN o.name LIKE '%cv%' THEN 'cv'
      WHEN o.name LIKE '%academic%' OR o.name LIKE '%academic_records%' THEN 'academic_records'
      WHEN o.name LIKE '%resume%' THEN 'resume'
      ELSE 'other'
    END as document_type,
    o.name as file_name,
    o.metadata->>'url' as file_url,
    o.metadata->>'size' as file_size,
    o.created_at
  FROM storage.objects o
  WHERE o.bucket_id = 'documents'
    AND o.name LIKE 'documents/' || student_uuid::text || '/%'
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- CREATE VIEWS
-- ==============================================

-- View for student dashboard data
CREATE VIEW student_dashboard AS
SELECT 
    s.id,
    s.first_name,
    s.last_name,
    s.email,
    s.university,
    s.status,
    s.ai_validation_score,
    COUNT(a.id) as application_count,
    COUNT(m.id) as match_count,
    s.last_activity
FROM students s
LEFT JOIN applications a ON s.id = a.student_id
LEFT JOIN matches m ON s.id = m.student_id
GROUP BY s.id, s.first_name, s.last_name, s.email, s.university, s.status, s.ai_validation_score, s.last_activity;

-- View for employer dashboard data
CREATE VIEW employer_dashboard AS
SELECT 
    e.id,
    e.company_name,
    e.contact_name,
    e.status,
    COUNT(jp.id) as job_count,
    COUNT(a.id) as application_count,
    COUNT(m.id) as match_count,
    e.last_activity
FROM employers e
LEFT JOIN job_postings jp ON e.id = jp.employer_id
LEFT JOIN applications a ON jp.id = a.job_posting_id
LEFT JOIN matches m ON e.id = m.employer_id
GROUP BY e.id, e.company_name, e.contact_name, e.status, e.last_activity;

-- View for analytics summary
CREATE VIEW analytics_summary AS
SELECT 
    category,
    period,
    period_date,
    COUNT(*) as metric_count,
    AVG(metric_value) as avg_value,
    MAX(metric_value) as max_value,
    MIN(metric_value) as min_value
FROM analytics
GROUP BY category, period, period_date
ORDER BY period_date DESC;

-- View for organizer management
CREATE VIEW organizer_management AS
SELECT 
    o.id,
    o.email,
    o.first_name,
    o.last_name,
    o.role,
    o.is_active,
    o.last_login,
    o.created_at,
    o.updated_at,
    CASE 
        WHEN o.last_login IS NULL THEN 'Never'
        WHEN o.last_login > NOW() - INTERVAL '7 days' THEN 'Active'
        WHEN o.last_login > NOW() - INTERVAL '30 days' THEN 'Recent'
        ELSE 'Inactive'
    END as activity_status
FROM organizers o
ORDER BY o.created_at DESC;

-- View for document management dashboard
CREATE VIEW document_management AS
SELECT 
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.email,
  s.cv_url,
  s.academic_records_url,
  s.documents_uploaded_at,
  s.documents_analyzed_at,
  COUNT(o.id) as total_documents,
  MAX(o.created_at) as last_document_upload
FROM students s
LEFT JOIN storage.objects o ON (
  o.bucket_id = 'documents' AND 
  o.name LIKE 'documents/' || s.id::text || '/%'
)
GROUP BY s.id, s.first_name, s.last_name, s.email, s.cv_url, s.academic_records_url, s.documents_uploaded_at, s.documents_analyzed_at
ORDER BY last_document_upload DESC NULLS LAST;

-- ==============================================
-- ENABLE ROW LEVEL SECURITY
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analysis ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- CREATE RLS POLICIES
-- ==============================================

-- Organizers/Admins can do everything
CREATE POLICY "Organizers full access" ON students FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON employers FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON job_postings FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON events FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON event_attendances FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON matches FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON analytics FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON applications FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON notifications FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access" ON ai_interactions FOR ALL USING (is_organizer());
CREATE POLICY "Organizers full access to document_analysis" ON document_analysis FOR ALL USING (is_organizer());
CREATE POLICY "Organizers own profile" ON organizers FOR ALL USING (auth_user_id = auth.uid());

-- Students can read their own data and approved job postings
CREATE POLICY "Students own data" ON students FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "Students view approved jobs" ON job_postings FOR SELECT USING (status = 'published');
CREATE POLICY "Students own applications" ON applications FOR ALL USING (auth.uid()::text = student_id::text);
CREATE POLICY "Students own notifications" ON notifications FOR ALL USING (recipient_type = 'student' AND recipient_id::text = auth.uid()::text);
CREATE POLICY "Students read own document_analysis" ON document_analysis FOR SELECT USING (student_id = auth.uid());

-- Employers can read their own data and approved students
CREATE POLICY "Employers own data" ON employers FOR ALL USING (auth.uid()::text = id::text);
CREATE POLICY "Employers view approved students" ON students FOR SELECT USING (status = 'approved');
CREATE POLICY "Employers own job postings" ON job_postings FOR ALL USING (auth.uid()::text = employer_id::text);
CREATE POLICY "Employers own notifications" ON notifications FOR ALL USING (recipient_type = 'employer' AND recipient_id::text = auth.uid()::text);

-- ==============================================
-- CREATE STORAGE POLICIES
-- ==============================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload files to documents bucket
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'documents' AND
    (name ~ '^documents/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$' OR 
     name ~ '^temp/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$')
);

-- Policy 2: Allow authenticated users to view files
CREATE POLICY "Allow authenticated users to view files" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'documents' AND
    (name ~ '^documents/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$' OR 
     name ~ '^temp/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$')
);

-- Policy 3: Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'documents' AND
    (name ~ '^documents/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$' OR 
     name ~ '^temp/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$')
);

-- Policy 4: Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'documents' AND
    (name ~ '^documents/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$' OR 
     name ~ '^temp/[a-f0-9-]{36}/[^/]+\.(pdf|jpg|jpeg|png|gif|webp)$')
);

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant permissions for the functions
GRANT EXECUTE ON FUNCTION get_student_documents TO authenticated;
GRANT EXECUTE ON FUNCTION create_organizer_user TO authenticated;
GRANT EXECUTE ON FUNCTION update_organizer_role TO authenticated;
GRANT EXECUTE ON FUNCTION deactivate_organizer TO authenticated;

-- Grant storage permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- ==============================================
-- INSERT SAMPLE DATA
-- ==============================================

-- Insert sample organizer (Note: auth_user_id will be set when user signs up)
INSERT INTO organizers (email, first_name, last_name, role) VALUES 
('admin@sot.org.nz', 'Admin', 'User', 'admin'),
('organizer@sot.org.nz', 'Organizer', 'User', 'organizer');

-- Insert sample students
INSERT INTO students (email, first_name, last_name, university, degree, graduation_year, availability, location, skills, interests, status) VALUES 
('john.doe@university.ac.nz', 'John', 'Doe', 'University of Auckland', 'Computer Science', 2024, 'full-time', 'Auckland', 
 ARRAY['JavaScript', 'React', 'Node.js', 'Python'], ARRAY['Web Development', 'Machine Learning'], 'approved'),
('jane.smith@university.ac.nz', 'Jane', 'Smith', 'Victoria University', 'Software Engineering', 2024, 'internship', 'Wellington',
 ARRAY['Java', 'Spring Boot', 'SQL', 'Docker'], ARRAY['Backend Development', 'DevOps'], 'pending'),
('alex.johnson@university.ac.nz', 'Alex', 'Johnson', 'University of Auckland', 'Computer Science', 2025, 'full-time', 'Auckland',
 ARRAY['Python', 'Machine Learning', 'Data Science'], ARRAY['AI/ML', 'Data Analysis'], 'pending'),
('sarah.wilson@university.ac.nz', 'Sarah', 'Wilson', 'AUT', 'Software Engineering', 2025, 'internship', 'Auckland',
 ARRAY['React', 'Node.js', 'TypeScript'], ARRAY['Full Stack Development'], 'pending');

-- Insert sample employers
INSERT INTO employers (company_name, contact_email, contact_name, contact_title, industry, company_size, location, status) VALUES 
('TechCorp NZ', 'hr@techcorp.nz', 'Sarah Johnson', 'HR Manager', 'Technology', 'medium', 'Auckland', 'approved'),
('StartupXYZ', 'founder@startupxyz.nz', 'Mike Chen', 'Founder', 'Fintech', 'startup', 'Wellington', 'approved');

-- Insert sample job postings
INSERT INTO job_postings (employer_id, title, description, skills_required, location, employment_type, status) VALUES 
((SELECT id FROM employers WHERE company_name = 'TechCorp NZ'), 'Frontend Developer', 'Looking for a talented frontend developer to join our team...', 
 ARRAY['JavaScript', 'React', 'CSS'], 'Auckland', 'full-time', 'published'),
((SELECT id FROM employers WHERE company_name = 'StartupXYZ'), 'Backend Intern', 'Exciting opportunity for a backend development intern...',
 ARRAY['Java', 'Spring Boot', 'SQL'], 'Wellington', 'internship', 'published');

-- ==============================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE students IS 'Student profiles with AI validation scores and status tracking';
COMMENT ON COLUMN students.availability_options IS 'Array of availability types the student is interested in (full-time, part-time, internship, contract)';
COMMENT ON TABLE employers IS 'Employer company profiles and contact information';
COMMENT ON TABLE job_postings IS 'Job postings with AI enhancement capabilities';
COMMENT ON TABLE events IS 'Events management with Zoom integration support';
COMMENT ON TABLE event_attendances IS 'Event attendance tracking for students and employers';
COMMENT ON TABLE matches IS 'AI-powered student-employer matching system';
COMMENT ON TABLE analytics IS 'System metrics and KPIs for reporting';
COMMENT ON TABLE organizers IS 'Admin/organizer user accounts';
COMMENT ON TABLE applications IS 'Student job applications tracking';
COMMENT ON TABLE notifications IS 'System notifications for all user types';
COMMENT ON TABLE ai_interactions IS 'AI tool usage tracking and analytics';
COMMENT ON TABLE document_analysis IS 'Detailed AI analysis of student documents (CV, academic records, resume)';

COMMENT ON COLUMN students.ai_validation_score IS 'AI-generated validation score (0-10)';
COMMENT ON COLUMN job_postings.ai_enhancement_score IS 'AI-generated enhancement score (0-10)';
COMMENT ON COLUMN matches.match_score IS 'AI-generated match percentage (0-100)';
COMMENT ON COLUMN analytics.metadata IS 'Additional metric data in JSON format';
COMMENT ON COLUMN students.cv_url IS 'URL to uploaded CV document in Supabase Storage';
COMMENT ON COLUMN students.academic_records_url IS 'URL to uploaded academic records document in Supabase Storage';
COMMENT ON COLUMN students.cv_analysis_score IS 'AI analysis score for CV document (0-10)';
COMMENT ON COLUMN students.cv_analysis_notes IS 'AI analysis notes and feedback for CV document';
COMMENT ON COLUMN students.academic_records_analysis_score IS 'AI analysis score for academic records document (0-10)';
COMMENT ON COLUMN students.academic_records_analysis_notes IS 'AI analysis notes and feedback for academic records document';
COMMENT ON COLUMN students.documents_uploaded_at IS 'Timestamp when documents were uploaded';
COMMENT ON COLUMN students.documents_analyzed_at IS 'Timestamp when documents were analyzed by AI';

COMMENT ON FUNCTION validate_document_path IS 'Validates document file path format';
COMMENT ON FUNCTION validate_document_upload IS 'Trigger function to validate document uploads';
COMMENT ON FUNCTION get_student_documents IS 'Retrieves all documents for a specific student';
COMMENT ON VIEW document_management IS 'Dashboard view for managing student documents';

-- ==============================================
-- SETUP COMPLETE
-- ==============================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE 'SoT Command Center database setup completed successfully!';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Create auth user with email "your-email@example.com"';
    RAISE NOTICE '2. Run: UPDATE organizers SET auth_user_id = (SELECT id FROM auth.users WHERE email = ''your-email@example.com'') WHERE email = ''your-email@example.com'';';
    RAISE NOTICE '3. Configure environment variables in your application';
END $$;
