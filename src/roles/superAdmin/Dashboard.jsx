import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/utils/supabaseClient';
import Header from '../../shared/components/Header';
import Footer from '../../shared/components/Footer';

/**
 * PARAM TUITIONS - SUPER ADMIN MASTER CONTROL
 * Full version with Performance Funnel, Enhanced Security Audit, 
 * Teacher Rankings, History Modal, Grades, Banning Logic, and Revenue Ledger.
 */

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Existing Data States
  const [stats, setStats] = useState({ teachers: 0, tuitions: 0, demos: 0 });
  const [missedClasses, setMissedClasses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [pendingInquiries, setPendingInquiries] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [bypassAlerts, setBypassAlerts] = useState([]);
  const [locationHistory, setLocationHistory] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allParents, setAllParents] = useState([]);

  // NEW: Review Parameters State
  const [reviewParams, setReviewParams] = useState([]);
  const [newReviewParam, setNewReviewParam] = useState({ role: 'parent_to_teacher', category: '', parameter: '' });

  // Performance & Security States
  const [adminFunnel, setAdminFunnel] = useState([]);
  const [suspiciousCancellations, setSuspiciousCancellations] = useState([]);

  // Teacher Ranking & History States
  const [teacherRankings, setTeacherRankings] = useState([]);
  const [selectedTeacherHistory, setSelectedTeacherHistory] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [performanceScores, setPerformanceScores] = useState([]);
  
  // NEW: Teacher Score Card State
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreData, setScoreData] = useState({
    academic: 0, teaching: 0, communication: 0, experience: 0, 
    feedback: 0, punctuality: 0, ethics: 0,
    cancellation_penalty: 0, missed_demo_penalty: 0
  });

  // NEW: Blacklist State
  const [blacklist, setBlacklist] = useState([]);
  const [newBlacklistEntry, setNewBlacklistEntry] = useState({ role: 'teacher', phone: '', email: '', location: '', reason: '' });
  const [blacklistSearch, setBlacklistSearch] = useState('');

  // NEW: Lead Processing States
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
    admin_zone: 'Admin 1',
    nearby: '',
    board: 'CBSE',
    days: '6 days/week',
    duration: '1 hr',
    timings: '',
    gender: 'Any',
    mode: "Student's Home",
    class: [],
    subject: [],
    tuition_no: '',
    demo_date: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // NEW: Demo Management States
  const [demos, setDemos] = useState([]);
  const [demoFilterStartDate, setDemoFilterStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [demoFilterEndDate, setDemoFilterEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [demoFilterAdmin, setDemoFilterAdmin] = useState('All');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoModalMode, setDemoModalMode] = useState('schedule'); // 'schedule', 'postpone', 'status'
  const [selectedDemoItem, setSelectedDemoItem] = useState(null); // For demo actions
  const [demoForm, setDemoForm] = useState({ date: '', time: '', remarks: '', status: '' });

  // NEW: REVENUE & LEDGER STATES
  const [revenueStats, setRevenueStats] = useState({ total: 0, bureau: 0, pending: 0 });
  const [ledgerData, setLedgerData] = useState([]);

  // NEW: CONTENT MANAGEMENT STATES
  const [blogs, setBlogs] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [formConfig, setFormConfig] = useState({});
  const [editingBlog, setEditingBlog] = useState(null); // null = list mode, {} = create mode, {id...} = edit mode
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

  // State for new Holiday form
  const [newEvent, setNewEvent] = useState({ event_name: '', date: '' });
  
  // State for the teacher currently being audited in the modal
  const [auditingTeacherId, setAuditingTeacherId] = useState(null);

  // Matching Centre States
  const [matchFilters, setMatchFilters] = useState({ gender: '', board: '', minMarks: 0, minExp: 0, radius: 5, timeSlot: '' });
  const [matchedTeachers, setMatchedTeachers] = useState([]);
  const [isMatching, setIsMatching] = useState(false);

  // NEW: System Settings States for Block Management
  const [admin1Phone, setAdmin1Phone] = useState('8188005373');
  const [admin2Phone, setAdmin2Phone] = useState('8756525373');
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrFile, setQrFile] = useState(null);

  const timeSlots = [
    "6:00 AM - 9:00 AM",
    "9:00 AM - 12:00 PM",
    "12:00 PM - 3:00 PM",
    "3:00 PM - 6:00 PM",
    "6:00 PM - 9:00 PM",
  ];

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
    document.title = "Super Admin Dashboard | Param Tuition Bureau";
    fetchMasterData();
    fetchSystemSettings(); // Load TN and Phone data
    fetchLeads();
    fetchDemos();
  }, []);

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

  // Toast Timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchLeads() {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'pending_call')
      .order('created_at', { ascending: false });
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

    const { data } = await supabase
      .from('demos')
      .select(`*, teacher:profiles!teacher_id(full_name), parent:profiles!parent_id(full_name), tuition:tuitions(subject, student_class, location_name, admin_zone)`)
      .gte('demo_date', startDate)
      .lte('demo_date', endDate)
      .order('demo_date', { ascending: true })
      .order('demo_time', { ascending: true });
    
    setDemos(data || []);
  }

  async function fetchMasterData() {
    setLoading(true);
    try {
      // 1. Fetch Standard Stats
      const { count: tCount } = await supabase.from('teacher_details').select('*', { count: 'exact', head: true });
      const { count: iCount } = await supabase.from('tuitions').select('*', { count: 'exact', head: true }).eq('status', 'open');
      const { count: dCount } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'demo_allotted');
      setStats({ teachers: tCount, tuitions: iCount, demos: dCount });

      // 2. Fetch Varanasi Locations for Area Picker
      const { data: locData } = await supabase.from('locations').select('*').order('location_name', { ascending: true });
      setLocations(locData || []);

      // 3. Fetch Pending Inquiries (Expanded for Booking Flow)
      const { data: inqs } = await supabase
        .from('tuitions')
        .select('*, parent:profiles!parent_id(latitude, longitude), applications(id, teacher_id, status, created_at, teacher:profiles(id, full_name, phone_number, email, latitude, longitude, teacher_details(*)))')
        .in('status', ['open', 'demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'booked', 'BOOKED', 'demo_started'])
        .order('created_at', { ascending: false });
      setPendingInquiries(inqs || []);

      // 4. Fetch Holiday Calendar
      const { data: hols } = await supabase.from('holidays').select('*').order('date');
      setHolidays(hols || []);

      // 5. Fetch Missed Class Requests
      const { data: missed } = await supabase.from('missed_classes').select('*, teacher:profiles(full_name), parent:profiles(full_name)');
      setMissedClasses(missed || []);

      // 6. Fetch Bypass Alerts from the SQL View
      const { data: alerts } = await supabase.from('bypass_alerts').select('*');
      setBypassAlerts(alerts || []);

      // 7. Fetch Location Change History Audit Logs
      const { data: history } = await supabase
        .from('location_history')
        .select(`*, profiles(full_name, user_role, phone_number)`)
        .order('changed_at', { ascending: false })
        .limit(30);
      setLocationHistory(history || []);

      // 8. Fetch Funnel Performance Data
      const { data: funnel } = await supabase.from('admin_funnel_comparison').select('*');
      setAdminFunnel(funnel || []);

      // 9. Fetch Suspicious Cancellations for Security Tab
      const { data: susData } = await supabase
        .from('cancellation_logs')
        .select(`
          *,
          tuition:tuitions(subject, location_name, parent:profiles(full_name, phone_number)),
          admin:profiles(full_name)
        `)
        .eq('is_suspicious', true)
        .order('created_at', { ascending: false });
      setSuspiciousCancellations(susData || []);

      // 10. Fetch Teacher Rankings
      const { data: rankings } = await supabase.from('teacher_rankings').select('*');
      setTeacherRankings(rankings || []);

      // 11. FETCH TEACHER PERFORMANCE GRADES (A+, A, B, C)
      const { data: scores } = await supabase.from('teacher_performance_scores').select('*');
      setPerformanceScores(scores || []);

      // 12. NEW: FETCH REVENUE LEDGER & CALCULATE PROFIT
      const { data: ledger } = await supabase.from('bureau_ledger').select('*, tuition:tuitions(subject)');
      setLedgerData(ledger || []);
      const totalRev = ledger?.reduce((acc, curr) => acc + Number(curr.total_fee), 0) || 0;
      const bureauRev = ledger?.reduce((acc, curr) => acc + Number(curr.bureau_commission), 0) || 0;
      const pendingCount = ledger?.filter(l => l.payment_status === 'pending').length || 0;
      setRevenueStats({ total: totalRev, bureau: bureauRev, pending: pendingCount });

      // 13. NEW: FETCH BLOGS
      const { data: blogData } = await supabase.from('blogs').select('*').order('created_at', { ascending: false });
      setBlogs(blogData || []);

      // 14. NEW: FETCH GALLERY
      const { data: galleryData } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      setGalleryImages(galleryData || []);

      // 15. NEW: FETCH FORM CONFIG
      const { data: formData } = await supabase.from('system_settings').select('*').eq('key', 'form_config').maybeSingle();
      setFormConfig(formData?.value ? JSON.parse(formData.value) : { enquiryEnabled: true, demoEnabled: true, adminPhone: '918756525373' });

      // 16. NEW: FETCH FAQS
      const { data: faqData } = await supabase.from('faqs').select('*').order('id');
      setFaqs(faqData || []);

      // 17. NEW: FETCH TERMS
      const { data: termsParent } = await supabase.from('site_content').select('content').eq('key', 'terms_parent').maybeSingle();
      if (termsParent) setTermsParentContent(termsParent.content);
      const { data: termsTeacher } = await supabase.from('site_content').select('content').eq('key', 'terms_teacher').maybeSingle();
      if (termsTeacher) setTermsTeacherContent(termsTeacher.content);
      const { data: termsData } = await supabase.from('site_content').select('content').eq('key', 'terms').maybeSingle();
      if (termsData) setTermsContent(termsData.content);
      const { data: dosAndDontsData } = await supabase.from('site_content').select('content').eq('key', 'dos_and_donts').maybeSingle();
      if (dosAndDontsData) setDosAndDontsContent(dosAndDontsData.content);

      // 18. NEW: FETCH ALL TEACHERS FOR LIST
      const { data: allT } = await supabase.from('profiles').select('*, teacher_details(*)').eq('user_role', 'teacher').order('created_at', { ascending: false });
      setAllTeachers(allT || []);

      // 19. NEW: FETCH ALL PARENTS FOR LIST
      const { data: allP } = await supabase.from('profiles').select('*').eq('user_role', 'parent').order('created_at', { ascending: false });
      setAllParents(allP || []);

      // 20. NEW: FETCH REVIEW PARAMETERS
      const { data: revParams } = await supabase.from('review_parameters').select('*').order('category');
      setReviewParams(revParams || []);

      // 21. NEW: FETCH BLACKLIST
      const { data: blData } = await supabase.from('blacklist').select('*').order('created_at', { ascending: false });
      setBlacklist(blData || []);

    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // NEW: HANDLE TEACHER BANNING
  const handleVerifyTeacher = async (teacher) => {
    const details = Array.isArray(teacher.teacher_details) ? teacher.teacher_details[0] : teacher.teacher_details;
    if (!details) return alert("Cannot verify: Registration incomplete.");
    
    // NEW: Check setup_completed to ensure documents are uploaded
    if (!details.setup_completed && !details.is_verified) {
        if (!window.confirm("⚠️ SYSTEM WARNING: This teacher's profile is marked as INCOMPLETE (missing documents or details).\n\nDo you want to FORCE VERIFY them anyway?")) {
            return;
        }
    }

    const currentStatus = details.is_verified;
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'UNVERIFY' : 'VERIFY'} ${teacher.full_name}?`)) return;

    const { error } = await supabase
      .from('teacher_details')
      .update({ 
        is_verified: !currentStatus,
        verified_at: !currentStatus ? new Date() : null
      })
      .eq('id', teacher.id);

    if (error) alert("Error: " + error.message);
    else {
      fetchMasterData();
    }
  };

  const handleBanTeacher = async () => {
    if (!window.confirm("CRITICAL: Are you sure you want to PERMANENTLY BAN this teacher? They will lose all access immediately.")) return;
    
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', auditingTeacherId);

    if (!error) {
      alert("Teacher blacklisted successfully.");
      setShowHistoryModal(false);
      fetchMasterData();
    }
  };

  // NEW: Score Card Logic
  const openScoreModal = (teacher) => {
    setSelectedTeacherForScore(teacher);
    // Reset or fetch existing score if available
    const existing = performanceScores.find(s => s.teacher_id === teacher.id);
    if (existing) {
      setScoreData({
        academic: existing.academic_score || 0,
        teaching: existing.teaching_score || 0,
        communication: existing.communication_score || 0,
        experience: existing.experience_score || 0,
        feedback: existing.feedback_score || 0,
        punctuality: existing.punctuality_score || 0,
        ethics: existing.ethics_score || 0,
        cancellation_penalty: existing.cancellation_penalty || 0,
        missed_demo_penalty: existing.missed_demo_penalty || 0
      });
    } else {
      // Calculate default academic score from marks (Average of 10th, 12th, Grad) scaled to 20
      let calculatedAcademic = 0;
      const details = Array.isArray(teacher.teacher_details) ? teacher.teacher_details[0] : teacher.teacher_details;
      
      if (details) {
        const parseMarks = (val) => {
            if (!val) return 0;
            let num = parseFloat(val);
            if (isNaN(num)) return 0;
            if (num <= 10) num = num * 9.5; // Convert CGPA to %
            return num;
        };

        const scores = [
            parseMarks(details.class_10_marks),
            parseMarks(details.class_12_marks),
            parseMarks(details.graduation_marks),
            parseMarks(details.post_graduation_marks)
        ].filter(s => s > 0);

        if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            calculatedAcademic = Math.min(Math.round((avg / 100) * 20), 20);
        }
      }

      setScoreData({ academic: calculatedAcademic, teaching: 0, communication: 0, experience: 0, feedback: 0, punctuality: 0, ethics: 0, cancellation_penalty: 0, missed_demo_penalty: 0 });
    }
    setShowScoreModal(true);
  };

  const handleScoreSubmit = async () => {
    const positiveScore = Number(scoreData.academic) + Number(scoreData.teaching) + Number(scoreData.communication) + Number(scoreData.experience) + Number(scoreData.feedback) + Number(scoreData.punctuality) + Number(scoreData.ethics);
    const penalties = Number(scoreData.cancellation_penalty) + Number(scoreData.missed_demo_penalty);
    const total = Math.max(0, positiveScore - penalties);

    let grade = 'Improvement Required';
    if (total >= 90) grade = 'Elite Teacher';
    else if (total >= 75) grade = 'Preferred Teacher';
    else if (total >= 60) grade = 'Active Teacher';

    const payload = {
      teacher_id: selectedTeacherForScore.id,
      ...scoreData, // maps to academic_score, etc. (ensure DB columns match or map manually)
      total_score: total,
      tutor_grade: grade,
      updated_at: new Date()
    };

    // Note: You need to ensure the table 'teacher_performance_scores' has these columns.
    // Mapping state keys to DB columns:
    const dbPayload = {
      teacher_id: selectedTeacherForScore.id,
      academic_score: scoreData.academic,
      teaching_score: scoreData.teaching,
      communication_score: scoreData.communication,
      experience_score: scoreData.experience,
      feedback_score: scoreData.feedback,
      punctuality_score: scoreData.punctuality,
      ethics_score: scoreData.ethics,
      cancellation_penalty: scoreData.cancellation_penalty,
      missed_demo_penalty: scoreData.missed_demo_penalty,
      total_score: total,
      tutor_grade: grade
    };

    const { error } = await supabase.from('teacher_performance_scores').upsert(dbPayload, { onConflict: 'teacher_id' });
    
    if (error) alert("Error saving score: " + error.message);
    else {
      alert(`Score Saved! Total: ${total}/100 (${grade})`);
      setShowScoreModal(false);
      fetchMasterData();
    }
  };

  // NEW: Blacklist Handlers
  const handleAddBlacklist = async () => {
    if (!newBlacklistEntry.phone && !newBlacklistEntry.email) return alert("Either Phone or Email is required.");
    const { error } = await supabase.from('blacklist').insert({ ...newBlacklistEntry, added_by: 'Super Admin' });
    if (error) alert("Error adding to blacklist: " + error.message);
    else {
      alert("User blacklisted successfully.");
      setNewBlacklistEntry({ role: 'teacher', phone: '', email: '', location: '', reason: '' });
      fetchMasterData();
    }
  };

  const handleDeleteBlacklist = async (id) => {
    if (!window.confirm("Remove this user from blacklist?")) return;
    await supabase.from('blacklist').delete().eq('id', id);
    fetchMasterData();
  };

  const handleQuickBlacklist = async (user, role) => {
    const reason = prompt(`Confirm Blacklist for ${user.full_name}? Enter reason:`, "Fraud/Policy Violation");
    if (!reason) return;

    const { error } = await supabase.from('blacklist').insert({
      role: role,
      phone: user.phone_number,
      email: user.email,
      location: user.admin_zone,
      reason: reason,
      added_by: 'Super Admin'
    });

    if (error) alert("Error adding to blacklist: " + error.message);
    else {
      alert("User blacklisted successfully.");
      fetchMasterData();
    }
  };

  // NEW: Review Parameter Handlers
  const handleAddReviewParam = async () => {
    if (!newReviewParam.category || !newReviewParam.parameter) return alert("Category and Parameter are required");
    const { error } = await supabase.from('review_parameters').insert(newReviewParam);
    if (error) alert("Error adding parameter: " + error.message);
    else {
      alert("Parameter added!");
      setNewReviewParam({ ...newReviewParam, parameter: '' }); // Keep category/role for easier entry
      fetchMasterData();
    }
  };

  const handleDeleteReviewParam = async (id) => {
    if (!window.confirm("Delete this parameter?")) return;
    await supabase.from('review_parameters').delete().eq('id', id);
    fetchMasterData();
  };

  const handleSyncSettings = async () => {
    setLoading(true);
    
    let finalQrUrl = qrCodeUrl;

    if (qrFile) {
      try {
        const fileExt = qrFile.name.split('.').pop();
        const fileName = `upi_qr_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('website-assets').upload(`payment/${fileName}`, qrFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('website-assets').getPublicUrl(`payment/${fileName}`);
        finalQrUrl = publicUrl;
        setQrCodeUrl(publicUrl);
      } catch (error) {
        alert("QR Upload Failed: " + error.message);
      }
    }

    const updates = [
      { key: 'admin_1_phone', value: admin1Phone },
      { key: 'admin_2_phone', value: admin2Phone },
      { key: 'upi_id', value: upiId },
      { key: 'qr_code_url', value: finalQrUrl }
    ];

    for (const item of updates) {
      await supabase.from('system_settings').upsert(item);
    }
    alert("System settings synchronized successfully.");
    setLoading(false);
  };

  // Drill-down function
  const viewTeacherDetails = async (teacherId) => {
    setAuditingTeacherId(teacherId);
    const { data } = await supabase.rpc('get_teacher_history', { p_teacher_id: teacherId });
    setSelectedTeacherHistory(data);
    setShowHistoryModal(true);
  };

  // --- Handlers (Zone Mapping, Matching, Allotting, Locations) ---
  const updateLocationZone = async (locId, newZone) => {
    const { error } = await supabase.from('locations').update({ admin_zone: newZone }).eq('id', locId);
    if (!error) { 
      alert(`Area reassigned to ${newZone} successfully!`); 
      fetchMasterData(); 
    }
  };

  const resetLeadForm = () => {
    setVerifiedLeadData({ 
      fee: '', 
      school: '', 
      demands: [], 
      admin_zone: 'Admin 1',
      nearby: '', 
      board: 'CBSE',
      days: '6 days/week',
      duration: '1 hr',
      timings: '',
      gender: 'Any',
      mode: "Student's Home",
      class: [],
      subject: []
    });
  };

  const handleDuplicateTuition = (tuition) => {
    setVerifiedLeadData({
      fee: tuition.fee_amount || '',
      school: tuition.school_name || '',
      demands: tuition.specific_demands || [],
      admin_zone: tuition.admin_zone,
      nearby: tuition.nearby_landmark || '',
      board: tuition.medium || 'CBSE',
      days: '6 days/week',
      duration: '1 hr',
      timings: '',
      gender: 'Any',
      mode: tuition.teaching_mode || "Student's Home",
      class: tuition.student_class ? tuition.student_class.split(', ') : [],
      subject: tuition.subject ? tuition.subject.split(', ') : [],
      tuition_no: ''
    });

    setSelectedLead({
      id: null,
      parent_id: tuition.parent_id,
      raw_data: {
        location_name: tuition.location_name,
        student_class: tuition.student_class,
        subject: tuition.subject,
        phone_number: ''
      }
    });

    setShowConvertModal(true);
  };

  const handleConvertToTuition = async () => {
    if (!verifiedLeadData.fee || !verifiedLeadData.school) return alert("Verify Fee and School first.");
    setLoading(true);

    // 0. AUTO-LINK: If parent_id is missing, try to find a profile with the same phone number
    let finalParentId = selectedLead.parent_id;

    if (!finalParentId && selectedLead.raw_data?.phone_number) {
      const rawPhone = selectedLead.raw_data.phone_number;
      const cleanPhone = rawPhone.replace(/\D/g, '');
      const formats = [rawPhone];
      if (cleanPhone.length === 10) formats.push(`+91${cleanPhone}`, cleanPhone);
      if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) formats.push(`+${cleanPhone}`, cleanPhone);

      const { data: profile } = await supabase.from('profiles').select('id').in('phone_number', formats).maybeSingle();
      
      if (profile) {
        finalParentId = profile.id;
        await supabase.from('leads').update({ parent_id: finalParentId }).eq('id', selectedLead.id);
      }
    }

    if (!finalParentId) {
      if (!window.confirm("No registered Parent account found.\n\nDo you want to proceed anyway?")) {
        setLoading(false);
        return;
      }
    }

    try {
      let assignedTN = verifiedLeadData.tuition_no;
      if (!assignedTN) {
         throw new Error("Tuition Number is required.");
      }

      // 2. Post the official record with the locked TN
      const { error: insertError } = await supabase.from('tuitions').insert([{
        tuition_no: assignedTN,
        parent_id: finalParentId,
        subject: verifiedLeadData.subject.length > 0 ? verifiedLeadData.subject.join(', ') : selectedLead.raw_data.subject,
        student_class: verifiedLeadData.class.length > 0 ? verifiedLeadData.class.join(', ') : selectedLead.raw_data.student_class,
        location_name: selectedLead.raw_data.location_name,
        nearby_landmark: verifiedLeadData.nearby,
        school_name: verifiedLeadData.school,
        medium: verifiedLeadData.board,
        fee_amount: verifiedLeadData.fee,
        teaching_mode: verifiedLeadData.mode || "Student's Home",
        specific_demands: verifiedLeadData.demands, // Ensure this column is text[] or jsonb in Supabase
        admin_zone: verifiedLeadData.admin_zone,
        status: 'open',
        is_posted: true,
        preferred_demo_date: verifiedLeadData.demo_date || null
      }]);

      if (insertError) throw insertError;

      // 3. Mark the original lead as converted
      if (selectedLead.id) {
        await supabase.from('leads').update({ status: 'converted' }).eq('id', selectedLead.id);
      }

      // 4. Generate the Varanasi Job Card format
      const adminPhone = verifiedLeadData.admin_zone === 'Admin 1' ? admin1Phone : admin2Phone;
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
❖Apply Here: ${window.location.origin}/job-board?tn=${assignedTN}`.trim();

      // Copy to Clipboard
      try {
        await navigator.clipboard.writeText(jobCard);
      } catch (err) { console.error("Clipboard copy failed", err); }

      // 5. Open WhatsApp and UI cleanup
      window.open(`https://wa.me/?text=${encodeURIComponent(jobCard)}`, '_blank');
      
      setToast({ title: 'Job Posted!', message: 'Text copied to clipboard.' });
      setShowConvertModal(false);
      fetchLeads();
      fetchMasterData();

    } catch (err) {
      alert(`Operation Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  async function runTeacherMatch(lat, long) {
    setIsMatching(true);
    try {
      const { data } = await supabase.rpc('match_teachers', {
        p_parent_lat: lat || 25.3176,
        p_parent_long: long || 82.9739,
        p_gender: matchFilters.gender || null,
        p_board: matchFilters.board || null,
        p_min_experience: matchFilters.minExp,
        p_min_marks: matchFilters.minMarks,
        p_radius_km: matchFilters.radius,
        p_time_slot: matchFilters.timeSlot || null // Requires RPC update
      });
      if (data) setMatchedTeachers(data);
    } catch (err) { console.error(err); }
    setIsMatching(false);
  }

  // --- NEW: TUITION ALLOTMENT & DEMO LOGIC ---

  const handleBookTuition = async (applicationId, tuitionId, teacher, tuitionNo) => {
    if (!window.confirm(`Confirm booking for ${teacher.full_name}? This will share parent contact details.`)) return;
    
    const { error: appError } = await supabase.from('applications').update({ status: 'demo_allotted' }).eq('id', applicationId);
    const { error: tuiError } = await supabase.from('tuitions').update({ status: 'demo_allotted' }).eq('id', tuitionId);
    
    if (!appError && !tuiError) {
      alert(`Tuition ${tuitionNo} BOOKED! Parent contact shared with ${teacher.full_name}.`);
      fetchMasterData();
    } else {
      console.error("Booking Error:", appError, tuiError);
      alert(`Failed to book tuition. \nApp Error: ${appError?.message}\nTuition Error: ${tuiError?.message}`);
    }
  };

  const handleConfirmTuition = async (applicationId, tuitionId) => {
    if (!window.confirm("Confirm this tuition officially? This will mark it as 'Confirmed'.")) return;
    setLoading(true);
    try {
        const { error: appError } = await supabase.from('applications').update({ status: 'confirmed', demo_completed_at: new Date() }).eq('id', applicationId);
        if (appError) throw appError;
        const { error: tuiError } = await supabase.from('tuitions').update({ status: 'confirmed' }).eq('id', tuitionId);
        if (tuiError) throw tuiError;
        alert("Tuition Confirmed Successfully!");
        fetchMasterData();
    } catch (e) {
        alert("Error: " + e.message);
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
        // Schedule New Demo
        const { error } = await supabase.from('demos').insert({
          tuition_id: selectedDemoItem.tuitionId,
          teacher_id: selectedDemoItem.teacherId,
          parent_id: selectedDemoItem.parentId, // Assuming tuition has parent_id, need to fetch if not in item
          demo_date: demoForm.date,
          demo_time: demoForm.time,
          status: 'DEMO_SCHEDULED'
        });
        if (error) throw error;
        
        // Update Tuition Status
        await supabase.from('tuitions').update({ status: 'DEMO_SCHEDULED' }).eq('id', selectedDemoItem.tuitionId);
        await supabase.from('applications').update({ status: 'DEMO_SCHEDULED' }).eq('id', selectedDemoItem.applicationId);
        alert("Demo Scheduled Successfully!");

      } else if (demoModalMode === 'postpone') {
        // Postpone Demo
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

        // Log Change
        await supabase.from('demo_logs').insert({ demo_id: selectedDemoItem.id, old_status: selectedDemoItem.status, new_status: 'DEMO_POSTPONED', changed_by: user.id, remarks: demoForm.remarks });
        alert("Demo Postponed Successfully!");

      } else if (demoModalMode === 'status') {
        // Update Status
        const { error } = await supabase.from('demos').update({
          status: demoForm.status,
          remarks: demoForm.remarks
        }).eq('id', selectedDemoItem.id);
        if (error) throw error;

        // NEW: Propagate status to Application and Tuition so Parent/Teacher see it
        await supabase.from('applications')
          .update({ status: demoForm.status })
          .eq('tuition_id', selectedDemoItem.tuition_id)
          .eq('teacher_id', selectedDemoItem.teacher_id);
        
        await supabase.from('tuitions')
          .update({ status: demoForm.status })
          .eq('id', selectedDemoItem.tuition_id);

        await supabase.from('demo_logs').insert({ demo_id: selectedDemoItem.id, old_status: selectedDemoItem.status, new_status: demoForm.status, changed_by: user.id, remarks: demoForm.remarks });
        alert("Demo Status Updated!");
      }

      setShowDemoModal(false);
      fetchMasterData();
      fetchDemos();
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const addLocation = async (name, zone) => {
    const { error } = await supabase.from('locations').insert({ location_name: name, admin_zone: zone });
    if (!error) fetchMasterData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // --- Content Management Handlers ---
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    setLoading(true);

    let imageUrl = editingBlog.image_url;

    if (blogImageFile) {
      try {
        const fileExt = blogImageFile.name.split('.').pop();
        const fileName = `blog_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('website-assets')
          .upload(`blogs/${fileName}`, blogImageFile);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('website-assets')
          .getPublicUrl(`blogs/${fileName}`);
        
        imageUrl = publicUrl;
      } catch (error) {
        alert("Image upload failed: " + error.message);
        setLoading(false);
        return;
      }
    }

    const blogData = {
      title: editingBlog.title,
      slug: editingBlog.slug || editingBlog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description: editingBlog.description,
      content: editingBlog.content,
      image_url: imageUrl,
      author: adminProfile?.full_name || 'Admin'
    };

    let error;
    if (editingBlog.id) {
      ({ error } = await supabase.from('blogs').update(blogData).eq('id', editingBlog.id));
    } else {
      ({ error } = await supabase.from('blogs').insert(blogData));
    }

    if (error) alert("Error saving blog: " + error.message);
    else {
      alert("Blog saved successfully!");
      setEditingBlog(null);
      setBlogImageFile(null);
      fetchMasterData();
    }
    setLoading(false);
  };

  const handleDeleteBlog = async (id) => {
    if(!window.confirm("Delete this blog post?")) return;
    await supabase.from('blogs').delete().eq('id', id);
    fetchMasterData();
  };

  const handleAddGalleryImage = async () => {
    if(!galleryImageFile) return alert("Please select an image file.");
    setLoading(true);

    try {
      const fileExt = galleryImageFile.name.split('.').pop();
      const fileName = `gallery_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('website-assets')
        .upload(`gallery/${fileName}`, galleryImageFile);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website-assets')
        .getPublicUrl(`gallery/${fileName}`);

      await supabase.from('gallery').insert({ image_url: publicUrl, caption: newGalleryImage.caption });
      setNewGalleryImage({ url: '', caption: '' });
      setGalleryImageFile(null);
      fetchMasterData();
    } catch (error) {
      alert("Gallery upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGalleryImage = async (id) => {
    if(!window.confirm("Remove this image?")) return;
    await supabase.from('gallery').delete().eq('id', id);
    fetchMasterData();
  };

  const handleSaveFormConfig = async () => {
    await supabase.from('system_settings').upsert({ key: 'form_config', value: JSON.stringify(formConfig) });
    alert("Form settings updated globally.");
  };

  const handleSaveFaq = async (e) => {
    e.preventDefault();
    setLoading(true);
    const faqData = { 
        question: editingFaq.question, 
        answer: editingFaq.answer,
        category: editingFaq.category || 'general' 
    };
    
    let error;
    if (editingFaq.id) {
      const { error: updateError } = await supabase.from('faqs').update(faqData).eq('id', editingFaq.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('faqs').insert(faqData);
      error = insertError;
    }

    if (error) {
      alert("Error saving FAQ: " + error.message);
      setLoading(false);
    } else {
      setEditingFaq(null);
      await fetchMasterData();
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    setLoading(true);
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    
    if (error) {
      alert("Error deleting FAQ: " + error.message);
      setLoading(false);
    } else {
      await fetchMasterData();
    }
  };

  const handleSaveTerms = async () => {
    setLoading(true);
    const { error: parentError } = await supabase.from('site_content').upsert({ key: 'terms_parent', content: termsParentContent }, { onConflict: 'key' });
    const { error: teacherError } = await supabase.from('site_content').upsert({ key: 'terms_teacher', content: termsTeacherContent }, { onConflict: 'key' });
    const { error: generalError } = await supabase.from('site_content').upsert({ key: 'terms', content: termsContent }, { onConflict: 'key' });
    const { error: dosAndDontsError } = await supabase.from('site_content').upsert({ key: 'dos_and_donts', content: dosAndDontsContent }, { onConflict: 'key' });
    
    if (parentError || teacherError || generalError || dosAndDontsError) {
      alert("Error saving terms: " + (parentError?.message || teacherError?.message || generalError?.message || dosAndDontsError?.message));
    } else {
      alert("Terms updated successfully!");
    }
    setLoading(false);
  };

  const addHoliday = async (e) => {
    e.preventDefault();
    if (!newEvent.event_name || !newEvent.date) return alert("Event name and date are required.");
    setLoading(true);
    const { error } = await supabase.from('holidays').insert(newEvent);
    if (error) {
      alert("Error adding holiday: " + error.message);
    } else {
      alert("Holiday added successfully!");
      setNewEvent({ event_name: '', date: '' });
      await fetchMasterData();
    }
    setLoading(false);
  };

  const deleteHoliday = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?")) return;
    setLoading(true);
    const { error } = await supabase.from('holidays').delete().eq('id', id);
    if (error) {
      alert("Error deleting holiday: " + error.message);
    } else {
      alert("Holiday deleted successfully!");
      await fetchMasterData();
    }
    setLoading(false);
  };


  const navItems = [
    { label: 'Overview', icon: '📊', tab: 'overview' },
    { label: 'New Leads', icon: '📞', tab: 'leads' },
    { label: 'My Teachers', icon: '👨‍🏫', tab: 'teachers' },
    { label: 'My Parents', icon: '👨‍👩‍👧', tab: 'parents' },
    { label: 'Matching Centre', icon: '🔍', tab: 'match' },
    { label: 'Security Audit', icon: '🛡️', tab: 'security', alerts: bypassAlerts.length },
    { label: 'Inquiry & Booking', icon: '🤝', tab: 'allot' },
    { label: 'Demo Manager', icon: '📅', tab: 'demos' },
    { label: 'Master Data', icon: '⚙️', tab: 'master' },
    { label: 'Holidays', icon: '🗓️', tab: 'holidays' },
    { label: 'System Settings', icon: '⚙️', tab: 'settings' },
    { label: 'Blog Manager', icon: '📝', tab: 'blogs' },
    { label: 'Gallery', icon: '🖼️', tab: 'gallery' },
    { label: 'Form Control', icon: '📝', tab: 'forms' },
    { label: 'Review Params', icon: '⭐', tab: 'reviews' },
    { label: 'Form Builder', icon: '📝', path: '/manage-forms' },
    { label: 'Monthly Reports', icon: '📈', path: '/monthly-reports' },
    { label: 'FAQ Manager', icon: '❓', tab: 'faq' },
    { label: 'Terms & Guidelines', icon: '📜', tab: 'terms' },
    { label: 'Blacklist', icon: '🚫', tab: 'blacklist' },
  ];

  navItems.sort((a, b) => a.label.localeCompare(b.label));

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">Initialising Master RBAC Controls...</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <h1 className="text-lg font-black uppercase italic tracking-tighter">Param Control</h1>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white focus:outline-none">
          {mobileMenuOpen ? <i className="fas fa-times text-2xl"></i> : <i className="fas fa-bars text-2xl"></i>}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white p-8 flex flex-col h-screen overflow-y-auto transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase italic">Param Control</h1>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400"><i className="fas fa-times"></i></button>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map(item => (
            <button 
              key={item.label} 
              onClick={() => {
                if (item.tab) setActiveTab(item.tab);
                if (item.path) navigate(item.path);
              }} 
              className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center ${activeTab === item.tab ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
            >
              <span>{item.icon} {item.label}</span>
              {item.alerts > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{item.alerts}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-700">
          <button onClick={handleLogout} className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition">
            <i className="fas fa-sign-out-alt mr-2"></i> Logout Securely
          </button>
          <p className="text-[9px] text-slate-500 mt-2">Super Admin Mode Active</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>}

      <main className="flex-1 p-6 md:p-10 md:max-h-screen md:overflow-y-auto">
        
        {/* LEAD CONVERSION MODAL */}
      {showConvertModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black uppercase italic mb-6">Post Tuition Job</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              
              {/* 0. Tuition Number (New) */}
              <div className="md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Tuition No (TN)</label>
                  <input type="text" className="w-full p-3 bg-white rounded-xl font-bold text-sm border" placeholder="Enter TN manually" value={verifiedLeadData.tuition_no} onChange={(e) => setVerifiedLeadData({...verifiedLeadData, tuition_no: e.target.value})} />
                </div>
              </div>

              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Assign to Admin Zone</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold"
                    value={verifiedLeadData.admin_zone} 
                    onChange={(e)=>{
                        const zone = e.target.value;
                        setVerifiedLeadData({...verifiedLeadData, admin_zone: zone});
                    }}
                  >
                    <option value="Admin 1">Admin 1 (Lanka)</option>
                    <option value="Admin 2">Admin 2 (Sigra)</option>
                  </select>
              </div>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Student's School</label>
                  <select className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" value={verifiedLeadData.school} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, school: e.target.value})}>
                    <option value="">Select School...</option>
                    {SCHOOL_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
              </div>
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nearby Landmark</label>
                  <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold" placeholder="Near..." value={verifiedLeadData.nearby} onChange={(e)=>setVerifiedLeadData({...verifiedLeadData, nearby: e.target.value})} />
              </div>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase">Bureau Specific Demands</label>
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
                <label className="text-[10px] font-black text-slate-400 uppercase">Location</label>
                <input type="text" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={manualLead.location} onChange={e => setManualLead({...manualLead, location: e.target.value})} />
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

      {/* DEMO MANAGEMENT MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-black uppercase italic mb-6">
              {demoModalMode === 'schedule' ? 'Schedule Demo Class' : demoModalMode === 'postpone' ? 'Postpone Demo' : 'Update Demo Status'}
            </h3>
            
            <div className="space-y-4">
              {(demoModalMode === 'schedule' || demoModalMode === 'postpone') && (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Demo Date</label>
                    <input type="date" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={demoForm.date} onChange={e => setDemoForm({...demoForm, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Demo Time</label>
                    <input type="time" className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={demoForm.time} onChange={e => setDemoForm({...demoForm, time: e.target.value})} />
                  </div>
                </>
              )}

              {demoModalMode === 'status' && (
                <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" value={demoForm.status} onChange={e => setDemoForm({...demoForm, status: e.target.value})}>
                  <option value="DEMO_SCHEDULED">Scheduled</option>
                  <option value="DEMO_COMPLETED">Completed</option>
                  <option value="DEMO_CANCELLED">Cancelled</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              )}

              {(demoModalMode === 'postpone' || demoModalMode === 'status') && (
                <textarea placeholder="Admin Remarks..." className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border" rows="3" value={demoForm.remarks} onChange={e => setDemoForm({...demoForm, remarks: e.target.value})}></textarea>
              )}

              <button onClick={handleDemoSubmit} className="w-full bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs shadow-lg">Confirm Action</button>
              <button onClick={() => setShowDemoModal(false)} className="w-full text-slate-400 font-bold text-xs uppercase mt-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* FINANCIAL PROFIT DASHBOARD - Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in duration-1000">
               <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl">
                  <p className="text-blue-400 text-[10px] font-black uppercase mb-2">Total Gross Billing</p>
                  <h2 className="text-3xl font-black">₹{revenueStats.total.toLocaleString('en-IN')}</h2>
               </div>
               <div className="bg-green-600 text-white p-8 rounded-[40px] shadow-xl">
                  <p className="text-green-100 text-[10px] font-black uppercase mb-2">Bureau Profit (40%)</p>
                  <h2 className="text-3xl font-black">₹{revenueStats.bureau.toLocaleString('en-IN')}</h2>
               </div>
               <div className="bg-white p-8 rounded-[40px] shadow-sm border border-b-8 border-red-500">
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Pending Invoices</p>
                  <h2 className="text-3xl font-black text-red-600">{revenueStats.pending} Cases</h2>
               </div>
               <div className="bg-white p-8 rounded-[40px] shadow-sm border border-b-8 border-blue-500">
                  <p className="text-slate-400 text-[10px] font-black uppercase mb-2">Avg Fee/Month</p>
                  <h2 className="text-3xl font-black text-blue-600">₹{(revenueStats.total / (ledgerData?.length || 1)).toFixed(0)}</h2>
               </div>
            </div>

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

            {/* TEACHER RANKING TABLE */}
            <section className="bg-white rounded-[40px] shadow-sm border overflow-hidden overflow-x-auto">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                <h3 className="text-xs font-black uppercase tracking-widest italic">Top Tutors (Success Ranking)</h3>
                <span className="text-[9px] bg-blue-600 px-2 py-1 rounded">Varanasi Expert Network</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase border-b bg-slate-50">
                    <th className="p-6">Teacher</th>
                    <th className="p-6">Booked</th>
                    <th className="p-6 text-green-600">Confirmed</th>
                    <th className="p-6 text-red-500">Cancelled</th>
                    <th className="p-6">Grade</th>
                    <th className="p-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teacherRankings.map((t) => {
                    const gradeData = performanceScores.find(s => s.id === t.id);
                    return (
                      <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50 transition group">
                        <td className="p-6 flex items-center gap-3">
                           <div className="relative">
                              <img src={t.photo_url || 'https://placehold.co/150'} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                              <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md text-[8px] font-black text-white shadow-sm 
                                ${gradeData?.tutor_grade === 'A+' ? 'bg-orange-500' : 
                                  gradeData?.tutor_grade === 'A' ? 'bg-green-600' : 
                                  gradeData?.tutor_grade === 'B' ? 'bg-blue-600' : 'bg-slate-400'}`}>
                                {gradeData?.tutor_grade || 'C'}
                              </span>
                           </div>
                           <span className="font-black text-slate-800 text-xs">{t.full_name}</span>
                        </td>
                        <td className="p-6 font-bold">{t.total_allotted}</td>
                        <td className="p-6 font-black text-green-600">{t.confirmed_count}</td>
                        <td className="p-6 font-black text-red-500">{t.cancelled_count}</td>
                        <td className="p-6">
                           <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden mb-1">
                              <div className="bg-blue-600 h-full" style={{ width: `${t.success_rate}%` }}></div>
                           </div>
                           <span className="text-[9px] font-black text-slate-400">{t.success_rate.toFixed(0)}% Efficiency</span>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => viewTeacherDetails(t.id)} className="text-blue-600 font-black text-[9px] uppercase underline italic group-hover:text-blue-800 transition">View History</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* FRESH LEADS SECTION */}
        {activeTab === 'leads' && (
        <section className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
          <div className="p-6 bg-orange-500 text-white flex justify-between items-center">
            <h3 className="text-xs font-black uppercase italic tracking-widest">Incoming Parent Leads (Awaiting Call)</h3>
            <span className="text-[10px] font-bold bg-white text-orange-600 px-3 py-1 rounded-full animate-pulse">{leads.length} New</span>
            <button onClick={() => setShowManualLeadModal(true)} className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase ml-4">+ Add Manual</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map(lead => (
              <div key={lead.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-orange-300 transition-all">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">{lead.raw_data.location_name}</p>
                  <h4 className="font-black text-slate-800 text-lg uppercase leading-none">{lead.raw_data.subject}</h4>
                  <div className="flex gap-2 mt-3">
                    <a href={`tel:${lead.raw_data.phone_number}`} className="bg-white text-blue-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm">Call Parent</a>
                    <button onClick={() => { setSelectedLead(lead); setShowConvertModal(true); }} className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Process Lead</button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase">Received</p>
                  <p className="text-xs font-bold text-slate-500">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {leads.length === 0 && <div className="col-span-2 text-center p-10 text-slate-400 italic text-xs uppercase font-bold tracking-widest opacity-50">All leads processed. Great work!</div>}
          </div>
        </section>
        )}

        {/* TAB: MY TEACHERS */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">My Teachers Directory</h2>
            <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allTeachers.map(t => {
                    const blocked = blacklist.find(b => (b.phone === t.phone_number) || (b.email === t.email));
                    const details = Array.isArray(t.teacher_details) ? t.teacher_details[0] : t.teacher_details;
                    const isVerified = details?.is_verified;
                    return (
                      <tr key={t.id} className={`border-b transition ${blocked ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 font-bold text-sm">{t.full_name}</td>
                        <td className="p-4 text-xs">{t.phone_number}</td>
                        <td className="p-4 text-xs">
                          {isVerified ? (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[9px] font-black uppercase">Verified</span>
                          ) : (
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${details?.setup_completed ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                              {details?.setup_completed ? 'Under Review' : 'Incomplete'}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleVerifyTeacher(t)} 
                              className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${isVerified ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white'}`}
                              title={!isVerified && !details?.setup_completed ? "Force Verify (Incomplete Profile)" : "Verify Teacher"}
                            >
                              {isVerified ? 'Unverify' : 'Verify'}
                            </button>
                            <button onClick={() => openScoreModal(t)} className="bg-purple-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-purple-700">Evaluate</button>
                            <button onClick={() => viewTeacherDetails(t.id)} className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">History</button>
                            {blocked ? (
                              <button onClick={() => handleDeleteBlacklist(blocked.id)} className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-green-200">Unblock</button>
                            ) : (
                              <button onClick={() => handleQuickBlacklist(t, 'teacher')} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-red-200">Blacklist</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MY PARENTS */}
        {activeTab === 'parents' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">My Parents Directory</h2>
            <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Zone</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allParents.map(p => {
                    const blocked = blacklist.find(b => (b.phone === p.phone_number) || (b.email === p.email));
                    return (
                      <tr key={p.id} className={`border-b transition ${blocked ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                        <td className="p-4 font-bold text-sm">{p.full_name}</td>
                        <td className="p-4 text-xs">{p.phone_number}</td>
                        <td className="p-4 text-xs uppercase font-bold text-blue-600">{p.admin_zone || 'Unassigned'}</td>
                        <td className="p-4 text-right">
                          {blocked ? (
                            <button onClick={() => handleDeleteBlacklist(blocked.id)} className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-green-200">Unblock</button>
                          ) : (
                            <button onClick={() => handleQuickBlacklist(p, 'parent')} className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase hover:bg-red-200">Blacklist</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MATCHING CENTRE */}
        {activeTab === 'match' && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Matching Centre</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Search Radius</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs" value={matchFilters.radius} onChange={(e) => setMatchFilters({...matchFilters, radius: parseInt(e.target.value)})}>
                    <option value="1">1 KM</option>
                    <option value="2">2 KM</option>
                    <option value="3">3 KM</option>
                    <option value="4">4 KM</option>
                    <option value="5">5 KM</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Time Slot</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs" onChange={(e) => setMatchFilters({...matchFilters, timeSlot: e.target.value})}>
                    <option value="">Any Time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Time Slot</label>
                  <select className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs" onChange={(e) => setMatchFilters({...matchFilters, timeSlot: e.target.value})}>
                    <option value="">Any Time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <select className="p-3 bg-slate-50 rounded-xl font-bold text-xs" onChange={(e) => setMatchFilters({...matchFilters, gender: e.target.value})}>
                  <option value="">Any Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <select className="p-3 bg-slate-50 rounded-xl font-bold text-xs" onChange={(e) => setMatchFilters({...matchFilters, board: e.target.value})}>
                  <option value="">Any Board</option>
                  <option value="CBSE">CBSE</option>
                  <option value="ICSE">ICSE</option>
                </select>
                <input type="number" placeholder="Min 10th %" className="p-3 bg-slate-50 rounded-xl font-bold text-xs" onChange={(e) => setMatchFilters({...matchFilters, minMarks: parseInt(e.target.value)})} />
                <button onClick={() => runTeacherMatch()} className="bg-blue-600 text-white font-black rounded-xl text-xs uppercase tracking-widest">{isMatching ? 'Searching...' : 'Find Near 5KM'}</button>
              </div>
              <div className="space-y-3">
                {matchedTeachers.map(t => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-center group hover:border-blue-300 transition">
                    <div>
                      <p className="font-black text-slate-800">{t.full_name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{t.experience_years} Yrs Exp • {t.class_10_marks}% in 10th • {(t.dist_meters/1000).toFixed(1)} km away</p>
                    </div>
                    <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Shortlist</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: SECURITY AUDIT */}
        {activeTab === 'security' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <section className="bg-white rounded-[40px] shadow-sm border-2 border-red-100 overflow-hidden overflow-x-auto">
                <div className="bg-red-600 p-4 text-white font-black uppercase text-[10px] tracking-widest flex justify-between items-center italic">
                  <span>Suspicion Audit: Case Cancellations (Audio Proof Enabled)</span>
                  <span className="text-[9px] bg-white text-red-600 px-2 py-0.5 rounded">Security Log</span>
                </div>
                <div className="p-0">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase border-b bg-slate-50">
                           <th className="p-6">Tuition / Area</th>
                           <th className="p-6">Admin Reason</th>
                           <th className="p-6">Voice Briefing</th>
                           <th className="p-6">Logged By</th>
                           <th className="p-6 text-right">Verification</th>
                        </tr>
                     </thead>
                     <tbody>
                        {suspiciousCancellations.map((log) => (
                           <tr key={log.id} className="border-b last:border-0 hover:bg-red-50 transition">
                              <td className="p-6">
                                 <p className="font-bold text-slate-800 text-sm">{log.tuition?.subject}</p>
                                 <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{log.tuition?.location_name}</p>
                              </td>
                              <td className="p-6">
                                 <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase block mb-1 w-fit">{log.stage}</span>
                                 <p className="text-xs italic text-slate-600 leading-relaxed">"{log.reason}"</p>
                              </td>
                              <td className="p-6">
                                 {log.voice_note_url ? (
                                   <audio controls className="h-8 w-40 scale-90 origin-left">
                                     <source src={log.voice_note_url} type="audio/ogg" />
                                   </audio>
                                 ) : (
                                   <span className="text-[9px] text-slate-300 font-bold uppercase italic">No Audio</span>
                                 )}
                              </td>
                              <td className="p-6 text-xs font-bold text-slate-700">{log.admin?.full_name}</td>
                              <td className="p-6 text-right">
                                 <button onClick={() => window.open(`https://wa.me/91${log.tuition?.parent?.phone_number}`)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 transition">Audit Call</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
            </section>
            <section className="bg-white rounded-[40px] shadow-sm border-2 border-slate-900 overflow-hidden overflow-x-auto">
               <div className="bg-slate-900 p-4 text-white font-black uppercase text-[10px] tracking-widest">GPS Proximity Alerts</div>
               <div className="p-6">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase border-b pb-4">
                           <th className="pb-4">Teacher</th>
                           <th className="pb-4">Reported Status</th>
                           <th className="pb-4">Distance from Home</th>
                           <th className="pb-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        {bypassAlerts.map((alert, i) => (
                           <tr key={i} className="border-b last:border-0 hover:bg-red-50 transition">
                              <td className="py-4 font-black text-slate-800 text-sm">{alert.teacher_name}</td>
                              <td className="py-4"><span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[9px] font-black uppercase">{alert.official_status}</span></td>
                              <td className="py-4 text-xs font-bold text-slate-600">{alert.distance_meters}m Away</td>
                              <td className="py-4 text-right">
                                 <button onClick={() => window.open(`https://wa.me/91${alert.teacher_phone}`)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase transition hover:bg-blue-600">Investigate</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
            <section className="bg-white rounded-[40px] shadow-sm border-2 border-slate-200 overflow-hidden overflow-x-auto">
               <div className="bg-slate-700 p-4 text-white font-black uppercase text-[10px] tracking-widest">Recent Location Updates</div>
               <div className="p-6">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase border-b pb-4">
                           <th className="pb-4">User</th>
                           <th className="pb-4">Role</th>
                           <th className="pb-4">Coordinates</th>
                           <th className="pb-4 text-right">Time</th>
                        </tr>
                     </thead>
                     <tbody>
                        {locationHistory.map((log, i) => (
                           <tr key={i} className="border-b last:border-0 hover:bg-slate-50 transition">
                              <td className="py-4 font-bold text-slate-800 text-xs">{log.profiles?.full_name || 'Unknown'}</td>
                              <td className="py-4 text-[10px] uppercase font-bold text-slate-500">{log.profiles?.user_role}</td>
                              <td className="py-4 text-xs font-mono text-slate-600">{log.lat?.toFixed(4)}, {log.lng?.toFixed(4)}</td>
                              <td className="py-4 text-right text-[10px] font-bold text-slate-400">{new Date(log.changed_at).toLocaleString()}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
          </div>
        )}

        {/* TAB: INQUIRY & BOOKING (Formerly Allot Demo) */}
        {activeTab === 'allot' && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold italic tracking-tighter uppercase">Inquiry & Booking</h2>
            {pendingInquiries.map(inq => {
              // Format Tuition Details for Display/WhatsApp
              const tuitionDetailsText = `
${inq.tuition_no || 'TN-PENDING'}
❖Main Location: ${inq.location_name}
❖Nearby: ${inq.nearby_landmark || 'N/A'}
❖School: ${inq.school_name || 'N/A'}
❖Medium: ${inq.medium || 'N/A'}
❖Grade: ${inq.student_class}
❖Subject: ${inq.subject}
❖Days: ${inq.days_per_week || '6 Days/Week'}
❖Duration: ${inq.class_duration || '1 hr'}
❖Timing: ${inq.preferred_timing || 'N/A'}
❖Gender: ${inq.gender_preference || 'Any'}
❖Fee: ${inq.fee_amount || 'N/A'}
❖Mode : ${inq.teaching_mode || 'Student Home'}
❖Requirement: ${inq.specific_demands ? (Array.isArray(inq.specific_demands) ? inq.specific_demands.join(', ') : inq.specific_demands) : 'Experienced'}
❖Call/Whatsapp: https://wa.me/91${inq.admin_zone === 'Admin 1' ? admin1Phone : admin2Phone}
`.trim();

              return (
              <div key={inq.id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black uppercase italic">{inq.subject} - {inq.student_class} <span className="text-slate-400 text-sm">({inq.tuition_no})</span></h3>
                    <p className="text-blue-600 font-bold uppercase text-[10px]">{inq.location_name}</p>
                    
                    {/* Expandable Tuition Details */}
                    <details className="mt-2">
                      <summary className="text-[10px] font-bold text-slate-500 cursor-pointer hover:text-blue-600">View Tuition Card (WhatsApp Format)</summary>
                      <pre className="mt-2 p-3 bg-slate-50 rounded-xl text-[10px] text-slate-600 whitespace-pre-wrap border border-slate-200">
                        {tuitionDetailsText}
                      </pre>
                      <button 
                        onClick={() => navigator.clipboard.writeText(tuitionDetailsText).then(() => alert('Copied!'))}
                        className="mt-2 text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 font-bold uppercase"
                      >Copy Text</button>
                    </details>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${inq.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{inq.status}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inq.applications?.map(app => {
                    const teacher = app.teacher;
                    const d = Array.isArray(teacher?.teacher_details) ? teacher.teacher_details[0] : teacher?.teacher_details || {};
                    
                    // Robust parent check and Map URL generation
                    const parent = Array.isArray(inq.parent) ? inq.parent[0] : inq.parent;
                    const distance = calculateDistance(parent?.latitude, parent?.longitude, teacher?.latitude, teacher?.longitude);
                    
                    let mapUrl = null;
                    if (teacher?.latitude && teacher?.longitude && parent?.latitude && parent?.longitude) {
                      mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${teacher.latitude},${teacher.longitude}&destination=${parent.latitude},${parent.longitude}`;
                    } else if (teacher?.latitude && teacher?.longitude) {
                      mapUrl = `https://www.google.com/maps/search/?api=1&query=${teacher.latitude},${teacher.longitude}`;
                    } else if (parent?.latitude && parent?.longitude) {
                      mapUrl = `https://www.google.com/maps/search/?api=1&query=${parent.latitude},${parent.longitude}`;
                    }
                    
                    // Check Fee Status from Ledger
                    const teacherLedger = ledgerData.filter(l => l.teacher_id === teacher?.id);
                    const pendingFees = teacherLedger.filter(l => l.payment_status === 'pending').length;
                    const feeStatus = pendingFees > 0 ? `${pendingFees} Pending` : 'Clear';

                    const teacherDetailsText = `
Aadhar Number : ${d.aadhaar_number || 'N/A'}
Full Name : ${teacher.full_name}
Mobile Number : ${teacher.phone_number}
Timestamp : ${new Date(app.created_at).toLocaleString('en-GB')}
Email Address : ${teacher.email}
Fathers Name : ${d.father_name || 'N/A'}
Date Of Birth : ${d.date_of_birth || 'N/A'}
Gender : ${d.gender || 'N/A'}
Religion : ${d.religion || 'N/A'}
Category : ${d.category || 'N/A'}
Temporary Address : ${d.temporary_address || 'N/A'}
Permanent Address : ${d.permanent_address || 'N/A'}
Class X Board : ${d.class_x_board || 'N/A'}
Name Of School in Class 10 : ${d.class_10_school || 'N/A'}
Marks Obtained In Class 10 ( approx ) : ${d.class_10_marks || 'N/A'}
Passing Year Class 10 : ${d.class_10_year || 'N/A'}
Class 12 Stream : ${d.class_12_subject || 'N/A'}
Name School in Class 12 : ${d.class_12_school || 'N/A'}
Marks Obtained In Class 12 ( approx ) : ${d.class_12_marks || 'N/A'}
Passing Year Class 12 : ${d.class_12_year || 'N/A'}
Graduation : ${d.graduation_subject || 'N/A'}
Graduation Status : ${d.graduation_status || 'N/A'}
Graduation College : ${d.graduation_college || 'N/A'}
Boards You Can Take? : ${d.boards_can_teach || 'N/A'}
Experience : ${d.years_of_experience || 'N/A'}
Subjects You Can Take : ${d.subjects_can_teach || 'N/A'}
Classes You Can Take : ${d.preferred_classes || 'N/A'}
Teaching Mode : ${d.teaching_mode || 'N/A'}
Marital Status : ${d.marital_status || 'N/A'}
Speaking English? : ${d.english_proficiency || 'N/A'}
How do you usually travel? : ${d.travel_mode || 'N/A'}
Distance from Parent : ${distance}`.trim();

                    return (
                    <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border flex flex-col gap-3">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-sm block text-slate-800">{teacher?.full_name}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">{app.status}</span>
                          </div>
                          <div className="text-right">
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${pendingFees > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>Fee: {feeStatus}</span>
                             {mapUrl ? (
                               <a href={mapUrl} target="_blank" rel="noreferrer" className="text-[9px] font-bold text-blue-500 mt-1 hover:underline block">
                                 Dist: {distance} 🗺️
                               </a>
                             ) : (
                               <div className="text-[9px] font-bold text-slate-400 mt-1">Dist: {distance}</div>
                             )}
                          </div>
                        </div>
                        
                        <details className="mt-2">
                          <summary className="text-[9px] font-bold text-blue-600 cursor-pointer uppercase">View Full Teacher Details</summary>
                          <pre className="mt-2 p-2 bg-white rounded border text-[9px] text-slate-600 whitespace-pre-wrap h-32 overflow-y-auto">
                            {teacherDetailsText}
                          </pre>
                        </details>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-200">
                      {app.status === 'applied' && (
                        <button onClick={() => handleBookTuition(app.id, inq.id, teacher, inq.tuition_no)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase w-full">Book Teacher</button>
                      )}
                      
                      {(app.status === 'BOOKED' || app.status === 'demo_allotted') && (
                        <button 
                          onClick={() => openDemoModal('schedule', { tuitionId: inq.id, teacherId: app.teacher_id, parentId: inq.parent_id, applicationId: app.id })} 
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase w-full"
                        >Schedule Demo</button>
                      )}

                      {(app.status === 'DEMO_SCHEDULED' || app.status === 'DEMO_POSTPONED') && (
                        <span className="text-blue-600 text-[10px] font-black uppercase italic w-full text-center py-2">Demo Scheduled</span>
                      )}
                      {['demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'DEMO_COMPLETED', 'booked', 'BOOKED'].includes(app.status) && (
                        <button onClick={() => handleConfirmTuition(app.id, inq.id)} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase w-full mt-2">Confirm Tuition</button>
                      )}
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* TAB: DEMO MANAGER */}
        {activeTab === 'demos' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Demo Manager</h2>
              <div className="flex gap-2 items-center">
                <select 
                  value={demoFilterAdmin} 
                  onChange={(e) => setDemoFilterAdmin(e.target.value)} 
                  className="p-3 border rounded-xl font-bold text-sm bg-white"
                >
                  <option value="All">All Admins</option>
                  <option value="Admin 1">Admin 1</option>
                  <option value="Admin 2">Admin 2</option>
                </select>
                <input 
                  type="date" 
                  value={demoFilterStartDate} 
                  onChange={(e) => { 
                    setDemoFilterStartDate(e.target.value); 
                    fetchDemos(e.target.value, undefined); 
                  }} 
                  className="p-3 border rounded-xl font-bold text-sm" 
                />
                <span className="text-slate-400 font-bold">-</span>
                <input 
                  type="date" 
                  value={demoFilterEndDate} 
                  onChange={(e) => { 
                    setDemoFilterEndDate(e.target.value); 
                    fetchDemos(undefined, e.target.value); 
                  }} 
                  className="p-3 border rounded-xl font-bold text-sm" 
                />
              </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Teacher</th>
                    <th className="p-4">Parent/Student</th>
                    <th className="p-4">Subject / Area</th>
                    <th className="p-4">Admin</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Reason/Remarks</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {demos.filter(d => demoFilterAdmin === 'All' || d.tuition?.admin_zone === demoFilterAdmin).map(d => (
                    <tr key={d.id} className="border-b hover:bg-slate-50">
                      <td className="p-4 font-bold text-xs whitespace-nowrap">
                        <div>{d.demo_date}</div>
                        <div className="text-slate-400 font-normal">{d.demo_time}</div>
                      </td>
                      <td className="p-4 font-bold text-sm">{d.teacher?.full_name}</td>
                      <td className="p-4 text-xs">{d.parent?.full_name}</td>
                      <td className="p-4 text-xs font-bold text-slate-600">
                        {d.tuition?.subject} ({d.tuition?.student_class})
                        <div className="text-[9px] text-slate-400 font-normal">{d.tuition?.location_name}</div>
                      </td>
                      <td className="p-4 text-xs font-bold text-blue-600">{d.tuition?.admin_zone || 'N/A'}</td>
                      <td className="p-4"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${d.status === 'DEMO_COMPLETED' ? 'bg-green-100 text-green-700' : d.status === 'DEMO_CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{d.status}</span></td>
                      <td className="p-4 text-xs italic text-slate-500 max-w-xs truncate" title={d.remarks}>{d.remarks || '-'}</td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => openDemoModal('postpone', d)} className="text-blue-600 font-bold text-[10px] uppercase hover:underline">Postpone</button>
                        <button onClick={() => openDemoModal('status', d)} className="text-slate-600 font-bold text-[10px] uppercase hover:underline">Update</button>
                      </td>
                    </tr>
                  ))}
                  {demos.filter(d => demoFilterAdmin === 'All' || d.tuition?.admin_zone === demoFilterAdmin).length === 0 && <tr><td colSpan="8" className="p-8 text-center text-slate-400 italic text-xs">No demos found for this date and admin filter.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MASTER DATA */}
        {activeTab === 'master' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-white p-8 rounded-[40px] shadow-sm border-t-8 border-slate-900">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight italic">Admin & Zone Control</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
                {locations.map(l => (
                  <div key={l.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs border hover:border-blue-200 transition">
                    <span className="font-bold text-slate-700">{l.location_name}</span>
                    <select defaultValue={l.admin_zone} onChange={(e) => updateLocationZone(l.id, e.target.value)} className="bg-white text-[10px] font-black text-blue-600 border border-slate-200 rounded-lg p-1">
                      <option value="Admin 1">Zone 1</option>
                      <option value="Admin 2">Zone 2</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl">
                <div className="flex gap-2">
                  <input id="new-loc" type="text" placeholder="Area Name" className="flex-1 p-2 rounded-lg border text-sm" />
                  <button onClick={() => addLocation(document.getElementById('new-loc').value, 'Admin 1')} className="bg-blue-600 text-white px-4 rounded-lg text-sm font-black uppercase transition hover:bg-blue-700">Save</button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: HOLIDAYS */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
             <h2 className="text-3xl font-black uppercase italic tracking-tighter">Holiday Calendar</h2>
             <div className="bg-white p-8 rounded-[40px] shadow-sm border">
                <form onSubmit={addHoliday} className="flex gap-4 mb-6 pb-6 border-b">
                    <input 
                        type="text" 
                        placeholder="Event Name" 
                        value={newEvent.event_name}
                        onChange={e => setNewEvent({...newEvent, event_name: e.target.value})}
                        className="flex-1 p-3 border rounded-xl"
                    />
                    <input 
                        type="date" 
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        className="p-3 border rounded-xl"
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold uppercase text-xs">Add Holiday</button>
                </form>

               {holidays.map(h => (
                 <div key={h.id} className="p-3 border-b flex justify-between items-center last:border-0">
                   <div>
                    <span className="font-black text-slate-800 uppercase text-xs">{h.event_name}</span>
                    <span className="text-slate-400 font-bold text-xs ml-4">{h.date}</span>
                   </div>
                   <button onClick={() => deleteHoliday(h.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Delete</button>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* TAB: BLOG MANAGER */}
        {activeTab === 'blogs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Blog Manager</h2>
              {!editingBlog && <button onClick={() => setEditingBlog({})} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Add New Post</button>}
            </div>

            {editingBlog ? (
              <form onSubmit={handleSaveBlog} className="bg-white p-8 rounded-[40px] shadow-sm border space-y-4">
                <h3 className="text-xl font-bold mb-4">{editingBlog.id ? 'Edit Post' : 'New Post'}</h3>
                <input type="text" placeholder="Title" className="w-full p-3 border rounded-xl" value={editingBlog.title || ''} onChange={e => setEditingBlog({...editingBlog, title: e.target.value})} required />
                <input type="text" placeholder="Slug (optional, auto-generated)" className="w-full p-3 border rounded-xl" value={editingBlog.slug || ''} onChange={e => setEditingBlog({...editingBlog, slug: e.target.value})} />
                <div className="w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Featured Image</label>
                  <input type="file" accept="image/*" onChange={e => setBlogImageFile(e.target.files[0])} className="w-full p-2 bg-slate-50 rounded-xl text-sm border" />
                  {editingBlog.image_url && !blogImageFile && <p className="text-xs text-green-600 mt-1">Current image: <a href={editingBlog.image_url} target="_blank" rel="noreferrer" className="underline">View</a></p>}
                </div>
                <textarea placeholder="Short Description" className="w-full p-3 border rounded-xl" rows="2" value={editingBlog.description || ''} onChange={e => setEditingBlog({...editingBlog, description: e.target.value})} required></textarea>
                <textarea placeholder="Content (HTML or Text)" className="w-full p-3 border rounded-xl font-mono text-sm" rows="10" value={editingBlog.content || ''} onChange={e => setEditingBlog({...editingBlog, content: e.target.value})} required></textarea>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingBlog(null)} className="px-4 py-2 rounded-xl border font-bold text-xs">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs">Save Post</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {blogs.map(blog => (
                  <div key={blog.id} className="bg-white p-4 rounded-2xl border flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img src={blog.image_url || 'https://placehold.co/50'} className="w-12 h-12 rounded-lg object-cover" alt="" />
                      <div>
                        <h4 className="font-bold text-sm">{blog.title}</h4>
                        <p className="text-xs text-slate-500">/{blog.slug}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingBlog(blog)} className="text-blue-600 font-bold text-xs uppercase">Edit</button>
                      <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-600 font-bold text-xs uppercase">Delete</button>
                    </div>
                  </div>
                ))}
                {blogs.length === 0 && <p className="text-center text-slate-400 italic">No blog posts found.</p>}
              </div>
            )}
          </div>
        )}

        {/* TAB: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Gallery Manager</h2>
            
            <div className="bg-white p-6 rounded-[32px] shadow-sm border flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Upload Image</label>
                <input type="file" accept="image/*" className="w-full p-2 border rounded-lg text-xs" onChange={e => setGalleryImageFile(e.target.files[0])} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase text-slate-400">Caption</label>
                <input type="text" className="w-full p-2 border rounded-lg" value={newGalleryImage.caption} onChange={e => setNewGalleryImage({...newGalleryImage, caption: e.target.value})} placeholder="Description..." />
              </div>
              <button onClick={handleAddGalleryImage} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase h-10">Add Image</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryImages.map(img => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-video bg-slate-100">
                  <img src={img.image_url} alt={img.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center flex-col gap-2">
                    <p className="text-white text-xs font-bold px-2 text-center">{img.caption}</p>
                    <button onClick={() => handleDeleteGalleryImage(img.id)} className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: FORM CONTROL */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Form Configuration</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border max-w-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                  <div>
                    <h4 className="font-bold text-slate-800">Enquiry Form (Gold)</h4>
                    <p className="text-xs text-slate-500">Enable or disable the main enquiry form on homepage.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formConfig.enquiryEnabled} onChange={e => setFormConfig({...formConfig, enquiryEnabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                  <div>
                    <h4 className="font-bold text-slate-800">Demo Booking Form</h4>
                    <p className="text-xs text-slate-500">Enable or disable the demo booking form.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formConfig.demoEnabled} onChange={e => setFormConfig({...formConfig, demoEnabled: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Global Admin WhatsApp Number</label>
                  <input type="text" className="w-full p-3 border rounded-xl font-mono" value={formConfig.adminPhone || ''} onChange={e => setFormConfig({...formConfig, adminPhone: e.target.value})} />
                  <p className="text-[10px] text-slate-400 mt-1">This number will receive all form submissions if no specific zone admin is found.</p>
                </div>

                <button onClick={handleSaveFormConfig} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl">Save Configuration</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: REVIEW PARAMETERS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Review Parameters Config</h2>
            
            <div className="bg-white p-8 rounded-[40px] shadow-sm border">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Review Type</label>
                  <select 
                    className="w-full p-3 border rounded-xl font-bold text-sm"
                    value={newReviewParam.role}
                    onChange={e => setNewReviewParam({...newReviewParam, role: e.target.value})}
                  >
                    <option value="parent_to_teacher">Parent → Teacher</option>
                    <option value="teacher_to_parent">Teacher → Parent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Category</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-xl font-bold text-sm"
                    placeholder="e.g. Teaching & Professionalism"
                    value={newReviewParam.category}
                    onChange={e => setNewReviewParam({...newReviewParam, category: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Parameter</label>
                  <input 
                    type="text" 
                    className="w-full p-3 border rounded-xl font-bold text-sm"
                    placeholder="e.g. Subject Knowledge"
                    value={newReviewParam.parameter}
                    onChange={e => setNewReviewParam({...newReviewParam, parameter: e.target.value})}
                  />
                </div>
                <button onClick={handleAddReviewParam} className="bg-blue-600 text-white p-3 rounded-xl font-black uppercase text-xs h-[46px]">Add Parameter</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['parent_to_teacher', 'teacher_to_parent'].map(role => (
                  <div key={role} className="space-y-4">
                    <h3 className="text-xl font-black uppercase italic text-slate-700 border-b pb-2">
                      {role === 'parent_to_teacher' ? 'Parent → Teacher' : 'Teacher → Parent'}
                    </h3>
                    {reviewParams.filter(p => p.role === role).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{p.category}</p>
                          <p className="font-bold text-sm text-slate-800">{p.parameter}</p>
                        </div>
                        <button onClick={() => handleDeleteReviewParam(p.id)} className="text-red-500 hover:text-red-700">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                    {reviewParams.filter(p => p.role === role).length === 0 && <p className="text-slate-400 italic text-xs">No parameters defined.</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: FAQ MANAGER */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">FAQ Manager</h2>
              {!editingFaq && <button onClick={() => setEditingFaq({})} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Add New FAQ</button>}
            </div>

            {editingFaq ? (
              <form onSubmit={handleSaveFaq} className="bg-white p-8 rounded-[40px] shadow-sm border space-y-4">
                <h3 className="text-xl font-bold mb-4">{editingFaq.id ? 'Edit FAQ' : 'New FAQ'}</h3>
                <select 
                    className="w-full p-3 border rounded-xl bg-slate-50"
                    value={editingFaq.category || 'general'}
                    onChange={e => setEditingFaq({...editingFaq, category: e.target.value})}
                >
                    <option value="general">General</option>
                    <option value="parent">For Parents</option>
                    <option value="teacher">For Teachers</option>
                </select>
                <input type="text" placeholder="Question" className="w-full p-3 border rounded-xl" value={editingFaq.question || ''} onChange={e => setEditingFaq({...editingFaq, question: e.target.value})} required />
                <textarea placeholder="Answer" className="w-full p-3 border rounded-xl" rows="5" value={editingFaq.answer || ''} onChange={e => setEditingFaq({...editingFaq, answer: e.target.value})} required></textarea>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditingFaq(null)} className="px-4 py-2 rounded-xl border font-bold text-xs">Cancel</button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs">Save FAQ</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {faqs.map(faq => (
                  <div key={faq.id} className="bg-white p-6 rounded-2xl border shadow-sm flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{faq.category || 'General'}</span>
                      </div>
                      <h4 className="font-bold text-lg text-blue-900 leading-tight">{faq.question}</h4>
                      <h4 className="font-bold text-lg text-blue-900">{faq.question}</h4>
                      <p className="text-slate-600 mt-2">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setEditingFaq(faq)} className="text-blue-600 font-bold text-xs uppercase">Edit</button>
                      <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-600 font-bold text-xs uppercase">Delete</button>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && <p className="text-center text-slate-400 italic">No FAQs found.</p>}
              </div>
            )}
          </div>
        )}

        {/* TAB: TERMS EDITOR */}
        {activeTab === 'terms' && (
          <div className="space-y-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Terms & Guidelines Editor</h2>
            
          <div className="space-y-6">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Terms & Conditions</h2>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Parent & Student Terms</h3>
              <textarea 
                className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={termsParentContent} 
                onChange={e => setTermsParentContent(e.target.value)} 
                placeholder="Enter terms for parents..." 
              />
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-blue-900">General Terms</h3>
              <textarea 
                className="w-full h-96 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={termsContent} 
                onChange={e => setTermsContent(e.target.value)} 
                placeholder="Enter Terms & Conditions content here (HTML supported)..." 
              />
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Teacher Terms</h3>
              <textarea 
                className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={termsTeacherContent} 
                onChange={e => setTermsTeacherContent(e.target.value)} 
                placeholder="Enter terms for teachers..." 
              />
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border">
              <h3 className="text-xl font-bold mb-4 text-blue-900">Parent Guidelines (Do's and Don'ts)</h3>
              <textarea 
                className="w-full h-64 p-4 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                value={dosAndDontsContent} 
                onChange={e => setDosAndDontsContent(e.target.value)} 
                placeholder="Enter Do's and Don'ts content here (HTML supported)..." 
              />
            </div>

            <button onClick={handleSaveTerms} className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg hover:bg-blue-700 transition">
                Save All Terms
            </button>
          </div>
          </div>
        )}

        {/* TAB: SYSTEM SETTINGS & BLOCK MANAGER */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Global System Control</h2>
              <span className="bg-slate-900 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Master RBAC v2.0</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* BRANCH CONTACT MANAGER */}
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-t-8 border-slate-900">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2">
                  Branch WhatsApp Routing
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Admin 1 Phone</label>
                    <input 
                      type="text" 
                      value={admin1Phone} 
                      onChange={(e) => setAdmin1Phone(e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold border-none" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Admin 2 Phone</label>
                    <input 
                      type="text" 
                      value={admin2Phone} 
                      onChange={(e) => setAdmin2Phone(e.target.value)}
                      className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold border-none" 
                    />
                  </div>
                </div>
              </section>

              {/* PAYMENT SETTINGS */}
              <section className="bg-white p-8 rounded-[40px] shadow-sm border border-t-8 border-green-600">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest flex items-center gap-2">
                  Payment Configuration
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">UPI ID (VPA)</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mt-1 font-bold border-none" placeholder="e.g. param@upi" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400">Upload QR Code</label>
                    <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files[0])} className="w-full p-2 bg-slate-50 rounded-2xl mt-1 text-xs" />
                    {qrCodeUrl && (
                      <div className="mt-2">
                        <p className="text-[9px] text-green-600 font-bold uppercase">Current QR Active</p>
                        <img src={qrCodeUrl} alt="Current QR" className="w-20 h-20 object-contain mt-1 border rounded-lg" />
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* SAVE ACTION */}
            <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl flex flex-col items-center text-center">
              <h4 className="text-white font-black uppercase italic mb-2">Deploy Varanasi Branch Constants</h4>
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-8 leading-relaxed max-w-xs">
                Synchronizing will lock new TN sequences and update contact links across the entire bureau.
              </p>
              <button 
                onClick={handleSyncSettings}
                className="w-full max-w-sm bg-blue-600 text-white py-5 rounded-[32px] font-black uppercase tracking-widest text-xs shadow-xl hover:bg-blue-500 transition"
              >
                Sync Global Parameters
              </button>
            </div>
          </div>
        )}

        {/* MODAL FOR TEACHER HISTORY */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-[300] bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-xl bg-white h-full shadow-2xl p-10 overflow-y-auto animate-in slide-in-from-right duration-500 flex flex-col">
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 font-black hover:text-red-500 transition">CLOSE</button>
                <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-red-500 transition">
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
              <div className="flex-1 space-y-6">
                {selectedTeacherHistory?.map((h, i) => (
                  <div key={i} className={`p-6 rounded-3xl border-2 ${h.final_status === 'confirmed' ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'}`}>
                    <div className="flex justify-between mb-2">
                      <span className="text-[10px] font-black uppercase text-slate-400">{new Date(h.allotted_date).toLocaleDateString()}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${h.final_status === 'confirmed' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                        {h.final_status}
                      </span>
                    </div>
                    <h4 className="font-black text-lg text-slate-800 mb-1">{h.tuition_subject}</h4>
                    {h.cancel_reason && (
                      <div className="mt-4 p-4 bg-white rounded-2xl border border-red-50 shadow-sm">
                         <p className="text-[10px] font-black text-red-400 uppercase mb-1 tracking-widest">Cancellation Reason</p>
                         <p className="text-sm font-medium italic text-slate-700">"{h.cancel_reason}"</p>
                         {h.admin_voice_note && (
                           <div className="mt-4 pt-4 border-t border-slate-50">
                              <audio controls className="h-8 w-full scale-95 origin-left">
                                <source src={h.admin_voice_note} type="audio/ogg" />
                              </audio>
                           </div>
                         )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100">
                 <button 
                  onClick={handleBanTeacher}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-red-700 transition"
                 >PERMANENTLY BAN TEACHER</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BLACKLIST MANAGER */}
        {activeTab === 'blacklist' && (
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Blacklist Manager</h2>
            
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-red-100">
              <h3 className="text-xl font-bold text-red-600 mb-4">Add to Blacklist</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Role</label>
                  <select className="w-full p-3 border rounded-xl font-bold text-sm" value={newBlacklistEntry.role} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, role: e.target.value})}>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Mobile Number</label>
                  <input type="text" className="w-full p-3 border rounded-xl font-bold text-sm" placeholder="Phone" value={newBlacklistEntry.phone} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Email ID</label>
                  <input type="email" className="w-full p-3 border rounded-xl font-bold text-sm" placeholder="Email" value={newBlacklistEntry.email} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-400">Main Location</label>
                  <select className="w-full p-3 border rounded-xl font-bold text-sm" value={newBlacklistEntry.location} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, location: e.target.value})}>
                    <option value="">Select Location...</option>
                    {locations.map(l => <option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                  </select>
                </div>
                <button onClick={handleAddBlacklist} className="bg-red-600 text-white p-3 rounded-xl font-black uppercase text-xs h-[46px]">Block User</button>
              </div>
              <div className="mt-4">
                 <label className="text-[10px] font-bold uppercase text-slate-400">Reason for Blacklisting</label>
                 <input type="text" className="w-full p-3 border rounded-xl font-bold text-sm" placeholder="Reason (Optional)" value={newBlacklistEntry.reason} onChange={e => setNewBlacklistEntry({...newBlacklistEntry, reason: e.target.value})} />
              </div>
            </div>

            <div className="flex justify-end">
              <input 
                type="text" 
                placeholder="Search Blacklist..." 
                className="p-3 border rounded-xl font-bold text-sm w-64"
                value={blacklistSearch}
                onChange={(e) => setBlacklistSearch(e.target.value)}
              />
            </div>

            <div className="bg-white rounded-[40px] shadow-sm border overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                  <tr>
                    <th className="p-4">Role</th>
                    <th className="p-4">Contact Details</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blacklist.filter(item => 
                    (item.phone && item.phone.includes(blacklistSearch)) || 
                    (item.email && item.email.toLowerCase().includes(blacklistSearch.toLowerCase())) ||
                    (item.location && item.location.toLowerCase().includes(blacklistSearch.toLowerCase()))
                  ).map(item => (
                    <tr key={item.id} className="border-b hover:bg-red-50 transition">
                      <td className="p-4 font-black text-xs uppercase">{item.role}</td>
                      <td className="p-4 text-xs font-bold text-slate-700">{item.phone || '-'} <br/> {item.email || '-'}</td>
                      <td className="p-4 text-xs">{item.location || 'N/A'}</td>
                      <td className="p-4 text-xs italic text-slate-500">{item.reason}</td>
                      <td className="p-4 text-right"><button onClick={() => handleDeleteBlacklist(item.id)} className="text-slate-400 hover:text-green-600 font-bold text-[10px] uppercase">Unblock</button></td>
                    </tr>
                  ))}
                  {blacklist.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic text-xs">No blacklisted users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TEACHER SCORE CARD MODAL */}
        {showScoreModal && (
          <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black uppercase italic text-slate-800">Teacher Score Card</h3>
                <button onClick={() => setShowScoreModal(false)} className="text-slate-400 hover:text-red-500"><i className="fas fa-times text-2xl"></i></button>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl mb-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full overflow-hidden border-2 border-blue-200">
                  <img src={selectedTeacherForScore?.teacher_details?.photo_url || 'https://placehold.co/100'} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-blue-900">{selectedTeacherForScore?.full_name}</h4>
                  <p className="text-xs font-bold text-blue-600 uppercase">Internal Evaluation System</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Current Score</p>
                  <p className="text-2xl font-black text-slate-900">{Math.max(0, (Number(scoreData.academic) + Number(scoreData.teaching) + Number(scoreData.communication) + Number(scoreData.experience) + Number(scoreData.feedback) + Number(scoreData.punctuality) + Number(scoreData.ethics)) - (Number(scoreData.cancellation_penalty) + Number(scoreData.missed_demo_penalty)))}/100</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: '1. Academic Qualification', max: 20, key: 'academic', desc: 'Degree, Specialization, Clarity' },
                  { label: '2. Teaching Skills', max: 25, key: 'teaching', desc: 'Methodology, Examples, Planning' },
                  { label: '3. Communication', max: 15, key: 'communication', desc: 'Language, Politeness, Handling' },
                  { label: '4. Experience', max: 10, key: 'experience', desc: 'Years, Track Record' },
                  { label: '5. Student Feedback', max: 15, key: 'feedback', desc: 'Satisfaction, Results, Retention' },
                  { label: '6. Punctuality', max: 10, key: 'punctuality', desc: 'Attendance, Reliability' },
                  { label: '7. Compliance', max: 5, key: 'ethics', desc: 'Policies, Integrity' }
                ].map((field) => (
                  <div key={field.key} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex justify-between mb-2">
                      <label className="font-bold text-xs text-slate-700 uppercase">{field.label}</label>
                      <span className="text-[10px] font-black text-slate-400">Max: {field.max}</span>
                    </div>
                    <input 
                      type="number" 
                      min="0" 
                      max={field.max} 
                      className="w-full p-2 rounded-lg border text-sm font-bold mb-1"
                      value={scoreData[field.key]}
                      onChange={(e) => setScoreData({...scoreData, [field.key]: Math.min(Number(e.target.value), field.max)})}
                    />
                    <p className="text-[9px] text-slate-400 italic">{field.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-red-50 p-4 rounded-2xl border border-red-100">
                <h4 className="font-bold text-xs text-red-700 uppercase mb-3">Penalties (Negative Points)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="font-bold text-xs text-slate-700 uppercase">Tuition Cancellation</label>
                    <input 
                      type="number" 
                      min="0" 
                      className="w-full p-2 rounded-lg border text-sm font-bold mb-1 text-red-600"
                      value={scoreData.cancellation_penalty}
                      onChange={(e) => setScoreData({...scoreData, cancellation_penalty: Math.max(0, Number(e.target.value))})}
                    />
                    <p className="text-[9px] text-slate-400 italic">Points deducted for cancelling confirmed tuition</p>
                  </div>
                  <div>
                    <label className="font-bold text-xs text-slate-700 uppercase">Missed Demo</label>
                    <input 
                      type="number" 
                      min="0" 
                      className="w-full p-2 rounded-lg border text-sm font-bold mb-1 text-red-600"
                      value={scoreData.missed_demo_penalty}
                      onChange={(e) => setScoreData({...scoreData, missed_demo_penalty: Math.max(0, Number(e.target.value))})}
                    />
                    <p className="text-[9px] text-slate-400 italic">Points deducted for not attending scheduled demo</p>
                  </div>
                </div>
              </div>

              <button onClick={handleScoreSubmit} className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-slate-800 transition">
                Save Evaluation
              </button>
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

      </main>
      </div>
      <Footer />
    </>
  );
}