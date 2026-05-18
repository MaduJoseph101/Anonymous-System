import React from 'react';
import { REPORT_CATEGORIES, HIGH_STAKES_CATEGORIES } from '../../utils/constants';
import { AlertTriangle, Info } from 'lucide-react';

export default function CategorySelector({ register, errors, watch }) {
  const selectedCategory = watch('category');
  const isHighStakes = HIGH_STAKES_CATEGORIES.includes(selectedCategory);
  const isStaffMisconduct = selectedCategory === 'STAFF_MISCONDUCT';

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-2">
          What category fits best? <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            id="category"
            className={`block w-full px-4 py-3 rounded-xl border ${errors.category ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
            {...register('category', { required: 'Please select a category' })}
          >
            <option value="">Select a category</option>
            {REPORT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        {errors.category && (
          <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {isHighStakes && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <strong className="font-semibold text-blue-900 block text-balance mb-1">Extra protection</strong>
              This category is held for 24 hours before staff can see it. You can cancel it during that time.
            </p>
            {isStaffMisconduct && (
              <p className="text-sm text-blue-800 flex items-start gap-2 pt-2 border-t border-blue-200/50">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Staff misconduct reports go directly to senior management.</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
