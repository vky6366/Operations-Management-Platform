import React from 'react';
import AIInsightsPanel from '../components/AIInsightsPanel';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import InventoryChart from '../components/charts/InventoryChart';
import BreachTrendChart from '../components/charts/BreachTrendChart';

export default function Analytics() {
  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Business Analytics</h2>
        <p className="text-gray-500 mt-1">Deep dive into operational and ML performance metrics.</p>
      </header>

      <AIInsightsPanel page="analytics" />

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
  );
}
