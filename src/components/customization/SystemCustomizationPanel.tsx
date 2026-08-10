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
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { CurrencyCode, SystemCustomizationSettings } from '../../types/hrms';
import { AccessControlPanel } from '../access/AccessControlPanel';

export const SystemCustomizationPanel: React.FC = () => {
  const { systemCustomization, updateSystemCustomization, activeRole, setActiveRole } = useHrms();

  // Check if active user role is HR or Administrator
  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  const [activeTab, setActiveTab] = useState<'branding' | 'access_control' | 'workflows' | 'security' | 'email' | 'modules'>('access_control');
  const [formData, setFormData] = useState<SystemCustomizationSettings>({ ...systemCustomization });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
      hospitalName: 'St. Jude Teaching & Research Hospital',
      hospitalTagline: 'Excellence in Clinical Care, Research & HR Governance',
      themeAccent: 'emerald',
      portalWelcomeBanner: 'Welcome to AuraHR Healthcare OS — Authorized Clinical & Administrative Personnel Only',
      staffIdPrefix: 'SJH-',
      requireFourTierLeaveApproval: true,
      autoApproveLeaveUnderDays: 0,
      sessionTimeoutMinutes: 30,
      requirePasswordChangeOnFirstLogin: true,
      enableBiometric2FA: true,
      restrictAccessBySubnet: false,
      allowedIpSubnet: '192.168.1.0/24',
      senderName: 'St. Jude Hospital HR Administration',
      senderEmail: 'hr-portal@stjudehealth.org',
      emailFooterNotice: 'Confidential Medical Communication. Governed under HIPAA & JCAHO Healthcare Rules.',
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

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <span className="text-xs text-slate-400 font-semibold">Switch role for testing / demo:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveRole('hr_director')}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                >
                  Switch to HR Director
                </button>
                <button
                  onClick={() => setActiveRole('facility_head')}
                  className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-500 transition"
                >
                  Switch to Head of Facility
                </button>
              </div>
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
              Configure system-wide branding, portal theme accents, 4-tier sequential workflow policies, security authentication parameters, SMTP email dispatch templates, and feature visibility.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl bg-slate-900/90 p-3 border border-emerald-500/30 text-right min-w-[200px]">
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                Active Governance Mode
              </div>
              <div className="text-xs font-extrabold text-white capitalize">
                {activeRole.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Last modified: {formData.lastUpdatedBy || 'HR Admin'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold">
        <button
          onClick={() => setActiveTab('access_control')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'access_control'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-4 w-4" /> Access Control & Staff Permissions
        </button>

        <button
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
          onClick={() => setActiveTab('modules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
            activeTab === 'modules'
              ? 'bg-rose-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" /> Module Toggles
        </button>
      </div>

      {/* TAB: ACCESS CONTROL & STAFF PERMISSIONS */}
      {activeTab === 'access_control' && <AccessControlPanel />}

      {/* Main Configuration Form */}
      {activeTab !== 'access_control' && (
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
                    Official Hospital / Health Organization Name
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
                    Hospital Motto / Clinical Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.hospitalTagline}
                    onChange={(e) => handleChange('hospitalTagline', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Staff ID Code Prefix (e.g., SJH-, HOSP-, CLINIC-)
                  </label>
                  <input
                    type="text"
                    value={formData.staffIdPrefix}
                    onChange={(e) => handleChange('staffIdPrefix', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    Hospital Standard Accounting Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value as CurrencyCode)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold"
                  >
                    <option value="GHS">GHS (Ghanaian Cedi ₵)</option>
                    <option value="USD">USD (US Dollar $)</option>
                    <option value="EUR">EUR (Euro €)</option>
                    <option value="GBP">GBP (British Pound £)</option>
                    <option value="AED">AED (UAE Dirham)</option>
                    <option value="INR">INR (Indian Rupee ₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-xs text-slate-700 dark:text-slate-300">
                  Portal Header Welcome Banner Message
                </label>
                <textarea
                  rows={2}
                  value={formData.portalWelcomeBanner}
                  onChange={(e) => handleChange('portalWelcomeBanner', e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 text-xs dark:bg-slate-800"
                ></textarea>
              </div>

              {/* Accent Theme Picker */}
              <div>
                <label className="block font-bold mb-2 text-xs text-slate-700 dark:text-slate-300">
                  Primary Theme Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                  {[
                    { id: 'emerald', label: 'Emerald Health', colorBg: 'bg-emerald-600' },
                    { id: 'teal', label: 'Teal Surgical', colorBg: 'bg-teal-600' },
                    { id: 'indigo', label: 'Indigo Navy', colorBg: 'bg-indigo-600' },
                    { id: 'violet', label: 'Royal Violet', colorBg: 'bg-purple-600' },
                    { id: 'rose', label: 'Crimson Care', colorBg: 'bg-rose-600' },
                    { id: 'amber', label: 'Amber Warmth', colorBg: 'bg-amber-600' },
                  ].map((colorOption) => (
                    <button
                      type="button"
                      key={colorOption.id}
                      onClick={() => handleChange('themeAccent', colorOption.id as any)}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition ${
                        formData.themeAccent === colorOption.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-full ${colorOption.colorBg} shadow-md`} />
                      <span className="font-bold text-[10px] text-slate-700 dark:text-slate-300">
                        {colorOption.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Eye className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Live Customization Preview
                </h3>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 p-4 text-white space-y-3">
                <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  ✓ System Banner Preview
                </div>
                <div className="text-sm font-black">{formData.hospitalName}</div>
                <p className="text-[10px] text-slate-300 italic">"{formData.hospitalTagline}"</p>
                <div className="p-2.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  {formData.portalWelcomeBanner}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] font-mono">
                  <span>ID Format: <strong className="text-emerald-400">{formData.staffIdPrefix}1001</strong></span>
                  <span>Currency: <strong className="text-emerald-400">{formData.currency}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORKFLOW & APPROVAL RULES */}
        {activeTab === 'workflows' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Zap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                4-Tier Sequential Approval Workflow Configuration
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-slate-100">
                    Mandatory 4-Tier Sequential Leave Workflow
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Requires sequential approvals: Tier 1 (Unit Head) → Tier 2 (Department Head) → Tier 3 (HR) → Tier 4 (Head of Facility).
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
                  <option value={15}>15 Minutes (HIPAA High Security)</option>
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
                Email Footer Legal Disclaimer & HIPAA Notice
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
              <Sliders className="h-5 w-5 text-rose-600 dark:text-rose-400" />
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-rose-800 peer-checked:bg-rose-600"></div>
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-rose-800 peer-checked:bg-rose-600"></div>
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
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-rose-800 peer-checked:bg-rose-600"></div>
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
    </div>
  );
};
