import React, { useState, useMemo } from 'react';
import { Cake, Sparkles, Gift, CheckCircle2, PartyPopper, X } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const BirthdayNotificationBanner: React.FC = () => {
  const { employees, addChatMessage, currentUser } = useHrms();

  // Current date helpers
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1 - 12
  const currentDay = today.getDate();
  const currentYear = today.getFullYear();
  const todayDateStr = today.toISOString().slice(0, 10);

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pjpiimc_birthday_banner_dismissed_date') === todayDateStr;
    } catch {
      return false;
    }
  });

  // Track employees who have already received birthday wishes
  const [wishedEmployees, setWishedEmployees] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pjpiimc_wished_birthdays_v1');
      const parsed = saved ? JSON.parse(saved) : [];
      const baseWished = Array.isArray(parsed) ? parsed : [];
      // Permanently keep previous mock entries (emp-101, emp-102) as wished so they never re-appear
      return Array.from(new Set([...baseWished, 'emp-101', 'emp-102']));
    } catch {
      return ['emp-101', 'emp-102'];
    }
  });

  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Find staff who actually have birthdays today based on their official dateOfBirth
  const birthdayStaff = useMemo(() => {
    return (employees || [])
      .filter(Boolean)
      .filter((emp) => {
        if (!emp.dateOfBirth) return false;
        try {
          const parts = emp.dateOfBirth.split(/[-/]/);
          if (parts.length >= 3) {
            let m = 0;
            let d = 0;
            if (parts[0].length === 4) {
              // Format: YYYY-MM-DD
              m = parseInt(parts[1], 10);
              d = parseInt(parts[2], 10);
            } else {
              // Format: MM-DD-YYYY or DD-MM-YYYY
              m = parseInt(parts[0], 10);
              d = parseInt(parts[1], 10);
            }
            return m === currentMonth && d === currentDay;
          }
        } catch {}
        return false;
      })
      .map((emp) => ({
        ...emp,
        isToday: true,
        birthdayDateDisplay: 'TODAY 🎉',
      }));
  }, [employees, currentMonth, currentDay]);

  // Filter out birthdays that have already been wished (wished once and never re-appear)
  const unwishedBirthdayStaff = useMemo(() => {
    return birthdayStaff.filter(
      (staff) =>
        staff &&
        !wishedEmployees.includes(staff.id) &&
        !wishedEmployees.includes(`${staff.id}_${currentYear}`)
    );
  }, [birthdayStaff, wishedEmployees, currentYear]);

  const handleSendWish = (empName: string, empId: string) => {
    if (wishedEmployees.includes(empId) || wishedEmployees.includes(`${empId}_${currentYear}`)) return;

    const currentEmpName = currentUser?.name || 'Staff Member';

    addChatMessage({
      id: `wish-${Date.now()}`,
      channelId: 'canteen',
      senderId: currentUser?.id || 'emp-current',
      senderName: currentEmpName,
      senderRole: 'Hospital Staff',
      senderDepartment: currentUser?.department || 'Clinical Services',
      senderAvatar:
        currentUser?.avatar ||
        'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      content: `🎉 Happy Birthday ${empName}! Wishing you a wonderful day filled with joy, health, and clinical excellence from all of us at PJPIIMC! 🎂🎈`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Record as wished both by ID and by ID_Year so it never reappears
    const updated = Array.from(new Set([...wishedEmployees, empId, `${empId}_${currentYear}`]));
    setWishedEmployees(updated);
    try {
      localStorage.setItem('pjpiimc_wished_birthdays_v1', JSON.stringify(updated));
    } catch {}
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('pjpiimc_birthday_banner_dismissed_date', todayDateStr);
      // Mark any current staff as acknowledged/wished so they do not re-appear
      const currentIds = birthdayStaff.map((s) => s.id);
      const updated = Array.from(new Set([...wishedEmployees, ...currentIds]));
      setWishedEmployees(updated);
      localStorage.setItem('pjpiimc_wished_birthdays_v1', JSON.stringify(updated));
    } catch {}
  };

  // If dismissed or all birthday staff have been wished (or none celebrating today), disappear completely!
  if (isDismissed || unwishedBirthdayStaff.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-5 text-white shadow-lg transition-all duration-300 animate-in fade-in">
      {/* Decorative Sparkle Background Elements */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
      <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-yellow-300/20 blur-xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-200 border border-white/30 shadow-inner">
            <Cake className="h-7 w-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-900 tracking-wider">
                Hospital Celebration
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-100">
                <PartyPopper className="h-3.5 w-3.5" /> PJPIIMC Birthdays
              </span>
            </div>
            <h3 className="mt-1 text-base font-extrabold tracking-tight text-white drop-shadow-sm">
              Happy Birthday Staff Members! 🎉
            </h3>
            <p className="text-xs text-amber-100/90 font-medium">
              Birthdays are celebrated once. Once wished, they will not reappear.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => setShowCelebrationModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-xs font-black text-purple-900 shadow-md hover:bg-amber-100 transition-transform active:scale-95"
          >
            <Gift className="h-4 w-4 text-purple-700" />
            <span>Celebration Wall</span>
          </button>
          <button
            onClick={handleDismissBanner}
            title="Dismiss Birthday Banner"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quick Staff Cards Bar (Only shows unwished colleagues) */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
        {unwishedBirthdayStaff.map((staff) => {
          return (
            <div
              key={staff.id}
              className="flex items-center justify-between rounded-2xl bg-white/15 p-2.5 backdrop-blur-md border border-white/20"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={staff.photo}
                  alt={staff.firstName}
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-300"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                    {staff.firstName} {staff.lastName}
                  </div>
                  <div className="text-[10px] text-amber-100 truncate">
                    {staff.department} • <span className="font-bold text-yellow-300">TODAY 🎉</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSendWish(`${staff.firstName} ${staff.lastName}`, staff.id)}
                className="ml-2 shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-bold shadow-xs bg-yellow-300 text-purple-900 hover:bg-yellow-200 transition-transform active:scale-95"
              >
                <Sparkles className="h-3 w-3 text-purple-900" /> Wish 🎉
              </button>
            </div>
          );
        })}
      </div>

      {/* BIRTHDAY CELEBRATION MODAL */}
      {showCelebrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 p-6 text-white shadow-2xl border border-amber-500/40">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-500 shadow-lg">
                <Cake className="h-9 w-9 text-purple-950" />
              </div>
              <h3 className="mt-3 text-lg font-black text-white">
                PJPIIMC Hospital Birthday Celebration Wall 🎂
              </h3>
              <p className="mt-1 text-xs text-amber-200/80">
                Official staff birthday wishes posted to the Staff Canteen channel.
              </p>
            </div>

            <div className="mt-5 space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {birthdayStaff.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-400">
                  No birthdays celebrating today.
                </div>
              ) : (
                birthdayStaff.map((staff) => {
                  const isWished =
                    wishedEmployees.includes(staff.id) ||
                    wishedEmployees.includes(`${staff.id}_${currentYear}`);

                  return (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between rounded-2xl bg-slate-800/80 p-3 border border-slate-700/60"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={staff.photo}
                          alt={staff.firstName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-400"
                        />
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">
                            {staff.firstName} {staff.lastName}
                          </h4>
                          <p className="text-xs text-slate-300 truncate">
                            {staff.jobTitle} • {staff.department}
                          </p>
                          <span className="inline-block mt-0.5 rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            TODAY 🎉
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSendWish(`${staff.firstName} ${staff.lastName}`, staff.id)}
                        disabled={isWished}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                          isWished
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                            : 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 hover:brightness-110'
                        }`}
                      >
                        {isWished ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Wished
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3.5 w-3.5" /> Wish 🎉
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Close Wall
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

