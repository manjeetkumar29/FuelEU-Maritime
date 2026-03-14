import {
  computeComplianceBalance,
  computeEnergy,
  computePercentDiff,
  isCompliant,
  FUEL_EU_CONSTANTS,
} from "../../src/core/domain/value-objects/ComplianceFormulas";

describe("ComplianceFormulas", () => {
  describe("computeEnergy", () => {
    it("should compute energy from fuel consumption", () => {
      expect(computeEnergy(5000)).toBe(5000 * 41_000);
    });
    it("should return 0 for 0 fuel consumption", () => {
      expect(computeEnergy(0)).toBe(0);
    });
  });

  describe("computeComplianceBalance", () => {
    it("returns positive CB when actual < target (surplus)", () => {
      const cb = computeComplianceBalance(88.0, 4800);
      const energy = 4800 * 41_000;
      expect(cb).toBeCloseTo(
        (FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025 - 88.0) * energy,
      );
      expect(cb).toBeGreaterThan(0);
    });

    it("returns negative CB when actual > target (deficit)", () => {
      const cb = computeComplianceBalance(93.5, 5100);
      expect(cb).toBeLessThan(0);
    });

    it("returns ~0 when actual = target", () => {
      const cb = computeComplianceBalance(
        FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025,
        5000,
      );
      expect(cb).toBeCloseTo(0);
    });

    it("uses custom target intensity when provided", () => {
      const cb = computeComplianceBalance(88.0, 5000, 90.0);
      expect(cb).toBeCloseTo((90.0 - 88.0) * 5000 * 41_000);
    });
  });

  describe("computePercentDiff", () => {
    it("computes correct % diff", () => {
      const diff = computePercentDiff(91.0, 88.0);
      expect(diff).toBeCloseTo((88.0 / 91.0 - 1) * 100);
    });

    it("throws if baseline is 0", () => {
      expect(() => computePercentDiff(0, 88)).toThrow(
        "Baseline intensity cannot be zero",
      );
    });
  });

  describe("isCompliant", () => {
    it("is compliant when below target", () => {
      expect(isCompliant(88.0)).toBe(true);
    });
    it("is compliant when equal to target", () => {
      expect(isCompliant(FUEL_EU_CONSTANTS.TARGET_INTENSITY_2025)).toBe(true);
    });
    it("is non-compliant when above target", () => {
      expect(isCompliant(93.5)).toBe(false);
    });
  });
});
