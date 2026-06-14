import React, { useState } from 'react';
import { ordersAPI, alertsAPI } from '../services/api';
import { PlusCircle } from 'lucide-react';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function CreateOrderForm() {
  const { triggerRefresh } = useDashboardRefresh();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    prescription: '',
    frame_name: '',
    lens_power: '',
    lens_type: 'Single Vision',
    lens_index: '1.56',
    coating: 'Blue Cut',
    store_id: 1
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await ordersAPI.createOrder(formData);
      const newOrderId = res.data.id;
      
      // Automatically check for SLA breach risk right after creation
      try {
        await alertsAPI.checkAlert(newOrderId, false);
      } catch (alertErr) {
        console.warn("Background alert check failed", alertErr);
      }

      setFormData({
        customer_name: '', customer_phone: '', prescription: '', frame_name: '', 
        lens_power: '', lens_type: 'Single Vision', lens_index: '1.56', coating: 'Blue Cut', store_id: 1
      });
      setSuccess('Order created successfully! AI Risk Analysis complete.');
      triggerRefresh();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-auto shadow-inner">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <PlusCircle size={18} className="text-green-600" /> Quick Create Order
      </h4>
      {error && <div className="text-red-500 text-xs mb-3 font-medium bg-red-50 p-2 rounded">{error}</div>}
      {success && <div className="text-green-600 text-xs mb-3 font-medium bg-green-50 p-2 rounded">{success}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Customer Name" className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} />
          <input required placeholder="Phone Number" className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="Prescription (e.g. OD/OS...)" className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.prescription} onChange={e => setFormData({...formData, prescription: e.target.value})} />
          <input required placeholder="Frame Name" className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.frame_name} onChange={e => setFormData({...formData, frame_name: e.target.value})} />
        </div>
        <div className="grid grid-cols-4 gap-3">
          <input required placeholder="Power" className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.lens_power} onChange={e => setFormData({...formData, lens_power: e.target.value})} />
          <select className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.lens_type} onChange={e => setFormData({...formData, lens_type: e.target.value})}>
            <option>Single Vision</option>
            <option>Bifocal</option>
            <option>Progressive</option>
          </select>
          <select className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.lens_index} onChange={e => setFormData({...formData, lens_index: e.target.value})}>
            <option>1.56</option>
            <option>1.60</option>
            <option>1.67</option>
            <option>1.74</option>
          </select>
          <select className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" value={formData.coating} onChange={e => setFormData({...formData, coating: e.target.value})}>
            <option>Blue Cut</option>
            <option>Anti-Reflective</option>
            <option>Hard Coat</option>
          </select>
        </div>
        <button disabled={loading} type="submit" className="mt-1 bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition disabled:opacity-50 font-bold shadow-sm">
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
}
