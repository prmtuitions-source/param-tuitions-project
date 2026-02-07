import React from 'react';
import blogImg from '../images/benefits-of-home-tuition.jpg';

export default function BenefitsOfHomeTuition() {
  return (
    <div className="individual-blog-container">
      <h1>Benefits of Home Tuition in India</h1>
      <img src={blogImg} alt="Benefits of Home Tuition" />
      <p>Home tuition has become an integral part of the Indian education system. With increasing competition and the need for personalized attention, more parents are opting for home tutors.</p>
      <h2>1. Personalized Attention</h2>
      <p>In a classroom of 40-50 students, it is impossible for a teacher to focus on every student. Home tuition bridges this gap by providing one-on-one attention.</p>
    </div>
  );
}