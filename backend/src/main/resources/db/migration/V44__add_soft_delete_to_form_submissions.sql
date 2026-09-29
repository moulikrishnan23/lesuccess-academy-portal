-- V44: Add soft-delete column to connect_with_us, course_enquiry, and program_registration tables
ALTER TABLE connect_with_us
    ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE course_enquiry
    ADD COLUMN deleted_at DATETIME NULL;

ALTER TABLE program_registration
    ADD COLUMN deleted_at DATETIME NULL;
