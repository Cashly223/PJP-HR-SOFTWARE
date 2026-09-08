import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Palette,
  KeyRound,
  Bell,
  Eye,
  Sliders,
  Award,
  AlertTriangle,
  UserCheck,
  Briefcase,
  FileText,
  Clock,
  Zap,
  Trash2,
  Database,
  Crown,
  AlertOctagon,
  UserPlus,
  RefreshCw,
  Layers,
  ShieldAlert,
  ArrowRight,
  Check,
  Server,
  Activity,
  Users,
  Fingerprint,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { CurrencyCode, SystemCustomizationSettings } from '../../types/hrms';
import { AccessControlPanel } from '../access/AccessControlPanel';
import { BiometricSecurityModal } from '../security/BiometricSecurityModal';

export const SystemCustomizationPanel: React.FC = () => {
  const {
    systemCustomization,
    updateSystemCustomization,
    activeRole,
    setActiveRole,
    currentUser,
    employees,
    clearAllEmployees,
    enrollHeadOfFacility,
    enrollHrLeader,
    setActiveTab: setNavActiveTab,
  } = useHrms();

  // Check if active user role is HR or Administrator
  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);
  const isFacilityHeadAuthorized = activeRole === 'facility_head' || activeRole === 'super_admin';

  type CustomizationTab = 'access_control' | 'branding' | 'workflows' | 'security' | 'email' | 'modules' | 'database_reset';
  const [activeTab, setActiveTab] = useState<CustomizationTab>('access_control');
  const [formData, setFormData] = useState<SystemCustomizationSettings>({ ...systemCustomization });
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // Hard Reset Utility State
  const [resetMode, setResetMode] = useState<'wipe_only' | 'wipe_and_enroll_head' | 'wipe_and_enroll_both'>('wipe_and_enroll_both');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [confirmAcknowledged, setConfirmAcknowledged] = useState(false);
  const [isExecutingReset, setIsExecutingReset] = useState(false);
  const [resetSuccessData, setResetSuccessData] = useState<{ countCleared: number; enrolledHead?: string; enrolledHr?: string } | null>(null);

  // Head of Facility Details for Re-Enrollment
  const [headForm, setHeadForm] = useState({
    firstName: 'Rev. Fr. Michael',
    lastName: 'Afoakwah',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    empCode: 'EMP-3522',
    email: 'rev.fr.michael@pjpiimc.org',
    phone: '+233 24 222 1000',
    password: 'EMP-3522',
    jobTitle: 'Head of Facility / Chief Executive Officer',
    department: 'Executive Administration',
  });

  // HR Leader Details for Re-Enrollment
  const [hrLeaderForm, setHrLeaderForm] = useState({
    firstName: 'Mr. Kwabena',
    lastName: 'Antwi',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    role: 'hr_director' as 'hr_director' | 'hr_manager',
    empCode: 'EMP-1976',
    email: 'kwabena.antwi@pjpiimc.org',
    phone: '+233 24 555 2000',
    password: 'EMP-1976',
    jobTitle: 'Director of Human Resources',
    department: 'Human Resources',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleChange = <K extends keyof SystemCustomizationSettings>(key: K, value: SystemCustomizationSettings[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemCustomization(formData);
    showToast('System & Portal customization settings saved successfully! Audit log generated.');
  };

  const handleResetDefaults = () => {
    const defaults: Partial<SystemCustomizationSettings> = {
      hospitalName: 'Pope John Paul II Medical Centre - Jamasi',
      hospitalTagline: 'Excellence in Clinical Care, Research & HR Governance',
      themeAccent: 'emerald',
      portalWelcomeBanner: 'Welcome to PJPIIMC Hospital HRMS — Authorized Clinical & Administrative Personnel Only',
      staffIdPrefix: 'EMP-',
      requireFourTierLeaveApproval: true,
      autoApproveLeaveUnderDays: 0,
      sessionTimeoutMinutes: 30,
      requirePasswordChangeOnFirstLogin: true,
      enableBiometric2FA: true,
      restrictAccessBySubnet: false,
      allowedIpSubnet: '192.168.1.0/24',
      senderName: 'PJPIIMC Hospital HR Administration',
      senderEmail: 'hr-portal@pjpiimc.org',
      emailFooterNotice: 'Confidential Medical Communication. Governed under Ghana Health Service & PJPIIMC Healthcare Governance Rules.',
      notifyOnLeaveSubmit: true,
      notifyOnShiftSwap: true,
      notifyOnPayrollRelease: true,
      notifyOnLicenseExpiry: true,
      enableTeleConferenceModule: true,
      enableAiAssistantWidget: true,
      enableGrievanceProtection: true,
      currency: 'GHS',
    };
    setFormData((prev) => ({ ...prev, ...defaults }));
    updateSystemCustomization(defaults);
    showToast('Restored system settings to factory default configuration.');
  };

  const handleExecuteHardReset = async () => {
    if (!isFacilityHeadAuthorized) {
      showToast('Error: Hard reset requires authorized facility_head or super_admin permissions.');
      return;
    }

    if (confirmPhrase.trim().toUpperCase() !== 'RESET-STAFF-DATABASE') {
      showToast('Error: Please enter the exact security confirmation phrase: RESET-STAFF-DATABASE');
      return;
    }

    if (!confirmAcknowledged) {
      showToast('Error: You must check the executive authorization acknowledgement.');
      return;
    }

    setIsExecutingReset(true);
    const initialCount = employees.length;

    try {
      // 1. Trigger core database purge (State, LocalStorage & Firestore)
      await clearAllEmployees();

      let enrolledName: string | undefined = undefined;
      let enrolledHrName: string | undefined = undefined;

      // 2. If wipe + enroll mode selected, provision clean Head of Facility
      if (resetMode === 'wipe_and_enroll_head' || resetMode === 'wipe_and_enroll_both') {
        const head = await enrollHeadOfFacility({
          firstName: headForm.firstName.trim(),
          lastName: headForm.lastName.trim(),
          gender: headForm.gender,
          empCode: headForm.empCode.trim() || 'EMP-3522',
          email: headForm.email.trim() || 'rev.fr.michael@pjpiimc.org',
          phone: headForm.phone.trim() || '+233 24 222 1000',
          password: headForm.password.trim() || headForm.empCode.trim() || 'EMP-3522',
          jobTitle: headForm.jobTitle.trim() || 'Head of Facility / Chief Executive Officer',
          department: headForm.department.trim() || 'Executive Administration',
        });
        enrolledName = `${head.firstName} ${head.lastName} (${head.empCode})`;
      }

      // 3. If wipe + enroll both mode selected, also provision HR Director / Manager
      if (resetMode === 'wipe_and_enroll_both') {
        const hr = await enrollHrLeader({
          firstName: hrLeaderForm.firstName.trim(),
          lastName: hrLeaderForm.lastName.trim(),
          gender: hrLeaderForm.gender,
          role: hrLeaderForm.role,
          empCode: hrLeaderForm.empCode.trim() || (hrLeaderForm.role === 'hr_director' ? 'EMP-1976' : 'EMP-2044'),
          email: hrLeaderForm.email.trim() || `${hrLeaderForm.firstName.trim().toLowerCase()}.${hrLeaderForm.lastName.trim().toLowerCase()}@pjpiimc.org`,
          phone: hrLeaderForm.phone.trim() || '+233 24 555 2000',
          password: hrLeaderForm.password.trim() || hrLeaderForm.empCode.trim() || 'EMP-1976',
          jobTitle: hrLeaderForm.jobTitle.trim() || (hrLeaderForm.role === 'hr_director' ? 'Director of Human Resources' : 'Hospital HR Operations Manager'),
          department: hrLeaderForm.department.trim() || 'Human Resources',
        });
        enrolledHrName = `${hr.firstName} ${hr.lastName} (${hr.empCode}) - ${hr.role === 'hr_director' ? 'HR Director' : 'HR Manager'}`;
      }

      setResetSuccessData({
        countCleared: initialCount,
        enrolledHead: enrolledName,
        enrolledHr: enrolledHrName,
      });

      setConfirmPhrase('');
      setConfirmAcknowledged(false);
      showToast('Staff database hard reset executed successfully! Fresh onboarding environment ready.');
    } catch (err: any) {
      console.error('Hard reset error:', err);
      showToast(err.message || 'Failed to complete hard reset.');
    } finally {
      setIsExecutingReset(false);
    }
  };

  // If user role is NOT HR or Admin, render Access Denied Shield
  if (!isHRorAdmin) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-8 text-white shadow-xl dark:border-rose-900/60">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto space-y-4">
            <div className="p-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <Lock className="h-10 w-10" />
            </div>

            <div className="space-y-1">
              <span className="rounded-md bg-rose-500/30 px-3 py-1 text-xs font-extrabold text-rose-300 uppercase tracking-wider border border-rose-500/30">
                Access Denied • HR & Administrator Restricted
              </span>
              <h2 className="text-2xl font-black text-white">System Customization Access Restricted</h2>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The System Customization Panel is strictly restricted to <strong className="text-emerald-300">Hospital HR Directors</strong>, <strong className="text-cyan-300">Hospital HR Managers</strong>, <strong className="text-amber-300">Head of Facility (CEO/CMO)</strong>, and <strong className="text-rose-300">Super Administrators</strong>.
            </p>

            <div className="rounded-xl bg-slate-900/80 p-4 border border-rose-500/30 w-full text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-2">
                <span>ACTIVE USER ROLE:</span>
                <span className="text-amber-400 uppercase font-mono">{activeRole.replace('_', ' ')}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Your current active role does not possess permissions to modify core system branding, security policies, 4-tier approval rules, or email dispatch settings.
              </p>
            </div>

            <div className="pt-2">
              <span className="text-xs text-slate-400 font-semibold">Note: User roles are strictly determined and assigned by HR Administrators.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> HR & Admin Authorized
              </span>
              <span className="text-slate-400 text-xs">• Portal Governance Console</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-emerald-400" />
              Admin & HR System Customization Panel
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Configure system-wide branding, portal theme accents, 4-tier sequential workflow policies, security authentication parameters, SMTP email dispatch templates, and executive database reset utilities.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl bg-slate-900/90 p-3 border border-emerald-500/30 text-right min-w-[200px]">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Active Governance Mode
              </div>
              <div className="text-xs font-extrabold text-white capitalize flex items-center justify-end gap-1.5 mt-0.5">
                {activeRole === 'facility_head' && <Crown className="h-3.5 w-3.5 text-amber-400" />}
                <span>{activeRole.replace('_', ' ')}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Enrolled Staff Count: <strong className="text-emerald-400">{employees.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
        <button
          id="tab-custom-access-control"
          onClick={() => setActiveTab('access_control')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'access_control'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Access Control & Permissions
        </button>

        <button
          id="tab-custom-branding"
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'branding'
              ? 'bg-teal-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Palette className="h-4 w-4" /> Hospital Branding & Theme
        </button>

        <button
          id="tab-custom-workflows"
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'workflows'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Zap className="h-4 w-4" /> 4-Tier Workflow & Rules
        </button>

        <button
          id="tab-custom-security"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'security'
              ? 'bg-amber-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="h-4 w-4" /> Security & Authentication
        </button>

        <button
          id="tab-custom-email"
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'email'
              ? 'bg-cyan-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" /> Email Dispatch & SMTP
        </button>

        <button
          id="tab-custom-modules"
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'modules'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" /> Module Toggles
        </button>

        {/* SECURE ADMINISTRATIVE HARD RESET TAB */}
        <button
          id="tab-custom-database-reset"
          onClick={() => setActiveTab('database_reset')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition border ${
            activeTab === 'database_reset'
              ? 'bg-gradient-to-r from-rose-700 to-amber-700 text-white border-amber-400 shadow-md shadow-rose-900/30'
              : 'text-rose-600 dark:text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 border-rose-500/30'
          }`}
        >
          <Crown className="h-4 w-4 text-amber-400" />
          <span>Staff Database Hard Reset (Facility Head)</span>
        </button>
      </div>

      {/* TAB: ACCESS CONTROL & STAFF PERMISSIONS */}
      {activeTab === 'access_control' && <AccessControlPanel />}

      {/* TAB: SECURE ADMINISTRATIVE STAFF DATABASE HARD RESET */}
      {activeTab === 'database_reset' && (
        <div className="space-y-6">
          {/* Authorization Check */}
          {!isFacilityHeadAuthorized ? (
            <div className="rounded-3xl border border-rose-500/40 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 p-8 text-white shadow-xl space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shrink-0">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <span className="rounded-md bg-rose-500/30 px-3 py-1 text-[11px] font-black text-rose-200 uppercase tracking-wider border border-rose-500/30 inline-block">
                    Executive Authorization Required
                  </span>
                  <h3 className="text-xl font-black text-white">
                    Facility Head Authority Required for Staff Database Hard Reset
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    This destructive administrative utility is strictly restricted to the authorized <strong className="text-amber-300">Head of Facility ('facility_head')</strong> or <strong className="text-rose-300">Super Administrator</strong>. It wipes all existing employee profiles, login credentials, and department assignments to establish a completely fresh staff onboarding state.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950/70 p-4 border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] text-slate-400">Current Active Session Role:</div>
                  <div className="font-bold text-rose-300 capitalize font-mono text-sm">
                    {activeRole.replace('_', ' ')}
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-assume-facility-head-role"
                  onClick={() => {
                    setActiveRole('facility_head');
                    showToast('Switched session role to Head of Facility (facility_head).');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                >
                  <Crown className="h-4 w-4" />
                  <span>Assume Head of Facility Authority</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Executive Notice Banner */}
              <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 p-6 text-white shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Executive Utility
                        </span>
                        <span className="text-xs text-slate-400">• Role: facility_head Authorized</span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-0.5">
                        Staff Database Hard Reset & Fresh Onboarding Console
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-[10px] text-slate-400">Current Staff Registry:</div>
                      <div className="font-extrabold text-emerald-300">
                        {employees.length} Employee{employees.length === 1 ? '' : 's'} Stored
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                  This utility enables the Head of Facility to execute an instantaneous, irreversible hard reset of all staff records across local application memory, client storage caches, and synced cloud database documents. It is specifically designed to purge test/legacy personnel records and establish a clean institutional baseline for fresh onboarding.
                </p>
              </div>

              {/* Success Feedback Card if reset executed */}
              {resetSuccessData && (
                <div className="rounded-3xl border border-emerald-500/40 bg-emerald-950/30 p-6 text-emerald-100 shadow-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white">
                        Staff Database Successfully Reset
                      </h4>
                      <p className="text-xs text-emerald-200/90">
                        Purged {resetSuccessData.countCleared} previous staff records from the registry.
                        {resetSuccessData.enrolledHead && (
                          <span> Clean executive profile enrolled: <strong className="text-white">{resetSuccessData.enrolledHead}</strong>.</span>
                        )}
                        {resetSuccessData.enrolledHr && (
                          <span> HR Leadership enrolled: <strong className="text-white">{resetSuccessData.enrolledHr}</strong>.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      id="btn-goto-employee-directory-postreset"
                      onClick={() => setNavActiveTab('employees')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      <span>Open Staff Directory</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      id="btn-goto-onboarding-postreset"
                      onClick={() => setNavActiveTab('onboarding')}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl shadow transition flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4 text-emerald-400" />
                      <span>Start Fresh Onboarding Tasks</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hard Reset Configuration Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Diagnostics & Mode Selection */}
                <div className="lg:col-span-2 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <Layers className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                      Step 1: Choose Reset & Onboarding Strategy
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Strategy A: Wipe and Re-Enroll Head of Facility & HR Director */}
                    <div
                      onClick={() => setResetMode('wipe_and_enroll_both')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        resetMode === 'wipe_and_enroll_both'
                          ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-300 flex items-center gap-1.5">
                            <Crown className="h-4 w-4 text-amber-400" />
                            <Users className="h-4 w-4" />
                          </div>
                          {resetMode === 'wipe_and_enroll_both' && (
                            <span className="p-1 bg-indigo-500 text-white rounded-full">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          Reset + Enroll Head of Facility & HR Director (Complete Leadership)
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Purges all records and seeds both Head of Facility (Rev. Fr. Michael Afoakwah) AND HR Director (Mr. Kwabena Antwi) for seamless two-tier governance.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        CEO + HR Ready
                      </div>
                    </div>

                    {/* Strategy B: Wipe and Re-Enroll Head of Facility Only */}
                    <div
                      onClick={() => setResetMode('wipe_and_enroll_head')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        resetMode === 'wipe_and_enroll_head'
                          ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 dark:text-amber-300">
                            <Crown className="h-5 w-5" />
                          </div>
                          {resetMode === 'wipe_and_enroll_head' && (
                            <span className="p-1 bg-amber-500 text-slate-950 rounded-full">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          Reset + Head of Facility Only
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Purges all records and seeds only the Head of Facility account (EMP-3522). HR can be enrolled manually on login page or directory.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        CEO Only
                      </div>
                    </div>

                    {/* Strategy C: Total Clean Wipe to 0 */}
                    <div
                      onClick={() => setResetMode('wipe_only')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                        resetMode === 'wipe_only'
                          ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-500 dark:text-rose-300">
                            <Trash2 className="h-5 w-5" />
                          </div>
                          {resetMode === 'wipe_only' && (
                            <span className="p-1 bg-rose-500 text-white rounded-full">
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                          Total Hard Reset to Blank (0 Staff)
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          Completely wipes all records down to zero. You can subsequently self-enroll on the Login Page or use manual single/batch onboarding.
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                        100% Empty State
                      </div>
                    </div>
                  </div>

                  {/* Head of Facility Onboarding Profile Configuration */}
                  {(resetMode === 'wipe_and_enroll_head' || resetMode === 'wipe_and_enroll_both') && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Crown className="h-4 w-4 text-amber-500" />
                          <span>Head of Facility Enrollment Parameters:</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Auto-provisions post-reset</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            First Name / Clerical Title
                          </label>
                          <input
                            type="text"
                            value={headForm.firstName}
                            onChange={(e) => setHeadForm({ ...headForm, firstName: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Last Name / Surname
                          </label>
                          <input
                            type="text"
                            value={headForm.lastName}
                            onChange={(e) => setHeadForm({ ...headForm, lastName: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                          />
                        </div>

                        {/* Head Gender Designation */}
                        <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                              Gender Designation *
                            </label>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              headForm.gender === 'Female'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : headForm.gender === 'Male'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            }`}>
                              {headForm.gender === 'Female' ? '♀ Female Leader' : headForm.gender === 'Male' ? '♂ Male Leader' : '⚧ Other / Non-Binary'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['Male', 'Female', 'Other'] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setHeadForm({ ...headForm, gender: g })}
                                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition border flex items-center justify-center gap-1 ${
                                  headForm.gender === g
                                    ? g === 'Female'
                                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/50 shadow-sm'
                                      : g === 'Male'
                                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/50 shadow-sm'
                                      : 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/50 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-white'
                                }`}
                              >
                                <span>{g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Male' : '⚧ Other'}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Staff Code / CEO ID
                          </label>
                          <input
                            type="text"
                            value={headForm.empCode}
                            onChange={(e) => setHeadForm({ ...headForm, empCode: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono font-bold uppercase text-amber-600 dark:text-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Initial Login Password
                          </label>
                          <input
                            type="text"
                            value={headForm.password}
                            onChange={(e) => setHeadForm({ ...headForm, password: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HR Leader Profile Configuration (if Strategy A active) */}
                  {resetMode === 'wipe_and_enroll_both' && (
                    <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-indigo-500" />
                          <span>HR Directorate Leader Enrollment Parameters:</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Auto-provisions post-reset</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            First Name / Title
                          </label>
                          <input
                            type="text"
                            value={hrLeaderForm.firstName}
                            onChange={(e) => setHrLeaderForm({ ...hrLeaderForm, firstName: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Last Name / Surname
                          </label>
                          <input
                            type="text"
                            value={hrLeaderForm.lastName}
                            onChange={(e) => setHrLeaderForm({ ...hrLeaderForm, lastName: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                          />
                        </div>

                        {/* HR Leader Gender Designation */}
                        <div className="sm:col-span-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <label className="block font-bold text-slate-700 dark:text-slate-200 text-xs">
                              Gender Designation *
                            </label>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              hrLeaderForm.gender === 'Female'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : hrLeaderForm.gender === 'Male'
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30'
                            }`}>
                              {hrLeaderForm.gender === 'Female' ? '♀ Female Leader' : hrLeaderForm.gender === 'Male' ? '♂ Male Leader' : '⚧ Other / Non-Binary'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['Female', 'Male', 'Other'] as const).map((g) => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => setHrLeaderForm({ ...hrLeaderForm, gender: g })}
                                className={`py-1.5 px-2 rounded-lg font-bold text-xs transition border flex items-center justify-center gap-1 ${
                                  hrLeaderForm.gender === g
                                    ? g === 'Female'
                                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/50 shadow-sm'
                                      : g === 'Male'
                                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/50 shadow-sm'
                                      : 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/50 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-white'
                                }`}
                              >
                                <span>{g === 'Female' ? '♀ Female' : g === 'Male' ? '♂ Male' : '⚧ Other'}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Role & Authority Level
                          </label>
                          <select
                            value={hrLeaderForm.role}
                            onChange={(e) => {
                              const newRole = e.target.value as 'hr_director' | 'hr_manager';
                              setHrLeaderForm({
                                ...hrLeaderForm,
                                role: newRole,
                                jobTitle: newRole === 'hr_director' ? 'Director of Human Resources' : 'Hospital HR Operations Manager',
                                empCode: newRole === 'hr_director' ? 'EMP-1976' : 'EMP-2044',
                              });
                            }}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400"
                          >
                            <option value="hr_director">HR Director (Super Admin/Executive HR)</option>
                            <option value="hr_manager">HR Operations Manager (Staff Admin)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Staff Code / HR ID
                          </label>
                          <input
                            type="text"
                            value={hrLeaderForm.empCode}
                            onChange={(e) => setHrLeaderForm({ ...hrLeaderForm, empCode: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Safety Confirmation Step */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                      <AlertOctagon className="h-4 w-4" />
                      <span>Step 2: Executive Safety Confirmation</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-3 text-xs">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        To confirm this permanent action, please type <strong className="text-rose-600 dark:text-rose-400 font-mono selection:bg-rose-500">RESET-STAFF-DATABASE</strong> into the box below:
                      </p>

                      <input
                        type="text"
                        id="input-confirm-reset-phrase"
                        value={confirmPhrase}
                        onChange={(e) => setConfirmPhrase(e.target.value)}
                        placeholder="Type RESET-STAFF-DATABASE to unlock"
                        className="w-full p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-950 font-mono text-xs uppercase text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />

                      <label className="flex items-start gap-2.5 cursor-pointer select-none text-[11.5px] text-slate-700 dark:text-slate-300 pt-1">
                        <input
                          type="checkbox"
                          id="chk-confirm-reset-acknowledgement"
                          checked={confirmAcknowledged}
                          onChange={(e) => setConfirmAcknowledged(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span>
                          I acknowledge as the authorized <strong className="text-rose-600 dark:text-rose-400">Head of Facility</strong> that all current staff profiles ({employees.length} total) will be purged to establish a clean slate for fresh hospital onboarding.
                        </span>
                      </label>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        id="btn-execute-hard-reset"
                        disabled={
                          isExecutingReset ||
                          confirmPhrase.trim().toUpperCase() !== 'RESET-STAFF-DATABASE' ||
                          !confirmAcknowledged
                        }
                        onClick={handleExecuteHardReset}
                        className={`w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 ${
                          confirmPhrase.trim().toUpperCase() === 'RESET-STAFF-DATABASE' && confirmAcknowledged
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 cursor-pointer active:scale-[0.99]'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        {isExecutingReset ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Purging Records & Syncing Database...</span>
                          </div>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4" />
                            <span>Execute Staff Database Hard Reset</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Database Health, Audit Specs & System Metrics */}
                <div className="space-y-5">
                  
                  {/* Registry Health Card */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <Activity className="h-4 w-4 text-emerald-500" />
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Staff Registry Metrics
                      </h4>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Total Enrolled Profiles:</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{employees.length}</span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Facility Head Account:</span>
                        <span className="font-bold text-amber-500">
                          {employees.find((e) => e.role === 'facility_head') ? 'Configured' : 'Vacant / Not Enrolled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">HR Directors & Managers:</span>
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {employees.filter((e) => ['hr_director', 'hr_manager'].includes(e.role)).length}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Cloud Storage Sync:</span>
                        <span className="font-bold text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Firestore Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Specifications & Governance */}
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <ShieldCheck className="h-4 w-4 text-blue-500" />
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                        Audit Governance Rules
                      </h4>
                    </div>

                    <ul className="space-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>Every hard reset triggers an immutable security audit entry with operator timestamp and role.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>Cached portal credentials in localStorage and session states are securely cleared.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>Staff Directory instantly adapts to 0 or fresh Head of Facility baseline.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Configuration Form for other tabs */}
      {activeTab !== 'access_control' && activeTab !== 'database_reset' && (
        <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: HOSPITAL BRANDING & THEME */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Hospital & Healthcare Identity Customization
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Official Hospital Facility Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hospitalName}
                    onChange={(e) => handleChange('hospitalName', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Staff Code / Identifier Prefix
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.staffIdPrefix}
                    onChange={(e) => handleChange('staffIdPrefix', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Institutional Tagline / Governance Motto
                </label>
                <input
                  type="text"
                  value={formData.hospitalTagline}
                  onChange={(e) => handleChange('hospitalTagline', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                />
              </div>

              <div className="text-xs">
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Portal Welcome Banner & Regulatory Notice
                </label>
                <textarea
                  rows={2}
                  value={formData.portalWelcomeBanner}
                  onChange={(e) => handleChange('portalWelcomeBanner', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs dark:bg-slate-800"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-xs mb-2 text-slate-700 dark:text-slate-300">
                  Select System Theme Accent
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { id: 'emerald', name: 'Clinical Emerald', bg: 'bg-emerald-600' },
                    { id: 'teal', name: 'Surgical Teal', bg: 'bg-teal-600' },
                    { id: 'blue', name: 'Medical Blue', bg: 'bg-blue-600' },
                    { id: 'indigo', name: 'University Indigo', bg: 'bg-indigo-600' },
                    { id: 'cyan', name: 'Ocean Cyan', bg: 'bg-cyan-600' },
                    { id: 'slate', name: 'Obsidian Modern', bg: 'bg-slate-700' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleChange('themeAccent', theme.id as any)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-left transition ${
                        formData.themeAccent === theme.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`h-4 w-4 rounded-full ${theme.bg} shrink-0`}></span>
                      <span className="text-xs truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs mb-2 text-slate-700 dark:text-slate-300">
                  Hospital Currency Configuration
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value as CurrencyCode)}
                  className="w-full sm:w-64 rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs font-bold dark:bg-slate-800"
                >
                  <option value="GHS">GHS (Ghanaian Cedi - ₵)</option>
                  <option value="USD">USD (US Dollar - $)</option>
                  <option value="EUR">EUR (Euro - €)</option>
                  <option value="GBP">GBP (British Pound - £)</option>
                  <option value="NGN">NGN (Nigerian Naira - ₦)</option>
                </select>
              </div>
            </div>

            {/* Live Customization Preview */}
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-950 p-6 text-white shadow-sm dark:border-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Eye className="h-4 w-4 text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Live Customization Preview
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg">
                    {formData.hospitalName.charAt(0)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm text-white line-clamp-1">{formData.hospitalName}</h5>
                    <p className="text-[10px] text-emerald-400">{formData.hospitalTagline}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/90 text-[11px] text-slate-300 border border-slate-800 italic">
                  "{formData.portalWelcomeBanner}"
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-700 text-slate-400">
                  <span>Sample ID: <strong className="text-emerald-300">{formData.staffIdPrefix}4092</strong></span>
                  <span>Currency: <strong className="text-emerald-300">{formData.currency}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 4-TIER WORKFLOW & RULES */}
        {activeTab === 'workflows' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                4-Tier Sequential Healthcare Workflow Approval Settings
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">Mandatory 4-Tier Leave & Roster Approvals</div>
                  <div className="text-[11px] text-slate-400">
                    Enforces strict sequential routing: Unit Head → Department Head → HR Directorate → Facility Head (CEO/CMO)
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requireFourTierLeaveApproval}
                    onChange={(e) => handleChange('requireFourTierLeaveApproval', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-emerald-800 peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Auto-Approve Emergency Leave Threshold (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    value={formData.autoApproveLeaveUnderDays}
                    onChange={(e) => handleChange('autoApproveLeaveUnderDays', Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Set to 0 to disable auto-approval and require 4-tier sign-off for all durations.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & AUTHENTICATION */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <KeyRound className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Portal Authentication & Security Governance
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Portal Session Inactivity Timeout (Minutes)
                  </label>
                  <select
                    value={formData.sessionTimeoutMinutes}
                    onChange={(e) => handleChange('sessionTimeoutMinutes', Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                  >
                    <option value={15}>15 Minutes (High Security)</option>
                    <option value={30}>30 Minutes (Standard)</option>
                    <option value={60}>60 Minutes</option>
                    <option value={120}>120 Minutes</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Force Password Reset on First Login</div>
                    <div className="text-[10px] text-slate-400">Newly invited staff must set custom password</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePasswordChangeOnFirstLogin}
                      onChange={(e) => handleChange('requirePasswordChangeOnFirstLogin', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-amber-800 peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">Biometric / 2FA for Payroll & Audit</div>
                    <div className="text-[10px] text-slate-400">Require additional sign-off for financial changes</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.enableBiometric2FA}
                      onChange={(e) => handleChange('enableBiometric2FA', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-amber-800 peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {/* WebAuthn FIDO2 Biometric Hardware Settings */}
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Fingerprint className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">WebAuthn Biometric & Passkey Configuration</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        FIDO2 Touch ID, Windows Hello, Face ID & hardware security keys for zero-password hospital staff login.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(true)}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Fingerprint className="h-4 w-4" /> Manage Passkeys
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Executive Reset Utility Callout */}
            <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-700/10 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Executive Database Hard Reset Utility
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Authorized Head of Facility tool to purge staff database for clean onboarding cycles.
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-goto-hard-reset-tab"
                onClick={() => setActiveTab('database_reset')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition whitespace-nowrap"
              >
                Open Hard Reset Console
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: EMAIL DISPATCH & SMTP */}
        {activeTab === 'email' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Mail className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                HR Portal Email Dispatch & SMTP Sender Settings
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  System Sender Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => handleChange('senderName', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Official HR Dispatch Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.senderEmail}
                  onChange={(e) => handleChange('senderEmail', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-xs text-slate-700 dark:text-slate-300">
                Email Footer Legal Disclaimer & Notice
              </label>
              <textarea
                rows={2}
                value={formData.emailFooterNotice}
                onChange={(e) => handleChange('emailFooterNotice', e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs dark:bg-slate-800"
              ></textarea>
            </div>
          </div>
        )}

        {/* TAB 5: MODULE TOGGLES */}
        {activeTab === 'modules' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sliders className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Hospital System Features & Module Availability
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">Clinical Unit Tele-Conference Module</div>
                  <div className="text-[10px] text-slate-400">Live WebRTC audio/video huddles for department grand rounds</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableTeleConferenceModule}
                    onChange={(e) => handleChange('enableTeleConferenceModule', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">AuraAI Clinical & HR Assistant</div>
                  <div className="text-[10px] text-slate-400">Generative AI assistant for drafting contracts & roster analysis</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableAiAssistantWidget}
                    onChange={(e) => handleChange('enableAiAssistantWidget', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">Protected Grievance & Whistleblower Portal</div>
                  <div className="text-[10px] text-slate-400">Encrypted anonymous incident report processing</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableGrievanceProtection}
                    onChange={(e) => handleChange('enableGrievanceProtection', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-purple-800 peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <RotateCcw className="h-4 w-4" /> Restore System Defaults
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-500 transition active:scale-95"
          >
            <CheckCircle2 className="h-4 w-4" /> Save System & Portal Customizations
          </button>
        </div>
      </form>
      )}

      {/* WebAuthn Passkeys & Biometric Security Modal */}
      <BiometricSecurityModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
      />
    </div>
  );
};
