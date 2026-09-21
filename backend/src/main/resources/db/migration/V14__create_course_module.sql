-- V14: Course syllabus modules (accordion on course page)
CREATE TABLE course_module (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id     BIGINT        NOT NULL,
    title         VARCHAR(200)  NOT NULL,
    content       TEXT          NULL,
    display_order INT           NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL,
    updated_at    DATETIME      NOT NULL,

    INDEX idx_course_module_course_id (course_id),
    INDEX idx_course_module_order (course_id, display_order),
    CONSTRAINT fk_course_module_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
);
