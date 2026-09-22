-- V35: Add icon_url to course table and backfill default course logos
ALTER TABLE course ADD COLUMN icon_url VARCHAR(255) NULL;

UPDATE course SET icon_url = '/tech/python.svg' WHERE id = 1 OR name LIKE '%Python%';
UPDATE course SET icon_url = '/tech/java.svg' WHERE id = 2 OR name LIKE '%Java%';
UPDATE course SET icon_url = '/tech/powerbi.svg' WHERE id = 3 OR name LIKE '%Data Analytics%';
UPDATE course SET icon_url = '/tech/aws.svg' WHERE id = 4 OR name LIKE '%AWS%';
