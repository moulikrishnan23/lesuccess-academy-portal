# LeSuccess Academy Portal — Full-Stack Documentation & Integration Guide

This repository contains the complete full-stack web application for **LeSuccess Academy**, consisting of a **React + Vite** single-page frontend and a **Spring Boot 4 + MySQL + Flyway** backend.

---

## Table of Contents
1. [Current Integration Status](#1-current-integration-status)
2. [Summary of Changes Made](#2-summary-of-changes-made)
3. [Module-by-Module Integration Details](#3-module-by-module-integration-details)
   - [3.1 Courses (Catalog, Detail Page, Navbar Dropdown, ChooseYourPath)](#31-courses)
   - [3.2 Testimonials (Course Detail Page)](#32-testimonials)
   - [3.3 Leads (Service CTA Form, Course Enroll Form & Connect With Us)](#33-leads)
   - [3.4 Demo Booking (Home Page DemoClass)](#34-demo-booking)
   - [3.5 Upcoming Programs (Home Page Webinars & Internships)](#35-upcoming-programs)
   - [3.6 Site Settings (Course Detail Page & Global)](#36-site-settings)
4. [Google Sheets Integration & Live Auto-Sync](#4-google-sheets-integration--live-auto-sync)
5. [Database Architecture & Schema](#5-database-architecture--schema)
6. [File-Level Architecture Mapping](#6-file-level-architecture-mapping)
7. [Environment Variables & Configuration](#7-environment-variables--configuration)
8. [How to Run the Project](#8-how-to-run-the-project)
9. [Verification & Test Results](#9-verification--test-results)

---

## 1. Current Integration Status

All modules have been audited, integrated, connected to MySQL database tables, and configured for live background synchronization to Google Sheets:

| Module | Frontend Component | Backend API Route | Database Table | Google Sheets Tab | Status |
|---|---|---|---|---|---|
| **Courses** (Catalog, Navbar, ChooseYourPath) | `CourseCatalogPage.jsx`, `Navbar.jsx`, `ChooseYourPath.jsx` | `GET /api/courses` | `course` | — | **Connected & Complete** |
| **Courses** (Course Detail Page) | `CourseDetailPage.jsx` | `GET /api/courses/{idOrSlug}` | `course`, `course_module` | — | **Connected & Complete** |
| **Testimonials** (Course Detail) | `TestimonialCarousel.jsx` via `useCourseTestimonials` | `GET /api/courses/{idOrSlug}/testimonials` | `testimonial` | — | **Connected & Complete** |
| **Leads** (Service CTA Form) | `LeadCaptureForm.jsx` | `POST /api/leads` (`SERVICE_CTA_FORM`) | `lead_capture` | `Leads` | **Connected & Synced** |
| **Leads** (Course Enroll Form) | `EnrollCourseForm.jsx`, `MobileEnrollBar.jsx` | `POST /api/leads` (`COURSE_ENROLL_FORM`) | `lead_capture` | `Leads` | **Connected & Synced** |
| **Leads** (Connect With Us) | `ConnectWithUs.jsx` | `POST /api/leads` (`HOME_CONNECT_FORM`) | `lead_capture` | `Leads` | **Connected & Synced** |
| **Demo Booking** | `DemoClass.jsx` | `POST /api/demo-bookings` | `demo_booking` | `Demo Bookings` | **Connected & Synced** |
| **Upcoming Programs** | `UpcomingPrograms.jsx` | `GET /api/upcoming-programs` | `program` | — | **Connected & Complete** |
| **Site Settings** | `CourseDetailPage.jsx` via `useSiteSettings` | `GET /api/settings` | `site_setting` | — | **Connected & Complete** |
| **Contact Messages** | `Contact.jsx`, `GetInTouch.jsx` | `POST /api/contact-messages` | `contact_message` | `Contact Messages` | **Connected & Synced** |


---

## 2. Summary of Changes Made

### A. Backend Bug Fixes & Architectural Enhancements
1. **Course Lookup by Slug & Modules Inclusion**
   - **Files Modified:** 
     - `backend/src/main/java/in/lesuccess/portal/course/CourseController.java`
     - `backend/src/main/java/in/lesuccess/portal/course/CourseService.java`
     - `backend/src/main/java/in/lesuccess/portal/course/CourseResponse.java`
   - **Why:** The frontend navigates using semantic URL slugs (e.g. `/courses/python-full-stack-development`) and calls `GET /api/courses/{slug}`. Previously, `CourseController` only accepted `@PathVariable Long id`, causing Spring Boot to throw `MethodArgumentTypeMismatchException` (HTTP 400/500). Furthermore, `CourseResponse` did not contain modules, leaving the syllabus accordion empty.
   - **What was changed:** 
     - Added `getByIdOrSlug(String idOrSlug)` to `CourseService` which parses numeric IDs or performs slug lookup against `toSlug(c.getName())`.
     - Updated `@GetMapping("/api/courses/{idOrSlug}")`, `@GetMapping("/api/courses/{idOrSlug}/modules")`, and `@GetMapping("/api/courses/{idOrSlug}/testimonials")` in `CourseController`.
     - Added `private List<CourseModuleResponse> modules;` to `CourseResponse.java` and populated it automatically when retrieving course details.

2. **Course Enrollment Lead Source Acceptance (`accepted-sources`)**
   - **File Modified:** `backend/src/main/resources/application.yml`
   - **Why:** `LeadService.assertSourceAccepted()` checks incoming lead sources against `lesuccess.leads.accepted-sources`. The configuration previously only permitted `SERVICE_CTA_FORM`. When users submitted `EnrollCourseForm` on any course page (`COURSE_ENROLL_FORM`), the backend rejected the submission with HTTP 400 (`Lead source COURSE_ENROLL_FORM is not currently accepted`).
   - **What was changed:** Updated configuration to `accepted-sources: SERVICE_CTA_FORM,COURSE_ENROLL_FORM`.

3. **Testimonial Contract & Field Aliasing**
   - **Files Modified:** 
     - `backend/src/main/java/in/lesuccess/portal/course/TestimonialResponse.java`
     - `frontend/src/services/testimonialApi.js`
   - **Why:** Backend entity used `reviewText` and `rating`, while frontend expected `quoteText` and `ratingValue`.
   - **What was changed:** Added `quoteText` and `ratingValue` aliases in `TestimonialResponse.java` and added fallbacks (`raw.reviewText`, `raw.rating`) in `testimonialApi.js` to ensure bidirectional compatibility.

4. **Flyway Migration Conflict Resolution & Deduplication**
   - **Directory:** `backend/src/main/resources/db/migration/`
   - **Why:** The repository had conflicting duplicate migration files (`V13__fix_contact_message_status.sql` vs `V13__create_course_module.sql`, and duplicate V14, V15, V16, V17 versions), causing Flyway to fail on startup.
   - **What was changed:** Resolved conflicts into a canonical, linear sequence:
     - `V13__fix_contact_message_status.sql`
     - `V14__create_course_module.sql`
     - `V15__create_testimonial.sql`
     - `V16__alter_demo_booking_add_name_email.sql`
     - `V17__alter_demo_booking_add_course_name.sql`
     - `V18__simplify_demo_booking.sql`
     - `V19__widen_testimonial_rating.sql`
     - `V20__lead_capture_mobile_nullable.sql`

5. **Initial Data Seeding (`V21__seed_initial_data.sql`)**
   - **File Created:** `backend/src/main/resources/db/migration/V21__seed_initial_data.sql`
   - **Why:** Database tables for courses, modules, testimonials, and programs were created empty.
   - **What was changed:** Seeded 4 standard courses (`Python : Full Stack Development`, `Java : Full Stack Development`, `Data Analytics`, `AWS with DevOps`), corresponding curriculum modules in `course_module`, student testimonials in `testimonial`, and upcoming webinars and internships in `program`.

6. **Unit & Integration Test Suite Fixes**
   - **Files Modified:**
     - `backend/src/test/java/in/lesuccess/portal/controller/ContactControllerTest.java`: Updated mock role from `CONTENT_ADMIN` to `MANAGER` to align with `@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")`.
     - `backend/src/test/java/in/lesuccess/portal/controller/LeadControllerTest.java`: Removed outdated assertion expecting a mobile field validation error on general leads (since `mobile` was made nullable in V20).
     - `ContactIntegrationTest.java` & `ContentIntegrationTest.java`: Added `disabledWithoutDocker = true` to `@Testcontainers` to allow tests to run on machines without local Docker daemon.

7. **Google Sheets Configuration & Dynamic Property Binding**
   - **Files Modified:**
     - `backend/src/main/resources/application.yml`
     - `backend/src/main/resources/application-dev.yml`
     - `root .env` & `.env.example`
   - **Why:** `application.yml` previously hardcoded `sheets.enabled: false`, ignoring the environment variable `LESUCCESS_SHEETS_ENABLED`. Additionally, `SHEETS_SPREADSHEET_ID` was set to the full browser URL rather than the raw 44-character spreadsheet ID.
   - **What was changed:** Bound `sheets.enabled: ${LESUCCESS_SHEETS_ENABLED:false}`, set up development fallbacks in `application-dev.yml`, and configured the credentials path to the downloaded service account key file.

8. **Demo Booking Google Sheets Synchronization Architecture**
   - **Files Created:**
     - `backend/src/main/java/in/lesuccess/portal/demobooking/DemoBookingCreatedEvent.java`
     - `backend/src/main/java/in/lesuccess/portal/demobooking/DemoBookingStatusUpdatedEvent.java`
     - `backend/src/main/java/in/lesuccess/portal/demobooking/DemoBookingSheetRowSource.java`
     - `backend/src/main/java/in/lesuccess/portal/demobooking/DemoBookingSheetsSyncListener.java`
   - **Files Modified:**
     - `backend/src/main/java/in/lesuccess/portal/shared/sheets/SyncEntityType.java` (added `DEMO_BOOKING`)
     - `backend/src/main/java/in/lesuccess/portal/demobooking/DemoBookingService.java`
   - **Why:** While Leads and Contact Messages had automated Google Sheets sync, Demo Bookings only saved to the database without publishing domain events or writing to Google Sheets.
   - **What was changed:** Introduced transactional domain events (`AFTER_COMMIT`), a `SheetRowSource` defining the `Demo Bookings` tab layout (Columns A–E: ID, Created At, Course Name, Mobile Number, Status), and injected `ApplicationEventPublisher` into `DemoBookingService`.

9. **Lead Source Additions (`HOME_CONNECT_FORM`, `HOME_DEMO_FORM`)**
   - **File Modified:** `backend/src/main/resources/application.yml`
   - **Why:** Leads originating from the homepage Connect form were blocked by `LeadService.assertSourceAccepted()`.
   - **What was changed:** Added `HOME_CONNECT_FORM,HOME_DEMO_FORM` to `lesuccess.leads.accepted-sources`.

### B. Frontend Fixes & Cleanups
1. **ESLint & Runtime Cleanup**
   - `frontend/src/components/Footer.jsx`: Removed unused `FaTwitter` import.
   - `frontend/src/components/OfferHeader.jsx`: Removed unused variables `label` and `href`.
   - `frontend/src/components/WhereStudentsWork.jsx`, `components/home/WhereStudentsWork.jsx`, `components/home/LifeAtLeSuccess.jsx`: Removed redundant `React` imports.
   - `frontend/src/components/home/Testimonials.jsx`: Removed unused variable `peek`.
   - `frontend/src/components/home/UpcomingPrograms.jsx`: Removed synchronous `setState` call inside `useEffect` by moving tab reset directly into event handlers.
   - `frontend/src/services/testimonialApi.js`: Fixed endpoint URL to `/api/courses/${encodeURIComponent(courseId)}/testimonials` and properly unwrapped `ApiResponse` envelope (`data?.data ?? data`).

2. **Connect With Us Live API Submission (`ConnectWithUs.jsx`)**
   - **File Modified:** `frontend/src/components/home/ConnectWithUs.jsx`
   - **Why:** The component only managed local React state (`setSubmitted(true)`) and never dispatched an HTTP request to the backend.
   - **What was changed:** Integrated `apiClient.post('/api/leads', ...)`, submitting `name`, `email`, `mobile`, `lookingFor`, and `source: 'HOME_CONNECT_FORM'`, complete with loading spinner and error alerts.

3. **Environment Configuration & Git Security**
   - Created `frontend/.env` pointing to `VITE_API_BASE_URL=http://localhost:8080` with `VITE_USE_MOCKS=false`.
   - Created root `.env` with secure `JWT_SECRET`, database credentials, and Google Sheets configurations.
   - Added service account JSON key patterns (`*-credentials*.json`, `lesuccess-*.json`, `service-account*.json`) to `.gitignore` to prevent credential exposure.


---

## 3. Module-by-Module Integration Details

### 3.1 Courses
Provides the course catalog, dropdown menus, home page cards, and full course detail pages with modules.

#### Endpoints & Methods
- `GET /api/courses` (Public) — Lists all active courses ordered by `displayOrder ASC`.
- `GET /api/courses/{idOrSlug}` (Public) — Fetches course details by numeric ID or URL slug; returns course metadata and syllabus modules.
- `GET /api/courses/{idOrSlug}/modules` (Public) — Returns syllabus modules for the course.

#### Frontend Components & Services
- **Components:**
  - `Navbar.jsx` — Fetches courses for the navigation dropdown (`/courses/${course.slug}`).
  - `CourseCatalogPage.jsx` — Renders the complete course catalog.
  - `ChooseYourPath.jsx` (Home page) — Renders course cards.
  - `CourseDetailPage.jsx` — Full course page rendering Hero, Syllabus Accordion, and Enrollment card.
- **Hooks & Services:**
  - `useCourses.js` → calls `courseApi.getAll()`
  - `useCourseDetail.js` → calls `courseApi.getBySlug(slug)`

#### Data Flow
```text
[Browser / User] 
       │
       ▼ (Navigates to /courses/:slug or loads Catalog)
[CourseDetailPage.jsx / Navbar.jsx]
       │
       ▼ (Calls useCourseDetail / useCourses)
[courseApi.js] ──HTTP GET──► [CourseController (/api/courses, /api/courses/{idOrSlug})]
                                   │
                                   ▼
                              [CourseService]
                                   │
                                   ▼
                       [CourseRepository / CourseModuleRepository]
                                   │
                                   ▼
                       MySQL: `course` & `course_module` tables
```

#### Request & Response Example
- **Request:** `GET http://localhost:8080/api/courses/python-full-stack-development`
- **Response Structure:**
```json
{
  "success": true,
  "message": "Course retrieved successfully",
  "data": {
    "id": 1,
    "name": "Python : Full Stack Development",
    "title": "Python : Full Stack Development",
    "slug": "python-full-stack-development",
    "shortDescription": "Python Full Stack development course with Django, React, REST APIs, MySQL...",
    "durationMonths": 4,
    "durationValue": 4,
    "durationUnit": "months",
    "mode": "BOTH",
    "badge": "BEST_SELLER",
    "badgeText": "30% OFF",
    "badgeLabel": "30% OFF",
    "placementAssistance": true,
    "syllabusUrl": "/syllabus/python.pdf",
    "enrollUrl": "/courses/python-full-stack-development",
    "displayOrder": 1,
    "modules": [
      {
        "id": 1,
        "courseId": 1,
        "title": "Core Python Programming",
        "content": "Data types, control structures, functions, OOP...",
        "displayOrder": 1
      }
    ],
    "active": true
  }
}
```

---

### 3.2 Testimonials
Displays verified student reviews on the Course Detail Page corresponding to the specific course.

#### Endpoints & Methods
- `GET /api/courses/{idOrSlug}/testimonials` (Public) — Returns active testimonials for a course ordered by `displayOrder ASC`.

#### Frontend Components & Services
- **Components:**
  - `TestimonialCarousel.jsx` — Carousel displaying student testimonials, rating stars, reviewer name, and quote.
- **Hooks & Services:**
  - `useCourseTestimonials.js` (inside `CourseDetailPage.jsx`) → calls `testimonialApi.getByCourse(courseId)`.

#### Data Flow
```text
[CourseDetailPage.jsx]
       │ (passes course.id)
       ▼
[useCourseTestimonials.js]
       │
       ▼
[testimonialApi.js] ──HTTP GET──► [CourseController (/api/courses/{id}/testimonials)]
                                         │
                                         ▼
                                    [CourseService]
                                         │
                                         ▼
                               [TestimonialRepository]
                                         │
                                         ▼
                               MySQL: `testimonial` table
```

#### Request & Response Example
- **Request:** `GET http://localhost:8080/api/courses/1/testimonials`
- **Response Structure:**
```json
{
  "success": true,
  "message": "Testimonials retrieved successfully",
  "data": [
    {
      "id": 1,
      "courseId": 1,
      "studentName": "Priya S.",
      "reviewText": "The Python Full Stack program was thorough and practical...",
      "quoteText": "The Python Full Stack program was thorough and practical...",
      "rating": 5,
      "ratingValue": 5,
      "photoUrl": null,
      "displayOrder": 1,
      "active": true
    }
  ]
}
```

### 3.3 Leads
Captures prospective student enquiries from the Service Page CTA form, the Course Detail Page Enrollment form, and the Home Page Connect With Us form.

#### Endpoints & Methods
- `POST /api/leads` (Public, Rate-limited, Honeypot protected) — Creates a new lead in the `lead_capture` table and asynchronously queues a write to the `Leads` tab in Google Sheets.
- `GET /api/leads` (Admin / Manager) — Paginated, filterable lead listing.
- `PUT /api/leads/{id}/status` (Admin / Manager) — Advances lead status (`NEW` → `CONTACTED` → `CONVERTED` → `CLOSED`), automatically updating the corresponding row in Google Sheets.

#### Frontend Components & Services
- **Components:**
  - `LeadCaptureForm.jsx` (on `ServicePage.jsx`) — Collects name, email, and "looking for" option. Source: `SERVICE_CTA_FORM`.
  - `EnrollCourseForm.jsx` & `MobileEnrollBar.jsx` (on `CourseDetailPage.jsx`) — Collects name, mobile number, email, and course ID. Source: `COURSE_ENROLL_FORM`.
  - `ConnectWithUs.jsx` (on `HomePage.jsx`) — Collects name, mobile, email, and "looking for" interest. Source: `HOME_CONNECT_FORM`.
- **Hooks & Services:**
  - `useLeadSubmit.js` → calls `leadApi.submit(payload)`.
  - `ConnectWithUs.jsx` → direct `apiClient.post('/api/leads', payload)`.

#### Data Flow
```text
[LeadCaptureForm / EnrollCourseForm / ConnectWithUs]
       │
       ▼
[leadApi.js / apiClient.js] ──HTTP POST (JSON)──► [LeadController (/api/leads)]
                                                         │
                                                         ▼
                                                   [LeadService]
                                                   - Validates source against accepted-sources
                                                   - Validates mobile required for COURSE_ENROLL_FORM
                                                   - Checks honeypot & duplicate detection window
                                                   - Persists to MySQL repository
                                                         │
                                  ┌──────────────────────┴──────────────────────┐
                                  ▼                                             ▼
                     MySQL: `lead_capture` table            [LeadCreatedEvent] (AFTER_COMMIT)
                                                                                │
                                                                                ▼
                                                                   [LeadSheetsSyncListener]
                                                                                │
                                                                                ▼
                                                                     [GoogleSheetsService]
                                                                                │
                                                                                ▼
                                                                   Google Sheets: `Leads` tab
```

#### Request & Response Example
- **Request:**
```http
POST /api/leads HTTP/1.1
Content-Type: application/json

{
  "name": "Arun Kumar",
  "mobile": "9876543220",
  "email": "arun@example.com",
  "courseId": 1,
  "source": "COURSE_ENROLL_FORM"
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Thank you! Our team will get in touch with you shortly.",
  "data": {
    "id": 2,
    "name": "Arun Kumar",
    "mobile": "9876543220",
    "email": "arun@example.com",
    "courseId": 1,
    "source": "COURSE_ENROLL_FORM",
    "status": "NEW",
    "createdAt": "2026-09-05T21:01:51.3265286"
  }
}
```

### 3.4 Demo Booking
Captures free demo class booking requests from the Home page.

#### Endpoints & Methods
- `POST /api/demo-bookings` (Public) — Validates mobile number and persists demo request to MySQL and synchronizes to Google Sheets.
- `GET /api/admin/demo-bookings` (Admin / Manager) — Paginated booking list.
- `PATCH /api/admin/demo-bookings/{id}/status` (Admin / Manager) — Updates status (`PENDING` → `CONTACTED` → `ENROLLED`) and reflects in Google Sheets.

#### Frontend Components & Services
- **Components:**
  - `DemoClass.jsx` (Home page) — Allows users to select a course and submit their Indian phone number (+91 or 10 digits).
- **Service:**
  - Direct Axios call via `apiClient.post('/api/demo-bookings', { mobileNumber, courseName })`.

#### Data Flow
```text
[DemoClass.jsx]
       │
       ▼
[apiClient.js] ──HTTP POST──► [DemoBookingController (/api/demo-bookings)]
                                     │
                                     ▼
                                [DemoBookingService]
                                     │
                  ┌──────────────────┴──────────────────┐
                  ▼                                     ▼
     MySQL: `demo_booking` table       [DemoBookingCreatedEvent] (AFTER_COMMIT)
                                                        │
                                                        ▼
                                       [DemoBookingSheetsSyncListener]
                                                        │
                                                        ▼
                                             [GoogleSheetsService]
                                                        │
                                                        ▼
                                          Google Sheets: `Demo Bookings` tab
```

#### Request & Response Example
- **Request:**
```http
POST /api/demo-bookings HTTP/1.1
Content-Type: application/json

{
  "mobileNumber": "9876543210",
  "courseName": "Full Stack Java"
}
```
- **Response:** `201 Created`
```json
{
  "success": true,
  "message": "Demo booking submitted successfully",
  "data": {
    "id": 3,
    "courseName": "Full Stack Java",
    "mobileNumber": "9876543210",
    "status": "PENDING",
    "createdAt": "2026-09-05T20:39:27.3974292"
  }
}
```

---

### 3.5 Upcoming Programs
Displays upcoming live technical webinars and campus internship programs.

#### Endpoints & Methods
- `GET /api/upcoming-programs` (Public) — Returns active upcoming programs with `eventDate >= TODAY` ordered chronologically. Supports optional `?type=WEBINAR` or `?type=INTERNSHIP`.
- `POST /api/upcoming-programs/{id}/register` (Public) — Registers student name and mobile number for a program.

#### Frontend Components & Services
- **Components:**
  - `UpcomingPrograms.jsx` (Home page) — Tabbed carousel for "Webinar" and "Internship".
- **Hooks & Services:**
  - `upcomingProgramApi.js` → calls `listUpcoming(type)`.

#### Data Flow
```text
[UpcomingPrograms.jsx]
       │
       ▼
[upcomingProgramApi.js] ──HTTP GET──► [UpcomingProgramController (/api/upcoming-programs)]
                                             │
                                             ▼
                                     [UpcomingProgramService]
                                             │
                                             ▼
                                    [UpcomingProgramRepository]
                                             │
                                             ▼
                                   MySQL: `program` table
```

#### Request & Response Example
- **Request:** `GET http://localhost:8080/api/upcoming-programs`
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Upcoming programs retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "WEBINAR",
      "label": "Free Webinar",
      "title": "Full Stack Career Roadmap 2026",
      "topic": "Industry trends, portfolio building, and cracking developer interviews in 2026.",
      "eventDate": "2026-09-12",
      "startTime": "17:00:00",
      "endTime": "18:30:00",
      "platform": "Google Meet",
      "meetLink": "https://meet.google.com/les-webinar",
      "certificateIncluded": true,
      "registrationCount": 0,
      "active": true
    }
  ]
}
```

---

### 3.6 Site Settings
Manages global configuration keys including Google rating statistics, contact details, social links, and promotional offer banners.

#### Endpoints & Methods
- `GET /api/settings` (Public, Cached 5 mins) — Returns flat key/value dictionary of active site settings.
- `PUT /api/settings` (Admin / Manager) — Partial batch update of site settings.

#### Frontend Components & Services
- **Components:**
  - `CourseDetailPage.jsx` — Uses `settings.google_rating` and `settings.google_review_count` for the testimonial header.
  - `OfferHeader.jsx` — Reads promotional offer banner text.
- **Hooks & Services:**
  - `useSiteSettings.js` → calls `settingsApi.getAll()`.

#### Data Flow
```text
[CourseDetailPage.jsx / OfferHeader.jsx]
       │
       ▼
[useSiteSettings.js]
       │
       ▼
[settingsApi.js] ──HTTP GET──► [SiteSettingController (/api/settings)]
                                      │
                                      ▼
                                [SiteSettingService]
                                      │
                                      ▼
                               [SiteSettingRepository]
                                      │
                                      ▼
                             MySQL: `site_setting` table
```

#### Request & Response Example
- **Request:** `GET http://localhost:8080/api/settings`
- **Response:** `200 OK`
```json
{
  "success": true,
  "message": "Settings retrieved successfully",
  "data": {
    "google_rating": "4.6",
    "google_review_count": "250",
    "promo_banner_active": "true",
    "promo_banner_text": "Data Analytics Course - 30% Offer 10Days Only - Limited Seats!",
    "email_primary": "",
    "phone_primary": ""
  }
}
```

---

## 4. Google Sheets Integration & Live Auto-Sync

The application includes an event-driven, non-blocking Google Sheets synchronization system that automatically logs all public enquiries, demo class bookings, and course enrollments directly to a linked Google Sheet document.

### 4.1 Architecture & Design

```text
[Frontend Form Submit]
       │
       ▼
[REST Controller]
       │
       ▼
[Service Layer] ──► Persists to MySQL in Database Transaction (@Transactional)
       │
       ▼ (Publishes Spring ApplicationEvent, e.g. DemoBookingCreatedEvent)
[Spring Event Publisher]
       │
       ▼ (Triggers @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT))
[Sheets Sync Listener] ──► Submits task to SheetsSyncDispatcher
                                  │
                                  ▼ (Executed on Virtual Thread Pool Executor)
                           [GoogleSheetsService]
                                  │
                                  ▼ (Google Sheets API v4 append)
                           [Google Spreadsheet]
```

#### Key Reliability & Performance Features
1. **Guaranteed Consistency (`AFTER_COMMIT`)**: Google Sheets writes are only dispatched after the database transaction successfully commits. If the MySQL transaction rolls back, nothing is written to the sheet.
2. **Non-Blocking Virtual Threads**: Sheets API network I/O executes asynchronously on virtual threads (`SheetsAsyncConfig`), ensuring user responses return within milliseconds without waiting for Google's API.
3. **Automatic Sheet & Header Provisioning**: `SheetsHeaderInitialiser` runs on application startup. It inspects all registered `SheetRowSource` components, creates missing tabs via the Google Sheets API if they do not already exist, appends bold headers, and configures column visibility (e.g. hiding internal columns).
4. **Retry & Failure Recovery**: Failed sheet writes are caught and saved to the `sync_failure` database table. A scheduled background worker (`SyncRetryScheduler`) retries failed records periodically with backoff.

---

### 4.2 Spreadsheet Layout & Tab Specifications

Spreadsheet: `https://docs.google.com/spreadsheets/d/1Cu0m1eIfJXKFiY-1TPPP5E3myawKgcqa-GjKw6GWtfU/edit`

#### Tab 1: `Leads`
Collects all leads from Course Enrollment, Homepage Connect With Us, and Service CTA forms.
- **Spec:** Range `A:I`, Row Source: `LeadSheetRowSource`
- **Columns:**
  - `A: ID` — Auto-increment database primary key
  - `B: Created At` — Timestamp (`yyyy-MM-dd HH:mm:ss`)
  - `C: Name` — Student / Enquirer full name
  - `D: Mobile` — Phone number (hidden by default in UI for clean presentation)
  - `E: Email` — Email address
  - `F: Course ID` — Course ID (populated for `COURSE_ENROLL_FORM`)
  - `G: Looking For` — Course interest or inquiry subject
  - `H: Source` — Originating form (`COURSE_ENROLL_FORM`, `HOME_CONNECT_FORM`, or `SERVICE_CTA_FORM`)
  - `I: Status` — Lead status (`NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`)

#### Tab 2: `Demo Bookings`
Collects free demo class requests from the Homepage Demo Class section.
- **Spec:** Range `A:E`, Row Source: `DemoBookingSheetRowSource`
- **Columns:**
  - `A: ID` — Auto-increment database primary key
  - `B: Created At` — Timestamp (`yyyy-MM-dd HH:mm:ss`)
  - `C: Course Name` — Selected course name (e.g., `Full Stack Java`, `Data Science`)
  - `D: Mobile Number` — Verified 10-digit Indian mobile number
  - `E: Status` — Booking status (`PENDING`, `CONTACTED`, `ENROLLED`)

#### Tab 3: `Contact Messages`
Collects general inquiries from the Contact Us page.
- **Spec:** Range `A:G`, Row Source: `ContactMessageSheetRowSource`
- **Columns:**
  - `A: ID` — Auto-increment database primary key
  - `B: Created At` — Timestamp (`yyyy-MM-dd HH:mm:ss`)
  - `C: Full Name` — Sender's full name
  - `D: Email` — Sender's email address
  - `E: Phone Number` — Sender's contact number
  - `F: Subject` — Message subject
  - `G: Status` — Inquiry status (`NEW`, `READ`, `REPLIED`, `ARCHIVED`)

---

### 4.3 Google Service Account Configuration

To allow the backend to sync data to the Google Sheet:
1. **Service Account Client Email**:
   `lesuccess-sheets-sync@lesuccess-portal-507808.iam.gserviceaccount.com`
2. **Sheet Sharing**:
   Share the target Google Sheet (`1Cu0m1eIfJXKFiY-1TPPP5E3myawKgcqa-GjKw6GWtfU`) with the service account email above with **Editor** access.
3. **Environment Setup** (in root `.env`):
   ```env
   LESUCCESS_SHEETS_ENABLED=true
   SHEETS_SPREADSHEET_ID=1Cu0m1eIfJXKFiY-1TPPP5E3myawKgcqa-GjKw6GWtfU
   SHEETS_CREDENTIALS_PATH=C:\Users\mouli\OneDrive\Desktop\Le Landing web\lesuccess-academy-portal\lesuccess-portal-507808-ae617d22c951.json
   ```

---

## 5. Database Architecture & Schema

The application uses **MySQL 8.0+** managed strictly through **Flyway** schema migrations.

### Schema Relationship Diagram
```text
┌───────────────────────┐
│        course         │
├───────────────────────┤
│ id (PK)               │◄───┐
│ name                  │    │
│ short_description     │    │
│ duration_months       │    │
│ mode                  │    │
│ badge, badge_text     │    │
│ is_active             │    │
└───────────────────────┘    │
         ▲                   │ (1-to-Many CASCADE)
         │                   │
┌────────┴──────────────┐   ┌┴───────────────────────┐
│     course_module     │   │      testimonial       │
├───────────────────────┤   ├────────────────────────┤
│ id (PK)               │   │ id (PK)                │
│ course_id (FK)        │   │ course_id (FK)         │
│ title                 │   │ student_name           │
│ content (TEXT)        │   │ review_text            │
│ display_order         │   │ rating (INT)           │
└───────────────────────┘   └────────────────────────┘

┌───────────────────────┐   ┌────────────────────────┐
│     lead_capture      │   │      demo_booking      │
├───────────────────────┤   ├────────────────────────┤
│ id (PK)               │   │ id (PK)                │
│ name                  │   │ course_name            │
│ mobile (nullable)     │   │ mobile_number          │
│ email                 │   │ status (PENDING..)     │
│ course_id (reference) │   │ created_at             │
│ source (discriminator)│   │ deleted_at             │
│ status (NEW..)        │   └────────────────────────┘
│ created_at            │
└───────────────────────┘

┌───────────────────────┐   ┌────────────────────────┐
│        program        │   │      site_setting      │
├───────────────────────┤   ├────────────────────────┤
│ id (PK)               │   │ setting_key (PK)       │
│ type (WEBINAR/INTERN) │   │ setting_value (TEXT)   │
│ title, topic          │   │ updated_at             │
│ event_date, start/end │   └────────────────────────┘
│ is_active             │
└───────────────────────┘
```

### Table Definitions

1. **`course`** (Created in `V4`, Seeded in `V21`)
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(120) NOT NULL
   - `short_description`: TEXT
   - `duration_months`: INT
   - `mode`: VARCHAR(20) NOT NULL (`OFFLINE`, `ONLINE`, `BOTH`)
   - `badge`: VARCHAR(20) (`OFFER`, `BEST_SELLER`, `HIGH_DEMAND`)
   - `badge_text`: VARCHAR(50)
   - `placement_assistance`: TINYINT(1) DEFAULT 0
   - `is_active`: TINYINT(1) DEFAULT 1
   - `display_order`: INT DEFAULT 0
   - `deleted_at`: DATETIME NULL (Soft delete with Hibernate `@SQLRestriction`)

2. **`course_module`** (Created in `V14`, Seeded in `V21`)
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `course_id`: BIGINT NOT NULL (Foreign key to `course.id` ON DELETE CASCADE)
   - `title`: VARCHAR(200) NOT NULL
   - `content`: TEXT NULL
   - `display_order`: INT NOT NULL DEFAULT 0

3. **`testimonial`** (Created in `V15`, Modified in `V19`, Seeded in `V21`)
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `course_id`: BIGINT NOT NULL (Foreign key to `course.id` ON DELETE CASCADE)
   - `student_name`: VARCHAR(120) NOT NULL
   - `review_text`: TEXT NOT NULL
   - `rating`: INT NOT NULL DEFAULT 5 (Widened in V19 from TINYINT)
   - `photo_url`: VARCHAR(255) NULL
   - `is_active`: TINYINT(1) DEFAULT 1
   - `deleted_at`: DATETIME NULL (Soft delete)

4. **`lead_capture`** (Created in `V11`, Modified in `V20`)
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `name`: VARCHAR(120) NOT NULL
   - `mobile`: VARCHAR(20) NULL (Nullable in V20 for general/service leads)
   - `email`: VARCHAR(160) NULL
   - `course_id`: BIGINT NULL (Reference without FK so leads persist even if course is archived)
   - `looking_for`: VARCHAR(120) NULL
   - `source`: VARCHAR(30) NOT NULL (`SERVICE_CTA_FORM`, `COURSE_ENROLL_FORM`, etc.)
   - `status`: VARCHAR(20) NOT NULL DEFAULT 'NEW' (`NEW`, `CONTACTED`, `CONVERTED`, `CLOSED`)
   - `created_at`: DATETIME NOT NULL

5. **`demo_booking`** (Created in `V5`, Modified in `V16`-`V18`)
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `course_name`: VARCHAR(200) NULL
   - `mobile_number`: VARCHAR(20) NOT NULL
   - `status`: VARCHAR(20) NOT NULL DEFAULT 'PENDING' (`PENDING`, `CONTACTED`, `ENROLLED`)
   - `created_at`: DATETIME NOT NULL
   - `deleted_at`: DATETIME NULL

6. **`program`** (Created in `V6`, Seeded in `V21`)
   - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
   - `type`: VARCHAR(20) NOT NULL (`WEBINAR`, `INTERNSHIP`)
   - `label`: VARCHAR(50) NULL
   - `title`: VARCHAR(120) NOT NULL
   - `topic`: VARCHAR(255) NULL
   - `event_date`: DATE NOT NULL
   - `start_time`: TIME NULL, `end_time`: TIME NULL
   - `platform`: VARCHAR(50) NULL, `meet_link`: VARCHAR(255) NULL
   - `certificate_included`: TINYINT(1) DEFAULT 0
   - `is_active`: TINYINT(1) DEFAULT 1

7. **`site_setting`** (Created and seeded in `V10`)
   - `setting_key`: VARCHAR(80) NOT NULL PRIMARY KEY
   - `setting_value`: TEXT NOT NULL
   - `updated_at`: DATETIME NOT NULL

---

## 6. File-Level Architecture Mapping

```text
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                  (Dropdown powered by useCourses)
│   │   │   ├── carousel/
│   │   │   │   └── TestimonialCarousel.jsx (Testimonial cards & star ratings)
│   │   │   ├── forms/
│   │   │   │   ├── EnrollCourseForm.jsx    (Course detail enroll form -> leadApi -> Google Sheets: Leads)
│   │   │   │   ├── LeadCaptureForm.jsx     (Service page form -> leadApi -> Google Sheets: Leads)
│   │   │   │   └── MobileEnrollBar.jsx     (Sticky mobile enroll bar)
│   │   │   └── home/
│   │   │       ├── ChooseYourPath.jsx      (Course grid powered by useCourses)
│   │   │       ├── ConnectWithUs.jsx       (Connect form -> leadApi -> Google Sheets: Leads)
│   │   │       ├── DemoClass.jsx           (Demo booking form -> /api/demo-bookings -> Google Sheets: Demo Bookings)
│   │   │       └── UpcomingPrograms.jsx    (Webinar & internship list -> upcomingProgramApi)
│   │   ├── hooks/
│   │   │   ├── useCourses.js               (Shared course list fetcher)
│   │   │   ├── useCourseDetail.js          (Course detail by slug fetcher)
│   │   │   ├── useCourseTestimonials.js    (Course testimonials fetcher)
│   │   │   ├── useLeadSubmit.js            (Lead submission lifecycle & error mapper)
│   │   │   └── useSiteSettings.js          (Global settings fetcher)
│   │   ├── pages/
│   │   │   ├── Courses/
│   │   │   │   └── CourseCatalogPage.jsx   (Full course catalog)
│   │   │   ├── CourseDetail/[slug]/
│   │   │   │   └── CourseDetailPage.jsx   (Detailed syllabus & enrollment)
│   │   │   └── Services/
│   │   │       └── ServicePage.jsx         (Service enquiry form)
│   │   └── services/
│   │       ├── apiClient.js                (Axios instance with error interceptors)
│   │       ├── courseApi.js                (GET /api/courses, GET /api/courses/{slug})
│   │       ├── leadApi.js                  (POST /api/leads)
│   │       ├── settingsApi.js              (GET /api/settings)
│   │       ├── testimonialApi.js           (GET /api/courses/{id}/testimonials)
│   │       └── upcomingProgramApi.js       (GET /api/upcoming-programs)
│   └── .env                                (Frontend env: VITE_API_BASE_URL, VITE_USE_MOCKS)
│
├── backend/
│   ├── src/main/java/in/lesuccess/portal/
│   │   ├── course/
│   │   │   ├── Course.java                 (JPA Entity)
│   │   │   ├── CourseModule.java           (JPA Entity for syllabus)
│   │   │   ├── CourseController.java       (Endpoints: /api/courses/**)
│   │   │   ├── CourseService.java          (Business logic, slug lookup, module mapping)
│   │   │   ├── CourseRepository.java       (Spring Data JPA repository)
│   │   │   ├── CourseResponse.java         (DTO with slug, aliases, and modules)
│   │   │   ├── Testimonial.java            (JPA Entity)
│   │   │   ├── TestimonialRepository.java  (Spring Data JPA repository)
│   │   │   └── TestimonialResponse.java    (DTO with quoteText & ratingValue aliases)
│   │   ├── demobooking/
│   │   │   ├── DemoBooking.java            (JPA Entity)
│   │   │   ├── DemoBookingController.java  (Endpoints: /api/demo-bookings/**)
│   │   │   ├── DemoBookingService.java     (Demo booking validation & persistence)
│   │   │   ├── DemoBookingRepository.java  (Spring Data JPA repository)
│   │   │   ├── DemoBookingCreatedEvent.java(Spring domain event for creation)
│   │   │   ├── DemoBookingSheetRowSource.java(Row format for "Demo Bookings" tab)
│   │   │   └── DemoBookingSheetsSyncListener.java(Asynchronous AFTER_COMMIT Sheets sync)
│   │   ├── lead/
│   │   │   ├── Lead.java                   (JPA Entity -> lead_capture table)
│   │   │   ├── LeadController.java         (Endpoints: /api/leads/**)
│   │   │   ├── LeadService.java            (Honeypot, duplicate checks, source validation)
│   │   │   ├── LeadRequest.java            (Validation & Indian mobile number regex)
│   │   │   ├── LeadRepository.java         (Spring Data JPA repository)
│   │   │   ├── LeadSheetRowSource.java     (Row format for "Leads" tab)
│   │   │   └── LeadSheetsSyncListener.java (Asynchronous AFTER_COMMIT Sheets sync)
│   │   ├── shared/sheets/
│   │   │   ├── GoogleSheetsService.java    (Direct Google Sheets v4 API client)
│   │   │   ├── SheetsHeaderInitialiser.java(Auto tab & header creator on startup)
│   │   │   ├── SheetsSyncDispatcher.java   (Virtual thread pool dispatcher)
│   │   │   └── SyncRetryScheduler.java     (Periodic retry for failed syncs)
│   │   ├── sitesetting/
│   │   │   ├── SiteSetting.java            (JPA Entity -> site_setting table)
│   │   │   ├── SiteSettingController.java  (Endpoints: /api/settings/**)
│   │   │   └── SiteSettingService.java     (Dictionary caching & validation)
│   │   └── upcomingprogram/
│   │       ├── UpcomingProgram.java        (JPA Entity -> program table)
│   │       ├── UpcomingProgramController.java (Endpoints: /api/upcoming-programs/**)
│   │       └── UpcomingProgramService.java (Chronological filtering logic)
│   └── src/main/resources/
│       ├── application.yml                 (Main Spring configuration & accepted sources)
│       ├── application-dev.yml             (Local MySQL & debug logging profile)
│       └── db/migration/
│           ├── V1__create_contact_message.sql
│           ├── ...
│           ├── V20__lead_capture_mobile_nullable.sql
│           └── V21__seed_initial_data.sql  (Canonical course, module, testimonial seed)
└── .env                                    (Root backend environment variables)
```

---

## 7. Environment Variables & Configuration

### Root `.env` (Backend Configuration)
The backend loads configuration from system environment variables or the root `.env`:

| Variable | Description | Default / Example Value |
|---|---|---|
| `JWT_SECRET` | 256+ bit secret used for signing and verifying JWT tokens. | *(Auto-generated base64 secret)* |
| `DB_USERNAME` | MySQL database username. | `root` |
| `DB_PASSWORD` | MySQL database password. | `root` |
| `LESUCCESS_SHEETS_ENABLED` | Enables background sync of submissions to Google Sheets (`true`/`false`). | `true` |
| `SHEETS_SPREADSHEET_ID` | Google Sheets target document ID. | `1Cu0m1eIfJXKFiY-1TPPP5E3myawKgcqa-GjKw6GWtfU` |
| `SHEETS_CREDENTIALS_BASE64`| Base64-encoded Google Service Account JSON key (Production). | *(Optional)* |
| `SHEETS_CREDENTIALS_PATH`  | Absolute path to service account key file for local dev. | `C:\Users\...\service-account.json` |

### Frontend `.env` (`frontend/.env`)
| Variable | Description | Value |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the Spring Boot API (no trailing slash). | `http://localhost:8080` |
| `VITE_USE_MOCKS` | When `true`, uses in-memory mock data; when `false`, connects to live backend. | `false` |

---

## 8. How to Run the Project

### Prerequisites
- **Java**: JDK 21+
- **Node.js**: v18+ (Node 20+ recommended) and npm
- **Database**: MySQL Server 8.0+ running on port `3306`

---

### Step 1: Start MySQL Database
Ensure your local MySQL service is active and the database user credentials match your `.env`:
```sql
-- The backend application-dev.yml automatically creates 'lesuccess_dev' if it does not exist:
-- createDatabaseIfNotExist=true
```

---

### Step 2: Start the Backend (Spring Boot)
1. Using the provided PowerShell startup script (recommended — automatically exports `.env` to the process environment):
   ```powershell
   .\scripts\run-dev.ps1
   ```
2. Or navigate to `backend/` and run Maven wrapper directly:
   ```powershell
   cd backend
   .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
   ```
   *(Or using `--%` in PowerShell: `.\mvnw.cmd --% spring-boot:run -Dspring-boot.run.profiles=dev`)*
3. The backend will start on **port 8080**:
   - Health check / API: `http://localhost:8080/api/courses`
   - Swagger Documentation: `http://localhost:8080/swagger-ui.html`
   - Automatically initializes `Leads`, `Demo Bookings`, and `Contact Messages` tabs in Google Sheets.

---

### Step 3: Start the Frontend (React + Vite)
1. In a separate terminal, navigate to the `frontend` folder:
   ```powershell
   cd frontend
   ```
2. Install npm dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. The frontend will start on **port 5173**:
   - Access the portal in your browser: `http://localhost:5173`

---

## 9. Verification & Test Results

### Automated Test Suite
The complete backend Maven test suite passes with **0 failures and 0 errors**:
```powershell
cd backend
.\mvnw.cmd test
```
**Test Results:**
- **Tests run:** 152
- **Failures:** 0
- **Errors:** 0
- **Skipped:** 16 *(Testcontainers MySQL tests gracefully skipped in absence of Docker)*
- **Result:** `BUILD SUCCESS`

### Frontend Linter and Production Build
```powershell
cd frontend
npm run lint
npm run build
```
- **Lint:** `eslint .` completed with **0 errors and 0 warnings**.
- **Build:** `vite build` completed successfully generating optimized production bundles in `dist/`.

### Live Integration & Google Sheets Sync Verification Matrix
All endpoints and automated Google Sheet sync actions were verified live against MySQL and Google Sheets:

| Module / Action | Trigger / Endpoint | Backend / Database Result | Google Sheets Tab & Logged Data | Status |
|---|---|---|---|---|
| **Demo Class Booking** | `POST /api/demo-bookings`<br>`{ courseName: "Full Stack Java", mobileNumber: "9876543210" }` | Saved to `demo_booking` table (`id: 5`, `status: PENDING`) | Appended to `Demo Bookings` tab:<br>`[5, "2026-09-06 14:15:37", "Full Stack Java", "9876543210", "PENDING"]` | **Verified Live** |
| **Connect With Us** | `POST /api/leads`<br>`{ source: "HOME_CONNECT_FORM", name: "Connect Test User", mobile: "9876543211", email: "connect@example.com", lookingFor: "Course Inquiry" }` | Saved to `lead_capture` table (`id: 3`, `status: NEW`) | Appended to `Leads` tab:<br>`[3, "2026-09-06 14:15:59", "Connect Test User", "9876543211", "connect@example.com", "", "Course Inquiry", "HOME_CONNECT_FORM", "NEW"]` | **Verified Live** |
| **Course Enrollment** | `POST /api/leads`<br>`{ source: "COURSE_ENROLL_FORM", name: "Enroll Test User", mobile: "9876543212", email: "enroll@example.com", courseId: 1, lookingFor: "Data Science & AI" }` | Saved to `lead_capture` table (`id: 4`, `status: NEW`) | Appended to `Leads` tab:<br>`[4, "2026-09-06 14:16:08", "Enroll Test User", "9876543212", "enroll@example.com", 1, "Data Science & AI", "COURSE_ENROLL_FORM", "NEW"]` | **Verified Live** |
| **Course Catalog** | `GET /api/courses` | 4 seeded courses from `course` table | — | **Verified Live** |
| **Course Detail & Modules** | `GET /api/courses/python-full-stack-development` | Metadata & 6 modules from `course` & `course_module` | — | **Verified Live** |
| **Course Testimonials** | `GET /api/courses/1/testimonials` | Reviews with `quoteText` & `ratingValue` from `testimonial` | — | **Verified Live** |
| **Upcoming Programs** | `GET /api/upcoming-programs` | Active webinars & internships from `program` table | — | **Verified Live** |
| **Site Settings** | `GET /api/settings` | Review rating `4.6` and review count `250` from `site_setting` | — | **Verified Live** |

