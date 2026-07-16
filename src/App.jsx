import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// --- 1. IMPORT PUBLIC PAGES ---
import Home from './publicPages/Home';
import Login from './pages/Login';
import LoginStaff from './pages/LoginStaff';
import AdminLogin from './pages/AdminLogin';
import PostInquiry from './pages/PostInquiry';
import LoginTeacher from './pages/LoginTeacher';
import About from './publicPages/About';
import Contact from './publicPages/Contact';
import LocationPage from './pages/LocationPage';
import FAQ from './publicPages/FAQ';
import Terms from './publicPages/Terms';
import Policy from './publicPages/Policy';
import Blog from './publicPages/Blog';
import BlogPage from './pages/BlogPage';
import TuitionJobs from './publicPages/TuitionJobs';
import ApplyTuition from './pages/ApplyTuition';

// --- 2. IMPORT DASHBOARDS ---
import ParentDashboard from './roles/parent/Dashboard';
import TeacherDashboard from './roles/teacher/Dashboard';
import TeacherJobBoard from './pages/TeacherJobBoard';
import AdminDashboard from './roles/admin/Dashboard';
import VerifyTeachers from './pages/VerifyTeachers';
import SuperAdminDashboard from './roles/superAdmin/Dashboard';
import MonthlyReport from './pages/MonthlyReport';
import TeacherIDCard from './pages/TeacherIDCard';
import TuitionControlRoom from './pages/TuitionControlRoom';
import UploadIdentity from './pages/UploadIdentity';
import InstituteDashboard from './pages/InstituteDashboard';
import SuperAdminForms from './pages/SuperAdminForms';
import Notifications from './pages/Notifications';
import FindTutors from './pages/FindTutors';
import SuperAdminBlogs from './pages/SuperAdminBlogs';
import AuthCallback from './pages/AuthCallback';

// --- 3. IMPORT SECURITY & COMPONENTS ---
import LoginRedirect from './shared/components/LoginRedirect';
import ProtectedRoute from './shared/components/ProtectedRoute';
import ScrollToTop from './shared/components/ScrollToTop';

// Redirect component for migrated pages → new Next.js site
const RedirectToNewSite = ({ path = '' }) => {
  React.useEffect(() => {
    globalThis.location.replace(`https://www.paramtuitions.com${path}`);
  }, [path]);
  return null;
};
RedirectToNewSite.propTypes = { path: require('prop-types').string };

/**
 * PARAM TUITION BUREAU - 2026 MASTER ARCHITECTURE
 * Finalized: January 28, 2026
 * Branch: Varanasi Main
 */

const PageTitleUpdater = () => {
  const location = useLocation();
  React.useEffect(() => {
    if (location.pathname === '/login-parent') {
      if (typeof document !== 'undefined') document.title = "Parent Login | Param Tuition Bureau";
    } else if (location.pathname === '/login-teacher' || location.pathname === '/teacher-register') {
      if (typeof document !== 'undefined') document.title = "Teacher Login | Param Tuition Bureau";
    }
  }, [location]);
  return null;
};

function App() {
  return (
    <Router 
      future={{ 
        v7_startTransition: true, 
        v7_relativeSplatPath: true 
      }}
    >
      <ScrollToTop />
      <PageTitleUpdater />
      <div className="App min-h-screen bg-slate-50">
        <Routes>
          {/* --- PUBLIC ACCESSIBLE ROUTES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/post-inquiry" element={<PostInquiry />} />
          <Route path="/upload-identity" element={<UploadIdentity />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/privacy" element={<Policy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPage />} />
          <Route path="/available-tuitions" element={<TuitionJobs />} />
          <Route path="/apply-tuition" element={<ApplyTuition />} />
          <Route path="/find-tutors" element={<FindTutors />} />
          
          {/* DYNAMIC LOCATION ROUTE - Handles all Tutors in [Area] links */}
          <Route path="/tutors-in/:location" element={<LocationPage />} />
          
          {/* Auth callback — receives forwarded tokens from paramtuitionbureau.com */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* --- LOGIN & REGISTRATION --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/login-staff" element={<LoginStaff />} />
          <Route path="/teacher-register" element={<LoginTeacher />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/login-teacher" element={<LoginTeacher />} />
          
          {/* Duplicate teacher-register route removed (use /teacher-register -> <Login /> above) */}

          {/* --- AUTOMATIC ROLE REDIRECTOR --- */}
          <Route path="/dashboard" element={<LoginRedirect />} />

          {/* --- PROTECTED PARENT ROUTES --- */}
          <Route 
            path="/parent/dashboard" 
            element={
              <ProtectedRoute requiredRole="parent">
                <ParentDashboard />
              </ProtectedRoute>
            } 
          />

          {/* --- PROTECTED TEACHER ROUTES --- */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/job-board" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherJobBoard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/id-card" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherIDCard />
              </ProtectedRoute>
            } 
          />
          {/* Extra ID Card path to match home page buttons */}
          <Route 
            path="/teacher-id-card" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherIDCard />
              </ProtectedRoute>
            } 
          />

          {/* --- PROTECTED STAFF & ADMIN ROUTES --- */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/verify-teachers" 
            element={
              <ProtectedRoute requiredRole="admin">
                <VerifyTeachers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/control-room/:tuitionId" 
            element={
              // Allow parents to view progress feed (read-only) as well as admin/teacher
              <ProtectedRoute requiredRole={["admin","teacher","parent"]}>
                <TuitionControlRoom />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute requiredRole="any">
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* --- MASTER SUPER ADMIN ROUTES --- */}
          <Route 
            path="/super-admin/dashboard" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/monthly-reports" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <MonthlyReport />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manage-forms" 
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminForms />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/super-admin/blogs"
            element={
              <ProtectedRoute requiredRole="super_admin">
                <SuperAdminBlogs />
              </ProtectedRoute>
            }
          />

          {/* --- PROTECTED INSTITUTE ROUTES --- */}
          <Route 
            path="/institute-dashboard" 
            element={
              <ProtectedRoute requiredRole="institute">
                <InstituteDashboard />
              </ProtectedRoute>
            } 
          />

          {/* --- 404 CATCH ALL --- */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center p-20 text-center">
              <div>
                <h2 className="text-4xl font-black text-slate-200 mb-4 tracking-tighter uppercase">404 ERROR</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                  Page Not Found - Contact Param Tuition Bureau Support
                </p>
                <a href="/" className="mt-8 inline-block text-blue-600 font-black text-[10px] uppercase border-b-2 border-blue-600 pb-1">
                  Back to Homepage
                </a>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
