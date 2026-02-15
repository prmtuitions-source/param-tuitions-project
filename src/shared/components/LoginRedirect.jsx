import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import uiNotify from '../utils/uiNotify';

const ROLE_DASHBOARD_ROUTES = {
  teacher: '/teacher/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin/dashboard',
  super_admin: '/super-admin/dashboard',
  institute: '/institute-dashboard',
};

export default function LoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      // If this page was reached via OAuth redirect, ensure Supabase processes the URL
      try {
        // This will parse the access token from URL (if present) and set the session
        await supabase.auth.getSessionFromUrl({ storeSession: true }).catch(() => {});
      } catch (e) {
        // ignore
      }
      // 1. Get the current logged-in user session
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !user) {
        navigate('/login', { replace: true });
        return;
      }

      // 2. Fetch the role from the Param Tuitions 'profiles' table
      // Use maybeSingle() instead of single() to avoid the 406 error if the row is missing
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role, roles')
        .eq('id', user.id)
        .maybeSingle();

      // 3. FALLBACK: If profile is missing (common with first-time Google Login), create it now
      if (!profile) {
        // The trigger should have created the profile. If not, wait a moment and retry.
        // Profile not found, retrying in 500ms...
        await new Promise(res => setTimeout(res, 500));
        const { data: secondAttempt } = await supabase.from('profiles').select('user_role, roles').eq('id', user.id).maybeSingle();
        if (!secondAttempt) {
            // ATTEMPT MANUAL CREATION IF ROLE IS KNOWN
            const roleParam = searchParams.get('role');
            if (roleParam) {
              // Use upsert to handle race conditions where profile might exist but wasn't found in select
              const { error: insertError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                user_role: roleParam,
                roles: roleParam.includes(',') ? roleParam.split(',') : [roleParam],
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User'
              });
                
                if (insertError) {
                  // Manual profile creation failed
                  uiNotify.alert("Failed to create profile. Please contact support.");
                  await supabase.auth.signOut();
                  navigate('/login?role=' + encodeURIComponent(roleParam || 'parent'), { replace: true });
                  return;
                }
                // If successful, set profile manually so we can proceed
                profile = { user_role: roleParam };
            } else {
                // Critical: Profile not found for user and trigger did not run
                uiNotify.alert("Failed to initialize your account. Please contact support.");
                navigate('/login', { replace: true });
                return;
            }
        } else {
            profile = secondAttempt;
        }
      }

      // 4. ROUTING LOGIC
      // Normalize legacy role values (map 'customer' -> 'parent') and prefer explicit user_role
      const rawRole = profile.user_role || (Array.isArray(profile.roles) && profile.roles[0]) || null;
      
      // Auto-migrate legacy 'customer' role to 'parent' in DB
      if (rawRole === 'customer') {
        // Migrating legacy role 'customer' to 'parent'...
        await supabase.from('profiles').update({ user_role: 'parent' }).eq('id', user.id);
      }

      const normalizedRole = rawRole === 'customer' ? 'parent' : rawRole;

      let role = normalizedRole;
      const expectedRole = searchParams.get('role');

      // SELF-HEALING: If role is missing in DB (NULL) but we know the intent from URL, update it.
      if (!role && expectedRole) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ user_role: expectedRole })
          .eq('id', user.id);
        
        if (!updateError) role = expectedRole;
      }

      if (!role) {
        // If no role set, redirect to unified login so user can pick one
        // User has no role. Redirecting to login role selection.
        navigate('/login', { replace: true });
        return;
      }

      // 5. STRICT ROLE ENFORCEMENT (Prevents Parents from logging in via Teacher page, etc.)
          if (expectedRole && role !== expectedRole) {
        // Admins are allowed to access any portal if needed, otherwise enforce strict check
        if (role !== 'super_admin' && role !== 'admin') {
              // Attempt to update role to match expectedRole (e.g. Parent becoming Teacher)
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ user_role: expectedRole })
                .eq('id', user.id);

              if (!updateError) {
                role = expectedRole;
              } else {
                await supabase.auth.signOut();
                uiNotify.alert(`Access Denied: You are registered as a "${role}". Please login using the correct login page.`);
                // Redirect to unified login with expectedRole preselected
                navigate(`/login?role=${encodeURIComponent(expectedRole)}`, { replace: true });
                return;
              }
        }
      }
      
      const targetPath = ROLE_DASHBOARD_ROUTES[role] || ROLE_DASHBOARD_ROUTES.parent; // Default fallback
      navigate(targetPath, { replace: true });
    };

    checkUserRoleAndRedirect();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center p-8 bg-white rounded-[40px] shadow-2xl shadow-blue-100">
        <div className="relative w-16 h-16 mx-auto mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
           <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 animate-spin"></div>
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Param Tuition Bureau</h2>
        <p className="mt-2 text-[10px] font-black uppercase text-blue-600 tracking-widest animate-pulse">
          Redirecting to Dashboard...
        </p>
      </div>
    </div>
  );
}
