-- V16: Add name and email to demo_booking (course page enroll form captures all three)
ALTER TABLE demo_booking
    ADD COLUMN name  VARCHAR(120) NULL AFTER course_id,
    ADD COLUMN email VARCHAR(160) NULL AFTER name;

ALTER TABLE demo_booking
    ADD INDEX idx_demo_booking_email (email);
