import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StudentHome() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Report an Incident Safely</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          This is a safe, completely anonymous space. We are here to support you. Your report is securely delivered and handled with the utmost confidentiality.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-xs border border-slate-100 text-center">
        <div className="mx-auto w-12 h-12 bg-secondary-50 text-secondary-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Ready to Start?</h2>
        <p className="text-slate-500 mb-6 text-sm">
          Filing a report takes only a few minutes. You can track its progress securely afterwards.
        </p>
        <Link to="/submit" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-colors w-full sm:w-auto">
           Start Anonymous Report
        </Link>
      </div>
    </div>
  );
}
