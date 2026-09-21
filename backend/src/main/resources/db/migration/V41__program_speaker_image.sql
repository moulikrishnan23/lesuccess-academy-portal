-- V41: Add speaker_name and image_url to program table
-- Allows Webinar and Workshop events to have custom speaker/trainer images and names
-- Both columns are nullable for backward compatibility with existing records

ALTER TABLE program
    ADD COLUMN speaker_name VARCHAR(120) NULL AFTER topic,
    ADD COLUMN image_url VARCHAR(255) NULL AFTER meet_link;
