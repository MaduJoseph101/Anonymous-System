import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function MessageThread({ messages = [], onReply, reportStatus, loading, className = 'h-[calc(100dvh-200px)] md:h-[75vh] min-h-[400px] md:min-h-[600px] max-h-[900px]' }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  
  const canReply = !['CLOSED', 'RETRACTED_BY_REPORTER'].includes(reportStatus);
  const isBusy = loading || isSubmitting;

  const onSubmit = async (data) => {
    await onReply(data.newReply);
    reset();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col ${className}`}>
      
        <div className="bg-slate-50 border-b border-slate-200 p-5 shrink-0 flex items-center justify-center md:justify-start gap-2 text-slate-800 font-bold text-lg">
          <MessageCircle className="w-6 h-6 text-blue-600" />
        Messages
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 px-4">
            <MessageCircle className="w-16 h-16 text-slate-300 mb-4" />
            <p className="max-w-md text-sm md:text-base leading-relaxed">
              No messages yet. If staff need more details, they will reply here.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const sender = msg.senderType || msg.sender_type;
            const isAdmin = sender === 'ADMIN';
            const isReporter = sender === 'REPORTER' || sender === 'STUDENT';
            const isRightAligned = isReporter || (!isAdmin && sender !== 'ADMIN');
            return (
              <div key={msg.id} className={`flex w-full ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-5 py-4 shadow-sm ${isRightAligned ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-200 text-slate-800 rounded-bl-sm'}`}>
                  <div className={`mb-1.5 flex ${isRightAligned ? 'justify-end' : 'justify-start'}`}>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.18em] border opacity-80 ${isRightAligned ? 'bg-white/10 text-blue-50 border-white/15' : 'bg-white text-slate-500 border-slate-200'}`}>
                      {isAdmin ? 'Admin' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-3 flex items-center ${isRightAligned ? 'justify-end text-blue-200' : 'justify-end text-slate-500'}`}>
                    {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : 'Just now'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canReply ? (
        <div className="bg-white p-5 shrink-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className={`border rounded-xl bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all overflow-hidden ${errors.newReply ? 'border-red-300 ring-1 ring-red-300' : 'border-slate-200'}`}>
              <textarea
                rows={2}
                placeholder="Write a reply..."
                disabled={isBusy}
                className="w-full px-4 py-3 bg-transparent resize-none outline-none focus:outline-none focus:ring-0 focus:border-none text-base border-none"
                {...register('newReply', { required: 'Cannot send an empty message' })}
              />
              <div className="flex justify-between items-center px-3 pb-3">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold bg-slate-200/50 py-1 px-2.5 rounded-md text-[11px] md:text-xs select-none">
                  <Lock className="w-3.5 h-3.5 text-green-600 shrink-0" /> Reply is anonymous
                </div>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center shrink-0"
                  title="Send Encrypted Reply"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
            {errors.newReply && (
              <div className="px-1 text-xs text-red-600 font-medium">{errors.newReply.message}</div>
            )}
          </form>
        </div>
      ) : (
        <div className="bg-slate-100 border-t border-slate-200 p-6 text-center text-sm font-medium text-slate-500 shrink-0 flex items-center justify-center gap-2">
           <Lock className="w-4 h-4" />
           Replies are disabled because this report is {reportStatus === 'CLOSED' ? 'closed' : 'cancelled'}.
        </div>
      )}
    </div>
  );
}
