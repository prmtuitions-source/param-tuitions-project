import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import '../styles/DemoForm.css';
import uiNotify from '../utils/uiNotify';

const DemoForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    classGrade: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // 1. Record Keeping: Save to Database
    try {
      await supabase.from('leads').insert({
        raw_data: {
          parent_name: formData.name,
          phone_number: formData.mobile,
          student_class: formData.classGrade,
          location_name: formData.address, // Using address field for location/requirements
          source: 'website_demo_form'
        },
        status: 'pending_call'
      });
    } catch (err) {
      // Error saving lead
    }

    // 2. Notification: Send via WhatsApp
    // 3. Create in-app notifications for admins and super_admin
    try {
      const notifPayload = { name: formData.name, mobile: formData.mobile, class: formData.classGrade, address: formData.address, source: 'website_demo_form' };
      await supabase.from('notifications').insert([
        { recipient_role: 'admin', title: 'Demo Enquiry', message: `Demo enquiry from ${formData.name}`, payload: notifPayload },
        { recipient_role: 'super_admin', title: 'Demo Enquiry', message: `Demo enquiry from ${formData.name}`, payload: notifPayload }
      ]);
    } catch (err) {
      // Failed to insert notifications
    }

    // 4. Notification: Send via WhatsApp (preserve existing behavior)
    const adminPhoneNumber = '918756525373'; // Admin 2's number
    const message = `*Free Demo Class Enquiry*%0A%0A*Name:* ${formData.name}%0A*Mobile:* ${formData.mobile}%0A*Class/Grade:* ${formData.classGrade}%0A*Address/Requirements:* ${formData.address}`;
    const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${message}`;
    if (typeof globalThis !== 'undefined' && typeof globalThis.open === 'function') {
      globalThis.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } else if (typeof location !== 'undefined') {
      location.href = whatsappUrl;
    }

    setSubmitting(false);
    uiNotify.alert('Thank you for your enquiry! We will get back to you soon.');
    setFormData({ name: '', mobile: '', classGrade: '', address: '' });
  };

  return (
    <section className="demo-section">
      <div className="container">
        <h2 className="section-title">Get a Free Demo Class</h2>
        <div className="underline"></div>

        <div className="form-wrapper">
          <div className="form-card">
            <form id="enquiry-form" onSubmit={handleSubmit}>
              <input type="text" id="name" placeholder="Student/Parent Name" required value={formData.name} onChange={handleChange} />
              <input type="tel" id="mobile" placeholder="Mobile Number" required value={formData.mobile} onChange={handleChange} />
              
              <select id="classGrade" required value={formData.classGrade} onChange={handleChange}>
                <option value="" disabled>Select Class/Grade</option>
                <option value="Class 1-5">Class 1-5</option>
                <option value="Class 6-8">Class 6-8</option>
                <option value="Class 9-10">Class 9-10</option>
                <option value="Class 11-12">Class 11-12</option>
              </select>

              <textarea id="address" placeholder="Your Address or Specific Requirements" rows="4" value={formData.address} onChange={handleChange}></textarea>
              
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? 'Booking...' : 'Book My Free Demo'}
              </button>
            </form>
          </div>

          <div className="contact-info">
            <h3>Quick Connect</h3>
            <p>Have questions? Reach out to us directly via Call or WhatsApp for instant support.</p>
            
            <a href="tel:+918756525373" className="btn-connect btn-call">
              <span>📞</span> Call Now: +91 8756525373
            </a>

            <a href="https://wa.me/918756525373" className="btn-connect btn-whatsapp">
              <span>💬</span> Chat on WhatsApp
            </a>

            <div className="office-location">
              <span>📍</span>
              <p><strong>Office:</strong> Plot No. 466, Adgadanand Colony, Lathiya Chauraha, Varanasi (UP) 221011</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoForm;
