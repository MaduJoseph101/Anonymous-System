import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function EthicalAcknowledgement({ onAcknowledge, disabled = false, isTimerRunning = false, isFormIncomplete = false }) {
  const [checks, setChecks] = useState({
    truthful: false,
    disciplinary: false,
    verification: false
  });

  const allChecked = checks.truthful && checks.disciplinary && checks.verification;

  useEffect(() => {
    onAcknowledge(allChecked);
  }, [allChecked, onAcknowledge]);

  const handleToggle = (key) => setChecks(prev => ({ ...prev, [key]: !prev[key] }));

  const items = [
    { key: 'truthful', label: 'The information I am submitting is true to the best of my knowledge' },
    { key: 'disciplinary', label: 'I understand that false reports can lead to discipline' },
    { key: 'verification', label: 'I understand that reports are checked before action is taken' },
  ];

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl overflow-hidden shadow-sm transition-opacity duration-300 ${disabled ? 'opacity-40 select-none' : 'opacity-100'}`}>
      <div className="p-5 border-b border-amber-200/50 bg-amber-100/30 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
        <h3 className="text-lg font-bold text-amber-900">Before you submit</h3>
      </div>

      <div className="p-6">
        <p className="text-sm text-amber-800 mb-6 leading-relaxed">
          Only use this form for real concerns. False reports can harm others and waste time. Please confirm the statements below:
        </p>

        <div className="space-y-3 mb-6">
          {items.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => handleToggle(key)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-200 ${disabled ? 'cursor-default' : 'cursor-pointer'} ${
                checks[key]
                  ? 'bg-amber-100 border-amber-400 shadow-sm'
                  : 'bg-white border-amber-200 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              <span className={`mt-0.5 w-6 h-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                checks[key] ? 'bg-amber-500 border-amber-500' : 'bg-white border-amber-300'
              }`}>
                {checks[key] && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-sm text-amber-900 font-medium leading-relaxed select-none">
                {label}
              </span>
            </button>
          ))}
        </div>

        {disabled && (
          <div className="text-xs text-amber-800 bg-amber-100/50 p-4 rounded-xl border border-amber-200/50 space-y-1.5 leading-relaxed font-semibold">
            {isTimerRunning && (
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                Review Period Active: Please wait for the mandatory cooldown timer to finish.
              </p>
            )}
            {isFormIncomplete && (
              <p className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                Incomplete Fields: Please complete all mandatory fields above to access these confirmations.
              </p>
            )}
          </div>
        )}

        {!disabled && !allChecked && (
          <p className="text-sm italic text-amber-700 bg-amber-100/30 p-3 rounded-lg border border-amber-200/40">
            You must confirm all three before you can continue.
          </p>
        )}

        {!disabled && allChecked && (
          <p className="text-sm font-semibold text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            All confirmations received - you may proceed.
          </p>
        )}
      </div>
    </div>
  );
}
