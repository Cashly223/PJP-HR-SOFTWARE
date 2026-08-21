import React, { useState, useEffect } from 'react';
import {
  BellRing,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  PlaneTakeoff,
  CalendarDays,
  FileSpreadsheet,
  Receipt,
  Building2,
  ChevronRight,
  Sparkles,
  X,
  MessageSquare,
  ShieldAlert,
  ArrowUpRight,
  Stethoscope,
  Trash2,
  BellOff,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { LeaveRequest, ShiftSwapRequest, DepartmentMonthlyRoster, ExpenseClaim } from '../../types/hrms';

interface SubordinateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubordinateRequestModal: React.FC<SubordinateRequestModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    activeRole,
    employees,
    departmentLeadership,
    leaves,
    processLeaveWorkflowStep,
    shiftSwapRequests,
    updateShiftSwapStatus,
    monthlyUnitRosters,
    updateMonthlyUnitRosterStatus,
    expenseClaims,
    updateExpenseClaimStatus,
    setActiveTab,
    showToast,
  } = useHrms();

  const [activeFilter, setActiveFilter] = useState<'all' | 'leave' | 'swap' | 'roster' | 'expense'>('all');
  const [dismissedItemIds, setDismissedItemIds] = useState<string[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Identify logged in employee profile
  const emp = employees.find(
    (e) => (e.email && currentUser?.email && e.email.toLowerCase() === currentUser.email.toLowerCase()) || e.id === currentUser?.id
  );

  const isUnitHead =
    activeRole === 'unit_head' ||
    emp?.role === 'unit_head' ||
    departmentLeadership.some((d) =>
      d.units.some(
        (u) =>
          u.unitHeadId === emp?.id ||
          (u.unitHeadEmail && currentUser?.email && u.unitHeadEmail.toLowerCase() === currentUser.email.toLowerCase())
      )
    );

  const isDeptHead =
    activeRole === 'dept_head' ||
    emp?.role === 'dept_head' ||
    departmentLeadership.some(
      (d) =>
        d.departmentHeadId === emp?.id ||
        (d.departmentHeadEmail && currentUser?.email && d.departmentHeadEmail.toLowerCase() === currentUser.email.toLowerCase())
    );

  const isHR = activeRole === 'hr_director' || activeRole === 'hr_manager';
  const isFacilityHead = activeRole === 'facility_head' || activeRole === 'super_admin';

  const userDept = emp?.department;
  const userUnit = emp?.unit;

  // 1. Pending Leaves
  const pendingLeaves = (leaves || []).filter((l) => {
    if (!l || l.status !== 'Pending') return false;

    if (l.currentStage === 'Unit Head') {
      if (activeRole === 'unit_head' || isUnitHead) {
        return !userDept || l.department === userDept;
      }
      return false;
    }

    if (l.currentStage === 'Departmental Head') {
      if (activeRole === 'dept_head' || isDeptHead) {
        return !userDept || l.department === userDept;
      }
      return false;
    }

    if (l.currentStage === 'HR') {
      return isHR;
    }

    if (l.currentStage === 'Head of Facility') {
      return isFacilityHead;
    }

    return false;
  });

  // 2. Pending Shift Swaps
  const pendingSwaps = (shiftSwapRequests || []).filter((s) => {
    if (!s || s.status !== 'Pending_Lead_Approval') return false;
    if (isUnitHead || isDeptHead || activeRole === 'unit_head' || activeRole === 'dept_head') {
      return !userDept || s.department === userDept;
    }
    return isHR || isFacilityHead;
  });

  // 3. Pending Duty Rosters
  const pendingRosters = (monthlyUnitRosters || []).filter((r) => {
    if (!r) return false;
    if (r.status === 'Submitted_To_HOD') {
      return isDeptHead || activeRole === 'dept_head' ? (!userDept || r.department === userDept) : false;
    }
    if (r.status === 'Pending HR Approval') {
      return isHR || isFacilityHead;
    }
    return false;
  });

  // 4. Pending Expense Claims
  const pendingExpenses = (expenseClaims || []).filter((e) => {
    if (!e || e.status !== 'Pending') return false;
    if (isUnitHead || isDeptHead) {
      return !userDept || e.department === userDept;
    }
    return isHR || isFacilityHead;
  });

  // Combined Items
  interface UnifiedRequestItem {
    id: string;
    type: 'leave' | 'swap' | 'roster' | 'expense';
    title: string;
    subordinateName: string;
    subordinateCode?: string;
    subordinateDept?: string;
    subordinateUnit?: string;
    subordinatePhoto?: string;
    dateSubmitted: string;
    stageLabel: string;
    details: string;
    rawItem: any;
  }

  const unifiedList: UnifiedRequestItem[] = [];

  pendingLeaves.forEach((l) => {
    const requester = employees.find((e) => e.id === l.employeeId || e.empCode === l.staffId);
    unifiedList.push({
      id: l.id,
      type: 'leave',
      title: `${l.leaveType} (${l.totalDays} Day${l.totalDays > 1 ? 's' : ''})`,
      subordinateName: l.employeeName || (requester ? `${requester.firstName} ${requester.lastName}` : 'Staff Member'),
      subordinateCode: l.staffId || requester?.empCode,
      subordinateDept: l.department,
      subordinateUnit: l.unit,
      subordinatePhoto: requester?.photo,
      dateSubmitted: l.appliedOn || l.startDate,
      stageLabel: `Leave Request — Awaiting ${l.currentStage} Signature`,
      details: `Period: ${l.startDate} to ${l.endDate} | Reason: ${l.reason || 'Medical / Personal Leave'}`,
      rawItem: l,
    });
  });

  pendingSwaps.forEach((s) => {
    unifiedList.push({
      id: s.id,
      type: 'swap',
      title: `Shift Swap Proposal (${s.requesterShiftType} ↔ ${s.targetShiftType})`,
      subordinateName: `${s.requesterName} with ${s.targetEmployeeName}`,
      subordinateDept: s.department,
      subordinatePhoto: s.requesterPhoto,
      dateSubmitted: s.dateRequested,
      stageLabel: 'Shift Swap — Awaiting Lead Approval',
      details: `Original Date: ${s.requesterShiftDate} | Target Date: ${s.targetShiftDate} | Reason: ${s.reason}`,
      rawItem: s,
    });
  });

  pendingRosters.forEach((r) => {
    unifiedList.push({
      id: r.id,
      type: 'roster',
      title: `Monthly Duty Roster (${r.department} - ${r.month} ${r.year})`,
      subordinateName: r.preparedBy || 'Unit Head',
      subordinateDept: r.department,
      subordinateUnit: r.unit,
      dateSubmitted: r.submissionDate,
      stageLabel: `Duty Roster Submission (${r.status.replace('_', ' ')})`,
      details: `Total Staff: ${r.totalStaffCount} | Planned Hours: ${r.totalPlannedHours} hrs`,
      rawItem: r,
    });
  });

  pendingExpenses.forEach((ex) => {
    unifiedList.push({
      id: ex.id,
      type: 'expense',
      title: `Expense Claim (${ex.category} - GHS ${ex.amount})`,
      subordinateName: ex.employeeName,
      subordinateDept: ex.department,
      dateSubmitted: ex.dateSubmitted,
      stageLabel: 'Reimbursement Claim — Awaiting Review',
      details: `Description: ${ex.description} | Date: ${ex.dateSubmitted}`,
      rawItem: ex,
    });
  });

  const filteredList = unifiedList
    .filter((item) => !dismissedItemIds.includes(item.id))
    .filter((item) => {
      if (activeFilter === 'all') return true;
      return item.type === activeFilter;
    });

  const handleCommentChange = (id: string, text: string) => {
    setCommentsMap((prev) => ({ ...prev, [id]: text }));
  };

  const handleRemoveItem = (id: string, name: string) => {
    setDismissedItemIds((prev) => [...prev, id]);
    showToast(`Removed request notification for ${name}`);
  };

  const handleRemoveAll = () => {
    const idsToRemove = filteredList.map((item) => item.id);
    setDismissedItemIds((prev) => [...prev, ...idsToRemove]);
    showToast('Removed all subordinate request notifications from view');
  };

  const handleRemovePopupWindow = () => {
    sessionStorage.setItem('dismissed_subordinate_popup_session', 'true');
    showToast('Subordinate request pop-up notification window removed');
    onClose();
  };

  const handleApprove = (item: UnifiedRequestItem) => {
    setProcessingId(item.id);
    const comments = commentsMap[item.id] || 'Approved by supervisor.';

    setTimeout(() => {
      if (item.type === 'leave') {
        const approverName = emp ? `${emp.firstName} ${emp.lastName}` : undefined;
        processLeaveWorkflowStep(item.id, 'Approve', comments, approverName);
        showToast(`Approved leave request for ${item.subordinateName}`);
      } else if (item.type === 'swap') {
        updateShiftSwapStatus(item.id, 'Approved', comments);
        showToast(`Approved shift swap for ${item.subordinateName}`);
      } else if (item.type === 'roster') {
        updateMonthlyUnitRosterStatus(item.id, 'Approved');
        showToast(`Approved monthly duty roster for ${item.subordinateDept}`);
      } else if (item.type === 'expense') {
        updateExpenseClaimStatus(item.id, 'Approved');
        showToast(`Approved expense claim for ${item.subordinateName}`);
      }
      setProcessingId(null);
    }, 400);
  };

  const handleReject = (item: UnifiedRequestItem) => {
    setProcessingId(item.id);
    const comments = commentsMap[item.id] || 'Request rejected by supervisor.';

    setTimeout(() => {
      if (item.type === 'leave') {
        const approverName = emp ? `${emp.firstName} ${emp.lastName}` : undefined;
        processLeaveWorkflowStep(item.id, 'Reject', comments, approverName);
        showToast(`Rejected leave request for ${item.subordinateName}`);
      } else if (item.type === 'swap') {
        updateShiftSwapStatus(item.id, 'Rejected', comments);
        showToast(`Rejected shift swap for ${item.subordinateName}`);
      } else if (item.type === 'roster') {
        updateMonthlyUnitRosterStatus(item.id, 'Returned for Revision', comments);
        showToast(`Returned monthly duty roster for revision`);
      } else if (item.type === 'expense') {
        updateExpenseClaimStatus(item.id, 'Rejected');
        showToast(`Rejected expense claim for ${item.subordinateName}`);
      }
      setProcessingId(null);
    }, 400);
  };

  const handleNavigate = (type: string) => {
    onClose();
    if (type === 'leave') setActiveTab('leave');
    else if (type === 'swap' || type === 'roster') setActiveTab('shifts');
    else if (type === 'expense') setActiveTab('payroll');
  };

  if (!isOpen) return null;

  const positionWrapperClass = 'fixed inset-0 z-50 pointer-events-none p-3 sm:p-5 flex justify-end items-start top-14 sm:top-16';
  const positionCardClass = 'pointer-events-auto relative w-full max-w-lg sm:max-w-xl rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-5 text-slate-100 shadow-2xl max-h-[85vh] flex flex-col animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-amber-500/30';

  return (
    <div className={positionWrapperClass}>
      <div className={positionCardClass}>
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/30 text-amber-400 shrink-0">
              <BellRing className="h-5 w-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950">
                {filteredList.length}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 border border-amber-500/30">
                  Subordinate Requests Pop-Up
                </span>
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {emp?.department || 'Leadership Portal'}
                </span>
              </div>
              <h3 className="mt-0.5 text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Action Required: Subordinate Approvals
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Remove Pop-up Button */}
            <button
              onClick={handleRemovePopupWindow}
              className="flex items-center gap-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2.5 py-1.5 text-xs font-extrabold transition shadow-sm"
              title="Remove / Dismiss Pop-Up Notification Window"
            >
              <BellOff className="h-4 w-4 text-rose-400" />
              <span className="hidden sm:inline">Remove Pop-Up</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              title="Close Pop-up"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Sub-Tabs and Remove All Button */}
        <div className="flex items-center justify-between gap-2 py-3 border-b border-slate-800/80 overflow-x-auto text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All ({filteredList.length})
            </button>
            <button
              onClick={() => setActiveFilter('leave')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                activeFilter === 'leave'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <PlaneTakeoff className="h-3.5 w-3.5" /> Leaves ({pendingLeaves.length})
            </button>
            <button
              onClick={() => setActiveFilter('swap')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                activeFilter === 'swap'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Swaps ({pendingSwaps.length})
            </button>
            <button
              onClick={() => setActiveFilter('roster')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                activeFilter === 'roster'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Rosters ({pendingRosters.length})
            </button>
            <button
              onClick={() => setActiveFilter('expense')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1 ${
                activeFilter === 'expense'
                  ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="h-3.5 w-3.5" /> Claims ({pendingExpenses.length})
            </button>
          </div>

          {filteredList.length > 0 && (
            <button
              onClick={handleRemoveAll}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 text-[11px] font-bold transition shrink-0"
              title="Remove all current request notifications from view"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Remove All</span>
            </button>
          )}
        </div>

        {/* Request Cards Container */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-500/50 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-slate-300">All Subordinate Requests Are Clear!</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  There are currently no pending requests awaiting your approval in this view.
                </p>
              </div>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg hover:border-slate-700 transition space-y-3"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {item.subordinatePhoto ? (
                      <img
                        src={item.subordinatePhoto}
                        alt={item.subordinateName}
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-emerald-500/40"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-300 font-bold border border-slate-700">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                        {item.subordinateName}
                        {item.subordinateCode && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded">
                            {item.subordinateCode}
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-emerald-400" />
                        <span>{item.subordinateDept || 'Department'}</span>
                        {item.subordinateUnit && <span>• {item.subordinateUnit}</span>}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-extrabold text-amber-300 border border-amber-500/20 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-400" />
                    {item.stageLabel}
                  </span>
                </div>

                {/* Request title and detail body */}
                <div className="rounded-xl bg-slate-900/90 p-3 border border-slate-800 text-xs space-y-1">
                  <div className="font-extrabold text-teal-300 flex items-center justify-between">
                    <span>{item.title}</span>
                    <span className="text-[10px] font-mono text-slate-400">Applied: {item.dateSubmitted}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.details}</p>
                </div>

                {/* Approver Comments Input */}
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Enter approval/rejection remarks (e.g. Coverage verified)..."
                    value={commentsMap[item.id] || ''}
                    onChange={(e) => handleCommentChange(item.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500 outline-none"
                  />
                </div>

                {/* Actions & Individual Removal Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 mt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigate(item.type)}
                      className="text-[11px] font-bold text-slate-400 hover:text-white flex items-center gap-1 transition"
                    >
                      <span>Full View</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => handleRemoveItem(item.id, item.subordinateName)}
                      className="flex items-center gap-1 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 px-2 py-1 text-[11px] font-semibold border border-slate-700/60 transition"
                      title="Remove this specific request notification from view"
                    >
                      <Trash2 className="h-3 w-3 text-rose-400" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={processingId === item.id}
                      onClick={() => handleReject(item)}
                      className="flex items-center gap-1 rounded-xl bg-red-500/10 px-3.5 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 border border-red-500/30 transition disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button
                      disabled={processingId === item.id}
                      onClick={() => handleApprove(item)}
                      className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-500 shadow-md transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Pope John Paul II Medical Centre Multi-Tier Approval System</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRemovePopupWindow}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 px-3 py-1.5 font-extrabold transition"
              title="Remove / Dismiss Pop-Up Notification Window"
            >
              <BellOff className="h-3.5 w-3.5 text-rose-400" />
              <span>Remove Pop-up</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-1.5 font-bold text-slate-200 hover:bg-slate-700 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
