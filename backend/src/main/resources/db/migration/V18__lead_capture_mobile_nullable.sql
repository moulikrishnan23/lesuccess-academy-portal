-- V18: Allow lead_capture.mobile to be NULL.
--
-- V11 created the column NOT NULL, matching a @NotBlank on LeadRequest. The
-- Service page CTA collects a name, an email and a subject but no phone number,
-- so that form could never produce a row: every submission failed validation
-- before it reached the database.
--
-- Requiring a mobile is still right for COURSE_ENROLL_FORM, where a number to
-- call back on is the point of the form. That rule is per-source, which a
-- column constraint cannot express, so it moves into LeadService where the
-- source is known. The database now records what the forms can actually supply.
--
-- Existing rows are unaffected: widening NOT NULL to NULL never rewrites data.
--
-- Note for duplicate detection: findRecentDuplicate matches on
-- `l.mobile = :mobile`, and SQL equality against NULL is never true. A lead with
-- no mobile therefore cannot be matched as a duplicate. LeadService skips the
-- lookup outright in that case rather than issuing a query that can only miss.

ALTER TABLE lead_capture
    MODIFY COLUMN mobile VARCHAR(20) NULL;
