import React, { useEffect } from 'react';
import AIInsightsPanel from '../components/AIInsightsPanel';
import CreateOrderForm from '../components/CreateOrderForm';
import UpdateStatusForm from '../components/UpdateStatusForm';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';
import { aiAPI } from '../services/api';

export default function QuickActions() {
  const { refreshCounter } = useDashboardRefresh();

  // If we mutate order/status we should invalidate caches
  useEffect(() => {
    // When QuickActions refreshes after a mutation, we clear cache
    // Actually the mutations in the components themselves handle triggerRefresh.
    // We can just invalidate caches here whenever refreshCounter increments.
    if (refreshCounter > 0) {
      aiAPI.invalidateInsights().catch(e => console.error(e));
    }
  }, [refreshCounter]);

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quick Actions</h2>
        <p className="text-gray-500 mt-1">Directly manage orders and status pipelines.</p>
      </header>

      <AIInsightsPanel page="actions" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Create New Order</h3>
          <CreateOrderForm />
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Update Pipeline Status</h3>
          <UpdateStatusForm />
        </div>
      </div>
    </div>
  );
}
