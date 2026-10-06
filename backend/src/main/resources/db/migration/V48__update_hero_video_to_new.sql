-- V48: Update hero video url to new Cloudinary CompanyIntroNew video
UPDATE site_setting
SET setting_value = 'https://res.cloudinary.com/mknetwyg/video/upload/v1791267704/lesuccess/video/CompanyIntroNew.mp4',
    updated_at = CURRENT_TIMESTAMP
WHERE setting_key = 'hero_video_url';
