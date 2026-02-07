import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function GoldEnquiryForm({ adminPhoneNumber }) {
  const [parentName, setParentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // 1. Record Keeping: Save to Database
    try {
      await supabase.from('leads').insert({
        raw_data: {
          parent_name: parentName,
          phone_number: phoneNumber,
          source: 'website_gold_form',
          location_name: 'Not Specified', // Gold form is minimal
          subject: 'General Enquiry'
        },
        status: 'pending_call'
      });
    } catch (err) {
      console.error("Error saving lead:", err);
    }

    // 2. Notification: Send via WhatsApp
    const message = `New Tutor Enquiry:\nParent Name: ${parentName}\nPhone Number: ${phoneNumber}`;
    const targetPhone = adminPhoneNumber || '918756525373'; // Default to Admin 2 if not provided
    const whatsappUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    setSubmitting(false);
    setParentName('');
    setPhoneNumber('');
  };

  return (
    <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-yellow-100">
      <h3 className="text-2xl font-black uppercase italic mb-4">Request a Demo</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" 
          placeholder="Parent Name" 
          className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" 
          value={parentName}
          onChange={(e) => setParentName(e.target.value)}
          required
        />
        <input 
          type="tel" 
          placeholder="Phone Number" 
          className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" 
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button 
          type="submit"
          disabled={submitting}
          className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest"
        >
          {submitting ? 'Sending...' : 'Send Request'}
        </button>
      </form>
    </div>
  );
}