import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building, 
  MapPin, 
  Calendar, 
  User, 
  CreditCard, 
  Activity, 
  CheckCircle, 
  Clock, 
  FileText, 
  CheckSquare, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { projectService } from '../services/api';
import { formatCurrency, formatPercentage, getRiskColor, getStatusColor } from '../utils/formatters';
import RiskBadge from './RiskBadge';
import AiExplanationCard from './AiExplanationCard';
import VerificationModal from './VerificationModal';

const ProjectModal = ({ projectId, isOpen, onClose, onRefresh }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // overview, payments, audit

  useEffect(() => {
    if (isOpen && projectId) {
      loadProject();
    }
  }, [isOpen, projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjectById(projectId);
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    loadProject();
    if (onRefresh) onRefresh();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-white rounded-2xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
          {/* Header */}
          <div className="bg-gov-blue text-white p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-blue-800 text-blue-200 text-xs font-mono font-bold px-2.5 py-0.5 rounded">
                  {projectId}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded border font-semibold ${getStatusColor(project?.project_status)}`}>
                  {project?.project_status || "In Progress"}
                </span>
                <span className="text-xs text-blue-200 bg-white/10 px-2 py-0.5 rounded">
                  {project?.work_category}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
                {loading ? "Loading project details..." : project?.project_name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {project?.district}, {project?.state} ({project?.constituency})
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  MP: {project?.mp_name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsVerifyOpen(true)}
                className="px-3.5 py-2 bg-gov-saffron hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Official Action</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-3 px-3 border-b-2 transition-all ${activeTab === 'overview' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              Overview & AI Diagnosis
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'payments' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              <span>PFMS Payment Ledger</span>
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
                {project?.payments?.length || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${activeTab === 'audit' ? 'border-gov-blue text-gov-blue font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
            >
              <span>Governance Audit Log</span>
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-full text-[10px]">
                {project?.verification_logs?.length || 0}
              </span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">
                Loading MPLADS records and running AI verification pipeline...
              </div>
            ) : project ? (
              <>
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Estimated Cost</span>
                        <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(project.estimated_cost)}</div>
                        <span className="text-[10px] text-slate-400">Sanctioned: {formatCurrency(project.sanctioned_amount)}</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Actual Expenditure</span>
                        <div className={`text-lg font-bold mt-1 ${project.cost_overrun_pct > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                          {formatCurrency(project.actual_expenditure)}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {project.cost_overrun_pct > 0 ? `+${project.cost_overrun_pct}% overrun` : 'On budget'}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Amount Released</span>
                        <div className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(project.amount_released)}</div>
                        <span className="text-[10px] text-slate-500">Utilized: {project.fund_utilization_pct}%</span>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase">Physical Progress</span>
                        <div className="text-lg font-bold text-emerald-600 mt-1">{formatPercentage(project.physical_progress)}</div>
                        <span className="text-[10px] text-slate-500">Financial: {formatPercentage(project.financial_progress)}</span>
                      </div>
                    </div>

                    {/* Progress Comparison Bars */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Progress & Timeline Milestones
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div>
                          <div className="flex justify-between mb-1 text-slate-600">
                            <span>Physical Completion (Field Verified)</span>
                            <span className="font-bold text-slate-900">{formatPercentage(project.physical_progress)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${project.physical_progress}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-slate-600">
                            <span>Financial Fund Disbursed</span>
                            <span className="font-bold text-slate-900">{formatPercentage(project.financial_progress)}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, project.financial_progress)}%` }} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 border-t border-slate-100 gap-2">
                        <span><strong>Start Date:</strong> {project.project_start_date}</span>
                        <span><strong>Expected Target:</strong> {project.expected_completion_date}</span>
                        <span><strong>Current Delay:</strong> <span className={project.delay_months > 0 ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>{project.delay_months} Months</span></span>
                        <span><strong>Agency:</strong> {project.implementing_agency}</span>
                      </div>
                    </div>

                    {/* Explainable AI Diagnosis Card */}
                    <AiExplanationCard 
                      project={project} 
                      onOpenVerify={() => setIsVerifyOpen(true)}
                    />
                  </div>
                )}

                {activeTab === "payments" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">PFMS Tranche Transaction Record</h4>
                      <span className="text-xs text-slate-500">Total Tranches: {project.payments?.length || 0}</span>
                    </div>

                    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                        <thead className="bg-slate-50 text-slate-700 font-semibold">
                          <tr>
                            <th className="px-4 py-3">Tranche #</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Recipient Agency</th>
                            <th className="px-4 py-3">Payment Mode</th>
                            <th className="px-4 py-3">AI Anomaly Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {project.payments && project.payments.length > 0 ? (
                            project.payments.map((pay) => (
                              <tr key={pay.id} className={pay.is_unusual ? "bg-red-50/40" : "hover:bg-slate-50"}>
                                <td className="px-4 py-3 font-semibold text-slate-900">Tranche {pay.installment_number}</td>
                                <td className="px-4 py-3 text-slate-600">{pay.payment_date}</td>
                                <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(pay.amount)}</td>
                                <td className="px-4 py-3 text-slate-700">{pay.recipient_agency}</td>
                                <td className="px-4 py-3 text-slate-600">{pay.payment_mode}</td>
                                <td className="px-4 py-3">
                                  {pay.is_unusual ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                                      <AlertTriangle className="w-3 h-3" />
                                      {pay.anomaly_reason || "Unusual Disbursement Spike"}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                      <CheckCircle className="w-3 h-3" />
                                      Standard Tranche
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                                No payment records logged yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === "audit" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Governance & Human Verification Log</h4>
                      <button
                        onClick={() => setIsVerifyOpen(true)}
                        className="px-3 py-1.5 bg-gov-blue hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>Add Verification Note</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {project.verification_logs && project.verification_logs.length > 0 ? (
                        project.verification_logs.map((log) => (
                          <div key={log.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-900">{log.officer_name}</span>
                                <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-medium">
                                  {log.officer_role}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs">
                              <span className="font-semibold text-slate-700">Status Assigned: </span>
                              <span className="font-bold text-gov-blue">{log.status_assigned}</span>
                            </div>
                            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-100">
                              {log.notes}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-2">
                          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                          <p>No field verification notes have been submitted yet.</p>
                          <button
                            onClick={() => setIsVerifyOpen(true)}
                            className="text-xs font-bold text-gov-blue hover:underline"
                          >
                            Click here to submit the initial verification report
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-red-500">Project record not found.</div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
            <span className="italic">
              AI-generated risk indicators are not proof of fraud. Final verification and action must be performed by authorized officials.
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {project && (
        <VerificationModal
          project={project}
          isOpen={isVerifyOpen}
          onClose={() => setIsVerifyOpen(false)}
          onVerificationSuccess={handleVerificationSuccess}
        />
      )}
    </>
  );
};

export default ProjectModal;
