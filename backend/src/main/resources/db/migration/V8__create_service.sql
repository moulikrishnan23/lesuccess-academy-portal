-- V8: Service page cards ("For Institutions" / "Corporate Training")
-- Entity is in.lesuccess.portal.serviceoffering.ServiceOffering — named
-- ServiceOffering in Java to avoid clashing with org.springframework.stereotype.Service.
CREATE TABLE service (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    category      VARCHAR(20)   NOT NULL,
    title         VARCHAR(120)  NOT NULL,
    description   TEXT          NOT NULL,
    icon_url      VARCHAR(255)  NULL,
    status        VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    display_order INT           NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL,
    updated_at    DATETIME      NOT NULL,
    deleted_at    DATETIME      NULL,

    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_display_order (display_order)
);
