import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import AIInsightsPanel from '../components/AIInsightsPanel';
import BreachTrendChart from '../components/charts/BreachTrendChart';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function AIRisk() {
  const { refreshCounter } = useDashboardRefresh();
  const [highRiskOrders, setHighRiskOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const riskRes = await aiAPI.getOrdersAtRisk();
        setHighRiskOrders(riskRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshCounter]);

  const getRiskColor = (prob) => {
    const p = prob * 100;
    if (p > 70) return 'text-red-700 bg-red-100 border-red-200';
    if (p >= 40) return 'text-orange-700 bg-orange-100 border-orange-200';
    return 'text-green-700 bg-green-100 border-green-200';
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Risk & SLA</h2>
        <p className="text-gray-500 mt-1">Identify SLA breaches before they happen using XGBoost.</p>
      </header>

      <AIInsightsPanel page="risk" />

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 mb-2">
        <BreachTrendChart />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-red-100 bg-red-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-red-800">High Risk Orders ({highRiskOrders.length})</h3>
        </div>

        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-red-50 text-red-800 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">Order</th>
                <th className="p-4 font-semibold whitespace-nowrap">Risk %</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap">SLA Left</th>
                <th className="p-4 font-semibold">AI Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-red-500 font-medium animate-pulse">Loading risk data...</td></tr>
              ) : highRiskOrders.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-green-600 font-medium">No high risk orders right now. Great job!</td></tr>
              ) : (
                highRiskOrders.map(o => (
                  <tr key={o.order_id} className="border-b border-red-50 hover:bg-red-50/50 transition-colors">
                    <td className="p-4 text-gray-800 font-bold whitespace-nowrap">#{o.order_id}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getRiskColor(o.breach_probability)}`}>
                        {Math.round(o.breach_probability * 100)}%
                      </span>
                    </td>
                    <td className="p-4 text-gray-700 font-medium whitespace-nowrap">{o.current_status}</td>
                    <td className="p-4 text-gray-900 font-bold">{o.remaining_sla_days}d</td>
                    <td className="p-4 text-gray-600 text-sm leading-relaxed">{o.ai_recommendation}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
