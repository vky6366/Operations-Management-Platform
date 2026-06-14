import React, { useState, useEffect } from 'react';
import AIInsightsPanel from '../components/AIInsightsPanel';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import { ordersAPI } from '../services/api';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';
import { Filter } from 'lucide-react';

export default function Orders() {
  const { refreshCounter } = useDashboardRefresh();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let res;
        if (filterStatus) {
          res = await ordersAPI.filterOrders({ status: filterStatus });
        } else {
          res = await ordersAPI.getActiveOrders();
        }
        setActiveOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [refreshCounter, filterStatus]);

  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Orders Overview</h2>
        <p className="text-gray-500 mt-1">Manage and track active production pipelines.</p>
      </header>

      <AIInsightsPanel page="orders" />

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80 mb-2">
        <StatusDistributionChart />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Active Orders ({activeOrders.length})</h3>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 font-medium"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="Order Placed">Order Placed</option>
              <option value="In Production">In Production</option>
              <option value="Delayed">Delayed</option>
              <option value="QC Failed">QC Failed</option>
            </select>
          </div>
        </div>

        <div className="overflow-auto max-h-[600px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 text-gray-600 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">Order ID</th>
                <th className="p-4 font-semibold whitespace-nowrap">Customer</th>
                <th className="p-4 font-semibold whitespace-nowrap">Status</th>
                <th className="p-4 font-semibold whitespace-nowrap">Lens</th>
                <th className="p-4 font-semibold whitespace-nowrap">Store</th>
                <th className="p-4 font-semibold whitespace-nowrap">SLA Left</th>
                <th className="p-4 font-semibold whitespace-nowrap">In-House</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-indigo-500 font-medium animate-pulse">Loading orders...</td></tr>
              ) : activeOrders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500 italic">No orders found.</td></tr>
              ) : (
                activeOrders.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 text-gray-700 font-bold">#{o.id}</td>
                    <td className="p-4 text-gray-800 font-medium">{o.customer_name}</td>
                    <td className="p-4">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold whitespace-nowrap shadow-sm">
                        {o.current_status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{o.lens_type}</td>
                    <td className="p-4 text-gray-600 font-medium">Store {o.store_id}</td>
                    <td className="p-4 text-gray-800 font-bold">{o.sla_countdown_days !== undefined ? o.sla_countdown_days + 'd' : '-'}</td>
                    <td className="p-4">
                      {o.inventory_available ? (
                        <span className="flex items-center gap-1.5 text-green-700 text-xs font-bold bg-green-50 px-2 py-1 rounded-lg w-fit"><span className="w-2 h-2 rounded-full bg-green-500"></span> Yes</span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded-lg w-fit"><span className="w-2 h-2 rounded-full bg-red-500"></span> Vendor</span>
                      )}
                    </td>
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
