import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Award,
  Gavel,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Building2,
  Users,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Printer,
  Scale,
  RefreshCw,
  Mail,
  UserCheck,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  X,
  Eye,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { StaffQuery, DisciplinaryHearing, MedicalLicense } from '../../types/hrms';
import { QueryLetterMemoModal } from '../employees/DisciplinaryModals';

interface LicenseItemWithStaff extends MedicalLicense {
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  employeePhone?: string;
  department: string;
  jobTitle?: string;
  daysToExpiry: number;
}

export const ComplianceOverviewWidget: React.FC<{
  embedded?: boolean;
}> = ({ embedded = false }) => {
  const {
    employees,
    staffQueries,
    disciplinaryHearings,
    dispatchNotification,
    setActiveTab,
    showToast,
    selectedHospital,
  } = useHrms();

  // Active Sub-view in widget
  const [activeTabMode, setActiveTabMode] = useState<
    'summary' | 'certifications' | 'disciplinary' | 'department_matrix'
  >('summary');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedLicenseStatusFilter, setSelectedLicenseStatusFilter] = useState('ALL');
  const [selectedQueryStatusFilter, setSelectedQueryStatusFilter] = useState('ALL');

  // Email dispatch status per license
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});

  // Selected items for modal inspection
  const [inspectLicense, setInspectLicense] = useState<LicenseItemWithStaff | null>(null);
  const [inspectQuery, setInspectQuery] = useState<StaffQuery | null>(null);
  const [inspectHearing, setInspectHearing] = useState<DisciplinaryHearing | null>(null);
  const [viewMemoQuery, setViewMemoQuery] = useState<StaffQuery | null>(null);

  // ----------------------------------------------------
  // 1. AGGREGATED CREDENTIAL DATA
  // ----------------------------------------------------
  const today = useMemo(() => new Date('2026-09-01T00:00:00'), []);

  const allLicenses: LicenseItemWithStaff[] = useMemo(() => {
    const list: LicenseItemWithStaff[] = [];
    (employees || []).forEach((emp) => {
      if (!emp) return;
      (emp.medicalLicenses || []).forEach((lic) => {
        let daysToExpiry = 999;
        if (lic.expiryDate) {
          const expDate = new Date(lic.expiryDate);
          const diffTime = expDate.getTime() - today.getTime();
          daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Determine real-time derived status if needed
        let derivedStatus = lic.status;
        if (daysToExpiry < 0 && derivedStatus !== 'Suspended') {
          derivedStatus = 'Expired';
        } else if (daysToExpiry <= 60 && daysToExpiry >= 0 && derivedStatus === 'Active') {
          derivedStatus = 'Expiring Soon';
        }

        list.push({
          ...lic,
          status: derivedStatus,
          employeeId: emp.id,
          employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff Member',
          employeeEmail: emp.email || '',
          employeePhone: emp.phone,
          department: emp.department || 'General Services',
          jobTitle: emp.jobTitle || 'Clinical Staff',
          daysToExpiry,
        });
      });
    });
    return list;
  }, [employees, today]);

  // License Statistics
  const totalLicenses = allLicenses.length;
  const activeLicenses = allLicenses.filter((l) => l.status === 'Active');
  const expiringSoonLicenses = allLicenses.filter((l) => l.status === 'Expiring Soon');
  const expiredLicenses = allLicenses.filter((l) => l.status === 'Expired');
  const suspendedLicenses = allLicenses.filter((l) => l.status === 'Suspended');

  const licenseComplianceRate =
    totalLicenses > 0 ? Math.round((activeLicenses.length / totalLicenses) * 100) : 100;

  // ----------------------------------------------------
  // 2. AGGREGATED DISCIPLINARY & STATUTORY DATA
  // ----------------------------------------------------
  const allQueries: StaffQuery[] = useMemo(() => staffQueries || [], [staffQueries]);
  const allHearings: DisciplinaryHearing[] = useMemo(
    () => disciplinaryHearings || [],
    [disciplinaryHearings]
  );

  // Categorized Queries
  const openQueries = allQueries.filter(
    (q) =>
      q.status === 'Query Issued' ||
      q.status === 'Awaiting Staff Response' ||
      q.status === 'Response Submitted' ||
      q.status === 'Under Review' ||
      q.status === 'Referred to Disciplinary Board' ||
      q.status === 'Hearing Scheduled'
  );

  const awaitingResponseQueries = allQueries.filter(
    (q) => q.status === 'Query Issued' || q.status === 'Awaiting Staff Response'
  );
  const defenseSubmittedQueries = allQueries.filter((q) => q.status === 'Response Submitted');
  const underReviewQueries = allQueries.filter(
    (q) => q.status === 'Under Review' || q.status === 'Referred to Disciplinary Board'
  );
  const resolvedQueries = allQueries.filter(
    (q) =>
      q.status === 'Sanction Applied' ||
      q.status === 'Verdict Delivered' ||
      q.status === 'Case Closed / Exonerated' ||
      q.status === 'Case Closed / Dropped'
  );

  // Overdue queries (deadline passed and still awaiting response)
  const overdueQueries = awaitingResponseQueries.filter((q) => {
    if (!q.responseDeadlineDate) return false;
    const deadline = new Date(q.responseDeadlineDate);
    return deadline.getTime() < today.getTime();
  });

  // Scheduled & Active Hearings
  const upcomingHearings = allHearings.filter(
    (h) => h.status === 'Scheduled' || h.status === 'In Session' || h.status === 'Deliberating'
  );

  // Disciplinary Health Rate (% of cases resolved or in compliance)
  const disciplinaryClearanceRate =
    allQueries.length > 0
      ? Math.max(0, Math.round(((allQueries.length - openQueries.length) / allQueries.length) * 100))
      : 100;

  // ----------------------------------------------------
  // 3. COMPOSITE INSTITUTIONAL COMPLIANCE SCORE
  // ----------------------------------------------------
  // Weighted: 60% Active Valid Licensing + 40% Disciplinary Stability (no open critical breaches/overdue)
  const compositeScore = useMemo(() => {
    const licenseWeight = licenseComplianceRate * 0.6;
    const penaltyPerOverdueQuery = Math.min(20, overdueQueries.length * 8);
    const penaltyPerExpiredLic = Math.min(20, expiredLicenses.length * 5);
    const disciplinaryBase = Math.max(0, 100 - penaltyPerOverdueQuery - penaltyPerExpiredLic);
    const disciplinaryWeight = disciplinaryBase * 0.4;
    return Math.min(100, Math.max(0, Math.round(licenseWeight + disciplinaryWeight)));
  }, [licenseComplianceRate, overdueQueries.length, expiredLicenses.length]);

  const complianceStatusTier = useMemo(() => {
    if (compositeScore >= 90) {
      return {
        label: 'Excellent / Regulatory Compliant',
        badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        ringColor: 'stroke-emerald-500',
        desc: 'All statutory health councils and institutional protocols are within high compliance benchmarks.',
      };
    }
    if (compositeScore >= 75) {
      return {
        label: 'Moderate Risk / Renewals & Actions Due',
        badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        ringColor: 'stroke-amber-500',
        desc: 'Multiple staff credentials require renewal and pending queries require HR triage.',
      };
    }
    return {
      label: 'Critical Non-Compliance Alert',
      badgeColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      ringColor: 'stroke-rose-500',
      desc: 'Immediate executive intervention required for expired clinical licenses or overdue statutory queries.',
    };
  }, [compositeScore]);

  // ----------------------------------------------------
  // 4. DEPARTMENT COMPLIANCE AGGREGATION
  // ----------------------------------------------------
  const departmentsList = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach((e) => {
      if (e?.department) set.add(e.department);
    });
    return Array.from(set).sort();
  }, [employees]);

  const departmentComplianceData = useMemo(() => {
    return departmentsList.map((dept) => {
      const deptStaff = (employees || []).filter(
        (e) => (e.department || '').toLowerCase() === dept.toLowerCase()
      );
      const deptLic = allLicenses.filter(
        (l) => (l.department || '').toLowerCase() === dept.toLowerCase()
      );
      const deptQueries = allQueries.filter(
        (q) => (q.staffDepartment || '').toLowerCase() === dept.toLowerCase()
      );

      const activeLicCount = deptLic.filter((l) => l.status === 'Active').length;
      const totalLicCount = deptLic.length;
      const licRate = totalLicCount > 0 ? Math.round((activeLicCount / totalLicCount) * 100) : 100;

      const openQueriesCount = deptQueries.filter(
        (q) =>
          q.status !== 'Sanction Applied' &&
          q.status !== 'Verdict Delivered' &&
          q.status !== 'Case Closed / Exonerated' &&
          q.status !== 'Case Closed / Dropped'
      ).length;

      const overdueCount = deptQueries.filter((q) => {
        if (
          (q.status !== 'Query Issued' && q.status !== 'Awaiting Staff Response') ||
          !q.responseDeadlineDate
        )
          return false;
        return new Date(q.responseDeadlineDate).getTime() < today.getTime();
      }).length;

      return {
        department: dept,
        staffCount: deptStaff.length,
        totalLicenses: totalLicCount,
        activeLicenses: activeLicCount,
        expiringOrExpiredLicenses: totalLicCount - activeLicCount,
        licenseComplianceRate: licRate,
        totalQueries: deptQueries.length,
        openQueries: openQueriesCount,
        overdueQueries: overdueCount,
        statusScore: Math.round(licRate * 0.7 + Math.max(0, 100 - openQueriesCount * 15) * 0.3),
      };
    }).sort((a, b) => b.staffCount - a.staffCount);
  }, [departmentsList, employees, allLicenses, allQueries, today]);

  // ----------------------------------------------------
  // 5. FILTERED LISTS
  // ----------------------------------------------------
  const filteredLicenses = useMemo(() => {
    return allLicenses.filter((lic) => {
      const matchesSearch =
        searchQuery === '' ||
        lic.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.licenseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.issuingAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lic.department.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        lic.department.toLowerCase() === selectedDeptFilter.toLowerCase();

      const matchesStatus =
        selectedLicenseStatusFilter === 'ALL' || lic.status === selectedLicenseStatusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [allLicenses, searchQuery, selectedDeptFilter, selectedLicenseStatusFilter]);

  const filteredQueries = useMemo(() => {
    return allQueries.filter((q) => {
      const matchesSearch =
        searchQuery === '' ||
        q.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.queryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.staffDepartment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.misconductCategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept =
        selectedDeptFilter === 'ALL' ||
        q.staffDepartment.toLowerCase() === selectedDeptFilter.toLowerCase();

      const isOverdue =
        (q.status === 'Query Issued' || q.status === 'Awaiting Staff Response') &&
        q.responseDeadlineDate &&
        new Date(q.responseDeadlineDate).getTime() < today.getTime();

      const matchesStatus =
        selectedQueryStatusFilter === 'ALL' ||
        (selectedQueryStatusFilter === 'OVERDUE'
          ? isOverdue
          : q.status === selectedQueryStatusFilter);

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [allQueries, searchQuery, selectedDeptFilter, selectedQueryStatusFilter, today]);

  // ----------------------------------------------------
  // 6. ACTION HANDLERS
  // ----------------------------------------------------
  const handleSendLicenseAlert = async (lic: LicenseItemWithStaff) => {
    setDispatchStatus((prev) => ({ ...prev, [lic.id]: 'sending' }));
    try {
      await dispatchNotification(
        lic.employeeEmail || lic.employeeId,
        `Statutory Credential Expiry Alert: ${lic.licenseType}`,
        `Dear ${lic.employeeName},\n\nOur institutional HR compliance registry indicates that your ${lic.licenseType} (License #${lic.licenseNumber}) is scheduled to expire on ${lic.expiryDate}. Please ensure your verified CPD points and renewal fee are lodged with ${lic.issuingAuthority} immediately to prevent clinical credential suspension.\n\nDirectorate of Human Resources\n${selectedHospital.name}`,
        'Email',
        'License_Expiry'
      );
      setDispatchStatus((prev) => ({ ...prev, [lic.id]: 'sent' }));
      showToast(
        'success',
        'Credential Renewal Alert Dispatched',
        `Official notice sent to ${lic.employeeName} (${lic.employeeEmail})`
      );
    } catch (e) {
      setDispatchStatus((prev) => ({ ...prev, [lic.id]: 'idle' }));
      showToast('error', 'Dispatch Failed', 'Could not send license alert email.');
    }
  };

  const handleSendQueryReminder = async (query: StaffQuery) => {
    try {
      await dispatchNotification(
        query.staffEmail || query.staffId,
        `URGENT: Outstanding Formal Query Response Reminder (${query.queryNumber})`,
        `Dear ${query.staffName},\n\nThis is a formal reminder regarding Query #${query.queryNumber} regarding "${query.subject}". Your statutory response deadline is ${query.responseDeadlineDate}.\n\nPlease submit your written defense dossier through the staff portal immediately to prevent escalation to the Hospital Disciplinary Tribunal.`,
        'Email',
        'Query_Issued'
      );
      showToast(
        'success',
        'Query Reminder Sent',
        `Urgent compliance reminder dispatched to ${query.staffName}.`
      );
    } catch (e) {
      showToast('error', 'Dispatch Failed', 'Could not send query reminder.');
    }
  };

  // ----------------------------------------------------
  // 7. RENDER
  // ----------------------------------------------------
  return (
    <div
      id="compliance-overview-widget"
      className={`rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 transition-all ${
        embedded ? 'p-4 sm:p-6' : 'p-6 space-y-6'
      }`}
    >
      {/* Widget Header & Navigation */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/80 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="h-3.5 w-3.5" /> Real-Time Staff Compliance Engine
            </span>
            <span className="text-xs text-slate-400">
              Aggregated from CredentialTracker & Disciplinary Tribunal
            </span>
          </div>
          <h3 className="mt-1.5 text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Compliance & Statutory Governance
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Live executive oversight of clinical licensures (MDC, NMC, PC, AHPC), Life Support
            certifications, staff queries, and pending disciplinary actions.
          </p>
        </div>

        {/* Quick Nav Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('credentials')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-600 transition border border-slate-200 dark:border-slate-700 active:scale-95"
            title="Open Full Credential Tracker"
          >
            <Award className="h-4 w-4 text-emerald-500" />
            <span>Credential Tracker</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('disciplinary_board')}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-indigo-600 transition border border-slate-200 dark:border-slate-700 active:scale-95"
            title="Open Full Disciplinary Board & Tribunal"
          >
            <Gavel className="h-4 w-4 text-indigo-500" />
            <span>Disciplinary Board</span>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
          </button>
        </div>
      </div>

      {/* COMPOSITE SCORE & KPI CARDS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* 1. Composite Compliance Index */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hospital Compliance Index
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-black border uppercase tracking-wider ${complianceStatusTier.badgeColor}`}
            >
              {compositeScore}% Score
            </span>
          </div>

          <div className="my-3 flex items-center gap-3">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <svg className="h-14 w-14 -rotate-90 transform">
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="5"
                  className="text-slate-200 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeDasharray={138.2}
                  strokeDashoffset={138.2 - (138.2 * compositeScore) / 100}
                  className={`${complianceStatusTier.ringColor} transition-all duration-1000 ease-out`}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-sm font-black text-slate-900 dark:text-white">
                {compositeScore}%
              </span>
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                {complianceStatusTier.label}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                {complianceStatusTier.desc}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>Clinical Licensure: <strong>{licenseComplianceRate}%</strong></span>
            <span>Tribunal Cases: <strong>{openQueries.length} Open</strong></span>
          </div>
        </div>

        {/* 2. Clinical Credentials & Certifications */}
        <div
          onClick={() => setActiveTabMode('certifications')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Staff Certifications
            </span>
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {activeLicenses.length}
            </span>
            <span className="text-xs text-slate-500">/ {totalLicenses} Valid Licenses</span>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-2 text-[11px] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                <Clock className="h-3 w-3" /> Expiring Soon (&le;60d):
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {expiringSoonLicenses.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <AlertTriangle className="h-3 w-3" /> Expired / Delinquent:
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {expiredLicenses.length}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Disciplinary Queries & Investigations */}
        <div
          onClick={() => setActiveTabMode('disciplinary')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-amber-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Staff Queries & Cases
            </span>
            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {openQueries.length}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
              Active Investigations
            </span>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-2 text-[11px] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Awaiting Staff Defense:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {awaitingResponseQueries.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                <AlertCircle className="h-3 w-3" /> Overdue Responses:
              </span>
              <span className="font-black text-rose-600 dark:text-rose-400">
                {overdueQueries.length}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Disciplinary Hearings & Pending Actions */}
        <div
          onClick={() => setActiveTabMode('disciplinary')}
          className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tribunal & Actions Due
            </span>
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Gavel className="h-4 w-4" />
            </div>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {upcomingHearings.length}
            </span>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
              Tribunal Hearings
            </span>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-2 text-[11px] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Defense Awaiting HR Review:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {defenseSubmittedQueries.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Total Sanctions Applied:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {resolvedQueries.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS WITHIN WIDGET */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTabMode('summary')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'summary'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Executive Summary</span>
          </button>

          <button
            onClick={() => setActiveTabMode('certifications')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'certifications'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-emerald-500" />
            <span>Staff Licensures & Credentials ({allLicenses.length})</span>
            {expiringSoonLicenses.length + expiredLicenses.length > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] text-white font-black">
                {expiringSoonLicenses.length + expiredLicenses.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabMode('disciplinary')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'disciplinary'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Gavel className="h-3.5 w-3.5 text-indigo-500" />
            <span>Disciplinary & Statutory Pipeline ({openQueries.length})</span>
            {overdueQueries.length > 0 && (
              <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[10px] text-white font-black animate-pulse">
                {overdueQueries.length} Overdue
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTabMode('department_matrix')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTabMode === 'department_matrix'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-teal-500" />
            <span>Departmental Matrix</span>
          </button>
        </div>

        {/* Global Search inside Widget */}
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff, PIN, query #, council..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* ==================================================== */}
      {/* VIEW 1: EXECUTIVE SUMMARY DUAL-STREAM VIEW           */}
      {/* ==================================================== */}
      {activeTabMode === 'summary' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Urgent Credential Renewals Stream */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                <Award className="h-4 w-4 text-emerald-500" />
                <span>Immediate Credential Expiry Alerts</span>
              </div>
              <button
                onClick={() => setActiveTabMode('certifications')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View all ({allLicenses.length}) →
              </button>
            </div>

            {expiringSoonLicenses.length === 0 && expiredLicenses.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center dark:border-emerald-950 dark:bg-emerald-950/20">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h5 className="mt-1 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  All Staff Credentials Up to Date
                </h5>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  No medical council licenses or certifications are due for expiry within the next 60 days.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {[...expiredLicenses, ...expiringSoonLicenses].slice(0, 5).map((lic) => (
                  <div
                    key={lic.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {lic.employeeName}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                            lic.status === 'Expired'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {lic.status} ({lic.daysToExpiry < 0 ? `${Math.abs(lic.daysToExpiry)}d Overdue` : `${lic.daysToExpiry}d left`})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <strong className="text-emerald-600 dark:text-emerald-400">{lic.licenseType}</strong> • PIN #{lic.licenseNumber} ({lic.issuingAuthority})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {lic.department} • Expiry: <strong>{lic.expiryDate}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setInspectLicense(lic)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                        title="View Full License Dossier"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSendLicenseAlert(lic)}
                        disabled={dispatchStatus[lic.id] === 'sending'}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50 transition active:scale-95"
                      >
                        {dispatchStatus[lic.id] === 'sending' ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : dispatchStatus[lic.id] === 'sent' ? (
                          <span>✓ Sent</span>
                        ) : (
                          <>
                            <Send className="h-3 w-3" /> <span>Alert Staff</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pending Disciplinary & Tribunal Action Items */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800/80 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-xs">
                <Gavel className="h-4 w-4 text-indigo-500" />
                <span>Pending Disciplinary Actions & Tribunals</span>
              </div>
              <button
                onClick={() => setActiveTabMode('disciplinary')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all ({openQueries.length}) →
              </button>
            </div>

            {openQueries.length === 0 && upcomingHearings.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-center dark:border-emerald-950 dark:bg-emerald-950/20">
                <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <h5 className="mt-1 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Clean Institutional Registry
                </h5>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  No outstanding queries or pending disciplinary tribunal hearings.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {/* Highlight Overdue Queries First */}
                {overdueQueries.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-rose-300 bg-rose-50/60 p-3 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/30 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-rose-900 dark:text-rose-200">
                          {q.staffName}
                        </span>
                        <span className="rounded-md bg-rose-500 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider">
                          Overdue Response
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                        {q.queryNumber} • {q.subject}
                      </p>
                      <p className="text-[10px] text-rose-700/80 dark:text-rose-400">
                        Deadline Was: <strong>{q.responseDeadlineDate}</strong> ({q.staffDepartment})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setViewMemoQuery(q)}
                        className="rounded-lg bg-white dark:bg-slate-900 px-2 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        title="View Official Query Memo"
                      >
                        Memo
                      </button>
                      <button
                        onClick={() => handleSendQueryReminder(q)}
                        className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-rose-500"
                        title="Send Urgent Warning"
                      >
                        Remind
                      </button>
                    </div>
                  </div>
                ))}

                {/* Defense Submitted Queries Awaiting HR / Board Review */}
                {defenseSubmittedQueries.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {q.staffName}
                        </span>
                        <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:text-amber-300">
                          Defense Submitted
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        {q.queryNumber} • {q.subject}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Plea: <strong>{q.staffResponse?.plea || 'Under Review'}</strong> • Awaiting Board Action
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setInspectQuery(q)}
                        className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-amber-500"
                      >
                        Review Defense
                      </button>
                    </div>
                  </div>
                ))}

                {/* Upcoming Scheduled Hearings */}
                {upcomingHearings.map((h) => (
                  <div
                    key={h.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/20 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {h.accusedStaffName}
                        </span>
                        <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:text-indigo-300">
                          Tribunal Hearing
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300">
                        Case {h.hearingCaseNumber} • 📅 {h.hearingDate} ({h.hearingTime})
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Venue: <strong>{h.venue}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setInspectHearing(h)}
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-indigo-500"
                      >
                        View Docket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 2: FULL CERTIFICATIONS & LICENSURE TAB          */}
      {/* ==================================================== */}
      {activeTabMode === 'certifications' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Filter By Status:</span>
              {['ALL', 'Active', 'Expiring Soon', 'Expired'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedLicenseStatusFilter(status)}
                  className={`rounded-lg px-2.5 py-1 font-bold transition ${
                    selectedLicenseStatusFilter === status
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Licenses Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Doctor / Staff Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Credential Type</th>
                    <th className="px-4 py-3">License # / Authority</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                  {filteredLicenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No credentials match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredLicenses.map((lic) => (
                      <tr key={lic.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                          <div>{lic.employeeName}</div>
                          <div className="text-[10px] text-slate-400">{lic.jobTitle}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {lic.department}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                          {lic.licenseType}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono">{lic.licenseNumber}</div>
                          <div className="text-[10px] text-slate-400">{lic.issuingAuthority}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          <div>{lic.expiryDate}</div>
                          <div className="text-[10px] text-slate-400">
                            {lic.daysToExpiry < 0 ? (
                              <span className="text-rose-500 font-bold">
                                {Math.abs(lic.daysToExpiry)} days overdue
                              </span>
                            ) : (
                              <span>{lic.daysToExpiry} days remaining</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              lic.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : lic.status === 'Expiring Soon'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {lic.status === 'Active' ? (
                              <ShieldCheck className="h-3 w-3" />
                            ) : (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {lic.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectLicense(lic)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                              title="Inspect Full License"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSendLicenseAlert(lic)}
                              disabled={dispatchStatus[lic.id] === 'sending'}
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 transition"
                              title="Send Reminder Email"
                            >
                              {dispatchStatus[lic.id] === 'sending' ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : dispatchStatus[lic.id] === 'sent' ? (
                                <span className="text-emerald-600 dark:text-emerald-400">✓ Sent</span>
                              ) : (
                                <>
                                  <Send className="h-3 w-3" /> Alert
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 3: DISCIPLINARY & STATUTORY PIPELINE TAB        */}
      {/* ==================================================== */}
      {activeTabMode === 'disciplinary' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-500 dark:text-slate-400">Filter By Status:</span>
              {['ALL', 'OVERDUE', 'Awaiting Staff Response', 'Response Submitted', 'Under Review', 'Sanction Applied'].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedQueryStatusFilter(status)}
                    className={`rounded-lg px-2.5 py-1 font-bold transition ${
                      selectedQueryStatusFilter === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {status === 'OVERDUE' ? '⚠️ Overdue' : status}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setActiveTab('disciplinary_board')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Open Full Tribunal Management <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Queries List */}
          <div className="space-y-3">
            {filteredQueries.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                No disciplinary queries match the filter.
              </div>
            ) : (
              filteredQueries.map((q) => {
                const isOverdue =
                  (q.status === 'Query Issued' || q.status === 'Awaiting Staff Response') &&
                  q.responseDeadlineDate &&
                  new Date(q.responseDeadlineDate).getTime() < today.getTime();

                return (
                  <div
                    key={q.id}
                    className={`rounded-2xl border p-4 transition ${
                      isOverdue
                        ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {q.queryNumber}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              isOverdue
                                ? 'bg-rose-500 text-white font-black animate-pulse'
                                : q.status === 'Response Submitted'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : q.status === 'Resolved / Sanction Applied'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {isOverdue ? 'OVERDUE DEFENSE' : q.status}
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {q.misconductCategory}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {q.subject}
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Staff: <strong>{q.staffName}</strong> ({q.staffRole}) • Dept: <strong>{q.staffDepartment}</strong> • Issued By: <strong>{q.issuedBy}</strong> on {q.dateIssued}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => setViewMemoQuery(q)}
                          className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                        >
                          View Memo
                        </button>
                        {q.staffResponse && (
                          <button
                            onClick={() => setInspectQuery(q)}
                            className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-600 transition"
                          >
                            Review Defense
                          </button>
                        )}
                        {isOverdue && (
                          <button
                            onClick={() => handleSendQueryReminder(q)}
                            className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition"
                          >
                            Send Reminder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW 4: DEPARTMENT COMPLIANCE MATRIX                 */}
      {/* ==================================================== */}
      {activeTabMode === 'department_matrix' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time compliance scorecard per department, comparing valid medical licenses against active disciplinary actions.
          </p>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold uppercase tracking-wider text-[10px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-center">Staff Count</th>
                    <th className="px-4 py-3 text-center">Total Licenses</th>
                    <th className="px-4 py-3 text-center">Valid Credentials</th>
                    <th className="px-4 py-3 text-center">Active Queries</th>
                    <th className="px-4 py-3 text-right">Compliance Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                  {departmentComplianceData.map((d) => (
                    <tr key={d.department} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {d.department}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold">{d.staffCount}</td>
                      <td className="px-4 py-3 text-center font-mono">{d.totalLicenses}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-bold ${
                            d.expiringOrExpiredLicenses > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {d.activeLicenses} / {d.totalLicenses} ({d.licenseComplianceRate}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.openQueries > 0 ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            {d.openQueries} Open {d.overdueQueries > 0 ? `(${d.overdueQueries} Overdue)` : ''}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                d.statusScore >= 90
                                  ? 'bg-emerald-500'
                                  : d.statusScore >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${d.statusScore}%` }}
                            ></div>
                          </div>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {d.statusScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: INSPECT CREDENTIAL MODAL                   */}
      {/* ==================================================== */}
      {inspectLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <Award className="h-5 w-5 text-emerald-500" />
                <span>Clinical Credential Dossier</span>
              </div>
              <button
                onClick={() => setInspectLicense(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">
                    {inspectLicense.employeeName}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      inspectLicense.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                    }`}
                  >
                    {inspectLicense.status}
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  {inspectLicense.jobTitle} • {inspectLicense.department}
                </p>
                <p className="text-slate-500 dark:text-slate-400 font-mono">
                  Email: {inspectLicense.employeeEmail}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Credential Type</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {inspectLicense.licenseType}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">License / PIN #</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">
                    {inspectLicense.licenseNumber}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Issuing Authority</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {inspectLicense.issuingAuthority}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Expiry Date</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {inspectLicense.expiryDate} ({inspectLicense.daysToExpiry}d remaining)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectLicense(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSendLicenseAlert(inspectLicense);
                  setInspectLicense(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 font-bold text-white shadow hover:bg-emerald-500"
              >
                Dispatch Renewal Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: INSPECT DEFENSE MODAL                      */}
      {/* ==================================================== */}
      {inspectQuery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <FileText className="h-5 w-5 text-amber-500" />
                <span>Staff Query Response & Defense Dossier</span>
              </div>
              <button
                onClick={() => setInspectQuery(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-amber-900 dark:text-amber-200">
                    {inspectQuery.queryNumber}
                  </span>
                  <span className="text-amber-800 dark:text-amber-300 font-semibold">
                    Plea: {inspectQuery.staffResponse?.plea || 'Under Review'}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">{inspectQuery.subject}</h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Staff: {inspectQuery.staffName} ({inspectQuery.staffRole}) • {inspectQuery.staffDepartment}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Staff Written Explanation & Mitigating Defense:
                </span>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
                  {inspectQuery.staffResponse?.explanation || 'No written response recorded.'}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setViewMemoQuery(inspectQuery);
                  setInspectQuery(null);
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
              >
                View Query Letter Memo
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setInspectQuery(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActiveTab('disciplinary_board');
                    setInspectQuery(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow hover:bg-indigo-500"
                >
                  Manage in Disciplinary Tribunal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: INSPECT HEARING MODAL                      */}
      {/* ==================================================== */}
      {inspectHearing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm">
                <Gavel className="h-5 w-5 text-indigo-500" />
                <span>Disciplinary Tribunal Hearing Docket</span>
              </div>
              <button
                onClick={() => setInspectHearing(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-900 dark:text-indigo-200">
                    {inspectHearing.hearingCaseNumber}
                  </span>
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {inspectHearing.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Accused: {inspectHearing.accusedStaffName} ({inspectHearing.accusedStaffRole})
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  Dept: {inspectHearing.accusedStaffDept} • Query Ref: {inspectHearing.queryNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Hearing Date & Time</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {inspectHearing.hearingDate} ({inspectHearing.hearingTime})
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Venue</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {inspectHearing.venue}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Charges Summary:
                </span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  {inspectHearing.chargesSummary}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Presiding Tribunal Panel:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectHearing.presidingPanel.map((member, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setInspectHearing(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setActiveTab('disciplinary_board');
                  setInspectHearing(null);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 font-bold text-white shadow hover:bg-indigo-500"
              >
                Open Tribunal Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Query Letter Memo Modal */}
      {viewMemoQuery && (
        <QueryLetterMemoModal
          isOpen={!!viewMemoQuery}
          onClose={() => setViewMemoQuery(null)}
          query={viewMemoQuery}
        />
      )}
    </div>
  );
};
