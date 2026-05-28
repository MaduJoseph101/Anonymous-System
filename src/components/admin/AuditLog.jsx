import React, { useState } from 'react';
import { Clock, User, ShieldAlert, FileText, CheckCircle, Activity, MessageSquare, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import ModernDatePicker from './ModernDatePicker';

export default function AuditLog({ auditLogs = [] }) {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!log.created_at) return true;
    const logDate = new Date(log.created_at);
    
    if (dateRange.startDate) {
      const start = new Date(dateRange.startDate);
      start.setHours(0, 0, 0, 0);
      if (logDate < start) return false;
    }
    
    if (dateRange.endDate) {
      const end = new Date(dateRange.endDate);
      end.setHours(23, 59, 59, 999);
      if (logDate > end) return false;
    }
    
    return true;
  });

  const getActionTheme = (action) => {
    switch (action) {
      case 'VIEWED_REPORT': return 'bg-slate-50 border-slate-200 text-slate-600';
      case 'STATUS_UPDATED': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'MESSAGE_SENT': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'OUTCOME_RECORDED': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'VIEWED_REPORT': return <Activity className="w-3 h-3 shrink-0" />;
      case 'STATUS_UPDATED': return <ShieldAlert className="w-3 h-3 shrink-0" />;
      case 'MESSAGE_SENT': return <MessageSquare className="w-3 h-3 shrink-0" />;
      case 'OUTCOME_RECORDED': return <CheckCircle className="w-3 h-3 shrink-0" />;
      default: return <FileText className="w-3 h-3 shrink-0" />;
    }
  };

  const getActionName = (action) => {
    return action?.replace(/_/g, ' ') || 'UNKNOWN_ACTION';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 shrink-0">
           <div className="bg-indigo-50 p-2 rounded-lg">
             <Activity className="w-4 h-4 text-indigo-600" />
           </div>
           <div>
             <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Logs</div>
             <div className="text-sm font-black text-slate-800">{auditLogs.length} Events</div>
           </div>
        </div>
        <div className="flex flex-col sm:flex-row bg-white p-1 rounded-xl border border-slate-200 shadow-sm items-center gap-1 shrink-0 w-full sm:w-auto hover:border-indigo-300 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400">
           <div className="flex flex-col relative px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto">
             <div className="flex items-center gap-1.5 mb-0.5 pointer-events-none">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
             </div>
             <ModernDatePicker 
               value={dateRange.startDate} 
               maxDate={dateRange.endDate}
               onChange={(val) => handleDateChange('startDate', val)}
               alignRight={true}
             />
           </div>
           
           <div className="w-full h-px sm:w-px sm:h-8 bg-slate-200 my-1 sm:my-0 sm:mx-1"></div>
           
           <div className="flex flex-col relative px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto">
             <div className="flex items-center gap-1.5 mb-0.5 pointer-events-none">
                <Calendar className="w-3 h-3 text-indigo-500" />
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
             </div>
             <ModernDatePicker 
               value={dateRange.endDate} 
               minDate={dateRange.startDate}
               maxDate={new Date().toISOString().split('T')[0]}
               onChange={(val) => handleDateChange('endDate', val)}
               alignRight={true}
             />
           </div>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-sm font-bold text-slate-500 py-6 rounded-2xl bg-slate-50 border-2 border-slate-100 px-5 text-center shadow-sm">
          {auditLogs.length > 0 ? "No audit events match the selected date range." : "No immutable audit events logged yet."}
        </div>
      ) : (
        filteredLogs.map((log) => (
          <div key={log.id} className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-4 md:gap-5 md:items-center transition-all hover:bg-white hover:border-slate-200 hover:shadow-md duration-300">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                 <div className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getActionTheme(log.action)}`}>
                   {getActionIcon(log.action)} {getActionName(log.action)}
                 </div>
              </div>
              <p className="text-sm text-slate-800 font-medium leading-relaxed max-w-3xl pr-4">{log.details}</p>
            </div>
            <div className="shrink-0 text-left md:text-right mt-2 md:mt-0 flex flex-col items-start md:items-end justify-center bg-white border-2 border-slate-100 md:border-transparent md:bg-transparent p-4 md:p-0 rounded-xl md:rounded-none">
               <p className="text-sm font-black text-slate-800 flex items-center gap-2 whitespace-nowrap">
                 <User className="w-4 h-4 text-blue-500" /> <span className="uppercase tracking-widest">{log.admin?.name || 'System Auto-Node'}</span>
               </p>
               <p className="text-[11px] text-slate-500 font-mono font-bold tracking-widest mt-1.5 flex items-center md:justify-end gap-1.5">
                 <Clock className="w-3 h-3" />
                 {log.created_at ? format(new Date(log.created_at), 'dd MMM yyyy, HH:mm') : 'Unknown Timestamp'}
               </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
