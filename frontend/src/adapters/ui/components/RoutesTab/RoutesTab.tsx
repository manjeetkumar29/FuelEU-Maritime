import { useState, useEffect, useCallback } from "react";
import { Route, RouteFilters } from "../../../../core/domain/entities/Route";
import { IRouteService } from "../../../../core/ports/outbound/IRouteService";
import { Spinner } from "../shared/Spinner";
import { ErrorAlert } from "../shared/ErrorAlert";
import { Badge } from "../shared/Badge";
import {
  VESSEL_TYPES,
  FUEL_TYPES,
  YEARS,
  FUEL_EU,
} from "../../../../shared/constants/fueleu";
import { formatNumber } from "../../../../shared/utils/format";

interface RoutesTabProps {
  routeService: IRouteService;
}

export function RoutesTab({ routeService }: RoutesTabProps) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baselineLoading, setBaselineLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState<RouteFilters>({});

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routeService.getRoutes(filters);
      setRoutes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load routes");
    } finally {
      setLoading(false);
    }
  }, [routeService, filters]);

  useEffect(() => {
    void fetchRoutes();
  }, [fetchRoutes]);

  const handleSetBaseline = async (routeId: string) => {
    setBaselineLoading(routeId);
    setError(null);
    try {
      await routeService.setBaseline(routeId);
      await fetchRoutes();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to set baseline");
    } finally {
      setBaselineLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Routes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Target GHG Intensity: {FUEL_EU.TARGET_INTENSITY_2025} gCO₂e/MJ
          </p>
        </div>
        <span className="text-sm text-gray-400">{routes.length} routes</span>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Vessel Type
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.vesselType ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  vesselType: e.target.value || undefined,
                }))
              }
            >
              <option value="">All Types</option>
              {VESSEL_TYPES.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.fuelType ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  fuelType: e.target.value || undefined,
                }))
              }
            >
              <option value="">All Fuels</option>
              {FUEL_TYPES.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.year ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  year: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            >
              <option value="">All Years</option>
              {YEARS.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchRoutes} />}
      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Route ID",
                  "Vessel Type",
                  "Fuel Type",
                  "Year",
                  "GHG Intensity (gCO₂e/MJ)",
                  "Fuel Cons. (t)",
                  "Distance (km)",
                  "Emissions (t)",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {routes.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    No routes found
                  </td>
                </tr>
              ) : (
                routes.map((route) => {
                  const compliant =
                    route.ghgIntensity <= FUEL_EU.TARGET_INTENSITY_2025;
                  return (
                    <tr
                      key={route.id}
                      className={
                        route.isBaseline ? "bg-blue-50" : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {route.routeId}
                        {route.isBaseline && (
                          <span className="ml-2 text-xs text-blue-600 font-semibold">
                            ★ Baseline
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {route.vesselType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {route.fuelType}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {route.year}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        <span
                          className={
                            compliant ? "text-green-700" : "text-red-700"
                          }
                        >
                          {formatNumber(route.ghgIntensity, 1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {formatNumber(route.fuelConsumption, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {formatNumber(route.distance, 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 font-mono">
                        {formatNumber(route.totalEmissions, 0)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={compliant ? "green" : "red"}>
                          {compliant ? "✅ Compliant" : "❌ Non-Compliant"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleSetBaseline(route.routeId)}
                          disabled={
                            route.isBaseline ||
                            baselineLoading === route.routeId
                          }
                          className="text-xs px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {baselineLoading === route.routeId
                            ? "Setting..."
                            : route.isBaseline
                              ? "Baseline"
                              : "Set Baseline"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
