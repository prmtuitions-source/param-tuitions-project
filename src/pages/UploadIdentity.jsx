import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import uiNotify from '../shared/utils/uiNotify';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function UploadIdentity() {
  const query = useQuery();
  const navigate = useNavigate();
  const parentId = query.get('parentId');
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    })();
  }, []);

  const handleUpload = async () => {
    if (!file) { uiNotify.alert('Choose a file first'); return; }
    const bucket = 'identity-docs';
    const ownerId = parentId || (user && user.id);
    if (!ownerId) { uiNotify.alert('Missing parentId or not logged in'); return; }
    const filename = `${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
    const path = `aadhar/${ownerId}/${filename}`;
    try {
      setUploading(true);
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
      if (error) throw error;
      // Store the object path in DB; UI should request a signed URL when displaying/downloading.
      const { error: updateErr } = await supabase.from('profiles').update({ aadhar_url: path }).eq('id', ownerId);
      if (updateErr) throw updateErr;
      uiNotify.alert('Uploaded successfully');
      if (!parentId) navigate('/parent/dashboard');
    } catch (e) {
      // Upload failed
      uiNotify.alert('Upload failed: ' + (e.message || e.toString()));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-xl">
          <h2 className="text-2xl font-black mb-2">Upload Identity Document</h2>
          <p className="text-sm text-slate-500 mb-4">Upload Aadhar or any identity proof. This will be linked to the selected profile.</p>
          <div className="space-y-4">
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} />
            <div className="flex gap-2">
              <button disabled={uploading} onClick={handleUpload} className="bg-green-600 text-white px-4 py-2 rounded-xl">{uploading ? 'Uploading...' : 'Upload'}</button>
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl border">Cancel</button>
            </div>
            {parentId && <p className="text-xs text-slate-400">Uploading for parent: {parentId}</p>}
            {!parentId && <p className="text-xs text-slate-400">No parentId provided — will upload to your profile if logged in.</p>}
          </div>
        </div>
      </div>
    </>
  );
}
