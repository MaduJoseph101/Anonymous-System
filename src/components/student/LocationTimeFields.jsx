import React from 'react';

export default function LocationTimeFields({ register, errors }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="locationDescription" className="block text-sm font-bold text-slate-800 mb-2">
          Describe the location <span className="text-red-500">*</span>
        </label>
        <textarea
          id="locationDescription"
          rows={4}
          className={`block w-full px-4 py-3 rounded-xl border resize-none min-h-[100px] sm:min-h-[120px] ${errors.locationDescription ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
          placeholder="e.g. Near the back of the main cafeteria, close to the bins..."
          {...register('locationDescription', { required: 'Please describe the location' })}
        />
        {errors.locationDescription && <p className="mt-2 text-sm text-red-600 font-medium">{errors.locationDescription.message}</p>}
        <p className="mt-2 text-xs text-slate-500 font-medium">A short, natural description helps investigators locate the area.</p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <label htmlFor="timeOfDay" className="block text-sm font-bold text-slate-800 mb-2">
          Approximate time <span className="text-red-500">*</span>
        </label>
        <select
          id="timeOfDay"
          className={`block w-full px-4 py-3 pr-10 truncate rounded-xl border ${errors.timeOfDay ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
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
        {errors.timeOfDay && <p className="mt-2 text-sm text-red-600 font-medium">{errors.timeOfDay.message}</p>}
      </div>
    </div>
  );
}
