-- V12: Generalise the Sheets sync-failure queue to cover more than one table.
--
-- Was: contact_message_sync_failure(contact_message_id) with an FK.
-- Now: sync_failure(entity_type, entity_id), so Contact messages and Leads share
-- one queue, one retry scheduler and one operational view.
--
-- The FK is dropped as part of this: a single column cannot reference two
-- tables. Acceptable here because this is an operational retry queue rather than
-- a domain relation, and SyncRetryScheduler already treats a vanished entity as
-- "resolved, nothing to replay".

-- Drop the FK first — the column it constrains is renamed below.
ALTER TABLE contact_message_sync_failure
    DROP FOREIGN KEY fk_sync_failure_contact_message;

ALTER TABLE contact_message_sync_failure
    CHANGE COLUMN contact_message_id entity_id BIGINT NOT NULL;

-- Added with a default so existing rows are valid the moment the column exists;
-- every row already in this table came from the contact-message sync.
ALTER TABLE contact_message_sync_failure
    ADD COLUMN entity_type VARCHAR(32) NOT NULL DEFAULT 'CONTACT_MESSAGE' AFTER id;

-- Drop the default now that the backfill is done: new rows must state their type.
ALTER TABLE contact_message_sync_failure
    ALTER COLUMN entity_type DROP DEFAULT;

ALTER TABLE contact_message_sync_failure
    ADD INDEX idx_entity (entity_type, entity_id);

RENAME TABLE contact_message_sync_failure TO sync_failure;
