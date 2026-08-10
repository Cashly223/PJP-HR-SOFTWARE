import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Globe,
  DollarSign,
  Moon,
  Sun,
  Bell,
  Sparkles,
  Smartphone,
  Check,
  UserCheck,
  LogOut,
  User,
  KeyRound,
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';
import { UserRole, LanguageCode, CurrencyCode } from '../types/hrms';

interface HeaderProps {
  onOpenAIAssistant: () => void;
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
  } = useHrms();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

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
      {/* Left: Hospital Switcher */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 dark:bg-emerald-950/50">
          <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <select
            value={selectedHospital.id}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none dark:text-slate-100 text-sm cursor-pointer"
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {h.name} ({h.code})
              </option>
            ))}
          </select>
        </div>

        <span className="hidden text-xs text-slate-400 sm:inline">
          {selectedHospital.branches} Branches • {selectedHospital.totalBeds} Beds
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAIAssistant}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition"
        >
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">AuraAI Assistant</span>
        </button>

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

        {/* RBAC Quick Role Switcher */}
        <div className="relative flex items-center rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800">
          <UserCheck className="mr-1 h-3.5 w-3.5 text-slate-500" />
          <select
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-300 cursor-pointer"
          >
            {rolesList.map((r) => (
              <option key={r.role} value={r.role} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {r.label}
              </option>
            ))}
          </select>
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

        {/* Currency Selector */}
        <div className="hidden items-center rounded-lg bg-slate-100 px-2 py-1 dark:bg-slate-800 sm:flex">
          <DollarSign className="mr-1 h-3.5 w-3.5 text-slate-500" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none dark:text-slate-300 cursor-pointer"
          >
            <option value="USD" className="dark:bg-slate-900">USD ($)</option>
            <option value="EUR" className="dark:bg-slate-900">EUR (€)</option>
            <option value="GBP" className="dark:bg-slate-900">GBP (£)</option>
            <option value="AED" className="dark:bg-slate-900">AED</option>
            <option value="INR" className="dark:bg-slate-900">INR (₹)</option>
          </select>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

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
    </header>
  );
};
