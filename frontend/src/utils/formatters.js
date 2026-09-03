// Utility helper functions for MPLADS AI Monitor

export const formatCurrency = (amountInLakhs) => {
  if (amountInLakhs === undefined || amountInLakhs === null) return "₹0.00 L";
  const num = Number(amountInLakhs);
  if (num >= 100) {
    return `₹${(num / 100).toFixed(2)} Cr`;
  }
  return `₹${num.toFixed(2)} L`;
};

export const formatNumber = (val) => {
  if (val === undefined || val === null) return "0";
  return new Intl.NumberFormat('en-IN').format(val);
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return "0%";
  return `${Number(val).toFixed(1)}%`;
};

export const getRiskColor = (level) => {
  switch (level?.toUpperCase()) {
    case "HIGH":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        badge: "bg-red-600 text-white",
        ring: "ring-red-500",
        fill: "#EF4444",
        pillBg: "bg-red-100 text-red-800 border-red-300"
      };
    case "MEDIUM":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        badge: "bg-amber-500 text-white",
        ring: "ring-amber-500",
        fill: "#F59E0B",
        pillBg: "bg-amber-100 text-amber-800 border-amber-300"
      };
    case "LOW":
    default:
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        badge: "bg-emerald-600 text-white",
        ring: "ring-emerald-500",
        fill: "#10B981",
        pillBg: "bg-emerald-100 text-emerald-800 border-emerald-300"
      };
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case "Completed":
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Delayed":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "Stalled":
      return "bg-red-100 text-red-800 border-red-300";
    default:
      return "bg-slate-100 text-slate-800 border-slate-300";
  }
};
