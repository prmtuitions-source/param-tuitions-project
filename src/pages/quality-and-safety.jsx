import React from 'react';
import blogImg from '../images/quality-and-safety.jpg';

export default function QualityAndSafety() {
  return (
    <div className="individual-blog-container">
      <h1>How Param Tuition Bureau Ensures Quality and Safety</h1>
      <img src={blogImg} alt="Quality and Safety" />
      <p>We conduct thorough background checks and verification of all our tutors to ensure the safety of your child.</p>
    </div>
  );
}