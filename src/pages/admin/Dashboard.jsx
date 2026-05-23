import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, RefreshCw, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';
import { REPORT_CATEGORIES, STATUS_CONFIG, CREDIBILITY_TIER_CONFIG } from '../../utils/constants';

import AdminNavbar from '../../components/admin/AdminNavbar';
import ReportTable from '../../components/admin/ReportTable';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // URL Params State
  const page = parseInt(searchParams.get('page') || '1', 10);
  const statusFilter = searchParams.get('status') || '';
  const categoryFilter = searchParams.get('category') || '';
  const tierFilter = searchParams.get('tier') || '';

  // Local State
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchReports = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const queryParams = { page };
      if (statusFilter) queryParams.status = statusFilter;
      if (categoryFilter) queryParams.category = categoryFilter;
      if (tierFilter) queryParams.compositeTier = tierFilter;  // backend reads compositeTier

      const response = await api.admin.getReports(queryParams);
      
      // Robust data extraction handling different API response structures (Axios, Fetch, nested data, etc.)
      const items = response.reports || response.data?.reports || (Array.isArray(response.data) ? response.data : null) || response.items || (Array.isArray(response) ? response : []);
      const metaData = response.pagination || response.meta || response.data?.pagination || response.data?.meta;
      const meta = metaData || { total: Array.isArray(items) ? items.length : 0, page: 1, pages: 1, limit: 10 };
      
      setReports(Array.isArray(items) ? items : []);
      setPagination(meta);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch admin reports:', error);
      if (isRefresh) {
        toast.error('Failed to refresh dashboard. Please check your connection.');
      } else {
        setReports([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, categoryFilter, tierFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // reset page on filter change
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleReportClick = (id) => {
    navigate(`/admin/reports/${id}`);
  };

  // Stats computation from the active data view
  const totalReportsCount = pagination.total || reports.length;
  const pendingReviewCount = reports.filter(r => r.status === 'RECEIVED' || r.status === 'ESCROW').length;
  const underInvestigationCount = reports.filter(r => r.status === 'INVESTIGATING' || r.status === 'UNDER_REVIEW').length;
  const lowCredibilityCount = reports.filter(r => r.compositeTier === 'LOW' || r.composite_tier === 'LOW').length;

  const hasLowCredibility = lowCredibilityCount > 0;
  const isFiltered = !!(statusFilter || categoryFilter || tierFilter);

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-16">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative">
          <div className="relative z-10 min-w-0">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight break-words">Incident Reports <span className="text-slate-500 font-bold px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-lg align-middle">({totalReportsCount})</span></h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <button 
            onClick={() => fetchReports(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl shadow-sm font-bold transition-colors disabled:opacity-50 w-full sm:w-auto justify-center active:scale-[0.98]"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Sticky Notice for Low Credibility */}
        {hasLowCredibility && (
          <div className="bg-amber-50 border-l-4 border-l-amber-500 border-t border-b border-r border-amber-200 rounded-r-xl rounded-l-sm p-4 mb-8 shadow-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 z-10" />
            <div className="z-10 flex-1">
              <p className="text-amber-900 font-medium text-sm leading-relaxed max-w-4xl text-justify">
                <strong className="font-extrabold text-amber-950">{lowCredibilityCount} report(s)</strong> flagged for extra scrutiny. Please ensure thorough corroboration before taking any action on these reports.
              </p>
            </div>
          </div>
        )}

        {/* Stats Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-800"></div>
            <div className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">Total Tracking</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">{totalReportsCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">Pending Review</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">{pendingReviewCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3">Under Investigation</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-purple-600 tracking-tight">{underInvestigationCount}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="text-slate-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">Actionable Flags <AlertCircle className="w-3.5 h-3.5 text-slate-400" /></div>
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-600 tracking-tight">{lowCredibilityCount}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm mb-6 flex flex-col md:flex-row gap-4 md:items-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-2 text-slate-700 font-extrabold w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-200 pb-3 md:pb-0 md:pr-5 uppercase tracking-wide text-sm shrink-0">
             <Filter className="w-5 h-5 text-blue-600" /> Filters
          </div>
          
          <div className="relative z-10 flex-1 w-full overflow-x-auto pb-1 md:pb-0 hide-scrollbar flex flex-wrap items-center gap-3 pl-2 sm:pl-3 md:pl-0">
            <select 
              value={statusFilter}
              onChange={(e) => updateFilters('status', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white block px-4 py-2.5 pr-10 truncate outline-none font-bold whitespace-nowrap min-w-[150px] max-w-full shadow-sm transition-colors cursor-pointer hover:border-slate-300"
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CONFIG).map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>

            <select 
              value={tierFilter}
              onChange={(e) => updateFilters('tier', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white block px-4 py-2.5 pr-10 truncate outline-none font-bold whitespace-nowrap min-w-[150px] max-w-full shadow-sm transition-colors cursor-pointer hover:border-slate-300"
            >
              <option value="">All Credibility Tiers</option>
              {Object.keys(CREDIBILITY_TIER_CONFIG).map(t => (
                <option key={t} value={t}>{CREDIBILITY_TIER_CONFIG[t].label}</option>
              ))}
            </select>

            <select 
              value={categoryFilter}
              onChange={(e) => updateFilters('category', e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-600 focus:bg-white block px-4 py-2.5 pr-10 truncate outline-none font-bold whitespace-nowrap min-w-[200px] max-w-full shadow-sm transition-colors cursor-pointer hover:border-slate-300"
            >
              <option value="">All Categories</option>
              {REPORT_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
            
            {isFiltered && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm font-black uppercase tracking-wider text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap border border-transparent hover:border-red-200"
              >
                <X className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Report Table */}
        <div className="mb-6 shadow-[0_5px_15px_-5px_rgba(0,0,0,0.05)] rounded-xl relative z-10">
           <ReportTable 
             reports={reports} 
             loading={loading && !refreshing} 
             onReportClick={handleReportClick} 
           />
        </div>

        {/* Pagination Setup */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 sm:px-6 shadow-sm">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">
                  Viewing page <span className="font-extrabold text-slate-800">{pagination.page}</span> of <span className="font-extrabold text-slate-800">{pagination.pages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {/* Create Array of Pages, max 5 visible around current page */}
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (pagination.pages > 5) {
                      if (pagination.page > 3) {
                         pageNum = pagination.page - 2 + i;
                         if (pageNum > pagination.pages) pageNum = pagination.pages - (4 - i);
                      }
                    }
                    if (pageNum > pagination.pages) return null;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold transition-colors ${
                          pagination.page === pageNum
                            ? 'z-10 bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Mobile pagination */}
            <div className="flex items-center justify-between w-full sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-sm"
              >
                Previous
              </button>
              <span className="text-sm font-extrabold text-slate-800 tracking-wide bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-bold rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
