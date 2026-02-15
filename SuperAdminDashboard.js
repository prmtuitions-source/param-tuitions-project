import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import Footer from '../Footer';

// --- Local Utilities & Components ---

const uiNotify = {
  alert: (msg) => window.alert(msg),
  confirm: (msg) => window.confirm(msg),
  prompt: (msg, def) => window.prompt(msg, def),
};

const logger = console;

const SignedImg = ({ path, className, alt }) => {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!path) return;
    if (path.startsWith('http')) { setSrc(path); return; }
    const fetchUrl = async () => {
      const { data } = await supabase.storage.from('teacher-verification').createSignedUrl(path, 3600);
      if (data) setSrc(data.signedUrl);
    };
    fetchUrl();
  }, [path]);
  if (!src) return <div className={`bg-gray-200 ${className}`} />;
  return <img src={src} className={className} alt={alt || 'preview'} />;
};

const ReviewGenerator = () => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100">
    <h3 className="font-bold text-blue-900">Review Generator</h3>
    <p className="text-xs text-slate-500">Generate review links for parents/teachers here.</p>
    <button className="mt-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold" onClick={() => uiNotify.alert('Review link copied!')}>Copy Link</button>
  </div>
);

// --- Main Component ---

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data States
  const [stats, setStats] = useState({ teachers: 0, tuitions: 0, demos: 0 });
  const [locations, setLocations] = useState([]);
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [bypassAlerts, setBypassAlerts] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allParents, setAllParents] = useState([]);
  const [reviewParams, setReviewParams] = useState([]);
  const [newReviewParam, setNewReviewParam] = useState({ role: 'parent_to_teacher', category: '', parameter: '' });
  const [suspiciousCancellations, setSuspiciousCancellations] = useState([]);
  const [teacherRankings, setTeacherRankings] = useState([]);
  const [selectedTeacherHistory, setSelectedTeacherHistory] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [selectedTeacherProfile, setSelectedTeacherProfile] = useState(null);
  const [showParentModal, setShowParentModal] = useState(false);
  const [selectedParentProfile, setSelectedParentProfile] = useState(null);
  const [performanceScores, setPerformanceScores] = useState([]);
  
  // Score Card State
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({
    academic: 0, teaching: 0, communication: 0, experience: 0, 
    feedback: 0, punctuality: 0, ethics: 0,
    cancellation_penalty: 0, missed_demo_penalty: 0
  });
  const [selectedTeacherForScore, setSelectedTeacherForScore] = useState(null);

  // Blacklist State
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
    fee: '', school: '', demands: [], admin_zone: 'Admin 1', nearby: '',
    board: 'CBSE', days: '6 days/week', duration: '1 hr', timings: '',
    gender: 'Any', mode: "Student's Home", class: [], subject: [], tuition_no: '', demo_date: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const origin = window.location.origin;

  // Demo Management States
  const [demos, setDemos] = useState([]);
  const [demoFilterStartDate, setDemoFilterStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [demoFilterEndDate, setDemoFilterEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [demoFilterAdmin, setDemoFilterAdmin] = useState('All');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoModalMode, setDemoModalMode] = useState('schedule');
  const [selectedDemoItem, setSelectedDemoItem] = useState(null);
  const [demoForm, setDemoForm] = useState({ date: '', time: '', remarks: '', status: '' });

  // Revenue & Ledger States
  const [revenueStats, setRevenueStats] = useState({ total: 0, bureau: 0, pending: 0 });
  const [ledgerData, setLedgerData] = useState([]);

  // Content Management States
  const [blogs, setBlogs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [formConfig, setFormConfig] = useState({});
  const [editingBlog, setEditingBlog] = useState(null);
  const [newGalleryImage, setNewGalleryImage] = useState({ url: '', caption: '' });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [galleryImageFile, setGalleryImageFile] = useState(null);

  // FAQ & Terms State
  const [faqs, setFaqs] = useState([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [termsParentContent, setTermsParentContent] = useState('');
  const [termsTeacherContent, setTermsTeacherContent] = useState('');
  const [termsContent, setTermsContent] = useState('');
  const [dosAndDontsContent, setDosAndDontsContent] = useState('');

  const [newEvent, setNewEvent] = useState({ event_name: '', date: '' });
  const [auditingTeacherId, setAuditingTeacherId] = useState(null);

  // Matching Centre States
  const [matchFilters, setMatchFilters] = useState({ gender: '', board: '', minMarks: 0, minExp: 0, radius: 5, timeSlot: '' });
  const [matchedTeachers, setMatchedTeachers] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  // System Settings States
  const [admin1Phone, setAdmin1Phone] = useState('8188005373');
  const [admin2Phone, setAdmin2Phone] = useState('8756525373');
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrFile, setQrFile] = useState(null);

  // Search / History states
  const [searchType, setSearchType] = useState('mobile');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [historyStart, setHistoryStart] = useState(new Date(new Date().setDate(new Date().getDate()-30)).toISOString().split('T')[0]);
  const [historyEnd, setHistoryEnd] = useState(new Date().toISOString().split('T')[0]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState({ attendance: [], applications: [], demos: [] });

  // --- Constants ---
  const timeSlots = ["6:00 AM - 9:00 AM", "9:00 AM - 12:00 PM", "12:00 PM - 3:00 PM", "3:00 PM - 6:00 PM", "6:00 PM - 9:00 PM"];
  const DEMAND_OPTIONS = ["B.Sc Qualified", "CBSE/ICSE Background", "Experienced", "Fluent English", "Good English", "M.Sc Qualified", "Married Teacher", "Mature Teacher", "Minimum 35 Years Age", "Minimum Use of Mobile", "No College Going Students", "Punctuality", "Science Background", "Strict Teacher"];
  const SCHOOL_OPTIONS = ["Delhi Public School Varanasi", "Sunbeam School", "St John's", "Other"]; // Simplified for brevity
  const BOARD_OPTIONS = ["CBSE", "ICSE", "Cambridge", "UP", "Other", "At Home"];
  const DAYS_OPTIONS = ["1 Days/Week", "2 Days/Week", "3 Days/Week", "4 Days/Week", "5 Days/Week", "6 Days/Week", "7 Days/Week"];
  const DURATION_OPTIONS = ["45 mins", "1 hr", "1.5 hr", "2 hr"];
  const MODE_OPTIONS = ["Student's Home", "Online", "School", "Coaching", "At Home"];
  const CLASS_OPTIONS = ["LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "JEE", "NEET"];
  const SUBJECT_OPTIONS = ["All", "Mathematics", "Science", "English", "Physics", "Chemistry", "Biology"];

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          setAdminProfile(profile || null);
        }
      } catch (e) {}
      fetchMasterData();
      fetchSystemSettings();
      fetchLeads();
      fetchDemos();
    };
    init();
  }, []);

  // --- Fetch Functions ---
  async function fetchLeads() {
    const { data } = await supabase.from('leads').select('*').eq('status', 'pending_call').order('created_at', { ascending: false });
    setLeads(data || []);
  }

  async function fetchSystemSettings() {
    const { data } = await supabase.from('system_settings').select('*');
    if (data) {
      data.forEach(setting => {
        if (setting.key === 'admin_1_phone') setAdmin1Phone(setting.value);
        if (setting.key === 'admin_2_phone') setAdmin2Phone(setting.value);
        if (setting.key === 'upi_id') setUpiId(setting.value);
        if (setting.key === 'qr_code_url') setQrCodeUrl(setting.value);
      });
    }
  }

  async function fetchDemos(start, end) {
    const startDate = start !== undefined ? start : demoFilterStartDate;
    const endDate = end !== undefined ? end : demoFilterEndDate;
    const { data } = await supabase.from('demos')
      .select(`*, teacher:profiles!teacher_id(full_name), parent:profiles(full_name), tuition:tuitions(subject, student_class, location_name, admin_zone)`)
      .gte('demo_date', startDate).lte('demo_date', endDate)
      .order('demo_date', { ascending: true });
    setDemos(data || []);
  }

  async function fetchMasterData() {
    setLoading(true);
    try {
      const { count: tCount } = await supabase.from('teacher_details').select('*', { count: 'exact', head: true });
      const { count: iCount } = await supabase.from('tuitions').select('*', { count: 'exact', head: true }).eq('status', 'open');
      const { count: dCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'demo_allotted');
      setStats({ teachers: tCount || 0, tuitions: iCount || 0, demos: dCount || 0 });

      const { data: locData } = await supabase.from('locations').select('*').order('location_name');
      setLocations(locData || []);

      const { data: inqs } = await supabase.from('tuitions')
        .select('*, parent:profiles(latitude, longitude), applications(id, teacher_id, status, created_at, teacher:profiles(id, full_name, phone_number, email, latitude, longitude, teacher_details(*)))')
        .in('status', ['open', 'demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'booked', 'BOOKED', 'demo_started'])
        .order('created_at', { ascending: false });
      setPendingInquiries(inqs || []);

      const { data: hols } = await supabase.from('holidays').select('*').order('date');
      setHolidays(hols || []);

      const { data: alerts } = await supabase.from('bypass_alerts').select('*');
      setBypassAlerts(alerts || []);

      const { data: rankings } = await supabase.from('teacher_rankings').select('*');
      setTeacherRankings(rankings || []);

      const { data: scores } = await supabase.from('teacher_performance_scores').select('*');
      setPerformanceScores(scores || []);

      const { data: ledger } = await supabase.from('bureau_ledger').select('*, tuition:tuitions(subject)');
      setLedgerData(ledger || []);
      const totalRev = ledger?.reduce((acc, curr) => acc + Number(curr.total_fee), 0) || 0;
      const bureauRev = ledger?.reduce((acc, curr) => acc + Number(curr.bureau_commission), 0) || 0;
      const pendingCount = ledger?.filter(l => l.payment_status === 'pending').length || 0;
      setRevenueStats({ total: totalRev, bureau: bureauRev, pending: pendingCount });

      const { data: blogData } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      setBlogs(blogData || []);

      const { data: galleryData } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      setGalleryImages(galleryData || []);

      const { data: faqData } = await supabase.from('faqs').select('*').order('id');
      setFaqs(faqData || []);

      const { data: allT } = await supabase.from('profiles').select('*, teacher_details(*)').eq('user_role', 'teacher').order('created_at', { ascending: false });
      setAllTeachers(allT || []);

      const { data: allP } = await supabase.from('profiles').select('*').eq('user_role', 'parent').order('created_at', { ascending: false });
      setAllParents(allP || []);

      const { data: blData } = await supabase.from('blacklist').select('*').order('created_at', { ascending: false });
      setBlacklist(blData || []);

    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // --- Handlers ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleConvertToTuition = async () => {
    if (!verifiedLeadData.fee || !verifiedLeadData.school) return uiNotify.alert("Verify Fee and School first.");
    setLoading(true);
    try {
      const { error } = await supabase.from('tuitions').insert([{
        tuition_no: verifiedLeadData.tuition_no,
        parent_id: selectedLead.parent_id,
        subject: verifiedLeadData.subject.join(', '),
        student_class: verifiedLeadData.class.join(', '),
        location_name: selectedLead.raw_data.location_name,
        nearby_landmark: verifiedLeadData.nearby,
        school_name: verifiedLeadData.school,
        medium: verifiedLeadData.board,
        fee_amount: verifiedLeadData.fee,
        teaching_mode: verifiedLeadData.mode,
        specific_demands: verifiedLeadData.demands,
        admin_zone: verifiedLeadData.admin_zone,
        status: 'open',
        is_posted: true
      }]);
      if (error) throw error;
      await supabase.from('leads').update({ status: 'converted' }).eq('id', selectedLead.id);
      uiNotify.alert("Tuition Posted!");
      setShowConvertModal(false);
      fetchMasterData();
    } catch (err) { uiNotify.alert(err.message); }
    setLoading(false);
  };

  const handleBookTuition = async (applicationId, tuitionId, teacher) => {
    if (!uiNotify.confirm(`Confirm booking for ${teacher.full_name}?`)) return;
    await supabase.from('applications').update({ status: 'demo_allotted' }).eq('id', applicationId);
    await supabase.from('tuitions').update({ status: 'demo_allotted' }).eq('id', tuitionId);
    uiNotify.alert("Tuition Booked!");
    fetchMasterData();
  };

  const handleConfirmTuition = async (applicationId, tuitionId) => {
    if (!uiNotify.confirm("Confirm this tuition?")) return;
    await supabase.from('applications').update({ status: 'confirmed' }).eq('id', applicationId);
    await supabase.from('tuitions').update({ status: 'confirmed' }).eq('id', tuitionId);
    uiNotify.alert("Tuition Confirmed!");
    fetchMasterData();
  };

  const handleAddManualLead = async () => {
    const { error } = await supabase.from('leads').insert([{
        student_name: manualLead.name,
        contact_number: manualLead.phone,
        location: manualLead.location,
        subject: manualLead.subject,
        status: 'pending_call',
        raw_data: { location_name: manualLead.location, subject: manualLead.subject, phone_number: manualLead.phone }
    }]);
    if(error) uiNotify.alert(error.message);
    else {
        uiNotify.alert("Lead Added");
        setShowManualLeadModal(false);
        fetchLeads();
    }
  };

  const navItems = [
    { label: 'Overview', icon: '📊', tab: 'overview' },
    { label: 'New Leads', icon: '📞', tab: 'leads' },
    { label: 'My Teachers', icon: '👨‍🏫', tab: 'teachers' },
    { label: 'My Parents', icon: '👨‍👩‍👧', tab: 'parents' },
    { label: 'Inquiry & Booking', icon: '🤝', tab: 'allot' },
    { label: 'Demo Manager', icon: '📅', tab: 'demos' },
    { label: 'Master Data', icon: '⚙️', tab: 'master' },
    { label: 'System Settings', icon: '⚙️', tab: 'settings' },
    { label: 'Blog Manager', icon: '📝', tab: 'blogs' },
    { label: 'Gallery', icon: '🖼️', tab: 'gallery' },
    { label: 'FAQ Manager', icon: '❓', tab: 'faq' },
    { label: 'Blacklist', icon: '🚫', tab: 'blacklist' },
  ];

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">Loading Super Admin Control...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white p-8 flex flex-col h-screen overflow-y-auto transition-transform duration-300 md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase italic">Param Control</h1>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">✕</button>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map(item => (
            <button key={item.label} onClick={() => setActiveTab(item.tab)} className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center ${activeTab === item.tab ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <span>{item.icon} {item.label}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition">Logout Securely</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 md:max-h-screen md:overflow-y-auto">
        <div className="md:hidden mb-4">
            <button onClick={() => setMobileMenuOpen(true)} className="bg-slate-900 text-white p-2 rounded">Menu</button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-blue-600">
                <p className="text-slate-400 text-sm font-bold uppercase">Total Teachers</p>
                <h2 className="text-4xl font-black">{stats.teachers}</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-orange-500">
                <p className="text-slate-400 text-sm font-bold uppercase">Open Inquiries</p>
                <h2 className="text-4xl font-black">{stats.tuitions}</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-purple-500">
                <p className="text-slate-400 text-sm font-bold uppercase">Active Demos</p>
                <h2 className="text-4xl font-black">{stats.demos}</h2>
              </div>
            </div>
            <ReviewGenerator />
          </div>
        )}

        {activeTab === 'leads' && (
            <div className="bg-white rounded-3xl shadow-sm border p-6">
                <div className="flex justify-between mb-4">
                    <h2 className="text-xl font-bold">New Leads</h2>
                    <button onClick={() => setShowManualLeadModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Add Manual Lead</button>
                </div>
                {leads.map(lead => (
                    <div key={lead.id} className="border-b py-4 flex justify-between items-center">
                        <div>
                            <p className="font-bold">{lead.student_name} - {lead.subject}</p>
                            <p className="text-sm text-gray-500">{lead.location} | {lead.contact_number}</p>
                        </div>
                        <button onClick={() => { setSelectedLead(lead); setShowConvertModal(true); }} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold">Process</button>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'allot' && (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Inquiry & Booking</h2>
                {pendingInquiries.map(inq => (
                    <div key={inq.id} className="bg-white p-6 rounded-3xl shadow-sm border">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-lg">{inq.subject} - {inq.student_class}</h3>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold uppercase">{inq.status}</span>
                        </div>
                        <div className="grid gap-2">
                            {inq.applications?.map(app => (
                                <div key={app.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                                    <span>{app.teacher?.full_name}</span>
                                    <div className="flex gap-2">
                                        {app.status === 'applied' && <button onClick={() => handleBookTuition(app.id, inq.id, app.teacher)} className="bg-slate-900 text-white px-3 py-1 rounded text-xs font-bold">Book</button>}
                                        {['demo_allotted', 'BOOKED'].includes(app.status) && <button onClick={() => handleConfirmTuition(app.id, inq.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">Confirm</button>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* Modals */}
        {showManualLeadModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl w-96">
                    <h3 className="font-bold text-lg mb-4">Add Lead</h3>
                    <input className="w-full border p-2 rounded mb-2" placeholder="Name" value={manualLead.name} onChange={e => setManualLead({...manualLead, name: e.target.value})} />
                    <input className="w-full border p-2 rounded mb-2" placeholder="Phone" value={manualLead.phone} onChange={e => setManualLead({...manualLead, phone: e.target.value})} />
                    <input className="w-full border p-2 rounded mb-2" placeholder="Location" value={manualLead.location} onChange={e => setManualLead({...manualLead, location: e.target.value})} />
                    <input className="w-full border p-2 rounded mb-2" placeholder="Subject" value={manualLead.subject} onChange={e => setManualLead({...manualLead, subject: e.target.value})} />
                    <div className="flex gap-2 mt-4">
                        <button onClick={handleAddManualLead} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex-1">Add</button>
                        <button onClick={() => setShowManualLeadModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold flex-1">Cancel</button>
                    </div>
                </div>
            </div>
        )}

        {showConvertModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="font-bold text-lg mb-4">Convert to Tuition</h3>
                    <div className="space-y-2">
                        <input className="w-full border p-2 rounded" placeholder="Tuition No (TN)" value={verifiedLeadData.tuition_no} onChange={e => setVerifiedLeadData({...verifiedLeadData, tuition_no: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="Fee" value={verifiedLeadData.fee} onChange={e => setVerifiedLeadData({...verifiedLeadData, fee: e.target.value})} />
                        <input className="w-full border p-2 rounded" placeholder="School" value={verifiedLeadData.school} onChange={e => setVerifiedLeadData({...verifiedLeadData, school: e.target.value})} />
                        <select className="w-full border p-2 rounded" value={verifiedLeadData.admin_zone} onChange={e => setVerifiedLeadData({...verifiedLeadData, admin_zone: e.target.value})}>
                            <option value="Admin 1">Admin 1</option>
                            <option value="Admin 2">Admin 2</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={handleConvertToTuition} className="bg-blue-600 text-white px-4 py-2 rounded font-bold flex-1">Post Tuition</button>
                        <button onClick={() => setShowConvertModal(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded font-bold flex-1">Cancel</button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}