-- V9: "How LeSuccess Drives Success" — a fixed four-step diagram.
--
-- No deleted_at column: unlike the other content tables these four rows are not
-- creatable or deletable through the API, only editable (PUT /api/process-steps/{id}).
CREATE TABLE process_step (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    step_number INT           NOT NULL,
    title       VARCHAR(80)   NOT NULL,
    description TEXT          NOT NULL,
    icon_url    VARCHAR(255)  NULL,
    created_at  DATETIME      NOT NULL,
    updated_at  DATETIME      NOT NULL,

    UNIQUE KEY uq_step_number (step_number)
);

-- Seed the four steps.
--
-- PLACEHOLDER COPY: the Service page PDF was not present in this repository, so
-- the descriptions below were written to fit the four named stages rather than
-- transcribed from the reference. Titles are the agreed four. Replace the
-- descriptions with the real copy before launch — they are editable through
-- PUT /api/process-steps/{id}, so this needs no further migration.
INSERT INTO process_step (step_number, title, description, icon_url, created_at, updated_at) VALUES
(1, 'Evaluate',
 'We start by understanding where you stand — auditing current skill levels, team capability and the gap between them and the roles you are hiring or training for.',
 NULL, NOW(), NOW()),
(2, 'Customize',
 'No two institutions need the same programme. The syllabus, delivery mode and schedule are shaped around your cohort rather than pulled off a shelf.',
 NULL, NOW(), NOW()),
(3, 'Empower',
 'Training runs hands-on with live projects, mentor support and measurable checkpoints, so progress is visible throughout rather than only at the end.',
 NULL, NOW(), NOW()),
(4, 'Launch',
 'Learners finish placement-ready — portfolio built, interviews rehearsed, and connected to our hiring network for the roles the programme was designed around.',
 NULL, NOW(), NOW());
