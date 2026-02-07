import React, { useEffect, useState } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data, error } = await supabase.from('faqs').select('*').order('id');
      if (error) console.error('Error fetching FAQs:', error);
      if (data) {
        console.log('FAQs fetched:', data);
        setFaqs(data);
      }
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  const parentFaqs = faqs.filter(f => (f.category || '').toLowerCase() === 'parent');
  const teacherFaqs = faqs.filter(f => (f.category || '').toLowerCase() === 'teacher');
  const generalFaqs = faqs.filter(f => !f.category || (f.category || '').toLowerCase() === 'general');

  const renderFaqSection = (title, items) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{title}</h2>
        <div className="space-y-4">
          {items.map((faq) => (
            <div key={faq.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-blue-900 mb-2">{faq.question}</h3>
              <p className="text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-slate-800 mb-8 text-center uppercase">Frequently Asked Questions</h1>
        <div className="max-w-3xl mx-auto space-y-6">
          {loading ? (
            <p className="text-center text-slate-500">Loading FAQs...</p>
          ) : faqs.length === 0 ? (
            <p className="text-center text-slate-500">No FAQs found.</p>
          ) : (
            <>
              {renderFaqSection('For Parents & Students', parentFaqs)}
              {renderFaqSection('For Tutors', teacherFaqs)}
              {renderFaqSection('General Questions', generalFaqs)}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;