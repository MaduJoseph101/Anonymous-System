import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function IncidentDetailFields({ register, errors, watch, setValue }) {
  const description = watch('description') || '';
  const descLength = description.length;
  const selectedMedia = watch('media')?.[0] || null;
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!selectedMedia) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedMedia);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedMedia]);
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="description" className="block text-sm font-bold text-slate-800 mb-2">
          What happened? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={8}
          className={`block w-full px-4 py-3 rounded-xl border resize-none min-h-[160px] sm:min-h-[220px] ${errors.description ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          placeholder="Describe what happened, who was involved, and any details you remember..."
          {...register('description', { 
            required: 'Description is required',
            minLength: { value: 30, message: 'Please provide more details (minimum 30 characters)' },
            maxLength: { value: 5000, message: 'Description is too long (maximum 5000 characters)' }
          })}
        />
        <div className="mt-3 flex justify-between items-center text-xs font-medium">
          <span className={`${descLength < 30 ? 'text-red-600' : 'text-slate-500'}`}>
            {descLength} / 5000 chars {descLength < 30 && '(min 30 required)'}
          </span>
          {errors.description && <span className="text-red-600">{errors.description.message}</span>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="reporterContext" className="block text-sm font-bold text-slate-800 mb-2">
          Why were you there? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="reporterContext"
          className={`block w-full px-4 py-3 rounded-xl border ${errors.reporterContext ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          placeholder="e.g. I was walking to class and passed through there..."
          {...register('reporterContext', { required: 'Please explain why you were there' })}
        />
        {errors.reporterContext && <p className="mt-2 text-sm text-red-600 font-medium">{errors.reporterContext.message}</p>}
        <p className="mt-2 text-xs text-slate-500 font-medium">This helps explain how you saw it.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="patternObservation" className="block text-sm font-bold text-slate-800 mb-2">
          Is this a recurring issue? (Optional)
        </label>
        <select
          id="patternObservation"
          className="block w-full px-4 py-3 pr-10 truncate rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors"
          {...register('patternObservation')}
        >
          <option value="">Select an option</option>
          <option value="Single incident">Single incident</option>
          <option value="Recurring pattern">Recurring pattern</option>
          <option value="Similar incidents with same people">Similar incidents with same people</option>
          <option value="Unsure">Unsure</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="witnessPresence" className="block text-sm font-bold text-slate-800 mb-2">
          Were there other witnesses? <span className="text-red-500">*</span>
        </label>
        <select
          id="witnessPresence"
          className={`block w-full px-4 py-3 pr-10 truncate rounded-xl border ${errors.witnessPresence ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          {...register('witnessPresence', { required: 'Please select an option' })}
        >
          <option value="">Select an option</option>
          <option value="Yes, others were nearby">Yes, others were nearby</option>
          <option value="No, just me">No, just me</option>
          <option value="Unsure">Unsure</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors.witnessPresence && <p className="mt-2 text-sm text-red-600 font-medium">{errors.witnessPresence.message}</p>}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="immediateAction" className="block text-sm font-bold text-slate-800 mb-2">
          Your immediate reaction? <span className="text-red-500">*</span>
        </label>
        <select
          id="immediateAction"
          className={`block w-full px-4 py-3 pr-10 truncate rounded-xl border ${errors.immediateAction ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          {...register('immediateAction', { required: 'Please select an option' })}
        >
          <option value="">Select an option</option>
          <option value="Left the area">Left the area</option>
          <option value="Stayed to observe">Stayed to observe</option>
          <option value="Tried to intervene">Tried to intervene</option>
          <option value="Found a staff member">Found a staff member</option>
          <option value="Contacted someone else">Contacted someone else</option>
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        {errors.immediateAction && <p className="mt-2 text-sm text-red-600 font-medium">{errors.immediateAction.message}</p>}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="ongoingStatus" className="block text-sm font-bold text-slate-800 mb-2">
          Is this still happening? (Optional)
        </label>
        <select
          id="ongoingStatus"
          className="block w-full px-4 py-3 pr-10 truncate rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors"
          {...register('ongoingStatus')}
        >
          <option value="">Select an option</option>
          <option value="Yes, currently ongoing">Yes, currently ongoing</option>
          <option value="No, it has ended">No, it has ended</option>
          <option value="Unsure">Unsure</option>
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="media" className="block text-sm font-bold text-slate-800 mb-2">
          Upload photo or video (Optional)
        </label>
        <input
          type="file"
          id="media"
          accept="image/*,video/*"
          className={`block w-full rounded-xl border bg-slate-50 file:mr-4 file:border-0 file:bg-blue-600 file:px-4 file:py-3 file:font-bold file:text-white hover:file:bg-blue-700 ${errors.media ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-colors`}
          {...register('media', {
            validate: {
              supportedType: (files) => {
                const file = files?.[0];
                if (!file) return true;
                return /^(image|video)\//.test(file.type) || 'Only image or video files are allowed';
              },
              maxSize: (files) => {
                const file = files?.[0];
                if (!file) return true;
                return file.size <= 25 * 1024 * 1024 || 'Media must be 25MB or smaller';
              }
            }
          })}
        />
        {errors.media && <p className="mt-2 text-sm text-red-600 font-medium">{errors.media.message}</p>}
        <p className="mt-2 text-xs text-slate-500 font-medium">
          You can attach one photo or video if it helps.
        </p>
        {selectedMedia && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2 overflow-hidden mr-4">
                <span className="text-sm font-bold text-slate-700 truncate">
                  {selectedMedia.name}
                </span>
                <span className="text-xs text-slate-500 font-medium shrink-0">
                  ({(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button 
                type="button" 
                onClick={() => setValue('media', null)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                title="Remove media"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {previewUrl && (
              <div className="bg-slate-100 flex items-center justify-center p-2">
                {selectedMedia.type.startsWith('image/') ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 object-contain rounded-lg shadow-sm"
                  />
                ) : selectedMedia.type.startsWith('video/') ? (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="max-h-64 rounded-lg shadow-sm w-full"
                  />
                ) : (
                  <div className="py-8 text-slate-500 text-sm font-medium">Preview not available</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
