import React, { useState } from 'react';
import { ordersAPI, alertsAPI } from '../services/api';
import { Edit3 } from 'lucide-react';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function UpdateStatusForm() {
  const { triggerRefresh } = useDashboardRefresh();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState('In Production');
  const [delayReason, setDelayReason] = useState('');

  const statuses = ["Order Placed", "In Production", "QC Failed", "Ready for Dispatch", "Delayed", "Out for Delivery", "Delivered", "Cancelled"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId) return;
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // 1. Update Status
      await ordersAPI.updateOrderStatus(orderId, { new_status: status, delay_reason: delayReason || null });
      
      // 2. Fetch order details to check SLA
      const orderRes = await ordersAPI.getOrder(orderId);
      const orderData = orderRes.data;
      
      const expectedDate = new Date(orderData.expected_delivery);
      const today = new Date();
      const diffTime = expectedDate - today;
      const slaDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3. Smart Trigger Logic
      let alertMsg = '';
      if (status === 'Delayed' || status === 'QC Failed' || slaDaysLeft <= 1) {
        try {
          await alertsAPI.checkAlert(orderId, true);
          alertMsg = ' (Alert Generated)';
        } catch (alertErr) {
          console.error("Alert trigger failed", alertErr);
        }
      }

      setOrderId('');
      setDelayReason('');
      setSuccess(`Order #${orderId} updated successfully!${alertMsg}`);
      triggerRefresh();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-auto shadow-inner">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Edit3 size={18} className="text-blue-600" /> Update Order Status
      </h4>
      {error && <div className="text-red-500 text-xs mb-3 font-medium bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-blue-600 text-xs mb-3 font-medium bg-blue-50 p-2 rounded">{success}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
        <div className="flex gap-3">
          <input 
            required type="number" placeholder="Order ID" 
            className="w-1/3 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            value={orderId} onChange={e => setOrderId(e.target.value)} 
          />
          <select 
            className="flex-1 p-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            value={status} onChange={e => setStatus(e.target.value)}
          >
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(status === 'Delayed' || status === 'QC Failed' || status === 'Cancelled') && (
          <input 
            required placeholder="Reason for status change..." 
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            value={delayReason} onChange={e => setDelayReason(e.target.value)} 
          />
        )}
        <button disabled={loading} type="submit" className="mt-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 font-bold shadow-sm">
          {loading ? 'Updating...' : 'Update Status'}
        </button>
      </form>
    </div>
  );
}
