import { useState, useEffect, useCallback } from "react";
import { BankingRecords } from "../../../../core/domain/entities/BankEntry";
import { IBankingService } from "../../../../core/ports/outbound/IBankingService";
import { IComplianceService } from "../../../../core/ports/outbound/IComplianceService";
import { Spinner } from "../shared/Spinner";
import { ErrorAlert } from "../shared/ErrorAlert";
import { Badge } from "../shared/Badge";
import {
  formatCB,
  cbColorClass,
  formatNumber,
} from "../../../../shared/utils/format";

interface BankingTabProps {
  bankingService: IBankingService;
  complianceService: IComplianceService;
}

const SHIPS = [
  {
    id: "R001",
    label: "R001 — Container (HFO 2024)",
    ghgIntensity: 91.0,
    fuelConsumption: 5000,
    year: 2024,
  },
  {
    id: "R002",
    label: "R002 — BulkCarrier (LNG 2024)",
    ghgIntensity: 88.0,
    fuelConsumption: 4800,
    year: 2024,
  },
  {
    id: "R003",
    label: "R003 — Tanker (MGO 2024)",
    ghgIntensity: 93.5,
    fuelConsumption: 5100,
    year: 2024,
  },
  {
    id: "R004",
    label: "R004 — RoRo (HFO 2025)",
    ghgIntensity: 89.2,
    fuelConsumption: 4900,
    year: 2025,
  },
  {
    id: "R005",
    label: "R005 — Container (LNG 2025)",
    ghgIntensity: 90.5,
    fuelConsumption: 4950,
    year: 2025,
  },
];

export function BankingTab({
  bankingService,
  complianceService,
}: BankingTabProps) {
  const [selectedShip, setSelectedShip] = useState(SHIPS[0]);
  const [cbData, setCbData] = useState<{ cbGco2eq: number } | null>(null);
  const [bankingRecords, setBankingRecords] = useState<BankingRecords | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [actionMode, setActionMode] = useState<"bank" | "apply">("bank");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cb, records] = await Promise.all([
        complianceService.getCB(
          selectedShip.id,
          selectedShip.year,
          selectedShip.ghgIntensity,
          selectedShip.fuelConsumption,
        ),
        bankingService.getRecords(selectedShip.id, selectedShip.year),
      ]);
      setCbData(cb);
      setBankingRecords(records);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load banking data");
    } finally {
      setLoading(false);
    }
  }, [selectedShip, bankingService, complianceService]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAction = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setActionError("Enter a valid positive amount");
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      if (actionMode === "bank") {
        await bankingService.bankSurplus(
          selectedShip.id,
          selectedShip.year,
          parsedAmount,
        );
      } else {
        await bankingService.applyBanked(
          selectedShip.id,
          selectedShip.year,
          parsedAmount,
        );
      }
      setAmount("");
      await fetchData();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const cb = cbData?.cbGco2eq ?? 0;
  const cbAfterApply = bankingRecords
    ? cb + bankingRecords.balance.available
    : cb;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Banking</h2>
        <p className="text-sm text-gray-500 mt-1">
          Article 20 — Bank surplus CB or apply banked CB to a deficit
        </p>
      </div>

      {/* Ship selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Select Ship / Route
        </label>
        <select
          className="w-full sm:w-96 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedShip.id}
          onChange={(e) => {
            const ship = SHIPS.find((s) => s.id === e.target.value)!;
            setSelectedShip(ship);
          }}
        >
          {SHIPS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorAlert message={error} onRetry={fetchData} />}

      {loading ? (
        <Spinner />
      ) : cbData && bankingRecords ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">
                Raw CB (Before Banking)
              </p>
              <p className={`text-2xl font-bold mt-1 ${cbColorClass(cb)}`}>
                {formatCB(cb)}
              </p>
              <Badge variant={cb >= 0 ? "green" : "red"}>
                {cb >= 0 ? "Surplus" : "Deficit"}
              </Badge>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">
                Available Banked
              </p>
              <p className="text-2xl font-bold mt-1 text-blue-700">
                {formatCB(bankingRecords.balance.available)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Banked: {formatNumber(bankingRecords.balance.totalBanked, 0)} |
                Applied: {formatNumber(bankingRecords.balance.totalApplied, 0)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500 uppercase font-medium">
                Adjusted CB (After Apply)
              </p>
              <p
                className={`text-2xl font-bold mt-1 ${cbColorClass(cbAfterApply)}`}
              >
                {formatCB(cbAfterApply)}
              </p>
              <Badge variant={cbAfterApply >= 0 ? "green" : "red"}>
                {cbAfterApply >= 0 ? "Compliant" : "Deficit"}
              </Badge>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Take Action
            </h3>
            <div className="flex gap-3 mb-4">
              {(["bank", "apply"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setActionMode(mode);
                    setActionError(null);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${actionMode === mode ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                >
                  {mode === "bank" ? "📦 Bank Surplus" : "💳 Apply Banked"}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Amount (gCO₂eq)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => void handleAction()}
                disabled={
                  actionLoading ||
                  !amount ||
                  (actionMode === "bank" && cb <= 0) ||
                  (actionMode === "apply" &&
                    bankingRecords.balance.available <= 0)
                }
                className="px-6 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading
                  ? "Processing..."
                  : actionMode === "bank"
                    ? "Bank Now"
                    : "Apply Now"}
              </button>
            </div>

            {actionMode === "bank" && cb <= 0 && (
              <p className="text-xs text-red-500 mt-2">
                Cannot bank: no surplus CB available.
              </p>
            )}
            {actionMode === "apply" &&
              bankingRecords.balance.available <= 0 && (
                <p className="text-xs text-red-500 mt-2">
                  No banked surplus available to apply.
                </p>
              )}
            {actionError && (
              <p className="text-xs text-red-600 mt-2">⚠ {actionError}</p>
            )}
          </div>

          {/* Transaction History */}
          {bankingRecords.records.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Transaction History
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Date", "Type", "Amount (gCO₂eq)"].map((h) => (
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
                    {bankingRecords.records.map((r) => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={r.type === "BANKED" ? "blue" : "yellow"}
                          >
                            {r.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">
                          {formatNumber(r.amountGco2eq, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
