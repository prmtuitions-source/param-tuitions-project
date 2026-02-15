import React, { useEffect, useState } from 'react';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import AddBlog from '../roles/superAdmin/AddBlog';
import { supabase } from '../shared/utils/supabaseClient';
import { Link } from 'react-router-dom';

export default function SuperAdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const { data } = await supabase.from('blogs').select('id,title,slug,created_at,image_url').order('created_at', { ascending: false }).limit(500);
      setBlogs(data || []);
    } catch (err) {
      // Failed to load blogs
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen p-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h1 className="text-2xl font-bold mb-4">Super Admin — Blogs</h1>
              <p className="text-sm text-gray-600 mb-6">Create and manage site blog posts.</p>

              <div className="space-y-4">
                {loading ? (
                  <div>Loading...</div>
                ) : blogs.length === 0 ? (
                  <div className="p-4 bg-white rounded shadow">No blogs yet.</div>
                ) : (
                  blogs.map(b => (
                    <div key={b.id} className="p-4 bg-white rounded shadow flex items-center justify-between">
                      <div>
                        <div className="font-bold">{b.title}</div>
                        <div className="text-xs text-gray-500">{b.slug} — {new Date(b.created_at).toLocaleString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <a className="text-blue-700 font-semibold" href={`/blog/${b.slug}`} target="_blank" rel="noopener noreferrer">View</a>
                        <Link className="text-sm text-gray-600" to={`/super-admin/blogs?edit=${b.id}`}>Edit</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <AddBlog onCreated={fetchBlogs} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
