import React, { useState, useEffect } from 'react';
import { ordersAPI, aiAPI } from '../services/api';
import CreateOrderForm from './CreateOrderForm';
import UpdateStatusForm from './UpdateStatusForm';
import { AlertCircle, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function OperationsTables() {
  const { refreshCounter } = useDashboardRefresh();
  const [activeOrders, setActiveOrders] = useState([]);
  const [highRiskOrders, setHighRiskOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Collapse State
  const [showActiveOrders, setShowActiveOrders] = useState(false);
  const [showHighRiskOrders, setShowHighRiskOrders] = useState(false);
  
  // Quick Actions Collapse
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLensType, setFilterLensType] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      let activeRes;
      if (filterStatus || filterLensType) {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterLensType) params.lens_type = filterLensType;
        activeRes = await ordersAPI.filterOrders(params);
      } else {
        activeRes = await ordersAPI.getActiveOrders();
      }

      const riskRes = await aiAPI.getOrdersAtRisk();
      setActiveOrders(activeRes.data);
      setHighRiskOrders(riskRes.data);
    } catch (err) {
      console.error("Failed to fetch operations data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshCounter, filterStatus, filterLensType]);

  const getRiskColor = (prob) => {
    const p = prob * 100;
    if (p > 70) return 'text-red-700 bg-red-100 border-red-200';
    if (p >= 40) return 'text-orange-700 bg-orange-100 border-orange-200';
    return 'text-green-700 bg-green-100 border-green-200';
  };

  const TableSkeleton = ({ cols }) => (
    [1, 2, 3].map(i => (
      <tr key={i} className="animate-pulse border-b border-gray-100">
        {Array(cols).fill(0).map((_, j) => (
          <td key={j} className="p-3"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
        ))}
      </tr>
    ))
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Quick Actions Accordion */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">Quick Actions</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200"
            >
              Create New Order {showCreateForm ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            {showCreateForm && <div className="mt-2"><CreateOrderForm /></div>}
          </div>
          <div>
            <button 
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="w-full flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200"
            >
              Update Order Status {showUpdateForm ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
            </button>
            {showUpdateForm && <div className="mt-2"><UpdateStatusForm /></div>}
          </div>
        </div>
      </div>

      {/* High Risk Orders Collapsible */}
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
        <button 
          onClick={() => setShowHighRiskOrders(!showHighRiskOrders)}
          className="w-full flex justify-between items-center p-6 bg-red-50 hover:bg-red-100 transition"
        >
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle size={22} />
            <h3 className="text-xl font-bold">AI High Risk Orders ({highRiskOrders.length})</h3>
          </div>
          {showHighRiskOrders ? <ChevronUp size={24} className="text-red-700"/> : <ChevronDown size={24} className="text-red-700"/>}
        </button>
        
        {showHighRiskOrders && (
          <div className="p-6 border-t border-red-100">
            <div className="overflow-auto border border-red-100 rounded-xl max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-red-50 text-red-800 sticky top-0 shadow-sm">
                  <tr>
                    <th className="p-3 font-semibold whitespace-nowrap">Order</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Risk %</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Status</th>
                    <th className="p-3 font-semibold whitespace-nowrap">SLA Left</th>
                    <th className="p-3 font-semibold">AI Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeleton cols={5} />
                  ) : highRiskOrders.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-green-600 font-medium">No high risk orders right now. Great job!</td></tr>
                  ) : (
                    highRiskOrders.map(o => (
                      <tr key={o.order_id} className="border-b border-red-50 hover:bg-red-50/50 transition-colors">
                        <td className="p-3 text-gray-800 font-medium whitespace-nowrap">#{o.order_id}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getRiskColor(o.breach_probability)}`}>
                            {Math.round(o.breach_probability * 100)}%
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">{o.current_status}</td>
                        <td className="p-3 text-gray-800 font-medium">{o.remaining_sla_days}d</td>
                        <td className="p-3 text-gray-600 text-xs italic leading-relaxed">{o.ai_recommendation}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Active Orders Collapsible */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button 
          onClick={() => setShowActiveOrders(!showActiveOrders)}
          className="w-full flex justify-between items-center p-6 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex items-center gap-2 text-gray-800">
            <h3 className="text-xl font-bold">Active Orders ({activeOrders.length})</h3>
          </div>
          {showActiveOrders ? <ChevronUp size={24} className="text-gray-500"/> : <ChevronDown size={24} className="text-gray-500"/>}
        </button>

        {showActiveOrders && (
          <div className="p-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-2 top-2 text-gray-400" size={14} />
                  <select 
                    className="pl-7 pr-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none bg-gray-50 text-gray-600 focus:ring-2 focus:ring-indigo-500"
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Order Placed">Order Placed</option>
                    <option value="In Production">In Production</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="overflow-auto border border-gray-200 rounded-xl max-h-[500px]">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 sticky top-0 shadow-sm">
                  <tr>
                    <th className="p-3 font-semibold whitespace-nowrap">Order ID</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Customer</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Status</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Lens</th>
                    <th className="p-3 font-semibold whitespace-nowrap">Store</th>
                    <th className="p-3 font-semibold whitespace-nowrap">SLA Left</th>
                    <th className="p-3 font-semibold whitespace-nowrap">In-House</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <TableSkeleton cols={7} />
                  ) : activeOrders.length === 0 ? (
                    <tr><td colSpan="7" className="p-6 text-center text-gray-500 italic">No active orders found</td></tr>
                  ) : (
                    activeOrders.map(o => (
                      <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-700 font-medium">#{o.id}</td>
                        <td className="p-3 text-gray-800">{o.customer_name}</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold whitespace-nowrap">
                            {o.current_status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-600">{o.lens_type}</td>
                        <td className="p-3 text-gray-600">Store {o.store_id}</td>
                        <td className="p-3 text-gray-800 font-medium">{o.sla_countdown_days !== undefined ? o.sla_countdown_days + 'd' : '-'}</td>
                        <td className="p-3">
                          {o.inventory_available ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-green-500"></span> Yes</span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><span className="w-2 h-2 rounded-full bg-red-400"></span> Vendor</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
