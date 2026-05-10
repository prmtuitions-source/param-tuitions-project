import Link from 'next/link';

const LOCATION_SLUGS = [
  'lanka', 'sigra', 'durgakund', 'mahmoorganj', 'bhelupur',
  'ravindrapuri', 'kamachha', 'chitaipur', 'chetganj', 'dlw',
  'shivpur', 'pandeypur', 'sarnath', 'ashapur', 'pahadiya',
  'orderly-bazar', 'gilat-bazar', 'bhojubeer', 'hukulganj', 'nadesar',
  'hyderabad-gate', 'godowlia', 'bhagwanpur', 'nati-imli', 'lahartara',
  'meerapur-basahi', 'tarna', 'assi', 'susuwahi', 'sunderpur', 'akhari',
];

const LOCATION_NAMES = {
  lanka: 'Lanka', sigra: 'Sigra', durgakund: 'Durgakund',
  mahmoorganj: 'Mahmoorganj', bhelupur: 'Bhelupur',
  ravindrapuri: 'Ravindrapuri', kamachha: 'Kamachha',
  chitaipur: 'Chitaipur', chetganj: 'Chetganj', dlw: 'DLW Colony',
  shivpur: 'Shivpur', pandeypur: 'Pandeypur', sarnath: 'Sarnath',
  ashapur: 'Ashapur', pahadiya: 'Pahadiya',
  'orderly-bazar': 'Orderly Bazar', 'gilat-bazar': 'Gilat Bazar',
  bhojubeer: 'Bhojubeer', hukulganj: 'Hukulganj', nadesar: 'Nadesar',
  'hyderabad-gate': 'Hyderabad Gate', godowlia: 'Godowlia',
  bhagwanpur: 'Bhagwanpur', 'nati-imli': 'Nati Imli', lahartara: 'Lahartara',
  'meerapur-basahi': 'Meerapur Basahi', tarna: 'Tarna',
  assi: 'Assi', susuwahi: 'Susuwahi', sunderpur: 'Sunderpur', akhari: 'Akhari',
};

const NETWORK_SITES = [
  {
    name: 'PTB Lucknow',
    url: 'https://paramtuitionbureau.com',
    description: 'Home Tuition Bureau for Lucknow — verified tutors for CBSE, ICSE & UP Board.',
    label: 'paramtuitionbureau.com',
  },
  {
    name: 'VaranasiJobs.in',
    url: 'https://varanasijobs.in',
    description: 'Local jobs portal connecting candidates with employers in Varanasi & UP.',
    label: 'varanasijobs.in',
  },
  {
    name: 'Kashi Web Studio',
    url: 'https://kashiwebstudio.com',
    description: 'Web design, SEO & digital marketing services based in Varanasi.',
    label: 'kashiwebstudio.com',
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white pt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 pb-10">

        {/* GMB Card */}
        <div
          className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 max-w-sm mb-10"
          itemScope
          itemType="https://schema.org/LocalBusiness"
        >
          <h2 className="text-lg font-semibold text-white mb-3" itemProp="name">
            Param Tuition Bureau – Varanasi
          </h2>
          <p className="text-slate-300 text-sm leading-7" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
            <span itemProp="streetAddress">Gate No. 2, R K Puram, N 4/49-D, Dhirendra Mahila PG College Rd, Gandhi Nagar, Nandan Nagar, Karaundi</span><br />
            <span itemProp="addressLocality">Varanasi</span>,{' '}
            <span itemProp="addressRegion">Uttar Pradesh</span>{' '}
            <span itemProp="postalCode">221005</span><br />
            Phone:{' '}
            <a href="tel:+918858805373" itemProp="telephone" className="hover:text-white">
              +91 88588 05373
            </a>
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJGUaAOleHXKURNd2BA618GVM"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#f4d58d] hover:text-white font-medium"
            >
              ★ Leave a Google Review
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Param+Tuition+Bureau+Varanasi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white"
            >
              View on Google Maps
            </a>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Brand */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="inline-block">
              <img src="/logo.webp" alt="Param Tuition Bureau" width={192} height={48} loading="lazy" className="h-12 w-auto object-contain" />
            </Link>
            <p className="text-slate-300 text-sm leading-relaxed">
              Varanasi's most trusted home tuition consultancy. Connecting students with 3,000+ verified tutors since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#f4d58d] uppercase tracking-wider">Quick Links</h3>
            <Link href="/" className="text-slate-300 hover:text-white text-sm transition-colors">Home</Link>
            <Link href="/about" className="text-slate-300 hover:text-white text-sm transition-colors">About Us</Link>
            <Link href="/find-tutors" className="text-slate-300 hover:text-white text-sm transition-colors">Find Tutors</Link>
            <Link href="/available-tuitions" className="text-slate-300 hover:text-white text-sm transition-colors">Tuition Jobs</Link>
            <Link href="/teacher-register" className="text-slate-300 hover:text-white text-sm transition-colors">Join as Tutor</Link>
            <Link href="/faq" className="text-slate-300 hover:text-white text-sm transition-colors">FAQ</Link>
            <Link href="/blog" className="text-slate-300 hover:text-white text-sm transition-colors">Blog</Link>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#f4d58d] uppercase tracking-wider">Support</h3>
            <Link href="/contact" className="text-slate-300 hover:text-white text-sm transition-colors">Contact Us</Link>
            <Link href="/terms" className="text-slate-300 hover:text-white text-sm transition-colors">Terms & Conditions</Link>
            <Link href="/privacy" className="text-slate-300 hover:text-white text-sm transition-colors">Privacy Policy</Link>
            <a href="tel:+918756525373" className="text-slate-300 hover:text-white text-sm transition-colors">+91 87565 25373</a>
            <a href="tel:+918858805373" className="text-slate-300 hover:text-white text-sm transition-colors">+91 88588 05373</a>
            <a href="tel:+919208525373" className="text-slate-300 hover:text-white text-sm transition-colors">+91 92085 25373</a>
            <a href="mailto:prmtuitions@gmail.com" className="text-slate-300 hover:text-white text-sm transition-colors">prmtuitions@gmail.com</a>
          </div>

          {/* Our Network */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#f4d58d] uppercase tracking-wider">Our Network</h3>
            {NETWORK_SITES.map((site) => (
              <a
                key={site.url}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-0.5"
              >
                <span className="text-slate-200 group-hover:text-[#f4d58d] text-sm font-semibold transition-colors">
                  {site.name}
                </span>
                <span className="text-slate-500 text-[11px]">{site.label}</span>
                <span className="text-slate-400 text-xs leading-relaxed group-hover:text-slate-300 transition-colors">
                  {site.description}
                </span>
              </a>
            ))}
          </div>

          {/* Locations */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-bold text-[#f4d58d] uppercase tracking-wider">Tutors Near You</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {LOCATION_SLUGS.map((slug) => (
                <Link
                  key={slug}
                  href={`/tutors-in/${slug}`}
                  className="text-slate-300 hover:text-white text-xs transition-colors truncate"
                >
                  {LOCATION_NAMES[slug]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Network strip */}
      <div className="border-t border-slate-800 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="text-slate-600">Part of the PTB Network:</span>
          {NETWORK_SITES.map((site) => (
            <a
              key={site.url}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              {site.label}
            </a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 py-5 text-center text-slate-500 text-xs">
        &copy; {new Date().getFullYear()} Param Tuition Bureau, Varanasi. All rights reserved. |{' '}
        <Link href="/terms" className="hover:text-slate-300">Terms</Link>
        {' '}|{' '}
        <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
        {' '}|{' '}
        <span>Website by{' '}
          <a href="https://kashiwebstudio.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">
            Kashi Web Studio
          </a>
        </span>
      </div>
    </footer>
  );
}
