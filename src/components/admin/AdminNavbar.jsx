import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, BarChart2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/formatters';

export default function AdminNavbar() {
  const { admin, logout } = useAuth();
  const location = useLocation();

  if (!admin) return null;

  const isSuperAdmin = admin.role === 'SUPER_ADMIN';

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-100 z-50 relative shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2.5 py-2.5 md:flex-row md:justify-between md:items-center md:h-16 md:py-0">
          
          {/* Top Bar for Mobile: Logo on Left, Logout on Right */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 relative z-10">
            <div className="flex items-center gap-1">
              <div className="bg-blue-500/10 p-0.5 rounded border border-blue-500/20 shrink-0">
                <Shield className="w-3 h-3 text-blue-400" />
              </div>
              <span className="font-extrabold text-[10px] sm:text-xs tracking-widest uppercase text-slate-400">Admin Portal</span>
            </div>
            
            {/* Mobile-visible logout (easily touch-accessible) */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => { logout(); window.location.href = '/admin/login'; }}
                className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-800 shadow-inner bg-slate-800"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Navigation links - beautifully centered and structured on both mobile and desktop (easily touch-accessible) */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar md:flex-initial w-full md:w-auto relative z-10 border-t border-slate-800/40 pt-2.5 md:border-t-0 md:pt-0">
            <Link 
              to="/admin/dashboard" 
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname.includes('/admin/dashboard') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
            >
              <div className="flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
                <span>Dashboard</span>
              </div>
            </Link>
            {isSuperAdmin && (
              <>
                <Link 
                  to="/admin/analytics" 
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname.includes('/admin/analytics') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Analytics</span>
                  </div>
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`px-3.5 py-2 rounded-lg text-xs sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname.includes('/admin/users') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 shrink-0" />
                    <span>Users</span>
                  </div>
                </Link>
              </>
            )}
          </div>
 
          {/* Desktop Only Right Side Profile/Logout */}
          <div className="flex max-md:hidden items-center justify-end gap-3 md:gap-4 relative z-10 shrink-0">
            <div className="text-right border-r border-slate-800 pr-4 mr-2">
              <div className="text-sm font-bold text-white leading-tight">{admin.name || 'Admin'}</div>
              <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">{formatRole(admin.role)}</div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/admin/login'; }}
              className="px-3.5 py-2 text-slate-300 hover:text-white hover:bg-slate-850 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-800 shadow-inner bg-slate-800 cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
