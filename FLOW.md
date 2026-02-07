# Param Tuitions - System Flow Documentation

## 1. User Roles & Permissions
*   **Visitor:** Can view Home, About, Blog, Contact, and search for tutors. Can post inquiries.
*   **Parent:** Can manage inquiries, view allotted teachers, verify teacher identity, pay fees, and track attendance.
*   **Teacher:** Can view jobs, apply, manage active tuitions, mark attendance, and upload verification details.
*   **Institute:** Can request bulk teachers (simplified flow).
*   **Admin (Branch):** Manages a specific zone (e.g., "Admin 1"). Handles leads, demos, and teachers in that zone.
*   **Super Admin:** Global access. Manages master data, settings, content, and all zones.

## 2. Core Workflows

### A. Teacher Onboarding
1.  **Registration:** Teacher signs up via `/teacher-register` (Email/Phone).
2.  **Profile Completion:**
    *   Logs into `TeacherDashboard`.
    *   **Step 1:** Fills Profile Details (Education, Experience).
    *   **Step 2:** Uploads Documents (ID, Degree).
    *   **Step 3:** Signs Agreement.
3.  **Verification:**
    *   Profile shows "Pending Approval".
    *   **Admin Action:** Admin reviews details in `VerifyTeachers` page and clicks "Verify".
    *   **Selfie:** Teacher uploads a selfie in Dashboard for ID Card generation.
4.  **Active Status:** Once verified, Teacher can apply for jobs.

### B. Parent Inquiry & Tuition Creation
1.  **Inquiry:**
    *   Parent posts inquiry via Home Page form or `/post-inquiry`.
    *   Data saved to `leads` table with status `pending_call`.
2.  **Lead Processing (Admin):**
    *   Admin sees lead in "New Leads" tab.
    *   Admin calls parent to verify requirements.
    *   Admin clicks "Process Lead" -> "Post Official Tuition".
    *   **Result:** A `tuition` record is created (Status: `open`), and a Tuition Number (TN) is assigned.

### C. Matching & Booking (The Tuition Cycle)
1.  **Application:**
    *   Verified Teachers view `open` tuitions on `TeacherJobBoard`.
    *   Teacher clicks "Apply". Record added to `applications` table.
2.  **Selection (Admin):**
    *   Admin views applicants in "Inquiry & Booking" tab.
    *   Admin selects a teacher and clicks **"Book Teacher"**.
    *   **Status Update:** Tuition & Application status -> `demo_allotted`.
3.  **Demo Scheduling:**
    *   Admin coordinates with Parent/Teacher.
    *   Admin clicks "Schedule Demo" in Dashboard.
    *   **Status Update:** Status -> `DEMO_SCHEDULED`.
    *   Entry added to `demos` table (visible in Demo Manager).
4.  **The Demo Class:**
    *   **Teacher:** Sees "DEMO ALLOTTED" in Dashboard.
    *   **Start:** Teacher clicks **"Start Tuition"** upon arrival. (Status -> `demo_started`, GPS/Time logged).
    *   **Parent:** Receives notification/sees status change.
    *   **Completion:** Teacher/Admin clicks "Mark Demo Completed". (Status -> `DEMO_COMPLETED`).
5.  **Confirmation:**
    *   Parent provides feedback.
    *   Admin/Parent clicks **"Confirm Tuition"**.
    *   **Status Update:** Status -> `confirmed`.
    *   **Ledger:** Bureau commission is calculated (if triggers are set).

### D. Active Tuition Management
1.  **Teacher:**
    *   Tuition moves to "Active Control Rooms".
    *   Teacher clicks "Progress Log" to access `TuitionControlRoom`.
    *   **Attendance:** Teacher marks "Present" daily (Geo-fenced if configured).
2.  **Parent:**
    *   Tuition visible in "My Tuitions".
    *   Can view "Progress Feed" (Attendance logs).
    *   **Payments:** Parent clicks "Pay Fees" -> Scans QR -> Uploads Screenshot.

## 3. Dashboard Specifics

### Super Admin Dashboard
*   **Overview:** Global stats, Financial Ledger (Revenue/Profit).
*   **Master Data:** Manage Locations and Admin Zones.
*   **System Settings:** Configure UPI ID, QR Code, Admin Phone Numbers.
*   **Content Management:** Edit Blogs, Gallery, FAQs, Terms & Conditions.
*   **Security:** View GPS Bypass alerts, Suspicious Cancellations.
*   **Blacklist:** Block teachers/parents.

### Admin Dashboard (Scoped)
*   **Leads:** Manage raw inquiries for assigned Zone.
*   **Matching Centre:** Filter teachers by radius/subject for a tuition.
*   **Demo Manager:** Calendar view of upcoming demos.
*   **My Teachers/Parents:** User directory for the zone.

### Teacher Dashboard
*   **Job Board:** Browse/Apply for tuitions.
*   **My Applications:** Track status of applied jobs.
*   **Availability:** Set teaching hours.
*   **ID Card:** Digital ID for verification.
*   **Selfie Booth:** For identity verification.

### Parent Dashboard
*   **My Tuitions:** Status of current requests.
*   **Payment History:** View past transactions.
*   **Guidelines:** Bureau rules (Do's and Don'ts).
*   **Identity Check:** Scan Teacher's QR code to verify identity.

## 4. Database Status Codes
*   **Leads:** `pending_call`, `converted`, `archived`.
*   **Tuitions:** `open`, `demo_allotted`, `DEMO_SCHEDULED`, `DEMO_POSTPONED`, `demo_started`, `DEMO_COMPLETED`, `confirmed`, `cancelled`.
*   **Applications:** `applied`, `demo_allotted`, `DEMO_SCHEDULED`, `demo_started`, `DEMO_COMPLETED`, `confirmed`, `rejected`.
*   **Teacher Details:** `is_verified` (bool), `setup_completed` (bool).