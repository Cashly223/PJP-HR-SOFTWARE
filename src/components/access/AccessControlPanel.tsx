import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Building2,
  Users,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Gavel,
  FileText,
  ShieldAlert,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Package,
  Video,
  FileSpreadsheet,
  Settings,
  Code,
  Bell,
  Stethoscope,
  ChevronRight,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, UserRole } from '../../types/hrms';

export interface GrantableModuleConfig {
  key: string;
  name: string;
  category: 'Disciplinary & Governance' | 'Personnel & Rosters' | 'Compensation & Performance' | 'Clinical & Operations' | 'Analytics & System';
  desc: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

export const AccessControlPanel: React.FC = () => {
  const {
    employees,
    staffPermissions,
    grantStaffAccess,
    revokeStaffAccess,
    currentUser,
    activeRole,
    canIssueQueries,
  } = useHrms();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<'All' | 'Heads' | 'CustomGranted' | 'QueryAuthorized'>('All');
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [permissionNotes, setPermissionNotes] = useState('');
  const [modalCategoryTab, setModalCategoryTab] = useState<string>('All');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const GRANTABLE_MODULES: GrantableModuleConfig[] = [
    // 1. Governance & Disciplinary
    {
      key: 'disciplinary_board',
      name: 'Disciplinary Tribunal & Standing Board',
      category: 'Disciplinary & Governance',
      desc: 'Access to disciplinary tribunal hearings, panel registries, query dossiers, and statutory hearing management.',
      icon: Gavel,
      badge: 'Confidential Tribunal',
      highlight: true,
    },
    {
      key: 'query_issuance',
      name: 'Formal Staff Query Authority (Head Delegation)',
      category: 'Disciplinary & Governance',
      desc: 'Statutory authority empowering Unit Heads, Ward In-Charges, and HODs to issue official written queries to subordinates.',
      icon: FileText,
      badge: 'HR Delegated',
      highlight: true,
    },
    {
      key: 'grievances',
      name: 'Grievance Bureau & Whistleblower Dossiers',
      category: 'Disciplinary & Governance',
      desc: 'Access to confidential workplace grievance logs, whistleblowing reports, and internal dispute resolutions.',
      icon: ShieldAlert,
      badge: 'Confidential',
    },
    {
      key: 'audit',
      name: 'System Security & Audit Logs',
      category: 'Disciplinary & Governance',
      desc: 'Administrative security audit trail, biometric logs, and system data mutation records.',
      icon: ShieldCheck,
      badge: 'Security',
    },

    // 2. Personnel, Records & Rostering
    {
      key: 'employees',
      name: 'Staff Directory & Personnel Admin',
      category: 'Personnel & Rosters',
      desc: 'View full personnel profiles, manage contracts, edit designations, and export employee data.',
      icon: Users,
    },
    {
      key: 'staff_files',
      name: 'Staff File Vault & Document Dossiers',
      category: 'Personnel & Rosters',
      desc: 'Access to confidential personnel document archives, appointment letters, and certifications.',
      icon: FileText,
    },
    {
      key: 'shifts',
      name: 'Live Duty Roaster & Shift Scheduler',
      category: 'Personnel & Rosters',
      desc: 'Shift creation, department roster allocation, swaps management, and roster publication.',
      icon: Calendar,
    },
    {
      key: 'attendance',
      name: 'Biometric Attendance & Sync Audit',
      category: 'Personnel & Rosters',
      desc: 'Review biometric clock-in logs, late arrivals, absenteeism audits, and excuse approvals.',
      icon: Clock,
    },
    {
      key: 'leave',
      name: 'Leave & Absence Governance',
      category: 'Personnel & Rosters',
      desc: 'Manage leave applications, maternity/annual leave quotas, and departmental approvals.',
      icon: Calendar,
    },

    // 3. Compensation, Performance & Careers
    {
      key: 'payroll',
      name: 'Payroll & Compensation Engine',
      category: 'Compensation & Performance',
      desc: 'View and manage salary vouchers, SSNIT deductions, allowances, and tax withholding.',
      icon: DollarSign,
      badge: 'Financial',
    },
    {
      key: 'performance',
      name: 'Performance Appraisals & KPIs',
      category: 'Compensation & Performance',
      desc: 'Manage annual appraisal scoring, competency benchmarks, and staff promotion reviews.',
      icon: Briefcase,
    },
    {
      key: 'recruitment',
      name: 'Recruitment & ATS',
      category: 'Compensation & Performance',
      desc: 'Job openings, applicant screening, shortlisting, and candidate interview schedules.',
      icon: UserPlus,
    },
    {
      key: 'onboarding',
      name: 'Onboarding & Orientation Workflows',
      category: 'Compensation & Performance',
      desc: 'New hire induction checklists, mandatory compliance training, and orientation tracking.',
      icon: Sparkles,
    },
    {
      key: 'lms',
      name: 'LMS & Continuing Medical Education (CME)',
      category: 'Compensation & Performance',
      desc: 'Hospital clinical courses, CME credit tracking, and training certificates.',
      icon: GraduationCap,
    },

    // 4. Clinical Governance & Medical Logistics
    {
      key: 'credentials',
      name: 'Medical Credentials & License Verification',
      category: 'Clinical & Operations',
      desc: 'Medical & Dental Council (MDC) and Nursing Council (NMC) license PIN renewals and compliance.',
      icon: Stethoscope,
    },
    {
      key: 'health',
      name: 'Occupational Health & Incident Reports',
      category: 'Clinical & Operations',
      desc: 'Workplace injuries, needle-stick exposure, and infection control incident logging.',
      icon: HeartPulse,
    },
    {
      key: 'assets',
      name: 'Hospital Assets & Equipment Vault',
      category: 'Clinical & Operations',
      desc: 'Medical devices, diagnostics machines, IT hardware, and maintenance schedules.',
      icon: Package,
    },
    {
      key: 'conference',
      name: 'Unit Tele-Conferences & Briefings',
      category: 'Clinical & Operations',
      desc: 'Host and join secure departmental video huddles, shift handovers, and clinical rounds.',
      icon: Video,
    },

    // 5. Analytics, System & Tools
    {
      key: 'reports',
      name: 'Custom Reports & Data Exporter',
      category: 'Analytics & System',
      desc: 'HR analytics, department headcount metrics, and custom CSV/Excel reports.',
      icon: FileSpreadsheet,
    },
    {
      key: 'customization',
      name: 'System Settings & Access Control',
      category: 'Analytics & System',
      desc: 'Hospital branding, policy configurations, and staff access permissions manager.',
      icon: Settings,
    },
    {
      key: 'api',
      name: 'REST API Developer Console',
      category: 'Analytics & System',
      desc: 'API endpoints documentation, authentication keys, and integration console.',
      icon: Code,
    },
    {
      key: 'notice_board',
      name: 'Institutional Notice Broadcaster',
      category: 'Analytics & System',
      desc: 'Create, pin, and broadcast hospital-wide memos and clinical announcements.',
      icon: Bell,
    },
  ];

  const categories = [
    'All',
    'Disciplinary & Governance',
    'Personnel & Rosters',
    'Compensation & Performance',
    'Clinical & Operations',
    'Analytics & System',
  ];

  const departments = ['All', ...Array.from(new Set((employees || []).filter(Boolean).map((e) => e?.department).filter(Boolean)))];

  const filteredEmployees = (employees || []).filter((emp) => {
    if (!emp) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(term) ||
      (emp.email || '').toLowerCase().includes(term) ||
      (emp.empCode || '').toLowerCase().includes(term) ||
      (emp.jobTitle || '').toLowerCase().includes(term);

    const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;

    const userPerm = staffPermissions.find((p) => p.employeeId === emp.id);
    const hasCustom = (userPerm?.grantedModules?.length || 0) > 0;
    const hasQueryAuth = (userPerm?.grantedModules || []).some((m) =>
      ['query_issuance', 'disciplinary_board', 'disciplinary_queries'].includes(m)
    );
    const isHead =
      emp.role === 'dept_head' ||
      emp.role === 'unit_head' ||
      (emp.jobTitle || '').toLowerCase().includes('head') ||
      (emp.jobTitle || '').toLowerCase().includes('in-charge') ||
      (emp.jobTitle || '').toLowerCase().includes('director') ||
      (emp.jobTitle || '').toLowerCase().includes('supervisor');

    let matchesFilter = true;
    if (selectedFilterCategory === 'Heads') matchesFilter = isHead;
    else if (selectedFilterCategory === 'CustomGranted') matchesFilter = hasCustom;
    else if (selectedFilterCategory === 'QueryAuthorized') matchesFilter = hasQueryAuth;

    return matchesSearch && matchesDept && matchesFilter;
  });

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    const existing = staffPermissions.find((p) => p.employeeId === emp.id);
    setSelectedModules(existing ? [...existing.grantedModules] : []);
    setPermissionNotes(existing?.notes || '');
    setModalCategoryTab('All');
  };

  const handleToggleModule = (moduleKey: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey) ? prev.filter((m) => m !== moduleKey) : [...prev, moduleKey]
    );
  };

  const handleQuickToggleQueryAuthority = (emp: Employee) => {
    const existing = staffPermissions.find((p) => p.employeeId === emp.id);
    const currentMods = existing ? [...existing.grantedModules] : [];
    const hasQuery = currentMods.includes('query_issuance');
    let nextMods: string[];
    if (hasQuery) {
      nextMods = currentMods.filter((m) => m !== 'query_issuance');
    } else {
      nextMods = [...currentMods, 'query_issuance'];
    }
    grantStaffAccess(
      emp.id,
      nextMods,
      hasQuery
        ? 'Revoked Query Issuing Authority by HR'
        : 'Granted Statutory Staff Query Authority for Unit/Department Head by HR'
    );
    setSuccessMsg(
      hasQuery
        ? `Revoked Query Authority from ${emp.firstName} ${emp.lastName}`
        : `Granted Query Issuing Authority to ${emp.firstName} ${emp.lastName} (${emp.jobTitle})`
    );
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Presets
  const applyPreset = (presetType: 'query_only' | 'disciplinary_only' | 'unit_head_pack' | 'dept_head_pack' | 'clinical_pack') => {
    switch (presetType) {
      case 'query_only':
        setSelectedModules((prev) => Array.from(new Set([...prev, 'query_issuance'])));
        break;
      case 'disciplinary_only':
        setSelectedModules((prev) => Array.from(new Set([...prev, 'disciplinary_board', 'query_issuance'])));
        break;
      case 'unit_head_pack':
        setSelectedModules((prev) =>
          Array.from(new Set([...prev, 'query_issuance', 'shifts', 'attendance', 'leave', 'conference']))
        );
        break;
      case 'dept_head_pack':
        setSelectedModules((prev) =>
          Array.from(
            new Set([
              ...prev,
              'query_issuance',
              'disciplinary_board',
              'shifts',
              'attendance',
              'leave',
              'performance',
              'conference',
              'staff_files',
            ])
          )
        );
        break;
      case 'clinical_pack':
        setSelectedModules((prev) =>
          Array.from(
            new Set([
              ...prev,
              'credentials',
              'health',
              'assets',
              'shifts',
              'attendance',
              'leave',
              'query_issuance',
              'conference',
            ])
          )
        );
        break;
    }
  };

  const handleSelectAllModules = () => {
    setSelectedModules(GRANTABLE_MODULES.map((m) => m.key));
  };

  const handleClearAllModules = () => {
    setSelectedModules([]);
  };

  const handleSavePermissions = () => {
    if (!editingEmp) return;
    grantStaffAccess(editingEmp.id, selectedModules, permissionNotes);
    setSuccessMsg(`Permissions successfully updated for ${editingEmp.firstName} ${editingEmp.lastName}`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setEditingEmp(null);
  };

  const filteredModalModules = GRANTABLE_MODULES.filter(
    (m) => modalCategoryTab === 'All' || m.category === modalCategoryTab
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            HR Access Control & Staff Permissions Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Grant or restrict staff members access to the Hospital Disciplinary Board, Staff Querying Authority, confidential files, and administrative modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" />
            <span>Authorized HR Governance Console</span>
          </div>
        </div>
      </div>

      {/* Statutory Disciplinary & Query Governance Notice */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 p-4 text-xs text-slate-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Disciplinary Board & Staff Query Delegation Rule</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Ghana Labour Act 651 & Bylaws
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              By default, only the <strong>HR Directorate</strong> and the <strong>Head of Facility</strong> have unconditional access to the Disciplinary Board and tribunal hearings. For <strong>Unit Heads</strong> and <strong>Departmental Heads (HODs)</strong> to issue official written queries or participate in tribunal reviews, HR must explicitly grant them <strong>"Query Authority"</strong> or <strong>"Disciplinary Board"</strong> below.
            </p>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff name, job title, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Quick Filter Categories */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFilterCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedFilterCategory === 'All'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All Staff ({employees.length})
          </button>
          <button
            onClick={() => setSelectedFilterCategory('Heads')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              selectedFilterCategory === 'Heads'
                ? 'bg-slate-900 text-white dark:bg-emerald-600'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" /> Unit & Dept. Heads
          </button>
          <button
            onClick={() => setSelectedFilterCategory('QueryAuthorized')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              selectedFilterCategory === 'QueryAuthorized'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
            }`}
          >
            <FileText className="h-3.5 w-3.5" /> Query Authorized
          </button>
          <button
            onClick={() => setSelectedFilterCategory('CustomGranted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
              selectedFilterCategory === 'CustomGranted'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Custom Granted
          </button>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredEmployees.length}</strong>
          </div>
        </div>
      </div>

      {/* Employee Permissions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Designation & Unit</th>
                <th className="px-5 py-3.5">Base Role Mandate</th>
                <th className="px-5 py-3.5">Disciplinary & Query Status</th>
                <th className="px-5 py-3.5">HR Granted Modules</th>
                <th className="px-5 py-3.5 text-right">Access Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredEmployees.map((emp) => {
                const userPerm = staffPermissions.find((p) => p.employeeId === emp.id);
                const grantedModules = userPerm?.grantedModules || [];
                const isExecRole = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(emp.role);
                const isHead =
                  emp.role === 'dept_head' ||
                  emp.role === 'unit_head' ||
                  (emp.jobTitle || '').toLowerCase().includes('head') ||
                  (emp.jobTitle || '').toLowerCase().includes('in-charge') ||
                  (emp.jobTitle || '').toLowerCase().includes('director');

                const hasQueryAuth =
                  isExecRole ||
                  grantedModules.some((m) =>
                    ['query_issuance', 'disciplinary_board', 'disciplinary_queries'].includes(m)
                  );
                const hasDisciplinaryPanelAccess =
                  isExecRole || grantedModules.includes('disciplinary_board');

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photo}
                          alt={emp.firstName}
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{emp.firstName} {emp.lastName}</span>
                            {isHead && (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                                Head
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.empCode} • {emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {emp.jobTitle}
                      </span>
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">{emp.department}</p>
                    </td>

                    <td className="px-5 py-4">
                      {isExecRole ? (
                        <span className="rounded-lg bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          Executive Full Command
                        </span>
                      ) : isHead ? (
                        <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Supervisory Head
                        </span>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          Standard Staff Profile
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isExecRole ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Full Query Mandate
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400">
                            <Gavel className="h-3.5 w-3.5" /> Tribunal Authority
                          </span>
                        </div>
                      ) : hasQueryAuth ? (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                            <FileText className="h-3 w-3" /> Query Authorized (HR Delegated)
                          </span>
                          {hasDisciplinaryPanelAccess && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-[10px] font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
                              <Gavel className="h-3 w-3" /> Disciplinary Panel Access
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Lock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Restricted (No Query Mandate)</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isExecRole ? (
                        <span className="text-slate-400 text-[11px]">All modules active</span>
                      ) : grantedModules.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {grantedModules.map((m) => (
                            <span
                              key={m}
                              className={`rounded px-2 py-0.5 text-[10px] font-bold border capitalize ${
                                m === 'query_issuance'
                                  ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                                  : m === 'disciplinary_board'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300'
                              }`}
                            >
                              {m.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Default Baseline Only</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {!isExecRole && (
                        <div className="flex items-center justify-end gap-1.5">
                          {isHead && (
                            <button
                              onClick={() => handleQuickToggleQueryAuthority(emp)}
                              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition flex items-center gap-1 shadow-sm ${
                                hasQueryAuth
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                              title={hasQueryAuth ? 'Revoke Query Authority' : 'Grant Query Issuing Authority'}
                            >
                              <FileText className="h-3 w-3" />
                              {hasQueryAuth ? 'Revoke Query Auth' : '+ Grant Query Auth'}
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditModal(emp)}
                            className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5"
                          >
                            <SlidersHorizontal className="h-3.5 w-3.5" /> Manage All
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Permissions Management Modal */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={editingEmp.photo}
                  alt=""
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Manage Access: {editingEmp.firstName} {editingEmp.lastName}</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {editingEmp.role.replace('_', ' ')}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {editingEmp.jobTitle} • {editingEmp.department} ({editingEmp.empCode})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Delegation Presets */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Quick Role Delegation Presets:
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={handleSelectAllModules} className="text-emerald-600 font-bold hover:underline">
                    Select All ({GRANTABLE_MODULES.length})
                  </button>
                  <span>•</span>
                  <button onClick={handleClearAllModules} className="text-rose-500 font-bold hover:underline">
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('query_only')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <FileText className="h-3.5 w-3.5" />
                  + Grant Query Issuing Authority
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('disciplinary_only')}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <Gavel className="h-3.5 w-3.5" />
                  + Disciplinary Tribunal Access
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('unit_head_pack')}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Unit / Ward In-Charge Pack
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('dept_head_pack')}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-700 text-xs font-bold transition flex items-center gap-1"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Department Head (HOD) Pack
                </button>
              </div>
            </div>

            {/* Category Filter Tabs inside Modal */}
            <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto text-xs font-semibold">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setModalCategoryTab(cat)}
                  className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                    modalCategoryTab === cat
                      ? 'bg-slate-900 text-white dark:bg-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Grantable Modules Grid */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-80 overflow-y-auto pr-1">
              {filteredModalModules.map((mod) => {
                const isChecked = selectedModules.includes(mod.key);
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleModule(mod.key)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-start gap-3 relative ${
                      isChecked
                        ? mod.highlight
                          ? 'border-amber-500 bg-amber-50/60 dark:border-amber-500/60 dark:bg-amber-950/40'
                          : 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/90'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
                        isChecked
                          ? mod.highlight
                            ? 'border-amber-600 bg-amber-600 text-white dark:bg-amber-500'
                            : 'border-emerald-600 bg-emerald-600 text-white dark:bg-emerald-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <IconComponent className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                          <span>{mod.name}</span>
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
                      {mod.badge && (
                        <span
                          className={`inline-block mt-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            mod.highlight
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {mod.badge}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HR Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                HR Access Justification Note & Audit Log
              </label>
              <textarea
                value={permissionNotes}
                onChange={(e) => setPermissionNotes(e.target.value)}
                placeholder="Specify purpose for granting custom access (e.g., Delegated statutory query authority as Acting Ward In-Charge)..."
                rows={2}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 font-medium">
                <strong>{selectedModules.length}</strong> modules selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingEmp(null)}
                  className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-500 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-4 w-4" /> Save Access Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
