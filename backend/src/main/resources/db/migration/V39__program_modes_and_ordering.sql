-- V39: Add mode and venue_address to program and program_registration, ensure clean ordering

-- 1. Add mode and venue_address to program table
ALTER TABLE program
    ADD COLUMN mode VARCHAR(20) NOT NULL DEFAULT 'ONLINE' AFTER platform,
    ADD COLUMN venue_address VARCHAR(255) NULL AFTER meet_link;

-- Set mode and venue for campus programs
UPDATE program
SET mode = 'OFFLINE',
    venue_address = 'LeSuccess Academy Campus, Coimbatore'
WHERE platform LIKE '%Campus%' OR type = 'INTERNSHIP';

-- 2. Add mode and venue_address to program_registration table
ALTER TABLE program_registration
    ADD COLUMN mode VARCHAR(20) NULL AFTER email,
    ADD COLUMN venue_address VARCHAR(255) NULL AFTER mode;
