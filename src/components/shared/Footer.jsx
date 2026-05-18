import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-10 mt-auto">
      <div className="max-w-4xl mx-auto px-4 text-center">
         <p className="text-xs font-black text-slate-500 leading-relaxed uppercase tracking-widest max-w-lg mx-auto">
           All reports are completely anonymous. No personal data is collected or stored.
         </p>
         <p className="text-[10px] font-bold text-slate-400 mt-4 tracking-widest">
           &copy; {currentYear} Institutional Safeguarding Framework
         </p>
      </div>
    </footer>
  );
}
