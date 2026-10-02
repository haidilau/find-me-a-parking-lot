import React from 'react';
import { 
  X, 
  MapPin, 
  Zap, 
  Umbrella, 
  Accessibility, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  Navigation, 
  Bike,
  Check
} from 'lucide-react';
import { Carpark, TrackedSlots } from '../types/carpark';
import { voiceAlertService } from '../services/voiceAlertService';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  onClose: () => void;
  trackedSlots: TrackedSlots;
  onSetPrimary: (carpark: Carpark) => void;
  onSetBackup: (carpark: Carpark, slot: 1 | 2) => void;
  userVehicleHeight: number;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  onClose,
  trackedSlots,
  onSetPrimary,
  onSetBackup,
  userVehicleHeight,
}) => {
  if (!carpark) return null;

  const isPrimary = trackedSlots.primary?.id === carpark.id;
  const isBackup1 = trackedSlots.backup1?.id === carpark.id;
  const isBackup2 = trackedSlots.backup2?.id === carpark.id;

  const heightSafe = carpark.heightClearanceMeters >= userVehicleHeight;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-carpark-title"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between gap-3 bg-slate-50">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
              {carpark.hub} Hub Carpark
            </span>
            <h2 id="modal-carpark-title" className="text-xl font-bold text-slate-900 leading-snug">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{carpark.address}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Live Lots Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Real-Time Available Lots</span>
              <div className="text-3xl font-black font-mono-numbers text-emerald-700 mt-0.5">
                {carpark.availableLots} <span className="text-sm font-normal text-slate-500">/ {carpark.totalLots}</span>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block">
                {carpark.isSheltered ? 'Sheltered Structure' : 'Open-Air Lot'}
              </span>
              <span className="font-mono-numbers">
                {carpark.pricing.gracePeriodMins} mins grace period
              </span>
            </div>
          </div>

          {/* Rate Schedule Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Official Tariff & Parking Rates</span>
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-600">Weekday Daytime:</span>
                <span className="font-semibold text-slate-900 font-mono-numbers text-right">
                  {carpark.pricing.weekdayDayRate}
                </span>
              </div>

              {carpark.pricing.weekdayPerEntry && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-600">Weekday Evening / Entry:</span>
                  <span className="font-semibold text-slate-900 font-mono-numbers text-right">
                    {carpark.pricing.weekdayPerEntry}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-600">Weekend & Public Holidays:</span>
                <span className="font-semibold text-slate-900 font-mono-numbers text-right">
                  {carpark.pricing.weekendRate}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Specifications */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Gantry & Vehicle Clearance</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3 rounded-xl border ${heightSafe ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-300'}`}>
                <span className="text-slate-500 block text-[11px]">Maximum Height</span>
                <span className="text-base font-bold font-mono-numbers text-slate-900 mt-0.5 block">
                  {carpark.heightClearanceMeters}m
                </span>
                <span className={`text-[10px] mt-1 block font-semibold ${heightSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {heightSafe ? 'Safe for your vehicle' : `Exceeds your ${userVehicleHeight}m height!`}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Walking Distance</span>
                <span className="text-base font-bold font-mono-numbers text-slate-900 mt-0.5 block">
                  {carpark.walkingDistanceMeters === 0 ? 'Direct Link' : `${carpark.walkingDistanceMeters}m`}
                </span>
                <span className="text-[10px] text-slate-500 mt-1 block font-medium">
                  {carpark.walkingTimeMinutes} mins to central mall
                </span>
              </div>
            </div>
          </div>

          {/* EV Charging & Accessible Details */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>Amenities & Special Lots</span>
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              {carpark.evCharging.available ? (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">EV Charging Hub:</span>
                  <span className="font-semibold text-amber-800">
                    {carpark.evCharging.operator} · {carpark.evCharging.count} lots ({carpark.evCharging.powerKw}kW DC/AC)
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-slate-400">
                  <span>EV Charging:</span>
                  <span>No charging points</span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-600">Handicap Accessible Lots:</span>
                <span className="font-semibold text-purple-800 font-mono-numbers">
                  {carpark.accessibleLots} dedicated spaces
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-600">Motorcycle Lots:</span>
                <span className="font-semibold text-slate-900 font-mono-numbers">
                  {carpark.motorcycleLots} sheltered bays
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isPrimary}
              onClick={() => {
                onSetPrimary(carpark);
                voiceAlertService.speak(
                  `Primary target updated to ${carpark.name}. ${carpark.availableLots} lots available.`,
                  false
                );
                onClose();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                isPrimary
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
              }`}
            >
              {isPrimary ? 'Primary Set' : 'Set as Primary'}
            </button>

            <button
              type="button"
              disabled={isBackup1}
              onClick={() => {
                onSetBackup(carpark, 1);
                onClose();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                isBackup1
                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              {isBackup1 ? 'Backup 1 Set' : 'Set Backup 1'}
            </button>

            <button
              type="button"
              disabled={isBackup2}
              onClick={() => {
                onSetBackup(carpark, 2);
                onClose();
              }}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                isBackup2
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
              }`}
            >
              {isBackup2 ? 'Backup 2 Set' : 'Set Backup 2'}
            </button>
          </div>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              `${carpark.name}, ${carpark.address}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open in Google Maps / Navigation</span>
          </a>
        </div>
      </div>
    </div>
  );
};
