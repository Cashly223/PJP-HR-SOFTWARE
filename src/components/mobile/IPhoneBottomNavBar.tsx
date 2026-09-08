import React from 'react';
import {
  LayoutDashboard,
  Clock,
  CalendarDays,
  PlaneTakeoff,
  User,
  Menu,
  Megaphone,
  Fingerprint,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface IPhoneBottomNavBarProps {
  onOpenFullMenu: () => void;
}

export const IPhoneBottomNavBar: React.FC<IPhoneBottomNavBarProps> = ({ onOpenFullMenu }) => {
  const { activeTab, setActiveTab, notifications, attendance, currentUser } = useHrms();

  const unreadNoticesCount = (notifications || []).filter((n) => !n.read).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const isClockedInToday = (attendance || []).some(
    (a) => a.employeeId === currentUser?.id && a.date === todayStr && a.clockIn && !a.clockOut
  );

  const handleTabSelect = (tabId: string) => {
    // Haptic feedback trigger for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch (e) {}
    }
    setActiveTab(tabId);
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'attendance',
      label: isClockedInToday ? 'Clocked In' : 'Clock In',
      icon: Fingerprint,
      highlight: true,
      badge: isClockedInToday ? 'Active' : undefined,
    },
    {
      id: 'shifts',
      label: 'Roster',
      icon: CalendarDays,
    },
    {
      id: 'leave',
      label: 'Leaves',
      icon: PlaneTakeoff,
    },
    {
      id: 'notice_board',
      label: 'Notices',
      icon: Megaphone,
      count: unreadNoticesCount > 0 ? unreadNoticesCount : undefined,
    },
  ];

  return (
    <nav
      id="iphone-bottom-navigation-bar"
      aria-label="Mobile iPhone Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 ios-glass-bar pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 px-2 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[56px] ${
                isActive
                  ? item.highlight
                    ? 'text-emerald-400 bg-emerald-500/15'
                    : 'text-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Icon Container with optional pulsating highlight */}
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110' : ''
                  } ${
                    item.highlight && !isClockedInToday
                      ? 'text-emerald-400'
                      : ''
                  }`}
                />

                {/* Unread Counter Badge */}
                {item.count && (
                  <span className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-slate-900">
                    {item.count}
                  </span>
                )}

                {/* Active Indicator Pulse */}
                {item.highlight && isClockedInToday && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </div>

              {/* Tab Title */}
              <span
                className={`text-[10px] mt-1 font-bold tracking-tight truncate max-w-[64px] ${
                  isActive
                    ? item.highlight
                      ? 'text-emerald-400 font-black'
                      : 'text-blue-400 font-black'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        {/* All Modules Menu Drawer Trigger */}
        <button
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate(15);
              } catch (e) {}
            }
            onOpenFullMenu();
          }}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-slate-400 hover:text-slate-200 active:scale-95 transition min-w-[56px]"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] mt-1 font-bold text-slate-400">
            More
          </span>
        </button>
      </div>
    </nav>
  );
};
