import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import TeacherRegistrationForm from './TeacherRegistrationForm';

const DynamicFormRenderer = ({ formId, onSubmitSuccess, activeSection, submitLabel }) => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [fileUploads, setFileUploads] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Special case for the complex Teacher Registration Form
  if (formId === 'teacher_registration' || formId === 'teacher_registration_full') {
    return <TeacherRegistrationForm onSubmitSuccess={onSubmitSuccess} activeSection={activeSection} submitLabel={submitLabel} />;
  }

  useEffect(() => {
    const fetchSchema = async () => {
      const { data } = await supabase
        .from('form_configs')
        .select('schema')
        .eq('id', formId)
        .single();
      
      if (data?.schema) {
        setFields(data.schema);
      }
      setLoading(false);
    };
    fetchSchema();
  }, [formId]);

  const handleChange = (label, value) => {
    setFormData({ ...formData, [label]: value });
  };

  const handleFileChange = (label, file) => {
    setFileUploads({ ...fileUploads, [label]: file });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    let finalFormData = { ...formData };

    // Handle File Uploads
    for (const [label, file] of Object.entries(fileUploads)) {
      if (file) {
        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${formId}_${user?.id || 'anon'}_${Date.now()}.${fileExt}`;
          const filePath = `form-uploads/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('teacher-verification') // Reusing existing bucket or create a new 'form-uploads' bucket
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('teacher-verification')
            .getPublicUrl(filePath);

          finalFormData[label] = publicUrl;
        } catch (err) {
          console.error(`Error uploading ${label}:`, err);
          alert(`Failed to upload file for ${label}. Please try again.`);
          setSubmitting(false);
          return;
        }
      }
    }

    const { error } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formId,
        user_id: user?.id,
        submission_data: finalFormData
      });

    if (error) {
      alert('Submission failed: ' + error.message);
    } else {
      alert('Request submitted successfully!');
      setFormData({});
      setFileUploads({});
      if (onSubmitSuccess) onSubmitSuccess();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-4 text-center">Loading Form...</div>;
  if (fields.length === 0) return <div className="p-4 text-center text-slate-500">No form configuration found.</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {fields.map((field) => (
        <div key={field.id}>
          <label className="block text-sm font-bold text-slate-700 mb-2">{field.label}</label>
          
          {field.type === 'text' && (
            <input 
              type="text" 
              className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={formData[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required
            />
          )}

          {field.type === 'number' && (
            <input 
              type="number" 
              className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={formData[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required
            />
          )}

          {field.type === 'date' && (
            <input 
              type="date" 
              className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={formData[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required
            />
          )}

          {field.type === 'textarea' && (
            <textarea 
              className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none h-24"
              value={formData[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required
            />
          )}

          {field.type === 'dropdown' && (
            <select 
              className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              value={formData[field.label] || ''}
              onChange={(e) => handleChange(field.label, e.target.value)}
              required
            >
              <option value="">Select Option</option>
              {field.options.split(',').map(opt => (
                <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
              ))}
            </select>
          )}

          {field.type === 'file' && (
            <input 
              type="file" 
              accept="image/*,application/pdf"
              className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm"
              onChange={(e) => handleFileChange(field.label, e.target.files[0])}
            />
          )}
        </div>
      ))}

      <button disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold uppercase tracking-wide hover:bg-blue-700 transition-all">
        {submitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
};

export default DynamicFormRenderer;
