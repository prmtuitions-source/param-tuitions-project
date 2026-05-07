'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, MessageCircle, ChevronDown, GraduationCap, Users } from 'lucide-react';
import logoSrc from '../../public/logo.webp';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/available-tuitions', label: 'Tuition Jobs' },
  { href: '/find-tutors', label: 'Find Tutors' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

const LOGIN_LINKS = [
  { href: '/login-parent', label: 'Parent Login', icon: Users },
  { href: '/login-teacher', label: 'Teacher Login', icon: GraduationCap },
];

const PRIMARY_PHONE = '918756525373';
const PRIMARY_DISPLAY = '+91 87565 25373';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const loginRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setLoginOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src={logoSrc}
              alt="Param Tuition Bureau"
              width={100}
              height={100}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#0f172a] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {/* Login dropdown */}
            <div className="relative" ref={loginRef}>
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className="flex items-center gap-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Login
                <ChevronDown size={13} className={`transition-transform ${loginOpen ? 'rotate-180' : ''}`} />
              </button>
              {loginOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-50">
                  {LOGIN_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setLoginOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Icon size={14} className="text-slate-400" />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <a
              href={`https://wa.me/${PRIMARY_PHONE}?text=${encodeURIComponent('Hello, I need a home tutor in Varanasi.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
            <Link
              href="/teacher-register"
              className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Join as Tutor
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-6 pt-4">
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-slate-700 font-medium hover:text-[#0f172a]"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile login links */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Login</p>
            <div className="flex flex-col gap-2">
              {LOGIN_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 border border-slate-200 text-slate-700 py-2.5 px-4 rounded-xl text-sm font-medium"
                >
                  <Icon size={15} className="text-slate-400" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
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
              className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-3 rounded-xl font-semibold"
            >
              <Phone size={18} />
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
