-- V49: Make role and email optional in team_member, and align team categories to 'Management Visionaries' and 'Tech Visionaries'

-- 1. Make role and email nullable in team_member
ALTER TABLE team_member MODIFY COLUMN role VARCHAR(120) NULL;
ALTER TABLE team_member MODIFY COLUMN email VARCHAR(160) NULL;

-- 2. Update existing categories in team_category table
UPDATE team_category
SET name = 'Management Visionaries'
WHERE name IN ('Management Team', 'Management');

UPDATE team_category
SET name = 'Tech Visionaries'
WHERE name IN ('Technical Leadership Team', 'Our Mentors', 'Tech Team');

-- Ensure the two canonical categories exist in team_category
INSERT IGNORE INTO team_category (name, display_order, created_at)
VALUES 
    ('Management Visionaries', 1, NOW()),
    ('Tech Visionaries', 2, NOW());

-- 3. Update existing members department in team_member table
UPDATE team_member
SET department = 'Management Visionaries'
WHERE department IN ('Management Team', 'Management');

UPDATE team_member
SET department = 'Tech Visionaries'
WHERE department IN ('Technical Leadership Team', 'Our Mentors', 'Tech Team');
