-- V40: Add organization_name and venue_name to program table
-- These fields allow Offline events to display richer venue/company information
-- Both columns are nullable for backward compatibility with existing records

ALTER TABLE program
    ADD COLUMN organization_name VARCHAR(120) NULL AFTER venue_address,
    ADD COLUMN venue_name VARCHAR(120) NULL AFTER organization_name;
