import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from '../shared/utils/supabaseClient';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import GoldEnquiryForm from '../shared/components/GoldEnquiryForm';
import SectionDivider from '../shared/components/SectionDivider';
import Counter from '../shared/components/Counter';
import GoogleReviews from '../shared/components/GoogleReviews';
import useScrollAnimation from '../hooks/useScrollAnimation';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import tutorImg from '../images/successful-home-tutor.jpg';
import coachingImg from '../images/home-tuition-vs-coaching.jpg';
import heroImg from '../assets/home-tuition-varanasi-student-studying.png';

const advantages = [
  { icon: 'fa-chalkboard-teacher', title: 'CBSE/ICSE Experts', desc: 'Qualified teachers familiar with board curriculums.', backTitle: 'Expert Guidance', backDesc: 'Our tutors are well-versed in the latest syllabus and exam patterns.' },
  { icon: 'fa-user-graduate', title: 'Caring Female Tutors', desc: 'Safe and supportive environment for young learners.', backTitle: 'Safety First', backDesc: 'We prioritise safety and comfort.' },
  { icon: 'fa-certificate', title: 'Verified Tutors', desc: 'Background checked & interviewed staff.', backTitle: 'Trusted Professionals', backDesc: 'Rigorous checks for your peace of mind.' },
  { icon: 'fa-calendar-check', title: 'Manage Missed Class', desc: 'Flexible scheduling and makeup classes.', backTitle: 'Flexible Schedule', backDesc: 'We arrange compensatory sessions when needed.' },
  { icon: 'fa-map-marker-alt', title: 'Every Corner of Varanasi', desc: 'Tutors across Varanasi.', backTitle: 'Local Tutors', backDesc: 'Find tutors near your neighbourhood.' },
];

export default function Home() {
  useScrollAnimation();
  const [upcomingHoliday, setUpcomingHoliday] = React.useState(null);
  const [galleryImages, setGalleryImages] = React.useState([]);
  const [subjectCounts, setSubjectCounts] = React.useState([]);
  const tutorCount = 3100;

  React.useEffect(() => {
    if (typeof document !== 'undefined') document.title = 'Best Home Tutors in Varanasi | Param Tuition Bureau';

    const checkHolidays = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('holidays')
          .select('*')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(1)
          .maybeSingle();
        if (data) {
          const holidayDate = new Date(data.date);
          const diffDays = Math.ceil((holidayDate - new Date()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 3) setUpcomingHoliday(data);
        }
      } catch (err) {
        /* ignore */
      }
    };

    const fetchGallery = async () => {
      try {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (data) setGalleryImages(data);
      } catch (err) {}
    };

    const fetchSubjects = async () => {
      try {
        const { data } = await supabase.from('teacher_details').select('subjects_can_teach');
        const counts = {};
        if (data) data.forEach(t => {
          if (!t.subjects_can_teach) return;
          const list = Array.isArray(t.subjects_can_teach) ? t.subjects_can_teach : String(t.subjects_can_teach).split(',').map(s => s.trim());
          list.forEach(s => { if (s) counts[s] = (counts[s] || 0) + 1; });
        });
        const sorted = Object.entries(counts).map(([subject, count]) => ({ subject, count })).sort((a, b) => b.count - a.count).slice(0, 24);
        setSubjectCounts(sorted);
      } catch (err) {}
    };

    checkHolidays();
    fetchGallery();
    fetchSubjects();
  }, []);

  return (
    <>
      {upcomingHoliday && (
        <div className="holiday-banner">📢 NOTICE: Classes Suspended on {new Date(upcomingHoliday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} for {upcomingHoliday.event_name}</div>
      )}

      <Header />

      <section className="w-full parallax-hero" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.55)' }} aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="w-full px-6 md:px-10 py-16 md:py-24">
            <h1 className="text-white text-3xl md:text-5xl font-extrabold">Find your perfect Home Tutor!</h1>
            <p className="mt-4 text-zinc-200">Connect with a network of specialised tutors across 50+ subjects.</p>
            <div className="mt-8 max-w-3xl">
              <div className="flex items-center bg-white rounded-full shadow-sm overflow-hidden">
                <input type="search" aria-label="Search tutors" placeholder="e.g. Class 10 Maths, English, Sigra" className="flex-1 px-4 py-3 text-gray-700" />
                <Link to="/post-inquiry" className="px-5 py-3 bg-[#22C55E] text-[#062c30] font-bold">Book Demo</Link>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-8">
              <div className="text-center text-white"><div className="text-2xl font-extrabold"><Counter target={3000} suffix="+" /></div><div className="text-sm">Verified Tutors</div></div>
              <div className="text-center text-white"><div className="text-2xl font-extrabold"><Counter target={1500} suffix="+" /></div><div className="text-sm">Subjects Covered</div></div>
              <div className="text-center text-white"><div className="text-2xl font-extrabold"><Counter target={1800} suffix="+" /></div><div className="text-sm">Happy Students</div></div>
              <div className="text-center text-white"><div className="text-2xl font-extrabold"><Counter target={1000} suffix="+" /></div><div className="text-sm">Top Results</div></div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      <section className="section reveal text-center">
        <h2>Get the Param Advantage</h2>
        <hr className="hr-gold" />
        <div className="advantage-grid">
          {advantages.map(a => (
            <div className="advantage-card" key={a.title}>
              <div className="advantage-card-front">
                <i className={`fas ${a.icon}`}></i>
                <h3>{a.title}</h3>
                <p>{a.desc}</p>
              </div>
            </div>
          ))}
          <div className="advantage-card"><h3><Counter target={tutorCount} suffix="+" /> Active Tutors</h3></div>
        </div>
      </section>

      <SectionDivider />

      <section className="section reveal">
        <h2>Gallery</h2>
        <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={18} slidesPerView={1} loop autoplay={{ delay: 3000 }} pagination navigation breakpoints={{640:{slidesPerView:2},1024:{slidesPerView:3}}}>
          {galleryImages && galleryImages.length > 0 ? galleryImages.map(img => (
            <SwiperSlide key={img.id}><img src={img.image_url} alt={img.caption || 'Gallery'} /></SwiperSlide>
          )) : (
            [
              <SwiperSlide key="s1"><img src="/param-tuition-bureau-home-tutor-varanasi.jpg" alt="Home tuition" /></SwiperSlide>,
              <SwiperSlide key="s2"><img src={tutorImg} alt="Tutor" /></SwiperSlide>,
              <SwiperSlide key="s3"><img src={coachingImg} alt="Coaching" /></SwiperSlide>
            ]
          )}
        </Swiper>
      </section>

      <SectionDivider />

      <section className="section reveal">
        <h2>How to Hire a Tutor?</h2>
        <hr className="hr-gold" />
        <div className="steps-grid">
          <div className="step-card"><div className="step-number">1</div><h3>Contact Us</h3><p>Call or fill the enquiry form.</p></div>
          <div className="step-card"><div className="step-number">2</div><h3>Free Demo</h3><p>We arrange a demo class.</p></div>
          <div className="step-card"><div className="step-number">3</div><h3>Start Learning</h3><p>Confirm the tutor and start classes.</p></div>
        </div>
      </section>

      <SectionDivider />

      <section className="section reveal">
        <h2>Tuition Opportunities Available</h2>
        <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={18} slidesPerView={1} loop autoplay={{ delay: 3500 }} pagination navigation breakpoints={{640:{slidesPerView:1.2},768:{slidesPerView:1.8},1024:{slidesPerView:2.6}}}>
          {[{class: 'Class 6', subject: 'Maths + Science', area: 'Lanka', fees: '₹2500'},{class: 'Class 10', subject: 'Maths', area: 'Sigra', fees: '₹3500'}].map((t,i)=>(
            <SwiperSlide key={i}>
              <div className="tuition-card">
                <h4 className="tuition-class">{t.class}</h4>
                <div className="tuition-subject">{t.subject}</div>
                <div className="tuition-details"><div className="t-detail"><span className="t-label">Location</span><span className="t-value">{t.area}</span></div><div className="t-detail"><span className="t-label">Budget</span><span className="t-value">{t.fees}</span></div></div>
                <Link to="/teacher-register" className="tuition-btn">Apply Now</Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <SectionDivider />
      <GoogleReviews />
      <SectionDivider />
      <Footer />
    </>
  );
}
