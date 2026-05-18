import React from 'react';
import { getScoreBarColour, getScoreColour } from '../../utils/formatters';

export default function CredibilityScoreBar({ score, label, weight }) {
  const isAvailable = score !== null && score !== undefined;
  
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-end mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">{label}</span>
          {weight && (
             <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200 uppercase tracking-widest shadow-sm">
               {weight}
             </span>
          )}
        </div>
        <span className={`text-base font-extrabold ${isAvailable ? getScoreColour(score) : 'text-slate-400'}`}>
          {isAvailable ? `${score}`.padStart(2, '0') : 'Unavailable'}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200/50 shadow-inner">
        {isAvailable ? (
          <div 
            className={`h-full ${getScoreBarColour(score)} transition-all duration-1000 ease-out`}
            style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          />
        ) : (
          <div className="h-full bg-slate-200 w-full" />
        )}
      </div>
    </div>
  );
}
