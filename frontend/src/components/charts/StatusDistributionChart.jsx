import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardAPI } from '../../services/api';
import { useDashboardRefresh } from '../../context/DashboardRefreshContext';

export default function StatusDistributionChart() {
  const { refreshCounter } = useDashboardRefresh();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await dashboardAPI.getOrderStatusSummary();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load status summary');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshCounter]);

  if (loading) return <div className="h-64 flex items-center justify-center text-indigo-500 animate-pulse font-medium">Loading chart data...</div>;
  if (error) return <div className="h-64 flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col h-full w-full">
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Orders by Status</h3>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
