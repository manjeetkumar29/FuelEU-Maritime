import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatCB,
  cbColorClass,
} from "../../src/shared/utils/format";

describe("formatNumber", () => {
  it("formats with 2 decimal places by default", () => {
    expect(formatNumber(91.0)).toBe("91.00");
  });
  it("formats with 0 decimal places", () => {
    expect(formatNumber(5000, 0)).toBe("5,000");
  });
  it("formats negative numbers", () => {
    expect(formatNumber(-88.5, 1)).toBe("-88.5");
  });
});

describe("formatCB", () => {
  it("shows + for positive CB", () => {
    expect(formatCB(100_000)).toContain("+");
  });
  it("shows - for negative CB", () => {
    expect(formatCB(-100_000)).toContain("-");
  });
  it("includes gCO₂eq unit", () => {
    expect(formatCB(0)).toContain("gCO₂eq");
  });
});

describe("cbColorClass", () => {
  it("returns green for surplus", () => {
    expect(cbColorClass(100)).toBe("text-green-600");
  });
  it("returns red for deficit", () => {
    expect(cbColorClass(-100)).toBe("text-red-600");
  });
  it("returns gray for zero", () => {
    expect(cbColorClass(0)).toBe("text-gray-500");
  });
});
