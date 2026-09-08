import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Search,
  Filter,
  Calendar,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Users,
  PlaneTakeoff,
  Award,
  ArrowUpDown,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, AttendanceRecord, LeaveRequest } from '../../types/hrms';
import { printElementById } from '../../utils/printDocument';
import { IndividualStaffLeaveAttendanceDossier } from './IndividualStaffLeaveAttendanceDossier';

interface StaffLeaveAndAttendantReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDepartment?: string;
  initialStaffId?: string;
  initialMode?: 'master' | 'individual';
  initialReportScope?: 'all' | 'leaves' | 'attendance';
  initialPeriodPreset?: 'this_month' | 'last_month' | 'this_quarter' | 'last_quarter' | 'year_to_date' | 'this_year' | 'all_time' | 'custom';
}

export const StaffLeaveAndAttendantReportModal: React.FC<StaffLeaveAndAttendantReportModalProps> = ({
  isOpen,
  onClose,
  defaultDepartment = 'All',
  initialStaffId,
  initialMode = 'master',
  initialReportScope = 'all',
  initialPeriodPreset,
}) => {
  const { employees, attendance, leaves, selectedHospital, currentUser, activeRole, showToast } = useHrms();

  const [viewMode, setViewMode] = useState<'master' | 'individual'>(initialMode);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(initialStaffId || employees[0]?.id || '');
  const [reportScope, setReportScope] = useState<'all' | 'leaves' | 'attendance'>(initialReportScope);

  React.useEffect(() => {
    if (initialStaffId) {
      setSelectedStaffId(initialStaffId);
    }
    if (initialMode) {
      setViewMode(initialMode);
    }
    if (initialReportScope) {
      setReportScope(initialReportScope);
    }
  }, [initialStaffId, initialMode, initialReportScope, isOpen]);

  const [deptFilter, setDeptFilter] = useState<string>(defaultDepartment);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'OnLeave' | 'Late' | 'Absent'>('All');
  const [periodPreset, setPeriodPreset] = useState<'today' | 'this_week' | 'this_month' | 'year_to_date' | 'custom'>('this_month');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'department' | 'attendanceRate' | 'leaveBalance'>('department');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Quick department list
  const departments = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach((e) => {
      if (e?.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Handle Preset Changes
  const handlePresetChange = (preset: 'today' | 'this_week' | 'this_month' | 'year_to_date' | 'custom') => {
    setPeriodPreset(preset);
    const today = new Date();
    if (preset === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_week') {
      const first = today.getDate() - today.getDay() + 1; // Monday
      const monday = new Date(today.setDate(first));
      const end = new Date();
      setStartDate(monday.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else if (preset === 'this_month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
    } else if (preset === 'year_to_date') {
      const jan1 = new Date(today.getFullYear(), 0, 1);
      setStartDate(jan1.toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Cross-relate Employee with Attendance & Leaves in the active period
  const reportData = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return (employees || []).filter(Boolean).map((emp) => {
      // 1. Filter attendance for this employee in date range
      const empAttendance = (attendance || []).filter((a) => {
        if (!a || a.employeeId !== emp.id) return false;
        if (!a.date) return false;
        return a.date >= startDate && a.date <= endDate;
      });

      // Attendance metrics
      const daysAttended = empAttendance.filter((a) => Boolean(a.clockIn)).length;
      let lateCount = 0;
      let totalDelayMins = 0;
      let totalOvertime = 0;

      empAttendance.forEach((a) => {
        if (a.clockIn) {
          const parts = a.clockIn.split(':');
          const hr = parseInt(parts[0], 10);
          const min = parseInt(parts[1] || '0', 10);
          if (hr > 8 || (hr === 8 && min > 15)) {
            lateCount++;
            totalDelayMins += (hr - 8) * 60 + (min - 15);
          }
        }
        if (a.overtimeHours) {
          totalOvertime += Number(a.overtimeHours);
        }
      });

      // Today's attendance record
      const todayRecord = (attendance || []).find((a) => a && a.employeeId === emp.id && a.date === todayStr);

      // 2. Filter approved leaves for this employee
      const empLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id);
      const approvedLeaves = empLeaves.filter((l) => l.status === 'Approved');
      const pendingLeaves = empLeaves.filter((l) => l.status === 'Pending');

      const leaveDaysTaken = approvedLeaves.reduce(
        (acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0),
        0
      );
      const leaveDaysPending = pendingLeaves.reduce(
        (acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0),
        0
      );

      const annualEntitlement = emp.leaveEntitlement || 30;
      const deferredDays = emp.deferredLeaveDays || 0;
      const totalEntitlement = annualEntitlement + deferredDays;
      const leaveBalance = Math.max(0, totalEntitlement - leaveDaysTaken);

      // Check if employee is currently on active leave today
      const currentActiveLeave = approvedLeaves.find((l) => {
        return todayStr >= l.startDate && todayStr <= l.endDate;
      });

      // Determine current attendant / duty status
      let attendantStatus: 'Present' | 'OnLeave' | 'Late' | 'Absent' | 'OffDuty' = 'OffDuty';
      let statusLabel = 'Off Duty';

      if (currentActiveLeave) {
        attendantStatus = 'OnLeave';
        statusLabel = `On Leave (${currentActiveLeave.leaveType})`;
      } else if (todayRecord?.clockIn) {
        const parts = todayRecord.clockIn.split(':');
        const hr = parseInt(parts[0], 10);
        const min = parseInt(parts[1] || '0', 10);
        if (hr > 8 || (hr === 8 && min > 15)) {
          attendantStatus = 'Late';
          statusLabel = `Late Arrival (${todayRecord.clockIn})`;
        } else {
          attendantStatus = 'Present';
          statusLabel = `Present On-Duty (${todayRecord.clockIn})`;
        }
      } else if (todayRecord?.status === 'Absent') {
        attendantStatus = 'Absent';
        statusLabel = 'Unexcused Absent';
      } else {
        // Look at total attendance in period
        if (daysAttended > 0) {
          attendantStatus = 'Present';
          statusLabel = 'Active Duty Roster';
        } else {
          attendantStatus = 'Absent';
          statusLabel = 'No Duty Record';
        }
      }

      // Expected working days in selected range (approx calculation)
      const dStart = new Date(startDate);
      const dEnd = new Date(endDate);
      const dayDiff = Math.max(1, Math.round((dEnd.getTime() - dStart.getTime()) / (1000 * 3600 * 24)) + 1);
      // Approximate work days (5/7)
      const approxWorkDays = Math.max(1, Math.round(dayDiff * (5 / 7)));
      const attendanceRate = Math.min(100, Math.round((daysAttended / approxWorkDays) * 100));

      return {
        id: emp.id,
        empCode: emp.empCode || emp.employeeCode || 'SJH-100',
        name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff Member',
        photo: emp.photo,
        department: emp.department || 'Clinical',
        unit: emp.unit || 'General Service',
        jobTitle: emp.jobTitle || 'Medical Staff',
        attendantStatus,
        statusLabel,
        daysAttended,
        todayClockIn: todayRecord?.clockIn || '--:--',
        todayClockOut: todayRecord?.clockOut || '--:--',
        todayMethod: todayRecord?.method || 'Biometric',
        lateCount,
        totalDelayMins,
        totalOvertime,
        attendanceRate,
        annualEntitlement,
        deferredDays,
        totalEntitlement,
        leaveDaysTaken,
        leaveDaysPending,
        leaveBalance,
        currentActiveLeave,
        leaveUtilization: totalEntitlement > 0 ? Math.round((leaveDaysTaken / totalEntitlement) * 100) : 0,
      };
    });
  }, [employees, attendance, leaves, startDate, endDate]);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return reportData
      .filter((rec) => {
        if (deptFilter !== 'All' && rec.department !== deptFilter) return false;

        if (statusFilter !== 'All') {
          if (statusFilter === 'Present' && rec.attendantStatus !== 'Present') return false;
          if (statusFilter === 'OnLeave' && rec.attendantStatus !== 'OnLeave') return false;
          if (statusFilter === 'Late' && rec.attendantStatus !== 'Late') return false;
          if (statusFilter === 'Absent' && rec.attendantStatus !== 'Absent') return false;
        }

        if (searchTerm) {
          const t = searchTerm.toLowerCase();
          return (
            rec.name.toLowerCase().includes(t) ||
            rec.empCode.toLowerCase().includes(t) ||
            rec.department.toLowerCase().includes(t) ||
            rec.jobTitle.toLowerCase().includes(t) ||
            rec.unit.toLowerCase().includes(t)
          );
        }

        return true;
      })
      .sort((a, b) => {
        let valA: any = a.name;
        let valB: any = b.name;

        if (sortBy === 'department') {
          valA = a.department;
          valB = b.department;
        } else if (sortBy === 'attendanceRate') {
          valA = a.attendanceRate;
          valB = b.attendanceRate;
        } else if (sortBy === 'leaveBalance') {
          valA = a.leaveBalance;
          valB = b.leaveBalance;
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [reportData, deptFilter, statusFilter, searchTerm, sortBy, sortAsc]);

  // High-level KPIs
  const summaryStats = useMemo(() => {
    const total = filteredData.length;
    const presentCount = filteredData.filter((d) => d.attendantStatus === 'Present' || d.attendantStatus === 'Late').length;
    const onLeaveCount = filteredData.filter((d) => d.attendantStatus === 'OnLeave').length;
    const absentCount = filteredData.filter((d) => d.attendantStatus === 'Absent').length;
    const lateCount = filteredData.filter((d) => d.lateCount > 0).length;
    const totalDaysTaken = filteredData.reduce((acc, d) => acc + d.leaveDaysTaken, 0);
    const totalRemainingBalance = filteredData.reduce((acc, d) => acc + d.leaveBalance, 0);
    const avgAttendanceRate = total > 0 ? Math.round(filteredData.reduce((acc, d) => acc + d.attendanceRate, 0) / total) : 0;

    return {
      total,
      presentCount,
      onLeaveCount,
      absentCount,
      lateCount,
      totalDaysTaken,
      totalRemainingBalance,
      avgAttendanceRate,
    };
  }, [filteredData]);

  // CSV Export Handler
  const handleExportCSV = () => {
    setIsExporting(true);
    let headers: string[] = [];
    let rows: string[] = [];

    if (reportScope === 'leaves') {
      headers = [
        'Staff Code',
        'Full Name',
        'Department',
        'Clinical Unit',
        'Designation / Cadre',
        'Annual Leave Entitlement',
        'Deferred Days',
        'Total Net Entitlement',
        'Approved Days Taken',
        'Pending Days Requested',
        'Remaining Leave Balance',
        'Utilization Rate (%)',
        'Active Leave Today',
      ];
      rows = filteredData.map((d) => {
        const activeLeaveStr = d.currentActiveLeave
          ? `${d.currentActiveLeave.leaveType} (${d.currentActiveLeave.startDate} to ${d.currentActiveLeave.endDate})`
          : 'None';
        return [
          `"${d.empCode}"`,
          `"${d.name}"`,
          `"${d.department}"`,
          `"${d.unit}"`,
          `"${d.jobTitle}"`,
          d.annualEntitlement,
          d.deferredDays,
          d.totalEntitlement,
          d.leaveDaysTaken,
          d.leaveDaysPending,
          d.leaveBalance,
          `"${d.leaveUtilization}%"`,
          `"${activeLeaveStr}"`,
        ].join(',');
      });
    } else if (reportScope === 'attendance') {
      headers = [
        'Staff Code',
        'Full Name',
        'Department',
        'Clinical Unit',
        'Designation / Cadre',
        'Attendant Duty Status',
        'Days Attended in Period',
        'Today Clock In',
        'Today Clock Out',
        'Biometric Verification Method',
        'Lateness Count',
        'Total Delay Minutes',
        'Overtime Hours',
        'Attendance Rate (%)',
      ];
      rows = filteredData.map((d) => [
        `"${d.empCode}"`,
        `"${d.name}"`,
        `"${d.department}"`,
        `"${d.unit}"`,
        `"${d.jobTitle}"`,
        `"${d.statusLabel}"`,
        d.daysAttended,
        `"${d.todayClockIn}"`,
        `"${d.todayClockOut}"`,
        `"${d.todayMethod}"`,
        d.lateCount,
        d.totalDelayMins,
        d.totalOvertime,
        `"${d.attendanceRate}%"`,
      ].join(','));
    } else {
      headers = [
        'Staff Code',
        'Full Name',
        'Department',
        'Clinical Unit',
        'Designation / Cadre',
        'Attendant Duty Status',
        'Days Attended in Period',
        'Today Clock In',
        'Today Clock Out',
        'Biometric Method',
        'Lateness Count',
        'Total Delay Minutes',
        'Overtime Hours',
        'Attendance Rate (%)',
        'Annual Leave Entitlement',
        'Deferred Days',
        'Total Net Leave Entitlement',
        'Approved Leave Days Taken',
        'Pending Leave Days Requested',
        'Remaining Leave Balance Days',
        'Leave Utilization Rate (%)',
        'Active Leave Details',
      ];
      rows = filteredData.map((d) => {
        const activeLeaveStr = d.currentActiveLeave
          ? `${d.currentActiveLeave.leaveType} (${d.currentActiveLeave.startDate} to ${d.currentActiveLeave.endDate})`
          : 'None';
        return [
          `"${d.empCode}"`,
          `"${d.name}"`,
          `"${d.department}"`,
          `"${d.unit}"`,
          `"${d.jobTitle}"`,
          `"${d.statusLabel}"`,
          d.daysAttended,
          `"${d.todayClockIn}"`,
          `"${d.todayClockOut}"`,
          `"${d.todayMethod}"`,
          d.lateCount,
          d.totalDelayMins,
          d.totalOvertime,
          `"${d.attendanceRate}%"`,
          d.annualEntitlement,
          d.deferredDays,
          d.totalEntitlement,
          d.leaveDaysTaken,
          d.leaveDaysPending,
          d.leaveBalance,
          `"${d.leaveUtilization}%"`,
          `"${activeLeaveStr}"`,
        ].join(',');
      });
    }

    const hospitalTitle = selectedHospital?.name || 'POPE JOHN PAUL II MEDICAL CENTRE (PJPIIMC)';
    const reportTitle =
      reportScope === 'leaves'
        ? 'OFFICIAL STAFF LEAVE HISTORY & ENTITLEMENT MASTER REPORT'
        : reportScope === 'attendance'
        ? 'OFFICIAL STAFF BIOMETRIC ATTENDANCE & PUNCTUALITY AUDIT REPORT'
        : 'OFFICIAL STAFF LEAVE AND ATTENDANT MASTER REPORT';

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"${hospitalTitle} - ${reportTitle}"\n` +
      `"Report Period: ${startDate} to ${endDate}"\n` +
      `"Department Scope: ${deptFilter} | Status Filter: ${statusFilter}"\n` +
      `"Generated On: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}"\n` +
      `"Generated By: Directorate of Human Resources (${currentUser?.name || currentUser?.email || 'HR Officer'})"\n\n` +
      [headers.join(','), ...rows].join('\n');

    const downloadFileName =
      reportScope === 'leaves'
        ? `PJPIIMC_Staff_Leave_History_Report_${startDate}_to_${endDate}.csv`
        : reportScope === 'attendance'
        ? `PJPIIMC_Staff_Attendance_Report_${startDate}_to_${endDate}.csv`
        : `PJPIIMC_Staff_Leave_and_Attendant_Report_${startDate}_to_${endDate}.csv`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', downloadFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
    showToast(
      'success',
      'Report Exported',
      `${reportScope === 'leaves' ? 'Leave History' : reportScope === 'attendance' ? 'Attendance' : 'Leave & Attendance'} CSV report downloaded successfully.`
    );
  };

  // High-Fidelity Print Handler
  const handlePrintReport = () => {
    printElementById(
      'staff-leave-attendant-report-print',
      `PJPIIMC_Staff_Leave_and_Attendant_Report_${startDate}_to_${endDate}`,
      {
        landscape: true,
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-7xl max-h-[96vh] flex flex-col rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        {/* Top Gradient Accent Bar */}
        <div className="h-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-950/40 shrink-0">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Directorate of Human Resources
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  REF: PJPIIMC/HR/SAR/{new Date().getFullYear()}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
                {viewMode === 'master' ? (
                  <>
                    <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span>Staff Leave & Attendant Master Report</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="h-6 w-6 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>Staff Leave History & Biometric Attendance Dossier</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {viewMode === 'master'
                  ? 'Pope John Paul II Medical Centre • Unified workforce duty presence, biometric attendant logs, approved leaves & leave liabilities audit.'
                  : 'Pope John Paul II Medical Centre • Individual employee leave ledger, duty clock-in logs, and official sign-off certification.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
            {viewMode === 'master' && (
              <>
                <button
                  onClick={handleExportCSV}
                  disabled={isExporting || filteredData.length === 0}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-50"
                  title="Download CSV spreadsheet"
                >
                  <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Export Master CSV</span>
                </button>

                <button
                  onClick={handlePrintReport}
                  disabled={filteredData.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-purple-950/30 active:scale-95 disabled:opacity-50"
                  title="Print official letterhead document"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Master Report</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Mode Switcher Segmented Bar */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('master')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                viewMode === 'master'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Master Report (All Staff)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('individual')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition ${
                viewMode === 'individual'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Select Staff: Leave History & Attendance</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Catholic Health Service Trust (CHST) HRMS Audit</span>
          </div>
        </div>

        {/* INDIVIDUAL STAFF DOSSIER VIEW */}
        {viewMode === 'individual' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <IndividualStaffLeaveAttendanceDossier
              selectedStaffId={selectedStaffId}
              onSelectStaffId={setSelectedStaffId}
              employees={employees}
              leaves={leaves}
              attendance={attendance}
              selectedHospital={selectedHospital}
              currentUser={currentUser}
              showToast={showToast}
              initialReportScope={reportScope}
              initialPeriodPreset={periodPreset as any}
            />
          </div>
        )}

        {/* MASTER REPORT VIEW */}
        {viewMode === 'master' && (
          <>
            {/* Filters & Control Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/40 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Report Content Scope Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <span className="text-[10px] uppercase text-slate-400 font-extrabold px-2">Audit Focus:</span>
              <button
                type="button"
                onClick={() => setReportScope('all')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  reportScope === 'all'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Unified (Both)</span>
              </button>
              <button
                type="button"
                onClick={() => setReportScope('leaves')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  reportScope === 'leaves'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>Leave History Only</span>
              </button>
              <button
                type="button"
                onClick={() => setReportScope('attendance')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  reportScope === 'attendance'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Attendance Only</span>
              </button>
            </div>

            {/* Period Presets */}
            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
              <span className="text-[10px] uppercase text-slate-400 font-extrabold px-2">Period:</span>
              <button
                type="button"
                onClick={() => handlePresetChange('today')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periodPreset === 'today'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('this_week')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periodPreset === 'this_week'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('this_month')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periodPreset === 'this_month'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('year_to_date')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periodPreset === 'year_to_date'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Year to Date
              </button>
            </div>

            {/* Custom Date Inputs */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-slate-400 text-[11px] font-semibold">From:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPeriodPreset('custom');
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <Calendar className="h-3.5 w-3.5 text-purple-500" />
                <span className="text-slate-400 text-[11px] font-semibold">To:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPeriodPreset('custom');
                  }}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Department, Status, Search Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* Search */}
            <div className="sm:col-span-5 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, employee ID, role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none shadow-sm"
              />
            </div>

            {/* Department */}
            <div className="sm:col-span-3">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-purple-500 focus:outline-none shadow-sm"
              >
                <option value="All">All Hospital Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-purple-500 focus:outline-none shadow-sm"
              >
                <option value="All">All Duty Statuses</option>
                <option value="Present">Present on Duty</option>
                <option value="OnLeave">Currently on Leave</option>
                <option value="Late">Late Arrivals</option>
                <option value="Absent">Unexcused Absent</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="sm:col-span-2 flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:border-purple-500 focus:outline-none shadow-sm"
              >
                <option value="department">Sort: Department</option>
                <option value="name">Sort: Name</option>
                <option value="attendanceRate">Sort: Attendance Rate</option>
                <option value="leaveBalance">Sort: Leave Balance</option>
              </select>
              <button
                type="button"
                onClick={() => setSortAsc(!sortAsc)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                title={sortAsc ? 'Ascending' : 'Descending'}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* KPI Executive Summary Strip */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-black uppercase text-slate-400">Total Staff</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {summaryStats.total}
              </div>
              <p className="text-[10px] text-slate-500">Personnel in scope</p>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                Duty Attendants
              </span>
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                {summaryStats.presentCount}
              </div>
              <p className="text-[10px] text-emerald-600/80">Present on duty</p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 shadow-sm">
              <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400">
                On Approved Leave
              </span>
              <div className="text-xl font-black text-amber-700 dark:text-amber-300 mt-0.5">
                {summaryStats.onLeaveCount}
              </div>
              <p className="text-[10px] text-amber-600/80">Authorized absence</p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 shadow-sm">
              <span className="text-[10px] font-black uppercase text-rose-600 dark:text-rose-400">
                Lateness / Absences
              </span>
              <div className="text-xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                {summaryStats.lateCount + summaryStats.absentCount}
              </div>
              <p className="text-[10px] text-rose-600/80">{summaryStats.lateCount} late • {summaryStats.absentCount} absent</p>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50 shadow-sm">
              <span className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                Leave Days Utilized
              </span>
              <div className="text-xl font-black text-indigo-700 dark:text-indigo-300 mt-0.5">
                {summaryStats.totalDaysTaken}
              </div>
              <p className="text-[10px] text-indigo-600/80">Approved leave days</p>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 shadow-sm">
              <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400">
                Outstanding Balance
              </span>
              <div className="text-xl font-black text-purple-700 dark:text-purple-300 mt-0.5">
                {summaryStats.totalRemainingBalance}d
              </div>
              <p className="text-[10px] text-purple-600/80">Hospital leave liability</p>
            </div>
          </div>
        </div>

        {/* Live Interactive Table Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Staff Identification</th>
                  <th className="px-4 py-3.5">Department & Post</th>
                  <th className="px-4 py-3.5 text-center">Attendant Status</th>
                  <th className="px-4 py-3.5 text-center">Duty Days Present</th>
                  <th className="px-4 py-3.5 text-center">Today Clock-In</th>
                  <th className="px-4 py-3.5 text-center">Attendance %</th>
                  <th className="px-4 py-3.5 text-center">Leave Entitlement</th>
                  <th className="px-4 py-3.5 text-center">Days Taken</th>
                  <th className="px-4 py-3.5 text-center">Leave Balance</th>
                  <th className="px-4 py-3.5">Active Leave Details</th>
                  <th className="px-4 py-3.5 text-center">Staff Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2 opacity-50" />
                      <p className="font-bold">No staff records match the selected filter criteria.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Try resetting the department, duty status, or search query.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      {/* Staff Identification */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              d.photo ||
                              'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={d.name}
                            className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{d.name}</p>
                            <span className="text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                              {d.empCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Post */}
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{d.department}</p>
                        <p className="text-[10px] text-slate-500">
                          {d.unit} • {d.jobTitle}
                        </p>
                      </td>

                      {/* Attendant Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            d.attendantStatus === 'Present'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : d.attendantStatus === 'OnLeave'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                              : d.attendantStatus === 'Late'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-300 dark:border-orange-800'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {d.attendantStatus === 'Present' && <CheckCircle2 className="h-3 w-3" />}
                          {d.attendantStatus === 'OnLeave' && <PlaneTakeoff className="h-3 w-3" />}
                          {d.attendantStatus === 'Late' && <Clock className="h-3 w-3" />}
                          {d.attendantStatus === 'Absent' && <AlertCircle className="h-3 w-3" />}
                          {d.attendantStatus}
                        </span>
                      </td>

                      {/* Days Attended */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-900 dark:text-white">
                        {d.daysAttended}d
                        {d.totalOvertime > 0 && (
                          <span className="block text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            +{d.totalOvertime}h OT
                          </span>
                        )}
                      </td>

                      {/* Today Clock-In */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {d.todayClockIn}
                        </span>
                        {d.lateCount > 0 && (
                          <span className="block text-[9px] text-rose-500 font-semibold">
                            {d.lateCount}x late ({d.totalDelayMins}m)
                          </span>
                        )}
                      </td>

                      {/* Attendance % */}
                      <td className="px-4 py-3.5 text-center">
                        <div className="inline-block w-16">
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                            {d.attendanceRate}%
                          </span>
                          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-0.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                d.attendanceRate >= 80
                                  ? 'bg-emerald-500'
                                  : d.attendanceRate >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${d.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Leave Entitlement */}
                      <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-300">
                        {d.totalEntitlement}d
                        {d.deferredDays > 0 && (
                          <span className="block text-[9px] text-amber-500 font-normal">
                            (+{d.deferredDays} def)
                          </span>
                        )}
                      </td>

                      {/* Leave Days Taken */}
                      <td className="px-4 py-3.5 text-center font-extrabold text-emerald-600 dark:text-emerald-400">
                        {d.leaveDaysTaken}d
                      </td>

                      {/* Leave Balance */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`font-black px-2 py-0.5 rounded-lg ${
                            d.leaveBalance <= 5
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                          }`}
                        >
                          {d.leaveBalance}d
                        </span>
                      </td>

                      {/* Active Leave Details */}
                      <td className="px-4 py-3.5">
                        {d.currentActiveLeave ? (
                          <div className="text-[11px] leading-tight">
                            <span className="font-extrabold text-amber-600 dark:text-amber-400 block">
                              {d.currentActiveLeave.leaveType}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {d.currentActiveLeave.startDate} to {d.currentActiveLeave.endDate}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No active leave</span>
                        )}
                      </td>

                      {/* Individual Dossier Action */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStaffId(d.id);
                            setViewMode('individual');
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-[11px] transition border border-purple-200 dark:border-purple-800 shadow-sm whitespace-nowrap"
                          title={`Generate individual leave & attendance dossier for ${d.name}`}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>Leave & Attendance</span>
                          <ArrowUpRight className="w-3 h-3 text-purple-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>
              Certified institutional audit document for Catholic Health Service Trust (CHST) and Pope John Paul II Medical Centre.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition"
            >
              Close
            </button>
            {viewMode === 'master' ? (
              <button
                onClick={handlePrintReport}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <Printer className="h-4 w-4" /> Print Master Report
              </button>
            ) : (
              <button
                onClick={() => setViewMode('master')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow border border-slate-700"
              >
                <Building2 className="h-4 w-4 text-purple-300" />
                <span>Return to Master Audit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Printable Document Container for High-Fidelity A4 Landscape Printing */}
      <div id="staff-leave-attendant-report-print" className="hidden">
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#0f172a', padding: '12px', fontSize: '10px' }}>
          {/* Institutional Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '2.5px solid #0f172a', paddingBottom: '8px', marginBottom: '12px' }}>
            <div style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '2px', color: '#64748b', textTransform: 'uppercase' }}>
              CATHOLIC HEALTH SERVICE TRUST (CHST) • ARCHDIOCESE OF KUMASI
            </div>
            <h1 style={{ margin: '3px 0', fontSize: '18px', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' }}>
              {selectedHospital?.name || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI'}
            </h1>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '2px' }}>
              DIRECTORATE OF HUMAN RESOURCES & STAFF ADMINISTRATION
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', marginTop: '6px', textDecoration: 'underline' }}>
              OFFICIAL STAFF LEAVE AND ATTENDANT MASTER REPORT
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#475569', marginTop: '6px', fontWeight: '600' }}>
              <span>REPORT PERIOD: <strong>{startDate}</strong> TO <strong>{endDate}</strong></span>
              <span>DEPARTMENT SCOPE: <strong>{deptFilter.toUpperCase()}</strong></span>
              <span>DATE GENERATED: <strong>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</strong></span>
              <span>REF NO: <strong>PJPIIMC/HR/SAR/{new Date().getFullYear()}/{Math.floor(1000 + Math.random() * 9000)}</strong></span>
            </div>
          </div>

          {/* Statistical KPI Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', marginBottom: '12px', backgroundColor: '#f8fafc', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Total Staff</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{summaryStats.total}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#059669', textTransform: 'uppercase' }}>Duty Attendants</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#059669' }}>{summaryStats.presentCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase' }}>On Approved Leave</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#d97706' }}>{summaryStats.onLeaveCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#dc2626', textTransform: 'uppercase' }}>Late / Absences</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#dc2626' }}>{summaryStats.lateCount + summaryStats.absentCount}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#4f46e5', textTransform: 'uppercase' }}>Leave Days Taken</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#4f46e5' }}>{summaryStats.totalDaysTaken}d</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#7c3aed', textTransform: 'uppercase' }}>Leave Liabilities</div>
              <div style={{ fontSize: '14px', fontWeight: '900', color: '#7c3aed' }}>{summaryStats.totalRemainingBalance}d</div>
            </div>
          </div>

          {/* Tabular Data */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px', marginBottom: '16px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1.5px solid #0f172a' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center', width: '25px' }}>#</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'left' }}>Staff Code & Name</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'left' }}>Department & Designation</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Attendant Status</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Days Present</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Today Clock In</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Attend %</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Entitlement</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Days Taken</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'center' }}>Remaining</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '5px', textAlign: 'left' }}>Active Leave Schedule</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((d, idx) => (
                <tr key={d.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: '#64748b' }}>
                    {idx + 1}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontWeight: 'bold' }}>
                    {d.name} <span style={{ color: '#4f46e5', fontSize: '8px' }}>({d.empCode})</span>
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                    <strong>{d.department}</strong> - {d.jobTitle}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                    {d.attendantStatus === 'Present' ? 'ON DUTY' : d.attendantStatus === 'OnLeave' ? 'ON LEAVE' : d.attendantStatus === 'Late' ? 'LATE' : 'OFF / ABSENT'}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                    {d.daysAttended}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontFamily: 'monospace' }}>
                    {d.todayClockIn}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                    {d.attendanceRate}%
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>
                    {d.totalEntitlement}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', color: '#059669', fontWeight: 'bold' }}>
                    {d.leaveDaysTaken}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', fontWeight: 'bold', color: d.leaveBalance <= 5 ? '#dc2626' : '#4f46e5' }}>
                    {d.leaveBalance}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1', padding: '4px', fontSize: '8.5px' }}>
                    {d.currentActiveLeave ? (
                      <span><strong>{d.currentActiveLeave.leaveType}</strong> ({d.currentActiveLeave.startDate} to {d.currentActiveLeave.endDate})</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sign-off Certification Blocks */}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', pageBreakInside: 'avoid' }}>
            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold' }}>PREPARED BY:</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '20px' }}>
                {currentUser?.name || 'Human Resources Officer'}
              </div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>HR Officer / Attendance Registrar</div>
            </div>

            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold' }}>VERIFIED & CERTIFIED BY:</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '20px' }}>
                Director of Human Resources
              </div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>Pope John Paul II Medical Centre</div>
            </div>

            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold' }}>APPROVED & ENDORSED BY:</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '20px' }}>
                Medical Director / Head of Facility
              </div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>Pope John Paul II Medical Centre</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
