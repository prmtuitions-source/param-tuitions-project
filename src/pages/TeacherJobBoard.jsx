import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

export default function TeacherJobBoard() {
  const [tuitions, setTuitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [searchParams] = useSearchParams();
  const tnFilter = searchParams.get('tn');

  useEffect(() => {
    fetchJobs();
  }, [tnFilter]);

  async function fetchJobs() {
    try {
      setLoading(true);
      // 1. Get Teacher's Zone and Verification Status
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, teacher_details(is_verified, agreement_signed)')
        .eq('id', user.id)
        .single();
      
      setTeacherProfile(profile);

      // 2. Fetch Tuitions in the same Admin Zone
      let query = supabase
        .from('tuitions')
        .select(`
          *,
          applications(status, teacher_id)
        `)
        .eq('status', 'open'); // Only show available jobs

      if (tnFilter) {
        query = query.eq('tuition_no', tnFilter);
      } else if (profile?.admin_zone) {
        query = query.eq('admin_zone', profile.admin_zone);
      }

      const { data: jobs } = await query;

      setTuitions(jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function applyForJob(job) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to apply.");

    const { error } = await supabase
      .from('applications')
      .insert({
        teacher_id: user.id,
        tuition_id: job.id,
        status: 'applied',
        demo_date: job.preferred_demo_date || null // Autofill demo date if fixed by admin
      });

    if (!error) {
      alert("Application sent to Admin!");
      fetchJobs();
    } else {
      console.error("Application Error:", error);
      if (error.code === '42501') {
        alert("Database Policy Error: The system blocked this application. Please contact Admin to update RLS policies.");
      } else {
        alert(`Failed to apply: ${error.message}`);
      }
    }
  }

  const handleShareJob = (job) => {
    const shareUrl = `${window.location.origin}/job-board?tn=${job.tuition_no}`;
    const shareData = {
      title: `Tuition Job: ${job.subject}`,
      text: `Check out this home tuition job in ${job.location_name} for ${job.subject} (Class ${job.student_class}).`,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => alert('Job link copied to clipboard!')).catch(() => alert('Failed to copy link.'));
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Available Tuitions...</div>;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Available Tuitions in {teacherProfile?.admin_zone}</h1>
          <p className="text-gray-600">Apply for home tuitions near you in Varanasi.</p>
        </header>

        {!teacherProfile?.teacher_details?.is_verified && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-yellow-700 font-bold">Account Pending Verification</p>
            <p className="text-sm text-yellow-600">You can view jobs, but you can only apply once the Admin verifies your documents.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {tuitions.map(job => {
            const hasApplied = job.applications.some(app => app.teacher_id === teacherProfile.id);
            const myApplication = job.applications.find(app => app.teacher_id === teacherProfile.id);

            return (
              <div key={job.id} className="bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded">
                    {job.subject} - Class {job.student_class}
                  </span>
                  <h3 className="text-xl font-bold mt-2">{job.location_name}</h3>
                  <p className="text-gray-500 text-sm">{job.requirements_short}</p>
                  {job.preferred_demo_date && (
                    <div className="inline-block mt-2 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded border border-orange-200">
                      📅 Fixed Demo: {new Date(job.preferred_demo_date).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>

                <div className="text-center md:text-right">
                  {hasApplied ? (
                    <div className="space-y-2">
                      <span className={`px-4 py-2 rounded-lg font-bold text-sm block ${
                        myApplication.status === 'demo_allotted' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        STATUS: {myApplication.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {myApplication.status === 'demo_allotted' && (
                        <p className="text-xs text-purple-600 font-medium italic">Demo date set! Check your WhatsApp.</p>
                      )}
                      <button onClick={() => handleShareJob(job)} className="text-blue-600 text-xs font-bold hover:underline">Share Job</button>
                    </div>
                  ) : (
                    <div className="flex gap-2 justify-center md:justify-end">
                    <button 
                      onClick={() => handleShareJob(job)}
                      className="px-4 py-3 rounded-xl font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition"
                    >
                      Share
                    </button>
                    <button 
                      onClick={() => applyForJob(job)}
                      disabled={!teacherProfile?.teacher_details?.is_verified}
                      className={`px-8 py-3 rounded-xl font-bold transition ${
                        teacherProfile?.teacher_details?.is_verified 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Apply Now
                    </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
}