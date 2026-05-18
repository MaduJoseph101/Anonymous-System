import React from 'react';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder Stat Cards */}
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <span className="text-sm font-medium text-slate-500">Active Cases</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <span className="text-sm font-medium text-slate-500">Unread Messages</span>
          <p className="text-3xl font-bold text-primary-600 mt-2">0</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xs border border-slate-200">
          <span className="text-sm font-medium text-slate-500">Resolved Today</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Recent Cases</h3>
        </div>
        <div className="p-6 text-center text-slate-500 py-12">
          No cases reported yet. Wait for a connection to the API.
        </div>
      </div>
    </div>
  );
}
