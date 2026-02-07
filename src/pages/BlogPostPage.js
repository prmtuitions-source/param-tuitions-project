import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
      if (data) setPost(data);
    };
    fetchPost();
  }, [slug]);

  if (!post) return <div className="p-20 text-center">Loading...</div>;

  return (
    <>
      <Header />
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-black text-slate-800 mb-4">{post.title}</h1>
          <p className="text-slate-500 mb-8">{new Date(post.created_at).toLocaleDateString()}</p>
          {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-auto rounded-xl mb-8 shadow-sm" />}
          <div className="prose prose-lg prose-slate" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogPostPage;