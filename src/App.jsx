import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Screens
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import PredictorEngine from './pages/student/PredictorEngine';
import AdminDashboard from './pages/admin/AdminDashboard';

// 🛡️ STUDENT ROUTE GUARD
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cet_token');
  const userString = localStorage.getItem('cet_user');
  if (!token || token === 'null' || !userString || userString === 'null') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 👑 ADMIN ROUTE GUARD
const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('cet_token');
  const userString = localStorage.getItem('cet_user');
  if (!token || token === 'null' || !userString || userString === 'null') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 🌍 🎯 GLOBAL APPS WRAPPER LAYOUT (The Permanent Solution)
const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Login page par humein full layout (sidebar/footer) nahi chahiye, wo standalone achha lagta hai
  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#222222] font-sans antialiased flex flex-col justify-between">
      {/* Main Page Render Content */}
      <div className="flex-1">
        {children}
      </div>

      {/* 📜 Fixed Institutional Global Copyright Footer */}
      <footer className="w-full border-t border-slate-200/80 bg-white py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans font-semibold text-slate-500 shrink-0">
        <div>
          © 2026 MHT-CET Suite. All rights reserved.
        </div>
        <div className="flex items-center gap-4 mt-1 sm:mt-0 font-mono text-[10px] text-slate-400">
          <span>v4.4 Premium Stable</span>
          <span>&bull;</span>
          <span>Secure Cloud Connected Node</span>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          {/* Base Flow Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* 👤 Student Portal Module Scope */}
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

          {/* 👑 Admin Management Workspace Module Scope */}
          <Route path="/admin/dashboard" element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } />

          {/* Fallback Error Redirection Handling */}
          <Route path="*" element={<div className="p-20 text-center font-bold text-xl">404: Page Not Found</div>} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;