# Param Tuitions - System Architecture & Flows

## 1. Authentication Flow
**Entry Point:** `/login` (`src/pages/Login.js`)

1.  **User Action:** User enters credentials or uses Google Login.
2.  **Supabase Auth:** `supabase.auth.signInWithPassword` or `signInWithOAuth`.
3.  **Profile Handling:**
    *   The system checks the `profiles` table for the user's ID.
    *   **Role Assignment:**
        *   If a specific role is selected (e.g., "Teacher") and the user was previously a "Parent", the system attempts to upgrade the role in the `profiles` table.
        *   If no profile exists (first-time login), a new profile is upserted.
4.  **Redirection:**
    *   User is navigated to `/dashboard`.
    *   **`LoginRedirect.js` Component:** Intercepts `/dashboard`.
        *   Fetches the user's role from Supabase.
        *   **Self-Healing:** If the profile is missing (race condition), it retries or creates a fallback profile.
        *   **Routing:**
            *   `super_admin` -> `/super-admin/dashboard`
            *   `admin` -> `/admin/dashboard`
            *   `teacher` -> `/teacher/dashboard`
            *   `parent` -> `/parent/dashboard`
            *   `institute` -> `/institute-dashboard`

## 2. Tuition Lifecycle Flow

### Phase 1: Inquiry & Lead Generation
*   **Source:** Parents submit inquiries via `PostInquiry.js` or the Home Page form.
*   **Data:** Stored in `leads` table (Status: `pending_call`).
*   **Admin Action:**
    *   Admin views leads in `AdminDashboard` -> "New Leads".
    *   **Conversion:** Admin verifies details and clicks "Process Lead".
    *   **Result:** A new record is created in the `tuitions` table (Status: `open`), and the lead is marked `converted`.

### Phase 2: Matching & Application
*   **Teacher View:** Teachers browse `open` tuitions on `TeacherJobBoard.js`.
*   **Action:** Teacher clicks "Apply".
*   **Data:** Record created in `applications` table (Status: `applied`).

### Phase 3: Booking & Demo
*   **Admin Action:**
    *   In `AdminDashboard` -> "Inquiry & Booking", Admin reviews applicants.
    *   **Booking:** Admin clicks "Book Teacher".
    *   **Updates:** `tuitions` and `applications` status -> `demo_allotted`.
*   **Demo Scheduling:**
    *   Admin schedules a demo (Date/Time).
    *   **Data:** Record created in `demos` table (Status: `DEMO_SCHEDULED`).
*   **Demo Execution:**
    *   Teacher starts demo via Dashboard or `TeacherDemoPortal` (GPS Check-in).
    *   Status updates to `demo_started` -> `DEMO_COMPLETED`.

### Phase 4: Confirmation
*   **Action:** Parent or Admin confirms the tuition.
*   **Updates:** `tuitions` and `applications` status -> `confirmed`.
*   **Outcome:** Tuition moves to "Active Control Rooms".

## 3. Tuition Control Room
**Route:** `/control-room/:tuitionId` (`src/pages/TuitionControlRoom.js`)

*   **Access:** Restricted to the assigned Teacher, the Parent, and Admins.
*   **Functionality:**
    *   **Attendance Marking:** Teachers can mark themselves "Present" for the current date.
    *   **Attendance Log:** Displays a history of classes held (fetched from `tuition_attendance` table).
    *   **Status View:** Shows current tuition status.

## 4. Key Components & Tables

### Database Tables
*   `profiles`: User data and roles.
*   `leads`: Raw inquiries.
*   `tuitions`: Structured tuition jobs.
*   `applications`: Teacher applications for tuitions.
*   `demos`: Scheduled demo classes.
*   `tuition_attendance`: Daily attendance logs.
*   `bureau_ledger`: Payment and revenue tracking.

### Key Frontend Components
*   `ProtectedRoute.js`: Enforces role-based access (RBAC).
*   `LoginRedirect.js`: Central routing logic post-login.
*   `DynamicFormRenderer.js`: Renders complex forms (Teacher Registration) from JSON configuration.