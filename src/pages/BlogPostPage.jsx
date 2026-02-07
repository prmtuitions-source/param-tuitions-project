import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogDataMap } from '../blogData';
import { supabase } from '../shared/utils/supabaseClient';
import './IndividualBlog.css';

import BenefitsOfHomeTuition from './benefits-of-home-tuition-in-india';
import WhyChooseParam from './why-choose-param';
import HowToBecomeTutor from './how-to-become-tutor';
import HomeVsCoaching from './home-vs-coaching';
import PersonalizedLearning from './personalized-learning';
import CareerOpportunities from './career-opportunities';
import HowToChooseTutor from './how-to-choose-tutor';
import OnlineVsOffline from './online-vs-offline';
import GrowthInVaranasi from './growth-in-varanasi';
import QualityAndSafety from './quality-and-safety';
import ContactSection from '../shared/components/ContactSection';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';

const componentMap = {
    'benefits-of-home-tuition-in-india': BenefitsOfHomeTuition,
    'why-choose-param-tuition-bureau-for-your-child': WhyChooseParam,
    'how-to-become-a-successful-home-tutor-in-varanasi': HowToBecomeTutor,
    'home-tuition-vs-coaching-institutes-which-is-better': HomeVsCoaching,
    'the-importance-of-personalized-learning-in-a-students-life': PersonalizedLearning,
    'career-opportunities-for-teachers-beyond-the-classroom': CareerOpportunities,
    'how-parents-can-choose-the-right-tutor-for-their-child': HowToChooseTutor,
    'online-vs-offline-tuition-finding-the-right-balance': OnlineVsOffline,
    'the-growth-of-home-tuition-market-in-varanasi': GrowthInVaranasi,
    'how-param-tuition-bureau-ensures-quality-and-safety': QualityAndSafety,
};

const BlogPostPage = () => {
    const { slug } = useParams();
    const [dbPost, setDbPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            const { data } = await supabase.from('blogs').select('*').eq('slug', slug).single();
            if (data) setDbPost(data);
            setLoading(false);
        };
        fetchPost();
    }, [slug]);

    const post = blogDataMap[slug];

    useEffect(() => {
        const title = dbPost?.title || post?.title || "Blog Post";
        document.title = `${title} | Param Tuition Bureau`;
    }, [dbPost, post]);

    if (loading) return <div className="p-20 text-center">Loading...</div>;

    // 1. Check DB first
    // 2. Check Static Map
    
    if (!post && !dbPost) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1>404 - Blog Post Not Found</h1>
                <p>The blog post you are looking for does not exist.</p>
                <Link to="/blog" className="btn-primary" style={{marginTop: '20px'}}>Back to All Blogs</Link>
            </div>
        );
    }

    if (dbPost) {
        return (
            <>
                <Header />
                <div className="individual-blog-container">
                    <h1>{dbPost.title}</h1>
                    {dbPost.image_url && <img src={dbPost.image_url} alt={dbPost.title} />}
                    <div dangerouslySetInnerHTML={{ __html: dbPost.content }} />
                </div>
                <ContactSection />
                <Footer />
            </>
        );
    }

    const BlogComponent = componentMap[slug] || post.component;

    if (!BlogComponent) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', minHeight: '50vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h1>Error - Content Not Found</h1>
                <p>The content for this blog post is not available.</p>
                <Link to="/blog" className="btn-primary" style={{marginTop: '20px'}}>Back to All Blogs</Link>
            </div>
        );
    }

    return (
        <>
            <Header />
            <BlogComponent />
            <ContactSection />
            <Footer />
        </>
    );
};

export default BlogPostPage;