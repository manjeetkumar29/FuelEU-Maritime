/** FuelEU Maritime constants per EU 2023/1805, Annex IV */
export const FUEL_EU_CONSTANTS = {
  /** Default target GHG intensity for 2025 (2% below reference 91.16 gCO2e/MJ) */
  TARGET_INTENSITY_2025: 89.3368, // gCO2e/MJ

  /** Energy conversion factor for liquid fuels */
  ENERGY_CONVERSION_MJ_PER_TONNE: 41_000, // MJ/t

  /** Reference GHG intensity = 91.16 gCO2e/MJ */
  REFERENCE_INTENSITY: 91.16,
} as const;

/**
 * Compute energy in scope (MJ) for a given fuel consumption (tonnes).
 * Energy = fuelConsumption × 41,000 MJ/t
 */
export function computeEnergy(fuelConsumptionTonnes: number): number {
  return (
    fuelConsumptionTonnes * FUEL_EU_CONSTANTS.ENERGY_CONVERSION_MJ_PER_TONNE
  );
}

/**
 * Compute Compliance Balance (CB) per Article 4 / Annex IV of FuelEU Maritime.
 * CB = (targetIntensity − actualIntensity) × energyInScope
 * Positive → surplus; Negative → deficit
 */
export function computeComplianceBalance(
  actualIntensity: number,
  fuelConsumptionTonnes: number,
  targetIntensity: number = FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025,
): number {
  const energy = computeEnergy(fuelConsumptionTonnes);
  return (targetIntensity - actualIntensity) * energy;
}

/**
 * Compute percent difference between comparison and baseline intensities.
 * percentDiff = ((comparison / baseline) − 1) × 100
 */
export function computePercentDiff(
  baseline: number,
  comparison: number,
): number {
  if (baseline === 0) throw new Error("Baseline intensity cannot be zero");
  return (comparison / baseline - 1) * 100;
}

/**
 * Determine compliance: actual intensity ≤ target.
 */
export function isCompliant(
  actualIntensity: number,
  targetIntensity: number = FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025,
): boolean {
  return actualIntensity <= targetIntensity;
}
