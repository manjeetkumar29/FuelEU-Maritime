import { useState, useEffect, useCallback } from "react";
import { PoolAllocationResult } from "../../../../core/domain/entities/Pool";
import { IComplianceService } from "../../../../core/ports/outbound/IComplianceService";
import { IPoolService } from "../../../../core/ports/outbound/IPoolService";
import { Spinner } from "../shared/Spinner";
import { ErrorAlert } from "../shared/ErrorAlert";
import { Badge } from "../shared/Badge";
import { formatCB, cbColorClass } from "../../../../shared/utils/format";

interface PoolingTabProps {
  complianceService: IComplianceService;
  poolService: IPoolService;
}

const SHIPS = [
  {
    id: "R001",
    label: "R001 (Container/HFO 2024)",
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    year: 2024,
  },
  {
    id: "R002",
    label: "R002 (BulkCarrier/LNG 2024)",
    ghgIntensity: 88.0,
    fuelConsumption: 4800,
    year: 2024,
  },
  {
    id: "R003",
    label: "R003 (Tanker/MGO 2024)",
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    year: 2024,
  },
  {
    id: "R004",
    label: "R004 (RoRo/HFO 2025)",
    ghgIntensity: 89.2,
    fuelConsumption: 4900,
    year: 2025,
  },
  {
    id: "R005",
    label: "R005 (Container/LNG 2025)",
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    year: 2025,
  },
];

interface ShipCbRow {
  shipId: string;
  label: string;
  cbAdjusted: number;
  selected: boolean;
}

export function PoolingTab({
  complianceService,
  poolService,
}: PoolingTabProps) {
  const [ships, setShips] = useState<ShipCbRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [poolResult, setPoolResult] = useState<PoolAllocationResult | null>(
    null,
  );
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(2024);

  const fetchAdjustedCBs = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPoolResult(null);
    try {
      const results = await Promise.all(
        SHIPS.filter((s) => s.year === year).map(async (s) => {
          try {
            const adj = await complianceService.getAdjustedCB(s.id, year);
            return {
              shipId: s.id,
              label: s.label,
              cbAdjusted: adj.cbAdjusted,
              selected: false,
            };
          } catch {
            // Fallback: compute from raw data
            const cb = await complianceService.getCB(
              s.id,
              year,
              s.ghgIntensity,
              s.fuelConsumption,
            );
            return {
              shipId: s.id,
              label: s.label,
              cbAdjusted: cb.cbGco2eq,
              selected: false,
            };
          }
        }),
      );
      setShips(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ship CB data");
    } finally {
      setLoading(false);
    }
  }, [complianceService, year]);

  useEffect(() => {
    void fetchAdjustedCBs();
  }, [fetchAdjustedCBs]);

  const toggleShip = (id: string) =>
    setShips((prev) =>
      prev.map((s) => (s.shipId === id ? { ...s, selected: !s.selected } : s)),
    );

  const selected = ships.filter((s) => s.selected);
  const totalCb = selected.reduce((sum, s) => sum + s.cbAdjusted, 0);
  const isPoolValid = selected.length >= 2 && totalCb >= 0;

  const handleCreatePool = async () => {
    if (!isPoolValid) return;
    setCreating(true);
    setCreateError(null);
    try {
      const result = await poolService.createPool({
        year,
        members: selected.map((s) => ({ shipId: s.shipId, cb: s.cbAdjusted })),
      });
      setPoolResult(result);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create pool");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pooling</h2>
        <p className="text-sm text-gray-500 mt-1">
          Article 21 — Create compliance pools to share surplus / cover deficits
        </p>
      </div>

      {/* Year selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
        <label className="text-xs font-medium text-gray-700">Year:</label>
        {[2024, 2025].map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => setYear(y)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${year === y ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            {y}
          </button>
        ))}
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchAdjustedCBs} />}
      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Ship selection table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                Ships in {year}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Select at least 2 ships to form a pool
              </p>
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Select",
                    "Ship ID",
                    "Description",
                    "Adjusted CB (gCO₂eq)",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {ships.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      No ships for {year}
                    </td>
                  </tr>
                ) : (
                  ships.map((ship) => (
                    <tr
                      key={ship.shipId}
                      className={
                        ship.selected ? "bg-blue-50" : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={ship.selected}
                          onChange={() => toggleShip(ship.shipId)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {ship.shipId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ship.label}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        <span className={cbColorClass(ship.cbAdjusted)}>
                          {formatCB(ship.cbAdjusted)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={ship.cbAdjusted >= 0 ? "green" : "red"}>
                          {ship.cbAdjusted >= 0 ? "Surplus" : "Deficit"}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pool summary & validation */}
          {selected.length > 0 && (
            <div
              className={`rounded-lg border-2 p-4 ${isPoolValid ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    {selected.length} ships selected · Pool Sum:{" "}
                    <span className={cbColorClass(totalCb)}>
                      {formatCB(totalCb)}
                    </span>
                  </p>
                  {!isPoolValid && selected.length < 2 && (
                    <p className="text-xs text-red-600 mt-1">
                      Need at least 2 members
                    </p>
                  )}
                  {!isPoolValid && totalCb < 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      Pool total CB is negative — cannot pool
                    </p>
                  )}
                  {isPoolValid && (
                    <p className="text-xs text-green-700 mt-1">
                      Pool is valid — surplus will cover deficits
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleCreatePool()}
                  disabled={!isPoolValid || creating}
                  className="px-6 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? "Creating Pool..." : "🤝 Create Pool"}
                </button>
              </div>
              {createError && (
                <p className="text-xs text-red-600 mt-2">⚠ {createError}</p>
              )}
            </div>
          )}

          {/* Pool result */}
          {poolResult && (
            <div className="bg-white rounded-lg border border-green-200">
              <div className="px-4 py-3 bg-green-50 border-b border-green-200">
                <h3 className="text-sm font-bold text-green-800">
                  ✅ Pool Created — ID: {poolResult.poolId}
                </h3>
                <p className="text-xs text-green-600 mt-0.5">
                  Year: {poolResult.year} · Total CB:{" "}
                  {formatCB(poolResult.totalCb)}
                </p>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {["Ship ID", "CB Before", "CB After", "Change"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {poolResult.members.map((m) => (
                    <tr key={m.shipId}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {m.shipId}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        <span className={cbColorClass(m.cbBefore)}>
                          {formatCB(m.cbBefore)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        <span className={cbColorClass(m.cbAfter)}>
                          {formatCB(m.cbAfter)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={m.cbAfter >= m.cbBefore ? "green" : "gray"}
                        >
                          {formatCB(m.cbAfter - m.cbBefore)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
