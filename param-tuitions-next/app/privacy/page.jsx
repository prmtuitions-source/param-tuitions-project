import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | Param Tuition Bureau',
  description: 'Privacy Policy for Param Tuition Bureau, Varanasi. Learn how we collect, use, and protect your personal data.',
  alternates: { canonical: 'https://www.paramtuitions.com/privacy' },
};

const SECTIONS = [
  {
    title: '1. Information We Collect',
    items: [
      'Name, phone number, and email address when you submit an enquiry or register.',
      'Class, subject, location preferences, and board (CBSE/ICSE/UP Board) for tutor matching.',
      'Device and browser information collected automatically for analytics and security.',
      'Payment reference details where applicable (we do not store card numbers).',
    ],
  },
  {
    title: '2. How We Use Your Information',
    items: [
      'To match you with suitable verified tutors in your area.',
      'To contact you regarding your tuition enquiry, demo class, or booking.',
      'To send service updates, reminders, and relevant notifications (opt-out available).',
      'To improve our platform, detect fraud, and ensure security.',
      'We never sell your personal data to third parties.',
    ],
  },
  {
    title: '3. Data Sharing',
    items: [
      'Tutor profiles and basic contact details are shared with matched families only after confirmation.',
      'We use trusted third-party services (Supabase, Vercel, Google Analytics) that process data on our behalf under strict agreements.',
      'We may disclose data if required by law or to protect rights and safety.',
    ],
  },
  {
    title: '4. Data Security',
    items: [
      'All data is transmitted over HTTPS and stored in secured, encrypted databases.',
      'Access to personal data is restricted to authorised staff only.',
      'We conduct regular security reviews and follow industry best practices.',
      'Despite best efforts, no system is 100% secure — report concerns to us immediately.',
    ],
  },
  {
    title: '5. Cookies',
    items: [
      'We use essential cookies to keep you logged in and maintain session state.',
      'Analytics cookies (Google Analytics) help us understand how visitors use the site.',
      'You can disable cookies in your browser settings; some features may not function correctly.',
    ],
  },
  {
    title: '6. Your Rights',
    items: [
      'Access: You can request a copy of the personal data we hold about you.',
      'Correction: You can ask us to correct inaccurate or incomplete data.',
      'Deletion: You can request deletion of your account and associated data.',
      'Opt-out: You can unsubscribe from marketing communications at any time.',
      'To exercise these rights, contact us at paramtuitionbureau@gmail.com.',
    ],
  },
  {
    title: "7. Children's Privacy",
    items: [
      'Our services are intended for parents and guardians on behalf of students.',
      'We do not knowingly collect personal data directly from children under 13.',
      'If you believe a child has submitted data without consent, contact us for immediate removal.',
    ],
  },
  {
    title: '8. Changes to This Policy',
    items: [
      'We may update this Privacy Policy from time to time.',
      'Significant changes will be communicated via email or a prominent notice on our site.',
      'Continued use of our services after changes constitutes acceptance of the updated policy.',
    ],
  },
  {
    title: '9. Contact Us',
    items: [
      'Param Tuition Bureau, Gandhi Nagar, Near Lathiya Chauraha, Varanasi, UP 221010.',
      'Email: paramtuitionbureau@gmail.com',
      'Phone: +91 87565 25373',
      'Hours: Mon–Sat 8:00 AM – 8:00 PM, Sun 10:00 AM – 2:00 PM',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <section className="bg-[#0f172a] py-16 px-6 text-center">
        <p className="text-[#d4af37] font-bold text-xs uppercase tracking-widest mb-3">Legal</p>
        <h1 className="text-4xl md:text-5xl font-extrabold font-poppins text-white mb-3">
          Privacy Policy
        </h1>
        <p className="text-slate-400 text-sm mb-2">
          Last updated: May 2025 &nbsp;·&nbsp; Param Tuition Bureau, Varanasi
        </p>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          We respect your privacy and are committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
        </p>
      </section>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-5">
        {SECTIONS.map(sec => (
          <div key={sec.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-[#1e3a8a] text-sm font-extrabold uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
              {sec.title}
            </h3>
            <ul className="space-y-3">
              {sec.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                  <span className="text-[#d4af37] font-black shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer nav */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
          <p className="text-slate-500 text-sm mb-4">
            Also read our{' '}
            <Link href="/terms" className="text-[#1e3a8a] font-bold">Terms & Conditions</Link>
          </p>
          <Link href="/" className="inline-block bg-[#0f172a] text-[#d4af37] font-bold text-sm px-6 py-2.5 rounded-lg">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
