import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  Users,
  Sparkles,
  Plus,
  AlertCircle,
  RefreshCw,
  Mail,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  FileText,
  Send,
  Eye,
  AlertTriangle,
  UserCheck,
  UploadCloud,
  Grid,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ShiftRoster, ShiftSwapRequest } from '../../types/hrms';
import { DepartmentRosterUploader } from './DepartmentRosterUploader';
import { MonthlyDutyRoasterGrid } from './MonthlyDutyRoasterGrid';

export const ShiftRosterManager: React.FC = () => {
  const {
    rosters,
    employees,
    shiftSwapRequests,
    monthlyUnitRosters,
    addRoster,
    addShiftSwapRequest,
    updateShiftSwapStatus,
    activeRole,
    selectedHospital,
  } = useHrms();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'roster' | 'swaps' | 'monthly_rosters' | 'monthly_duty_roaster'>('monthly_duty_roaster');

  // New Roster Assignment Modal State
  const [isAddRosterModalOpen, setIsAddRosterModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [shiftType, setShiftType] = useState<
    | 'Morning (07:00-15:00)'
    | 'Evening (15:00-23:00)'
    | 'Night ICU (23:00-07:00)'
    | '12h Emergency (07:00-19:00)'
    | 'On-Call 24h'
  >('Night ICU (23:00-07:00)');
  const [ward, setWard] = useState('ICU Bed 01-12');

  // Propose Swap Modal State
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [requesterShiftId, setRequesterShiftId] = useState<string>('');
  const [targetEmpId, setTargetEmpId] = useState<string>('');
  const [targetShiftId, setTargetShiftId] = useState<string>('');
  const [swapReason, setSwapReason] = useState<string>('');

  // Rejection Modal State
  const [rejectingSwapId, setRejectingSwapId] = useState<string | null>(null);
  const [rejectionReasonText, setRejectionReasonText] = useState<string>('');

  // Email Log Viewer Modal State
  const [viewingEmailLogsSwap, setViewingEmailLogsSwap] = useState<ShiftSwapRequest | null>(null);

  // Search & Filter State for Swaps
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Stats Calculations for Swaps
  const totalSwaps = shiftSwapRequests.length;
  const pendingApprovals = shiftSwapRequests.filter((s) => s.status === 'Pending_Lead_Approval').length;
  const approvedSwaps = shiftSwapRequests.filter((s) => s.status === 'Approved').length;
  const rejectedSwaps = shiftSwapRequests.filter((s) => s.status === 'Rejected').length;

  // Filtered Swap Requests
  const filteredSwapRequests = shiftSwapRequests.filter((req) => {
    const matchesSearch =
      req.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.targetEmployeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRoster = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    addRoster({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeePhoto: emp.photo,
      role: emp.jobTitle,
      department: emp.department,
      shiftType,
      ward,
      date: new Date().toISOString().split('T')[0],
      startTime: shiftType.includes('07:00') ? '07:00' : '23:00',
      endTime: shiftType.includes('19:00') ? '19:00' : '07:00',
    });

    setIsAddRosterModalOpen(false);
  };

  const handleOpenProposeSwap = (preselectedShiftId?: string) => {
    if (preselectedShiftId) {
      setRequesterShiftId(preselectedShiftId);
    } else if (rosters.length > 0) {
      setRequesterShiftId(rosters[0].id);
    }

    const availableTargets = employees.filter((e) => e.id !== (rosters.find((r) => r.id === preselectedShiftId)?.employeeId || employees[0]?.id));
    if (availableTargets.length > 0) {
      setTargetEmpId(availableTargets[0].id);
      const targetRosterItem = rosters.find((r) => r.employeeId === availableTargets[0].id);
      if (targetRosterItem) {
        setTargetShiftId(targetRosterItem.id);
      }
    }

    setIsSwapModalOpen(true);
  };

  const handleTargetEmpChange = (empId: string) => {
    setTargetEmpId(empId);
    const targetRosterItem = rosters.find((r) => r.employeeId === empId);
    if (targetRosterItem) {
      setTargetShiftId(targetRosterItem.id);
    } else {
      setTargetShiftId('');
    }
  };

  const handleSubmitSwapProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const reqRoster = rosters.find((r) => r.id === requesterShiftId);
    const tgtEmp = employees.find((e) => e.id === targetEmpId);
    const tgtRoster = rosters.find((r) => r.id === targetShiftId);

    if (!reqRoster || !tgtEmp) return;

    addShiftSwapRequest({
      requesterId: reqRoster.employeeId,
      requesterName: reqRoster.employeeName,
      requesterPhoto: reqRoster.employeePhoto,
      requesterShiftId: reqRoster.id,
      requesterShiftDate: reqRoster.date,
      requesterShiftType: reqRoster.shiftType,
      requesterWard: reqRoster.ward,

      targetEmployeeId: tgtEmp.id,
      targetEmployeeName: `${tgtEmp.firstName} ${tgtEmp.lastName}`,
      targetEmployeePhoto: tgtEmp.photo,
      targetShiftId: tgtRoster ? tgtRoster.id : `tgt-${Date.now()}`,
      targetShiftDate: tgtRoster ? tgtRoster.date : reqRoster.date,
      targetShiftType: tgtRoster ? tgtRoster.shiftType : 'Morning (07:00-15:00)',
      targetWard: tgtRoster ? tgtRoster.ward : 'General Ward',

      department: reqRoster.department || 'Intensive Care Unit',
      reason: swapReason || 'Mutual shift swap arrangement.',
      departmentLeadName: 'Dr. Kwame Mensah (Dept Head)',
      departmentLeadEmail: 'kwame.mensah@popejohnpaul2med.org',
    });

    setIsSwapModalOpen(false);
    setSwapReason('');
    setActiveTab('swaps');
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSwapId) return;
    updateShiftSwapStatus(rejectingSwapId, 'Rejected', rejectionReasonText);
    setRejectingSwapId(null);
    setRejectionReasonText('');
  };

  const getStatusBadge = (status: ShiftSwapRequest['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Pending_Lead_Approval':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {selectedHospital.name} - Shift & Roster Management
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <Mail className="h-3 w-3" /> Auto-Email Notifications Active
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              24/7 Clinical coverage scheduling, fatigue risk scorecards, and Department Lead-approved shift swap requests with automated email dispatch.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenProposeSwap()}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
          >
            <ArrowRightLeft className="h-4 w-4 text-emerald-400" /> Propose Shift Swap
          </button>
          <button
            onClick={() => setIsAddRosterModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition active:scale-95"
          >
            <Plus className="h-4 w-4" /> Assign New Shift
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => setActiveTab('monthly_duty_roaster')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'monthly_duty_roaster'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Grid className="h-4 w-4 text-emerald-400" /> Monthly Duty Roaster (30 Staff Grid)
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'roster'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <CalendarDays className="h-4 w-4" /> Active Shift Schedule ({rosters.length})
        </button>

        <button
          onClick={() => setActiveTab('swaps')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'swaps'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" /> Shift Swap Requests
          {pendingApprovals > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
              {pendingApprovals} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('monthly_rosters')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'monthly_rosters'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <UploadCloud className="h-4 w-4" /> Roster Documents & Uploads
          {monthlyUnitRosters.filter((r) => r.status === 'Pending HR Approval').length > 0 && (
            <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
              {monthlyUnitRosters.filter((r) => r.status === 'Pending HR Approval').length} HR Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 0: MONTHLY DUTY ROASTER (30 STAFF VERTICAL GRID) */}
      {activeTab === 'monthly_duty_roaster' && <MonthlyDutyRoasterGrid />}

      {/* TAB 3: DEPARTMENT MONTHLY ROSTER UPLOAD & HR APPROVAL */}
      {activeTab === 'monthly_rosters' && <DepartmentRosterUploader />}

      {/* TAB 1: ACTIVE SHIFT ROSTER */}
      {activeTab === 'roster' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Doctor / Nurse</th>
                  <th className="px-5 py-3.5">Shift Duty Type</th>
                  <th className="px-5 py-3.5">Ward / Bed Allocation</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Fatigue Score</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {rosters.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.employeePhoto}
                          alt={r.employeeName}
                          className="h-9 w-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white">{r.employeeName}</span>
                          <p className="text-[10px] text-slate-400">{r.role} • {r.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-emerald-400">{r.shiftType}</td>
                    <td className="px-5 py-4 font-medium">{r.ward}</td>
                    <td className="px-5 py-4 text-slate-300">{r.date} ({r.startTime} - {r.endTime})</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${r.fatigueScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${r.fatigueScore}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300">{r.fatigueScore}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenProposeSwap(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-emerald-600 hover:text-white transition"
                      >
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Propose Swap
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SHIFT SWAP REQUESTS & LEAD APPROVAL */}
      {activeTab === 'swaps' && (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Swap Proposals</span>
                <ArrowRightLeft className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{totalSwaps}</div>
              <p className="mt-1 text-[11px] text-slate-500">Initiated by staff members</p>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Pending Lead Approval</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-400">{pendingApprovals}</div>
              <p className="mt-1 text-[11px] text-amber-500/80">Awaiting department lead sign-off</p>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Approved Swaps</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">{approvedSwaps}</div>
              <p className="mt-1 text-[11px] text-emerald-500/80">Roster updated automatically</p>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Email Alerts Dispatched</span>
                <Mail className="h-4 w-4 text-purple-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-purple-300">
                {shiftSwapRequests.reduce((acc, r) => acc + r.emailLog.length, 0)}
              </div>
              <p className="mt-1 text-[11px] text-purple-400/80">Automated lead & staff notifications</p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by employee name, ward, or swap reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 items-center text-xs">
              <div className="flex items-center gap-1 text-slate-400 mr-1">
                <Filter className="h-3.5 w-3.5" /> Filter Status:
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Pending_Lead_Approval">Pending Lead Approval</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Swap Requests Cards Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredSwapRequests.length === 0 ? (
              <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-8 text-center">
                <ArrowRightLeft className="mx-auto h-8 w-8 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-400">No shift swap requests match your filter.</p>
              </div>
            ) : (
              filteredSwapRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 hover:border-slate-700 transition shadow-sm"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(req.status)}`}>
                        {req.status === 'Pending_Lead_Approval' ? 'Pending Dept Lead Approval' : req.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Dept: <strong className="text-slate-200">{req.department}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
                        <Mail className="h-3 w-3" /> Lead: {req.departmentLeadName}
                      </span>
                      <span>Requested: {req.dateRequested}</span>
                    </div>
                  </div>

                  {/* Side-by-side Swap Visualization */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    {/* Requester Box */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <UserCheck className="h-3 w-3 text-emerald-400" /> Proposing Employee
                      </div>
                      <div className="flex items-center gap-3">
                        {req.requesterPhoto ? (
                          <img src={req.requesterPhoto} alt={req.requesterName} className="h-9 w-9 rounded-full object-cover border border-slate-700" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                            {req.requesterName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">{req.requesterName}</h4>
                          <p className="text-[11px] text-emerald-400 font-semibold">{req.requesterShiftType}</p>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                        Date: <strong className="text-slate-200">{req.requesterShiftDate}</strong> • Ward: <strong className="text-slate-200">{req.requesterWard}</strong>
                      </div>
                    </div>

                    {/* Target Employee Box */}
                    <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <ArrowRightLeft className="h-3 w-3 text-sky-400" /> Target Swapped Employee
                      </div>
                      <div className="flex items-center gap-3">
                        {req.targetEmployeePhoto ? (
                          <img src={req.targetEmployeePhoto} alt={req.targetEmployeeName} className="h-9 w-9 rounded-full object-cover border border-slate-700" />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                            {req.targetEmployeeName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-xs font-bold text-white">{req.targetEmployeeName}</h4>
                          <p className="text-[11px] text-sky-400 font-semibold">{req.targetShiftType}</p>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800">
                        Date: <strong className="text-slate-200">{req.targetShiftDate}</strong> • Ward: <strong className="text-slate-200">{req.targetWard}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Swap Reason Box */}
                  <div className="mt-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <strong className="text-slate-400">Reason for Swap Proposal:</strong> "{req.reason}"
                  </div>

                  {req.rejectionReason && (
                    <div className="mt-2 text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-500/30">
                      <strong>Lead Rejection Feedback:</strong> {req.rejectionReason}
                    </div>
                  )}

                  {/* Footer Actions & Email Logs */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <button
                      onClick={() => setViewingEmailLogsSwap(req)}
                      className="inline-flex items-center gap-1.5 text-purple-300 hover:text-purple-200 bg-purple-950/40 border border-purple-500/30 px-3 py-1.5 rounded-lg transition"
                    >
                      <Mail className="h-3.5 w-3.5" /> View Email Dispatch Logs ({req.emailLog.length})
                    </button>

                    {req.status === 'Pending_Lead_Approval' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setRejectingSwapId(req.id)}
                          className="flex items-center gap-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 font-semibold hover:bg-rose-600 hover:text-white transition"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject Swap
                        </button>
                        <button
                          onClick={() => updateShiftSwapStatus(req.id, 'Approved')}
                          className="flex items-center gap-1.5 rounded-lg bg-emerald-600 text-white px-4 py-1.5 font-semibold hover:bg-emerald-500 shadow-md transition"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Department Lead Approve & Update Roster
                        </button>
                      </div>
                    )}

                    {req.status === 'Approved' && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Shift Roster Updated & Approved by Lead
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: PROPOSE SHIFT SWAP */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Propose Shift Swap Request</h2>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitSwapProposal} className="space-y-4 text-xs">
              {/* Automated Email Notice */}
              <div className="rounded-xl bg-purple-950/40 border border-purple-500/30 p-3 flex items-start gap-2 text-purple-200">
                <Mail className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Automated Department Lead Notification</div>
                  <div className="text-[11px] text-purple-300/80">
                    An automated email will be sent to <strong>Dr. Kwame Mensah (Dept Head)</strong> to approve or reject this shift swap.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Your Assigned Roster Shift</label>
                <select
                  required
                  value={requesterShiftId}
                  onChange={(e) => setRequesterShiftId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  {rosters.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.employeeName} - {r.shiftType} ({r.date} @ {r.ward})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Target Colleague to Swap With</label>
                <select
                  required
                  value={targetEmpId}
                  onChange={(e) => handleTargetEmpChange(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Shift to Take</label>
                <select
                  value={targetShiftId}
                  onChange={(e) => setTargetShiftId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  {rosters
                    .filter((r) => r.employeeId === targetEmpId)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.shiftType} ({r.date} @ {r.ward})
                      </option>
                    ))}
                  <option value="">-- Flexible / Standard Morning Coverage --</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reason for Shift Swap</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. CME Medical Conference, Personal Emergency, Academic Exam..."
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSwapModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-md"
                >
                  <Send className="h-3.5 w-3.5" /> Submit & Send Lead Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN NEW SHIFT ROSTER */}
      {isAddRosterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Assign Hospital Shift Roster</h3>
            <form onSubmit={handleCreateRoster} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Select Employee</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-200"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Shift Type</label>
                <select
                  value={shiftType}
                  onChange={(e) => setShiftType(e.target.value as any)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-200"
                >
                  <option value="Night ICU (23:00-07:00)">Night ICU (23:00-07:00)</option>
                  <option value="12h Emergency (07:00-19:00)">12h Emergency (07:00-19:00)</option>
                  <option value="Morning (07:00-15:00)">Morning (07:00-15:00)</option>
                  <option value="Evening (15:00-23:00)">Evening (15:00-23:00)</option>
                  <option value="On-Call 24h">On-Call 24h</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ward / Location</label>
                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddRosterModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500">
                  Confirm Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: REJECTION REASON MODAL */}
      {rejectingSwapId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Reject Shift Swap Request</h3>
            <p className="text-xs text-slate-400">
              Please provide feedback for why this shift swap was rejected by the Department Lead. An automated email notification will be dispatched.
            </p>
            <form onSubmit={handleConfirmReject} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                placeholder="e.g. Critical ICU nurse coverage minimum threshold violated for that date..."
                value={rejectionReasonText}
                onChange={(e) => setRejectionReasonText(e.target.value)}
                className="w-full rounded-lg bg-slate-950 border border-slate-800 p-3 text-slate-200 focus:border-rose-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingSwapId(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500"
                >
                  Confirm Rejection & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: VIEW AUTOMATED EMAIL LOGS */}
      {viewingEmailLogsSwap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Automated Email Dispatch History</h2>
              </div>
              <button
                onClick={() => setViewingEmailLogsSwap(null)}
                className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Audit trail of all automated email notifications triggered for Shift Swap Request <strong className="text-white">{viewingEmailLogsSwap.id}</strong>.
            </p>

            <div className="space-y-3">
              {viewingEmailLogsSwap.emailLog.map((log, idx) => (
                <div key={idx} className="rounded-xl bg-slate-950 p-4 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-purple-300">To: {log.sentTo}</span>
                    <span className="text-[10px] text-slate-500">{log.sentAt}</span>
                  </div>
                  <div className="font-semibold text-slate-200">Subject: {log.subject}</div>
                  <p className="text-slate-300 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800/60 font-mono text-[11px]">
                    {log.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
