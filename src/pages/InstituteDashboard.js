import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import DynamicFormRenderer from '../components/DynamicFormRenderer';
import Header from '../components/Header';
import useLocationTracker from '../hooks/useLocationTracker';

const InstituteDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: profile } = await supabase.from('profiles').select('user_role').eq('id', user.id).single();
         setUser({ ...user, user_role: profile?.user_role });
      }
    };
    getUser();
  }, []);

  useLocationTracker(user?.id, user?.user_role);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="container mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-slate-800 uppercase">Institute Dashboard</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Request Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6 border-b pb-4">Request a Teacher</h2>
              {/* This renders the form configured by Super Admin */}
              <DynamicFormRenderer formId="institute_request" />
            </div>
          </div>

          {/* Right Column: Status/Info */}
          <div>
            <div className="bg-blue-900 text-white p-8 rounded-2xl shadow-lg mb-6">
              <h3 className="text-lg font-bold mb-2">Need Urgent Help?</h3>
              <p className="text-blue-200 text-sm mb-4">Contact our priority support line for institutes.</p>
              <a href="tel:+918756525373" className="inline-block bg-white text-blue-900 px-6 py-2 rounded-full font-bold text-sm">
                Call +91 87565 25373
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstituteDashboard;
