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
  RefreshCw,
  Store,
  Menu,
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';
import { UserRole, LanguageCode, CurrencyCode } from '../types/hrms';
import { PjpiimcLogo } from './common/PjpiimcLogo';
import { SubordinateRequestModal } from './notifications/SubordinateRequestModal';
import { EmailDispatchConsoleModal } from './notifications/EmailDispatchConsoleModal';
import { PlayStoreDeployModal } from './mobile/PlayStoreDeployModal';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  onOpenAIAssistant?: () => void;
  onChangePasswordClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onOpenAIAssistant, onChangePasswordClick }) => {
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
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);

  const unreadCount = (notifications || []).filter((n) => n && !n.read).length;

  // Subordinate Pending Requests Count for Leadership
  const pendingLeavesCount = (leaves || []).filter((l) => l && l.status === 'Pending').length;
  const pendingSwapsCount = (shiftSwapRequests || []).filter((s) => s && s.status === 'Pending_Lead_Approval').length;
  const pendingRostersCount = (monthlyUnitRosters || []).filter((r) => r && (r.status === 'Submitted_To_HOD' || r.status === 'Pending HR Approval')).length;
  const pendingExpensesCount = (expenseClaims || []).filter((e) => e && e.status === 'Pending').length;
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
    <header className="sticky top-0 z-30 flex h-16 w-full max-w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-4 md:px-6 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: Mobile Hamburger Toggle & Hospital Name Display */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger Toggle Button for Mobile Screens */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5 text-slate-800 dark:text-slate-100" />
        </button>

        {/* Hospital Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 px-2.5 sm:px-3 py-1.5 border border-slate-200 dark:border-slate-700/60 shadow-sm min-w-0 max-w-[160px] xs:max-w-[200px] sm:max-w-[260px] md:max-w-xs">
          <PjpiimcLogo size="sm" className="shrink-0 hidden xs:inline-block" />
          <select
            value={selectedHospital.id}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="bg-transparent font-extrabold text-slate-900 focus:outline-none dark:text-slate-100 text-xs sm:text-sm cursor-pointer truncate w-full"
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
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile App Toggle */}
        <button
          onClick={() => setMobileViewActive(!mobileViewActive)}
          title="Toggle Mobile App Simulator"
          className={`hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
            mobileViewActive
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span className="hidden md:inline">Mobile App</span>
        </button>

        {/* Play Store & Install Guide Button */}
        <button
          onClick={() => setShowPlayStoreModal(true)}
          title="Google Play Store Packaging & Direct Install Guide"
          className="hidden md:flex items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2.5 py-1.5 text-xs font-bold transition border border-emerald-500/30"
        >
          <Store className="h-4 w-4 text-emerald-500" />
          <span className="hidden xl:inline">Play Store & Install</span>
        </button>

        {/* Official Assigned Role Badge */}
        <div
          className="hidden lg:flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60"
          title="Your official role is solely determined and assigned by HR"
        >
          <UserCheck className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="whitespace-nowrap">
            {rolesList.find((r) => r.role === activeRole)?.label || activeRole}
          </span>
        </div>

        {/* HR Dual Account Quick Switcher */}
        {(currentUser?.email?.toLowerCase().includes('miss.vero') ||
          currentUser?.email?.toLowerCase().includes('mr.frimpong') ||
          currentUser?.email?.toLowerCase().includes('hr.') ||
          ['hr_director', 'hr_manager'].includes(currentUser?.role || '') ||
          ['hr_director', 'hr_manager'].includes(activeRole)) && (
          <button
            onClick={() => {
              if (['hr_director', 'hr_manager', 'super_admin'].includes(activeRole)) {
                setActiveRole('nurse');
              } else {
                setActiveRole(currentUser?.email?.toLowerCase().includes('frimpong') ? 'hr_manager' : 'hr_director');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-indigo-700 dark:text-indigo-300 px-2 py-1.5 text-xs font-black border border-indigo-500/40 shadow-sm transition"
            title="HR Dual Account Switcher: Toggle between Employee Staff Portal and HR Admin Office"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <span className="hidden md:inline">
              {['hr_director', 'hr_manager'].includes(activeRole)
                ? 'Staff Portal'
                : 'HR Admin'}
            </span>
          </button>
        )}

        {/* Head of Facility Dual Account Quick Switcher */}
        {(currentUser?.email?.toLowerCase().includes('rev.fr.mike') ||
          currentUser?.email?.toLowerCase().includes('facility') ||
          currentUser?.role === 'facility_head' ||
          activeRole === 'facility_head') && (
          <button
            onClick={() => {
              if (activeRole === 'facility_head') {
                setActiveRole('doctor');
              } else {
                setActiveRole('facility_head');
              }
            }}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-700 dark:text-amber-300 px-2 py-1.5 text-xs font-black border border-amber-500/40 shadow-sm transition"
            title="Head of Facility Dual Account Switcher: Toggle between Employee Staff Portal and Hospital Admin Office"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <span className="hidden md:inline">
              {activeRole === 'facility_head'
                ? 'Staff Portal'
                : 'Hospital Admin'}
            </span>
          </button>
        )}

        {/* Language Selector */}
        <div className="hidden sm:flex items-center rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
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

        {/* Real-time Email Dispatch Outbox Console Toggle */}
        <button
          onClick={() => setIsEmailConsoleOpen((prev) => !prev)}
          className={`relative flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition-all duration-200 shadow-sm ${
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
          <span className="hidden lg:inline">{isEmailConsoleOpen ? 'Close Mailer' : 'Mail'}</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Subordinate Requests Bell Button for Leadership */}
        {['unit_head', 'dept_head', 'hr_director', 'hr_manager', 'facility_head', 'super_admin'].includes(activeRole) && (
          <button
            onClick={() => setIsSubordinateModalOpen(true)}
            className="relative flex items-center gap-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 px-2 sm:px-2.5 py-1.5 text-xs font-bold transition shadow-sm"
            title="Subordinate Requests Awaiting Approval"
          >
            <BellRing className="h-4 w-4 animate-pulse text-amber-400" />
            <span className="hidden lg:inline font-extrabold text-amber-300">Requests</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 px-1">
              {totalSubordinatePending}
            </span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown (Responsive Width) */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="mb-2 flex items-center justify-between border-b pb-2 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">Notifications</span>
                <span className="text-[10px] font-medium text-slate-400">{unreadCount} unread</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`cursor-pointer rounded-xl p-2.5 text-xs transition ${
                        n.read ? 'bg-slate-50 opacity-70 dark:bg-slate-800/50' : 'bg-emerald-50/60 dark:bg-emerald-950/30'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                        <span className="truncate pr-2">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="rounded bg-slate-200/60 px-1.5 py-0.5 dark:bg-slate-800 font-mono">{n.channel}</span>
                        {!n.read && <span className="text-emerald-600 dark:text-emerald-400 font-bold">Mark read</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Session Profile & Sign Out Button */}
        <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
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
              className={`hidden sm:flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold transition border ${
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
            className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 px-2.5 sm:px-3 py-1.5 text-xs font-bold transition border border-rose-500/20 active:scale-95"
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

      {/* Play Store & Mobile Packaging Modal */}
      <PlayStoreDeployModal
        isOpen={showPlayStoreModal}
        onClose={() => setShowPlayStoreModal(false)}
      />
    </header>
  );
};
