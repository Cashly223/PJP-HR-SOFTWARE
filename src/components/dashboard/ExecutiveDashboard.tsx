import React, { useMemo, useState } from 'react';
import {
  Users,
  Stethoscope,
  Award,
  Clock,
  Banknote,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Sparkles,
  Video,
  Building2,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  PlaneTakeoff,
  GitFork,
  HeartPulse,
  FolderOpen,
  Lock,
  Download,
  Filter,
  Search,
  ArrowRightLeft,
  FileSpreadsheet,
  AlertCircle,
  Briefcase,
  Building,
  Check,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ComplianceOverviewWidget } from './ComplianceOverviewWidget';
import { AttritionAbsenteeismHeatmap } from '../analytics/AttritionAbsenteeismHeatmap';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const ExecutiveDashboard: React.FC = () => {
  const {
    employees,
    updateEmployee,
    rosters,
    attendance,
    leaves,
    departmentLeadership,
    formatCurrency,
    selectedHospital,
    setActiveTab,
    isHeadOfFacilityOrHr,
    currentUser,
    activeRole,
  } = useHrms();

  // Access control: Strictly visible exclusively to HR and Head of Facility
  const isAuthorizedExecutive =
    isHeadOfFacilityOrHr ||
    ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(currentUser?.role || activeRole || '');

  // UI state for Confidential Workforce Mechanisation panel
  const [mechTab, setMechTab] = useState<'overview' | 'staff_registry'>('overview');
  const [mechSearchTerm, setMechSearchTerm] = useState('');
  const [mechGroupFilter, setMechGroupFilter] = useState<'All' | 'Mechanised' | 'Non-Mechanised'>('All');
  const [mechDeptFilter, setMechDeptFilter] = useState<string>('All');

  // Dynamic Staff Metrics - 100% Synchronized with context
  const totalStaff = (employees || []).length;
  const activeStaff = (employees || []).filter(
    (e) => (e?.status || 'Active').toLowerCase() === 'active'
  );
  const probationStaff = (employees || []).filter(
    (e) => (e?.status || '').toLowerCase() === 'probation'
  );
  const locumOrPartTimeStaff = (employees || []).filter(
    (e) => (e?.employmentType || '').toLowerCase() === 'locum' || (e?.employmentType || '').toLowerCase() === 'part-time'
  );
  const fullTimeStaff = (employees || []).filter(
    (e) => (e?.employmentType || 'full-time').toLowerCase() === 'full-time'
  );

  // Active Approved Leaves
  const activeOnLeaveList = useMemo(() => {
    return (leaves || []).filter((l) => {
      if (!l) return false;
      const isApproved = l.status === 'Approved' || l.currentStage === 'Fully Approved';
      return isApproved;
    });
  }, [leaves]);

  const onLeaveStaffCount = activeOnLeaveList.length;

  // On Duty Staff: Checked from assigned rosters or active status minus on leave
  const onDutyCount = useMemo(() => {
    const assignedRosterStaff = new Set(
      (rosters || [])
        .filter((r) => r && (r.status === 'Assigned' || r.status === 'Completed'))
        .map((r) => r.doctorName?.toLowerCase())
    );
    if (assignedRosterStaff.size > 0) {
      return assignedRosterStaff.size;
    }
    return Math.max(0, activeStaff.length - onLeaveStaffCount);
  }, [rosters, activeStaff, onLeaveStaffCount]);

  const totalOvertime = (attendance || []).reduce((acc, a) => acc + (a?.overtimeHours || 0), 0);

  // License alert count & compliance rate
  const allLicenses = useMemo(() => {
    return (employees || []).flatMap((e) =>
      (e?.medicalLicenses || []).map((lic) => ({
        ...lic,
        employeeName: `${e.firstName} ${e.lastName}`,
        department: e.department,
      }))
    );
  }, [employees]);

  const expiringLicenses = allLicenses.filter(
    (l) => l && (l.status === 'Expiring Soon' || l.status === 'Expired')
  );
  const validLicenses = allLicenses.filter((l) => l && l.status === 'Active');
  const licenseComplianceRate = allLicenses.length > 0
    ? Math.round((validLicenses.length / allLicenses.length) * 100)
    : 100;

  // Real-time Monthly Payroll Commitment: Sum of base salary + allowances for all active employees
  const monthlyPayrollCommitment = useMemo(() => {
    return (employees || []).reduce((sum, emp) => {
      const basic = emp.salary || 4500;
      const allowances = (emp.allowances || []).reduce((acc, al) => acc + (al.amount || 0), 0);
      return sum + basic + allowances;
    }, 0);
  }, [employees]);

  // Dynamic Cadre Breakdown
  const cadreDistribution = useMemo(() => {
    let doctors = 0;
    let nurses = 0;
    let pharmacy = 0;
    let lab = 0;
    let admin = 0;
    let allied = 0;

    (employees || []).forEach((e) => {
      const title = (e.jobTitle || '').toLowerCase();
      const dept = (e.department || '').toLowerCase();

      if (title.includes('doctor') || title.includes('physician') || title.includes('specialist') || title.includes('surgeon') || title.includes('consultant')) {
        doctors++;
      } else if (title.includes('nurse') || title.includes('midwife') || title.includes('matron')) {
        nurses++;
      } else if (title.includes('pharmac') || dept.includes('pharmac')) {
        pharmacy++;
      } else if (title.includes('lab') || title.includes('biomed') || dept.includes('lab')) {
        lab++;
      } else if (title.includes('admin') || title.includes('director') || title.includes('officer') || title.includes('account') || dept.includes('admin') || dept.includes('finance')) {
        admin++;
      } else {
        allied++;
      }
    });

    return [
      { name: 'Doctors & Specialists', value: doctors, color: '#10b981' },
      { name: 'Nurses & Midwives', value: nurses, color: '#06b6d4' },
      { name: 'Pharmacy & Dispensary', value: pharmacy, color: '#3b82f6' },
      { name: 'Medical Lab & Diagnostic', value: lab, color: '#8b5cf6' },
      { name: 'Admin, HR & Finance', value: admin, color: '#f59e0b' },
      { name: 'Allied Health & Support', value: allied, color: '#ec4899' },
    ].filter((item) => item.value > 0);
  }, [employees]);

  // Dynamic Gender Ratio
  const genderBreakdown = useMemo(() => {
    let female = 0;
    let male = 0;
    let other = 0;

    (employees || []).forEach((e) => {
      const g = (e.gender || '').toLowerCase();
      if (g === 'female' || g === 'f') female++;
      else if (g === 'male' || g === 'm') male++;
      else other++;
    });

    return {
      female,
      male,
      other,
      femalePercent: totalStaff > 0 ? Math.round((female / totalStaff) * 100) : 0,
      malePercent: totalStaff > 0 ? Math.round((male / totalStaff) * 100) : 0,
    };
  }, [employees, totalStaff]);

  // Compute Department Staff Distribution 100% synchronized from employees list
  const deptDistributionData = useMemo(() => {
    // Collect all departments from leadership plus any extra from employee records
    const knownDepts = new Map<string, { departmentName: string; departmentCode: string }>();

    (departmentLeadership || []).forEach((dept) => {
      if (dept?.departmentName) {
        knownDepts.set(dept.departmentName.toLowerCase(), {
          departmentName: dept.departmentName,
          departmentCode: dept.departmentCode || dept.departmentName.substring(0, 3).toUpperCase(),
        });
      }
    });

    (employees || []).forEach((e) => {
      if (e.department && !knownDepts.has(e.department.toLowerCase())) {
        knownDepts.set(e.department.toLowerCase(), {
          departmentName: e.department,
          departmentCode: e.department.substring(0, 3).toUpperCase(),
        });
      }
    });

    return Array.from(knownDepts.values()).map((dept) => {
      const deptEmployees = (employees || []).filter(
        (e) => e && (e.department || '').toLowerCase() === dept.departmentName.toLowerCase()
      );

      // Active approved leaves in this department
      const deptOnLeaveCount = (leaves || []).filter((l) => {
        if (!l) return false;
        const isDeptMatch = (l.department || '').toLowerCase() === dept.departmentName.toLowerCase();
        const isApproved = l.status === 'Approved' || l.currentStage === 'Fully Approved';
        return isDeptMatch && isApproved;
      }).length;

      const totalCount = deptEmployees.length;
      const onLeave = Math.min(deptOnLeaveCount, totalCount);
      const atPost = Math.max(0, totalCount - onLeave);

      return {
        department: dept.departmentName,
        code: dept.departmentCode,
        count: totalCount,
        onLeave: onLeave,
        atPost: atPost,
        availabilityPercent: totalCount > 0 ? Math.round((atPost / totalCount) * 100) : 100,
      };
    }).sort((a, b) => b.count - a.count);
  }, [departmentLeadership, employees, leaves]);

  const overtimeTrend = [
    { month: 'Jan', regularHours: 1600, overtimeHours: 120 },
    { month: 'Feb', regularHours: 1580, overtimeHours: 140 },
    { month: 'Mar', regularHours: 1620, overtimeHours: 180 },
    { month: 'Apr', regularHours: 1610, overtimeHours: 110 },
    { month: 'May', regularHours: 1650, overtimeHours: 195 },
    { month: 'Jun', regularHours: 1640, overtimeHours: 160 },
    { month: 'Jul', regularHours: 1680, overtimeHours: 210 },
  ];

  // Mechanised (GoG Paid) vs Non-Mechanised (Hospital IGF Paid) metrics
  const mechanisationMetrics = useMemo(() => {
    const list = employees || [];
    let mechanisedCount = 0;
    let nonMechanisedCount = 0;
    let mechanisedWageBill = 0;
    let nonMechanisedWageBill = 0;

    list.forEach((e) => {
      const isNonMechanised =
        e.mechanisationStatus === 'Non-Mechanised' ||
        (!e.mechanisationStatus && (e.employmentType === 'Contract' || (e.employmentType as any) === 'Locum'));
      const salary = Number(e.salary) || 0;

      if (isNonMechanised) {
        nonMechanisedCount += 1;
        nonMechanisedWageBill += salary;
      } else {
        mechanisedCount += 1;
        mechanisedWageBill += salary;
      }
    });

    const total = list.length || 1;
    const mechanisedPercent = Math.round((mechanisedCount / total) * 100);
    const nonMechanisedPercent = 100 - mechanisedPercent;

    return {
      mechanisedCount,
      nonMechanisedCount,
      mechanisedWageBill,
      nonMechanisedWageBill,
      totalWageBill: mechanisedWageBill + nonMechanisedWageBill,
      mechanisedPercent,
      nonMechanisedPercent,
    };
  }, [employees]);

  // Breakdown by department for Mechanised vs Non-Mechanised
  const deptMechanisationData = useMemo(() => {
    const map: Record<
      string,
      { department: string; code: string; mechanised: number; nonMechanised: number; hospitalIgfWage: number; gogWage: number }
    > = {};
    (employees || []).forEach((e) => {
      const dept = e.department || 'General Services';
      const code = dept
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 4)
        .toUpperCase();
      if (!map[dept]) {
        map[dept] = { department: dept, code, mechanised: 0, nonMechanised: 0, hospitalIgfWage: 0, gogWage: 0 };
      }
      const isNonMechanised =
        e.mechanisationStatus === 'Non-Mechanised' ||
        (!e.mechanisationStatus && (e.employmentType === 'Contract' || (e.employmentType as any) === 'Locum'));
      const salary = Number(e.salary) || 0;

      if (isNonMechanised) {
        map[dept].nonMechanised += 1;
        map[dept].hospitalIgfWage += salary;
      } else {
        map[dept].mechanised += 1;
        map[dept].gogWage += salary;
      }
    });
    return Object.values(map).sort((a, b) => b.nonMechanised - a.nonMechanised);
  }, [employees]);

  // Unique departments for filter
  const uniqueDepartments = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filtered staff list for the confidential executive registry view
  const filteredMechStaff = useMemo(() => {
    return (employees || []).filter((e) => {
      const isNonMechanised =
        e.mechanisationStatus === 'Non-Mechanised' ||
        (!e.mechanisationStatus && (e.employmentType === 'Contract' || (e.employmentType as any) === 'Locum'));
      const status: 'Mechanised' | 'Non-Mechanised' = isNonMechanised ? 'Non-Mechanised' : 'Mechanised';

      if (mechGroupFilter !== 'All' && status !== mechGroupFilter) return false;
      if (mechDeptFilter !== 'All' && e.department !== mechDeptFilter) return false;

      if (mechSearchTerm.trim()) {
        const q = mechSearchTerm.toLowerCase();
        const fullName = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase();
        const code = (e.empCode || '').toLowerCase();
        const role = (e.jobTitle || '').toLowerCase();
        const dept = (e.department || '').toLowerCase();
        return fullName.includes(q) || code.includes(q) || role.includes(q) || dept.includes(q);
      }
      return true;
    });
  }, [employees, mechGroupFilter, mechDeptFilter, mechSearchTerm]);

  // CSV Audit Export
  const handleExportMechanisationCSV = () => {
    const headers = [
      'Staff ID',
      'First Name',
      'Last Name',
      'Department',
      'Job Title',
      'Mechanisation Status',
      'Funding Source',
      'Monthly Basic Salary (GHS)',
      'Annualized Salary (GHS)',
    ];
    const rows = (employees || []).map((e) => {
      const isNonMechanised =
        e.mechanisationStatus === 'Non-Mechanised' ||
        (!e.mechanisationStatus && (e.employmentType === 'Contract' || (e.employmentType as any) === 'Locum'));
      const status = isNonMechanised ? 'Non-Mechanised' : 'Mechanised';
      const source = isNonMechanised ? 'Hospital Internally Generated Funds (IGF)' : 'Ghana Government Subvention (CAGD / MoH)';
      const monthly = Number(e.salary) || 0;
      const annual = monthly * 12;
      return [
        `"${e.empCode || e.id}"`,
        `"${e.firstName || ''}"`,
        `"${e.lastName || ''}"`,
        `"${e.department || ''}"`,
        `"${e.jobTitle || ''}"`,
        `"${status}"`,
        `"${source}"`,
        monthly,
        annual,
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Hospital_Workforce_Mechanisation_Audit_${(selectedHospital?.name || 'Facility').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleStaffMechanisation = (empId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'Non-Mechanised' ? 'Mechanised' : 'Non-Mechanised';
    updateEmployee(empId, { mechanisationStatus: nextStatus });
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Live Sync Status Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between border border-emerald-800/40">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Synchronized Staff Intelligence
            </span>
            <span className="text-xs text-slate-300">• {selectedHospital.name} ({selectedHospital.country})</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Healthcare Executive & Staff Hub</h2>
          <p className="mt-1 text-xs text-slate-300 max-w-2xl">
            Live hospital workforce intelligence synchronized in real time across the Employee Directory, Clinical Rosters, Biometric Attendance, Leaves, and Payroll.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('employees')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Doctor / Staff
          </button>
          <button
            onClick={() => setActiveTab('org_hierarchy')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <GitFork className="h-4 w-4" /> Org Structure
          </button>
          <button
            onClick={() => setActiveTab('conference')}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition-colors"
          >
            <Video className="h-4 w-4" /> Unit Huddles
          </button>
        </div>
      </div>

      {/* Synchronized Core Metrics Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Active Headcount */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Hospital Staff</span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalStaff}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Registered</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {activeStaff.length} Active
            </span>
            <span>•</span>
            <span>{probationStaff.length} Probation</span>
            <span>•</span>
            <span>{locumOrPartTimeStaff.length} Locum/PT</span>
          </div>
        </div>

        {/* On Duty / Clinical Staff */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-teal-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">At Post / On-Duty</span>
            <div className="rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Stethoscope className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{onDutyCount}</span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">On Shift / Active Post</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {onLeaveStaffCount} on Approved Leave
            </span>
            <button
              onClick={() => setActiveTab('shifts')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
            >
              View Roster →
            </button>
          </div>
        </div>

        {/* License & Credential Compliance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">License Compliance</span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">{licenseComplianceRate}%</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">PINs & MDC Valid</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span className={expiringLicenses.length > 0 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-slate-500'}>
              {expiringLicenses.length} Renewal Alert{expiringLicenses.length === 1 ? '' : 's'}
            </span>
            <button
              onClick={() => setActiveTab('credentials')}
              className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-0.5"
            >
              Verify <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Real-time Monthly Payroll Commitment */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly Payroll Gross</span>
            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(monthlyPayrollCommitment)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{totalStaff} Active Contracts</span>
            <button
              onClick={() => setActiveTab('payroll')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Vouchers →
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Staff Compliance & Certification Overview Widget */}
      <ComplianceOverviewWidget embedded={true} />

      {/* CONFIDENTIAL: Staff Mechanisation & Payroll Classification Suite (SEEN BY ONLY HR AND HEAD OF FACILITY) */}
      {isAuthorizedExecutive && (
        <section className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 text-white shadow-2xl space-y-6">
          {/* Header & Access Restriction Badge */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Lock className="h-3.5 w-3.5 text-amber-400" />
                  RESTRICTED ACCESS • HR & HEAD OF FACILITY ONLY
                </span>
                <span className="text-xs text-slate-400">
                  Executive Workforce Classification
                </span>
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Briefcase className="h-6 w-6 text-emerald-400" />
                Staff Mechanisation & Salary Disbursal Groups
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl">
                Official segregation of workforce by salary payment stream: <strong className="text-emerald-300">Mechanised</strong> (Salary paid directly by the Ghana Government / CAGD) versus <strong className="text-amber-300">Non-Mechanised</strong> (Salary paid directly from Hospital Internally Generated Funds - IGF).
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleExportMechanisationCSV}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition active:scale-95"
                title="Download complete staff mechanisation audit report as CSV"
              >
                <Download className="h-4 w-4" />
                Export Audit CSV
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('employees')}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition"
              >
                <Users className="h-4 w-4 text-emerald-400" />
                Staff Directory
              </button>
            </div>
          </div>

          {/* Grouping Highlight Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Mechanised Staff (Ghana Government Paid) */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🇬🇭</span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                    Mechanised Staff
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-300 border border-emerald-500/40">
                  {mechanisationMetrics.mechanisedPercent}% Workforce
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {mechanisationMetrics.mechanisedCount}
                </span>
                <span className="text-xs text-slate-400">Personnel</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-emerald-300">
                Salary Paid by: Ghana Government (GoG)
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Civil/public service payroll administered via CAGD / Ministry of Health subvention.
              </p>
              <div className="mt-4 pt-3 border-t border-emerald-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Monthly Government Subvention:</span>
                <span className="font-mono font-bold text-emerald-300">
                  {formatCurrency(mechanisationMetrics.mechanisedWageBill)}
                </span>
              </div>
            </div>

            {/* Card 2: Non-Mechanised Staff (Hospital IGF Paid) */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/60 to-slate-900 p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏥</span>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Non-Mechanised Staff
                  </span>
                </div>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-300 border border-amber-500/40">
                  {mechanisationMetrics.nonMechanisedPercent}% Workforce
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {mechanisationMetrics.nonMechanisedCount}
                </span>
                <span className="text-xs text-slate-400">Personnel</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-amber-300">
                Salary Paid by: Hospital Management (IGF)
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                Locum, contract, & temporary appointments funded directly from Internally Generated Funds.
              </p>
              <div className="mt-4 pt-3 border-t border-amber-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Monthly Direct Hospital Burden:</span>
                <span className="font-mono font-bold text-amber-300">
                  {formatCurrency(mechanisationMetrics.nonMechanisedWageBill)}
                </span>
              </div>
            </div>

            {/* Card 3: Total Combined Wage Bill & Financial Impact */}
            <div className="relative overflow-hidden rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-950/60 to-slate-900 p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                    <Banknote className="h-4 w-4" />
                    Workforce Payroll Fiscal Burden
                  </span>
                  <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300 border border-blue-500/30">
                    Hospital Fiscal Ratio
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                    {formatCurrency(mechanisationMetrics.totalWageBill)}
                  </span>
                  <span className="text-xs text-slate-400">/mo Gross</span>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hospital IGF Share:</span>
                    <span className="font-bold text-amber-300">
                      {mechanisationMetrics.totalWageBill > 0
                        ? Math.round((mechanisationMetrics.nonMechanisedWageBill / mechanisationMetrics.totalWageBill) * 100)
                        : 0}
                      % of Total Wage Bill
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ghana Govt Subvention:</span>
                    <span className="font-bold text-emerald-400">
                      {mechanisationMetrics.totalWageBill > 0
                        ? Math.round((mechanisationMetrics.mechanisedWageBill / mechanisationMetrics.totalWageBill) * 100)
                        : 100}
                      % Absorbed by GoG
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Facility: {selectedHospital.name}</span>
                <span className="text-emerald-400 font-semibold">Active Payroll Audit</span>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pt-2">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMechTab('overview')}
                className={`pb-3 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-2 ${
                  mechTab === 'overview'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building className="h-4 w-4" />
                Departmental Grouping Breakdown
              </button>
              <button
                type="button"
                onClick={() => setMechTab('staff_registry')}
                className={`pb-3 text-xs sm:text-sm font-bold transition border-b-2 flex items-center gap-2 ${
                  mechTab === 'staff_registry'
                    ? 'border-emerald-400 text-emerald-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                Confidential Staff Registry ({filteredMechStaff.length})
              </button>
            </div>
          </div>

          {/* TAB 1: Departmental Breakdown */}
          {mechTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Departmental Mechanisation Distribution & Hospital IGF Burden
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3 text-center">Total Staff</th>
                        <th className="py-2.5 px-3 text-center text-emerald-400">🇬🇭 Mechanised (GoG)</th>
                        <th className="py-2.5 px-3 text-center text-amber-400">🏥 Non-Mechanised (IGF)</th>
                        <th className="py-2.5 px-3 text-right text-amber-300">Hospital Monthly IGF Burden</th>
                        <th className="py-2.5 px-3 text-center">Mechanisation Ratio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {deptMechanisationData.map((d) => {
                        const total = d.mechanised + d.nonMechanised;
                        const mechPercent = total > 0 ? Math.round((d.mechanised / total) * 100) : 0;
                        return (
                          <tr key={d.department} className="hover:bg-slate-900/60 transition">
                            <td className="py-2.5 px-3 font-semibold text-white">
                              {d.department}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-300">
                              {total}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-400">
                              {d.mechanised}
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-400">
                              {d.nonMechanised}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-300">
                              {formatCurrency(d.hospitalIgfWage)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden flex">
                                  <div
                                    className="bg-emerald-500 h-full"
                                    style={{ width: `${mechPercent}%` }}
                                    title={`${mechPercent}% Mechanised`}
                                  />
                                  <div
                                    className="bg-amber-500 h-full"
                                    style={{ width: `${100 - mechPercent}%` }}
                                    title={`${100 - mechPercent}% Non-Mechanised`}
                                  />
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 w-8">
                                  {mechPercent}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Confidential Staff Registry & Quick Reclassification */}
          {mechTab === 'staff_registry' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={mechSearchTerm}
                    onChange={(e) => setMechSearchTerm(e.target.value)}
                    placeholder="Search by staff name, ID, role, or department..."
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Group Filter */}
                  <select
                    value={mechGroupFilter}
                    onChange={(e) => setMechGroupFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Payroll Groups ({employees.length})</option>
                    <option value="Mechanised">🇬🇭 Mechanised (GoG Paid)</option>
                    <option value="Non-Mechanised">🏥 Non-Mechanised (Hospital IGF)</option>
                  </select>

                  {/* Department Filter */}
                  <select
                    value={mechDeptFilter}
                    onChange={(e) => setMechDeptFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-semibold text-white rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[180px]"
                  >
                    <option value="All">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Table */}
              <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10">
                      <tr className="text-slate-400 font-bold">
                        <th className="py-2.5 px-3">Staff Details</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Classification Group</th>
                        <th className="py-2.5 px-3">Funding Stream</th>
                        <th className="py-2.5 px-3 text-right">Basic Salary</th>
                        <th className="py-2.5 px-3 text-center">Action / Reclassify</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredMechStaff.length > 0 ? (
                        filteredMechStaff.map((emp) => {
                          const isNonMech =
                            emp.mechanisationStatus === 'Non-Mechanised' ||
                            (!emp.mechanisationStatus && (emp.employmentType === 'Contract' || (emp.employmentType as any) === 'Locum'));
                          const status = isNonMech ? 'Non-Mechanised' : 'Mechanised';
                          return (
                            <tr key={emp.id} className="hover:bg-slate-900/60 transition">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-white flex items-center gap-1.5">
                                  <span>{emp.firstName} {emp.lastName}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  ID: {emp.empCode || emp.id} • {emp.jobTitle || 'Staff'}
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 font-medium">
                                {emp.department}
                              </td>
                              <td className="py-2.5 px-3">
                                {status === 'Mechanised' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    🇬🇭 Mechanised
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                    🏥 Non-Mechanised
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                                {status === 'Mechanised'
                                  ? 'Ghana Govt Subvention (CAGD)'
                                  : 'Hospital IGF Internally Paid'}
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-200">
                                {formatCurrency(Number(emp.salary) || 0)}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStaffMechanisation(emp.id, status)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                                  title={`Switch to ${status === 'Mechanised' ? 'Non-Mechanised (Hospital IGF)' : 'Mechanised (Ghana Govt)'}`}
                                >
                                  <ArrowRightLeft className="h-3 w-3 text-emerald-400" />
                                  Switch Group
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-500 italic">
                            No staff members match the selected criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Visual Analytics & Cadre Distributions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Department Staff Distribution (Count, At Post, On Leave) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" />
                Live Department Staff Allocation
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real-time headcount, active at-post personnel, and leave status across all clinical & operational units.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> At Post
              </span>
              <span className="flex items-center gap-1.5 text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> On Leave
              </span>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="code" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} Staff`,
                    name === 'atPost' ? 'At Post (On Duty)' : name === 'onLeave' ? 'On Approved Leave' : 'Total Count',
                  ]}
                />
                <Bar dataKey="atPost" stackId="a" fill="#10b981" name="atPost" radius={[0, 0, 0, 0]} />
                <Bar dataKey="onLeave" stackId="a" fill="#f59e0b" name="onLeave" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Department Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800/80 max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3 text-center">Headcount</th>
                  <th className="py-2 px-3 text-center text-amber-600 dark:text-amber-400">On Leave</th>
                  <th className="py-2 px-3 text-center text-emerald-600 dark:text-emerald-400">At Post</th>
                  <th className="py-2 px-3 text-right">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {deptDistributionData.map((d) => (
                  <tr key={d.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100">
                      {d.department} <span className="text-[10px] text-slate-400">({d.code})</span>
                    </td>
                    <td className="py-2 px-3 text-center font-bold">{d.count}</td>
                    <td className="py-2 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                      {d.onLeave}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {d.atPost}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {d.availabilityPercent}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Staff Cadre & Diversity Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Professional Cadres</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Synchronized clinical and operational workforce distribution.
            </p>
          </div>

          <div className="space-y-3">
            {cadreDistribution.map((item) => {
              const percent = totalStaff > 0 ? Math.round((item.value / totalStaff) * 100) : 0;
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="text-slate-900 dark:text-slate-100">{item.value} ({percent}%)</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gender Demographics Bar */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Workforce Gender Ratio</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {genderBreakdown.female} Female • {genderBreakdown.male} Male
              </span>
            </div>
            <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${genderBreakdown.femalePercent}%` }}
                title={`Female: ${genderBreakdown.femalePercent}%`}
              ></div>
              <div
                className="bg-teal-700 transition-all duration-500"
                style={{ width: `${genderBreakdown.malePercent}%` }}
                title={`Male: ${genderBreakdown.malePercent}%`}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span className="text-emerald-600 dark:text-emerald-400">Female: {genderBreakdown.femalePercent}%</span>
              <span className="text-teal-600 dark:text-teal-400">Male: {genderBreakdown.malePercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Workforce Attrition & Absenteeism Predictive Heatmap */}
      <AttritionAbsenteeismHeatmap embedded={true} />
    </div>
  );
};

