import React from 'react';
import { useCorrespondenceStore } from '../store/useCorrespondenceStore';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = () => {
  const toast = useCorrespondenceStore((state) => state.toast);
  const showToast = useCorrespondenceStore((state) => state.showToast);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#1E9E5A]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#DC2626]" />;
      default:
        return <Info className="w-5 h-5 text-[#1B4B8A]" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-[#1E9E5A]/30 bg-emerald-50/95';
      case 'error':
        return 'border-[#DC2626]/30 bg-rose-50/95';
      default:
        return 'border-[#1B4B8A]/30 bg-blue-50/95';
    }
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-auto min-w-[320px] max-w-lg">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md transition-all ${getBorderColor()}`}
      >
        <div className="shrink-0">{getIcon()}</div>
        <p className="text-sm font-medium text-[#1A1F2B] flex-1 leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={() => useCorrespondenceStore.setState({ toast: null })}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
