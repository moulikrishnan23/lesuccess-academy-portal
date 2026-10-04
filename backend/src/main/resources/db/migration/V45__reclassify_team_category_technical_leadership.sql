-- V45: Reclassify 'Our Mentors' team category to 'Technical Leadership Team'

UPDATE team_category
SET name = 'Technical Leadership Team'
WHERE name = 'Our Mentors';

UPDATE team_member
SET department = 'Technical Leadership Team'
WHERE department = 'Our Mentors';
