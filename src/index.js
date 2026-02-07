import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/ParamTheme.css'; // Load variables first
import './styles/Home.css';       // Load Tailwind directives second

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);