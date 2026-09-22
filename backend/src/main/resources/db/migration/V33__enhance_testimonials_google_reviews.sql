-- V33: Enhance testimonial table for Google reviews and seed authentic reviews
ALTER TABLE testimonial
    MODIFY COLUMN course_id BIGINT NULL,
    ADD COLUMN source VARCHAR(50) NOT NULL DEFAULT 'Google' AFTER rating,
    ADD COLUMN review_date VARCHAR(50) NULL AFTER source,
    ADD COLUMN reviewer_role VARCHAR(100) NULL AFTER review_date,
    ADD COLUMN likes_count INT NOT NULL DEFAULT 0 AFTER reviewer_role;

-- Seed authentic LeSuccess Google Reviews
INSERT INTO testimonial (course_id, student_name, review_text, rating, source, review_date, reviewer_role, likes_count, photo_url, display_order, is_active, created_at, updated_at)
VALUES
(NULL, 'Shalini Shalini', 'I had a great learning experience with Lesuccess. The trainers taught Java, Groovy, and Data Structures & Algorithms in a clear and structured manner. The explanations were easy to understand, and the hands-on exercises helped strengthen my coding foundation.', 5, 'Google', '3 months ago', '1 review', 1, NULL, 1, 1, NOW(), NOW()),
(NULL, 'Anu Suhasini', 'The practical training methodology and supportive mentors at LeSuccess made learning seamless. Concepts were taught from ground up with real-world scenarios that gave me enormous confidence.', 5, 'Google', '3 months ago', '2 reviews', 0, NULL, 2, 1, NOW(), NOW()),
(NULL, 'Saranya V.', 'Joined LeSuccess for the Java Full Stack course. The trainers explain every concept clearly with real coding scenarios, and the live lab sessions helped me grasp backend architecture and Spring Boot with great confidence.', 5, 'Google', '2 months ago', 'Full Stack Java', 2, NULL, 3, 1, NOW(), NOW()),
(NULL, 'Karthik Raja', 'Outstanding mentor support and practical teaching methodology! Building REST APIs and deploying applications gave me the exact skills needed to clear technical interviews smoothly.', 5, 'Google', '3 months ago', 'Python Full Stack', 1, NULL, 4, 1, NOW(), NOW()),
(NULL, 'Divya Bharathi', 'The Power BI, Advanced Excel, and SQL modules were comprehensive and hands-on. The mentors were patient and guided me through business dashboard projects that helped me transition into a data role.', 5, 'Google', '1 month ago', 'Data Analytics', 3, NULL, 5, 1, NOW(), NOW()),
(NULL, 'Aravind Kumar', 'The practical Docker, Kubernetes, and CI/CD pipelines taught here are completely industry-aligned. Trainers are industry practitioners who share real production scenarios. Best IT training institute in Coimbatore!', 5, 'Google', '4 months ago', 'AWS with DevOps', 4, NULL, 6, 1, NOW(), NOW());
