import React from 'react';
import { Filter, SlidersHorizontal, Car, Bike, Truck, Zap, Umbrella, Accessibility, ArrowUpDown, X } from 'lucide-react';
import { FilterPreferences, HubZone, VehicleType } from '../types/carpark';

interface FilterBarProps {
  filters: FilterPreferences;
  onFilterChange: (newFilters: Partial<FilterPreferences>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  carparkCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggleOpen,
  carparkCount,
}) => {
  const hubs: { id: HubZone; label: string }[] = [
    { id: 'All', label: 'All Singapore' },
    { id: 'CBD', label: 'CBD' },
    { id: 'North', label: 'North' },
    { id: 'East', label: 'East' },
    { id: 'West', label: 'West' },
    { id: 'Central', label: 'Central' },
  ];

  const activeFilterCount =
    (filters.shelteredOnly ? 1 : 0) +
    (filters.evChargingOnly ? 1 : 0) +
    (filters.accessibleLotsOnly ? 1 : 0) +
    (filters.vehicleType !== 'car' ? 1 : 0) +
    (filters.vehicleHeightMeters > 1.9 ? 1 : 0);

  return (
    <div className="w-full bg-white border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Top row: Hub Switcher (interactive buttons) + Filter Trigger */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {hubs.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => onFilterChange({ hub: hub.id })}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap min-h-[36px] ${
                  filters.hub === hub.id
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {hub.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onToggleOpen}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors min-h-[40px] whitespace-nowrap ${
              isOpen || activeFilterCount > 0
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </button>
        </div>

        {/* Expandable Filter Drawer */}
        {isOpen && (
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Personalised Parking Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={onToggleOpen}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Vehicle Type */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium">Vehicle Category</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ vehicleType: 'car' })}
                    className={`py-2 px-1 flex flex-col items-center gap-1 rounded-lg font-medium transition-colors ${
                      filters.vehicleType === 'car'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span className="text-[10px]">Car</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ vehicleType: 'motorcycle' })}
                    className={`py-2 px-1 flex flex-col items-center gap-1 rounded-lg font-medium transition-colors ${
                      filters.vehicleType === 'motorcycle'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bike className="w-4 h-4" />
                    <span className="text-[10px]">Motorcycle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ vehicleType: 'heavy_vehicle' })}
                    className={`py-2 px-1 flex flex-col items-center gap-1 rounded-lg font-medium transition-colors ${
                      filters.vehicleType === 'heavy_vehicle'
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span className="text-[10px]">Van/Lorry</span>
                  </button>
                </div>
              </div>

              {/* Height Clearance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-medium">Min Height Clearance</label>
                  <span className="font-mono-numbers text-emerald-700 font-bold">
                    {filters.vehicleHeightMeters.toFixed(2)}m
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1.8, 1.9, 2.0, 2.1, 2.2].map((height) => (
                    <button
                      key={height}
                      type="button"
                      onClick={() => onFilterChange({ vehicleHeightMeters: height })}
                      className={`flex-1 py-1.5 text-[11px] font-mono-numbers rounded-lg border transition-colors ${
                        filters.vehicleHeightMeters === height
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {height.toFixed(1)}m
                    </button>
                  ))}
                </div>
                {filters.vehicleHeightMeters > 2.0 && (
                  <p className="text-[10px] text-amber-700 leading-tight">
                    Older malls (1.9m) will be filtered out to prevent gantry strike.
                  </p>
                )}
              </div>

              {/* Sort By */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  <span>Prioritise By</span>
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ sortBy: 'lots' })}
                    className={`py-1.5 px-2 rounded-lg text-left transition-colors truncate ${
                      filters.sortBy === 'lots'
                        ? 'bg-white text-emerald-800 font-bold shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Most Lots
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ sortBy: 'distance' })}
                    className={`py-1.5 px-2 rounded-lg text-left transition-colors truncate ${
                      filters.sortBy === 'distance'
                        ? 'bg-white text-emerald-800 font-bold shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Shortest Walk
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ sortBy: 'cheapest' })}
                    className={`py-1.5 px-2 rounded-lg text-left transition-colors truncate ${
                      filters.sortBy === 'cheapest'
                        ? 'bg-white text-emerald-800 font-bold shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Cheapest Rate
                  </button>
                  <button
                    type="button"
                    onClick={() => onFilterChange({ sortBy: 'clearance' })}
                    className={`py-1.5 px-2 rounded-lg text-left transition-colors truncate ${
                      filters.sortBy === 'clearance'
                        ? 'bg-white text-emerald-800 font-bold shadow-sm border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    High Clearance
                  </button>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium">Key Amenities</label>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => onFilterChange({ shelteredOnly: !filters.shelteredOnly })}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-colors ${
                      filters.shelteredOnly
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Umbrella className="w-3.5 h-3.5 text-blue-600" />
                      <span>Sheltered Parking</span>
                    </span>
                    <span className="font-mono-numbers text-[10px]">
                      {filters.shelteredOnly ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onFilterChange({ evChargingOnly: !filters.evChargingOnly })}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-colors ${
                      filters.evChargingOnly
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      <span>EV Charging Station</span>
                    </span>
                    <span className="font-mono-numbers text-[10px]">
                      {filters.evChargingOnly ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onFilterChange({ accessibleLotsOnly: !filters.accessibleLotsOnly })}
                    className={`flex items-center justify-between p-2 rounded-xl border text-left transition-colors ${
                      filters.accessibleLotsOnly
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Accessibility className="w-3.5 h-3.5 text-purple-600" />
                      <span>Accessible / Handicap</span>
                    </span>
                    <span className="font-mono-numbers text-[10px]">
                      {filters.accessibleLotsOnly ? 'ON' : 'OFF'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
              <span>Showing {carparkCount} matching carparks in Singapore</span>
              <button
                type="button"
                onClick={() =>
                  onFilterChange({
                    shelteredOnly: false,
                    evChargingOnly: false,
                    accessibleLotsOnly: false,
                    vehicleType: 'car',
                    vehicleHeightMeters: 1.9,
                    sortBy: 'lots',
                  })
                }
                className="text-slate-600 hover:text-slate-900 underline font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
