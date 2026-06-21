import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; 
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 🎯 WRAP THE ACTIVE APP ENGINE WITH GOOGLE AUTH CREDENTIAL PROVIDERS */}
    <GoogleOAuthProvider clientId="1068913390921-s1g7qo9j4512nur1fs5nt221c8s6edn2.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
);