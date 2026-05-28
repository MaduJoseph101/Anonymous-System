import React from 'react';

export default function UncertaintyField({ register }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <label htmlFor="uncertaintyStatement" className="block text-sm font-bold text-slate-800 mb-2">
        Anything you are unsure about? (Optional)
      </label>
      <input
        type="text"
        id="uncertaintyStatement"
        className="block w-full px-5 py-4 rounded-xl border-2 border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 font-medium transition-all duration-200"
        placeholder="e.g. I could not clearly hear everything that was said..."
        {...register('uncertaintyStatement')}
      />
      <div className="mt-4 flex gap-3 items-start bg-blue-50 border border-blue-200 p-4 rounded-lg shadow-sm">
        <div className="w-6 h-6 bg-blue-500 rounded-full shrink-0 flex items-center justify-center">
          <span className="text-white text-sm font-bold font-serif italic">i</span>
        </div>
        <p className="text-sm text-blue-900 leading-relaxed font-medium">
          <span className="font-bold mr-1">Note:</span>It is fine to be uncertain. Use this field if you want to add context or explain missing details.
        </p>
      </div>
    </div>
  );
}
