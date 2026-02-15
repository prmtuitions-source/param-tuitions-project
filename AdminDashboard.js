import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../Footer';

/**
 * PARAM TUITIONS - ADMIN DASHBOARD (Location Scoped)
 * Restricted view for Branch Admins (Admin 1 / Admin 2).
 * Can only view and manage data within their assigned admin_zone.
 */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [adminProfile, setAdminProfile] = useState(null);
  
  // Scoped Data States
  const [stats, setStats] = useState({ teachers: 0, tuitions: 0, demos: 0 });
  const [myTeachers, setMyTeachers] = useState([]);
  const [myParents, setMyParents] = useState([]);
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [demos, setDemos] = useState([]);
  const [demoFilterDate, setDemoFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [locations, setLocations] = useState([]);
  const [underReviewCount, setUnderReviewCount] = useState(0);
  const [ledgerData, setLedgerData] = useState([]);
  const [adminPhones, setAdminPhones] = useState({ 'Admin 1': '8188005373', 'Admin 2': '8756525373' });

  // NEW: Blacklist State
  const [blacklist, setBlacklist] = useState([]);
  const [newBlacklistEntry, setNewBlacklistEntry] = useState({ role: 'teacher', phone: '', email: '', location: '', reason: '' });
  const [blacklistSearch, setBlacklistSearch] = useState('');

  // Lead Processing States
  const [leads, setLeads] = useState([]);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showManualLeadModal, setShowManualLeadModal] = useState(false);
  const [manualLead, setManualLead] = useState({ name: '', phone: '', location: '', class: '', subject: '' });
  const [subjectSearch, setSubjectSearch] = useState('');
  const [verifiedLeadData, setVerifiedLeadData] = useState({ 
    fee: '', 
    school: '', 
    demands: [], 
    nearby: '', 
    mode: "Student's Home",
    board: 'CBSE',
    days: '6 days/week',
    duration: '1 hr',
    timings: '',
    gender: 'Any',
    class: [],
    subject: [],
    demo_date: ''
  });
  const [toast, setToast] = useState(null);
  
  // Security & Reports States
  const [bypassAlerts, setBypassAlerts] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [suspiciousCancellations, setSuspiciousCancellations] = useState([]);
  const [reportData, setReportData] = useState([]);

  // Demo Modal States
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoModalMode, setDemoModalMode] = useState('schedule');
  const [selectedDemoItem, setSelectedDemoItem] = useState(null);
  const [demoForm, setDemoForm] = useState({ date: '', time: '', remarks: '', status: '' });

  // Matching States
  const [matchFilters, setMatchFilters] = useState({ gender: '', board: '', minMarks: 0, minExp: 0, radius: 5 });
  const [matchedTeachers, setMatchedTeachers] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    document.title = "Admin Dashboard | Param Tuition Bureau";
    initAdmin();
    fetchSystemSettings();
  }, []);

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchSystemSettings() {
    const { data } = await supabase.from('system_settings').select('*');
    if (data) {
      const phones = { ...adminPhones };
      const p1 = data.find(s => s.key === 'admin_1_phone')?.value;
      const p2 = data.find(s => s.key === 'admin_2_phone')?.value;
      if (p1) phones['Admin 1'] = p1;
      if (p2) phones['Admin 2'] = p2;
      setAdminPhones(phones);
    }
  }

  async function initAdmin() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      // 1. Get Admin Profile & Zone
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (profile.role !== 'admin') {
        alert("Access Denied: You are not an Admin.");
        return navigate('/');
      }
      
      setAdminProfile(profile);
      const locs = await fetchLocations(); // Capture data immediately
      await fetchScopedData(profile.admin_zone, locs); // Pass to next function
      await fetchDemosByDate(new Date().toISOString().split('T')[0], profile.admin_zone);

    } catch (e) {
      console.error("Admin Init Error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocations() {
    const { data } = await supabase.from('locations').select('*');
    setLocations(data || []);
    return data || []; // Return for chaining
  }

  async function fetchScopedData(zone, currentLocations = locations) {
    // 1. Fetch Teachers in Zone
    const { data: teachers } = await supabase.from('profiles')
      .select('*, teacher_details!inner(*)')
      .eq('role', 'teacher')
      .eq('admin_zone', zone)
      .order('created_at', { ascending: false });
    setMyTeachers(teachers || []);

    // 2. Fetch Inquiries (Tuitions) in Zone
    const { data: inqs } = await supabase
      .from('tuitions')
      .select('*, parent:profiles!parent_id(latitude, longitude), applications(id, teacher_id, status, created_at, teacher:profiles(id, full_name, phone_number, email, latitude, longitude, teacher_details(*)))')
      .eq('admin_zone', zone)
      .in('status', ['open', 'demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'booked', 'BOOKED', 'demo_started'])
      .order('created_at', { ascending: false });
    setPendingInquiries(inqs || []);

    // 4. Calculate Stats
    setStats({
      teachers: teachers?.length || 0,
      tuitions: inqs?.length || 0,
      demos: 0 // Will be updated by demo fetch
    });

    // 5. Fetch Leads (Filtered by Zone)
    const { data: allLeads } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'pending_call')
      .order('created_at', { ascending: false });
    
    if (allLeads && currentLocations.length > 0) {
      const zoneLeads = allLeads.filter(lead => {
        const locName = lead.raw_data?.location_name;
        const locObj = currentLocations.find(l => l.location_name === locName);
        return locObj && locObj.admin_zone === zone;
      });
      setLeads(zoneLeads);
    }
  }

  async function fetchDemosByDate(date, zone = adminProfile?.admin_zone) {
    setDemoFilterDate(date);
    const { data, error } = await supabase
      .from('demos')
      .select(`
        *,
        teacher:profiles!teacher_id(full_name),
        parent:profiles!parent_id(full_name),
        tuition:tuitions!inner(subject, student_class, location_name, admin_zone)
      `)
      .eq('demo_date', date)
      .eq('tuition.admin_zone', zone)
      .order('demo_time', { ascending: true });
    
    if (error) console.error('Error fetching demos:', error);
    setDemos(data || []);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">Loading Admin Console...</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-slate-900 text-white p-8 flex flex-col md:h-screen sticky top-0">
          <div className="mb-10">
            <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase italic">Admin Panel</h1>
            <p className="text-xs text-slate-400 font-bold uppercase mt-2">{adminProfile?.admin_zone}</p>
          </div>
          <nav className="space-y-2 flex-1">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📊 Overview</button>
            <button onClick={() => setActiveTab('leads')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'leads' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📞 New Leads</button>
            <button onClick={() => setActiveTab('allot')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'allot' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🤝 Inquiry & Booking</button>
            <button onClick={() => setActiveTab('demos')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'demos' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📅 Demo Manager</button>
            <button onClick={() => setActiveTab('teachers')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'teachers' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>👨‍🏫 My Teachers</button>
          </nav>
          <div className="mt-auto pt-6 border-t border-slate-700">
            <button onClick={handleLogout} className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest">Logout</button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 md:max-h-screen md:overflow-y-auto">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Dashboard Overview</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-blue-600">
                  <p className="text-slate-400 text-sm font-bold uppercase">My Teachers</p>
                  <h2 className="text-4xl font-black">{stats.teachers}</h2>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-orange-500">
                  <p className="text-slate-400 text-sm font-bold uppercase">Open Inquiries</p>
                  <h2 className="text-4xl font-black">{stats.tuitions}</h2>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-purple-500">
                  <p className="text-slate-400 text-sm font-bold uppercase">Today's Demos</p>
                  <h2 className="text-4xl font-black">{demos.length}</h2>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NEW LEADS */}
          {activeTab === 'leads' && (
            <section className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
              <div className="p-6 bg-orange-500 text-white flex justify-between items-center">
                <h3 className="text-xs font-black uppercase italic tracking-widest">Incoming Leads ({adminProfile?.admin_zone})</h3>
                <span className="text-[10px] font-bold bg-white text-orange-600 px-3 py-1 rounded-full">{leads.length} New</span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {leads.map(lead => (
                  <div key={lead.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-orange-300 transition-all">
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{lead.raw_data?.location_name || lead.location}</p>
                      <h4 className="font-black text-slate-800 text-lg uppercase leading-none">{lead.raw_data?.subject || lead.subject}</h4>
                      <div className="flex gap-2 mt-3">
                        <a href={`tel:${lead.raw_data?.phone_number || lead.contact_number}`} className="bg-white text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm">Call Parent</a>
                      </div>
                    </div>
                  </div>
                ))}
                {leads.length === 0 && <div className="col-span-2 text-center p-10 text-slate-400 italic text-xs uppercase font-bold tracking-widest opacity-50">No new leads for your zone.</div>}
              </div>
            </section>
          )}

          {/* TAB: INQUIRY & BOOKING */}
          {activeTab === 'allot' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold italic tracking-tighter uppercase">Inquiry & Booking</h2>
              {pendingInquiries.map(inq => (
                <div key={inq.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black uppercase italic">{inq.subject} - {inq.student_class}</h3>
                      <p className="text-blue-600 font-bold uppercase text-[10px]">{inq.location_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inq.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{inq.status}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inq.applications?.map(app => (
                      <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border flex flex-col gap-3">
                        <div>
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-sm block text-slate-800">{app.teacher?.full_name}</span>
                              <span className="text-[10px] text-slate-500 uppercase font-bold">{app.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: DEMO MANAGER */}
          {activeTab === 'demos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">Demo Manager</h2>
                <input type="date" value={demoFilterDate} onChange={(e) => fetchDemosByDate(e.target.value)} className="p-3 border rounded-xl font-bold text-sm" />
              </div>
              <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                    <tr>
                      <th className="p-4">Time</th>
                      <th className="p-4">Teacher</th>
                      <th className="p-4">Parent</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demos.map(d => (
                      <tr key={d.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-bold text-xs">{d.demo_time}</td>
                        <td className="p-4 font-bold text-sm">{d.teacher?.full_name}</td>
                        <td className="p-4 text-xs">{d.parent?.full_name}</td>
                        <td className="p-4 text-xs font-bold text-slate-600">{d.tuition?.subject}</td>
                        <td className="p-4"><span className="px-2 py-1 rounded text-[9px] font-black uppercase bg-slate-100">{d.status}</span></td>
                      </tr>
                    ))}
                    {demos.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400 italic text-xs">No demos found for this date in your zone.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: MY TEACHERS */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">My Teachers</h2>
              <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                    <tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Status</th></tr>
                  </thead>
                  <tbody>
                    {myTeachers.map(t => (
                      <tr key={t.id} className="border-b hover:bg-slate-50">
                        <td className="p-4 font-bold text-sm">{t.full_name}</td>
                        <td className="p-4 text-xs">{t.phone_number}</td>
                        <td className="p-4 text-xs">
                          {t.teacher_details?.is_verified ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase">Verified</span>
                          ) : (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[9px] font-black uppercase">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
      <Footer />
    </>
  );
}
          </div>
        ))}
      </section>
    </div>
  );
}