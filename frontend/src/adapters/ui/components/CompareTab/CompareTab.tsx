import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RouteComparison } from "../../../../core/domain/entities/Route";
import { IRouteService } from "../../../../core/ports/outbound/IRouteService";
import { Spinner } from "../shared/Spinner";
import { ErrorAlert } from "../shared/ErrorAlert";
import { Badge } from "../shared/Badge";
import { FUEL_EU } from "../../../../shared/constants/fueleu";
import { formatNumber } from "../../../../shared/utils/format";

interface CompareTabProps {
  routeService: IRouteService;
}

export function CompareTab({ routeService }: CompareTabProps) {
  const [comparison, setComparison] = useState<RouteComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await routeService.getComparison();
      setComparison(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load comparison");
    } finally {
      setLoading(false);
    }
  }, [routeService]);

  useEffect(() => {
    void fetchComparison();
  }, [fetchComparison]);

  const chartData = comparison
    ? [
        {
          routeId: comparison.baseline.routeId + " (Baseline)",
          ghgIntensity: comparison.baseline.ghgIntensity,
          isBaseline: true,
        },
        ...comparison.comparisons.map((c) => ({
          routeId: c.route.routeId,
          ghgIntensity: c.route.ghgIntensity,
          compliant: c.compliant,
          isBaseline: false,
        })),
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Comparison</h2>
        <p className="text-sm text-gray-500 mt-1">
          Target: {FUEL_EU.TARGET_INTENSITY_2025} gCO₂e/MJ (2% below reference{" "}
          {FUEL_EU.REFERENCE_INTENSITY})
        </p>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchComparison} />}
      {loading ? (
        <Spinner />
      ) : !comparison ? null : (
        <>
          {/* Baseline Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <div className="text-3xl">⚓</div>
            <div>
              <p className="text-xs text-blue-500 uppercase font-semibold">
                Baseline Route
              </p>
              <p className="text-lg font-bold text-blue-900">
                {comparison.baseline.routeId} — {comparison.baseline.vesselType}{" "}
                / {comparison.baseline.fuelType}
              </p>
              <p className="text-sm text-blue-700">
                GHG Intensity:{" "}
                <strong>
                  {formatNumber(comparison.baseline.ghgIntensity, 1)} gCO₂e/MJ
                </strong>{" "}
                · Year: {comparison.baseline.year}
              </p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              GHG Intensity Comparison (gCO₂e/MJ)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="routeId" tick={{ fontSize: 12 }} />
                <YAxis
                  domain={[85, 96]}
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "gCO₂e/MJ",
                    angle: -90,
                    position: "insideLeft",
                    offset: -5,
                  }}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `${formatNumber(value, 2)} gCO₂e/MJ`,
                    "GHG Intensity",
                  ]}
                />
                <Legend />
                <ReferenceLine
                  y={FUEL_EU.TARGET_INTENSITY_2025}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: `Target ${FUEL_EU.TARGET_INTENSITY_2025}`,
                    position: "right",
                    fontSize: 11,
                    fill: "#ef4444",
                  }}
                />
                <Bar
                  dataKey="ghgIntensity"
                  name="GHG Intensity"
                  radius={[4, 4, 0, 0]}
                >
                  {chartData.map((entry, index) => {
                    const color = entry.isBaseline
                      ? "#3b82f6"
                      : (entry as any).compliant
                        ? "#10b981"
                        : "#ef4444";
                    return <Cell key={index} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                Baseline
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-green-500 inline-block" />
                Compliant
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-500 inline-block" />
                Non-Compliant
              </span>
              <span className="flex items-center gap-1">
                <span className="w-6 h-0.5 bg-red-500 inline-block border-dashed" />
                Target
              </span>
            </div>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Route ID",
                    "Vessel Type",
                    "Fuel Type",
                    "Year",
                    "GHG Intensity",
                    "% vs Baseline",
                    "Compliant",
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
                {comparison.comparisons.map((c) => (
                  <tr key={c.route.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {c.route.routeId}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.route.vesselType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.route.fuelType}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {c.route.year}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      <span
                        className={
                          c.compliant ? "text-green-700" : "text-red-700"
                        }
                      >
                        {formatNumber(c.route.ghgIntensity, 2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-mono">
                      <span
                        className={
                          c.percentDiff <= 0 ? "text-green-700" : "text-red-700"
                        }
                      >
                        {c.percentDiff >= 0 ? "+" : ""}
                        {formatNumber(c.percentDiff, 2)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={c.compliant ? "green" : "red"}>
                        {c.compliant ? "✅ Yes" : "❌ No"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
