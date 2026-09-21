-- V5: Demo class bookings (lead capture from home page form)
CREATE TABLE demo_booking (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id     BIGINT        NULL,
    mobile_number VARCHAR(20)   NOT NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    ip_address    VARCHAR(45)   NULL,
    created_at    DATETIME      NOT NULL,
    updated_at    DATETIME      NOT NULL,
    deleted_at    DATETIME      NULL,

    INDEX idx_status (status),
    INDEX idx_course_id (course_id),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_demo_booking_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE SET NULL
);
