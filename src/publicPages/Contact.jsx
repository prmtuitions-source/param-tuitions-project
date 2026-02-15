import React from 'react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import SectionDivider from '../shared/components/SectionDivider';
import useScrollAnimation from '../hooks/useScrollAnimation';
import uiNotify from '../shared/utils/uiNotify';
import { Phone, Mail, Clock, Send } from 'lucide-react';

const Contact = () => {
  useScrollAnimation();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value?.trim() || '';
    const phone = form.phone.value?.trim() || '';
    const subject = form.subject.value?.trim() || '';
    const message = form.message.value?.trim() || '';

    const adminNumber = '918756525373';
    const textLines = [];
    if (name) textLines.push(`Name: ${name}`);
    if (phone) textLines.push(`Phone: ${phone}`);
    if (subject) textLines.push(`Subject: ${subject}`);
    if (message) textLines.push(`Message: ${message}`);
    const text = textLines.join('\n');
    if (!text) {
      uiNotify.alert('Please enter a message before sending.');
      return;
    }

    const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
    if (typeof globalThis !== 'undefined' && typeof globalThis.open === 'function') {
      globalThis.open(url, '_blank', 'noopener,noreferrer');
    } else if (typeof location !== 'undefined') {
      location.href = url;
    }
  };

  return (
    <div className="contact-page bg-slate-50">
      <Header />
      <section className="section reveal text-center pt-24 pb-16 bg-white">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-navy">GET IN TOUCH</h1>
          <p className="text-lg text-gold mt-2">Connect with Varanasi's Leading Tuition Bureau</p>
        </div>
      </section>

      <SectionDivider />

      <section className="section reveal bg-slate-50 py-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="info-card bg-white p-8 rounded-3xl shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-navy text-white p-3 rounded-full">
                  <Phone size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase text-navy">Call Us</h3>
              <p className="text-slate-600 mt-2"><a href="tel:+918756525373" className="hover:text-gold">+91 87565 25373</a></p>
            </div>
            <div className="info-card bg-white p-8 rounded-3xl shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-navy text-white p-3 rounded-full">
                  <Mail size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase text-navy">Email Us</h3>
              <p className="text-slate-600 mt-2"><a href="mailto:prmtuitions@gmail.com" className="hover:text-gold">prmtuitions@gmail.com</a></p>
            </div>
            <div className="info-card bg-white p-8 rounded-3xl shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-navy text-white p-3 rounded-full">
                  <Clock size={24} />
                </div>
              </div>
              <h3 className="text-xl font-bold uppercase text-navy">Working Hours</h3>
              <p className="text-slate-600 mt-2">Mon-Sat: 10:00 AM - 7:00 PM</p>
              <p className="text-slate-600">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />
      <section className="section reveal py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="enquiry-form">
              <h2 className="text-3xl font-bold text-navy mb-6">Send an Enquiry</h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input type="text" name="name" id="name" className="block w-full bg-slate-50 border-slate-300 rounded-lg py-3 px-4 text-slate-900 focus:ring-gold focus:border-gold" placeholder="Your Name" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="sr-only">Phone</label>
                    <input type="tel" name="phone" id="phone" className="block w-full bg-slate-50 border-slate-300 rounded-lg py-3 px-4 text-slate-900 focus:ring-gold focus:border-gold" placeholder="Phone Number" />
                  </div>
                  <div>
                    <label htmlFor="subject" className="sr-only">Subject</label>
                    <input type="text" name="subject" id="subject" className="block w-full bg-slate-50 border-slate-300 rounded-lg py-3 px-4 text-slate-900 focus:ring-gold focus:border-gold" placeholder="Subject (e.g., Physics Class 12)" />
                  </div>
                  <div>
                    <label htmlFor="message" className="sr-only">Message</label>
                    <textarea name="message" id="message" rows="4" className="block w-full bg-slate-50 border-slate-300 rounded-lg py-3 px-4 text-slate-900 focus:ring-gold focus:border-gold" placeholder="Your Message"></textarea>
                  </div>
                </div>
                <div className="mt-8">
                  <button type="submit" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-navy hover:bg-gold transition-colors duration-300 md:w-auto">
                    Send Message <Send className="ml-2" size={18} />
                  </button>
                </div>
              </form>
            </div>
            <div className="map-container h-full min-h-[400px] md:min-h-full">
                 <div style={{width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden'}}>
          <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d262.6126868724491!2d82.93589168748088!3d25.24820930975315!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xa55c87573a804619%3A0x53197cad0381dd35!2sParam%20Tuition%20Bureau!5e1!3m2!1sen!2sin!4v1770746841201!5m2!1sen!2sin"
           width="100%"
           height="100%"
           style={{ border: 0 }}
           allowFullScreen=""
           loading="lazy"
           referrerPolicy="no-referrer-when-downgrade"
           title="Param Tuition Bureau - Google Map"
         ></iframe>
      </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
