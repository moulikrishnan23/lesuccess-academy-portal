-- V11: Unified lead-capture table for every public enquiry form.
--
-- Table is lead_capture, not lead: LEAD became a reserved word in MySQL 8.0
-- along with the window functions, so `lead` would need backquoting everywhere.
--
-- One table with a `source` discriminator rather than a table per form. Home's
-- Demo/Connect forms and the Course enrolment form capture the same fields and
-- feed the same pipeline; all four source values exist here from the start so
-- those forms need no further migration. Which sources the API actually accepts
-- is config (lesuccess.leads.accepted-sources), not schema.
CREATE TABLE lead_capture (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    mobile      VARCHAR(20)  NOT NULL,
    email       VARCHAR(160) NULL,
    course_id   BIGINT       NULL,
    looking_for VARCHAR(120) NULL,
    source      VARCHAR(30)  NOT NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'NEW',
    ip_address  VARCHAR(45)  NULL,
    created_at  DATETIME     NOT NULL,
    deleted_at  DATETIME     NULL,

    INDEX idx_status (status),
    INDEX idx_source (source),
    INDEX idx_created_at (created_at),
    -- Serves duplicate detection: (mobile, source) within a recent time window.
    INDEX idx_mobile_source_created (mobile, source, created_at)
);
-- No FK on course_id, deliberately: leads outlive the courses they reference,
-- and a constraint would make retiring a course either fail or cascade into
-- historical enquiry records.
