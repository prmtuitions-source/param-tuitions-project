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
            <Link to="/blog" className="text-slate-300 hover:text-white transition-colors text-sm">Our Blog</Link>
          </div>
        </div>

        {/* Column 4: Get in Touch */}
        <div className="flex-1 flex flex-col gap-4">
          <h4 className="text-lg font-bold text-[#d4af37] uppercase tracking-wider">Get in Touch</h4>
          <div className="flex flex-col gap-2">
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <i className="fas fa-map-marker-alt text-[#d4af37] w-4 text-center"></i> Plot No. 466, Adgadanand Colony, Chauraha, Lathiya, Varanasi, Uttar Pradesh 221011
            </p>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <i className="fas fa-phone-alt text-[#d4af37] w-4 text-center"></i> +91 87565 25373
            </p>
            <p className="text-slate-300 text-sm flex items-center gap-2">
              <i className="fas fa-envelope text-[#d4af37] w-4 text-center"></i> prmtuitions@gmail.com
            </p>
            
            <div className="flex gap-4 mt-2">
              <a href="https://www.facebook.com/share/185XTMNQ16/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://www.instagram.com/paramtuitionbureau?igsh=MWN4YTNvemt6djhhYw==" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.youtube.com/@paramtuitions" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <i className="fab fa-youtube"></i>
              </a>
              <a href="https://share.google/6DnNjVQeSpsf5mLub" target="_blank" rel="noopener noreferrer" aria-label="Google Profile" className="text-slate-400 hover:text-[#d4af37] transition-colors text-[20px]">
                <i className="fab fa-google"></i>
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