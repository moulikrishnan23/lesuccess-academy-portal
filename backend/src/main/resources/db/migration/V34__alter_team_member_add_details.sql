-- V34: Add details columns to team_member table (bio, experience, skills, department)
ALTER TABLE team_member
    ADD COLUMN bio TEXT NULL AFTER role,
    ADD COLUMN experience VARCHAR(120) NULL AFTER bio,
    ADD COLUMN skills VARCHAR(255) NULL AFTER experience,
    ADD COLUMN department VARCHAR(100) NULL AFTER skills;

-- Populate details for existing team members
UPDATE team_member
SET bio = 'Visionary leader with extensive technology and management leadership experience driving innovation, corporate partnerships, and high-impact software education across South India.',
    experience = '15+ Years in IT Leadership',
    skills = 'Strategic Planning, Technology Architecture, Industry Partnerships',
    department = 'Management Team'
WHERE name = 'Rathinavel Rajagopal';

UPDATE team_member
SET bio = 'Chief Executive Officer leading strategic growth, operational excellence, and enterprise workforce development at LeSuccess Academy.',
    experience = '12+ Years Enterprise Management',
    skills = 'Executive Leadership, Business Strategy, Operations Management',
    department = 'Management Team'
WHERE name = 'Uma Devi P K';

UPDATE team_member
SET bio = 'Vice President overseeing technical curriculum design, academic delivery standards, and industry certification alignments.',
    experience = '14+ Years in Software Engineering',
    skills = 'Enterprise Architecture, Cloud Platforms, Academic Strategy',
    department = 'Management Team'
WHERE name = 'Muralidharan R';

UPDATE team_member
SET bio = 'AGM leading corporate collaborations, campus placement drives, and direct industry hiring relationships with premier tech firms.',
    experience = '10+ Years Corporate Relations',
    skills = 'Corporate Relations, Placement Drives, Talent Acquisition',
    department = 'Management Team'
WHERE name LIKE '%Kennedy%';

UPDATE team_member
SET bio = 'Technical Lead and principal trainer heading Java Full Stack, Spring Boot microservices, and system architecture training programs.',
    experience = '8+ Years Full Stack Engineering',
    skills = 'Java, Spring Boot, Microservices, React, Docker, MySQL',
    department = 'Our Mentors'
WHERE name LIKE '%Arun Kumar%';

UPDATE team_member
SET bio = 'Assistant Vice President specializing in career development pathways, student mentorship frameworks, and institutional partnerships.',
    experience = '11+ Years Academic Administration',
    skills = 'Career Counseling, Program Management, Institutional Relations',
    department = 'Management Team'
WHERE name LIKE '%Felix%';

UPDATE team_member
SET bio = 'Senior trainer and mentor focusing on core Java fundamentals, object-oriented design patterns, and database engineering.',
    experience = '6+ Years IT Training',
    skills = 'Core Java, JDBC, Hibernate, REST APIs, SQL',
    department = 'Our Mentors'
WHERE name LIKE '%Kirubakaran%';

UPDATE team_member
SET bio = 'Program Coordinator and instructor specializing in Python programming, machine learning foundations, and data analytics pipelines.',
    experience = '5+ Years Data Science & Training',
    skills = 'Python, Pandas, NumPy, Power BI, SQL',
    department = 'Our Mentors'
WHERE name LIKE '%Saranya%';

UPDATE team_member
SET bio = 'Dedicated placement officer guiding students through resume architecture, technical mock interviews, and career placement drives.',
    experience = '5+ Years Talent Advisory',
    skills = 'Interview Coaching, Resume Auditing, Placement Operations',
    department = 'Our Mentors'
WHERE name LIKE '%Naveen%';

UPDATE team_member
SET bio = 'Full Stack mentor guiding learners through live project architecture, frontend state management, and continuous deployment.',
    experience = '5+ Years Software Development',
    skills = 'React, Node.js, Express, MongoDB, Git',
    department = 'Our Mentors'
WHERE name LIKE '%Dinesh%';

UPDATE team_member
SET bio = 'Student Counselor assisting prospective and enrolled students in curriculum selection, learning milestones, and career pathways.',
    experience = '4+ Years Academic Counseling',
    skills = 'Student Advisory, Educational Guidance, Career Planning',
    department = 'Our Mentors'
WHERE name LIKE '%Keerthana%';
