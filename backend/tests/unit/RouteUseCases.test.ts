import {
  GetRouteComparisonUseCase,
  SetBaselineUseCase,
} from "../../src/core/application/use-cases/RouteUseCases";
import { IRouteRepository } from "../../src/core/ports/outbound/IRouteRepository";
import { Route } from "../../src/core/domain/entities/Route";
import { NotFoundError } from "../../src/shared/errors";

const makeRoute = (overrides: Partial<Route> = {}): Route => ({
  id: "1",
  routeId: "R001",
  vesselType: "Container",
  fuelType: "HFO",
  year: 2025,
  ghgIntensity: 91.0,
  fuelConsumption: 5000,
  distance: 12000,
  totalEmissions: 4500,
  isBaseline: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const mockRepo = (): jest.Mocked<IRouteRepository> => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByRouteId: jest.fn(),
  findBaseline: jest.fn(),
  setBaseline: jest.fn(),
  create: jest.fn(),
});

describe("GetRouteComparisonUseCase", () => {
  it("throws NotFoundError when no baseline exists", async () => {
    const repo = mockRepo();
    repo.findBaseline.mockResolvedValue(null);
    const uc = new GetRouteComparisonUseCase(repo);
    await expect(uc.execute()).rejects.toThrow(NotFoundError);
  });

  it("returns comparison results with correct percentDiff and compliant flags", async () => {
    const repo = mockRepo();
    const baseline = makeRoute({
      routeId: "R001",
      ghgIntensity: 91.0,
      isBaseline: true,
    });
    const comparison = makeRoute({
      id: "2",
      routeId: "R002",
      ghgIntensity: 88.0,
    });

    repo.findBaseline.mockResolvedValue(baseline);
    repo.findAll.mockResolvedValue([baseline, comparison]);

    const uc = new GetRouteComparisonUseCase(repo);
    const result = await uc.execute();

    expect(result.baseline.routeId).toBe("R001");
    expect(result.comparisons).toHaveLength(1);
    expect(result.comparisons[0].percentDiff).toBeCloseTo(
      (88.0 / 91.0 - 1) * 100,
    );
    expect(result.comparisons[0].compliant).toBe(true); // 88 < 89.3368
  });

  it("marks route as non-compliant when ghgIntensity > target", async () => {
    const repo = mockRepo();
    const baseline = makeRoute({
      routeId: "R001",
      ghgIntensity: 91.0,
      isBaseline: true,
    });
    const comparison = makeRoute({
      id: "2",
      routeId: "R003",
      ghgIntensity: 93.5,
    });

    repo.findBaseline.mockResolvedValue(baseline);
    repo.findAll.mockResolvedValue([baseline, comparison]);

    const uc = new GetRouteComparisonUseCase(repo);
    const result = await uc.execute();
    expect(result.comparisons[0].compliant).toBe(false);
  });
});

describe("SetBaselineUseCase", () => {
  it("throws if route not found", async () => {
    const repo = mockRepo();
    repo.findByRouteId.mockResolvedValue(null);
    const uc = new SetBaselineUseCase(repo);
    await expect(uc.execute("NONEXISTENT")).rejects.toThrow(NotFoundError);
  });

  it("sets baseline and returns updated route", async () => {
    const repo = mockRepo();
    const route = makeRoute({ routeId: "R001" });
    const updatedRoute = { ...route, isBaseline: true };
    repo.findByRouteId.mockResolvedValue(route);
    repo.setBaseline.mockResolvedValue(updatedRoute);
    const uc = new SetBaselineUseCase(repo);
    const result = await uc.execute("R001");
    expect(result.isBaseline).toBe(true);
  });
});
