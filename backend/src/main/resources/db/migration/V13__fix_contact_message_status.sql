-- V13: Repair contact_message.status values left behind by an enum rename.
--
-- ContactMessageStatus used to be {NEW, READ, REPLIED, CLOSED}. It was renamed to
-- {NEW, IN_PROGRESS, RESOLVED, CLOSED} without a data migration, so rows written
-- under the old vocabulary still hold 'READ' and 'REPLIED'.
--
-- Nothing caught this at write time: status is a plain VARCHAR(20) with no CHECK
-- constraint and no FK, so the database accepted whatever the application sent.
-- It only surfaces on READ — Hibernate's EnumJavaType.fromName calls
-- Enum.valueOf, which throws IllegalArgumentException for an unknown name. That
-- propagates out as a 500, so any query whose result set touches an affected row
-- fails outright:
--
--   GET /api/contact-messages          -> 500 (findAll reads every row)
--   GET /api/contact-messages/{id}     -> 500 for the affected ids only
--   GET /api/contact-messages?status=X -> 200 (WHERE clause never reads them)
--
-- Mapping follows the intent of the old names: a message that had been READ is
-- being worked (IN_PROGRESS); one that had been REPLIED to is finished (RESOLVED).

UPDATE contact_message SET status = 'IN_PROGRESS' WHERE status = 'READ';
UPDATE contact_message SET status = 'RESOLVED'    WHERE status = 'REPLIED';

-- Stop the same drift recurring. The enum is the source of truth for these four
-- values; a CHECK constraint makes the database reject anything else at write
-- time rather than letting it sit until someone reads the row.
--
-- If a future enum value is added, this constraint must be updated in the same
-- migration that adds it -- otherwise writes of the new value will fail.
ALTER TABLE contact_message
    ADD CONSTRAINT chk_contact_message_status
    CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'));
