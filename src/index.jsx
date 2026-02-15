import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './shared/styles/theme.css'; // Minimal theme variables
import './index.css'; // Tailwind entry
import './shared/styles/Home.css'; // Main site styles (restores image sizing and layout)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);