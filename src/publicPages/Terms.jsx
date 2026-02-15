import React, { useEffect, useState } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const Terms = () => {
  const [parentTerms, setParentTerms] = useState('');
  const [teacherTerms, setTeacherTerms] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      // Fetch all content to ensure we get data even if specific filters fail or keys have whitespace
      const { data, error } = await supabase.from('site_content').select('*');
      if (error) console.error('Error fetching site content:', error);
      
      if (data) {
        const parent = data.find(item => item.key === 'terms_parent');
        if (parent) setParentTerms(parent.content);
        
        const teacher = data.find(item => item.key === 'terms_teacher');
        if (teacher) setTeacherTerms(teacher.content);
      }
      
      setLoading(false);
    };
    fetchTerms();
  }, []);

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-slate-800 mb-8 text-center uppercase">Terms & Conditions</h1>
        
        {loading ? (
          <p className="text-center text-slate-500">Loading Terms...</p>
        ) : (
          <div className="space-y-12 max-w-4xl mx-auto">
            {parentTerms && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 border-b pb-4">For Parents & Students</h2>
                <div className="prose prose-slate" dangerouslySetInnerHTML={{ __html: parentTerms }} />
              </div>
            )}

            {teacherTerms && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-blue-900 mb-6 border-b pb-4">For Tutors</h2>
                <div className="prose prose-slate" dangerouslySetInnerHTML={{ __html: teacherTerms }} />
              </div>
            )}
            
            {!parentTerms && !teacherTerms && <p className="text-center text-slate-500">No terms content available.</p>}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Terms;