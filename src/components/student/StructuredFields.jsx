import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function StructuredFields({ register, errors, watch, setValue }) {
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
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
      <div className="text-sm text-slate-800 bg-white border border-slate-200 p-4 rounded-lg shadow-sm mb-6 flex items-start space-x-2">
         <p className="font-medium">Answer as clearly as you can. It is okay to be unsure about some details.</p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-800 mb-2">
          What happened? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          rows={8}
          className={`block w-full px-4 py-3 rounded-xl border resize-none min-h-[160px] sm:min-h-[220px] ${errors.description ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          placeholder="Describe what happened, who was involved, and any details you remember..."
          {...register('description', { 
            required: 'Description is required',
            minLength: { value: 30, message: 'Please provide more details (minimum 30 characters)' },
            maxLength: { value: 5000, message: 'Description is too long (maximum 5000 characters)' }
          })}
        />
        <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
          <span className={`${descLength < 30 ? 'text-red-500 font-medium' : 'text-slate-500'}`}>
            {descLength} / 5000 characters {descLength < 30 && '(minimum 30 characters required)'}
          </span>
          {errors.description && <span className="text-red-600">{errors.description.message}</span>}
        </div>
      </div>

      <div>
        <label htmlFor="locationDescription" className="block text-sm font-medium text-slate-800 mb-2">
          Describe the location <span className="text-red-500">*</span>
        </label>
        <textarea
          id="locationDescription"
          rows={4}
          className={`block w-full px-4 py-3 rounded-xl border resize-none min-h-[100px] sm:min-h-[120px] ${errors.locationDescription ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          placeholder="e.g. Near the back of the main cafeteria, close to the bins..."
          {...register('locationDescription', { required: 'Please describe the location' })}
        />
        {errors.locationDescription && <p className="mt-1 text-sm text-red-600">{errors.locationDescription.message}</p>}
        <p className="mt-2 text-xs text-slate-500">A short, natural description helps.</p>
      </div>

      <div>
        <label htmlFor="timeOfDay" className="block text-sm font-medium text-slate-800 mb-2">
          Approximate time <span className="text-red-500">*</span>
        </label>
        <select
          id="timeOfDay"
          className={`block w-full px-4 py-3 pr-10 truncate rounded-xl border ${errors.timeOfDay ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          {...register('timeOfDay', { required: 'Please select an approximate time' })}
        >
          <option value="">Select a time period</option>
          <option value="before_8am">Early morning (before 8am)</option>
          <option value="8am_to_12pm">Morning (8am - 12pm)</option>
          <option value="12pm_to_4pm">Afternoon (12pm - 4pm)</option>
          <option value="4pm_to_8pm">Evening (4pm - 8pm)</option>
          <option value="after_8pm">Night (after 8pm)</option>
          <option value="unsure">I am not sure</option>
        </select>
        {errors.timeOfDay && <p className="mt-1 text-sm text-red-600">{errors.timeOfDay.message}</p>}
      </div>

      <div>
        <label htmlFor="reporterContext" className="block text-sm font-medium text-slate-800 mb-2">
          Why were you there? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="reporterContext"
          className={`block w-full px-4 py-3 rounded-xl border ${errors.reporterContext ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          placeholder="e.g. I was walking to class and passed through there..."
          {...register('reporterContext', { required: 'Please explain why you were there' })}
        />
        {errors.reporterContext && <p className="mt-1 text-sm text-red-600">{errors.reporterContext.message}</p>}
        <p className="mt-2 text-xs text-slate-500">This helps explain how you saw it.</p>
      </div>

      <div>
        <label htmlFor="patternObservation" className="block text-sm font-medium text-slate-800 mb-2">
          Was this a single isolated incident or part of a pattern you have observed? (Optional)
        </label>
        <select
          id="patternObservation"
          className="block w-full px-4 py-3 pr-10 truncate rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors"
          {...register('patternObservation')}
        >
          <option value="">Select an option</option>
          <option value="This appears to be a single isolated incident">This appears to be a single isolated incident</option>
          <option value="I believe this is part of a recurring pattern">I believe this is part of a recurring pattern</option>
          <option value="I have witnessed similar incidents involving the same people before">I have witnessed similar incidents involving the same people before</option>
          <option value="I am not certain whether this is isolated or recurring">I am not certain whether this is isolated or recurring</option>
        </select>
      </div>

      <div>
        <label htmlFor="witnessPresence" className="block text-sm font-medium text-slate-800 mb-2">
          At the time of the incident, was anyone else present who may also have witnessed it? <span className="text-red-500">*</span>
        </label>
        <select
          id="witnessPresence"
          className={`block w-full px-4 py-3 pr-10 truncate rounded-xl border ${errors.witnessPresence ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          {...register('witnessPresence', { required: 'Please select an option' })}
        >
          <option value="">Select an option</option>
          <option value="Yes, there were other people nearby who likely witnessed it">Yes, there were other people nearby who likely witnessed it</option>
          <option value="I was the only person who appeared to notice">I was the only person who appeared to notice</option>
          <option value="I am not certain whether others witnessed it">I am not certain whether others witnessed it</option>
          <option value="I would rather not say">I would rather not say</option>
        </select>
        {errors.witnessPresence && <p className="mt-1 text-sm text-red-600">{errors.witnessPresence.message}</p>}
      </div>

      <div>
        <label htmlFor="immediateAction" className="block text-sm font-medium text-slate-800 mb-2">
          What did you do immediately after witnessing the incident? <span className="text-red-500">*</span>
        </label>
        <select
          id="immediateAction"
          className={`block w-full px-4 py-3 pr-10 truncate rounded-xl border ${errors.immediateAction ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          {...register('immediateAction', { required: 'Please select an option' })}
        >
          <option value="">Select an option</option>
          <option value="I left the area">I left the area</option>
          <option value="I stayed nearby and continued to observe">I stayed nearby and continued to observe</option>
          <option value="I approached and tried to intervene">I approached and tried to intervene</option>
          <option value="I went to find a member of staff">I went to find a member of staff</option>
          <option value="I contacted someone else about it">I contacted someone else about it</option>

          <option value="I would rather not say">I would rather not say</option>
        </select>
        {errors.immediateAction && <p className="mt-1 text-sm text-red-600">{errors.immediateAction.message}</p>}
      </div>

      <div>
        <label htmlFor="ongoingStatus" className="block text-sm font-medium text-slate-800 mb-2">
          Is the situation you are reporting still ongoing as far as you are aware? (Optional)
        </label>
        <select
          id="ongoingStatus"
          className="block w-full px-4 py-3 pr-10 truncate rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors"
          {...register('ongoingStatus')}
        >
          <option value="">Select an option</option>
          <option value="Yes, I believe it is ongoing">Yes, I believe it is ongoing</option>
          <option value="No, I believe it has concluded">No, I believe it has concluded</option>
          <option value="I am not certain of the current situation">I am not certain of the current situation</option>
        </select>
      </div>

      <div>
        <label htmlFor="uncertaintyStatement" className="block text-sm font-medium text-slate-800 mb-2">
          Anything you are unsure about? (Optional)
        </label>
        <input
          type="text"
          id="uncertaintyStatement"
          className="block w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors"
          placeholder="e.g. I could not clearly hear everything that was said because I was some distance away, but I clearly saw..."
          {...register('uncertaintyStatement')}
        />
        <div className="mt-3 flex gap-2.5 items-start bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm">
          <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 shrink-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold font-serif italic">i</span>
          </div>
          <p className="text-xs sm:text-sm text-green-800 leading-relaxed">
            <span className="font-semibold mr-1">Note:</span>It is fine to be uncertain. Use this field if you want to add context.
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="media" className="block text-sm font-medium text-slate-800 mb-2">
          Upload photo or video (Optional)
        </label>
        <input
          type="file"
          id="media"
          accept="image/*,video/*"
          className={`block w-full rounded-xl border bg-white file:mr-4 file:border-0 file:bg-blue-50 file:px-4 file:py-3 file:font-medium file:text-blue-700 hover:file:bg-blue-100 ${errors.media ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 transition-colors`}
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
        {errors.media && <p className="mt-1 text-sm text-red-600">{errors.media.message}</p>}
        <p className="mt-2 text-xs text-slate-500">
          You can attach one photo or video if it helps.
        </p>
        {selectedMedia && (
          <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-2 overflow-hidden mr-4">
                <span className="text-sm font-medium text-slate-700 truncate">
                  {selectedMedia.name}
                </span>
                <span className="text-xs text-slate-500 shrink-0">
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
                  <div className="py-8 text-slate-500 text-sm">Preview not available</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
