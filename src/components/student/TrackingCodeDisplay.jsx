import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck, Copy } from 'lucide-react';

export default function TrackingCodeDisplay({ trackingCode, isInEscrow, isVerified, message, onTrackReport, onReturnHome }) {
  const [copiedTrack, setCopiedTrack] = useState(false);

  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedTrack(true);
      setTimeout(() => setCopiedTrack(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopiedTrack(true);
          setTimeout(() => setCopiedTrack(false), 2000);
        })
        .catch(() => {
          fallbackCopy(text);
        });
    } else {
      fallbackCopy(text);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 max-w-3xl mx-auto text-center space-y-8 animate-in zoom-in-95 duration-500">
      
      <div className="space-y-4">
        <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border border-green-100">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report submitted</h2>
        <p className="text-slate-500 text-lg">Your identity is protected.</p>
        {isVerified && (
           <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
             <ShieldCheck className="w-4 h-4" /> Student Verified Report
           </div>
        )}
      </div>
 
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
        <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">Tracking code</p>
        <div className="flex flex-col md:flex-row items-center justify-center gap-3">
          <div className="text-xl md:text-3xl font-mono font-bold tracking-widest text-slate-800 bg-white px-8 py-5 rounded-xl border border-slate-200 shadow-sm select-all">
            {trackingCode || 'CODE_ERROR'}
          </div>
          <button 
            onClick={() => copyToClipboard(trackingCode)}
            className="p-5 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-700 transition-colors shadow-sm w-full md:w-auto"
            title="Copy tracking code"
          >
            {copiedTrack ? <span className="text-green-600 font-bold text-sm block min-w-[32px]">Copied!</span> : <Copy className="w-7 h-7 mx-auto" />}
          </button>
        </div>
        <p className="text-sm text-red-500 font-bold mt-5 inline-block bg-red-50 px-4 py-2 rounded-lg border border-red-100">
          Save this code now. It cannot be recovered later.
        </p>
      </div>

      {isInEscrow && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center animate-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="flex items-center justify-center gap-2 text-amber-800 font-extrabold mb-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="uppercase tracking-widest text-base">24-Hour Escrow Period</span>
          </div>
          <p className="text-sm text-amber-800 font-medium">
            This is a high-stakes report. You can use your tracking code to retract this report within the next 24 hours before it is seen by an administrator.
          </p>
        </div>
      )}

      {message && (
        <div className="text-slate-600 text-sm leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100">
          {message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 justify-center">
        <button 
          onClick={onTrackReport}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-sm"
        >
          Track report
        </button>
        <button 
          onClick={onReturnHome}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-lg px-8 py-4 rounded-xl transition-colors shadow-sm"
        >
          Home
        </button>
      </div>

    </div>
  );
}
