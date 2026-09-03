import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { alertService } from './services/api';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProjectModal from './components/ProjectModal';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import MapView from './pages/MapView';
import AlertCenter from './pages/AlertCenter';
import AnalyticsPage from './pages/AnalyticsPage';
import SimulationSandbox from './pages/SimulationSandbox';
import RoleOverview from './pages/RoleOverview';
import Login from './pages/Login';

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [highRiskCount, setHighRiskCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      loadAlertCount();
    }
  }, [isAuthenticated, currentTab]);

  const loadAlertCount = async () => {
    try {
      const data = await alertService.getAlerts({ risk_level: 'HIGH' });
      setHighRiskCount(data.length);
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-gov-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-700">Loading MPLADS AI Supervisory Engine...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeAlertCount={highRiskCount}
        onOpenAlerts={() => setCurrentTab('alerts')}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Navigation Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          highRiskCount={highRiskCount}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">
          {currentTab === 'dashboard' && (
            <Dashboard
              onSelectProject={(id) => setSelectedProjectId(id)}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsPage
              onSelectProject={(id) => setSelectedProjectId(id)}
            />
          )}

          {currentTab === 'map' && (
            <MapView
              onSelectProject={(id) => setSelectedProjectId(id)}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertCenter
              onSelectProject={(id) => setSelectedProjectId(id)}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage
              onSelectProject={(id) => setSelectedProjectId(id)}
            />
          )}

          {currentTab === 'sandbox' && (
            <SimulationSandbox />
          )}

          {currentTab === 'roles' && (
            <RoleOverview
              onNavigate={setCurrentTab}
            />
          )}
        </main>
      </div>

      {/* Deep-Dive Project Modal & Verification Drawer */}
      {selectedProjectId && (
        <ProjectModal
          projectId={selectedProjectId}
          isOpen={!!selectedProjectId}
          onClose={() => setSelectedProjectId(null)}
          onRefresh={loadAlertCount}
        />
      )}

      {/* Standard Government Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">MPLADS AI Monitor</span>
          <span>• Smart India Hackathon (SIH26102)</span>
        </div>
        <div className="text-[11px] text-slate-400">
          Statutory Notice: AI risk scores are diagnostic indicators requiring authorized official verification.
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
