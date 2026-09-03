import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue", badge, onClick }) => {
  const colorStyles = {
    blue: "from-blue-50 to-indigo-50/30 text-blue-600 border-blue-100",
    red: "from-red-50 to-rose-50/30 text-red-600 border-red-100",
    amber: "from-amber-50 to-yellow-50/30 text-amber-600 border-amber-100",
    green: "from-emerald-50 to-teal-50/30 text-emerald-600 border-emerald-100",
    purple: "from-purple-50 to-fuchsia-50/30 text-purple-600 border-purple-100",
    slate: "from-slate-50 to-gray-50/30 text-slate-700 border-slate-200"
  };

  const iconBgStyles = {
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    slate: "bg-slate-200 text-slate-800"
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group ${onClick ? 'cursor-pointer hover:border-slate-300' : ''}`}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${colorStyles[color]} rounded-bl-full -z-0 opacity-40 group-hover:scale-110 transition-transform duration-300`} />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgStyles[color]} shadow-sm group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{badge.label}</span>
          <span className={`font-semibold ${badge.colorClass || 'text-slate-700'}`}>{badge.value}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
