-- V47: Add display_order column to program table for admin ordering
ALTER TABLE program
    ADD COLUMN display_order INT NOT NULL DEFAULT 0;
