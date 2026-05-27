import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Shield, ArrowLeft } from 'lucide-react';
import { api } from '../../services/api';
import { HIGH_STAKES_CATEGORIES } from '../../utils/constants';

import CategorySelector from '../../components/student/CategorySelector';
import LocationTimeFields from '../../components/student/LocationTimeFields';
import IncidentDetailFields from '../../components/student/IncidentDetailFields';
import UncertaintyField from '../../components/student/UncertaintyField';
import EthicalAcknowledgement from '../../components/student/EthicalAcknowledgement';
import CoolingOffTimer from '../../components/student/CoolingOffTimer';
import TrackingCodeDisplay from '../../components/student/TrackingCodeDisplay';

export default function SubmitReport() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm({
    defaultValues: {
      category: '',
      location: '',
      description: '',
      locationDescription: '',
      timeOfDay: '',
      reporterContext: '',
      patternObservation: '',
      witnessPresence: '',
      immediateAction: '',
      ongoingStatus: '',
      uncertaintyStatement: ''
    }
  });
  
  const [submissionState, setSubmissionState] = useState('idle'); // idle | submitting | success | error
  const [result, setResult] = useState(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [coolingComplete, setCoolingComplete] = useState(false);
  
  // Wizard states
  const [currentStep, setCurrentStep] = useState(1);
  const [hasReachedStep4, setHasReachedStep4] = useState(false);

  const handleCoolingComplete = useCallback(() => {
    setCoolingComplete(true);
  }, []);

  const selectedCategory = watch('category');
  const selectedMedia = watch('media')?.[0] || null;
  const requiresCooling = selectedCategory ? HIGH_STAKES_CATEGORIES.includes(selectedCategory) : false;

  // Reset timer and step 4 tracking when category changes
  useEffect(() => {
    setCoolingComplete(false);
    setHasReachedStep4(false);
  }, [selectedCategory]);

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['category', 'location', 'locationDescription', 'timeOfDay'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['description', 'reporterContext', 'witnessPresence', 'immediateAction'];
    } else if (currentStep === 3) {
      if (!acknowledged) {
        toast.error('Please complete the ethical acknowledgement.');
        return;
      }
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 3) {
        setHasReachedStep4(true);
      }
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    if (data.patternObservation) payload.patternObservation = data.patternObservation;
    if (data.witnessPresence) payload.witnessPresence = data.witnessPresence;
    if (data.immediateAction) payload.immediateAction = data.immediateAction;
    if (data.ongoingStatus) payload.ongoingStatus = data.ongoingStatus;
    if (selectedMedia) payload.media = selectedMedia;

    try {
      const response = await api.student.submitReport(payload);
      setResult(response.data || response); 
      setSubmissionState('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSubmissionState('idle');
      toast.error(error.message || 'Failed to submit report. Please try again.');
    }
  };

  if (submissionState === 'success' && result) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8 flex items-center justify-center">
         <TrackingCodeDisplay 
           trackingCode={result.trackingCode}
           isInEscrow={result.isInEscrow}
           isVerified={result.isStudentVerified}
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
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 py-4 flex items-center gap-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-blue-700 mt-0.5" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Submit Anonymous Report</h1>
              <p className="text-xs text-slate-500 font-medium">No personal info collected</p>
            </div>
          </div>
        </div>
      </header>

      {/* Privacy notice banner */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 md:px-0 py-3 text-xs md:text-sm font-medium tracking-wide md:text-center">
          Your identity is protected. No name, student ID, email, or IP address is collected.
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 mt-8">
        {/* Stylish Step Indicator */}
        <div className="mb-12 mt-4 px-2">
          <div className="flex items-center justify-between relative">
            {/* Connecting background line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full z-0"></div>
            {/* Active connecting line */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
            
            {/* Step circles */}
            {[
              { id: 1, label: 'Category' },
              { id: 2, label: 'Details' },
              { id: 3, label: 'Ethics' },
              { id: 4, label: 'Review' }
            ].map((step) => (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {currentStep > step.id ? (
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    step.id
                  )}
                </div>
                <div className={`absolute top-10 md:top-12 whitespace-nowrap text-[10px] md:text-sm font-bold transition-colors duration-300 ${
                  currentStep >= step.id ? 'text-blue-700' : 'text-slate-400'
                }`}>
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative">
          
          {/* STEP 1: Category and Location */}
          <div className={`${currentStep === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} space-y-8`}>
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
                  maxLength: { value: 200, message: 'Location is too long' }
                })}
              />
              {errors.location && <p className="mt-2 text-sm text-red-600 font-medium">{errors.location.message}</p>}
            </div>

            {selectedCategory && (
              <LocationTimeFields register={register} errors={errors} />
            )}
          </div>

          {/* STEP 2: Incident Details */}
          <div className={`${currentStep === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} space-y-8`}>
            <IncidentDetailFields register={register} errors={errors} watch={watch} setValue={setValue} />
          </div>

          {/* STEP 3: Ethical Acknowledgement */}
          <div className={`${currentStep === 3 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} space-y-8`}>
            <UncertaintyField register={register} />
            <EthicalAcknowledgement 
              onAcknowledge={setAcknowledged} 
              disabled={false} 
              isTimerRunning={false}
              isFormIncomplete={false}
            />
          </div>

          {/* STEP 4: Review and Submit (Always rendered but hidden if not step 4) */}
          <div className={`${currentStep === 4 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'} space-y-8`}>
            {requiresCooling && (
              <CoolingOffTimer 
                category={selectedCategory} 
                onComplete={handleCoolingComplete} 
                isComplete={coolingComplete} 
                isActive={hasReachedStep4}
              />
            )}
            
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
               <h3 className="text-lg font-bold text-slate-800">Review your submission</h3>
               <p className="text-sm text-slate-600">Please review all information carefully. Once submitted, the report goes into processing.</p>
               
               <div className="pt-4 space-y-4">
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
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-6 gap-4 border-t border-slate-200 mt-8">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
            ) : <div className="hidden sm:block"></div>}
            
            {currentStep < 4 && (
              <button
                type="button"
                onClick={nextStep}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all ml-auto"
              >
                Next
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}
