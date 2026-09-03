import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getRiskColor } from '../utils/formatters';

const RiskBadge = ({ score, level, showScore = true, size = "md" }) => {
  const colors = getRiskColor(level);
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-xs font-semibold px-2.5 py-1 gap-1.5",
    lg: "text-sm font-bold px-3.5 py-1.5 gap-2",
    xl: "text-base font-extrabold px-4 py-2 gap-2.5"
  };

  const Icon = level === "HIGH" 
    ? ShieldAlert 
    : level === "MEDIUM" 
      ? AlertTriangle 
      : CheckCircle2;

  return (
    <span className={`inline-flex items-center rounded-full border shadow-sm ${colors.pillBg} ${sizeClasses[size]}`}>
      <Icon className={size === "lg" || size === "xl" ? "w-5 h-5" : "w-3.5 h-3.5"} />
      <span>{level} RISK</span>
      {showScore && score !== undefined && (
        <span className="opacity-90 border-l pl-1.5 border-current">
          {Math.round(score)}/100
        </span>
      )}
    </span>
  );
};

export default RiskBadge;
