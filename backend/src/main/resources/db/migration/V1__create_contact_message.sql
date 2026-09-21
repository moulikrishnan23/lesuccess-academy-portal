-- V1: Create contact_message table
CREATE TABLE contact_message (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120)  NOT NULL,
    email       VARCHAR(160)  NOT NULL,
    phone       VARCHAR(20)   NOT NULL,
    who_you_are VARCHAR(120)  NOT NULL,
    looking_for VARCHAR(120)  NOT NULL,
    location    VARCHAR(160)  NOT NULL,
    message     TEXT          NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'NEW',
    ip_address  VARCHAR(45)   NULL,
    created_at  DATETIME      NOT NULL,
    updated_at  DATETIME      NOT NULL,
    deleted_at  DATETIME      NULL,

    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_email_phone_message (email, phone, message(100))
);
