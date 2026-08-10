import React from 'react';
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
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
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
  const userPerm = staffPermissions.find(
    (p) => p.employeeId === currentUser?.id || (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
  );
  const grantedModules = userPerm?.grantedModules || [];

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 dark:border-slate-800 dark:bg-slate-950">
      {/* Brand & Logo */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6 gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md">
          <Stethoscope className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            AuraHR <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">MED</span>
          </h1>
          <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{selectedHospital.name}</p>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="mx-4 mt-4 rounded-lg bg-slate-800/80 p-2.5 text-xs">
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Active RBAC Mode</span>
        <div className="mt-0.5 font-semibold text-emerald-400 capitalize flex items-center justify-between">
          <span>{activeRole.replace('_', ' ')}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 text-xs font-medium">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition ${
                isActive
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span>{item.label}</span>
              </div>
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
            </button>
          );
        })}
      </nav>

      {/* User Session Profile & Sign Out Button */}
      <div className="border-t border-slate-800 p-3.5 space-y-3">
        <div className="flex items-center gap-2.5 bg-slate-800/40 p-2 rounded-xl border border-slate-800">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser?.name || 'User'}
            className="h-8 w-8 rounded-lg object-cover ring-1 ring-emerald-500/30"
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
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 py-2 px-3 text-xs font-bold transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>

        <div className="text-[10px] text-slate-500 text-center">
          <p>© 2026 AuraHR Healthcare OS</p>
          <p className="mt-0.5 text-emerald-500/80 font-medium">HIPAA & JCAHO Compliant</p>
        </div>
      </div>
    </aside>
  );
};
