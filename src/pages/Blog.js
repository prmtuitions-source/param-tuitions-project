import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase.from('blog_posts').select('*').eq('is_published', true).order('created_at', { ascending: false });
      if (data) setPosts(data);
    };
    fetchPosts();
  }, []);

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-4xl font-black text-slate-800 mb-12 text-center uppercase">Our Blog</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow block">
              {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-48 object-cover" />}
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{post.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{new Date(post.created_at).toLocaleDateString()}</p>
                <span className="text-blue-600 font-bold text-sm uppercase">Read More &rarr;</span>
              </div>
            </Link>
          ))}
        </div>
        {posts.length === 0 && <p className="text-center text-slate-500">No posts available yet.</p>}
      </div>
      <Footer />
    </>
  );
};

export default Blog;