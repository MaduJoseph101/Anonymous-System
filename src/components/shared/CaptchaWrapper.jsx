import React, { useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Shield, Loader2 } from 'lucide-react';

export default function CaptchaWrapper() {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use a test key if no environment variable is provided
  const sitekey = import.meta.env.VITE_HCAPTCHA_SITEKEY || '10000000-ffff-ffff-ffff-000000000001';

  const handleVerificationSuccess = (token) => {
    setIsVerified(true);
  };

  if (isVerified) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Security Check</h2>
        <p className="text-slate-600 mb-8 text-sm">
          To prevent automated spam and ensure the integrity of the reporting system, please complete the captcha below.
        </p>
        
        <div className="relative flex justify-center min-h-[78px] w-full">
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
          <div className={isLoaded ? 'opacity-100' : 'opacity-0'}>
            <HCaptcha
              sitekey={sitekey}
              onVerify={handleVerificationSuccess}
              onLoad={() => setIsLoaded(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
