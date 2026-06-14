import React from 'react';

export default function SystemStatus() {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">System Status</h3>
      <ul className="space-y-2 text-sm text-gray-600">
        <li className="flex justify-between items-center">
          <span>FastAPI Backend</span>
          <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Online</span>
        </li>
        <li className="flex justify-between items-center">
          <span>PostgreSQL (RDS)</span>
          <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</span>
        </li>
        <li className="flex justify-between items-center">
          <span>XGBoost Predictor</span>
          <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Loaded</span>
        </li>
        <li className="flex justify-between items-center">
          <span>GPT-4.1-mini</span>
          <span className="flex items-center gap-1 text-green-600"><span className="w-2 h-2 rounded-full bg-green-500"></span> Available</span>
        </li>
      </ul>
    </div>
  );
}
