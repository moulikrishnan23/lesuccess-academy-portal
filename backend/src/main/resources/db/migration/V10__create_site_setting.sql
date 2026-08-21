-- V10: Site-wide key/value settings.
--
-- Columns are setting_key / setting_value: KEY is a reserved word in MySQL and
-- would need backquoting everywhere. The API contract is unaffected —
-- GET /api/settings returns a flat {key: value} map.
CREATE TABLE site_setting (
    setting_key   VARCHAR(80) NOT NULL PRIMARY KEY,
    setting_value TEXT        NOT NULL,
    updated_at    DATETIME    NOT NULL
);

-- Seed the full key vocabulary.
--
-- PUT /api/settings deliberately rejects unknown keys, so every key the site
-- reads must exist here from the start. Values that are not yet known are
-- seeded as EMPTY STRING rather than the literal text 'TODO' — these render
-- straight into the page, and an empty value degrades to "hidden" whereas
-- 'TODO' would ship the word TODO to production.
--
-- Rows marked "NEEDS REAL VALUE" below must be filled in before launch.
INSERT INTO site_setting (setting_key, setting_value, updated_at) VALUES
-- NEEDS REAL VALUE — no contact details exist anywhere in the repo to source these from.
('phone_primary',       '', NOW()),
('phone_secondary',     '', NOW()),
('email_primary',       '', NOW()),
('address',             '', NOW()),
('social_instagram',    '', NOW()),
('social_facebook',     '', NOW()),
('social_linkedin',     '', NOW()),
('social_whatsapp',     '', NOW()),
('social_youtube',      '', NOW()),
-- NEEDS REAL VALUE — map pin for the office. Left blank rather than guessed;
-- the course copy mentions Coimbatore but that is not a street address.
('map_lat',             '', NOW()),
('map_lng',             '', NOW()),
-- PLACEHOLDER — carried over from frontend/src/mocks/fixtures.js, which labels
-- the Google rating as placeholder data. Replace with the real Google Business figures.
('google_rating',       '4.6', NOW()),
('google_review_count', '250', NOW()),
-- REAL — transcribed from the live banner in frontend/src/components/OfferHeader.jsx.
('promo_banner_text',   'Data Analytics Course - 30% Offer 10Days Only - Limited Seats!', NOW()),
-- NEEDS REAL VALUE — the banner's Enroll button currently has no href.
('promo_banner_link',   '', NOW()),
('promo_banner_active', 'true', NOW());
