import React from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: [
      'Name, phone number, and email address when you submit an enquiry or register.',
      'Class, subject, location preferences, and board (CBSE/ICSE/UP Board) for tutor matching.',
      'Device and browser information collected automatically for analytics and security.',
      'Payment reference details where applicable (we do not store card numbers).',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'To match you with suitable verified tutors in your area.',
      'To contact you regarding your tuition enquiry, demo class, or booking.',
      'To send service updates, reminders, and relevant notifications (opt-out available).',
      'To improve our platform, detect fraud, and ensure security.',
      'We never sell your personal data to third parties.',
    ],
  },
  {
    title: '3. Data Sharing',
    content: [
      'Tutor profiles and basic contact details are shared with matched families only after confirmation.',
      'We use trusted third-party services (Supabase, Vercel, Google Analytics) that process data on our behalf under strict agreements.',
      'We may disclose data if required by law or to protect rights and safety.',
    ],
  },
  {
    title: '4. Data Security',
    content: [
      'All data is transmitted over HTTPS and stored in secured, encrypted databases.',
      'Access to personal data is restricted to authorised staff only.',
      'We conduct regular security reviews and follow industry best practices.',
      'Despite best efforts, no system is 100% secure — report concerns to us immediately.',
    ],
  },
  {
    title: '5. Cookies',
    content: [
      'We use essential cookies to keep you logged in and maintain session state.',
      'Analytics cookies (Google Analytics) help us understand how visitors use the site.',
      'You can disable cookies in your browser settings; some features may not function correctly.',
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      'Access: You can request a copy of the personal data we hold about you.',
      'Correction: You can ask us to correct inaccurate or incomplete data.',
      'Deletion: You can request deletion of your account and associated data.',
      'Opt-out: You can unsubscribe from marketing communications at any time.',
      'To exercise these rights, contact us at paramtuitionbureau@gmail.com.',
    ],
  },
  {
    title: '7. Children\'s Privacy',
    content: [
      'Our services are intended for parents and guardians on behalf of students.',
      'We do not knowingly collect personal data directly from children under 13.',
      'If you believe a child has submitted data without consent, contact us for immediate removal.',
    ],
  },
  {
    title: '8. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time.',
      'Significant changes will be communicated via email or a prominent notice on our site.',
      'Continued use of our services after changes constitutes acceptance of the updated policy.',
    ],
  },
  {
    title: '9. Contact Us',
    content: [
      'Param Tuition Bureau, Gandhi Nagar, Near Lathiya Chauraha, Varanasi, UP 221010.',
      'Email: paramtuitionbureau@gmail.com',
      'Phone: +91 87565 25373',
      'Hours: Mon–Sat 8:00 AM – 8:00 PM, Sun 10:00 AM – 2:00 PM',
    ],
  },
];

export default function Policy() {
  return (
    <div className="legal-policy-container" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a8a,#0f172a)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <p style={{ color: '#c9a84c', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '12px' }}>
          Legal
        </p>
        <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 900, marginBottom: '12px' }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 20px' }}>
          Last updated: May 2025 &nbsp;·&nbsp; Param Tuition Bureau, Varanasi
        </p>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto' }}>
          We respect your privacy and are committed to protecting your personal information. This policy explains what data we collect, how we use it, and your rights.
        </p>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: '48px 24px' }}>
        {SECTIONS.map((sec) => (
          <div key={sec.title} style={{ background: '#fff', borderRadius: '16px', padding: '28px 32px', marginBottom: '20px', boxShadow: '0 2px 12px rgba(15,23,42,0.06)', border: '1px solid #e8edf3' }}>
            <h3 style={{ color: '#1e3a8a', fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #e8edf3' }}>
              {sec.title}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {sec.content.map((point, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px', fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>
                  <span style={{ color: '#c9a84c', fontWeight: 900, flexShrink: 0, marginTop: '2px' }}>✓</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Footer nav */}
        <div style={{ textAlign: 'center', marginTop: '40px', padding: '24px', background: '#fff', borderRadius: '16px', border: '1px solid #e8edf3' }}>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
            Also read our <Link to="/terms" style={{ color: '#1e3a8a', fontWeight: 700 }}>Terms & Conditions</Link>
          </p>
          <Link to="/" style={{ display: 'inline-block', background: '#1e3a8a', color: '#c9a84c', fontWeight: 700, fontSize: '0.85rem', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
