-- V42: Add hero video settings for dynamic video management
INSERT INTO site_setting (setting_key, setting_value, updated_at)
VALUES
  ('hero_video_url', 'https://res.cloudinary.com/mknetwyg/video/upload/v1790162815/lesuccess/video/CompanyIntro.mp4', CURRENT_TIMESTAMP),
  ('hero_video_enabled', 'true', CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
