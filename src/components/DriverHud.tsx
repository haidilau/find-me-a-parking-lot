import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  ArrowRightLeft, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Footprints, 
  Sparkles, 
  MapPin, 
  Volume2, 
  Play, 
  RotateCcw,
  CheckCircle2,
  Umbrella,
  Compass
} from 'lucide-react';
import { Carpark, TrackedSlots, TripSimulationState } from '../types/carpark';
import { voiceAlertService } from '../services/voiceAlertService';

interface DriverHudProps {
  trackedSlots: TrackedSlots;
  onSwapBackup: (backupIndex: 1 | 2) => void;
  onOpenExplorer: () => void;
  onSelectCarparkForDetail: (carpark: Carpark) => void;
  tripState: TripSimulationState;
  setTripState: React.Dispatch<React.SetStateAction<TripSimulationState>>;
  userVehicleHeight: number;
}

export const DriverHud: React.FC<DriverHudProps> = ({
  trackedSlots,
  onSwapBackup,
  onOpenExplorer,
  onSelectCarparkForDetail,
  tripState,
  setTripState,
  userVehicleHeight,
}) => {
  const { primary, backup1, backup2 } = trackedSlots;

  // Track simulation interval
  const [isSimulating, setIsSimulating] = useState(false);

  // Monitor primary lots for low threshold (<= 10)
  useEffect(() => {
    if (primary && primary.availableLots <= 10 && !tripState.lowLotAlertTriggered) {
      voiceAlertService.speakLowLotAlert(
        primary.name,
        primary.availableLots,
        backup1?.name || backup2?.name,
        backup1?.availableLots || backup2?.availableLots
      );
      setTripState((prev) => ({
        ...prev,
        lowLotAlertTriggered: true,
        lastSpokenText: `Alert! ${primary.name} dropped to ${primary.availableLots} lots! Switch to backup?`,
      }));
    }
  }, [primary?.availableLots, primary?.name, backup1, backup2, tripState.lowLotAlertTriggered, setTripState]);

  // ETA countdown simulator effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSimulating) {
      timer = setInterval(() => {
        setTripState((prev) => {
          if (prev.currentEtaMinutes <= 1) {
            setIsSimulating(false);
            voiceAlertService.speak(`Arrived at ${primary?.name || 'destination'}. Welcome.`, false);
            return { ...prev, currentEtaMinutes: 0 };
          }

          const nextEta = prev.currentEtaMinutes - 1;

          // Trigger 10-minute alert when hitting 10 minutes!
          if (nextEta === 10 && !prev.tenMinAlertTriggered && primary) {
            voiceAlertService.speakTenMinuteAlert(
              primary.name,
              primary.availableLots,
              primary.isSheltered
            );
            return {
              ...prev,
              currentEtaMinutes: nextEta,
              tenMinAlertTriggered: true,
              lastSpokenText: `10 minutes to ${primary.name}. ${primary.availableLots} lots currently available.`,
            };
          }

          return { ...prev, currentEtaMinutes: nextEta };
        });
      }, 1500); // 1.5s per simulated minute
    }
    return () => clearInterval(timer);
  }, [isSimulating, primary, setTripState]);

  // Manual trigger for 10-minute alert demo
  const triggerTenMinAlertDemo = () => {
    if (!primary) return;
    setTripState((prev) => ({ ...prev, currentEtaMinutes: 10, tenMinAlertTriggered: true }));
    voiceAlertService.speakTenMinuteAlert(
      primary.name,
      primary.availableLots,
      primary.isSheltered
    );
  };

  // Manual trigger for low lot alert demo
  const triggerLowLotAlertDemo = () => {
    if (!primary) return;
    setTripState((prev) => ({ ...prev, lowLotAlertTriggered: true }));
    voiceAlertService.speakLowLotAlert(
      primary.name,
      7,
      backup1?.name || 'Wisma Atria',
      backup1?.availableLots || 124
    );
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setTripState((prev) => ({
      ...prev,
      currentEtaMinutes: 12,
      tenMinAlertTriggered: false,
      lowLotAlertTriggered: false,
      lastSpokenText: null,
    }));
  };

  if (!primary) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm">
          <MapPin className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Destination Selected</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Choose a carpark in Orchard, Marina Bay, HarbourFront, or Jurong Lake to activate hands-free tracking and voice alerts.
        </p>
        <button
          type="button"
          onClick={onOpenExplorer}
          className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-transform active:scale-95 shadow-md shadow-emerald-600/20"
        >
          Select Carpark Destination
        </button>
      </div>
    );
  }

  // Calculate lot fullness percentage & color
  const isCritical = primary.availableLots <= 10;
  const isLow = primary.availableLots <= 30;

  const statusColorClass = isCritical
    ? 'text-rose-700 border-rose-200 bg-rose-50'
    : isLow
    ? 'text-amber-700 border-amber-200 bg-amber-50'
    : 'text-emerald-700 border-emerald-200 bg-emerald-50';

  const badgeColor = isCritical ? 'bg-rose-600' : isLow ? 'bg-amber-600' : 'bg-emerald-600';

  // Clearance safety check
  const clearanceSafe = primary.heightClearanceMeters >= userVehicleHeight;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4">
      {/* Driver Cockpit Header Banner with Hero Scrim */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
        {/* Background photo with clean light contrast scrim */}
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="/src/assets/images/sg_carpark_cockpit_1790906086870.jpg"
            alt="Singapore Marina Bay Dusk Driver Cockpit"
            className="w-full h-full object-cover object-center"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/30" />
        </div>

        <div className="relative z-10 p-4 sm:p-6 space-y-4">
          {/* Top Status Strip */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-800">
                Live Navigation & Co-Pilot
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-600 font-semibold">{primary.town ? `${primary.town} · ${primary.hub}` : primary.hub}</span>
            </div>

            {/* Voice Status indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-700 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Voice Alerts Active</span>
            </div>
          </div>

          {/* Primary Target Big Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                  Primary Destination
                </span>
                {primary.isSheltered && (
                  <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                    <Umbrella className="w-3.5 h-3.5 text-blue-600" />
                    <span>Sheltered</span>
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
                {primary.name}
              </h1>
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{primary.address}</span>
              </p>
            </div>

            {/* Giant Lot Readout HUD Display */}
            <div className={`p-4 rounded-2xl border text-center min-w-[160px] ${statusColorClass} shadow-sm backdrop-blur-md`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                Available Lots
              </div>
              <div className="text-4xl sm:text-5xl font-black font-mono-numbers tracking-tight flex items-baseline justify-center gap-1">
                <span>{primary.availableLots}</span>
                <span className="text-sm font-normal text-slate-500">/ {primary.totalLots}</span>
              </div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-bold">
                <span className={`w-1.5 h-1.5 rounded-full ${badgeColor}`} />
                <span>
                  {isCritical ? 'URGENT · FILLING FAST' : isLow ? 'LIMITED LOTS' : 'AMPLE SPACES'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Quick Info Strip (Unboxed Clean Metadata) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs border-t border-slate-200">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Walking to Anchor</span>
              <span className="font-semibold text-slate-900 font-mono-numbers">
                {primary.walkingDistanceMeters === 0 ? 'Direct Link' : `${primary.walkingDistanceMeters}m · ${primary.walkingTimeMinutes} min walk`}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Height Clearance</span>
              <span className={`font-semibold font-mono-numbers flex items-center gap-1 ${clearanceSafe ? 'text-slate-900' : 'text-rose-600'}`}>
                {primary.heightClearanceMeters}m
                {clearanceSafe ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 inline" />
                )}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block">Estimated Rate</span>
              <span className="font-semibold text-slate-900 font-mono-numbers">
                {primary.pricing.weekdayDayRate.split('(')[0]}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-[10px] block">EV Charging</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                {primary.evCharging.available ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>{primary.evCharging.count}x {primary.evCharging.powerKw}kW</span>
                  </>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </span>
            </div>
          </div>

          {/* Critical Low Lots Warning Banner */}
          {isCritical && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-3 text-rose-900 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="text-xs font-bold">
                  Main carpark has only {primary.availableLots} lots left! Backup recommended.
                </span>
              </div>
              {backup1 && (
                <button
                  type="button"
                  onClick={() => onSwapBackup(1)}
                  className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                >
                  Switch to Backup 1
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3-CARPARK TRACKER MATRIX: Primary + Backup 1 + Backup 2 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Tracked Carparks (Triple-Backup Radar)
            </h2>
            <span className="text-xs text-emerald-700 font-bold">3 of 3 Active</span>
          </div>
          <button
            type="button"
            onClick={onOpenExplorer}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold"
          >
            Change Backups
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Slot 1: Primary Target */}
          <div className="hud-card-active rounded-2xl p-4 relative overflow-hidden bg-white">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-bold text-emerald-800 uppercase tracking-wider">
                Primary (Current)
              </span>
              <span className="text-slate-500 font-mono-numbers">0m</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900 truncate">{primary.name}</h3>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-black font-mono-numbers text-emerald-700">
                {primary.availableLots} <span className="text-xs font-normal text-slate-500">lots</span>
              </span>
              <button
                type="button"
                onClick={() => onSelectCarparkForDetail(primary)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium"
              >
                Rates & Info
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
              <span>{primary.isSheltered ? 'Sheltered' : 'Open Air'}</span>
              <span className="font-medium text-slate-700">{primary.pricing.weekdayDayRate.split('(')[0]}</span>
            </div>
          </div>

          {/* Slot 2: Backup #1 */}
          <div className="hud-card rounded-2xl p-4 relative bg-white hover:border-slate-300 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-semibold text-slate-600 uppercase tracking-wider">
                Backup #1
              </span>
              {backup1 && (
                <span className="text-slate-500 font-mono-numbers">
                  +{backup1.walkingDistanceMeters}m
                </span>
              )}
            </div>

            {backup1 ? (
              <>
                <h3 className="font-bold text-sm text-slate-900 truncate">{backup1.name}</h3>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono-numbers text-slate-800">
                    {backup1.availableLots} <span className="text-xs font-normal text-slate-500">lots</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSwapBackup(1)}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 border border-slate-200"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Promote</span>
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>{backup1.isSheltered ? 'Sheltered' : 'Open Air'}</span>
                  <button
                    type="button"
                    onClick={() => onSelectCarparkForDetail(backup1)}
                    className="hover:text-slate-800 font-medium"
                  >
                    Details
                  </button>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <button
                  type="button"
                  onClick={onOpenExplorer}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  + Add Backup 1
                </button>
              </div>
            )}
          </div>

          {/* Slot 3: Backup #2 */}
          <div className="hud-card rounded-2xl p-4 relative bg-white hover:border-slate-300 transition-colors shadow-sm">
            <div className="flex items-center justify-between text-[11px] mb-2">
              <span className="font-semibold text-slate-600 uppercase tracking-wider">
                Backup #2
              </span>
              {backup2 && (
                <span className="text-slate-500 font-mono-numbers">
                  +{backup2.walkingDistanceMeters}m
                </span>
              )}
            </div>

            {backup2 ? (
              <>
                <h3 className="font-bold text-sm text-slate-900 truncate">{backup2.name}</h3>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-black font-mono-numbers text-slate-800">
                    {backup2.availableLots} <span className="text-xs font-normal text-slate-500">lots</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSwapBackup(2)}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 border border-slate-200"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Promote</span>
                  </button>
                </div>
                <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>{backup2.isSheltered ? 'Sheltered' : 'Open Air'}</span>
                  <button
                    type="button"
                    onClick={() => onSelectCarparkForDetail(backup2)}
                    className="hover:text-slate-800 font-medium"
                  >
                    Details
                  </button>
                </div>
              </>
            ) : (
              <div className="py-4 text-center">
                <button
                  type="button"
                  onClick={onOpenExplorer}
                  className="text-xs text-emerald-700 font-semibold hover:underline"
                >
                  + Add Backup 2
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APPROACH ETA & VOICE ALERT SIMULATOR PANEL */}
      <div className="p-4 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Driver Approach & Voice Alert Simulator
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Simulate arriving on PIE/AYE/CTE to test 10-minute ETA and low-lot voice prompts
            </p>
          </div>

          {/* Current ETA Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Estimated Arrival:</span>
            <div className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-xl font-mono-numbers text-sm font-bold text-emerald-800 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${tripState.currentEtaMinutes === 10 ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'}`} />
              <span>{tripState.currentEtaMinutes} mins</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isSimulating
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Pause Drive' : 'Start Drive Sim'}</span>
          </button>

          <button
            type="button"
            onClick={triggerTenMinAlertDemo}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test 10-Min Alert</span>
          </button>

          <button
            type="button"
            onClick={triggerLowLotAlertDemo}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Test &le;10 Lots Alert</span>
          </button>

          <button
            type="button"
            onClick={resetSimulation}
            className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset (12m)</span>
          </button>
        </div>

        {/* Real Driving Voice Alert Logic Explanation */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>Hands-Free Automotive Safety Standard</span>
          </div>
          <p>
            When driving, ParkSG monitors your GPS location. Exactly <strong>10 minutes before arrival</strong>, a voice announcement informs you of remaining lots without requiring you to take your eyes off the road. If lots drop to <strong>10 or fewer</strong>, an urgent alert suggests switching to your standby backup.
          </p>
        </div>
      </div>

      {/* Large Touch Target Driving Action Buttons (Bottom Bar / HUD) */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            `${primary.name}, ${primary.address}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[52px] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
        >
          <Navigation className="w-5 h-5 fill-white" />
          <span className="text-sm">Turn-by-Turn GPS</span>
        </a>

        <button
          type="button"
          onClick={() => onSelectCarparkForDetail(primary)}
          className="min-h-[52px] py-3.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 font-semibold rounded-2xl flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <Footprints className="w-5 h-5 text-emerald-600" />
          <span className="text-sm">Rates & Entrance Info</span>
        </button>
      </div>
    </div>
  );
};
