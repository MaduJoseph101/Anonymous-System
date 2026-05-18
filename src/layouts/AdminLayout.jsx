import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-900">
      {/* Sidebar for Admin Navigation */}
      <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <span className="text-xl font-bold text-white tracking-tight">ASIRS Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin/reports" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <LayoutDashboard size={18} />
            Cases
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors">
            <Users size={18} />
            Users
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition-colors text-sm">
             <LogOut size={16} />
             Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-8 flex items-center justify-between md:justify-end">
           <div className="md:hidden font-bold text-slate-900">ASIRS Admin</div>
           <div className="flex items-center gap-4">
             <span className="text-sm font-medium text-slate-500">Administrator</span>
             <div className="h-8 w-8 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-700 font-bold text-sm">
                A
             </div>
           </div>
        </header>
        
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
