import React from 'react';
import { Link } from 'react-router-dom';
import './ContactSection.css';

const ContactSection = () => {
  return (
    <section className="contact-section">
      <div className="contact-container">
        <h2>Still have questions?</h2>
        <p>Can't find the answer you're looking for? Please chat to our friendly team.</p>
        <Link to="/contact" className="btn-primary">Get in Touch</Link>
      </div>
    </section>
  );
};

export default ContactSection;
