import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';

const DisclaimerBanner = () => {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 p-3.5 rounded-r-lg shadow-sm text-xs md:text-sm text-amber-900 flex items-center justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-950">Statutory Notice: </span>
          <span className="text-amber-900">
            AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials.
          </span>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-1.5 shrink-0 px-2.5 py-1 bg-amber-100/80 rounded border border-amber-300/60 font-medium text-xs text-amber-800">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
        <span>SIH26102 Compliance</span>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
