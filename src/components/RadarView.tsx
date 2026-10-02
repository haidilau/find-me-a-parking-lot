import React from 'react';
import { ArrowRightLeft, MapPin, ShieldCheck, Zap, Navigation, AlertTriangle, ArrowRight } from 'lucide-react';
import { Carpark, TrackedSlots } from '../types/carpark';
import { voiceAlertService } from '../services/voiceAlertService';

interface RadarViewProps {
  trackedSlots: TrackedSlots;
  onSwapBackup: (backupIndex: 1 | 2) => void;
  onOpenExplorer: () => void;
  onSelectCarparkForDetail: (carpark: Carpark) => void;
}

export const RadarView: React.FC<RadarViewProps> = ({
  trackedSlots,
  onSwapBackup,
  onOpenExplorer,
  onSelectCarparkForDetail,
}) => {
  const { primary, backup1, backup2 } = trackedSlots;

  const slots = [
    { title: 'Primary Target', carpark: primary, isPrimary: true, index: 0 },
    { title: 'Standby Backup 1', carpark: backup1, isPrimary: false, index: 1 },
    { title: 'Standby Backup 2', carpark: backup2, isPrimary: false, index: 2 },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-emerald-800 font-semibold">
          <span>Failover Strategy</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          3-Carpark Live Redundancy Matrix
        </h2>
        <p className="text-xs text-slate-600 max-w-lg mx-auto">
          Drivers to high-demand Singapore hubs never rely on a single carpark. ParkSG continuously monitors three candidates simultaneously for seamless voice failover.
        </p>
      </div>

      {/* 3-Column Radar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {slots.map(({ title, carpark, isPrimary, index }) => {
          if (!carpark) {
            return (
              <div
                key={title}
                className="p-6 rounded-2xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-center space-y-3 shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Empty standby slot</p>
                </div>
                <button
                  type="button"
                  onClick={onOpenExplorer}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                >
                  Choose Carpark
                </button>
              </div>
            );
          }

          const isCritical = carpark.availableLots <= 10;
          const isLow = carpark.availableLots <= 30;

          return (
            <div
              key={carpark.id}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                isPrimary
                  ? 'bg-white border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isPrimary ? 'text-emerald-800' : 'text-slate-500'
                  }`}>
                    {title}
                  </span>
                  <span className="text-[11px] font-mono-numbers text-slate-500 font-medium">
                    {carpark.walkingDistanceMeters === 0 ? 'Anchor' : `+${carpark.walkingDistanceMeters}m walk`}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  {carpark.name}
                </h3>
                <p className="text-xs text-slate-500 truncate">
                  {carpark.address}
                </p>
              </div>

              {/* Large Lot Status Block */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Available Lots Right Now
                </div>
                <div className="text-4xl font-black font-mono-numbers my-0.5 flex items-baseline justify-center gap-1">
                  <span className={isCritical ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-emerald-700'}>
                    {carpark.availableLots}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">/ {carpark.totalLots}</span>
                </div>
                <div className="text-[10px] font-bold text-slate-600">
                  {isCritical ? 'CRITICAL (VOICE ALERT ARMED)' : isLow ? 'LIMITED AVAILABILITY' : 'AMPLE SPACE'}
                </div>
              </div>

              {/* Specs & Pricing */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Day Rate:</span>
                  <span className="font-semibold text-slate-900 font-mono-numbers">
                    {carpark.pricing.weekdayDayRate.split('(')[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Clearance:</span>
                  <span className="font-semibold text-slate-900 font-mono-numbers">
                    {carpark.heightClearanceMeters}m ({carpark.isSheltered ? 'Sheltered' : 'Open'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>EV Power:</span>
                  <span className="font-semibold text-slate-900">
                    {carpark.evCharging.available ? `${carpark.evCharging.count}x ${carpark.evCharging.powerKw}kW` : 'None'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                {!isPrimary ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSwapBackup(index as 1 | 2);
                      voiceAlertService.speakBackupSwapped(carpark.name, carpark.availableLots);
                    }}
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 shadow-sm"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Promote to Primary Target</span>
                  </button>
                ) : (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      `${carpark.name}, ${carpark.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95 border border-slate-200"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Drive Directions</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onSelectCarparkForDetail(carpark)}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 underline text-center font-medium"
                >
                  View full rate schedule
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
