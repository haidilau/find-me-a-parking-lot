import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Carpark, FilterPreferences, TrackedSlots, TripSimulationState } from './types/carpark';
import { INITIAL_CARPARKS } from './data/singaporeCarparks';
import { voiceAlertService } from './services/voiceAlertService';
import { TopNav } from './components/TopNav';
import { FilterBar } from './components/FilterBar';
import { DriverHud } from './components/DriverHud';
import { CarparkExplorer } from './components/CarparkExplorer';
import { WatchCompanion } from './components/WatchCompanion';
import { RadarView } from './components/RadarView';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { ApiHealthModal } from './components/ApiHealthModal';
import { VoiceAlertModal } from './components/VoiceAlertModal';
import { VoiceAlertIconButton } from './components/VoiceAlertIconButton';
import { Compass, Volume2, Shield, Sparkles } from 'lucide-react';

export default function App() {
  // Main carpark dataset with live simulated fluctuation
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);

  // Active top navigation tab (defaults to Find Lots)
  const [activeTab, setActiveTab] = useState<'hud' | 'explorer' | 'watch' | 'radar'>('explorer');

  // Filter drawer open state
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Detail modal selection
  const [selectedCarparkForDetail, setSelectedCarparkForDetail] = useState<Carpark | null>(null);

  // Government API Health modal state
  const [isApiHealthOpen, setIsApiHealthOpen] = useState(false);

  // Hands-Free Voice Alert modal state (opens on user icon press)
  const [isVoiceAlertModalOpen, setIsVoiceAlertModalOpen] = useState(false);

  // Voice speech synthesis status
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenText, setLastSpokenText] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Filter preferences state
  const [filters, setFilters] = useState<FilterPreferences>({
    hub: 'All',
    searchQuery: '',
    vehicleType: 'car',
    vehicleHeightMeters: 1.9,
    maxHourlyRate: 10,
    shelteredOnly: false,
    evChargingOnly: false,
    accessibleLotsOnly: false,
    sortBy: 'lots',
  });

  // Track up to 3 carparks simultaneously (Primary + 2 Backups)
  const [trackedSlots, setTrackedSlots] = useState<TrackedSlots>({
    primary: INITIAL_CARPARKS[0], // ION Orchard
    backup1: INITIAL_CARPARKS[1], // Wisma Atria
    backup2: INITIAL_CARPARKS[2], // Takashimaya
  });

  // Trip simulation state
  const [tripState, setTripState] = useState<TripSimulationState>({
    isNavigating: true,
    destinationName: INITIAL_CARPARKS[0].name,
    currentEtaMinutes: 12,
    tenMinAlertTriggered: false,
    lowLotAlertTriggered: false,
    lastSpokenText: null,
    isSpeaking: false,
  });

  // Subscribe to Voice Alert service events
  useEffect(() => {
    const unsubscribe = voiceAlertService.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      if (text) {
        setLastSpokenText(text);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch live government carpark availability from /api/carparks
  useEffect(() => {
    const loadGovCarparks = async () => {
      try {
        const res = await fetch('/api/carparks');
        if (res.ok) {
          const data = await res.json();
          if (data.carparks && Array.isArray(data.carparks) && data.carparks.length > 0) {
            setCarparks(data.carparks);
          }
        }
      } catch {
        // Silent fallback
      }
    };

    loadGovCarparks();
    const timer = setInterval(loadGovCarparks, 30000); // sync every 30s
    return () => clearInterval(timer);
  }, []);

  // Update tracked slots whenever carparks list receives updated live lot numbers
  useEffect(() => {
    setTrackedSlots((prev) => {
      const updatedPrimary = prev.primary ? carparks.find((c) => c.id === prev.primary?.id) || prev.primary : null;
      const updatedBackup1 = prev.backup1 ? carparks.find((c) => c.id === prev.backup1?.id) || prev.backup1 : null;
      const updatedBackup2 = prev.backup2 ? carparks.find((c) => c.id === prev.backup2?.id) || prev.backup2 : null;
      return {
        primary: updatedPrimary,
        backup1: updatedBackup1,
        backup2: updatedBackup2,
      };
    });
  }, [carparks]);

  // Periodic real-time lot fluctuation (simulating live LTA DataMall IoT sensor updates)
  useEffect(() => {
    const interval = setInterval(() => {
      setCarparks((prevCarparks) =>
        prevCarparks.map((cp) => {
          // 40% chance of small change (+/- 1 to 2 lots)
          if (Math.random() > 0.6) {
            const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newLots = Math.max(1, Math.min(cp.totalLots, cp.availableLots + delta));
            const newTrend = delta < 0 ? 'filling' : delta > 0 ? 'emptying' : 'stable';
            return {
              ...cp,
              availableLots: newLots,
              trend: newTrend,
            };
          }
          return cp;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Handlers for managing tracked slots
  const handleSetPrimary = useCallback((carpark: Carpark) => {
    setTrackedSlots((prev) => {
      let newBackup1 = prev.backup1;
      let newBackup2 = prev.backup2;

      // If this carpark was already a backup, clear or shift it
      if (prev.backup1?.id === carpark.id) {
        newBackup1 = prev.primary;
      } else if (prev.backup2?.id === carpark.id) {
        newBackup2 = prev.primary;
      }

      return {
        primary: carpark,
        backup1: newBackup1,
        backup2: newBackup2,
      };
    });

    setTripState((prev) => ({
      ...prev,
      destinationName: carpark.name,
      currentEtaMinutes: 12,
      tenMinAlertTriggered: false,
      lowLotAlertTriggered: false,
    }));
  }, []);

  const handleSetBackup = useCallback((carpark: Carpark, slot: 1 | 2) => {
    setTrackedSlots((prev) => {
      if (slot === 1) {
        return {
          ...prev,
          backup1: carpark,
          // Prevent duplicates
          backup2: prev.backup2?.id === carpark.id ? null : prev.backup2,
        };
      } else {
        return {
          ...prev,
          backup2: carpark,
          // Prevent duplicates
          backup1: prev.backup1?.id === carpark.id ? null : prev.backup1,
        };
      }
    });
  }, []);

  const handleSwapBackup = useCallback((backupIndex: 1 | 2) => {
    setTrackedSlots((prev) => {
      if (backupIndex === 1 && prev.backup1) {
        return {
          primary: prev.backup1,
          backup1: prev.primary,
          backup2: prev.backup2,
        };
      }
      if (backupIndex === 2 && prev.backup2) {
        return {
          primary: prev.backup2,
          backup1: prev.backup1,
          backup2: prev.primary,
        };
      }
      return prev;
    });
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<FilterPreferences>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters };
      return updated;
    });
  }, []);

  // Filter and sort carparks list
  const filteredCarparks = useMemo(() => {
    return carparks
      .filter((cp) => {
        // Hub filter (4 regions + CBD + All Singapore)
        if (filters.hub !== 'All') {
          if (filters.hub === 'CBD') {
            if (!['CBD', 'Orchard', 'Marina', 'Bugis'].includes(cp.hub)) return false;
          } else if (filters.hub === 'North') {
            if (!['North', 'NorthEast'].includes(cp.hub)) return false;
          } else if (filters.hub === 'East') {
            if (cp.hub !== 'East') return false;
          } else if (filters.hub === 'West') {
            if (!['West', 'JurongLake'].includes(cp.hub)) return false;
          } else if (filters.hub === 'Central') {
            if (!['Central', 'HarbourFront'].includes(cp.hub)) return false;
          } else if (cp.hub !== filters.hub) {
            return false;
          }
        }

        // Search query filter
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchName = cp.name.toLowerCase().includes(q);
          const matchAddr = cp.address.toLowerCase().includes(q);
          const matchPostal = cp.postalCode.includes(q);
          const matchTown = cp.town ? cp.town.toLowerCase().includes(q) : false;
          const matchHub = cp.hub.toLowerCase().includes(q);
          const matchUra = cp.uraCode ? cp.uraCode.toLowerCase().includes(q) : false;
          if (!matchName && !matchAddr && !matchPostal && !matchTown && !matchHub && !matchUra) {
            return false;
          }
        }

        // Sheltered filter
        if (filters.shelteredOnly && !cp.isSheltered) {
          return false;
        }

        // EV charging filter
        if (filters.evChargingOnly && !cp.evCharging.available) {
          return false;
        }

        // Accessible lots filter
        if (filters.accessibleLotsOnly && cp.accessibleLots === 0) {
          return false;
        }

        // Vehicle clearance filter
        if (cp.heightClearanceMeters < filters.vehicleHeightMeters) {
          if (filters.vehicleType === 'heavy_vehicle') {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'lots') {
          return b.availableLots - a.availableLots;
        }
        if (filters.sortBy === 'distance') {
          return a.walkingDistanceMeters - b.walkingDistanceMeters;
        }
        if (filters.sortBy === 'cheapest') {
          return a.pricing.hourlyEstimate - b.pricing.hourlyEstimate;
        }
        if (filters.sortBy === 'clearance') {
          return b.heightClearanceMeters - a.heightClearanceMeters;
        }
        return 0;
      });
  }, [carparks, filters]);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    voiceAlertService.setMuted(nextMuted);
  }, [isMuted]);

  const testVoiceAlert = useCallback(() => {
    voiceAlertService.testVoice();
  }, []);

  const hasRecentUrgentAlert = Boolean(
    lastSpokenText && (lastSpokenText.toLowerCase().includes('alert') || lastSpokenText.toLowerCase().includes('drop'))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16">
      {/* 3-Zone Top Navigation Contract */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMuted={isMuted}
        isSpeaking={isSpeaking}
        onToggleMute={toggleMute}
        onOpenVoiceAlert={() => setIsVoiceAlertModalOpen(true)}
        onOpenApiHealth={() => setIsApiHealthOpen(true)}
      />

      {/* Regional Filter Bar & Headers (displayed only in Find Lots tab) */}
      {activeTab === 'explorer' && (
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          isOpen={isFilterOpen}
          onToggleOpen={() => setIsFilterOpen(!isFilterOpen)}
          carparkCount={filteredCarparks.length}
        />
      )}

      {/* Main Tab Views */}
      <main className="flex-1 w-full">
        {activeTab === 'hud' && (
          <DriverHud
            trackedSlots={trackedSlots}
            onSwapBackup={handleSwapBackup}
            onOpenExplorer={() => setActiveTab('explorer')}
            onSelectCarparkForDetail={(cp) => setSelectedCarparkForDetail(cp)}
            tripState={tripState}
            setTripState={setTripState}
            userVehicleHeight={filters.vehicleHeightMeters}
          />
        )}

        {activeTab === 'explorer' && (
          <CarparkExplorer
            carparks={filteredCarparks}
            filters={filters}
            onFilterChange={handleFilterChange}
            trackedSlots={trackedSlots}
            onSetPrimary={handleSetPrimary}
            onSetBackup={handleSetBackup}
            onSelectCarparkForDetail={(cp) => setSelectedCarparkForDetail(cp)}
          />
        )}

        {activeTab === 'watch' && (
          <WatchCompanion
            trackedSlots={trackedSlots}
            onSwapBackup={handleSwapBackup}
            onSelectCarparkForDetail={(cp) => setSelectedCarparkForDetail(cp)}
          />
        )}

        {activeTab === 'radar' && (
          <RadarView
            trackedSlots={trackedSlots}
            onSwapBackup={handleSwapBackup}
            onOpenExplorer={() => setActiveTab('explorer')}
            onSelectCarparkForDetail={(cp) => setSelectedCarparkForDetail(cp)}
          />
        )}
      </main>

      {/* Carpark Detail Tariff & Amenity Modal */}
      {selectedCarparkForDetail && (
        <CarparkDetailModal
          carpark={selectedCarparkForDetail}
          onClose={() => setSelectedCarparkForDetail(null)}
          trackedSlots={trackedSlots}
          onSetPrimary={handleSetPrimary}
          onSetBackup={handleSetBackup}
          userVehicleHeight={filters.vehicleHeightMeters}
        />
      )}

      {/* Government API Health & Monitoring Modal */}
      <ApiHealthModal
        isOpen={isApiHealthOpen}
        onClose={() => setIsApiHealthOpen(false)}
      />

      {/* Hands-Free Voice Alert Modal (Opened when user presses the Voice Alert Icon) */}
      <VoiceAlertModal
        isOpen={isVoiceAlertModalOpen}
        onClose={() => setIsVoiceAlertModalOpen(false)}
        isSpeaking={isSpeaking}
        lastSpokenText={lastSpokenText}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onQuickSwitchToBackup={() => handleSwapBackup(1)}
        onTestVoice={testVoiceAlert}
        backupName={trackedSlots.backup1?.name}
        backupLots={trackedSlots.backup1?.availableLots}
        primaryName={trackedSlots.primary?.name}
        primaryLots={trackedSlots.primary?.availableLots}
      />

      {/* Hands-Free Voice Alert Icon Button (Press to view/replay voice alerts) */}
      <VoiceAlertIconButton
        isSpeaking={isSpeaking}
        isMuted={isMuted}
        hasRecentAlert={hasRecentUrgentAlert}
        onClick={() => setIsVoiceAlertModalOpen(true)}
      />

      {/* Fixed Ergonomic Bottom Tab Bar (Pattern 1 from Mobile Touch Reference) */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 sm:hidden shadow-lg">
        <div className="grid grid-cols-4 items-center justify-items-center h-12 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hud')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'hud' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">HUD</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('explorer')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'explorer' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Find</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('watch')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'watch' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Watch</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'radar' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Volume2 className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Radar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
