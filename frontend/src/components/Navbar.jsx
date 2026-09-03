import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  ChevronDown, 
  LogOut, 
  Bell, 
  Sparkles, 
  SlidersHorizontal,
  Building2
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';

const Navbar = ({ activeAlertCount = 0, onOpenAlerts }) => {
  const { currentUser, switchRolePreset, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleRoleSelect = async (userPreset) => {
    setRoleDropdownOpen(false);
    await switchRolePreset(userPreset.email, userPreset.password);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Indian National Tricolor Ribbon */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-[#FFFFFF]"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
            {/* National Emblem / Ashoka Style Emblem Icon */}
            <div className="w-10 h-10 rounded-xl bg-gov-blue flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
              <Building2 className="w-5 h-5 text-gov-saffron" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  MPLADS AI Monitor
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  SIH26102
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Ministry of Statistics & Programme Implementation (MoSPI) • AI Supervisory Portal
              </p>
            </div>
          </div>

          {/* Right Controls: Role Switcher & User Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300/80 rounded-xl text-xs font-semibold text-slate-800 transition-all shadow-2xs"
                title="Switch User Role Persona for Demonstration"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-gov-accent" />
                <span className="hidden md:inline">Demo Persona:</span>
                <span className="font-bold text-gov-blue">
                  {currentUser?.role === 'ministry_admin' ? 'Ministry Admin' :
                   currentUser?.role === 'state_nodal' ? 'State Nodal' :
                   currentUser?.role === 'district_authority' ? 'District Authority' : 'MP'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Switch Official Role Persona
                  </div>
                  <div className="mt-1 space-y-1">
                    {PRESET_USERS.map((preset) => {
                      const isActive = currentUser?.email === preset.email;
                      return (
                        <button
                          key={preset.role}
                          onClick={() => handleRoleSelect(preset)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex flex-col ${isActive ? 'bg-blue-50 border border-blue-200 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{preset.label}</span>
                            {isActive && <span className="text-[10px] text-blue-600 font-bold">ACTIVE</span>}
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal">{preset.scope}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenAlerts}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="View Live AI Alerts"
            >
              <Bell className="w-5 h-5" />
              {activeAlertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {activeAlertCount > 9 ? '9+' : activeAlertCount}
                </span>
              )}
            </button>

            {/* User Profile Avatar / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                {currentUser?.full_name ? currentUser.full_name.charAt(0) : "A"}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <div className="font-bold text-slate-900 truncate max-w-[140px]">
                  {currentUser?.full_name?.split(',')[0] || "Authorized Officer"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.role?.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                title="Logout Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
