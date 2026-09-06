-- V20: Make lead_capture.mobile nullable.
-- Mobile is now optional except for COURSE_ENROLL_FORM source (enforced in LeadService).
ALTER TABLE lead_capture
    MODIFY COLUMN mobile VARCHAR(20) NULL;
