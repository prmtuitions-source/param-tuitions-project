import React from 'react';
import blogImg from '../images/career-opportunities-teachers.jpg';

export default function CareerOpportunities() {
  return (
    <div className="individual-blog-container">
      <h1>Career Opportunities for Teachers Beyond the Classroom</h1>
      <img src={blogImg} alt="Career Opportunities" />
      <p>Private tutoring offers flexible hours and great earning potential, making it an excellent career choice for educators.</p>
    </div>
  );
}