import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'About Us – Param Tuition Bureau | Home Tutors Varanasi',
  description:
    'Founded in honour of Late Shri Parmanand Dwivedi Ji, Param Tuition Bureau has been Varanasi\'s most trusted home tuition consultancy since 2010. 3,000+ verified tutors.',
  alternates: { canonical: 'https://www.paramtuitions.com/about' },
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-[#0f172a] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins mb-5">
            About Param Tuition Bureau
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-2xl">
            Founded in honour of Late Shri Parmanand Dwivedi Ji, we've been Varanasi's most trusted
            home tuition consultancy since 2010 — connecting families with verified, qualified tutors.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-5">Our Story</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Param Tuition Bureau was established to bring quality education to every doorstep in
              Varanasi. What started as a small initiative has grown into the city's most trusted
              tutor network with over 3,000 verified tutors across all localities.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              We honour our founder's legacy by maintaining the highest standards of teaching quality,
              tutor verification, and parent satisfaction. Every tutor in our network undergoes
              identity checks and credential verification.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our mission: give every Varanasi student access to a qualified, trustworthy home tutor —
              regardless of which board they study or which locality they live in.
            </p>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <div className="grid grid-cols-2 gap-6 text-center">
              {[
                { v: '3,000+', l: 'Verified Tutors' },
                { v: '1,500+', l: 'Female Tutors' },
                { v: '15+', l: 'Years of Service' },
                { v: '30+', l: 'Varanasi Localities' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <p className="text-3xl font-extrabold text-[#0f172a] font-poppins">{v}</p>
                  <p className="text-sm text-slate-500 mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-14 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#0f172a] font-poppins mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Trust & Safety', desc: '100% background-checked tutors. We verify identity, qualifications and references before onboarding.' },
              { title: 'Quality Education', desc: 'We match students with tutors who have subject expertise and proven teaching track records.' },
              { title: 'Accessibility', desc: 'Tutors available across 30+ localities in Varanasi, for all boards and all class levels.' },
            ].map(({ title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-slate-100">
                <h3 className="font-bold text-[#0f172a] mb-3">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-6 bg-[#0f172a] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold font-poppins mb-4">Get in Touch</h2>
          <p className="text-slate-300 mb-7">Find your ideal home tutor in Varanasi today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor+in+Varanasi."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-4 rounded-full transition-colors"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 border border-white/30 text-white hover:bg-white/10 font-semibold px-7 py-4 rounded-full transition-colors"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
