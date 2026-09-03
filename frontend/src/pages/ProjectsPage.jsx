import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  SlidersHorizontal, 
  Eye, 
  MapPin, 
  Building2, 
  ArrowUpDown, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { projectService } from '../services/api';
import { formatCurrency, formatPercentage, getStatusColor } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import RiskBadge from '../components/RiskBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';

const STATES = [
  "All", "Uttar Pradesh", "Maharashtra", "Karnataka", "Tamil Nadu", 
  "West Bengal", "Bihar", "Kerala", "Rajasthan", "Gujarat", "Odisha", "Delhi"
];

const CATEGORIES = [
  "All",
  "Drinking Water",
  "Rural Roads & Pathways",
  "Education & School Infrastructure",
  "Health & Sanitation Facilities",
  "Community Centers & Public Halls",
  "Irrigation & Water Conservation",
  "Solar Street Lighting & Renewable Energy",
  "Sports & Youth Facilities",
  "Skill Development Centers"
];

const ProjectsPage = ({ onSelectProject }) => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('risk_desc'); // risk_desc, cost_desc, delay_desc

  useEffect(() => {
    // Default filter for MP/District roles
    if (currentUser?.role === 'mp' && currentUser?.state) {
      setSelectedState(currentUser.state);
    } else if (currentUser?.role === 'district_authority' && currentUser?.state) {
      setSelectedState(currentUser.state);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchProjects();
  }, [selectedState, selectedCategory, selectedRisk, selectedStatus, search]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedState !== 'All') params.state = selectedState;
      if (selectedCategory !== 'All') params.work_category = selectedCategory;
      if (selectedRisk !== 'All') params.risk_level = selectedRisk;
      if (selectedStatus !== 'All') params.project_status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const data = await projectService.getProjects(params);
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort projects in client
  const sortedProjects = [...projects].sort((a, b) => {
    if (sortBy === 'risk_desc') return b.risk_score - a.risk_score;
    if (sortBy === 'cost_desc') return b.actual_expenditure - a.actual_expenditure;
    if (sortBy === 'delay_desc') return b.delay_months - a.delay_months;
    return 0;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (!sortedProjects.length) return;
    
    const headers = [
      "Project ID", "Project Name", "State", "District", "Constituency", 
      "MP Name", "Category", "Implementing Agency", "Estimated Cost (Lakh)", 
      "Sanctioned (Lakh)", "Actual Expenditure (Lakh)", "Amount Released (Lakh)", 
      "Physical Progress %", "Financial Progress %", "Delay (Months)", 
      "Risk Score", "Risk Level", "Verification Status"
    ];

    const rows = sortedProjects.map(p => [
      p.project_id,
      `"${p.project_name.replace(/"/g, '""')}"`,
      p.state,
      p.district,
      p.constituency,
      `"${p.mp_name}"`,
      `"${p.work_category}"`,
      `"${p.implementing_agency}"`,
      p.estimated_cost,
      p.sanctioned_amount,
      p.actual_expenditure,
      p.amount_released,
      p.physical_progress,
      p.financial_progress,
      p.delay_months,
      p.risk_score,
      p.risk_level,
      `"${p.verification_status}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MPLADS_AI_Monitoring_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            MPLADS Project Monitoring & Anomaly Registry
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real-time audit registry of all sanctioned development schemes with multi-signal AI telemetry
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={!sortedProjects.length}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search bar */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search project, MP, agency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900"
            />
          </div>

          {/* State Filter */}
          <div>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All States ({STATES.length - 1})</option>
              {STATES.filter(s => s !== "All").map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none truncate"
            >
              <option value="All">All Work Categories</option>
              {CATEGORIES.filter(c => c !== "All").map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="All">All Risk Levels</option>
              <option value="HIGH">🔴 High Risk Only (71-100)</option>
              <option value="MEDIUM">🟠 Medium Risk (31-70)</option>
              <option value="LOW">🟢 Low Risk (0-30)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-gov-blue focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="risk_desc">Sort: Highest Risk First</option>
              <option value="cost_desc">Sort: Highest Expenditure</option>
              <option value="delay_desc">Sort: Longest Delay</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Found <strong className="text-slate-900">{sortedProjects.length}</strong> matching MPLADS schemes</span>
          <span className="text-[11px] font-medium text-slate-400">Showing all records with active ML scores</span>
        </div>
      </div>

      {/* Main Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            Filtering and evaluating project telemetry...
          </div>
        ) : sortedProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Project Details</th>
                  <th className="px-4 py-3.5">Location & MP</th>
                  <th className="px-4 py-3.5">Financials (Lakhs)</th>
                  <th className="px-4 py-3.5">Physical / Financial %</th>
                  <th className="px-4 py-3.5">Schedule / Delay</th>
                  <th className="px-4 py-3.5">AI Risk Score</th>
                  <th className="px-4 py-3.5">Governance Status</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {sortedProjects.map((p) => {
                  const isHigh = p.risk_level === 'HIGH';
                  return (
                    <tr 
                      key={p.project_id}
                      onClick={() => onSelectProject(p.project_id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${isHigh ? 'bg-red-50/20' : ''}`}
                    >
                      {/* Project Name & ID */}
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {p.project_id}
                          </span>
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                            {p.work_category}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 mt-1 line-clamp-2 group-hover:text-gov-blue transition-colors">
                          {p.project_name}
                        </h4>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {p.implementing_agency}
                        </span>
                      </td>

                      {/* Location & MP */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{p.district}, {p.state}</div>
                        <div className="text-slate-500 text-[11px]">MP: {p.mp_name}</div>
                        <div className="text-slate-400 text-[10px]">Const: {p.constituency}</div>
                      </td>

                      {/* Financials */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className={`font-bold ${p.cost_overrun_pct > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          {formatCurrency(p.actual_expenditure)}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          Est: {formatCurrency(p.estimated_cost)}
                        </div>
                        {p.cost_overrun_pct > 0 && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.2 rounded">
                            +{p.cost_overrun_pct}% Overrun
                          </span>
                        )}
                      </td>

                      {/* Progress */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1 w-28">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-500">Physical:</span>
                            <span className="font-bold text-emerald-600">{formatPercentage(p.physical_progress)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${p.physical_progress}%` }} />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span>Financial:</span>
                            <span>{formatPercentage(p.financial_progress)}</span>
                          </div>
                        </div>
                      </td>

                      {/* Schedule / Delay */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded font-semibold border text-[11px] ${getStatusColor(p.project_status)}`}>
                          {p.project_status}
                        </span>
                        {p.delay_months > 0 ? (
                          <div className="text-red-600 font-bold text-[11px] mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{p.delay_months}m Delay</span>
                          </div>
                        ) : (
                          <div className="text-emerald-600 text-[10px] mt-1 font-medium">
                            On Schedule
                          </div>
                        )}
                      </td>

                      {/* AI Risk Score */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <RiskBadge score={p.risk_score} level={p.risk_level} size="md" />
                      </td>

                      {/* Governance Verification Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${p.verification_status === 'Under Audit' ? 'bg-red-50 text-red-800 border-red-200' : p.verification_status === 'Verified - Legitimate' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {p.verification_status || "Pending Review"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectProject(p.project_id);
                          }}
                          className="px-3 py-1.5 bg-gov-blue hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800">No matching projects found</h4>
            <p className="text-xs text-slate-400">Try adjusting your state, category, or search filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
