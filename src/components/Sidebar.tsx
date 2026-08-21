import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Award,
  CalendarDays,
  Clock,
  PlaneTakeoff,
  Banknote,
  Briefcase,
  UserPlus,
  GraduationCap,
  HeartPulse,
  PackageCheck,
  ShieldAlert,
  FileSpreadsheet,
  Code2,
  Stethoscope,
  ChevronRight,
  Scale,
  TrendingUp,
  Video,
  SlidersHorizontal,
  GitFork,
  LogOut,
  FolderOpen,
  Megaphone,
  MessageSquare,
  Lightbulb,
  BookOpen,
  X,
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';
import { PjpiimcLogo } from './common/PjpiimcLogo';

interface SidebarProps {
  collapsed?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, t, selectedHospital, activeRole, currentUser, logout, hasModuleAccess, staffPermissions } = useHrms();

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  const rawMenuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'notice_board', label: 'Notice Board', icon: Megaphone, badge: 'Official' },
    { id: 'staff_chat', label: 'Staff Chat Room', icon: MessageSquare, badge: 'Social' },
    { id: 'suggestions', label: 'Suggestion Box', icon: Lightbulb, badge: 'Ideas' },
    { id: 'info_hub', label: 'PJPIIMC Info Hub', icon: BookOpen, badge: 'Policies' },
    { id: 'employees', label: t('employees'), icon: Users },
    { id: 'leave', label: t('leave'), icon: PlaneTakeoff },
    { id: 'conference', label: 'Unit Conferences', icon: Video, badge: 'Live' },
    { id: 'org_hierarchy', label: 'Org Hierarchy', icon: GitFork, badge: 'Tree' },
    { id: 'shifts', label: t('shifts'), icon: CalendarDays },
    { id: 'attendance', label: t('attendance'), icon: Clock },
    { id: 'payroll', label: t('payroll'), icon: Banknote },
    { id: 'lms', label: t('lms'), icon: GraduationCap },
    { id: 'performance', label: t('performance'), icon: TrendingUp },
    { id: 'grievances', label: t('grievances'), icon: Scale, badge: 'Protected' },
    { id: 'staff_files', label: 'Staff File Vault', icon: FolderOpen, badge: 'Vault' },
    { id: 'credentials', label: t('credentials'), icon: Award, badge: 'Alerts' },
    { id: 'recruitment', label: t('recruitment'), icon: Briefcase },
    { id: 'onboarding', label: t('onboarding'), icon: UserPlus },
    { id: 'health', label: t('health'), icon: HeartPulse },
    { id: 'assets', label: t('assets'), icon: PackageCheck },
    { id: 'audit', label: t('audit'), icon: ShieldAlert },
    { id: 'reports', label: t('reports'), icon: FileSpreadsheet },
    { id: 'customization', label: 'System & Access Control', icon: SlidersHorizontal, badge: isHRorAdmin ? 'Admin & HR' : 'HR Restricted' },
    { id: 'api', label: t('api'), icon: Code2 },
  ];

  // Filter items based on access control permissions
  const menuItems = rawMenuItems.filter((item) =>
    hasModuleAccess(activeRole, currentUser?.id, item.id)
  );

  // Check if current user has custom granted modules by HR
  const userPerm = (staffPermissions || []).find(
    (p) => p && (p.employeeId === currentUser?.id || (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()))
  );
  const grantedModules = userPerm?.grantedModules || [];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = () => (
    <>
      {/* Role Badge Indicator */}
      <div className="mx-4 mt-3 rounded-xl bg-slate-800/80 p-2.5 text-xs border border-slate-800">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Active RBAC Mode</span>
        <div className="mt-0.5 font-semibold text-emerald-400 capitalize flex items-center justify-between">
          <span className="truncate">{activeRole.replace('_', ' ')}</span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 text-xs font-medium">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              whileHover={{ x: 4, transition: { duration: 0.15, ease: 'easeOut' } }}
              whileTap={{ scale: 0.98 }}
              className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition text-left ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {grantedModules.includes(item.id) ? (
                  <span className="rounded px-1.5 py-0.5 text-[9px] font-extrabold bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                    HR Granted
                  </span>
                ) : item.badge ? (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      item.id === 'customization'
                        ? isHRorAdmin
                          ? 'bg-emerald-500/30 text-emerald-300'
                          : 'bg-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-emerald-200" />}
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* User Session Profile & Sign Out Button */}
      <div className="border-t border-slate-800 p-3.5 space-y-2.5 bg-slate-950/60">
        <div className="flex items-center gap-2.5 bg-slate-800/50 p-2 rounded-xl border border-slate-800">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'User'}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-emerald-500/30 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-200 truncate">
              {currentUser?.name || 'Staff User'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {currentUser?.role?.replace('_', ' ').toUpperCase() || 'GENERAL STAFF'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onCloseMobile) onCloseMobile();
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 px-3 text-xs font-bold transition active:scale-95"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center">
          <p>© 2026 AuraHR Healthcare OS</p>
          <p className="mt-0.5 text-emerald-500/80 font-medium">HIPAA & JCAHO Compliant</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Visible on lg and larger screens) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 dark:border-slate-800 dark:bg-slate-950 shrink-0 h-full select-none">
        {/* Brand & Official Coat of Arms Crest Logo */}
        <div className="flex h-16 items-center border-b border-slate-800 px-4 gap-2.5">
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-md shrink-0">
            <PjpiimcLogo size="sm" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight text-white truncate flex items-center gap-1">
              PJPIIMC <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-extrabold text-emerald-400">PORTAL</span>
            </h1>
            <p className="text-[10px] text-slate-400 truncate max-w-[145px]" title={selectedHospital.name}>
              {selectedHospital.name}
            </p>
          </div>
        </div>

        {renderNavContent()}
      </aside>

      {/* 2. Mobile Responsive Slide-Over Drawer (Visible when isMobileOpen is true on smaller screens) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Slide-in Drawer Container */}
          <aside className="relative flex w-72 sm:w-80 max-w-[85vw] flex-col bg-slate-900 text-slate-100 dark:bg-slate-950 border-r border-slate-800 shadow-2xl z-10 h-full animate-in slide-in-from-left duration-200">
            {/* Mobile Header with Logo & Close Button */}
            <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 shadow-md shrink-0">
                  <PjpiimcLogo size="sm" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-black tracking-tight text-white truncate flex items-center gap-1">
                    PJPIIMC <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[9px] font-extrabold text-emerald-400">PORTAL</span>
                  </h1>
                  <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {selectedHospital.name}
                  </p>
                </div>
              </div>

              <button
                onClick={onCloseMobile}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition active:scale-95"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
};
