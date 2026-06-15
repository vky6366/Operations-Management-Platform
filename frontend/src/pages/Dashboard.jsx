import React from 'react';
import KPICards from '../components/KPICards';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import InventoryChart from '../components/charts/InventoryChart';
import BreachTrendChart from '../components/charts/BreachTrendChart';
import AIOperationsBriefing from '../components/AIOperationsBriefing';
import OperationsTables from '../components/OperationsTables';
import SystemStatus from '../components/SystemStatus';

export default function Dashboard() {

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Eluno AI Operations Dashboard</h1>
        </div>
        <div className="w-full md:w-64">
          <SystemStatus />
        </div>
      </header>

      {/* Operational Overview */}
      <KPICards />

      {/* AI Insights */}
      <AIOperationsBriefing />

      {/* Analytics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <StatusDistributionChart />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <RiskDistributionChart />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <InventoryChart />
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
            <BreachTrendChart />
          </div>
        </div>
      </div>

      {/* Operations Tables (Collapsible) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Active Operations</h2>
        <OperationsTables />
      </div>
    </div>
  );
}
