-- V23: Restore demo_booking.ip_address, and index the duplicate-detection key.
--
-- V5 created this column. V18 dropped it as one of several "unused columns",
-- which was accurate at the time and is the reason it is coming back: the column
-- was unused because DemoBookingService had none of the protections that use it.
-- create() went straight to repository.save() with no honeypot check, no
-- duplicate window and no sanitisation, so there was nothing to attribute to a
-- caller and nothing to log an IP against.
--
-- Contact, Lead and CourseEnquiry all record ip_address on every submission —
-- the honeypot logs it when it fires, and duplicate detection logs it when it
-- suppresses a row. demo_booking is the last public form without that parity.
--
-- Deliberately nullable, matching the other four tables: an IP is diagnostic
-- context, never a required part of the record, and a NOT NULL here would turn
-- an unresolvable remote address into a failed booking.
ALTER TABLE demo_booking
    ADD COLUMN ip_address VARCHAR(45) NULL AFTER mobile_number;

-- Serves duplicate detection: (mobile_number, created_at) within a recent
-- window, the same shape as lead_capture's idx_mobile_source_created and
-- course_enquiry's idx_course_enquiry_mobile_created. Without it the lookup is
-- a full scan on every public submission, which is exactly the request an
-- unthrottled endpoint was receiving most of.
ALTER TABLE demo_booking
    ADD INDEX idx_demo_booking_mobile_created (mobile_number, created_at);
