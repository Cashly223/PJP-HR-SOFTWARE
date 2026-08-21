import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Upload,
  Download,
  Eye,
  Send,
  UserCheck,
  Building2,
  ShieldCheck,
  Award,
  ChevronRight,
  Plus,
  Search,
  Filter,
  FileText,
  Paperclip,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Printer,
  Calendar,
  Star,
  ThumbsUp,
  RotateCcw,
  BarChart2,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { PerformanceAppraisal, AppraisalCadre, AppraisalWorkflowStep } from '../../types/hrms';

export const AutomatedAppraisalWorkflow: React.FC = () => {
  const {
    performanceAppraisals,
    addPerformanceAppraisal,
    processAppraisalWorkflowStep,
    uploadAppraisalDocument,
    employees,
    activeRole,
    currentUser,
    isHeadOfFacilityOrHr,
  } = useHrms();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [periodFilter, setPeriodFilter] = useState<string>('All');
  const [cadreFilter, setCadreFilter] = useState<string>('All');

  // Modals
  const [isInitiateModalOpen, setIsInitiateModalOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<PerformanceAppraisal | null>(null);
  const [actionModal, setActionModal] = useState<{
    appraisal: PerformanceAppraisal;
    action: 'Approved' | 'Returned' | 'Rejected';
  } | null>(null);
  const [actionComment, setActionComment] = useState('');

  // Form State for Initiating Appraisal
  const [formEmpId, setFormEmpId] = useState('');
  const [formPeriod, setFormPeriod] = useState('2025/2026 Annual Cycle');
  const [formCycleYear, setFormCycleYear] = useState('2026');
  const [formCadre, setFormCadre] = useState<AppraisalCadre>('medical_doctor');
  const [formScore, setFormScore] = useState(85);
  const [formObjectivesMet, setFormObjectivesMet] = useState('Exceeded primary clinical duty targets and patient care standards.');
  const [formStrengths, setFormStrengths] = useState('Exceptional clinical precision, punctual emergency response, and peer mentorship.');
  const [formAreasForImprovement, setFormAreasForImprovement] = useState('Continued participation in medical research and electronic medical records protocols.');
  const [formDocTitle, setFormDocTitle] = useState('');
  const [formDocName, setFormDocName] = useState('');
  const [formDocUrl, setFormDocUrl] = useState('');

  // Stats calculation
  const safeAppraisals = (performanceAppraisals || []).filter(Boolean);
  const totalCount = safeAppraisals.length;
  const completedCount = safeAppraisals.filter((a) => a?.status === 'Completed').length;
  const pendingCount = safeAppraisals.filter((a) => a?.status === 'In Review' || a?.status === 'Submitted').length;
  const returnedCount = safeAppraisals.filter((a) => a?.status === 'Returned' || a?.status === 'Draft').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Determine cadre automatically when selecting employee
  const handleSelectEmployee = (empId: string) => {
    setFormEmpId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return;

    const title = (emp.jobTitle || '').toLowerCase();
    const role = (emp.role || '').toLowerCase();

    if (role === 'facility_head' || title.includes('director') || title.includes('ceo') || title.includes('head of facility')) {
      setFormCadre('facility_head');
    } else if (role === 'dept_head' || title.includes('head of department') || title.includes('hod')) {
      setFormCadre('dept_head');
    } else if (role === 'unit_head' || title.includes('unit head') || title.includes('in-charge')) {
      setFormCadre('unit_head');
    } else if (role === 'doctor' || title.includes('doctor') || title.includes('physician') || title.includes('surgeon')) {
      setFormCadre('medical_doctor');
    } else {
      setFormCadre('general_staff');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setFormDocUrl(reader.result as string);
        setFormDocName(file.name);
        if (!formDocTitle) setFormDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInitiateAppraisal = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === formEmpId) || employees[0];
    if (!emp) return;

    // Build initial stage based on cadre workflow:
    // Medical Doctors: Head of Department -> HR -> Head of Facility
    // Unit Heads: Department Head -> HR -> Head of Facility
    // Department Heads: HR -> Head of Facility
    // Head of Facility: HR
    let initialStage: PerformanceAppraisal['currentStage'] = 'Submitted to Head of Department';
    if (formCadre === 'facility_head') {
      initialStage = 'Submitted to HR Directorate';
    } else if (formCadre === 'dept_head') {
      initialStage = 'Submitted to HR Directorate';
    } else if (formCadre === 'unit_head') {
      initialStage = 'Submitted to Head of Department';
    } else if (formCadre === 'medical_doctor') {
      initialStage = 'Submitted to Head of Department';
    }

    const docItems = formDocUrl
      ? [
          {
            id: `doc-${Date.now()}`,
            title: formDocTitle || 'Signed Appraisal Evaluation Form',
            fileName: formDocName || 'Appraisal_Form.pdf',
            fileUrl: formDocUrl,
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: currentUser?.name || 'Staff Member',
            fileSize: '1.4 MB',
          },
        ]
      : [];

    addPerformanceAppraisal({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeStaffId: emp.empCode || emp.id,
      department: emp.department || 'Clinical Services',
      cadre: formCadre,
      period: formPeriod,
      cycleYear: formCycleYear,
      status: 'In Review',
      currentStage: initialStage,
      overallScore: Number(formScore),
      objectivesMet: formObjectivesMet,
      strengths: formStrengths,
      areasForImprovement: formAreasForImprovement,
      documents: docItems,
      workflowSteps: [
        {
          stageName: 'Appraisal Initiated & Submitted',
          approverRole: 'Staff / Appraisee',
          approverName: currentUser?.name || emp.firstName,
          action: 'Approved',
          comments: 'Self appraisal completed and forwarded to next workflow manager.',
          timestamp: new Date().toLocaleString(),
        },
      ],
      initiatedDate: new Date().toISOString().split('T')[0],
      lastUpdatedDate: new Date().toISOString().split('T')[0],
    });

    setIsInitiateModalOpen(false);
    // Reset form
    setFormEmpId('');
    setFormDocUrl('');
    setFormDocName('');
    setFormDocTitle('');
  };

  const handleProcessAction = () => {
    if (!actionModal) return;
    const { appraisal, action } = actionModal;

    processAppraisalWorkflowStep(
      appraisal.id,
      action,
      actionComment || `${action} by ${currentUser?.name || activeRole}`
    );

    setActionModal(null);
    setActionComment('');
    setSelectedAppraisal(null);
  };

  // Filtered appraisals
  const filteredAppraisals = (performanceAppraisals || []).filter((a) => {
    if (!a) return false;
    // Regular staff can only see their own appraisals unless HR or Facility Head
    if (!isHeadOfFacilityOrHr) {
      const isSelf = a.employeeId === currentUser?.id || (a.employeeName || '').toLowerCase().includes((currentUser?.name || '').toLowerCase());
      const isSameDept = (a.department || '').toLowerCase() === (currentUser?.department || '').toLowerCase();
      // Allow Dept Head / Unit Head to see their department staff
      const isManagerRole = ['dept_head', 'unit_head', 'doctor'].includes(activeRole);
      if (!isSelf && !(isManagerRole && isSameDept)) {
        return false;
      }
    }

    const matchesSearch =
      (a.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.employeeStaffId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesPeriod = periodFilter === 'All' || a.period === periodFilter;
    const matchesCadre = cadreFilter === 'All' || a.cadre === cadreFilter;

    return matchesSearch && matchesStatus && matchesPeriod && matchesCadre;
  });

  const getStageBadge = (stage: PerformanceAppraisal['currentStage']) => {
    switch (stage) {
      case 'Fully Endorsed & Completed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Endorsement by Head of Facility':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Review by HR Directorate':
      case 'Submitted to HR Directorate':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Review by Head of Department':
      case 'Submitted to Head of Department':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Returned for Rectification':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getCadreLabel = (cadre: AppraisalCadre) => {
    switch (cadre) {
      case 'medical_doctor':
        return 'Medical Doctor';
      case 'unit_head':
        return 'Unit Head';
      case 'dept_head':
        return 'Department Head';
      case 'facility_head':
        return 'Head of Facility';
      default:
        return 'General Staff';
    }
  };

  const getCadreWorkflowGuide = (cadre: AppraisalCadre) => {
    switch (cadre) {
      case 'medical_doctor':
        return 'Head of Department → HR Directorate → Head of Facility';
      case 'unit_head':
        return 'Department Head → HR Directorate → Head of Facility';
      case 'dept_head':
        return 'HR Directorate → Head of Facility';
      case 'facility_head':
        return 'HR Directorate Endorsement';
      default:
        return 'Unit/Dept Head → HR Directorate → Head of Facility';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-slate-900/80 p-5 border border-slate-800 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
              <FileCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">Appraisal Records</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 p-5 border border-slate-800 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">In Active Workflow</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
            <span className="text-xs text-amber-300/80">Pending Manager Review</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 p-5 border border-slate-800 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fully Endorsed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400">{completedCount}</span>
            <span className="text-xs text-emerald-300/80">Approved & Archived</span>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/80 p-5 border border-slate-800 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Completion Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
              <BarChart2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-400">{completionRate}%</span>
            <span className="text-xs text-slate-400">Target: 100%</span>
          </div>
        </div>
      </div>

      {/* Cadre Workflow Reference Card */}
      <div className="rounded-2xl bg-slate-900/60 p-4 border border-slate-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Pope John Paul II Medical Centre Multi-Tier Routing Rules:
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
            Aligned with Hospital Leave & Appraisal Workflow
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <strong className="text-emerald-400 block font-bold">1. Medical Doctors:</strong>
            <span className="text-slate-300 text-[11px]">HOD → HR Directorate → Head of Facility</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <strong className="text-indigo-400 block font-bold">2. Unit Heads:</strong>
            <span className="text-slate-300 text-[11px]">Department Head → HR → Head of Facility</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <strong className="text-amber-400 block font-bold">3. Department Heads:</strong>
            <span className="text-slate-300 text-[11px]">HR Directorate → Head of Facility</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <strong className="text-purple-400 block font-bold">4. Head of Facility:</strong>
            <span className="text-slate-300 text-[11px]">HR Directorate</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Action Button */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by staff name, ID, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={cadreFilter}
              onChange={(e) => setCadreFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Cadres</option>
              <option value="medical_doctor">Medical Doctors</option>
              <option value="unit_head">Unit Heads</option>
              <option value="dept_head">Department Heads</option>
              <option value="facility_head">Head of Facility</option>
              <option value="general_staff">General Staff</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="In Review">In Review</option>
              <option value="Completed">Completed</option>
              <option value="Returned">Returned</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsInitiateModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition active:scale-95"
        >
          <Plus className="h-4 w-4" /> Initiate Appraisal Submission
        </button>
      </div>

      {/* Main Table View */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Staff Member & ID</th>
                <th className="p-4">Cadre & Department</th>
                <th className="p-4">Review Cycle</th>
                <th className="p-4">Score & Rating</th>
                <th className="p-4">Current Workflow Stage</th>
                <th className="p-4">Appraisal Docs</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAppraisals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No performance appraisal records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAppraisals.map((appraisal) => {
                  const emp = employees.find((e) => e.id === appraisal.employeeId);
                  const hasDocs = appraisal.documents && appraisal.documents.length > 0;

                  return (
                    <tr key={appraisal.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp?.photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
                            alt={appraisal.employeeName}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white text-sm">{appraisal.employeeName}</p>
                            <span className="font-mono text-[10px] text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                              {appraisal.employeeStaffId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-slate-200 block">{getCadreLabel(appraisal.cadre)}</span>
                        <span className="text-[11px] text-slate-400">{appraisal.department}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-200 block">{appraisal.period}</span>
                        <span className="text-[10px] text-slate-500">Initiated: {appraisal.initiatedDate}</span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold ${
                            appraisal.overallScore >= 80
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : appraisal.overallScore >= 60
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{appraisal.overallScore}%</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStageBadge(appraisal.currentStage)}`}>
                          <Clock className="h-3 w-3" />
                          {appraisal.currentStage}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate">
                          Routing: {getCadreWorkflowGuide(appraisal.cadre)}
                        </p>
                      </td>

                      <td className="p-4">
                        {hasDocs ? (
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                              <Paperclip className="h-3 w-3" /> {appraisal.documents.length} File(s)
                            </span>
                            <a
                              href={appraisal.documents[0].fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700"
                              title="View Document"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">No files attached</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedAppraisal(appraisal)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                          >
                            <Eye className="h-3.5 w-3.5 text-emerald-400" /> View / Endorse
                          </button>

                          {/* Quick Workflow Action if not completed */}
                          {appraisal.status !== 'Completed' && (
                            <button
                              onClick={() => {
                                setActionModal({ appraisal, action: 'Approved' });
                                setActionComment('');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition"
                              title="Advance Workflow to Next Stage"
                            >
                              <Check className="h-3.5 w-3.5" /> Advance
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: INITIATE PERFORMANCE APPRAISAL */}
      {isInitiateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Initiate Performance Appraisal Submission</h3>
                  <p className="text-xs text-slate-400">Hospital Multi-Tier Workflow & Document Attachment</p>
                </div>
              </div>
              <button
                onClick={() => setIsInitiateModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleInitiateAppraisal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Select Staff Member <span className="text-rose-400">*</span>
                  </label>
                  <select
                    required
                    value={formEmpId}
                    onChange={(e) => handleSelectEmployee(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.empCode}) - {emp.jobTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cadre Classification & Workflow Path
                  </label>
                  <select
                    value={formCadre}
                    onChange={(e) => setFormCadre(e.target.value as AppraisalCadre)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="medical_doctor">Medical Doctor (HOD → HR → Head of Facility)</option>
                    <option value="unit_head">Unit Head (Dept Head → HR → Head of Facility)</option>
                    <option value="dept_head">Department Head (HR → Head of Facility)</option>
                    <option value="facility_head">Head of Facility (HR Directorate)</option>
                    <option value="general_staff">General Staff (Unit Head → HR → Head of Facility)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Review Period / Cycle
                  </label>
                  <input
                    type="text"
                    required
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    placeholder="e.g. 2025/2026 Annual Cycle"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Overall Performance Score (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formScore}
                    onChange={(e) => setFormScore(Number(e.target.value))}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-emerald-400 font-bold focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Primary Objectives & Deliverables Met
                </label>
                <textarea
                  rows={2}
                  value={formObjectivesMet}
                  onChange={(e) => setFormObjectivesMet(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Demonstrated Strengths
                  </label>
                  <textarea
                    rows={2}
                    value={formStrengths}
                    onChange={(e) => setFormStrengths(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Areas for Growth & Development Plan
                  </label>
                  <textarea
                    rows={2}
                    value={formAreasForImprovement}
                    onChange={(e) => setFormAreasForImprovement(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Appraisal Document Upload Section */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Paperclip className="h-4 w-4" /> Upload Official Appraisal Document (PDF/Doc/Scan)
                  </span>
                  <span className="text-[10px] text-slate-400">Optional or Required per Cadre</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Document Title</label>
                    <input
                      type="text"
                      value={formDocTitle}
                      onChange={(e) => setFormDocTitle(e.target.value)}
                      placeholder="e.g. Signed Evaluation Form 2026"
                      className="w-full rounded-xl bg-slate-900 border border-slate-800 p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">Select File</label>
                    <label className="cursor-pointer flex items-center justify-between rounded-xl bg-slate-900 border border-slate-800 p-2 text-xs text-slate-300 hover:border-emerald-500 transition">
                      <span className="truncate">{formDocName || 'Browse File...'}</span>
                      <Upload className="h-4 w-4 text-emerald-400 shrink-0" />
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInitiateModalOpen(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formEmpId}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Send className="h-4 w-4" /> Submit to Workflow & Notify Managers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPRAISAL DETAILS & WORKFLOW STEPPER */}
      {selectedAppraisal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {selectedAppraisal.employeeName} ({selectedAppraisal.employeeStaffId})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {getCadreLabel(selectedAppraisal.cadre)} • {selectedAppraisal.department} • Cycle: {selectedAppraisal.period}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppraisal(null)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Overall Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase">Current Workflow Stage</span>
                <span className={`inline-block mt-1 font-bold text-xs px-3 py-1 rounded-full border ${getStageBadge(selectedAppraisal.currentStage)}`}>
                  {selectedAppraisal.currentStage}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Expected Route: {getCadreWorkflowGuide(selectedAppraisal.cadre)}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-400 block font-semibold uppercase">Overall Score</span>
                <span className="text-2xl font-black text-emerald-400">{selectedAppraisal.overallScore}%</span>
                <span className="text-[11px] text-slate-400 block">Performance Grade: Outstanding</span>
              </div>
            </div>

            {/* Appraisal Objectives & Strengths */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-300 block">Objectives & Deliverables</span>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedAppraisal.objectivesMet}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-300 block">Strengths</span>
                <p className="text-xs text-slate-300 leading-relaxed">{selectedAppraisal.strengths}</p>
              </div>
            </div>

            {/* Attached Documents */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Paperclip className="h-4 w-4" /> Attached Official Appraisal Documents
                </span>
                <label className="cursor-pointer px-3 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-600/30 text-xs font-bold transition flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" /> Upload File
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = () => {
                          uploadAppraisalDocument(selectedAppraisal.id, {
                            id: `doc-${Date.now()}`,
                            title: file.name.replace(/\.[^/.]+$/, ''),
                            fileName: file.name,
                            fileUrl: reader.result as string,
                            uploadedAt: new Date().toISOString().split('T')[0],
                            uploadedBy: currentUser?.name || 'Manager',
                            fileSize: '1.2 MB',
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>

              {(!selectedAppraisal.documents || selectedAppraisal.documents.length === 0) ? (
                <p className="text-xs text-slate-500 italic">No documents attached yet.</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {selectedAppraisal.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {doc.fileName} • Uploaded by {doc.uploadedBy} on {doc.uploadedAt}
                          </span>
                        </div>
                      </div>

                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5" /> View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multi-Tier Workflow History Audit Log */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Workflow Progress & Endorsement Trail
              </span>
              <div className="space-y-2">
                {selectedAppraisal.workflowSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800"
                  >
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.action === 'Approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : step.action === 'Returned'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{step.stageName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                      </div>
                      <p className="text-slate-300 mt-0.5">
                        <strong className="text-slate-200">{step.approverName}</strong> ({step.approverRole}) -{' '}
                        <span className={step.action === 'Approved' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {step.action}
                        </span>
                      </p>
                      {step.comments && (
                        <p className="text-[11px] text-slate-400 italic mt-1 bg-slate-900/60 p-2 rounded-lg">
                          "{step.comments}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-4">
              <button
                onClick={() => setSelectedAppraisal(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close View
              </button>

              {selectedAppraisal.status !== 'Completed' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActionModal({ appraisal: selectedAppraisal, action: 'Returned' });
                      setActionComment('');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-amber-600/20 border border-amber-500/30 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-600/30"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Return for Rectification
                  </button>

                  <button
                    onClick={() => {
                      setActionModal({ appraisal: selectedAppraisal, action: 'Approved' });
                      setActionComment('');
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                  >
                    <Check className="h-4 w-4" /> Endorse & Advance Stage
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ACTION CONFIRMATION MODAL (APPROVE / RETURN) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                actionModal.action === 'Approved'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {actionModal.action === 'Approved' ? <CheckCircle2 className="h-5 w-5" /> : <RotateCcw className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {actionModal.action === 'Approved' ? 'Endorse Performance Appraisal' : 'Return Appraisal for Rectification'}
                </h3>
                <p className="text-xs text-slate-400">{actionModal.appraisal.employeeName}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Executive Comments / Review Notes
              </label>
              <textarea
                rows={3}
                required
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Provide evaluation comments, endorsement justification, or return directions..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessAction}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition ${
                  actionModal.action === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Confirm {actionModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
