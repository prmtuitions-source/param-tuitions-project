import React from 'react';
import blogImg from '../images/online-vs-offline-tuition.jpg';

export default function OnlineVsOffline() {
  return (
    <div className="individual-blog-container">
      <h1>Online vs Offline Tuition: Finding the Right Balance</h1>
      <img src={blogImg} alt="Online vs Offline" />
      <p>Both modes have their pros and cons. Offline offers personal touch, while online offers convenience.</p>
    </div>
  );
}