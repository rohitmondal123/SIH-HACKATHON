import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Layers, 
  MapPin, 
  Building, 
  ArrowUpDown,
  Download,
  PieChart as PieIcon,
  Percent
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { dashboardService } from '../services/api';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import DisclaimerBanner from '../components/DisclaimerBanner';

const AnalyticsPage = ({ onSelectProject }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("states"); // states, districts, categories, correlation

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3"></div>
        <div className="h-80 bg-slate-200 rounded-xl"></div>
        <div className="h-80 bg-slate-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-gov-accent" />
            <span>Macro Analytics & Cross-Regional Benchmarks</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Inter-state fund absorption, district risk propensity, and work category efficiency analytics
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveView("states")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === 'states' ? 'bg-gov-blue text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            State Benchmarks
          </button>
          <button
            onClick={() => setActiveView("districts")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === 'districts' ? 'bg-gov-blue text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            District Risk Ranking
          </button>
          <button
            onClick={() => setActiveView("categories")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === 'categories' ? 'bg-gov-blue text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            Work Categories
          </button>
          <button
            onClick={() => setActiveView("correlation")}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeView === 'correlation' ? 'bg-gov-blue text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
          >
            Fund vs Progress Gap
          </button>
        </div>
      </div>

      {/* States Comparison View */}
      {activeView === "states" && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">State-wise Sanctioned vs Expenditure (₹ Lakhs)</h3>
                <p className="text-xs text-slate-500">Fund disbursement velocity across Indian States</p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.states || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="state" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="sanctioned_total" name="Sanctioned Funds (₹ Lakhs)" fill="#0A2540" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenditure_total" name="Actual Expenditure (₹ Lakhs)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              State-wise Compliance & Risk Profile Matrix
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-3">State Name</th>
                    <th className="px-4 py-3">Total Schemes</th>
                    <th className="px-4 py-3">Sanctioned</th>
                    <th className="px-4 py-3">Expenditure</th>
                    <th className="px-4 py-3">Fund Absorption %</th>
                    <th className="px-4 py-3">High-Risk Count</th>
                    <th className="px-4 py-3">Avg Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(data?.states || []).map((s) => (
                    <tr key={s.state} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{s.state}</td>
                      <td className="px-4 py-3 font-semibold">{s.total_projects}</td>
                      <td className="px-4 py-3">{formatCurrency(s.sanctioned_total)}</td>
                      <td className="px-4 py-3">{formatCurrency(s.expenditure_total)}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{s.fund_utilization_pct}%</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${s.high_risk_count > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                          {s.high_risk_count} ({s.high_risk_pct}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold">{s.avg_risk_score}/100</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* District Ranking View */}
      {activeView === "districts" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">District Risk Propensity Ranking</h3>
            <p className="text-xs text-slate-500">Ranked by average AI anomaly risk score</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">District</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Projects Monitored</th>
                  <th className="px-4 py-3">High Risk Flagged</th>
                  <th className="px-4 py-3">Expenditure Total</th>
                  <th className="px-4 py-3">Average AI Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(data?.districts || []).map((d, index) => (
                  <tr key={`${d.district}-${d.state}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-400">#{index + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{d.district}</td>
                    <td className="px-4 py-3 text-slate-600">{d.state}</td>
                    <td className="px-4 py-3">{d.total_projects}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${d.high_risk_count > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                        {d.high_risk_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{formatCurrency(d.expenditure)}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${d.avg_risk_score >= 50 ? 'text-red-600' : d.avg_risk_score >= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {d.avg_risk_score}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories View */}
      {activeView === "categories" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Work Category Cost Overrun vs Delay Profile</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.categories || []}
                  margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="category" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <RechartsTooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="avg_cost_overrun" name="Avg Cost Overrun (%)" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avg_delay_months" name="Avg Delay (Months)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Fund vs Progress Scatter View */}
      {activeView === "correlation" && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Physical Progress vs Financial Disbursement Correlation</h3>
            <p className="text-xs text-slate-500">
              Projects positioned above the diagonal line indicate financial front-loading (money spent ahead of physical delivery)
            </p>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" dataKey="physical" name="Physical Progress" unit="%" domain={[0, 100]} />
                <YAxis type="number" dataKey="financial" name="Financial Progress" unit="%" domain={[0, 150]} />
                <ZAxis type="number" dataKey="risk_score" range={[60, 300]} name="Risk Score" />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter 
                  name="Projects" 
                  data={data?.progress_matrix || []} 
                  fill="#2563EB"
                  onClick={(node) => node?.project_id && onSelectProject(node.project_id)}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 text-center">
            Bubble size represents AI Risk Score. Click any bubble to inspect project diagnosis.
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
