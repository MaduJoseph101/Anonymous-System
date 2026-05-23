import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Shield, Search, Clock, CheckCircle, AlertTriangle, ArrowLeft, MessageCircle, X } from 'lucide-react';
import { api } from '../../services/api';
import { resolveBaseUrl } from '../../services/apiClient';
import { STATUS_CONFIG } from '../../utils/constants';
import { formatCategory, formatDateTime, formatRelativeTime } from '../../utils/formatters';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function TrackReport() {
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState(null);
  const [pageState, setPageState] = useState('idle'); // 'idle' | 'loading' | 'found' | 'not_found' | 'error'

  const { register, handleSubmit, setValue } = useForm();

  async function handleTrackSubmit(data) {
    const code = data.trackingCode?.trim().toUpperCase();
    if (!code) return;

    setPageState('loading');
    setReport(null);
    try {
      const response = await api.student.trackReport(code);
      // Determine the report object's path based on the potential API formats
      const fetchedReport = response.report || response.data?.report || response;
      if (fetchedReport && !fetchedReport.message) { 
          // If the backend returns a flat 404 message object, catch it
          setReport(fetchedReport);
          setPageState('found');
      } else {
          setPageState('not_found');
      }
    } catch (err) {
      if (err.message?.toLowerCase().includes('404') || err.message?.toLowerCase().includes('not found')) {
        setPageState('not_found');
      } else {
        setPageState('error');
        toast.error(err.message || 'An error occurred while tracking the report.');
      }
    }
  }

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (codeParam) {
      setValue('trackingCode', codeParam);
      setTimeout(() => {
        handleTrackSubmit({ trackingCode: codeParam });
      }, 0);
    }
  }, [searchParams, setValue]);



  const currentStatus = report ? (STATUS_CONFIG[report.status] || { label: report.status, colour: 'bg-slate-100 text-slate-800' }) : null;
  const resolveMediaUrl = (candidate) => {
    if (!candidate) return null;
    if (/^https?:\/\//i.test(candidate)) return candidate;
    
    // Normalize backslashes to forward slashes and ensure a leading slash
    let normalizedPath = candidate.replace(/\\/g, '/');
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }
    
    const baseUrl = resolveBaseUrl().replace(/\/api\/?$/, '');
    return `${baseUrl}${normalizedPath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-700" />
            <h1 className="text-xl font-bold text-slate-800 leading-tight">Track Report</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        {/* Tracker Search Box */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
             <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Search className="w-5 h-5 text-slate-400" /> Enter code
          </h2>
          <form onSubmit={handleSubmit(handleTrackSubmit)} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="e.g. RT-2024-XXXXXX"
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-center sm:text-left text-lg tracking-wider uppercase transition-all"
              {...register('trackingCode', { required: true })}
            />
            <button
              type="submit"
              disabled={pageState === 'loading'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 shrink-0 min-w-[140px]"
            >
              {pageState === 'loading' ? (
                <>
                  <LoadingSpinner className="w-5 h-5 border-2" />
                  <span>Searching...</span>
                </>
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>

        {/* Not Found State */}
        {pageState === 'not_found' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in slide-in-from-bottom-4 relative">
            <button 
              onClick={() => setPageState('idle')}
              className="absolute top-3 left-3 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-2">No report found</h2>
            <p className="text-[11px] sm:text-[13px] text-slate-600 mb-6 max-w-md mx-auto leading-relaxed text-left sm:text-center px-2">
              Please check the code carefully. Tracking codes look like <strong className="font-mono bg-slate-100 px-1 rounded">RT-2024-A3F9C2</strong>.
            </p>
            <Link to="/submit" className="inline-block bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-medium px-4.5 py-2 sm:px-5.5 sm:py-2.5 rounded-xl shadow-sm transition-colors text-[11px] sm:text-[13px]">
              Submit a Report
            </Link>
          </div>
        )}

        {/* Found State */}
        {pageState === 'found' && report && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Category</h3>
                    <div className="text-xl font-bold text-slate-800">{formatCategory(report.category)}</div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Status</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${currentStatus?.colour}`}>
                        {currentStatus?.label}
                      </span>
                      {report.isStudentVerified && (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-bold">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{currentStatus?.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-4 py-3 rounded-xl">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Submitted {formatRelativeTime(report.createdAt)}</span>
                  </div>
                </div>
              </div>

              {report.isInEscrow && report.status !== 'RETRACTED_BY_REPORTER' && (
                <div className="bg-amber-50 rounded-2xl shadow-sm border border-amber-200 p-6 md:p-8 border-l-4 border-l-amber-500 animate-in fade-in">
                  <div className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <AlertTriangle className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h2 className="text-lg font-bold text-amber-900">Report Under Holding Period</h2>
                      <p className="text-amber-800 text-sm leading-relaxed">
                        This report will be reviewed {report.escrowReleaseAt ? formatRelativeTime(report.escrowReleaseAt) : 'soon'}. You can cancel it before then on the Retract page.
                      </p>
                      
                      <div className="pt-2">
                        <Link to="/retract" className="inline-block bg-white hover:bg-amber-100 text-amber-700 border border-amber-300 font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap text-sm">
                          Go to Retract Page
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800">Report details</h2>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">What you submitted</span>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description</h3>
                    <div className="text-slate-800 leading-relaxed font-medium bg-slate-50/70 border border-slate-100 p-4 sm:p-5 rounded-xl whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                      {report.description || 'Not provided'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Location', value: report.location || 'Not provided' },
                      { label: 'Location note', value: report.locationDescription || 'Not provided' },
                      { label: 'Time of day', value: report.timeOfDay ? report.timeOfDay.replace(/_/g, ' ') : 'Not provided' },
                      { label: 'Why there', value: report.reporterContext || 'Not provided' },
                      { label: 'Uncertainty', value: report.uncertaintyStatement || 'Not provided' },
                      { label: 'Verification', value: report.verificationMethod || 'Not used' }
                    ].map((field) => (
                      <div key={field.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{field.label}</p>
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{field.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Submitted</p>
                      <p className="text-sm font-semibold text-slate-800">{formatDateTime(report.createdAt)}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Updated</p>
                      <p className="text-sm font-semibold text-slate-800">{formatDateTime(report.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {Array.isArray(report.evidence) && report.evidence.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="border-b border-slate-100 bg-slate-50 p-5">
                    <h2 className="text-lg font-bold text-slate-800">Media</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {report.evidence.map((item, i) => {
                        const mediaUrl = resolveMediaUrl(item.url || item.path);
                        const isVideo = item.fileType?.startsWith('video/');
                        const label = item.path?.split(/[\\/]/).pop() || `Attachment ${i + 1}`;

                        return (
                          <div key={item.id || i} className="border border-slate-200 rounded-lg p-3 bg-slate-50 transition-colors">
                            <div className="aspect-square mb-3 overflow-hidden rounded-lg bg-slate-200 flex items-center justify-center">
                              {mediaUrl ? (
                                isVideo ? (
                                  <video controls className="h-full w-full object-cover">
                                    <source src={mediaUrl} type={item.fileType || undefined} />
                                  </video>
                                ) : (
                                  <img src={mediaUrl} alt={label} className="h-full w-full object-cover" />
                                )
                              ) : (
                                <div className="px-3 text-center text-xs font-medium text-slate-500">
                                  Preview unavailable
                                </div>
                              )}
                            </div>
                            <div className="font-bold text-xs text-slate-500 truncate mb-2 text-center" title={label}>{label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <aside className="xl:sticky xl:top-24 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Messages</p>
                <h2 className="text-lg font-bold text-slate-800 mb-3">Open full screen chat</h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  View the conversation on its own page so the report stays easy to read.
                </p>
                <Link
                  to={`/track/messages?code=${encodeURIComponent(report.trackingCode)}`}
                  className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open messages
                </Link>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600 leading-relaxed">
                <p className="font-bold text-slate-800 mb-2">Back to report</p>
                <p>You can return here anytime to review the report details again.</p>
              </div>
            </aside>
          </div>
        )}

      </main>
    </div>
  );
}
