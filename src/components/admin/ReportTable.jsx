import React from 'react';
import { MessageCircle, CheckCircle, Inbox } from 'lucide-react';
import { STATUS_CONFIG, CREDIBILITY_TIER_CONFIG } from '../../utils/constants';
import { formatCategory, formatRelativeTime } from '../../utils/formatters';

export default function ReportTable({ reports = [], loading, onReportClick }) {
  
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-md:hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tracking Code</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 hidden md:table-cell">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 hidden lg:table-cell">AI Tier</th>
                <th className="px-6 py-4">Messages</th>
                <th className="px-6 py-4">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
                  <td className="px-6 py-5 hidden md:table-cell"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                  <td className="px-6 py-5"><div className="h-6 bg-slate-200 rounded-full w-20"></div></td>
                  <td className="px-6 py-5 hidden lg:table-cell"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
                  <td className="px-6 py-5"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="md:hidden p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-8 bg-slate-200 rounded-lg"></div>
                <div className="h-8 bg-slate-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <div className="bg-slate-50 p-4 rounded-full mb-4 inline-flex">
          <Inbox className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2">No reports found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          No reports match the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto max-md:hidden min-h-[100px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 hidden sm:table-cell">&nbsp;</th>
              <th className="px-6 py-4">Tracking Code</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 hidden md:table-cell">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 hidden lg:table-cell">AI Tier</th>
              <th className="px-6 py-4">Messages</th>
              <th className="px-6 py-4">Submitted</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {reports.map((report) => {
              // Handle both camelCase and snake_case just in case API differs
              const trackingCode = report.trackingCode || report.tracking_code;
              const isVerified = report.isStudentVerified || report.is_student_verified;
              const compositeTier = report.compositeTier || report.composite_tier;
              const aiStatus = report.aiAnalysisStatus || report.ai_analysis_status;
              const statusKey = report.status;
              const categoryKey = report.category;
              
              const statusInfo = STATUS_CONFIG[statusKey] || { label: statusKey, colour: 'bg-slate-100 text-slate-600' };
              const tierInfo = CREDIBILITY_TIER_CONFIG[compositeTier] || CREDIBILITY_TIER_CONFIG.UNAVAILABLE;
              
              const isLowTier = compositeTier === 'LOW';
              const borderClass = isLowTier ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-transparent';
              
              // Handle truncation for location
              let loc = report.location || '';
              if (loc.length > 30) loc = loc.substring(0, 30) + '...';
              
              // Message count: list API returns _count.messages (a number), not a messages array
              const messageCount = report._count?.messages ?? report.messages?.length ?? 0;

              return (
                <tr 
                  key={report.id} 
                  onClick={() => onReportClick(report.id)}
                  className={`hover:bg-blue-50 cursor-pointer transition-colors group ${borderClass}`}
                >
                  <td className="px-4 py-4 w-1 hidden sm:table-cell">
                    {isLowTier && (
                      <div className="w-2 h-2 rounded-full bg-amber-400" title="Low tier assessment" />
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <span className="font-mono text-blue-700 font-bold truncate max-w-[100px] sm:max-w-none">{trackingCode}</span>
                       {isVerified && (
                         <CheckCircle className="w-4 h-4 text-green-500 shrink-0" title="Verified Student" />
                       )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {formatCategory(categoryKey)}
                  </td>
                  
                  <td className="px-6 py-4 text-slate-500 hidden md:table-cell max-w-[200px] truncate" title={report.location}>
                    {loc || '-'}
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusInfo.colour}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {aiStatus === 'COMPLETE' || aiStatus === 'COMPLETED' ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${tierInfo.colour}`}>
                        {tierInfo.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
                        Pending
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    {messageCount > 0 ? (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-bold">{messageCount}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-slate-500 text-sm">
                    {formatRelativeTime(report.createdAt || report.created_at)}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onReportClick(report.id); }}
                      className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-slate-100">
        {reports.map((report) => {
          const trackingCode = report.trackingCode || report.tracking_code;
          const compositeTier = report.compositeTier || report.composite_tier;
          const aiStatus = report.aiAnalysisStatus || report.ai_analysis_status;
          const statusInfo = STATUS_CONFIG[report.status] || { label: report.status, colour: 'bg-slate-100 text-slate-600' };
          const tierInfo = CREDIBILITY_TIER_CONFIG[compositeTier] || CREDIBILITY_TIER_CONFIG.UNAVAILABLE;
          const isVerified = report.isStudentVerified || report.is_student_verified;
          const messageCount = report._count?.messages ?? report.messages?.length ?? 0;

          return (
            <button
              key={report.id}
              onClick={() => onReportClick(report.id)}
              className="w-full text-left p-4 bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-blue-700 font-bold text-sm">{trackingCode}</span>
                    {isVerified && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                  </div>
                  <div className="text-sm font-medium text-slate-800 mt-1">{formatCategory(report.category)}</div>
                  <div className="text-xs text-slate-500 mt-1">{report.location || '-'}</div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusInfo.colour}`}>{statusInfo.label}</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">AI Tier</div>
                  <div className="mt-1 text-xs font-extrabold text-slate-800">
                    {aiStatus === 'COMPLETE' || aiStatus === 'COMPLETED' ? tierInfo.label : 'Pending'}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Submitted</div>
                  <div className="mt-1 text-xs font-extrabold text-slate-800">{formatRelativeTime(report.createdAt || report.created_at)}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{messageCount ? `${messageCount} messages` : 'No messages'}</span>
                <span>{compositeTier || 'UNAVAILABLE'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
