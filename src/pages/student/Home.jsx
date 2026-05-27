import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, CheckCircle, MessageSquare, ChevronDown, ChevronUp, Lock, AlertCircle, Users, AlertTriangle, Menu, X, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { REPORT_CATEGORIES } from '../../utils/constants';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-50px" },
    transition: { staggerChildren: 0.15 }
  };

  const itemFadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const faqs = [
    {
      question: "Will anyone know it was me?",
      answer: "No. Your identity is not collected (not just promised to be kept private). No name, student ID, email, phone number, or IP address is stored or sent. Even system admins cannot identify you."
    },
    {
      question: "What kinds of things can I report?",
      answer: "You can report anything that affects safety or wellbeing on campus: bullying, harassment, drug activity, sexual misconduct, staff malpractice, safety hazards, vandalism, academic fraud, mental health concerns about a peer, and more. No concern is too small."
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
      question: "Can I cancel or edit my report?",
      answer: "For serious categories, you can use your tracking code to cancel the report within 24 hours. For other reports, you can use your tracking code to send more context or communicate with staff."
    },
    {
      question: "Can I report for someone else?",
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 md:px-12 lg:px-16 py-3 sm:py-4 flex justify-between items-center relative z-50 bg-white">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-700" />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-blue-900">Anonymous Report</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="flex items-center space-x-4 max-sm:hidden">
            <Link to="/track" className="text-sm font-semibold text-blue-700 hover:text-blue-900 flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Track my report</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/retract" className="text-sm font-semibold text-amber-700 hover:text-amber-950 flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Retract a report</span>
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Drawer Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 sm:hidden" 
            onClick={() => setIsMenuOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div 
          className={`fixed top-0 right-0 h-full w-[260px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out sm:hidden flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Minimal Close Header */}
          <div className="p-6 flex justify-end">
            <button 
              className="p-3 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all active:scale-95 bg-slate-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Drawer Content */}
          <div className="flex-1 px-5 space-y-3 mt-2">
            <Link 
              to="/track" 
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center justify-between w-full p-4 rounded-2xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-800 text-sm">Track Report</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">Check progress</span>
                </div>
              </div>
            </Link>

            <div className="px-4 py-0.5">
              <div className="w-full h-px bg-slate-100"></div>
            </div>
            
            <Link 
              to="/retract" 
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center justify-between w-full p-4 rounded-2xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 active:scale-[0.98]"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-amber-50 text-amber-600 p-3 rounded-xl group-hover:bg-amber-100 transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-slate-800 text-sm">Retract Report</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5">Withdraw submission</span>
                </div>
              </div>
            </Link>

            <div className="pt-4 px-2">
              <div className="w-full h-px bg-slate-100 mb-6"></div>
              <Link 
                to="/submit" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100 px-5 py-3.5 rounded-xl transition-all active:scale-[0.98]"
              >
                <Shield className="w-4 h-4" />
                <span>Submit a Report</span>
              </Link>
            </div>
          </div>
          
          {/* Subtle Drawer Footer */}
          <div className="p-6 mb-2">
            <div className="flex items-center justify-center space-x-1.5 text-slate-400">
              <Lock className="w-3 h-3" />
              <span className="text-[10px] font-medium tracking-widest uppercase">End-to-End Secure</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6">
        
        {/* Hero Section */}
        <motion.section 
          {...fadeInUp}
          className="py-20 md:py-28 text-center relative"
        >
          {/* Subtle gradient blob behind hero */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-blue-100/50 rounded-full blur-3xl -z-10 pointer-events-none"></div>

          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="inline-block mb-4 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] md:text-xs font-bold tracking-wider md:tracking-widest uppercase"
          >
            Secure & Anonymous
          </motion.div>

          <h1 className="text-[22px] min-[375px]:text-[25px] sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 mb-2 pb-4 leading-[1.3] tracking-tight whitespace-nowrap">
            See something, Say something.
          </h1>
          <p className="text-base md:text-xl text-center text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
            Use this platform to report concerns, bullying, hazards, or misconduct. Your identity is protected.
          </p>
          
          <div className="flex justify-center items-center">
            <Link 
              to="/submit" 
              className="group relative w-full sm:w-auto inline-flex justify-center items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl shadow-[0_8px_30px_rgb(37,99,235,0.24)] hover:shadow-[0_8px_40px_rgb(37,99,235,0.4)] transition-all duration-300 transform hover:-translate-y-1 text-base md:text-lg"
            >
              <span>Submit a Report</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.section>

        {/* Privacy Banner */}
        <motion.section 
          {...fadeInUp}
          className="py-6 md:py-10"
        >
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 border border-green-200/60 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start space-y-5 md:space-y-0 md:space-x-6 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-200/30 rounded-full blur-2xl"></div>
            <div className="shrink-0 bg-green-100 p-4 rounded-2xl shadow-sm relative z-10">
              <Lock className="w-8 h-8 text-green-700" />
            </div>
            <div className="text-center md:text-left relative z-10">
              <h3 className="text-lg md:text-xl font-bold text-green-900 mb-2">Absolute Privacy</h3>
              <p className="text-green-800/90 text-sm md:text-base leading-relaxed max-w-3xl">
                No personal identifiers are recorded. Your report is completely decoupled from your device and network footprint before anyone reviews it.
              </p>
            </div>
          </div>
        </motion.section>

        {/* How it works */}
        <motion.section 
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, margin: "-50px" }}
          className="py-20"
        >
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 tracking-tight">How it works</h2>
            <div className="w-16 md:w-20 h-1.5 bg-blue-600 mx-auto mt-4 md:mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <motion.div variants={itemFadeInUp} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl p-6 md:p-8 text-center border border-slate-100/60 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-colors duration-300 shadow-sm">
                <AlertCircle className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-800">1. Tell us</h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                Tell us what happened in the secure form. No personal information is requested.
              </p>
            </motion.div>
            
            <motion.div variants={itemFadeInUp} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl p-6 md:p-8 text-center border border-slate-100/60 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-colors duration-300 shadow-sm">
                <CheckCircle className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-800">2. Get a code</h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                You get a private tracking code right away. Keep it safe.
              </p>
            </motion.div>
            
            <motion.div variants={itemFadeInUp} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl p-6 md:p-8 text-center border border-slate-100/60 transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 transition-colors duration-300 shadow-sm">
                <MessageSquare className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-slate-800">3. Follow up</h3>
              <p className="text-slate-500 text-sm md:text-base leading-relaxed">
                Check progress, read updates, and send replies, all without revealing who you are.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Categories Preview */}
        <motion.section {...fadeInUp} className="py-16 md:py-20 border-t border-slate-200/60">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">What to Report</h2>
            <p className="text-slate-500 mt-3 md:mt-4 max-w-xl mx-auto text-sm md:text-base px-4">
              You can anonymously report anything that makes you or others feel unsafe. Below are a few examples.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {categoriesToShow.map((cat, idx) => (
              <Link 
                key={idx} 
                to={`/submit?type=${cat.value}`}
                className="bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all border border-slate-200 hover:border-slate-300 flex items-center space-x-3 shadow-sm hover:shadow"
              >
                <span className="text-blue-600">{cat.icon}</span>
                <span>{cat.label}</span>
              </Link>
            ))}
            <Link to="/submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-sm flex items-center space-x-2">
              <span>View all categories</span>
            </Link>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section {...fadeInUp} className="py-16 md:py-20 border-t border-slate-200/60">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Questions</h2>
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
               <div key={index} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                 <button 
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-8 py-5 flex justify-between items-center hover:bg-slate-50 transition-colors focus:outline-none"
                 >
                   <span className="font-semibold text-slate-800 text-base md:text-lg">{faq.question}</span>
                   {openFaq === index ? (
                     <ChevronUp className="w-5 h-5 text-blue-600 shrink-0 ml-4" />
                   ) : (
                     <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 ml-4" />
                   )}
                 </button>
                 {openFaq === index && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: "auto" }}
                     className="px-8 pb-6 pt-2 text-slate-600 text-base leading-relaxed bg-slate-50/50 text-balance"
                   >
                     {faq.answer}
                   </motion.div>
                 )}
               </div>
            ))}
          </div>
        </motion.section>

        {/* Administrator Portal */}
        <motion.section {...fadeInUp} className="pt-10 pb-16 border-t border-transparent">
          <div className="bg-slate-900 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-left space-y-6 md:space-y-0 relative overflow-hidden shadow-2xl">
            {/* Decorative background shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <h3 className="text-xl font-bold text-white mb-2 flex justify-center md:justify-start items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" />
                Staff & Administrator Portal
              </h3>
              <p className="text-slate-400 max-w-lg">
                Authorized staff access for securely reviewing and handling incoming anonymous reports.
              </p>
            </div>
            <div className="w-full md:w-auto shrink-0 md:pl-6 relative z-10">
              <Link to="/admin/login" className="w-full md:w-auto inline-flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all backdrop-blur-sm">
                <Lock className="w-4 h-4" />
                <span>Admin Login</span>
              </Link>
            </div>
          </div>
        </motion.section>

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
