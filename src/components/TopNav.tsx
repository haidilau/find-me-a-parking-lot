import React from 'react';
import { Volume2, VolumeX, Radio, Activity } from 'lucide-react';

interface TopNavProps {
  activeTab: 'hud' | 'explorer' | 'watch' | 'radar';
  setActiveTab: (tab: 'hud' | 'explorer' | 'watch' | 'radar') => void;
  isMuted: boolean;
  isSpeaking: boolean;
  onToggleMute: () => void;
  onOpenVoiceAlert: () => void;
  onOpenApiHealth: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isMuted,
  isSpeaking,
  onToggleMute,
  onOpenVoiceAlert,
  onOpenApiHealth,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2 text-left"
        >
          <span>ParkSG Live</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
        </button>

        {/* Zone 2: Clean navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'bg-slate-100 text-emerald-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Find Lots
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hud')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'hud'
                ? 'bg-slate-100 text-emerald-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Live Navigation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('watch')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'watch'
                ? 'bg-slate-100 text-emerald-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            WatchOS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`hidden sm:inline-block px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-slate-100 text-emerald-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            3-Lot Radar
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {/* Hands-Free Voice Alert Icon Button */}
          <button
            type="button"
            onClick={onOpenVoiceAlert}
            title="Hands-Free Voice Alert (Click to view & replay speech)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
              isSpeaking
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-sm animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border-slate-200'
            }`}
          >
            <div className="relative flex items-center">
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              {isSpeaking && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                </span>
              )}
            </div>
            <span>Voice Alert</span>
          </button>

          {/* API Health Monitor */}
          <button
            type="button"
            onClick={onOpenApiHealth}
            title="Monitor live government endpoints (/api/health.js)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">API Health</span>
          </button>

          {/* Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            title={isMuted ? 'Unmute voice alerts' : 'Mute voice alerts'}
            className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg border transition-colors ${
              isMuted
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
