import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Globe,
  DollarSign,
  Moon,
  Sun,
  Bell,
  BellRing,
  Sparkles,
  Smartphone,
  Check,
  UserCheck,
  LogOut,
  User,
  KeyRound,
  Mail,
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';
import { UserRole, LanguageCode, CurrencyCode } from '../types/hrms';
import { PjpiimcLogo } from './common/PjpiimcLogo';
import { SubordinateRequestModal } from './notifications/SubordinateRequestModal';
import { EmailDispatchConsoleModal } from './notifications/EmailDispatchConsoleModal';

interface HeaderProps {
  onOpenAIAssistant?: () => void;
  onChangePasswordClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAIAssistant, onChangePasswordClick }) => {
  const {
    selectedHospital,
    setSelectedHospitalId,
    hospitals,
    activeRole,
    setActiveRole,
    language,
    setLanguage,
    currency,
    setCurrency,
    darkMode,
    setDarkMode,
    mobileViewActive,
    setMobileViewActive,
    notifications,
    markNotificationRead,
    currentUser,
    logout,
    leaves,
    shiftSwapRequests,
    monthlyUnitRosters,
    expenseClaims,
  } = useHrms();

  const [showNotifications, setShowNotifications] = useState(false);
  const [isSubordinateModalOpen, setIsSubordinateModalOpen] = useState(false);
  const [isEmailConsoleOpen, setIsEmailConsoleOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Subordinate Pending Requests Count for Leadership
  const pendingLeavesCount = leaves.filter((l) => l.status === 'Pending').length;
  const pendingSwapsCount = shiftSwapRequests.filter((s) => s.status === 'Pending_Lead_Approval').length;
  const pendingRostersCount = monthlyUnitRosters.filter((r) => r.status === 'Submitted_To_HOD' || r.status === 'Pending HR Approval').length;
  const pendingExpensesCount = expenseClaims.filter((e) => e.status === 'Pending').length;
  const totalSubordinatePending = pendingLeavesCount + pendingSwapsCount + pendingRostersCount + pendingExpensesCount;

  const rolesList: { role: UserRole; label: string }[] = [
    { role: 'super_admin', label: 'Super Admin' },
    { role: 'facility_head', label: 'Head of Facility (CMO / CEO)' },
    { role: 'hr_director', label: 'HR Director' },
    { role: 'hr_manager', label: 'Hospital HR Manager' },
    { role: 'dept_head', label: 'Department Head (HOD)' },
    { role: 'unit_head', label: 'Unit Head (HOU)' },
    { role: 'doctor', label: 'Doctor / Physician' },
    { role: 'nurse', label: 'Nurse / Staff' },
    { role: 'auditor', label: 'Compliance Auditor' },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Left: Hospital Name Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <PjpiimcLogo size="sm" className="shrink-0" />
          <select
            value={selectedHospital.id}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="bg-transparent font-extrabold text-slate-900 focus:outline-none dark:text-slate-100 text-xs sm:text-sm cursor-pointer"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold">
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile App Toggle */}
        <button
          onClick={() => setMobileViewActive(!mobileViewActive)}
          title="Toggle Mobile App Simulator"
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            mobileViewActive
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span className="hidden md:inline">Mobile App</span>
        </button>

        {/* Official Assigned Role Badge (Solely Determined by HR) */}
        <div
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
          title="Your official role is solely determined and assigned by HR"
        >
          <UserCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="whitespace-nowrap">
            {rolesList.find((r) => r.role === activeRole)?.label || activeRole}
          </span>
        </div>

        {/* Language Selector */}
        <div className="flex items-center rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
          <Globe className="mr-1 h-3.5 w-3.5 text-slate-500" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-300 uppercase cursor-pointer"
          >
            <option value="en" className="dark:bg-slate-900">EN</option>
            <option value="es" className="dark:bg-slate-900">ES</option>
            <option value="fr" className="dark:bg-slate-900">FR</option>
            <option value="ar" className="dark:bg-slate-900">AR</option>
          </select>
        </div>

        {/* Enforced Currency Indicator (GH₵ Ghana Cedi) */}
        <div
          className="hidden sm:flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-black text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
          title="Ghana Cedi (GH₵) is enforced as system currency"
        >
          <span className="text-emerald-500 font-black mr-1">GH₵</span>
          <span>GHS</span>
        </div>

        {/* Real-time Email Dispatch Outbox Console Toggle */}
        <button
          onClick={() => setIsEmailConsoleOpen((prev) => !prev)}
          className={`relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition-all duration-200 shadow-sm ${
            isEmailConsoleOpen
              ? 'bg-emerald-600 text-white border-emerald-500 ring-2 ring-emerald-500/30'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
          }`}
          title="Toggle Realtime Email Outbox & Dispatch Console"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Mail className="h-4 w-4" />
          <span className="hidden md:inline">{isEmailConsoleOpen ? 'Close Mailer' : 'Realtime Mail'}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Subordinate Requests Bell Button for Leadership */}
        {['unit_head', 'dept_head', 'hr_director', 'hr_manager', 'facility_head', 'super_admin'].includes(activeRole) && (
          <button
            onClick={() => setIsSubordinateModalOpen(true)}
            className="relative flex items-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2.5 py-1.5 text-xs font-bold transition shadow-sm"
            title="Subordinate Requests Awaiting Approval"
          >
            <BellRing className="h-4 w-4 animate-pulse text-amber-400" />
            <span className="hidden sm:inline font-extrabold text-amber-300">Subordinate Requests</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 px-1">
              {totalSubordinatePending}
            </span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
              <div className="mb-2 flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="text-[10px] font-medium text-slate-400">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`cursor-pointer rounded-lg p-2.5 text-xs transition ${
                      n.read ? 'bg-slate-50 opacity-70 dark:bg-slate-800/50' : 'bg-emerald-50/60 dark:bg-emerald-950/30'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px]">{n.message}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="rounded bg-slate-200/60 px-1.5 py-0.5 dark:bg-slate-800">{n.channel}</span>
                      {!n.read && <span className="text-emerald-600 dark:text-emerald-400">Mark read</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current User Session Profile & Sign Out Button */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="hidden xl:flex items-center gap-2">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser?.name || 'User'}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500/30"
            />
            <div className="text-left leading-tight">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                {currentUser?.name || 'Logged User'}
              </p>
              <p className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">
                {currentUser?.email || 'user@stjudehealth.org'}
              </p>
            </div>
          </div>

          {onChangePasswordClick && (
            <button
              onClick={onChangePasswordClick}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition border ${
                currentUser?.mustChangePassword
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
              title="Change Account Password"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Password</span>
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-3 py-1.5 text-xs font-bold transition border border-rose-500/20"
            title="Sign Out of Portal"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Subordinate Requests Modal */}
      <SubordinateRequestModal
        isOpen={isSubordinateModalOpen}
        onClose={() => setIsSubordinateModalOpen(false)}
      />

      {/* Realtime Email Dispatch Outbox Console Modal */}
      <EmailDispatchConsoleModal
        isOpen={isEmailConsoleOpen}
        onClose={() => setIsEmailConsoleOpen(false)}
      />
    </header>
  );
};
