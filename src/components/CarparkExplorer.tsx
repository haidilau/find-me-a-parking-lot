import React from 'react';
import { 
  Search, 
  MapPin, 
  Zap, 
  Umbrella, 
  Accessibility, 
  ArrowRight, 
  Info, 
  Check, 
  AlertTriangle,
  Radio,
  Car
} from 'lucide-react';
import { Carpark, FilterPreferences, TrackedSlots } from '../types/carpark';
import { voiceAlertService } from '../services/voiceAlertService';

interface CarparkExplorerProps {
  carparks: Carpark[];
  filters: FilterPreferences;
  onFilterChange: (newFilters: Partial<FilterPreferences>) => void;
  trackedSlots: TrackedSlots;
  onSetPrimary: (carpark: Carpark) => void;
  onSetBackup: (carpark: Carpark, slot: 1 | 2) => void;
  onSelectCarparkForDetail: (carpark: Carpark) => void;
}

export const CarparkExplorer: React.FC<CarparkExplorerProps> = ({
  carparks,
  filters,
  onFilterChange,
  trackedSlots,
  onSetPrimary,
  onSetBackup,
  onSelectCarparkForDetail,
}) => {
  const { primary, backup1, backup2 } = trackedSlots;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search across all Singapore (e.g. Tampines, Woodlands, Jurong, Bedok, Punggol, ION, MBS)..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm transition-colors"
        />
        {filters.searchQuery && (
          <button
            type="button"
            onClick={() => onFilterChange({ searchQuery: '' })}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Hub Highlight Banner with generated photo */}
      {filters.hub === 'Orchard' && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col sm:flex-row items-center">
            <div className="p-4 sm:p-5 flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Orchard Road Hub Guide
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Underground Gantry & Height Advisory
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Older shopping centres like Takashimaya and Far East Plaza feature strict 1.9m clearance ceilings. ION Orchard and 313@somerset accommodate up to 2.1m.
              </p>
            </div>
            <div className="w-full sm:w-48 h-28 sm:h-auto self-stretch relative shrink-0">
              <img
                src="/src/assets/images/sg_carpark_orchard_1790906104039.jpg"
                alt="Orchard Carpark Electronic Bay Indicator"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-l from-white via-transparent to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Carpark Cards List */}
      <div className="space-y-3">
        {carparks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2 shadow-sm">
            <Car className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">No carparks match your criteria</h4>
            <p className="text-xs text-slate-500">
              Try adjusting your height clearance ({filters.vehicleHeightMeters}m) or relaxing the amenities filter.
            </p>
          </div>
        ) : (
          carparks.map((carpark) => {
            const isPrimary = primary?.id === carpark.id;
            const isBackup1 = backup1?.id === carpark.id;
            const isBackup2 = backup2?.id === carpark.id;
            const isTracked = isPrimary || isBackup1 || isBackup2;

            const isLow = carpark.availableLots <= 30;
            const isCritical = carpark.availableLots <= 10;

            const heightExceeded = carpark.heightClearanceMeters < filters.vehicleHeightMeters;

            return (
              <div
                key={carpark.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isPrimary
                    ? 'bg-white border-2 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                    : isTracked
                    ? 'bg-slate-50 border-slate-300 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left info */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-500">
                        {carpark.town ? `${carpark.town} · ${carpark.hub}` : carpark.hub}
                      </span>
                      {carpark.uraCode && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {carpark.uraCode}
                        </span>
                      )}
                      {isPrimary && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                          Primary Target
                        </span>
                      )}
                      {isBackup1 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
                          Backup #1
                        </span>
                      )}
                      {isBackup2 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-50 text-purple-800 border border-purple-200 rounded-md">
                          Backup #2
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                      {carpark.name}
                    </h3>

                    {/* Unboxed Metadata with Typographic Separators */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 flex-wrap font-medium">
                      <span>{carpark.isSheltered ? 'Sheltered' : 'Open Air'}</span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className={`font-mono-numbers ${heightExceeded ? 'text-rose-600 font-bold' : ''}`}>
                        {carpark.heightClearanceMeters}m clearance
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono-numbers">
                        {carpark.walkingDistanceMeters === 0 ? 'Direct hub' : `${carpark.walkingDistanceMeters}m (${carpark.walkingTimeMinutes} min walk)`}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="font-mono-numbers text-slate-700">
                        {carpark.pricing.weekdayDayRate.split('(')[0]}
                      </span>
                    </div>

                    {/* Amenities Row */}
                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5">
                      {carpark.evCharging.available && (
                        <span className="flex items-center gap-1 text-amber-700 font-medium">
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>{carpark.evCharging.operator} ({carpark.evCharging.count} lots · {carpark.evCharging.powerKw}kW)</span>
                        </span>
                      )}
                      {carpark.accessibleLots > 0 && (
                        <span className="flex items-center gap-1 text-purple-700 font-medium">
                          <Accessibility className="w-3.5 h-3.5 text-purple-600" />
                          <span>{carpark.accessibleLots} accessible</span>
                        </span>
                      )}
                    </div>

                    {heightExceeded && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 pt-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Warning: Clearance {carpark.heightClearanceMeters}m is below your vehicle height {filters.vehicleHeightMeters}m!</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Available Lots Counter + Tracking Actions */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                    <div className="text-left sm:text-right">
                      <div className="text-2xl sm:text-3xl font-black font-mono-numbers tracking-tight flex items-baseline sm:justify-end gap-1">
                        <span className={isCritical ? 'text-rose-700' : isLow ? 'text-amber-700' : 'text-emerald-700'}>
                          {carpark.availableLots}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">/ {carpark.totalLots}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 block">
                        {isCritical ? 'CRITICAL · FILLING' : isLow ? 'LIMITED' : 'AMPLE SPACES'}
                      </span>
                    </div>

                    {/* Quick Tracking Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectCarparkForDetail(carpark)}
                        className="py-1.5 px-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 border border-slate-200"
                        title="View rate schedule"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => {
                            onSetPrimary(carpark);
                            voiceAlertService.speak(
                              `Target updated to ${carpark.name}. ${carpark.availableLots} lots available.`,
                              false
                            );
                          }}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors active:scale-95 shadow-sm"
                        >
                          Track Primary
                        </button>
                      )}

                      {!isTracked && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onSetBackup(carpark, 1)}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors border border-slate-200"
                            title="Set as Backup 1"
                          >
                            +Bk 1
                          </button>
                          <button
                            type="button"
                            onClick={() => onSetBackup(carpark, 2)}
                            className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors border border-slate-200"
                            title="Set as Backup 2"
                          >
                            +Bk 2
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
