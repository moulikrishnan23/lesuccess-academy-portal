-- Keep the current public contact values as the defaults while allowing an
-- existing installation's configured values to win during migration.
UPDATE site_setting
SET setting_value = CASE setting_key
    WHEN 'phone_primary' THEN '+91 80120 60000'
    WHEN 'email_primary' THEN 'contact@lesuccess.in'
    WHEN 'social_instagram' THEN 'https://www.instagram.com/lesuccess_official?stkn=cDR6YWRqdzU1aTVo'
    WHEN 'social_facebook' THEN 'https://www.facebook.com/LeSuccess.in'
    WHEN 'social_linkedin' THEN 'https://www.linkedin.com/company/lesuccess-in/'
    WHEN 'social_youtube' THEN 'https://youtube.com/@lesuccessacademy?si=8KpugpC3B5ULIXmh'
    WHEN 'social_whatsapp' THEN 'https://wa.me/918012060000'
    ELSE setting_value
END,
updated_at = NOW()
WHERE setting_key IN ('phone_primary', 'email_primary', 'social_instagram', 'social_facebook',
                      'social_linkedin', 'social_youtube', 'social_whatsapp')
  AND setting_value = '';

INSERT INTO site_setting (setting_key, setting_value, updated_at)
SELECT 'email_training', 'training@lesuccess.in', NOW()
WHERE NOT EXISTS (SELECT 1 FROM site_setting WHERE setting_key = 'email_training');
