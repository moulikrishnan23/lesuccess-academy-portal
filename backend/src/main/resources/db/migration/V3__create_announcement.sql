-- V3: Announcement banner (scrolling ticker on home page)
CREATE TABLE announcement (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    text        VARCHAR(500)  NOT NULL,
    link_label  VARCHAR(50)   NULL,
    link_url    VARCHAR(255)  NULL,
    is_active   TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  DATETIME      NOT NULL,
    updated_at  DATETIME      NOT NULL,
    deleted_at  DATETIME      NULL,

    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);
