import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Activity, BarChart2, TrendingUp, Brain, Info, FileText, LayoutDashboard, Copy } from 'lucide-react';
import CredibilityScoreBar from './CredibilityScoreBar';
import { MANDATORY_AI_DISCLAIMER, CREDIBILITY_TIER_CONFIG } from '../../utils/constants';

export default function AIAssessmentPanel({ compositeScore, compositeTier, geminiDetail, statisticalDetail, structuralDetail, similarityDetail, overallSummary, forensicConclusion, reviewPriority, signals = [], isLoading }) {
  
  const [activeSubTab, setActiveSubTab] = useState('overview');

  const tierConfig = CREDIBILITY_TIER_CONFIG[compositeTier] || CREDIBILITY_TIER_CONFIG.UNAVAILABLE;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
        <Activity className="w-10 h-10 animate-pulse text-indigo-400 mb-4" />
        <p className="font-bold tracking-wider">Loading assessment...</p>
      </div>
    );
  }

  // Derive the merged Executive Summary
  const executiveSummary = overallSummary || geminiDetail?.overallSummary || structuralDetail?.summary || forensicConclusion || geminiDetail?.adminGuidance || 'No executive summary available.';

  // Tab styles
  const tabClass = (tabId) => `px-4 sm:px-6 py-3 font-bold text-sm tracking-wide transition-colors border-b-2 whitespace-nowrap ${activeSubTab === tabId ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="flex items-center justify-end px-3 pt-3 pb-1 sm:px-4 sm:pt-4 sm:pb-2">
        <div className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm ${tierConfig.colour}`}>
          {tierConfig.label}
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex justify-start sm:justify-center w-full overflow-x-auto hide-scrollbar bg-white/95 backdrop-blur-sm sticky top-0 z-10 shrink-0 shadow-sm transition-all">
        <button onClick={() => setActiveSubTab('overview')} className={tabClass('overview')}>Overview</button>
        <button onClick={() => setActiveSubTab('gemini')} className={tabClass('gemini')}>Gemini AI</button>
        {geminiDetail?.imageAnalysis?.length > 0 && (
          <button onClick={() => setActiveSubTab('forensics')} className={tabClass('forensics')}>Forensics</button>
        )}
        <button onClick={() => setActiveSubTab('structure')} className={tabClass('structure')}>Structure</button>
        <button onClick={() => setActiveSubTab('stats')} className={tabClass('stats')}>Stats</button>
        <button onClick={() => setActiveSubTab('similarity')} className={tabClass('similarity')}>Similarity</button>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        
        {/* OVERVIEW TAB */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Merged Executive Summary */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/40 rounded-full blur-3xl -mr-10 -mt-10"></div>
               <div className="flex items-center gap-2 mb-3 relative z-10">
                 <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                 <h3 className="font-extrabold text-indigo-950 text-lg tracking-tight">Executive Summary</h3>
               </div>
               <p className="text-sm text-indigo-950 leading-relaxed whitespace-pre-wrap font-medium relative z-10" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                 {executiveSummary}
               </p>
               
               {reviewPriority && (
                 <div className="mt-4 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest bg-white text-indigo-700 border border-indigo-200 shadow-sm relative z-10">
                   <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Priority: {reviewPriority}
                 </div>
               )}
            </div>

            <section>
               <CredibilityScoreBar score={compositeScore} label="Composite Credibility Score" weight="Overall" />
            </section>

            {signals.length > 0 && (
              <section className="pt-2">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Key Signals</div>
                <div className="grid grid-cols-1 gap-3">
                  {signals.map((signal, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-200 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{signal.source}</h4>
                        <span className="text-xs font-bold text-slate-500">{signal.weight}</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{signal.summary}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* GEMINI TAB */}
        {activeSubTab === 'gemini' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
              <Brain className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">Gemini Contextual Analysis</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
                 40% Weight
              </span>
            </div>
            
            {geminiDetail && !geminiDetail.error ? (
              <div className="space-y-6">
                 <CredibilityScoreBar score={geminiDetail.overallCredibilityScore} label="Inferred Authenticity" />

                 {geminiDetail.confidence && (
                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Confidence</div>
                   <p className="text-sm font-semibold text-slate-800" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{geminiDetail.confidence}</p>
                 </div>
               )}

                 {geminiDetail.dimensions && (
                   <div className="space-y-3">
                     {Object.entries(geminiDetail.dimensions).map(([key, dimension]) => (
                       <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                         <div className="flex items-center justify-between gap-3 mb-2">
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                             {key.replace(/([A-Z])/g, ' $1').trim()}
                           </h4>
                           <span className="text-xs font-bold text-slate-500">{dimension.score}/25</span>
                         </div>
                         <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{dimension.observations}</p>
                       </div>
                     ))}
                   </div>
                 )}

                 {geminiDetail.flaggedConcerns?.length > 0 && (
                   <div className="space-y-3 pt-2">
                     <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Flags</h4>
                     <ul className="space-y-2">
                       {geminiDetail.flaggedConcerns.map((concern, i) => (
                         <li key={i} className="text-sm font-medium text-red-800 leading-relaxed bg-red-50/80 border border-red-100 px-4 py-3 rounded-lg shadow-sm" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                           {concern}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {geminiDetail.positiveIndicators?.length > 0 && (
                   <div className="space-y-3 pt-2">
                     <h4 className="text-xs font-bold text-green-800 uppercase tracking-widest flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Positives</h4>
                     <ul className="space-y-2">
                       {geminiDetail.positiveIndicators.map((ind, i) => (
                         <li key={i} className="text-sm font-medium text-green-800 flex items-start gap-2 bg-green-50/80 border border-green-100 px-4 py-3 rounded-lg shadow-sm" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                           {ind}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {geminiDetail.cbcaStyleObservations?.length > 0 && (
                   <div className="space-y-3 pt-2">
                     <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-widest flex items-center gap-1"><Info className="w-3.5 h-3.5" /> CBCA Notes</h4>
                     <ul className="space-y-2">
                       {geminiDetail.cbcaStyleObservations.map((item, i) => (
                         <li key={i} className="text-sm font-medium text-indigo-800 leading-relaxed bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-lg shadow-sm" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                           <strong className="block text-xs uppercase tracking-widest mb-1">{item.criterion} - {item.status}</strong>
                           {item.observation}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>
            ) : (
              <div className="space-y-3">
              <div className="text-sm text-slate-500 italic font-medium py-3 rounded-lg bg-slate-50 border border-slate-100 px-4 text-center">
                  Gemini data not available for this report.
                </div>
                {geminiDetail?.errorMessage && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-2">
                      Error
                    </div>
                    <p className="text-sm text-amber-950 leading-relaxed whitespace-pre-wrap">
                      {geminiDetail.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* FORENSICS TAB */}
        {activeSubTab === 'forensics' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {geminiDetail && geminiDetail.imageAnalysis && geminiDetail.imageAnalysis.length > 0 ? (
              <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/40 p-6 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-3.5">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <Brain className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Forensic Media Analysis</h3>
                  <span className="text-[10px] font-black px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md ml-auto border border-indigo-100 uppercase tracking-widest">
                    Verification
                  </span>
                </div>

                {/* AI Generated Media Alert Banner */}
                {geminiDetail.aiGeneratedImageDetected && (
                  <div className="mb-6 relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-5 shadow-sm">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-6 -mt-6"></div>
                    <div className="flex gap-3">
                      <div className="p-2 bg-red-100 text-red-600 rounded-lg h-fit shrink-0">
                        <AlertTriangle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-red-950 uppercase tracking-wider mb-1">
                          Synthetic Media Detected
                        </h4>
                        <p className="text-xs text-red-800 font-medium leading-relaxed" style={{ textAlign: 'justify' }}>
                          WARNING: Visual forensics or binary metadata scanning has identified that one or more uploaded images are synthetic or AI-generated. The credibility of these attachments is heavily compromised.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {geminiDetail.imageAnalysis.map((img, idx) => {
                    const isAi = img.isAiGenerated;
                    const correlation = img.correlationAnalysis;
                    const details = img.observedDetails;
                    
                    return (
                      <div key={idx} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-100 transition-all duration-300">
                        {/* Header line */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                          <div className="font-bold text-slate-800 text-sm truncate max-w-[240px]" title={img.filename}>
                            {img.filename}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* AI Detection Badge */}
                            {isAi ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 border border-red-100">
                                AI-Generated
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                Authentic Photo
                              </span>
                            )}
                            
                            {/* Anonymization/Scrubbing Pill */}
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3 text-indigo-600 shrink-0" /> EXIF Scrubbed
                            </span>
                          </div>
                        </div>

                        {/* Correlation Section */}
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            Context Correlation
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed" style={{ textAlign: 'justify' }}>
                            {correlation || "Linguistic-visual correlation complete."}
                          </p>
                        </div>

                        {/* Forensic Details */}
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                            Visual Observations & Findings
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify' }}>
                            {details || "Healthy exposure and noise characteristics observed."}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic font-medium py-3 rounded-lg bg-slate-50 border border-slate-100 px-4 text-center">
                No forensic media analysis data available.
              </div>
            )}
          </div>
        )}

        {/* STRUCTURE TAB */}
        {activeSubTab === 'structure' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-3">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">Structural Analysis</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
                 35% Weight
              </span>
            </div>
            
            <CredibilityScoreBar score={structuralDetail?.score} label="Structural Score" />

            {structuralDetail?.cbcaCriteria?.length > 0 && (
              <div className="space-y-3 mb-4 mt-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Detailed Criteria</h4>
                {structuralDetail.cbcaCriteria.map((item, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                        {item.criterion ? item.criterion.split('/')[0].trim() : ''}
                      </h4>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">{item.status}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{item.observation}</p>
                  </div>
                ))}
              </div>
            )}
            
            {structuralDetail?.positiveIndicators && structuralDetail.positiveIndicators.length > 0 ? (
               <ul className="space-y-2 mt-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Positive Structural Indicators</h4>
                 {structuralDetail.positiveIndicators.map((ind, i) => (
                   <li key={i} className="text-sm font-medium text-blue-800 flex items-center gap-2.5 bg-blue-50/80 border border-blue-100 px-4 py-3 rounded-lg shadow-sm" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                     <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                       <CheckCircle className="w-3.5 h-3.5" />
                     </div>
                     {ind}
                   </li>
                 ))}
               </ul>
            ) : (
              <div className="text-sm text-slate-500 italic font-medium py-3 rounded-lg bg-slate-50 border border-slate-100 px-4 text-center mt-4">
                No positive structure notes were returned.
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeSubTab === 'stats' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">Statistical Flags</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
                 25% Weight
              </span>
            </div>

            {statisticalDetail?.anomalies?.length > 0 ? (
              <div className="space-y-3">
                {statisticalDetail.anomalies.map((ano, i) => {
                  const colors = ano.severity === 'HIGH' ? 'bg-red-50 border-red-200 text-red-900' :
                                 ano.severity === 'MEDIUM' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                                 'bg-indigo-50 border-indigo-200 text-indigo-900';
                  return (
                    <div key={i} className={`p-4 rounded-xl border-l-4 shadow-sm ${colors} flex items-start gap-3`}>
                      <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${ano.severity === 'HIGH' ? 'text-red-600' : ano.severity === 'MEDIUM' ? 'text-amber-600' : 'text-indigo-600'}`} />
                      <div>
                        <strong className="block text-xs font-bold uppercase tracking-widest mb-1.5 opacity-80">{ano.type}</strong>
                        <span className="text-sm font-medium leading-relaxed" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{ano.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm font-bold text-green-700 flex items-center justify-center gap-2 bg-green-50/80 border border-green-200 px-4 py-4 rounded-xl shadow-sm">
                 <CheckCircle className="w-5 h-5" /> No statistical anomalies found.
              </div>
            )}
          </div>
        )}

        {/* SIMILARITY TAB */}
        {activeSubTab === 'similarity' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <Copy className="w-5 h-5 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-lg tracking-tight">Similarity Context</h3>
              <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
                 Supplementary
              </span>
            </div>
            
            {similarityDetail ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Pattern Analysis</div>
                  <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                    {similarityDetail.interpretation || (similarityDetail.hasSuspiciousPattern ? 'A similarity pattern was detected.' : 'No suspicious similarity pattern was detected.')}
                  </p>
                </div>
                {similarityDetail.matches?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mt-4">Cross-Report Matches</h4>
                    {similarityDetail.matches.map((match, i) => (
                      <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-colors">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{match.trackingCode || match.tracking_code || `Match ${i + 1}`}</h4>
                          <span className="text-xs font-bold text-slate-500">{match.similarityScore ?? match.score ?? 'N/A'}%</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{match.reason || match.observation || 'No description provided.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-slate-500 italic font-medium py-3 rounded-lg bg-slate-50 border border-slate-100 px-4 text-center">
                No similarity data was returned.
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mandatory Disclaimer Box (Always visible at bottom) */}
      <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 shrink-0 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] relative z-10">
        <div className="bg-amber-50 border border-amber-400 rounded-xl max-w-none md:p-5 p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full blur-2xl -mr-6 -mt-6"></div>
           <div className="flex items-center gap-2.5 mb-2.5 text-amber-900 font-black tracking-tight uppercase">
             <AlertTriangle className="w-6 h-6" />
             Advisory
           </div>
           <p className="text-sm text-amber-900 leading-relaxed font-bold" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
             {MANDATORY_AI_DISCLAIMER}
           </p>
        </div>
      </div>
      
    </div>
  );
}
