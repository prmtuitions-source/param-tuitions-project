import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
// NEW: Import the Location Guard for mandatory GPS pinning
import LocationGuard from '../components/LocationGuard'; 
// Note: If you see "Tracking Prevention blocked access to storage for ...leaflet.css", 
// it is a browser warning related to the CDN used in LocationGuard. It usually does not affect functionality.
import useLocationTracker from '../hooks/useLocationTracker';
import DynamicFormRenderer from '../components/DynamicFormRenderer';

/**
 * PARAM TUITIONS - TEACHER MASTER COMMAND CENTER
 * Everything integrated: Areas, Qualifications, Payments, and Active Jobs.
 */

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [details, setDetails] = useState({});
  const [activeTuitions, setActiveTuitions] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([{ from: '6:00 AM', to: '7:00 AM' }]);
  const [holidays, setHolidays] = useState([]);
  
  // UI States
  const [message, setMessage] = useState({ type: '', text: '' });

  // NEW: Selfie Booth States
  const [showSelfieBooth, setShowSelfieBooth] = useState(false);
  const [capturing, setCapturing] = useState(false);

  // NEW: Onboarding State
  const [activeTab, setActiveTab] = useState('overview');
  const [showAvailabilityLock, setShowAvailabilityLock] = useState(false);

  // NEW: Profile Lock State
  const [showProfileLock, setShowProfileLock] = useState(false);
  const [profileLockData, setProfileLockData] = useState({
      full_name: '',
      experience: '',
      class_x_board: '',
      main_location: '',
      highest_qualification: '',
      areas_served: [],
      photo_url: ''
  });

  // Registration State
  const [locations, setLocations] = useState([]); // Still needed for DynamicFormRenderer options
  const [registrationTab, setRegistrationTab] = useState('form');

  // NEW: Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ tuitionId: '', parentId: '', rating: 5, comment: '' });
  const [reviewParams, setReviewParams] = useState([]);
  const [ratings, setRatings] = useState({});
  const [adminPhones, setAdminPhones] = useState({ 'Admin 1': '8188005373', 'Admin 2': '8756525373' });

  // Track location automatically
  useLocationTracker(user?.id, profile?.user_role);

  useEffect(() => {
    initDashboard();
    triggerHolidayAlert(); // NEW: Automatic Holiday Reminder
    fetchSystemSettings();
    
    // Fetch Locations for Dropdowns
    supabase.from('locations').select('*').order('location_name').then(({ data }) => {
      if(data) setLocations(data);
    });
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
        alert(`🔔 PARAM TUITION HOLIDAY: Tomorrow (${new Date(data.date).toDateString()}) is a holiday for ${data.event_name}. No home tuition classes are scheduled.`);
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
      setAdminPhones(phones);
    }
  }

  async function initDashboard() {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { navigate('/login-teacher'); return; }
      setUser(authUser);

      // 1. Fetch Profile and Detailed Data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      let { data: detailsData } = await supabase
        .from('teacher_details')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // Fallback: If details not found by ID, try fetching via profile relation
      if (!detailsData) {
        const { data: profileWithDetails } = await supabase
          .from('profiles')
          .select('teacher_details(*)')
          .eq('id', authUser.id)
          .maybeSingle();
        
        if (profileWithDetails?.teacher_details) {
          detailsData = Array.isArray(profileWithDetails.teacher_details) 
            ? profileWithDetails.teacher_details[0] 
            : profileWithDetails.teacher_details;
        }
      }

      if (profileData) {
        const tDetails = detailsData || {};
        setProfile(profileData);
        setDetails(tDetails || {});

        // Self-heal: If admin_zone is missing but main_location exists
        if (!profileData.admin_zone && tDetails.main_location) {
             const { data: loc } = await supabase.from('locations').select('admin_zone').eq('location_name', tDetails.main_location).maybeSingle();
             if (loc && loc.admin_zone) {
                 await supabase.from('profiles').update({ admin_zone: loc.admin_zone }).eq('id', authUser.id);
                 setProfile(prev => ({ ...prev, admin_zone: loc.admin_zone }));
             }
        }

        // NEW: Fetch availability slots
        const { data: slotsData } = await supabase.from('teacher_availability').select('*').eq('teacher_id', authUser.id);
        if (slotsData && slotsData.length > 0) {
            const formattedSlots = slotsData.map(s => ({ from: s.start_time, to: s.end_time }));
            setAvailabilitySlots(formattedSlots);
        }

        // NEW: Check if availability update is needed (every 7 days)
        const lastUpdate = new Date(profileData.last_availability_update || 0);
        const now = new Date();
        const diffDays = Math.ceil(Math.abs(now - lastUpdate) / (1000 * 60 * 60 * 24));
        if (diffDays > 7) {
            setShowAvailabilityLock(true);
        }

        // CHECK REGISTRATION LOCK
        if (!tDetails?.setup_completed || !tDetails?.areas_served) {
            // Check if any critical field is missing
            if (!tDetails?.highest_qualification || !tDetails?.class_x_board || !tDetails?.main_location || !profileData.full_name || !tDetails?.years_of_experience || !tDetails?.photo_url || !tDetails?.areas_served) {
                 setShowProfileLock(true);
                 setProfileLockData({
                     full_name: profileData.full_name || '',
                     experience: tDetails?.years_of_experience || '',
                     class_x_board: tDetails?.class_x_board || '',
                     main_location: tDetails?.main_location || '',
                     highest_qualification: tDetails?.highest_qualification || '',
                     areas_served: tDetails?.areas_served ? tDetails.areas_served.split(', ') : [],
                     photo_url: tDetails?.photo_url || ''
                 });
            } else if (!profileData.phone_number) {
                 // If basic fields are present but docs/phone missing, go to registration tab
                 setActiveTab('registration');
            }
        }
      }

      // 4. Fetch Active/Confirmed Tuitions
      const { data: confirmedData } = await supabase
        .from('applications')
        .select(`tuition_id, tuition:tuitions(id, parent_id, subject, student_class, location_name)`)
        .eq('teacher_id', authUser.id)
        .eq('status', 'confirmed');
      setActiveTuitions(confirmedData || []);

      // 5. Fetch My Applications (Pending/Rejected/Demo)
      const { data: appData } = await supabase
        .from('applications')
        .select(`*, tuition:tuitions(status, subject, student_class, location_name, fee_amount, teaching_mode, tuition_no, parent:profiles!parent_id(full_name, phone_number))`)
        .eq('teacher_id', authUser.id);
      setMyApplications(appData || []);

      // 6. Fetch Holidays
      const { data: hols } = await supabase.from('holidays').select('*').order('date');
      setHolidays(hols || []);

    } catch (error) {
      console.error('Init Error:', error);
    } finally {
      setLoading(false);
    }
  }

  // NEW: Selfie Booth Upload Logic
  const uploadSelfie = async (file) => {
    setCapturing(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Math.random()}.${fileExt}`;
      const filePath = `selfies/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('teacher-verification')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-verification')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('teacher_details')
        .update({ 
          photo_url: publicUrl, 
          is_selfie_approved: false 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      setMessage({ type: 'success', text: 'Selfie uploaded! Awaiting Admin verification.' });
      setShowSelfieBooth(false);
      initDashboard();
    } catch (err) {
      if (err.message && (err.message.includes("bucket not found") || err.message.includes("The resource was not found"))) {
        setMessage({ type: 'error', text: "System Error: 'teacher-verification' bucket missing in Supabase." });
      } else {
        setMessage({ type: 'error', text: 'Upload failed: ' + err.message });
      }
    } finally {
      setCapturing(false);
    }
  };

  const handleFormSuccess = async () => {
      // This function now only handles the UI feedback and navigation after the final step.
      alert("Registration completed successfully! Your profile is under review.");
      setActiveTab('overview');
      
      // Reload the dashboard to reflect all changes.
      // A short delay gives the user time to read the alert.
      setTimeout(() => {
          initDashboard();
      }, 1500);
  };

  const handleSaveAvailability = async () => {
    setLoading(true);
    try {
      // 1. Delete existing slots
      await supabase.from('teacher_availability').delete().eq('teacher_id', user.id);

      // 2. Insert new slots
      if (availabilitySlots.length > 0) {
          const inserts = availabilitySlots.map(slot => ({
              teacher_id: user.id,
              start_time: slot.from,
              end_time: slot.to,
              time_slot: `${slot.from} - ${slot.to}`
          }));
          
          const { error } = await supabase.from('teacher_availability').insert(inserts);
          if (error) throw error;
      }

      // Update timestamp
      await supabase.from('profiles').update({ last_availability_update: new Date() }).eq('id', user.id);
      
      alert('Availability updated successfully!');
      setShowAvailabilityLock(false);
    } catch (error) {
      alert('Error updating availability: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addSlot = () => {
      setAvailabilitySlots([...availabilitySlots, { from: '6:00 AM', to: '7:00 AM' }]);
  };

  const removeSlot = (index) => {
      setAvailabilitySlots(availabilitySlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index, field, value) => {
      const newSlots = [...availabilitySlots];
      newSlots[index][field] = value;
      setAvailabilitySlots(newSlots);
  };

  const handleMarkNotAvailable = async () => {
      if (!window.confirm("Are you sure you want to mark yourself as NOT AVAILABLE? You won't appear in search results.")) return;
      setLoading(true);
      try {
          await supabase.from('teacher_availability').delete().eq('teacher_id', user.id);
          await supabase.from('profiles').update({ last_availability_update: new Date() }).eq('id', user.id);
          setAvailabilitySlots([]);
          setShowAvailabilityLock(false);
          alert("Status updated: Not Available");
      } catch (e) { alert(e.message); }
      setLoading(false);
  };

  const handleReviewParent = async (tuitionId, parentId) => {
    const { data } = await supabase.from('review_parameters').select('*').eq('role', 'teacher_to_parent').order('category');
    setReviewParams(data || []);
    setRatings({});
    setReviewData({ tuitionId, parentId, rating: 5, comment: '' });
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
      reviewer_id: user.id,
      reviewee_id: reviewData.parentId,
      tuition_id: reviewData.tuitionId,
      rating: avgRating,
      ratings: ratings,
      comment: reviewData.comment,
      type: 'teacher_to_parent'
    });
    setLoading(false);
    if (error) alert("Error submitting review: " + error.message);
    else {
      alert("Review submitted successfully!");
      setShowReviewModal(false);
    }
  };

  const handleLockPhotoUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setLoading(true);
      try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}_profile_${Date.now()}.${fileExt}`;
          const filePath = `profile-photos/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('teacher-verification')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('teacher-verification')
            .getPublicUrl(filePath);
            
          setProfileLockData(prev => ({ ...prev, photo_url: publicUrl }));
      } catch (error) {
          alert('Upload failed: ' + error.message);
      } finally {
          setLoading(false);
      }
  };

  const handleDetectLocation = () => {
      if (!navigator.geolocation) return alert("Geolocation is not supported.");
      
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          
          // 1. Update Profile GPS
          await supabase.from('profiles').update({
              latitude, longitude, last_location_update: new Date()
          }).eq('id', user.id);

          // 2. Find Nearest Location (if locations have coords)
          if (locations.length > 0) {
              let nearest = null;
              let minDist = Infinity;
              
              locations.forEach(loc => {
                  if (loc.latitude && loc.longitude) {
                      const R = 6371; 
                      const dLat = (loc.latitude - latitude) * (Math.PI / 180);
                      const dLon = (loc.longitude - longitude) * (Math.PI / 180);
                      const a = 
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(latitude * (Math.PI / 180)) * Math.cos(loc.latitude * (Math.PI / 180)) * 
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                      const dist = R * c;

                      if (dist < minDist) {
                          minDist = dist;
                          nearest = loc;
                      }
                  }
              });

              if (nearest && minDist < 20) { // 20km threshold
                  if (showProfileLock) {
                      setProfileLockData(prev => ({ ...prev, main_location: nearest.location_name }));
                  }
                  alert(`GPS Updated! Nearest area detected: ${nearest.location_name}`);
              } else {
                  alert("GPS Updated! No specific area found nearby.");
              }
          }
          setLoading(false);
      }, (err) => {
          console.error(err);
          alert("Location access denied.");
          setLoading(false);
      });
  };

  const handleProfileLockSubmit = async () => {
      if (!profileLockData.full_name || !profileLockData.experience || !profileLockData.class_x_board || !profileLockData.main_location || !profileLockData.highest_qualification || !profileLockData.photo_url || profileLockData.areas_served.length === 0) {
          alert("Please fill all fields to continue.");
          return;
      }
      setLoading(true);
      try {
          const { error: profileError } = await supabase.from('profiles').update({ full_name: profileLockData.full_name }).eq('id', user.id);
          if (profileError) throw profileError;

          const updates = {
              class_x_board: profileLockData.class_x_board,
              main_location: profileLockData.main_location,
              highest_qualification: profileLockData.highest_qualification,
              years_of_experience: profileLockData.experience,
              areas_served: profileLockData.areas_served.join(', '),
              photo_url: profileLockData.photo_url,
              temporary_address: profileLockData.main_location, // Sync for consistency
              setup_completed: true // Mark setup as done to prevent loop
          };

          const { error: detailsError } = await supabase.from('teacher_details').update(updates).eq('id', user.id);
          if (detailsError) throw detailsError;
          
          alert("Profile updated! You can now access the dashboard.");
          
          // Update local state immediately to prevent lock screen loop without refetching
          setProfile(prev => ({ ...prev, full_name: profileLockData.full_name }));
          setDetails(prev => ({ ...prev, ...updates }));
          setShowProfileLock(false);
      } catch (e) {
          alert("Error: " + e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleStartTuition = async (appId, tuitionId) => {
      if(!window.confirm("Start the demo class now? This will log your start time.")) return;
      setLoading(true);
      try {
          const { error: appError } = await supabase.from('applications').update({ 
              status: 'demo_started',
              demo_check_in_time: new Date() 
          }).eq('id', appId);
          if(appError) throw appError;

          const { error: tuiError } = await supabase.from('tuitions').update({ status: 'demo_started' }).eq('id', tuitionId);
          if(tuiError) throw tuiError;
          
          alert("Demo class started!");
          initDashboard();
      } catch(e) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleMarkDemoComplete = async (appId, tuitionId) => {
      if(!window.confirm("Did you complete the demo class successfully?")) return;
      setLoading(true);
      try {
          const { error: appError } = await supabase.from('applications').update({ status: 'DEMO_COMPLETED' }).eq('id', appId);
          if(appError) throw appError;

          const { error: tuiError } = await supabase.from('tuitions').update({ status: 'DEMO_COMPLETED' }).eq('id', tuitionId);
          if(tuiError) throw tuiError;
          
          alert("Demo marked as completed!");
          initDashboard();
      } catch(e) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleConfirmTuition = async (appId, tuitionId) => {
      if(!window.confirm("Has the parent confirmed to start regular classes? This will mark the tuition as Confirmed.")) return;
      setLoading(true);
      try {
          const { error: appError } = await supabase.from('applications').update({ status: 'confirmed', demo_completed_at: new Date() }).eq('id', appId);
          if(appError) throw appError;

          const { error: tuiError } = await supabase.from('tuitions').update({ status: 'confirmed' }).eq('id', tuitionId);
          if(tuiError) throw tuiError;
          
          alert("Tuition confirmed successfully!");
          initDashboard();
      } catch(e) {
          alert(e.message);
      } finally {
          setLoading(false);
      }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login-teacher');
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">Loading Teacher Engine...</div>;

  const generateTimeSlots = () => {
    const slots = [];
    let startTime = 6 * 60; // 6:00 AM in minutes
    const endTime = 22 * 60; // 10:00 PM in minutes

    while (startTime <= endTime) {
      const hours = Math.floor(startTime / 60);
      const minutes = startTime % 60;
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      const displayMinutes = minutes === 0 ? '00' : minutes;
      
      slots.push(`${displayHours}:${displayMinutes} ${period}`);
      startTime += 15; // 15-minute interval
    }
    return slots;
  };
  const timeSlots = generateTimeSlots();

  // Dropdown Options
  const experienceOptions = [
    "0 Months", "3 Months", "6 Months", "9 Months",
    ...Array.from({length: 20}, (_, i) => `${i + 1}`),
    "20+"
  ];
  const qualificationOptions = ["Class 12", "Diploma", "Graduation", "Post-Graduation", "PHd"];
  const boardOptions = ["UP", "CBSE", "ICSE", "Bihar", "Jharkhand", "Bengal", "Chattisgarh", "Maharashtra", "Delhi", "Madhya Pradesh", "Others"];

  const currentAdminPhone = profile?.admin_zone ? adminPhones[profile.admin_zone] : adminPhones['Admin 2'];

  // Helper to get submit button label
  const getButtonLabel = () => {
      switch(registrationTab) {
          case 'form': return 'Save & Next: Documents';
          case 'docs': return 'Save & Next: Agreement';
          case 'agreement': return 'Sign & Submit Agreement';
          default: return 'Submit';
      }
  };

  return (
    <>
      {/* NEW: MANDATORY LOCATION GUARD (Fires if profile.location is missing) */}
      <LocationGuard 
        user={user} 
        currentProfile={profile} 
        onLocationSet={() => initDashboard()} 
      />

      {/* NEW: PROFILE LOCK SCREEN */}
      {showProfileLock && (
        <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-2xl shadow-2xl text-center my-10">
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Complete Your Profile</h2>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">These details are required to match you with students.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="md:col-span-2 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-100 rounded-full overflow-hidden mb-2 border-4 border-slate-200">
                        {profileLockData.photo_url ? (
                            <img src={profileLockData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><i className="fas fa-user text-3xl"></i></div>
                        )}
                    </div>
                    <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-100">
                        Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handleLockPhotoUpload} />
                    </label>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Full Name</label>
                    <input 
                        type="text" 
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border"
                        value={profileLockData.full_name}
                        onChange={e => setProfileLockData({...profileLockData, full_name: e.target.value})}
                    />
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Experience</label>
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border"
                        value={profileLockData.experience}
                        onChange={e => setProfileLockData({...profileLockData, experience: e.target.value})}
                    >
                        <option value="">Select...</option>
                        {experienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Class 10th Board</label>
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border"
                        value={profileLockData.class_x_board}
                        onChange={e => setProfileLockData({...profileLockData, class_x_board: e.target.value})}
                    >
                        <option value="">Select Board...</option>
                        {boardOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Highest Qualification</label>
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border"
                        value={profileLockData.highest_qualification}
                        onChange={e => setProfileLockData({...profileLockData, highest_qualification: e.target.value})}
                    >
                        <option value="">Select Qualification...</option>
                        {qualificationOptions.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Main Location (Area)</label>
                        <button onClick={handleDetectLocation} type="button" className="text-[9px] text-blue-600 font-bold uppercase hover:underline flex items-center gap-1">
                            <i className="fas fa-crosshairs"></i> Detect
                        </button>
                    </div>
                    <select 
                        className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border"
                        value={profileLockData.main_location}
                        onChange={e => setProfileLockData({...profileLockData, main_location: e.target.value})}
                    >
                        <option value="">Select Location...</option>
                        {locations.map(l => <option key={l.id} value={l.location_name}>{l.location_name}</option>)}
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Areas Served (Select Multiple)</label>
                    <div className="w-full p-3 bg-slate-50 rounded-xl border h-32 overflow-y-auto grid grid-cols-2 gap-2">
                        {locations.map(l => (
                            <label key={l.id} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={profileLockData.areas_served.includes(l.location_name)}
                                    onChange={(e) => {
                                        const newAreas = e.target.checked 
                                            ? [...profileLockData.areas_served, l.location_name]
                                            : profileLockData.areas_served.filter(a => a !== l.location_name);
                                        setProfileLockData({...profileLockData, areas_served: newAreas});
                                    }}
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                />
                                {l.location_name}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={handleProfileLockSubmit}
                className="w-full mt-6 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700"
            >
                Save & Unlock Dashboard
            </button>
          </div>
        </div>
      )}

      {/* NEW: AVAILABILITY LOCK SCREEN (Every 7 Days) */}
      {showAvailabilityLock && (
        <div className="fixed inset-0 z-[110] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-lg shadow-2xl text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fas fa-clock text-2xl"></i>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic mb-2">Weekly Schedule Check</h2>
            <p className="text-xs font-bold text-slate-400 uppercase mb-6">Please confirm your availability for the upcoming week to continue receiving tuition requests.</p>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {availabilitySlots.map((slot, index) => (
                    <div key={index} className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border">
                        <select value={slot.from} onChange={(e) => updateSlot(index, 'from', e.target.value)} className="flex-1 p-2 bg-white rounded-lg text-xs font-bold border">
                            {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                        <span className="text-slate-400 font-bold">-</span>
                        <select value={slot.to} onChange={(e) => updateSlot(index, 'to', e.target.value)} className="flex-1 p-2 bg-white rounded-lg text-xs font-bold border">
                            {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                        </select>
                        <button onClick={() => removeSlot(index)} className="text-red-500 px-2"><i className="fas fa-times"></i></button>
                    </div>
                ))}
                <button onClick={addSlot} className="text-blue-600 text-xs font-bold uppercase hover:underline">+ Add Slot</button>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={handleMarkNotAvailable}
                    className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-black text-[10px] uppercase hover:bg-slate-50"
                >Mark Not Available</button>
                <button 
                    onClick={handleSaveAvailability}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-xl hover:bg-blue-700"
                >Confirm Schedule</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: SELFIE BOOTH MODAL */}
      {showSelfieBooth && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-md text-center shadow-2xl">
            <h3 className="text-xl font-black uppercase italic mb-2">Verification Selfie</h3>
            <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase">This photo is used for Parent ID matching</p>
            <div className="aspect-square bg-slate-50 rounded-3xl mb-6 overflow-hidden border-4 border-dashed border-slate-200 flex flex-col items-center justify-center">
              <input 
                type="file" accept="image/*" capture="user" id="selfie-capture" className="hidden" 
                onChange={(e) => uploadSelfie(e.target.files[0])}
              />
              <label htmlFor="selfie-capture" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                </div>
                <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{capturing ? 'Uploading...' : 'Open Front Camera'}</span>
              </label>
            </div>
            <button onClick={() => setShowSelfieBooth(false)} className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter hover:text-slate-600 transition">Cancel</button>
          </div>
        </div>
      )}

      {/* NEW: REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl my-10">
            <h3 className="text-xl font-black uppercase italic mb-4 text-slate-800">Rate Parent/Student</h3>
            
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
              placeholder="Share your experience with this parent/student..."
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
                <h1 className="text-2xl font-black text-blue-400 tracking-tighter uppercase italic">Teacher Panel</h1>
                <div className="mt-4">
                    <p className="text-xs text-slate-400 font-bold uppercase">Welcome,</p>
                    <p className="text-sm font-black text-white leading-tight">{profile.full_name}</p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase mt-1">{profile.admin_zone || 'Unassigned'} Branch</p>
                    <button onClick={handleDetectLocation} className="mt-3 flex items-center gap-2 text-[10px] bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white transition w-full justify-center shadow-lg shadow-blue-900/50">
                        <i className="fas fa-location-arrow"></i> Update Location
                    </button>
                </div>
            </div>
            
            <nav className="space-y-2 flex-1">
                <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                    📊 Overview
                </button>
                <button onClick={() => setActiveTab('applications')} className={`w-full text-left p-3 rounded-xl transition flex justify-between items-center ${activeTab === 'applications' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                    <span>📝 My Applications</span>
                    {myApplications.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {myApplications.length}
                        </span>
                    )}
                </button>
                <button onClick={() => setActiveTab('availability')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'availability' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                    🗓️ My Availability
                </button>
                <button onClick={() => setActiveTab('holidays')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'holidays' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                    🎉 Holidays
                </button>
                <button onClick={() => setActiveTab('registration')} className={`w-full text-left p-3 rounded-xl transition ${activeTab === 'registration' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>📋 Registration Data</button>
                <button onClick={() => navigate('/job-board')} className="w-full text-left p-3 rounded-xl transition hover:bg-slate-800 text-green-400 font-bold">🔍 Browse Tuitions</button>
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-700">
                <button onClick={handleLogout} className="w-full text-left text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest transition">
                    <i className="fas fa-sign-out-alt mr-2"></i> Logout Securely
                </button>
            </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 md:max-h-screen md:overflow-y-auto">
            {message.text && (
              <div className={`mb-6 p-5 rounded-2xl text-xs font-bold border-2 ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                {message.text}
              </div>
            )}

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Card */}
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer" onClick={() => setShowSelfieBooth(true)}>
                            <img 
                        src={details.photo_url || 'https://placehold.co/150'} 
                            className="w-full h-full object-cover rounded-[32px] border-4 border-slate-50 shadow-md group-hover:scale-105 transition duration-300" 
                            alt="Teacher" 
                            />
                            <div className="absolute inset-0 bg-black/40 rounded-[32px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                            <p className="text-white text-[9px] font-black uppercase">Change Selfie</p>
                            </div>
                            {details.is_selfie_approved && (
                            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-full border-4 border-white shadow-lg">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L9 10.586l3.293-3.293a1 1 0 111.414 1.414z" /></svg>
                            </div>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase leading-none">{profile.full_name}</h2>
                        <div className={`mt-4 inline-block px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest ${details.is_verified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {details.is_verified ? 'IDENTITY VERIFIED' : 'PENDING APPROVAL'}
                        </div>

                        <button 
                            onClick={() => setActiveTab('registration')}
                            className="mt-6 w-full py-3 rounded-xl border-2 border-slate-100 text-slate-500 font-bold text-[10px] uppercase hover:border-blue-500 hover:text-blue-600 transition"
                        >
                            {details.setup_completed ? 'Edit Registration Forms' : 'Complete Registration'}
                        </button>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Contact Your Admin ({profile.admin_zone || 'General'})</p>
                            <div className="flex gap-3">
                                <a href={`tel:${currentAdminPhone}`} className="flex-1 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition">
                                    <i className="fas fa-phone-alt mr-2"></i> Call
                                </a>
                                <a href={`https://wa.me/91${currentAdminPhone}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition">
                                    <i className="fab fa-whatsapp mr-2"></i> Chat
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE TUITIONS HUB */}
                    <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-[10px] text-blue-400 uppercase tracking-[0.2em]">Active Control Rooms</h3>
                            <button onClick={initDashboard} className="text-slate-400 hover:text-white transition" title="Refresh Data">
                                <i className="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        {activeTuitions.length > 0 ? (
                            <div className="space-y-4">
                            {activeTuitions.map(item => {
                                const tuition = item.tuition || {};
                                return (
                                <div key={item.tuition_id} className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-blue-500 transition">
                                    <p className="font-black text-sm mb-1">{tuition.subject || 'Tuition Data Unavailable'}</p>
                                    <p className="text-[10px] text-slate-400 mb-4">{item.tuition ? `Class ${tuition.student_class} • ${tuition.location_name}` : 'Details hidden or deleted'}</p>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/control-room/${item.tuition_id}`)}
                                            className="flex-1 bg-blue-600 py-2.5 rounded-xl text-[10px] font-black hover:bg-blue-500 shadow-lg shadow-blue-900/40 uppercase italic"
                                        >Progress Log</button>
                                        <button 
                                            onClick={() => handleReviewParent(item.tuition_id, tuition.parent_id)}
                                            disabled={!tuition.parent_id}
                                            className={`px-3 rounded-xl text-[10px] font-bold ${tuition.parent_id ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                        >★</button>
                                    </div>
                                </div>
                            );
                            })}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-slate-700 rounded-3xl">
                            <p className="text-[10px] text-slate-500 uppercase font-bold">No Active Tuitions Found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB: REGISTRATION FORMS */}
            {activeTab === 'registration' && (
                <div className="bg-white p-8 rounded-[32px] shadow-md border-2 border-slate-300 mb-6 relative overflow-hidden">
                    {/* Progress Stepper */}
                    <div className="flex items-center justify-between mb-8 relative px-4">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-100 -z-10"></div>
                        {['form', 'docs', 'agreement'].map((step, index) => {
                            const isActive = registrationTab === step;
                            const isCompleted = (step === 'form' && registrationTab !== 'form') || (step === 'docs' && registrationTab === 'agreement');
                            const labels = { form: 'Profile', docs: 'Documents', agreement: 'Agreement' };
                            
                            return (
                                <button 
                                    key={step}
                                    onClick={() => setRegistrationTab(step)}
                                    className={`flex flex-col items-center gap-2 bg-white px-2 transition-all ${isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                                        isActive ? 'bg-blue-600 border-blue-600 text-white scale-110 shadow-lg' : 
                                        isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                                    }`}>
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{labels[step]}</span>
                                </button>
                            );
                        })}
                    </div>
                    
                    {/* Renders the full registration form including Profile, Education, Documents, and Agreement */}
                    <DynamicFormRenderer 
                        key={registrationTab}
                        formId="teacher_registration_full"
                        activeSection={registrationTab}
                        submitLabel={getButtonLabel()}
                        onSubmitSuccess={() => {
                            if (registrationTab === 'form') { setRegistrationTab('docs'); window.scrollTo(0,0); }
                            else if (registrationTab === 'docs') { setRegistrationTab('agreement'); window.scrollTo(0,0); }
                            else if (registrationTab === 'agreement') { handleFormSuccess(); }
                        }} 
                    />
                </div>
            )}

            {/* TAB: AVAILABILITY */}
            {activeTab === 'availability' && (
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <h2 className="text-xl font-black mb-2 text-slate-800 uppercase tracking-tight">Update Your Availability</h2>
                <p className="text-slate-500 mb-8 text-xs font-medium">Set your general available time range for taking classes.</p>
                
                <div className="space-y-4">
                    {availabilitySlots.map((slot, index) => (
                        <div key={index} className="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">From</label>
                                <select 
                                value={slot.from} 
                                onChange={(e) => updateSlot(index, 'from', e.target.value)}
                                className="w-full p-3 bg-white rounded-xl font-bold text-xs border"
                                >
                                {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">To</label>
                                <select 
                                value={slot.to} 
                                onChange={(e) => updateSlot(index, 'to', e.target.value)}
                                className="w-full p-3 bg-white rounded-xl font-bold text-xs border"
                                >
                                {timeSlots.map(time => <option key={time} value={time}>{time}</option>)}
                                </select>
                            </div>
                            <button onClick={() => removeSlot(index)} className="bg-red-100 text-red-600 p-3 rounded-xl hover:bg-red-200 transition">
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    ))}
                </div>

                <button onClick={addSlot} className="mt-4 text-blue-600 text-xs font-bold uppercase hover:underline">+ Add Another Slot</button>

                <div className="flex gap-4 mt-8">
                    <button 
                        onClick={handleMarkNotAvailable}
                        className="flex-1 py-4 rounded-2xl border-2 border-red-100 text-red-500 font-black text-xs uppercase hover:bg-red-50 transition"
                    >Mark Not Available</button>
                    <button 
                        onClick={handleSaveAvailability}
                        className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black text-xs hover:bg-slate-800 transition uppercase tracking-widest shadow-xl"
                    >
                        Save Availability
                    </button>
                </div>
              </div>
            )}

            {/* TAB: MY APPLICATIONS */}
            {activeTab === 'applications' && (
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                    <h2 className="text-xl font-black mb-6 text-slate-800 uppercase tracking-tight">My Applications</h2>
                    <div className="space-y-4">
                        {myApplications.length > 0 ? myApplications.map(app => {
                            // Determine Display Status
                            const tuition = app.tuition || {};
                            const tuitionStatus = tuition.status;
                            let displayStatus = app.status.replace('_', ' ');
                            let statusColor = 'bg-blue-100 text-blue-700';

                            if (['demo_allotted', 'DEMO_SCHEDULED', 'booked', 'BOOKED', 'demo_started'].includes(app.status)) {
                                displayStatus = app.status === 'demo_started' ? 'DEMO STARTED' : 'DEMO ALLOTTED';
                                statusColor = 'bg-purple-100 text-purple-700';
                            } else if (app.status === 'applied' && tuitionStatus !== 'open') {
                                displayStatus = 'ON HOLD'; // Job is booked by someone else but not rejected yet
                                statusColor = 'bg-orange-100 text-orange-700';
                            } else if (app.status === 'rejected' || app.status === 'DEMO_CANCELLED') {
                                statusColor = 'bg-red-100 text-red-700';
                            } else if (app.status === 'DEMO_COMPLETED') {
                                statusColor = 'bg-green-100 text-green-700';
                            } else if (app.status === 'confirmed') {
                                displayStatus = 'ACTIVE CLASS';
                                statusColor = 'bg-green-100 text-green-700';
                            }

                            return (
                            <div key={app.id} className="flex flex-col gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">#{tuition.tuition_no || 'N/A'}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${statusColor}`}>
                                                {displayStatus}
                                            </span>
                                        </div>
                                        <p className="font-black text-sm text-slate-800">{tuition.subject || 'Unknown Subject'}</p>
                                        <p className="text-xs font-bold text-slate-500 uppercase mt-0.5">Class {tuition.student_class || 'N/A'} • {tuition.location_name || 'N/A'}</p>
                                        
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">₹{tuition.fee_amount || 'N/A'}</span>
                                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">{tuition.teaching_mode || 'Home'}</span>
                                        </div>

                                        {app.demo_date && (
                                            <p className="text-[10px] font-bold text-orange-600 mt-2 bg-orange-50 px-2 py-1 rounded inline-block">📅 Proposed Demo: {new Date(app.demo_date).toLocaleDateString('en-IN')}</p>
                                        )}
                                    </div>
                                </div>

                                {['demo_allotted', 'DEMO_SCHEDULED', 'booked', 'BOOKED', 'demo_started'].includes(app.status) && tuition.parent && (
                                    <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex justify-between items-center animate-in fade-in">
                                        <div>
                                            <p className="text-[10px] font-bold text-green-800 uppercase mb-0.5">Parent Contact</p>
                                            <p className="text-xs font-black text-slate-800">{tuition.parent.full_name}</p>
                                            <p className="text-xs font-mono text-slate-600">{tuition.parent.phone_number}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={`tel:${tuition.parent.phone_number}`} className="bg-white p-2 rounded-lg text-blue-600 shadow-sm hover:bg-blue-50 border border-blue-100"><i className="fas fa-phone-alt"></i></a>
                                            <a href={`https://wa.me/${tuition.parent.phone_number?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="bg-green-500 p-2 rounded-lg text-white shadow-sm hover:bg-green-600"><i className="fab fa-whatsapp"></i></a>
                                        </div>
                                    </div>
                                )}

                                {['demo_allotted', 'DEMO_SCHEDULED', 'booked', 'BOOKED', 'demo_started'].includes(app.status) && (
                                    <div className="text-right border-t pt-3 border-slate-100 flex justify-end gap-2">
                                        {app.status !== 'demo_started' && (
                                            <button 
                                                onClick={() => handleStartTuition(app.id, app.tuition_id)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 shadow-lg transition w-full sm:w-auto"
                                            >
                                                Start Tuition
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleMarkDemoComplete(app.id, app.tuition_id)}
                                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 shadow-lg transition w-full sm:w-auto"
                                        >
                                            Mark Demo Completed
                                        </button>
                                        <button 
                                            onClick={() => handleConfirmTuition(app.id, app.tuition_id)}
                                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-700 shadow-lg transition w-full sm:w-auto"
                                        >
                                            Confirm Tuition
                                        </button>
                                    </div>
                                )}

                                {app.status === 'confirmed' && (
                                    <div className="text-right border-t pt-3 border-slate-100">
                                        <button 
                                            onClick={() => {
                                                if (app.tuition_id) {
                                                    navigate(`/control-room/${app.tuition_id}`);
                                                } else {
                                                    alert("Error: Tuition ID is missing for this application.");
                                                }
                                            }}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 shadow-lg transition w-full sm:w-auto"
                                        >
                                            Open Progress Log
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                        }) : (
                            <p className="text-center text-slate-400 text-xs font-bold italic py-4">You haven't applied to any tuitions yet.</p>
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
        </main>
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