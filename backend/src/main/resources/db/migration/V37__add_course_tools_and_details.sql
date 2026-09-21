-- V37: Add course_tool table and course detail columns (description, category, role fields)

-- 1. Add course detail columns
ALTER TABLE course ADD COLUMN description TEXT NULL;
ALTER TABLE course ADD COLUMN category VARCHAR(80) NULL;
ALTER TABLE course ADD COLUMN role_heading VARCHAR(200) NULL;
ALTER TABLE course ADD COLUMN role_intro TEXT NULL;
ALTER TABLE course ADD COLUMN role_bullets TEXT NULL;

-- 2. Create course_tool table
CREATE TABLE course_tool (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id     BIGINT        NOT NULL,
    group_name    VARCHAR(80)   NOT NULL DEFAULT 'Tools',
    tool_name     VARCHAR(120)  NOT NULL,
    icon_url      VARCHAR(255)  NULL,
    display_order INT           NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL,
    updated_at    DATETIME      NOT NULL,

    INDEX idx_course_tool_course_id (course_id),
    INDEX idx_course_tool_order (course_id, display_order),
    CONSTRAINT fk_course_tool_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
);

-- 3. Populate course details for course 1 (Python Full Stack)
UPDATE course SET
    category = 'Python Full Stack',
    description = '<p>Learning a Python Full Stack course in Coimbatore with LeSuccess offers strong career advantages. Python is a versatile and in-demand language used in software development, data science, and automation. LeSuccess provides quality training covering both basic and advanced concepts. Their focus on live projects and daily tasks helps students gain practical, real-world experience. With 100% placement support, it becomes easier to secure good job opportunities. This course is ideal for both beginners and professionals looking to upgrade their skills.</p>',
    role_heading = 'What does a Full Stack Developer do?',
    role_intro = 'The front end - what users see and interact with - and the back end, which handles data and server-side logic, require different skill sets. Full-stack developers work across both areas, so they need a strong understanding of the entire development process.',
    role_bullets = '[\"Design the application structure, user interface, APIs, and database.\", \"Develop the front end, server-side logic, APIs, and core components.\", \"Build and implement new features while ensuring smooth performance across different devices and platforms.\"]'
WHERE id = 1;

-- 4. Populate course details for course 2 (Full Stack Java)
UPDATE course SET
    category = 'Java Full Stack',
    description = '<p>Learning a Java Full Stack course in Coimbatore with LeSuccess offers strong career advantages. Java is still the language most enterprise product teams and service companies in the region hire for, and Spring Boot sits behind the majority of those openings. This course covers core Java properly before moving to frameworks, because the questions that decide an offer are usually about collections, memory and OOP rather than annotations. You build one application across the whole syllabus - front end, REST API, database and deployment - instead of a folder of disconnected exercises. With live projects, daily tasks and 100% placement support, you finish with something you can open in an interview and talk through line by line.</p>',
    role_heading = 'What does a Java Full Stack Developer do?',
    role_intro = 'A Java full stack developer owns a feature from the screen a user clicks to the row that lands in the database. That means moving between two quite different skill sets in the same day, and knowing enough about both to make the trade-off between them yourself.',
    role_bullets = '[\"Design the application structure, user interface, APIs, and database schema.\", \"Build the front end, the Spring Boot services behind it, and the queries that feed both.\", \"Ship new features, then keep them fast and stable across browsers and devices.\"]'
WHERE id = 2;

-- 5. Seed default tools for Course 1 (Python Full Stack)
INSERT INTO course_tool (course_id, group_name, tool_name, icon_url, display_order, created_at, updated_at) VALUES
(1, 'Front End', 'HTML5', '/tech/html5.svg', 1, NOW(), NOW()),
(1, 'Front End', 'CSS3', '/tech/css3.svg', 2, NOW(), NOW()),
(1, 'Front End', 'JavaScript', '/tech/javascript.svg', 3, NOW(), NOW()),
(1, 'Front End', 'React', '/tech/react.svg', 4, NOW(), NOW()),
(1, 'Front End', 'Bootstrap', '/tech/bootstrap.svg', 5, NOW(), NOW()),
(1, 'Back End', 'Python', '/tech/python.svg', 6, NOW(), NOW()),
(1, 'Back End', 'Django', '/tech/django.svg', 7, NOW(), NOW()),
(1, 'Back End', 'Flask', '/tech/flask.svg', 8, NOW(), NOW()),
(1, 'Back End', 'REST API', '/tech/api.svg', 9, NOW(), NOW()),
(1, 'Database', 'MySQL', '/tech/mysql.svg', 10, NOW(), NOW()),
(1, 'Database', 'PostgreSQL', '/tech/postgresql.svg', 11, NOW(), NOW()),
(1, 'Tools & Deploy', 'Git', '/tech/git.svg', 12, NOW(), NOW()),
(1, 'Tools & Deploy', 'GitHub', '/tech/github.svg', 13, NOW(), NOW()),
(1, 'Tools & Deploy', 'Docker', '/tech/docker.svg', 14, NOW(), NOW()),
(1, 'Tools & Deploy', 'AWS', '/tech/aws.svg', 15, NOW(), NOW());

-- 6. Seed default tools for Course 2 (Full Stack Java)
INSERT INTO course_tool (course_id, group_name, tool_name, icon_url, display_order, created_at, updated_at) VALUES
(2, 'Front End', 'HTML5', '/tech/html5.svg', 1, NOW(), NOW()),
(2, 'Front End', 'CSS3', '/tech/css3.svg', 2, NOW(), NOW()),
(2, 'Front End', 'JavaScript', '/tech/javascript.svg', 3, NOW(), NOW()),
(2, 'Front End', 'React', '/tech/react.svg', 4, NOW(), NOW()),
(2, 'Front End', 'Bootstrap', '/tech/bootstrap.svg', 5, NOW(), NOW()),
(2, 'Back End', 'Java', '/tech/java.svg', 6, NOW(), NOW()),
(2, 'Back End', 'Spring Boot', '/tech/springboot.svg', 7, NOW(), NOW()),
(2, 'Back End', 'Hibernate', '/tech/hibernate.svg', 8, NOW(), NOW()),
(2, 'Back End', 'REST API', '/tech/api.svg', 9, NOW(), NOW()),
(2, 'Database', 'MySQL', '/tech/mysql.svg', 10, NOW(), NOW()),
(2, 'Tools & Deploy', 'Git', '/tech/git.svg', 11, NOW(), NOW()),
(2, 'Tools & Deploy', 'Maven', '/tech/maven.svg', 12, NOW(), NOW()),
(2, 'Tools & Deploy', 'Postman', '/tech/postman.svg', 13, NOW(), NOW()),
(2, 'Tools & Deploy', 'Docker', '/tech/docker.svg', 14, NOW(), NOW());
