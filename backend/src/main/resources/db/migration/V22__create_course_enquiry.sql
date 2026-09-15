-- V22: Standalone table for the global navbar "Course Enquiry" modal.
--
-- Deliberately NOT a fifth `lead_capture.source` value. The unified lead table
-- exists because Home's Demo/Connect forms, the Service CTA and the Course
-- enrolment form capture the same handful of fields and feed one pipeline. This
-- form does not: it collects a location and a "currently you are a" status that
-- lead_capture has no columns for, and the counsellors who work it want it on
-- its own sheet tab rather than filtered out of the Leads tab. Squeezing it in
-- would have meant either two more nullable columns that only one source ever
-- populates, or stuffing them into `looking_for` as a formatted string — which
-- is exactly what the frontend was doing before this migration (see
-- CourseEnquiryModal.jsx, which posted "Student | Location: X | Course: Y").
CREATE TABLE course_enquiry (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(120) NOT NULL,
    mobile         VARCHAR(20)  NOT NULL,
    email          VARCHAR(160) NULL,
    location       VARCHAR(160) NULL,
    course_id      BIGINT       NULL,
    current_status VARCHAR(120) NULL,
    ip_address     VARCHAR(45)  NULL,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_course_enquiry_created_at (created_at),
    INDEX idx_course_enquiry_course_id (course_id),
    -- Serves duplicate detection: (mobile) within a recent time window.
    INDEX idx_course_enquiry_mobile_created (mobile, created_at),

    -- ON DELETE SET NULL, not the default RESTRICT: an enquiry outlives the
    -- course it names, and retiring a course must not fail on, or cascade into,
    -- historical enquiry rows. Note this differs from lead_capture, which has no
    -- FK at all for the same underlying reason — the constraint is here because
    -- the enquiry form validates courseId against a live course, so a dangling
    -- id would mean the row disagrees with the rule that admitted it.
    CONSTRAINT fk_course_enquiry_course
        FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE SET NULL
);
