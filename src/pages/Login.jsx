import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import uiNotify from '../shared/utils/uiNotify';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const roleParam = params.get('role') || params.get('roles') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/teacher-register');
  const [selectedRole, setSelectedRole] = useState(roleParam ? roleParam.split(',')[0] : 'parent');
  const origin = (typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.origin) ? globalThis.location.origin : '';

  const selectRole = (r) => setSelectedRole(r);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const rolesQuery = selectedRole ? selectedRole : '';
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: origin + '/dashboard' + (rolesQuery ? `?role=${rolesQuery}` : ''),
          data: { roles: selectedRole ? [selectedRole] : [] }
        }
      });
    } catch (err) {
      uiNotify.alert(err.message || err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const rolesArr = selectedRole ? [selectedRole] : [];
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { roles: rolesArr, full_name: fullName, phone } }
        });
        if (error) throw error;
        if (data?.user) uiNotify.alert('Account created — check email to verify');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const rolesPayload = selectedRole ? [selectedRole] : undefined;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
        let finalRole = profile?.user_role || selectedRole || 'parent';
        if (profile?.user_role === 'parent' && (selectedRole === 'teacher' || selectedRole === 'institute')) {
            finalRole = selectedRole;
        }

        const payload = {
          id: data.user.id,
          email: data.user.email,
          user_role: finalRole,
          roles: (finalRole === selectedRole) ? rolesPayload : (profile?.roles || ['parent']),
          full_name: fullName || data.user.user_metadata?.full_name || (data.user.email || '').split('@')[0],
          phone: phone || (profile && profile.phone) || null,
        };

        if (!profile) {
          const { error: createError } = await supabase.from('profiles').upsert(payload);
          if (createError) throw createError;
        } else {
          const { error: updateError } = await supabase.from('profiles').update(payload).eq('id', data.user.id);
          if (updateError) throw updateError;
        }

        if (selectedRole === 'teacher') {
          try {
            await supabase.from('teacher_details').upsert({ id: data.user.id, full_name: payload.full_name, phone: payload.phone, qualifications }).select();
          } catch (e) {}
        }

        navigate(`/dashboard?role=${encodeURIComponent(finalRole)}`);
      }
    } catch (err) {
      uiNotify.alert(err.message || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--gold)_10%,_rgba(0,0,0,0)_40%)] p-6">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="hidden md:flex flex-col justify-center items-start p-12 bg-gradient-to-b from-[#f6e7c3] to-white">
            <h3 className="text-3xl font-extrabold text-[#8a5c00] mb-4">Welcome to Param Tuition Bureau</h3>
            <p className="text-slate-600 mb-6">Sign in to manage enquiries, apply for tuition jobs, or register your institute. Choose the correct role to continue.</p>
            <ul className="text-sm text-slate-600 list-disc pl-5 space-y-2">
              <li><strong className="text-[#b07a00]">Parents</strong> — Book demos and manage bookings.</li>
              <li><strong className="text-[#b07a00]">Teachers</strong> — Apply to jobs and upload qualifications.</li>
              <li><strong className="text-[#b07a00]">Institutes</strong> — Manage multiple tutors and listings.</li>
            </ul>
          </div>

          <div className="p-8 md:p-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4 text-[#8a5c00]">Sign in or Register</h2>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">Login as</label>
                <div className="flex gap-3">
                  {['parent','teacher','institute'].map(r => (
                    <button key={r} type="button" onClick={() => selectRole(r)} className={`px-4 py-2 rounded-lg border ${(selectedRole===r) ? 'bg-[#b07a00] text-white border-[#b07a00]' : 'bg-white text-slate-700'}`}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {selectedRole === 'teacher' && (
                <div className="mb-4 p-3 border rounded bg-[#fff8e6]">
                  <input value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Full name" className="w-full p-2 rounded border mt-2" />
                  <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 rounded border mt-2" />
                  <input value={qualifications} onChange={e=>setQualifications(e.target.value)} placeholder="Qualifications (e.g. M.Sc, B.Ed)" className="w-full p-2 rounded border mt-2" />
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-3 rounded border" required />
                <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-3 rounded border" required />
                <div className="flex items-center gap-2">
                  <input id="signup" type="checkbox" checked={isSignUp} onChange={()=>setIsSignUp(s=>!s)} />
                  <label htmlFor="signup">Create account</label>
                </div>
                <button disabled={loading} className="w-full bg-[#b07a00] text-white py-3 rounded font-semibold">{loading ? 'Working...' : (isSignUp ? 'Create Account' : 'Sign In')}</button>
              </form>

              <div className="my-4 flex items-center">
                <div className="flex-grow border-t"></div>
                <div className="px-3 text-sm text-slate-400">Or</div>
                <div className="flex-grow border-t"></div>
              </div>

              <button onClick={handleGoogle} disabled={loading} className="w-full border py-3 rounded flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="#EA4335" d="M12 10.8v3.6h5.6c-.24 1.44-1.44 3.36-5.6 3.36-3.36 0-6-2.76-6-6s2.64-6 6-6c1.92 0 3.12.84 3.84 1.56l2.64-2.64C17.28 3.12 14.88 2 12 2 6.48 2 2 6.48 2 12s4.48 10 10 10c5.76 0 9.6-4.08 9.6-9.84 0-.66-.06-1.2-.12-1.56H12z" />
                  <path fill="#34A853" d="M6.4 15.6C5.84 14.28 5.6 12.7 5.6 11s.24-3.28.8-4.6L3.12 6.76C2.12 8.36 1.6 9.64 1.6 11s.52 2.64 1.52 4.24l3.28-.64z" />
                  <path fill="#FBBC05" d="M12 22c2.88 0 5.28-1.12 7.04-2.92l-3.36-2.6C14.88 17.64 13.68 18 12 18c-3.2 0-5.84-1.92-6.88-4.8l-3.28.64C3.2 19.92 7.2 22 12 22z" />
                  <path fill="#4285F4" d="M22.6 12.8c0-.6-.06-1.2-.12-1.76H12v3.36h6.28c-.28 1.56-1.2 2.88-2.76 3.6v2.96C19.84 20.6 22.6 16.96 22.6 12.8z" />
                </svg>
                Continue with Google
              </button>

              <p className="text-xs text-slate-400 mt-4">By continuing, you agree to our <a href="/terms" className="text-[#b07a00]">Terms</a> and <a href="/privacy" className="text-[#b07a00]">Privacy Policy</a>.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
