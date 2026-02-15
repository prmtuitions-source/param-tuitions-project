import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/utils/supabaseClient';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';
import ReviewGenerator from '../../shared/components/ReviewGenerator';
import uiNotify from '../../shared/utils/uiNotify';

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
  const origin = (typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.origin) ? globalThis.location.origin : '';
  
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

  const DEMAND_OPTIONS = [
    "B.Sc Qualified", "CBSE/ICSE Background", "Experienced", "Fluent English", "Good English", 
    "M.Sc Qualified", "Married Teacher", "Mature Teacher", "Minimum 35 Years Age", 
    "Minimum Use of Mobile", "No College Going Students", "Punctuality", "Science Background", "Strict Teacher"
  ];

  const SCHOOL_OPTIONS = [
    "Aditya Narayan", "Ambition School", "Angel Public School", "Annie Besant School", "Army Public School", "Arya Mahila", "Aryan International School", "Aryan Petals", "Bachpan Play School", "Bal Vidhyalaya", "Balaji School", "Blossom House School", "BNS", "Bright", "C.S Public School", "Care And Career", "Cat JEE", "Central Hindu Boys School", "Central Hindu Girls School", "Children Academy", "Christian School", "City Glorius", "Coaching", "Crimson World", "Current Montessori School", "DAV Public School", "Dazzling Diamond School", "Delhi Public School Kashi", "Delhi Public School Varanasi", "Divine Sainik School",
    "GD Goenka Public School", "Glenhill School", "Golden India Public School", "Green valley", "Guru Nanak English School", "Gurukul", "Gurukul Montessori", "Gyandeep School", "Happy Model", "Hari Bandhu", "Harsewanand School", "Hermann Gmeiner School", "Holy Mother Teresa", "Ideal New Star", "Imperial Public", "Indra Nagar Sunbeam", "International English School", "International Hindu School", "Ishita Public School", "Jagaran Public School", "Jawahar Navodaya Vidyalaya", "Jeevan Deep", "Jeevan Jyoti", "Kasturba Gandhi", "Kendriya Vidyalaya BHU", "Kendriya Vidyalaya Cantt", "Kendriya Vidyalaya DLW", "KIDZEE", "Little Christian School", "Little Flower House Ashapur", "Little Flower House Kakarmatta", "Little Millennium School", "M P Memorial", "Maa Saraswati", "Mahatma JF Public School", "Mary Convent School", "MBS Convent School", "Moti Ram Arya School", "MRS Public School", "Mukularanyam English School", "Muni Public School", "New St Mary's Tilmapur", "O Grove School", "Others", "PD Convent", "Polymath Public School", "PR International", "Prathmik Vidhyalaya", "PW Gurukulam", "R.S. Convent Sainik school Ledhupur", "Raj English School", "Rajghat Besant School", "Rising India School Susuwahi", "RS Convent", "S S Public School Babatpur", "Sant Atulanand Convent School", "Sant Atulanand Residential", "Seth MR Jaipuria Schools Babatpur", "Seth MR Jaipuria Schools Padao", "Sheat Public School", "Shishu Vihar", "Smile Kindergarten", "SS Mission", "SSV English School", "St Francis School Ramnagar", "St Francis Xavier", "St John's DLW", "St John's Mehrauli", "St Joseph", "St Lawrence School", "St Mary's Cant", "St Mary's Sonatalab", "St Paul's", "St Thomas International School", "Star House English", "Sun Valley", "Sunbeam Academy", "Sunbeam Babatpur", "Sunbeam Bhagwanpur", "Sunbeam Durgakund", "Sunbeam Indiranagar", "Sunbeam Knowledge Park", "Sunbeam Lahartara", "Sunbeam Mughalsarai", "Sunbeam Paharia", "Sunbeam Rohania", "Sunbeam Samneghat", "Sunbeam Sarainandan", "Sunbeam Sarnath", "Sunbeam School Annapurna", "Sunbeam School Mahmoorganj", "Sunbeam School Ramkatora", "Sunbeam Sigra", "Sunbeam Suncity", "Sunbeam Varuna", "Swami Harsewanand Banpurwa", "Swami Harsewanand Garhwaghat", "Swami Harsewanand Jagatganj", "Swarnim Seth", "Tulsi Vidya Niketan", "Uday Pratap Public School", "Unique Academy", "UP College", "Vanita Public School", "Varanasi Public School", "Vardhan International", "Vasant Academy", "Vidyagyan English School", "WH Smith"
  ];

  const BOARD_OPTIONS = [
    "CBSE", "ICSE", "Cambridge", "UP", "Other", "At Home"
  ];

  const DAYS_OPTIONS = [
    "1 Days/Week",
    "2 Days/Week",
    "3 Days/Week",
    "4 Days/Week",
    "5 Days/Week",
    "6 Days/Week",
    "7 Days/Week"
  ];

  const DURATION_OPTIONS = [
    "45 mins",
    "1 hr",
    "1.15 hr",
    "1.30 hr",
    "1.45 hr",
    "2 hr",
    "2.15 hr",
    "2.30 hr",
    "2.45 hr",
    "3 hr",
    "4 hr",
    "5 hr"
  ];

  const MODE_OPTIONS = [
    "Student's Home",
    "Online",
    "School",
    "Coaching",
    "At Home"
  ];

  const CLASS_OPTIONS = [
    "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
    "Graduation", "JEE", "NEET", "NDA / Defence Exam", "CUET", "Olympiads",
    "School Entrance Exam", "At Home", "Sainik School Exam Preparation"
  ];

  const SUBJECT_OPTIONS = [
    "All", "Accountancy", "Arts and Humanities", "Auditing", "Biology", "Business and Management",
    "Business Studies", "Chemistry", "Chess", "Civics", "Commerce", "Computer Aided Design ( CAD)", "Computer Science",
    "Computing and IT", "Creative Arts", "Creative Writing", "Current Affair", "Dance", "Drawing", "Drums", "Economics",
    "Engineering", "English", "Essay", "Finance", "Fine Arts", "Flute", "French", "General Knowledge", "Geography",
    "Guitar", "Harmonium", "Hindi", "History", "Indian Polity", "Karate", "Kathak", "Languages", "Marketing",
    "Mathematics", "Music", "Numerical Ability", "Nursing and Healthcare", "Painting", "Philosophy", "Physical Education",
    "Physics", "Piano", "Poetry", "Political Science", "Politics", "Psychology", "Reasoning", "Religious Studies",
    "Sanskrit", "Science", "Singing", "Social Studies", "Sociology", "Statistics", "Stories", "Tabla", "Urdu", "Violin"
  ];

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = "Admin Dashboard | Param Tuition Bureau";
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

  // Helper: Calculate Distance
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 'N/A';
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1) + ' km';
  };

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

      // 1. Get Admin Profile & Zone
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (profile.user_role !== 'admin') {
        uiNotify.alert("Access Denied: You are not an Admin.");
        return navigate('/');
      }
      
      setAdminProfile(profile);
      const locs = await fetchLocations(); // Capture data immediately
      await fetchScopedData(profile.admin_zone, locs); // Pass to next function
      await fetchDemosByDate(new Date().toISOString().split('T')[0], profile.admin_zone);

    } catch (e) {
      // Admin Init Error
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
      .eq('user_role', 'teacher')
      .eq('admin_zone', zone)
      .order('created_at', { ascending: false });
    setMyTeachers(teachers || []);

    // Calculate Under Review Count
    const reviewCount = teachers?.filter(t => {
        const details = Array.isArray(t.teacher_details) ? t.teacher_details[0] : t.teacher_details;
        return details?.documentation_status === 'Under Review' || (details?.setup_completed && !details?.is_verified);
    }).length || 0;
    setUnderReviewCount(reviewCount);

    // 2. Fetch Parents in Zone
    const { data: parents } = await supabase.from('profiles')
      .select('*')
      .eq('user_role', 'parent')
      .eq('admin_zone', zone)
      .order('created_at', { ascending: false });
    setMyParents(parents || []);

    // 3. Fetch Inquiries (Tuitions) in Zone
    const { data: inqs } = await supabase
      .from('tuitions')
      .select('*, parent:profiles(latitude, longitude), applications(id, teacher_id, status, created_at, teacher:profiles(id, full_name, phone_number, email, latitude, longitude, teacher_details(*)))')
      .eq('admin_zone', zone)
      .in('status', ['open', 'demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'booked', 'BOOKED', 'demo_started'])
      .order('created_at', { ascending: false });
    setPendingInquiries(inqs || []);

    // Fetch Ledger for Fee Status
    const { data: ledger } = await supabase
      .from('bureau_ledger')
      .select('*, tuition:tuitions!inner(admin_zone)')
      .eq('tuition.admin_zone', zone);
    setLedgerData(ledger || []);

    // 4. Calculate Stats
    setStats({
      teachers: teachers?.length || 0,
      tuitions: inqs?.length || 0,
      demos: 0 // Will be updated by demo fetch
    });

    // 5. Fetch Leads (Filtered by Zone)
    // We fetch all pending leads and filter in JS because leads store location in JSONB
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

    // 5. Security: Bypass Alerts (Filter by teachers in zone)
    const { data: alerts } = await supabase.from('bypass_alerts').select('*');
    // Filter alerts to only show those matching teachers in this zone
    const scopedAlerts = alerts?.filter(a => teachers?.some(t => t.phone_number === a.teacher_phone)) || [];
    setBypassAlerts(scopedAlerts);

    // 6. Security: Location History (Scoped by Profile Zone)
    const { data: history } = await supabase
      .from('location_history')
      .select(`*, profiles!inner(full_name, user_role, phone_number, admin_zone)`)
      .eq('profiles.admin_zone', zone)
      .order('changed_at', { ascending: false })
      .limit(30);
    setLocationHistory(history || []);

    // 7. Security: Suspicious Cancellations (Scoped by Tuition Zone)
    const { data: susData } = await supabase
      .from('cancellation_logs')
      .select(`
        *,
        tuition:tuitions!inner(subject, location_name, admin_zone, parent:profiles(full_name, phone_number)),
        admin:profiles(full_name)
      `)
      .eq('is_suspicious', true)
      .eq('tuition.admin_zone', zone)
      .order('created_at', { ascending: false });
    setSuspiciousCancellations(susData || []);

    // 8. Monthly Reports (Scoped by Zone)
    const { data: reports } = await supabase.from('monthly_revenue_report').select('*').eq('admin_zone', zone);
    setReportData(reports || []);

    // 9. Blacklist (Global View for Safety)
    const { data: blData } = await supabase.from('blacklist').select('*').order('created_at', { ascending: false });
    setBlacklist(blData || []);
  }

  async function fetchDemosByDate(date, zone = adminProfile?.admin_zone) {
    setDemoFilterDate(date);
    // CRITICAL: Filter demos by joining tuition and checking admin_zone
    const { data, error } = await supabase
      .from('demos')
      .select(`
        *,
        teacher:profiles!teacher_id(full_name),
        parent:profiles!parent_id(full_name),
        tuition:tuitions!inner(subject, student_class, location_name, admin_zone)
      `)
      .eq('demo_date', date)
      .eq('tuition.admin_zone', zone) // SCOPED QUERY
      .order('demo_time', { ascending: true });
    
    if (error) {/* Error fetching demos */}
    setDemos(data || []);
  }

  // --- ACTION HANDLERS ---

  const handleVerifyTeacher = async (teacher) => {
    const details = Array.isArray(teacher.teacher_details) ? teacher.teacher_details[0] : teacher.teacher_details;
    if (!details) return uiNotify.alert("Cannot verify: Registration incomplete.");

    // NEW: Check setup_completed to ensure documents are uploaded
    if (!details.setup_completed && !details.is_verified) {
            if (!uiNotify.confirm("⚠️ SYSTEM WARNING: This teacher's profile is marked as INCOMPLETE (missing documents or details).\n\nDo you want to FORCE VERIFY them anyway?")) {
            return;
        }
    }
    
    const currentStatus = details.is_verified;
    if (!uiNotify.confirm(`Are you sure you want to ${currentStatus ? 'UNVERIFY' : 'VERIFY'} ${teacher.full_name}?`)) return;

    const { error } = await supabase
      .from('teacher_details')
      .update({ 
          is_verified: !currentStatus,
          verified_at: !currentStatus ? new Date() : null
      })
      .eq('id', teacher.id);

    if (error) uiNotify.alert("Error: " + error.message);
    else {
      fetchScopedData(adminProfile.admin_zone);
    }
  };

  const handleAddBlacklist = async () => {
    if (!newBlacklistEntry.phone && !newBlacklistEntry.email) return uiNotify.alert("Either Phone or Email is required.");
    const { error } = await supabase.from('blacklist').insert({ ...newBlacklistEntry, added_by: adminProfile?.admin_zone });
    if (error) uiNotify.alert("Error adding to blacklist: " + error.message);
    else {
      uiNotify.alert("User blacklisted successfully.");
      setNewBlacklistEntry({ role: 'teacher', phone: '', email: '', location: '', reason: '' });
      fetchScopedData(adminProfile.admin_zone);
    }
  };

  const handleDeleteBlacklist = async (id) => {
    if (!uiNotify.confirm("Remove this user from blacklist?")) return;
    await supabase.from('blacklist').delete().eq('id', id);
    fetchScopedData(adminProfile.admin_zone);
  };

  const handleQuickBlacklist = async (user, role) => {
    const reason = uiNotify.prompt(`Confirm Blacklist for ${user.full_name}? Enter reason:`, "Fraud/Policy Violation");
    if (!reason) return;

    const { error } = await supabase.from('blacklist').insert({
      role: role,
      phone: user.phone_number,
      email: user.email,
      location: user.admin_zone,
      reason: reason,
      added_by: adminProfile?.admin_zone
    });

    if (error) uiNotify.alert("Error adding to blacklist: " + error.message);
    else {
      uiNotify.alert("User blacklisted successfully.");
      fetchScopedData(adminProfile.admin_zone);
    }
  };

  const resetLeadForm = () => {
    setVerifiedLeadData({ 
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
  };

  const handleConvertToTuition = async () => {
    if (!verifiedLeadData.fee || !verifiedLeadData.school) return uiNotify.alert("Verify Fee and School first.");
    
    setLoading(true);

    try {
      // 0. AUTO-LINK: If parent_id is missing, try to find a profile with the same phone number
      let finalParentId = selectedLead.parent_id;

      if (!finalParentId && selectedLead.raw_data?.phone_number) {
        const rawPhone = selectedLead.raw_data.phone_number;
        const cleanPhone = rawPhone.replace(/\D/g, '');
        const formats = [rawPhone];
        if (cleanPhone.length === 10) formats.push(`+91${cleanPhone}`, cleanPhone);
        if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) formats.push(`+${cleanPhone}`, cleanPhone);

        const { data: profile } = await supabase.from('profiles')
          .select('id')
          .in('phone_number', formats)
          .maybeSingle();
        
        if (profile) {
          finalParentId = profile.id;
          // Update the lead so we don't have to look it up next time
          await supabase.from('leads').update({ parent_id: finalParentId }).eq('id', selectedLead.id);
        }
      }

      if (!finalParentId) {
        if (!uiNotify.confirm("No registered Parent account found for this phone number.\n\nDo you want to proceed anyway? (The tuition will be created without a linked parent account)")) {
          setLoading(false);
          return;
        }
      }

      // 1. Fetch the correct TN from the specific Admin range
      const { data: assignedTN, error: tnError } = await supabase
        .rpc('get_next_admin_tn', { p_admin_zone: adminProfile.admin_zone });

      if (tnError || !assignedTN) throw new Error("Could not generate unique Tuition Number.");

      // 2. Post the official record
      const { error: insertError } = await supabase.from('tuitions').insert([{
        tuition_no: assignedTN,
        parent_id: finalParentId, // Use the resolved parent ID
        subject: verifiedLeadData.subject.length > 0 ? verifiedLeadData.subject.join(', ') : selectedLead.raw_data.subject,
        student_class: verifiedLeadData.class.length > 0 ? verifiedLeadData.class.join(', ') : selectedLead.raw_data.student_class,
        location_name: selectedLead.raw_data.location_name,
        nearby_landmark: verifiedLeadData.nearby,
        school_name: verifiedLeadData.school,
        medium: verifiedLeadData.board, // Correctly map Board to Medium
        fee_amount: verifiedLeadData.fee.replace(/[^0-9.]/g, ''),
        teaching_mode: verifiedLeadData.mode, // Correctly map Mode to Teaching Mode
        specific_demands: verifiedLeadData.demands, // Ensure this column is text[] or jsonb in Supabase
        admin_zone: verifiedLeadData.admin_zone || adminProfile.admin_zone, // Use selected zone or fallback to profile
        status: 'open',
        is_posted: true,
        preferred_demo_date: verifiedLeadData.demo_date || null
      }]);

      if (insertError) throw insertError;

      // 3. Mark the original lead as converted
      await supabase.from('leads').update({ status: 'converted' }).eq('id', selectedLead.id);

      // 4. Generate Job Card (Simplified for Admin)
      const jobCard = `
${assignedTN}
❖Main Location: ${selectedLead.raw_data.location_name}
❖Nearby: ${verifiedLeadData.nearby || ''}
❖School: ${verifiedLeadData.school}
❖Medium: ${verifiedLeadData.board}
❖Grade: ${verifiedLeadData.class.length > 0 ? verifiedLeadData.class.join(', ') : selectedLead.raw_data.student_class}
❖Subject: ${verifiedLeadData.subject.length > 0 ? verifiedLeadData.subject.join(', ') : selectedLead.raw_data.subject}
❖Days: ${verifiedLeadData.days}
❖Duration: ${verifiedLeadData.duration}
❖Timing: ${verifiedLeadData.timings}
❖Gender: ${verifiedLeadData.gender}
❖Fee: ${verifiedLeadData.fee}
❖Fixed Demo: ${verifiedLeadData.demo_date ? new Date(verifiedLeadData.demo_date).toLocaleDateString('en-IN') : 'Flexible'}
❖Mode: ${verifiedLeadData.mode}
❖Requirement: ${verifiedLeadData.demands?.join(', ') || ''}
❖Apply Here: ${origin}/job-board?tn=${assignedTN}`.trim();
      
      // Copy to Clipboard
      try {
        await navigator.clipboard?.writeText?.(jobCard);
      } catch (err) { /* Clipboard copy failed */ }

      (typeof globalThis !== 'undefined' && typeof globalThis.open === 'function') ? globalThis.open(`https://wa.me/?text=${encodeURIComponent(jobCard)}`, '_blank', 'noopener,noreferrer') : (typeof globalThis !== 'undefined' && globalThis.location ? (globalThis.location.href = `https://wa.me/?text=${encodeURIComponent(jobCard)}`) : null);
      
      setToast({ title: 'Job Posted!', message: 'Text copied to clipboard.' });
      setShowConvertModal(false);
      fetchScopedData(adminProfile.admin_zone);

    } catch (err) {
      uiNotify.alert(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManualLead = async () => {
    if (!manualLead.name || !manualLead.phone || !manualLead.location) return uiNotify.alert("Name, Phone and Location are required");
    setLoading(true);

    // NEW: Try to find existing parent account to link immediately
    let parentId = null;
    const rawPhone = manualLead.phone;
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const formats = [rawPhone];
    if (cleanPhone.length === 10) formats.push(`+91${cleanPhone}`, cleanPhone);
    if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) formats.push(`+${cleanPhone}`, cleanPhone);

    const { data: profile } = await supabase.from('profiles').select('id').in('phone_number', formats).eq('user_role', 'parent').maybeSingle();
    if (profile) parentId = profile.id;

    const { error } = await supabase.from('leads').insert({
      parent_id: parentId,
      raw_data: {
        parent_name: manualLead.name,
        phone_number: manualLead.phone,
        location_name: manualLead.location,
        student_class: manualLead.class,
        subject: manualLead.subject,
        source: 'manual_entry'
      },
      status: 'pending_call'
    });
    
    if (error) uiNotify.alert(error.message);
    else {
      uiNotify.alert(parentId ? "Lead added and linked to existing Parent account!" : "Lead added manually! (No matching parent account found)");
      setShowManualLeadModal(false);
      setManualLead({ name: '', phone: '', location: '', class: '', subject: '' });
      fetchScopedData(adminProfile.admin_zone); // Refresh leads
    }
    setLoading(false);
  };

  const handleBookTuition = async (applicationId, tuitionId, teacher, tuitionNo) => {
    if (!uiNotify.confirm(`Confirm booking for ${teacher.full_name}? This will share parent contact details.`)) return;
    
    const { error: appError } = await supabase.from('applications').update({ status: 'demo_allotted' }).eq('id', applicationId);
    const { error: tuiError } = await supabase.from('tuitions').update({ status: 'demo_allotted' }).eq('id', tuitionId);
    
    if (!appError && !tuiError) {
      uiNotify.alert(`Tuition ${tuitionNo} BOOKED! Parent contact shared with ${teacher.full_name}.`);
      fetchScopedData(adminProfile.admin_zone);
    } else {
      // Booking Error
      uiNotify.alert(`Failed to book tuition. \nApp Error: ${appError?.message}\nTuition Error: ${tuiError?.message}`);
    }
  };

  const handleConfirmTuition = async (applicationId, tuitionId) => {
    if (!uiNotify.confirm("Confirm this tuition officially? This will mark it as 'Confirmed'.")) return;
    setLoading(true);
    try {
        const { error: appError } = await supabase.from('applications').update({ status: 'confirmed', demo_completed_at: new Date() }).eq('id', applicationId);
        if (appError) throw appError;
        const { error: tuiError } = await supabase.from('tuitions').update({ status: 'confirmed' }).eq('id', tuitionId);
        if (tuiError) throw tuiError;
        uiNotify.alert("Tuition Confirmed Successfully!");
        fetchScopedData(adminProfile.admin_zone);
    } catch (e) {
        uiNotify.alert("Error: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  const handleReassignTeacher = async (applicationId, tuitionId) => {
    if (!uiNotify.confirm("Are you sure you want to re-assign this tuition? This will reject the current teacher and open the tuition for new applications.")) return;
    
    setLoading(true);
    try {
        const { error: appError } = await supabase.from('applications').update({ status: 'rejected' }).eq('id', applicationId);
        if (appError) throw appError;
        const { error: tuiError } = await supabase.from('tuitions').update({ status: 'open' }).eq('id', tuitionId);
        if (tuiError) throw tuiError;
        uiNotify.alert("Teacher unassigned. Tuition is now OPEN.");
        fetchScopedData(adminProfile.admin_zone);
    } catch (e) {
        uiNotify.alert("Error: " + e.message);
    } finally {
        setLoading(false);
    }
  };

  const fetchAndManageDemo = async (mode, app, tuition) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('demos')
        .select('*')
        .eq('tuition_id', tuition.id)
        .eq('teacher_id', app.teacher_id)
        .in('status', ['DEMO_SCHEDULED', 'DEMO_POSTPONED'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("No active demo found for this application.");
      
      openDemoModal(mode, data);
    } catch (err) {
      uiNotify.alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDemoModal = (mode, item) => {
    setDemoModalMode(mode);
    setSelectedDemoItem(item);
    setDemoForm({ 
      date: item.demo_date || '', 
      time: item.demo_time || '', 
      remarks: '', 
      status: item.status || '' 
    });
    setShowDemoModal(true);
  };

  const handleDemoSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (demoModalMode === 'schedule') {
        const { error } = await supabase.from('demos').insert({
          tuition_id: selectedDemoItem.tuitionId,
          teacher_id: selectedDemoItem.teacherId,
          parent_id: selectedDemoItem.parentId,
          demo_date: demoForm.date,
          demo_time: demoForm.time,
          status: 'DEMO_SCHEDULED'
        });
        if (error) throw error;
        
        await supabase.from('tuitions').update({ status: 'DEMO_SCHEDULED' }).eq('id', selectedDemoItem.tuitionId);
        await supabase.from('applications').update({ status: 'DEMO_SCHEDULED' }).eq('id', selectedDemoItem.applicationId);
        uiNotify.alert("Demo Scheduled!");

      } else if (demoModalMode === 'postpone') {
        const { error } = await supabase.from('demos').update({
          demo_date: demoForm.date,
          demo_time: demoForm.time,
          status: 'DEMO_POSTPONED',
          remarks: demoForm.remarks,
          postpone_count: (selectedDemoItem.postpone_count || 0) + 1
        }).eq('id', selectedDemoItem.id);
        if (error) throw error;

        // NEW: Sync Postpone Status to Application and Tuition
        await supabase.from('applications')
          .update({ status: 'DEMO_POSTPONED' })
          .match({ tuition_id: selectedDemoItem.tuition_id, teacher_id: selectedDemoItem.teacher_id });
        
        await supabase.from('tuitions')
          .update({ status: 'DEMO_POSTPONED' })
          .eq('id', selectedDemoItem.tuition_id);

        uiNotify.alert("Demo Postponed!");

      } else if (demoModalMode === 'status') {
        const { error } = await supabase.from('demos').update({
          status: demoForm.status,
          remarks: demoForm.remarks
        }).eq('id', selectedDemoItem.id);
        if (error) throw error;

        // NEW: Propagate status to Application and Tuition
        await supabase.from('applications')
          .update({ status: demoForm.status })
          .eq('tuition_id', selectedDemoItem.tuition_id)
          .eq('teacher_id', selectedDemoItem.teacher_id);
        
        await supabase.from('tuitions')
          .update({ status: demoForm.status })
          .eq('id', selectedDemoItem.tuition_id);

        uiNotify.alert("Demo Status Updated!");
      }

      setShowDemoModal(false);
      fetchScopedData(adminProfile.admin_zone);
      fetchDemosByDate(demoFilterDate, adminProfile.admin_zone);
    } catch (e) { uiNotify.alert(e.message); }
    setLoading(false);
  };

  async function runTeacherMatch() {
    setIsMatching(true);
    // Note: match_teachers RPC might return global teachers. We must filter them in JS.
    try {
      const { data } = await supabase.rpc('match_teachers', {
        p_parent_lat: 25.3176, // Default Varanasi center if not provided
        p_parent_long: 82.9739,
        p_gender: matchFilters.gender || null,
        p_board: matchFilters.board || null,
        p_min_experience: matchFilters.minExp,
        p_min_marks: matchFilters.minMarks,
        p_radius_km: matchFilters.radius
      });
      
      // CRITICAL: Filter matches to only show teachers in Admin's Zone
      const scopedMatches = data ? data.filter(t => t.admin_zone === adminProfile.admin_zone) : [];
      setMatchedTeachers(scopedMatches);
    } catch (err) { /* Match error */ }
    setIsMatching(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">Loading Admin Console...</div>;

  return (
    <>
      <Header />
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
            <button onClick={() => setActiveTab('match')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'match' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🔍 Matching Centre</button>
            <button onClick={() => setActiveTab('teachers')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'teachers' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>👨‍🏫 My Teachers</button>
            <button onClick={() => setActiveTab('parents')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'parents' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>👨‍👩‍👧 My Parents</button>
            <button onClick={() => setActiveTab('security')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'security' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🛡️ Security Audit</button>
            <button onClick={() => setActiveTab('reports')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'reports' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📈 Monthly Reports</button>
            <button onClick={() => setActiveTab('blacklist')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'blacklist' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🚫 Blacklist</button>
            <button onClick={() => navigate('/verify-teachers')} className="w-full text-left p-3 rounded-xl transition hover:bg-slate-800 text-green-400 font-bold flex justify-between items-center">
              <span>✅ Verify Teachers</span>
              {underReviewCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{underReviewCount}</span>
              )}
            </button>
          </nav>
          <div className="mt-auto pt-6 border-t border-slate-700">
            <button onClick={handleLogout} className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest">Logout</button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 md:max-h-screen md:overflow-y-auto">
          
          {/* LEAD CONVERSION MODAL */}
          {showConvertModal && (
            <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-black uppercase italic mb-6">Post Tuition Job ({adminProfile?.admin_zone})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* 1. Location & School */}
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Nearby Landmark</label>
                      <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.nearby} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, nearby: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Student's School</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.school} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, school: e.target.value})}>
                        <option value="">Select School...</option>
                        {SCHOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>

                  {/* 2. Board & Class */}
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Board</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.board} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, board: e.target.value})}>
                        {BOARD_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Days/Week</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.days} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, days: e.target.value})}>
                        {DAYS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Duration</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.duration} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, duration: e.target.value})}>
                        {DURATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Timings</label>
                      <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" placeholder="e.g. After 4 PM" value={verifiedLeadData.timings} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, timings: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Fixed Demo Date</label>
                      <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.demo_date} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, demo_date: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Gender Preference</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.gender} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, gender: e.target.value})}>
                        <option value="Any">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Verified Monthly Fee (₹)</label>
                      <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.fee} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, fee: e.target.value})} />
                  </div>
                  <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase">Mode</label>
                      <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.mode} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, mode: e.target.value})}>
                        {MODE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                  </div>
                  <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Class (Multi-Select)</label>
                      <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto border p-2 rounded-xl">
                          {CLASS_OPTIONS.map(c => (
                          <button 
                            key={c} 
                            onClick={() => {
                              const exists = verifiedLeadData.class.includes(c);
                              setVerifiedLeadData({
                                ...verifiedLeadData, 
                                class: exists ? verifiedLeadData.class.filter(item => item !== c) : [...verifiedLeadData.class, c]
                              })
                            }}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition ${verifiedLeadData.class.includes(c) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-slate-400 hover:border-blue-300'}`}
                          >{c}</button>
                          ))}
                      </div>
                  </div>

                  {/* 3. Subjects */}
                  <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Subjects (Multi-Select)</label>
                      <input 
                        type="text" 
                        placeholder="Search subjects..." 
                        className="w-full p-2 mb-2 bg-slate-50 border border-slate-200 rounded text-xs"
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2 mt-2 max-h-40 overflow-y-auto border p-2 rounded-xl">
                          {SUBJECT_OPTIONS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase())).map(s => (
                          <button 
                            key={s} 
                            onClick={() => {
                              const exists = verifiedLeadData.subject.includes(s);
                              setVerifiedLeadData({
                                ...verifiedLeadData, 
                                subject: exists ? verifiedLeadData.subject.filter(item => item !== s) : [...verifiedLeadData.subject, s]
                              })
                            }}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition ${verifiedLeadData.subject.includes(s) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-slate-400 hover:border-blue-300'}`}
                          >{s}</button>
                          ))}
                      </div>
                  </div>
                  <div className="md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Demands</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                          {DEMAND_OPTIONS.map(d => (
                          <button 
                            key={d} 
                            onClick={() => {
                              const exists = verifiedLeadData.demands.includes(d);
                              setVerifiedLeadData({
                                ...verifiedLeadData, 
                                demands: exists ? verifiedLeadData.demands.filter(item => item !== d) : [...verifiedLeadData.demands, d]
                              })
                            }}
                            className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition ${verifiedLeadData.demands.includes(d) ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border text-slate-400 hover:border-blue-300'}`}
                          >{d}</button>
                          ))}
                      </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={resetLeadForm} className="flex-1 p-4 font-black text-xs text-red-400 uppercase hover:bg-red-50 rounded-2xl">Reset</button>
                  <button onClick={() => setShowConvertModal(false)} className="flex-1 p-4 font-black text-xs text-slate-400 uppercase">Cancel</button>
                  <button onClick={handleConvertToTuition} className="flex-1 bg-blue-600 text-white p-4 rounded-2xl font-black text-xs uppercase shadow-xl">Post Official Tuition</button>
                </div>
              </div>
            </div>
          )}

          {/* MANUAL LEAD MODAL */}
          {showManualLeadModal && (
            <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-black uppercase italic mb-6">Add Phone Lead</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Parent Name</label>
                    <input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={manualLead.name} onChange={e => setManualLead({...manualLead, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Phone Number</label>
                    <input type="tel" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={manualLead.phone} onChange={e => setManualLead({...manualLead, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Location ({adminProfile?.admin_zone})</label>
                    <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={manualLead.location} onChange={e => setManualLead({...manualLead, location: e.target.value})}>
                      <option value="">Select Location...</option>
                      {locations.filter(l => l.admin_zone === adminProfile?.admin_zone).map(l => <option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Class" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={manualLead.class} onChange={e => setManualLead({...manualLead, class: e.target.value})} />
                    <input type="text" placeholder="Subject" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={manualLead.subject} onChange={e => setManualLead({...manualLead, subject: e.target.value})} />
                  </div>
                  <button onClick={handleAddManualLead} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">Add Lead</button>
                  <button onClick={() => setShowManualLeadModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase mt-2">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* DEMO MODAL */}
          {showDemoModal && (
            <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-black uppercase italic mb-6">
                  {demoModalMode === 'schedule' ? 'Schedule Demo' : demoModalMode === 'postpone' ? 'Postpone Demo' : 'Update Status'}
                </h3>
                <div className="space-y-4">
                  {(demoModalMode === 'schedule' || demoModalMode === 'postpone') && (
                    <>
                      <input type="date" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={demoForm.date} onChange={e => setDemoForm({...demoForm, date: e.target.value})} />
                      <input type="time" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={demoForm.time} onChange={e => setDemoForm({...demoForm, time: e.target.value})} />
                    </>
                  )}
                  {demoModalMode === 'status' && (
                    <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={demoForm.status} onChange={e => setDemoForm({...demoForm, status: e.target.value})}>
                      <option value="DEMO_SCHEDULED">Scheduled</option>
                      <option value="DEMO_COMPLETED">Completed</option>
                      <option value="DEMO_CANCELLED">Cancelled</option>
                    </select>
                  )}
                  <textarea placeholder="Remarks..." className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" rows="3" value={demoForm.remarks} onChange={e => setDemoForm({...demoForm, remarks: e.target.value})}></textarea>
                  <button onClick={handleDemoSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">Confirm</button>
                  <button onClick={() => setShowDemoModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase mt-2">Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* TOAST NOTIFICATION */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-[300] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-300">
              <div className="bg-green-500 rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <p className="font-bold text-sm">{toast.title}</p>
                <p className="text-xs text-slate-400">{toast.message}</p>
              </div>
            </div>
          )}

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
              
              {/* REVIEW GENERATOR WIDGET */}
              <div className="mt-6">
                <ReviewGenerator />
              </div>
            </div>
          )}

          {/* TAB: LEADS */}
          {activeTab === 'leads' && (
            <div>
              <h2 className="text-2xl font-black">New Leads ({leads.length})</h2>
              <div className="mt-4 grid gap-4">
                {leads.length === 0 && <div className="p-6 bg-white rounded-xl">No pending leads.</div>}
                {leads.map(l => (
                  <div key={l.id} className="p-4 bg-white rounded-xl shadow-sm flex justify-between items-center">
                    <div>
                      <div className="font-bold">{l.raw_data?.parent_name || l.raw_data?.phone_number}</div>
                      <div className="text-sm text-slate-500">{l.raw_data?.location_name} • {l.raw_data?.student_class} • {l.raw_data?.subject}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedLead(l); setShowConvertModal(true); }} className="px-3 py-2 bg-blue-600 text-white rounded">Post Tuition</button>
                      <button onClick={() => { setSelectedLead(l); setShowManualLeadModal(true); }} className="px-3 py-2 border rounded">Link / Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: INQUIRY & BOOKING */}
          {activeTab === 'allot' && (
            <div>
              <h2 className="text-2xl font-black">Inquiry & Booking ({pendingInquiries.length})</h2>
              <div className="mt-4 grid gap-4">
                {pendingInquiries.length === 0 && <div className="p-6 bg-white rounded-xl">No open inquiries.</div>}
                {pendingInquiries.map(t => (
                  <div key={t.id} className="p-4 bg-white rounded-xl shadow-sm">
                    <div className="flex justify-between">
                      <div>
                        <div className="font-bold">Tuition #{t.tuition_no || t.id} — {t.subject}</div>
                        <div className="text-sm text-slate-500">{t.location_name} • {t.student_class}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => uiNotify.alert('Open booking flow')}>Book</button>
                        <button className="px-3 py-2 border rounded" onClick={() => uiNotify.alert('Open applications')}>Applications</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: DEMOS */}
          {activeTab === 'demos' && (
            <div>
              <h2 className="text-2xl font-black">Demo Manager ({demos.length})</h2>
              <div className="mt-4 grid gap-4">
                {demos.length === 0 && <div className="p-6 bg-white rounded-xl">No demos for selected date.</div>}
                {demos.map(d => (
                  <div key={d.id} className="p-4 bg-white rounded-xl shadow-sm flex justify-between">
                    <div>
                      <div className="font-bold">{d.tuition?.subject || 'Demo'}</div>
                      <div className="text-sm text-slate-500">{d.demo_date} {d.demo_time}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openDemoModal('status', d)} className="px-3 py-2 bg-blue-600 text-white rounded">Update</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MATCHING */}
          {activeTab === 'match' && (
            <div>
              <h2 className="text-2xl font-black">Matching Centre</h2>
              <div className="mt-4">
                <button onClick={runTeacherMatch} className="px-4 py-2 bg-blue-600 text-white rounded">Run Match</button>
                <div className="mt-4 grid gap-3">
                  {isMatching && <div>Matching in progress…</div>}
                  {matchedTeachers.map(t => (
                    <div key={t.id} className="p-3 bg-white rounded shadow-sm">{t.full_name || t.name} — {t.admin_zone}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: MY TEACHERS */}
          {activeTab === 'teachers' && (
            <div>
              <h2 className="text-2xl font-black">My Teachers ({myTeachers.length})</h2>
              <div className="mt-4 grid gap-3">
                {myTeachers.map(t => (
                  <div key={t.id} className="p-3 bg-white rounded shadow-sm flex justify-between items-center">
                    <div>
                      <div className="font-bold">{t.full_name}</div>
                      <div className="text-sm text-slate-500">{t.phone_number}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleVerifyTeacher(t)} className="px-3 py-2 bg-green-600 text-white rounded">Toggle Verify</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: MY PARENTS */}
          {activeTab === 'parents' && (
            <div>
              <h2 className="text-2xl font-black">My Parents ({myParents.length})</h2>
              <div className="mt-4 grid gap-3">
                {myParents.map(p => (
                  <div key={p.id} className="p-3 bg-white rounded shadow-sm">
                    <div className="font-bold">{p.full_name}</div>
                    <div className="text-sm text-slate-500">{p.phone_number}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SECURITY */}
          {activeTab === 'security' && (
            <div>
              <h2 className="text-2xl font-black">Security Audit</h2>
              <div className="mt-4">
                <h3 className="font-bold">Location History</h3>
                <div className="mt-2 grid gap-2">
                  {locationHistory.map(h => (
                    <div key={h.id} className="p-2 bg-white rounded">{h.profiles?.full_name} — {h.changed_at}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <div>
              <h2 className="text-2xl font-black">Monthly Reports</h2>
              <div className="mt-4 grid gap-2">
                {reportData.length === 0 && <div className="p-4 bg-white rounded">No reports yet.</div>}
                {reportData.map(r => <div key={r.id} className="p-3 bg-white rounded">{r.month} — ₹{r.revenue}</div>)}
              </div>
            </div>
          )}

          {/* TAB: BLACKLIST */}
          {activeTab === 'blacklist' && (
            <div>
              <h2 className="text-2xl font-black">Blacklist ({blacklist.length})</h2>
              <div className="mt-4 grid gap-2">
                {blacklist.map(b => (
                  <div key={b.id} className="p-3 bg-white rounded flex justify-between items-center">
                    <div>
                      <div className="font-bold">{b.phone || b.email}</div>
                      <div className="text-sm text-slate-500">{b.reason}</div>
                    </div>
                    <div>
                      <button onClick={() => handleDeleteBlacklist(b.id)} className="px-3 py-2 bg-red-500 text-white rounded">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-white p-4 rounded">
                <h3 className="font-bold">Add Quick Blacklist</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <input placeholder="Phone" value={newBlacklistEntry.phone} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, phone: e.target.value})} className="p-2 border rounded" />
                  <input placeholder="Email" value={newBlacklistEntry.email} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, email: e.target.value})} className="p-2 border rounded" />
                  <button onClick={handleAddBlacklist} className="px-4 py-2 bg-blue-600 text-white rounded">Add</button>
                </div>
              </div>
            </div>
          )}

      </main>
      </div>
      <Footer />
    </>
  );
}
