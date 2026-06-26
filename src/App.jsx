import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';

// Placeholder standard screens for system compilation verification
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import PredictorEngine from './pages/student/PredictorEngine';
import AdminDashboard from './pages/admin/AdminDashboard';

// 🛡️ 1. STUDENT ROUTE GUARD: Blocks access if token is completely missing
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cet_token');
  const userString = localStorage.getItem('cet_user');

  // Strict check: Agar user logged in nahi hai, toh hi login par bhejo
  if (!token || token === 'null' || !userString || userString === 'null') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// 👑 2. ADMIN ROUTE GUARD: Safe parsing with absolute validation
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cet_token');
  const userString = localStorage.getItem('cet_user');

  if (!token || token === 'null' || !userString || userString === 'null') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <Routes>
          {/* Base Flow Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 🔓 Public Route: Ispe koi guard nahi lagega, ye hamesha khulega */}
          <Route path="/login" element={<Login />} />

          {/* 👤 Student Portal Module Scope - INSULATED */}
          <Route path="/student/dashboard" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/student/predict" element={
            <ProtectedRoute>
              <PredictorEngine />
            </ProtectedRoute>
          } />

          {/* 👑 Admin Management Workspace Module Scope - INSULATED */}
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />

          {/* Fallback Error Redirection Handling */}
          <Route path="*" element={<div className="p-20 text-center font-bold text-xl">404: Page Not Found</div>} />
        </Routes>
        <SpeedInsights />
      </div>
    </Router>
  );
}

export default App;