import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
// NEW: Import the Location Guard for mandatory GPS pinning
import LocationGuard from '../shared/components/LocationGuard';
import useLocationTracker from '../hooks/useLocationTracker';
import { getAssignedAdmin } from '../shared/utils/adminAssignment';

export default function ParentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [tuitions, setTuitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [feedbackText, setFeedbackText] = useState("");
  
  // NEW: Payment States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedTuition, setSelectedTuition] = useState({ subject: '', amount: 0 });

  // NEW: Identity Reveal States
  const [verifiedTeacher, setVerifiedTeacher] = useState(null);

  // NEW: Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ tuitionId: '', teacherId: '', rating: 5, comment: '' });
  const [reviewParams, setReviewParams] = useState([]);
  const [ratings, setRatings] = useState({});

  // NEW: Onboarding State
  const [locations, setLocations] = useState([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showPhoneOnboarding, setShowPhoneOnboarding] = useState(false);
  const [onboardingPhone, setOnboardingPhone] = useState('');

  // NEW: Info States
  const [holidays, setHolidays] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [payments, setPayments] = useState([]);
  const [guidelines, setGuidelines] = useState('');
  const [adminPhones, setAdminPhones] = useState({ 'Admin 1': '8188005373', 'Admin 2': '8756525373' });
  const [paymentSettings, setPaymentSettings] = useState({ upiId: '', qrCodeUrl: '' });

  // NEW: Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ 
    mother_phone: '', 
    father_phone: '', 
    secondary_phone: '' 
  });

  // Track location automatically
  useLocationTracker(profile?.id, profile?.user_role);

  useEffect(() => {
    fetchParentData();
    triggerHolidayAlert(); // NEW: Automatic Holiday Reminder
    fetchSystemSettings();
  }, []);

  // NEW: Automatic Holiday Alert Logic
  async function triggerHolidayAlert() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const { data } = await supabase
        .from('holidays')
        .select('*')
        .eq('date', dateStr)
        .maybeSingle();

      if (data) {
        setMessage({ type: 'info', text: `🔔 HOLIDAY ALERT: Tomorrow (${new Date(data.date).toDateString()}) is a holiday for ${data.event_name}.` });
      }
    } catch (err) {
      console.error("Holiday Alert Error:", err);
    }
  }

  async function fetchSystemSettings() {
    const { data } = await supabase.from('system_settings').select('*');
    if (data) {
      const phones = { ...adminPhones };
      const p1 = data.find(s => s.key === 'admin_1_phone')?.value;
      const p2 = data.find(s => s.key === 'admin_2_phone')?.value;
      if (p1) phones['Admin 1'] = p1;
      if (p2) phones['Admin 2'] = p2;
      
      const upi = data.find(s => s.key === 'upi_id')?.value;
      const qr = data.find(s => s.key === 'qr_code_url')?.value;
      setPaymentSettings({ upiId: upi, qrCodeUrl: qr });
      setAdminPhones(phones);
    }
  }

  async function fetchParentData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);

      if (profileData) {
        setEditProfileData({
          mother_phone: profileData.mother_phone || '',
          father_phone: profileData.father_phone || '',
          secondary_phone: profileData.secondary_phone || ''
        });
      }

      // Check if admin_zone is missing
      if (profileData && !profileData.admin_zone) {
          const { data: locData } = await supabase.from('locations').select('*').order('location_name', { ascending: true });
          setLocations(locData || []);
          setShowOnboarding(true);
      } else {
          setShowOnboarding(false);
      }

      // Check if phone_number is missing (e.g. Google Login)
      if (profileData && !profileData.phone_number) {
        setShowPhoneOnboarding(true);
      } else {
        setShowPhoneOnboarding(false);
      }

      const { data: tuitionData } = await supabase
        .from('tuitions')
        .select(`
          *,
          applications (
            id, 
            teacher_id,
            status, 
            teacher:profiles(
              id,
              full_name,
              teacher_details(*)
            )
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      setTuitions(tuitionData || []);

      // Fetch Holidays
      const { data: hols } = await supabase.from('holidays').select('*').order('date');
      setHolidays(hols || []);

      // Fetch Guidelines
      const { data: guidelinesData } = await supabase.from('site_content').select('content').eq('key', 'dos_and_donts').maybeSingle();
      if (guidelinesData) setGuidelines(guidelinesData.content);

      // Fetch Payment History
      const { data: payData, error: payError } = await supabase
        .from('bureau_ledger')
        .select('*, tuition:tuitions!inner(subject, parent_id)')
        .eq('tuition.parent_id', user.id)
        .order('created_at', { ascending: false });

      if (payError) {
        console.error("Error fetching payment history:", payError);
      }
      console.log("Fetched Payment Data:", payData); // Log the data
      setPayments(payData || []);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // NEW: Real-time subscription for Demo Start
  useEffect(() => {
    if (!profile) return;

    const subscription = supabase
      .channel('public:applications')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'applications' }, (payload) => {
        if (payload.new.status === 'demo_started') {
           // Check if this application belongs to one of the parent's tuitions
           // Since we don't have tuition_id in payload easily mapped without a join, we can just refresh or show a generic alert if we want to be simple, 
           // or we can check if the tuition_id exists in our current 'tuitions' state.
           const relevantTuition = tuitions.find(t => t.id === payload.new.tuition_id);
           if (relevantTuition) {
               alert(`🔔 DEMO STARTED: The teacher has arrived and started the demo for ${relevantTuition.subject}.`);
               fetchParentData(); // Refresh to update UI
           }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profile, tuitions]); // Re-subscribe if profile or tuitions list changes (to ensure we have latest tuition IDs)

  // Helper to safely get teacher details (handles array or object response)
  const getTeacherDetails = (teacher) => {
    if (!teacher || !teacher.teacher_details) return {};
    return Array.isArray(teacher.teacher_details) ? teacher.teacher_details[0] : teacher.teacher_details;
  };

  const handleRejectTeacher = async (applicationId, tuitionId) => {
    const reason = prompt("Please provide a reason for requesting a replacement (e.g., Teaching style not matching, Scheduling conflict):");
    if (!reason) return;

    if (!window.confirm("Are you sure you want to reject this teacher and request a new one?")) return;

    setLoading(true);
    try {
      // 1. Reject the application
      const { error: appError } = await supabase.from('applications').update({ status: 'rejected', parent_feedback: reason }).eq('id', applicationId);
      if (appError) throw appError;

      // 2. Re-open the tuition
      const { error: tuiError } = await supabase.from('tuitions').update({ status: 'open' }).eq('id', tuitionId);
      if (tuiError) throw tuiError;

      // 3. Notify Admin via Support Ticket
      await supabase.from('support_tickets').insert({ user_id: profile.id, tuition_id: tuitionId, issue_description: `Teacher Rejected by Parent. Reason: ${reason}. Requesting replacement.`, status: 'open' });

      alert("Request submitted. We will assign a new teacher shortly.");
      fetchParentData();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Handle Onboarding Submit
  const handleOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocationId) return;
    setLoading(true);
    try {
        const mainLoc = locations.find(l => l.id === parseInt(selectedLocationId));
        const adminZone = mainLoc ? mainLoc.admin_zone : 'Admin 1';
        const assignedAdminId = mainLoc ? await getAssignedAdmin(mainLoc.location_name) : '08e6845d-a656-4a27-b028-6bc6bac54b03';

        await supabase.from('profiles').update({ 
            admin_zone: adminZone,
            assigned_admin_id: assignedAdminId
        }).eq('id', profile.id);

        alert("Profile updated successfully!");
        setShowOnboarding(false);
        fetchParentData();
        
        // Optimistically update local state
        setProfile(prev => ({ ...prev, admin_zone: adminZone }));
        
        // Fetch fresh data in background
        setTimeout(fetchParentData, 1500);
    } catch (error) {
        alert("Error updating profile: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // NEW: Handle Phone Onboarding & Sync
  const handlePhoneOnboardingSubmit = async (e) => {
    e.preventDefault();
    if (!onboardingPhone || onboardingPhone.length < 10) return alert("Please enter a valid phone number.");
    setLoading(true);
    try {
        // 1. Update Profile
        const { error: profileError } = await supabase.from('profiles').update({ phone_number: onboardingPhone }).eq('id', profile.id);
        if (profileError) throw profileError;

        // 2. Sync Leads & Tuitions (Logic "vice versa")
        const cleanPhone = onboardingPhone.replace(/\D/g, '');
        const formats = [onboardingPhone];
        if (cleanPhone.length === 10) formats.push(`+91${cleanPhone}`);
        
        // Sync Leads & Tuitions
        for (const ph of formats) {
            // Link Leads
            await supabase.from('leads').update({ parent_id: profile.id }).eq('raw_data->>phone_number', ph).is('parent_id', null);
            
            // Link Tuitions (if phone_number column exists for manual entries)
            try {
                await supabase.from('tuitions').update({ parent_id: profile.id }).eq('phone_number', ph).is('parent_id', null);
            } catch (err) { 
                // Ignore if column doesn't exist or other error, as this is a best-effort sync
                console.warn("Tuition sync skipped", err); 
            }
        }

        alert("Phone number saved! Any existing requests have been linked to your account.");
        setShowPhoneOnboarding(false);
        fetchParentData();
    } catch (error) {
        alert("Error: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // NEW: Handle Profile Update
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
        const { error } = await supabase.from('profiles').update(editProfileData).eq('id', profile.id);
        if (error) throw error;
        alert("Profile updated successfully!");
        setIsEditingProfile(false);
        fetchParentData();
    } catch (error) {
        alert("Error updating profile: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // NEW: Identity Verification Logic
  const handleVerifyIdentity = (applicationObj) => {
    const details = getTeacherDetails(applicationObj.teacher);
    if (details?.is_selfie_approved) {
      setVerifiedTeacher({
        name: applicationObj.teacher.full_name,
        photo: details.photo_url
      });
    } else {
      alert("Verification Pending: This teacher's ID is still being audited by the Bureau.");
    }
  };

  async function confirmTeacher(applicationId, tuitionId, feedback) {
    const { error: appError } = await supabase
      .from('applications')
      .update({ 
        status: 'confirmed',
        parent_feedback: feedback,
        demo_completed_at: new Date()
      })
      .eq('id', applicationId);

    const { error: tuiError } = await supabase
      .from('tuitions')
      .update({ status: 'confirmed' })
      .eq('id', tuitionId);

    if (!appError && !tuiError) {
      alert("Congratulations! Your tuition is now officially confirmed.");
      fetchParentData(); 
      setFeedbackText("");
    } else {
      alert("Error confirming teacher. Please contact Admin.");
    }
  }

  const handleReportIssue = async (tuitionId) => {
    const issue = prompt("Please describe the issue with this tuition:");
    if (issue) {
      const { error } = await supabase.from('support_tickets').insert({
        user_id: profile.id,
        tuition_id: tuitionId,
        issue_description: issue,
        status: 'open'
      });
      if (error) alert("Error reporting issue: " + error.message);
      else alert("Issue reported successfully. Admin will contact you shortly.");
    }
  };

  const handleReviewTeacher = async (tuitionId, teacherId) => {
    const { data } = await supabase.from('review_parameters').select('*').eq('role', 'parent_to_teacher').order('category');
    setReviewParams(data || []);
    setRatings({});
    setReviewData({ tuitionId, teacherId, rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.comment) return alert("Please write a short review.");
    
    const ratingValues = Object.values(ratings);
    const avgRating = ratingValues.length > 0 
      ? Math.round(ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) 
      : reviewData.rating;

    setLoading(true);
    const { error } = await supabase.from('reviews').insert({
      reviewer_id: profile.id,
      reviewee_id: reviewData.teacherId,
      tuition_id: reviewData.tuitionId,
      rating: avgRating,
      ratings: ratings,
      comment: reviewData.comment,
      type: 'parent_to_teacher'
    });
    setLoading(false);
    if (error) alert("Error submitting review: " + error.message);
    else {
      alert("Review submitted successfully!");
      setShowReviewModal(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login-parent');
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-700">Loading Parent Portal...</div>;

  const currentAdminPhone = profile?.admin_zone ? adminPhones[profile.admin_zone] : adminPhones['Admin 2'];

  return (
    <>
      {/* NEW: MANDATORY LOCATION GUARD (Fires if profile.location is missing) */}
      {profile && (
        <LocationGuard 
          user={{ id: profile.id }} 
          currentProfile={profile} 
          onLocationSet={() => fetchParentData()} 
        />
      )}

      {/* NEW: ONBOARDING MODAL FOR PARENTS */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[110] bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl text-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Select Your Area</h2>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">To connect you with the nearest Admin</p>
            
            <form onSubmit={handleOnboardingSubmit} className="space-y-6">
                <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase">Select Your Main Location</label>
                    <input
                        type="text"
                        placeholder="Search for your area..."
                        className="w-full p-2 mb-2 text-xs border rounded-lg"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                    />
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs border" 
                        value={selectedLocationId} 
                        onChange={(e) => setSelectedLocationId(e.target.value)} 
                        required
                    >
                        <option value="">Select Area...</option>
                        {locations.filter(l => l.location_name.toLowerCase().includes(locationSearch.toLowerCase())).map(l => <option key={l.id} value={l.id}>{l.location_name}</option>)}
                    </select>
                </div>

                <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                    {loading ? 'Saving...' : 'Confirm Location'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW: PHONE ONBOARDING MODAL */}
      {showPhoneOnboarding && (
        <div className="fixed inset-0 z-[115] bg-slate-900/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-md shadow-2xl text-center">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Complete Your Profile</h2>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">Please provide your mobile number to sync existing requests.</p>
            
            <form onSubmit={handlePhoneOnboardingSubmit} className="space-y-6">
                <div>
                    <input type="tel" placeholder="Mobile Number" className="w-full p-4 bg-slate-50 rounded-2xl font-bold text-lg text-center border" value={onboardingPhone} onChange={(e) => setOnboardingPhone(e.target.value)} required />
                </div>
                <button disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                    {loading ? 'Syncing...' : 'Save & Sync'}
                </button>
            </form>
          </div>
        </div>
      )}

      {/* NEW: IDENTITY REVEAL UI (Fires after successful QR Scan) */}
      {verifiedTeacher && (
        <div className="fixed inset-0 z-[110] bg-blue-900/95 flex items-center justify-center p-6 animate-in zoom-in duration-300">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            </div>
            <h3 className="text-xl font-black uppercase italic mb-1">Identity Verified</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-6 tracking-widest">Param Tuitions Safety Check</p>
            
            <div className="w-48 h-48 mx-auto mb-6 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-lg group">
              <img src={verifiedTeacher.photo} className="w-full h-full object-cover" alt="Verified Tutor" />
            </div>
            
            <p className="text-lg font-black text-slate-800 uppercase leading-none">{verifiedTeacher.name}</p>
            <p className="text-[10px] text-green-600 font-black mt-2 uppercase">Official Param Tutor</p>
            
            <button 
              onClick={() => setVerifiedTeacher(null)}
              className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-600 transition"
            >Close Identity Check</button>
          </div>
        </div>
      )}

      {/* NEW: REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl my-10">
            <h3 className="text-xl font-black uppercase italic mb-4 text-slate-800">Rate Your Teacher</h3>
            
            {reviewParams.length > 0 ? (
              <div className="space-y-6 mb-6 max-h-[50vh] overflow-y-auto pr-2">
                {Object.entries(reviewParams.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {})).map(([category, params]) => (
                  <div key={category}>
                    <h4 className="text-xs font-black text-blue-600 uppercase mb-2 sticky top-0 bg-white py-1">{category}</h4>
                    <div className="space-y-3">
                      {params.map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                          <span className="text-xs font-bold text-slate-700">{p.parameter}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button 
                                key={star} 
                                onClick={() => setRatings(prev => ({ ...prev, [p.id]: star }))}
                                className={`text-lg transition ${star <= (ratings[p.id] || 0) ? 'text-yellow-400' : 'text-slate-200'}`}
                              >★</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <button 
                    key={star} 
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className={`text-3xl transition ${star <= reviewData.rating ? 'text-yellow-400 scale-110' : 'text-slate-200'}`}
                  >★</button>
                ))}
              </div>
            )}

            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
              rows="3"
              placeholder="Share your experience with this teacher..."
              value={reviewData.comment}
              onChange={e => setReviewData({...reviewData, comment: e.target.value})}
            ></textarea>

            <div className="flex gap-3">
              <button onClick={() => setShowReviewModal(false)} className="flex-1 py-3 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-50">Cancel</button>
              <button onClick={submitReview} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase shadow-lg hover:bg-blue-700">Submit Review</button>
            </div>
          </div>
        </div>
      )}

      <Header />
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-72 bg-slate-900 text-white p-8 flex flex-col md:h-screen sticky top-0">
            <div className="mb-10">
                <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase italic">Parent Panel</h1>
                <div className="mt-4">
                    <p className="text-xs text-slate-400 font-bold uppercase">Welcome,</p>
                    <p className="text-sm font-black text-white leading-tight">{profile?.full_name}</p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">{profile?.admin_zone} Zone</p>
                </div>
            </div>
            
            <nav className="space-y-2 flex-1">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📊 My Tuitions</button>
                <button onClick={() => setActiveTab('holidays')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'holidays' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>🗓️ Holidays</button>
                <button onClick={() => setActiveTab('payments')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'payments' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>💳 Payment History</button>
                <button onClick={() => setActiveTab('guidelines')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'guidelines' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📜 Dos & Don'ts</button>
                <button onClick={() => navigate('/post-inquiry')} className="w-full text-left p-3 rounded-xl transition hover:bg-slate-800 text-green-400 font-bold">➕ Post New Inquiry</button>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-700">
                <button onClick={handleLogout} className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition">
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout Securely
                </button>
            </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 md:max-h-screen md:overflow-y-auto">
            {message.text && (
              <div className={`mb-6 p-5 rounded-2xl text-xs font-bold border-2 ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                {message.text}
              </div>
            )}

            {/* TAB: OVERVIEW (TUITIONS) */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Contact & Support */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-slate-800">My Profile</h3>
                            <button onClick={() => setIsEditingProfile(!isEditingProfile)} className="text-blue-600 text-xs font-bold uppercase">
                                {isEditingProfile ? 'Cancel' : 'Edit'}
                            </button>
                        </div>
                        
                        {isEditingProfile ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mother's Mobile</label>
                                    <input type="text" className="w-full p-2 border rounded-lg text-sm font-bold" value={editProfileData.mother_phone} onChange={e => setEditProfileData({...editProfileData, mother_phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Father's Mobile</label>
                                    <input type="text" className="w-full p-2 border rounded-lg text-sm font-bold" value={editProfileData.father_phone} onChange={e => setEditProfileData({...editProfileData, father_phone: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Secondary Mobile</label>
                                    <input type="text" className="w-full p-2 border rounded-lg text-sm font-bold" value={editProfileData.secondary_phone} onChange={e => setEditProfileData({...editProfileData, secondary_phone: e.target.value})} />
                                </div>
                                <button onClick={handleSaveProfile} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold text-xs uppercase">Save Details</button>
                            </div>
                        ) : (
                            <div className="space-y-3 text-slate-700">
                                <div className="flex justify-between text-sm"><span className="text-slate-400">Primary:</span><span className="font-bold">{profile?.phone_number}</span></div>
                                {profile?.mother_phone && (
                                    <div className="flex justify-between text-sm"><span className="text-slate-400">Mother:</span><span className="font-bold">{profile.mother_phone}</span></div>
                                )}
                                {profile?.father_phone && (
                                    <div className="flex justify-between text-sm"><span className="text-slate-400">Father:</span><span className="font-bold">{profile.father_phone}</span></div>
                                )}
                                <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Secondary:</span>
                                <span className="font-bold">{profile?.secondary_phone || 'Not provided'}</span>
                                </div>
                            </div>
                        )}
                        </div>

                        <div className="bg-indigo-900 text-white p-6 rounded-[32px] shadow-lg">
                        <h3 className="font-bold mb-2">Need Help?</h3>
                        <p className="text-xs text-indigo-200 mb-4 text-[11px]">Contact your Admin ({profile?.admin_zone}) for quick assistance.</p>
                        <div className="flex gap-2">
                          <a href={`tel:${currentAdminPhone}`} className="flex-1 block text-center bg-white text-indigo-900 py-2 rounded-xl font-bold text-sm hover:bg-indigo-50 transition">
                            <i className="fas fa-phone-alt mr-1"></i> Call
                          </a>
                          <a href={`https://wa.me/91${currentAdminPhone}`} target="_blank" rel="noreferrer" className="flex-1 block text-center bg-green-500 text-white py-2 rounded-xl font-bold text-sm hover:bg-green-600 transition">
                            <i className="fab fa-whatsapp mr-1"></i> Chat
                          </a>
                        </div>
                        </div>
                    </div>

                    {/* Right Column: Tuitions List */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Your Tuition Requirements</h2>

                        {tuitions.length === 0 ? (
                        <div className="bg-white p-12 rounded-[32px] border-2 border-dashed text-center text-slate-400">
                            No inquiries posted yet.
                        </div>
                        ) : (
                        tuitions.map(tui => (
                            <div key={tui.id} className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                                <div>
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    Class {tui.student_class} • {tui.subject}
                                </span>
                                <h4 className="text-lg font-bold text-slate-800 mt-1">{tui.location_name}</h4>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                {tui.status !== 'confirmed' && (
                                    <button 
                                    onClick={() => {
                                        setSelectedTuition({ subject: tui.subject, amount: tui.fee_amount || 0 });
                                        setIsPayModalOpen(true);
                                    }}
                                    className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700 transition shadow-sm"
                                    >
                                    Pay Fees
                                    </button>
                                )}

                                <button 
                                    onClick={() => handleReportIssue(tui.id)}
                                    className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase underline"
                                >Report Issue</button>

                                {tui.status === 'confirmed' ? (
                                    <button 
                                    onClick={() => navigate(`/control-room/${tui.id}`)}
                                    className="bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-800 transition shadow-lg"
                                    >
                                    View Progress Feed
                                    </button>
                                ) : (
                                    <div className={`px-4 py-1 rounded-full text-xs font-black uppercase ${
                                        ['demo_allotted', 'DEMO_SCHEDULED', 'booked', 'BOOKED'].includes(tui.status) ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {['demo_allotted', 'booked', 'BOOKED'].includes(tui.status) ? 'DEMO BOOKED' : tui.status.replace('_', ' ')}
                                    </div>
                                )}
                                </div>
                            </div>

                            <div className="p-6">
                                <h5 className="text-[11px] font-bold text-slate-400 uppercase mb-4 tracking-wider">Teacher Status</h5>
                                <div className="space-y-4">
                                {tui.applications?.filter(app => ['demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'DEMO_COMPLETED', 'confirmed', 'booked', 'BOOKED', 'demo_started'].includes(app.status)).map(app => {
                                    const teacherDetails = getTeacherDetails(app.teacher);
                                    return (
                                    <div key={app.id} className="p-4 rounded-2xl bg-slate-50 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleVerifyIdentity(app)}>
                                        <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden border border-slate-200">
                                        <img src={teacherDetails?.photo_url || 'https://placehold.co/150'} alt="Tutor" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                        <p className="font-bold text-slate-800 text-sm">{app.teacher?.full_name || 'Assigned Teacher'}</p>
                                        <p className="text-[11px] text-blue-500 font-bold uppercase tracking-tighter">Click to Verify ID</p>
                                        </div>
                                    </div>

                                    {['demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'DEMO_COMPLETED', 'booked', 'BOOKED', 'demo_started'].includes(app.status) && tui.status !== 'confirmed' && (
                                        <div className="flex-1 max-w-xs space-y-2">
                                        <input 
                                            type="text" 
                                            placeholder="Write small feedback..." 
                                            className="w-full p-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none"
                                            onChange={(e) => setFeedbackText(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRejectTeacher(app.id, tui.id)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-xl text-[10px] font-bold hover:bg-red-200 transition">
                                                Reject / Replace
                                            </button>
                                            <button onClick={() => confirmTeacher(app.id, tui.id, feedbackText)} className="flex-1 bg-green-600 text-white py-2 rounded-xl text-[10px] font-bold shadow-md hover:bg-green-700 transition">
                                                Confirm Teacher
                                            </button>
                                        </div>
                                        </div>
                                    )}

                                    {app.status === 'confirmed' && (
                                        <div className="text-right">
                                        <span className="text-green-600 font-bold text-xs italic">✓ Officially teaching</span>
                                        <button 
                                          onClick={() => handleReviewTeacher(tui.id, app.teacher_id || app.teacher?.id)}
                                          className="block mt-1 text-[10px] font-black text-blue-500 hover:underline uppercase"
                                        >★ Review Teacher</button>
                                        <p className="text-[10px] text-slate-400">Track progress in the Feed above.</p>
                                        </div>
                                    )}
                                    </div>
                                    );
                                })}
                                {(!tui.applications || tui.applications.filter(app => ['demo_allotted', 'DEMO_SCHEDULED', 'DEMO_POSTPONED', 'DEMO_COMPLETED', 'confirmed', 'booked', 'BOOKED', 'demo_started'].includes(app.status)).length === 0) && (
                                    <p className="text-xs text-slate-400 italic text-center py-4 w-full">
                                        {tui.status === 'open' ? 'Finding matching teachers in Varanasi...' : 'Teacher allotted, waiting for details...'}
                                    </p>
                                )}
                                </div>
                            </div>
                            </div>
                        ))
                        )}
                    </div>
                </div>
            )}

            {/* TAB: HOLIDAYS */}
            {activeTab === 'holidays' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Holiday Calendar</h2>
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                        {holidays.length > 0 ? holidays.map(h => (
                            <div key={h.id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-slate-50 transition rounded-xl">
                                <span className="font-black text-slate-800 uppercase text-sm">{h.event_name}</span>
                                <span className="text-blue-600 font-bold text-xs bg-blue-50 px-3 py-1 rounded-full">{new Date(h.date).toDateString()}</span>
                            </div>
                        )) : (
                            <p className="text-center text-slate-400 italic">No holidays scheduled.</p>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: PAYMENT HISTORY */}
            {activeTab === 'payments' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Payment History</h2>
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                        {payments.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-400 uppercase border-b pb-4">
                                        <th className="pb-4">Date</th>
                                        <th className="pb-4">Tuition</th>
                                        <th className="pb-4">Amount</th>
                                        <th className="pb-4 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map(p => (
                                        <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50 transition">
                                            <td className="py-4 text-xs font-bold text-slate-600">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="py-4 text-xs font-bold text-slate-800">{p.tuition?.subject || 'N/A'}</td>
                                            <td className="py-4 text-xs font-black text-slate-800">₹{p.total_fee}</td>
                                            <td className="py-4 text-right"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">PAID</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center text-slate-400 italic">No payment records found.</p>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: GUIDELINES */}
            {activeTab === 'guidelines' && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">Parent Guidelines</h2>
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 space-y-6">
                        {guidelines ? (
                            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: guidelines }} />
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-blue-900 font-black uppercase text-sm mb-2">Parent Guidelines</h3>
                                    <p className="text-xs font-bold text-slate-600 mb-4">
                                        To ensure a smooth, safe, and professional learning experience for your child,
                                        all parents are requested to carefully read and strictly follow the guidelines below.
                                    </p>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                        <h4 className="text-blue-800 font-black uppercase text-xs tracking-widest mb-3">1. Payment & Fee Policy <span className="text-red-600">(Strictly Mandatory)</span></h4>
                                        <ul className="list-disc list-outside ml-4 text-xs font-bold text-slate-700 space-y-2 leading-relaxed">
                                            <li><strong>Do not give any advance payment to the teacher</strong> under any circumstances.</li>
                                            <li>The first month’s tuition fee will be collected <strong>only by Param Tuition Bureau</strong>.</li>
                                            <li><strong>Do not make any payment directly to the teacher</strong> (cash, UPI, bank transfer, or any other mode).</li>
                                            <li>Any payment made directly to the teacher will be considered outside the responsibility of Param Tuition Bureau.</li>
                                        </ul>
                                    </div>

                                    <div className="pl-2">
                                        <h4 className="text-blue-800 font-black uppercase text-xs tracking-widest mb-3">2. Demo Class Confirmation</h4>
                                        <ul className="list-disc list-outside ml-4 text-xs font-medium text-slate-600 space-y-2 leading-relaxed">
                                            <li>Allow the teacher to start the demo class <strong>only after official confirmation</strong> from Param Tuition Bureau.</li>
                                            <li>Do not entertain demo classes arranged privately without bureau confirmation.</li>
                                            <li>Demo details (date, time, teacher) will be officially communicated by the bureau.</li>
                                        </ul>
                                    </div>

                                    <div className="pl-2">
                                        <h4 className="text-blue-800 font-black uppercase text-xs tracking-widest mb-3">3. Teacher Conduct & Professionalism</h4>
                                        <p className="text-xs font-medium text-slate-600 mb-2">Please inform us immediately if you observe any of the following:</p>
                                        <ul className="list-disc list-outside ml-4 text-xs font-medium text-slate-600 space-y-2 leading-relaxed">
                                            <li>Teacher is absent or irregular</li>
                                            <li>Teacher is not punctual</li>
                                            <li>Teacher uses a mobile phone during teaching</li>
                                            <li>Teacher behaves unprofessionally or disrespectfully</li>
                                            <li>Teaching quality is not maintained during demo or regular classes</li>
                                        </ul>
                                    </div>

                                    <div className="pl-2">
                                        <h4 className="text-blue-800 font-black uppercase text-xs tracking-widest mb-3">4. Holidays & Leave Policy</h4>
                                        <ul className="list-disc list-outside ml-4 text-xs font-medium text-slate-600 space-y-2 leading-relaxed">
                                            <li>One holiday per month is allowed for the teacher.</li>
                                            <li>If the teacher asks for additional leave:
                                                <ul className="list-circle list-inside ml-4 mt-1 space-y-1 text-slate-500">
                                                    <li>Mark the leave in your Parent Account</li>
                                                    <li>Request compensation for the missed class</li>
                                                </ul>
                                            </li>
                                            <li>The compensated class will be scheduled accordingly.</li>
                                        </ul>
                                    </div>

                                    <div className="pl-2">
                                        <h4 className="text-blue-800 font-black uppercase text-xs tracking-widest mb-3">5. Holiday List & Updates</h4>
                                        <ul className="list-disc list-outside ml-4 text-xs font-medium text-slate-600 space-y-2 leading-relaxed">
                                            <li>All official holiday lists and policy updates will be uploaded on the website.</li>
                                            <li>Parents are requested to check the website regularly for updates.</li>
                                        </ul>
                                    </div>

                                    <div className="pl-2">
                                        <h4 className="text-blue-800 font-black uppercase text-xs tracking-widest mb-3">6. Communication & Support</h4>
                                        <ul className="list-disc list-outside ml-4 text-xs font-medium text-slate-600 space-y-2 leading-relaxed">
                                            <li>Log in to your Parent Account for any query or concern.</li>
                                            <li>Contact the assigned Admin through the dashboard.</li>
                                            <li>Avoid resolving issues directly with the teacher without bureau involvement.</li>
                                        </ul>
                                    </div>

                                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-800">
                                        <strong>Important:</strong> These guidelines are mandatory and ensure transparency,
                                        quality control, and parent protection.
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </main>

        {/* NEW: Payment Modal Integrated at Root Level */}
        <PaymentModal 
          isOpen={isPayModalOpen} 
          onClose={() => setIsPayModalOpen(false)} 
          amount={selectedTuition.amount}
          tuitionSubject={selectedTuition.subject}
          upiId={paymentSettings.upiId}
          qrCodeUrl={paymentSettings.qrCodeUrl}
        />
      </div>

      {/* FLOATING CONTACT BUTTONS */}
      <a href={`tel:${currentAdminPhone}`} className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 md:bottom-8 md:left-8 border-2 border-white">
        <i className="fas fa-phone-alt text-lg md:text-xl"></i>
      </a>
      <a href={`https://wa.me/91${currentAdminPhone}`} target="_blank" rel="noreferrer" className="fixed bottom-4 right-4 z-50 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-transform hover:scale-110 flex items-center justify-center w-12 h-12 md:w-14 md:h-14 md:bottom-8 md:right-8 border-2 border-white">
        <i className="fab fa-whatsapp text-2xl md:text-3xl"></i>
      </a>
    </>
  );
}

function PaymentModal({ isOpen, onClose, amount, tuitionSubject, upiId, qrCodeUrl }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2 bg-black/20 rounded-full hover:bg-black/40 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="bg-blue-700 p-6 text-white text-center">
          <h3 className="text-xl font-black uppercase tracking-tight">Fee Payment</h3>
          <p className="text-blue-100 text-xs mt-1">{tuitionSubject} Tuition Fee</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-4">Scan QR to Pay via UPI</p>
          <div className="w-64 h-64 mx-auto bg-slate-100 rounded-3xl border-4 border-slate-50 overflow-hidden shadow-inner flex items-center justify-center">
            <img 
              src={qrCodeUrl || "/qr-code.jpg"} 
              onError={(e) => e.target.src = "/qr-code.jpg"}
              alt="Param Tuitions UPI QR" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-2xl font-black text-slate-800 tracking-tighter">₹{amount}</p>
            <p className="text-[10px] font-bold text-slate-400">UPI ID: {upiId || '9973725373@okaxis'}</p>
          </div>
        </div>
        <div className="px-8 pb-8 space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
              <strong>Note:</strong> After payment, please take a screenshot and send it to our WhatsApp for instant confirmation.
            </p>
          </div>
          <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition">
            I Have Paid
          </button>
        </div>
      </div>
    </div>
  );
}