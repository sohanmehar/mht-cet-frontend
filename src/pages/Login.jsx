import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ShieldAlert, Smartphone, Mail, User, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'SIGNUP' | 'OTP_VERIFY'
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', otpCode: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setAuthError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        idToken: credentialResponse.credential
      });
      if (response.data?.success) {
        localStorage.setItem('cet_token', response.data.token);
        localStorage.setItem('cet_user', JSON.stringify(response.data.user));
        navigate('/student/predict');
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Google identification handshake rejected.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);

    try {
      if (isAdmin) {
        navigate('/admin/dashboard');
        return;
      }

      if (authMode === 'LOGIN') {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        if (response.data?.success) {
          localStorage.setItem('cet_token', response.data.token);
          localStorage.setItem('cet_user', JSON.stringify(response.data.user));
          navigate('/student/predict');
        }
      } else if (authMode === 'SIGNUP') {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        if (response.data?.success) {
          setAuthSuccess('Verification token blasted to your inbox!');
          setAuthMode('OTP_VERIFY');
        }
      } else if (authMode === 'OTP_VERIFY') {
        const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
          email: formData.email,
          otp: formData.otpCode
        });
        if (response.data?.success) {
          localStorage.setItem('cet_token', response.data.token);
          localStorage.setItem('cet_user', JSON.stringify(response.data.user));
          navigate('/student/predict');
        }
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Authentication sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-800 overflow-hidden selection:bg-blue-500/20">
      
      {/* 🏙️ LEFT HALF: CLEAN DTE METRIC WRAPPER BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative border-r border-slate-200/60 bg-[#F3F4F6]/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#EBF4FF,transparent_55%)] opacity-70"></div>
        
        <div className="flex items-center gap-2.5 relative z-10 font-bold text-base tracking-tight text-slate-900">
          <div className="h-8 w-8 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-sans font-black uppercase tracking-wider text-xs text-slate-700">MHT-CET Suite</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-black text-[#0B2545] leading-tight tracking-tight uppercase">
            Predictive <br/>
            <span className="text-blue-600 font-extrabold">Counselling</span> <br/>Matrix
          </h1>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Execute complex CAP choice-form simulations, analyze dynamic structural cutoffs loops, and insulation tracking powered by database layer variables synchronization.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-100/60 border border-slate-200/80 rounded-2xl shadow-sm">
              <div className="text-lg font-black text-slate-900">10K+</div>
              <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mt-1">Simulations Run</div>
            </div>
            <div className="p-4 bg-slate-100/60 border border-slate-200/80 rounded-2xl shadow-sm">
              <div className="text-lg font-black text-blue-600">100%</div>
              <div className="text-[9px] font-bold uppercase text-slate-500 tracking-wider mt-1">DTE Scrutiny Match</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono font-bold text-slate-400 relative z-10 tracking-wider">
          Secure Core Workspace Platform Layer &bull; v4.4 Stable
        </div>
      </div>

      {/* 🔓 RIGHT HALF: THE CLEAN PROFESSIONAL CARD INTERFACE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl relative z-10">
          
          <div className="space-y-1.5 text-center lg:text-left">
            <h3 className="text-xl font-black text-[#0B2545] tracking-tight uppercase">
              {authMode === 'LOGIN' ? 'Welcome Back Officer' : authMode === 'SIGNUP' ? 'Initialize Cadet Portal' : 'Verification Scrutiny Check'}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {authMode === 'LOGIN' ? 'Access your automated structural dashboard parameters.' : authMode === 'SIGNUP' ? 'Create a secure isolated profile space on cloud server.' : 'Input the 6-digit verification code sent via Brevo.'}
            </p>
          </div>

          {/* Role Choice Switcher Tabs */}
          {authMode !== 'OTP_VERIFY' && (
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 shadow-inner">
              <button type="button" onClick={() => { setIsAdmin(false); setAuthMode('LOGIN'); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!isAdmin ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                <Smartphone className="h-3.5 w-3.5" /> Student Portal
              </button>
              <button type="button" onClick={() => { setIsAdmin(true); setAuthMode('LOGIN'); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${isAdmin ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
                <ShieldAlert className="h-3.5 w-3.5" /> Admin Access
              </button>
            </div>
          )}

          {authError && <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-mono text-center animate-fadeIn">{authError}</div>}
          {authSuccess && <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 rounded-xl text-xs font-mono text-center animate-fadeIn">{authSuccess}</div>}

          {/* SMART INLINE TRANSITION CORE FORM */}
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {authMode === 'SIGNUP' && !isAdmin && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Full Cadet Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <input name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner font-medium placeholder:text-slate-400" />
                    </div>
                  </div>
                )}

                {authMode !== 'OTP_VERIFY' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{isAdmin ? 'Master User ID' : 'Account Email Address'}</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder={isAdmin ? "admin@mahacet.in" : "user@gmail.com"} className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner coding-font font-medium placeholder:text-slate-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">{isAdmin ? 'Security Pin' : 'Account Secret Password'}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                        <input name="password" type="password" required value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-11 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner font-medium placeholder:text-slate-400" />
                      </div>
                    </div>
                  </>
                )}

                {authMode === 'OTP_VERIFY' && (
                  <div className="space-y-2 text-center">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 text-left mb-1.5">Enter 6-Digit Brevo Security Token</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-emerald-600" />
                      <input name="otpCode" type="text" maxLength="6" required value={formData.otpCode} onChange={handleInputChange} placeholder="e.g. 549321" className="w-full rounded-xl bg-slate-50 border border-emerald-500/30 pl-11 p-3.5 text-center text-lg font-mono font-bold tracking-[8px] text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">OTP will automatically trigger expiration drop in 10 minutes.</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ACTION TRIGGERS ACTION BUTTON */}
            <button type="submit" disabled={loading} className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 border border-transparent select-none active:scale-98 cursor-pointer mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${isAdmin ? 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/10' : authMode === 'OTP_VERIFY' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/10' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'}`}>
              {loading ? 'Processing Layers...' : authMode === 'LOGIN' ? 'Establish Secure Session' : authMode === 'SIGNUP' ? 'Generate Registry Key' : 'Unlock Dashboard Portal'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* OAUTH LAYER LINK */}
          {!isAdmin && authMode === 'LOGIN' && (
            <div className="space-y-4">
              <div className="relative flex py-2 items-center text-[10px] text-slate-400 uppercase font-black tracking-widest">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3">Or Database Access</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>
              <div className="flex justify-center transition-transform hover:scale-[1.005]">
                <GoogleLogin 
                  onSuccess={handleGoogleLoginSuccess} 
                  onError={() => setAuthError('Google identity network dropped.')}
                  theme="outline" shape="pill" text="signin_with" width="100%"
                />
              </div>
            </div>
          )}

          {/* TOGGLE FLOW INTERFACES FOOTERS LINKS */}
          {!isAdmin && (
            <div className="text-center font-bold text-xs text-slate-500 border-t border-slate-100 pt-4">
              {authMode === 'LOGIN' ? (
                <p>New Cadet on the network? <span onClick={() => { setAuthMode('SIGNUP'); setAuthError(''); }} className="text-blue-600 hover:text-blue-700 underline cursor-pointer transition-colors ml-1">Create Account</span></p>
              ) : authMode === 'SIGNUP' ? (
                <p>Already have database tokens? <span onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }} className="text-blue-600 hover:text-blue-700 underline cursor-pointer transition-colors ml-1">Secure Sign In</span></p>
              ) : (
                <p>Wrong address coordinates? <span onClick={() => { setAuthMode('SIGNUP'); setAuthError(''); }} className="text-slate-500 hover:text-slate-700 underline cursor-pointer transition-colors ml-1">Back to Signup</span></p>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}