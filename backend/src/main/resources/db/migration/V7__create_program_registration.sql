-- V7: Program registrations ("Register Now" on upcoming program cards)
CREATE TABLE program_registration (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    program_id    BIGINT        NOT NULL,
    name          VARCHAR(120)  NOT NULL,
    mobile_number VARCHAR(20)   NOT NULL,
    ip_address    VARCHAR(45)   NULL,
    created_at    DATETIME      NOT NULL,

    INDEX idx_program_id (program_id),
    INDEX idx_created_at (created_at),
    CONSTRAINT fk_registration_program
        FOREIGN KEY (program_id) REFERENCES program (id) ON DELETE CASCADE
);
