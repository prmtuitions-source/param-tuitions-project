import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

export default function LoginStaff() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Staff Login | Param Tuition Bureau";
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Invalid Credentials: " + error.message);
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const role = profile?.user_role || profile?.role;

      if (role === 'admin') {
        navigate('/admin-dashboard', { replace: true });
      } else if (role === 'super_admin') {
        navigate('/super-admin-dashboard', { replace: true });
      } else {
        await supabase.auth.signOut();
        alert("Access Denied: This portal is for Staff/Admins only.");
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl border border-blue-50">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter mb-2">Staff Portal</h2>
            <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest">Param Tuitions Internal</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Staff Email</label>
              <input type="email" className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 focus:ring-2 focus:ring-blue-600 outline-none transition-all" onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
              <input type="password" className="w-full p-4 bg-slate-100 rounded-2xl border-none font-bold mt-1 focus:ring-2 focus:ring-blue-600 outline-none transition-all" onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button disabled={loading} className="w-full bg-blue-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95">
              {loading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>
          <p className="text-center text-[9px] text-slate-400 mt-8 font-bold uppercase italic">Authorized Personnel Only</p>
        </div>
      </div>
      <Footer />
    </>
  );
}