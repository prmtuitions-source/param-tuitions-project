import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import SectionDivider from '../shared/components/SectionDivider';
import useScrollAnimation from '../hooks/useScrollAnimation';

const About = () => {
  useScrollAnimation();

  return (
    <div className="about-page">
      <Header />

      <section className="section reveal bg-white">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div className="legacy-text animate-from-left">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              Our Legacy: <span style={{ color: 'var(--gold)' }}>Education is Our Responsibility</span>
            </h1>
            <hr className="hr-gold" style={{ margin: '20px 0' }} />
            <p className="service-text">
              Education is not just our profession—it is our legacy. This tuition bureau was born from a deep-rooted belief that every child deserves the right guidance, care, and quality education. We aim to bring order and trust to the home tuition sector, where parents often struggle to find verified and reliable educators.
            </p>
          </div>

          <div className="legacy-photo-container text-center animate-from-right">
            <div style={{ maxWidth: '380px', margin: '0 auto', border: '8px solid var(--gold)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img
                src="/images/parmanand-dubey.jpg"
                alt="Late Shri Parmanand Dubey Ji"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                onError={(e) => { e.target.src = "https://placehold.co/400x500?text=Late+Shri+Parmanand+Dubey+Ji"; }}
              />
            </div>
            <p className="mt-4 font-black uppercase italic text-slate-500 text-sm">In Honor of a Lifetime of Service</p>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="section reveal bg-slate-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black uppercase italic">From the Founder’s Heart</h2>
            <p className="service-text mt-6">
              Our journey is inspired by the <strong>Late Parmanand Dwivedi Ji</strong>, a respected Headmaster who served the Government of India for nearly 30 years. His life was dedicated to discipline, values, and the shaping of young minds. In his honor, we established this bureau in Varanasi to carry forward his lifelong commitment to excellence.
            </p>
            <p className="service-text mt-4">
              Our founder, <strong>Alka Dwivedi</strong>, carries this flame forward. Having served as a government school teacher for over 5 years, she brings first-hand classroom expertise to this bureau. Though family responsibilities required her to step away from formal school teaching, her mission to serve the education system never wavered.
            </p>
            <p className="service-text mt-4">
              During her teaching years, Alka worked closely with children from economically weaker backgrounds. Despite their hardships, these students showed immense dedication and heart—often bringing vegetables or fruits from their homes as a sincere act of respect and gratitude for their teacher. That bond of respect went far beyond the classroom. Today, many of those students are serving in the Indian Army, working in private institutions, and supporting their families. Their continued connection with her today is a reflection of the lifelong impact education creates when delivered with sincerity.
            </p>
          </div>
        </div>
      </section>

      <section className="section reveal">
        <div className="container">
          <h2 className="text-center text-3xl font-black uppercase italic">What We Stand For</h2>
          <hr className="hr-gold mx-auto" />
          <p className="service-text text-center mt-6 max-w-3xl mx-auto">
            With this emotional foundation, we have built a platform where parents and teachers meet on a foundation of trust.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="p-8 bg-white rounded-[32px] shadow-sm border border-slate-100">
              <i className="fas fa-user-check text-2xl text-blue-600 mb-4"></i>
              <h3 className="font-bold uppercase italic">Verified Excellence</h3>
              <p className="text-sm text-slate-500 mt-2">Every teacher is carefully selected and vetted. We continuously improve our selection process to match your child with the best.</p>
            </div>
            <div className="p-8 bg-white rounded-[32px] shadow-sm border border-slate-100">
              <i className="fas fa-graduation-cap text-2xl text-blue-600 mb-4"></i>
              <h3 className="font-bold uppercase italic">Personalized Learning</h3>
              <p className="text-sm text-slate-500 mt-2">Education tailored to the unique needs of every student. We provide dedicated teachers for all levels—from LKG to Class 12.</p>
            </div>
            <div className="p-8 bg-white rounded-[32px] shadow-sm border border-slate-100">
              <i className="fas fa-palette text-2xl text-blue-600 mb-4"></i>
              <h3 className="font-bold uppercase italic">Transparent Service</h3>
              <p className="text-sm text-slate-500 mt-2">Ethical, parent-friendly, and professional. We cover academics, music, dance, yoga, and skill development.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section reveal bg-slate-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black uppercase italic">Our Promise</h2>
            <p className="service-text mt-6">
              We provide dedicated teachers for all levels—from LKG to Class 12—covering academics, music, dance, yoga, and skill development.
            </p>
            <p className="service-text mt-4">
              We understand that choosing a teacher is one of the most important decisions you will make. We are committed to maintaining the highest standards of trust because, to us, your child’s future is a sacred responsibility.
            </p>
            <p className="service-text mt-4 font-bold text-blue-900">If you are looking for the best teacher for your child in Varanasi, we are here for you.</p>
          </div>
        </div>
      </section>

      <div className="text-center pb-20">
        <Link to="/post-inquiry" className="btn-primary">Find a Verified Teacher</Link>
      </div>

      <Footer />
    </div>
  );
};

export default About;
