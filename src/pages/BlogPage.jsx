import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../shared/utils/supabaseClient';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import sanitizeHtml from '../shared/utils/sanitizeHtml';
import { isSafeHttpUrl } from '../shared/utils/isSafeUrl';
import logger from '../shared/utils/logger';
// Static blog components fallback
import BenefitsOfHomeTuition from './benefits-of-home-tuition-in-india';
import GrowthInVaranasi from './growth-in-varanasi';
import HomeVsCoaching from './home-vs-coaching';
import HowToBecomeTutor from './how-to-become-tutor';
import HowToChooseTutor from './how-to-choose-tutor';
import PersonalizedLearning from './personalized-learning';
import QualityAndSafety from './quality-and-safety';
import WhyChooseParam from './why-choose-param';
import CareerOpportunities from './career-opportunities';
import OnlineVsOffline from './online-vs-offline';

export default function BlogPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (error) throw error;
        if (!data) {
          setError('Blog not found');
          setPost(null);
        } else {
          setPost(data);
          if (typeof document !== 'undefined') document.title = `${data.title} | Param Tuition Bureau`;
        }
      } catch (err) {
        logger.error('Failed to load blog', err);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) return <div className="p-20 text-center">Loading blog...</div>;

  if (error) return (
    // If DB blog not found, attempt to render static blog component fallback
    (() => {
      const staticMap = {
        'benefits-of-home-tuition-in-india': BenefitsOfHomeTuition,
        'growth-in-varanasi': GrowthInVaranasi,
        'home-vs-coaching': HomeVsCoaching,
        'how-to-become-tutor': HowToBecomeTutor,
        'how-to-choose-tutor': HowToChooseTutor,
        'personalized-learning': PersonalizedLearning,
        'quality-and-safety': QualityAndSafety,
        'why-choose-param': WhyChooseParam,
        'career-opportunities': CareerOpportunities,
        'online-vs-offline': OnlineVsOffline
      };
      const StaticComp = staticMap[slug];
      if (StaticComp) {
        return (
          <>
            <Header />
            <main className="min-h-screen bg-slate-50 py-12">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
                <StaticComp />
              </div>
            </main>
            <Footer />
          </>
        );
      }

      return (
        <div>
          <Header />
          <div className="min-h-screen flex items-center justify-center p-12">
            <div className="max-w-3xl text-center">
              <h2 className="text-2xl font-bold mb-3">{error}</h2>
              <p className="text-sm text-gray-600 mb-6">Try returning to the <Link to="/blog" className="text-blue-600">blog list</Link>.</p>
            </div>
          </div>
          <Footer />
        </div>
      );
    })()
  );

  // Render content. If content is HTML, it will render correctly; otherwise it will display raw text.
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-extrabold mb-4">{post.title}</h1>
          <div className="text-sm text-gray-500 mb-6">{new Date(post.created_at).toLocaleDateString()}</div>
          {(() => {
            const safeImage = post.image_url && isSafeHttpUrl(post.image_url) ? post.image_url : null;
            const cleanHtml = sanitizeHtml(post.content || '');
            return (
              <>
                {safeImage && <img src={safeImage} alt={post.title} className="w-full rounded mb-6 object-cover" />}
                <article className="prose prose-lg max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
                </article>
              </>
            );
          })()}
        </div>
      </main>
      <Footer />
    </>
  );
}
