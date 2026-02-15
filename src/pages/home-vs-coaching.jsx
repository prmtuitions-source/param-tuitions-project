import React from 'react';
import blogImg from '../images/home-tuition-vs-coaching.jpg';

export default function HomeVsCoaching() {
  return (
    <div className="individual-blog-container">
      <h1>Home Tuition vs Coaching Institutes: Which is Better?</h1>
      <img src={blogImg} alt="Home vs Coaching" />
      <p>While coaching institutes offer a competitive environment, home tuition offers personalized care. The choice depends on the student's needs.</p>
    </div>
  );
}