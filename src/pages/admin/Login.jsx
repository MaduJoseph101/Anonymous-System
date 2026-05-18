import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Login() {
  const { login, admin } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, resetField } = useForm();

  // If already logged in, redirect away
  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setLoginError('');
    setLoading(true);

    try {
      await login(data.email, data.password);
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setLoginError(error.message || 'Invalid credentials');
      resetField('password');     
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-100">
      
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 lg:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        
        <div className="flex justify-center mb-8 relative z-10">
          <div className="bg-blue-600/20 p-4 rounded-full border border-blue-500/30">
             <Shield className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="text-center mb-8 relative z-10">
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">Admin Portal</h1>
          <p className="text-sm font-bold text-slate-400 mt-2 tracking-widest uppercase">Authorised staff only</p>
        </div>

        {loginError && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-3 relative z-10 items-center">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-red-400 font-bold text-sm tracking-wide">{loginError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
          <div>
            <label htmlFor="email" className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Institutional Email</label>
            <input 
              id="email"
              type="email" 
              {...register('email', { required: true })} 
              className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-white transition-colors" 
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                {...register('password', { required: true })} 
                className="w-full pl-11 pr-12 py-3.5 bg-slate-900 border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-bold text-white transition-colors tracking-widest" 
                autoComplete="current-password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl disabled:opacity-50 transition-all shadow-lg shadow-blue-900/50 active:scale-[0.98] uppercase tracking-widest mt-8"
          >
            {loading ? <LoadingSpinner className="w-5 h-5 border-2 text-white" /> : 'Login'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs font-bold text-slate-500 max-w-sm text-center tracking-wide leading-relaxed">
        This portal is for authorised institutional staff only. If you need access, contact your system administrator.
      </p>

      <div className="mt-8">
        <Link to="/" className="text-xs font-bold text-blue-500 hover:text-blue-400 hover:underline uppercase tracking-widest">
            Return to student portal
        </Link>
      </div>

    </div>
  );
}
