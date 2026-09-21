-- V15: Student testimonials per course (carousel on course page)
CREATE TABLE testimonial (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id     BIGINT        NOT NULL,
    student_name  VARCHAR(120)  NOT NULL,
    review_text   TEXT          NOT NULL,
    rating        TINYINT       NOT NULL DEFAULT 5,
    photo_url     VARCHAR(255)  NULL,
    display_order INT           NOT NULL DEFAULT 0,
    is_active     TINYINT(1)    NOT NULL DEFAULT 1,
    created_at    DATETIME      NOT NULL,
    updated_at    DATETIME      NOT NULL,
    deleted_at    DATETIME      NULL,

    INDEX idx_testimonial_course_id (course_id),
    INDEX idx_testimonial_active (course_id, is_active),
    CONSTRAINT fk_testimonial_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE
);
