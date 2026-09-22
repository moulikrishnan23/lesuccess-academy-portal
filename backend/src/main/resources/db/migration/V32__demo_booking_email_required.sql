-- V32: Make email column NOT NULL on demo_booking table after backfilling any missing records
UPDATE demo_booking
SET email = 'info@lesuccess.in'
WHERE email IS NULL OR TRIM(email) = '';

ALTER TABLE demo_booking
    MODIFY COLUMN email VARCHAR(160) NOT NULL;
