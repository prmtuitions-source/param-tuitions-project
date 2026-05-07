import Link from 'next/link';
import { MapPin, CheckCircle2, Star, Phone, MessageCircle, ArrowRight, GraduationCap, Shield, Clock } from 'lucide-react';

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

const STATS = [
  { value: '3,000+', label: 'Verified Tutors' },
  { value: '1,500+', label: 'Female Tutors' },
  { value: '15+', label: 'Years Serving Varanasi' },
  { value: '100%', label: 'Background Checked' },
];

const FEATURES = [
  {
    icon: Shield,
    title: '100% Background Verified',
    desc: 'Every tutor is identity-checked and credential-verified before joining our network.',
  },
  {
    icon: GraduationCap,
    title: 'CBSE, ICSE & UP Board',
    desc: 'Specialized tutors for all boards — from primary through Class 12 and competitive exams.',
  },
  {
    icon: Clock,
    title: 'Demo Class Within 24 Hours',
    desc: 'We match you with the right tutor fast and arrange a free demo class at your convenience.',
  },
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
      image: 'https://www.paramtuitions.com/og-image.jpg',
      sameAs: ['https://www.facebook.com/paramtuitions'],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f172a] via-slate-800 to-slate-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <p className="inline-flex items-center gap-2 bg-[#d4af37]/20 text-[#d4af37] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Star size={13} fill="currentColor" />
            Varanasi's Most Trusted Home Tuition Service
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-poppins leading-tight mb-6">
            Find the Perfect<br />
            <span className="text-[#d4af37]">Home Tutor in Varanasi</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with 3,000+ verified tutors for CBSE, ICSE and UP Board.
            1,500+ experienced female tutors available. Free demo class within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor+in+Varanasi."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-colors shadow-lg"
            >
              <MessageCircle size={20} />
              Book Free Demo on WhatsApp
            </a>
            <Link
              href="/find-tutors"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full text-lg transition-colors"
            >
              Browse Tutors
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#d4af37] py-10">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-[#0f172a] font-poppins">{s.value}</p>
              <p className="text-sm font-semibold text-slate-800 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-12">
            Why Families in Varanasi Trust Us
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-slate-50 p-7 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-[#0f172a] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#d4af37]" />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-3">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Grid */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#0f172a] font-poppins mb-4">
            Find Tutors Near You in Varanasi
          </h2>
          <p className="text-center text-slate-600 mb-10 max-w-2xl mx-auto">
            We have verified home tutors across all major localities in Varanasi. Click your area to see available tutors.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {POPULAR_LOCATIONS.map(({ slug, name }) => (
              <Link
                key={slug}
                href={`/tutors-in/${slug}`}
                className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#0f172a] hover:bg-[#0f172a] hover:text-white text-slate-700 rounded-xl px-4 py-3 text-sm font-medium transition-all group"
              >
                <MapPin size={14} className="text-[#d4af37] shrink-0 group-hover:text-[#d4af37]" />
                Tutors in {name}
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/find-tutors"
              className="inline-flex items-center gap-2 text-[#0f172a] font-semibold hover:underline"
            >
              View all locations <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-poppins mb-4">
            Ready to Find Your Child's Perfect Tutor?
          </h2>
          <p className="text-slate-300 mb-8 text-lg">
            Contact us on WhatsApp or call directly. We match you within hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-colors"
            >
              <MessageCircle size={20} />
              WhatsApp: +91 87565 25373
            </a>
            <a
              href="tel:+918756525373"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-colors"
            >
              <Phone size={20} />
              Call Now
            </a>
          </div>
        </div>
      </section>

      {/* Are you a tutor? */}
      <section className="py-12 px-6 bg-slate-50 border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-3">Are You a Tutor?</h2>
          <p className="text-slate-600 mb-6">
            Join Varanasi's largest tutor network. Get consistent demo requests and tuition bookings.
          </p>
          <Link
            href="/teacher-register"
            className="inline-flex items-center gap-2 bg-[#0f172a] text-white font-bold px-8 py-4 rounded-full hover:bg-slate-800 transition-colors"
          >
            Register as a Tutor <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
