import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing login…');
  const [failed, setFailed]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase's detectSessionInUrl (default: true) automatically processes
    // #access_token=... from the URL hash and stores the session in localStorage.
    // We listen for SIGNED_IN and also check getSession() as a fallback.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        setStatus('Login successful! Loading your dashboard…');
        navigate('/teacher/dashboard', { replace: true });
      }
    });

    // Fallback: session may already be set by the time useEffect runs
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/teacher/dashboard', { replace: true });
      }
    });

    // Timeout: if nothing happens after 10s, show error
    const timeout = setTimeout(() => {
      setFailed(true);
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {!failed ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4" />
            <p style={{ color: '#1e3a5f', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{status}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>Please wait, do not close this tab.</p>
          </>
        ) : (
          <>
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '1rem' }}>
              Login timed out. Please try again.
            </p>
            <a
              href="/login-teacher"
              style={{ display: 'inline-block', background: '#1e3a5f', color: '#fff', fontWeight: 600, padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontSize: '0.875rem', textDecoration: 'none' }}
            >
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
