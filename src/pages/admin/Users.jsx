import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Edit, UserCheck, UserX, Key, Users, Info, Copy, Eye, EyeOff } from 'lucide-react';

import { api } from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import Modal from '../../components/shared/Modal';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { ADMIN_ROLES } from '../../utils/constants';
import { formatRole, formatDateTime } from '../../utils/formatters';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Reset showPassword when add modal closes
  useEffect(() => {
    if (!showAddModal) {
      setShowPassword(false);
    }
  }, [showAddModal]);

  const { register: registerAdd, handleSubmit: handleAddSubmit, reset: resetAdd, formState: { errors: addErrors } } = useForm();
  const { register: registerEdit, handleSubmit: handleEditSubmit, setValue } = useForm();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const resp = await api.admin.getUsers();
      setUsers(resp.users || resp.data?.users || resp || []);
    } catch {
      toast.error('Failed to load access node accounts.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user) => {
    setSelectedUser(user);
    setValue('name', user.full_name || user.name);
    setValue('role', user.role);
    setValue('isActive', user.is_active !== false && user.isActive !== false); 
    setGeneratedPassword(null);
    setShowEditModal(true);
  };

  const onAddSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.admin.createUser({
        full_name: data.name,
        email: data.email,
        password: data.password,
        role: data.role
      });
      toast.success('System administrator successfully boarded.');
      setShowAddModal(false);
      resetAdd();
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Verification logic failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const onEditSubmit = async (data) => {
    setSubmitting(true);
    setGeneratedPassword(null);
    try {
      await api.admin.updateUser(selectedUser.id, { 
        full_name: data.name,       // backend reads full_name
        role: data.role, 
        is_active: data.isActive    // backend reads is_active
      });
      toast.success('Account state successfully modified.');
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message || 'Operation bounced.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!confirm('Are you certain you wish to override and regenerate constraints for this user?')) return;
    setSubmitting(true);
    try {
      const response = await api.admin.resetUserPassword(selectedUser.id);
      if (response.temporaryPassword) {
        setGeneratedPassword(response.temporaryPassword);
        toast.success('Regeneration successful. Present token to owner immediately.');
      } else {
        toast.success('Password reset signal dispatched successfully.');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to force regeneration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6 relative">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 break-words">
              <Users className="w-6 h-6 text-blue-600 shrink-0" /> Admin Users
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">Add, edit, or disable admin accounts.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 active:scale-95 px-5 py-2.5 rounded-lg shadow-sm font-bold transition-all w-full sm:w-auto justify-center cursor-pointer border border-transparent hover:border-blue-800 relative z-10"
          >
            <Plus className="w-5 h-5" /> Add User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-md:hidden">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-widest text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4 hidden md:table-cell">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  [1,2,3,4].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                      <td className="px-6 py-5 hidden md:table-cell"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                      <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-5"><div className="h-8 bg-slate-200 rounded-full w-20"></div></td>
                      <td className="px-6 py-5 hidden lg:table-cell"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                      <td className="px-6 py-5"><div className="h-9 bg-slate-200 rounded-lg w-28 float-right"></div></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</td></tr>
                ) : (
                  users.map((user) => {
                    const active = user.isActive !== false && user.is_active !== false;
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-800 flex items-center gap-3">
                           <div className={`w-10 h-10 rounded-xl shadow-inner border flex items-center justify-center font-black text-lg ${active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                             {(user.full_name || user.name || 'U').charAt(0)}
                           </div>
                           {user.full_name || user.name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 hidden md:table-cell font-mono text-xs tracking-wider">{user.email}</td>
                        <td className="px-6 py-4"><span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">{formatRole(user.role)}</span></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm text-xs font-bold ${active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {active ? <><UserCheck className="w-4 h-4" /> Active</> : <><UserX className="w-4 h-4" /> Inactive</>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-bold text-xs hidden lg:table-cell tracking-wide">
                          {user.lastLogin || user.last_login ? formatDateTime(user.lastLogin || user.last_login) : 'Unverifiable'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => openEditModal(user)} className="bg-white border text-[11px] uppercase tracking-wider border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer hover:border-slate-400">
                            <Edit className="w-3.5 h-3.5 text-blue-500" /> Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-slate-100">
            {loading ? (
              [1,2,3,4].map(i => (
                <div key={i} className="animate-pulse p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded-lg w-28"></div>
                </div>
              ))
            ) : users.length === 0 ? (
              <div className="px-6 py-12 text-center text-slate-400 font-medium">No users found.</div>
            ) : (
              users.map((user) => {
                const active = user.isActive !== false && user.is_active !== false;
                return (
                  <div key={user.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl shadow-inner border flex items-center justify-center font-black text-lg shrink-0 ${active ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-800 truncate">{user.name}</div>
                          <div className="text-xs text-slate-500 font-mono truncate">{user.email}</div>
                        </div>
                      </div>
                      <button onClick={() => openEditModal(user)} className="bg-white border text-[11px] uppercase tracking-wider border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer hover:border-slate-400">
                        <Edit className="w-3.5 h-3.5 text-blue-500" /> Edit
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">{formatRole(user.role)}</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm text-[11px] font-bold ${active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {active ? <><UserCheck className="w-4 h-4" /> Active</> : <><UserX className="w-4 h-4" /> Inactive</>}
                      </span>
                    </div>
                    <div className="mt-3 text-xs text-slate-500 font-bold">
                      {user.lastLogin || user.last_login ? formatDateTime(user.lastLogin || user.last_login) : 'Unverifiable'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add User" size="md">
        <form onSubmit={handleAddSubmit(onAddSubmit)} className="space-y-5">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-3 text-sm shadow-sm relative overflow-hidden">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5 z-10" />
            <p className="text-indigo-900 font-bold leading-relaxed z-10">Roles control what each admin can see. <span className="bg-indigo-200/50 px-1 rounded">Super Admin can see everything.</span></p>
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 pl-1">Full Name</label>
            <input type="text" {...registerAdd('name', { required: true })} className="w-full px-4 py-3.5 bg-slate-50 font-bold text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white shadow-inner transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 pl-1">Email</label>
            <input type="email" {...registerAdd('email', { required: true })} className="w-full px-4 py-3.5 bg-slate-50 font-bold text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white shadow-inner transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 pl-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                {...registerAdd('password', { required: true, minLength: 8 })} 
                className="w-full px-4 py-3.5 pr-12 bg-slate-50 font-bold text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white shadow-inner transition-colors" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer active:scale-95 flex items-center justify-center border border-transparent"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {addErrors.password && <span className="text-[11px] text-red-600 uppercase tracking-widest font-black mt-2 inline-block border-l-2 border-red-500 pl-2">Use at least 8 characters.</span>}
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 pl-1">Role</label>
            <select {...registerAdd('role', { required: true })} className="w-full px-4 py-3.5 bg-slate-50 font-bold text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white cursor-pointer shadow-sm transition-colors">
              <option value="">Select role</option>
              {Object.entries(ADMIN_ROLES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="pt-6 mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto shadow-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer min-w-[150px] flex justify-center w-full sm:w-auto">
              {submitting ? <LoadingSpinner className="w-5 h-5 border-2" /> : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setGeneratedPassword(null); }} title="Edit User" size="md">
        <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-5">
          
          <div className="bg-slate-50 border border-slate-300 shadow-inner p-4 rounded-xl mb-6 font-mono text-[11px] tracking-widest text-slate-500 space-y-1.5 uppercase font-bold">
             <div className="flex gap-2"><span className="text-slate-400 w-24">Email:</span> <span className="text-blue-700 truncate">{selectedUser?.email}</span></div>
             <div className="flex gap-2"><span className="text-slate-400 w-24">ID:</span> <span className="text-slate-700">{selectedUser?.id?.substr(0,18)}...</span></div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 pl-1">Full Name</label>
            <input type="text" {...registerEdit('name', { required: true })} className="w-full px-4 py-3.5 bg-white font-bold text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 shadow-sm transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-800 mb-1.5 pl-1">Role</label>
            <select {...registerEdit('role', { required: true })} className="w-full px-4 py-3.5 bg-white font-bold text-sm border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-sm transition-colors">
              {Object.entries(ADMIN_ROLES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-4 rounded-xl border border-slate-200 mt-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={(e) => {
            // allows clicking the whole box to toggle checkbox organically
            if (e.target.tagName !== 'INPUT') {
              const el = document.getElementById('isActive');
              if (el) el.click();
            }
          }}>
            <input type="checkbox" id="isActive" {...registerEdit('isActive')} className="w-5 h-5 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-inner" />
            <div className="flex flex-col">
               <label htmlFor="isActive" className="text-sm font-black text-slate-900 cursor-pointer uppercase tracking-tight">Active</label>
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Can log in.</span>
            </div>
          </div>

          <div className="border-t-2 border-slate-100 border-dashed pt-6 mt-6">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2"><Key className="w-4 h-4 text-amber-500" /> Password Reset</h4>
               <button type="button" onClick={handlePasswordReset} disabled={submitting} className="text-[10px] uppercase tracking-widest font-black text-red-600 hover:text-red-800 bg-white hover:bg-red-50 border border-red-200 hover:border-red-300 px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer shadow-sm active:scale-95">
                 Reset
               </button>
             </div>
             
             {generatedPassword && (
               <div className="bg-amber-50 border-l-4 border-l-amber-500 border border-amber-200 rounded-r-xl rounded-l-sm p-4 animate-in zoom-in-95 shadow-sm mt-3 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -mr-6 -mt-6"></div>
                 <p className="text-[10px] font-black text-amber-900 mb-2.5 uppercase tracking-widest flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> New Password</p>
                 <div className="flex items-center justify-between bg-white border border-amber-300 pl-4 pr-1 py-1 rounded-lg shadow-sm">
                    <span className="font-mono text-base font-extrabold tracking-wider text-slate-800 select-all">{generatedPassword}</span>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(generatedPassword); toast.success('Regen payload copied aggressively to clipboard.'); }} className="text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 p-2 rounded-md cursor-pointer transition-colors m-1 font-bold tracking-widest uppercase text-[10px] flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> Export
                    </button>
                 </div>
               </div>
             )}
          </div>

          <div className="pt-6 mt-6 flex justify-end gap-3 border-t border-slate-100">
            <button type="button" onClick={() => { setShowEditModal(false); setGeneratedPassword(null); }} className="px-5 py-3 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer shadow-sm w-full sm:w-auto">Cancel</button>
            <button type="submit" disabled={submitting} className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50 cursor-pointer min-w-[150px] flex justify-center w-full sm:w-auto">
              {submitting ? <LoadingSpinner className="w-5 h-5 border-2" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
