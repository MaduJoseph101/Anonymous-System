import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, BarChart2, Users, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatRole } from '../../utils/formatters';

export default function AdminNavbar() {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const [showBottomNav, setShowBottomNav] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY <= 0) {
        setShowBottomNav(true);
        lastScrollY = currentScrollY;
        return;
      }
      
      if (Math.abs(currentScrollY - lastScrollY) < 10) return;

      if (currentScrollY < lastScrollY) {
        setShowBottomNav(false); // Scrolling UP -> Hide
      } else {
        setShowBottomNav(true);  // Scrolling DOWN -> Show
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!admin) return null;

  const isSuperAdmin = admin.role === 'SUPER_ADMIN';
  const isReportDetailPage = location.pathname.startsWith('/admin/reports/');

  return (
    <>
      {/* --- DESKTOP NAVBAR --- */}
      <nav className="desktop-navbar-force flex-col z-50 sticky top-0 w-full bg-slate-900 shadow-md border-b border-slate-800 text-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-row justify-between items-center h-16 py-0 w-full">
            
            {/* Desktop Left: Name and Role */}
            <div className="flex items-center gap-3 min-w-0" style={{ width: '33.333333%' }}>
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-blue-700">
                {(admin.name || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="text-sm font-bold leading-tight truncate uppercase text-slate-100">
                  {admin.name || 'Admin'}
                </div>
                <div className="text-[10px] font-medium tracking-wider uppercase truncate text-slate-400">
                  {formatRole(admin.role)}
                </div>
              </div>
            </div>

            {/* Desktop Center: Navigation Links */}
            <div className="flex items-center justify-center gap-2" style={{ width: '33.333333%' }}>
              <Link 
                to="/admin/dashboard" 
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname.includes('/admin/dashboard') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
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
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname.includes('/admin/analytics') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Analytics</span>
                    </div>
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${location.pathname.includes('/admin/users') ? 'bg-slate-800 text-white shadow-inner border border-slate-700' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>Users</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
  
            {/* Desktop Right: Logout */}
            <div className="flex items-center justify-end" style={{ width: '33.333333%' }}>
              <button
                onClick={() => { logout(); window.location.href = '/admin/login'; }}
                className="px-3.5 py-2 text-slate-300 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-slate-700 shadow-sm bg-slate-800 cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* --- MOBILE TOP NAVBAR --- */}
      <nav className={`mobile-navbar-force z-50 transition-all relative bg-transparent text-slate-800 w-full`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className={`flex flex-col w-full ${location.pathname.includes('/admin/dashboard') ? 'py-3' : 'py-0'}`}>
            
            {/* Mobile Top Bar */}
            {location.pathname.includes('/admin/dashboard') && (
              <div className="flex items-center justify-between w-full gap-3 relative z-10">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-blue-700">
                    {(admin.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="text-sm font-bold text-slate-800 leading-tight truncate uppercase">{admin.name || 'Admin'}</div>
                    <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase truncate">{formatRole(admin.role)}</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className={`mobile-navbar-force flex-col fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 text-slate-100 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out ${showBottomNav ? 'translate-y-0' : 'translate-y-[calc(100%+env(safe-area-inset-bottom))]'}`}>
        <div className="flex justify-around items-center h-16 px-2 w-full">
          <Link 
            to="/admin/dashboard" 
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/admin/dashboard') ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Dashboard</span>
          </Link>
          
          {isSuperAdmin && (
            <>
              <Link 
                to="/admin/analytics" 
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/admin/analytics') ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <BarChart2 className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Analytics</span>
              </Link>
              <Link 
                to="/admin/users" 
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${location.pathname.includes('/admin/users') ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users className="w-4 h-4" />
                <span className="text-[9px] font-bold uppercase tracking-wider">Users</span>
              </Link>
            </>
          )}
          
          <button 
            onClick={() => { logout(); window.location.href = '/admin/login'; }}
            className="flex flex-col items-center justify-center w-full h-full gap-1 transition-colors text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
