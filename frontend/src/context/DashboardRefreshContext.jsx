import React, { createContext, useState, useContext } from 'react';

const DashboardRefreshContext = createContext();

export function DashboardRefreshProvider({ children }) {
  const [refreshCounter, setRefreshCounter] = useState(0);

  const triggerRefresh = () => {
    setRefreshCounter(prev => prev + 1);
  };

  return (
    <DashboardRefreshContext.Provider value={{ refreshCounter, triggerRefresh }}>
      {children}
    </DashboardRefreshContext.Provider>
  );
}

export function useDashboardRefresh() {
  return useContext(DashboardRefreshContext);
}
