-- V20: Remove unused columns from demo_booking (course_id FK, name, email, ip_address, updated_at)
ALTER TABLE demo_booking
    DROP FOREIGN KEY fk_demo_booking_course,
    DROP INDEX idx_course_id,
    DROP INDEX idx_demo_booking_email,
    DROP COLUMN course_id,
    DROP COLUMN name,
    DROP COLUMN email,
    DROP COLUMN ip_address,
    DROP COLUMN updated_at;
