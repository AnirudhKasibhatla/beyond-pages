import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Check if we should show splash screen on first load
const shouldShowSplash = !sessionStorage.getItem('splashShown');
if (shouldShowSplash) {
  sessionStorage.setItem('splashShown', 'true');
  window.history.replaceState(null, '', '/splash');
}

createRoot(document.getElementById("root")!).render(<App />);
