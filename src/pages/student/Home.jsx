import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, CheckCircle, MessageSquare, ChevronDown, ChevronUp, Lock, AlertCircle, Users, AlertTriangle } from 'lucide-react';
import { REPORT_CATEGORIES } from '../../utils/constants';

export default function Home() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: "Will anyone know it was me?",
      answer: "No. Your identity is not collected — not just promised to be kept private. No name, student ID, email, phone number, or IP address is stored or sent. Even system admins cannot identify you."
    },
    {
      question: "What kinds of things can I report?",
      answer: "You can report anything that affects safety or wellbeing on campus — bullying, harassment, drug activity, sexual misconduct, staff malpractice, safety hazards, vandalism, academic fraud, mental health concerns about a peer, and more. No concern is too small."
    },
    {
      question: "What happens after I submit?",
      answer: "Your report is sent to the right staff member based on its category. You can check progress and get updates with your tracking code."
    },
    {
      question: "What is a tracking code?",
      answer: "When you submit a report, you get a unique code. Use it to check status, read updates, and send more information anonymously."
    },
    {
      question: "What if I made a mistake or changed my mind?",
      answer: "For serious categories, you can use your tracking code to cancel the report within 24 hours. For other reports, you can use your tracking code to send more context or communicate with staff."
    },
    {
      question: "Can I report something I witnessed happening to someone else?",
      answer: "Yes. You do not need to be the direct victim. If you witnessed something concerning, you can report it."
    }
  ];

  const categoriesToShow = REPORT_CATEGORIES.slice(0, 8);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 md:px-0 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-700" />
            <span className="text-xl font-bold tracking-tight text-blue-900 hidden sm:inline-block">Anonymous Report</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/track" className="text-sm font-medium text-blue-700 hover:text-blue-900 flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Track my report</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/retract" className="text-sm font-medium text-amber-700 hover:text-amber-950 flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Retract a report</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-0">
        
        {/* Hero Section */}
        <section className="py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
            See something, say something.
          </h1>
          <p className="text-lg text-center text-slate-600 mb-10 max-w-2xl mx-auto">
            Use this platform to report concerns, bullying, hazards, or misconduct. Your identity stays protected.
          </p>
          
          <div className="flex justify-center items-center">
            <Link to="/submit" className="w-full md:w-auto bg-blue-700 hover:bg-blue-800 text-white font-medium px-8 py-4 rounded-xl shadow-sm transition-colors text-lg text-center">
              Submit a Report
            </Link>
          </div>
        </section>

        {/* Privacy Banner */}
        <section className="py-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-4">
            <div className="shrink-0 bg-green-100 p-3 rounded-full">
              <Lock className="w-6 h-6 text-green-700" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-lg font-bold text-green-900 mb-1">Privacy</h3>
              <p className="text-green-800 text-sm">
                No personal identifiers are recorded. Your report is separated from your device before anyone reviews it.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-800">1. Tell us</h3>
              <p className="text-slate-600 text-sm">
                Tell us what happened in the form. No personal information is requested.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-800">2. Get a code</h3>
              <p className="text-slate-600 text-sm">
                You get a private tracking code right away. Keep it safe.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-slate-100">
              <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-800">3. Follow up</h3>
              <p className="text-slate-600 text-sm">
                Check progress, read updates, and send replies — all without revealing who you are.
              </p>
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="py-16 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-4">What to Report</h2>
          <p className="text-center text-slate-600 mb-8 max-w-xl mx-auto text-sm">
            You can anonymously report anything that makes you or others feel unsafe. Below are a few examples.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {categoriesToShow.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/submit?type=${cat.value}`}
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-5 py-2.5 rounded-full text-sm font-medium transition-colors border border-blue-100 flex items-center space-x-2 shadow-sm"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
            <Link to="/submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-full text-sm font-medium transition-colors flex items-center space-x-2">
              <span>View all</span>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">Questions</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
               <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                 <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none"
                 >
                   <span className="font-semibold text-slate-800">{faq.question}</span>
                   {openFaq === index ? (
                     <ChevronUp className="w-5 h-5 text-blue-500 shrink-0 ml-4" />
                   ) : (
                     <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-4" />
                   )}
                 </button>
                 {openFaq === index && (
                   <div className="px-6 pb-4 pt-2 text-slate-600 text-sm leading-relaxed border-t border-slate-100 bg-slate-50">
                     {faq.answer}
                   </div>
                 )}
               </div>
            ))}
          </div>
        </section>

        {/* Administrator Portal */}
        <section className="pt-8 pb-12 border-t border-transparent">
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left space-y-5 md:space-y-0">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex justify-center md:justify-start items-center gap-2.5">
                <Users className="w-5 h-5 text-slate-500" />
                Staff & Administrator Portal
              </h3>
              <p className="text-sm text-slate-600 max-w-lg">
                Staff access for handling incoming anonymous reports.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0 md:pl-4">
              <Link to="/admin/login" className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold px-6 py-3.5 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-slate-200">
                <Lock className="w-4 h-4 text-slate-500" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-10 mt-8">
        <div className="max-w-4xl mx-auto px-4 md:px-0 text-center text-slate-500 text-sm flex flex-col items-center space-y-4">
           <Shield className="w-6 h-6 text-slate-400" />
           <p>© {new Date().getFullYear()} Anonymous Reporting System.</p>
           <p className="max-w-md">
             Your identity is fully protected. Please use this platform responsibly to keep our community safe and secure.
           </p>
        </div>
      </footer>
    </div>
  );
}
