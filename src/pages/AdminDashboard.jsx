import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

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

  useEffect(() => {
    document.title = "Admin Dashboard | Param Tuition Bureau";
    initAdmin();
    fetchSystemSettings();
  }, []);

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
      if (!user) return navigate('/login-staff');

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (profile.user_role !== 'admin') {
        alert("Access Denied: You are not an Admin.");
        return navigate('/');
      }
      setAdminProfile(profile);
    } catch (e) {
      console.error('Init admin failed', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-20 text-center font-bold">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <Header />
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black">Admin Dashboard</h1>
      </div>
      <Footer />
    </div>
  );
}
