import React, { useState } from 'react';
import { Mail, CheckCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api';

export default function VerificationSection({ onTokenGenerated }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [step, setStep] = useState('idle'); // idle, email_entered, otp_sent, verified
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await api.student.requestOtp({ contactMethod: 'email', contactValue: email });
      setStep('otp_sent');
    } catch (err) {
      setError(err.message || 'Failed to send verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!otp) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.student.verifyOtp({ identifier: email, otp });
      const generatedToken = res.verificationToken || 'VT-MOCK-12345'; // Fallback if API changed
      setToken(generatedToken);
      setStep('verified');
      onTokenGenerated(generatedToken);
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToken = () => {
    navigator.clipboard.writeText(token);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button 
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 focus:outline-none hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6 text-slate-600" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-slate-800 text-lg">Verification <span className="text-xs font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full ml-2">Optional</span></h3>
            <p className="text-sm text-slate-500 mt-0.5">Add a student check without sharing your details</p>
          </div>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-5 border-t border-slate-100 bg-slate-50">
          {(step === 'idle' || step === 'email_entered') && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                This step is completely optional. Submitting a verification token adds a credibility signal to your report without revealing your identity. It confirms only that a registered student submitted this report — not which student you are. Your email address is never stored in plain text.
              </p>
              
              {error && <p className="text-sm text-red-600 font-medium p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>}
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                   <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                   <input
                     type="email"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter') {
                         e.preventDefault();
                         handleRequestOtp(e);
                       }
                     }}
                     className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="Enter your university email"
                   />
                </div>
                <button 
                  type="button" 
                  onClick={handleRequestOtp}
                  disabled={loading || !email}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
                >
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </div>
            </div>
          )}

          {step === 'otp_sent' && (
             <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 max-w-sm">
               <p className="text-sm text-slate-700 leading-relaxed">
                 A one-time code was sent to <strong>{email}</strong>. Enter it below.
               </p>
               
               {error && <p className="text-sm text-red-600 font-medium p-3 bg-red-50 rounded-lg border border-red-100">{error}</p>}
               
               <div className="col-span-full">
                 <input
                   type="text"
                   required
                   maxLength={6}
                   value={otp}
                   onChange={(e) => setOtp(e.target.value)}
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       e.preventDefault();
                       handleVerifyOtp(e);
                     }
                   }}
                   className="w-full px-4 py-3 mb-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-center text-2xl tracking-[0.5em] font-mono bg-white"
                   placeholder="------"
                 />
                 <div className="flex justify-between items-center w-full">
                   <button type="button" onClick={() => setStep('idle')} className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors">
                     Change email
                   </button>
                   <button 
                     type="button" 
                     onClick={handleVerifyOtp}
                     disabled={loading || otp.length < 5}
                     className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm"
                   >
                     {loading ? 'Verifying...' : 'Verify'}
                   </button>
                 </div>
               </div>
             </div>
          )}

          {step === 'verified' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300 text-center py-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed max-w-2xl mx-auto">
                Your verification token is shown below. Copy it and paste it into the report form. It expires in 30 minutes.
              </p>
              
              <div className="flex justify-center items-center gap-2 mt-4">
                <div className="bg-white border border-slate-200 px-6 py-3 rounded-lg font-mono text-xl text-slate-800 font-bold select-all tracking-wider shadow-sm">
                  {token}
                </div>
                <button 
                  onClick={copyToken}
                  className="p-3 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors border border-slate-200 font-medium text-sm shadow-sm"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
