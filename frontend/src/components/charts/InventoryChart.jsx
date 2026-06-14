import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { inventoryAPI } from '../../services/api';
import { useDashboardRefresh } from '../../context/DashboardRefreshContext';

export default function InventoryChart() {
  const { refreshCounter } = useDashboardRefresh();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await inventoryAPI.getStats();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load inventory stats');
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
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">Top 10 Lenses in Stock</h3>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
            <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
            <Bar dataKey="stock" fill="#14b8a6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
