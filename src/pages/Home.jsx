import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from '../shared/utils/supabaseClient'; // Ensure this path is correct
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import your custom components
import GoldEnquiryForm from '../shared/components/GoldEnquiryForm';
import SectionDivider from '../shared/components/SectionDivider';
import Counter from '../shared/components/Counter';
import GoogleReviews from '../shared/components/GoogleReviews';
import useScrollAnimation from '../hooks/useScrollAnimation';
import Header from '../shared/components/Header';
import Footer from '../shared/components/Footer';
import tutorImg from '../images/successful-home-tutor.jpg';
import coachingImg from '../images/home-tuition-vs-coaching.jpg';


const advantages = [
    { icon: 'fa-chalkboard-teacher', title: 'CBSE/ICSE Experts', desc: 'Qualified teachers familiar with board curriculums.', backTitle: 'Expert Guidance', backDesc: 'Our tutors are well-versed in the latest syllabus and exam patterns to ensure top grades.' },
    { icon: 'fa-user-graduate', title: 'Caring Female Tutors', desc: 'Safe and supportive environment for young learners.', backTitle: 'Safety First', backDesc: 'We prioritize safety and comfort, offering experienced female tutors for primary and female students.' },
    { icon: 'fa-certificate', title: 'Verified Tutors', desc: '100% background checked and interviewed staff.', backTitle: 'Trusted Professionals', backDesc: 'Rigorous background checks including ID verification and interview screening for your peace of mind.' },
    { icon: 'fa-calendar-check', title: 'Manage Missed Class', desc: 'Flexible scheduling and compensation for missed sessions.', backTitle: 'Flexible Schedule', backDesc: "Don't worry about sick days. We arrange makeup classes to ensure the syllabus is completed on time." },
    { icon: 'fa-map-marker-alt', title: 'Every Corner of Varanasi', desc: 'Tutors available in Lanka, Sigra, Shivpur, and more.', backTitle: 'Local Tutors', backDesc: 'From Lanka to Shivpur, our vast network ensures a tutor is available near your location.' },
];

const Home = () => {
  // CORRECTED: useScrollAnimation is a hook that manages observer logic internally 
  // without needing to return values for refs unless explicitly coded that way.
  useScrollAnimation();

  const [hideCallStrip, setHideCallStrip] = React.useState(false);
  const [upcomingHoliday, setUpcomingHoliday] = React.useState(null); // Holiday State
  const lastScrollTop = React.useRef(0);
  const [galleryImages, setGalleryImages] = React.useState([]);
  const [subjectCounts, setSubjectCounts] = React.useState([]);
  const tutorCount = 3100;

  React.useEffect(() => {
    document.title = "Best Home Tutors in Varanasi | Param Tuition Bureau";
    // 1. Existing Scroll Logic
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (window.innerWidth <= 768) {
        setHideCallStrip(scrollTop > lastScrollTop.current && scrollTop > 50);
      }
      lastScrollTop.current = scrollTop <= 0 ? 0 : scrollTop;
    };
    window.addEventListener('scroll', handleScroll);

    // 2. NEW: Holiday Banner Logic
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
          const todayDate = new Date();
          const diffTime = Math.abs(holidayDate - todayDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Show banner only if holiday is within 3 days
          if (diffDays <= 3) setUpcomingHoliday(data);
        }
      } catch (err) { console.error("Holiday fetch error:", err); }
    };

    // 3. NEW: Fetch Gallery Images
    const fetchGallery = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) setGalleryImages(data);
    };

    // 4. NEW: Fetch Subject Counts
    const fetchSubjectCounts = async () => {
      try {
        const { data, error } = await supabase
          .from('teacher_details')
          .select('subjects_can_teach');

        if (error) throw error;

        const counts = {};
        if (data) {
          data.forEach(t => {
            if (t.subjects_can_teach) {
              const subjects = Array.isArray(t.subjects_can_teach) 
                ? t.subjects_can_teach 
                : String(t.subjects_can_teach).split(',').map(s => s.trim());
              
              subjects.forEach(sub => {
                if (sub) {
                  const normalized = sub.trim();
                  if (normalized.length > 0) {
                     counts[normalized] = (counts[normalized] || 0) + 1;
                  }
                }
              });
            }
          });
        }

        const sorted = Object.entries(counts)
          .map(([subject, count]) => ({ subject, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 24);
        
        setSubjectCounts(sorted);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    checkHolidays();
    fetchGallery();
    fetchSubjectCounts();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* NEW: DYNAMIC HOLIDAY BANNER */}
      {upcomingHoliday && (
        <div className="holiday-banner">
          📢 NOTICE: Classes Suspended on {new Date(upcomingHoliday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} for {upcomingHoliday.event_name}
        </div>
      )}
      <Header />

      {/* HERO SECTION */}
      <section className="hero reveal" style={{ paddingBottom: '50px' }}>
        <div className="hero-content animate-on-scroll is-visible animate-from-left">
          <h1><span className="brand-name">Param Tuition Bureau</span> <span className="hero-subtitle">Best Home Tutors in Varanasi (CBSE & ICSE)</span></h1>
          <p className="hero-desc">
            Get the best home tuition for your child. Experienced teachers for CBSE, ICSE & UP Board. Personalized learning at your doorstep.
          </p>
          <div className="hero-buttons">
            <Link to="/post-inquiry" className="btn-primary">Book Free Demo</Link>
            <Link to="/teacher-register" className="btn-outline">Join as Teacher</Link>
          </div>
          <div className="stats-row" style={{ display: 'flex', gap: '50px', marginTop: '30px', flexWrap: 'nowrap' }}>
            <div className="stat-block" style={{ whiteSpace: 'nowrap' }}>
              <div className="stat-number"><Counter target={3000} suffix="+" /></div>
              <div className="stat-label">Experienced Tutors</div>
            </div>
            <div className="stat-block" style={{ whiteSpace: 'nowrap' }}>
              <div className="stat-number"><Counter target={1500} suffix="+" /></div>
              <div className="stat-label">Female Teachers</div>
            </div>
            <div className="stat-block" style={{ whiteSpace: 'nowrap' }}>
              <div className="stat-number"><Counter target={1800} suffix="+" /></div>
              <div className="stat-label">Happy Students</div>
            </div>
            <div className="stat-block" style={{ whiteSpace: 'nowrap' }}>
              <div className="stat-number"><Counter target={1000} suffix="+" /></div>
              <div className="stat-label">Top Results</div>
            </div>
          </div>
        </div>
        <div className="hero-img-right animate-on-scroll is-visible animate-from-right">
          <GoldEnquiryForm />
        </div>
      </section>

      <SectionDivider />

      {/* SERVICE DESCRIPTION */}
      <section className="section reveal service-description">
        <div className="container">
          <h2>What We Serve</h2>
          <hr className="hr-gold" />
          <p className="service-text">
            Param Tuition Bureau is Varanasi’s premier teacher bureau and home tuition provider. We specialize in connecting students with highly qualified home tutors across Varanasi, including Sigra, Lanka, Bhelupur, Shivpur, and Sarnath. Whether you need an expert Maths teacher for Class 10, a Physics tutor for IIT-JEE, or primary school educators, we provide verified and professional tutor tailored to your needs.
            <br /><br />
            As a trusted educational consultancy in Varanasi, we maintain a strict verification process to ensure student safety and academic excellence. We serve all major boards (CBSE, ICSE, UP Board). Contact Param Tuition Bureau today for the best home tuition experience in Varanasi and join hundreds of successful students.
          </p>
        </div>
      </section>

      <SectionDivider />

      {/* ADVANTAGE GRID (FLIP CARDS) */}
      <section className="section reveal text-center">
          <h2>Get the Param Advantage</h2>
          <hr className="hr-gold" />
          <div className="advantage-grid">
              {advantages.map(adv => (
                  <div className="advantage-card" key={adv.title}>
                      <div className="advantage-card-inner">
                          <div className="advantage-card-front">
                              <i className={`fas ${adv.icon}`} aria-hidden="true"></i>
                              <h3>{adv.title}</h3>
                              <p>{adv.desc}</p>
                          </div>
                          <div className="advantage-card-back">
                              <h3>{adv.backTitle}</h3>
                              <p>{adv.backDesc}</p>
                          </div>
                      </div>
                  </div>
              ))}
              <div className="advantage-card">
                  <div className="advantage-card-inner">
                      <div className="advantage-card-front">
                          <i className="fas fa-users" aria-hidden="true"></i>
                          <h3><Counter target={tutorCount} suffix="+" /> Active Tutors</h3>
                          <p>Large network of experienced tutors across all subjects.</p>
                      </div>
                      <div className="advantage-card-back">
                          <h3>Vast Network</h3>
                          <p>Join the largest network of educators in Varanasi dedicated to student success.</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* MISSION & VIDEO SECTION */}
      <section className="section mission-video-section reveal">
        <div className="mission-video-container">
          <div className="mission-text">
            <p className="mission-tagline">Personalized Learning for Every Child</p>
            <h2>Why Home Tuition Matters?</h2>
            <hr className="left-hr" />
            <p>Every child has a unique <strong>learning speed, strengths, and weaknesses</strong>. In large school classrooms or crowded coaching centers, students often miss out on the <strong>personal attention</strong> they need, leaving their 'weak areas' unaddressed.</p>
            <p>With the right <strong>personalized guidance</strong>, every child can bridge these gaps, build their confidence, and reach their full potential.</p>
            <ul className="mission-features">
              <li><i className="fas fa-check-circle" aria-hidden="true"></i> Experienced CBSE/ICSE Background Tutors</li>
              <li><i className="fas fa-check-circle" aria-hidden="true"></i> 100% Trusted & Background Verified Teachers</li>
              <li><i className="fas fa-check-circle" aria-hidden="true"></i> Caring Female Tutors for Younger Kids</li>
              <li><i className="fas fa-check-circle" aria-hidden="true"></i> Missed Classes Covered with Extra Time</li>
            </ul>
            <p className="mission-footer">"हमारे ट्यूटर्स सिर्फ सिलेबस पूरा नहीं कराते... बल्कि Concepts को गहराई से समझाते हैं और Results की गारंटी देते हैं।"</p>
          </div>
          <div className="mission-video">
            <div className="video-wrapper">
              <iframe 
                src="https://www.youtube-nocookie.com/embed/erca_6CKCCM?rel=0" 
                title="Param Tuition Bureau Success Stories"
                style={{ border: 0 }}
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <p className="video-caption">Watch how our tutors transform student learning.</p>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* HOW TO HIRE */}
      <section className="section reveal bg-offwhite">
        <div className="container">
          <h2>How to Hire a Tutor?</h2>
          <hr className="hr-gold" />
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <i className="fas fa-phone-alt step-icon" aria-hidden="true"></i>
              <h3>Contact Us</h3>
              <p>Call us or fill the enquiry form with your requirements.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <i className="fas fa-chalkboard-teacher step-icon" aria-hidden="true"></i>
              <h3>Free Demo</h3>
              <p>We arrange a free demo class with a verified expert tutor.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <i className="fas fa-check-circle step-icon" aria-hidden="true"></i>
              <h3>Start Learning</h3>
              <p>If satisfied, confirm the tutor and start regular classes.</p>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* GALLERY SWIPER */}
      <section className="section reveal">
        <h2>Gallery</h2>
        <hr className="hr-gold" />
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1.5}
          centeredSlides={true}
          loop={false}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="gallery-swiper"
        >
          {galleryImages.length > 0 ? galleryImages.map(img => (
            <SwiperSlide key={img.id}><img src={img.image_url} alt={img.caption || "Gallery Image"} /></SwiperSlide>
          )) : (
            <>
              <SwiperSlide><img src="/param-tuition-bureau-home-tutor-varanasi.jpg" alt="Home tuition in Varanasi" /></SwiperSlide>
              <SwiperSlide><img src="/best-home-tutor-in-varanasi-teaching.jpg" alt="Best home tutor in Varanasi" /></SwiperSlide>
              <SwiperSlide><img src="/private-home-tuition-classes-varanasi.jpg" alt="Private home tuition in Varanasi" /></SwiperSlide>
              <SwiperSlide><img src="/param-tuition-bureau-office-varanasi.jpg" alt="Param Tuition Bureau office" /></SwiperSlide>
              <SwiperSlide><img src={tutorImg} alt="Successful Home Tutor" /></SwiperSlide>
              <SwiperSlide><img src={coachingImg} alt="Home Tuition vs Coaching" /></SwiperSlide>
            </>
          )}
        </Swiper>
      </section>

      <SectionDivider />

      {/* VERIFIED TEACHERS SWIPER */}
      <section className="section reveal">
        <h2>Our Verified Teachers</h2>
        <hr className="hr-gold" />
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
        >
          {[
            { name: "S.K. Verma", qual: "M.Sc Mathematics", exp: "12 Years" },
            { name: "Priya Singh", qual: "M.Sc Biology", exp: "8 Years" },
            { name: "Rahul Mishra", qual: "B.Tech (IIT BHU)", exp: "6 Years" },
            { name: "Anjali Gupta", qual: "MA English", exp: "10 Years" },
            { name: "Vikram Patel", qual: "M.Sc Physics", exp: "15 Years" },
            { name: "Sneha Roy", qual: "B.Ed, MA", exp: "7 Years" },
            { name: "Amit Dubey", qual: "M.Com", exp: "9 Years" },
            { name: "Rohan Das", qual: "B.Sc Chemistry", exp: "5 Years" }
          ].map((t, index) => (
            <SwiperSlide key={index}>
              <div className="teacher-card">
                <img src="/images/tutor-placeholder.png" alt={t.name} />
                <h4>{t.name}</h4>
                <p style={{ color: 'var(--gold)', fontWeight: 600, marginBottom: '5px' }}>{t.qual}</p>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Exp: {t.exp}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* CALL STRIP */}
      <section className={`call-strip ${hideCallStrip ? 'hidden' : ''}`}>
        <h2>Need Help Choosing? Call Us Now!</h2>
        <div className="call-actions">
          <a href="tel:+918756525373" className="call-btn-large">
            <i className="fas fa-phone-alt"></i> +91 87565 25373
          </a>
          <Link to="/post-inquiry" className="call-btn-secondary">Book My Free Demo</Link>
        </div>
      </section>

      <SectionDivider />

      {/* TUITION OPPORTUNITIES SWIPER */}
      <section className="section reveal">
        <h2>Tuition Opportunities Available</h2>
        <hr className="hr-gold" />
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {[
            { class: "Class 6", subject: "Maths + Science", area: "Lanka", fees: "₹2500" },
            { class: "Class 10", subject: "Maths", area: "Sigra", fees: "₹3500" },
            { class: "Class 8", subject: "Science + English", area: "Mahmoorganj", fees: "₹3000" },
            { class: "NEET Foundation", subject: "Physics + Chemistry", area: "Bhelupur", fees: "₹6000" }
          ].map((t, index) => (
            <SwiperSlide key={index}>
              <div className="tuition-card">
                <div className="tuition-header">
                  <h4 className="tuition-class">{t.class}</h4>
                  <span className="tuition-badge">Active</span>
                </div>
                <div className="tuition-subject"><i className="fas fa-book-open"></i> {t.subject}</div>
                <div className="tuition-details">
                  <div className="t-detail">
                    <span className="t-label">Location</span>
                    <span className="t-value">{t.area}</span>
                  </div>
                  <div className="t-detail">
                    <span className="t-label">Budget</span>
                    <span className="t-value">{t.fees} / month</span>
                  </div>
                </div>
                <Link to="/teacher-register" className="tuition-btn">Apply Now</Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <SectionDivider />

      {/* GOOGLE REVIEWS */}
      <GoogleReviews />

      {/* SUBJECTS GRID */}
      <section className="section reveal">
        <div className="container">
          <h2 className="text-center text-3xl font-black uppercase italic">Find Tutors by Subject</h2>
          <hr className="hr-gold mx-auto" />
          <p className="text-center text-slate-500 mt-4 mb-10 max-w-2xl mx-auto">
            Browse our extensive network of tutors across various subjects.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjectCounts.length > 0 ? subjectCounts.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition hover:border-blue-200 group cursor-default">
                <span className="font-bold text-slate-700 text-sm group-hover:text-blue-800 transition truncate mr-2" title={item.subject}>{item.subject}</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap">{item.count} Tutors</span>
              </div>
            )) : (
              <div className="col-span-full text-center text-slate-400 italic">Loading popular subjects...</div>
            )}
          </div>
        </div>
      </section>

      {/* AREA LINKS GRID - Corrected Syntax */}
<section className="section">
  <div className="main-content">
    <h2 className="area-grid-title">Find Expert Home Tutors by Area</h2>
    <hr className="hr-gold" />
    <div className="area-grid">
      {["Lanka", "Sigra", "Durgakund", "Mahmoorganj", "Bhelupur", "Ravindrapuri", "Kamachha", "Chitaipur", "Chetganj", "DLW", "Shivpur", "Pandeypur", "Sarnath", "Ashapur", "Pahadiya", "Orderly Bazar", "Gilat Bazar", "Bhojubeer", "Hukulganj", "Nadesar", "Hyderabad Gate", "Godowlia", "Bhagwanpur", "Nati Imli", "Lahartara", "Meerapur Basahi", "Tarna", "Assi", "Susuwahi", "Sunderpur"].map(area => (
        /* USE BACKTICKS ` BELOW, NOT SINGLE QUOTES ' */
        <Link to={`/tutors-in/${area.replace(/\s+/g, '-')}`} className="area-link" key={area}>
          Tutors in {area}
        </Link>
      ))}
    </div>
  </div>
</section>  

      <SectionDivider />

      {/* JOIN AS TUTOR STEPS */}
      <section className="section join-tutor-section reveal">
        <div className="container">
          <h2>Join as a Home Tutor</h2>
          <hr className="hr-gold" />
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <i className="fas fa-edit" aria-hidden="true"></i>
              <h3>Register Online</h3>
              <p>Fill out our simple registration form with your details.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <i className="fas fa-file-invoice" aria-hidden="true"></i>
              <h3>Documentation</h3>
              <p>Upload your ID proof and academic documents for verification.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <i className="fas fa-user-check" aria-hidden="true"></i>
              <h3>Interview</h3>
              <p>Complete a short demo or interview with our coordinator.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <i className="fas fa-clipboard-list" aria-hidden="true"></i>
              <h3>Start Teaching</h3>
              <p>Get requirements in your area and start taking classes.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link to="/teacher-register" className="btn-primary">Register Now as a Tutor</Link>
          </div>
        </div>
      </section>

      <SectionDivider />
      <Footer />
    </>
  );
};

export default Home;