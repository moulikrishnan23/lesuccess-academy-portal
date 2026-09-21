-- V25: Standalone table for the Home page "Connect with Us" form.
--
-- This form used to post as a HOME_CONNECT_FORM lead. Unlike course_enquiry
-- (V22), it is NOT moving out because lead_capture lacks columns for it — name,
-- mobile and email all fit there comfortably. It moves because the people who
-- work it want it on its own sheet tab: a Home-page "get in touch" enquiry is a
-- different conversation from a course enrolment or a service CTA, and filtering
-- one source out of a shared Leads tab by hand is the workflow this replaces.
--
-- Three columns, therefore, and no more. No course reference: the form has no
-- course field. No status and no deleted_at: there is no admin workflow on this
-- table — the admin listing is read-only — so a status enum with a single NEW
-- value and a soft-delete column nothing sets would be scaffolding pretending to
-- be a feature. Both are additive migrations if a workflow arrives.
CREATE TABLE connect_with_us (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(120) NOT NULL,
    mobile     VARCHAR(20)  NOT NULL,
    email      VARCHAR(160) NULL,
    ip_address VARCHAR(45)  NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_connect_with_us_created_at (created_at),
    -- Serves duplicate detection: (mobile) within a recent time window.
    INDEX idx_connect_with_us_mobile_created (mobile, created_at)
);
