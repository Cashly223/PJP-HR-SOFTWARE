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
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';

interface SidebarProps {
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { activeTab, setActiveTab, t, selectedHospital, activeRole } = useHrms();

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'customization', label: t('customization') || 'Customization', icon: SlidersHorizontal, badge: isHRorAdmin ? 'Admin & HR' : 'HR/Admin Only', isSpecial: true },
    { id: 'conference', label: 'Unit Conferences', icon: Video, badge: 'Live' },
    { id: 'employees', label: t('employees'), icon: Users },
    { id: 'org_hierarchy', label: 'Org Hierarchy', icon: GitFork, badge: 'Tree' },
    { id: 'performance', label: t('performance'), icon: TrendingUp },
    { id: 'grievances', label: t('grievances'), icon: Scale, badge: 'Protected' },
    { id: 'credentials', label: t('credentials'), icon: Award, badge: 'Alerts' },
    { id: 'shifts', label: t('shifts'), icon: CalendarDays },
    { id: 'attendance', label: t('attendance'), icon: Clock },
    { id: 'leave', label: t('leave'), icon: PlaneTakeoff },
    { id: 'payroll', label: t('payroll'), icon: Banknote },
    { id: 'recruitment', label: t('recruitment'), icon: Briefcase },
    { id: 'onboarding', label: t('onboarding'), icon: UserPlus },
    { id: 'lms', label: t('lms'), icon: GraduationCap },
    { id: 'health', label: t('health'), icon: HeartPulse },
    { id: 'assets', label: t('assets'), icon: PackageCheck },
    { id: 'audit', label: t('audit'), icon: ShieldAlert },
    { id: 'reports', label: t('reports'), icon: FileSpreadsheet },
    { id: 'api', label: t('api'), icon: Code2 },
  ];

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
              {item.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    item.id === 'customization'
                      ? isHRorAdmin
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-amber-500/30 text-amber-300'
                      : 'bg-rose-500/30 text-rose-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-emerald-200" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-slate-800 p-4 text-[10px] text-slate-500">
        <p>© 2026 AuraHR Healthcare OS</p>
        <p className="mt-0.5">HIPAA & JCAHO Compliant</p>
      </div>
    </aside>
  );
};
