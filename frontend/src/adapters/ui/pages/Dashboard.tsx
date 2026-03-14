import { useState } from "react";
import { RoutesTab } from "../components/RoutesTab/RoutesTab";
import { CompareTab } from "../components/CompareTab/CompareTab";
import { BankingTab } from "../components/BankingTab/BankingTab";
import { PoolingTab } from "../components/PoolingTab/PoolingTab";
import {
  routeService,
  complianceService,
  bankingService,
  poolService,
} from "../../../services";

type TabId = "routes" | "compare" | "banking" | "pooling";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "routes", label: "Routes", icon: "🗺️" },
  { id: "compare", label: "Compare", icon: "📊" },
  { id: "banking", label: "Banking", icon: "🏦" },
  { id: "pooling", label: "Pooling", icon: "🤝" },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("routes");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⛴️</span>
              <div>
                <h1 className="text-lg font-bold text-gray-900 leading-tight">
                  FuelEU Maritime
                </h1>
                <p className="text-xs text-gray-500 leading-tight">
                  Compliance Dashboard
                </p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Reg (EU) 2023/1805
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex gap-0" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "routes" && <RoutesTab routeService={routeService} />}
        {activeTab === "compare" && <CompareTab routeService={routeService} />}
        {activeTab === "banking" && (
          <BankingTab
            bankingService={bankingService}
            complianceService={complianceService}
          />
        )}
        {activeTab === "pooling" && (
          <PoolingTab
            complianceService={complianceService}
            poolService={poolService}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-gray-400">
          FuelEU Maritime Compliance Platform · Target: 89.3368 gCO₂e/MJ (2025)
          · Regulation (EU) 2023/1805
        </div>
      </footer>
    </div>
  );
}
