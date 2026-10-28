-- Change only the former official website contact; preserve personal records.
UPDATE site_setting
SET setting_value = '+91 81898 11000', updated_at = NOW()
WHERE setting_key = 'phone_primary'
  AND REGEXP_REPLACE(setting_value, '[^0-9]', '') IN ('8012060000', '918012060000');

UPDATE site_setting
SET setting_value = 'https://wa.me/918189811000', updated_at = NOW()
WHERE setting_key = 'social_whatsapp'
  AND setting_value REGEXP '^https?://(wa[.]me/(91)?8012060000/?([?].*)?|(api|web)[.]whatsapp[.]com/send[?]phone=(%2B|[+])?(91)?8012060000(&.*)?)$';
