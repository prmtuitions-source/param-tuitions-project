import React from 'react';
import blogImg from '../images/personalized-learning.jpg';

export default function PersonalizedLearning() {
  return (
    <div className="individual-blog-container">
      <h1>The Importance of Personalized Learning</h1>
      <img src={blogImg} alt="Personalized Learning" />
      <p>Every student learns differently. Personalized learning tailors the educational experience to the unique needs and pace of each student.</p>
    </div>
  );
}