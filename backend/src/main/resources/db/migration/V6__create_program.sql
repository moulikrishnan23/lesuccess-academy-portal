-- V6: Upcoming programs (Webinar / Internship tabs on home page)
CREATE TABLE program (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    type                 VARCHAR(20)   NOT NULL,
    label                VARCHAR(50)   NULL,
    title                VARCHAR(120)  NOT NULL,
    topic                VARCHAR(255)  NULL,
    event_date           DATE          NOT NULL,
    start_time           TIME          NULL,
    end_time             TIME          NULL,
    platform             VARCHAR(50)   NULL,
    meet_link            VARCHAR(255)  NULL,
    certificate_included TINYINT(1)    NOT NULL DEFAULT 0,
    is_active            TINYINT(1)    NOT NULL DEFAULT 1,
    created_at           DATETIME      NOT NULL,
    updated_at           DATETIME      NOT NULL,
    deleted_at           DATETIME      NULL,

    INDEX idx_type (type),
    INDEX idx_event_date (event_date),
    INDEX idx_is_active (is_active)
);
