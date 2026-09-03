import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Eye, 
  CheckSquare, 
  Building, 
  Clock, 
  TrendingUp, 
  CreditCard, 
  Copy, 
  Search,
  Check
} from 'lucide-react';
import { alertService } from '../services/api';
import RiskBadge from '../components/RiskBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';

const ALERT_TYPES = [
  "All",
  "Severe Cost Overrun",
  "Moderate Cost Overrun",
  "Critical Project Delay",
  "Moderate Timeline Delay",
  "Front-Loaded Fund Disbursement",
  "Potential Duplicate / Overlapping Scheme",
  "Stalled / Dormant Fund Allocation"
];

const AlertCenter = ({ onSelectProject }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [riskTab, setRiskTab] = useState("HIGH"); // HIGH, MEDIUM, ALL
  const [selectedType, setSelectedType] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadAlerts();
  }, [riskTab, selectedType]);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (riskTab !== "ALL") params.risk_level = riskTab;
      if (selectedType !== "All") params.alert_type = selectedType;
      
      const data = await alertService.getAlerts(params);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (alertId, e) => {
    e.stopPropagation();
    try {
      await alertService.resolveAlert(alertId, "Verified by authorized nodal officer");
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, is_resolved: true } : a));
    } catch (err) {
      console.error("Resolve error:", err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      a.project_name.toLowerCase().includes(term) ||
      a.project_id.toLowerCase().includes(term) ||
      a.district.toLowerCase().includes(term) ||
      a.state.toLowerCase().includes(term) ||
      a.alert_type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BellRing className="w-6 h-6 text-red-600" />
            <span>Statutory AI Alert Center & Triage Queue</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Prioritized notifications of anomalous cost overruns, timeline delays, payment irregularities, and duplicate works
          </p>
        </div>

        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
          <button
            onClick={() => setRiskTab("HIGH")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${riskTab === 'HIGH' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>High Risk Priority</span>
          </button>
          <button
            onClick={() => setRiskTab("MEDIUM")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${riskTab === 'MEDIUM' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Medium Risk</span>
          </button>
          <button
            onClick={() => setRiskTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${riskTab === 'ALL' ? 'bg-gov-blue text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            <span>All Alerts</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alert by project or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Anomaly Category */}
          <div className="min-w-[180px]">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Anomaly Types</option>
              {ALERT_TYPES.filter(t => t !== "All").map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-slate-500 font-semibold">
          Showing <strong className="text-slate-900">{filteredAlerts.length}</strong> active alert triggers
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse bg-white rounded-2xl border border-slate-200">
            Fetching active AI alarm streams...
          </div>
        ) : filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isHigh = alert.risk_level === 'HIGH';
            return (
              <div
                key={alert.id}
                onClick={() => onSelectProject(alert.project_id)}
                className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${isHigh ? 'border-red-200 hover:border-red-300 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'}`}
              >
                {/* Left Alert Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge score={alert.risk_score} level={alert.risk_level} size="sm" />
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {alert.project_id}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {alert.alert_type}
                    </span>
                    {alert.is_resolved && (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-3 h-3" /> Resolved
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 leading-snug hover:text-gov-blue transition-colors">
                    {alert.project_name}
                  </h4>

                  <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span><strong>Location:</strong> {alert.district}, {alert.state}</span>
                    <span><strong>Triggered:</strong> {new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                  {!alert.is_resolved && (
                    <button
                      onClick={(e) => handleResolve(alert.id, e)}
                      className="px-3 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1"
                      title="Acknowledge & Mark Resolved"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Acknowledge</span>
                    </button>
                  )}

                  <button
                    onClick={() => onSelectProject(alert.project_id)}
                    className="px-4 py-2 bg-gov-blue hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Deep Diagnosis</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-500 border border-slate-200 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800">All alerts in this category are clear</h4>
            <p className="text-xs text-slate-400">No active anomaly triggers require triage.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
