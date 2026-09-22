-- V38: Add missing form fields, team categories table, and Python Full Stack role heading

-- 1. Connect With Us: Add message column
ALTER TABLE connect_with_us
    ADD COLUMN message TEXT NULL AFTER email;

-- 2. Lead Capture: Add course_name and learning_mode columns
ALTER TABLE lead_capture
    ADD COLUMN course_name VARCHAR(150) NULL AFTER course_id,
    ADD COLUMN learning_mode VARCHAR(30) NULL AFTER course_name;

-- 3. Program Registration: Add email column
ALTER TABLE program_registration
    ADD COLUMN email VARCHAR(160) NULL AFTER mobile_number;

-- 4. Course Enquiry: Add query column
ALTER TABLE course_enquiry
    ADD COLUMN query TEXT NULL AFTER current_status;

-- 5. Team Category table
CREATE TABLE IF NOT EXISTS team_category (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL
);

-- Seed default team categories
INSERT IGNORE INTO team_category (name, display_order, created_at)
VALUES 
    ('Management Team', 1, NOW()),
    ('Our Mentors', 2, NOW());

-- 6. Python Full Stack Course: Ensure role heading is 'What does a Python Full Stack Developer do?'
UPDATE course SET 
    role_heading = 'What does a Python Full Stack Developer do?'
WHERE id = 1 OR name LIKE '%Python Full Stack%';