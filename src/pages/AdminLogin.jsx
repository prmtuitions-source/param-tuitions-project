import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.user) {
        // CHECK: Is this user actually an Admin in our database?
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_role')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.user_role === 'super_admin') {
          navigate('/super-admin-dashboard', { replace: true });
        } else if (profile.user_role === 'admin') {
          navigate('/admin-dashboard', { replace: true });
        } else {
          await supabase.auth.signOut();
          alert("Access Denied: You are not an Admin.");
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-wide">Admin Portal</h1>
          <p className="text-slate-500 text-sm mt-2">Authorized Personnel Only</p>
        </div>

        <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-100 rounded-lg border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium"
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-100 rounded-lg border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-medium"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying Access...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;