import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Map, 
  BellRing, 
  BarChart3, 
  FlaskConical, 
  Users, 
  ShieldAlert,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Project Monitoring', icon: FolderKanban },
  { id: 'map', label: 'Geospatial Project Map', icon: Map },
  { id: 'alerts', label: 'AI Alert Center', icon: BellRing, badgeKey: 'alerts' },
  { id: 'analytics', label: 'State & District Analytics', icon: BarChart3 },
  { id: 'sandbox', label: 'AI Anomaly Simulator', icon: FlaskConical, isNew: true },
  { id: 'roles', label: 'Role Governance View', icon: Users }
];

const Sidebar = ({ currentTab, onSelectTab, highRiskCount = 0 }) => {
  const { currentUser } = useAuth();

  return (
    <aside className="w-full lg:w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-2xs">
      <div className="space-y-6">
        {/* Role Scoping Card */}
        <div className="p-3.5 bg-gradient-to-br from-slate-900 to-gov-blue text-white rounded-xl shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gov-saffron">Active Scope</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <div className="text-xs font-bold truncate">
            {currentUser?.role === 'mp' ? `Constituency: ${currentUser.constituency || 'Varanasi'}` :
             currentUser?.role === 'district_authority' ? `District: ${currentUser.district || 'Varanasi'}` :
             currentUser?.role === 'state_nodal' ? `State: ${currentUser.state || 'Uttar Pradesh'}` :
             'All India (MoSPI Central)'}
          </div>
          <p className="text-[10px] text-slate-300">
            {currentUser?.role === 'mp' ? 'Local Constituency Oversight' :
             currentUser?.role === 'district_authority' ? 'DM Inspection & Audit Queue' :
             currentUser?.role === 'state_nodal' ? 'Statewide Fund Monitoring' :
             'National Multi-State Analytics'}
          </p>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Supervisory Modules
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${isActive ? 'bg-gov-blue text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gov-saffron' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                
                {item.id === 'alerts' && highRiskCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}>
                    {highRiskCount}
                  </span>
                )}

                {item.isNew && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                    AI TEST
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="pt-4 border-t border-slate-200 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-gov-accent" />
          <span>SIH26102 Prototype</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Isolation Forest & Multi-Vector Risk Engine
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
