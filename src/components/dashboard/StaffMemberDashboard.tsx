import React, { useState, useEffect } from 'react';
import {
  User,
  PlaneTakeoff,
  Video,
  GitFork,
  CalendarDays,
  Clock,
  Banknote,
  Receipt,
  GraduationCap,
  TrendingUp,
  Scale,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Building2,
  Stethoscope,
  BellRing,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { SubordinateRequestModal } from '../notifications/SubordinateRequestModal';

export const StaffMemberDashboard: React.FC = () => {
  const {
    currentUser,
    activeRole,
    employees,
    departmentLeadership,
    leaves,
    rosters,
    shiftSwapRequests,
    monthlyUnitRosters,
    expenseClaims,
    attendance,
    courses,
    payrolls,
    conferenceMeetings,
    staffPermissions,
    formatCurrency,
    setActiveTab,
    selectedHospital,
  } = useHrms();

  const [isSubordinateModalOpen, setIsSubordinateModalOpen] = useState(false);

  // Find employee profile
  const emp = (employees || []).find(
    (e) => e && ((e.email && currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase()) || e.id === currentUser?.id)
  ) || (employees || [])[0];

  const empFirstName = emp?.firstName || '';

  // Leadership checks
  const isUnitHead =
    activeRole === 'unit_head' ||
    emp?.role === 'unit_head' ||
    (departmentLeadership || []).some((d) =>
      d && (d.units || []).some(
        (u) =>
          u &&
          (u.unitHeadId === emp?.id ||
          (u.unitHeadEmail && currentUser?.email && u.unitHeadEmail.toLowerCase() === currentUser.email.toLowerCase()))
      )
    );

  const isDeptHead =
    activeRole === 'dept_head' ||
    emp?.role === 'dept_head' ||
    (departmentLeadership || []).some(
      (d) =>
        d &&
        (d.departmentHeadId === emp?.id ||
        (d.departmentHeadEmail && currentUser?.email && d.departmentHeadEmail.toLowerCase() === currentUser.email.toLowerCase()))
    );

  const isLeadership = isUnitHead || isDeptHead || ['hr_director', 'hr_manager', 'facility_head', 'super_admin'].includes(activeRole);

  // Subordinate pending counts
  const pendingLeaves = (leaves || []).filter((l) => l?.status === 'Pending');
  const pendingSwaps = (shiftSwapRequests || []).filter((s) => s?.status === 'Pending_Lead_Approval');
  const pendingRosters = (monthlyUnitRosters || []).filter((r) => r?.status === 'Submitted_To_HOD' || r?.status === 'Pending HR Approval');
  const pendingExpenses = (expenseClaims || []).filter((e) => e?.status === 'Pending');

  const totalSubordinatePending = pendingLeaves.length + pendingSwaps.length + pendingRosters.length + pendingExpenses.length;

  // Auto-Pop Up on Mount if there are pending subordinate requests and not dismissed in session
  useEffect(() => {
    if (isLeadership && totalSubordinatePending > 0) {
      const dismissed = sessionStorage.getItem('dismissed_subordinate_popup_session');
      if (!dismissed) {
        setIsSubordinateModalOpen(true);
      }
    }
  }, [isLeadership, totalSubordinatePending]);

  const handleCloseModal = () => {
    setIsSubordinateModalOpen(false);
    sessionStorage.setItem('dismissed_subordinate_popup_session', 'true');
  };

  // Calculated staff stats
  const myLeaves = (leaves || []).filter((l) => (l?.employeeName || '').toLowerCase().includes(empFirstName.toLowerCase()));
  const approvedLeaves = myLeaves.filter((l) => l?.status === 'Approved');
  const myRosters = (rosters || []).filter((r) => (r?.doctorName || '').toLowerCase().includes(empFirstName.toLowerCase()));
  const todayShift = myRosters[0];
  const myCourses = courses || [];
  const completedCourses = myCourses.filter((c) => c?.status === 'Completed').length;
  const myPayslips = (payrolls || []).filter((p) => (p?.employeeName || '').toLowerCase().includes(empFirstName.toLowerCase()));
  const latestPayslip = myPayslips[0] || (payrolls || [])[0];
  const activeConference = (conferenceMeetings || []).find((m) => m?.status === 'Live' || m?.status === 'Scheduled');

  // Check granted custom permissions by HR
  const userPerm = (staffPermissions || []).find(
    (p) => p && (p.employeeId === emp?.id || (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()))
  );
  const grantedModules = userPerm?.grantedModules || [];

  const staffQuickNav = [
    { id: 'employees', label: 'Staff Profile & Directory', icon: User, desc: 'Personal records & hospital staff' },
    { id: 'leave', label: 'Leave Application', icon: PlaneTakeoff, desc: 'Apply & check leave status' },
    { id: 'conference', label: 'Unit Conference', icon: Video, desc: 'Live video huddles & briefings' },
    { id: 'org_hierarchy', label: 'Organisation Hierarchy', icon: GitFork, desc: 'Department leadership tree' },
    { id: 'shifts', label: 'Shift Roster', icon: CalendarDays, desc: 'View monthly clinical duties' },
    { id: 'attendance', label: 'Individual Attendance', icon: Clock, desc: 'Biometric clocking & logs' },
    { id: 'payroll', label: 'Payslip', icon: Banknote, desc: 'Monthly salary vouchers' },
    { id: 'payroll', label: 'Expense Claim', icon: Receipt, desc: 'Reimbursements & CME claims' },
    { id: 'lms', label: 'LMS & Training', icon: GraduationCap, desc: 'CME credits & clinical courses' },
    { id: 'performance', label: 'Performance Appraisal', icon: TrendingUp, desc: 'Clinical reviews & KPIs' },
    { id: 'grievances', label: 'Grievances & Whistleblower', icon: Scale, desc: 'Protected complaint submission' },
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Staff Portal Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between z-10 relative">
          <div className="flex items-center gap-4">
            <img
              src={emp.photo || currentUser?.avatar}
              alt={emp.firstName}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                  Staff Self-Service Portal
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {emp.empCode}</span>
              </div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white">
                Welcome back, {emp.firstName} {emp.lastName}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Stethoscope className="h-3.5 w-3.5 text-emerald-400" />
                <span>{emp.jobTitle}</span> • <span className="font-semibold text-teal-300">{emp.department}</span> ({selectedHospital.name})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeConference && (
              <button
                onClick={() => setActiveTab('conference')}
                className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 transition"
              >
                <Video className="h-4 w-4 animate-pulse" /> Join Live Conference
              </button>
            )}
            <button
              onClick={() => setActiveTab('leave')}
              className="flex items-center gap-1.5 rounded-2xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 transition"
            >
              <PlaneTakeoff className="h-4 w-4" /> Apply For Leave
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700 transition border border-slate-700"
            >
              <Clock className="h-4 w-4 text-cyan-400" /> Clock In / Out
            </button>
          </div>
        </div>

        {/* Access Status Banner */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Active Security Profile: <strong className="text-emerald-300 capitalize">{activeRole.replace('_', ' ')}</strong></span>
          </div>
          {grantedModules.length > 0 ? (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="font-bold">HR Granted Special Access to {grantedModules.length} Additional Module(s)</span>
            </div>
          ) : (
            <span className="text-slate-400 font-mono text-[11px]">Standard Staff Role Permissions Active</span>
          )}
        </div>
      </div>

      {/* Subordinate Approvals Notification Banner for Unit/Department Heads */}
      {isLeadership && totalSubordinatePending > 0 && (
        <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-950 p-5 shadow-xl text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BellRing className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/30">
                  Leadership Notice: {isUnitHead ? 'Unit Head (HOU)' : isDeptHead ? 'Department Head (HOD)' : 'Management Review'}
                </span>
                <span className="text-[10px] font-mono text-amber-400/80">
                  {totalSubordinatePending} Subordinate Request(s) Awaiting Decision
                </span>
              </div>
              <h3 className="mt-1 text-base font-extrabold text-white">
                Subordinates in your unit/department have submitted requests that require your approval.
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Includes {pendingLeaves.length} leave application(s), {pendingSwaps.length} shift swap proposal(s), and {pendingRosters.length} duty roster(s).
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSubordinateModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-3 text-xs font-black shadow-lg transition shrink-0"
          >
            <BellRing className="h-4 w-4" />
            <span>Review Subordinate Requests ({totalSubordinatePending})</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Staff Key Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Leave Balance */}
        <div
          onClick={() => setActiveTab('leave')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-500 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Leave Entitlement Balance</span>
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <PlaneTakeoff className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">
            {30 - approvedLeaves.reduce((acc, l) => acc + l.totalDays, 0)} <span className="text-xs font-normal text-slate-500">/ 30 Days</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" /> {approvedLeaves.length} Approved Applications
          </p>
        </div>

        {/* Clinical Shift Duty */}
        <div
          onClick={() => setActiveTab('shifts')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-500 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Next Scheduled Shift</span>
            <div className="rounded-xl bg-teal-50 p-2.5 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <CalendarDays className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-lg font-extrabold text-slate-900 dark:text-slate-100 truncate">
            {todayShift ? `${todayShift.shiftType} Shift` : 'Morning Ward Duty'}
          </div>
          <p className="mt-1 text-[11px] text-teal-600 font-semibold">
            {todayShift ? `${todayShift.department} • ${todayShift.shiftDate}` : '08:00 - 16:00 • Main Ward'}
          </p>
        </div>

        {/* LMS & CME Training */}
        <div
          onClick={() => setActiveTab('lms')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-500 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">CME Clinical Training</span>
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-slate-100">
            {completedCourses} <span className="text-xs font-normal text-slate-500">/ {myCourses.length} Modules</span>
          </div>
          <p className="mt-1 text-[11px] text-indigo-600 font-semibold">
            15 CME Credits Earned This Year
          </p>
        </div>

        {/* Recent Payslip */}
        <div
          onClick={() => setActiveTab('payroll')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-500 dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Recent Net Take-Home Salary</span>
            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(latestPayslip?.netPay || 8450)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500 font-semibold">
            Status: <span className="text-emerald-600 font-bold">{latestPayslip?.status || 'Paid'}</span>
          </p>
        </div>
      </div>

      {/* Primary Staff Accessible Information Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              Staff Accessible Healthcare Modules & Services
            </h3>
            <p className="text-xs text-slate-500">
              Access your authorized employee portals, attendance registers, shift rosters, and performance records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {staffQuickNav.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => setActiveTab(item.id)}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HR Granted Custom Permissions Section */}
      {grantedModules.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h4 className="text-sm font-extrabold text-indigo-200">
              Special Administrative Access Granted by HR
            </h4>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Human Resources has authorized your account for special access to the following administrative sections:
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {grantedModules.map((m) => (
              <button
                key={m}
                onClick={() => setActiveTab(m)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
              >
                <CheckCircle className="h-3.5 w-3.5 text-indigo-200" />
                <span className="capitalize">{m.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subordinate Request Pop-up Notification Window */}
      <SubordinateRequestModal
        isOpen={isSubordinateModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};
