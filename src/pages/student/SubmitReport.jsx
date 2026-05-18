import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Shield, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { HIGH_STAKES_CATEGORIES } from '../../utils/constants';

import CategorySelector from '../../components/student/CategorySelector';
import StructuredFields from '../../components/student/StructuredFields';
import EthicalAcknowledgement from '../../components/student/EthicalAcknowledgement';
import CoolingOffTimer from '../../components/student/CoolingOffTimer';
import VerificationSection from '../../components/student/VerificationSection';
import TrackingCodeDisplay from '../../components/student/TrackingCodeDisplay';

export default function SubmitReport() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      category: '',
      location: '',
      description: '',
      locationDescription: '',
      timeOfDay: '',
      reporterContext: '',
      uncertaintyStatement: ''
    }
  });
  
  const [submissionState, setSubmissionState] = useState('idle'); // idle | submitting | success | error
  const [result, setResult] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [coolingComplete, setCoolingComplete] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');

  const handleCoolingComplete = useCallback(() => {
    setCoolingComplete(true);
  }, []);

  const selectedCategory = watch('category');
  const locationValue = watch('location') || '';
  const descriptionValue = watch('description') || '';
  const locationDescriptionValue = watch('locationDescription') || '';
  const timeOfDay = watch('timeOfDay') || '';
  const reporterContext = watch('reporterContext') || '';
  const selectedMedia = watch('media')?.[0] || null;
  const requiresCooling = selectedCategory ? HIGH_STAKES_CATEGORIES.includes(selectedCategory) : false;

  // All asterisk-marked fields must be filled — uncertainty is intentionally excluded
  const canAcknowledge =
    !!selectedCategory &&
    locationValue.length >= 3 &&
    descriptionValue.length >= 30 &&
    locationDescriptionValue.length > 0 &&
    !!timeOfDay &&
    reporterContext.length > 0;

  const onSubmit = async (data) => {
    if (!acknowledged) {
      toast.error('Please complete the ethical acknowledgement.');
      return;
    }
    
    if (requiresCooling && !coolingComplete) {
      toast.error('Mandatory review period is not yet complete.');
      return;
    }

    setSubmissionState('submitting');
    
    const payload = {
      category: data.category,
      location: data.location,
      description: data.description,
    };

    if (data.locationDescription) payload.locationDescription = data.locationDescription;
    if (data.uncertaintyStatement) payload.uncertaintyStatement = data.uncertaintyStatement;
    if (data.reporterContext) payload.reporterContext = data.reporterContext;
    if (data.timeOfDay) payload.timeOfDay = data.timeOfDay;
    if (verificationToken) payload.verificationToken = verificationToken;
    if (selectedMedia) payload.media = selectedMedia;

    try {
      const response = await api.student.submitReport(payload);
      // Our api wrapper directly returns response.json(), so result is likely the object itself
      setResult(response.data || response); 
      setSubmissionState('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmissionState('idle');
      toast.error(error.message || 'Failed to submit report. Please try again.');
    }
  };

  const handleTokenGenerated = useCallback((token) => {
    setVerificationToken(token);
    toast.success('Verification token attached');
  }, []);

  if (submissionState === 'success' && result) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 flex items-center justify-center">
         <TrackingCodeDisplay 
           trackingCode={result.trackingCode}
           isInEscrow={result.isInEscrow}
           isVerified={result.isStudentVerified || !!verificationToken}
           message={result.message}
           onTrackReport={() => navigate('/track')}
           onReturnHome={() => navigate('/')}
         />
      </div>
    );
  }

  const isSubmitDisabled = 
    submissionState === 'submitting' || 
    !acknowledged || 
    (requiresCooling && !coolingComplete) || 
    !selectedCategory;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Header bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-0 py-4 flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-700" />
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">Submit Anonymous Report</h1>
              <p className="text-xs md:text-sm text-slate-500 font-medium">No personal info collected</p>
            </div>
          </div>
        </div>
      </header>

      {/* Privacy notice banner */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-0 py-3 text-sm font-medium tracking-wide">
          Your identity is protected. No name, student ID, email, or IP address is collected.
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <CategorySelector register={register} errors={errors} watch={watch} />

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <label htmlFor="location" className="block text-sm font-bold text-slate-800 mb-2">
              Campus Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              className={`block w-full px-4 py-3 rounded-xl border ${errors.location ? 'border-red-500 ring-1 ring-red-500 bg-red-50/20' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 bg-white transition-colors`}
              placeholder="e.g. Main Library, Ground Floor"
              {...register('location', {
                required: 'Location is required',
                minLength: { value: 3, message: 'Please be more specific' },
                maxLength: { value: 200, message: 'Location description is too long' }
              })}
            />
            {errors.location && <p className="mt-2 text-sm text-red-600 font-medium">{errors.location.message}</p>}
          </div>

          {selectedCategory && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-8">
              <StructuredFields register={register} errors={errors} watch={watch} />
            </div>
          )}

          <div className="space-y-2">
            <VerificationSection onTokenGenerated={handleTokenGenerated} />
            {verificationToken && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-200 font-bold animate-in fade-in shadow-sm">
                ✓ Verification token ready — will be included with your report
              </div>
            )}
          </div>

          {selectedCategory && requiresCooling && (
            <div className="animate-in fade-in">
               <CoolingOffTimer 
                 category={selectedCategory} 
                 onComplete={handleCoolingComplete} 
                 isComplete={coolingComplete} 
                 isActive={canAcknowledge}
               />
            </div>
          )}

          <div className="relative z-10">
            <EthicalAcknowledgement 
              onAcknowledge={setAcknowledged} 
              disabled={!canAcknowledge || (requiresCooling && !coolingComplete)} 
              isTimerRunning={requiresCooling && !coolingComplete}
              isFormIncomplete={!canAcknowledge}
            />
          </div>

          <div className="pt-6 space-y-4">
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className={`w-full py-4 px-6 rounded-xl text-lg font-bold shadow-sm transition-all duration-300 text-center ${isSubmitDisabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white'}`}
            >
              {submissionState === 'submitting' ? 'Submitting...' : 'Submit Report Anonymously'}
            </button>
            <p className="text-center text-sm text-slate-500 font-medium">
               No personal information is collected. Your identity is protected throughout this process.
            </p>
            {selectedMedia && (
              <p className="text-center text-xs text-slate-500">
                Your attachment will be submitted with the report as optional supporting media.
              </p>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
