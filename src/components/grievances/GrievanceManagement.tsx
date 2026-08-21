import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  UserX,
  ChevronRight,
  Sparkles,
  Send,
  Eye,
  Star,
  Building2,
  Activity,
  Filter,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Grievance } from '../../types/hrms';

export const GrievanceManagement: React.FC = () => {
  const { grievances, addGrievance, updateGrievanceStatus, addGrievanceNote, activeRole } = useHrms();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [anonFilter, setAnonFilter] = useState<string>('All');

  // Modal State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  // New Grievance Form State
  const [newIsAnonymous, setNewIsAnonymous] = useState(true);
  const [newSubmittedBy, setNewSubmittedBy] = useState('');
  const [newCategory, setNewCategory] = useState<Grievance['category']>('Shift / Scheduling Unfairness');
  const [newSeverity, setNewSeverity] = useState<Grievance['severity']>('Medium');
  const [newDepartment, setNewDepartment] = useState('Emergency Ward');
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Mediation Note State
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteConfidential, setNewNoteConfidential] = useState(false);
  const [resolutionText, setResolutionText] = useState('');

  // Stats Calculations
  const safeGrievances = (grievances || []).filter(Boolean);
  const totalGrievances = safeGrievances.length;
  const inMediationCount = safeGrievances.filter((g) => g?.status === 'In Mediation' || g?.status === 'Under Review').length;
  const anonymousCount = safeGrievances.filter((g) => g?.isAnonymous).length;
  const resolvedCount = safeGrievances.filter((g) => g?.status === 'Resolved').length;

  // Filtered List
  const filteredGrievances = safeGrievances.filter((g) => {
    if (!g) return false;
    const matchesSearch =
      (g.ticketNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
    const matchesSeverity = severityFilter === 'All' || g.severity === severityFilter;
    const matchesAnon =
      anonFilter === 'All' ||
      (anonFilter === 'Anonymous' && g.isAnonymous) ||
      (anonFilter === 'Attributed' && !g.isAnonymous);

    return matchesSearch && matchesStatus && matchesSeverity && matchesAnon;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    addGrievance({
      isAnonymous: newIsAnonymous,
      submittedBy: newIsAnonymous ? 'Anonymous Employee' : newSubmittedBy || 'Staff Member',
      category: newCategory,
      severity: newSeverity,
      department: newDepartment,
      subject: newSubject,
      description: newDescription,
    });

    // Reset Form
    setNewSubject('');
    setNewDescription('');
    setNewSubmittedBy('');
    setIsSubmitModalOpen(false);
  };

  const handleAddNote = (grievanceId: string) => {
    if (!newNoteText.trim()) return;
    addGrievanceNote(grievanceId, newNoteText, newNoteConfidential);
    setNewNoteText('');
  };

  const handleResolveGrievance = (grievanceId: string) => {
    if (!resolutionText.trim()) return;
    updateGrievanceStatus(grievanceId, 'Resolved', 'Formal resolution agreed and signed.', resolutionText);
    setResolutionText('');
    if (selectedGrievance) {
      setSelectedGrievance((prev) =>
        prev && prev.id === grievanceId
          ? { ...prev, status: 'Resolved', resolutionDetails: resolutionText, resolvedDate: new Date().toISOString().split('T')[0] }
          : prev
      );
    }
  };

  const getSeverityBadge = (sev: Grievance['severity']) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadge = (status: Grievance['status']) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'In Mediation':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Under Review':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Grievance & Whistleblower Portal</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-3 w-3" /> Protected Channel
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Confidential, non-retaliation platform for reporting workplace concerns, scheduling unfairness, pay discrepancies, and clinical safety issues.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition active:scale-95"
        >
          <Plus className="h-4 w-4" /> Submit Confidential Complaint
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Tickets Logged</span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalGrievances}</div>
          <p className="mt-1 text-[11px] text-slate-500">All departments across hospital</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Mediation</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{inMediationCount}</div>
          <p className="mt-1 text-[11px] text-amber-500/80">Under active review / mediation</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Anonymous Reports</span>
            <Lock className="h-4 w-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-300">{anonymousCount}</div>
          <p className="mt-1 text-[11px] text-purple-400/80">Identity fully protected</p>
        </div>

        <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resolved Tickets</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{resolvedCount}</div>
          <p className="mt-1 text-[11px] text-emerald-500/80">Formal resolution completed</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ticket #, subject, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="In Mediation">In Mediation</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">Severity: All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>

          <select
            value={anonFilter}
            onChange={(e) => setAnonFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">Submission: All</option>
            <option value="Anonymous">Anonymous Only</option>
            <option value="Attributed">Attributed Only</option>
          </select>
        </div>
      </div>

      {/* Grievances List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGrievances.length === 0 ? (
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-8 text-center">
            <Scale className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No grievance tickets match your filters.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search terms or filters above.</p>
          </div>
        ) : (
          filteredGrievances.map((item) => (
            <div
              key={item.id}
              className="group rounded-xl bg-slate-900/90 border border-slate-800 p-5 hover:border-slate-700 transition shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {item.ticketNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getSeverityBadge(item.severity)}`}>
                    {item.severity} Priority
                  </span>
                  {item.isAnonymous ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      <Lock className="h-3 w-3" /> Anonymous
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      By: {item.submittedBy}
                    </span>
                  )}
                </div>

                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Submitted: {item.dateSubmitted}
                </span>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition">
                    {item.subject}
                  </h3>
                  <span className="text-xs text-slate-400 flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded">
                    <Building2 className="h-3 w-3 text-slate-500" /> {item.department}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Progress & Actions Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-500" />
                    {item.investigationNotes.length} Investigation Notes
                  </span>
                  {item.assignedMediator && (
                    <span className="text-slate-400">
                      Mediator: <strong className="text-slate-200">{item.assignedMediator}</strong>
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setSelectedGrievance(item)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-emerald-600 hover:text-white transition"
                >
                  <Eye className="h-3.5 w-3.5" /> Manage & Mediate <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SUBMIT COMPLAINT MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Submit Confidential Grievance</h2>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Whistleblower Protection Switch */}
              <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-purple-400" />
                  <div>
                    <div className="font-semibold text-purple-200">Anonymous Whistleblower Protection</div>
                    <div className="text-[10px] text-purple-300/70">
                      Your identity will be completely hidden from hospital management.
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={newIsAnonymous}
                  onChange={(e) => setNewIsAnonymous(e.target.checked)}
                  className="h-4 w-4 accent-purple-500 rounded cursor-pointer"
                />
              </div>

              {!newIsAnonymous && (
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Your Full Name & Designation</label>
                  <input
                    type="text"
                    required={!newIsAnonymous}
                    placeholder="e.g. Nurse Elena Rostova - ICU Unit"
                    value={newSubmittedBy}
                    onChange={(e) => setNewSubmittedBy(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Grievance Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Grievance['category'])}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Workplace Harassment">Workplace Harassment</option>
                    <option value="Shift / Scheduling Unfairness">Shift / Scheduling Unfairness</option>
                    <option value="Pay & Allowance Discrepancy">Pay & Allowance Discrepancy</option>
                    <option value="Clinical Safety / Patient Risk">Clinical Safety / Patient Risk</option>
                    <option value="Management / Interpersonal">Management / Interpersonal</option>
                    <option value="Discrimination">Discrimination</option>
                    <option value="Other">Other Concern</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Severity Level</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as Grievance['severity'])}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Low">Low - Informational</option>
                    <option value="Medium">Medium - Standard Review</option>
                    <option value="High">High - Urgent Intervention</option>
                    <option value="Critical">Critical - Immediate Action</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Hospital Department Involved</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology ICU, Emergency Ward B, Pharmacy"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  placeholder="Brief summary of the issue..."
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Detailed Description & Facts</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide dates, shift times, specific occurrences, or evidence..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-md shadow-emerald-900/20"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Encrypted Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MEDIATION & CASE DETAIL DRAWER/MODAL */}
      {selectedGrievance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                    {selectedGrievance.ticketNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(selectedGrievance.status)}`}>
                    {selectedGrievance.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getSeverityBadge(selectedGrievance.severity)}`}>
                    {selectedGrievance.severity} Severity
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-2">{selectedGrievance.subject}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>Department: <strong className="text-slate-200">{selectedGrievance.department}</strong></span>
                  <span>Submitted: <strong className="text-slate-200">{selectedGrievance.dateSubmitted}</strong></span>
                  <span>By: <strong className="text-purple-300">{selectedGrievance.isAnonymous ? 'Anonymous Employee' : selectedGrievance.submittedBy}</strong></span>
                </div>
              </div>

              <button
                onClick={() => setSelectedGrievance(null)}
                className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close Case
              </button>
            </div>

            {/* Description Box */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Issue Description & Facts</h4>
              <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">{selectedGrievance.description}</p>
            </div>

            {/* Status Progression Workflow */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mediation & Resolution Stage</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(['Submitted', 'Under Review', 'In Mediation', 'Resolved'] as Grievance['status'][]).map((st) => (
                  <button
                    key={st}
                    onClick={() => updateGrievanceStatus(selectedGrievance.id, st)}
                    className={`py-2 px-3 rounded-lg border text-center font-medium transition ${
                      selectedGrievance.status === st
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Existing Investigation Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Investigation & Mediation Log ({selectedGrievance.investigationNotes.length})</span>
              </h4>

              {selectedGrievance.investigationNotes.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                  No mediation notes logged yet for this ticket.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedGrievance.investigationNotes.map((note) => (
                    <div
                      key={note.id}
                      className={`rounded-xl p-3 border text-xs ${
                        note.isConfidential
                          ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span className="flex items-center gap-1.5">
                          {note.isConfidential && <Lock className="h-3 w-3 text-purple-400" />}
                          {note.author} ({note.authorRole})
                        </span>
                        <span className="text-[10px] text-slate-500">{note.date}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Note Box */}
              <div className="mt-3 rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-2">
                <textarea
                  rows={2}
                  placeholder="Log new mediation progress or interview finding..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newNoteConfidential}
                      onChange={(e) => setNewNoteConfidential(e.target.checked)}
                      className="h-3.5 w-3.5 accent-purple-500"
                    />
                    <Lock className="h-3 w-3 text-purple-400" /> Confidential HR-Only Note
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddNote(selectedGrievance.id)}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-emerald-600 hover:text-white transition"
                  >
                    Add Log Entry
                  </button>
                </div>
              </div>
            </div>

            {/* Resolution Box */}
            <div className="rounded-xl bg-emerald-950/20 border border-emerald-500/30 p-4 space-y-3">
              <h4 className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Final Formal Resolution Document
              </h4>

              {selectedGrievance.resolutionDetails ? (
                <div className="text-xs text-emerald-200 space-y-1">
                  <p className="bg-slate-950/80 p-3 rounded-lg border border-emerald-500/20">{selectedGrievance.resolutionDetails}</p>
                  {selectedGrievance.resolvedDate && (
                    <p className="text-[10px] text-emerald-400/80 mt-1">Resolved on: {selectedGrievance.resolvedDate}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <textarea
                    rows={2}
                    placeholder="Enter formal agreed resolution details to complete this ticket..."
                    value={resolutionText}
                    onChange={(e) => setResolutionText(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-emerald-500/30 p-2.5 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleResolveGrievance(selectedGrievance.id)}
                    className="w-full py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-md transition"
                  >
                    Mark Ticket Formal Resolution Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
