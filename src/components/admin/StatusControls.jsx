import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import { CORROBORATION_MIN_LENGTH, STATUS_CONFIG } from '../../utils/constants';

export default function StatusControls({ reportId, currentStatus, onStatusUpdated, outcome }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const selectedStatus = watch('status');
  const corroborationNote = watch('corroborationNote') || '';

  const getValidTransitions = (status) => {
    switch(status) {
      case 'RECEIVED': return ['UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED'];
      case 'ESCROW': return []; // Released automatically
      case 'UNDER_REVIEW': return ['INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED'];
      case 'INVESTIGATING': return ['ACTION_TAKEN', 'RESOLVED'];
      case 'ACTION_TAKEN': return ['RESOLVED'];
      case 'RESOLVED': return ['CLOSED'];
      default: return []; // terminal states
    }
  };

  const validNextStatuses = getValidTransitions(currentStatus);
  const requiresCorroboration = selectedStatus === 'ACTION_TAKEN' || selectedStatus === 'RESOLVED';
  
  const isSubmitDisabled = loading || !selectedStatus || 
    (requiresCorroboration && corroborationNote.length < CORROBORATION_MIN_LENGTH);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await api.admin.updateReportStatus(reportId, { 
         status: data.status, 
         corroborationNote: requiresCorroboration ? data.corroborationNote : undefined 
      });
      toast.success('Status updated successfully');
      reset();
      onStatusUpdated(data.status);
    } catch (err) {
      if (err.response?.status === 400 || err.message?.toLowerCase().includes('corroboration')) {
        setApiError(err.response?.data?.message || err.message || 'Server enforcement triggered error');
      } else {
        toast.error('Failed to update status');
      }
    } finally {
      setLoading(false);
    }
  };

  if (validNextStatuses.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 text-center flex flex-col items-center justify-center gap-3">
        <span className="text-sm text-slate-500 font-bold">This report is locked ({STATUS_CONFIG[currentStatus]?.label}). Status cannot be changed.</span>
        {outcome && (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-xs uppercase tracking-wider ${
            outcome === 'FALSE' ? 'bg-red-100 text-red-800 border-red-200' :
            outcome === 'CORROBORATED' ? 'bg-green-100 text-green-800 border-green-200' :
            outcome === 'UNSUBSTANTIATED' ? 'bg-orange-100 text-orange-800 border-orange-200' :
            'bg-slate-100 text-slate-800 border-slate-200'
          }`}>
            Outcome: {outcome}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm">
      <h3 className="font-black text-slate-800 text-base md:text-lg mb-4 md:mb-5 border-b border-slate-100 pb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Update Status</h3>
      
      {apiError && (
        <div className="bg-red-50 border-l-4 border-l-red-600 border-y border-r border-red-200 rounded-r-lg p-4 mb-6 relative shadow-sm">
           <strong className="text-red-900 block font-bold text-sm mb-1 uppercase tracking-wider">Server Enforcement Failed</strong>
           <p className="text-red-800 text-sm font-medium">{apiError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
           <select
            className="w-full px-5 py-4 pr-10 truncate bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-bold transition-all duration-200 shadow-sm"
            {...register('status', { required: true })}
          >
            <option value="">Select next status</option>
            {validNextStatuses.map(statusKey => (
              <option key={statusKey} value={statusKey}>
                {STATUS_CONFIG[statusKey]?.label || statusKey}
              </option>
            ))}
          </select>
        </div>

        {requiresCorroboration && (
          <div className="animate-in fade-in slide-in-from-top-4 p-5 md:p-6 bg-orange-50/50 border-2 border-orange-200 rounded-2xl space-y-4 shadow-sm relative">
             <div>
               <label className="block text-sm font-black text-slate-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>Corroboration note <span className="text-red-500">*</span>
               </label>
               <textarea
                 rows={4}
                 placeholder="Add the proof that supports this action..."
                 className={`w-full px-5 py-4 bg-white border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 outline-none text-sm resize-none transition-all duration-200 shadow-sm ${errors.corroborationNote ? 'border-red-400' : 'border-orange-200 hover:border-orange-300'}`}
                 {...register('corroborationNote')}
               />
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-3">
                 <p className="text-xs font-bold text-orange-900 max-w-[85%] leading-relaxed border-l-[3px] border-orange-300 pl-3">
                    You must add proof before this action can be saved.
                 </p>
                 <span className={`text-sm font-mono font-bold shrink-0 bg-white px-3 py-1.5 rounded-lg border shadow-sm ${corroborationNote.length < CORROBORATION_MIN_LENGTH ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}`}>
                   {corroborationNote.length} / {CORROBORATION_MIN_LENGTH}
                 </span>
               </div>
             </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-black py-4 rounded-xl disabled:opacity-50 disabled:active:scale-100 transition-all duration-200 shadow-md text-base tracking-wide"
        >
          {loading ? 'Saving...' : 'Save status'}
        </button>
      </form>
    </div>
  );
}
