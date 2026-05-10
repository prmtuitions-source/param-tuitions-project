import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-16 border-t border-slate-800">
      <div className="container mx-auto px-6 pb-10 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Column 1: Brand */}
        <div className="flex-1 flex flex-col gap-4">
          <Link to="/" className="inline-block">
            <img src="/logo.png" alt="Param Tuition Bureau" className="h-12 w-auto object-contain" />
          </Link>
          <p className="text-slate-400 text-sm leading-relaxed">
            Param Tuition Bureau is Varanasi's most trusted home tuition consultancy. 
            We connect students with verified and qualified tutors for all classes and boards.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-[#d4af37] uppercase tracking-wider">Quick Links</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm">Home</Link>
            <Link to="/about" className="text-slate-300 hover:text-white transition-colors text-sm">About Us</Link>
            <Link to="/available-tuitions" className="text-slate-300 hover:text-white transition-colors text-sm">Tuition Jobs</Link>
            <Link to="/teacher-register" className="text-slate-300 hover:text-white transition-colors text-sm">Join as Tutor</Link>
          </div>
        </div>

        {/* Column 3: Support */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-[#d4af37] uppercase tracking-wider">Support</h4>
          <div className="flex flex-col gap-2">
            <Link to="/contact" className="text-slate-300 hover:text-white transition-colors text-sm">Contact Us</Link>
            <Link to="/faq" className="text-slate-300 hover:text-white transition-colors text-sm">FAQ</Link>
            <Link to="/terms" className="text-slate-300 hover:text-white transition-colors text-sm">Terms & Conditions</Link>
            <Link to="/policy" className="text-slate-300 hover:text-white transition-colors text-sm">Privacy Policy</Link>
            <Link to="/blog" className="text-slate-300 hover:text-white transition-colors text-sm">Our Blog</Link>
          </div>
        </div>

        {/* Column 4: Get in Touch */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-[#d4af37] uppercase tracking-wider">Get in Touch</h4>
          <div className="flex flex-col gap-2">
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <svg className="w-4 text-[#d4af37]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="currentColor" />
                <path d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" fill="#071029" opacity="0.9" />
              </svg>
              Plot No. 466, Adgadanand Colony, Chauraha, Lathiya, Varanasi, Uttar Pradesh 221011
            </p>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <svg className="w-4 text-[#d4af37]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 01.95-.27c1.05.27 2.19.42 3.37.42a1 1 0 011 1V20a1 1 0 01-1 1C10.07 21 3 13.93 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.18.15 2.32.42 3.37a1 1 0 01-.27.95l-2.03 2.47z" fill="currentColor" />
              </svg>
              <a href="tel:+918756525373" className="hover:underline">+91 87565 25373</a>
            </p>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <svg className="w-4 text-[#d4af37]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor" />
              </svg>
              <a href="mailto:prmtuitions@gmail.com" className="hover:underline">prmtuitions@gmail.com</a>
            </p>
            
            <div className="flex gap-4 mt-2">
              <a href="https://www.facebook.com/share/185XTMNQ16/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 10-11.5 9.87v-6.98H8.9v-2.9h1.6V9.41c0-1.6.95-2.5 2.4-2.5.7 0 1.43.12 1.43.12v1.57h-.8c-.8 0-1.05.5-1.05 1.02v1.22h1.78l-.28 2.9h-1.5v6.98A10 10 0 0022 12"/></svg>
              </a>
              <a href="https://www.instagram.com/paramtuitionbureau?igsh=MWN4YTNvemt6djhhYw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6a5 5 0 100 10 5 5 0 000-10zm6.5-3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>
              </a>
              <a href="https://www.youtube.com/@paramtuitions" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-1-1.7-1-2.1-1.1C16.9 2.5 12 2.5 12 2.5h-.1s-4.9 0-8.6.3c-.4 0-1.4.1-2.1 1.1-.6.6-.8 2.3-.8 2.3S0 8 0 9.8v2.4C0 14 0.2 15.6 0.2 15.6s.2 1.6.8 2.3c.8 1 1.9 1 2.4 1.1 1.8.2 7.8.3 7.8.3s4.9 0 8.6-.3c.4 0 1.4-.1 2.1-1.1.6-.6.8-2.3.8-2.3s.2-1.6.2-3.4v-2.4c0-1.8-.2-3.6-.2-3.6zM9.8 15.1V8.9l6.2 3.1-6.2 3.1z"/></svg>
              </a>
              <a href="https://search.google.com/local/writereview?placeid=ChIJGUaAOleHXKURNd2BA618GVM" target="_blank" rel="noopener noreferrer" aria-label="Google Profile" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.74-.07-1.45-.2-2.14H12v4.05h5.38c-.23 1.25-.91 2.31-1.95 3.02v2.49h3.15c1.84-1.69 2.92-4.2 2.92-7.42z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.15-2.49c-.86.58-1.96.92-3.48.92-2.67 0-4.93-1.8-5.74-4.22H2.9v2.65C4.56 19.8 8 22 12 22z"/><path fill="#FBBC05" d="M6.26 13.77A6.02 6.02 0 016 12c0-.62.1-1.22.26-1.77V7.58H2.9A9.99 9.99 0 002 12c0 1.6.38 3.11 1.05 4.42l2.21-2.65z"/><path fill="#EA4335" d="M12 6.5c1.47 0 2.39.64 2.94 1.17l2.16-2.09C16.96 3.55 14.7 2.5 12 2.5 8 2.5 4.56 4.7 2.9 7.58l3.36 2.65C7.07 8.3 9.33 6.5 12 6.5z"/></svg>
              </a>
            </div>
            
            <div className="mt-4">
              <a href="https://search.google.com/local/writereview?placeid=ChIJGUaAOleHXKURNd2BA618GVM" target="_blank" rel="noopener noreferrer" className="inline-block bg-[#d4af37] text-[#071029] font-bold px-4 py-2 rounded-lg hover:opacity-90">
                Leave us a Review on Google
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-slate-800 py-6 text-center bg-[#0b1120]">
        <p className="text-slate-500 text-sm">&copy; {new Date().getFullYear()} Param Tuition Bureau. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
