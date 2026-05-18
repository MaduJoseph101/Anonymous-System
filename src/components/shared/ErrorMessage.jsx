import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;
  return (
    <div className={`flex items-start gap-2 text-red-700 text-sm 
      ${className}`}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
