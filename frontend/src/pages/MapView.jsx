import React, { useState, useEffect } from 'react';
import { Map, Layers, ShieldAlert, AlertTriangle, Eye, Compass, Info } from 'lucide-react';
import { projectService } from '../services/api';
import IndiaMap from '../components/IndiaMap';
import DisclaimerBanner from '../components/DisclaimerBanner';
import RiskBadge from '../components/RiskBadge';

const MapView = ({ onSelectProject }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjects({ limit: 400 });
      setProjects(data);
    } catch (err) {
      console.error("Map projects failed to load:", err);
    } finally {
      setLoading(false);
    }
  };

  const highRiskList = projects.filter(p => p.risk_level === 'HIGH');
  const mediumRiskList = projects.filter(p => p.risk_level === 'MEDIUM');

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Map className="w-6 h-6 text-gov-accent" />
            <span>Interactive Geospatial Risk & Anomaly Map</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Geocoded MPLADS projects mapped with color-coded risk markers and spatial proximity anomaly triggers
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg border border-red-200">
            {highRiskList.length} High Risk
          </span>
          <span className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg border border-amber-200">
            {mediumRiskList.length} Medium Risk
          </span>
          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
            {projects.length - highRiskList.length - mediumRiskList.length} Low Risk
          </span>
        </div>
      </div>

      {/* Map and Hotspots Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Map Canvas */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="h-[650px] bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 animate-pulse">
              Loading geospatial project coordinates and spatial models...
            </div>
          ) : (
            <IndiaMap
              projects={projects}
              onSelectProject={onSelectProject}
              height="650px"
            />
          )}
        </div>

        {/* Side Panel: High Risk Hotspots Queue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Priority Geographic Hotspots</span>
              </h3>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {highRiskList.map((p) => (
                <div
                  key={p.project_id}
                  onClick={() => onSelectProject(p.project_id)}
                  className="p-3 rounded-xl border border-red-100 bg-red-50/40 hover:bg-red-50 transition-colors cursor-pointer space-y-1.5 text-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-500 font-bold">
                      {p.project_id}
                    </span>
                    <RiskBadge score={p.risk_score} level={p.risk_level} size="sm" />
                  </div>

                  <h4 className="font-bold text-slate-900 line-clamp-2 group-hover:text-red-700 transition-colors">
                    {p.project_name}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{p.district}, {p.state}</span>
                    <span className="font-bold text-red-600">+{p.cost_overrun_pct}% cost</span>
                  </div>

                  {p.duplicate_similarity_pct > 0 && (
                    <div className="text-[10px] text-amber-700 bg-amber-50 p-1 rounded font-medium">
                      ⚠ Duplicate anomaly: {p.duplicate_similarity_pct}% spatial match
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            Click any project marker or sidebar item to inspect AI explanations.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
