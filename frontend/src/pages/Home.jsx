import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import KPICards from '../components/KPICards';
import AIInsightsPanel from '../components/AIInsightsPanel';
import TopPriorityAlert from '../components/TopPriorityAlert';
import StatusDistributionChart from '../components/charts/StatusDistributionChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';
import { Clock, RefreshCw, Zap, ArrowRight } from 'lucide-react';
import { useDashboardRefresh } from '../context/DashboardRefreshContext';

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState(null);
  const { triggerRefresh } = useDashboardRefresh();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Executive Overview</h2>
          <div className="flex items-center gap-3 mt-2 text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 inline-flex">
            <Clock size={16} className="text-indigo-500" />
            <span>Last Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Fetching...'}</span>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={triggerRefresh} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </header>

      <TopPriorityAlert />
      
      <KPICards onLastUpdated={setLastUpdated} />
      
      <AIInsightsPanel page="home" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <StatusDistributionChart />
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
          <RiskDistributionChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center h-48 bg-gradient-to-r from-red-50 to-orange-50">
          <h3 className="text-lg font-bold text-red-800 mb-2">High Risk Orders Demand Attention</h3>
          <p className="text-gray-600 text-sm mb-4">View detailed AI predictions for SLAs and bottlenecks.</p>
          <NavLink to="/risk" className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-sm">
            Review High Risk Orders <ArrowRight size={16}/>
          </NavLink>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center h-48 bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="flex items-center gap-2 text-indigo-800 mb-2">
            <Zap size={20} />
            <h3 className="text-lg font-bold">Quick Actions</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Create orders or update statuses instantly.</p>
          <NavLink to="/actions" className="flex justify-center items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
            Launch Actions
          </NavLink>
        </div>
      </div>
    </div>
  );
}
