import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  XCircle,
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  Zap,
  Shield,
  FileWarning,
  FileCheck,
  Check,
  CheckCheck,
  Clock3,
  MessageSquare,
  Sparkles,
  AlertOctagon,
  CornerDownRight,
  Mail,
  UserX,
  PhoneForwarded,
  Radio,
  Save,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { AttendanceRecord, Employee, OfficialDocument } from '../../types/hrms';

export type PeriodType = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all_time';
export type SyncRangePreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

export const AttendanceReport: React.FC = () => {
  const {
    attendance,
    employees,
    rosters,
    selectedHospital,
    formatCurrency,
    activeRole,
    currentUser,
    dispatchNotification,
    updateEmployee,
    addAuditLog,
  } = useHrms();

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(activeRole);

  // View Mode: 'daily_sync' (Daily Late Comers & Absentees) vs 'periodic_audit' (Weekly/Monthly Hours)
  const [viewTab, setViewTab] = useState<'daily_sync' | 'periodic_audit'>('daily_sync');

  // Duty Roaster Sync Audit Range & Department Filtering State
  const [syncRangePreset, setSyncRangePreset] = useState<SyncRangePreset>('today');
  const [syncStartDate, setSyncStartDate] = useState<string>('2026-08-07');
  const [syncEndDate, setSyncEndDate] = useState<string>('2026-08-07');
  const [syncFilterCategory, setSyncFilterCategory] = useState<'all' | 'exceptions' | 'late' | 'absent' | 'excused' | 'ontime' | 'off'>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

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

  // ---------------------------------------------------------
  // HR ACTION INTERACTIVE STATE MAPS & MODALS
  // ---------------------------------------------------------

  // 1. Excused Absences & Delays Audit Map
  const [excusedAuditMap, setExcusedAuditMap] = useState<
    Record<
      string,
      {
        reason: string;
        refNo: string;
        payType: string;
        approver: string;
        date: string;
        notes?: string;
      }
    >
  >({});

  // 2. Disciplinary Actions & Formal Queries Audit Map
  const [disciplinaryAuditMap, setDisciplinaryAuditMap] = useState<
    Record<
      string,
      {
        level: string;
        queryRef: string;
        date: string;
        violation: string;
        deadline: string;
        sanction?: string;
        issuer: string;
        letterBody?: string;
      }
    >
  >({});

  // 3. HR Call Logs History Map
  const [callAuditMap, setCallAuditMap] = useState<
    Record<
      string,
      {
        timestamp: string;
        outcome: string;
        remarks: string;
        duration: string;
        contactPerson: string;
      }
    >
  >({});

  // --- Modal Active Targets ---
  // A. Call Staff Modal State
  const [activeCallStaff, setActiveCallStaff] = useState<SyncAuditItem | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [callOutcome, setCallOutcome] = useState<string>('Staff En Route (ETA < 20 mins)');
  const [callRemarks, setCallRemarks] = useState<string>('');
  const [isCallMuted, setIsCallMuted] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [sendSmsReminder, setSendSmsReminder] = useState<boolean>(true);

  // B. Flag Disciplinary Modal State
  const [disciplinaryStaff, setDisciplinaryStaff] = useState<SyncAuditItem | null>(null);
  const [disciplinaryViolation, setDisciplinaryViolation] = useState<string>('Unexcused Absence without Prior Notice (AWOL)');
  const [disciplinaryLevel, setDisciplinaryLevel] = useState<string>('Stage 1: Official HR Query (24h Written Explanation Required)');
  const [disciplinaryDeadline, setDisciplinaryDeadline] = useState<string>('24 Hours (Next Working Day)');
  const [disciplinarySanction, setDisciplinarySanction] = useState<string>('Written Explanation on File & Surcharge Assessment');
  const [disciplinaryIssuer, setDisciplinaryIssuer] = useState<string>('Director of Human Resources');
  const [disciplinaryCustomNotes, setDisciplinaryCustomNotes] = useState<string>('');
  const [showQueryLetterPreview, setShowQueryLetterPreview] = useState<boolean>(false);

  // C. Mark Excused Modal State
  const [excusedStaff, setExcusedStaff] = useState<SyncAuditItem | null>(null);
  const [excusedReason, setExcusedReason] = useState<string>('Certified Medical Emergency / Sick Leave');
  const [excusedRefNo, setExcusedRefNo] = useState<string>('MED-CERT-2026-');
  const [excusedPayType, setExcusedPayType] = useState<string>('Paid Authorized Leave');
  const [excusedApprover, setExcusedApprover] = useState<string>('Nurse In-Charge & HR Director');
  const [excusedRemarks, setExcusedRemarks] = useState<string>('');

  // D. Issue Warning Modal State
  const [warningStaff, setWarningStaff] = useState<SyncAuditItem | null>(null);
  const [warningSeverity, setWarningSeverity] = useState<string>('Official Late Arrival Notice (1st Advisory)');
  const [warningCustomMsg, setWarningCustomMsg] = useState<string>('');

  // Live Timer for Simulated In-App Phone Call
  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);

  // List of unique departments
  const departments = ['All', ...Array.from(new Set(employees.map((e) => e.department)))];

  // Helper to handle date preset selection
  const handleSelectSyncPreset = (preset: SyncRangePreset) => {
    setSyncRangePreset(preset);
    if (preset === 'today') {
      setSyncStartDate('2026-08-07');
      setSyncEndDate('2026-08-07');
    } else if (preset === 'yesterday') {
      setSyncStartDate('2026-08-06');
      setSyncEndDate('2026-08-06');
    } else if (preset === 'this_week') {
      setSyncStartDate('2026-08-03');
      setSyncEndDate('2026-08-09');
    } else if (preset === 'last_week') {
      setSyncStartDate('2026-07-27');
      setSyncEndDate('2026-08-02');
    } else if (preset === 'this_month') {
      setSyncStartDate('2026-08-01');
      setSyncEndDate('2026-08-31');
    } else if (preset === 'last_month') {
      setSyncStartDate('2026-07-01');
      setSyncEndDate('2026-07-31');
    }
  };

  // Helper to get array of dates between start and end
  const getDatesInRange = (startStr: string, endStr: string): string[] => {
    const dates: string[] = [];
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [startStr || '2026-08-07'];
    }

    const current = new Date(start);
    let guard = 0;
    while (current <= end && guard < 40) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      current.setDate(current.getDate() + 1);
      guard++;
    }
    return dates.length > 0 ? dates : [startStr];
  };

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

  // Helper to parse time strings like "07:50 AM", "03:00 PM", "07:00" into total minutes from midnight
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr || timeStr === 'N/A') return 0;
    const clean = timeStr.trim();

    const match12 = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match12) {
      let hours = parseInt(match12[1], 10);
      const minutes = parseInt(match12[2], 10);
      const ampm = match12[3].toUpperCase();

      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;

      return hours * 60 + minutes;
    }

    const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
      const hours = parseInt(match24[1], 10);
      const minutes = parseInt(match24[2], 10);
      return hours * 60 + minutes;
    }

    return 0;
  };

  // Helper to calculate total hours worked between clock-in and clock-out strings
  const calculateShiftDuration = (clockIn: string, clockOut: string): number => {
    if (!clockIn || !clockOut) return 8.0;

    let start = parseTimeToMinutes(clockIn);
    let end = parseTimeToMinutes(clockOut);

    if (start === 0 && end === 0) return 8.0;

    if (end < start) {
      end += 24 * 60; // Overnight shift
    }

    const durationMinutes = end - start;
    return Math.max(0, Math.round((durationMinutes / 60) * 100) / 100);
  };

  const currentEmpName = currentUser?.name || '';
  const currentEmpEmail = currentUser?.email || '';

  // Filter staff by department and search query
  const filteredEmployees = employees.filter((emp) => {
    if (!isHRorAdmin) {
      const isSelf =
        emp.id === currentUser?.id ||
        (emp.email && currentEmpEmail && emp.email.toLowerCase() === currentEmpEmail.toLowerCase()) ||
        (currentEmpName && `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(currentEmpName.toLowerCase().split(' ')[0]));
      if (!isSelf) return false;
    }
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesSearch =
      `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.empCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  // =========================================================
  // DUTY ROASTER VS ATTENDANCE SYNCHRONIZATION ENGINE
  // =========================================================

  interface SyncAuditItem {
    id: string;
    date: string;
    employee: Employee;
    scheduledShift: string;
    expectedStartTime: string;
    actualClockIn?: string;
    actualClockOut?: string;
    biometricMethod?: string;
    location?: string;
    syncStatus: 'On-Time' | 'Late' | 'Absent' | 'Off' | 'Overtime' | 'Excused';
    delayDuration: string;
    delayMinutes: number;
    attendanceRecordId?: string;
    excusalDetails?: {
      reason: string;
      refNo: string;
      payType: string;
      approver: string;
      date: string;
      notes?: string;
    };
    disciplinaryDetails?: {
      level: string;
      queryRef: string;
      date: string;
      violation: string;
      deadline: string;
      sanction?: string;
      issuer: string;
      letterBody?: string;
    };
    callLog?: {
      timestamp: string;
      outcome: string;
      remarks: string;
      duration: string;
      contactPerson: string;
    };
  }

  const activeSyncDates = getDatesInRange(syncStartDate, syncEndDate).sort().reverse();

  // Derive Duty Roaster and Attendance Synchronization for all dates in the selected range
  const syncAuditResults: SyncAuditItem[] = [];

  activeSyncDates.forEach((dateStr) => {
    filteredEmployees.forEach((emp) => {
      const itemKey = `${emp.id}_${dateStr}`;
      const isExcusedOverride = excusedAuditMap[itemKey];
      const isDisciplinaryFlagged = disciplinaryAuditMap[itemKey];
      const callLog = callAuditMap[itemKey];

      // Check explicit roster entry first
      const explicitRoster = rosters?.find((r) => r.employeeId === emp.id && r.date === dateStr);
      let scheduledShift = explicitRoster ? explicitRoster.shiftType : 'Morning (07:00-15:00)';
      let expectedStartTime = explicitRoster ? explicitRoster.startTime : '07:00 AM';

      if (!explicitRoster) {
        const dateObj = new Date(dateStr);
        const dayNum = isNaN(dateObj.getDate()) ? 7 : dateObj.getDate();
        const empNum = parseInt(emp.id.replace(/\D/g, '') || '101', 10);
        const shiftSeed = (empNum + dayNum) % 5;

        if (shiftSeed === 0 || shiftSeed === 1) {
          scheduledShift = 'Morning (07:00-15:00)';
          expectedStartTime = '07:00 AM';
        } else if (shiftSeed === 2) {
          scheduledShift = 'Afternoon (15:00-23:00)';
          expectedStartTime = '03:00 PM';
        } else if (shiftSeed === 3) {
          scheduledShift = 'Night (23:00-07:00)';
          expectedStartTime = '11:00 PM';
        } else {
          scheduledShift = 'Off';
          expectedStartTime = 'N/A';
        }
      }

      // Match attendance record for this date
      const attRec = attendance.find(
        (r) => r.employeeId === emp.id && r.date === dateStr
      );

      // 1. If marked as authorized excused absence by HR:
      if (isExcusedOverride) {
        syncAuditResults.push({
          id: itemKey,
          date: dateStr,
          employee: emp,
          scheduledShift,
          expectedStartTime,
          actualClockIn: attRec?.clockIn,
          actualClockOut: attRec?.clockOut,
          biometricMethod: isExcusedOverride.refNo || 'HR Authorized Exemption',
          location: 'Authorized Leave',
          syncStatus: 'Excused',
          delayDuration: `Excused: ${isExcusedOverride.reason}`,
          delayMinutes: 0,
          attendanceRecordId: attRec?.id,
          excusalDetails: isExcusedOverride,
          disciplinaryDetails: isDisciplinaryFlagged,
          callLog,
        });
        return;
      }

      // 2. If scheduled off
      if (scheduledShift === 'Off') {
        if (attRec) {
          syncAuditResults.push({
            id: itemKey,
            date: dateStr,
            employee: emp,
            scheduledShift: 'Off (Rest Day)',
            expectedStartTime: 'N/A',
            actualClockIn: attRec.clockIn,
            actualClockOut: attRec.clockOut,
            biometricMethod: attRec.method,
            location: attRec.location,
            syncStatus: 'Overtime',
            delayDuration: 'Unscheduled Overtime Duty',
            delayMinutes: 0,
            attendanceRecordId: attRec.id,
            disciplinaryDetails: isDisciplinaryFlagged,
            callLog,
          });
        } else {
          syncAuditResults.push({
            id: itemKey,
            date: dateStr,
            employee: emp,
            scheduledShift: 'Off (Rest Day)',
            expectedStartTime: 'N/A',
            syncStatus: 'Off',
            delayDuration: '0 mins',
            delayMinutes: 0,
            disciplinaryDetails: isDisciplinaryFlagged,
            callLog,
          });
        }
        return;
      }

      // 3. If attendance record exists for scheduled shift
      if (attRec) {
        const clockInMins = parseTimeToMinutes(attRec.clockIn);
        const expectedMins = parseTimeToMinutes(expectedStartTime);

        let diffMinutes = 0;
        if (clockInMins > 0 && expectedMins > 0) {
          diffMinutes = clockInMins - expectedMins;
        }

        const isLate = attRec.status === 'Late' || diffMinutes > 0;

        let delayDuration = '0 mins';
        if (diffMinutes > 0) {
          delayDuration = `${diffMinutes} minutes late`;
        } else if (isLate) {
          delayDuration = 'Late arrival';
        }

        syncAuditResults.push({
          id: itemKey,
          date: dateStr,
          employee: emp,
          scheduledShift,
          expectedStartTime,
          actualClockIn: attRec.clockIn,
          actualClockOut: attRec.clockOut,
          biometricMethod: attRec.method,
          location: attRec.location,
          syncStatus: isLate ? 'Late' : 'On-Time',
          delayDuration,
          delayMinutes: Math.max(0, diffMinutes),
          attendanceRecordId: attRec.id,
          disciplinaryDetails: isDisciplinaryFlagged,
          callLog,
        });
      } else {
        // No clock-in record found on scheduled duty day -> Marked as ABSENT
        syncAuditResults.push({
          id: itemKey,
          date: dateStr,
          employee: emp,
          scheduledShift,
          expectedStartTime,
          syncStatus: 'Absent',
          delayDuration: 'No clock-in recorded',
          delayMinutes: 0,
          disciplinaryDetails: isDisciplinaryFlagged,
          callLog,
        });
      }
    });
  });

  const syncLateComers = syncAuditResults.filter((item) => item.syncStatus === 'Late');
  const syncAbsentees = syncAuditResults.filter((item) => item.syncStatus === 'Absent');
  const syncOnTime = syncAuditResults.filter((item) => item.syncStatus === 'On-Time');
  const syncOffStaff = syncAuditResults.filter((item) => item.syncStatus === 'Off');
  const syncExcused = syncAuditResults.filter((item) => item.syncStatus === 'Excused');
  const syncExceptions = syncAuditResults.filter((item) => item.syncStatus === 'Late' || item.syncStatus === 'Absent');

  // Displayed items based on filter category tab
  const displayedSyncItems =
    syncFilterCategory === 'exceptions'
      ? syncExceptions
      : syncFilterCategory === 'late'
      ? syncLateComers
      : syncFilterCategory === 'absent'
      ? syncAbsentees
      : syncFilterCategory === 'excused'
      ? syncExcused
      : syncFilterCategory === 'ontime'
      ? syncOnTime
      : syncFilterCategory === 'off'
      ? syncOffStaff
      : syncAuditResults;

  // ---------------------------------------------------------
  // HR ACTION MODAL ACTIVATION HANDLERS
  // ---------------------------------------------------------

  // 1. CALL STAFF HANDLERS
  const handleOpenCallStaff = (item: SyncAuditItem) => {
    setActiveCallStaff(item);
    setCallStatus('idle');
    setCallSeconds(0);
    setCallOutcome(item.syncStatus === 'Absent' ? 'Staff En Route (ETA < 20 mins)' : 'Staff Reported Delay (Traffic/Transit)');
    setCallRemarks('');
    setIsCallMuted(false);
    setIsSpeakerOn(true);
    setSendSmsReminder(true);
  };

  const handleStartSimulatedCall = () => {
    setCallStatus('calling');
    setCallSeconds(0);
    // Simulate PBX connection after 1.6 seconds
    setTimeout(() => {
      setCallStatus('connected');
    }, 1600);
  };

  const handleEndSimulatedCall = () => {
    setCallStatus('ended');
  };

  const handleSaveCallLog = async () => {
    if (!activeCallStaff) return;
    const itemKey = activeCallStaff.id;
    const durationFormatted = `${Math.floor(callSeconds / 60)}m ${callSeconds % 60}s`;

    const newCallEntry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outcome: callOutcome,
      remarks: callRemarks,
      duration: callSeconds > 0 ? durationFormatted : 'Direct Dial / External',
      contactPerson: activeCallStaff.employee.phone || 'Primary Contact',
    };

    setCallAuditMap((prev) => ({
      ...prev,
      [itemKey]: newCallEntry,
    }));

    if (sendSmsReminder) {
      await dispatchNotification(
        activeCallStaff.employee.id,
        '📞 HR Attendance Outreach Notice',
        `Dear ${activeCallStaff.employee.firstName}, the HR Directorate contacted you regarding your scheduled ${activeCallStaff.scheduledShift} on ${activeCallStaff.date}. Recorded status: ${callOutcome}. Please report directly to your Unit In-Charge.`,
        'SMS',
        'Alert'
      );
    }

    addAuditLog(
      'HR Voice Outreach & Call Log',
      'Duty Roaster Sync Audit',
      `Voice call logged for ${activeCallStaff.employee.firstName} ${activeCallStaff.employee.lastName} (${activeCallStaff.employee.empCode}) regarding ${activeCallStaff.date} shift. Outcome: ${callOutcome} | Duration: ${durationFormatted}`
    );

    setActionSuccessMsg(`HR communication & call log successfully saved for ${activeCallStaff.employee.firstName} ${activeCallStaff.employee.lastName}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    setActiveCallStaff(null);
  };

  // 2. FLAG DISCIPLINARY HANDLERS
  const handleOpenDisciplinary = (item: SyncAuditItem) => {
    setDisciplinaryStaff(item);
    setDisciplinaryViolation(
      item.syncStatus === 'Absent'
        ? 'Unexcused Absence without Prior Notice (AWOL)'
        : 'Habitual / Chronic Late Attendance'
    );
    setDisciplinaryLevel('Stage 1: Official HR Query (24h Written Explanation Required)');
    setDisciplinaryDeadline('24 Hours (Next Working Day)');
    setDisciplinarySanction('Written Explanation on File & Surcharge Assessment');
    setDisciplinaryIssuer(currentUser?.name ? `${currentUser.name} (HR Admin)` : 'Director of Human Resources');
    setDisciplinaryCustomNotes('');
    setShowQueryLetterPreview(false);
  };

  const handleConfirmDisciplinary = async () => {
    if (!disciplinaryStaff) return;
    const itemKey = disciplinaryStaff.id;
    const queryRef = `PJPIIMC/HR/DISC/2026/08-${Math.floor(1000 + Math.random() * 9000)}`;

    const formalLetterText = `PETER JAN PAUL II MEMORIAL COMMUNITY HOSPITAL
DIRECTORATE OF HUMAN RESOURCES & CLINICAL GOVERNANCE
Ref No: ${queryRef}
Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}

TO: ${disciplinaryStaff.employee.firstName} ${disciplinaryStaff.employee.lastName} (${disciplinaryStaff.employee.empCode})
DESIGNATION: ${disciplinaryStaff.employee.jobTitle}
DEPARTMENT: ${disciplinaryStaff.employee.department}

SUBJECT: OFFICIAL DISCIPLINARY QUERY — ${disciplinaryViolation.toUpperCase()}

1. Our central biometric clock-in terminals and Live Duty Roaster cross-referencing audit revealed that on ${disciplinaryStaff.date}, you were scheduled for duty on the ${disciplinaryStaff.scheduledShift} at ${selectedHospital.name}.

2. The audit confirms that you failed to report for duty / breached punctual attendance protocols without prior approved written leave from your Unit Head or the HR Directorate.

3. You are hereby queried to explain in writing within ${disciplinaryDeadline} why appropriate administrative and disciplinary sanctions, including ${disciplinarySanction}, should not be instituted against you in accordance with Hospital Staff Regulations and the Ghana Health Service Code of Conduct.

ISSUED BY:
${disciplinaryIssuer}
Directorate of Human Resources, PJPIIMC`;

    setDisciplinaryAuditMap((prev) => ({
      ...prev,
      [itemKey]: {
        level: disciplinaryLevel,
        queryRef,
        date: disciplinaryStaff.date,
        violation: disciplinaryViolation,
        deadline: disciplinaryDeadline,
        sanction: disciplinarySanction,
        issuer: disciplinaryIssuer,
        letterBody: formalLetterText,
      },
    }));

    // Attach Official Document to Staff Dossier
    const newDoc: OfficialDocument = {
      id: `DOC-DISC-${Date.now()}`,
      title: `Official Disciplinary Query - ${disciplinaryViolation} (${disciplinaryStaff.date})`,
      type: 'Other Official Document',
      fileName: `Disciplinary_Query_${disciplinaryStaff.employee.empCode}_${disciplinaryStaff.date}.pdf`,
      fileUrl: '#',
      uploadedAt: new Date().toISOString().split('T')[0],
      fileSize: 142000,
      notes: `Formal disciplinary query issued for duty infraction on ${disciplinaryStaff.date}. Ref: ${queryRef}`,
    };

    const existingDocs = disciplinaryStaff.employee.officialDocuments || [];
    updateEmployee(disciplinaryStaff.employee.id, {
      officialDocuments: [newDoc, ...existingDocs],
    });

    await dispatchNotification(
      disciplinaryStaff.employee.id,
      '⚖️ URGENT: Formal Disciplinary Query Issued',
      `You have been issued an official HR Disciplinary Query (Ref: ${queryRef}) regarding your shift on ${disciplinaryStaff.date}. A mandatory written explanation is required within ${disciplinaryDeadline}.`,
      'App',
      'Urgent'
    );

    addAuditLog(
      'Formal Disciplinary Query Dispatched',
      'HR Governance & Disciplinary',
      `Issued ${disciplinaryLevel} (Ref: ${queryRef}) to ${disciplinaryStaff.employee.firstName} ${disciplinaryStaff.employee.lastName} for ${disciplinaryViolation} on ${disciplinaryStaff.date}.`
    );

    setActionSuccessMsg(`Official Disciplinary Query (${queryRef}) successfully issued and dispatched to ${disciplinaryStaff.employee.firstName} ${disciplinaryStaff.employee.lastName}!`);
    setTimeout(() => setActionSuccessMsg(null), 5000);
    setDisciplinaryStaff(null);
  };

  // 3. MARK EXCUSED HANDLERS
  const handleOpenExcused = (item: SyncAuditItem) => {
    setExcusedStaff(item);
    setExcusedReason(
      item.syncStatus === 'Absent'
        ? 'Certified Medical Emergency / Sick Leave'
        : 'Approved Emergency Delay / Transport Breakdown'
    );
    setExcusedRefNo(`EX-AUTH-${item.employee.empCode}-${item.date.replace(/-/g, '')}`);
    setExcusedPayType('Paid Authorized Leave (Standard Salary Maintained)');
    setExcusedApprover(currentUser?.name ? `${currentUser.name} (HR Admin)` : 'Nurse In-Charge & HR Directorate');
    setExcusedRemarks('');
  };

  const handleConfirmExcused = async () => {
    if (!excusedStaff) return;
    const itemKey = excusedStaff.id;

    setExcusedAuditMap((prev) => ({
      ...prev,
      [itemKey]: {
        reason: excusedReason,
        refNo: excusedRefNo || `AUTH-${Date.now().toString().slice(-4)}`,
        payType: excusedPayType,
        approver: excusedApprover,
        date: excusedStaff.date,
        notes: excusedRemarks,
      },
    }));

    await dispatchNotification(
      excusedStaff.employee.id,
      '✅ Attendance Exception Authorized & Excused',
      `Your absence / duty delay on ${excusedStaff.date} for ${excusedStaff.scheduledShift} has been authorized as ${excusedReason} (${excusedPayType}). Authorized by: ${excusedApprover}.`,
      'App',
      'Info'
    );

    addAuditLog(
      'Attendance Exception Authorized',
      'Duty Roaster Sync Audit',
      `Marked attendance as Authorized Excused Leave for ${excusedStaff.employee.firstName} ${excusedStaff.employee.lastName} on ${excusedStaff.date}. Reason: ${excusedReason} | Ref: ${excusedRefNo}`
    );

    setActionSuccessMsg(`Shift absence for ${excusedStaff.employee.firstName} ${excusedStaff.employee.lastName} on ${excusedStaff.date} marked as Authorized Excused Leave!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    setExcusedStaff(null);
  };

  // 4. ISSUE WARNING HANDLERS
  const handleOpenWarning = (item: SyncAuditItem) => {
    setWarningStaff(item);
    setWarningSeverity('Official Late Arrival Notice (1st Advisory)');
    setWarningCustomMsg(
      `Dear ${item.employee.firstName}, biometric terminal logs show that you clocked in ${item.delayDuration} for your scheduled ${item.scheduledShift} on ${item.date}. Please ensure punctual compliance with duty roaster timings.`
    );
  };

  const handleConfirmWarning = async () => {
    if (!warningStaff) return;

    await dispatchNotification(
      warningStaff.employee.id,
      `🚨 Attendance Policy Alert: ${warningSeverity}`,
      warningCustomMsg,
      'App',
      'Alert'
    );

    addAuditLog(
      'Late Warning Dispatched',
      'Duty Roaster Sync Audit',
      `Dispatched ${warningSeverity} to ${warningStaff.employee.firstName} ${warningStaff.employee.lastName} (${warningStaff.employee.empCode}) for ${warningStaff.delayDuration} on ${warningStaff.date}.`
    );

    setActionSuccessMsg(`Official late arrival warning notice dispatched to ${warningStaff.employee.firstName} ${warningStaff.employee.lastName} for shift on ${warningStaff.date}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
    setWarningStaff(null);
  };

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
    if (viewTab === 'daily_sync') {
      const headers = [
        'Shift Date',
        'Employee Code',
        'Staff Name',
        'Department',
        'Job Title',
        'Roaster Shift Scheduled',
        'Expected Start Time',
        'Actual Clock In',
        'Actual Clock Out',
        'Delay Duration',
        'Biometric Terminal',
        'Attendance Status',
      ];

      const rows = syncAuditResults.map((s) => [
        `"${s.date}"`,
        `"${s.employee.empCode}"`,
        `"${s.employee.firstName} ${s.employee.lastName}"`,
        `"${s.employee.department}"`,
        `"${s.employee.jobTitle}"`,
        `"${s.scheduledShift}"`,
        `"${s.expectedStartTime}"`,
        `"${s.actualClockIn || 'N/A'}"`,
        `"${s.actualClockOut || 'N/A'}"`,
        `"${s.delayDuration}"`,
        `"${s.biometricMethod || s.location || 'N/A'}"`,
        `"${s.syncStatus}"`,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `Duty_Roaster_Attendance_Audit_${syncStartDate}_to_${syncEndDate}_${selectedDept.replace(/\s+/g, '_')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

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
      {/* Primary Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('daily_sync')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              viewTab === 'daily_sync'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-300" />
            <span>Duty Roaster & Attendance Sync (Late Comers & Absentees)</span>
            <span className="ml-1 rounded-full bg-rose-950 px-2 py-0.5 text-[10px] text-rose-300 border border-rose-800 font-extrabold">
              {syncExceptions.length} Exceptions
            </span>
          </button>

          <button
            onClick={() => setViewTab('periodic_audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition ${
              viewTab === 'periodic_audit'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-950/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="h-4 w-4 text-teal-300" />
            <span>Weekly & Monthly Hours & Overtime Audit</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
          >
            <Printer className="h-3.5 w-3.5 text-slate-300" /> Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: DUTY ROASTER & ATTENDANCE SYNC (LATE COMERS & ABSENTEES) */}
      {/* ========================================================= */}
      {viewTab === 'daily_sync' && (
        <div className="space-y-6">
          {/* Controls & Range Selector Card */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950 p-6 text-white border border-slate-800 shadow-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
                    PJPIIMC Live Biometric & Shift Roaster Synchronization Engine
                  </span>
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  Attendance Exceptions & Verification Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cross-referencing duty roasters against biometric clock-in terminals for {selectedHospital.name}.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Department Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Department</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white font-bold focus:border-rose-500 focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audit Date Range Preset Selector */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">Audit Date Range</label>
                  <select
                    value={syncRangePreset}
                    onChange={(e) => handleSelectSyncPreset(e.target.value as SyncRangePreset)}
                    className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white font-bold focus:border-rose-500 focus:outline-none"
                  >
                    <option value="today">Today (Aug 07, 2026)</option>
                    <option value="yesterday">Yesterday (Aug 06, 2026)</option>
                    <option value="this_week">This Week (Aug 03 - Aug 09)</option>
                    <option value="last_week">Last Week (Jul 27 - Aug 02)</option>
                    <option value="this_month">This Month (August 2026)</option>
                    <option value="last_month">Last Month (July 2026)</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons & Custom Date Pickers */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-rose-400" /> Quick Ranges:
                </span>
                <button
                  type="button"
                  onClick={() => handleSelectSyncPreset('today')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    syncRangePreset === 'today'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSyncPreset('last_week')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    syncRangePreset === 'last_week'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Last Week
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSyncPreset('this_week')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    syncRangePreset === 'this_week'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSyncPreset('last_month')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    syncRangePreset === 'last_month'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Last Month
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSyncPreset('this_month')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    syncRangePreset === 'this_month'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSyncPreset('custom')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                    syncRangePreset === 'custom'
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Start & End Date Inputs */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">From</span>
                <input
                  type="date"
                  value={syncStartDate}
                  onChange={(e) => {
                    setSyncStartDate(e.target.value);
                    setSyncRangePreset('custom');
                  }}
                  className="bg-transparent text-xs text-white font-mono font-bold focus:outline-none"
                />
                <span className="text-slate-500 font-bold text-xs">→</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">To</span>
                <input
                  type="date"
                  value={syncEndDate}
                  onChange={(e) => {
                    setSyncEndDate(e.target.value);
                    setSyncRangePreset('custom');
                  }}
                  className="bg-transparent text-xs text-white font-mono font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Scheduled Duties</span>
                <div className="text-2xl font-black text-white mt-1">{syncAuditResults.length - syncOffStaff.length} Shifts</div>
                <span className="text-[10px] text-slate-400">Total shifts in audit period</span>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-emerald-500/20">
                <span className="text-[10px] font-extrabold uppercase text-emerald-400">On-Time Present</span>
                <div className="text-2xl font-black text-emerald-400 mt-1">{syncOnTime.length} Shifts</div>
                <span className="text-[10px] text-slate-400">Clocked in before shift start</span>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-amber-500/30">
                <span className="text-[10px] font-extrabold uppercase text-amber-400">Late Comers</span>
                <div className="text-2xl font-black text-amber-400 mt-1">{syncLateComers.length} Shifts</div>
                <span className="text-[10px] text-amber-300/80">Late arrival verified</span>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-rose-500/30">
                <span className="text-[10px] font-extrabold uppercase text-rose-400">Absentees</span>
                <div className="text-2xl font-black text-rose-400 mt-1">{syncAbsentees.length} Shifts</div>
                <span className="text-[10px] text-rose-300/80">Scheduled duty without clock-in</span>
              </div>

              <div className="rounded-xl bg-slate-950/80 p-3.5 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Off / Rest Days</span>
                <div className="text-2xl font-black text-slate-400 mt-1">{syncOffStaff.length} Shifts</div>
                <span className="text-[10px] text-slate-500">Scheduled 'Off' code</span>
              </div>
            </div>
          </div>

          {/* Sub-Filters / Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSyncFilterCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  syncFilterCategory === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                All Records ({syncAuditResults.length})
              </button>
              <button
                onClick={() => setSyncFilterCategory('exceptions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  syncFilterCategory === 'exceptions'
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" /> All Exceptions ({syncExceptions.length})
              </button>
              <button
                onClick={() => setSyncFilterCategory('late')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  syncFilterCategory === 'late'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Clock className="h-3.5 w-3.5" /> Late Comers ({syncLateComers.length})
              </button>
              <button
                onClick={() => setSyncFilterCategory('absent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  syncFilterCategory === 'absent'
                    ? 'bg-rose-700 text-white'
                    : 'text-rose-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" /> Absentees ({syncAbsentees.length})
              </button>
              <button
                onClick={() => setSyncFilterCategory('ontime')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  syncFilterCategory === 'ontime'
                    ? 'bg-emerald-600 text-white'
                    : 'text-emerald-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> On-Time ({syncOnTime.length})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-medium"
              />
            </div>
          </div>

          {/* TABLE: 🚨 AUDIT & EXCEPTIONS LEDGER */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    {syncFilterCategory === 'late'
                      ? 'LATE COMERS AUDIT REPORT'
                      : syncFilterCategory === 'absent'
                      ? 'DUTY ABSENTEEISM REPORT'
                      : syncFilterCategory === 'ontime'
                      ? 'ON-TIME ATTENDANCE COMPLIANCE'
                      : 'DUTY ROASTER & ATTENDANCE AUDIT LEDGER'}
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-extrabold">
                      {displayedSyncItems.length} Records
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Audit period: <strong className="text-slate-200">{syncStartDate}</strong> to{' '}
                    <strong className="text-slate-200">{syncEndDate}</strong> • Department:{' '}
                    <strong className="text-slate-200">{selectedDept}</strong>
                  </p>
                </div>
              </div>
            </div>

            {displayedSyncItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-white text-sm">No Matching Records Found!</h4>
                <p className="text-xs text-slate-400">No attendance exceptions found for the selected department and date range.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Audit Date</th>
                      <th className="px-4 py-3">Staff Member</th>
                      <th className="px-4 py-3">Department & Job Title</th>
                      <th className="px-4 py-3">Roaster Shift Scheduled</th>
                      <th className="px-4 py-3">Actual Clock-In</th>
                      <th className="px-4 py-3">Delay Duration</th>
                      <th className="px-4 py-3">Verification Terminal</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">HR Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-medium">
                    {displayedSyncItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/50 transition">
                        {/* Audit Date */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 font-mono font-bold text-[11px] border border-slate-800">
                            {item.date}
                          </span>
                        </td>

                        {/* Staff Member */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.employee.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt=""
                              className={`h-9 w-9 rounded-xl object-cover border ${
                                item.syncStatus === 'Absent'
                                  ? 'border-rose-500/50'
                                  : item.syncStatus === 'Late'
                                  ? 'border-amber-500/50'
                                  : 'border-slate-700'
                              }`}
                            />
                            <div>
                              <span className="font-bold text-white block">
                                {item.employee.firstName} {item.employee.lastName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.employee.empCode}</span>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3">
                          <span className="text-slate-200 font-semibold block">{item.employee.department}</span>
                          <span className="text-[10px] text-slate-400">{item.employee.jobTitle}</span>
                        </td>

                        {/* Shift Scheduled */}
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[11px] border border-slate-700">
                            {item.scheduledShift}
                          </span>
                          {item.expectedStartTime !== 'N/A' && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">Expected: {item.expectedStartTime}</span>
                          )}
                        </td>

                        {/* Actual Clock-In */}
                        <td className="px-4 py-3">
                          {item.actualClockIn ? (
                            <span className={`font-mono font-black ${item.syncStatus === 'Late' ? 'text-amber-300' : 'text-emerald-400'}`}>
                              {item.actualClockIn}
                            </span>
                          ) : (
                            <span className="font-mono text-rose-400 text-[11px]">No Clock-in</span>
                          )}
                        </td>

                        {/* Delay Duration */}
                        <td className="px-4 py-3">
                          {item.syncStatus === 'Late' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/40">
                              {item.delayDuration}
                            </span>
                          ) : item.syncStatus === 'Absent' ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px] border border-rose-500/40">
                              Unexcused Absent
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">0 mins (On-Time)</span>
                          )}
                        </td>

                        {/* Terminal */}
                        <td className="px-4 py-3">
                          <span className="text-[10px] text-slate-300 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {item.biometricMethod || item.location || (item.syncStatus === 'Absent' ? 'Terminal Unreached' : 'Terminal Access')}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3">
                          {item.syncStatus === 'Excused' ? (
                            <div>
                              <span className="px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/40 flex items-center gap-1 w-fit">
                                <Shield className="h-3 w-3 text-teal-400" /> Excused (Authorized)
                              </span>
                              {item.excusalDetails && (
                                <span className="block text-[9px] text-teal-400/80 font-medium mt-0.5">
                                  {item.excusalDetails.reason.slice(0, 26)}...
                                </span>
                              )}
                            </div>
                          ) : item.syncStatus === 'Late' ? (
                            <div>
                              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] border border-amber-500/40 flex items-center gap-1 w-fit">
                                <AlertTriangle className="h-3 w-3 text-amber-400" /> Late Arrival
                              </span>
                              {item.disciplinaryDetails && (
                                <span className="block text-[9px] text-rose-400 font-bold mt-0.5">
                                  ⚖️ Disciplinary Query Issued
                                </span>
                              )}
                              {item.callLog && !item.disciplinaryDetails && (
                                <span className="block text-[9px] text-emerald-400 font-medium mt-0.5">
                                  📞 Called ({item.callLog.outcome.slice(0, 18)}...)
                                </span>
                              )}
                            </div>
                          ) : item.syncStatus === 'Absent' ? (
                            <div>
                              <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-extrabold text-[10px] border border-rose-500/40 flex items-center gap-1 w-fit">
                                <AlertCircle className="h-3 w-3 text-rose-400" /> Absent
                              </span>
                              {item.disciplinaryDetails && (
                                <span className="block text-[9px] text-rose-400 font-bold mt-0.5">
                                  ⚖️ Disciplinary Query Issued
                                </span>
                              )}
                              {item.callLog && !item.disciplinaryDetails && (
                                <span className="block text-[9px] text-emerald-400 font-medium mt-0.5">
                                  📞 Called ({item.callLog.outcome.slice(0, 18)}...)
                                </span>
                              )}
                            </div>
                          ) : item.syncStatus === 'On-Time' ? (
                            <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] border border-emerald-500/40 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> On-Time
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-extrabold text-[10px] border border-slate-700">
                              {item.syncStatus}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* EXCUSED RECORD ACTIONS */}
                            {item.syncStatus === 'Excused' && (
                              <button
                                type="button"
                                onClick={() => handleOpenExcused(item)}
                                className="px-2.5 py-1 rounded-lg bg-teal-950 hover:bg-teal-900 border border-teal-500/30 text-teal-300 font-bold text-[10px] transition flex items-center gap-1 shadow-sm"
                                title="View or edit authorization details"
                              >
                                <FileCheck className="h-3 w-3 text-teal-400" /> View Exemption
                              </button>
                            )}

                            {/* LATE RECORD ACTIONS */}
                            {item.syncStatus === 'Late' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWarning(item)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white font-bold text-[10px] transition shadow flex items-center gap-1"
                                  title="Send official late warning notice"
                                >
                                  <Send className="h-3 w-3" /> Issue Warning
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCallStaff(item)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow flex items-center gap-1"
                                  title="Call staff directly"
                                >
                                  <Phone className="h-3 w-3" /> Call Staff
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenExcused(item)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] transition border border-slate-700"
                                  title="Mark as excused or authorized leave"
                                >
                                  Mark Excused
                                </button>
                              </>
                            )}

                            {/* ABSENT RECORD ACTIONS */}
                            {item.syncStatus === 'Absent' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenCallStaff(item)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow flex items-center gap-1"
                                  title="Call staff regarding absence"
                                >
                                  <Phone className="h-3 w-3" /> Call Staff
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDisciplinary(item)}
                                  className="px-2.5 py-1 rounded-lg bg-rose-950 hover:bg-rose-900 border border-rose-500/30 text-rose-300 font-bold text-[10px] transition"
                                  title="Generate formal disciplinary query"
                                >
                                  Flag Disciplinary
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenExcused(item)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] transition border border-slate-700"
                                  title="Mark as excused or authorized leave"
                                >
                                  Mark Excused
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: PERIODIC WORK HOURS & OVERTIME AUDIT LEDGER */}
      {/* ========================================================= */}
      {viewTab === 'periodic_audit' && (
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
                    Staff Weekly & Monthly Work Hours Audit
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
      )}

      {/* ========================================================= */}
      {/* GLOBAL HR ACTION MODALS (ACCESSIBLE FROM ALL TABS)        */}
      {/* ========================================================= */}

      {/* MODAL 1: HR STAFF VOICE OUTREACH & TELECOM CONSOLE */}
      {activeCallStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    HR Staff Outreach Console
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Live PBX / Cellular
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Direct duty roaster attendance follow-up & communication log</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCallStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Staff Dossier Info Card */}
            <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeCallStaff.employee.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-black text-white text-sm">
                      {activeCallStaff.employee.firstName} {activeCallStaff.employee.lastName}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium">
                      {activeCallStaff.employee.jobTitle} • <span className="text-slate-300">{activeCallStaff.employee.department}</span>
                    </p>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {activeCallStaff.employee.empCode} • Grade: {activeCallStaff.employee.gradeLevel || 'Standard'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase border ${
                      activeCallStaff.syncStatus === 'Absent'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {activeCallStaff.syncStatus === 'Absent' ? 'Absent (No Clock-In)' : `Late (${activeCallStaff.delayDuration})`}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{activeCallStaff.date}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">Scheduled Shift</span>
                  <span className="text-slate-200 font-bold">{activeCallStaff.scheduledShift}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Expected Start</span>
                  <span className="text-slate-200 font-bold">{activeCallStaff.expectedStartTime}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Hospital Unit</span>
                  <span className="text-slate-200 font-bold">{selectedHospital.name.slice(0, 18)}</span>
                </div>
              </div>
            </div>

            {/* Live VoIP Dialer Interactive Console */}
            <div className="rounded-xl bg-slate-950 border border-emerald-500/20 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneForwarded className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Voice Connectivity Interface</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeCallStaff.employee.phone || '+233 24 100 2005'}
                </span>
              </div>

              {/* State 1: IDLE */}
              {callStatus === 'idle' && (
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleStartSimulatedCall}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="h-4 w-4" /> Start In-App VoIP Call
                  </button>
                  <a
                    href={`tel:${activeCallStaff.employee.phone || '+233241002005'}`}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Phone className="h-4 w-4 text-emerald-400" /> Cellular Dial
                  </a>
                </div>
              )}

              {/* State 2: DIALING */}
              {callStatus === 'calling' && (
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/30 text-center space-y-3 animate-pulse">
                  <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
                    <Radio className="h-4 w-4 animate-spin text-emerald-400" /> Dialing GSM Network & Hospital PBX Line...
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Connecting to {activeCallStaff.employee.firstName} ({activeCallStaff.employee.phone || '+233 24 100 2005'})...
                  </p>
                  <button
                    type="button"
                    onClick={handleEndSimulatedCall}
                    className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 mx-auto"
                  >
                    <PhoneOff className="h-3.5 w-3.5" /> Cancel Call
                  </button>
                </div>
              )}

              {/* State 3: CONNECTED */}
              {callStatus === 'connected' && (
                <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                      CALL CONNECTED • ENCRYPTED AUDIO LINE
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/30">
                      {Math.floor(callSeconds / 60).toString().padStart(2, '0')}:{(callSeconds % 60).toString().padStart(2, '0')}
                    </span>
                  </div>

                  {/* Audio Waveform visualizer */}
                  <div className="flex items-center justify-center gap-1 h-6 bg-slate-950/80 rounded-lg p-1.5 border border-slate-800">
                    <div className="w-1 bg-emerald-500 rounded-full h-3 animate-pulse" />
                    <div className="w-1 bg-emerald-400 rounded-full h-5 animate-pulse" />
                    <div className="w-1 bg-emerald-300 rounded-full h-2 animate-pulse" />
                    <div className="w-1 bg-emerald-400 rounded-full h-4 animate-pulse" />
                    <div className="w-1 bg-emerald-500 rounded-full h-5 animate-pulse" />
                    <div className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse" />
                    <div className="w-1 bg-emerald-300 rounded-full h-4 animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCallMuted(!isCallMuted)}
                        className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          isCallMuted ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isCallMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        {isCallMuted ? 'Muted' : 'Mute'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                        className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          isSpeakerOn ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {isSpeakerOn ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                        {isSpeakerOn ? 'Speaker On' : 'Speaker Off'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleEndSimulatedCall}
                      className="py-2 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                    >
                      <PhoneOff className="h-3.5 w-3.5" /> End Call
                    </button>
                  </div>
                </div>
              )}

              {/* State 4: ENDED */}
              {callStatus === 'ended' && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Call Completed • Duration: <strong className="text-white">{callSeconds}s</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartSimulatedCall}
                    className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Redial
                  </button>
                </div>
              )}
            </div>

            {/* HR Outreach Log & Resolution Classification */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  Call Outcome & Staff Response Classification <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Staff En Route (ETA < 20 mins)',
                    'Medical Emergency / Clinic Visit',
                    'Approved Shift Swap with Colleague',
                    'Unreachable / Diverted to Voicemail',
                    'Transport Breakdown / Weather Delay',
                    'Refusal of Duty / Disciplinary Concern',
                  ].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCallOutcome(option)}
                      className={`p-2.5 rounded-lg text-left text-[11px] font-semibold border transition ${
                        callOutcome === option
                          ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  HR Officer Conversation Notes & Follow-up Directive
                </label>
                <textarea
                  rows={2}
                  placeholder="Record staff explanations, verbal directives given, or substitute handover details..."
                  value={callRemarks}
                  onChange={(e) => setCallRemarks(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="smsReminder"
                  checked={sendSmsReminder}
                  onChange={(e) => setSendSmsReminder(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-950"
                />
                <label htmlFor="smsReminder" className="text-[11px] text-slate-400 font-medium">
                  Dispatch official SMS & mobile app attendance notice to staff contact number
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveCallStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCallLog}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-lg shadow-emerald-950 flex items-center gap-1.5"
              >
                <Save className="h-4 w-4" /> Save Call Log & Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FLAG DISCIPLINARY & GENERATE FORMAL HR QUERY */}
      {disciplinaryStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-rose-500/40 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Disciplinary Action & Formal Query Generator
                  </h3>
                  <p className="text-xs text-slate-400">
                    Hospital Staff Regulations & Clinical Code of Conduct Enforcement
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDisciplinaryStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Staff Summary */}
            <div className="rounded-xl bg-slate-950 border border-rose-500/20 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={disciplinaryStaff.employee.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt=""
                  className="h-11 w-11 rounded-xl object-cover border border-rose-500/40"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {disciplinaryStaff.employee.firstName} {disciplinaryStaff.employee.lastName}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {disciplinaryStaff.employee.empCode} • {disciplinaryStaff.employee.jobTitle} ({disciplinaryStaff.employee.department})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 font-extrabold text-[10px] border border-rose-500/40">
                  {disciplinaryStaff.syncStatus} • {disciplinaryStaff.date}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{disciplinaryStaff.scheduledShift}</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Infraction / Policy Violation Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={disciplinaryViolation}
                  onChange={(e) => setDisciplinaryViolation(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                >
                  <option value="Unexcused Absence without Prior Notice (AWOL)">Unexcused Shift Absence without Prior Notice (AWOL)</option>
                  <option value="Habitual / Chronic Late Attendance (>3 incidents in audit period)">Habitual / Chronic Late Attendance (&gt;3 incidents in audit period)</option>
                  <option value="Unauthorized Duty Post Abandonment">Unauthorized Duty Post Abandonment</option>
                  <option value="Failure to Comply with Approved Duty Roaster Timing">Failure to Comply with Approved Duty Roaster Timing</option>
                  <option value="Refusal of Emergency Overtime / Call-In Shift">Refusal of Emergency Overtime / Call-In Shift</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Escalation Level <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={disciplinaryLevel}
                    onChange={(e) => setDisciplinaryLevel(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="Stage 1: Official HR Query (24h Written Explanation Required)">Stage 1: Official HR Query (24h Written Explanation)</option>
                    <option value="Stage 2: First Formal Written Warning (Filed in Personnel Dossier)">Stage 2: First Formal Written Warning</option>
                    <option value="Stage 3: Second Warning & 1-Day Salary Deduction">Stage 3: Second Warning & Salary Surcharge</option>
                    <option value="Stage 4: Referral to Hospital Disciplinary Committee">Stage 4: Referral to Hospital Disciplinary Committee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Written Response Deadline <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={disciplinaryDeadline}
                    onChange={(e) => setDisciplinaryDeadline(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="24 Hours (Next Working Day)">24 Hours (Next Working Day)</option>
                    <option value="48 Hours from Receipt">48 Hours from Receipt</option>
                    <option value="72 Hours (3 Working Days)">72 Hours (3 Working Days)</option>
                    <option value="Immediate (Before Resumption of Next Duty)">Immediate (Before Resumption of Next Duty)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Applicable Administrative Sanction
                  </label>
                  <select
                    value={disciplinarySanction}
                    onChange={(e) => setDisciplinarySanction(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="Written Explanation on File & Surcharge Assessment">Written Explanation on File & Surcharge Assessment</option>
                    <option value="1-Day Basic Salary Deduction on Current Payroll">1-Day Basic Salary Deduction on Current Payroll</option>
                    <option value="Forfeiture of Monthly Shift & Extra-Duty Allowance">Forfeiture of Monthly Shift & Extra-Duty Allowance</option>
                    <option value="Referral for Professional Ethics Re-Orientation">Referral for Professional Ethics Re-Orientation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Issuing Authority
                  </label>
                  <input
                    type="text"
                    value={disciplinaryIssuer}
                    onChange={(e) => setDisciplinaryIssuer(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                  />
                </div>
              </div>

              {/* Letter Preview Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowQueryLetterPreview(!showQueryLetterPreview)}
                  className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1.5 my-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  {showQueryLetterPreview ? 'Hide Formal Query Letter Preview' : 'Preview Formal HR Query Letter (Ghana Health Service Standard)'}
                </button>

                {showQueryLetterPreview && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 space-y-2 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                    <strong>PETER JAN PAUL II MEMORIAL COMMUNITY HOSPITAL</strong>
                    <br />
                    DIRECTORATE OF HUMAN RESOURCES & CLINICAL GOVERNANCE
                    <br />
                    Ref: PJPIIMC/HR/DISC/2026/08-AUTO
                    <br />
                    Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <br /><br />
                    TO: {disciplinaryStaff.employee.firstName} {disciplinaryStaff.employee.lastName} ({disciplinaryStaff.employee.empCode})
                    <br />
                    DESIGNATION: {disciplinaryStaff.employee.jobTitle} - {disciplinaryStaff.employee.department}
                    <br /><br />
                    <strong>SUBJECT: FORMAL DISCIPLINARY QUERY — {disciplinaryViolation.toUpperCase()}</strong>
                    <br /><br />
                    1. Central biometric audit logs indicate that on {disciplinaryStaff.date}, you were rostered for {disciplinaryStaff.scheduledShift} but failed to report / breached punctuality protocol.
                    <br />
                    2. You are queried to explain in writing within {disciplinaryDeadline} why disciplinary measures ({disciplinarySanction}) should not be taken against you.
                    <br /><br />
                    ISSUED BY: {disciplinaryIssuer}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDisciplinaryStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisciplinary}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition shadow-lg shadow-rose-950 flex items-center gap-1.5"
              >
                <ShieldAlert className="h-4 w-4" /> Issue & Dispatch Disciplinary Query
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: AUTHORIZE & MARK AS EXCUSED ABSENCE */}
      {excusedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-teal-500/40 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Authorize & Regularize Attendance Exception
                  </h3>
                  <p className="text-xs text-slate-400">Duty Roaster Absence Clearance & Administrative Approval</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExcusedStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Staff Card */}
            <div className="rounded-xl bg-slate-950 border border-teal-500/20 p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">
                  {excusedStaff.employee.firstName} {excusedStaff.employee.lastName}
                </h4>
                <p className="text-xs text-slate-400">
                  {excusedStaff.employee.empCode} • {excusedStaff.employee.jobTitle}
                </p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 font-bold text-[10px] border border-teal-500/30">
                  {excusedStaff.date}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{excusedStaff.scheduledShift}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Authorization Reason / Category <span className="text-teal-400">*</span>
                </label>
                <select
                  value={excusedReason}
                  onChange={(e) => setExcusedReason(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                >
                  <option value="Certified Medical Emergency / Sick Leave">Certified Medical Emergency / Sick Leave</option>
                  <option value="Compassionate / Bereavement Leave">Compassionate / Bereavement Leave</option>
                  <option value="Approved Emergency Shift Swap with Colleague">Approved Emergency Shift Swap with Colleague</option>
                  <option value="Official Hospital Clinical Outreach / Assignment">Official Hospital Clinical Outreach / Assignment</option>
                  <option value="Approved Emergency Delay / Transport Breakdown">Approved Emergency Delay / Transport Breakdown</option>
                  <option value="Administrative Exemption / In-Charge Discretion">Administrative Exemption / In-Charge Discretion</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Supporting Reference / Certificate No.
                  </label>
                  <input
                    type="text"
                    value={excusedRefNo}
                    onChange={(e) => setExcusedRefNo(e.target.value)}
                    placeholder="e.g. MED-CERT-2026-081"
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Payroll Regularization Scheme
                  </label>
                  <select
                    value={excusedPayType}
                    onChange={(e) => setExcusedPayType(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                  >
                    <option value="Paid Authorized Leave (Standard Salary Maintained)">Paid Authorized Leave (Standard Salary)</option>
                    <option value="Deduct from Annual Sick Leave Balance">Deduct from Annual Sick Leave Balance</option>
                    <option value="Compensatory Shift Duty to be Rendered">Compensatory Shift Duty to be Rendered</option>
                    <option value="Unpaid Authorized Leave (No Penalty)">Unpaid Authorized Leave (No Penalty)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Authorizing Official Sign-Off
                </label>
                <input
                  type="text"
                  value={excusedApprover}
                  onChange={(e) => setExcusedApprover(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Audit Remarks & Justification Details
                </label>
                <textarea
                  rows={2}
                  value={excusedRemarks}
                  onChange={(e) => setExcusedRemarks(e.target.value)}
                  placeholder="Record additional clinic details, verbal permissions granted by Nurse In-Charge..."
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setExcusedStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExcused}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs transition shadow-lg shadow-teal-950 flex items-center gap-1.5"
              >
                <Shield className="h-4 w-4" /> Authorize & Mark Excused
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ISSUE LATE ARRIVAL WARNING */}
      {warningStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/40 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Dispatch Late Policy Warning</h3>
                  <p className="text-xs text-slate-400">Terminal Punctuality Alert & Notification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWarningStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Staff Info */}
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">
                  {warningStaff.employee.firstName} {warningStaff.employee.lastName}
                </h4>
                <p className="text-xs text-slate-400 font-mono">{warningStaff.employee.empCode} • {warningStaff.employee.department}</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {warningStaff.delayDuration}
                </span>
                <p className="text-[10px] text-slate-400 mt-1">{warningStaff.date}</p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Warning Severity
                </label>
                <select
                  value={warningSeverity}
                  onChange={(e) => setWarningSeverity(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="Official Late Arrival Notice (1st Advisory)">Official Late Arrival Notice (1st Advisory)</option>
                  <option value="Formal 2nd Late Arrival Reprimand">Formal 2nd Late Arrival Reprimand</option>
                  <option value="Final Punctuality Warning before Surcharge">Final Punctuality Warning before Surcharge</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Notice Message Content
                </label>
                <textarea
                  rows={4}
                  value={warningCustomMsg}
                  onChange={(e) => setWarningCustomMsg(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setWarningStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWarning}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition shadow-lg shadow-amber-950 flex items-center gap-1.5"
              >
                <Send className="h-4 w-4" /> Dispatch Official Warning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
