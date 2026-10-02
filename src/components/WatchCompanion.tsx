import React, { useState } from 'react';
import { Carpark, TrackedSlots } from '../types/carpark';
import { Volume2, ArrowRightLeft, Shield, Zap, Sparkles, Watch } from 'lucide-react';
import { voiceAlertService } from '../services/voiceAlertService';

interface WatchCompanionProps {
  trackedSlots: TrackedSlots;
  onSwapBackup: (backupIndex: 1 | 2) => void;
  onSelectCarparkForDetail: (carpark: Carpark) => void;
}

export const WatchCompanion: React.FC<WatchCompanionProps> = ({
  trackedSlots,
  onSwapBackup,
  onSelectCarparkForDetail,
}) => {
  const { primary, backup1, backup2 } = trackedSlots;
  const [activeWatchTab, setActiveWatchTab] = useState<'primary' | 'backups' | 'settings'>('primary');

  const primaryLots = primary?.availableLots ?? 0;
  const totalLots = primary?.totalLots ?? 100;
  const lotRatio = Math.max(0, Math.min(1, primaryLots / totalLots));
  const isCritical = primaryLots <= 10;
  const isLow = primaryLots <= 30;

  // SVG circular gauge math (radius = 54, circumference ~ 339)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - lotRatio * circumference;

  const ringColor = isCritical ? '#f43f5e' : isLow ? '#f59e0b' : '#10b981';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Editorial intro */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-emerald-800 font-semibold">
          <Watch className="w-3.5 h-3.5" />
          <span>Apple Watch OS Reference Companion</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Glanceable Wrist HUD
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Modeled after Singapore Carpark Finder on watchOS. Designed for zero-distraction glances while holding the steering wheel.
        </p>
      </div>

      {/* Watch Bezel Chassis */}
      <div className="flex justify-center items-center py-2">
        <div className="relative">
          {/* Apple Watch Case Frame */}
          <div className="w-[300px] h-[370px] bg-[#121316] rounded-[52px] p-4 shadow-2xl border-[5px] border-[#2c2d33] ring-2 ring-black relative overflow-hidden flex flex-col justify-between">
            {/* Top Watch Status Bar */}
            <div className="flex items-center justify-between px-2 pt-1 text-[11px] font-mono-numbers text-slate-400">
              <span className="font-semibold text-emerald-400">ParkSG</span>
              <span className="text-white font-bold">19:42</span>
            </div>

            {/* Main Watch Face Content */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 text-center">
              {activeWatchTab === 'primary' && primary && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  {/* Truncated Name & Zone */}
                  <div className="px-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {primary.hub}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate max-w-[210px] mx-auto">
                      {primary.name}
                    </h3>
                  </div>

                  {/* Circular Radial Lot Gauge */}
                  <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                      {/* Background circle track */}
                      <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      {/* Active progress stroke */}
                      <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={ringColor}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Centered Lot Number */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black font-mono-numbers text-white tracking-tight leading-none">
                        {primary.availableLots}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                        Lots Left
                      </span>
                    </div>
                  </div>

                  {/* Subtitle Rate & Walking */}
                  <div className="text-[10px] text-slate-300 font-mono-numbers">
                    {primary.walkingDistanceMeters === 0 ? 'Direct Mall' : `${primary.walkingDistanceMeters}m · ${primary.walkingTimeMinutes}m walk`}
                    <span className="text-slate-500 mx-1">·</span>
                    <span>{primary.heightClearanceMeters}m</span>
                  </div>
                </div>
              )}

              {activeWatchTab === 'backups' && (
                <div className="w-full space-y-2 px-1 text-left animate-in fade-in duration-200">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center pb-1">
                    Standby Backups
                  </div>

                  {/* Backup 1 */}
                  {backup1 && (
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white truncate">{backup1.name}</div>
                        <div className="text-[10px] text-slate-400">+{backup1.walkingDistanceMeters}m walk</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSwapBackup(1)}
                        className="py-1 px-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px] font-mono-numbers shrink-0"
                      >
                        {backup1.availableLots}
                      </button>
                    </div>
                  )}

                  {/* Backup 2 */}
                  {backup2 && (
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-bold text-white truncate">{backup2.name}</div>
                        <div className="text-[10px] text-slate-400">+{backup2.walkingDistanceMeters}m walk</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onSwapBackup(2)}
                        className="py-1 px-2 bg-slate-800 text-white font-bold rounded-lg text-[11px] font-mono-numbers shrink-0 hover:bg-emerald-500 hover:text-slate-950"
                      >
                        {backup2.availableLots}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Watch OS Action Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-around">
              <button
                type="button"
                onClick={() => setActiveWatchTab('primary')}
                className={`text-[10px] font-bold py-1 px-3 rounded-full transition-colors ${
                  activeWatchTab === 'primary' ? 'bg-white text-slate-950' : 'text-slate-400'
                }`}
              >
                Target
              </button>
              <button
                type="button"
                onClick={() => setActiveWatchTab('backups')}
                className={`text-[10px] font-bold py-1 px-3 rounded-full transition-colors ${
                  activeWatchTab === 'backups' ? 'bg-white text-slate-950' : 'text-slate-400'
                }`}
              >
                Backups
              </button>
              <button
                type="button"
                onClick={() => {
                  if (primary) {
                    voiceAlertService.speak(
                      `Watch Complication: ${primary.name} has ${primary.availableLots} lots remaining.`,
                      false
                    );
                  }
                }}
                className="p-1.5 text-emerald-400 hover:text-white"
                title="Voice Alert on Watch"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Simulated Physical Digital Crown */}
          <div className="absolute top-16 -right-3 w-3 h-14 bg-gradient-to-r from-[#2c2d33] to-[#404149] rounded-r-md border border-[#1e1f24] shadow-md flex flex-col justify-around py-1">
            <div className="w-full h-0.5 bg-slate-500/40" />
            <div className="w-full h-0.5 bg-slate-500/40" />
            <div className="w-full h-0.5 bg-slate-500/40" />
          </div>

          {/* Side Button */}
          <div className="absolute top-36 -right-2.5 w-2 h-10 bg-[#2c2d33] rounded-r-sm border border-[#1e1f24]" />
        </div>
      </div>

      {/* Feature callout */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-700 space-y-2 shadow-sm">
        <div className="flex items-center gap-1.5 font-bold text-slate-900">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Glanceable Driving Architecture</span>
        </div>
        <p className="text-slate-600 leading-relaxed">
          Inspired by the Apple Watch Singapore Carpark Finder application, the circular dial provides instant visual feedback in under 0.5 seconds. Green indicates ample lots (&gt;30), amber signals limited parking (11–30), and crimson triggers the automatic voice reroute prompt (&le;10 lots).
        </p>
      </div>
    </div>
  );
};
