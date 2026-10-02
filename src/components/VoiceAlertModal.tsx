import React from 'react';
import { Volume2, VolumeX, AlertTriangle, Sparkles, X, Play, ArrowRightLeft, Radio } from 'lucide-react';
import { voiceAlertService } from '../services/voiceAlertService';

interface VoiceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSpeaking: boolean;
  lastSpokenText: string | null;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickSwitchToBackup?: () => void;
  onTestVoice?: () => void;
  backupName?: string;
  backupLots?: number;
  primaryName?: string;
  primaryLots?: number;
}

export const VoiceAlertModal: React.FC<VoiceAlertModalProps> = ({
  isOpen,
  onClose,
  isSpeaking,
  lastSpokenText,
  isMuted,
  onToggleMute,
  onQuickSwitchToBackup,
  onTestVoice,
  backupName,
  backupLots,
  primaryName,
  primaryLots,
}) => {
  if (!isOpen) return null;

  const displayText = lastSpokenText || (primaryName 
    ? `ParkSG Hands-Free Voice active for ${primaryName}. 10-minute ETA and low-lot warnings will be spoken automatically.`
    : 'Hands-Free Voice Alert is active. Real-time lot notifications will be announced while driving.');

  const isUrgent = displayText.toLowerCase().includes('alert') || displayText.toLowerCase().includes('drop') || (primaryLots !== undefined && primaryLots <= 10);

  const handleReplay = () => {
    if (lastSpokenText) {
      voiceAlertService.speak(lastSpokenText, false);
    } else if (onTestVoice) {
      onTestVoice();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-alert-title"
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isUrgent ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isUrgent ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isUrgent ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 animate-bounce" />
              ) : (
                <Radio className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="voice-alert-title" className="text-base font-bold text-slate-900">
                  {isUrgent ? 'Urgent Driver Voice Alert' : 'Hands-Free Voice Alert'}
                </h2>
                {isSpeaking && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
                    SPEAKING
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">Automotive Audio Assistance</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Close voice alert"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Audio Wave Visualizer while speaking */}
          {isSpeaking && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-900">Playing voice announcement...</span>
              </div>
              <div className="flex items-end gap-1 h-5">
                <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
                <span className="w-1 h-5 bg-emerald-600 rounded-full animate-pulse delay-75" />
                <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                <span className="w-1 h-4 bg-emerald-500 rounded-full animate-pulse delay-100" />
              </div>
            </div>
          )}

          {/* Announcement Message Box */}
          <div className={`p-4 rounded-2xl border ${
            isUrgent ? 'bg-rose-50/70 border-rose-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Latest Announcement Broadcast
            </span>
            <p className="text-sm font-semibold text-slate-900 leading-relaxed">
              "{displayText}"
            </p>
          </div>

          {/* Urgent Backup Failover Action */}
          {isUrgent && onQuickSwitchToBackup && backupName && (
            <div className="p-3.5 bg-rose-100/70 border border-rose-300 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-900">Standby Backup Available</span>
                <span className="font-mono font-bold text-rose-800">{backupLots} lots</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onQuickSwitchToBackup();
                  onClose();
                }}
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-98"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Switch to {backupName} ({backupLots} lots)</span>
              </button>
            </div>
          )}

          {/* Controls: Replay Audio & Mute/Unmute */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleReplay}
              className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600" />
              <span>Replay Voice Alert</span>
            </button>

            <button
              type="button"
              onClick={onToggleMute}
              className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${
                isMuted
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-600" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isMuted ? 'Unmute Speech' : 'Mute Speech'}</span>
            </button>
          </div>

          {/* Info note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hands-Free Automotive Safety</span>
            </div>
            <p>
              ParkSG speaks critical lot updates 10 minutes before destination and warns if lots drop below 10, keeping your hands on the steering wheel.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Status: {isMuted ? 'Voice Muted' : 'Voice Active'}
          </span>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
