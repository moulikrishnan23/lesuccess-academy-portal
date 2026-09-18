-- V28: Team member table for home page team section & admin management
CREATE TABLE IF NOT EXISTS team_member (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    role          VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL,
    image_url     VARCHAR(255) NULL,
    is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
    display_order INT          NOT NULL DEFAULT 0,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    deleted_at    DATETIME     NULL,

    INDEX idx_team_member_active (is_active),
    INDEX idx_team_member_order (display_order),
    INDEX idx_team_member_featured (is_featured)
);

INSERT IGNORE INTO team_member (name, role, email, image_url, is_featured, display_order, is_active, created_at, updated_at) VALUES
('Rathinavel Rajagopal', 'Director', 'rathinavelrajagopal@lesuccess.in', '/home/team/Rathinavel.png', 1, 1, 1, NOW(), NOW()),
('Uma Devi P K', 'CEO', 'uma@lesuccess.in', '/home/team/UmaDevi.png', 1, 2, 1, NOW(), NOW()),
('Muralidharan R', 'Vice President', 'murali.r@lesuccess.in', '/home/team/Muralidharan.png', 1, 3, 1, NOW(), NOW()),
('Kennedy R', 'AGM - Corporate Relationship', 'kennedy.r@lesuccess.in', '/home/team/Kennedy.png', 0, 4, 1, NOW(), NOW()),
('Arun Kumar K', 'Technical Lead', 'arunkumar@lesuccess.in', '/home/team/ArunKumar.png', 0, 5, 1, NOW(), NOW()),
('Felix R', 'Assistant Vice President', 'felix.r@lesuccess.in', '/home/team/Felix.png', 0, 6, 1, NOW(), NOW()),
('Kirubakaran', 'Senior Trainer', 'kirubakaran@lesuccess.in', '/home/team/dummy.png', 0, 7, 1, NOW(), NOW()),
('Saranya', 'Program Coordinator', 'saranya@lesuccess.in', '/home/team/dummy.png', 0, 8, 1, NOW(), NOW()),
('Naveen', 'Placement Officer', 'naveen@lesuccess.in', '/home/team/dummy.png', 0, 9, 1, NOW(), NOW()),
('Dinesh', 'Full Stack Mentor', 'dinesh@lesuccess.in', '/home/team/dummy.png', 0, 10, 1, NOW(), NOW()),
('Keerthana', 'Student Counselor', 'keerthana@lesuccess.in', '/home/team/dummy.png', 0, 11, 1, NOW(), NOW());
