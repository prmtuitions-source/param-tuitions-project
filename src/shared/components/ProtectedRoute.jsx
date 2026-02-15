import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import OnboardingLock from './OnboardingLock';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setLoading(false);
      setAuthorized(false);
      return;
    }

    // Fetch the full profile
    let { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    // If profile is missing, retry once.
    if (!userProfile) {
      // ProtectedRoute: Profile not found, retrying in 500ms...
      await new Promise(res => setTimeout(res, 500));
      const { data: secondAttempt } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
      userProfile = secondAttempt;
    }

    // Handle legacy 'customer' role mapping
    if (userProfile && userProfile.user_role === 'customer') {
      userProfile.user_role = 'parent';
    }

    setProfile(userProfile);

      let isAuthorized = false;
      if (userProfile) {
        if (userProfile.user_role === 'super_admin') {
          isAuthorized = true;
        } else if (Array.isArray(requiredRole)) {
          if (requiredRole.includes('any') || requiredRole.includes(userProfile.user_role)) {
            isAuthorized = true;
          }
        } else if (userProfile.user_role === requiredRole || requiredRole === 'any') {
          isAuthorized = true;
        }
      }

    if (isAuthorized) {
      setAuthorized(true);
      // *** ONBOARDING CHECK ***
      // If the user is a parent, check if onboarding is needed.
      if (userProfile.user_role === 'parent' && requiredRole === 'parent') {
        if (!userProfile.latitude || !userProfile.phone_number) {
          setShowOnboarding(true);
        } else {
          setShowOnboarding(false);
        }
      } else {
        setShowOnboarding(false);
      }
    } else {
      // Access denied
      setAuthorized(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [requiredRole]);

  const handleOnboardingComplete = async () => {
    setLoading(true);
    // Add a delay to allow for database replication before re-checking auth
    await new Promise(res => setTimeout(res, 1500)); 
    await checkAuth(); // Re-run the auth and profile check
    setLoading(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div></div>;

  if (!authorized) {
    // Support array of allowed roles by selecting the most appropriate login redirect
    // Redirect to unified login, passing expected role(s) as query so UI can preselect
    if (Array.isArray(requiredRole)) {
      const roleQuery = requiredRole.includes('any') ? '' : requiredRole.join(',');
      return <Navigate to={`/login${roleQuery ? `?role=${encodeURIComponent(roleQuery)}` : ''}`} state={{ from: location }} replace />;
    }

    if (requiredRole === 'admin' || requiredRole === 'super_admin') return <Navigate to="/admin-login" state={{ from: location }} replace />;
    // For parent/teacher/institute redirect to /login with role param
    return <Navigate to={`/login?role=${encodeURIComponent(requiredRole)}`} state={{ from: location }} replace />;
  }
  
  // Conditionally render the lock screen if onboarding is required
  if (showOnboarding && profile) {
    return <OnboardingLock user={profile} onComplete={handleOnboardingComplete} />;
  }

  return children;
};

export default ProtectedRoute;
