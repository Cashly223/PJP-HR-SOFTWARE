import React, { useState } from 'react';
import {
  FileText,
  AlertOctagon,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  Send,
  Eye,
  Calendar,
  Gavel,
  Paperclip,
  Download,
  AlertCircle,
  User,
  ShieldAlert,
  Printer,
  Edit3,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { StaffQuery, QueryStatus } from '../../types/hrms';

interface StaffQueriesTabProps {
  onOpenIssueQueryModal: () => void;
  onOpenResponseModal: (query: StaffQuery) => void;
  onOpenViewMemoModal: (query: StaffQuery) => void;
  onOpenScheduleHearingForQuery: (query: StaffQuery) => void;
  onOpenReviewVerdictModal: (query: StaffQuery) => void;
  isHRorAdmin: boolean;
  isAuthorizedToQuery?: boolean;
}

export const StaffQueriesTab: React.FC<StaffQueriesTabProps> = ({
  onOpenIssueQueryModal,
  onOpenResponseModal,
  onOpenViewMemoModal,
  onOpenScheduleHearingForQuery,
  onOpenReviewVerdictModal,
  isHRorAdmin,
  isAuthorizedToQuery = false,
}) => {
  const { staffQueries, currentUser, updateStaffQueryStatus, showToast } = useHrms();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const statusOptions: string[] = [
    'All',
    'Awaiting Staff Response',
    'Response Submitted',
    'Under Review',
    'Hearing Scheduled',
    'Verdict Delivered',
    'Case Closed / Dropped',
  ];

  const categories: string[] = [
    'All',
    'Clinical Negligence / Protocol Breach',
    'Absenteeism & Chronic Lateness',
    'Financial & Billing Irregularity',
    'Workplace Harassment / Unprofessional Conduct',
    'Insubordination & Refusal of Lawful Duty',
    'Confidentiality & HIPAA / Data Breach',
    'Medication & Prescription Discrepancy',
  ];

  const filteredQueries = staffQueries.filter((q) => {
    const matchesStatus = selectedStatus === 'All' || q.status === selectedStatus;
    const matchesCategory = categoryFilter === 'All' || q.misconductCategory === categoryFilter;
    const matchesSearch =
      q.queryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.staffEmpCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.staffDepartment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getSeverityBadge = (severity: StaffQuery['severity']) => {
    switch (severity) {
      case 'Critical / Gross Misconduct':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'High':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (status: QueryStatus) => {
    switch (status) {
      case 'Awaiting Staff Response':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Response Submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Under Review':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Hearing Scheduled':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Verdict Delivered':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Case Closed / Dropped':
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getAuthorityBadge = (issuedByRole?: string) => {
    const roleLower = (issuedByRole || '').toLowerCase();
    if (roleLower.includes('facility') || roleLower.includes('medical director') || roleLower.includes('ceo')) {
      return {
        label: 'Facility Head / Executive',
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
      };
    }
    if (roleLower.includes('unit') || roleLower.includes('ward')) {
      return {
        label: 'Unit Head / In-Charge',
        color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      };
    }
    if (roleLower.includes('dept') || roleLower.includes('department') || roleLower.includes('hod')) {
      return {
        label: 'Departmental Head',
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      };
    }
    return {
      label: 'HR Directorate & Ethics',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };
  };

  return (
    <div className="space-y-6">
      {/* Statutory Authority Governance Policy Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Statutory Querying Governance & Authority Tiers</span>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Only authorized <strong className="text-amber-300">Unit Heads</strong>, <strong className="text-purple-300">Departmental Heads</strong>, <strong className="text-emerald-300">HR Directorate</strong>, and the <strong className="text-rose-300">Head of Facility</strong> can formally query staff. All memos are fully editable and print-ready in standard A4 format.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Act 651 Compliant
          </span>
        </div>
      </div>

      {/* Top Controls: Filters & Issue Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  selectedStatus === status
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {isAuthorizedToQuery ? (
            <button
              onClick={onOpenIssueQueryModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md hover:shadow-lg transition shrink-0"
            >
              <FileText className="h-4 w-4" />
              Issue Formal Staff Query
            </button>
          ) : (
            <button
              onClick={() =>
                showToast(
                  'warning',
                  'HR Query Authorization Required',
                  'Only HR, Head of Facility, or Heads with delegated Query Authority granted in Access Control can query staff.'
                )
              }
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 text-xs font-medium cursor-help shrink-0 hover:bg-slate-700/80 transition"
              title="HR must grant Query Issuing Authority in Access Control Manager"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>Query Authority Required (HR Delegated)</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search by query #, staff name, employee ID, topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 shrink-0">Misconduct Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Query List / Case Files */}
      {filteredQueries.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center">
          <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Disciplinary Queries Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No queries match the active filters. Issue a formal query to document suspected misconduct or protocol
            breaches.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((query) => {
            const authorityBadge = getAuthorityBadge(query.issuedByRole);
            return (
              <div
                key={query.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition"
              >
                {/* Header Info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-start sm:items-center gap-3">
                    <img
                      src={
                        query.staffAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={query.staffName}
                      className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">{query.queryNumber}</span>
                        <span className="text-white font-bold text-sm">{query.staffName}</span>
                        <span className="text-xs text-slate-400">({query.staffEmpCode})</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${authorityBadge.color}`}>
                          {authorityBadge.label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {query.staffRole} • <span className="text-slate-300 font-medium">{query.staffDepartment}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getSeverityBadge(query.severity)}`}>
                      {query.severity}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusBadge(query.status)}`}>
                      {query.status}
                    </span>
                  </div>
                </div>

                {/* Body: Subject & Allegation */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                        {query.subject}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                        {query.allegationDetails}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Policy Clause In Question:</span>
                        <span className="text-slate-200 font-medium">{query.policyClauseViolated}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Incident Date & Location:</span>
                        <span className="text-slate-200 font-medium">
                          {query.incidentDate} • {query.incidentLocation || 'Hospital Grounds'}
                        </span>
                      </div>
                    </div>

                    {/* Attached Evidence Files */}
                    {query.attachedEvidence && query.attachedEvidence.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Paperclip className="h-3.5 w-3.5 text-slate-500" /> Evidence Logs:
                        </span>
                        {query.attachedEvidence.map((ev) => (
                          <span
                            key={ev.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-200 border border-slate-700"
                          >
                            <FileCheck className="h-3 w-3 text-emerald-400" />
                            {ev.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Staff Response Card if Submitted */}
                    {query.staffResponse ? (
                      <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-400" />
                            <span className="text-xs font-bold text-blue-200">
                              Formal Written Defense Submitted ({query.staffResponse.submittedAt})
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                            Plea: {query.staffResponse.plea}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic">"{query.staffResponse.explanation}"</p>
                        {query.staffResponse.supportingDocuments && query.staffResponse.supportingDocuments.length > 0 && (
                          <div className="flex items-center gap-2 pt-1">
                            <span className="text-[10px] text-slate-400">Attached Proof:</span>
                            {query.staffResponse.supportingDocuments.map((doc, idx) => (
                              <span key={idx} className="text-[10px] text-blue-300 underline font-medium">
                                {doc.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 flex items-center justify-between text-xs text-amber-200">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                          <span>Awaiting written defense. Response window: {query.responseDeadlineHours} hours.</span>
                        </div>
                        <span className="font-semibold text-amber-300">Deadline: {query.responseDeadlineDate}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Side: Meta & Action Toolbar */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Date Issued:</span>
                        <span className="text-slate-200 font-medium">{query.dateIssued}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Issued By:</span>
                        <span className="text-slate-200 font-medium">
                          {query.issuedBy} ({query.issuedByRole})
                        </span>
                      </div>
                      {query.sanctionApplied && (
                        <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/50 mt-2">
                          <span className="text-[10px] text-emerald-400 font-bold block uppercase">
                            Sanction / Decision:
                          </span>
                          <span className="text-xs font-bold text-white">{query.sanctionApplied}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Resolved: {query.resolvedDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => onOpenViewMemoModal(query)}
                        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md group"
                      >
                        <Printer className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>A4 Print & Editable Memo</span>
                      </button>

                      {/* Staff Defense Submission Button */}
                      {!query.staffResponse && (
                        <button
                          onClick={() => onOpenResponseModal(query)}
                          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Submit Written Defense
                        </button>
                      )}

                      {/* HR Actions */}
                      {isHRorAdmin && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          <button
                            onClick={() => onOpenScheduleHearingForQuery(query)}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-medium text-[11px] transition"
                          >
                            <Gavel className="h-3 w-3" />
                            Hearing
                          </button>
                          <button
                            onClick={() => onOpenReviewVerdictModal(query)}
                            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600/80 hover:bg-emerald-500 text-white font-medium text-[11px] transition"
                          >
                            <FileCheck className="h-3 w-3" />
                            Verdict
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
