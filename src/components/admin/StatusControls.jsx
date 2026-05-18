import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../services/api';
import { CORROBORATION_MIN_LENGTH, STATUS_CONFIG } from '../../utils/constants';

export default function StatusControls({ reportId, currentStatus, onStatusUpdated }) {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const selectedStatus = watch('status');
  const corroborationNote = watch('corroborationNote') || '';

  const getValidTransitions = (status) => {
    switch(status) {
      case 'RECEIVED': return ['UNDER_REVIEW', 'INVESTIGATING', 'RESOLVED', 'CLOSED'];
      case 'ESCROW': return []; // Released automatically
      case 'UNDER_REVIEW': return ['INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED', 'CLOSED'];
      case 'INVESTIGATING': return ['ACTION_TAKEN', 'RESOLVED', 'CLOSED'];
      case 'ACTION_TAKEN': return ['RESOLVED', 'CLOSED'];
      default: return []; // terminal states
    }
  };

  const validNextStatuses = getValidTransitions(currentStatus);
  const requiresCorroboration = selectedStatus === 'ACTION_TAKEN';
  
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
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 md:p-6 text-center text-sm text-slate-500 font-bold">
        This report is locked ({STATUS_CONFIG[currentStatus]?.label}). Status cannot be changed.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 shadow-sm">
      <h3 className="font-extrabold text-slate-800 text-base md:text-lg mb-4 md:mb-5 border-b border-slate-100 pb-3">Update Status</h3>
      
      {apiError && (
        <div className="bg-red-50 border-l-4 border-l-red-600 border-y border-r border-red-200 rounded-r-lg p-4 mb-6 relative shadow-sm">
           <strong className="text-red-900 block font-bold text-sm mb-1 uppercase tracking-wider">Server Enforcement Failed</strong>
           <p className="text-red-800 text-sm font-medium">{apiError}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
           <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm text-slate-800 font-bold transition-all shadow-sm"
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
          <div className="animate-in fade-in slide-in-from-top-4 p-4 md:p-5 bg-orange-50 border-l-4 border-l-orange-500 border-orange-200 rounded-r-xl rounded-l-sm space-y-4 shadow-sm relative">
             <div>
               <label className="block text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">
                 Corroboration note <span className="text-red-500">*</span>
               </label>
               <textarea
                 rows={5}
                 placeholder="Add the proof that supports this action..."
                 className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-orange-600 outline-none text-sm resize-none transition-colors shadow-inner ${errors.corroborationNote ? 'border-red-400' : 'border-orange-300'}`}
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
          className="w-full bg-slate-800 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl disabled:opacity-50 disabled:active:scale-100 transition-all shadow-md text-base tracking-wide"
        >
          {loading ? 'Saving...' : 'Save status'}
        </button>
      </form>
    </div>
  );
}
