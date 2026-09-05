-- V19: Store course name at booking time so the record survives course rename or deletion.
ALTER TABLE demo_booking
    ADD COLUMN course_name VARCHAR(200) NULL AFTER course_id;
