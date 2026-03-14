export const FUEL_EU = {
  TARGET_INTENSITY_2025: 89.3368,
  REFERENCE_INTENSITY: 91.16,
  ENERGY_FACTOR: 41_000,
  API_BASE_URL: "/api",
} as const;

export const VESSEL_TYPES = [
  "Container",
  "BulkCarrier",
  "Tanker",
  "RoRo",
] as const;
export const FUEL_TYPES = [
  "HFO",
  "LNG",
  "MGO",
  "VLSFO",
  "Methanol",
  "Ammonia",
] as const;
export const YEARS = [2024, 2025, 2026] as const;
