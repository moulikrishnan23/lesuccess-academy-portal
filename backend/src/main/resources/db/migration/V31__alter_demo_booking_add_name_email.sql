-- V31: Add name and email columns to demo_booking table
ALTER TABLE demo_booking
    ADD COLUMN name VARCHAR(120) NULL AFTER id,
    ADD COLUMN email VARCHAR(160) NULL AFTER name;
