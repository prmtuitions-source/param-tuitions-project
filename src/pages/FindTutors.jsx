import React, { useState, useEffect } from 'react';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import { Link } from 'react-router-dom';

export default function FindTutors() {
  const [locations, setLocations] = useState([]);
  const [subjects] = useState(["All","Mathematics","Physics","Chemistry","Biology","English","Hindi","Computer Science","Accountancy","Economics","Art","Music"]);
  const [gender, setGender] = useState('Any');
  const [location, setLocation] = useState('All');
  const [subject, setSubject] = useState('All');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const { data } = await supabase.from('locations').select('location_name').order('location_name');
      setLocations([{ location_name: 'All' }, ...(data || [])]);
    } catch (e) {
      setLocations([{ location_name: 'All' }]);
    }
  }

  async function handleSearch(e) {
    e && e.preventDefault();
    setLoading(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, user_role, admin_zone, gender, teacher_details')
        .eq('user_role', 'teacher')
        .limit(200);

      const filtered = (data || []).filter(t => {
        if (location && location !== 'All' && t.admin_zone !== location) return false;
        if (gender && gender !== 'Any' && (t.gender || '').toLowerCase() !== gender.toLowerCase()) return false;
        if (subject && subject !== 'All') {
          const details = Array.isArray(t.teacher_details) ? t.teacher_details[0] : t.teacher_details || {};
          const subs = (details.subjects || details.subject || '').toString().toLowerCase();
          if (!subs.includes(subject.toLowerCase())) return false;
        }
        return true;
      });
      setResults(filtered);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-white p-8 rounded-xl shadow-sm">
          <h1 className="text-2xl font-black mb-3">Find Tutors</h1>
          <p className="text-gray-600 mb-6">Search tutors by location, subject and gender.</p>

          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold mb-2">Location</label>
              <select className="w-full p-3 rounded-lg border" value={location} onChange={e => setLocation(e.target.value)}>
                {locations.map(l => <option key={l.location_name} value={l.location_name}>{l.location_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2">Subject</label>
              <select className="w-full p-3 rounded-lg border" value={subject} onChange={e => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-2">Gender</label>
              <select className="w-full p-3 rounded-lg border" value={gender} onChange={e => setGender(e.target.value)}>
                <option>Any</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div className="md:col-span-3 text-right">
              <button className="bg-blue-800 text-white px-6 py-3 rounded-lg font-bold" disabled={loading}>{loading ? 'Searching...' : 'Search Tutors'}</button>
            </div>
          </form>

          <div>
            <h3 className="text-lg font-bold mb-3">Results ({results.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(r => (
                <div key={r.id} className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-lg">{r.full_name}</div>
                      <div className="text-sm text-gray-600">{r.admin_zone || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{(Array.isArray(r.teacher_details) ? r.teacher_details[0] : r.teacher_details)?.subjects || '—'}</div>
                      <div className="text-sm text-gray-500">{r.gender || '—'}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="text-sm text-gray-600">{r.phone_number || 'Phone not available'}</div>
                    <Link to={`/profile/${r.id}`} className="text-blue-700 font-semibold">View profile</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
