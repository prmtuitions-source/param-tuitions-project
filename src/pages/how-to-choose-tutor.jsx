import React from 'react';
import blogImg from '../images/choose-right-tutor.jpg';

export default function HowToChooseTutor() {
  return (
    <div className="individual-blog-container">
      <h1>How Parents Can Choose the Right Tutor</h1>
      <img src={blogImg} alt="Choose Tutor" />
      <p>Look for qualifications, experience, and a teaching style that matches your child's learning preference.</p>
    </div>
  );
}