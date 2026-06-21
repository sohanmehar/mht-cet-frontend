import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder standard screens for system compilation verification
import Login from './pages/Login';
import StudentDashboard from './pages/student/StudentDashboard';
import PredictorEngine from './pages/student/PredictorEngine';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <Routes>
          {/* Base Flow Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Student Portal Module Scope */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/predict" element={<PredictorEngine />} />

          {/* Admin Management Workspace Module Scope */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Fallback Error Redirection Handling */}
          <Route path="*" element={<div className="p-20 text-center font-bold text-xl">404: Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;