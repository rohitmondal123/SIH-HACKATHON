import React, { useState } from 'react';
import { 
  FlaskConical, 
  Play, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Layers, 
  Cpu, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { simulationService } from '../services/api';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import RiskBadge from '../components/RiskBadge';
import DisclaimerBanner from '../components/DisclaimerBanner';

const PRESET_SCENARIOS = [
  {
    id: "sih_demo",
    name: "SIH Benchmark Demo: Rural Road Development",
    description: "₹20L estimated, ₹31L actual expenditure, 62% physical progress, 7+ months delay.",
    payload: {
      project_name: "Rural Road Development - Chandauli Link Sector 4",
      work_category: "Rural Roads & Pathways",
      estimated_cost: 20.0,
      sanctioned_amount: 20.0,
      actual_expenditure: 31.0,
      amount_released: 31.0,
      payment_count: 8,
      project_start_date: "2024-02-15",
      expected_completion_date: "2025-01-30",
      physical_progress: 62.0,
      state: "Uttar Pradesh",
      district: "Varanasi"
    }
  },
  {
    id: "normal",
    name: "Healthy Project: High School Science Block",
    description: "Within budget, 95% physical progress, standard tranche distribution.",
    payload: {
      project_name: "Government Higher Secondary School Science Lab Upgrade",
      work_category: "Education & School Infrastructure",
      estimated_cost: 30.0,
      sanctioned_amount: 30.0,
      actual_expenditure: 28.5,
      amount_released: 30.0,
      payment_count: 6,
      project_start_date: "2024-01-10",
      expected_completion_date: "2025-04-15",
      physical_progress: 95.0,
      state: "Maharashtra",
      district: "Pune"
    }
  },
  {
    id: "frontload",
    name: "Front-Loaded Disbursement: RO Water Plant",
    description: "100% funds released & spent in 1 single tranche, but only 20% physical progress.",
    payload: {
      project_name: "Community Reverse Osmosis Drinking Water Grid Scheme",
      work_category: "Drinking Water",
      estimated_cost: 45.0,
      sanctioned_amount: 45.0,
      actual_expenditure: 45.0,
      amount_released: 45.0,
      payment_count: 1,
      project_start_date: "2024-03-01",
      expected_completion_date: "2025-03-01",
      physical_progress: 20.0,
      state: "Bihar",
      district: "Patna"
    }
  },
  {
    id: "stalled",
    name: "Stalled Funds: Solar LED Lighting",
    description: "₹35L allocated & idle for 9 months, less than 10% progress achieved.",
    payload: {
      project_name: "Rooftop Solar & Ward LED Street Illumination Project",
      work_category: "Solar Street Lighting & Renewable Energy",
      estimated_cost: 35.0,
      sanctioned_amount: 35.0,
      actual_expenditure: 2.5,
      amount_released: 35.0,
      payment_count: 1,
      project_start_date: "2023-10-01",
      expected_completion_date: "2024-08-30",
      physical_progress: 8.0,
      state: "Karnataka",
      district: "Bangalore South"
    }
  }
];

const SimulationSandbox = () => {
  const [formData, setFormData] = useState(PRESET_SCENARIOS[0].payload);
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handlePresetSelect = (preset) => {
    setFormData(preset.payload);
    setResult(null);
  };

  const handleRunAnalysis = async (e) => {
    if (e) e.preventDefault();
    setAnalyzing(true);
    try {
      const res = await simulationService.analyzeCustomProject(formData);
      setResult(res);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-gov-accent" />
            <span>AI Anomaly Detection Simulation Sandbox</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Test custom or hypothetical project parameters live against the ML anomaly scoring pipeline
          </p>
        </div>

        <button
          onClick={() => handlePresetSelect(PRESET_SCENARIOS[0])}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Demo Benchmark</span>
        </button>
      </div>

      {/* Preset Scenarios Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Load Pre-Engineered Test Scenarios:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((preset) => {
            const isSelected = formData.project_name === preset.payload.project_name;
            return (
              <div
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-1 ${isSelected ? 'border-gov-blue bg-blue-50/70 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{preset.name}</h4>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-gov-blue"></span>}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Simulation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameter Controls (5 cols) */}
        <form onSubmit={handleRunAnalysis} className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-gov-accent" />
              <span>Project Parameters</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Editable Inputs</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Project Name</label>
              <input
                type="text"
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Work Category</label>
                <select
                  value={formData.work_category}
                  onChange={(e) => setFormData({ ...formData, work_category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Rural Roads & Pathways">Rural Roads & Pathways</option>
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Education & School Infrastructure">Education</option>
                  <option value="Health & Sanitation Facilities">Health & Sanitation</option>
                  <option value="Solar Street Lighting & Renewable Energy">Solar & Renewable</option>
                  <option value="Community Centers & Public Halls">Community Centers</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Payment Tranches</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.payment_count}
                  onChange={(e) => setFormData({ ...formData, payment_count: parseInt(e.target.value) || 1 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Estimated Cost (₹ Lakhs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Actual Expenditure (₹ Lakhs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.actual_expenditure}
                  onChange={(e) => setFormData({ ...formData, actual_expenditure: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-red-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Sanctioned Amount (₹ Lakhs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.sanctioned_amount}
                  onChange={(e) => setFormData({ ...formData, sanctioned_amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Amount Released (₹ Lakhs)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.amount_released}
                  onChange={(e) => setFormData({ ...formData, amount_released: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Physical Progress (%)</span>
                <span className="font-bold text-emerald-600">{formData.physical_progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.physical_progress}
                onChange={(e) => setFormData({ ...formData, physical_progress: parseFloat(e.target.value) || 0 })}
                className="w-full accent-gov-blue cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.project_start_date}
                  onChange={(e) => setFormData({ ...formData, project_start_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expected End Date</label>
                <input
                  type="date"
                  value={formData.expected_completion_date}
                  onChange={(e) => setFormData({ ...formData, expected_completion_date: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={analyzing}
            className="w-full py-3 bg-gradient-to-r from-gov-blue to-indigo-900 hover:from-slate-900 hover:to-gov-blue text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className="w-4 h-4 text-gov-saffron fill-current" />
            <span>{analyzing ? "Evaluating AI Risk Signals..." : "Run AI Pipeline Analysis"}</span>
          </button>
        </form>

        {/* Right Output: Real-time Evaluation Results (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-5 p-6 animate-fadeIn">
              {/* Output Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-sm ${result.risk_level === 'HIGH' ? 'bg-red-600' : result.risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                    {Math.round(result.risk_score)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${result.risk_level === 'HIGH' ? 'bg-red-100 text-red-800' : result.risk_level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {result.risk_level} RISK
                      </span>
                      <span className="text-xs text-slate-500">Score Range: 0–100</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      Composite Risk Synthesis Output
                    </h3>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <span>Engine Model:</span>
                  <div className="font-bold text-slate-800">Isolation Forest + Multi-Vector</div>
                </div>
              </div>

              {/* Detected Anomalies Tags */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Detected Anomaly Flags:
                </label>
                <div className="flex flex-wrap gap-2">
                  {result.detected_anomalies.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${result.risk_level === 'HIGH' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-700'}`}
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Explainable Rationale */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Why is this project scored {Math.round(result.risk_score)}/100?
                </label>
                <div className="space-y-2">
                  {result.explanations.map((exp, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gov-accent mt-1.5 shrink-0"></span>
                      <span>{exp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Computed Signals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Cost Overrun</span>
                  <div className="font-bold text-slate-900 mt-0.5">+{result.cost_overrun_pct}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Timeline Lag</span>
                  <div className="font-bold text-slate-900 mt-0.5">{result.delay_months} Months</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Fund Utilization</span>
                  <div className="font-bold text-slate-900 mt-0.5">{result.fund_utilization_pct}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">ML Score</span>
                  <div className="font-bold text-slate-900 mt-0.5">{result.ml_anomaly_score}/100</div>
                </div>
              </div>

              {/* Recommended Action */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 space-y-1.5 text-xs">
                <span className="font-bold text-gov-blue uppercase tracking-wider block">
                  Recommended Official Governance Protocol:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {result.recommended_action}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-dashed border-slate-300 space-y-3">
              <FlaskConical className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700 text-sm">Ready to Simulate AI Analysis</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Adjust the project parameters on the left or select a pre-engineered test scenario, then click "Run AI Pipeline Analysis" to inspect the live ML risk score.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimulationSandbox;
