-- V21: Seed initial data for courses, modules, testimonials, and upcoming programs.

-- 1. Courses
INSERT INTO course (id, name, short_description, duration_months, mode, badge, badge_text, placement_assistance, syllabus_url, enroll_url, is_active, display_order, created_at, updated_at)
VALUES
(1, 'Python : Full Stack Development', 'Python Full Stack development course with Django, React, REST APIs, MySQL and live industry projects.', 4, 'BOTH', 'BEST_SELLER', '30% OFF', 1, '/syllabus/python.pdf', '/courses/python-full-stack-development', 1, 1, NOW(), NOW()),
(2, 'Java : Full Stack Development', 'Enterprise Java Full Stack development with Spring Boot, React, MySQL, Hibernate and microservices architecture.', 5, 'BOTH', 'HIGH_DEMAND', 'Most Enrolled', 1, '/syllabus/java.pdf', '/courses/java-full-stack-development', 1, 2, NOW(), NOW()),
(3, 'Data Analytics', 'Master Excel, Advanced SQL, Power BI, Tableau, and Python for data analysis, business intelligence and reporting.', 3, 'BOTH', 'OFFER', 'Trending', 1, '/syllabus/data-analytics.pdf', '/courses/data-analytics', 1, 3, NOW(), NOW()),
(4, 'AWS with DevOps', 'Comprehensive Cloud & DevOps engineering: AWS services, Docker, Kubernetes, Jenkins CI/CD, Terraform and Linux.', 4, 'BOTH', NULL, 'Job Oriented', 1, '/syllabus/aws-devops.pdf', '/courses/aws-with-devops', 1, 4, NOW(), NOW());

-- 2. Course Modules (Syllabus) for Python Full Stack
INSERT INTO course_module (course_id, title, content, display_order, created_at, updated_at)
VALUES
(1, 'Core Python Programming', 'Data types, control structures, functions, OOP concepts, exceptions, and file handling.', 1, NOW(), NOW()),
(1, 'Database Management with MySQL', 'Schema design, complex joins, indexing, transactions, and MySQL integration with Python.', 2, NOW(), NOW()),
(1, 'Backend Web Development with Django', 'Django architecture, models, ORM, views, templates, forms, and session management.', 3, NOW(), NOW()),
(1, 'RESTful API Development with DRF', 'Serializers, viewsets, authentication, permissions, JWT tokens, and API documentation.', 4, NOW(), NOW()),
(1, 'Frontend Development with React', 'HTML5, CSS3, Modern JavaScript (ES6+), React fundamentals, hooks, router, and state management.', 5, NOW(), NOW()),
(1, 'DevOps & Cloud Deployment', 'Git version control, Docker containerization, AWS EC2 deployment, CI/CD pipelines, and capstone project.', 6, NOW(), NOW());

-- Course Modules for Java Full Stack
INSERT INTO course_module (course_id, title, content, display_order, created_at, updated_at)
VALUES
(2, 'Core Java Foundations', 'Syntax, data types, control flow, arrays, OOP principles, and exception handling.', 1, NOW(), NOW()),
(2, 'Java Collections & Streams', 'List, Set, Map, Generics, Lambdas, and Stream API for data processing.', 2, NOW(), NOW()),
(2, 'Database & Hibernate / JPA', 'Relational database design, SQL queries, JDBC, ORM mapping with Hibernate and Spring Data JPA.', 3, NOW(), NOW()),
(2, 'Spring Boot & Microservices', 'Dependency Injection, Spring MVC, REST APIs, Spring Security with JWT, and microservices architecture.', 4, NOW(), NOW()),
(2, 'Frontend Integration with React', 'Building responsive interfaces, React components, state management, Axios API integration, and user auth.', 5, NOW(), NOW());

-- Course Modules for Data Analytics
INSERT INTO course_module (course_id, title, content, display_order, created_at, updated_at)
VALUES
(3, 'Advanced Excel for Analysts', 'Formulas, pivot tables, VLOOKUP/XLOOKUP, data validation, and dashboard creation.', 1, NOW(), NOW()),
(3, 'SQL for Data Querying & Analysis', 'Relational querying, aggregation, window functions, CTEs, and subqueries.', 2, NOW(), NOW()),
(3, 'Business Intelligence with Power BI & Tableau', 'Data modeling, DAX expressions, interactive report authoring, and visualization best practices.', 3, NOW(), NOW()),
(3, 'Python for Data Analysis', 'NumPy, Pandas, Matplotlib, and Seaborn for exploratory data analysis and reporting.', 4, NOW(), NOW());

-- Course Modules for AWS with DevOps
INSERT INTO course_module (course_id, title, content, display_order, created_at, updated_at)
VALUES
(4, 'Linux & Shell Scripting', 'Linux administration, user permissions, networking basics, and automation scripts.', 1, NOW(), NOW()),
(4, 'AWS Cloud Architecture', 'IAM, EC2, S3, VPC, RDS, Route 53, and auto-scaling cloud infrastructure.', 2, NOW(), NOW()),
(4, 'Docker Containerization', 'Docker images, containers, volumes, multi-stage builds, and Docker Compose.', 3, NOW(), NOW()),
(4, 'Kubernetes Orchestration', 'Pods, Deployments, Services, ConfigMaps, Secrets, Ingress, and Helm charts.', 4, NOW(), NOW()),
(4, 'CI/CD with Jenkins & GitHub Actions', 'Automated build, test, and deployment pipelines, GitOps workflows.', 5, NOW(), NOW());

-- 3. Student Testimonials
INSERT INTO testimonial (course_id, student_name, review_text, rating, photo_url, display_order, is_active, created_at, updated_at)
VALUES
(1, 'Priya S.', 'The Python Full Stack program was thorough and practical. The hands-on Django and React projects helped me clear technical interviews and land a full-stack role.', 5, NULL, 1, 1, NOW(), NOW()),
(1, 'Karthik R.', 'Excellent mentor guidance and placement support. Building real REST APIs and deploying to the cloud gave me immense confidence.', 5, NULL, 2, 1, NOW(), NOW()),
(2, 'Ananya M.', 'Spring Boot and Microservices concepts were taught clearly with real-world examples. Got placed in a top IT company through LeSuccess placement drives.', 5, NULL, 1, 1, NOW(), NOW()),
(2, 'Vignesh K.', 'Great curriculum covering both Core Java depth and modern Spring Boot ecosystem. Highly recommended for aspiring software engineers.', 5, NULL, 2, 1, NOW(), NOW()),
(3, 'Divya B.', 'The Power BI and SQL modules were phenomenal. Transitioned from non-tech to a Junior Data Analyst role within 3 months of completion.', 5, NULL, 1, 1, NOW(), NOW()),
(4, 'Suresh T.', 'Hands-on AWS and Docker labs made all the difference. The instructors have extensive cloud consulting experience.', 5, NULL, 1, 1, NOW(), NOW());

-- 4. Upcoming Programs (Webinars and Internships)
INSERT INTO program (type, label, title, topic, event_date, start_time, end_time, platform, meet_link, certificate_included, is_active, created_at, updated_at)
VALUES
('WEBINAR', 'Free Webinar', 'Full Stack Career Roadmap 2026', 'Industry trends, portfolio building, and cracking developer interviews in 2026.', '2026-09-12', '17:00:00', '18:30:00', 'Google Meet', 'https://meet.google.com/les-webinar', 1, 1, NOW(), NOW()),
('WEBINAR', 'Masterclass', 'Data Analytics with Power BI & SQL', 'Hands-on session building an executive sales dashboard from scratch.', '2026-09-19', '18:00:00', '19:30:00', 'Zoom', 'https://meet.google.com/les-data', 1, 1, NOW(), NOW()),
('INTERNSHIP', 'Internship Program', 'Summer Full Stack Developer Internship', 'Work on live commercial applications with senior architects and gain industry exposure.', '2026-09-15', '10:00:00', '16:00:00', 'LeSuccess Campus', NULL, 1, 1, NOW(), NOW()),
('INTERNSHIP', 'Internship Program', 'Cloud & DevOps Engineer Internship', 'Hands-on infrastructure automation, Kubernetes deployments, and CI/CD pipelines.', '2026-09-22', '10:00:00', '16:00:00', 'LeSuccess Campus', NULL, 1, 1, NOW(), NOW());
