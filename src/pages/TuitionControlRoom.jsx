import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import getSignedUrl from '../shared/utils/getSignedUrl';
import SignedImg from '../shared/components/SignedImg';
import uiNotify from '../shared/utils/uiNotify';

export default function TuitionControlRoom() {
  // Support both route param names: :tuitionId (current routes) or :id (legacy)
  const params = useParams();
  const tuitionId = params.tuitionId || params.id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [markers, setMarkers] = useState({});
  const [marking, setMarking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!tuitionId) {
      navigate('/dashboard');
        return;
    }

    let authSubscription = null;

    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        handleSession(session);
      } else {
        // If no session immediately, wait for auth state change
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            handleSession(session);
          } else if (_event === 'SIGNED_OUT') {
            setLoading(false);
            navigate('/login-teacher');
          }
        });
        authSubscription = data.subscription;
      }
    };

    initSession();

    return () => {
      if (authSubscription) authSubscription.unsubscribe();
    };
  }, [tuitionId]);

  async function handleSession(session) {
    setUser(session.user);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    
    if (profileData) {
      setProfile(profileData);
      await fetchAttendance();
    }
    setLoading(false);
  }

  async function fetchAttendance() {
    const { data, error } = await supabase
      .from('tuition_attendance')
      .select('*')
      .eq('tuition_id', tuitionId)
      .order('class_date', { ascending: false });
    if (error) {/* Attendance Error */}
    setAttendance(data || []);

    // fetch marker profiles for display
    try {
      const ids = Array.from(new Set((data || []).filter(r => r.marked_by_id).map(r => r.marked_by_id)));
      if (ids.length > 0) {
        // fetch all profile fields so we can look for an avatar/photo property
        const { data: profs } = await supabase.from('profiles').select('*').in('id', ids);
        const map = {};


        // resolve any storage paths to signed URLs or public URLs using central helper
        const resolved = await Promise.all((profs || []).map(async (p) => {
          const copy = { ...p };
          const tryKeys = ['avatar_url','avatar','photo','image_url','profile_image','picture','photo_url'];
          for (const k of tryKeys) {
            const v = p[k];
            if (!v) continue;
            if (String(v).startsWith('http')) { copy.resolved_avatar_url = v; break; }
            if (String(v).includes('/')) {
              const parts = String(v).split('/').filter(Boolean);
              const bucket = parts[0];
              const path = parts.slice(1).join('/');
              try {
                const signed = await getSignedUrl(path, bucket, 60);
                if (signed) { copy.resolved_avatar_url = signed; break; }
              } catch (er) {
                // ignore and try next key
              }
            }
          }
          return copy;
        }));

        (resolved || []).forEach(p => { map[p.id] = p; });
        setMarkers(map);
      } else {
        setMarkers({});
      }
    } catch(e) {
      // Failed to fetch marker profiles
      setMarkers({});
    }
  }


  const markAttendance = async (status = 'present', classDate = null) => {
    if (!user) return;
    const day = classDate || selectedDate || new Date().toISOString().split('T')[0];
    setMarking(true);

    // Use the profiles table id (teacher or parent) as the actor in teacher_id column
    // to avoid schema changes; this column references profiles.id so both roles are valid.
    const payload = {
      tuition_id: tuitionId,
      teacher_id: user.id,
      class_date: day,
      status,
      marked_by_id: user.id,
      marked_by_role: profile?.user_role || null
    };

    try {
      // If an attendance record already exists for this tuition/date, update it instead of inserting
      const { data: existing } = await supabase.from('tuition_attendance')
        .select('*')
        .eq('tuition_id', tuitionId)
        .eq('class_date', day)
        .maybeSingle();

      if (existing) {
        const updatePayload = {
          status,
          teacher_id: user.id,
          marked_by_id: user.id,
          marked_by_role: profile?.user_role || null
        };

        // If we are turning an 'absent' into a 'present', mark it as managed
        if (existing.status === 'absent' && status === 'present') {
          updatePayload.managed_at = new Date().toISOString();
          updatePayload.managed_by_id = user.id;
          updatePayload.managed_by_role = profile?.user_role || null;
        }

        const { error: updErr } = await supabase.from('tuition_attendance').update(updatePayload).eq('id', existing.id);
        if (updErr) throw updErr;
      } else {
        const { data: inserted, error: insErr } = await supabase.from('tuition_attendance').insert(payload).select('*').maybeSingle();
        if (insErr) throw insErr;

        // If we inserted a new 'present' record but there was an older absent record (rare due to uniqueness),
        // attempt to mark that absent record as managed and link to this inserted id.
        if (inserted && status === 'present') {
          try {
            const { data: absentRec } = await supabase.from('tuition_attendance')
              .select('*')
              .eq('tuition_id', tuitionId)
              .eq('class_date', day)
              .eq('status', 'absent')
              .maybeSingle();

            if (absentRec) {
              await supabase.from('tuition_attendance').update({
                managed_at: new Date().toISOString(),
                managed_by_id: user.id,
                managed_by_role: profile?.user_role || null,
                managed_makeup_id: inserted.id
              }).eq('id', absentRec.id);
            }
          } catch (e) {
            // non-fatal
            // Failed to link absent -> makeup
          }
        }
      }

      await fetchAttendance();
    } catch (error) {
      uiNotify.alert(error?.code === '23505' ? 'Already marked for this date!' : `Error marking attendance: ${error?.message || error}`);
    } finally {
      setMarking(false);
    }
  };

  const requestMakeup = async (classDate) => {
    if (!user || profile?.user_role !== 'parent') return;
    if (!uiNotify.confirm(`Request a makeup/compensation for class on ${new Date(classDate).toLocaleDateString()}?`)) return;
    try {
      const payload = {
        tuition_id: tuitionId,
        parent_id: user.id,
        teacher_id: null,
        class_date: classDate,
        status: 'pending',
        notes: 'Requested by parent via control room'
      };
      const { error } = await supabase.from('missed_classes').insert(payload);
      if (error) throw error;
      uiNotify.alert('Makeup request sent to admin.');
    } catch (e) {
      uiNotify.alert('Failed to request makeup: ' + (e.message || e));
    }
  };

  const scheduleMakeupFor = async (record) => {
    // Teachers/Admin can schedule a makeup class for an absent record
    if (!user || !(profile?.user_role === 'teacher' || profile?.user_role === 'admin' || profile?.user_role === 'super_admin')) return;
    const newDate = uiNotify.prompt('Enter makeup date (YYYY-MM-DD)', new Date().toISOString().split('T')[0]);
    if (!newDate) return;
    try {
      // create a present attendance for the makeup date
      const { data: inserted, error: insErr } = await supabase.from('tuition_attendance').insert({
        tuition_id: tuitionId,
        teacher_id: user.id,
        class_date: newDate,
        status: 'present',
        marked_by_id: user.id,
        marked_by_role: profile?.user_role || null
      }).select('*').maybeSingle();
      if (insErr) throw insErr;
      
      // link existing absent record as managed
      if (inserted) {
        await supabase.from('tuition_attendance').update({
          managed_at: new Date().toISOString(),
          managed_by_id: user.id,
          managed_by_role: profile?.user_role || null,
          managed_makeup_id: inserted.id
        }).eq('id', record.id);
      }

      // Also insert a missed_classes record as resolved/rescheduled
      try {
        await supabase.from('missed_classes').insert({
          tuition_id: tuitionId,
          teacher_id: user.id,
          parent_id: record.parent_id || null,
          class_date: record.class_date,
          scheduled_makeup_date: newDate,
          status: 'rescheduled',
          notes: 'Scheduled by teacher/admin'
        });
      } catch (e) {
        // non-fatal
      }

      await fetchAttendance();
      uiNotify.alert('Makeup scheduled and linked.');
    } catch (e) {
      uiNotify.alert('Failed to schedule makeup: ' + (e.message || e));
    }
  };

  const getDashboardPath = () => {
    if (!profile) return '/dashboard';
    switch(profile.user_role) {
      case 'admin': return '/admin/dashboard';
      case 'super_admin': return '/super-admin/dashboard';
      case 'parent': return '/parent/dashboard';
      case 'institute': return '/institute-dashboard';
      default: return '/teacher/dashboard';
    }
  };

  if (loading) return <div className="p-20 text-center font-bold text-blue-900">Loading Control Room...</div>;

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <h2 className="text-2xl font-black text-slate-800 mb-4">Login Required</h2>
      <p className="text-slate-500 mb-6">Please log in to view this Tuition Control Room.</p>
      <button onClick={() => navigate('/login-teacher')} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold uppercase text-sm shadow-lg hover:bg-blue-700">
        Go to Login
      </button>
    </div>
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Tuition Control Room</h1>
                <p className="text-slate-500 font-bold text-xs uppercase">ID: {tuitionId}</p>
            </div>
            <button onClick={() => navigate(getDashboardPath())} className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition">
                Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider">Attendance Log</h3>
        {(profile?.user_role === 'teacher' || profile?.user_role === 'parent') && (
            <div className="flex items-center gap-3">
              <label className="text-[11px] text-slate-200 font-bold">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs p-1 rounded-md"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => markAttendance('present')}
                  disabled={marking}
                  className="bg-green-500 hover:bg-green-400 text-white text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                >
                  {marking ? 'MARKING...' : `MARK PRESENT`}
                </button>
                <button 
                  onClick={() => {
                    if (!uiNotify.confirm(`Mark this class as ABSENT for ${new Date(selectedDate).toLocaleDateString() }?`)) return;
                    markAttendance('absent');
                  }}
                  disabled={marking}
                  className="bg-red-500 hover:bg-red-400 text-white text-[10px] px-3 py-1.5 rounded-lg font-black transition"
                >
                  {marking ? 'MARKING...' : `MARK ABSENT`}
                </button>
              </div>
            </div>
        )}
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {attendance.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {attendance.map((record) => {
              const marker = record.marked_by_id ? markers[record.marked_by_id] : null;
              const avatar = marker?.resolved_avatar_url || null;
              const initials = marker?.full_name ? marker.full_name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() : '?';
              const role = marker?.user_role || '';
              const roleBadgeClass = role === 'teacher' ? 'bg-blue-600' : role === 'parent' ? 'bg-amber-600' : 'bg-slate-400';

              return (
                <div id={`att-${record.id}`} key={record.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="mb-2 md:mb-0">
                    <div className="text-xs font-bold text-slate-700">
                      {new Date(record.class_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {marker && (
                      <div className="flex items-center gap-3 mt-1">
                        <a href={`/profile/${marker.id}`} className="flex items-center gap-2">
                          {avatar ? (
                            <SignedImg path={avatar} alt={marker.full_name || 'avatar'} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-[10px] flex items-center justify-center text-slate-600">{initials}</div>
                          )}
                          <div className="text-[10px] text-slate-500 font-bold">
                            {marker.full_name}
                          </div>
                        </a>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded text-white ${roleBadgeClass}`}>
                          {role}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    {(() => {
                      const s = record.status || '';
                      const statusClasses = s === 'absent' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
                      return (
                        <>
                          <span className={`text-[10px] font-black uppercase ${statusClasses} px-2 py-1 rounded`}>
                            {s}
                          </span>
                          {record.managed_at && (
                            <div className="mt-1 text-[10px] text-amber-700 font-bold">
                              Made up: {new Date(record.managed_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                          {s === 'absent' && !record.managed_at && (
                            <div className="mt-2 flex gap-2">
                              {profile?.user_role === 'parent' && (
                                <button onClick={() => requestMakeup(record.class_date)} className="text-xs px-2 py-1 bg-amber-500 text-white rounded">Request Makeup</button>
                              )}
                              {(profile?.user_role === 'teacher' || profile?.user_role === 'admin' || profile?.user_role === 'super_admin') && (
                                <button onClick={() => scheduleMakeupFor(record)} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Schedule Makeup</button>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-slate-500 py-8">No attendance records found.</div>
        )}
      </div>
    </div>
        </div>
      </div>
    </>
  );
}
