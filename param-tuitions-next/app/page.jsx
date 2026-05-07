import Link from 'next/link';
import {
  MapPin, Phone, MessageCircle, ArrowRight, CheckCircle2, Star,
  GraduationCap, UserCheck, ShieldCheck, CalendarCheck, Zap,
  BookOpen, Clock, Users,
} from 'lucide-react';
import EnquiryForm from './components/EnquiryForm';
import ElfsightReviews from './components/ElfsightReviews';

export const metadata = {
  title: 'Best Home Tutors in Varanasi – Param Tuition Bureau',
  description:
    'Param Tuition Bureau connects families in Varanasi with 3,000+ verified home tutors for CBSE, ICSE and UP Board. 100% background-checked. Book a free demo today.',
  alternates: { canonical: 'https://www.paramtuitions.com/' },
  openGraph: {
    title: 'Best Home Tutors in Varanasi – Param Tuition Bureau',
    description: 'Connect with verified home tutors in Varanasi for CBSE, ICSE & UP Board. Free demo class.',
    url: 'https://www.paramtuitions.com/',
  },
};

const POPULAR_LOCATIONS = [
  { slug: 'lanka',        name: 'Lanka' },
  { slug: 'sigra',        name: 'Sigra' },
  { slug: 'durgakund',    name: 'Durgakund' },
  { slug: 'mahmoorganj',  name: 'Mahmoorganj' },
  { slug: 'bhelupur',     name: 'Bhelupur' },
  { slug: 'ravindrapuri', name: 'Ravindrapuri' },
  { slug: 'kamachha',     name: 'Kamachha' },
  { slug: 'chitaipur',    name: 'Chitaipur' },
  { slug: 'pandeypur',    name: 'Pandeypur' },
  { slug: 'sarnath',      name: 'Sarnath' },
  { slug: 'shivpur',      name: 'Shivpur' },
  { slug: 'dlw',          name: 'DLW Colony' },
];

const HERO_STATS = [
  { v: '3,000+', l: 'Verified Tutors' },
  { v: '1,500+', l: 'Female Tutors' },
  { v: '1,800+', l: 'Happy Students' },
  { v: '15+',    l: 'Years of Service' },
];

const TRUST_ITEMS = [
  '3,000+ Verified Tutors',
  '1,500+ Female Tutors',
  'Demo Within 24 Hours',
  '100% Background Checked',
  'All Boards Covered',
  "15+ Years Serving Varanasi",
  "Varanasi's #1 Tuition Bureau",
];

const ADVANTAGES = [
  {
    icon: GraduationCap,
    color: 'from-indigo-500 to-indigo-600',
    title: 'CBSE / ICSE Experts',
    desc: 'Qualified teachers deeply familiar with board curriculums, exam patterns and scoring strategies.',
  },
  {
    icon: UserCheck,
    color: 'from-pink-500 to-rose-500',
    title: 'Caring Female Tutors',
    desc: 'Safe, supportive learning environment with 1,500+ experienced and trusted female tutors.',
  },
  {
    icon: ShieldCheck,
    color: 'from-emerald-500 to-green-600',
    title: 'Fully Verified Tutors',
    desc: '100% background checked — ID verification, interview screening and reference checks.',
  },
  {
    icon: CalendarCheck,
    color: 'from-amber-500 to-orange-500',
    title: 'Flexible Scheduling',
    desc: 'Flexible timing and makeup classes ensure no session is ever missed or lost.',
  },
  {
    icon: MapPin,
    color: 'from-cyan-500 to-blue-500',
    title: 'All of Varanasi',
    desc: 'Tutors in Lanka, Sigra, Shivpur, Sarnath, BHU area and 30+ more localities.',
  },
  {
    icon: Zap,
    color: 'from-violet-500 to-purple-600',
    title: 'Demo in 24 Hours',
    desc: 'We match you fast and arrange a free trial class right at your doorstep.',
  },
];

const STEPS = [
  {
    n: '01',
    icon: Phone,
    title: 'Contact Us',
    desc: "Call, WhatsApp or fill the enquiry form with your child's requirements.",
  },
  {
    n: '02',
    icon: UserCheck,
    title: 'Free Demo Class',
    desc: 'We match a verified tutor and arrange a free demo at your home.',
  },
  {
    n: '03',
    icon: BookOpen,
    title: 'Start Learning',
    desc: 'Confirm the tutor and begin regular classes on your chosen schedule.',
  },
];

const TEACHERS = [
  { name: 'S.K. Verma',     qual: 'M.Sc Mathematics',  exp: '12 Yrs', tag: 'Maths · Physics' },
  { name: 'Priya Singh',    qual: 'M.Sc Biology',       exp: '8 Yrs',  tag: 'Bio · Chemistry' },
  { name: 'Rahul Mishra',   qual: 'B.Tech (IIT-BHU)',   exp: '6 Yrs',  tag: 'Maths · Science' },
  { name: 'Anjali Gupta',   qual: 'MA English',         exp: '10 Yrs', tag: 'English' },
  { name: 'Vikram Patel',   qual: 'M.Sc Physics',       exp: '15 Yrs', tag: 'Physics · Maths' },
  { name: 'Sneha Roy',      qual: 'B.Ed, MA Hindi',     exp: '7 Yrs',  tag: 'Hindi · Sanskrit' },
  { name: 'Amit Dubey',     qual: 'M.Com',              exp: '9 Yrs',  tag: 'Accounts · Commerce' },
  { name: 'Kavita Sharma',  qual: 'MA Sanskrit',        exp: '11 Yrs', tag: 'Sanskrit · Hindi' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      name: 'Param Tuition Bureau',
      url: 'https://www.paramtuitions.com',
      telephone: '+918756525373',
      email: 'prmtuitions@gmail.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Gate No. 2, R K Puram, N 4/49-D, Gandhi Nagar, Nandan Nagar, Karaundi',
        addressLocality: 'Varanasi',
        addressRegion: 'Uttar Pradesh',
        postalCode: '221005',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 25.3176, longitude: 82.9739 },
      openingHours: 'Mo-Su 08:00-20:00',
      priceRange: '₹₹',
    },
    {
      '@type': 'WebSite',
      url: 'https://www.paramtuitions.com',
      name: 'Param Tuition Bureau',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://www.paramtuitions.com/find-tutors?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-[#0f172a] via-slate-800 to-[#0f172a] text-white py-16 px-6 overflow-hidden">
        {/* Decorative background glow orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#d4af37]/6 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#d4af37]/3 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center relative z-10">
          {/* Left: copy */}
          <div className="flex-1">
            <p className="hero-badge inline-flex items-center gap-2 bg-[#d4af37]/15 text-[#d4af37] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6 border border-[#d4af37]/25">
              <Star size={12} fill="currentColor" className="animate-pulse" />
              Varanasi&apos;s Most Trusted Home Tuition Service
            </p>

            <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-extrabold font-poppins leading-tight mb-5">
              Best Home Tutors<br />
              <span className="text-gradient-gold">in Varanasi</span>
            </h1>

            <p className="hero-desc text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
              Connecting students with 3,000+ verified home tutors across Varanasi for CBSE, ICSE and UP Board.
              1,500+ experienced female tutors available.
            </p>

            {/* Mini stats */}
            <div className="hero-stats grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {HERO_STATS.map(({ v, l }) => (
                <div key={l} className="bg-white/6 backdrop-blur-sm border border-white/10 rounded-2xl p-3.5 text-center hover:bg-white/10 transition-colors">
                  <p className="text-xl font-extrabold text-gradient-gold font-poppins">{v}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-tight">{l}</p>
                </div>
              ))}
            </div>

            <div className="hero-cta flex flex-wrap gap-3">
              <a
                href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor+in+Varanasi."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-full transition-all duration-200 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
              >
                <MessageCircle size={18} />
                Book Free Demo on WhatsApp
              </a>
              <Link
                href="/find-tutors"
                className="inline-flex items-center gap-2 border border-white/25 text-white hover:bg-white/10 font-semibold px-7 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
              >
                Browse Tutors <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Right: enquiry form */}
          <div className="hero-form w-full lg:w-auto lg:shrink-0">
            <EnquiryForm />
          </div>
        </div>
      </section>

      {/* ── SCROLLING TRUST BAR ── */}
      <div className="bg-[#d4af37] py-3.5 overflow-hidden">
        <div className="flex animate-marquee gap-12 whitespace-nowrap">
          {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-[#0f172a] font-bold text-sm shrink-0">
              <CheckCircle2 size={14} className="shrink-0" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── ADVANTAGES ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">Why Choose Us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] font-poppins">Get the Param Advantage</h2>
            <span className="gold-accent" />
            <p className="text-slate-500 mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
              Why thousands of Varanasi families trust us year after year
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ADVANTAGES.map(({ icon: Icon, color, title, desc }, i) => (
              <div
                key={title}
                className={`reveal reveal-d${i + 1} bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group cursor-default`}
              >
                <div className={`w-13 h-13 w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-[#0f172a] mb-2 text-[15px]">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">Simple Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] font-poppins">How to Hire a Tutor?</h2>
            <span className="gold-accent" />
            <p className="text-slate-500 mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
              Get a verified tutor at your doorstep in 3 easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />

            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div
                key={n}
                className={`reveal reveal-d${i + 1} relative bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 text-center group`}
              >
                {/* Step badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#d4af37] text-[#0f172a] font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  Step {n}
                </div>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0f172a] to-slate-600 flex items-center justify-center mx-auto mb-5 shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Icon size={26} className="text-[#d4af37]" />
                </div>

                <h3 className="font-bold text-[#0f172a] mb-2 text-lg">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVAILABLE TUITIONS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">For Tutors</p>
            <h2 className="text-3xl font-bold text-[#0f172a] font-poppins leading-snug">
              Tuition Opportunities<br />Available Now
            </h2>
            <span className="gold-accent-left" />
            <p className="text-slate-600 leading-relaxed mt-5 mb-6">
              We post new tuition requirements daily across all localities — Maths, Science, English, Hindi, Commerce and more for all boards.
            </p>
            <ul className="flex flex-col gap-3 mb-8">
              {[
                'CBSE / ICSE / UP Board tuitions daily',
                'Primary to Class 12 and graduation level',
                'Tuition jobs in 30+ Varanasi localities',
                'Direct parent contact — zero middleman fees',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={11} className="text-emerald-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://app.paramtuitions.com/available-tuitions"
                className="inline-flex items-center gap-2 bg-[#0f172a] text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
              >
                View Available Tuitions <ArrowRight size={16} />
              </a>
              <a
                href="https://app.paramtuitions.com/teacher-register"
                className="inline-flex items-center gap-2 border-2 border-[#0f172a] text-[#0f172a] font-semibold px-6 py-3 rounded-full hover:bg-slate-50 transition-colors"
              >
                Register as Tutor
              </a>
            </div>
          </div>

          {/* Stats card */}
          <div className="reveal reveal-d2 w-full md:w-60 bg-gradient-to-br from-[#0f172a] to-slate-700 rounded-3xl p-7 text-white text-center shrink-0 shadow-2xl ring-1 ring-white/5">
            {[
              { v: '50+',    l: 'New jobs weekly' },
              { v: '30+',    l: 'Localities covered' },
              { v: '₹Free',  l: 'Tutor registration' },
            ].map(({ v, l }, i) => (
              <div key={l} className={i < 2 ? 'pb-6 mb-6 border-b border-white/10' : ''}>
                <p className="text-4xl font-extrabold text-gradient-gold font-poppins">{v}</p>
                <p className="text-sm text-slate-400 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO ── */}
      <section className="py-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">Our Story</p>
            <h2 className="text-3xl font-bold text-[#0f172a] font-poppins leading-snug">
              Why Home Tuition<br />Matters
            </h2>
            <span className="gold-accent-left" />
            <p className="text-slate-600 leading-relaxed mt-5 mb-6">
              Every child has a unique learning speed. With the right home tutor, every student can bridge gaps and reach their full potential — from the comfort of home.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Experienced CBSE/ICSE background tutors',
                '100% trusted & background verified teachers',
                'Caring female tutors for younger students',
                'Missed classes covered with extra sessions',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-700 text-sm">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={11} className="text-blue-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal reveal-d2 w-full md:w-96 shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-200 aspect-video">
              <iframe
                src="https://www.youtube-nocookie.com/embed/erca_6CKCCM?rel=0"
                title="Param Tuition Bureau Success Stories"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR TEACHERS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">Our Network</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] font-poppins">Our Verified Teachers</h2>
            <span className="gold-accent" />
            <p className="text-slate-500 mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
              A glimpse of our qualified tutor network across Varanasi
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {TEACHERS.map(({ name, qual, exp, tag }, i) => (
              <div
                key={name}
                className={`reveal reveal-d${(i % 4) + 1} bg-white rounded-2xl p-5 text-center border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group`}
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0f172a] to-slate-600 flex items-center justify-center mx-auto mb-3 shadow-lg text-[#d4af37] text-xl font-black ring-4 ring-[#d4af37]/10 group-hover:ring-[#d4af37]/35 group-hover:scale-105 transition-all duration-300">
                  {name[0]}
                </div>
                <h4 className="font-bold text-[#0f172a] text-sm">{name}</h4>
                <p className="text-slate-500 text-xs mt-0.5 leading-snug">{qual}</p>

                {/* Experience badge */}
                <div className="mt-2.5 inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] font-medium px-2.5 py-1 rounded-full">
                  <Clock size={9} />
                  {exp}
                </div>

                {/* Subject tag */}
                <p className="text-[#d4af37] text-[11px] font-bold mt-2">{tag}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://app.paramtuitions.com/find-tutors"
              className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 text-[#0f172a] font-semibold px-6 py-3 rounded-full hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] transition-all duration-200"
            >
              View all tutors <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── LOCATION GRID ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">Service Areas</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] font-poppins">Find Tutors Near You</h2>
            <span className="gold-accent" />
            <p className="text-slate-500 mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
              Click your area to see verified home tutors available nearby
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {POPULAR_LOCATIONS.map(({ slug, name }, i) => (
              <Link
                key={slug}
                href={`/tutors-in/${slug}`}
                className={`reveal reveal-d${(i % 4) + 1} flex items-center gap-2.5 bg-white border border-slate-200 hover:border-[#d4af37] hover:shadow-lg text-slate-700 hover:text-[#0f172a] rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group`}
              >
                <MapPin
                  size={14}
                  className="text-[#d4af37] shrink-0 group-hover:scale-125 transition-transform duration-200"
                />
                Tutors in {name}
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/find-tutors"
              className="inline-flex items-center gap-2 text-[#0f172a] font-semibold hover:underline underline-offset-4"
            >
              View all locations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 reveal">
            <p className="text-xs font-bold uppercase tracking-widest text-[#d4af37] mb-2">Social Proof</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] font-poppins">What Parents Say</h2>
            <span className="gold-accent" />
            <p className="text-slate-500 mt-5 max-w-xl mx-auto text-[15px] leading-relaxed">
              Real Google reviews from Varanasi families
            </p>
          </div>
          <ElfsightReviews />
        </div>
      </section>

      {/* ── CALL STRIP ── */}
      <section className="py-14 px-6 bg-gradient-to-r from-[#d4af37] via-yellow-400 to-[#d4af37]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a] font-poppins">Need Help Choosing a Tutor?</h2>
            <p className="text-[#0f172a]/65 mt-1 text-sm">Our team is available Mon–Sun, 8 AM – 8 PM</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="tel:+918756525373"
              className="inline-flex items-center gap-2 bg-[#0f172a] text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <Phone size={16} />
              +91 87565 25373
            </a>
            <a
              href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-all hover:-translate-y-0.5 shadow-lg"
            >
              <MessageCircle size={16} />
              WhatsApp Now
            </a>
          </div>
        </div>
      </section>

      {/* ── TUTOR CTA ── */}
      <section className="py-20 px-6 bg-[#0f172a] text-white">
        <div className="max-w-2xl mx-auto text-center reveal">
          <div className="w-16 h-16 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center mx-auto mb-6 animate-float">
            <GraduationCap size={28} className="text-[#d4af37]" />
          </div>
          <h2 className="text-3xl font-bold font-poppins mb-3">Are You a Tutor?</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Join Varanasi&apos;s largest tutor network. Get consistent demo requests and tuition bookings directly from verified parents.
          </p>
          <a
            href="https://app.paramtuitions.com/teacher-register"
            className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] font-bold px-8 py-4 rounded-full hover:bg-yellow-400 transition-all duration-200 hover:-translate-y-0.5 shadow-xl shadow-[#d4af37]/20"
          >
            Register as a Tutor <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
