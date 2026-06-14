import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Package, CheckCircle } from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function KPICards({ onLastUpdated }) {
  const { refreshCounter } = useDashboardRefresh();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await dashboardAPI.getKPISummary();
        setKpis(res.data);
        if (onLastUpdated && res.data.last_updated) {
          onLastUpdated(res.data.last_updated);
        }
      } catch (err) {
        console.error("Failed to fetch KPIs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKPIs();
  }, [refreshCounter, onLastUpdated]);

  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 animate-pulse">
            <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
          <Package size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wide">Active Orders</p>
          <p className="text-3xl font-black text-gray-800">{kpis.active_orders}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
        <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
          <AlertTriangle size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wide">Orders at Risk</p>
          <p className="text-3xl font-black text-gray-800">{kpis.orders_at_risk}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
        <div className="p-4 bg-red-50 text-red-600 rounded-xl">
          <Activity size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wide">SLA Breaches</p>
          <p className="text-3xl font-black text-gray-800">{kpis.sla_breaches}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
        <div className="p-4 bg-green-50 text-green-600 rounded-xl">
          <CheckCircle size={28} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-semibold mb-1 uppercase tracking-wide">In-House Stock</p>
          <p className="text-3xl font-black text-gray-800">{kpis.in_house_inventory_percentage}%</p>
        </div>
      </div>
    </div>
  );
}
