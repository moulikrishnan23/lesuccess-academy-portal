-- V36: Expand badge column length and seed all 20 courses matching catalog

ALTER TABLE course MODIFY COLUMN badge VARCHAR(50) NULL;

-- 1. Synchronize existing 4 courses
UPDATE course SET
    name = 'Python : Full Stack Development',
    short_description = 'Python Full Stack Development course in Coimbatore with live projects, daily tasks and 100% placement support.',
    duration_months = 6,
    mode = 'BOTH',
    badge = 'TRENDING',
    badge_text = 'Trending',
    placement_assistance = 1,
    syllabus_url = '/syllabus/python.pdf',
    enroll_url = '/courses/python-full-stack-development',
    icon_url = '/tech/python.svg',
    is_active = 1,
    display_order = 1
WHERE id = 1;

UPDATE course SET
    name = 'Full Stack Java',
    short_description = 'Java Full Stack development course in Coimbatore - Spring Boot, React and MySQL, with live projects and 100% placement support.',
    duration_months = 5,
    mode = 'BOTH',
    badge = 'MOST_ENROLLED',
    badge_text = 'Most Enrolled',
    placement_assistance = 1,
    syllabus_url = '/syllabus/java.pdf',
    enroll_url = '/courses/full-stack-java',
    icon_url = '/tech/java.svg',
    is_active = 1,
    display_order = 2
WHERE id = 2;

UPDATE course SET
    name = 'Data Analytics',
    short_description = 'Turn spreadsheets into decisions - Excel, SQL, Python and Power BI, taught on messy real datasets.',
    duration_months = 3,
    mode = 'BOTH',
    badge = 'OFFER',
    badge_text = '30% Offer',
    placement_assistance = 1,
    syllabus_url = '/syllabus/data-analytics.pdf',
    enroll_url = '/courses/data-analytics',
    icon_url = '/tech/powerbi.svg',
    is_active = 1,
    display_order = 3
WHERE id = 3;

UPDATE course SET
    name = 'AWS & DevOps',
    short_description = 'Docker, Kubernetes, Jenkins and Terraform on AWS - build the pipeline that takes code to production.',
    duration_months = 4,
    mode = 'BOTH',
    badge = 'HIGH_DEMAND',
    badge_text = 'High Demand',
    placement_assistance = 1,
    syllabus_url = '/syllabus/aws-devops.pdf',
    enroll_url = '/courses/aws-and-devops',
    icon_url = '/tech/aws.svg',
    is_active = 1,
    display_order = 4
WHERE id = 4;

-- 2. Insert missing courses 5 through 20
INSERT INTO course (id, name, short_description, duration_months, mode, badge, badge_text, placement_assistance, syllabus_url, enroll_url, icon_url, is_active, display_order, created_at, updated_at)
VALUES
(5, 'MERN Full Stack', 'MongoDB, Express, React and Node - one language across the whole stack, with live projects and placement support.', 5, 'BOTH', 'BEST_SELLER', 'Best Seller', 1, '/syllabus/mern.pdf', '/courses/mern-full-stack', '/tech/react.svg', 1, 5, NOW(), NOW()),
(6, 'MEAN Full Stack', 'Angular and TypeScript on the front, Node, Express and MongoDB behind it - the stack enterprise teams standardise on.', 5, 'BOTH', NULL, NULL, 1, '/syllabus/mean.pdf', '/courses/mean-full-stack', '/tech/javascript.svg', 1, 6, NOW(), NOW()),
(7, 'C and C++', 'Learn how a program actually runs - memory, pointers and OOP in C and C++, from first principles.', 3, 'BOTH', NULL, NULL, 1, '/syllabus/c-cpp.pdf', '/courses/c-and-cpp', '/tech/api.svg', 1, 7, NOW(), NOW()),
(8, 'DSA with Python / Java', 'The interview round that filters everyone out - arrays to dynamic programming, in Python or Java, with daily problem practice.', 3, 'BOTH', 'POPULAR', 'Popular', 1, '/syllabus/dsa.pdf', '/courses/dsa-with-python-java', '/tech/python.svg', 1, 8, NOW(), NOW()),
(9, 'Data Science', 'Statistics, Python and machine learning - build models that hold up outside the notebook they were trained in.', 4, 'BOTH', 'TRENDING', 'Trending', 1, '/syllabus/data-science.pdf', '/courses/data-science', '/tech/python.svg', 1, 9, NOW(), NOW()),
(10, 'Artificial Intelligence and Machine Learning', 'From classical machine learning to neural networks - build, train and evaluate models in TensorFlow and PyTorch.', 4, 'BOTH', 'HIGH_DEMAND', 'High Demand', 1, '/syllabus/ai-ml.pdf', '/courses/artificial-intelligence-and-machine-learning', '/tech/python.svg', 1, 10, NOW(), NOW()),
(11, 'AWS - The Ultimate', 'Core AWS services, architecture and cost control - built around the Cloud Practitioner and Solutions Architect exams.', 3, 'BOTH', NULL, NULL, 1, '/syllabus/aws.pdf', '/courses/aws-the-ultimate', '/tech/aws.svg', 1, 11, NOW(), NOW()),
(12, 'Frontend Developer - UI/UX Design', 'Design interfaces in Figma and then build them in React - one course covering both halves of front-end work.', 4, 'BOTH', 'LIMITED_SEATS', 'Limited Seats', 1, '/syllabus/frontend.pdf', '/courses/frontend-developer-ui-ux-design', '/tech/react.svg', 1, 12, NOW(), NOW()),
(13, 'Data Engineering', 'Build the pipelines analysts depend on - Python, SQL, Spark and Airflow into a cloud warehouse.', 4, 'BOTH', NULL, NULL, 1, '/syllabus/data-engineering.pdf', '/courses/data-engineering', '/tech/mysql.svg', 1, 13, NOW(), NOW()),
(14, 'Digital Marketing', 'SEO, paid ads, content and analytics - run campaigns on real budgets and report on what they returned.', 3, 'BOTH', NULL, NULL, 1, '/syllabus/digital-marketing.pdf', '/courses/digital-marketing', '/tech/api.svg', 1, 14, NOW(), NOW()),
(15, 'Gen AI', 'Work with large language models properly - prompting, APIs, RAG and the limits worth knowing before you ship.', 2, 'BOTH', 'NEW', 'New', 1, '/syllabus/gen-ai.pdf', '/courses/gen-ai', '/tech/python.svg', 1, 15, NOW(), NOW()),
(16, 'Agentic AI', 'Build AI agents that plan, call tools and finish multi-step work - with the guardrails that keep them usable.', 2, 'BOTH', 'TRENDING', 'Trending', 1, '/syllabus/agentic-ai.pdf', '/courses/agentic-ai', '/tech/python.svg', 1, 16, NOW(), NOW()),
(17, 'ServiceNow', 'Configure and script the ITSM platform large enterprises run their service desks on.', 2, 'BOTH', NULL, NULL, 1, '/syllabus/servicenow.pdf', '/courses/servicenow', '/tech/api.svg', 1, 17, NOW(), NOW()),
(18, 'Cybersecurity', 'Networking, Linux and the security tools behind both defence and ethical hacking - taught in a lab, legally.', 2, 'BOTH', 'HIGH_DEMAND', 'High Demand', 1, '/syllabus/cybersecurity.pdf', '/courses/cybersecurity', '/tech/api.svg', 1, 18, NOW(), NOW()),
(19, 'Tally', 'Tally Prime end to end - ledgers, vouchers, GST, TDS, payroll and the reports an auditor asks for.', 2, 'BOTH', NULL, NULL, 1, '/syllabus/tally.pdf', '/courses/tally', '/tech/excel.svg', 1, 19, NOW(), NOW()),
(20, 'Placement Readiness Program', 'Aptitude, communication, resume and mock interviews - the preparation that turns technical skill into an offer.', 3, 'BOTH', 'POPULAR', 'Popular', 1, '/syllabus/placement-readiness.pdf', '/courses/placement-readiness-program', '/tech/api.svg', 1, 20, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    short_description = VALUES(short_description),
    duration_months = VALUES(duration_months),
    mode = VALUES(mode),
    badge = VALUES(badge),
    badge_text = VALUES(badge_text),
    placement_assistance = VALUES(placement_assistance),
    syllabus_url = VALUES(syllabus_url),
    enroll_url = VALUES(enroll_url),
    icon_url = VALUES(icon_url),
    is_active = VALUES(is_active),
    display_order = VALUES(display_order),
    updated_at = NOW();
