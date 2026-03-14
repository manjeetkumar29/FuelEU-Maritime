import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoutesTab } from "../../src/adapters/ui/components/RoutesTab/RoutesTab";
import { IRouteService } from "../../src/core/ports/outbound/IRouteService";
import { Route } from "../../src/core/domain/entities/Route";

const makeRoute = (overrides: Partial<Route> = {}): Route => ({
  id: "1",
  routeId: "R001",
  vesselType: "Container",
  fuelType: "HFO",
  year: 2024,
  ghgIntensity: 91.0,
  fuelConsumption: 5000,
  distance: 12000,
  totalEmissions: 4500,
  isBaseline: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

function createMockService(): IRouteService {
  return {
    getRoutes: vi.fn().mockResolvedValue([makeRoute()]),
    setBaseline: vi.fn().mockResolvedValue(makeRoute({ isBaseline: true })),
    getComparison: vi
      .fn()
      .mockResolvedValue({ baseline: makeRoute(), comparisons: [] }),
  };
}

describe("RoutesTab", () => {
  let mockService: IRouteService;

  beforeEach(() => {
    mockService = createMockService();
  });

  it("renders loading state initially", () => {
    render(<RoutesTab routeService={mockService} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders routes after loading", async () => {
    render(<RoutesTab routeService={mockService} />);
    await waitFor(() => {
      expect(screen.getByText("R001")).toBeInTheDocument();
    });
  });

  it("displays correct compliance status", async () => {
    render(<RoutesTab routeService={mockService} />);
    await waitFor(() => {
      // R001 with 91.0 > 89.3368 → Non-Compliant
      expect(screen.getByText("❌ Non-Compliant")).toBeInTheDocument();
    });
  });

  it("shows Set Baseline button", async () => {
    render(<RoutesTab routeService={mockService} />);
    await waitFor(() => {
      expect(screen.getByText("Set Baseline")).toBeInTheDocument();
    });
  });

  it("calls setBaseline when button clicked", async () => {
    render(<RoutesTab routeService={mockService} />);
    await waitFor(() => {
      expect(screen.getByText("Set Baseline")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Set Baseline"));
    await waitFor(() => {
      expect(mockService.setBaseline).toHaveBeenCalledWith("R001");
    });
  });

  it("shows error when API fails", async () => {
    (mockService.getRoutes as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Network error"),
    );
    render(<RoutesTab routeService={mockService} />);
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });
});
