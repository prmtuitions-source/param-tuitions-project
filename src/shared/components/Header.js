import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch role from DB for single source of truth
        const { data: roleData } = await supabase
            .from('profiles')
            .select('user_role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (roleData?.user_role) setUserRole(roleData.user_role);
      } else {
        setUserRole(null);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
         // Small delay to allow login pages to set sessionStorage
         setTimeout(() => {
            checkUser(); // Re-check DB/Storage
         }, 500);
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    navigate('/');
  };

  const renderDashboardLink = () => {
    if (userRole === 'teacher' || userRole === 'parent' || userRole === 'admin' || userRole === 'super_admin' || userRole === 'institute') {
      let path = '/dashboard';
      if (userRole === 'teacher') path = '/teacher-dashboard';
      else if (userRole === 'parent') path = '/parent-dashboard';
      else if (userRole === 'admin') path = '/admin-dashboard';
      else if (userRole === 'super_admin') path = '/super-admin-dashboard';
      else if (userRole === 'institute') path = '/institute-dashboard';
      
      if (location.pathname === path) return null;
      
      return <Link to={path} style={{backgroundColor: 'var(--blue)', color: '#fff', padding: '8px 15px', borderRadius: '4px', textDecoration: 'none'}}>Dashboard</Link>;
    }
    return null;
  };

  return (
    <header className="header-main">
      <div className="header-left">
        <Link to="/"><img src="/logo.png" alt="Param Tuition Bureau" className="nav-logo" /></Link>
        <nav className="main-nav">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/available-tuitions">Tuitions</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/blog">Blog</Link>
        </nav>
      </div>
      <div className="header-right">
        {userRole ? (
          <div className="authenticated-nav">
            {renderDashboardLink()}
            <button onClick={handleLogout} style={{backgroundColor: '#333', color: '#fff', padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold'}}>Logout</button>
          </div>
        ) : (
          <div className="guest-nav">
            <Link to="/login-institute" style={{ color: 'var(--gold)' }}>Institute/School Login</Link>
            <Link to="/login-teacher" style={{ color: 'var(--gold)' }}>Teacher Login</Link>
            <Link to="/login-parent" style={{ color: 'var(--gold)' }}>Parent Login</Link>
          </div>
        )}
      </div>
    </header>
  );
}