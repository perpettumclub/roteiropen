import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// VERSÃO 2.0 - DEBUG
console.log('%c ROTEIROPEN SECURITY UPDATE 2.0 - LOADED ', 'background: #222; color: #bada55; font-size: 20px');
console.log('Environment Mode:', import.meta.env.MODE);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
