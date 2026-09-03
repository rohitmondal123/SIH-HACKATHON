import React from 'react';
import { MapPin, Calendar, Building, ArrowUpRight, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercentage, getStatusColor } from '../utils/formatters';
import RiskBadge from './RiskBadge';

const ProjectCard = ({ project, onSelect }) => {
  const {
    project_id,
    project_name,
    state,
    district,
    work_category,
    implementing_agency,
    estimated_cost,
    actual_expenditure,
    physical_progress,
    risk_score,
    risk_level,
    cost_overrun_pct,
    delay_months,
    project_status
  } = project;

  return (
    <div 
      onClick={() => onSelect(project_id)}
      className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between group"
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {project_id}
          </span>
          <RiskBadge score={risk_score} level={risk_level} size="sm" />
        </div>

        {/* Title */}
        <div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-gov-blue transition-colors line-clamp-2">
            {project_name}
          </h4>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{district}, {state}</span>
          </p>
        </div>

        {/* Category & Status */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
            {work_category}
          </span>
          <span className={`px-2 py-0.5 rounded font-semibold border ${getStatusColor(project_status)}`}>
            {project_status}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Expenditure</span>
            <div className="font-bold text-slate-900">{formatCurrency(actual_expenditure)}</div>
            <span className="text-[10px] text-slate-500">Est: {formatCurrency(estimated_cost)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Physical Progress</span>
            <div className="font-bold text-emerald-600">{formatPercentage(physical_progress)}</div>
            {delay_months > 0 ? (
              <span className="text-[10px] text-red-600 font-semibold flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" /> {delay_months}m lag
              </span>
            ) : (
              <span className="text-[10px] text-slate-500">On schedule</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer / Anomalies Preview */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="truncate max-w-[180px] text-[11px] text-slate-400">
          {implementing_agency}
        </span>
        <span className="text-gov-blue font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
