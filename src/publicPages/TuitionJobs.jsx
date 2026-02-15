import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import './TuitionJobs.css';

const TuitionJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    class: '',
    gender: '' // 'Male' | 'Female'
  });

  useEffect(() => {
    document.title = "Available Tuition Jobs | Param Tuition Bureau";
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    // Fetch tuitions that are marked as Available
    const { data, error } = await supabase
      .from('tuitions')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tuitions:', error);
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
    
    // Gender logic: Check specific_demands for keywords since there isn't a strict gender column
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

  return (
    <>
      <Header />
      <div className="tuition-jobs-page">
        <div className="jobs-hero">
          <h1>Latest Home Tuition Jobs</h1>
          <p>Find and apply for the best home tuition opportunities in Varanasi.</p>
        </div>

        <div className="jobs-container">
          {/* Filters Bar */}
          <div className="filters-bar">
            <input 
              type="text" 
              name="location" 
              placeholder="Filter by Location (e.g. Lanka)" 
              value={filters.location}
              onChange={handleFilterChange}
            />
            <input 
              type="text" 
              name="class" 
              placeholder="Filter by Class (e.g. Class 10)" 
              value={filters.class}
              onChange={handleFilterChange}
            />
            <select name="gender" value={filters.gender} onChange={handleFilterChange}>
              <option value="">Any Gender Preference</option>
              <option value="Female">Female Teacher Preferred</option>
              <option value="Male">Male Teacher Preferred</option>
            </select>
          </div>

          {/* Jobs Grid */}
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
                    <Link to="/login-teacher" className="apply-btn">Apply Now</Link>
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