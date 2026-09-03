import React, { useState } from 'react';
import { X, CheckSquare, ShieldAlert, Send, FileText, UserCheck } from 'lucide-react';
import { projectService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = [
  { value: "Verified - Legitimate", label: "Verified - Legitimate (Anomaly Justified by Site Conditions)", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  { value: "Under Audit", label: "Under Audit Investigation (Joint Committee Inspection Ordered)", color: "text-red-700 bg-red-50 border-red-300" },
  { value: "Notice Issued", label: "Corrective Notice Issued (Explanation Demanded from Agency)", color: "text-amber-700 bg-amber-50 border-amber-300" },
  { value: "Pending Review", label: "Pending Review (Awaiting Field Visit)", color: "text-slate-700 bg-slate-50 border-slate-300" },
  { value: "Resolved", label: "Resolved (Corrective Measure Completed)", color: "text-blue-700 bg-blue-50 border-blue-300" }
];

const VerificationModal = ({ project, isOpen, onClose, onVerificationSuccess }) => {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState(project?.verification_status || "Under Audit");
  const [notes, setNotes] = useState(project?.verification_notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Please provide official verification notes/remarks before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await projectService.submitVerification(project.project_id, {
        status: status,
        notes: notes.trim()
      });
      if (onVerificationSuccess) {
        onVerificationSuccess(res);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit verification. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gov-blue text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-800 rounded-lg">
              <CheckSquare className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Human Verification & Official Action</h3>
              <p className="text-xs text-blue-200">
                Official statutory review workflow for {project.project_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Project Summary Banner */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-bold text-slate-900">{project.project_name}</div>
            <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
              <span><strong>State/District:</strong> {project.district}, {project.state}</span>
              <span><strong>Agency:</strong> {project.implementing_agency}</span>
              <span><strong>AI Risk Score:</strong> {Math.round(project.risk_score)}/100 ({project.risk_level})</span>
            </div>
          </div>

          {/* Active Reviewing Officer */}
          <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
            <UserCheck className="w-4 h-4 text-blue-700 shrink-0" />
            <div>
              <span className="font-semibold">Reviewing Officer: </span>
              <span>{currentUser?.full_name || "Authorized District Authority"}</span>
              <span className="text-blue-700 ml-1">({currentUser?.role?.replace('_', ' ').toUpperCase()})</span>
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Select Official Governance Status *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${status === opt.value ? `${opt.color} ring-2 ring-blue-500 shadow-sm font-semibold` : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                >
                  <input
                    type="radio"
                    name="verification_status"
                    value={opt.value}
                    checked={status === opt.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-0.5 text-gov-blue focus:ring-blue-500"
                  />
                  <span className="text-xs leading-tight">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Official Notes / Findings */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span>Field Inspection Report & Remarks *</span>
              <span className="text-slate-400 font-normal">Official Audit Trail</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., Conducted joint field inspection with Assistant Engineer. Verified measurement book vs actual concrete foundation. Cost deviation due to unanticipated rocky stratum excavation. Recommended revised administrative sanction."
              className="w-full text-xs md:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 bg-white"
            />
          </div>

          {/* Statutory Disclaimer */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-relaxed">
            <strong>Note:</strong> All verification entries are digitally signed, timestamped, and stored into the national MPLADS audit log. False reporting is subject to governance oversight.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-gov-blue hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? "Submitting Official Log..." : "Submit Verification Action"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationModal;
