import React from 'react';
import { AlertTriangle, CheckCircle, Activity, BarChart2, TrendingUp, Brain, Info, FileText } from 'lucide-react';
import CredibilityScoreBar from './CredibilityScoreBar';
import { MANDATORY_AI_DISCLAIMER, CREDIBILITY_TIER_CONFIG } from '../../utils/constants';

export default function AIAssessmentPanel({ compositeScore, compositeTier, geminiDetail, statisticalDetail, structuralDetail, similarityDetail, overallSummary, forensicConclusion, reviewPriority, signals = [], isLoading }) {
  
  const tierConfig = CREDIBILITY_TIER_CONFIG[compositeTier] || CREDIBILITY_TIER_CONFIG.UNAVAILABLE;

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
        <Activity className="w-10 h-10 animate-pulse text-indigo-400 mb-4" />
        <p className="font-bold tracking-wider">Loading assessment...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 text-slate-800 font-extrabold text-sm sm:text-base tracking-tight">
          <Activity className="w-5 h-5 text-indigo-600" />
          Assessment
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-sm ${tierConfig.colour}`}>
          {tierConfig.label}
        </div>
      </div>

      <div className="p-6 space-y-10 flex-1 overflow-y-auto">
        
        {/* Section 1 - Composite Score */}
        <section>
           <CredibilityScoreBar score={compositeScore} label="Composite Structural Score" weight="Overall" />
           <div className="mt-5 grid grid-cols-1 gap-3">
             <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
               <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Conclusion</div>
               <p className="text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                 {forensicConclusion || geminiDetail?.overallSummary || geminiDetail?.adminGuidance || 'No conclusion available.'}
               </p>
             </div>
             {reviewPriority && (
               <div className="inline-flex w-fit items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200">
                 <FileText className="w-4 h-4" /> Review Priority: {reviewPriority}
               </div>
             )}
           </div>
         </section>

        {/* Section 2 - Gemini AI Analysis */}
        <section>
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Gemini</h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
               40%
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

               {geminiDetail.overallSummary && (
                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Summary</div>
                   <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{geminiDetail.overallSummary}</p>
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
                 <div className="space-y-3">
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
                 <div className="space-y-3 mt-6">
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
                 <div className="space-y-3 mt-6">
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
        </section>

        {/* Section 3 - Structural Analysis */}
        <section>
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Structure</h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
               35%
            </span>
          </div>
          
          <div className="text-sm text-slate-500 italic font-medium py-2 pb-4">Basic pattern checks.</div>
          <CredibilityScoreBar score={structuralDetail?.score} label="Structural Score" weight="35%" />

          {structuralDetail?.summary && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 mb-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Summary</div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{structuralDetail.summary}</p>
            </div>
          )}

          {structuralDetail?.cbcaCriteria?.length > 0 && (
            <div className="space-y-3 mb-4">
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
             <ul className="space-y-2">
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
            <div className="text-sm text-slate-500 italic font-medium py-3 rounded-lg bg-slate-50 border border-slate-100 px-4">
              No positive structure notes were returned.
            </div>
          )}
        </section>

        {/* Section 4 - Statistical Flags */}
        <section>
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Stats</h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
               25%
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
               <CheckCircle className="w-5 h-5" /> No statistical issues found.
            </div>
          )}
        </section>

        {/* Section 5 - Similarity Context */}
        <section>
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <TrendingUp className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Similarity</h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
               Supplementary
            </span>
          </div>
          {similarityDetail ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Summary</div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>
                  {similarityDetail.interpretation || (similarityDetail.hasSuspiciousPattern ? 'A similarity pattern was detected.' : 'No suspicious similarity pattern was detected.')}
                </p>
              </div>
              {similarityDetail.matches?.length > 0 && (
                <div className="space-y-2">
                  {similarityDetail.matches.map((match, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
            <div className="text-sm text-slate-500 italic font-medium py-3 rounded-lg bg-slate-50 border border-slate-100 px-4">
              No similarity data was returned.
            </div>
          )}
        </section>

        {/* Section 6 - Final Summary */}
        <section>
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 text-lg tracking-tight">Summary</h3>
            <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md ml-auto border border-slate-200 uppercase">
               Conclusion
            </span>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 mb-2">Overall</div>
              <p className="text-sm text-emerald-950 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{overallSummary || geminiDetail?.overallSummary || structuralDetail?.summary || 'No overall summary available.'}</p>
            </div>
            {signals.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {signals.map((signal, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">{signal.source}</h4>
                      <span className="text-xs font-bold text-slate-500">{signal.weight}</span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap" style={{ textAlign: 'justify', textJustify: 'inter-word', wordBreak: 'break-word', hyphens: 'auto' }}>{signal.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 shrink-0 shadow-[0_-10px_40px_-5px_rgba(0,0,0,0.05)] relative z-10">
        <div className="bg-amber-50 border border-amber-400 rounded-xl max-w-none md:p-5 p-4 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-24 h-24 bg-amber-200/30 rounded-full blur-2xl -mr-6 -mt-6"></div>
           <div className="flex items-center gap-2.5 mb-2.5 text-amber-900 font-black tracking-tight" style={{textTransform: 'uppercase'}}>
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
