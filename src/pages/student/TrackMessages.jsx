import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, MessageCircle } from 'lucide-react';

import { api } from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import MessageThread from '../../components/student/MessageThread';

export default function TrackMessages() {
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageState, setPageState] = useState('idle');

  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (!codeParam) {
      setLoading(false);
      setPageState('missing_code');
      return;
    }

    let isMounted = true;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await api.student.trackReport(codeParam);
        const fetchedReport = response.report || response.data?.report || response;

        if (!isMounted) return;

        if (fetchedReport && !fetchedReport.message) {
          setReport(fetchedReport);
          setPageState('found');
        } else {
          setPageState('not_found');
        }
      } catch (err) {
        if (!isMounted) return;
        setPageState('error');
        toast.error(err.message || 'Failed to load messages');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReport();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const code = searchParams.get('code') || report?.trackingCode || '';

  const handleReply = async (message) => {
    try {
      await api.student.replyToReport({ trackingCode: report.trackingCode, message });
      setReport((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          { id: Date.now().toString(), content: message, senderType: 'REPORTER', createdAt: new Date().toISOString() }
        ]
      }));
      toast.success('Reply sent anonymously');
    } catch (error) {
      toast.error('Failed to send reply. Please try again.');
      throw error;
    }
  };

  const backHref = `/track${code ? `?code=${encodeURIComponent(code)}` : ''}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner className="w-8 h-8 border-4 text-blue-600" />
      </div>
    );
  }

  if (pageState === 'missing_code') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800">No tracking code</h1>
          <p className="text-sm text-slate-600">Go back to the tracking page and enter your code first.</p>
          <Link to="/track" className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to tracking
          </Link>
        </div>
      </div>
    );
  }

  if (pageState === 'not_found' || pageState === 'error' || !report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-4">
          <MessageCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-xl font-bold text-slate-800">Messages unavailable</h1>
          <p className="text-sm text-slate-600">The report could not be loaded. Go back and try again.</p>
          <Link to="/track" className="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-3 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to tracking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link to={backHref} className="text-slate-400 hover:text-slate-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-50">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span className="truncate">Messages</span>
              </div>
              <p className="text-xs text-slate-500 truncate">Tracking code {code || 'unknown'}</p>
            </div>
          </div>

          <Link
            to={backHref}
            className="hidden sm:inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to report
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-6 lg:mt-8 space-y-6">
        <MessageThread
          messages={report.messages || []}
          onReply={handleReply}
          reportStatus={report.status}
          loading={false}
          className="h-[calc(100vh-220px)] min-h-[560px]"
        />
      </main>
    </div>
  );
}
