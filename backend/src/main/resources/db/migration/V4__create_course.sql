-- V4: Course cards (home page grid + demo booking dropdown)
CREATE TABLE course (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                 VARCHAR(120)  NOT NULL,
    short_description    TEXT          NULL,
    duration_months      INT           NULL,
    mode                 VARCHAR(20)   NOT NULL DEFAULT 'BOTH',
    badge                VARCHAR(20)   NULL,
    badge_text           VARCHAR(50)   NULL,
    placement_assistance TINYINT(1)    NOT NULL DEFAULT 0,
    syllabus_url         VARCHAR(255)  NULL,
    enroll_url           VARCHAR(255)  NULL,
    is_active            TINYINT(1)    NOT NULL DEFAULT 1,
    display_order        INT           NOT NULL DEFAULT 0,
    created_at           DATETIME      NOT NULL,
    updated_at           DATETIME      NOT NULL,
    deleted_at           DATETIME      NULL,

    INDEX idx_is_active (is_active),
    INDEX idx_display_order (display_order)
);
