import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import uiNotify from '../utils/uiNotify';

export default function AreaPicker({ teacherId }) {
  const [allLocations, setAllLocations] = useState([]);
  const [selectedAreas, setSelectedAreas] = useState([]);

  // Fetch Varanasi locations from your SQL table
  useEffect(() => {
    const fetchLocations = async () => {
      const { data } = await supabase
        .from('locations')
        .select('id, location_name, admin_zone')
        .order('location_name', { ascending: true });
      setAllLocations(data);
    };
    fetchLocations();
  }, []);

  const handleToggleArea = (areaId) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const saveServiceAreas = async () => {
    const inserts = selectedAreas.map(areaId => ({
      teacher_id: teacherId,
      area_id: areaId
    }));

    const { error } = await supabase
      .from('teacher_service_areas')
      .insert(inserts);

    if (!error) uiNotify.alert("Service areas updated successfully!");
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-bold mb-2">Select Areas You Serve in Varanasi</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 h-64 overflow-y-auto border p-2">
        {allLocations.map(loc => (
          <label key={loc.id} className="flex items-center space-x-2 text-sm">
            <input 
              type="checkbox" 
              onChange={() => handleToggleArea(loc.id)}
              checked={selectedAreas.includes(loc.id)}
            />
            <span>{loc.location_name} <small className="text-gray-400">({loc.admin_zone})</small></span>
          </label>
        ))}
      </div>
      <button 
        onClick={saveServiceAreas}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Save Areas Served
      </button>
    </div>
  );
}
