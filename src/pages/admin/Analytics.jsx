import React, { useState, useEffect, useCallback } from 'react';
import { BarChart2, TrendingUp, Calendar, RefreshCw, AlertTriangle, MapPin, Clock } from 'lucide-react';
import { api } from '../../services/api';
import AdminNavbar from '../../components/admin/AdminNavbar';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { 
  CategoryBarChart, 
  StatusPieChart, 
  TierPieChart, 
  DailyTrendLine 
} from '../../components/admin/AnalyticsCharts';
import { formatCategory } from '../../utils/formatters';
import ModernDatePicker from '../../components/admin/ModernDatePicker';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem('asirs_analytics_daterange');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  });

  const handleDateChange = (field, value) => {
    if (!value) return; // Ignore empty values
    setDateRange(prev => {
      const newRange = { ...prev, [field]: value };
      
      if (newRange.startDate && newRange.endDate) {
         const start = new Date(newRange.startDate);
         const end = new Date(newRange.endDate);
         
         if (end < start) {
            if (field === 'startDate') newRange.endDate = value;
            else newRange.startDate = value;
         } else {
            const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diffDays > 365) {
               if (field === 'startDate') {
                  const newEnd = new Date(start);
                  newEnd.setFullYear(start.getFullYear() + 1);
                  newRange.endDate = newEnd.toISOString().split('T')[0];
               } else {
                  const newStart = new Date(end);
                  newStart.setFullYear(end.getFullYear() - 1);
                  newRange.startDate = newStart.toISOString().split('T')[0];
               }
            }
         }
      }
      
      localStorage.setItem('asirs_analytics_daterange', JSON.stringify(newRange));
      return newRange;
    });
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, hotspotsRes] = await Promise.all([
        api.analytics.getOverview({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
        api.analytics.getHotspots({ startDate: dateRange.startDate, endDate: dateRange.endDate })
      ]);
      const overviewPayload = overviewRes?.analytics || overviewRes?.data?.analytics || overviewRes?.data || overviewRes || {};
      const hotspotsPayload = hotspotsRes?.hotspots || hotspotsRes?.data?.hotspots || hotspotsRes?.data || hotspotsRes || [];

      setOverview(overviewPayload);
      setHotspots(Array.isArray(hotspotsPayload) ? hotspotsPayload : []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError(error.message || 'Failed to load analytics');
      setOverview(null);
      setHotspots([]);
    } finally {
      setLoading(false);
    }


  }, [dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const analyticsData = overview || {};
  const reportsByCategory = analyticsData.reportsByCategory || analyticsData.byCategory || [];
  const reportsByStatus = analyticsData.reportsByStatus || analyticsData.byStatus || [];
  const reportsByCredibility = analyticsData.reportsByCredibility || analyticsData.byCredibilityTier || [];
  const dailyTrends = analyticsData.dailyTrends || analyticsData.dailyTrend || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
            {error}
          </div>
        )}
        
        {/* Header & Date Range */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-indigo-600" /> Platform Flow Analytics
            </h1>
            <p className="text-sm text-slate-500 mt-1.5 font-bold">Summary of reports over time.</p>
          </div>

          <div className="flex flex-col sm:flex-row bg-white p-1 rounded-xl border border-slate-200 shadow-sm items-center gap-1 shrink-0 w-full md:w-auto hover:border-indigo-300 transition-all duration-300 focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400">
             <div className="flex flex-col relative px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto">
               <div className="flex items-center gap-1.5 mb-0.5 pointer-events-none">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date</label>
               </div>
               <ModernDatePicker 
                 value={dateRange.startDate} 
                 maxDate={dateRange.endDate}
                 onChange={(val) => handleDateChange('startDate', val)}
                 alignRight={true}
               />
             </div>
             
             <div className="w-full h-px sm:w-px sm:h-8 bg-slate-200 my-1 sm:my-0 sm:mx-1"></div>
             
             <div className="flex flex-col relative px-3 py-1.5 hover:bg-slate-50 rounded-lg transition-colors w-full sm:w-auto">
               <div className="flex items-center gap-1.5 mb-0.5 pointer-events-none">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date</label>
               </div>
               <ModernDatePicker 
                 value={dateRange.endDate} 
                 minDate={dateRange.startDate}
                 maxDate={new Date().toISOString().split('T')[0]}
                 onChange={(val) => handleDateChange('endDate', val)}
                 alignRight={true}
               />
             </div>
          </div>
        </div>

        <div className={`transition-all duration-150 ${loading ? 'opacity-80 translate-y-0.5' : 'opacity-100 translate-y-0'}`}>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-3xl -mr-6 -mt-6"></div>
            <div className="text-indigo-900 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 z-10 relative">
               <TrendingUp className="w-4 h-4 text-indigo-500" /> System Total Reports
            </div>
            {loading ? <div className="h-10 bg-slate-200 animate-pulse rounded w-24"></div> : (
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tighter relative z-10">{analyticsData.totalReports || 0}</div>
            )}
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full blur-3xl -mr-6 -mt-6"></div>
            <div className="text-emerald-900 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 z-10 relative">
               <Clock className="w-4 h-4 text-emerald-500" /> Avg. Time
            </div>
            {loading ? <div className="h-10 bg-slate-200 animate-pulse rounded w-32"></div> : (
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tighter relative z-10">{analyticsData.averageResolutionTime ? `${analyticsData.averageResolutionTime} hrs` : 'N/A'}</div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-full blur-3xl -mr-6 -mt-6"></div>
             <div className="text-indigo-900 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2 z-10 relative">
                <Calendar className="w-4 h-4 text-indigo-500" /> Active Frame
             </div>
             <div className="text-xl sm:text-2xl font-extrabold text-indigo-700 tracking-tighter relative z-10 truncate">
               {new Date(dateRange.startDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} - {new Date(dateRange.endDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
             </div>
          </div>
        </div>

        {/* Chart Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
           <ChartCard title="Categories" loading={loading}>
              <CategoryBarChart data={reportsByCategory} />
           </ChartCard>
           
           <ChartCard title="Status" loading={loading}>
              <StatusPieChart data={reportsByStatus} />
           </ChartCard>

           <ChartCard title="AI Tier" loading={loading}>
              <TierPieChart data={reportsByCredibility} />
           </ChartCard>

           <ChartCard title="Trends" loading={loading}>
              <DailyTrendLine data={dailyTrends} />
           </ChartCard>
        </div>

        {/* Hotspots Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="border-b border-slate-200 bg-slate-50 p-4 md:p-6 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                <MapPin className="w-5 h-5 text-red-500" /> Hotspots
              </h2>
           </div>
           
           <div className="overflow-x-auto max-md:hidden">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead className="bg-white text-slate-500 font-extrabold uppercase tracking-widest text-[11px] border-b border-slate-200">
                 <tr>
                   <th className="px-6 py-4 border-r border-slate-100">Location</th>
                   <th className="px-6 py-4 border-r border-slate-100">Count</th>
                   <th className="px-6 py-4">Top Category</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 bg-slate-50/20">
                 {loading ? [1,2,3].map(i => (
                   <tr key={i} className="animate-pulse">
                     <td className="px-6 py-5 border-r border-slate-100"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                     <td className="px-6 py-5 border-r border-slate-100"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                     <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                   </tr>
                  )) : !Array.isArray(hotspots) || hotspots.length === 0 ? (
                    <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-bold tracking-wide">No hotspots found.</td></tr>
                  ) : hotspots.slice(0, 10).map((spot, i) => (
                   <tr key={i} className={`hover:bg-slate-50 border-white border-b-2 transition-colors ${spot.count > 5 ? 'border-l-4 border-l-red-500 shadow-sm' : 'border-l-4 border-l-transparent'}`}>
                     <td className="px-6 py-4 font-black text-slate-800 flex items-center gap-2 border-r border-slate-100">{spot.location || 'Unknown location'}</td>
                     <td className="px-6 py-4 border-r border-slate-100">
                       <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black shadow-inner border tracking-wider ${spot.count > 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                         {spot.count} {spot.count > 5 && <AlertTriangle className="w-3 h-3 ml-1 text-red-600" />}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-slate-700 font-bold uppercase tracking-wider text-[11px]">{formatCategory(spot.dominantCategory || spot.dominant_category)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>

           <div className="md:hidden divide-y divide-slate-100">
             {loading ? [1,2,3].map(i => (
               <div key={i} className="animate-pulse p-4 space-y-3">
                 <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                 <div className="h-4 bg-slate-200 rounded w-24"></div>
                 <div className="h-4 bg-slate-200 rounded w-1/2"></div>
               </div>
              )) : !Array.isArray(hotspots) || hotspots.length === 0 ? (
                <div className="px-4 py-10 text-center text-slate-500 font-bold tracking-wide">No hotspots found.</div>
              ) : hotspots.slice(0, 10).map((spot, i) => (
               <div key={i} className={`p-4 ${spot.count > 5 ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-transparent'}`}>
                 <div className="flex items-start justify-between gap-3">
                   <div className="min-w-0">
                     <div className="font-black text-slate-800 truncate">{spot.location || 'Unknown location'}</div>
                     <div className="mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formatCategory(spot.dominantCategory || spot.dominant_category)}</div>
                   </div>
                   <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-black shadow-inner border tracking-wider ${spot.count > 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                     {spot.count}
                   </span>
                 </div>
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
    </div>
  );
}

const ChartCard = ({ title, loading, children }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden flex flex-col h-full">
    <h3 className="text-[13px] font-black text-slate-900 mb-6 uppercase tracking-widest border-b border-slate-100 pb-3">{title}</h3>
    <div className="flex-1 flex items-center justify-center">
      {loading ? (
        <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
        </div>
      ) : (
        <div className="w-full h-full">
          {children}
        </div>
      )}
    </div>
  </div>
);
