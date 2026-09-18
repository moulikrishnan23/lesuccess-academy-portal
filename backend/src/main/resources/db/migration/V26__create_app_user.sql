-- V26: User authentication table and initial Admin and Trainer accounts
CREATE TABLE app_user (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(60)   NOT NULL UNIQUE,
    email       VARCHAR(160)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(30)   NOT NULL,
    full_name   VARCHAR(120)  NOT NULL,
    is_active   TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL,
    updated_at  DATETIME      NOT NULL,

    INDEX idx_user_email (email),
    INDEX idx_user_username (username),
    INDEX idx_user_role (role)
);

-- Seed initial Admin and Trainer credentials (passwords: admin123, trainer123)
INSERT INTO app_user (username, email, password, role, full_name, is_active, created_at, updated_at)
VALUES
('admin', 'admin@lesuccess.in', '$2a$10$cCLJKM41h2iM83bcOZGQve/6seb1kfYGscXeHC7CALdc7W4X8tGpu', 'ADMIN', 'Academy Administrator', 1, NOW(), NOW()),
('trainer', 'trainer@lesuccess.in', '$2a$10$Z.2/S6.FfmHCm2nFoFEOIeHKwr5WjxR.F0k3DKV7uiz.gsZ77xzF2', 'TRAINER', 'Lead Technical Trainer', 1, NOW(), NOW());
