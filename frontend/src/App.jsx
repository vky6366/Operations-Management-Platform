import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Orders from './pages/Orders';
import Inventory from './pages/Inventory';
import AIRisk from './pages/AIRisk';
import Analytics from './pages/Analytics';
import QuickActions from './pages/QuickActions';
import { DashboardRefreshProvider } from './context/DashboardRefreshContext';

function App() {
  return (
    <DashboardRefreshProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/risk" element={<AIRisk />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/actions" element={<QuickActions />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DashboardRefreshProvider>
  );
}

export default App;
