-- ============================================
-- Eskuul Database Schema
-- Based on SRS Class Diagram (Appendix B.1)
-- ============================================

-- Update users table to include teacher role and timestamps
ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add teacher role to the existing CHECK constraint (if it exists, we'll handle it)
DO $$
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

    -- Add new constraint with all three roles
    ALTER TABLE users ADD CONSTRAINT users_role_check
    CHECK (role IN ('student', 'teacher', 'admin'));
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if constraint doesn't exist
END $$;

-- ============================================
-- PDF Summaries Table
-- ============================================
CREATE TABLE IF NOT EXISTS pdf_summaries (
    file_id SERIAL PRIMARY KEY,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    grade_level VARCHAR(20),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Indexes for faster PDF lookups
CREATE INDEX IF NOT EXISTS idx_pdf_subject ON pdf_summaries(subject);
CREATE INDEX IF NOT EXISTS idx_pdf_grade ON pdf_summaries(grade_level);
CREATE INDEX IF NOT EXISTS idx_pdf_status ON pdf_summaries(status);
CREATE INDEX IF NOT EXISTS idx_pdf_uploaded_by ON pdf_summaries(uploaded_by);

-- ============================================
-- Quizzes Table
-- ============================================
CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    grade_level VARCHAR(20),
    total_marks INTEGER NOT NULL DEFAULT 0,
    time_limit_minutes INTEGER,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pdf_summary_id INTEGER REFERENCES pdf_summaries(file_id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Indexes for quizzes
CREATE INDEX IF NOT EXISTS idx_quiz_subject ON quizzes(subject);
CREATE INDEX IF NOT EXISTS idx_quiz_grade ON quizzes(grade_level);
CREATE INDEX IF NOT EXISTS idx_quiz_status ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quiz_created_by ON quizzes(created_by);

-- ============================================
-- Quiz Questions Table
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_questions (
    question_id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a VARCHAR(500) NOT NULL,
    option_b VARCHAR(500) NOT NULL,
    option_c VARCHAR(500) NOT NULL,
    option_d VARCHAR(500) NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    marks INTEGER DEFAULT 1,
    question_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster question retrieval
CREATE INDEX IF NOT EXISTS idx_question_quiz ON quiz_questions(quiz_id);

-- ============================================
-- Quiz Attempts Table
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempts (
    attempt_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(quiz_id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    total_marks INTEGER NOT NULL,
    percentage DECIMAL(5,2),
    time_taken_seconds INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- Indexes for quiz attempts
CREATE INDEX IF NOT EXISTS idx_attempt_student ON quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempt_quiz ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempt_completed ON quiz_attempts(completed_at);

-- ============================================
-- Quiz Attempt Answers Table
-- ============================================
CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
    answer_id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(attempt_id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES quiz_questions(question_id) ON DELETE CASCADE,
    student_answer CHAR(1) CHECK (student_answer IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN,
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster answer retrieval
CREATE INDEX IF NOT EXISTS idx_answer_attempt ON quiz_attempt_answers(attempt_id);

-- ============================================
-- Progress Reports Table (Aggregated Data)
-- ============================================
CREATE TABLE IF NOT EXISTS progress_reports (
    report_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    total_quizzes_attempted INTEGER DEFAULT 0,
    total_quizzes_passed INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    total_time_spent_minutes INTEGER DEFAULT 0,
    last_activity_at TIMESTAMP,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject)
);

-- Index for progress reports
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress_reports(student_id);

-- ============================================
-- Content Analytics Table (for Admin Dashboard)
-- ============================================
CREATE TABLE IF NOT EXISTS content_analytics (
    analytics_id SERIAL PRIMARY KEY,
    content_type VARCHAR(20) CHECK (content_type IN ('pdf', 'quiz')),
    content_id INTEGER NOT NULL,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Notifications Table
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) CHECK (type IN ('new_content', 'quiz_result', 'approval', 'rejection', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notification_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_read ON notifications(is_read);

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pdf_updated_at ON pdf_summaries;
CREATE TRIGGER update_pdf_updated_at BEFORE UPDATE ON pdf_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quiz_updated_at ON quizzes;
CREATE TRIGGER update_quiz_updated_at BEFORE UPDATE ON quizzes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'Tables created: users, pdf_summaries, quizzes, quiz_questions, quiz_attempts, quiz_attempt_answers, progress_reports, content_analytics, notifications';
END $$;
