import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Users, 
  Building, 
  Landmark, 
  ShieldAlert 
} from 'lucide-react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import DisclaimerBanner from '../components/DisclaimerBanner';

const Login = ({ onSuccess }) => {
  const { login, switchRolePreset } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    const res = await login(email, password);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  const handleQuickLogin = async (preset) => {
    setLoading(true);
    setError(null);
    const res = await switchRolePreset(preset.email, preset.password);
    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Tricolor Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]"></div>
        <div className="flex-1 bg-[#FFFFFF]"></div>
        <div className="flex-1 bg-[#138808]"></div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Top Disclaimer */}
        <div className="mb-6">
          <DisclaimerBanner />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Brand Details (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gov-blue flex items-center justify-center text-white shadow-md ring-4 ring-blue-100">
                <Building2 className="w-8 h-8 text-gov-saffron" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                  SIH26102 • Smart India Hackathon
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  MPLADS AI Monitor
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              AI-Powered Supervisory & Analytics Platform for Early Anomaly Detection, Cost Overrun Flags, Schedule Lags, and Multi-Vector Risk Governance in MPLAD Schemes.
            </p>

            {/* Quick Demo Role Cards */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                One-Click Hackathon Demo Access:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {PRESET_USERS.map((preset) => (
                  <button
                    key={preset.role}
                    onClick={() => handleQuickLogin(preset)}
                    disabled={loading}
                    className="p-3 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition-all shadow-2xs group flex items-start justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 group-hover:text-gov-blue">
                        {preset.label}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {preset.scope}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gov-blue group-hover:translate-x-0.5 transition-all mt-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Credentials Form (6 cols) */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Official Portal Login</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Sign in with authorized government credentials (JWT Secured)
              </p>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Government Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@mplads.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Security Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-900 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gov-blue hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Secure Session...' : 'Authenticate & Enter Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
              National Informatics Centre (NIC) & MoSPI Compliant Security Architecture
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
        Smart India Hackathon (SIH26102) • MPLADS AI Monitor Prototype
      </footer>
    </div>
  );
};

export default Login;
