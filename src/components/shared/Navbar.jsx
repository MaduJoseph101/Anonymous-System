import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isTrackPage = location.pathname.includes('/track');

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2.5 text-slate-800 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg pr-2"
          aria-label="Skip to Student Home Page"
        >
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
            <Shield className="w-6 h-6 text-blue-700" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:inline-block">Campus Reporting</span>
          <span className="font-extrabold text-lg tracking-tight sm:hidden">Reporting</span>
        </Link>
        
        {!isTrackPage ? (
          <Link 
            to="/track" 
            className="text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-5 py-3 md:py-2.5 rounded-lg border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm"
          >
            Track my report
          </Link>
        ) : (
          <Link 
            to="/submit" 
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-3 md:py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 shadow-sm active:scale-95"
          >
            Submit New
          </Link>
        )}
      </div>
    </nav>
  );
}
