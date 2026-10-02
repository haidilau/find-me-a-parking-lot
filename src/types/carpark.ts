export type HubZone =
  | 'All'
  | 'Orchard'
  | 'Marina'
  | 'CBD'
  | 'Bugis'
  | 'East'
  | 'West'
  | 'North'
  | 'NorthEast'
  | 'Central'
  | 'HarbourFront'
  | 'JurongLake';

export type VehicleType = 'car' | 'motorcycle' | 'heavy_vehicle';

export interface EVChargerInfo {
  available: boolean;
  count: number;
  operator: string; // e.g. "SP Group", "Shell Recharge", "CDG ENGIE"
  powerKw: number; // e.g. 50
  plugTypes: string[]; // e.g. ["Type 2", "CCS 2"]
}

export interface PricingRate {
  weekdayDayRate: string; // e.g. "$1.50 / 30 mins"
  weekdayPerEntry?: string; // e.g. "$3.50 after 5pm"
  weekendRate: string; // e.g. "$2.40 / 30 mins"
  hourlyEstimate: number; // in SGD, for sorting
  gracePeriodMins: number; // e.g. 10
}

export interface Carpark {
  id: string;
  name: string;
  hub: HubZone;
  town?: string; // e.g. "Tampines", "Woodlands", "Jurong East", "Bedok", "Punggol"
  uraCode?: string; // e.g. "N0006", "A0004", "TP12"
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  totalLots: number;
  availableLots: number;
  trend: 'stable' | 'filling' | 'emptying';
  historicalCrowd: 'light' | 'moderate' | 'heavy' | 'critical';
  isSheltered: boolean;
  heightClearanceMeters: number; // e.g. 2.1
  walkingDistanceMeters: number; // to primary destination / MRT / hub anchor
  walkingTimeMinutes: number;
  pricing: PricingRate;
  evCharging: EVChargerInfo;
  accessibleLots: number;
  motorcycleLots: number;
  gantryHeightExceeded?: boolean;
}

export interface FilterPreferences {
  hub: HubZone;
  searchQuery: string;
  vehicleType: VehicleType;
  vehicleHeightMeters: number; // e.g. 1.85m default
  maxHourlyRate: number; // max budget e.g. $10
  shelteredOnly: boolean;
  evChargingOnly: boolean;
  accessibleLotsOnly: boolean;
  sortBy: 'lots' | 'distance' | 'cheapest' | 'clearance';
}

export interface TrackedSlots {
  primary: Carpark | null;
  backup1: Carpark | null;
  backup2: Carpark | null;
}

export interface VoiceAlertSettings {
  enabled: boolean;
  tenMinuteAlertEnabled: boolean;
  lowLotAlertEnabled: boolean;
  thresholdLots: number; // default: 10 lots
  voiceSpeed: number; // 0.9 to 1.2
}

export interface TripSimulationState {
  isNavigating: boolean;
  destinationName: string;
  currentEtaMinutes: number;
  tenMinAlertTriggered: boolean;
  lowLotAlertTriggered: boolean;
  lastSpokenText: string | null;
  isSpeaking: boolean;
}
