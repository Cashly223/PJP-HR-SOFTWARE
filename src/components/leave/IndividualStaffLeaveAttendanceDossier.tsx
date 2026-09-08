import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  PlaneTakeoff,
  Search,
  ChevronDown,
  Building2,
  Phone,
  Mail,
  PenTool,
  Clock3,
  CalendarDays,
  User,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest } from '../../types/hrms';
import { printElementById } from '../../utils/printDocument';

interface IndividualStaffLeaveAttendanceDossierProps {
  selectedStaffId: string;
  onSelectStaffId: (id: string) => void;
  employees: Employee[];
  leaves: LeaveRequest[];
  attendance: AttendanceRecord[];
  selectedHospital: any;
  currentUser: any;
  showToast: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  initialReportScope?: 'all' | 'leaves' | 'attendance';
  initialPeriodPreset?:
    | 'this_month'
    | 'last_month'
    | 'this_quarter'
    | 'last_quarter'
    | 'year_to_date'
    | 'this_year'
    | 'last_year'
    | 'all_time'
    | 'custom';
  initialStartDate?: string;
  initialEndDate?: string;
}

export const IndividualStaffLeaveAttendanceDossier: React.FC<
  IndividualStaffLeaveAttendanceDossierProps
> = ({
  selectedStaffId,
  onSelectStaffId,
  employees,
  leaves,
  attendance,
  selectedHospital,
  currentUser,
  showToast,
  initialReportScope = 'all',
  initialPeriodPreset = 'year_to_date',
  initialStartDate,
  initialEndDate,
}) => {
  // Selective Generation Option: 'leaves' | 'attendance' | 'all'
  const [reportScope, setReportScope] = useState<'all' | 'leaves' | 'attendance'>(initialReportScope);

  React.useEffect(() => {
    if (initialReportScope) {
      setReportScope(initialReportScope);
    }
  }, [initialReportScope]);

  // Period filter presets
  const [periodPreset, setPeriodPreset] = useState<
    | 'this_month'
    | 'last_month'
    | 'this_quarter'
    | 'last_quarter'
    | 'year_to_date'
    | 'this_year'
    | 'last_year'
    | 'all_time'
    | 'custom'
  >(initialPeriodPreset);

  const [startDate, setStartDate] = useState<string>(() => {
    if (initialStartDate) return initialStartDate;
    const d = new Date();
    return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    if (initialEndDate) return initialEndDate;
    return new Date().toISOString().split('T')[0];
  });

  // Table filters inside view
  const [filterLeaveByPeriod, setFilterLeaveByPeriod] = useState<boolean>(true);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<'All' | 'Approved' | 'Pending' | 'Rejected'>('All');
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState<'all' | 'ontime' | 'late' | 'overtime'>('all');

  // Handle Preset Changes
  const handlePresetChange = (
    preset:
      | 'this_month'
      | 'last_month'
      | 'this_quarter'
      | 'last_quarter'
      | 'year_to_date'
      | 'this_year'
      | 'last_year'
      | 'all_time'
      | 'custom'
  ) => {
    setPeriodPreset(preset);
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();

    if (preset === 'this_month') {
      const first = new Date(y, m, 1);
      const last = new Date(y, m + 1, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'last_month') {
      const first = new Date(y, m - 1, 1);
      const last = new Date(y, m, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'this_quarter') {
      const q = Math.floor(m / 3);
      const first = new Date(y, q * 3, 1);
      const last = new Date(y, q * 3 + 3, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'last_quarter') {
      let q = Math.floor(m / 3) - 1;
      let qYear = y;
      if (q < 0) {
        q = 3;
        qYear = y - 1;
      }
      const first = new Date(qYear, q * 3, 1);
      const last = new Date(qYear, q * 3 + 3, 0);
      setStartDate(first.toISOString().split('T')[0]);
      setEndDate(last.toISOString().split('T')[0]);
    } else if (preset === 'year_to_date') {
      const jan1 = new Date(y, 0, 1);
      setStartDate(jan1.toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
    } else if (preset === 'this_year') {
      const jan1 = new Date(y, 0, 1);
      const dec31 = new Date(y, 11, 31);
      setStartDate(jan1.toISOString().split('T')[0]);
      setEndDate(dec31.toISOString().split('T')[0]);
    } else if (preset === 'last_year') {
      const jan1 = new Date(y - 1, 0, 1);
      const dec31 = new Date(y - 1, 11, 31);
      setStartDate(jan1.toISOString().split('T')[0]);
      setEndDate(dec31.toISOString().split('T')[0]);
    } else if (preset === 'all_time') {
      setStartDate('2020-01-01');
      setEndDate(new Date().toISOString().split('T')[0]);
    }
  };

  // Resolve target employee
  const selectedEmployee = useMemo(() => {
    return (
      (employees || []).find((e) => e && e.id === selectedStaffId) ||
      (employees || [])[0] ||
      null
    );
  }, [employees, selectedStaffId]);

  // All Leave History for this employee
  const allStaffLeaves = useMemo(() => {
    if (!selectedEmployee) return [];
    return (leaves || [])
      .filter((l) => l && l.employeeId === selectedEmployee.id)
      .sort((a, b) => {
        const dateA = new Date(a.startDate || a.appliedAt || 0).getTime();
        const dateB = new Date(b.startDate || b.appliedAt || 0).getTime();
        return dateB - dateA;
      });
  }, [leaves, selectedEmployee]);

  // Leave records specifically in or overlapping the selected period
  const periodStaffLeaves = useMemo(() => {
    if (!selectedEmployee) return [];
    if (periodPreset === 'all_time') return allStaffLeaves;

    return allStaffLeaves.filter((l) => {
      const start = l.startDate || '';
      const end = l.endDate || start || '';
      if (start && end) {
        return start <= endDate && end >= startDate;
      }
      if (start) {
        return start >= startDate && start <= endDate;
      }
      if (l.appliedAt) {
        const appDate = l.appliedAt.slice(0, 10);
        return appDate >= startDate && appDate <= endDate;
      }
      return false;
    });
  }, [allStaffLeaves, periodPreset, startDate, endDate, selectedEmployee]);

  // Displayed leaves based on toggle and filters
  const displayedLeaves = useMemo(() => {
    let list = filterLeaveByPeriod ? periodStaffLeaves : allStaffLeaves;
    if (leaveStatusFilter !== 'All') {
      list = list.filter((l) => l.status === leaveStatusFilter);
    }
    return list;
  }, [filterLeaveByPeriod, periodStaffLeaves, allStaffLeaves, leaveStatusFilter]);

  // Attendance History for this employee strictly in the selected period
  const staffAttendance = useMemo(() => {
    if (!selectedEmployee) return [];
    return (attendance || [])
      .filter((a) => {
        if (!a || a.employeeId !== selectedEmployee.id) return false;
        if (!a.date) return false;
        if (periodPreset === 'all_time') return true;
        return a.date >= startDate && a.date <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendance, selectedEmployee, startDate, endDate, periodPreset]);

  // Displayed attendance based on filter
  const displayedAttendance = useMemo(() => {
    if (attendanceStatusFilter === 'all') return staffAttendance;
    if (attendanceStatusFilter === 'late') {
      return staffAttendance.filter((a) => {
        if (!a.clockIn) return false;
        const parts = a.clockIn.split(':');
        const hr = parseInt(parts[0], 10);
        const min = parseInt(parts[1] || '0', 10);
        return hr > 8 || (hr === 8 && min > 15);
      });
    }
    if (attendanceStatusFilter === 'ontime') {
      return staffAttendance.filter((a) => {
        if (!a.clockIn) return false;
        const parts = a.clockIn.split(':');
        const hr = parseInt(parts[0], 10);
        const min = parseInt(parts[1] || '0', 10);
        return hr < 8 || (hr === 8 && min <= 15);
      });
    }
    if (attendanceStatusFilter === 'overtime') {
      return staffAttendance.filter((a) => (Number(a.overtimeHours) || 0) > 0);
    }
    return staffAttendance;
  }, [staffAttendance, attendanceStatusFilter]);

  // Active leave today
  const approvedLeaves = useMemo(() => {
    return allStaffLeaves.filter((l) => l.status === 'Approved');
  }, [allStaffLeaves]);

  const todayStr = new Date().toISOString().split('T')[0];
  const activeLeaveToday = useMemo(() => {
    return approvedLeaves.find((l) => todayStr >= l.startDate && todayStr <= l.endDate);
  }, [approvedLeaves, todayStr]);

  // Leave Entitlement & Metrics
  const annualEntitlement = selectedEmployee?.leaveEntitlement || 30;
  const deferredLeaveDays = selectedEmployee?.deferredLeaveDays || 0;
  const totalEntitlement = annualEntitlement + deferredLeaveDays;

  const totalApprovedDaysTaken = useMemo(() => {
    return approvedLeaves.reduce(
      (acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0),
      0
    );
  }, [approvedLeaves]);

  const periodApprovedDaysTaken = useMemo(() => {
    return periodStaffLeaves
      .filter((l) => l.status === 'Approved')
      .reduce((acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0), 0);
  }, [periodStaffLeaves]);

  const pendingLeaves = useMemo(() => {
    return allStaffLeaves.filter((l) => l.status === 'Pending' || l.status === 'Pending Approval' || l.status === 'Under Review');
  }, [allStaffLeaves]);

  const pendingDaysRequested = useMemo(() => {
    return pendingLeaves.reduce(
      (acc, l) => acc + (l.daysGranted || l.totalDays || (l as any).days || 0),
      0
    );
  }, [pendingLeaves]);

  const remainingLeaveBalance = Math.max(0, totalEntitlement - totalApprovedDaysTaken);

  const leaveUtilizationRate =
    totalEntitlement > 0
      ? Math.min(100, Math.round((totalApprovedDaysTaken / totalEntitlement) * 100))
      : 0;

  const staffLeaves = allStaffLeaves;
  const approvedDaysTaken = totalApprovedDaysTaken;

  // Attendance Metrics
  const daysAttended = useMemo(() => {
    return staffAttendance.filter((a) => Boolean(a.clockIn)).length;
  }, [staffAttendance]);

  let lateArrivalCount = 0;
  let totalDelayMins = 0;
  let totalOvertimeHours = 0;
  let totalHoursWorkedInPeriod = 0;

  staffAttendance.forEach((a) => {
    if (a.clockIn) {
      const parts = a.clockIn.split(':');
      const hr = parseInt(parts[0], 10);
      const min = parseInt(parts[1] || '0', 10);
      if (hr > 8 || (hr === 8 && min > 15)) {
        lateArrivalCount++;
        totalDelayMins += (hr - 8) * 60 + (min - 15);
      }
    }
    if (a.hoursWorked) {
      totalHoursWorkedInPeriod += Number(a.hoursWorked) || 0;
    } else if (a.clockIn) {
      totalHoursWorkedInPeriod += 8;
    }
    if (a.overtimeHours) {
      totalOvertimeHours += Number(a.overtimeHours) || 0;
    }
  });

  const onTimePercentage =
    daysAttended > 0 ? Math.round(((daysAttended - lateArrivalCount) / daysAttended) * 100) : 100;

  // Today's attendance
  const todayAttendanceRecord = (attendance || []).find(
    (a) => a && a.employeeId === selectedEmployee?.id && a.date === todayStr
  );

  // Duty Status String
  let currentDutyStatus = 'Off Duty';
  let dutyStatusBadgeClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (activeLeaveToday) {
    currentDutyStatus = `On Leave: ${activeLeaveToday.leaveType}`;
    dutyStatusBadgeClass =
      'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700';
  } else if (todayAttendanceRecord?.clockIn) {
    const hr = parseInt(todayAttendanceRecord.clockIn.split(':')[0], 10);
    const min = parseInt(todayAttendanceRecord.clockIn.split(':')[1] || '0', 10);
    if (hr > 8 || (hr === 8 && min > 15)) {
      currentDutyStatus = `Present (Late at ${todayAttendanceRecord.clockIn})`;
      dutyStatusBadgeClass =
        'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-300 dark:border-orange-700';
    } else {
      currentDutyStatus = `Present on Duty (In: ${todayAttendanceRecord.clockIn})`;
      dutyStatusBadgeClass =
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700';
    }
  } else if (daysAttended > 0) {
    currentDutyStatus = 'Active Duty Roster';
    dutyStatusBadgeClass =
      'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
  }

  // Print Handler
  const handlePrintStaffDossier = () => {
    if (!selectedEmployee) return;
    const staffCode = selectedEmployee.employeeCode || selectedEmployee.empCode || 'Staff';
    const cleanLastName = selectedEmployee.lastName || 'Member';
    let docTitle = `PJPIIMC_Staff_Dossier_${staffCode}_${cleanLastName}`;
    if (reportScope === 'leaves') {
      docTitle = `PJPIIMC_Staff_Leave_History_${staffCode}_${cleanLastName}_${startDate}_to_${endDate}`;
    } else if (reportScope === 'attendance') {
      docTitle = `PJPIIMC_Staff_Attendance_Audit_${staffCode}_${cleanLastName}_${startDate}_to_${endDate}`;
    }

    printElementById('individual-staff-dossier-print', docTitle, {
      landscape: false,
    });
  };

  // CSV Export Handler
  const handleExportStaffCSV = () => {
    if (!selectedEmployee) return;

    const hospitalTitle = selectedHospital?.name || 'POPE JOHN PAUL II MEDICAL CENTRE (PJPIIMC)';
    const staffCode = selectedEmployee.employeeCode || selectedEmployee.empCode || 'PJPIIMC-STF';
    const fullName = `${selectedEmployee.firstName} ${selectedEmployee.lastName}`;

    let reportTitle = 'OFFICIAL INDIVIDUAL STAFF DOSSIER (LEAVE & ATTENDANCE)';
    if (reportScope === 'leaves') {
      reportTitle = 'OFFICIAL STAFF LEAVE HISTORY & USAGE AUDIT REPORT';
    } else if (reportScope === 'attendance') {
      reportTitle = 'OFFICIAL BIOMETRIC DUTY ATTENDANCE & PUNCTUALITY AUDIT REPORT';
    }

    let csvContent =
      'data:text/csv;charset=utf-8,' +
      `"${hospitalTitle} - ${reportTitle}"\n` +
      `"STAFF NAME: ${fullName} | STAFF CODE: ${staffCode}"\n` +
      `"DEPARTMENT: ${selectedEmployee.department} | UNIT: ${selectedEmployee.unit || 'General'} | DESIGNATION: ${selectedEmployee.jobTitle}"\n` +
      `"AUDIT PERIOD: ${startDate} to ${endDate} (${periodPreset.toUpperCase().replace(/_/g, ' ')})"\n`;

    if (reportScope === 'leaves' || reportScope === 'all') {
      csvContent +=
        `"LEAVE ENTITLEMENT: ${annualEntitlement} Days | DEFERRED: ${deferredLeaveDays} Days | TOTAL: ${totalEntitlement} Days"\n` +
        `"PERIOD APPROVED LEAVE TAKEN: ${periodApprovedDaysTaken} Days | ALL-TIME APPROVED TAKEN: ${totalApprovedDaysTaken} Days | REMAINING BALANCE: ${remainingLeaveBalance} Days"\n`;
    }

    if (reportScope === 'attendance' || reportScope === 'all') {
      csvContent +=
        `"ATTENDANCE: ${daysAttended} Shifts in Period | ON-TIME RATE: ${onTimePercentage}% | LATE COMINGS: ${lateArrivalCount} | DELAY MINS: ${totalDelayMins}m | OVERTIME: ${totalOvertimeHours} Hrs"\n`;
    }

    csvContent +=
      `"GENERATED ON: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} by ${currentUser?.name || 'HR Officer'}"\n\n`;

    if (reportScope === 'leaves' || reportScope === 'all') {
      csvContent +=
        `"=== PART 1: LEAVE HISTORY LEDGER ==="\n` +
        `"Leave Type","Year","Start Date","End Date","Resumption Date","Days Granted","Status","Reason / Reliever","Approving Authority"\n`;

      const leavesToExport = filterLeaveByPeriod ? periodStaffLeaves : allStaffLeaves;
      leavesToExport.forEach((l) => {
        const type = l.leaveType;
        const year = l.leaveYear || new Date(l.startDate).getFullYear();
        const start = l.startDate;
        const end = l.endDate;
        const res = l.resumptionDate || l.dateOfReporting || '--';
        const days = l.daysGranted || l.totalDays || (l as any).days || 0;
        const status = l.status;
        const reasonStr = (l.reason || '').replace(/"/g, '""');
        const approver = l.approvedBy || (l.status === 'Approved' ? 'HR Directorate' : 'In Workflow');

        csvContent += `"${type}",${year},"${start}","${end}","${res}",${days},"${status}","${reasonStr}","${approver}"\n`;
      });
    }

    if (reportScope === 'attendance' || reportScope === 'all') {
      csvContent +=
        `\n"=== PART 2: BIOMETRIC DUTY ATTENDANCE LEDGER ==="\n` +
        `"Date","Clock In","Clock Out","Hours Worked","Delay (Mins)","Overtime (Hrs)","Biometric Method","Attendance Status"\n`;

      staffAttendance.forEach((a) => {
        let delay = 0;
        if (a.clockIn) {
          const parts = a.clockIn.split(':');
          const hr = parseInt(parts[0], 10);
          const min = parseInt(parts[1] || '0', 10);
          if (hr > 8 || (hr === 8 && min > 15)) {
            delay = (hr - 8) * 60 + (min - 15);
          }
        }

        csvContent += `"${a.date}","${a.clockIn || '--'}","${a.clockOut || '--'}",${a.hoursWorked || 8},${delay},${a.overtimeHours || 0},"${a.verificationMethod || 'Biometric'}","${a.status || 'Present'}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    let fileName = `PJPIIMC_Staff_Dossier_${staffCode}_${selectedEmployee.lastName}.csv`;
    if (reportScope === 'leaves') {
      fileName = `PJPIIMC_Leave_History_${staffCode}_${selectedEmployee.lastName}_${startDate}_to_${endDate}.csv`;
    } else if (reportScope === 'attendance') {
      fileName = `PJPIIMC_Attendance_Audit_${staffCode}_${selectedEmployee.lastName}_${startDate}_to_${endDate}.csv`;
    }
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const toastScope = reportScope === 'leaves' ? 'Leave History' : reportScope === 'attendance' ? 'Attendance Audit' : 'Staff Dossier';
    showToast('success', `${toastScope} Exported`, `CSV for ${fullName} (${startDate} to ${endDate}) downloaded successfully.`);
  };

  if (!selectedEmployee) {
    return (
      <div className="p-12 text-center text-slate-500">
        <User className="h-12 w-12 mx-auto text-slate-400 mb-3" />
        <p className="text-base font-bold">No employee selected</p>
        <p className="text-xs">Please choose an employee from the staff directory.</p>
      </div>
    );
  }

  // Calculate days in period
  const periodDaysCount = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    if (isNaN(s) || isNaN(e) || e < s) return 0;
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* 1. Interactive Staff Selector & Selective Report Scope Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        {/* Row 1: Staff Picker Dropdown & Action Buttons */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Select Staff Member:</span>
            </label>
            <div className="relative">
              <select
                value={selectedStaffId}
                onChange={(e) => onSelectStaffId(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-purple-300 dark:border-purple-700 text-sm font-bold text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                {(employees || []).filter(Boolean).map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    [{emp.employeeCode || emp.empCode || 'SJH-1001'}] {emp.firstName} {emp.lastName} — {emp.department} ({emp.jobTitle})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-purple-500 pointer-events-none" />
            </div>
          </div>

          {/* Quick Action Buttons tailored to active selection */}
          <div className="flex items-center gap-2 self-end lg:self-end pt-2 lg:pt-0">
            <button
              onClick={handleExportStaffCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-300 dark:border-slate-700 shadow-sm"
              title={`Download CSV ${reportScope === 'leaves' ? 'Leave History' : reportScope === 'attendance' ? 'Attendance Audit' : 'Complete Dossier'}`}
            >
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {reportScope === 'leaves'
                  ? 'Export Leave CSV'
                  : reportScope === 'attendance'
                  ? 'Export Attendance CSV'
                  : 'Export Dossier CSV'}
              </span>
            </button>
            <button
              onClick={handlePrintStaffDossier}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-purple-950/30 active:scale-95"
              title="Print official letterhead document for the selected option"
            >
              <Printer className="h-4 w-4 text-amber-300" />
              <span>
                {reportScope === 'leaves'
                  ? 'Print Leave Report'
                  : reportScope === 'attendance'
                  ? 'Print Attendance Audit'
                  : 'Print Official Dossier'}
              </span>
            </button>
          </div>
        </div>

        {/* Row 2: Selective Report Option Switcher (Leave History Only / Attendance Only / Combined) */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Selective Report Scope (Choose what to generate):</span>
            </span>
            <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
              {reportScope === 'leaves' && '📋 Generating Leave History Audit'}
              {reportScope === 'attendance' && '⏱️ Generating Biometric Attendance Audit'}
              {reportScope === 'all' && '📑 Generating Full Personnel Dossier (Both)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Option 1: Leave History Only */}
            <button
              type="button"
              onClick={() => setReportScope('leaves')}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                reportScope === 'leaves'
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 shadow-md ring-2 ring-purple-500/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${reportScope === 'leaves' ? 'bg-purple-600 text-white' : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300'}`}>
                    <PlaneTakeoff className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Leave History Only
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Entitlement, days taken, pending & balance
                    </div>
                  </div>
                </div>
                {reportScope === 'leaves' && (
                  <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                )}
              </div>
            </button>

            {/* Option 2: Duty Attendance Only */}
            <button
              type="button"
              onClick={() => setReportScope('attendance')}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                reportScope === 'attendance'
                  ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${reportScope === 'attendance' ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Duty Attendance Only
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Clock-in/out, lateness, hours & overtime
                    </div>
                  </div>
                </div>
                {reportScope === 'attendance' && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                )}
              </div>
            </button>

            {/* Option 3: Combined Dossier */}
            <button
              type="button"
              onClick={() => setReportScope('all')}
              className={`p-3 rounded-2xl border text-left transition relative flex flex-col justify-between ${
                reportScope === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${reportScope === 'all' ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 dark:text-white">
                      Combined (Both)
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Integrated leave ledger and attendance logs
                    </div>
                  </div>
                </div>
                {reportScope === 'all' && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Row 3: Period Selection Presets & Manual Date Range Inputs */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
              <span className="text-[10px] uppercase text-slate-400 font-extrabold px-2">
                Period:
              </span>
              <button
                type="button"
                onClick={() => handlePresetChange('this_month')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'this_month'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('last_month')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'last_month'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('this_quarter')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'this_quarter'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                This Quarter
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('last_quarter')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'last_quarter'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                Last Quarter
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('year_to_date')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'year_to_date'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                Year to Date
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('this_year')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'this_year'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                {new Date().getFullYear()}
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('last_year')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'last_year'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                {new Date().getFullYear() - 1}
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange('all_time')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  periodPreset === 'all_time'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:white'
                }`}
              >
                All Records
              </button>
            </div>

            {/* Date Pickers */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
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
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
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

              <span className="px-2.5 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 font-mono font-black text-[11px]">
                {periodDaysCount} days
              </span>
            </div>
          </div>

          {/* Optional specific filter sub-bars */}
          {(reportScope === 'leaves' || reportScope === 'all') && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-slate-600 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800">
              <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={filterLeaveByPeriod}
                  onChange={(e) => setFilterLeaveByPeriod(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span>
                  Filter leave ledger to leaves starting/ending in this period ({periodStaffLeaves.length} matching / {allStaffLeaves.length} total)
                </span>
              </label>

              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Leave Status:</span>
                {(['All', 'Approved', 'Pending', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLeaveStatusFilter(st)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      leaveStatusFilter === st
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(reportScope === 'attendance' || reportScope === 'all') && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 border-t border-dashed border-slate-200 dark:border-slate-800">
              <span className="font-medium">
                Biometric shifts recorded in this period: <strong>{staffAttendance.length} shifts</strong>
              </span>

              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Shift Filter:</span>
                {[
                  { id: 'all', label: 'All Shifts' },
                  { id: 'ontime', label: 'On-Time' },
                  { id: 'late', label: 'Late Arrivals' },
                  { id: 'overtime', label: 'Overtime' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setAttendanceStatusFilter(st.id as any)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition ${
                      attendanceStatusFilter === st.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Staff Profile Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={
                selectedEmployee.photo ||
                'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
              }
              alt={selectedEmployee.firstName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-purple-500 shadow-md"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </h3>
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-mono font-bold text-xs">
                  {selectedEmployee.employeeCode || selectedEmployee.empCode || 'SJH-1001'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dutyStatusBadgeClass}`}>
                  {currentDutyStatus}
                </span>
              </div>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {selectedEmployee.jobTitle} • {selectedEmployee.department} ({selectedEmployee.unit || 'Clinical Unit'})
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2">
                {selectedEmployee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEmployee.phone}</span>
                  </span>
                )}
                {selectedEmployee.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedEmployee.email}</span>
                  </span>
                )}
                {selectedEmployee.hireDate && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined: {selectedEmployee.hireDate}</span>
                  </span>
                )}
                <span className="flex items-center gap-1 font-semibold">
                  <PenTool className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {selectedEmployee.digitalSignatureUrl ? 'Digital Signature Active' : 'No Digital Signature'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-extrabold text-slate-400">Hospital Facility</span>
            <div className="text-sm font-black text-slate-800 dark:text-slate-200">
              {selectedHospital?.name || 'Pope John Paul II Medical Centre'}
            </div>
            <span className="text-[11px] text-slate-500">Catholic Health Service Trust (CHST)</span>
          </div>
        </div>
      </div>

      {/* 3. Selective Analytics KPI Cards based on reportScope */}
      {reportScope === 'leaves' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Entitlement */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">
              Annual Entitlement
            </span>
            <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
              {totalEntitlement}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
              {annualEntitlement}a + {deferredLeaveDays} deferred
            </p>
          </div>

          {/* Period Leave Taken */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
              Leave in Period
            </span>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {periodApprovedDaysTaken}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Approved days in period
            </p>
          </div>

          {/* All-Time Approved Taken */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase block">
              Total Taken (YTD)
            </span>
            <div className="text-2xl font-black text-teal-900 dark:text-teal-200 mt-1">
              {totalApprovedDaysTaken}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">
              {leaveUtilizationRate}% annual rate
            </p>
          </div>

          {/* Remaining Balance */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
              Remaining Balance
            </span>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">
              {remainingLeaveBalance}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
              Available to take
            </p>
          </div>

          {/* Pending Requested */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
              Pending Approval
            </span>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
              {pendingDaysRequested}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
              {pendingLeaves.length} applications
            </p>
          </div>

          {/* Active Status */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase block">
              Today's Leave Status
            </span>
            <div className="text-sm font-black text-rose-900 dark:text-rose-200 mt-1 truncate">
              {activeLeaveToday ? activeLeaveToday.leaveType : 'On Active Duty'}
            </div>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5 truncate">
              {activeLeaveToday ? `Until ${activeLeaveToday.endDate}` : 'No leave today'}
            </p>
          </div>
        </div>
      )}

      {reportScope === 'attendance' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Shifts Attended */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">
              Duty Shifts
            </span>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">
              {daysAttended}
              <span className="text-xs font-semibold ml-0.5">shifts</span>
            </div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">In selected period</p>
          </div>

          {/* Punctuality Rate */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase block">
              On-Time Punctuality
            </span>
            <div className="text-2xl font-black text-teal-900 dark:text-teal-200 mt-1">
              {onTimePercentage}%
            </div>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">Punctual arrival rate</p>
          </div>

          {/* Late Comings */}
          <div className="p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60">
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-300 uppercase block">
              Late Arrivals
            </span>
            <div className="text-2xl font-black text-orange-900 dark:text-orange-200 mt-1">
              {lateArrivalCount}
              <span className="text-xs font-semibold ml-0.5">times</span>
            </div>
            <p className="text-[10px] text-orange-600 dark:text-orange-400 mt-0.5">Past 08:15 AM</p>
          </div>

          {/* Total Delay Mins */}
          <div className="p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase block">
              Lateness Delay
            </span>
            <div className="text-2xl font-black text-rose-900 dark:text-rose-200 mt-1">
              {totalDelayMins}
              <span className="text-xs font-semibold ml-0.5">m</span>
            </div>
            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Cumulative minutes</p>
          </div>

          {/* Overtime Hours */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
              Overtime Logged
            </span>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
              {totalOvertimeHours}
              <span className="text-xs font-semibold ml-0.5">hrs</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Extra duty shifts</p>
          </div>

          {/* Today's Clock In */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
              Today's Clock-In
            </span>
            <div className="text-sm font-black text-emerald-900 dark:text-emerald-200 mt-1 font-mono">
              {todayAttendanceRecord?.clockIn ? `${todayAttendanceRecord.clockIn} (In)` : 'Not Clocked'}
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              Out: {todayAttendanceRecord?.clockOut || '--'}
            </p>
          </div>
        </div>
      )}

      {reportScope === 'all' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Entitlement */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase block">
              Leave Entitlement
            </span>
            <div className="text-2xl font-black text-indigo-900 dark:text-indigo-200 mt-1">
              {totalEntitlement}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-0.5">
              {annualEntitlement}a + {deferredLeaveDays}def
            </p>
          </div>

          {/* Days Taken in Period */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">
              Leave in Period
            </span>
            <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200 mt-1">
              {periodApprovedDaysTaken}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalApprovedDaysTaken}d total YTD
            </p>
          </div>

          {/* Leave Balance */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
              Leave Balance
            </span>
            <div className="text-2xl font-black text-purple-900 dark:text-purple-200 mt-1">
              {remainingLeaveBalance}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5">
              {pendingDaysRequested > 0 ? `${pendingDaysRequested}d pending` : 'Net remaining'}
            </p>
          </div>

          {/* Shifts Attended */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">
              Shifts Attended
            </span>
            <div className="text-2xl font-black text-blue-900 dark:text-blue-200 mt-1">
              {daysAttended}
              <span className="text-xs font-semibold ml-0.5">d</span>
            </div>
            <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">In selected period</p>
          </div>

          {/* Punctuality Rate */}
          <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60">
            <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase block">
              On-Time Punctuality
            </span>
            <div className="text-2xl font-black text-teal-900 dark:text-teal-200 mt-1">
              {onTimePercentage}%
            </div>
            <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">
              {lateArrivalCount} late arrivals
            </p>
          </div>

          {/* Overtime Hours */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase block">
              Total Overtime
            </span>
            <div className="text-2xl font-black text-amber-900 dark:text-amber-200 mt-1">
              {totalOvertimeHours}
              <span className="text-xs font-semibold ml-0.5">hrs</span>
            </div>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Extra duty hours</p>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab Switcher: 'all' | 'leaves' | 'attendance' */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportScope('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportScope === 'all'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Unified Dossier (Both)</span>
          </button>

          <button
            onClick={() => setReportScope('leaves')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportScope === 'leaves'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <PlaneTakeoff className="w-3.5 h-3.5 text-amber-400" />
            <span>Leave History ({allStaffLeaves.length})</span>
          </button>

          <button
            onClick={() => setReportScope('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              reportScope === 'attendance'
                ? 'bg-purple-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Biometric Attendance ({staffAttendance.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          Showing records for <strong>{selectedEmployee.firstName} {selectedEmployee.lastName}</strong>
        </span>
      </div>

      {/* 5. TABLE SECTION A: COMPLETE LEAVE HISTORY */}
      {(reportScope === 'all' || reportScope === 'leaves') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <PlaneTakeoff className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Official Leave History Ledger</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                {displayedLeaves.length} records
              </span>
            </h4>
            <span className="text-xs text-slate-500">
              Total Approved Days: <strong className="text-emerald-600">{approvedDaysTaken}d</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4 text-center">Year</th>
                  <th className="py-3 px-4 text-center">Duration</th>
                  <th className="py-3 px-4">Commence Date</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4">Resumption</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Relief / Reason</th>
                  <th className="py-3 px-4">Approval Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {displayedLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400 italic">
                      No leave applications or leave history on file for this staff member.
                    </td>
                  </tr>
                ) : (
                  displayedLeaves.map((leave, idx) => {
                    const days = leave.daysGranted || leave.totalDays || (leave as any).days || 0;
                    return (
                      <tr
                        key={leave.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-3 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                            {leave.leaveType}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          {leave.leaveYear || new Date(leave.startDate).getFullYear()}
                        </td>
                        <td className="py-3 px-4 text-center font-black text-purple-600 dark:text-purple-400">
                          {days} days
                        </td>
                        <td className="py-3 px-4 font-mono">{leave.startDate}</td>
                        <td className="py-3 px-4 font-mono">{leave.endDate}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {leave.resumptionDate || leave.dateOfReporting || '--'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              leave.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                : leave.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-600 dark:text-slate-400">
                          {leave.reason || 'Staff mandatory annual leave rest'}
                        </td>
                        <td className="py-3 px-4 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          {leave.approvedBy || (leave.status === 'Approved' ? 'HR Directorate' : 'In Workflow')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TABLE SECTION B: COMPLETE ATTENDANCE & BIOMETRIC DUTY LOGS */}
      {(reportScope === 'all' || reportScope === 'attendance') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Biometric Duty Attendance & Clock-In Ledger</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-bold">
                {staffAttendance.length} records ({startDate} to {endDate})
              </span>
            </h4>
            <span className="text-xs text-slate-500">
              On-Time Rate: <strong className="text-teal-600">{onTimePercentage}%</strong>
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Duty Date</th>
                  <th className="py-3 px-4 text-center">Clock In</th>
                  <th className="py-3 px-4 text-center">Clock Out</th>
                  <th className="py-3 px-4 text-center">Total Hours</th>
                  <th className="py-3 px-4 text-center">Lateness Delay</th>
                  <th className="py-3 px-4 text-center">Overtime</th>
                  <th className="py-3 px-4">Verification Method</th>
                  <th className="py-3 px-4 text-center">Duty Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {staffAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                      No attendance records logged for this staff member in the selected audit period ({startDate} to {endDate}).
                    </td>
                  </tr>
                ) : (
                  staffAttendance.map((rec, idx) => {
                    let delay = 0;
                    if (rec.clockIn) {
                      const parts = rec.clockIn.split(':');
                      const hr = parseInt(parts[0], 10);
                      const min = parseInt(parts[1] || '0', 10);
                      if (hr > 8 || (hr === 8 && min > 15)) {
                        delay = (hr - 8) * 60 + (min - 15);
                      }
                    }

                    const isLate = delay > 0;

                    return (
                      <tr
                        key={rec.id || idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition"
                      >
                        <td className="py-2.5 px-4 font-mono text-slate-400 font-bold">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          {rec.date}
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold">
                          <span
                            className={
                              isLate ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-200'
                            }
                          >
                            {rec.clockIn || '--:--'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-semibold text-slate-500">
                          {rec.clockOut || '--:--'}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold">
                          {rec.hoursWorked || 8} hrs
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          {delay > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                              +{delay} mins
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-bold text-[11px]">On Time</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-center font-bold text-amber-600 dark:text-amber-400">
                          {rec.overtimeHours ? `${rec.overtimeHours}h` : '0h'}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                          {rec.verificationMethod || 'Biometric Fingerprint'}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLate
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {isLate ? 'Late Arrival' : 'Present'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. HIDDEN PRINTABLE CONTAINER FOR INDIVIDUAL STAFF DOSSIER (A4 Formatted) */}
      <div id="individual-staff-dossier-print" className="hidden">
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#0f172a', padding: '16px', fontSize: '10px' }}>
          {/* Official Letterhead */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '2.5px solid #0f172a',
              paddingBottom: '8px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '9px',
                fontWeight: 'bold',
                letterSpacing: '2px',
                color: '#64748b',
                textTransform: 'uppercase',
              }}
            >
              CATHOLIC HEALTH SERVICE TRUST (CHST) • ARCHDIOCESE OF KUMASI
            </div>
            <h1
              style={{
                margin: '3px 0',
                fontSize: '18px',
                fontWeight: '900',
                color: '#0f172a',
                textTransform: 'uppercase',
              }}
            >
              {selectedHospital?.name || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI'}
            </h1>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '800',
                color: '#4f46e5',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginTop: '2px',
              }}
            >
              DIRECTORATE OF HUMAN RESOURCES & STAFF ADMINISTRATION
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 'bold',
                color: '#0f172a',
                marginTop: '6px',
                textDecoration: 'underline',
              }}
            >
              {reportScope === 'leaves'
                ? 'CONFIDENTIAL OFFICIAL STAFF LEAVE AUDIT & USAGE STATEMENT'
                : reportScope === 'attendance'
                ? 'CONFIDENTIAL OFFICIAL BIOMETRIC DUTY ATTENDANCE & PUNCTUALITY AUDIT'
                : 'CONFIDENTIAL OFFICIAL STAFF LEAVE HISTORY & BIOMETRIC ATTENDANCE DOSSIER'}
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                color: '#475569',
                marginTop: '6px',
                fontWeight: '600',
              }}
            >
              <span>AUDIT PERIOD: <strong>{startDate}</strong> TO <strong>{endDate}</strong></span>
              <span>DATE GENERATED: <strong>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</strong></span>
              <span>
                REF NO:{' '}
                <strong>
                  PJPIIMC/HR/DOSSIER/{selectedEmployee.employeeCode || selectedEmployee.empCode || 'STF'}/
                  {new Date().getFullYear()}
                </strong>
              </span>
            </div>
          </div>

          {/* Staff Particulars Box */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '6px',
              padding: '10px',
              marginBottom: '12px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <tbody>
                <tr>
                  <td style={{ width: '18%', fontWeight: 'bold', color: '#64748b' }}>STAFF FULL NAME:</td>
                  <td style={{ width: '32%', fontWeight: 'bold', fontSize: '12px', color: '#0f172a' }}>
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </td>
                  <td style={{ width: '18%', fontWeight: 'bold', color: '#64748b' }}>STAFF ID CODE:</td>
                  <td style={{ width: '32%', fontWeight: 'bold', fontFamily: 'monospace', color: '#4f46e5' }}>
                    {selectedEmployee.employeeCode || selectedEmployee.empCode || 'SJH-1001'}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', color: '#64748b', paddingTop: '4px' }}>DEPARTMENT:</td>
                  <td style={{ fontWeight: 'bold', color: '#0f172a', paddingTop: '4px' }}>
                    {selectedEmployee.department}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#64748b', paddingTop: '4px' }}>CLINICAL UNIT / POST:</td>
                  <td style={{ fontWeight: 'bold', color: '#0f172a', paddingTop: '4px' }}>
                    {selectedEmployee.unit || 'General'} — {selectedEmployee.jobTitle}
                  </td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 'bold', color: '#64748b', paddingTop: '4px' }}>CONTACT PHONE:</td>
                  <td style={{ color: '#0f172a', paddingTop: '4px' }}>
                    {selectedEmployee.phone || '+233 20 555 0192'}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#64748b', paddingTop: '4px' }}>CURRENT DUTY STATUS:</td>
                  <td style={{ fontWeight: 'bold', color: '#059669', paddingTop: '4px' }}>
                    {currentDutyStatus.toUpperCase()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statistical Accounts Summary Box */}
          {reportScope === 'leaves' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '6px',
                backgroundColor: '#f1f5f9',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Annual Entitlement
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#4f46e5' }}>{totalEntitlement} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Taken in Period
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#059669' }}>{periodApprovedDaysTaken} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Total Taken (YTD)
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0284c7' }}>{totalApprovedDaysTaken} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Remaining Balance
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#7c3aed' }}>{remainingLeaveBalance} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Pending Requests
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#d97706' }}>{pendingDaysRequested} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Utilization Rate
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0d9488' }}>
                  {totalEntitlement > 0 ? Math.round((totalApprovedDaysTaken / totalEntitlement) * 100) : 0}%
                </div>
              </div>
            </div>
          ) : reportScope === 'attendance' ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '6px',
                backgroundColor: '#f1f5f9',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Duty Shifts Logged
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0284c7' }}>{daysAttended} Shifts</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Punctuality Rate
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0d9488' }}>{onTimePercentage}%</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Late Arrivals
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#dc2626' }}>{lateArrivalCount} Shifts</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Total Delay (Mins)
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#ea580c' }}>{totalDelayMins} mins</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Overtime Hours
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#d97706' }}>{totalOvertimeHours} Hours</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Total Hours Worked
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#4f46e5' }}>
                  {totalHoursWorkedInPeriod} hrs
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, 1fr)',
                gap: '6px',
                backgroundColor: '#f1f5f9',
                padding: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                marginBottom: '12px',
                textAlign: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Annual Entitlement
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#4f46e5' }}>{totalEntitlement} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Leave in Period
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#059669' }}>{periodApprovedDaysTaken} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Remaining Balance
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#7c3aed' }}>{remainingLeaveBalance} Days</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Duty Shifts Logged
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0284c7' }}>{daysAttended} Shifts</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Punctuality Rate
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0d9488' }}>{onTimePercentage}%</div>
              </div>
              <div>
                <div style={{ fontSize: '8px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>
                  Overtime Hours
                </div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#d97706' }}>{totalOvertimeHours} Hours</div>
              </div>
            </div>
          )}

          {/* Section 1: Leave History Ledger Table */}
          {(reportScope === 'leaves' || reportScope === 'all') && (
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  borderBottom: '1px solid #94a3b8',
                  paddingBottom: '3px',
                  marginBottom: '6px',
                }}
              >
                {reportScope === 'leaves' ? '1.' : '1.'} OFFICIAL LEAVE HISTORY & USAGE AUDIT ({staffLeaves.length} records)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', width: '20px' }}>#</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'left' }}>Leave Type</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Year</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Days</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Commence Date</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>End Date</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Resumption</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Status</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'left' }}>Approving Authority</th>
                  </tr>
                </thead>
                <tbody>
                  {staffLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', color: '#64748b' }}>
                        No leave history records on file for this staff member in this period.
                      </td>
                    </tr>
                  ) : (
                    staffLeaves.map((l, idx) => (
                      <tr key={l.id} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', fontWeight: 'bold' }}>{l.leaveType}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>
                          {l.leaveYear || new Date(l.startDate).getFullYear()}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                          {l.daysGranted || l.totalDays || (l as any).days || 0}d
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{l.startDate}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>{l.endDate}</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center' }}>
                          {l.resumptionDate || l.dateOfReporting || '--'}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px', textAlign: 'center', fontWeight: 'bold' }}>
                          {l.status.toUpperCase()}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '3px' }}>
                          {l.approvedBy || (l.status === 'Approved' ? 'HR Directorate' : 'Pending')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 2: Biometric Attendance Ledger Table */}
          {(reportScope === 'attendance' || reportScope === 'all') && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: '#0f172a',
                  borderBottom: '1px solid #94a3b8',
                  paddingBottom: '3px',
                  marginBottom: '6px',
                }}
              >
                {reportScope === 'attendance' ? '1.' : '2.'} BIOMETRIC DUTY ATTENDANCE & PUNCTUALITY RECORDS ({staffAttendance.length} records in period)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', width: '20px' }}>#</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Date</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Clock In</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Clock Out</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Hours</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Lateness</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Overtime</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'left' }}>Verification Method</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>Duty Status</th>
                  </tr>
                </thead>
                <tbody>
                  {staffAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center', color: '#64748b' }}>
                        No attendance records logged for this employee in the selected audit period.
                      </td>
                    </tr>
                  ) : (
                    staffAttendance.slice(0, 45).map((a, idx) => {
                      let delay = 0;
                      if (a.clockIn) {
                        const parts = a.clockIn.split(':');
                        const hr = parseInt(parts[0], 10);
                        const min = parseInt(parts[1] || '0', 10);
                        if (hr > 8 || (hr === 8 && min > 15)) {
                          delay = (hr - 8) * 60 + (min - 15);
                        }
                      }
                      return (
                        <tr key={a.id || idx} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center' }}>{idx + 1}</td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center', fontWeight: 'bold' }}>
                            {a.date}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center', fontFamily: 'monospace' }}>
                            {a.clockIn || '--:--'}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center', fontFamily: 'monospace' }}>
                            {a.clockOut || '--:--'}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center' }}>
                            {a.hoursWorked || 8}h
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center' }}>
                            {delay > 0 ? `+${delay}m late` : 'On Time'}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center' }}>
                            {a.overtimeHours ? `${a.overtimeHours}h` : '0h'}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px' }}>
                            {a.verificationMethod || 'Biometric'}
                          </td>
                          <td style={{ border: '1px solid #cbd5e1', padding: '2.5px', textAlign: 'center', fontWeight: 'bold' }}>
                            {delay > 0 ? 'LATE' : 'PRESENT'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Institutional Endorsement Sign-Off Blocks */}
          <div
            style={{
              marginTop: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              pageBreakInside: 'avoid',
            }}
          >
            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold' }}>PREPARED BY:</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '16px' }}>
                {currentUser?.name || 'Human Resources Officer'}
              </div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>HR Attendance & Leave Desk</div>
            </div>

            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold' }}>VERIFIED & CERTIFIED BY:</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '16px' }}>
                Director of Human Resources
              </div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>Pope John Paul II Medical Centre</div>
            </div>

            <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold' }}>APPROVED & ENDORSED BY:</div>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '16px' }}>
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
