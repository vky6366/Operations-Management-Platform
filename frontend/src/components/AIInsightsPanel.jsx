import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function AIInsightsPanel({ page = "home" }) {
  const { refreshCounter } = useDashboardRefresh();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await aiAPI.getInsights(page);
        setData(res.data);
      } catch (err) {
        setError("Failed to fetch AI Briefing.");
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [refreshCounter, page]);

  const getPriorityStyles = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'HIGH': return 'border-red-400 bg-red-50';
      case 'MEDIUM': return 'border-orange-400 bg-orange-50';
      case 'LOW': return 'border-green-400 bg-green-50';
      default: return 'border-indigo-400 bg-indigo-50';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority?.toUpperCase()) {
      case 'HIGH': return <AlertTriangle className="text-red-600" size={24} />;
      case 'MEDIUM': return <Info className="text-orange-600" size={24} />;
      case 'LOW': return <CheckCircle className="text-green-600" size={24} />;
      default: return <Sparkles className="text-indigo-600" size={24} />;
    }
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff/60)}m ago`;
  };

  if (loading && !data) {
    return (
      <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-50 p-6 rounded-2xl shadow-sm border border-red-200 mb-8 text-red-600 flex items-center gap-2">
        <AlertTriangle /> {error}
      </div>
    );
  }

  const roleTitles = {
    "home": "AI Operations Briefing",
    "orders": "AI Insights (Orders)",
    "inventory": "AI Inventory Briefing",
    "risk": "AI Risk Briefing",
    "analytics": "AI Trend Analysis",
    "actions": "AI Workflow Tip"
  };

  return (
    <div className={`w-full p-6 rounded-2xl shadow-md border-l-4 mb-8 transition-colors ${getPriorityStyles(data.priority)}`}>
      <div className="flex items-center gap-3 mb-4">
        {getPriorityIcon(data.priority)}
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{roleTitles[page]}</h2>
      </div>

      <div className="mb-6 border-b border-black/10 pb-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{data.headline}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
        <div>
          <h4 className="font-bold text-gray-500 mb-3 uppercase text-xs tracking-wider">Current Situation</h4>
          <ul className="space-y-3">
            {data.summary.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-gray-800 text-sm">
                <span className="text-gray-400">•</span> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-gray-500 mb-3 uppercase text-xs tracking-wider">Recommended Actions</h4>
          <ul className="space-y-3">
            {data.recommendations.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-gray-900 text-sm font-semibold">
                <span className="text-green-600">✓</span> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}
