import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import uiNotify from '../utils/uiNotify';

export default function OnboardingLock({ user, onComplete }) {
    const [step, setStep] = useState('location'); // 'location', 'mobile'
    const [mobileNumber, setMobileNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState('');

    useEffect(() => {
        // This component assumes it's only rendered when needed.
        // It immediately requests location when it mounts.
        handleLocationRequest();
    }, []);

    const handleLocationRequest = () => {
        setLocationError('');
        setLoading(true);
        if (typeof navigator !== 'undefined' && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // 1. Try to update via RPC (for PostGIS/spatial data)
                    const { error: rpcError } = await supabase.rpc('update_user_location', {
                        p_id: user.id,
                        p_lat: latitude,
                        p_lng: longitude,
                    });

                    // 2. Explicitly update profile columns to ensure UI guards see the data
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .update({ latitude, longitude })
                        .eq('id', user.id);

                    if (rpcError && profileError) {
                        setLocationError('Failed to save your location. Please try again.');
                        setLoading(false);
                    } else {
                        // Location saved, move to next step
                        setStep('mobile');
                        setLoading(false);
                    }
                },
                (err) => {
                    // Handle user denial or other errors
                    setLocationError("We need your location to find the best tutors near you in Varanasi. Please enable location access in your browser settings and click 'Try Again'.");
                    setLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationError("Geolocation is not supported by your browser. Please use a different browser to continue.");
            setLoading(false);
        }
    };

    const handleMobileSubmit = async (e) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(mobileNumber)) {
            uiNotify.alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        setLoading(true);

        try {
            // Legacy sync attempts (with warnings, not errors)
            try {
                const { error: tuitionsError } = await supabase.from('tuitions').update({ parent_id: user.id }).eq('phone_number', mobileNumber).is('parent_id', null);
                if (tuitionsError) {/* Legacy sync warning (tuitions) */}
            } catch (e) { /* Legacy sync failed (tuitions table not found) */ }

            try {
                const { error: requestsError } = await supabase.from('tuition_requests').update({ parent_id: user.id }).eq('phone_number', mobileNumber).is('parent_id', null);
                if (requestsError) {/* Legacy sync warning (tuition_requests) */}
            } catch (e) { /* Legacy sync failed (tuition_requests table not found) */ }
            
            try {
                const { error: leadError } = await supabase.from('leads').update({ parent_id: user.id }).eq('raw_data->>phone_number', mobileNumber).is('parent_id', null);
                if (leadError) {/* Lead sync warning */}
            } catch(e) { /* Lead sync failed (leads table not found) */ }


            // CORE ACTION: Update the user's profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ phone_number: mobileNumber })
                .eq('id', user.id);

            if (profileError) {
                throw new Error(`Profile Update Failed: ${profileError.message}`);
            }

            uiNotify.alert("Phone number submitted! Refreshing your session...");
            onComplete();

        } catch (error) {
            // Critical error during mobile sync
            uiNotify.alert(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 z-[999] bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg text-center">
                
                {/* Location Step */}
                {step === 'location' && (
                    <div className="animate-in fade-in duration-500">
                        <h2 className="text-2xl font-black text-slate-800 mb-3">Step 1: Share Your Location</h2>
                        <p className="text-slate-500 mb-6">To connect you with the best local tutors in Varanasi, we need to know where you are.</p>
                        
                        {loading && (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse"></div>
                                <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse [animation-delay:0.2s]"></div>
                                <div className="w-4 h-4 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
                                <p className="text-slate-500 font-bold ml-3">Waiting for location access...</p>
                            </div>
                        )}

                        {locationError && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-4 text-sm">
                                <p className="font-bold mb-2">Location Access Denied</p>
                                <p>{locationError}</p>
                            </div>
                        )}

                        <button 
                            onClick={handleLocationRequest}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-bold uppercase text-sm tracking-wider shadow-lg hover:bg-blue-700 disabled:bg-slate-300 transition"
                        >
                            {loading ? 'Waiting...' : 'Find Tutors Near Me'}
                        </button>
                    </div>
                )}

                {/* Mobile Number Step */}
                {step === 'mobile' && (
                     <div className="animate-in fade-in duration-500">
                        <h2 className="text-2xl font-black text-slate-800 mb-3">Step 2: Sync Your Identity</h2>
                        <p className="text-slate-500 mb-8">Please enter your 10-digit mobile number to sync any previous tuition requests you may have made.</p>
                        
                        <form onSubmit={handleMobileSubmit}>
                            <div className="relative mb-6">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
                                <input 
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value)}
                                    placeholder="00000 00000"
                                    className="w-full pl-14 pr-4 py-4 bg-slate-100 rounded-xl font-mono text-lg font-bold border-2 border-transparent focus:border-blue-500 focus:ring-0 transition"
                                    required
                                />
                            </div>
                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 text-white py-3 px-6 rounded-xl font-bold uppercase text-sm tracking-wider shadow-lg hover:bg-green-700 disabled:bg-slate-300 transition"
                            >
                                {loading ? 'Syncing...' : 'Complete Profile'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
