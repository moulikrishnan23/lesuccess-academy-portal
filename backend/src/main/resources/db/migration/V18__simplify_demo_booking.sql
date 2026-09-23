-- V18: Remove unused columns from demo_booking
-- course_id FK, name, email, ip_address, updated_at

ALTER TABLE demo_booking
    DROP FOREIGN KEY fk_demo_booking_course;

ALTER TABLE demo_booking
    DROP INDEX idx_course_id;

ALTER TABLE demo_booking
    DROP INDEX idx_demo_booking_email;

ALTER TABLE demo_booking
    DROP COLUMN course_id;

ALTER TABLE demo_booking
    DROP COLUMN name;

ALTER TABLE demo_booking
    DROP COLUMN email;

ALTER TABLE demo_booking
    DROP COLUMN ip_address;

ALTER TABLE demo_booking
    DROP COLUMN updated_at;