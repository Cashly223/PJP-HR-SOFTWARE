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
import { AnnualUnitLeaveRoasterManager } from './AnnualUnitLeaveRoasterManager';
import { CalendarDays } from 'lucide-react';
import { calculateLeaveDays, calculateEndDateFromDays, isMaternityLeave, formatLeaveDaysText } from '../../lib/leaveUtils';

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
    updateEmployee,
  } = useHrms();

  const [activeTabMode, setActiveTabMode] = useState<'applications' | 'entitlements' | 'report' | 'annual_roaster'>('applications');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState('All');
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  const [isReportPrintModalOpen, setIsReportPrintModalOpen] = useState(false);
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
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [addressOnLeave, setAddressOnLeave] = useState('Hospital Staff Residence Quarters House 14');
  const [phoneOnLeave, setPhoneOnLeave] = useState('+233 20 555 0192');
  const [reason, setReason] = useState('Annual leave application & mandatory rest duration.');

  // Official Form Modal State
  const [officialFormModal, setOfficialFormModal] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
  }>({ open: false, leave: null });

  // Computed Outstanding Days
  const [outstandingLeaveDays, setOutstandingLeaveDays] = useState<number>(30);
  const [totalUsedLeaveDays, setTotalUsedLeaveDays] = useState<number>(0);

  // Entitlements Management Modal
  const [entitlementEditModal, setEntitlementEditModal] = useState<{
    open: boolean;
    emp: any | null;
  }>({ open: false, emp: null });
  const [editEntitlementVal, setEditEntitlementVal] = useState(30);
  const [editDeferredVal, setEditDeferredVal] = useState(0);

  // Auto populate selected employee info & dynamic outstanding leave days from staff DB
  useEffect(() => {
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (emp) {
      setStaffId(emp.empCode || 'STF-1001');
      setGrade(emp.jobTitle || 'Clinical Specialist');
      setDepartment(emp.department || 'Intensive Care Unit (ICU)');
      setUnit(emp.unit || 'ICU Ward 2B');
      setPhoneOnLeave(emp.mobilePhone || '+233 20 555 0192');

      const empEnt = emp.leaveEntitlement ?? 30;
      const empDef = emp.deferredLeaveDays ?? 0;
      setLeaveEntitlement(empEnt);
      setDeferredLeaveDaysDue(empDef);
      setLeaveDaysEarned(empEnt);

      // Compute total approved days taken by this employee from DB
      const approvedLeaves = leaves.filter(
        (l) => l.employeeId === emp.id && l.status === 'Approved'
      );
      const used = approvedLeaves.reduce((acc, l) => acc + (l.daysGranted || l.totalDays || 0), 0);
      setTotalUsedLeaveDays(used);
      setOutstandingLeaveDays(Math.max(0, (empEnt + empDef) - used));
    }
  }, [selectedEmpId, employees, leaves]);

  // Automatic Calculation of days using Working Days (except Maternity Leave which uses Calendar Days)
  useEffect(() => {
    if (startDate && endDate) {
      const computedDays = calculateLeaveDays(startDate, endDate, leaveType);
      if (computedDays > 0) {
        setDays(computedDays);
      }
    }
  }, [startDate, endDate, leaveType]);

  // When user updates days count directly, adjust end date automatically based on working days or maternity calendar days
  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    if (startDate && newDays > 0) {
      const computedEnd = calculateEndDateFromDays(startDate, newDays, leaveType);
      setEndDate(computedEnd);
    }
  };

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

  const handleExportStaffLeaveReportCSV = () => {
    const headers = [
      'Staff ID',
      'Staff Name',
      'Department',
      'Role Title',
      'Annual Entitlement Days',
      'Deferred Days',
      'Total Net Entitlement',
      'Approved Days Taken',
      'Pending Days Requested',
      'Outstanding Days Balance',
      'Utilization Rate (%)',
      'Status'
    ];

    const rows = employees.map((emp) => {
      const annual = emp.leaveEntitlement || 30;
      const def = emp.deferredLeaveDays || 0;
      const tot = annual + def;
      const appLeaves = leaves.filter((l) => l.employeeId === emp.id && l.status === 'Approved');
      const taken = appLeaves.reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0);
      const pendLeaves = leaves.filter((l) => l.employeeId === emp.id && l.status === 'Pending');
      const pend = pendLeaves.reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0);
      const rem = tot - taken;
      const util = tot > 0 ? Math.min(100, Math.round((taken / tot) * 100)) : 0;
      const isOnLeave = leaves.some((l) => l.employeeId === emp.id && l.status === 'Approved');

      return [
        `"${emp.empCode || 'STF-100'}"`,
        `"${emp.firstName} ${emp.lastName}"`,
        `"${emp.department}"`,
        `"${emp.jobTitle}"`,
        annual,
        def,
        tot,
        taken,
        pend,
        rem,
        `"${util}%"`,
        `"${isOnLeave ? 'On Active Leave' : 'On Duty'}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"POPE JOHN PAUL II MEDICAL CENTRE (PJPIIMC) - OFFICIAL STAFF LEAVE REPORT"\n` +
      `"Report Date: ${new Date().toLocaleDateString()}"\n` +
      `"Generated By: Human Resources Division"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PJPIIMC_Staff_Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      outstandingLeaveDays: Number(outstandingLeaveDays),
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

          {/* Active Assigned Role Badge (Solely Determined by HR) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-amber-500" /> Assigned HR Role:
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 capitalize">
                {activeRole.replace('_', ' ')}
              </span>
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

        {/* Header Mode Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-4">
          <button
            onClick={() => setActiveTabMode('applications')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeTabMode === 'applications'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <PlaneTakeoff className="h-4 w-4" /> Official Leave Applications & Workflow
          </button>
          <button
            onClick={() => setActiveTabMode('entitlements')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeTabMode === 'entitlements'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-amber-400" /> Setup Employee Leave Entitlements
          </button>
          <button
            onClick={() => setActiveTabMode('report')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeTabMode === 'report'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="h-4 w-4 text-purple-300" /> HR Staff Leave Report
          </button>
          <button
            onClick={() => setActiveTabMode('annual_roaster')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 ${
              activeTabMode === 'annual_roaster'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CalendarDays className="h-4 w-4 text-teal-300" /> Annual Unit Leave Roaster (2027)
          </button>
        </div>
      </div>

      {/* MODE 4: ANNUAL UNIT LEAVE ROASTER TAB */}
      {activeTabMode === 'annual_roaster' && (
        <AnnualUnitLeaveRoasterManager />
      )}

      {/* MODE 3: HR STAFF LEAVE REPORT TAB */}
      {activeTabMode === 'report' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          {/* Report Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 block">
                Human Resources Audit & Leave Liabilities
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                PJPIIMC Staff Leave Master Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pope John Paul II Medical Centre - Comprehensive staff leave breakdown, entitlement tracking, approved leave utilization, and remaining balances.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportStaffLeaveReportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
              >
                <FileText className="h-4 w-4 text-emerald-500" /> Export CSV Report
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow"
              >
                <Printer className="h-4 w-4" /> Print Official Report
              </button>
            </div>
          </div>

          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Staff</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{employees.length}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Active workforce</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Gross Entitlement</span>
              <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                {employees.reduce((acc, e) => acc + (e.leaveEntitlement || 30) + (e.deferredLeaveDays || 0), 0)}
              </div>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400/80 mt-0.5">Annual + Deferred days</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Days Taken (Approved)</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {leaves.filter((l) => l.status === 'Approved').reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0)}
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Utilized leave days</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Pending Approval</span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {leaves.filter((l) => l.status === 'Pending').reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0)}
              </div>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">In workflow pipeline</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Net Liability Days</span>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                {employees.reduce((acc, e) => {
                  const tot = (e.leaveEntitlement || 30) + (e.deferredLeaveDays || 0);
                  const taken = leaves.filter((l) => l.employeeId === e.id && l.status === 'Approved').reduce((a, l) => a + (l.daysGranted || l.totalDays || (l as any).days || 0), 0);
                  return acc + (tot - taken);
                }, 0)}
              </div>
              <p className="text-[10px] text-purple-600 dark:text-purple-400/80 mt-0.5">Outstanding staff balance</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, code, or role..."
                value={reportSearchTerm}
                onChange={(e) => setReportSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportDeptFilter}
                onChange={(e) => setReportDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Intensive Care Unit (ICU)">ICU & Critical Care</option>
                <option value="Cardiology & Intensive Care">Cardiology</option>
                <option value="Emergency & Trauma">Emergency & Trauma</option>
                <option value="Surgical Services & OT">Surgical Services</option>
                <option value="Human Resources & Workforce">Human Resources</option>
              </select>

              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="OnLeave">Currently On Leave</option>
                <option value="HighLiability">High Balance (&gt;25 Days)</option>
              </select>
            </div>
          </div>

          {/* Staff Leave Report Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">Department & Role</th>
                  <th className="px-4 py-3.5 text-center">Annual</th>
                  <th className="px-4 py-3.5 text-center">Deferred</th>
                  <th className="px-4 py-3.5 text-center">Net Total</th>
                  <th className="px-4 py-3.5 text-center">Days Taken</th>
                  <th className="px-4 py-3.5 text-center">Outstanding</th>
                  <th className="px-4 py-3.5">Utilization Bar</th>
                  <th className="px-4 py-3.5 text-center">Leave Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {employees
                  .filter((emp) => {
                    const matchesSearch =
                      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                      (emp.empCode || '').toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                      (emp.jobTitle || '').toLowerCase().includes(reportSearchTerm.toLowerCase());

                    const matchesDept = reportDeptFilter === 'All' || emp.department === reportDeptFilter;

                    const annual = emp.leaveEntitlement || 30;
                    const def = emp.deferredLeaveDays || 0;
                    const tot = annual + def;
                    const appLeaves = leaves.filter((l) => l.employeeId === emp.id && l.status === 'Approved');
                    const taken = appLeaves.reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0);
                    const rem = tot - taken;
                    const isOnLeave = leaves.some((l) => l.employeeId === emp.id && l.status === 'Approved');

                    let matchesStatus = true;
                    if (reportStatusFilter === 'OnLeave') matchesStatus = isOnLeave;
                    if (reportStatusFilter === 'HighLiability') matchesStatus = rem > 25;

                    return matchesSearch && matchesDept && matchesStatus;
                  })
                  .map((emp) => {
                    const annual = emp.leaveEntitlement || 30;
                    const def = emp.deferredLeaveDays || 0;
                    const tot = annual + def;
                    const appLeaves = leaves.filter((l) => l.employeeId === emp.id && l.status === 'Approved');
                    const taken = appLeaves.reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0);
                    const rem = tot - taken;
                    const util = tot > 0 ? Math.min(100, Math.round((taken / tot) * 100)) : 0;
                    const isOnLeave = leaves.some((l) => l.employeeId === emp.id && l.status === 'Approved');

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
                              alt={emp.firstName}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                                {emp.empCode || 'STF-1001'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{emp.department}</p>
                          <p className="text-[10px] text-slate-500">{emp.jobTitle}</p>
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {annual}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-amber-500">
                          {def}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                          {tot}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {taken}
                        </td>

                        <td className="px-4 py-3.5 text-center font-extrabold text-purple-600 dark:text-purple-400">
                          {rem}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="w-28 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>{util}%</span>
                              <span className="text-slate-400">{taken}/{tot}d</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${
                                  util > 75
                                    ? 'bg-rose-500'
                                    : util > 40
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${util}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          {isOnLeave ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              On Leave
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              On Duty
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 2: EMPLOYEE LEAVE ENTITLEMENT SETUP TAB */}
      {activeTabMode === 'entitlements' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-500" />
                Staff Database Leave Entitlement Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure annual leave entitlement days and deferred carried-over leave per staff member in the staff database.
              </p>
            </div>

            <button
              onClick={() => {
                employees.forEach((emp) => {
                  updateEmployee(emp.id, { leaveEntitlement: 30, deferredLeaveDays: 0 });
                });
                showToast('Reset default 30-day Annual Leave Entitlement for all active staff members.');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Apply Default 30 Days to All Staff
            </button>
          </div>

          {/* Entitlements Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-extrabold tracking-wider text-slate-500">
                <tr>
                  <th className="p-3 rounded-l-xl">Staff Member</th>
                  <th className="p-3">Staff ID & Dept</th>
                  <th className="p-3">Annual Entitlement</th>
                  <th className="p-3">Deferred Days</th>
                  <th className="p-3">Total Used</th>
                  <th className="p-3">Outstanding Balance</th>
                  <th className="p-3 rounded-r-xl text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => {
                  const ent = emp.leaveEntitlement ?? 30;
                  const def = emp.deferredLeaveDays ?? 0;
                  const approvedLeaves = leaves.filter((l) => l.employeeId === emp.id && l.status === 'Approved');
                  const used = approvedLeaves.reduce((acc, l) => acc + (l.daysGranted || l.totalDays || 0), 0);
                  const outstanding = Math.max(0, (ent + def) - used);

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                      <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        <img src={emp.photo} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                        <div>
                          <div>{emp.firstName} {emp.lastName}</div>
                          <div className="text-[10px] font-normal text-slate-400">{emp.jobTitle}</div>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-medium">
                        <div className="text-slate-700 dark:text-slate-300 font-bold">{emp.empCode || 'STF-1001'}</div>
                        <div className="text-[10px] text-slate-400">{emp.department}</div>
                      </td>
                      <td className="p-3 font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                        {ent} Days
                      </td>
                      <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                        {def} Days
                      </td>
                      <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                        {used} Days
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                          {outstanding} Days
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setEntitlementEditModal({ open: true, emp });
                            setEditEntitlementVal(ent);
                            setEditDeferredVal(def);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition border border-indigo-200 dark:border-indigo-800"
                        >
                          Edit Entitlement
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Employee Entitlement Modal */}
      {entitlementEditModal.open && entitlementEditModal.emp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  Setup Leave Entitlement
                </h3>
                <p className="text-xs text-slate-500">
                  {entitlementEditModal.emp.firstName} {entitlementEditModal.emp.lastName} ({entitlementEditModal.emp.empCode})
                </p>
              </div>
              <button onClick={() => setEntitlementEditModal({ open: false, emp: null })}>✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Annual Leave Entitlement (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={editEntitlementVal}
                  onChange={(e) => setEditEntitlementVal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Deferred / Carried-Over Leave Days</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={editDeferredVal}
                  onChange={(e) => setEditDeferredVal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-amber-500 text-sm"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                Net Annual Entitlement Total: <strong className="text-emerald-600 dark:text-emerald-400">{editEntitlementVal + editDeferredVal} Days</strong>. This updates the staff database record dynamically.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntitlementEditModal({ open: false, emp: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateEmployee(entitlementEditModal.emp.id, {
                    leaveEntitlement: editEntitlementVal,
                    deferredLeaveDays: editDeferredVal,
                  });
                  showToast(`Updated leave entitlement for ${entitlementEditModal.emp.firstName} ${entitlementEditModal.emp.lastName} to ${editEntitlementVal} days.`);
                  setEntitlementEditModal({ open: false, emp: null });
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow"
              >
                Save Entitlement
              </button>
            </div>
          </div>
        </div>
      )}

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
                        <span className="text-xs text-slate-500 dark:text-slate-400">• {formatLeaveDaysText(leave.totalDays, leave.leaveType)}</span>
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
                    onChange={(e) => {
                      const selectedType = e.target.value as any;
                      setLeaveType(selectedType);
                      if (isMaternityLeave(selectedType)) {
                        setLeaveEntitlement(90);
                        setDays(90);
                        if (startDate) {
                          const computedEnd = calculateEndDateFromDays(startDate, 90, selectedType);
                          setEndDate(computedEnd);
                        }
                      } else if (isMaternityLeave(leaveType)) {
                        setLeaveEntitlement(30);
                        setDays(30);
                        if (startDate) {
                          const computedEnd = calculateEndDateFromDays(startDate, 30, selectedType);
                          setEndDate(computedEnd);
                        }
                      }
                    }}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-2">
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase text-[11px] tracking-wider">
                    PART A — LEAVE APPLICATION DETAILS
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                    📊 Outstanding Leave Balance: {outstandingLeaveDays} Days
                  </div>
                </div>

                {/* Staff Database Live Balance Badge */}
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                  <span>
                    Staff DB Record: Annual Entitlement ({leaveEntitlement}d) + Deferred ({deferredLeaveDaysDue}d) - Approved Taken ({totalUsedLeaveDays}d)
                  </span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                    {outstandingLeaveDays} Days Outstanding
                  </strong>
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
                    <label className="block font-bold mb-1 text-[10px]">OUTSTANDING DAYS</label>
                    <input
                      type="number"
                      readOnly
                      value={outstandingLeaveDays}
                      className="w-full rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-400 font-extrabold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]">COMMENCEMENT DATE</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">RESUMPTION / RETURN DATE</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">CALCULATED DURATION (DAYS)</label>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={days}
                      onChange={(e) => handleDaysChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-emerald-500/50 bg-emerald-50/50 dark:bg-slate-800 p-2 font-black text-emerald-600 dark:text-emerald-400 text-sm"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>
                      Auto-Calculated Duration: <strong>{days} Day{days !== 1 ? 's' : ''}</strong>
                      {isMaternityLeave(leaveType) ? (
                        <span className="ml-2 text-[10px] text-purple-600 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded font-extrabold border border-purple-500/30">
                          Maternity Leave: Calendar Days (Mon–Sun)
                        </span>
                      ) : (
                        <span className="ml-2 text-[10px] text-emerald-600 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded font-extrabold border border-emerald-500/30">
                          Working Days Only (Excl. Weekends)
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] opacity-80 font-mono">{startDate} to {endDate}</span>
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
