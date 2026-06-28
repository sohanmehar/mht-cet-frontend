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
      const response = await axios.post('https://mht-cet-backend-uxqs.onrender.com/api/auth/google', {
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
        // Mock Bypass only for local layout check:
        localStorage.setItem('cet_token', 'mock_admin_token_layer');
        localStorage.setItem('cet_user', JSON.stringify({ name: 'Admin Control', role: 'ADMIN' }));
        navigate('/admin/dashboard');
        return;
      }

      if (authMode === 'LOGIN') {
        const response = await axios.post('https://mht-cet-backend-uxqs.onrender.com/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        if (response.data?.success) {
          localStorage.setItem('cet_token', response.data.token);
          localStorage.setItem('cet_user', JSON.stringify(response.data.user));
          navigate('/student/predict');
        }
      } else if (authMode === 'SIGNUP') {
        const response = await axios.post('https://mht-cet-backend-uxqs.onrender.com/api/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        if (response.data?.success) {
          setAuthSuccess('Verification token blasted to your inbox!');
          setAuthMode('OTP_VERIFY');
        }
      } else if (authMode === 'OTP_VERIFY') {
        const response = await axios.post('https://mht-cet-backend-uxqs.onrender.com/api/auth/verify-otp', {
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
    // 🌌 Deep Cosmic Black Background (#050B14 style slate hint)
    <div className="flex min-h-screen bg-[#070d19] font-sans text-[#E2E8F0] overflow-hidden selection:bg-[#2563EB]/30">
      
      {/* 🏙️ LEFT HALF: ACADEMIC VISUAL DESIGN WITH DIM SLATE AND SOFT TEAL */}
      <div className="hidden lg:flex lg:w-1/2 p-16 flex-col justify-between relative border-r border-[#1E293B]/40 bg-[#040914]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#1E3A8A,transparent_50%)] opacity-20"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A_1px,transparent_1px),linear-gradient(to_bottom,#0F172A_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
        
        <div className="flex items-center gap-2.5 relative z-10 font-bold text-sm tracking-tight text-white">
          <div className="h-8 w-8 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center text-[#2563EB] shadow-sm">
            <GraduationCap className="h-4 w-4" />
          </div>
          <span className="font-mono uppercase tracking-widest text-[11px] text-[#94A3B8]">MHT-CET Matrix Suite</span>
        </div>

        <div className="space-y-6 relative z-10 max-w-md">
          {/* Crisp Off-White Text Pairing */}
          <h1 className="text-4xl xl:text-5xl font-black text-[#F8FAFC] leading-tight tracking-tight uppercase">
            Predictive <br/>
            <span className="text-[#2563EB] font-extrabold drop-shadow-[0_2px_10px_rgba(37,99,235,0.15)]">Counselling</span> Matrix
          </h1>
          <p className="text-xs text-[#94A3B8] font-medium leading-relaxed">
            Execute complex CAP choice-form simulations, analyze dynamic structural cutoffs loops, and insulation tracking powered by database layer variables synchronization.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* 🪙 Dim Slate Cards with Soft Teal Value Accents */}
            <div className="p-4 bg-[#111928] border border-[#1E293B]/60 rounded-2xl shadow-sm">
              <div className="text-2xl font-black text-[#2DD4BF]">10K+</div>
              <div className="text-[9px] font-bold uppercase text-[#64748B] tracking-wider mt-1">Simulations Run</div>
            </div>
            <div className="p-4 bg-[#111928] border border-[#1E293B]/60 rounded-2xl shadow-sm">
              <div className="text-2xl font-black text-[#2DD4BF]">100%</div>
              <div className="text-[9px] font-bold uppercase text-[#64748B] tracking-wider mt-1">DTE Scrutiny Match</div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono font-bold text-[#475569] relative z-10 tracking-wider">
          SECURE INFRASTRUCTURE LAYER &bull; PRODUCTION STABLE v4.4
        </div>
      </div>

      {/* 🔓 RIGHT HALF: INSULATED CHARCOAL SLATE PANEL VIEWPORT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Charcoal Slate Panel Design Layout (#111827 / #182232 mix) */}
        <div className="w-full max-w-md bg-[#111928] border border-[#1E293B]/80 rounded-3xl p-6 sm:p-10 space-y-6 shadow-2xl relative z-10">
          
          <div className="space-y-1.5 text-center lg:text-left">
            <h3 className="text-xl font-black text-[#F8FAFC] tracking-tight uppercase">
              {authMode === 'LOGIN' ? 'Welcome Back Officer' : authMode === 'SIGNUP' ? 'Initialize Cadet Portal' : 'Verification Scrutiny Check'}
            </h3>
            <p className="text-xs text-[#94A3B8] font-medium">
              {authMode === 'LOGIN' ? 'Access your automated structural dashboard parameters.' : authMode === 'SIGNUP' ? 'Create a secure isolated profile space on cloud server.' : 'Input the 6-digit verification code sent via Brevo.'}
            </p>
          </div>

          {/* Role Choice Switcher Tabs */}
          {authMode !== 'OTP_VERIFY' && (
            <div className="flex rounded-xl bg-[#070d19] p-1 border border-[#1E293B]/60 shadow-inner">
              {/* Electric Azure Active Tab Accent */}
              <button type="button" onClick={() => { setIsAdmin(false); setAuthMode('LOGIN'); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${!isAdmin ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
                <Smartphone className="h-3.5 w-3.5" /> Student Portal
              </button>
              <button type="button" onClick={() => { setIsAdmin(true); setAuthMode('LOGIN'); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${isAdmin ? 'bg-[#2563EB] text-white shadow-lg' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
                <ShieldAlert className="h-3.5 w-3.5" /> Admin Access
              </button>
            </div>
          )}

          {authError && <div className="p-3 bg-rose-500/5 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-mono text-center animate-fadeIn">{authError}</div>}
          {authSuccess && <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-mono text-center animate-fadeIn">{authSuccess}</div>}

          {/* SMART INLINE TRANSITION CORE FORM */}
          <form className="space-y-4" onSubmit={handleFormSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={authMode}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                {authMode === 'SIGNUP' && !isAdmin && (
                  <div>
                    {/* Desaturated Ash Gray placeholders and headers mapping */}
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">Full Cadet Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#475569]" />
                      <input name="name" type="text" required value={formData.name} onChange={handleInputChange} placeholder="Full Name" className="w-full rounded-xl bg-[#070d19] border border-[#1E293B] pl-11 p-3 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-inner font-medium placeholder:text-[#475569]" />
                    </div>
                  </div>
                )}

                {authMode !== 'OTP_VERIFY' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">{isAdmin ? 'Master User ID' : 'Account Email Address'}</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#475569]" />
                        <input name="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder={isAdmin ? "admin@mahacet.in" : "user@gmail.com"} className="w-full rounded-xl bg-[#070d19] border border-[#1E293B] pl-11 p-3 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-inner font-medium placeholder:text-[#475569]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">{isAdmin ? 'Security Pin' : 'Account Secret Password'}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#475569]" />
                        <input name="password" type="password" required value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="w-full rounded-xl bg-[#070d19] border border-[#1E293B] pl-11 p-3 text-sm text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-all shadow-inner font-medium placeholder:text-[#475569]" />
                      </div>
                    </div>
                  </>
                )}

                {authMode === 'OTP_VERIFY' && (
                  <div className="space-y-2 text-center">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] text-left mb-1.5">Enter 6-Digit Brevo Security Token</label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3.5 top-3.5 h-4 w-4 text-[#2DD4BF]" />
                      <input name="otpCode" type="text" maxLength="6" required value={formData.otpCode} onChange={handleInputChange} placeholder="e.g. 549321" className="w-full rounded-xl bg-[#070d19] border border-[#2DD4BF]/30 pl-11 p-3.5 text-center text-lg font-mono font-bold tracking-[8px] text-[#2DD4BF] focus:outline-none focus:ring-1 focus:ring-[#2DD4BF] shadow-inner" />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Electric Azure CTA Trigger Activation Button */}
            <button type="submit" disabled={loading} className="w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all bg-[#2563EB] hover:bg-[#1D4ED8] shadow-lg shadow-[#2563EB]/20 cursor-pointer flex items-center justify-center gap-2 border border-transparent select-none active:scale-98 disabled:opacity-50 mt-6">
              {loading ? 'Processing Layers...' : authMode === 'LOGIN' ? 'Establish Secure Session' : authMode === 'SIGNUP' ? 'Generate Registry Key' : 'Unlock Dashboard Portal'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* THIRD PARTY IAM ACCESS BLOCK */}
          {!isAdmin && authMode === 'LOGIN' && (
            <div className="space-y-4">
              <div className="relative flex py-2 items-center text-[10px] text-[#475569] uppercase font-black tracking-widest">
                <div className="flex-grow border-t border-[#1E293B]"></div>
                <span className="flex-shrink mx-3">Or IAM Access</span>
                <div className="flex-grow border-t border-[#1E293B]"></div>
              </div>
              <div className="flex justify-center transition-transform hover:scale-[1.005]">
                <GoogleLogin 
                  onSuccess={handleGoogleLoginSuccess} 
                  onError={() => setAuthError('Google identity network dropped.')}
                  ux_mode="popup"
                  theme="filled_dark" shape="pill" text="signin_with" width="100%"
                />
              </div>
            </div>
          )}

          {/* 🌊 Muted Sky Blue Custom Core Links Anchor */}
          {!isAdmin && (
            <div className="text-center font-bold text-xs text-[#64748B] border-t border-[#1E293B] pt-4">
              {authMode === 'LOGIN' ? (
                <p>New Operator on the network? <span onClick={() => { setAuthMode('SIGNUP'); setAuthError(''); }} className="text-[#60A5FA] hover:text-[#93C5FD] underline cursor-pointer transition-colors ml-1">Create Account</span></p>
              ) : authMode === 'SIGNUP' ? (
                <p>Already mapped in core records? <span onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }} className="text-[#60A5FA] hover:text-[#93C5FD] underline cursor-pointer transition-colors ml-1">Secure Sign In</span></p>
              ) : (
                <p>Wrong address coordinates? <span onClick={() => { setAuthMode('SIGNUP'); setAuthError(''); }} className="text-[#64748B] hover:text-[#94A3B8] underline cursor-pointer transition-colors ml-1">Back to Signup</span></p>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}