import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import logger from '../utils/logger';
import uiNotify from '../utils/uiNotify';

const ReviewGenerator = () => {
  const [role, setRole] = useState('parent');
  const [subject, setSubject] = useState('Maths');
  const [board, setBoard] = useState('');
  const [location, setLocation] = useState('Varanasi');
  const [locations, setLocations] = useState([]);
  const [tuitionNo, setTuitionNo] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [previewText, setPreviewText] = useState('');
  const [tuitionNotFound, setTuitionNotFound] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchLocations = async () => {
      try {
        const { data } = await supabase.from('locations').select('location_name').order('location_name');
        if (!mounted) return;
        setLocations((data || []).map(d => d.location_name));
        if ((data || []).length > 0 && !location) setLocation((data || [])[0]?.location_name || 'Varanasi');
      } catch (e) {
        if (!mounted) return;
        setLocations(['Varanasi']);
      }
    };
    fetchLocations();
    return () => { mounted = false; };
  }, []);

  const lookupTuition = async () => {
    const lookupKey = (tuitionNo || '').trim();
    if (!lookupKey) return;
    setLookupLoading(true);
    setTuitionNotFound(false);
    try {
      const { data, error } = await supabase
        .from('tuitions')
        .select('subject, student_class, location_name, tuition_no, school_name')
        .eq('tuition_no', lookupKey)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        if (data.subject) {
          const subjKey = (data.subject || '').toString().trim().toLowerCase();
          if (subjKey === 'all') setSubject('Maths, Science, English');
          else setSubject(data.subject);
        }
        if (data.student_class) setStudentClass(data.student_class);
        if (data.location_name) setLocation(data.location_name);
        // Attempt to infer board from school_name if present (fallback)
        if (data.school_name && (!board || board.trim() === '')) {
          const name = (data.school_name || '').toLowerCase();
          if (name.includes('cbse')) setBoard('CBSE');
          else if (name.includes('icse')) setBoard('ICSE');
          else if (name.includes('up') || name.includes('uttar pradesh')) setBoard('UP');
        }
      } else {
        setTuitionNotFound(true);
      }
    } catch (e) {
      logger.error('Tuition lookup failed', e.message || e);
    } finally {
      setLookupLoading(false);
      // Generate suggestions after lookup attempt
      generateSuggestions(3, role);
    }
  };

  const reviewLink = "https://search.google.com/local/writereview?placeid=ChIJGUaAOleHXKURNd2BA618GVM";
  const parentTemplates = [
    `Param Tuition Bureau provided the best {{board}} {{studentClass}} {{subject}} home tutor in {{location}}. My son’s confidence and marks improved within two months. Highly recommended for board exam preparation!`,
    `Excellent platform for finding a NEET {{subject}} home tutor in {{location}}. The faculty is expert and the personalized attention is much better than crowded coaching centers.`,
    `Safe and reliable home tuition for {{studentClass}} all subjects in {{location}}. The female tutor is very patient and the management (Alka Mam) is very professional.`,
    `Found a brilliant JEE {{subject}} tutor in {{location}} through Param Tuitions. The teacher's depth of knowledge is unmatched. Best bureau for high-level Science subjects.`,
    `Hard to find ICSE {{studentClass}} {{subject}} home tutors in {{location}}, but this bureau made it easy. They have a great network of experienced teachers.`,
    `Top-notch {{subject}} home tuition for {{studentClass}} near {{location}}. The bureau is well-organized and verified every tutor before sending them to our home.`,
    `We hired a Yoga instructor for home in {{location}} from Param Tuitions. Not just academics, they are experts in hobby classes too. Very satisfied!`,
    `Needed a {{subject}} home tutor for {{studentClass}} urgently in {{location}}. Param Tuitions provided a demo within 24 hours. Best service in the city.`,
    `Best Commerce and Accounts home tuition in {{location}} for {{studentClass}}. The teacher is very experienced and explains complex concepts easily.`,
    `If you are looking for a home tutor near me in {{location}}, look no further than Param Tuition Bureau. They have 3000+ verified teachers for all classes.`
  ];

  const teacherTemplates = [
    `Proud to be associated as a home tutor in {{location}} with Param Tuition Bureau. They offer the best tuition leads for CBSE and ICSE students.`,
    `The most professional tuition bureau in {{location}}. Alka Mam and her team (Swati/Upasana) provide great support to all their tutors.`,
    `As a Physics Master's degree teacher, I find Param Tuitions to be the most reliable platform to get serious students for Class 11-12 and JEE.`,
    `A very safe and respectful environment for female home tutors in {{location}}. They always prioritize our safety and comfort with every allotment.`,
    `From primary class home tuitions to competitive exam coaching, this bureau has assignments for every type of teacher in {{location}}.`,
    `Working here feels great because of the legacy of Late Shri Parmanand Dwivedi Ji. It is truly the best tuition bureau in {{location}}.`,
    `I have worked with many agencies, but Param Tuitions provides the most verified and genuine home tuition leads in the city.`,
    `Transparent system and timely feedback. As a Maths tutor, I highly recommend this bureau to any teacher looking for stable tuitions in {{location}}.`,
    `They excel at matching the right subject expert to the right student. It makes the teaching process much more effective for us and the parents.`,
    `Param Tuitions has a massive presence near Lathiya, DLW, and Lanka. It’s the go-to place for anyone wanting to teach in {{location}}.`
  ];

  const formatTemplate = (tpl) => {
    return tpl
      .replace(/\{\{board\}\}/g, board || '')
      .replace(/\{\{subject\}\}/g, subject || '')
      .replace(/\{\{studentClass\}\}/g, studentClass || '')
      .replace(/\{\{location\}\}/g, location || '')
      .replace(/\{\{tuitionNo\}\}/g, tuitionNo || '');
  };

  const generateSuggestions = (count = 3, r = role) => {
    const pool = r === 'teacher' ? teacherTemplates : parentTemplates;
    if (!pool || pool.length === 0) return;
    const picks = [];
    const used = new Set();
    while (picks.length < Math.min(count, pool.length)) {
      const idx = Math.floor(Math.random() * pool.length);
      if (used.has(idx)) continue;
      used.add(idx);
      picks.push(formatTemplate(pool[idx]));
    }
    setSuggestions(picks);
    setSelectedIndex(0);
    setPreviewText(picks[0]);
  };

  const chooseRandomTemplate = (r) => {
    generateSuggestions(1, r);
  };

  const copyToClipboard = () => {
    const templateText = previewText || (role === 'parent' ? formatTemplate(parentTemplates[0]) : formatTemplate(teacherTemplates[0]));
    // ensure the review link is present only once
    const bodyWithLink = templateText && templateText.includes(reviewLink)
      ? templateText
      : (templateText ? `${templateText}\n\nReview link: ${reviewLink}` : `Review link: ${reviewLink}`);

    const finalMessage = `Hello Sir/Mam,\n\nIf you are satisfied, please review us on Google.\n\n${bodyWithLink}\n\nThank you,\nTeam Param 🙏`;
    navigator.clipboard?.writeText?.(finalMessage);
    uiNotify.alert("Ready-to-paste WhatsApp message copied to clipboard!");
  };

  // compute preview with single link (avoid duplicating if template already contains link)
  const defaultTemplate = role === 'parent' ? formatTemplate(parentTemplates[0]) : formatTemplate(teacherTemplates[0]);
  const basePreview = previewText || defaultTemplate;
  const displayedPreview = basePreview && basePreview.includes(reviewLink) ? basePreview : (basePreview ? `${basePreview}\n\nReview link: ${reviewLink}` : `Review link: ${reviewLink}`);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-blue-700">Review Request Generator</h3>
      
      <div className="flex gap-4 mb-4 items-center">
        <div className="flex items-center gap-2">
          <input
            placeholder="Tuition No (e.g. TUI123)"
            value={tuitionNo}
            onChange={(e) => setTuitionNo(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={lookupTuition}
            className="px-3 py-2 bg-blue-600 text-white rounded"
            disabled={lookupLoading}
          >
            {lookupLoading ? 'Looking up...' : 'Lookup'}
          </button>
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border rounded">
          <option value="parent">For Parent</option>
          <option value="teacher">For Teacher</option>
        </select>

        <select value={location} onChange={(e) => setLocation(e.target.value)} className="p-2 border rounded">
          <option value="">Select Location</option>
          {locations.length === 0 ? (
            <option value="Varanasi">Varanasi</option>
          ) : (
            locations.map((loc) => <option key={loc} value={loc}>{loc}</option>)
          )}
        </select>

        {role === 'parent' && (
          <>
            <input 
              placeholder="Subject (e.g. Science)" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)} 
              className="p-2 border rounded"
            />
            <input 
              placeholder="Board (e.g. ICSE)" 
              value={board}
              onChange={(e) => setBoard(e.target.value)} 
              className="p-2 border rounded"
            />
            <input
              placeholder="Class (e.g. 10th)"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="p-2 border rounded"
            />
          </>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded mb-4 whitespace-pre-wrap text-sm italic">
        {displayedPreview}
      </div>

      {suggestions.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold mb-2">Suggestions</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                onClick={() => { setSelectedIndex(idx); setPreviewText(s); }}
                className={`p-3 border rounded cursor-pointer ${selectedIndex === idx ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="text-sm whitespace-pre-wrap">{s}</div>
                {selectedIndex === idx && <div className="text-xs text-blue-600 mt-1">Selected</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button onClick={() => generateSuggestions(3, role)} className="px-3 py-2 bg-yellow-500 text-white rounded">Randomize</button>
        <button onClick={() => { setPreviewText(''); generateSuggestions(3, role); }} className="px-3 py-2 bg-indigo-600 text-white rounded">Force New</button>
      </div>

      <button 
        onClick={copyToClipboard}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
      >
        Copy for WhatsApp
      </button>
    </div>
  );
};

export default ReviewGenerator;
