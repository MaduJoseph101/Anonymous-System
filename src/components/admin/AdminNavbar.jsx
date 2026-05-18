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
        <div className="flex flex-col gap-3 py-3 md:flex-row md:justify-between md:items-center md:h-16 md:py-0">
          
          <div className="flex items-center justify-between md:justify-start gap-3 relative z-10">
            <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30 shrink-0">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">Admin</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar md:flex-1 md:justify-center relative z-10">
            <Link 
              to="/admin/dashboard" 
              className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${location.pathname.includes('/admin/dashboard') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline-block">Dashboard</span>
              </div>
            </Link>
            {isSuperAdmin && (
              <>
                <Link 
                  to="/admin/analytics" 
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${location.pathname.includes('/admin/analytics') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline-block">Analytics</span>
                  </div>
                </Link>
                <Link 
                  to="/admin/users" 
                  className={`px-3 py-2 rounded-md text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${location.pathname.includes('/admin/users') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent'}`}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline-block">Users</span>
                  </div>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 md:gap-4 relative z-10">
            <div className="hidden lg:block text-right border-r border-slate-700 pr-4 mr-2">
              <div className="text-sm font-bold text-white leading-tight">{admin.name || 'Admin'}</div>
              <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">{formatRole(admin.role)}</div>
            </div>
            <button
              onClick={() => { logout(); window.location.href = '/admin/login'; }}
              className="p-2 sm:px-4 sm:py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 text-xs sm:text-sm font-bold border border-transparent hover:border-slate-700 shadow-sm"
              title="Logout"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline-block">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
