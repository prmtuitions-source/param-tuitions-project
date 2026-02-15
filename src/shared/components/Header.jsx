import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import ROLE_DASHBOARD_ROUTES from '../utils/roleRoutes';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: roleData } = await supabase
            .from('profiles')
            .select('user_role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (roleData?.user_role) setUserRole(roleData.user_role);
        fetchNotifications(roleData?.id || session.user.id, session.user);
      } else {
        setUserRole(null);
      }
    };

    async function fetchNotifications(profileId, sessionUser) {
      try {
        setNotifLoading(true);
        const uid = profileId || sessionUser?.id;
        const phone = sessionUser?.user_metadata?.phone || null;

        let query;
        if (phone) {
          query = supabase.from('notification_logs').select('*').or(`recipient_id.eq.${uid},recipient_phone.eq.${phone}`).order('created_at', { ascending: false }).limit(12);
        } else {
          query = supabase.from('notification_logs').select('*').eq('recipient_id', uid).order('created_at', { ascending: false }).limit(12);
        }

        const { data } = await query;
        setNotifications(data || []);
      } catch (err) {
      } finally {
        setNotifLoading(false);
      }
    }

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
         setTimeout(() => {
            checkUser();
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

  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    let channel;
    let mounted = true;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const uid = session.user.id;
      const phone = session.user.user_metadata?.phone || null;

      channel = supabase.channel('notifications')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notification_logs' }, (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.recipient_id === uid || (phone && row.recipient_phone === phone)) {
            if (!mounted) return;
            setNotifications(prev => [row, ...(prev || [])].slice(0,12));
          }
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notification_logs' }, (payload) => {
          const row = payload.new;
          if (!row) return;
          if (row.recipient_id === uid || (phone && row.recipient_phone === phone)) {
            setNotifications(prev => (prev || []).map(n => n.id === row.id ? row : n));
          }
        })
        .subscribe();
    };

    setup();

    return () => {
      mounted = false;
      if (channel) channel.unsubscribe();
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(v => !v);
  };

  const markAsRead = async (id) => {
    try {
      await supabase.from('notification_logs').update({ delivery_status: 'read' }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, delivery_status: 'read' } : n));
    } catch (e) {}
  };

  const renderDashboardLink = () => {
    if (userRole === 'teacher' || userRole === 'parent' || userRole === 'admin' || userRole === 'super_admin' || userRole === 'institute') {
      const path = (ROLE_DASHBOARD_ROUTES[userRole] || '/dashboard');

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
          <Link to="/find-tutors" className="header-link-mint">Find Tutors</Link>
          <Link to="/about">About</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/available-tuitions">Tuitions</Link>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
      <div className="header-right">
        {userRole ? (
          <div className="authenticated-nav" style={{display:'flex',alignItems:'center',gap:8}}>
            <div className="notif-container" ref={dropdownRef} style={{position:'relative'}}>
              <button onClick={toggleDropdown} aria-label="Notifications" style={{background:'none',border:'none',cursor:'pointer'}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17H9" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 8C18 6.46957 17.3679 4.99464 16.2426 3.87939C15.1174 2.76415 13.6321 2.14286 12.06 2.06006V2C12.06 1.44772 11.6123 1 11.06 1C10.5077 1 10.06 1.44772 10.06 2V2.06006C8.48793 2.14286 7.00258 2.76415 5.87739 3.87939C4.75221 4.99464 4.12 6.46957 4.12 8V13L2 15V16H20V15L18 13V8Z" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {notifications.filter(n => n.delivery_status !== 'read').length > 0 && (
                  <span style={{position:'absolute',top:-6,right:-6,minWidth:18,height:18,background:'#ef4444',color:'#fff',borderRadius:999,fontSize:11,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 4px',fontWeight:700}}>{notifications.filter(n => n.delivery_status !== 'read').length}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="notif-dropdown" style={{position:'absolute',right:0,top:32,width:320,background:'#fff',boxShadow:'0 6px 18px rgba(2,6,23,0.2)',borderRadius:8,zIndex:60,maxHeight:360,overflowY:'auto'}}>
                  <div style={{padding:12,borderBottom:'1px solid #f1f5f9',fontWeight:700}}>Notifications</div>
                  {notifLoading ? <div style={{padding:12}}>Loading...</div> : (
                    notifications.length === 0 ? <div style={{padding:12,color:'#64748b'}}>No notifications</div> : (
                      notifications.map(n => {
                        const text = (n.payload && (n.payload.message || n.payload.text)) || n.template_key || n.title || JSON.stringify(n.payload || {}) || '';
                        return (
                          <div key={n.id} style={{padding:12,display:'flex',gap:8,alignItems:'flex-start',borderBottom:'1px solid #f8fafc'}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:700,color:'#0f172a'}}>{text}</div>
                              <div style={{fontSize:11,color:'#64748b',marginTop:6}}>{new Date(n.created_at).toLocaleString()}</div>
                            </div>
                            <div style={{display:'flex',flexDirection:'column',gap:6}}>
                              {n.delivery_status !== 'read' ? (
                                <button onClick={() => markAsRead(n.id)} style={{background:'#10b981',color:'#fff',border:'none',padding:'6px 8px',borderRadius:6,cursor:'pointer',fontSize:12}}>Mark read</button>
                              ) : (
                                <span style={{fontSize:11,color:'#94a3b8'}}>Read</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )
                  )}
                  <div style={{padding:10,textAlign:'center'}}>
                    <Link to="/notifications" onClick={() => setDropdownOpen(false)} style={{fontWeight:700,color:'#0ea5a4'}}>View all</Link>
                  </div>
                </div>
              )}
            </div>
            {renderDashboardLink()}
            <Link to="/notifications" onClick={() => setDropdownOpen(false)} style={{backgroundColor: 'transparent', color: '#0f172a', padding: '6px 10px', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8}}>
              Notifications
              {notifications.filter(n => n.delivery_status !== 'read').length > 0 && (
                <span style={{background:'#ef4444',color:'#fff',borderRadius:999,fontSize:11,padding:'0 6px',fontWeight:800}}>{notifications.filter(n => n.delivery_status !== 'read').length}</span>
              )}
            </Link>
            <button onClick={handleLogout} style={{backgroundColor: '#333', color: '#fff', padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold'}}>Logout</button>
          </div>
        ) : (
          <div className="guest-nav">
            <Link to="/login" style={{ color: 'var(--gold)' }}>Login / Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}
