import React, { useEffect } from 'react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import GoldEnquiryForm from '../shared/components/GoldEnquiryForm';
import ContactSection from '../shared/components/ContactSection';

const PostInquiry = () => {
  useEffect(() => {
    document.title = "Hire a Tutor | Param Tuition Bureau";
  }, []);

  return (
    <>
      <Header />
      <div className="page-container" style={{paddingTop: '40px', paddingBottom: '60px', minHeight: '60vh'}}>
        <div className="container" style={{maxWidth: '800px', margin: '0 auto', padding: '0 20px'}}>
          <h1 style={{textAlign: 'center', color: 'var(--blue)', marginBottom: '10px', fontSize: '2.5rem'}}>Hire a Home Tutor</h1>
          <p style={{textAlign: 'center', color: '#666', marginBottom: '40px', fontSize: '1.1rem'}}>Fill out the form below to request a free demo class.</p>
          <GoldEnquiryForm />
        </div>
      </div>
      <ContactSection />
      <Footer />
    </>
  );
};

export default PostInquiry;