-- V46: Add chatbot mode settings for admin-controlled switching between API Chatbot and Normal Chatbot
INSERT INTO site_setting (setting_key, setting_value, updated_at)
VALUES
  ('chatbot_mode', 'NORMAL', CURRENT_TIMESTAMP),
  ('chatbot_enabled', 'true', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
