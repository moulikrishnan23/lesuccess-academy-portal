-- V43: Success story images and Instagram reels
CREATE TABLE IF NOT EXISTS success_story_image (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url        VARCHAR(500)  NOT NULL,
    caption          VARCHAR(255)  NULL,
    display_order    INT           NOT NULL DEFAULT 0,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME      NOT NULL,
    deleted_at       DATETIME      NULL,

    INDEX idx_ss_img_active (is_active),
    INDEX idx_ss_img_order (display_order)
);

CREATE TABLE IF NOT EXISTS success_story_reel (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    reel_url         VARCHAR(500)  NOT NULL,
    title            VARCHAR(150)  NULL,
    display_order    INT           NOT NULL DEFAULT 0,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME      NOT NULL,
    deleted_at       DATETIME      NULL,

    INDEX idx_ss_reel_active (is_active),
    INDEX idx_ss_reel_order (display_order)
);
