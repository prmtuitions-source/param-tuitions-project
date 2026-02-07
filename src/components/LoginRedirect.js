import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function LoginRedirect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      // 1. Get the current logged-in user session
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();

      if (sessionError || !user) {
        navigate('/login-parent', { replace: true });
        return;
      }

      // 2. Fetch the role from the Param Tuitions 'profiles' table
      // Use maybeSingle() instead of single() to avoid the 406 error if the row is missing
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_role')
        .eq('id', user.id)
        .maybeSingle();

      // 3. FALLBACK: If profile is missing (common with first-time Google Login), create it now
      if (!profile) {
        // The trigger should have created the profile. If not, wait a moment and retry.
        console.warn("Profile not found, retrying in 500ms...");
        await new Promise(res => setTimeout(res, 500));
        const { data: secondAttempt } = await supabase.from('profiles').select('user_role').eq('id', user.id).maybeSingle();
        if (!secondAttempt) {
            // ATTEMPT MANUAL CREATION IF ROLE IS KNOWN
            const roleParam = searchParams.get('role');
            if (roleParam) {
                console.log("Attempting manual profile creation for role:", roleParam);
                const { error: insertError } = await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email,
                    user_role: roleParam,
                    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User'
                });
                
                if (insertError) {
                    console.error("Manual profile creation failed:", insertError);
                    alert("Failed to create profile. Please contact support.");
                    await supabase.auth.signOut();
                    navigate('/login-parent', { replace: true });
                    return;
                }
                // If successful, set profile manually so we can proceed
                profile = { user_role: roleParam };
            } else {
                console.error("Critical: Profile not found for user and trigger did not run:", user.id);
                alert("Failed to initialize your account. Please contact support.");
                navigate('/login-parent', { replace: true });
                return;
            }
        } else {
            profile = secondAttempt;
        }
      }

      // 4. ROUTING LOGIC
      console.log(`Routing ${user.email} as ${profile.user_role}`);

      let role = profile.user_role;
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
        console.error(`Critical: User ${user.id} has a profile but no user_role. Logging out.`);
        alert("Your account is not configured correctly. Please contact support.");
        await supabase.auth.signOut();
        navigate('/login-parent', { replace: true });
        return;
      }

      // 5. STRICT ROLE ENFORCEMENT (Prevents Parents from logging in via Teacher page, etc.)
      if (expectedRole && role !== expectedRole) {
        // Admins are allowed to access any portal if needed, otherwise enforce strict check
        if (role !== 'super_admin' && role !== 'admin') {
          await supabase.auth.signOut();
          alert(`Access Denied: You are registered as a "${role}". Please login using the ${role} login page.`);
          if (expectedRole === 'teacher') navigate('/login-teacher', { replace: true });
          else if (expectedRole === 'institute') navigate('/login-institute', { replace: true });
          else navigate('/login-parent', { replace: true });
          return;
        }
      }
      
      switch (role) {
        case 'super_admin':
          navigate('/super-admin-dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin-dashboard', { replace: true }); 
          break;
        case 'teacher':
          navigate('/teacher-dashboard', { replace: true });
          break;
        case 'parent':
          navigate('/parent-dashboard', { replace: true });
          break;
        case 'institute':
          navigate('/institute-dashboard', { replace: true });
          break;
        default:
          console.warn(`Unknown role "${role}" for user ${user.id}. Redirecting to parent login.`);
          navigate('/login-parent', { replace: true });
      }
    };

    checkUserRoleAndRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center p-8 bg-white rounded-[40px] shadow-2xl shadow-blue-100">
        <div className="relative w-16 h-16 mx-auto mb-6">
           <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
           <div className="absolute inset-0 rounded-full border-4 border-t-blue-700 animate-spin"></div>
        </div>
        <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Param Tuition Bureau</h2>
        <p className="mt-2 text-[10px] font-black uppercase text-blue-600 tracking-widest animate-pulse">
          Establishing Secure Branch Connection...
        </p>
      </div>
    </div>
  );
}