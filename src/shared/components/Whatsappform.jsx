import React, { useState } from 'react';
import '../styles/WhatsappForm.css';

const WhatsappForm = () => {
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [classGrade, setClassGrade] = useState('');
    const [address, setAddress] = useState('');
    const adminPhoneNumber = '918756525373'; // Admin 2's number

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const message = `*Free Demo Class Enquiry*%0A%0A*Name:* ${name}%0A*Mobile:* ${mobile}%0A*Class/Grade:* ${classGrade}%0A*Address/Requirements:* ${address}`;
        
        const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${message}`;
        
        if (typeof globalThis !== 'undefined' && typeof globalThis.open === 'function') {
            globalThis.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        } else if (typeof location !== 'undefined') {
            location.href = whatsappUrl;
        }
    };

    return (
        <section className="demo-section">
            <div className="container">
                <h2 className="section-title">Get a Free Demo Class</h2>
                <div className="underline"></div>

                <div className="form-wrapper">
                    <div className="form-card">
                        <form id="enquiry-form" onSubmit={handleSubmit}>
                            <input type="text" id="name" placeholder="Student/Parent Name" required value={name} onChange={(e) => setName(e.target.value)} />
                            <input type="tel" id="mobile" placeholder="Mobile Number" required value={mobile} onChange={(e) => setMobile(e.target.value)} />
                            
                            <select id="class-grade" required value={classGrade} onChange={(e) => setClassGrade(e.target.value)}>
                                <option value="" disabled>Select Class/Grade</option>
                                <option value="Class 1-5">Class 1-5</option>
                                <option value="Class 6-8">Class 6-8</option>
                                <option value="Class 9-10">Class 9-10</option>
                                <option value="Class 11-12">Class 11-12</option>
                            </select>

                            <textarea id="address" placeholder="Your Address or Specific Requirements" rows="4" value={address} onChange={(e) => setAddress(e.target.value)}></textarea>
                            
                            <button type="submit" className="btn-submit">Book My Free Demo</button>
                        </form>
                    </div>

                    <div className="contact-info">
                        <h3>Quick Connect</h3>
                        <p>Have questions? Reach out to us directly via Call or WhatsApp for instant support.</p>
                        
                        <a href={`tel:+${adminPhoneNumber}`} className="btn-connect btn-call">
                            <span>📞</span> Call Now: +{adminPhoneNumber.slice(0, 2)} {adminPhoneNumber.slice(2, 7)} {adminPhoneNumber.slice(7)}
                        </a>

                        <a href={`https://wa.me/${adminPhoneNumber}`} className="btn-connect btn-whatsapp" target="_blank" rel="noopener noreferrer">
                            <span>💬</span> Chat on WhatsApp
                        </a>

                        <div className="office-location">
                            <span>📍</span>
                            <p><strong>Office:</strong> Plot No. 466, Adgadanand Colony, Lathiya Chauraha, Varanasi (UP) 221011</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhatsappForm;
