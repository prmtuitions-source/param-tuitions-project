import React, { useState, useEffect } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import QRCode from 'react-qrcode-logo'; // Install this: npm install react-qrcode-logo

export default function TeacherDemoPortal({ tuitionId, parentLocation }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [distanceError, setDistanceError] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // returns distance in meters
  };

  const handleDemoStart = () => {
    setCheckingIn(true);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const dist = calculateDistance(latitude, longitude, parentLocation.lat, parentLocation.lng);

        if (dist > 200) { // Must be within 200 meters of parent's house
          setDistanceError(`Security Alert: You are ${(dist/1000).toFixed(1)}km away. Please reach the parent's gate to start.`);
          setCheckingIn(false);
          return;
        }

        const { error } = await supabase.from('applications')
          .update({ 
            demo_check_in_time: new Date(),
            demo_check_in_lat: latitude,
            demo_check_in_long: longitude,
            status: 'demo_started'
          })
          .match({ tuition_id: tuitionId });

        if (!error) setIsCheckedIn(true);
        setCheckingIn(false);
      });
    } else {
      setDistanceError('Geolocation is not supported by your browser.');
      setCheckingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center text-center">
      <div className="bg-white rounded-[40px] p-10 w-full max-w-sm shadow-2xl">
        {!isCheckedIn ? (
          <>
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-2">Gate Check-In</h2>
            <p className="text-xs text-slate-400 font-bold uppercase mb-8 leading-relaxed">Identity & GPS Verification Required by Param Tuitions</p>
            
            {distanceError && <p className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-bold mb-6 border border-red-100">{distanceError}</p>}
            
            <button 
              onClick={handleDemoStart}
              disabled={checkingIn}
              className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200"
            >
              {checkingIn ? 'Verifying GPS...' : 'Start Demo Class'}
            </button>
          </>
        ) : (
          <div className="animate-in zoom-in duration-500">
            <h2 className="text-xl font-black text-green-600 uppercase italic mb-1">Check-In Successful</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-8">Show this code to the Parent</p>
            
            <div className="p-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 inline-block mb-8">
              <QRCode 
                value={`PARAM_VERIFY_${tuitionId}`}
                size={200}
                logoImage="https://your-bureau-logo.png"
                logoWidth={50}
              />
            </div>
            
            <p className="text-xs font-medium text-slate-600 leading-relaxed px-4">The parent must scan this code on their dashboard to complete your identity verification.</p>
          </div>
        )}
      </div>
      <p className="text-slate-500 text-[10px] font-bold mt-8 uppercase tracking-widest">Master Security Protocol v2.0</p>
    </div>
  );
}