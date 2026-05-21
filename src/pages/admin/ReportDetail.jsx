import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Shield, CheckCircle, AlertTriangle, 
  FileText, MapPin, Clock, Tag, Eye, Download
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { api } from '../../services/api';
import { resolveBaseUrl } from '../../services/apiClient';
import { formatCategory, formatDateTime } from '../../utils/formatters';
import { STATUS_CONFIG, CREDIBILITY_TIER_CONFIG } from '../../utils/constants';

import AdminNavbar from '../../components/admin/AdminNavbar';
import AIAssessmentPanel from '../../components/admin/AIAssessmentPanel';
import StatusControls from '../../components/admin/StatusControls';
import AdminMessageThread from '../../components/admin/AdminMessageThread';
import AuditLog from '../../components/admin/AuditLog';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recordingOutcome, setRecordingOutcome] = useState(false);
  const [showFalseConfirm, setShowFalseConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'assessment' | 'messages' | 'audit'
  const [activeMedia, setActiveMedia] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      const response = await api.admin.getReportDetails(id);
      setReport(response.report || response.data?.report || response);
    } catch (err) {
      toast.error(err.message || 'Failed to load report details');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Poll for updates if the AI assessment is still pending
  useEffect(() => {
    let intervalId;
    if (report?.aiAnalysisStatus === 'PENDING') {
      intervalId = setInterval(() => {
        fetchReport();
      }, 5000); // Poll every 5 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [report?.aiAnalysisStatus, fetchReport]);

  const handleStatusUpdated = () => {
    fetchReport(); // Re-fetch to get new status and audit logs
  };

  const handleMessageSent = () => {
    fetchReport();
  };

  const handleRecordOutcome = async (outcome) => {
    if (outcome === 'FALSE' && !showFalseConfirm) {
      setShowFalseConfirm(true);
      return;
    }

    setRecordingOutcome(true);
    try {
      await api.admin.updateReportOutcome(id, { outcome });
      toast.success(`Outcome recorded as ${outcome.replace(/_/g, ' ')}`);
      setShowFalseConfirm(false);
      fetchReport();
    } catch (err) {
      toast.error(err.message || 'Failed to record outcome');
    } finally {
      setRecordingOutcome(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
           <LoadingSpinner className="w-8 h-8 border-4 text-blue-600" />
        </div>
      </div>
    );
  }

  // Derived Values
  const statusInfo = STATUS_CONFIG[report.status] || { label: report.status, colour: 'bg-slate-100 text-slate-600' };
  const compositeTier = report.compositeTier || report.composite_tier;
  const tierInfo = CREDIBILITY_TIER_CONFIG[compositeTier] || CREDIBILITY_TIER_CONFIG.UNAVAILABLE;
  const isVerified = report.isStudentVerified || report.is_student_verified;
  const rawMediaItems = [
    ...(Array.isArray(report.evidence) ? report.evidence : []),
    ...(Array.isArray(report.media) ? report.media : []),
    ...(report.attachment ? [report.attachment] : []),
    ...(report.mediaUrl ? [{ url: report.mediaUrl, mimeType: report.mediaType, filename: report.mediaName }] : [])
  ].filter(Boolean);

  const mediaItems = rawMediaItems.filter((item, index, self) => {
    const itemUrl = item.url || item.file_path || item.path || item.secureUrl || item.id;
    if (!itemUrl) return true;
    return self.findIndex(t => (t.url || t.file_path || t.path || t.secureUrl || t.id) === itemUrl) === index;
  });

  const getMediaUrl = (item) => {
    const candidate = item?.url || item?.fileUrl || item?.path || item?.secureUrl;
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

  const getMediaType = (item) => item?.mimeType || item?.type || item?.contentType || '';
  const isVideo = (item) => getMediaType(item).startsWith('video/');
  
  // Tab classes
  const tabClass = (tabId) => `px-4 py-3 font-bold text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap ${activeTab === tabId ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`;

  // Panels rendering logic
  const renderDetails = () => (
    <div className="space-y-6">
      
      {/* Section 1 - Report Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-0">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-1">Tracking Code</div>
            <div className="font-mono text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-700 tracking-wider mb-4 border border-blue-100 bg-blue-50 inline-block px-3 sm:px-4 py-2 rounded-lg break-all">
              {report.trackingCode || report.tracking_code}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${statusInfo.colour}`}>
                 {statusInfo.label}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${tierInfo.colour}`}>
                 {tierInfo.label}
              </span>
              {isVerified && (
                 <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold shadow-sm">
                   <CheckCircle className="w-3.5 h-3.5" /> Verified
                 </span>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right">
             <div className="text-sm font-bold text-slate-500 flex items-center sm:justify-end gap-1.5 mb-1.5">
               <Clock className="w-4 h-4" /> Submitted
             </div>
             <div className="font-medium text-slate-800">
               {formatDateTime(report.createdAt || report.created_at)}
             </div>
             <div className="text-xs text-slate-500 mt-1">
               {formatDistanceToNow(new Date(report.createdAt || report.created_at), { addSuffix: true })}
             </div>
             
             {/* Reputation Context */}
             {report.rtcReputationScore !== undefined && (
               <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Source History</div>
                  <div className="text-sm font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    RTC Reputation Score: <span className="text-blue-600">{report.rtcReputationScore}</span>
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Section 2 - Content Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center justify-between">
           <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
             <FileText className="w-5 h-5 text-indigo-500" />
             Incident Description
           </h2>
           <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
             <Tag className="w-4 h-4" /> {formatCategory(report.category)}
           </div>
        </div>
        
        <div className="p-6 md:p-8 space-y-8">
           
           {/* Primary Description */}
           <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2">Description</div>
             <div className="text-slate-800 leading-relaxed font-medium bg-slate-50/70 border border-slate-100 p-4 sm:p-5 rounded-xl whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
               {report.description}
             </div>
           </div>

           {/* Grid fields */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
             <div>
               <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Location</div>
               <div className="font-medium text-slate-800 flex items-start gap-2">
                 {report.location || 'Not provided'}
               </div>
             </div>
             
             {report.locationDescription && (
               <div>
                 <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2">Location Note</div>
                 <div className="text-sm text-slate-700 italic" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                   &ldquo;{report.locationDescription}&rdquo;
                 </div>
               </div>
             )}
             
             {report.timeOfDay && (
               <div>
                 <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Time</div>
                 <div className="font-medium text-slate-800">
                   {report.timeOfDay.replace(/_/g, ' ')}
                 </div>
               </div>
             )}
           </div>

           {/* Context Fields */}
           {report.reporterContext && (
             <div className="pt-4 border-t border-slate-100">
               <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2">Reporter Note</div>
               <div className="font-medium text-slate-800 leading-relaxed mb-2" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                 {report.reporterContext}
               </div>
               <div className="flex items-start gap-1.5 text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                 <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                 <span className="font-bold">This helps explain why the reporter was there.</span>
               </div>
             </div>
           )}

           {report.uncertaintyStatement && (
             <div className="pt-4 border-t border-slate-100">
               <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2">Uncertainty Note</div>
               <div className="font-medium text-slate-800 leading-relaxed mb-2" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                 {report.uncertaintyStatement}
               </div>
               <div className="flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                 <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                 <span className="font-bold">Admitted uncertainty is evaluated mathematically as a high-value credibility marker. True witnesses rarely hold absolute certainty.</span>
               </div>
             </div>
           )}

        </div>
      </div>

      {/* Section 2b - Reporter Inputs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Reporter Details
          </h2>
          <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500">
            {report.isStudentVerified || report.is_student_verified ? 'Verified' : 'Unverified'}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Category', value: formatCategory(report.category) },
              { label: 'Location', value: report.location || 'Not provided' },
              { label: 'Location Note', value: report.locationDescription || report.location_description || 'Not provided' },
              { label: 'Time', value: report.timeOfDay || report.time_of_day || 'Not provided' },
              { label: 'Reporter Note', value: report.reporterContext || report.reporter_context || 'Not provided' },
              { label: 'Pattern Observation', value: report.patternObservation || report.pattern_observation || 'Not provided' },
              { label: 'Witnesses Present', value: report.witnessPresence || report.witness_presence || 'Not provided' },
              { label: 'Immediate Action', value: report.immediateAction || report.immediate_action || 'Not provided' },
              { label: 'Ongoing Status', value: report.ongoingStatus || report.ongoing_status || 'Not provided' },
              { label: 'Verification', value: report.verificationMethod || report.verification_method || 'Not used' }
            ].map((field) => (
              <div key={field.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{field.label}</div>
                <div className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{field.value}</div>
              </div>
            ))}
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2">Uncertainty Note</div>
            <div className="text-slate-800 leading-relaxed font-medium bg-slate-50/70 border border-slate-100 p-4 sm:p-5 rounded-xl whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
              {report.uncertaintyStatement || report.uncertainty_statement || 'Not provided'}
            </div>
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 border-l-2 border-slate-300 pl-2">Description</div>
            <div className="text-slate-800 leading-relaxed font-medium bg-slate-50/70 border border-slate-100 p-4 sm:p-5 rounded-xl whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
              {report.reporterInputs?.description || report.description}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${report.isStudentVerified || report.is_student_verified ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
              {report.isStudentVerified || report.is_student_verified ? 'Student verified' : 'Anonymous only'}
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-blue-100 text-blue-800">
              {report.evidence?.length || report.media?.length || 0} attachment(s)
            </span>
          </div>
        </div>
      </div>

      {/* Section 3 - Evidence Gallery */}
      {mediaItems.length > 0 && (
         <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
           <div className="border-b border-slate-100 bg-slate-50 p-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-500" />
                Media
              </h2>
           </div>
           <div className="p-6">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {mediaItems.map((item, i) => {
                 const mediaUrl = getMediaUrl(item);
                 const label = item.filename || item.originalName || item.name || `Attachment ${i + 1}`;

                 return (
                   <div key={i} className="border border-slate-200 rounded-lg p-3 bg-slate-50 transition-colors">
                     <div 
                       className="aspect-square mb-3 overflow-hidden rounded-lg bg-slate-200 flex items-center justify-center cursor-pointer group"
                       onClick={() => mediaUrl && setActiveMedia(item)}
                     >
                       {mediaUrl ? (
                         isVideo(item) ? (
                           <video className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300">
                             <source src={mediaUrl} type={getMediaType(item) || undefined} />
                           </video>
                         ) : (
                           <img src={mediaUrl} alt={label} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                         )
                       ) : (
                         <div className="px-3 text-center text-xs font-medium text-slate-500">
                           Preview unavailable
                         </div>
                       )}
                     </div>
                     <div className="font-bold text-xs text-slate-500 truncate mb-2 text-center" title={label}>{label}</div>
                     {mediaUrl && (
                       <button
                         type="button"
                         onClick={() => setActiveMedia(item)}
                         className="flex items-center justify-center gap-1.5 mx-auto w-full bg-white border border-slate-300 shadow-sm text-slate-700 px-3 py-2 sm:py-1.5 rounded-md text-xs font-bold hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
                       >
                         <Eye className="w-3.5 h-3.5" /> View
                       </button>
                     )}
                   </div>
                 );
               })}
               
             </div>
           </div>
         </div>
      )}

    </div>
  );

  const renderAssessment = () => (
    <div className="space-y-6">
      <AIAssessmentPanel 
        compositeScore={report.compositeScore ?? report.composite_score}
        compositeTier={compositeTier}
        geminiDetail={report.geminiDetail || report.aiAssessment || report.aiAnalysis}
        statisticalDetail={report.statisticalDetail || report.statistical_flags}
        structuralDetail={report.structuralDetail || {
          score: report.structuralScore ?? report.structural_score,
          credibilityTier: report.structuralTier || report.structural_tier,
          positiveIndicators: [],
          concernIndicators: []
        }}
        similarityDetail={report.similarityDetail || report.similarity_flags}
        overallSummary={report.overallSummary || report.aiAssessment?.overallSummary}
        forensicConclusion={report.forensicConclusion || report.aiAssessment?.forensicConclusion}
        reviewPriority={report.reviewPriority || report.aiAssessment?.reviewPriority}
        signals={report.signals || report.aiAssessment?.signals || []}
        isLoading={report.aiAnalysisStatus === 'PENDING'}
      />

      <StatusControls 
        reportId={report.id}
        currentStatus={report.status}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Outcome Recording Section */}
      {(report.status === 'RESOLVED' || report.status === 'CLOSED') && !report.outcome && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="bg-slate-50 border-b border-slate-200 p-5">
             <h3 className="font-extrabold text-slate-800">Record Outcome</h3>
             <p className="text-xs text-slate-500 mt-1.5 font-medium pr-4">
               Recording the outcome updates the report history for future review.
             </p>
           </div>

           <div className="p-6">
             {showFalseConfirm ? (
               <div className="bg-red-50 border border-red-200 p-5 rounded-xl animate-in zoom-in-95">
                 <div className="flex items-start gap-3">
                   <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                   <div className="space-y-3">
                     <p className="text-red-900 font-bold text-sm leading-relaxed">
                       Marking this as false will lower future trust for this source. Confirm only if you are sure.
                     </p>
                     <div className="flex gap-3 pt-2">
                       <button 
                         onClick={() => handleRecordOutcome('FALSE')}
                         disabled={recordingOutcome}
                         className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50 text-sm flex items-center justify-center min-w-[100px]"
                       >
                         {recordingOutcome ? <LoadingSpinner className="w-4 h-4" /> : 'Confirm False'}
                       </button>
                       <button 
                         onClick={() => setShowFalseConfirm(false)}
                         disabled={recordingOutcome}
                         className="bg-white border border-red-200 text-red-800 hover:bg-red-100 px-5 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 text-sm"
                       >
                         Cancel
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => handleRecordOutcome('CORROBORATED')}
                   disabled={recordingOutcome}
                   className="w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 py-3 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50"
                 >
                   <CheckCircle className="w-4 h-4" /> CORROBORATED
                 </button>
                 <button 
                   onClick={() => handleRecordOutcome('UNSUBSTANTIATED')}
                   disabled={recordingOutcome}
                   className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50"
                 >
                   <FileText className="w-4 h-4" /> UNSUBSTANTIATED
                 </button>
                 <button 
                   onClick={() => handleRecordOutcome('FALSE')}
                   disabled={recordingOutcome}
                   className="w-full flex items-center justify-center gap-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 py-3 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50"
                 >
                   <AlertTriangle className="w-4 h-4" /> FALSE REPORT
                 </button>
               </div>
             )}
           </div>
         </div>
      )}
      
      {/* Quick Actions (Future functionality placeholder) */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-sm text-slate-500 font-medium flex items-center gap-2">
         <Shield className="w-4 h-4 shrink-0" />
         No escalated quick actions available for this role.
      </div>
    </div>
  );

  const renderMessages = () => (
    <div className="max-w-3xl mx-auto md:max-w-none">
       <AdminMessageThread 
         reportId={report.id}
         messages={report.messages || []}
         onMessageSent={handleMessageSent}
         reportStatus={report.status}
       />
    </div>
  );

  const renderAudit = () => (
    <div className="max-w-3xl mx-auto md:max-w-none border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
       <AuditLog auditLogs={report.auditLogs || report.audit_logs || report.auditTracker || []} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-4 relative z-20">
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors bg-white hover:bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar border-b border-slate-200 mb-6 bg-white/95 backdrop-blur-sm rounded-t-xl sticky top-0 z-50 shadow-sm">
          <button onClick={() => setActiveTab('details')} className={tabClass('details')}>Details</button>
          <button onClick={() => setActiveTab('assessment')} className={tabClass('assessment')}>Assessment</button>
          <button onClick={() => setActiveTab('messages')} className={tabClass('messages')}>Messages</button>
          <button onClick={() => setActiveTab('audit')} className={tabClass('audit')}>Audit Log</button>
        </div>

        {/* Unified Tabbed Layout */}
        <div className="max-w-5xl mx-auto">
          {activeTab === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderDetails()}
            </div>
          )}

          {activeTab === 'assessment' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderAssessment()}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-slate-800 font-extrabold text-lg mb-4 hidden md:block">Secure Messaging</h3>
              {renderMessages()}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-slate-800 font-extrabold text-lg mb-4 hidden md:block">Immutable Timeline</h3>
              {renderAudit()}
            </div>
          )}
        </div>

      </div>

      {/* Media Viewer Modal */}
      {activeMedia && (
        <Modal 
          isOpen={!!activeMedia} 
          onClose={() => setActiveMedia(null)} 
          title={activeMedia.filename || activeMedia.originalName || activeMedia.name || 'Media Preview'} 
          size="xl"
        >
          <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl overflow-hidden min-h-[50vh]">
            {isVideo(activeMedia) ? (
              <video controls className="max-w-full max-h-[70vh] rounded-lg shadow-sm">
                <source src={getMediaUrl(activeMedia)} type={getMediaType(activeMedia) || undefined} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img 
                src={getMediaUrl(activeMedia)} 
                alt="Evidence preview" 
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            )}
          </div>
          <div className="mt-4 flex justify-between items-center px-2">
             <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md uppercase tracking-widest border border-slate-200">
               {getMediaType(activeMedia) || 'Unknown format'}
             </div>
             <a
               href={getMediaUrl(activeMedia)}
               download={activeMedia.filename || 'evidence'}
               target="_blank"
               rel="noreferrer"
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer"
             >
               <Download className="w-4 h-4" /> Download File
             </a>
          </div>
        </Modal>
      )}

    </div>
  );
}
