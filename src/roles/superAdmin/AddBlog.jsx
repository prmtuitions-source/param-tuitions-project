import React, { useState } from 'react';
import { supabase } from '../../shared/utils/supabaseClient';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}

export default function AddBlog({ onCreated }) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleTitleChange = (e) => {
    const v = e.target.value;
    setTitle(v);
    if (!slug || slug === slugify(title)) setSlug(slugify(v));
  };

  async function ensureUniqueSlug(base) {
    let candidate = base;
    let i = 0;
    while (true) {
      const { data } = await supabase.from('blogs').select('id').eq('slug', candidate).limit(1);
      if (!data || data.length === 0) return candidate;
      i += 1;
      candidate = `${base}-${i}`;
      if (i > 50) throw new Error('Unable to generate unique slug');
    }
  }

  async function uploadFileAndGetUrl(f) {
    if (!f) return null;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage({ type: 'error', text: 'You must be logged in to upload files. Please login and try again.' });
        return null;
      }
      const filename = `${Date.now()}_${f.name.replace(/\s+/g, '_')}`;
      const { data, error } = await supabase.storage.from('website-assets').upload(`blogs/${filename}`, f, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: publicData } = supabase.storage.from('website-assets').getPublicUrl(data.path);
      const publicURL = publicData?.publicUrl || publicData?.publicURL || null;
      return publicURL;
    } catch (err) {
      const msg = err?.message || JSON.stringify(err) || 'Image upload failed. Use image URL instead.';
      setMessage({ type: 'error', text: msg });
      return null;
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || title.trim().length < 3) return setMessage({ type: 'error', text: 'Please enter a title' });
    setLoading(true);
    setMessage(null);
    try {
      const base = slugify(slug || title);
      const unique = await ensureUniqueSlug(base);

      let finalImage = imageUrl;
      if (!finalImage && file) {
        const url = await uploadFileAndGetUrl(file);
        if (url) finalImage = url;
      }

      const payload = {
        title: title.trim(),
        slug: unique,
        content: content || '',
        image_url: finalImage || null,
        is_published: true
      };

      const { data, error } = await supabase.from('blogs').insert([payload]).select().single();
      if (error) throw error;

      setTitle(''); setSlug(''); setContent(''); setImageUrl(''); setFile(null);
      setMessage({ type: 'success', text: 'Blog created successfully' });
      if (onCreated) onCreated(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create blog' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-bold mb-3">Add Blog</h3>
      {message && (
        <div className={`p-2 mb-3 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
        <label className="block">
          <div className="text-sm font-semibold">Title</div>
          <input value={title} onChange={handleTitleChange} className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <div className="text-sm font-semibold">Slug</div>
          <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="auto-generated" className="w-full p-2 border rounded" />
        </label>
        <label className="block">
          <div className="text-sm font-semibold">Content (Markdown allowed)</div>
          <textarea value={content} onChange={e => setContent(e.target.value)} rows={8} className="w-full p-2 border rounded monospace" />
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-sm font-semibold">Image URL (optional)</div>
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full p-2 border rounded" />
          </label>
          <label className="block">
            <div className="text-sm font-semibold">Or upload image</div>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button disabled={loading} className="px-4 py-2 bg-blue-800 text-white rounded">{loading ? 'Saving...' : 'Create Blog'}</button>
          <a href={slug ? `/blog/${slug}` : '#'} target="_blank" rel="noopener noreferrer" className="text-blue-700">View Live</a>
          {uploading && <span className="text-sm text-gray-500">Uploading image...</span>}
        </div>
      </form>
    </div>
  );
}
