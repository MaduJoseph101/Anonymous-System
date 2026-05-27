import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isTrackPage = location.pathname.includes('/track');
  const isRetractPage = location.pathname.includes('/retract');
  const isSubmitPage = location.pathname.includes('/submit');

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between relative z-50 bg-white">
        <Link 
          to="/" 
          onClick={closeMenu}
          className="flex items-center gap-2.5 text-slate-800 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg pr-2"
          aria-label="Skip to Student Home Page"
        >
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
            <Shield className="w-6 h-6 text-blue-700" />
          </div>
          <span className="font-extrabold text-lg tracking-tight hidden sm:inline-block">Campus Reporting</span>
          <span className="font-extrabold text-lg tracking-tight sm:hidden">Reporting</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex gap-4">
          <Link 
            to="/track" 
            className={`text-sm font-bold ${isTrackPage ? 'text-white bg-blue-600 hover:bg-blue-700 border-transparent shadow-sm' : 'text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border-slate-200'} px-5 py-2.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
          >
            Track Report
          </Link>
          <Link 
            to="/retract" 
            className={`text-sm font-bold ${isRetractPage ? 'text-white bg-red-600 hover:bg-red-700 border-transparent shadow-sm' : 'text-slate-700 hover:text-red-700 bg-white hover:bg-red-50 border-slate-200'} px-5 py-2.5 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
          >
            Retract Report
          </Link>
          {(isTrackPage || isRetractPage) && (
            <Link 
              to="/submit" 
              className="text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Submit New
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden" 
          onClick={closeMenu}
        />
      )}

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex justify-end">
          <button 
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            onClick={closeMenu}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col p-4 gap-4">
          <Link 
            to="/track" 
            onClick={closeMenu}
            className={`text-center font-bold px-5 py-3 rounded-xl transition-colors border ${isTrackPage ? 'text-white bg-blue-600 border-transparent shadow-sm' : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
          >
            Track Report
          </Link>
          <Link 
            to="/retract" 
            onClick={closeMenu}
            className={`text-center font-bold px-5 py-3 rounded-xl transition-colors border ${isRetractPage ? 'text-white bg-red-600 border-transparent shadow-sm' : 'text-slate-700 bg-white hover:bg-red-50 hover:text-red-700 border-slate-200'}`}
          >
            Retract Report
          </Link>
          {!isSubmitPage && (
            <>
              <div className="h-px bg-slate-100 my-2"></div>
              <Link 
                to="/submit" 
                onClick={closeMenu}
                className="text-center font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-5 py-3 rounded-xl transition-colors"
              >
                Submit New Report
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
