'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck, GraduationCap, AlertTriangle, BadgeIndianRupee,
  Calendar, Ban, MessageCircle, Scale, Users, Wallet,
  ClipboardList, UserX, CheckCircle,
} from 'lucide-react';

const PARENT_TERMS = [
  {
    number: '1', icon: ShieldCheck, title: 'Scope of Service', color: 'blue',
    content: 'Param Tuition Bureau acts as a facilitator between parents and verified teachers, managing allocation, demo coordination, and ongoing support throughout your engagement.',
  },
  {
    number: '2', icon: GraduationCap, title: 'Demo Class Policy', color: 'purple',
    points: [
      'Demos are arranged only after official Bureau confirmation.',
      'Private demos without Bureau approval are strictly prohibited.',
    ],
  },
  {
    number: '3', icon: BadgeIndianRupee, title: 'Fee & Payment Policy', color: 'gold', badge: 'Strict',
    points: [
      'NO payment should be made directly to the teacher.',
      "The first month's tuition fee is collected ONLY by the Bureau.",
      "Direct payments are outside the Bureau's responsibility and protection.",
    ],
  },
  {
    number: '4', icon: Calendar, title: 'Attendance & Leaves', color: 'teal',
    content: 'Teachers are entitled to one holiday per month. Additional leave requests must be logged in your Parent Account for proper tracking and compensation.',
  },
  {
    number: '5', icon: Ban, title: 'Prohibited Direct Dealing', color: 'red',
    content: 'Parents are strictly prohibited from arranging extra tuition or additional subjects directly with the teacher. Please contact the Bureau for all new requirements.',
  },
  {
    number: '6', icon: MessageCircle, title: 'Communication', color: 'indigo',
    content: 'All queries must be raised via the Parent Dashboard. Do not attempt to resolve service disputes directly with the teacher.',
  },
  {
    number: '7', icon: Scale, title: 'Governing Law', color: 'gray',
    content: 'These terms are governed by the laws of India. All disputes are subject to local court jurisdiction in Varanasi.',
  },
];

const TUTOR_TERMS = [
  {
    number: '1', icon: Users, title: 'Registration & Access', color: 'blue',
    highlight: { label: 'Annual Membership Fee', value: '₹299', note: 'Non-refundable once leads are shared.' },
  },
  {
    number: '2', icon: Wallet, title: 'Consultancy & Commission', color: 'gold',
    highlight: { label: 'Service Commission', value: '50% (First Month)', note: 'Payout: 50% paid daily 8:00 PM – 11:00 PM. No payment queries before 8:00 PM.' },
  },
  {
    number: '3', icon: AlertTriangle, title: 'Strict Code of Conduct', color: 'red', badge: 'Critical',
    points: [
      'Direct dealing with parents = Permanent Blacklist.',
      'False documentation = Immediate Termination.',
      'Punctuality & professionalism are mandatory.',
    ],
  },
  {
    number: '4', icon: ClipboardList, title: 'Dashboard Responsibility', color: 'teal',
    content: 'Teachers are responsible for daily monitoring of their dashboard for leads, updates, and wallet status.',
    footer: 'Violation of terms results in account suspension & forfeiture of dues.',
  },
];

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'text-blue-600',   num: 'bg-blue-600',   dot: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600', num: 'bg-purple-600', dot: 'bg-purple-500' },
  gold:   { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'text-amber-600',  num: 'bg-amber-500',  dot: 'bg-amber-400' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   icon: 'text-teal-600',   num: 'bg-teal-600',   dot: 'bg-teal-500' },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'text-red-600',    num: 'bg-red-600',    dot: 'bg-red-500' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600', num: 'bg-indigo-600', dot: 'bg-indigo-500' },
  gray:   { bg: 'bg-gray-50',   border: 'border-gray-200',   icon: 'text-gray-600',   num: 'bg-gray-600',   dot: 'bg-gray-500' },
};

function ClauseCard({ clause }) {
  const c = COLOR_MAP[clause.color];
  const Icon = clause.icon;
  return (
    <div className={`relative bg-white rounded-2xl border ${c.border} shadow-sm overflow-hidden`}>
      <div className={`h-1 w-full ${c.num}`} />
      <div className="p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="shrink-0 flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-xl ${c.num} flex items-center justify-center text-white text-xs font-bold`}>
              {clause.number}
            </div>
            <div className={`w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
              <Icon size={15} className={c.icon} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h3 className="font-bold text-slate-800 text-base">{clause.title}</h3>
              {clause.badge && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  clause.badge === 'Strict' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                  'bg-red-100 text-red-700 border border-red-300'
                }`}>⚠️ {clause.badge}</span>
              )}
            </div>
            {clause.highlight && (
              <div className={`${c.bg} border ${c.border} rounded-xl p-3 mb-3`}>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{clause.highlight.label}</div>
                <div className={`text-xl font-bold ${c.icon}`}>{clause.highlight.value}</div>
                {clause.highlight.note && <p className="text-xs text-gray-500 mt-1">{clause.highlight.note}</p>}
              </div>
            )}
            {clause.content && <p className="text-gray-600 text-sm leading-relaxed">{clause.content}</p>}
            {clause.points && (
              <ul className="space-y-2">
                {clause.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className={`mt-1 w-4 h-4 rounded-full ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            )}
            {clause.footer && (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700 font-medium">{clause.footer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TermsPage() {
  const [tab, setTab] = useState('parents');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <section className="bg-[#0f172a] py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle, #C9A84C 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.1)] text-[#d4af37] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-5">
            <ShieldCheck size={13} /> Legal · Terms &amp; Conditions
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-poppins text-white leading-tight mb-3">
            Terms &amp; Conditions
          </h1>
          <div className="w-16 h-1 rounded-full mx-auto mb-4" style={{ background: 'linear-gradient(to right,#d4af37,#c9a84c)' }} />
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Param Tuition Bureau · Standard Service Agreement. Registration or use of our services implies full acceptance of these terms.
          </p>
          <p className="text-slate-600 text-xs mt-3">
            Effective Date: May 2025 &nbsp;|&nbsp; Jurisdiction: Varanasi, India
          </p>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex">
            {[
              { key: 'parents', label: 'For Parents & Students', Icon: Users },
              { key: 'tutors',  label: 'For Tutors',             Icon: GraduationCap },
            ].map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all duration-200 ${
                  tab === key ? 'border-[#d4af37] text-[#c9a84c]' : 'border-transparent text-gray-500 hover:text-slate-700 hover:border-gray-300'
                }`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {tab === 'parents' && (
          <div>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-xl">For Parents &amp; Students</h2>
                <p className="text-xs text-gray-500">Param Tuition Bureau · Standard Service Agreement</p>
              </div>
            </div>
            <div className="space-y-4">
              {PARENT_TERMS.map(clause => <ClauseCard key={clause.number} clause={clause} />)}
            </div>
            <div className="mt-8 rounded-2xl p-6 text-center bg-[#0f172a]">
              <CheckCircle size={28} className="mx-auto mb-3" style={{ color: '#d4af37' }} />
              <p className="text-white font-semibold text-sm mb-1">Agreement Confirmation</p>
              <p className="text-gray-400 text-xs max-w-md mx-auto">
                By using our services, you confirm you have read and agreed to these Terms &amp; Conditions.
              </p>
            </div>
          </div>
        )}

        {tab === 'tutors' && (
          <div>
            <div className="flex items-center gap-3 mb-7">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#c9a84c' }}>
                <GraduationCap size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-xl">For Tutors</h2>
                <p className="text-xs text-gray-500">Param Tuition Bureau · Teacher Guidelines</p>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 flex items-start gap-3 mb-6">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm font-medium">
                Registration on the Param Tuition Bureau platform implies full acceptance of the following rules.
              </p>
            </div>
            <div className="space-y-4">
              {TUTOR_TERMS.map(clause => <ClauseCard key={clause.number} clause={clause} />)}
            </div>
            <div className="mt-8 rounded-2xl p-6 text-center border border-red-700" style={{ background: 'rgba(127,29,29,0.9)' }}>
              <UserX size={28} className="text-red-300 mx-auto mb-3" />
              <p className="text-white font-semibold text-sm mb-1">Zero Tolerance Policy</p>
              <p className="text-red-200 text-xs max-w-md mx-auto">
                Any violation — including direct dealing with parents or false documentation — results in immediate permanent blacklisting and forfeiture of all pending dues.
              </p>
            </div>
            <div className="mt-4 rounded-2xl p-6 text-center bg-[#0f172a]">
              <CheckCircle size={28} className="mx-auto mb-3" style={{ color: '#d4af37' }} />
              <p className="text-white font-semibold text-sm mb-1">Agreement Confirmation</p>
              <p className="text-gray-400 text-xs max-w-md mx-auto">
                By registering on our platform, you confirm you have read, understood, and agreed to these Teacher Guidelines.
              </p>
            </div>
          </div>
        )}

        {/* Contact strip */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-800 text-sm">Questions about these terms?</p>
            <p className="text-gray-500 text-xs mt-0.5">Our team is available Mon–Sat 8AM–8PM</p>
          </div>
          <div className="flex gap-3">
            <a href="tel:+918756525373"
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold"
              style={{ borderColor: '#d4af37', background: '#fffbeb', color: '#92400e' }}>
              📞 87565 25373
            </a>
            <a href="https://wa.me/918756525373?text=Hi%2C+I+have+a+query+about+the+Terms+%26+Conditions."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold"
              style={{ background: '#25D366' }}>
              WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-3">
            Also read our{' '}
            <Link href="/privacy" className="font-semibold text-[#1e3a8a]">Privacy Policy</Link>
          </p>
          <Link href="/" className="inline-block text-sm font-bold px-6 py-2 rounded-lg text-[#d4af37] bg-[#0f172a]">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
