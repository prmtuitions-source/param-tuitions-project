import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LoginParent() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Sign Up
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/dashboard?role=parent',
          data: { role: 'parent' } // Pass metadata to identify role on signup
        },
      });
      if (error) throw error;
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your email address first.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/update-password',
      });
      if (error) throw error;
      alert("Password reset email sent! Check your inbox.");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format phone number (default to +91 for 10 digits)
    const formattedPhone = phone.replace(/\D/g, '').length === 10 
      ? `+91${phone.replace(/\D/g, '')}` 
      : phone;

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'parent', phone: formattedPhone } // Metadata for the user
          }
        });

        if (error) throw error;

        // Create profile entry (using upsert to avoid conflicts if trigger exists)
        if (data.user) {
          // The user's profile is created automatically by a database trigger.
          alert("Account created successfully! Please check your email to verify.");
          setIsSignUp(false); // Switch to login view
        }

      } else {
        // --- LOGIN LOGIC ---
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) throw error;

        // Check Role
        let { data: profile } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', data.user.id)
          .maybeSingle();

        // If profile is missing (DB trigger might be slow), retry once.
        if (!profile) {
          await new Promise(res => setTimeout(res, 500));
          const { data: secondAttempt } = await supabase.from('profiles').select('user_role').eq('id', data.user.id).maybeSingle();
          profile = secondAttempt;
        }
        
        if (profile?.user_role === 'parent') {
          navigate('/parent-dashboard', { replace: true });
        } else {
          await supabase.auth.signOut();
          alert("Access Denied: This account is not registered as a Parent.");
        }
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-xl border border-blue-50">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">
            {isSignUp ? 'Parent Registration' : 'Parent Portal'}
          </h2>
          <p className="text-slate-400 text-xs font-bold uppercase mb-8">
            {isSignUp ? 'Create your account to manage tuitions' : "Access your child's home tuition details"}
          </p>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
              value={email}
              onChange={(e)=>setEmail(e.target.value)} 
              required 
            />
            {isSignUp && (
              <input 
                type="tel" 
                placeholder="Mobile Number" 
                className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                value={phone}
                onChange={(e)=>setPhone(e.target.value)} 
                required 
              />
            )}
            <input 
              type="password" 
              placeholder={isSignUp ? "Create Password" : "Password"} 
              className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
              value={password}
              onChange={(e)=>setPassword(e.target.value)} 
              required 
            />
            
            <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-[24px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Login')}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase">Or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white text-slate-600 border border-slate-300 py-3 rounded-[24px] font-bold uppercase tracking-widest text-xs shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="text-center flex flex-col gap-2">
              {!isSignUp && (
                <button type="button" onClick={handleForgotPassword} className="text-slate-400 text-[10px] font-bold uppercase hover:text-blue-600">
                  Forgot Password?
                </button>
              )}
              <button 
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 text-xs font-bold uppercase hover:text-blue-800 transition-colors"
              >
                {isSignUp ? 'Already have an account? Login' : 'New User? Create Account'}
              </button>
            </div>
          </form>

        </div>
      </div>
      <Footer />
    </>
  );
}
