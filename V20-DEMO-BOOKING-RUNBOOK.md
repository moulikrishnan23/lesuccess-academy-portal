# Runbook: prod checks before deploying V19 + V20 (`demo_booking`)

For whoever holds production database access. Everything here is **read-only except step 2
(backup) and the optional archive in step 5** — nothing in this document migrates anything.

Run steps 1–4 in a single prod session. They are ordered so the whole picture is known
before any decision is made.

**Context.** Two new migrations are pending and have never run in production:

| Version | What it does |
|---|---|
| `V19__alter_demo_booking_add_course_name.sql` | Adds `course_name VARCHAR(200) NULL` |
| `V20__simplify_demo_booking.sql` | **Drops** `course_id`, `name`, `email`, `ip_address`, `updated_at` — plus one foreign key and two indexes |

V20 is destructive and MySQL cannot roll back a completed `ALTER TABLE`. **The step 2 backup is
the only rollback path.**

Column names below were verified against the DDL that created them (`V5__create_demo_booking.sql`
and `V16__alter_demo_booking_add_name_email.sql`), **not** against `DemoBooking.java` — the entity
no longer declares these columns, which is precisely why V20 exists, so it cannot confirm them.

---

## Step 1 — Flyway history

```sql
SELECT version, description, checksum, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

Compare against local dev, which is `V1`–`V20`, all `success = 1`. Three things to look for:

1. **Any row with `success = 0`.** A failed migration blocks everything after it. Stop and fix that first.
2. **Which file is recorded at V16.** Local dev has V16 = `alter demo booking add name email`. If prod
   instead recorded V16 = `alter demo booking add course name`, the recent collision cleanup renamed
   a file prod has already applied, and prod will fail validation with a V16 checksum that matches no
   local file. **Stop and report — that needs a fix before deploying.**
3. **Highest version present.** Expect `18`. If V19 or V20 already appear, this runbook has already
   been run or a deploy is further along than assumed — stop and reconcile.

---

## Step 2 — Backup

The app is MySQL 8.0 (`mysql-connector-j`, `flyway-mysql`) and is deployed as a container image,
so run `mysqldump` from a host that can reach the database, not from inside the app container.
Fill in the placeholders — connection details are deliberately not guessed here.

Use a `mysqldump` binary whose major version is **>= the server's**. Check with `mysqldump --version`.

```bash
# Targeted: the table V20 modifies. Small, fast, and enough to restore the dropped columns.
mysqldump \
  --host=[PROD_HOST] \
  --port=[PROD_PORT] \
  --user=[PROD_USER] \
  --password \
  --single-transaction \
  --no-tablespaces \
  --result-file=demo_booking_pre_v20_$(date +%Y%m%d_%H%M%S).sql \
  [PROD_DATABASE] demo_booking
```

```bash
# Full-schema safety net. Prefer this if the maintenance window allows.
mysqldump \
  --host=[PROD_HOST] \
  --port=[PROD_PORT] \
  --user=[PROD_USER] \
  --password \
  --single-transaction \
  --routines --triggers --events \
  --no-tablespaces \
  --result-file=lesuccess_prod_pre_v20_$(date +%Y%m%d_%H%M%S).sql \
  [PROD_DATABASE]
```

Notes:

- `--password` with no value prompts interactively. Do not put the password on the command line —
  it lands in shell history and `ps` output.
- `--single-transaction` gives a consistent snapshot on InnoDB without locking writers.
- `--no-tablespaces` avoids needing the `PROCESS` privilege, which many managed MySQL users lack.

**Verify the dump before proceeding** — a truncated backup is worse than none:

```bash
ls -lh demo_booking_pre_v20_*.sql
tail -5 demo_booking_pre_v20_*.sql   # a complete dump ends with "Dump completed on ..."
grep -c "INSERT INTO" demo_booking_pre_v20_*.sql
```

---

## Step 3 — Data pre-check (read-only)

```sql
SELECT COUNT(*)          AS total_rows,
       COUNT(course_id)  AS non_null_course_id,
       COUNT(name)       AS non_null_name,
       COUNT(email)      AS non_null_email,
       COUNT(ip_address) AS non_null_ip_address,
       COUNT(updated_at) AS non_null_updated_at
FROM demo_booking;
```

`COUNT(col)` counts non-NULL values only, so each figure is how many rows would lose real data.

**Read `updated_at` differently from the rest.** It was created `NOT NULL` in V5, so
`non_null_updated_at` **always equals `total_rows`** whenever the table has any rows. That is
expected and is not evidence of data loss — it is a row-maintenance timestamp, not user-entered
data. Judge the deploy on the other four columns.

The table is soft-deleted (`deleted_at`), so split live rows from deleted ones — usually only live
rows matter for a retention decision:

```sql
SELECT COUNT(*)          AS live_rows,
       COUNT(course_id)  AS live_course_id,
       COUNT(name)       AS live_name,
       COUNT(email)      AS live_email,
       COUNT(ip_address) AS live_ip_address
FROM demo_booking
WHERE deleted_at IS NULL;
```

---

## Step 4 — Schema pre-check (read-only)

V20 drops objects **by name**. If any is already absent, the `ALTER` fails partway and the deploy
breaks. This is a real possibility if prod's history diverged at V16 (step 1), because
`idx_demo_booking_email` is created by V16.

```sql
-- Expect exactly these 5 rows: course_id, name, email, ip_address, updated_at
SELECT column_name, is_nullable, column_type
FROM information_schema.columns
WHERE table_schema = DATABASE()
  AND table_name   = 'demo_booking'
  AND column_name IN ('course_id','name','email','ip_address','updated_at')
ORDER BY ordinal_position;

-- Expect fk_demo_booking_course
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_schema = DATABASE()
  AND table_name   = 'demo_booking'
  AND constraint_type = 'FOREIGN KEY';

-- Expect idx_course_id and idx_demo_booking_email
SELECT DISTINCT index_name
FROM information_schema.statistics
WHERE table_schema = DATABASE()
  AND table_name   = 'demo_booking';
```

If anything expected is missing, **stop.** V20 needs adjusting for prod's actual schema before it runs.

---

## Step 5 — Decision guide

Base this on step 3, reading `updated_at` per the caveat above.

### Case A — `course_id`, `name`, `email`, `ip_address` are all `0`

V20 is **safe to deploy as-is.** No data is lost; only empty columns and their indexes are removed.
Proceed with the normal deploy. Keep the step 2 backup until the deploy is confirmed healthy.

### Case B — any of those four is non-zero

**Real data would be destroyed. A decision is required — do not proceed on autopilot.** The step 2
backup makes recovery possible but manual and disruptive, so choose deliberately:

| Option | What it gives you | Cost |
|---|---|---|
| **1. Archive table in-place** | Keeps the data queryable in prod after the drop | One extra table to own and eventually retire |
| **2. Export to CSV/file** | Data leaves the DB; schema stays clean | Needs a storage location and an access policy |
| **3. Accept the loss** | Simplest; the backup is the only copy | Irreversible once the backup ages out |

Option 1, to run **before** deploying V20:

```sql
CREATE TABLE demo_booking_pre_v20_archive AS
SELECT id, course_id, name, email, ip_address, updated_at
FROM demo_booking;

-- confirm it matches before continuing
SELECT COUNT(*) FROM demo_booking_pre_v20_archive;
```

Option 2, run from a host with DB access:

```bash
mysql --host=[PROD_HOST] --user=[PROD_USER] --password \
      --batch --raw [PROD_DATABASE] \
      -e "SELECT id, course_id, name, email, ip_address, updated_at FROM demo_booking;" \
      > demo_booking_pre_v20_$(date +%Y%m%d).tsv
```

Two points that should inform the choice rather than be decided here:

- **`name` and `email` are personal data.** Archiving them keeps them in scope for whatever
  retention and deletion obligations apply. Dropping them may be the intended outcome, not a loss.
- **`ip_address` is the same, more so.** If it was collected for abuse prevention, its useful life
  has likely passed. Check whether anything still reads it before archiving it by reflex.

Whichever option is chosen, record it and who approved it before deploying.

---

## Summary checklist

- [ ] Step 1 — history read; no `success = 0`; V16 matches local dev; V19/V20 absent
- [ ] Step 2 — backup taken **and verified** (`Dump completed on ...` present)
- [ ] Step 3 — data pre-check run; `updated_at` interpreted per the caveat
- [ ] Step 4 — schema pre-check run; all five columns, the FK and both indexes present
- [ ] Step 5 — Case A confirmed, **or** Case B option chosen, recorded and approved
- [ ] Only then: deploy V19 + V20
