'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const CLASSES = ['Nursery','KG','Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12','Graduation','Competition Exam'];
const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Hindi','History','Geography','Accountancy','Economics','Computer Science','Sanskrit','All Subjects'];

export default function EnquiryForm() {
  const [form, setForm] = useState({ name: '', phone: '', cls: '', subject: '', area: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Hello Param Tuition Bureau,\n\nI need a home tutor.\n\nName: ${form.name}\nPhone: ${form.phone}\nClass: ${form.cls}\nSubject: ${form.subject}\nArea: ${form.area}, Varanasi\n\nPlease help me find a tutor.`;
    window.open(`https://wa.me/918756525373?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm mx-auto border border-slate-100"
    >
      <h3 className="text-lg font-bold text-[#0f172a] font-poppins mb-1">Book Free Demo Class</h3>
      <p className="text-xs text-slate-500 mb-4">Fill in details — we'll WhatsApp you within 1 hour</p>

      <div className="flex flex-col gap-3">
        <input
          required
          placeholder="Parent / Student Name"
          value={form.name}
          onChange={set('name')}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]"
        />
        <input
          required
          type="tel"
          placeholder="WhatsApp Number"
          value={form.phone}
          onChange={set('phone')}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]"
        />
        <select
          required
          value={form.cls}
          onChange={set('cls')}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] text-slate-600"
        >
          <option value="">Select Class</option>
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          required
          value={form.subject}
          onChange={set('subject')}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] text-slate-600"
        >
          <option value="">Select Subject</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input
          required
          placeholder="Your Area / Locality"
          value={form.area}
          onChange={set('area')}
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37]"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          <MessageCircle size={16} />
          Send on WhatsApp
        </button>
      </div>
    </form>
  );
}
