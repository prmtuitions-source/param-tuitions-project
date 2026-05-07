import Link from 'next/link';
import { MapPin, Phone, MessageCircle, ArrowRight, CheckCircle2, Star } from 'lucide-react';
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
  { slug: 'lanka', name: 'Lanka' },
  { slug: 'sigra', name: 'Sigra' },
  { slug: 'durgakund', name: 'Durgakund' },
  { slug: 'mahmoorganj', name: 'Mahmoorganj' },
  { slug: 'bhelupur', name: 'Bhelupur' },
  { slug: 'ravindrapuri', name: 'Ravindrapuri' },
  { slug: 'kamachha', name: 'Kamachha' },
  { slug: 'chitaipur', name: 'Chitaipur' },
  { slug: 'pandeypur', name: 'Pandeypur' },
  { slug: 'sarnath', name: 'Sarnath' },
  { slug: 'shivpur', name: 'Shivpur' },
  { slug: 'dlw', name: 'DLW Colony' },
];

const ADVANTAGES = [
  { icon: '🎓', title: 'CBSE/ICSE Experts', desc: 'Qualified teachers familiar with board curriculums and exam patterns.' },
  { icon: '👩‍🏫', title: 'Caring Female Tutors', desc: 'Safe, supportive environment with 1,500+ experienced female tutors.' },
  { icon: '✅', title: 'Verified Tutors', desc: '100% background checked — ID verification and interview screening.' },
  { icon: '📅', title: 'Missed Class Cover', desc: 'Flexible scheduling and makeup classes so no session is lost.' },
  { icon: '📍', title: 'Every Corner of Varanasi', desc: 'Tutors in Lanka, Sigra, Shivpur, Sarnath and 30+ localities.' },
  { icon: '⚡', title: 'Demo Within 24 Hours', desc: 'We match you fast and arrange a free demo class at your home.' },
];

const STEPS = [
  { n: '1', icon: '📞', title: 'Contact Us', desc: 'Call, WhatsApp or fill the enquiry form with your requirements.' },
  { n: '2', icon: '🏫', title: 'Free Demo Class', desc: 'We arrange a free demo with a verified tutor at your home.' },
  { n: '3', icon: '📚', title: 'Start Learning', desc: 'Confirm the tutor and start regular classes on your schedule.' },
];

const TEACHERS = [
  { name: 'S.K. Verma', qual: 'M.Sc Mathematics', exp: '12 Years' },
  { name: 'Priya Singh', qual: 'M.Sc Biology', exp: '8 Years' },
  { name: 'Rahul Mishra', qual: 'B.Tech (IIT BHU)', exp: '6 Years' },
  { name: 'Anjali Gupta', qual: 'MA English', exp: '10 Years' },
  { name: 'Vikram Patel', qual: 'M.Sc Physics', exp: '15 Years' },
  { name: 'Sneha Roy', qual: 'B.Ed, MA Hindi', exp: '7 Years' },
  { name: 'Amit Dubey', qual: 'M.Com', exp: '9 Years' },
  { name: 'Kavita Sharma', qual: 'MA Sanskrit', exp: '11 Years' },
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
      <section className="bg-gradient-to-br from-[#0f172a] via-slate-800 to-slate-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <p className="inline-flex items-center gap-2 bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
              <Star size={13} fill="currentColor" />
              Varanasi's Most Trusted Home Tuition Service
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold font-poppins leading-tight mb-5">
              Best Home Tutors<br />
              <span className="text-[#d4af37]">in Varanasi</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
              Param Tuition Bureau connects students with 3,000+ verified home tutors across Varanasi for CBSE, ICSE and UP Board. 1,500+ experienced female tutors available.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { v: '3,000+', l: 'Verified Tutors' },
                { v: '1,500+', l: 'Female Tutors' },
                { v: '1,800+', l: 'Happy Students' },
                { v: '15+', l: 'Years of Service' },
              ].map(({ v, l }) => (
                <div key={l} className="text-center bg-white/5 rounded-2xl p-3">
                  <p className="text-2xl font-extrabold text-[#d4af37] font-poppins">{v}</p>
                  <p className="text-xs text-slate-300 mt-1">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor+in+Varanasi."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors shadow-lg"
              >
                <MessageCircle size={18} />
                Book Free Demo on WhatsApp
              </a>
              <Link
                href="/find-tutors"
                className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-full transition-colors"
              >
                Browse Tutors <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="w-full lg:w-auto lg:shrink-0">
            <EnquiryForm />
          </div>
        </div>
      </section>

      {/* ── QUICK STATS BAR ── */}
      <div className="bg-[#d4af37] py-4 px-6">
        <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-center text-sm font-bold text-[#0f172a]">
          <span>✓ 3,000+ Verified Tutors</span>
          <span>✓ 1,500+ Female Tutors</span>
          <span>✓ Demo Within 24 Hours</span>
          <span>✓ 100% Background Checked</span>
          <span>✓ All Boards Covered</span>
        </div>
      </div>

      {/* ── ADVANTAGES ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-3">Get the Param Advantage</h2>
          <p className="text-center text-slate-500 mb-10">Why thousands of Varanasi families choose us year after year</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ADVANTAGES.map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-[#d4af37] hover:shadow-md transition-all">
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-3">How to Hire a Tutor?</h2>
          <p className="text-center text-slate-500 mb-10">Simple 3-step process — get a tutor at your doorstep</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(({ n, icon, title, desc }) => (
              <div key={n} className="text-center bg-white rounded-2xl p-7 border border-slate-100 shadow-sm relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-[#0f172a] text-white rounded-full flex items-center justify-center font-bold text-sm">{n}</div>
                <div className="text-4xl mb-4 mt-2">{icon}</div>
                <h3 className="font-bold text-[#0f172a] mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AVAILABLE TUITIONS ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#0f172a] font-poppins mb-4">Tuition Opportunities Available</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Are you a tutor looking for home tuition jobs in Varanasi? We post new tuition requirements daily across all localities — Maths, Science, English, Hindi, Commerce and more.
            </p>
            <ul className="flex flex-col gap-2 mb-6">
              {['CBSE / ICSE / UP Board tuitions daily', 'Primary to Class 12 and graduation', 'Jobs in 30+ Varanasi localities', 'Direct parent contact — no middleman fees'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-700 text-sm">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://app.paramtuitions.com/available-tuitions"
                className="inline-flex items-center gap-2 bg-[#0f172a] text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors"
              >
                View Available Tuitions <ArrowRight size={16} />
              </a>
              <a
                href="https://app.paramtuitions.com/teacher-register"
                className="inline-flex items-center gap-2 border border-[#0f172a] text-[#0f172a] font-semibold px-6 py-3 rounded-full hover:bg-slate-50 transition-colors"
              >
                Register as Tutor
              </a>
            </div>
          </div>
          <div className="w-full md:w-64 bg-gradient-to-br from-[#0f172a] to-slate-700 rounded-3xl p-7 text-white text-center shrink-0">
            <p className="text-5xl font-extrabold text-[#d4af37] font-poppins">50+</p>
            <p className="text-sm text-slate-300 mt-1 mb-5">New tuition jobs posted weekly</p>
            <p className="text-5xl font-extrabold text-[#d4af37] font-poppins">30+</p>
            <p className="text-sm text-slate-300 mt-1 mb-5">Varanasi localities covered</p>
            <p className="text-5xl font-extrabold text-[#d4af37] font-poppins">₹Free</p>
            <p className="text-sm text-slate-300 mt-1">Registration for tutors</p>
          </div>
        </div>
      </section>

      {/* ── VIDEO SECTION ── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-[#0f172a] font-poppins mb-4">Why Home Tuition Matters?</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Every child has a unique learning speed. In large classrooms, students miss the personal attention they need. With the right home tutor, every child can bridge gaps and reach their full potential.
            </p>
            <ul className="flex flex-col gap-2">
              {['Experienced CBSE/ICSE background tutors', '100% trusted & background verified teachers', 'Caring female tutors for younger kids', 'Missed classes covered with extra sessions'].map(item => (
                <li key={item} className="flex items-center gap-2 text-slate-700 text-sm">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full md:w-96 shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-xl aspect-video">
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

      {/* ── OUR TUTORS ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-3">Our Verified Teachers</h2>
          <p className="text-center text-slate-500 mb-10">A glimpse of our qualified tutor network</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {TEACHERS.map(({ name, qual, exp }) => (
              <div key={name} className="bg-slate-50 rounded-2xl p-5 text-center border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-[#0f172a] flex items-center justify-center mx-auto mb-3 text-[#d4af37] text-xl font-bold">
                  {name[0]}
                </div>
                <h4 className="font-bold text-[#0f172a] text-sm">{name}</h4>
                <p className="text-[#d4af37] text-xs font-semibold mt-1">{qual}</p>
                <p className="text-slate-500 text-xs mt-1">Exp: {exp}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://app.paramtuitions.com/find-tutors"
              className="inline-flex items-center gap-2 text-[#0f172a] font-semibold hover:underline"
            >
              View all tutors <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* ── LOCATION GRID ── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-3">Find Tutors Near You</h2>
          <p className="text-center text-slate-500 mb-10">Click your area to see verified home tutors available nearby</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {POPULAR_LOCATIONS.map(({ slug, name }) => (
              <Link
                key={slug}
                href={`/tutors-in/${slug}`}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#0f172a] hover:bg-[#0f172a] hover:text-white text-slate-700 rounded-xl px-4 py-3 text-sm font-medium transition-all group"
              >
                <MapPin size={14} className="text-[#d4af37] shrink-0" />
                Tutors in {name}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/find-tutors" className="inline-flex items-center gap-2 text-[#0f172a] font-semibold hover:underline">
              View all locations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-3">What Parents Say</h2>
          <p className="text-center text-slate-500 mb-10">Real reviews from Varanasi families</p>
          <ElfsightReviews />
        </div>
      </section>

      {/* ── CALL STRIP ── */}
      <section className="py-12 px-6 bg-[#d4af37]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a] font-poppins">Need Help Choosing a Tutor?</h2>
            <p className="text-slate-800 mt-1">Our team is available Mon–Sun, 8 AM – 8 PM</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="tel:+918756525373" className="inline-flex items-center gap-2 bg-[#0f172a] text-white font-bold px-6 py-3 rounded-full hover:bg-slate-800 transition-colors">
              <Phone size={16} /> +91 87565 25373
            </a>
            <a
              href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-colors"
            >
              <MessageCircle size={16} /> WhatsApp Now
            </a>
          </div>
        </div>
      </section>

      {/* ── TUTOR CTA ── */}
      <section className="py-14 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold font-poppins mb-3">Are You a Tutor?</h2>
          <p className="text-slate-300 mb-6">Join Varanasi's largest tutor network. Get consistent demo requests and tuition bookings directly from parents.</p>
          <a
            href="https://app.paramtuitions.com/teacher-register"
            className="inline-flex items-center gap-2 bg-[#d4af37] text-[#0f172a] font-bold px-8 py-4 rounded-full hover:bg-yellow-400 transition-colors"
          >
            Register as a Tutor <ArrowRight size={18} />
          </a>
        </div>
      </section>
    </>
  );
}
