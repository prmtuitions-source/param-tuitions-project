import React from 'react';
import heroImg from '../../assets/home-tuition-varanasi-student-studying.png';

export default function LottieHero() {
  return (
    <section className="lottie-hero-section">
      <div className="lottie-container">
        {/* heroAnim.json not found — falling back to static hero image */}
        <img src={heroImg} alt="Hero" style={{ width: '100%', borderRadius: 16 }} />
      </div>
    </section>
  );
}
