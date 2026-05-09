import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone, MessageCircle, CheckCircle2, ChevronRight, Star, Building2 } from 'lucide-react';
import { allAreaData, locationSlugs, BRANCH_DATA } from '../../../data/allAreaData';

export const revalidate = false;

export async function generateStaticParams() {
  return locationSlugs.map((location) => ({ location }));
}

export async function generateMetadata({ params }) {
  const area = allAreaData[params.location];
  if (!area) return {};
  const branch = BRANCH_DATA[area.branchKey] || BRANCH_DATA.lathiya;

  const title = area.title || `Home Tutors in ${area.name}, Varanasi`;
  const description = area.description
    ? area.description.slice(0, 160)
    : `Find verified home tutors in ${area.name}, Varanasi. CBSE, ICSE & UP Board. Book a free demo today.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.paramtuitions.com/tutors-in/${params.location}` },
    openGraph: {
      title,
      description,
      url: `https://www.paramtuitions.com/tutors-in/${params.location}`,
      type: 'website',
    },
  };
}

export default function LocationPage({ params }) {
  const area = allAreaData[params.location];
  if (!area) notFound();

  const branch = BRANCH_DATA[area.branchKey] || BRANCH_DATA.lathiya;

  const {
    name, title, intro, description, nearbyAreas = [], neighborhoods,
    schools = [], problems = [], benefits = [], testimonial, faq = [], cta,
  } = area;

  const waUrl = `https://wa.me/${branch.waPhone}?text=${encodeURIComponent(`Hello, I need a home tutor in ${name}, Varanasi.`)}`;
  const telHref = `tel:+91${branch.phone}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        name: `Param Tuition Bureau – ${name}`,
        url: `https://www.paramtuitions.com/tutors-in/${params.location}`,
        telephone: `+91${branch.phone}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: branch.streetAddress,
          addressLocality: 'Varanasi',
          addressRegion: 'Uttar Pradesh',
          postalCode: branch.postalCode,
          addressCountry: 'IN',
        },
        description,
        priceRange: '₹₹',
        areaServed: {
          '@type': 'Place',
          name: `${name}, Varanasi`,
        },
        hasMap: branch.mapUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.paramtuitions.com' },
          { '@type': 'ListItem', position: 2, name: 'Home Tutors in Varanasi', item: 'https://www.paramtuitions.com/find-tutors' },
          { '@type': 'ListItem', position: 3, name: `Tutors in ${name}`, item: `https://www.paramtuitions.com/tutors-in/${params.location}` },
        ],
      },
      faq.length > 0 && {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f172a] to-slate-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={12} />
            <Link href="/find-tutors" className="hover:text-white">Varanasi Tutors</Link>
            <ChevronRight size={12} />
            <span className="text-slate-300">{name}</span>
          </nav>

          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-[#d4af37]" />
            <span className="text-[#d4af37] font-semibold text-sm uppercase tracking-widest">{name}, Varanasi</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins leading-tight mb-5">
            {title}
          </h1>

          {intro && (
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-2xl">{intro}</p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-4 rounded-full transition-colors shadow-lg text-base"
            >
              <MessageCircle size={20} />
              Request a Demo Class
            </a>
            <a
              href={telHref}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-7 py-4 rounded-full transition-colors text-base"
            >
              <Phone size={18} />
              {branch.displayPhone}
            </a>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <div className="bg-[#d4af37] py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-6 justify-center md:justify-start text-sm font-semibold text-[#0f172a]">
          <span>✓ 3,000+ Verified Tutors</span>
          <span>✓ 1,500+ Female Tutors</span>
          <span>✓ Demo Within 24 Hours</span>
          <span>✓ 100% Background Checked</span>
        </div>
      </div>

      {/* Branch NAP strip */}
      <div className="bg-slate-50 border-b border-slate-200 py-4 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Building2 size={15} className="text-[#d4af37] shrink-0" />
            <span>
              <span className="font-semibold text-[#0f172a]">{name}</span> is served by our{' '}
              <Link href="/contact" className="font-semibold text-[#0f172a] hover:text-[#d4af37] underline underline-offset-2">
                {branch.name}
              </Link>
            </span>
          </div>
          <span className="hidden sm:block text-slate-300">|</span>
          <div className="flex items-center gap-3 text-slate-500 flex-wrap">
            <span className="flex items-center gap-1"><MapPin size={12} className="text-[#d4af37]" />{branch.address}</span>
            <a href={telHref} className="flex items-center gap-1 font-medium text-[#0f172a] hover:text-[#d4af37]">
              <Phone size={12} />{branch.displayPhone}
            </a>
          </div>
        </div>
      </div>

      {/* About */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-5">
            Home Tuition Services in {name}, Varanasi
          </h2>
          <p className="text-slate-600 leading-relaxed text-base mb-6">{description}</p>

          {neighborhoods && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <h3 className="font-bold text-[#0f172a] mb-2">Areas We Serve in {name}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{neighborhoods}</p>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      {benefits.length > 0 && (
        <section className="py-14 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-8">
              Why Choose Param Tuition Bureau in {name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <CheckCircle2 size={22} className="text-green-600 mb-4" />
                  <p className="text-slate-700 text-sm leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Schools */}
      {schools.length > 0 && (
        <section className="py-14 px-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-6">
              Schools Near {name} We Support
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {schools.map((school, i) => (
                <li key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-700 border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                  {school}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {testimonial && (
        <section className="py-14 px-6 bg-[#0f172a] text-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-5">
              {[1,2,3,4,5].map((s) => <Star key={s} size={18} className="text-[#d4af37]" fill="#d4af37" />)}
            </div>
            <blockquote className="text-xl text-slate-200 italic leading-relaxed mb-5">
              "{testimonial.text}"
            </blockquote>
            <p className="text-[#d4af37] font-semibold">— {testimonial.author}</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq.length > 0 && (
        <section className="py-14 px-6 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-8">
              Frequently Asked Questions – {name}
            </h2>
            <div className="flex flex-col gap-5">
              {faq.map(({ q, a }, i) => (
                <div key={i} className="border border-slate-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-[#0f172a] mb-2">{q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nearby areas */}
      {nearbyAreas.length > 0 && (
        <section className="py-12 px-6 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-[#0f172a] font-poppins mb-5">
              Also Find Tutors in Nearby Areas
            </h2>
            <div className="flex flex-wrap gap-3">
              {nearbyAreas.map((nearby, i) => {
                const nearbySlug = nearby.toLowerCase().replaceAll(' ', '-');
                const hasPage = locationSlugs.includes(nearbySlug);
                return hasPage ? (
                  <Link
                    key={i}
                    href={`/tutors-in/${nearbySlug}`}
                    className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#0f172a] text-slate-700 hover:text-[#0f172a] rounded-full px-4 py-2 text-sm font-medium transition-all"
                  >
                    <MapPin size={13} className="text-[#d4af37]" />
                    {nearby}
                  </Link>
                ) : (
                  <span key={i} className="flex items-center gap-1.5 bg-white border border-slate-100 text-slate-500 rounded-full px-4 py-2 text-sm">
                    <MapPin size={13} className="text-[#d4af37]" />
                    {nearby}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-[#0f172a] to-slate-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-poppins mb-4">
            {cta || `Find a Tutor in ${name} – Book a Free Demo Today`}
          </h2>
          <p className="text-slate-300 mb-2">
            Contact our <strong className="text-[#d4af37]">{branch.name}</strong> — we match you with the right tutor within hours.
          </p>
          <p className="text-slate-400 text-sm mb-8">{branch.address}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full transition-colors"
            >
              <MessageCircle size={20} />
              Request a Demo Class
            </a>
            <a
              href={telHref}
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-full transition-colors"
            >
              <Phone size={18} />
              {branch.displayPhone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
