'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function TeacherLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const { access_token, refresh_token } = data.session;
      window.location.href =
        `https://app.paramtuitions.com/teacher/dashboard#access_token=${access_token}&refresh_token=${refresh_token}&token_type=bearer`;
    } catch (err) {
      setError(err.message || 'Login failed. Check your email and password.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-[#d4af37] font-bold text-lg font-poppins">
            Param Tuition Bureau
          </Link>
          <div className="mt-4 w-14 h-14 bg-[#d4af37]/20 rounded-2xl flex items-center justify-center mx-auto">
            <GraduationCap size={26} className="text-[#d4af37]" />
          </div>
          <h1 className="text-2xl font-bold text-white mt-3 font-poppins">Teacher Login</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your teacher dashboard</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f172a] focus:border-transparent pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0f172a] hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 text-sm"
            >
              {loading ? 'Signing in…' : 'Sign In as Teacher'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Are you a parent?{' '}
              <Link href="/login-parent" className="text-[#0f172a] font-semibold hover:underline">
                Parent Login
              </Link>
            </p>
            <p className="text-xs text-slate-400">
              <Link href="/" className="hover:underline">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
