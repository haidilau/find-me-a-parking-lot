import React from 'react';
import { Volume2, VolumeX, AlertTriangle, Radio } from 'lucide-react';

interface VoiceAlertIconButtonProps {
  isSpeaking: boolean;
  isMuted: boolean;
  hasRecentAlert: boolean;
  onClick: () => void;
  className?: string;
}

export const VoiceAlertIconButton: React.FC<VoiceAlertIconButtonProps> = ({
  isSpeaking,
  isMuted,
  hasRecentAlert,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open Hands-Free Voice Alert info"
      title="Hands-Free Voice Alert (Click to open)"
      className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 p-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all active:scale-95 flex items-center gap-2 group ${
        hasRecentAlert
          ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-rose-950/10'
          : isSpeaking
          ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-emerald-950/15 animate-pulse'
          : 'bg-white/95 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-slate-900/10'
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {hasRecentAlert ? (
          <AlertTriangle className="w-5 h-5 text-rose-600 animate-bounce" />
        ) : isSpeaking ? (
          <Volume2 className="w-5 h-5 text-emerald-600 animate-pulse" />
        ) : isMuted ? (
          <VolumeX className="w-5 h-5 text-slate-400" />
        ) : (
          <Radio className="w-5 h-5 text-emerald-600" />
        )}

        {/* Pulse badge */}
        {isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        )}
      </div>

      <div className="text-left hidden md:block pr-1">
        <span className="text-[11px] font-bold block leading-none text-slate-900">
          Voice Alert
        </span>
        <span className="text-[9px] text-slate-500 font-medium">
          {isSpeaking ? 'Speaking live...' : isMuted ? 'Muted' : 'Ready'}
        </span>
      </div>
    </button>
  );
};
