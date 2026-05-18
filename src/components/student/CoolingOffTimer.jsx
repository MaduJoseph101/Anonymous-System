import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { HIGH_STAKES_CATEGORIES, COOLING_OFF_SECONDS } from '../../utils/constants';

export default function CoolingOffTimer({ category, onComplete, isComplete, isActive = false }) {
  const isHighStakes = HIGH_STAKES_CATEGORIES.includes(category);
  const [timeLeft, setTimeLeft] = useState(COOLING_OFF_SECONDS);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (timeLeft === 0 && !isComplete) {
      onCompleteRef.current();
    }
  }, [timeLeft, isComplete]);

  useEffect(() => {
    if (!isHighStakes) {
      onCompleteRef.current();
      return;
    }

    if (isComplete) return;
    if (!isActive) return;

    // Calculate the exact end time once when the timer becomes active
    const targetTime = Date.now() + COOLING_OFF_SECONDS * 1000;

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isHighStakes, isComplete, isActive]);

  if (!isHighStakes) return null;

  if (isComplete) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 font-medium">Review period complete. You can submit now.</span>
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 bg-white rounded-full border border-amber-100 shadow-sm animate-pulse">
            <Clock className="w-6 h-6 text-amber-500 mb-1" />
            <span className="text-sm font-bold text-amber-900 uppercase tracking-wider">Paused</span>
          </div>
          <div className="flex-1 w-full">
            <h3 className="text-lg font-bold text-amber-900 mb-2">Review Period Cooldown</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              To ensure report quality, a 2-minute cooling-off period will begin <strong>once all mandatory fields above are filled out</strong>. Please complete the form to start the countdown.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((COOLING_OFF_SECONDS - timeLeft) / COOLING_OFF_SECONDS) * 100;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
        <div className="flex flex-col items-center justify-center shrink-0 w-24 h-24 bg-white rounded-full border border-blue-100 shadow-sm">
          <Clock className="w-6 h-6 text-blue-500 mb-1" />
          <span className="text-2xl font-mono font-bold text-blue-900">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex-1 w-full">
          <h3 className="text-lg font-bold text-blue-900 mb-2">Review period</h3>
          <p className="text-sm text-blue-800 leading-relaxed mb-4">
            This category needs a short review before you submit. Check your details and wait for the timer to finish.
          </p>
          <div className="w-full bg-blue-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
