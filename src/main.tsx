import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Splash screen logic is handled in App.tsx

createRoot(document.getElementById("root")!).render(<App />);
