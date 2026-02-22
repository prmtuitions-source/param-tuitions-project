import React, { useState, useEffect } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import getSignedUrl from '../shared/utils/getSignedUrl';
import SignedImg from '../shared/components/SignedImg';

export default function TeacherIDCard() {
  const [profile, setProfile] = useState(null);
  const [signedPhoto, setSignedPhoto] = useState(null);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from('profiles')
        .select('*, teacher_details(*)')
        .eq('id', user.id)
        .single();
      setProfile(data);
      const path = data?.teacher_details?.photo_url;
      if (path) {
        const url = await getSignedUrl(path);
        setSignedPhoto(url || path);
      }
    }
    getProfile();
  }, []);

  if (!profile) return <p className="p-10 text-center">Loading ID Card...</p>;

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-t-8 border-blue-700">
        
        <div className="p-6 text-center bg-blue-50">
          <h2 className="text-xl font-black text-blue-900 tracking-tighter">PARAM TUITION BUREAU</h2>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Verified Home Tutor</p>
        </div>

        <div className="p-8 text-center">
          <div className="w-32 h-32 mx-auto rounded-2xl border-4 border-white shadow-lg overflow-hidden mb-4 bg-gray-200">
            {profile.teacher_details?.photo_url ? (
              <SignedImg path={profile.teacher_details.photo_url} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center h-full justify-center text-gray-400 text-xs">NO PHOTO</div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800">{profile.full_name}</h3>
          <p className="text-sm text-slate-500 mb-4">{profile.teacher_details?.highest_qualification}</p>
          
          <div className="bg-green-100 text-green-700 py-1 px-4 rounded-full text-xs font-bold inline-block">
            ✓ VERIFIED BY BUREAU
          </div>
        </div>

        <div className="px-8 pb-8 space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-400">ID Number:</span>
            <span className="font-mono font-bold text-slate-700">{profile.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-slate-400">Zone:</span>
            <span className="font-bold text-slate-700">{profile.admin_zone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Joined:</span>
            <span className="font-bold text-slate-700">{new Date(profile.created_at).getFullYear()}</span>
          </div>
        </div>

        <div className="bg-slate-900 p-4 text-center">
          <p className="text-[9px] text-slate-400 italic">This is a system-generated ID. For verification, contact: 9973725373</p>
        </div>
      </div>
    </div>
  );
}
