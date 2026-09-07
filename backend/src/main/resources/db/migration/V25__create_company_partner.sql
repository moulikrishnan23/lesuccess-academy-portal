-- V25: Company partners for "Choose Your Path" / Where Students Work section
CREATE TABLE company_partner (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120) NOT NULL,
    logo_url      VARCHAR(255) NOT NULL,
    row_num       INT          NOT NULL DEFAULT 1,
    display_order INT          NOT NULL DEFAULT 0,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    deleted_at    DATETIME     NULL,

    INDEX idx_company_partner_active (is_active),
    INDEX idx_company_partner_row_order (row_num, display_order)
);

INSERT INTO company_partner (name, logo_url, row_num, display_order, is_active, created_at, updated_at) VALUES
('Lavendel Consulting', '/assets/companies/lavendel.png', 1, 1, 1, NOW(), NOW()),
('Kovan Labs', '/assets/companies/kovan.png', 1, 2, 1, NOW(), NOW()),
('Memstech', '/assets/companies/memstech.png', 1, 3, 1, NOW(), NOW()),
('Thoughtlogik', '/assets/companies/thoughtlogik.png', 1, 4, 1, NOW(), NOW()),
('intrnForte', '/assets/companies/intrnforte.png', 1, 5, 1, NOW(), NOW()),
('Aximsoft', '/assets/companies/aximsoft.png', 1, 6, 1, NOW(), NOW()),
('Walvoil', '/assets/companies/walvoil.png', 2, 1, 1, NOW(), NOW()),
('Techkay', '/assets/companies/techkay.png', 2, 2, 1, NOW(), NOW()),
('Innoboon', '/assets/companies/innoboon.png', 2, 3, 1, NOW(), NOW()),
('Mindenious', '/assets/companies/mindenious.png', 2, 4, 1, NOW(), NOW()),
('IVA', '/assets/companies/iva.png', 2, 5, 1, NOW(), NOW()),
('EV', '/assets/companies/ev.png', 2, 6, 1, NOW(), NOW());
