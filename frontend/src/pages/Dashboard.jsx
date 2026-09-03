import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  CreditCard, 
  ArrowUpRight, 
  ShieldAlert, 
  Layers, 
  RefreshCw,
  Sparkles,
  MapPin,
  Flame
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { dashboardService, projectService } from '../services/api';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import ProjectCard from '../components/ProjectCard';
import DisclaimerBanner from '../components/DisclaimerBanner';

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const Dashboard = ({ onSelectProject, onNavigate }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [highRiskProjects, setHighRiskProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [currentUser]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      // Pass role scoping if applicable
      const params = {};
      if (currentUser?.role === 'mp' && currentUser?.constituency) {
        params.constituency = currentUser.constituency;
      } else if (currentUser?.role === 'district_authority' && currentUser?.district) {
        params.district = currentUser.district;
      } else if (currentUser?.role === 'state_nodal' && currentUser?.state) {
        params.state = currentUser.state;
      }

      const [dashData, highRisk] = await Promise.all([
        dashboardService.getDashboardStats(params),
        projectService.getHighRiskProjects()
      ]);
      setStats(dashData);
      setHighRiskProjects(highRisk);
    } catch (err) {
      console.error("Dashboard load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
          <div className="h-28 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-96 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Statutory Safety Disclaimer */}
      <DisclaimerBanner />

      {/* Top Header & Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Executive AI Supervisory Dashboard
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              Active Monitoring
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Real-time anomaly telemetry, multi-vector risk profiling, and fund utilization tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors shadow-2xs"
            title="Refresh AI Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>
          
          <button
            onClick={() => onNavigate('sandbox')}
            className="px-3.5 py-2 bg-gradient-to-r from-gov-blue to-indigo-900 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Launch AI Sandbox</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Monitored Works"
          value={formatNumber(stats?.total_projects || 0)}
          subtitle={`${stats?.completed_projects || 0} Fully Completed (${formatPercentage((stats?.completed_projects / (stats?.total_projects || 1)) * 100)})`}
          icon={Building2}
          color="blue"
          badge={{ label: "Scope", value: currentUser?.role?.replace('_', ' ').toUpperCase() || 'NATIONAL' }}
          onClick={() => onNavigate('projects')}
        />

        <StatCard
          title="Total Sanctioned Funds"
          value={formatCurrency(stats?.total_sanctioned_lakhs || 0)}
          subtitle={`Disbursed Spend: ${formatCurrency(stats?.total_expenditure_lakhs || 0)}`}
          icon={CreditCard}
          color="slate"
          badge={{ label: "Avg Absorption", value: `${stats?.average_fund_utilization_pct || 0}%` }}
        />

        <StatCard
          title="High-Risk Projects"
          value={formatNumber(stats?.high_risk_projects || 0)}
          subtitle="Score ≥ 71/100 (Immediate Field Verification)"
          icon={ShieldAlert}
          color="red"
          badge={{ label: "Priority Queue", value: "Action Required", colorClass: "text-red-600 font-bold" }}
          onClick={() => onNavigate('alerts')}
        />

        <StatCard
          title="Execution Deficits"
          value={`${stats?.delayed_projects || 0} Delayed`}
          subtitle={`${stats?.cost_overrun_projects || 0} Cost Overruns • ${stats?.suspicious_payment_cases || 0} Payment Alerts`}
          icon={AlertTriangle}
          color="amber"
          badge={{ label: "Total Alerts", value: `${stats?.recent_alerts?.length || 0} Unresolved` }}
          onClick={() => onNavigate('alerts')}
        />
      </div>

      {/* Highlighted Hackathon Demo Case Banner */}
      <div className="bg-gradient-to-r from-red-900 via-gov-blue to-slate-900 text-white rounded-2xl p-5 shadow-md border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500/30 border border-red-400 text-red-200 text-xs font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>SIH Benchmark Demo Case</span>
            </span>
            <span className="text-xs text-slate-300 font-mono">MPLAD-2024-UP-001</span>
          </div>
          <h3 className="text-base md:text-lg font-bold">
            Rural Road Development - Chandauli Link Sector 4 (Varanasi, UP)
          </h3>
          <p className="text-xs text-slate-300 max-w-2xl">
            Estimated ₹20L → Actual ₹31L (+55% Overrun) • Physical Progress: 62% vs 100% Target • Delay: 7+ Months.
            AI Risk Score: <strong className="text-red-300">89/100 (HIGH RISK)</strong>.
          </p>
        </div>

        <button
          onClick={() => onSelectProject('MPLAD-2024-UP-001')}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>Inspect Demo Diagnosis</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Doughnut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Risk Severity Distribution</h3>
              <p className="text-xs text-slate-500">Categorization by composite score (0–100)</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">Total: {stats?.total_projects}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.risk_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.risk_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <div className="font-bold text-sm">{stats?.low_risk_projects}</div>
              <div className="text-[10px] text-emerald-600">Low Risk</div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
              <div className="font-bold text-sm">{stats?.medium_risk_projects}</div>
              <div className="text-[10px] text-amber-600">Medium Risk</div>
            </div>
            <div className="p-2 rounded-lg bg-red-50 text-red-800">
              <div className="font-bold text-sm">{stats?.high_risk_projects}</div>
              <div className="text-[10px] text-red-600">High Risk</div>
            </div>
          </div>
        </div>

        {/* State-wise Breakdown Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">State-wise Works & High-Risk Incidence</h3>
              <p className="text-xs text-slate-500">Cross-state distribution of monitored MPLADS schemes</p>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-bold text-gov-blue hover:underline flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={(stats?.state_breakdown || []).slice(0, 7)}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="state" tick={{ fontSize: 11 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="total" name="Total Projects" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="high_risk" name="High Risk Flagged" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Aggregated across {stats?.state_breakdown?.length || 0} Indian States & UTs</span>
            <span className="font-semibold text-slate-700">MoSPI Central Telemetry Stream</span>
          </div>
        </div>
      </div>

      {/* Priority High-Risk Projects & Live Alert Center Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High Risk Projects Grid */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Priority High-Risk Triage Queue</span>
              </h3>
              <p className="text-xs text-slate-500">Requires human field verification by authorized officers</p>
            </div>

            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-bold text-gov-blue hover:underline flex items-center gap-1"
            >
              <span>View All ({stats?.total_projects})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(highRiskProjects || []).slice(0, 4).map((proj) => (
              <ProjectCard
                key={proj.project_id}
                project={proj}
                onSelect={onSelectProject}
              />
            ))}
          </div>
        </div>

        {/* Live Alerts Feed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Recent AI Alert Feed</span>
              </h3>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs font-bold text-gov-blue hover:underline"
              >
                Alert Center
              </button>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {(stats?.recent_alerts || []).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectProject(alert.project_id)}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition-colors cursor-pointer space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{alert.alert_type}</span>
                    <RiskBadge score={alert.risk_score} level={alert.risk_level} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>{alert.district}, {alert.state}</span>
                    <span className="font-mono">{alert.project_id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate('map')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
            >
              Open Interactive Geospatial Project Map →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
