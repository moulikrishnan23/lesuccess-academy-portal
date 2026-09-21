-- V30: Seed workshops into program table
INSERT INTO program (type, label, title, topic, event_date, start_time, end_time, platform, meet_link, certificate_included, is_active, created_at, updated_at)
VALUES
('WORKSHOP', 'Hands-on Workshop', 'Full Stack Web & API Workshop', 'Build and deploy live microservices and interactive React dashboards.', '2026-09-16', '14:00:00', '17:00:00', 'Google Meet', 'https://meet.google.com/les-workshop', 1, 1, NOW(), NOW()),
('WORKSHOP', 'Hands-on Workshop', 'AI & Machine Learning with Python Workshop', 'Practical implementation of neural networks, NLP, and model deployment.', '2026-09-23', '14:00:00', '17:00:00', 'Google Meet', 'https://meet.google.com/les-ai-workshop', 1, 1, NOW(), NOW());
