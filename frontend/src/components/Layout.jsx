import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, Box, AlertTriangle, BarChart2, Zap } from 'lucide-react';
import SystemStatus from './SystemStatus';

export default function Layout({ children }) {
  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={20} /> },
    { name: 'Orders', path: '/orders', icon: <Package size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Box size={20} /> },
    { name: 'AI Risk & SLA', path: '/risk', icon: <AlertTriangle size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Quick Actions', path: '/actions', icon: <Zap size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-xl z-10">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight mb-1">ELUNO AI</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Operations Platform</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3 px-2">System Status</h4>
          <div className="space-y-2 px-2 text-sm text-slate-300">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span> FastAPI</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span> PostgreSQL (RDS)</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span> XGBoost</div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400"></span> GPT-4.1-mini</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
