import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight, Layers, Eye } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import RiskBadge from './RiskBadge';

// Helper component to adjust map view smoothly
const MapController = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 6, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// Create custom colored div icon based on risk level
const createCustomIcon = (riskLevel, riskScore) => {
  let bgColor = "#10B981";
  let pulseClass = "";
  
  if (riskLevel === "HIGH") {
    bgColor = "#EF4444";
    pulseClass = "animate-pulse-risk";
  } else if (riskLevel === "MEDIUM") {
    bgColor = "#F59E0B";
  }

  const html = `
    <div class="custom-marker ${pulseClass}" style="background-color: ${bgColor}; width: 28px; height: 28px; border: 2.5px solid white; color: white; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; border-radius: 50%;">
      ${Math.round(riskScore || 0)}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'leaflet-custom-marker-wrapper',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const QUICK_LOCATIONS = [
  { name: "All India", coords: [22.5937, 78.9629], zoom: 5 },
  { name: "Varanasi (Demo Hub)", coords: [25.3176, 82.9739], zoom: 11 },
  { name: "Maharashtra (Pune/Mumbai)", coords: [18.9388, 73.8567], zoom: 8 },
  { name: "Karnataka (Bangalore)", coords: [12.9249, 77.5838], zoom: 9 },
  { name: "West Bengal (Kolkata)", coords: [22.5180, 88.3496], zoom: 9 },
  { name: "Tamil Nadu (Chennai)", coords: [13.0827, 80.2707], zoom: 9 },
  { name: "Delhi NCR", coords: [28.6139, 77.2090], zoom: 10 }
];

const IndiaMap = ({ projects = [], onSelectProject, height = "600px" }) => {
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [filterRisk, setFilterRisk] = useState("ALL");
  const [filterCategory, setFilterCategory] = useState("ALL");

  // Filter projects based on local controls
  const filteredProjects = projects.filter((p) => {
    if (filterRisk !== "ALL" && p.risk_level !== filterRisk) return false;
    if (filterCategory !== "ALL" && p.work_category !== filterCategory) return false;
    return true;
  });

  const categories = Array.from(new Set(projects.map((p) => p.work_category))).filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      {/* Map Control Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-gov-accent" />
            Quick Region:
          </span>
          {QUICK_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => {
                setMapCenter(loc.coords);
                setMapZoom(loc.zoom);
              }}
              className="px-2.5 py-1 bg-white hover:bg-gov-blue hover:text-white border border-slate-200 rounded-lg text-slate-700 font-medium transition-all shadow-2xs"
            >
              {loc.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Risk Level filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Risk:</span>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">🔴 High Risk Only</option>
              <option value="MEDIUM">🟠 Medium Risk Only</option>
              <option value="LOW">🟢 Low Risk Only</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Category:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 font-medium text-slate-700 outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] truncate"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredProjects.length}</strong> geocoded works
          </div>
        </div>
      </div>

      {/* Map Canvas */}
      <div style={{ height: height, width: '100%' }} className="relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredProjects.map((p) => {
            if (!p.latitude || !p.longitude) return null;
            return (
              <Marker
                key={p.project_id}
                position={[p.latitude, p.longitude]}
                icon={createCustomIcon(p.risk_level, p.risk_score)}
              >
                <Popup className="custom-popup" maxWidth={320}>
                  <div className="p-1 space-y-2 text-slate-900">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {p.project_id}
                      </span>
                      <RiskBadge score={p.risk_score} level={p.risk_level} size="sm" />
                    </div>

                    <div>
                      <h4 className="font-bold text-xs leading-snug line-clamp-2">
                        {p.project_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {p.district}, {p.state} • {p.work_category}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[10px]">Expenditure</span>
                        <div className="font-bold text-slate-800">{formatCurrency(p.actual_expenditure)}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Physical Prog</span>
                        <div className="font-bold text-emerald-600">{formatPercentage(p.physical_progress)}</div>
                      </div>
                    </div>

                    {p.cost_overrun_pct > 0 && (
                      <div className="text-[10px] text-red-600 font-semibold bg-red-50 p-1 rounded">
                        ⚠ Cost Overrun: +{p.cost_overrun_pct}%
                      </div>
                    )}

                    {onSelectProject && (
                      <button
                        onClick={() => onSelectProject(p.project_id)}
                        className="w-full mt-2 py-1.5 bg-gov-blue hover:bg-slate-900 text-white rounded text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect AI Diagnosis</span>
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-lg text-xs space-y-1.5 pointer-events-auto">
          <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">AI Risk Key</div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
            <span className="text-slate-600 font-medium">High Risk (71–100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Medium Risk (31–70)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Low Risk (0–30)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
