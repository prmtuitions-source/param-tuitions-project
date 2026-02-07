import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';

export default function TuitionControlRoom() {
  const { id: tuitionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!tuitionId) {
        navigate('/teacher-dashboard');
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
    if (error) console.error("Attendance Error:", error);
    setAttendance(data || []);
  }

  const markAttendance = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    setMarking(true);
    
    const { error } = await supabase.from('tuition_attendance').insert({
      tuition_id: tuitionId,
      teacher_id: user.id,
      class_date: today,
      status: 'present'
    });

    if (error) {
      alert(error.code === '23505' ? "Already marked for today!" : "Error marking attendance.");
    } else {
      fetchAttendance();
    }
    setMarking(false);
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
            <button onClick={() => navigate('/teacher-dashboard')} className="bg-white border border-slate-300 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs uppercase hover:bg-slate-50 transition">
                Back to Dashboard
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase tracking-wider">Attendance Log</h3>
        {profile?.user_role === 'teacher' && (
          <button 
            onClick={markAttendance}
            disabled={marking}
            className="bg-green-500 hover:bg-green-400 text-white text-[10px] px-3 py-1.5 rounded-lg font-black transition"
          >
            {marking ? 'MARKING...' : 'MARK PRESENT TODAY'}
          </button>
        )}
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {attendance.length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {attendance.map((record) => (
              <div key={record.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-700">
                  {new Date(record.class_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded">
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs text-slate-400 py-10">No attendance marked yet for this month.</p>
        )}
      </div>
      
      <div className="p-3 bg-slate-50 border-t text-center text-[10px] text-slate-400 font-bold uppercase">
        Total Classes This Month: {attendance.length}
      </div>
    </div>
        </div>
      </div>
    </>
  );
}