import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Building2,
  Users,
  Save,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Grid,
  Phone,
  UserCheck,
  UserX,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Check,
  MessageSquare,
  Clock,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { StaffRosterRow } from '../../types/hrms';
import {
  isStaffInDepartment,
  getDepartmentStaff,
  transferDepartmentStaffToRosterGrid,
  MONTH_OPTIONS,
  MONTH_NAMES,
  getMonthIndex,
  getDaysInMonth,
  getMonthCalendarDays,
} from '../../utils/rosterTransferUtils';
import { PrintDutyRoasterModal } from './PrintDutyRoasterModal';

export const MonthlyDutyRoasterGrid: React.FC = () => {
  const {
    selectedHospital,
    activeRole,
    currentUser,
    isHeadOfFacilityOrHr,
    currentUserDepartment,
    departmentLeadership,
    monthlyUnitRosters,
    addMonthlyUnitRoster,
    updateMonthlyUnitRosterStatus,
    syncMonthlyRosterToActiveShifts,
    employees,
    showToast,
  } = useHrms();

  const isHRorAdmin = isHeadOfFacilityOrHr;

  const [month, setMonth] = useState<string>('APRIL');
  const [year, setYear] = useState<number>(2026);
  const [isSyncingLive, setIsSyncingLive] = useState<boolean>(false);
  const [lastSyncReport, setLastSyncReport] = useState<{ time: string; shifts: number; staff: number } | null>(null);

  // Available dynamic departments from departmentLeadership and registered employees
  const availableDepartments = React.useMemo(() => {
    const leadList = (departmentLeadership || []).map((d) => d.departmentName).filter(Boolean);
    const empList = (employees || []).map((e) => e.department).filter(Boolean);
    const combined = [...leadList, ...empList];
    if (combined.length > 0) return Array.from(new Set(combined)).sort();
    return [
      'Intensive Care Unit (ICU)',
      'Emergency & Trauma Dept',
      'Surgical Operating Theater',
      'Pediatrics & Neonatal Unit',
      'Pharmacy & Dispensary',
      'Radiology & Imaging',
      'General Medical Wards',
    ];
  }, [departmentLeadership, employees]);

  // Format user department for duty roaster matching
  const getInitialDept = () => {
    if (isHeadOfFacilityOrHr) {
      return availableDepartments.find((d) => d.toUpperCase().includes('ICU') || d.toUpperCase().includes('CARDIO')) || availableDepartments[0] || 'Intensive Care Unit (ICU)';
    }
    const cleanDept = (currentUserDepartment || '').toUpperCase();
    const found = availableDepartments.find((d) => d.toUpperCase() === cleanDept || d.toUpperCase().includes(cleanDept) || cleanDept.includes(d.toUpperCase()));
    return found || currentUserDepartment || availableDepartments[0] || 'Intensive Care Unit (ICU)';
  };

  const [department, setDepartment] = useState<string>(getInitialDept());
  const [preparedBy, setPreparedBy] = useState<string>('Dr. Kwame Mensah (HOD)');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Sync department when role or user department changes or when departments are modified
  useEffect(() => {
    if (!isHeadOfFacilityOrHr) {
      const cleanDept = (currentUserDepartment || '').toUpperCase();
      const found = availableDepartments.find((d) => d.toUpperCase() === cleanDept || d.toUpperCase().includes(cleanDept) || cleanDept.includes(d.toUpperCase()));
      setDepartment(found || currentUserDepartment || availableDepartments[0] || 'Intensive Care Unit (ICU)');
    } else if (!availableDepartments.includes(department)) {
      setDepartment(availableDepartments[0] || 'Intensive Care Unit (ICU)');
    }
  }, [isHeadOfFacilityOrHr, currentUserDepartment, activeRole, availableDepartments]);

  // HR Approval Status per Department State
  const [hrStatusByDept, setHrStatusByDept] = useState<Record<string, { status: 'Pending Verification' | 'Pending HR Approval' | 'Approved' | 'Returned for Revision'; approvedBy?: string; approvedAt?: string; notes?: string }>>({
    'Intensive Care Unit (ICU)': { status: 'Pending Verification' },
    'CARDIOLOGY & ICU': { status: 'Pending Verification' },
    'EMERGENCY & TRAUMA': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-05 10:30 AM' },
    'Emergency & Trauma Dept': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-05 10:30 AM' },
    'GENERAL MEDICAL WARDS': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-04 02:15 PM' },
    'General Medical Wards': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-04 02:15 PM' },
    'SURGICAL SERVICES & OT': { status: 'Returned for Revision', notes: 'Please ensure at least 2 Senior Operating Theater Nurses are on night duty on weekends.' },
    'Surgical Operating Theater': { status: 'Returned for Revision', notes: 'Please ensure at least 2 Senior Operating Theater Nurses are on night duty on weekends.' },
    'PEDIATRICS & NEONATAL': { status: 'Pending Verification' },
    'Pediatrics & Neonatal Unit': { status: 'Pending Verification' },
    'PHARMACY & DISPENSARY': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-06 09:00 AM' },
    'Pharmacy & Dispensary': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-06 09:00 AM' },
    'RADIOLOGY & IMAGING': { status: 'Pending Verification' },
    'Radiology & Imaging': { status: 'Pending Verification' },
  });

  // Check if there is an existing submitted monthly roster in HrmsContext for this department
  const existingRosterInContext = (monthlyUnitRosters || []).find(
    (r) => r && r.department?.toLowerCase() === department.toLowerCase()
  );

  const currentHrStatus = existingRosterInContext
    ? {
        status: existingRosterInContext.status,
        approvedBy: existingRosterInContext.reviewedBy,
        approvedAt: existingRosterInContext.reviewedDate,
        notes: existingRosterInContext.rejectionNotes,
      }
    : hrStatusByDept[department] || { status: 'Pending Verification' };

  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [showRevisionModal, setShowRevisionModal] = useState<boolean>(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState<string>('');

  const handleApproveRoasterByHR = () => {
    const approverName = currentUser?.name || 'Marcus Vance (HR Director)';
    const nowStr = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    setHrStatusByDept((prev) => ({
      ...prev,
      [department]: {
        status: 'Approved',
        approvedBy: approverName,
        approvedAt: nowStr,
      },
    }));

    if (existingRosterInContext) {
      updateMonthlyUnitRosterStatus(existingRosterInContext.id, 'Approved');
    }
  };

  const handleReturnRoasterForRevision = () => {
    if (!revisionNotesInput.trim()) return;
    setHrStatusByDept((prev) => ({
      ...prev,
      [department]: {
        status: 'Returned for Revision',
        notes: revisionNotesInput,
      },
    }));

    if (existingRosterInContext) {
      updateMonthlyUnitRosterStatus(existingRosterInContext.id, 'Returned for Revision', revisionNotesInput);
    }

    setShowRevisionModal(false);
    setRevisionNotesInput('');
  };

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    const currIdx = getMonthIndex(month);
    if (currIdx === 0) {
      setMonth(MONTH_NAMES[11]);
      setYear((y) => y - 1);
    } else {
      setMonth(MONTH_NAMES[currIdx - 1]);
    }
  };

  const handleNextMonth = () => {
    const currIdx = getMonthIndex(month);
    if (currIdx === 11) {
      setMonth(MONTH_NAMES[0]);
      setYear((y) => y + 1);
    } else {
      setMonth(MONTH_NAMES[currIdx + 1]);
    }
  };

  const handleSelectMonth = (newMonth: string) => {
    setMonth(newMonth.toUpperCase());
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const currMonth = MONTH_NAMES[now.getMonth()];
    setMonth(currMonth);
    setYear(now.getFullYear());
    showToast(
      'info',
      'Current Month Selected',
      `Viewing ${currMonth} ${now.getFullYear()} (${getDaysInMonth(currMonth, now.getFullYear())} days)`
    );
  };

  // Compute dynamic calendar days for the selected month & year (28, 29, 30, or 31 days)
  const calendarDays = React.useMemo(() => {
    return getMonthCalendarDays(month, year);
  }, [month, year]);

  const daysCount = calendarDays.length;
  const daysArray = React.useMemo(() => Array.from({ length: daysCount }, (_, i) => i + 1), [daysCount]);
  const dayInitials = React.useMemo(() => calendarDays.map((cd) => cd.initial), [calendarDays]);

  // Initialize 30 Vertical Staff Members with initial sample data from the user template
  const initialStaffList: StaffRosterRow[] = [
    {
      id: '1',
      name: 'RAPHAEL',
      phone: '0260978648',
      rank: 'NO.1',
      shifts: ['M', 'M', 'O', 'O', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'M', 'M'],
    },
    {
      id: '2',
      name: 'FRANCIS',
      phone: '0554735461',
      rank: 'SN',
      shifts: ['N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'M'],
    },
    {
      id: '3',
      name: 'KENNEDY',
      phone: '0596165824',
      rank: 'NO.2',
      shifts: ['M', 'A', 'M', 'A', 'M', 'A', 'M', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'M'],
    },
    {
      id: '4',
      name: 'ELIJAH',
      phone: '0240797408',
      rank: 'R/N',
      shifts: ['O', 'O', 'O', 'M', 'A', 'M', 'A', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N'],
    },
    {
      id: '5',
      name: 'BOAKYE',
      phone: '0242244283',
      rank: 'PA',
      shifts: ['A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'A'],
    },
    {
      id: '6',
      name: 'SAMUEL',
      phone: '0245112233',
      rank: 'SN',
      shifts: ['M', 'M', 'M', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'N', 'N'],
    },
    {
      id: '7',
      name: 'PATRICIA',
      phone: '0208877665',
      rank: 'NO.1',
      shifts: ['A', 'A', 'M', 'M', 'O', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'N', 'N', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'N', 'N'],
    },
    {
      id: '8',
      name: 'KWAME',
      phone: '0543210987',
      rank: 'MO',
      shifts: ['M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O'],
    },
    {
      id: '9',
      name: 'ABENA',
      phone: '0267788990',
      rank: 'R/N',
      shifts: ['N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M'],
    },
    {
      id: '10',
      name: 'EMMANUEL',
      phone: '0501122334',
      rank: 'SR.N',
      shifts: ['O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A'],
    },
    {
      id: '11',
      name: 'GRACE',
      phone: '0243344556',
      rank: 'MW',
      shifts: ['M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O'],
    },
    {
      id: '12',
      name: 'DANIEL',
      phone: '0556677889',
      rank: 'PA',
      shifts: ['A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O'],
    },
    {
      id: '13',
      name: 'HARRIET',
      phone: '0209988776',
      rank: 'SN',
      shifts: ['N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O'],
    },
    {
      id: '14',
      name: 'ISAAC',
      phone: '0544455667',
      rank: 'NO.2',
      shifts: ['O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M'],
    },
    {
      id: '15',
      name: 'JOYCE',
      phone: '0261122334',
      rank: 'R/N',
      shifts: ['M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O'],
    },
    {
      id: '16',
      name: 'MICHAEL',
      phone: '0505566778',
      rank: 'MO',
      shifts: ['A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N'],
    },
    {
      id: '17',
      name: 'ELIZABETH',
      phone: '0248899001',
      rank: 'NO.1',
      shifts: ['M', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'A', 'O', 'O'],
    },
    {
      id: '18',
      name: 'PETER',
      phone: '0551122334',
      rank: 'SR.N',
      shifts: ['N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'O', 'O'],
    },
    {
      id: '19',
      name: 'RITA',
      phone: '0203344556',
      rank: 'SN',
      shifts: ['O', 'O', 'M', 'M', 'M', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M'],
    },
    {
      id: '20',
      name: 'CHARLES',
      phone: '0547788990',
      rank: 'PA',
      shifts: ['M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O'],
    },
    {
      id: '21',
      name: 'AGNES',
      phone: '0264455667',
      rank: 'MW',
      shifts: ['A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N'],
    },
    {
      id: '22',
      name: 'SOLOMON',
      phone: '0508899001',
      rank: 'R/N',
      shifts: ['N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M'],
    },
    {
      id: '23',
      name: 'ESTHER',
      phone: '0242233445',
      rank: 'NO.2',
      shifts: ['O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O'],
    },
    {
      id: '24',
      name: 'GIDEON',
      phone: '0559900112',
      rank: 'SN',
      shifts: ['M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N'],
    },
    {
      id: '25',
      name: 'MARY',
      phone: '0201122334',
      rank: 'PA',
      shifts: ['A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M'],
    },
    {
      id: '26',
      name: 'BENJAMIN',
      phone: '0546677889',
      rank: 'NO.1',
      shifts: ['N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A'],
    },
    {
      id: '27',
      name: 'BEATRICE',
      phone: '0263344556',
      rank: 'R/N',
      shifts: ['O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N'],
    },
    {
      id: '28',
      name: 'JOSEPH',
      phone: '0504455667',
      rank: 'SR.N',
      shifts: ['M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O'],
    },
    {
      id: '29',
      name: 'VERONICA',
      phone: '0247788990',
      rank: 'MW',
      shifts: ['A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N'],
    },
    {
      id: '30',
      name: 'THOMAS',
      phone: '0552233445',
      rank: 'PA',
      shifts: ['O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M'],
    },
  ];

  // Check registered staff for currently selected department using intelligent matcher
  const deptEmployees = React.useMemo(() => {
    return getDepartmentStaff(employees, department);
  }, [employees, department]);

  const hasNoStaff = deptEmployees.length === 0;

  // Function to build the 30-staff duty roster matrix
  // Automatically transfers departmental staff to roster!
  const buildRosterForDepartment = React.useCallback(
    (targetDept: string, targetMonth: string, targetYear: number): StaffRosterRow[] => {
      const days = getDaysInMonth(targetMonth, targetYear);
      const exact = (monthlyUnitRosters || []).find(
        (r) =>
          r &&
          isStaffInDepartment(r.department, targetDept) &&
          r.month?.toUpperCase() === targetMonth.toUpperCase() &&
          Number(r.year) === Number(targetYear)
      );
      if (exact?.staffGrid && exact.staffGrid.length > 0) {
        return transferDepartmentStaffToRosterGrid(targetDept, employees, exact.staffGrid, days);
      }

      const anyDeptRoster = (monthlyUnitRosters || []).find(
        (r) => r && isStaffInDepartment(r.department, targetDept)
      );
      return transferDepartmentStaffToRosterGrid(targetDept, employees, anyDeptRoster?.staffGrid, days);
    },
    [monthlyUnitRosters, employees]
  );

  const [staffList, setStaffList] = useState<StaffRosterRow[]>(() =>
    buildRosterForDepartment(department, month, year)
  );

  // Explicit handler to automatically transfer departmental staff to roster matrix
  const handleAutoTransferStaff = () => {
    const updated = transferDepartmentStaffToRosterGrid(department, employees, staffList, daysCount);
    setStaffList(updated);
    const count = deptEmployees.length;
    if (count > 0) {
      showToast(
        'success',
        'Department Staff Transferred',
        `Successfully transferred ${count} departmental staff members into the ${department} duty roaster for ${month} ${year} (${daysCount} days).`
      );
    } else {
      showToast(
        'info',
        'No Registered Staff',
        `No staff members found in ${department}. Automatically inserted "No staff name" on the roster.`
      );
    }
  };

  // Explicit handler to insert "No staff name" on roster when department has no staff
  const handleInsertNoStaffName = () => {
    const emptyRow1: StaffRosterRow = {
      id: '1',
      name: 'No staff name',
      phone: '',
      rank: 'N/A',
      shifts: Array(daysCount).fill('O'),
    };
    const remainingRows: StaffRosterRow[] = Array.from({ length: 29 }, (_, idx) => ({
      id: String(idx + 2),
      name: '',
      phone: '',
      rank: '',
      shifts: Array(daysCount).fill('O'),
    }));
    setStaffList([emptyRow1, ...remainingRows]);
    showToast('info', 'No Staff Name Inserted', 'Inserted "No staff name" on the roster row.');
  };

  // Automatically synchronize staff list and HOD name when department, month, year or staff change
  useEffect(() => {
    setStaffList(buildRosterForDepartment(department, month, year));

    const deptLead = (departmentLeadership || []).find(
      (d) => isStaffInDepartment(d.departmentName, department)
    );
    if (deptLead?.hodName) {
      setPreparedBy(`${deptLead.hodName} (HOD)`);
    }
  }, [department, month, year, employees, buildRosterForDepartment, departmentLeadership]);

  // Cycle shift code on cell click: M -> A -> N -> O -> M
  const handleCellClick = (staffIndex: number, dayIndex: number) => {
    setStaffList((prev) => {
      const updated = [...prev];
      const row = { ...updated[staffIndex] };
      const currentShifts = [...row.shifts];
      const currentVal = currentShifts[dayIndex] || 'O';

      let nextVal = 'M';
      if (currentVal === 'M') nextVal = 'A';
      else if (currentVal === 'A') nextVal = 'N';
      else if (currentVal === 'N') nextVal = 'O';
      else if (currentVal === 'O') nextVal = 'M';

      currentShifts[dayIndex] = nextVal;
      row.shifts = currentShifts;
      updated[staffIndex] = row;
      return updated;
    });
  };

  // Update staff details
  const handleUpdateStaffDetail = (index: number, field: 'name' | 'phone' | 'rank' | 'mechanisationStatus', value: string) => {
    setStaffList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate shift sums for each day column across all 30 staff members
  const getDailyCount = (dayIdx: number, shiftCode: string) => {
    return staffList.reduce((acc, staff) => {
      return acc + (staff.shifts[dayIdx] === shiftCode ? 1 : 0);
    }, 0);
  };

  // Quick fill rotating pattern
  const handleApplyAutoPattern = () => {
    setStaffList((prev) =>
      prev.map((staff, idx) => {
        const pattern = ['M', 'M', 'A', 'A', 'N', 'O', 'O'];
        const offset = idx % 7;
        const newShifts = Array.from({ length: daysCount }, (_, d) => pattern[(d + offset) % 7]);
        return { ...staff, shifts: newShifts };
      })
    );
  };

  const handleSaveRoster = () => {
    // Save or update in HrmsContext monthlyUnitRosters
    addMonthlyUnitRoster({
      department,
      unit: `${department} Clinical Ward`,
      month,
      year,
      preparedBy,
      preparedByRole: 'Head of Department / Unit Head',
      totalStaffCount: staffList.filter((s) => s.name.trim() && s.name.trim() !== 'No staff name').length || 0,
      totalPlannedHours: (staffList.filter((s) => s.name.trim() && s.name.trim() !== 'No staff name').length || 0) * 160,
      fileName: `${department.replace(/[^a-zA-Z]/g, '_')}_Duty_Roaster_${month}_${year}.xlsx`,
      notes: `Official Monthly Duty Roaster submitted via 30 Staff Matrix for ${department}`,
      shiftsSummary: {
        morningShifts: daysArray.reduce((acc, _, idx) => acc + getDailyCount(idx, 'M'), 0),
        eveningShifts: daysArray.reduce((acc, _, idx) => acc + getDailyCount(idx, 'A'), 0),
        nightShifts: daysArray.reduce((acc, _, idx) => acc + getDailyCount(idx, 'N'), 0),
        onCallCoverage: 30,
      },
      staffGrid: staffList,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleSyncWithoutRepublishing = () => {
    setIsSyncingLive(true);
    try {
      const result = syncMonthlyRosterToActiveShifts(department, month, year, staffList, { preserveApprovalStatus: true });
      const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncReport({
        time: nowTime,
        shifts: result.syncedCount,
        staff: result.affectedStaffCount,
      });
      setTimeout(() => {
        setLastSyncReport((prev) => (prev?.time === nowTime ? null : prev));
      }, 8000);
    } catch (err) {
      showToast('error', 'Sync Failed', 'Could not synchronize roster with active shifts.');
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['NAMES', 'RANK', ...daysArray.map((d) => `Day ${d} (${dayInitials[d - 1]})`)];
    const rows = staffList.map((s) => [
      `"${s.name ? (s.phone ? `${s.name}-${s.phone}` : s.name) : 'No staff name'}"`,
      `"${s.rank || (s.name === 'No staff name' ? 'N/A' : '')}"`,
      ...daysArray.map((_, idx) => `"${s.shifts[idx] || 'O'}"`),
    ]);

    // Bottom summary rows
    const morningRow = ['"MORNING"', '""', ...daysArray.map((_, idx) => getDailyCount(idx, 'M'))];
    const afternoonRow = ['"AFTERNOON"', '""', ...daysArray.map((_, idx) => getDailyCount(idx, 'A'))];
    const nightRow = ['"NIGHT"', '""', ...daysArray.map((_, idx) => getDailyCount(idx, 'N'))];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"POPE JOHN PAUL II MEDICAL CENTRE - JAMASI"\n` +
      `"STAFF DUTY ROASTER - ${month} ${year}"\n` +
      `"Department: ${department}"\n` +
      `"Prepared By: ${preparedBy}"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(',')), morningRow.join(','), afternoonRow.join(','), nightRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PJPIIMC_Duty_Roaster_${month}_${year}_${department.replace(/[^a-zA-Z]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="rounded-2xl bg-slate-900/95 p-6 border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Grid className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                PJPIIMC Official Departmental Monthly Duty Roaster
              </span>
              <h2 className="text-xl font-black text-white">
                POPE JOHN PAUL II MEDICAL CENTRE - JAMASI
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Departmental Heads Monthly Staff Duty Matrix (30 Vertical Staff Allocation & Shift Tally)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAutoTransferStaff}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow border border-emerald-400/40"
              title="Automatically transfer departmental staff to duty roaster matrix"
            >
              <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-200" />
              <span>Auto-Transfer Staff ({deptEmployees.length})</span>
            </button>
            <button
              type="button"
              onClick={handleInsertNoStaffName}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition border border-slate-700"
              title="Insert 'No staff name' if this department has no staff"
            >
              <UserX className="h-3.5 w-3.5 text-amber-400" /> Insert "No staff name"
            </button>
            <button
              onClick={handleApplyAutoPattern}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Auto-Fill Shift Pattern
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600/90 hover:bg-sky-600 text-white text-xs font-bold transition shadow"
              title="Open Official Printable Duty Roaster & Template Hub"
            >
              <Printer className="h-3.5 w-3.5" /> Print Roaster / Blank Template
            </button>
            <button
              type="button"
              onClick={handleSyncWithoutRepublishing}
              disabled={isSyncingLive}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-950/40 border border-cyan-400/40"
              title="Synchronize duty matrix with active live shifts and daily biometric attendance without altering approval status or requiring republishing"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLive ? 'animate-spin text-cyan-200' : 'text-cyan-200'}`} />
              <span>Sync Without Republishing</span>
            </button>
            <button
              onClick={handleSaveRoster}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50"
            >
              <Save className="h-4 w-4" /> Save Monthly Duty Roaster
            </button>
          </div>
        </div>

        {/* Access Governance Notice */}
        {lastSyncReport && (
          <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <div>
                <p className="font-bold text-white">
                  Live Shift Synchronization Active ({lastSyncReport.time})
                </p>
                <p className="text-[11px] text-cyan-300/90 mt-0.5">
                  Synchronized <strong>{lastSyncReport.shifts}</strong> shift allocations for <strong>{lastSyncReport.staff}</strong> staff members in <em>{department}</em>. Biometric attendance terminals and staff mobile portals are updated in real-time without requiring re-approval or republishing.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-cyan-900/80 border border-cyan-400/40 text-cyan-200">
                Status: {currentHrStatus.status} (Preserved)
              </span>
              <button
                type="button"
                onClick={() => setLastSyncReport(null)}
                className="text-cyan-400 hover:text-white p-1 rounded-md transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          isHRorAdmin
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="text-base">{isHRorAdmin ? '🌐' : '🔒'}</span>
            <div>
              <p className="font-bold text-xs">
                {isHRorAdmin
                  ? 'Hospital-Wide Roster Governance Access (Head of Facility & HR Mode)'
                  : `Departmental Roster View: Restricted to ${department}`}
              </p>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isHRorAdmin
                  ? 'You have hospital-wide authorization to view, audit, review revisions, and approve monthly rosters across all clinical and administrative departments.'
                  : 'Per hospital data access policy, all clinical and general staff apart from the Head of Facility and HR can only view their own department roster.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
            Role: {activeRole.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Monthly Duty Roaster saved successfully and registered for HR compliance audit!</span>
          </div>
        )}

        {/* HR Approval & Compliance Audit Banner */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-6 w-6 shrink-0 ${currentHrStatus.status === 'Approved' ? 'text-emerald-400' : currentHrStatus.status === 'Returned for Revision' ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">HR Roaster Audit Status for {department}:</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border tracking-wider shadow-sm ${
                    currentHrStatus.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : currentHrStatus.status === 'Returned for Revision'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {currentHrStatus.status === 'Approved' && <Check className="h-3 w-3 text-emerald-400" />}
                  {currentHrStatus.status === 'Returned for Revision' && <AlertCircle className="h-3 w-3 text-rose-400" />}
                  {(currentHrStatus.status === 'Pending Verification' || currentHrStatus.status === 'Pending HR Approval') && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <Clock className="h-3 w-3 text-amber-400" />
                    </>
                  )}
                  {currentHrStatus.status === 'Pending HR Approval' ? 'Pending Verification' : currentHrStatus.status}
                </span>
              </div>
              {currentHrStatus.status === 'Approved' && (
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Approved by <strong className="text-emerald-400">{currentHrStatus.approvedBy}</strong> on {currentHrStatus.approvedAt}. Cleared for payroll and daily attendance tracking.
                </p>
              )}
              {currentHrStatus.status === 'Returned for Revision' && (
                <p className="text-[11px] text-rose-300 mt-0.5">
                  <strong>Revision Note:</strong> {currentHrStatus.notes}
                </p>
              )}
              {(currentHrStatus.status === 'Pending Verification' || currentHrStatus.status === 'Pending HR Approval') && (
                <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  Pending HR Officer/Director verification of shift coverage, on-call allocations, and fatigue compliance.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isHRorAdmin && (
              <>
                {currentHrStatus.status !== 'Approved' && (
                  <button
                    onClick={handleApproveRoasterByHR}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                  >
                    <Check className="h-4 w-4" /> Approve Department Roaster
                  </button>
                )}

                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
                >
                  <XCircle className="h-4 w-4" /> Request Revision
                </button>
              </>
            )}
          </div>
        </div>

        {/* Interactive Month Selection Ribbon */}
        <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Roster Month:
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-black text-xs border border-emerald-500/30">
                {month} {year} ({daysCount} Days)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 flex items-center gap-1 text-xs font-semibold"
                title="Go to previous month"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              <button
                type="button"
                onClick={handleCurrentMonth}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 transition border border-slate-700 text-xs font-semibold"
                title="Jump to current real-world month"
              >
                Current Month
              </button>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 flex items-center gap-1 text-xs font-semibold"
                title="Go to next month"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 12 Months Quick Switcher Grid/Ribbon */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
            {MONTH_OPTIONS.map((opt) => {
              const isSelected = month.toUpperCase() === opt.value.toUpperCase();
              const daysInThisMonth = getDaysInMonth(opt.value, year);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectMonth(opt.value)}
                  className={`px-2 py-1.5 rounded-xl text-center transition flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white font-black shadow-md shadow-emerald-900/30 ring-2 ring-emerald-400'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="text-[11px] uppercase tracking-wider font-extrabold">{opt.shortName}</span>
                  <span className={`text-[9px] ${isSelected ? 'text-emerald-100 font-bold' : 'text-slate-500'}`}>
                    {daysInThisMonth}d
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-750 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-between">
              <span>Select Month</span>
              <span className="text-emerald-400 font-semibold">{daysCount} days</span>
            </label>
            <select
              value={month.toUpperCase()}
              onChange={(e) => handleSelectMonth(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-black text-xs uppercase focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {MONTH_OPTIONS.map((opt) => {
                const dCount = getDaysInMonth(opt.value, year);
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({dCount} Days)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Roster Year</label>
            <input
              type="number"
              min={2020}
              max={2040}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-black text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400">Hospital Department</label>
              {!isHRorAdmin && (
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Staff View (Locked)
                </span>
              )}
            </div>
            {isHRorAdmin ? (
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            ) : (
              <div className="w-full rounded-xl bg-slate-900/90 border border-amber-500/40 px-3 py-2 text-white font-bold text-xs flex items-center justify-between shadow-inner">
                <span className="text-emerald-300 truncate">{department}</span>
                <span className="text-[10px] text-slate-400 font-normal ml-2 shrink-0">Your Dept</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prepared By (HOD)</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Department Staff Status Notice */}
        {hasNoStaff ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-amber-300">
                  Department Has No Staff: <span className="text-white font-mono">{department}</span>
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  No staff members are registered under this department in the HR system. <strong>"No staff name"</strong> has been inserted on the roster row.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInsertNoStaffName}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow"
            >
              <UserX className="h-3.5 w-3.5" /> Re-Insert "No staff name"
            </button>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <Users className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-emerald-300 flex items-center gap-2">
                  <span>Department Personnel Auto-Transferred:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                    {deptEmployees.length} Staff Members
                  </span>
                </p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5">
                  All employees registered or transferred to <strong className="text-white">{department}</strong> are automatically transferred into the duty roaster matrix with their contact and rank info.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAutoTransferStaff}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow border border-emerald-500/40"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-Transfer Staff
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white">Shift Codes Legend:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> M = Morning
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> A = Afternoon
            </span>
            <span className="flex items-center gap-1 font-bold text-sky-400">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> N = Night
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> O = Off / Rest
            </span>
          </div>

          <span className="text-[10px] text-slate-400 italic">
            * Click any shift cell to toggle shift assignment code (M ➔ A ➔ N ➔ O)
          </span>
        </div>
      </div>

      {/* Main Grid Matrix Table (Matches Template exactly) */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900 shadow-xl overflow-hidden">
        {/* Table Header Banner */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 text-center space-y-1">
          <h1 className="text-lg font-black tracking-wider text-white uppercase">
            POPE JOHN PAUL II MEDICAL CENTRE - JAMASI
          </h1>
          <h2 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest">
            STAFF DUTY ROASTER — {month} {year}
          </h2>
          <p className="text-[11px] text-slate-300 font-mono">
            Department: <strong className="text-white">{department}</strong> | Vertically 30 Staff Assignments
          </p>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse font-mono select-none">
            <thead>
              {/* Row 1: DATE Header & Day Numbers + Formatted Month Dates */}
              <tr className="bg-slate-800 text-slate-200 border-b border-slate-700 font-bold">
                <th className="px-3 py-2 text-left w-56 border-r border-slate-700 text-[11px] font-black uppercase tracking-wider text-white bg-slate-800">
                  <div className="flex items-center justify-between">
                    <span>DATE: {month.toUpperCase()} {year}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                      {daysCount} Days
                    </span>
                  </div>
                </th>
                <th className="px-2 py-2 w-20 border-r border-slate-700 text-[10px] font-bold text-slate-300 uppercase bg-slate-800">
                  RANK
                </th>
                <th className="px-1.5 py-2 w-16 border-r border-slate-700 text-[9px] font-bold text-amber-300 uppercase bg-slate-800" title="Payroll Disbursal: Ghana Govt (GoG) vs Hospital (IGF)">
                  GROUP
                </th>
                {calendarDays.map((cd) => (
                  <th
                    key={cd.dayNumber}
                    className={`px-1 py-1 min-w-[32px] border-r border-slate-700 text-center ${
                      cd.isWeekend ? 'text-amber-300 bg-slate-800/90 font-black' : 'text-emerald-400 bg-slate-800'
                    }`}
                    title={cd.fullFormattedDate || `Day ${cd.dayNumber}: ${cd.dayName}`}
                  >
                    <div className="text-[11px] font-black leading-none">{String(cd.dayNumber).padStart(2, '0')}</div>
                    <div className="text-[8px] font-mono opacity-80 mt-0.5 tracking-tight">{cd.displayDate || `${cd.dayNumber} ${month.slice(0, 3)}`}</div>
                  </th>
                ))}
              </tr>

              {/* Row 2: NAMES Header & Day Initials (Su, M, Tu, W, Th, F, Sa) */}
              <tr className="bg-slate-800/80 text-slate-300 border-b-2 border-slate-600 font-bold text-[10px]">
                <th className="px-3 py-2 text-left border-r border-slate-700 font-extrabold text-white uppercase tracking-wider bg-slate-800/80">
                  NAMES & CONTACT
                </th>
                <th className="px-2 py-2 border-r border-slate-700 font-bold text-slate-300 bg-slate-800/80">
                  RANK
                </th>
                <th className="px-1.5 py-2 border-r border-slate-700 text-[9px] font-bold text-slate-400 bg-slate-800/80" title="Salary: Ghana Govt Subvention or Hospital IGF">
                  PAYROLL
                </th>
                {calendarDays.map((cd, idx) => (
                  <th
                    key={idx}
                    className={`px-1 py-1 min-w-[32px] border-r border-slate-700 text-center ${
                      cd.isWeekend ? 'text-amber-300 font-black bg-amber-950/50' : 'text-slate-300 bg-slate-800/80'
                    }`}
                    title={cd.fullFormattedDate || `Day ${cd.dayNumber}: ${cd.dayName}`}
                  >
                    {cd.initial}
                  </th>
                ))}
              </tr>
            </thead>

            {/* 30 Vertical Staff Rows */}
            <tbody className="divide-y divide-slate-750 bg-slate-900 text-slate-200">
              {staffList.map((staff, staffIdx) => (
                <tr key={staff.id} className="hover:bg-slate-800/70 transition group">
                  {/* Staff Name & Phone Cell */}
                  <td className="px-2.5 py-1.5 text-left border-r border-slate-700 bg-slate-900 group-hover:bg-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0 text-right">
                        {staffIdx + 1}.
                      </span>
                      <input
                        type="text"
                        placeholder="No staff name"
                        value={staff.name ? (staff.phone ? `${staff.name}-${staff.phone}` : staff.name) : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parts = val.split('-');
                          handleUpdateStaffDetail(staffIdx, 'name', parts[0] || val);
                          if (parts[1] !== undefined) handleUpdateStaffDetail(staffIdx, 'phone', parts[1]);
                        }}
                        className={`w-full bg-transparent font-bold text-[11px] focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 px-1 py-0.5 rounded uppercase ${
                          staff.name === 'No staff name'
                            ? 'text-amber-400 italic font-semibold'
                            : !staff.name
                            ? 'text-slate-500 placeholder-slate-600 italic'
                            : 'text-white'
                        }`}
                      />
                    </div>
                  </td>

                  {/* Staff Rank Cell */}
                  <td className="px-1.5 py-1.5 border-r border-slate-700 text-[10px] font-bold text-slate-300 bg-slate-900/90 group-hover:bg-slate-800/80">
                    <input
                      type="text"
                      placeholder={staff.name === 'No staff name' ? 'N/A' : '-'}
                      value={staff.rank}
                      onChange={(e) => handleUpdateStaffDetail(staffIdx, 'rank', e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-bold text-slate-200 text-center text-[10px] focus:bg-slate-800 focus:outline-none px-1 py-0.5 rounded uppercase placeholder-slate-600"
                    />
                  </td>

                  {/* Staff Group Cell: Mechanised (GoG) vs Non-Mechanised (Hospital IGF) */}
                  <td className="px-1 py-1 border-r border-slate-700 text-center bg-slate-900/90 group-hover:bg-slate-800/80">
                    {staff.name && staff.name !== 'No staff name' ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextStatus = (staff.mechanisationStatus || 'Mechanised') === 'Mechanised' ? 'Non-Mechanised' : 'Mechanised';
                          handleUpdateStaffDetail(staffIdx, 'mechanisationStatus', nextStatus);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition ${
                          (staff.mechanisationStatus || 'Mechanised') === 'Mechanised'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        }`}
                        title={`Salary Paid by ${(staff.mechanisationStatus || 'Mechanised') === 'Mechanised' ? 'Ghana Government (GoG Subvention)' : 'Hospital (Internally Generated Funds)'}. Click to switch.`}
                      >
                        {(staff.mechanisationStatus || 'Mechanised') === 'Mechanised' ? '🇬🇭 GoG' : '🏥 IGF'}
                      </button>
                    ) : (
                      <span className="text-[9px] text-slate-600">-</span>
                    )}
                  </td>

                  {/* Shift Code Cells for this staff (Dynamic Month Days) */}
                  {Array.from({ length: daysCount }, (_, dayIdx) => staff.shifts[dayIdx] || 'O').map((shiftCode, dayIdx) => {
                    let styleClass = 'text-slate-400 hover:bg-slate-800/90 bg-slate-900/60';
                    if (shiftCode === 'M') styleClass = 'text-emerald-300 bg-emerald-950/60 font-black border-emerald-500/30';
                    else if (shiftCode === 'A') styleClass = 'text-amber-300 bg-amber-950/60 font-black border-amber-500/30';
                    else if (shiftCode === 'N') styleClass = 'text-sky-300 bg-sky-950/60 font-black border-sky-500/30';
                    else if (shiftCode === 'O') styleClass = 'text-rose-300/90 bg-rose-950/40 font-bold border-rose-500/20';

                    return (
                      <td
                        key={dayIdx}
                        onClick={() => handleCellClick(staffIdx, dayIdx)}
                        className={`px-1 py-1 border-r border-slate-700 text-[11px] font-bold cursor-pointer transition select-none ${styleClass}`}
                        title={`Day ${dayIdx + 1} (${calendarDays[dayIdx]?.fullFormattedDate || calendarDays[dayIdx]?.dayName || ''}): Click to toggle shift`}
                      >
                        {shiftCode}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Bottom Summary Rows (Matching template: MORNING, AFTERNOON, NIGHT sums + Group totals) */}
            <tfoot className="bg-slate-800 text-white font-extrabold border-t-2 border-slate-600">
              {/* MORNING COUNT ROW */}
              <tr className="border-b border-slate-700 text-emerald-400">
                <td className="px-3 py-2 text-left border-r border-slate-700 text-[11px] font-black uppercase bg-slate-800">
                  MORNING
                </td>
                <td className="px-2 py-2 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800">
                  TOTAL
                </td>
                <td className="px-1 py-1 border-r border-slate-700 text-[9px] text-slate-400 bg-slate-800">
                  -
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1.5 border-r border-slate-700 text-[11px] font-black bg-emerald-950/50">
                    {getDailyCount(dayIdx, 'M')}
                  </td>
                ))}
              </tr>

              {/* AFTERNOON COUNT ROW */}
              <tr className="border-b border-slate-700 text-amber-400">
                <td className="px-3 py-2 text-left border-r border-slate-700 text-[11px] font-black uppercase bg-slate-800">
                  AFTERNOON
                </td>
                <td className="px-2 py-2 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800">
                  TOTAL
                </td>
                <td className="px-1 py-1 border-r border-slate-700 text-[9px] text-slate-400 bg-slate-800">
                  -
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1.5 border-r border-slate-700 text-[11px] font-black bg-amber-950/50">
                    {getDailyCount(dayIdx, 'A')}
                  </td>
                ))}
              </tr>

              {/* NIGHT COUNT ROW */}
              <tr className="border-b border-slate-700 text-sky-300">
                <td className="px-3 py-2 text-left border-r border-slate-700 text-[11px] font-black uppercase bg-slate-800">
                  NIGHT
                </td>
                <td className="px-2 py-2 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800">
                  TOTAL
                </td>
                <td className="px-1 py-1 border-r border-slate-700 text-[9px] text-slate-400 bg-slate-800">
                  -
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1.5 border-r border-slate-700 text-[11px] font-black bg-sky-950/50">
                    {getDailyCount(dayIdx, 'N')}
                  </td>
                ))}
              </tr>

              {/* STAFF GROUPING COVERAGE ROW */}
              <tr className="text-slate-300 bg-slate-850 text-[10px]">
                <td className="px-3 py-1.5 text-left border-r border-slate-700 text-[10px] font-bold uppercase bg-slate-800 text-slate-200">
                  PAYROLL GROUPS
                </td>
                <td colSpan={2} className="px-2 py-1.5 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800 font-semibold text-center">
                  <span className="text-emerald-400 font-bold">
                    {staffList.filter(s => s.name && s.name !== 'No staff name' && (s.mechanisationStatus || 'Mechanised') === 'Mechanised').length} GoG
                  </span>
                  {' • '}
                  <span className="text-amber-400 font-bold">
                    {staffList.filter(s => s.name && s.name !== 'No staff name' && s.mechanisationStatus === 'Non-Mechanised').length} IGF
                  </span>
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1 border-r border-slate-700 text-[9px] text-slate-400 bg-slate-800/60 text-center font-mono" title={`Total coverage for ${calendarDays[dayIdx]?.displayDate || dayIdx + 1}`}>
                    {getDailyCount(dayIdx, 'M') + getDailyCount(dayIdx, 'A') + getDailyCount(dayIdx, 'N')}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* HR Revision Notes Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" /> Return {department} Duty Roaster for Revision
            </h3>
            <p className="text-slate-400">
              Provide required staffing coverage corrections or fatigue adjustments for the Head of Department.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">HR Audit Notes & Instructions</label>
              <textarea
                rows={4}
                required
                value={revisionNotesInput}
                onChange={(e) => setRevisionNotesInput(e.target.value)}
                placeholder="e.g. Please adjust night shift assignments to ensure at least 2 Senior Staff Nurses are present on weekends..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnRoasterForRevision}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition shadow"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Official Duty Roaster Printable Modal */}
      <PrintDutyRoasterModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        month={month}
        year={year}
        department={department}
        preparedBy={preparedBy}
        staffList={staffList}
        hrApprovalStatus={currentHrStatus}
        hospitalName={selectedHospital?.name || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI'}
      />
    </div>
  );
};
