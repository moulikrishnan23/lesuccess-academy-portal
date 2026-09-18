-- V27: Gallery categories and images for public gallery and admin management
CREATE TABLE gallery_category (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100)  NOT NULL,
    slug             VARCHAR(120)  NOT NULL UNIQUE,
    description      VARCHAR(255)  NULL,
    cover_image_url  VARCHAR(500)  NULL,
    parent_id        BIGINT        NULL,
    display_order    INT           NOT NULL DEFAULT 0,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME      NOT NULL,
    deleted_at       DATETIME      NULL,

    INDEX idx_cat_slug (slug),
    INDEX idx_cat_parent (parent_id),
    INDEX idx_cat_active (is_active)
);

CREATE TABLE gallery_image (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id      BIGINT        NOT NULL,
    title            VARCHAR(150)  NULL,
    image_url        VARCHAR(500)  NOT NULL,
    caption          VARCHAR(255)  NULL,
    display_order    INT           NOT NULL DEFAULT 0,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL,
    updated_at       DATETIME      NOT NULL,
    deleted_at       DATETIME      NULL,

    INDEX idx_img_category (category_id),
    INDEX idx_img_active (is_active),
    CONSTRAINT fk_gallery_image_category FOREIGN KEY (category_id) REFERENCES gallery_category(id) ON DELETE CASCADE
);

-- Seed initial categories matching reference designs
INSERT INTO gallery_category (id, name, slug, description, cover_image_url, parent_id, display_order, is_active, created_at, updated_at)
VALUES
(1, 'Onam 2026', 'onam-2026', 'Celebration of Onam festival at LeSuccess Academy', '/images/gallery/gallery-1.png', NULL, 1, 1, NOW(), NOW()),
(2, 'Bishop Herbal', 'bishop-herbal', 'Campus engagement and corporate visit at Bishop Herbal', '/images/gallery/gallery-2.png', NULL, 2, 1, NOW(), NOW()),
(3, 'Campus Hiring', 'campus-hiring', 'Recruitment drives and college placement engagements', '/images/gallery/gallery-3.png', NULL, 3, 1, NOW(), NOW()),
(4, 'Pongal 2026', 'pongal-2026', 'Traditional harvest festival celebration with staff and students', '/images/gallery/gallery-4.png', NULL, 4, 1, NOW(), NOW()),
(5, 'Fun Activities', 'fun-activities', 'Student bonding activities, team challenges, and weekend events', '/images/gallery/gallery-5.png', NULL, 5, 1, NOW(), NOW()),
(6, 'Placed Students', 'placed-students', 'Success stories and placed candidates from recent batches', '/images/gallery/gallery-6.png', NULL, 6, 1, NOW(), NOW()),
-- Subcategories under Campus Hiring (parent_id = 3)
(7, 'CSI ketty', 'csi-ketty', 'Campus recruitment drive at CSI Ketty', '/images/gallery/gallery-1.png', 3, 1, 1, NOW(), NOW()),
(8, 'Hindustan', 'hindustan', 'Placement drive at Hindustan College', '/images/gallery/gallery-2.png', 3, 2, 1, NOW(), NOW()),
(9, 'Kalasalingam', 'kalasalingam', 'Technical hiring drive at Kalasalingam University', '/images/gallery/gallery-3.png', 3, 3, 1, NOW(), NOW()),
(10, 'Krishnammal', 'krishnammal', 'Campus interview session at PSGR Krishnammal', '/images/gallery/gallery-4.png', 3, 4, 1, NOW(), NOW()),
(11, 'Sri Shanmuga', 'sri-shanmuga', 'Full stack selection drive at Sri Shanmugha', '/images/gallery/gallery-5.png', 3, 5, 1, NOW(), NOW()),
(12, 'SNS', 'sns', 'Mega job fair & developer interviews at SNS Institutions', '/images/gallery/gallery-6.png', 3, 6, 1, NOW(), NOW());

-- Seed sample pictures inside Onam 2026 (category_id = 1)
INSERT INTO gallery_image (category_id, title, image_url, caption, display_order, is_active, created_at, updated_at)
VALUES
(1, 'Picture 1', '/images/gallery/gallery-1.png', 'Traditional Onam Pookalam decoration', 1, 1, NOW(), NOW()),
(1, 'Picture 2', '/images/gallery/gallery-2.png', 'Student cultural performances and celebrations', 2, 1, NOW(), NOW()),
(1, 'Picture 3', '/images/gallery/gallery-3.png', 'Faculty and students Onam feast gathering', 3, 1, NOW(), NOW()),
(1, 'Picture 4', '/images/gallery/gallery-4.png', 'Traditional attire group photo', 4, 1, NOW(), NOW()),
(1, 'Picture 5', '/images/gallery/gallery-5.png', 'Onam festival games and tug-of-war', 5, 1, NOW(), NOW()),
(1, 'Picture 6', '/images/gallery/gallery-6.png', 'Prize distribution ceremony', 6, 1, NOW(), NOW());

-- Seed sample pictures inside Pongal 2026 (category_id = 4)
INSERT INTO gallery_image (category_id, title, image_url, caption, display_order, is_active, created_at, updated_at)
VALUES
(4, 'Picture 1', '/images/gallery/gallery-4.png', 'Pongal festival sweet pot cooking', 1, 1, NOW(), NOW()),
(4, 'Picture 2', '/images/gallery/gallery-5.png', 'Traditional folk dance celebration', 2, 1, NOW(), NOW()),
(4, 'Picture 3', '/images/gallery/gallery-6.png', 'Rangoli contest showcase', 3, 1, NOW(), NOW()),
(4, 'Picture 4', '/images/gallery/gallery-1.png', 'Staff & batch members celebration', 4, 1, NOW(), NOW()),
(4, 'Picture 5', '/images/gallery/gallery-2.png', 'Festive activities and games', 5, 1, NOW(), NOW()),
(4, 'Picture 6', '/images/gallery/gallery-3.png', 'Pongal celebration group photo', 6, 1, NOW(), NOW());
