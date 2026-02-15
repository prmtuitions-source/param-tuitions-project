import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { supabase } from '../utils/supabaseClient';
import uiNotify from '../utils/uiNotify';

export default function LocationGuard({ user, currentProfile, onLocationSet }) {
  const [coords, setCoords] = useState([25.3176, 82.9739]); // Varanasi Center
  const [saving, setSaving] = useState(false);

  function MapEvents() {
    useMapEvents({
      click(e) { setCoords([e.latlng.lat, e.latlng.lng]); },
    });
    return <Marker position={coords} />;
  }

  const handleGetCurrentLocation = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          uiNotify.alert("Error fetching location: " + error.message);
        }
      );
    } else {
      uiNotify.alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('update_user_location', {
      p_id: user.id,
      p_lat: coords[0],
      p_lng: coords[1]
    });

    if (!error) {
      uiNotify.alert("Location saved successfully. Access granted.");
      onLocationSet();
    } else {
      uiNotify.alert(`Failed to save location: ${error.message}`);
    }
    setSaving(false);
  };

  if (currentProfile?.lat && currentProfile?.lng) return null; // If location exists, hide guard

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <i className="fas fa-map-marker-alt text-3xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase italic text-slate-900">Action Required</h2>
          <p className="text-xs font-bold text-slate-400 mt-2">
            Please pin your {currentProfile.user_role === 'teacher' ? 'Teaching Base' : 'Home Location'} on the map to continue.
          </p>
        </div>

        <button
            onClick={handleGetCurrentLocation}
            className="w-full bg-green-100 text-green-700 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-200 transition"
        >
            <i className="fas fa-crosshairs mr-2"></i> Use My Current Location
        </button>

        <div className="h-64 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner">
          <MapContainer center={coords} zoom={13} style={{ height: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapEvents />
          </MapContainer>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200"
        >
          {saving ? 'Saving...' : 'Confirm Location & Enter Dashboard'}
        </button>
      </div>
    </div>
  );
}