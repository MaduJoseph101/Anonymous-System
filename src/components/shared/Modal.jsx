import { X } from 'lucide-react';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', 
    xl: 'max-w-2xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose} />
      <div className={`relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full animate-in fade-in zoom-in-95 duration-200
        ${sizes[size]} max-h-[92vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-30">
          <h2 className="text-base sm:text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
