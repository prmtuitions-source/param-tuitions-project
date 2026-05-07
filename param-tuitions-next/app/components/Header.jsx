'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, MessageCircle, GraduationCap, Users } from 'lucide-react';
import logoSrc from '../../public/logo.webp';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/available-tuitions', label: 'Tuition Jobs' },
  { href: '/find-tutors', label: 'Find Tutors' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const PRIMARY_PHONE = '918756525373';
const PRIMARY_DISPLAY = '+91 87565 25373';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <Image
              src={logoSrc}
              alt="Param Tuition Bureau"
              width={100}
              height={100}
              className="h-11 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav — only on lg+ */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#0f172a] transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side — only on lg+ */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Direct login links — always visible */}
            <Link
              href="/login-parent"
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#0f172a] text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Users size={14} className="text-slate-400" />
              Parent Login
            </Link>
            <Link
              href="/login-teacher"
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#0f172a] text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <GraduationCap size={14} className="text-slate-400" />
              Teacher Login
            </Link>

            <div className="w-px h-5 bg-slate-200 mx-1" />

            <a
              href={`https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent('Hello, I need a home tutor in Varanasi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <Link
              href="/teacher-register"
              className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap"
            >
              Join as Tutor
            </Link>
          </div>

          {/* Mobile toggle — shows below lg */}
          <button
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      {open && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-4">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 font-medium hover:text-[#0f172a] hover:bg-slate-50 px-3 py-2.5 rounded-lg transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Login section */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Login</p>
            <div className="flex flex-col gap-1">
              <Link
                href="/login-parent"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                <Users size={15} className="text-slate-400" />
                Parent Login
              </Link>
              <Link
                href="/login-teacher"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
              >
                <GraduationCap size={15} className="text-slate-400" />
                Teacher Login
              </Link>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href={`https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent('Hello, I need a home tutor in Varanasi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-semibold"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
            <a
              href={`tel:+${PRIMARY_PHONE}`}
              className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold text-sm"
            >
              <Phone size={16} />
              {PRIMARY_DISPLAY}
            </a>
            <Link
              href="/teacher-register"
              className="flex items-center justify-center bg-[#0f172a] text-white py-3 rounded-xl font-semibold"
              onClick={() => setOpen(false)}
            >
              Join as Tutor
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
