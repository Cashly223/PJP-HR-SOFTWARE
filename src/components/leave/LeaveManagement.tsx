import React, { useState, useEffect } from 'react';
import {
  PlaneTakeoff,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Building2,
  Users,
  MessageSquare,
  FileText,
  AlertCircle,
  Check,
  Crown,
  Search,
  Filter,
  Sparkles,
  Printer,
  FileCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { LeaveRequest, WorkflowStage, UserRole } from '../../types/hrms';
import { OfficialLeaveFormViewModal } from './OfficialLeaveFormViewModal';

export const LeaveManagement: React.FC = () => {
  const {
    leaves,
    employees,
    departmentLeadership,
    addLeaveRequest,
    processLeaveWorkflowStep,
    activeRole,
    setActiveRole,
    currentUser,
  } = useHrms();

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  
  // Custom Leave Form Fields (PART A)
  const [staffId, setStaffId] = useState('');
  const [grade, setGrade] = useState('');
  const [unit, setUnit] = useState('');
  const [department, setDepartment] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Annual Leave');
  const [leaveYear, setLeaveYear] = useState<number>(new Date().getFullYear());
  const [leaveEntitlement, setLeaveEntitlement] = useState<number>(30);
  const [deferredLeaveDaysDue, setDeferredLeaveDaysDue] = useState<number>(0);
  const [leaveDaysEarned, setLeaveDaysEarned] = useState<number>(30);
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState('2026-08-20');
  const [endDate, setEndDate] = useState('2026-08-27');
  const [addressOnLeave, setAddressOnLeave] = useState('Hospital Staff Residence Quarters House 14');
  const [phoneOnLeave, setPhoneOnLeave] = useState('+233 20 555 0192');
  const [reason, setReason] = useState('Annual leave application & mandatory rest duration.');

  // Official Form Modal State
  const [officialFormModal, setOfficialFormModal] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
  }>({ open: false, leave: null });

  // Auto populate selected employee info
  useEffect(() => {
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (emp) {
      setStaffId(emp.empCode || 'STF-1001');
      setGrade(emp.jobTitle || 'Clinical Specialist');
      setDepartment(emp.department || 'Intensive Care Unit (ICU)');
      setUnit(emp.unit || 'ICU Ward 2B');
      setPhoneOnLeave(emp.mobilePhone || '+233 20 555 0192');
    }
  }, [selectedEmpId, employees]);

  // Review Modal State for Approvers
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
    action: 'Approve' | 'Reject';
  }>({ open: false, leave: null, action: 'Approve' });

  const [approvalComments, setApprovalComments] = useState('');
  const [customApproverName, setCustomApproverName] = useState('');

  // Filtering
  const [stageFilter, setStageFilter] = useState<'All' | 'MyAction' | WorkflowStage>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Success Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    addLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      staffId: staffId || emp.empCode || 'STF-1001',
      grade: grade || emp.jobTitle || 'Clinical Staff',
      department: department || emp.department,
      unit: unit || emp.unit || 'General Ward',
      leaveType,
      leaveYear: Number(leaveYear),
      leaveEntitlement: Number(leaveEntitlement),
      deferredLeaveDaysDue: Number(deferredLeaveDaysDue),
      leaveDaysEarned: Number(leaveDaysEarned),
      totalDays: Number(days),
      startDate,
      endDate,
      addressOnLeave,
      phoneOnLeave,
      reason,
    });

    showToast(`Submitted Official Leave Application for ${emp.firstName} ${emp.lastName}. Sequential 4-Tier Workflow started at Tier 1 (Unit Head).`);
    setIsNewModalOpen(false);
  };

  const handleOpenReview = (leave: LeaveRequest, action: 'Approve' | 'Reject') => {
    setReviewModal({ open: true, leave, action });
    setApprovalComments(
      action === 'Approve'
        ? `Verified request at ${leave.currentStage || 'Unit Head'} level. Shift coverage and staffing clearance confirmed.`
        : `Request cannot be approved at ${leave.currentStage || 'Unit Head'} stage due to critical shift headcount requirements.`
    );
    setCustomApproverName('');
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.leave) return;

    const currentStage = reviewModal.leave.currentStage || 'Unit Head';
    processLeaveWorkflowStep(
      reviewModal.leave.id,
      reviewModal.action,
      approvalComments,
      customApproverName.trim() || undefined
    );

    if (reviewModal.action === 'Approve') {
      showToast(`Approved Leave Request for ${reviewModal.leave.employeeName} at Tier (${currentStage}). Advanced to next approval tier.`);
    } else {
      showToast(`Rejected Leave Request for ${reviewModal.leave.employeeName} at Tier (${currentStage}).`);
    }

    setReviewModal({ open: false, leave: null, action: 'Approve' });
  };

  // Check if current user role matches current stage of leave request
  const isUserAuthorizedForStage = (stage?: WorkflowStage): boolean => {
    if (!stage) return false;
    if (activeRole === 'super_admin') return true;

    if (stage === 'Unit Head' && activeRole === 'unit_head') return true;
    if (stage === 'Departmental Head' && activeRole === 'dept_head') return true;
    if (stage === 'HR' && (activeRole === 'hr_director' || activeRole === 'hr_manager')) return true;
    if (stage === 'Head of Facility' && activeRole === 'facility_head') return true;

    return false;
  };

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(activeRole);
  const currentEmpName = currentUser?.name || '';
  const currentEmpEmail = currentUser?.email || '';

  // Filter leaves
  const filteredLeaves = leaves.filter((leave) => {
    if (!isHRorAdmin) {
      const isSelf =
        leave.employeeId === currentUser?.id ||
        (currentEmpName && (leave.employeeName || '').toLowerCase().includes(currentEmpName.toLowerCase().split(' ')[0])) ||
        (currentEmpEmail && (leave.employeeName || '').toLowerCase().includes(currentEmpEmail.split('@')[0].toLowerCase()));
      if (!isSelf) return false;
    }

    const currentStage = leave.currentStage || 'Unit Head';
    const isActionRequired = isUserAuthorizedForStage(currentStage) && leave.status === 'Pending';

    if (stageFilter === 'MyAction' && !isActionRequired) return false;
    if (stageFilter !== 'All' && stageFilter !== 'MyAction' && currentStage !== stageFilter) return false;

    if (selectedDeptFilter !== 'All' && leave.department !== selectedDeptFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (leave.employeeName || '').toLowerCase().includes(term);
      const matchDept = (leave.department || '').toLowerCase().includes(term);
      const matchUnit = (leave.unit || '').toLowerCase().includes(term);
      const matchReason = (leave.reason || '').toLowerCase().includes(term);
      if (!matchName && !matchDept && !matchUnit && !matchReason) return false;
    }

    return true;
  });

  // Action required count
  const myActionCount = leaves.filter((l) => isUserAuthorizedForStage(l.currentStage) && l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hospital Multi-Tier Leave Approval Workflow
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Sequential 4-Tier Approval Workflow: <strong className="text-cyan-600 dark:text-cyan-400">1. Unit Head</strong> → <strong className="text-indigo-600 dark:text-indigo-400">2. Departmental Head</strong> → <strong className="text-emerald-600 dark:text-emerald-400">3. HR Manager</strong> → <strong className="text-amber-600 dark:text-amber-400">4. Head of Facility</strong>.
            </p>
          </div>

          {/* Quick Role Switcher for Testing/Demonstrating Workflow */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-amber-500" /> Active Role:
              </span>
              <select
                value={activeRole}
                onChange={(e) => setActiveRole(e.target.value as UserRole)}
                className="bg-white dark:bg-slate-900 font-bold text-emerald-600 dark:text-emerald-400 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="unit_head">Tier 1: Unit Head (HOU)</option>
                <option value="dept_head">Tier 2: Department Head (HOD)</option>
                <option value="hr_director">Tier 3: HR Director</option>
                <option value="hr_manager">Tier 3: HR Manager</option>
                <option value="facility_head">Tier 4: Head of Facility (CMO/CEO)</option>
                <option value="super_admin">Super Admin (All Approvals Override)</option>
                <option value="doctor">Doctor (Staff Member)</option>
                <option value="nurse">Nurse (Staff Member)</option>
              </select>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition active:scale-95"
            >
              <Plus className="h-4 w-4" /> Apply for Staff Leave
            </button>
          </div>
        </div>

        {/* Action Required Banner for logged in role */}
        {myActionCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>
                Attention ({activeRole.replace('_', ' ').toUpperCase()}): You have <strong className="underline">{myActionCount} leave requests</strong> awaiting your Tier sign-off!
              </span>
            </div>
            <button
              onClick={() => setStageFilter('MyAction')}
              className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 transition"
            >
              View My Pending Actions ({myActionCount})
            </button>
          </div>
        )}
      </div>

      {/* Workflow Stage Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setStageFilter('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'All'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            All Requests ({leaves.length})
          </button>

          <button
            onClick={() => setStageFilter('MyAction')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              stageFilter === 'MyAction'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Pending My Approval ({myActionCount})
          </button>

          <button
            onClick={() => setStageFilter('Unit Head')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Unit Head'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100'
            }`}
          >
            Tier 1: Unit Head
          </button>

          <button
            onClick={() => setStageFilter('Departmental Head')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Departmental Head'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            Tier 2: Dept Head
          </button>

          <button
            onClick={() => setStageFilter('HR')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'HR'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Tier 3: HR
          </button>

          <button
            onClick={() => setStageFilter('Head of Facility')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Head of Facility'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Tier 4: Head of Facility
          </button>

          <button
            onClick={() => setStageFilter('Fully Approved')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Fully Approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Fully Approved
          </button>

          <button
            onClick={() => setStageFilter('Rejected')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Rejected'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff, reason, unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Leave Request Cards with 4-Tier Workflow Visual Stepper */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <PlaneTakeoff className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No Leave Requests Found</h3>
            <p className="mt-1 text-xs text-slate-500">No leave applications match the selected workflow filter criteria.</p>
          </div>
        ) : (
          filteredLeaves.map((leave) => {
            const currentStage = leave.currentStage || 'Unit Head';
            const wf = leave.workflow;
            const canUserApproveThis = isUserAuthorizedForStage(currentStage) && leave.status === 'Pending';

            return (
              <div
                key={leave.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 hover:border-emerald-500/50 transition"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                      {leave.leaveType}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {leave.employeeName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">• {leave.totalDays} Days</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.department}</span>
                        <span>({leave.unit || 'General Unit'})</span>
                        <span>• Applied: {leave.appliedOn || leave.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Status Badge & View Official Form Button */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOfficialFormModal({ open: true, leave })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                      title="View or Print Official 4-Part HR Leave Form"
                    >
                      <FileText className="h-3.5 w-3.5 text-amber-500" />
                      View Official Form
                    </button>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : leave.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}
                    >
                      {leave.status === 'Pending' ? `Workflow Stage: ${currentStage}` : leave.status}
                    </span>

                    {/* Action buttons if user is authorized at current stage */}
                    {canUserApproveThis && (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleOpenReview(leave, 'Approve')}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition flex items-center gap-1 active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve at {currentStage}
                        </button>

                        <button
                          onClick={() => handleOpenReview(leave, 'Reject')}
                          className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition flex items-center gap-1 active:scale-95"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason & Leave Dates */}
                <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400">Reason for Application: </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{leave.reason}</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    📅 {leave.startDate} to {leave.endDate}
                  </div>
                </div>

                {/* VISUAL 4-TIER WORKFLOW STEPPER */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>4-Tier Sequential Approval Progress</span>
                    {canUserApproveThis ? (
                      <span className="text-emerald-500 font-extrabold animate-pulse">
                        ★ YOUR ROLE ({activeRole.toUpperCase()}) CAN SIGN OFF NOW
                      </span>
                    ) : leave.status === 'Pending' ? (
                      <span className="text-slate-400">
                        Waiting for: <strong>{currentStage}</strong> review
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {/* Step 1: Unit Head */}
                    <WorkflowStepCard
                      stepNumber={1}
                      title="Unit Head"
                      step={wf?.unitHeadStep}
                      isCurrent={currentStage === 'Unit Head' && leave.status === 'Pending'}
                      color="cyan"
                    />

                    {/* Step 2: Departmental Head */}
                    <WorkflowStepCard
                      stepNumber={2}
                      title="Department Head"
                      step={wf?.departmentHeadStep}
                      isCurrent={currentStage === 'Departmental Head' && leave.status === 'Pending'}
                      color="indigo"
                    />

                    {/* Step 3: HR Manager */}
                    <WorkflowStepCard
                      stepNumber={3}
                      title="Human Resources"
                      step={wf?.hrStep}
                      isCurrent={currentStage === 'HR' && leave.status === 'Pending'}
                      color="emerald"
                    />

                    {/* Step 4: Head of Facility */}
                    <WorkflowStepCard
                      stepNumber={4}
                      title="Head of Facility"
                      step={wf?.facilityHeadStep}
                      isCurrent={currentStage === 'Head of Facility' && leave.status === 'Pending'}
                      color="amber"
                    />
                  </div>
                </div>

                {/* Rejection notice if rejected */}
                {leave.status === 'Rejected' && wf?.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                    <strong className="font-extrabold block">❌ Rejection Notes ({wf.rejectedByRole}):</strong>
                    <span>{wf.rejectionReason} — Reviewed by {wf.rejectedByName || 'Authorized Officer'}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Review & Sign-off Modal */}
      {reviewModal.open && reviewModal.leave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                {reviewModal.action === 'Approve' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
                {reviewModal.action} Leave Request (Tier: {reviewModal.leave.currentStage || 'Unit Head'})
              </h3>
              <button
                onClick={() => setReviewModal({ open: false, leave: null, action: 'Approve' })}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 mb-4 text-xs space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">Staff Member:</span>{' '}
                <strong className="text-slate-800 dark:text-slate-200">{reviewModal.leave.employeeName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Leave Type & Duration:</span>{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {reviewModal.leave.leaveType} ({reviewModal.leave.totalDays} Days)
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Department / Unit:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300">
                  {reviewModal.leave.department} ({reviewModal.leave.unit || 'General Unit'})
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Authorized Reviewer Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins (Leave Committee / HOD)"
                  value={customApproverName}
                  onChange={(e) => setCustomApproverName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Approval Notes & Operational Comments
                </label>
                <textarea
                  rows={3}
                  required
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, leave: null, action: 'Approve' })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-5 py-2 font-bold text-white shadow ${
                    reviewModal.action === 'Approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {reviewModal.action}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customized New Leave Application Modal (PART A) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Staff Leave Application Form (PART A)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill in Part A details. Submitting initiates the sequential 4-Tier Approval Workflow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              {/* Applicant Particulars Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="font-extrabold text-amber-600 dark:text-amber-400 uppercase text-[11px] tracking-wider">
                  APPLICANT PARTICULARS
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">NAME</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">STAFF ID</label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">GRADE / TITLE</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">PRESENT UNIT / DEPT</label>
                    <input
                      type="text"
                      value={unit ? `${unit} (${department})` : department}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">TYPE OF LEAVE APPLIED FOR</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick / Medical">Sick / Medical</option>
                    <option value="Study / CME">Study / CME Conference</option>
                    <option value="Hazard / Emergency">Hazard / Emergency</option>
                    <option value="Maternity">Maternity</option>
                    <option value="Paternity">Paternity</option>
                  </select>
                </div>
              </div>

              {/* PART A (APPLICATION DATA) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase text-[11px] tracking-wider">
                  PART A — LEAVE APPLICATION DETAILS
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]">LEAVE YEAR</label>
                    <input
                      type="number"
                      value={leaveYear}
                      onChange={(e) => setLeaveYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">ENTITLEMENT (DAYS)</label>
                    <input
                      type="number"
                      value={leaveEntitlement}
                      onChange={(e) => setLeaveEntitlement(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">DEFERRED DAYS DUE</label>
                    <input
                      type="number"
                      value={deferredLeaveDaysDue}
                      onChange={(e) => setDeferredLeaveDaysDue(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">LEAVE DAYS EARNED</label>
                    <input
                      type="number"
                      value={leaveDaysEarned}
                      onChange={(e) => setLeaveDaysEarned(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]">PROPOSED COMMENCEMENT DATE</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">PROPOSED END DATE</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">NUMBER OF DAYS APPLIED FOR</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]">ADDRESS ON LEAVE</label>
                    <input
                      type="text"
                      value={addressOnLeave}
                      onChange={(e) => setAddressOnLeave(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">TELEPHONE NO.</label>
                    <input
                      type="text"
                      value={phoneOnLeave}
                      onChange={(e) => setPhoneOnLeave(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[10px]">REASON / PURPOSE FOR LEAVE</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                  ></textarea>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 italic">
                NB: Leave application must comply with proposed date and submitted at least 7 working days prior to start date.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500 flex items-center gap-1.5"
                >
                  <FileCheck className="h-4 w-4" /> Submit Application (Part A)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official 4-Part Leave Application Document View Modal */}
      <OfficialLeaveFormViewModal
        isOpen={officialFormModal.open}
        onClose={() => setOfficialFormModal({ open: false, leave: null })}
        leave={officialFormModal.leave}
        hospitalName="POPE JOHN PAUL II MEDICAL CENTRE"
      />
    </div>
  );
};

// Subcomponent for Workflow Step Node Card
const WorkflowStepCard: React.FC<{
  stepNumber: number;
  title: string;
  step?: any;
  isCurrent: boolean;
  color: 'cyan' | 'indigo' | 'emerald' | 'amber';
}> = ({ stepNumber, title, step, isCurrent }) => {
  const isApproved = step?.status === 'Approved';
  const isRejected = step?.status === 'Rejected';

  return (
    <div
      className={`p-3 rounded-xl border transition text-xs ${
        isApproved
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          : isRejected
          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
          : isCurrent
          ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30'
          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase">TIER {stepNumber}</span>
        {isApproved ? (
          <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        ) : isRejected ? (
          <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 text-[10px]">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </span>
        ) : isCurrent ? (
          <span className="font-extrabold text-amber-600 dark:text-amber-400 text-[10px] animate-pulse">
            ● Active Pending Review
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Upcoming</span>
        )}
      </div>

      <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{title}</div>

      {isApproved && (
        <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
          <div className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
            ✓ {step.approverName || 'Authorized Officer'}
          </div>
          {step.approvedAt && (
            <div className="text-[9px] text-slate-400">{new Date(step.approvedAt).toLocaleDateString()}</div>
          )}
        </div>
      )}
    </div>
  );
};
