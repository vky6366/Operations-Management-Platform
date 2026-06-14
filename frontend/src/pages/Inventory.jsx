import React from 'react';
import AIInsightsPanel from '../components/AIInsightsPanel';
import InventoryChart from '../components/charts/InventoryChart';

export default function Inventory() {
  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Inventory Management</h2>
        <p className="text-gray-500 mt-1">Monitor lens combinations and vendor stock levels.</p>
      </header>

      <AIInsightsPanel page="inventory" />

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
        <InventoryChart />
      </div>
    </div>
  );
}
