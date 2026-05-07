import { MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'FAQ – Frequently Asked Questions | Param Tuition Bureau Varanasi',
  description:
    'Common questions about home tuition in Varanasi — fees, tutor matching, boards covered, demo classes and more. Answered by Param Tuition Bureau.',
  alternates: { canonical: 'https://www.paramtuitions.com/faq' },
};

const FAQS = {
  parent: [
    {
      q: 'How do I find a home tutor in Varanasi?',
      a: 'Contact Param Tuition Bureau on WhatsApp (+91 87565 25373) or call us. Tell us your area, class, subjects and board. We match you with a verified tutor within 24 hours and arrange a free demo class.',
    },
    {
      q: 'What subjects do you provide home tuition for?',
      a: 'We cover all major subjects: Mathematics, Physics, Chemistry, Biology, English, Hindi, Social Science, Sanskrit, Computer Science and more — for CBSE, ICSE and UP Board students from Class 1 through graduation.',
    },
    {
      q: 'How much does home tuition cost in Varanasi?',
      a: 'Fees typically range from ₹2,000–₹6,000 per month depending on the class, subject, board and tutor experience. We\'ll share exact pricing based on your specific requirements.',
    },
    {
      q: 'Can I request a female home tutor?',
      a: 'Yes. We have 1,500+ experienced female tutors available across Varanasi. Simply mention your preference when contacting us.',
    },
    {
      q: 'Is there a free demo class?',
      a: 'Yes, we arrange a free demo class so you can evaluate the tutor before committing. Most demos are arranged within 24–48 hours of your request.',
    },
    {
      q: 'Are the tutors background-checked?',
      a: 'Yes. Every tutor in our network undergoes identity verification and credential checks before joining. We prioritize your child\'s safety.',
    },
    {
      q: 'Which boards do your tutors cover?',
      a: 'Our tutors cover CBSE, ICSE, UP Board, Bihar Board and ISC. We also have specialists for NEET, JEE, NDA and other competitive exam preparation.',
    },
  ],
  teacher: [
    {
      q: 'How can I join Param Tuition Bureau as a tutor?',
      a: 'Register on our website using the "Join as Tutor" link. Submit your qualifications and location. After verification, you\'ll start receiving demo requests in your area.',
    },
    {
      q: 'Is there a registration fee for tutors?',
      a: 'No upfront registration fee is charged. Contact us for current fee details after your profile is verified.',
    },
    {
      q: 'How many tuition leads will I get?',
      a: 'The number of leads depends on your location, subjects and availability. Active tutors in high-demand areas like Lanka, Sigra and Durgakund get regular demo requests.',
    },
    {
      q: 'Can I teach online students too?',
      a: 'Yes. We connect tutors with both in-home and online tuition requests depending on student preference.',
    },
  ],
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [...FAQS.parent, ...FAQS.teacher].map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      <section className="bg-[#0f172a] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins mb-5">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Everything you need to know about home tuition in Varanasi with Param Tuition Bureau.
          </p>
        </div>
      </section>

      <section className="py-14 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-[#0f172a] font-poppins mb-7">For Parents & Students</h2>
          <div className="flex flex-col gap-5 mb-14">
            {FAQS.parent.map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-[#0f172a] mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-[#0f172a] font-poppins mb-7">For Tutors</h2>
          <div className="flex flex-col gap-5 mb-12">
            {FAQS.teacher.map(({ q, a }, i) => (
              <div key={i} className="border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-[#0f172a] mb-2">{q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          <div className="bg-green-50 border border-green-100 rounded-3xl p-7 text-center">
            <p className="text-green-900 font-semibold mb-4">Still have a question? We're here to help.</p>
            <a
              href="https://wa.me/918756525373?text=Hello%2C+I+have+a+question+about+home+tuition."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
            >
              <MessageCircle size={18} />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
