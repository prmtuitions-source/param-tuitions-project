import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import './TuitionJobs.css';
import uiNotify from '../shared/utils/uiNotify';

const TuitionJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [filters, setFilters] = useState({
    location: '',
    class: '',
    gender: '' // 'Male' | 'Female'
  });
  const [locationOptions, setLocationOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  useEffect(() => {
    if (typeof document !== 'undefined') document.title = "Available Tuition Jobs | Param Tuition Bureau";
    fetchJobs();
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const { data: locs } = await supabase.from('locations').select('location_name').order('location_name');
      setLocationOptions((locs || []).map(l => l.location_name));

      const { data: details } = await supabase.from('teacher_details').select('preferred_classes').not('preferred_classes', 'is', null);
      const classesSet = new Set();
      (details || []).forEach(d => {
        const raw = d.preferred_classes || '';
        const parts = Array.isArray(raw) ? raw : raw.toString().split(',').map(s => s.trim()).filter(Boolean);
        parts.forEach(p => classesSet.add(p));
      });
      const classes = Array.from(classesSet).sort((a,b)=> a.localeCompare(b));
      setClassOptions(classes);
    } catch (err) {
      setLocationOptions([]);
      setClassOptions([]);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: apps } = await supabase
        .from('applications')
        .select('tuition_id')
        .eq('teacher_id', session.user.id);
      if (apps) {
        setAppliedJobIds(new Set(apps.map(app => app.tuition_id)));
      }
    }

    const { data, error } = await supabase
      .from('tuitions')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter(job => {
    const locMatch = filters.location ? job.location_name?.toLowerCase().includes(filters.location.toLowerCase()) : true;
    const classMatch = filters.class ? job.student_class?.toLowerCase().includes(filters.class.toLowerCase()) : true;
    let genderMatch = true;
    if (filters.gender) {
        const demands = job.specific_demands || [];
        const demandsStr = Array.isArray(demands) ? demands.join(' ').toLowerCase() : (demands || '').toLowerCase();
        if (filters.gender === 'Female') {
            genderMatch = demandsStr.includes('female') || demandsStr.includes('madam') || demandsStr.includes('lady');
        } else if (filters.gender === 'Male') {
            genderMatch = demandsStr.includes('male') || demandsStr.includes('sir') || demandsStr.includes('gent');
        }
    }

    return locMatch && classMatch && genderMatch;
  });

  const handleApply = async (tuitionNo) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate(`/job-board?tn=${tuitionNo}`);
    } else {
      navigate('/login-teacher');
    }
  };

  const handleShare = (job) => {
    const origin = (typeof globalThis !== 'undefined' && globalThis.location && globalThis.location.origin) ? globalThis.location.origin : '';
    const shareUrl = `${origin}/job-board?tn=${job.tuition_no}`;
    if (navigator.share) {
      navigator.share({
        title: `Tuition Job: ${job.subject}`,
        text: `Check out this home tuition job in ${job.location_name} for ${job.subject} (Class ${job.student_class}).`,
        url: shareUrl,
      }).catch((err) => {/* Error sharing */});
    } else {
      navigator.clipboard?.writeText?.(shareUrl).then(() => uiNotify.alert('Job link copied to clipboard!')).catch(() => uiNotify.alert('Failed to copy link.'));
    }
  };

  return (
    <>
      <Header />
      <div className="tuition-jobs-page">
        <div className="jobs-hero">
          <h1>Latest Home Tuition Jobs</h1>
          <p>Find and apply for the best home tuition opportunities in Varanasi.</p>
        </div>

        <div className="jobs-container">
          <div className="filters-bar">
            <select name="location" value={filters.location} onChange={handleFilterChange}>
              <option value="">All Locations</option>
              {locationOptions.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
            <select name="class" value={filters.class} onChange={handleFilterChange}>
              <option value="">All Classes</option>
              {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select name="gender" value={filters.gender} onChange={handleFilterChange}>
              <option value="">Any Gender Preference</option>
              <option value="Female">Female Teacher Preferred</option>
              <option value="Male">Male Teacher Preferred</option>
            </select>
          </div>

          {loading ? (
            <div className="loading-state">Loading available tuitions...</div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-header">
                      <span className="job-class">{job.student_class}</span>
                      <span className="job-tn">#{job.tuition_no}</span>
                    </div>
                    <h3 className="job-subject">{job.subject}</h3>
                    <div className="job-details">
                      <p><i className="fas fa-map-marker-alt"></i> {job.location_name}</p>
                      <p><i className="fas fa-money-bill-wave"></i> ₹{job.fee_amount || 'Negotiable'}</p>
                      <p><i className="fas fa-school"></i> {job.medium || 'CBSE/ICSE'}</p>
                      <p><i className="fas fa-chalkboard-teacher"></i> {job.teaching_mode || 'Home Tuition'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                      <button 
                        onClick={() => handleShare(job)} 
                        className="share-btn"
                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 'bold', color: '#475569', cursor: 'pointer' }}
                      >
                        <i className="fas fa-share-alt"></i> Share
                      </button>
                      <button 
                        onClick={() => !appliedJobIds.has(job.id) && handleApply(job.tuition_no)} 
                        className="apply-btn"
                        disabled={appliedJobIds.has(job.id)}
                        style={{ flex: 2, ...(appliedJobIds.has(job.id) ? { backgroundColor: '#94a3b8', cursor: 'not-allowed' } : {}) }}
                      >
                        {appliedJobIds.has(job.id) ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-jobs">No tuition jobs found matching your criteria.</div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TuitionJobs;
