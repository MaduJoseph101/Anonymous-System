import { Outlet, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="bg-white shadow-xs border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary-50 rounded-full group-hover:bg-primary-100 transition-colors">
                <ShieldCheck className="h-6 w-6 text-primary-600" />
              </div>
              <span className="font-semibold text-lg text-slate-700 tracking-tight">ASIRS</span>
            </Link>
            <nav className="flex gap-4">
              <Link to="/track" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors">
                Track Report
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Outlet />
      </main>

      <footer className="py-6 text-center text-xs text-slate-400">
        <p>Your identity is protected.</p>
        <p className="mt-1">Anonymous Incident Reporting System</p>
      </footer>
    </div>
  );
}
