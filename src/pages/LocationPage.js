// c:\Users\GAURAV PRINCE\Documents\Param-Tuitions-Project\src\pages\LocationPage.js

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import GoldEnquiryForm from '../shared/components/GoldEnquiryForm';
import SectionDivider from '../shared/components/SectionDivider';
import useScrollAnimation from '../hooks/useScrollAnimation';
import DemoForm from '../shared/components/DemoForm';
import { getAdminForLocation } from '../shared/utils/adminConfig';

const LocationPage = () => {
  useScrollAnimation();
  const { location } = useParams();
  const areaName = location ? location.replace(/-/g, ' ') : 'Varanasi';
  const [tuitions, setTuitions] = React.useState([]);

  React.useEffect(() => {
    document.title = `Best Home Tutors in ${areaName} | Param Tuition Bureau`;
    
    const fetchTuitions = async () => {
      const { data } = await supabase
        .from('tuitions')
        .select('*')
        .eq('status', 'open')
        .ilike('location_name', `%${areaName}%`)
        .order('created_at', { ascending: false });
      if (data) setTuitions(data);
    };
    fetchTuitions();
  }, [areaName]);

  const admin = getAdminForLocation(location);
  const whatsappMessage = `I'm interested in a home tutor in ${areaName}.`;

  return (
    <>
      <Header />
      
      {/* HERO SECTION */}
      <section className="hero reveal" style={{ paddingBottom: '50px' }}>
        <div className="hero-content animate-on-scroll is-visible animate-from-left">
          <h1>Best Home Tutors in <span style={{ color: 'var(--gold)' }}>{areaName}</span></h1>
          <p className="hero-desc">
            Find qualified and verified home tutors in {areaName}, Varanasi. 
            Experienced teachers for CBSE, ICSE & UP Board available in your neighborhood.
          </p>
          <div className="hero-buttons">
            <Link to="/post-inquiry" className="btn-primary">Book Free Demo</Link>
            <Link to="/teacher-register" className="btn-outline">Join as Teacher</Link>
          </div>
          <div className="hero-stats" style={{ display: 'flex', gap: '50px', marginTop: '30px', flexWrap: 'nowrap' }}>
            <div style={{ whiteSpace: 'nowrap' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '5px' }}>2,500+</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Experienced Tutors</p>
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '5px' }}>1,500+</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Female Teachers</p>
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '5px' }}>1,800+</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Happy Students</p>
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <h3 style={{ color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '5px' }}>1,000+</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Top Results</p>
            </div>
          </div>
        </div>
        <div className="hero-img-right animate-on-scroll is-visible animate-from-right">
          <GoldEnquiryForm adminPhoneNumber={admin.phone} />
        </div>
      </section>

      <SectionDivider />

      {/* LOCATION DESCRIPTION */}
      <section className="section reveal service-description">
        <div className="container">
          <h2>Home Tuition in {areaName}</h2>
          <hr className="hr-gold" />
          <p className="service-text">
            Param Tuition Bureau is the premier home tuition provider in {areaName}, Varanasi. 
            We connect students with highly qualified tutors in {areaName} and nearby localities. 
            Whether you need a Maths teacher, Science tutor, or English expert, we provide verified 
            and professional tutors tailored to your specific requirements in {areaName}.
            <br /><br />
            We serve all major boards (CBSE, ICSE, UP Board) and classes. 
            Contact us today to find the perfect home tutor in {areaName}.
          </p>
          <div className="text-center mt-10">
             <a
              href={`https://wa.me/${admin.phone}?text=${encodeURIComponent(whatsappMessage)}`}
              className="btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Request Tutor in {areaName}
            </a>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* AVAILABLE TUITIONS SECTION */}
      {tuitions.length > 0 && (
        <>
          <section className="section reveal">
            <div className="container">
              <h2>Available Tuitions in {areaName}</h2>
              <hr className="hr-gold" />
              <div className="jobs-grid" style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {tuitions.map(job => (
                  <div key={job.id} className="job-card" style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                    <div className="job-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span className="job-class" style={{ background: '#e0f2fe', color: '#1e40af', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>{job.student_class}</span>
                      <span className="job-tn" style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>#{job.tuition_no}</span>
                    </div>
                    <h3 className="job-subject" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px' }}>{job.subject}</h3>
                    <div className="job-details" style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>
                      <p style={{ marginBottom: '5px' }}><i className="fas fa-map-marker-alt" style={{ width: '20px' }}></i> {job.location_name}</p>
                      <p style={{ marginBottom: '5px' }}><i className="fas fa-money-bill-wave" style={{ width: '20px' }}></i> ₹{job.fee_amount || 'Negotiable'}</p>
                      <p><i className="fas fa-chalkboard-teacher" style={{ width: '20px' }}></i> {job.teaching_mode || 'Home Tuition'}</p>
                    </div>
                    <Link to="/teacher-register" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: '0.9rem' }}>Apply Now</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <SectionDivider />
        </>
      )}

      {/* NEED HELP SECTION */}
      <section className="section reveal text-center">
        <div className="container">
          <h2>Need Help?</h2>
          <hr className="hr-gold" />
          <p className="service-text">
            For any questions or assistance regarding tutors in {areaName}, please contact at our office
          </p>
          <div className="mt-8">
            <h4 className="text-xl font-bold">Admin</h4>
            <a
              href={`https://wa.me/${admin.phone}?text=${encodeURIComponent(`Hello, I have a question about tutors in ${areaName}.`)}`}
              className="btn-primary mt-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <DemoForm />

      <SectionDivider />
      <Footer />
    </>
  );
};

export default LocationPage;
