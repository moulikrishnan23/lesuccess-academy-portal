-- V24: Replace sync_failure.resolved with an explicit status.
--
-- The boolean could not distinguish a row that reached the spreadsheet from one
-- the retry scheduler gave up on: both were written as resolved = TRUE. Any
-- submission abandoned after exhausting its attempts was therefore
-- indistinguishable from a delivered one, and nothing could query for the data
-- that had silently never synced.
--
-- Backfill is deliberately conservative. resolved = FALSE is unambiguously
-- PENDING. resolved = TRUE is genuinely ambiguous for historical rows -- it may
-- have been a success or an abandonment -- and it is mapped to SUCCEEDED because
-- that is what the overwhelming majority were: abandonment required ten failed
-- attempts, while success required one. Rows that were in fact abandoned are not
-- recoverable from this table alone; going forward the two are distinct.

ALTER TABLE sync_failure
    ADD COLUMN status VARCHAR(16) NOT NULL DEFAULT 'PENDING' AFTER resolved;

UPDATE sync_failure
SET status = CASE WHEN resolved THEN 'SUCCEEDED' ELSE 'PENDING' END;

-- Drop the default now that the backfill is done: new rows state their status.
ALTER TABLE sync_failure
    ALTER COLUMN status DROP DEFAULT;

-- The scheduler now selects on status, so the old index no longer serves a query.
DROP INDEX idx_resolved ON sync_failure;

ALTER TABLE sync_failure
    DROP COLUMN resolved;

CREATE INDEX idx_status ON sync_failure (status);
