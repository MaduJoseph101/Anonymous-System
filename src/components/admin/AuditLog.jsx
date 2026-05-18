import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, User, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLog({ auditLogs = [] }) {
  const [expanded, setExpanded] = useState(false);

  const getActionTheme = (action) => {
    switch (action) {
      case 'VIEWED_REPORT': return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'STATUS_UPDATED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'MESSAGE_SENT': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OUTCOME_RECORDED': return 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const getActionName = (action) => {
    return action?.replace(/_/g, ' ') || 'UNKNOWN_ACTION';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full bg-slate-900 hover:bg-slate-800 px-4 md:px-6 py-4 md:py-5 flex items-center justify-between gap-3 transition-colors outline-none text-white"
      >
        <div className="flex items-center gap-3 font-extrabold tracking-wide text-sm sm:text-lg text-left min-w-0">
           <ShieldAlert className="w-5 h-5 text-blue-400" />
           <span className="truncate">Secure Audit Log <span className="opacity-60 text-xs sm:text-sm ml-1 font-mono tracking-widest">[{auditLogs.length} BLOCKS]</span></span>
        </div>
        {expanded ? <ChevronUp className="w-6 h-6 text-slate-400" /> : <ChevronDown className="w-6 h-6 text-slate-400" />}
      </button>

      {expanded && (
        <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50/80">
          <div className="space-y-4">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500 font-bold italic py-4 text-center">No immutable audit events logged yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-4 md:gap-5 md:items-center animate-in fade-in transition-all hover:border-slate-300 hover:shadow-md">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                       <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border shadow-sm ${getActionTheme(log.action)}`}>
                         {getActionName(log.action)}
                       </div>
                    </div>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed max-w-3xl pr-4">{log.details}</p>
                  </div>
                  <div className="shrink-0 text-left md:text-right mt-2 md:mt-0 flex flex-col items-start md:items-end justify-center bg-slate-50 md:bg-transparent p-3 md:p-0 rounded-lg">
                     <p className="text-sm font-black text-slate-900 flex items-center gap-2 whitespace-nowrap">
                       <User className="w-4 h-4 text-blue-600" /> <span className="uppercase tracking-wide">{log.admin?.name || 'System Auto-Node'}</span>
                     </p>
                     <p className="text-[11px] text-slate-500 font-mono font-bold tracking-widest mt-1">
                       {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy, HH:mm') : 'Unknown Timestamp'}
                     </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
