import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Users,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Eye,
  Building2,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  BarChart3,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { AttendanceRecord, Employee } from '../../types/hrms';

type PeriodType = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all_time';

export const AttendanceReport: React.FC = () => {
  const { attendance, employees, selectedHospital, formatCurrency } = useHrms();

  // Filter States
  const [period, setPeriod] = useState<PeriodType>('this_week');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Selected Employee for Detailed Timesheet Modal
  const [selectedEmpTimesheet, setSelectedEmpTimesheet] = useState<Employee | null>(null);

  // Manual Adjustment Modal State
  const [adjustingRecord, setAdjustingRecord] = useState<AttendanceRecord | null>(null);
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');
  const [adjustedOvertime, setAdjustedOvertime] = useState<number>(0);

  // List of unique departments
  const departments = ['All', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Helper to parse dates for filtering
  const isInPeriod = (dateStr: string, periodType: PeriodType): boolean => {
    const recordDate = new Date(dateStr);
    const today = new Date('2026-08-07'); // Reference date in system context

    if (periodType === 'all_time') return true;

    if (periodType === 'this_week') {
      // Current week: Aug 3 to Aug 9, 2026
      const startOfWeek = new Date('2026-08-03');
      const endOfWeek = new Date('2026-08-09');
      return recordDate >= startOfWeek && recordDate <= endOfWeek;
    }

    if (periodType === 'last_week') {
      // Last week: Jul 27 to Aug 2, 2026
      const startOfLastWeek = new Date('2026-07-27');
      const endOfLastWeek = new Date('2026-08-02');
      return recordDate >= startOfLastWeek && recordDate <= endOfLastWeek;
    }

    if (periodType === 'this_month') {
      // August 2026
      return recordDate.getFullYear() === 2026 && recordDate.getMonth() === 7; // Month index 7 = August
    }

    if (periodType === 'last_month') {
      // July 2026
      return recordDate.getFullYear() === 2026 && recordDate.getMonth() === 6; // Month index 6 = July
    }

    return true;
  };

  // Helper to calculate total hours worked between clock-in and clock-out strings
  const calculateShiftDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 8.0;

    const parseTimeToMinutes = (timeStr: string) => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 480; // default 8h
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    };

    let start = parseTimeToMinutes(clockIn);
    let end = parseTimeToMinutes(clockOut);

    if (end < start) {
      end += 24 * 60; // Overnight shift
    }

    const durationMinutes = end - start;
    return Math.max(0, Math.round((durationMinutes / 60) * 100) / 100);
  };

  // Filter staff by department and search query
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesSearch =
      `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Calculate Aggregated Metrics for Each Staff Member
  const staffSummaries = filteredEmployees.map((emp) => {
    const empRecords = attendance.filter(
      (r) => r.employeeId === emp.id && isInPeriod(r.date, period)
    );

    let totalWorkedHours = 0;
    let totalOvertimeHours = 0;
    let lateDaysCount = 0;

    empRecords.forEach((r) => {
      const shiftHrs = calculateShiftDuration(r.clockIn, r.clockOut);
      totalWorkedHours += shiftHrs;
      totalOvertimeHours += r.overtimeHours || 0;
      if (r.status === 'Late') lateDaysCount += 1;
    });

    const regularHours = Math.max(0, Math.round((totalWorkedHours - totalOvertimeHours) * 10) / 10);
    const finalTotalHours = Math.round(totalWorkedHours * 10) / 10;
    const daysPresent = empRecords.length;

    // Expected standard contract hours
    const expectedHours = period.includes('week') ? 40 : period.includes('month') ? 160 : 40;

    // Healthcare labor alert threshold (>48h/week or >190h/month)
    const laborAlert = period.includes('week') ? finalTotalHours > 48 : finalTotalHours > 190;

    return {
      employee: emp,
      records: empRecords,
      daysPresent,
      regularHours,
      overtimeHours: Math.round(totalOvertimeHours * 10) / 10,
      totalHours: finalTotalHours,
      expectedHours,
      lateDaysCount,
      avgDailyHours: daysPresent > 0 ? (finalTotalHours / daysPresent).toFixed(1) : '0.0',
      laborAlert,
    };
  });

  // Grand Total KPI Calculations
  const grandTotalHours = staffSummaries.reduce((acc, s) => acc + s.totalHours, 0);
  const grandTotalOvertime = staffSummaries.reduce((acc, s) => acc + s.overtimeHours, 0);
  const grandTotalRegular = staffSummaries.reduce((acc, s) => acc + s.regularHours, 0);
  const totalStaffCount = staffSummaries.length;
  const avgHoursPerStaff = totalStaffCount > 0 ? (grandTotalHours / totalStaffCount).toFixed(1) : '0.0';
  const staffWithOvertime = staffSummaries.filter((s) => s.overtimeHours > 0).length;
  const staffWithLaborAlerts = staffSummaries.filter((s) => s.laborAlert).length;

  // CSV Export Handler
  const handleExportCSV = () => {
    const periodLabel =
      period === 'this_week'
        ? 'Current_Week_Aug_2026'
        : period === 'last_week'
        ? 'Last_Week_Jul_2026'
        : period === 'this_month'
        ? 'August_2026_Monthly'
        : period === 'last_month'
        ? 'July_2026_Monthly'
        : 'All_Time_Report';

    const headers = [
      'Employee Code',
      'Staff Name',
      'Department',
      'Job Title',
      'Reporting Period',
      'Days Present',
      'Regular Hours',
      'Overtime Hours',
      'Total Hours Worked',
      'Expected Contract Hours',
      'Late Arrivals',
      'Compliance Status',
    ];

    const rows = staffSummaries.map((s) => [
      `"${s.employee.empCode}"`,
      `"${s.employee.firstName} ${s.employee.lastName}"`,
      `"${s.employee.department}"`,
      `"${s.employee.jobTitle}"`,
      `"${periodLabel}"`,
      s.daysPresent,
      s.regularHours,
      s.overtimeHours,
      s.totalHours,
      s.expectedHours,
      s.lateDaysCount,
      `"${s.laborAlert ? 'FLAGGED: High Fatigue (>48h)' : 'Normal Compliance'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Staff_Attendance_Report_${periodLabel}_${selectedHospital.code}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 p-6 text-white border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">
                Staff Weekly & Monthly Attendance Report
              </h1>
              <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-300 border border-teal-500/30">
                HR / Admin Analytics
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Comprehensive audit breakdown of staff regular hours, overtime accrual, shift attendance compliance, and labor regulation fatigue tracking for {selectedHospital.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
          >
            <Printer className="h-4 w-4 text-slate-300" /> Print Summary
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition"
          >
            <Download className="h-4 w-4" /> Export CSV Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Staff Hours Worked</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{grandTotalHours.toLocaleString()} hrs</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {grandTotalRegular} hrs regular + <strong className="text-emerald-400">{grandTotalOvertime} hrs overtime</strong>
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Average Hours / Staff</span>
            <Users className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-300">{avgHoursPerStaff} hrs</span>
            <span className="text-xs text-slate-400">/ period</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Calculated across {totalStaffCount} active staff members</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Total Overtime Hours</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{grandTotalOvertime} hrs</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-300/80">
            Accrued by {staffWithOvertime} clinical/admin team members
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-medium">Fatigue & Labor Alerts</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${staffWithLaborAlerts > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {staffWithLaborAlerts}
            </span>
            <span className="text-xs text-slate-400">Staff Flagged</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {staffWithLaborAlerts > 0 ? 'Exceeding 48h weekly regulation limit' : 'All staff within safety limits'}
          </p>
        </div>
      </div>

      {/* Filters & Timeframe Toggle Bar */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-sm">
        {/* Period Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setPeriod('this_week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              period === 'this_week'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            This Week (Aug 3-9)
          </button>

          <button
            onClick={() => setPeriod('last_week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              period === 'last_week'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Last Week (Jul 27-Aug 2)
          </button>

          <button
            onClick={() => setPeriod('this_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              period === 'this_month'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            This Month (August 2026)
          </button>

          <button
            onClick={() => setPeriod('last_month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              period === 'last_month'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Last Month (July 2026)
          </button>

          <button
            onClick={() => setPeriod('all_time')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              period === 'all_time'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Recorded
          </button>
        </div>

        {/* Search & Department Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search staff name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full sm:w-auto rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Hours Distribution Chart / Progress Section */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-emerald-400" /> Staff Work Hours Comparison ({period.replace('_', ' ').toUpperCase()})
          </h3>
          <span className="text-xs text-slate-400">Regular (Green) vs Overtime (Amber)</span>
        </div>

        <div className="space-y-3">
          {staffSummaries.map((s) => {
            const maxVal = period.includes('week') ? 60 : 200;
            const regPct = Math.min(100, (s.regularHours / maxVal) * 100);
            const otPct = Math.min(100, (s.overtimeHours / maxVal) * 100);

            return (
              <div key={s.employee.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-2 font-semibold">
                    <img
                      src={s.employee.photo}
                      alt={s.employee.firstName}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    <span>
                      {s.employee.firstName} {s.employee.lastName} ({s.employee.department})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-[11px]">
                      Regular: <strong className="text-slate-200">{s.regularHours}h</strong> | OT:{' '}
                      <strong className="text-amber-400">{s.overtimeHours}h</strong>
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">{s.totalHours} hrs</span>
                  </div>
                </div>

                <div className="flex h-3 w-full rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                    style={{ width: `${regPct}%` }}
                    title={`Regular Hours: ${s.regularHours}h`}
                  ></div>
                  <div
                    className="h-full bg-amber-400 rounded-r-full transition-all duration-500"
                    style={{ width: `${otPct}%` }}
                    title={`Overtime Hours: ${s.overtimeHours}h`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Master Attendance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Detailed Staff Attendance Ledger</h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing {staffSummaries.length} staff members
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5 text-center">Days Present</th>
                <th className="px-5 py-3.5 text-right">Regular Hrs</th>
                <th className="px-5 py-3.5 text-right">Overtime Hrs</th>
                <th className="px-5 py-3.5 text-right">Total Hours</th>
                <th className="px-5 py-3.5 text-center">Avg Shift Hrs</th>
                <th className="px-5 py-3.5">Labor Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {staffSummaries.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No staff attendance records found for this period and department filter.
                  </td>
                </tr>
              ) : (
                staffSummaries.map((s) => (
                  <tr key={s.employee.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.employee.photo}
                          alt={s.employee.firstName}
                          className="h-9 w-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <span className="font-bold text-white">
                            {s.employee.firstName} {s.employee.lastName}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {s.employee.empCode} • {s.employee.jobTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-300">{s.employee.department}</td>

                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 border border-slate-700">
                        {s.daysPresent} days
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right font-mono text-slate-300">
                      {s.regularHours.toFixed(1)} h
                    </td>

                    <td className="px-5 py-4 text-right font-mono font-bold text-amber-400">
                      {s.overtimeHours > 0 ? `+${s.overtimeHours.toFixed(1)} h` : '0.0 h'}
                    </td>

                    <td className="px-5 py-4 text-right font-mono text-base font-extrabold text-emerald-400">
                      {s.totalHours.toFixed(1)} h
                    </td>

                    <td className="px-5 py-4 text-center font-mono text-slate-300">
                      {s.avgDailyHours} h/day
                    </td>

                    <td className="px-5 py-4">
                      {s.laborAlert ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="h-3 w-3" /> Exceeds 48h Limit
                        </span>
                      ) : s.overtimeHours > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Approved Overtime
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="h-3 w-3" /> Compliant
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedEmpTimesheet(s.employee)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-emerald-600 hover:text-white transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Timesheet Logs
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: DETAILED INDIVIDUAL STAFF TIMESHEET DRILL-DOWN */}
      {selectedEmpTimesheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedEmpTimesheet.photo}
                  alt={selectedEmpTimesheet.firstName}
                  className="h-10 w-10 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedEmpTimesheet.firstName} {selectedEmpTimesheet.lastName} - Timesheet Breakdown
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedEmpTimesheet.empCode} • {selectedEmpTimesheet.jobTitle} ({selectedEmpTimesheet.department})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEmpTimesheet(null)}
                className="rounded bg-slate-800 p-2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Daily Log Entries Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Clock-In / Clock-Out Daily Records ({period.replace('_', ' ')})
              </h4>

              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Clock In</th>
                      <th className="px-4 py-3">Clock Out</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3">Overtime</th>
                      <th className="px-4 py-3">Verification Terminal</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">HR Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {attendance
                      .filter(
                        (r) =>
                          r.employeeId === selectedEmpTimesheet.id &&
                          isInPeriod(r.date, period)
                      )
                      .map((rec) => {
                        const shiftHrs = calculateShiftDuration(rec.clockIn, rec.clockOut);
                        return (
                          <tr key={rec.id} className="hover:bg-slate-900/60 transition">
                            <td className="px-4 py-3 font-bold text-white">{rec.date}</td>
                            <td className="px-4 py-3 text-emerald-400 font-mono">{rec.clockIn}</td>
                            <td className="px-4 py-3 text-emerald-400 font-mono">{rec.clockOut}</td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-200">{shiftHrs} hrs</td>
                            <td className="px-4 py-3 font-mono text-amber-400">
                              {rec.overtimeHours > 0 ? `+${rec.overtimeHours} hrs` : '0.0'}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                                {rec.method.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  rec.status === 'Overtime'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                    : rec.status === 'Late'
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }`}
                              >
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => {
                                  setAdjustingRecord(rec);
                                  setAdjustedOvertime(rec.overtimeHours);
                                  setAdjustmentNotes('');
                                }}
                                className="text-[10px] font-semibold text-emerald-400 hover:underline bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30"
                              >
                                HR Override
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HR OVERRIDE & MANUAL CORRECTION */}
      {adjustingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">HR Manual Attendance Override</h3>
            <p className="text-xs text-slate-400">
              Adjust overtime hours or override status for record on <strong className="text-white">{adjustingRecord.date}</strong> for {adjustingRecord.employeeName}.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Approved Overtime Hours</label>
                <input
                  type="number"
                  step="0.25"
                  value={adjustedOvertime}
                  onChange={(e) => setAdjustedOvertime(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">HR Audit Note / Justification</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Approved emergency surgical extension by Dept Head..."
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingRecord(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    adjustingRecord.overtimeHours = adjustedOvertime;
                    adjustingRecord.approvalStatus = 'Approved';
                    setAdjustingRecord(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500"
                >
                  Save Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
