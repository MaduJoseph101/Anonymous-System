import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  format, addMonths, subMonths, startOfMonth, endOfMonth, 
  startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays,
  isAfter, isBefore, startOfDay, parseISO
} from 'date-fns';

const ModernDatePicker = ({ value, onChange, minDate, maxDate, alignRight = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse incoming YYYY-MM-DD to local dates safely
  const safeDate = value ? parseISO(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(safeDate);
  const popupRef = useRef(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentMonth(value ? parseISO(value) : new Date());
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 px-2">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)); }}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-black text-slate-800 tracking-tight">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)); }}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);
    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
          {format(addDays(startDate, i), 'EEEEEE')}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-1">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = new Date(day);
        
        let isDisabled = false;
        if (minDate && isBefore(startOfDay(cloneDay), startOfDay(parseISO(minDate)))) isDisabled = true;
        if (maxDate && isAfter(startOfDay(cloneDay), startOfDay(parseISO(maxDate)))) isDisabled = true;

        const isSelected = value && isSameDay(cloneDay, parseISO(value));
        const isCurrentMonth = isSameMonth(cloneDay, monthStart);

        let stateClass = '';
        if (isDisabled) {
          stateClass = 'text-slate-300 cursor-not-allowed opacity-50';
        } else if (isSelected) {
          stateClass = 'bg-indigo-600 text-white shadow-md hover:bg-indigo-700';
        } else if (!isCurrentMonth) {
          stateClass = 'text-slate-300 hover:bg-slate-100 hover:text-slate-600';
        } else {
          stateClass = 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600';
        }

        days.push(
          <div
            key={day.toISOString()}
            onClick={(e) => {
              e.stopPropagation();
              if (!isDisabled) {
                onChange(format(cloneDay, 'yyyy-MM-dd'));
                setIsOpen(false);
              }
            }}
            className={`flex justify-center items-center h-9 w-9 text-xs font-bold rounded-full mx-auto cursor-pointer transition-all duration-200 ${stateClass}`}
          >
            <span>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-y-1" key={day.toISOString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="relative w-full" ref={popupRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-bold text-slate-700 bg-transparent outline-none cursor-pointer w-full hover:text-indigo-700 transition-colors py-0.5"
      >
        {value ? format(parseISO(value), 'MMM d, yyyy') : 'Select date'}
      </div>
      
      {isOpen && (
        <div className={`absolute z-[100] mt-3 sm:mt-4 ${alignRight ? 'right-0 origin-top-right' : '-left-4 sm:-left-6 origin-top-left'} bg-white border border-slate-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] p-4 w-[280px] transition-all`}>
          {renderHeader()}
          {renderDays()}
          {renderCells()}
        </div>
      )}
    </div>
  );
};

export default ModernDatePicker;
