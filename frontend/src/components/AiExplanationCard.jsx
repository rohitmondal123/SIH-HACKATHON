import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  Copy, 
  Cpu, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { getRiskColor, formatPercentage } from '../utils/formatters';

const AiExplanationCard = ({ project, onOpenVerify }) => {
  if (!project) return null;

  const {
    risk_score = 0,
    risk_level = "LOW",
    cost_overrun_pct = 0,
    delay_months = 0,
    payment_anomaly_flag = false,
    duplicate_similarity_pct = 0,
    duplicate_of_id,
    fund_utilization_pct = 0,
    detected_anomalies = [],
    explanations = [],
    recommended_action,
    verification_status
  } = project;

  const colors = getRiskColor(risk_level);

  // Indicators data for breakdown bars
  const indicators = [
    {
      label: "Cost Deviation",
      value: `${cost_overrun_pct > 0 ? '+' : ''}${cost_overrun_pct}%`,
      barPercent: Math.min(100, Math.max(10, cost_overrun_pct * 1.5)),
      icon: TrendingUp,
      status: cost_overrun_pct > 20 ? 'high' : cost_overrun_pct > 5 ? 'med' : 'low',
      detail: cost_overrun_pct > 0 ? "Exceeds estimated project allocation" : "Within estimated budget"
    },
    {
      label: "Timeline Delay",
      value: `${delay_months} Months`,
      barPercent: Math.min(100, Math.max(10, delay_months * 12)),
      icon: Clock,
      status: delay_months > 6 ? 'high' : delay_months > 2 ? 'med' : 'low',
      detail: delay_months > 0 ? "Progress behind statutory expected schedule" : "On schedule"
    },
    {
      label: "Payment Pattern",
      value: payment_anomaly_flag ? "Anomalous" : "Normal",
      barPercent: payment_anomaly_flag ? 85 : 15,
      icon: CreditCard,
      status: payment_anomaly_flag ? 'high' : 'low',
      detail: payment_anomaly_flag ? "Irregular tranche disbursement velocity detected" : "PFMS standard tranches"
    },
    {
      label: "Spatial / Duplicate Match",
      value: `${duplicate_similarity_pct}%`,
      barPercent: Math.max(10, duplicate_similarity_pct),
      icon: Copy,
      status: duplicate_similarity_pct > 50 ? 'high' : duplicate_similarity_pct > 25 ? 'med' : 'low',
      detail: duplicate_of_id ? `Nearby match with ${duplicate_of_id}` : "No duplicate works detected within 5km"
    },
    {
      label: "Fund Absorption Efficiency",
      value: `${fund_utilization_pct}%`,
      barPercent: Math.min(100, Math.max(10, fund_utilization_pct)),
      icon: Layers,
      status: fund_utilization_pct > 110 || (fund_utilization_pct < 20 && delay_months > 3) ? 'high' : 'low',
      detail: "Expenditure vs released fund proportion"
    },
    {
      label: "Isolation Forest ML Anomaly",
      value: `${Math.round(project.ml_anomaly_score || 20)}/100`,
      barPercent: project.ml_anomaly_score || 20,
      icon: Cpu,
      status: (project.ml_anomaly_score || 0) > 60 ? 'high' : (project.ml_anomaly_score || 0) > 35 ? 'med' : 'low',
      detail: "Multi-dimensional feature vector divergence"
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header Banner */}
      <div className={`p-5 border-b ${colors.bg} ${colors.border} flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-sm ${risk_level === 'HIGH' ? 'bg-red-600' : risk_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
            {Math.round(risk_score)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${colors.pillBg}`}>
                {risk_level} RISK LEVEL
              </span>
              <span className="text-xs text-slate-500 font-medium">Composite Score (0–100)</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">
              Explainable AI Anomaly Diagnosis
            </h4>
          </div>
        </div>

        {onOpenVerify && (
          <button
            onClick={() => onOpenVerify(project)}
            className="px-4 py-2 bg-gov-blue hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span>Submit Verification Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Why is this project high-risk? Section */}
        <div>
          <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gov-accent"></span>
            Why is this project flagged as {risk_level.toLowerCase()} risk?
          </h5>
          
          <div className="space-y-2.5">
            {explanations && explanations.length > 0 ? (
              explanations.map((exp, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border text-xs md:text-sm flex items-start gap-2.5 ${risk_level === 'HIGH' ? 'bg-red-50/70 border-red-200 text-red-900' : risk_level === 'MEDIUM' ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'}`}
                >
                  <div className="mt-0.5">
                    {risk_level === 'HIGH' ? (
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    ) : risk_level === 'MEDIUM' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <div className="font-medium leading-relaxed">{exp}</div>
                </div>
              ))
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                No acute anomalies detected. All parameters operate within standard baseline boundaries.
              </div>
            )}
          </div>
        </div>

        {/* Multi-Signal Factor Breakdown */}
        <div>
          <h5 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gov-accent"></span>
              Multi-Signal Anomaly Breakdown
            </span>
            <span className="text-xs font-normal text-slate-500">
              Quantitative Signal Vectors
            </span>
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {indicators.map((ind, i) => {
              const IconComp = ind.icon;
              const isHigh = ind.status === 'high';
              const isMed = ind.status === 'med';
              return (
                <div key={i} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isHigh ? 'bg-red-100 text-red-700' : isMed ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{ind.label}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isHigh ? 'bg-red-100 text-red-800' : isMed ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                      {ind.value}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-red-500' : isMed ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, ind.barPercent)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    {ind.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Official Action */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gov-blue uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-blue-600" />
            <span>Recommended Governance & Field Action</span>
          </div>
          <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed">
            {recommended_action || "Routine monitoring recommended. Maintain standard audit checks."}
          </p>
          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-blue-100">
            <span>Governance Protocol: MPLADS-AI-VERIFY-V1</span>
            <span className="font-semibold text-gov-blue">Official Verification Required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiExplanationCard;
