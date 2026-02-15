import React, { useEffect, useState } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import logger from '../shared/utils/logger';
import uiNotify from '../shared/utils/uiNotify';

const VerifyTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnverifiedTeachers();
  }, []);

  const fetchUnverifiedTeachers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, teacher_details!inner(id, is_verified, setup_completed)')
        .eq('user_role', 'teacher')
        .neq('teacher_details.is_verified', true);

      if (error) throw error;
      setTeachers(data || []);
    } catch (error) {
      logger.error('Error fetching teachers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (profileId) => {
    try {
      const teacher = teachers.find(t => t.id === profileId);
      if (!teacher) return;

      const details = Array.isArray(teacher.teacher_details) ? teacher.teacher_details[0] : teacher.teacher_details;
      const targetId = details?.id || profileId;

      if (!details?.setup_completed) {
        if (!uiNotify.confirm("⚠️ SYSTEM WARNING: This teacher's profile is marked as INCOMPLETE (missing documents or details).\n\nDo you want to FORCE VERIFY them anyway?")) {
          return;
        }
      }

      const { error } = await supabase
        .from('teacher_details')
        .update({ 
          is_verified: true, 
          is_selfie_approved: true,
          verified_at: new Date()
        })
        .eq('id', targetId);

      if (error) throw error;

      setTeachers(teachers.filter((t) => t.id !== profileId));
      uiNotify.alert('Teacher verified successfully!');
    } catch (error) {
      logger.error('Error verifying teacher:', error.message);
      uiNotify.alert('Failed to verify teacher. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Verify New Teachers</h1>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded hover:bg-slate-100 transition shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading pending verifications...</div>
        ) : teachers.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-slate-100">
            <p className="text-slate-500 text-lg">No pending teacher verifications found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {teachers.map((teacher) => {
              const details = Array.isArray(teacher.teacher_details) ? teacher.teacher_details[0] : teacher.teacher_details;
              return (
                <div key={teacher.id} className={`bg-white p-6 rounded-xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${details?.setup_completed ? 'border-slate-100' : 'border-orange-200 bg-orange-50/30'}`}>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{teacher.full_name || 'Unknown Name'}</h3>
                    <p className="text-slate-600">{teacher.email}</p>
                    <p className="text-sm text-slate-400 mt-1">Phone: {teacher.phone_number || teacher.phone || 'N/A'}</p>
                    <div className="mt-2">
                      {details?.setup_completed ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Ready for Review</span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-[10px] font-bold uppercase">Profile Incomplete</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleVerify(teacher.id)}
                    className={`px-6 py-2 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg ${details?.setup_completed ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    {details?.setup_completed ? 'Verify Teacher' : 'Force Verify'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyTeachers;
