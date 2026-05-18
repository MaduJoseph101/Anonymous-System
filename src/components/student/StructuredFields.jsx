import React from 'react';

export default function StructuredFields({ register, errors, watch }) {
  const description = watch('description') || '';
  const descLength = description.length;
  const selectedMedia = watch('media')?.[0] || null;
  
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
          className={`block w-full px-4 py-3 rounded-xl border ${errors.timeOfDay ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
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
        <div className="mt-3 flex gap-2 items-start bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm">
          <div className="w-5 h-5 bg-green-500 rounded-full mt-0.5 shrink-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold font-serif italic">i</span>
          </div>
          <p className="text-sm text-green-800 leading-relaxed">
            <span className="font-semibold px-1">Note:</span> It is fine to be uncertain. Use this field if you want to add context.
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
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Selected file: <span className="font-semibold">{selectedMedia.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
