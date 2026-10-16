import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, X, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let bg = 'bg-[#191C28] border-[#292C3B] text-[#F5F5FA]';
        let Icon = Info;
        let iconColor = 'text-[#A995FF]';

        if (toast.type === 'success') {
          bg = 'bg-[#12141D] border-emerald-500/30 text-emerald-100 shadow-emerald-950/20';
          Icon = CheckCircle2;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'error') {
          bg = 'bg-[#12141D] border-rose-500/30 text-rose-100 shadow-rose-950/20';
          Icon = AlertCircle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          bg = 'bg-[#12141D] border-amber-500/30 text-amber-100 shadow-amber-950/20';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <p className="text-xs leading-relaxed flex-1 font-medium">{toast.message}</p>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-[#9699AC] hover:text-[#F5F5FA] p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
