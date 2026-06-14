import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { AlertCircle } from 'lucide-react';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function TopPriorityAlert() {
  const { refreshCounter } = useDashboardRefresh();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await aiAPI.getInsights("home");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInsights();
  }, [refreshCounter]);

  if (!data || data.priority?.toUpperCase() === 'LOW') return null;

  return (
    <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg mb-6 flex items-start gap-4">
      <AlertCircle size={28} className="mt-1 flex-shrink-0" />
      <div>
        <h3 className="font-black tracking-widest text-sm uppercase mb-1 opacity-90">Top Priority Alert</h3>
        <p className="font-medium text-lg leading-snug">{data.headline}</p>
      </div>
    </div>
  );
}
