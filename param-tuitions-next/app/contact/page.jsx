import { Phone, MessageCircle, Mail, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Contact Us – Param Tuition Bureau | Home Tutors Varanasi',
  description:
    'Contact Param Tuition Bureau for home tuition in Varanasi. Call, WhatsApp or visit our office. Available Mon–Sun 8 AM–8 PM.',
  alternates: { canonical: 'https://www.paramtuitions.com/contact' },
};

const CONTACTS = [
  { digits: '918756525373', display: '+91 87565 25373', label: 'Admin 1 (Primary)' },
  { digits: '918858805373', display: '+91 88588 05373', label: 'Admin 2' },
  { digits: '919973725373', display: '+91 99737 25373', label: 'Enquiries' },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-[#0f172a] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins mb-5">Contact Us</h1>
          <p className="text-slate-300 text-lg max-w-xl">
            Reach out via WhatsApp, phone or email. We typically respond within a few hours.
          </p>
        </div>
      </section>

      <section className="py-14 px-6 bg-white">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Contact cards */}
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-bold text-[#0f172a] font-poppins">Get in Touch</h2>

            {CONTACTS.map(({ digits, display, label }) => (
              <div key={digits} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-[#d4af37]" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{label}</p>
                  <a href={`tel:+${digits}`} className="text-[#0f172a] font-bold text-lg hover:underline">{display}</a>
                  <div className="mt-2">
                    <a
                      href={`https://wa.me/${digits}?text=${encodeURIComponent('Hello, I need a home tutor in Varanasi.')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-green-600 font-semibold text-sm hover:underline"
                    >
                      <MessageCircle size={14} />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {/* Email */}
            <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center shrink-0">
                <Mail size={18} className="text-[#d4af37]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Email</p>
                <a href="mailto:prmtuitions@gmail.com" className="text-[#0f172a] font-semibold hover:underline">prmtuitions@gmail.com</a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-[#d4af37]" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">Office Address</p>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Gate No. 2, R K Puram, N 4/49-D,<br />
                  Dhirendra Mahila PG College Rd,<br />
                  Gandhi Nagar, Nandan Nagar, Karaundi,<br />
                  Varanasi, Uttar Pradesh – 221005
                </p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Param+Tuition+Bureau+Varanasi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-[#0f172a] font-semibold hover:underline"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          </div>

          {/* Hours + Quick contact */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#0f172a] rounded-3xl p-8 text-white">
              <h3 className="font-bold text-xl font-poppins mb-5">Office Hours</h3>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between border-b border-slate-700 pb-3">
                  <span className="text-slate-300">Monday – Friday</span>
                  <span className="font-semibold">8:00 AM – 8:00 PM</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-3">
                  <span className="text-slate-300">Saturday</span>
                  <span className="font-semibold">9:00 AM – 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Sunday</span>
                  <span className="font-semibold">10:00 AM – 5:00 PM</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-5">WhatsApp messages are answered even outside office hours.</p>
            </div>

            <div className="bg-green-50 rounded-3xl p-7 border border-green-100">
              <h3 className="font-bold text-green-900 mb-3">Fastest Way to Reach Us</h3>
              <p className="text-green-800 text-sm mb-5 leading-relaxed">
                Send us a WhatsApp message with your location, class and subject. We'll match you with available tutors within hours.
              </p>
              <a
                href="https://wa.me/918756525373?text=Hello%2C+I+need+a+home+tutor+in+Varanasi."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full transition-colors"
              >
                <MessageCircle size={18} />
                Start WhatsApp Chat
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
