import Link from 'next/link';
import { MapPin, ArrowRight, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Find Home Tutors in Varanasi – Param Tuition Bureau',
  description:
    'Browse verified home tutors across 30+ localities in Varanasi. Filter by subject, class and area. Book a free demo class today with Param Tuition Bureau.',
  alternates: { canonical: 'https://www.paramtuitions.com/find-tutors' },
};

const ALL_LOCATIONS = [
  { slug: 'lanka', name: 'Lanka' },
  { slug: 'sigra', name: 'Sigra' },
  { slug: 'durgakund', name: 'Durgakund' },
  { slug: 'mahmoorganj', name: 'Mahmoorganj' },
  { slug: 'bhelupur', name: 'Bhelupur' },
  { slug: 'ravindrapuri', name: 'Ravindrapuri' },
  { slug: 'kamachha', name: 'Kamachha' },
  { slug: 'chitaipur', name: 'Chitaipur' },
  { slug: 'chetganj', name: 'Chetganj' },
  { slug: 'dlw', name: 'DLW Colony' },
  { slug: 'akhari', name: 'Akhari' },
  { slug: 'shivpur', name: 'Shivpur' },
  { slug: 'pandeypur', name: 'Pandeypur' },
  { slug: 'sarnath', name: 'Sarnath' },
  { slug: 'ashapur', name: 'Ashapur' },
  { slug: 'pahadiya', name: 'Pahadiya' },
  { slug: 'orderly-bazar', name: 'Orderly Bazar' },
  { slug: 'gilat-bazar', name: 'Gilat Bazar' },
  { slug: 'bhojubeer', name: 'Bhojubeer' },
  { slug: 'hukulganj', name: 'Hukulganj' },
  { slug: 'nadesar', name: 'Nadesar' },
  { slug: 'hyderabad-gate', name: 'Hyderabad Gate' },
  { slug: 'godowlia', name: 'Godowlia' },
  { slug: 'bhagwanpur', name: 'Bhagwanpur' },
  { slug: 'nati-imli', name: 'Nati Imli' },
  { slug: 'lahartara', name: 'Lahartara' },
  { slug: 'meerapur-basahi', name: 'Meerapur Basahi' },
  { slug: 'tarna', name: 'Tarna' },
  { slug: 'assi', name: 'Assi' },
  { slug: 'susuwahi', name: 'Susuwahi' },
  { slug: 'sunderpur', name: 'Sunderpur' },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.paramtuitions.com' },
    { '@type': 'ListItem', position: 2, name: 'Find Tutors in Varanasi', item: 'https://www.paramtuitions.com/find-tutors' },
  ],
};

export default function FindTutorsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <section className="bg-[#0f172a] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins mb-5">
            Find Home Tutors in Varanasi
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl leading-relaxed">
            Verified tutors for CBSE, ICSE and UP Board across 30+ localities. Click your area to see available tutors.
          </p>
        </div>
      </section>

      <section className="py-14 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-8">
            Select Your Locality in Varanasi
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {ALL_LOCATIONS.map(({ slug, name }) => (
              <Link
                key={slug}
                href={`/tutors-in/${slug}`}
                className="group flex items-center gap-2.5 bg-slate-50 border border-slate-200 hover:border-[#0f172a] hover:bg-[#0f172a] hover:text-white text-slate-700 rounded-xl px-4 py-3.5 text-sm font-medium transition-all"
              >
                <MapPin size={14} className="text-[#d4af37] shrink-0" />
                <span>Tutors in {name}</span>
                <ArrowRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-4">
            Can't Find Your Area? Contact Us Directly
          </h2>
          <p className="text-slate-600 mb-7">
            We have tutors across all of Varanasi. If your area isn't listed, we can still help.
          </p>
          <a
            href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor+near+my+area+in+Varanasi."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-colors"
          >
            <MessageCircle size={20} />
            WhatsApp for Tutor Match
          </a>
        </div>
      </section>
    </>
  );
}
