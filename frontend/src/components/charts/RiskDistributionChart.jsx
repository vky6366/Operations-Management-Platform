import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { dashboardAPI } from '../../services/api';
import { useDashboardRefresh } from '../../context/DashboardRefreshContext';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
  if (percent === 0) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function RiskDistributionChart() {
  const { refreshCounter } = useDashboardRefresh();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await dashboardAPI.getRiskSummary();
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load risk summary');
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
      <h3 className="text-lg font-semibold mb-4 text-center text-gray-700">SLA Risk Distribution</h3>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '8px' }} />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
