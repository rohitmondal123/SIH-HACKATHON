import React from 'react';
import { Users, UserCheck, Building, Landmark, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

const ROLE_DETAILS = [
  {
    role: 'mp',
    title: 'Member of Parliament (MP)',
    description: 'Constituency-centric development tracking and citizen impact monitoring.',
    icon: Users,
    color: 'bg-blue-600',
    capabilities: [
      'View projects sanctioned in their parliamentary constituency',
      'Track real-time physical vs financial milestone progress',
      'Inspect explainable AI risk scores and project delay alerts',
      'Monitor citizen asset delivery across rural and urban wards'
    ],
    demoAccount: 'mp@mplads.gov.in / MPLADS@2026',
    defaultScope: 'Varanasi Constituency'
  },
  {
    role: 'district_authority',
    title: 'District Authority (DM / Collector / DPO)',
    description: 'District-level expenditure monitoring, contractor scrutiny, and field inspection triage.',
    icon: Building,
    color: 'bg-amber-600',
    capabilities: [
      'Monitor total district expenditure velocity & PFMS tranches',
      'Review high-risk projects flagged by AI anomaly models',
      'Submit statutory field inspection reports and measurement book logs',
      'Issue corrective notices to implementing agencies & contractors'
    ],
    demoAccount: 'district@mplads.gov.in / District@2026',
    defaultScope: 'Varanasi District (All Blocks)'
  },
  {
    role: 'state_nodal',
    title: 'State Nodal Authority',
    description: 'Statewide aggregation, inter-district benchmarking, and regional risk hotspot tracking.',
    icon: Landmark,
    color: 'bg-indigo-600',
    capabilities: [
      'View state-level aggregated analytics and absorption velocity',
      'Compare performance and risk propensity across all state districts',
      'Monitor state high-risk project triage queues',
      'Oversee state implementing agency performance benchmarks'
    ],
    demoAccount: 'state@mplads.gov.in / State@2026',
    defaultScope: 'Uttar Pradesh (All 75 Districts)'
  },
  {
    role: 'ministry_admin',
    title: 'Ministry / Admin (MoSPI Central)',
    description: 'Nationwide governance, multi-state analytics, model calibration, and policy oversight.',
    icon: ShieldAlert,
    color: 'bg-slate-900',
    capabilities: [
      'View nationwide macro statistics across all Indian States & UTs',
      'Cross-benchmark states and identify systemic cost overrun patterns',
      'Run live AI anomaly simulation laboratory with custom parameters',
      'Audit governance compliance and statutory field inspection logs'
    ],
    demoAccount: 'admin@mplads.gov.in / Admin@2026',
    defaultScope: 'Nationwide All States & UTs'
  }
];

const RoleOverview = ({ onNavigate }) => {
  const { currentUser, switchRolePreset } = useAuth();

  const handleSwitch = async (roleName) => {
    const preset = PRESET_USERS.find(p => p.role === roleName);
    if (preset) {
      await switchRolePreset(preset.email, preset.password);
      onNavigate('dashboard');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-gov-accent" />
          <span>Role-Based Governance & Access Control Matrix</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          SIH26102 compliance architecture supporting 4 distinct statutory user personas
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ROLE_DETAILS.map((r) => {
          const Icon = r.icon;
          const isActive = currentUser?.role === r.role;
          return (
            <div
              key={r.role}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition-all duration-200 flex flex-col justify-between space-y-4 ${isActive ? 'border-gov-blue ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200'}`}
            >
              <div className="space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl text-white shadow-sm ${r.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{r.title}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{r.defaultScope}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {r.description}
                </p>

                {/* Capabilities */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Statutory Capabilities:
                  </span>
                  <div className="space-y-1.5">
                    {r.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Demo switch button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                  {r.demoAccount.split('/')[0]}
                </span>
                <button
                  onClick={() => handleSwitch(r.role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isActive ? 'bg-slate-100 text-slate-700 cursor-default' : 'bg-gov-blue hover:bg-slate-900 text-white shadow-xs'}`}
                >
                  <span>{isActive ? 'Active Persona' : 'Switch to Persona'}</span>
                  {!isActive && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleOverview;
