import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldAlert, KeyRound, Smartphone } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  // Role toggles state monitor
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Form input field state trackers
  const [formData, setFormData] = useState({ identifier: '', securityPin: '' });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Static simulation system redirection path router logic
    if (isAdmin) {
      console.log("Admin parameters authenticating...", formData);
      navigate('/admin/dashboard');
    } else {
      console.log("Student parameters registering session...", formData);
      navigate('/student/predict');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
        
        {/* Branding Headers */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            MHT-CET Predictor
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Smart Choice-Form Optimization Portal
          </p>
        </div>

        {/* Dynamic Dual Role Toggler Layout Tabs */}
        <div className="flex rounded-lg bg-slate-950/60 p-1 border border-white/5">
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${!isAdmin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Smartphone className="h-4 w-4" /> Student Portal
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${isAdmin ? 'bg-red-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <ShieldAlert className="h-4 w-4" /> Admin Access
          </button>
        </div>

        {/* Input Interactive Fields Form UI */}
        <form className="mt-6 space-y-6" onSubmit={handleFormSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {isAdmin ? "Admin Username / Email" : "Mobile Number / Google Account"}
              </label>
              <input
                name="identifier"
                type={isAdmin ? "text" : "tel"}
                required
                value={formData.identifier}
                onChange={handleInputChange}
                placeholder={isAdmin ? "admin@mahacet.org" : "Enter 10-digit mobile number"}
                className="w-full rounded-lg bg-slate-900/50 border border-slate-700 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {isAdmin ? "Master Security Pin" : "OTP Code Verification"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <KeyRound className="h-4 w-4" />
                </div>
                <input
                  name="securityPin"
                  type="password"
                  required
                  value={formData.securityPin}
                  onChange={handleInputChange}
                  placeholder="••••••"
                  className="w-full rounded-lg bg-slate-900/50 border border-slate-700 pl-10 p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Action Call Submit Button */}
          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white transition-all shadow-md active:scale-98 ${isAdmin ? 'bg-red-600 hover:bg-red-700 shadow-red-900/30' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/30'}`}
            >
              Secure Login →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}