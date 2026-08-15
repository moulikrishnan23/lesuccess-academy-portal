-- V2: Create contact_message_sync_failure table for Google Sheets retry tracking
CREATE TABLE contact_message_sync_failure (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    contact_message_id  BIGINT       NOT NULL,
    payload             JSON         NOT NULL,
    reason              VARCHAR(500) NOT NULL,
    attempt_count       INT          NOT NULL DEFAULT 0,
    last_attempt_at     DATETIME     NULL,
    created_at          DATETIME     NOT NULL,
    resolved            BOOLEAN      NOT NULL DEFAULT FALSE,

    INDEX idx_resolved (resolved),
    CONSTRAINT fk_sync_failure_contact_message
        FOREIGN KEY (contact_message_id) REFERENCES contact_message(id)
);
