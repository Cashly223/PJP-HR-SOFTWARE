import React, { useState } from 'react';
import { Cake, Sparkles, Heart, Gift, Send, CheckCircle2, ChevronRight, PartyPopper } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const BirthdayNotificationBanner: React.FC = () => {
  const { employees, addChatMessage, currentUser } = useHrms();
  const [wishedEmployees, setWishedEmployees] = useState<string[]>([]);
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);

  // Current month & day helper
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // 1 - 12
  const currentDay = today.getDate();

  // Find staff who have birthdays today or in the current month/week
  // If no mock employee has a matching DOB, we make sure Dr. Sarah Jenkins and Nurse Elena Rostova or current user have birthdays today/this week for a live festive feel!
  const birthdayStaff = employees.map((emp, index) => {
    // Generate deterministic DOB for mock visualization if missing
    let dobDay = currentDay;
    if (index === 1) dobDay = currentDay; // Today
    else if (index === 2) dobDay = currentDay + 1; // Tomorrow
    else dobDay = (index * 5) % 28 + 1;

    return {
      ...emp,
      isToday: dobDay === currentDay,
      birthdayDateDisplay: dobDay === currentDay ? 'TODAY 🎉' : `August ${dobDay}`,
    };
  }).filter((e) => e.isToday || e.id === 'emp-101' || e.id === 'emp-102');

  const todayBirthdays = birthdayStaff.filter((e) => e.isToday);

  const handleSendWish = (empName: string, empId: string) => {
    if (wishedEmployees.includes(empId)) return;

    const currentEmpName = currentUser?.name || 'Staff Member';

    addChatMessage({
      id: `wish-${Date.now()}`,
      channelId: 'canteen',
      senderId: currentUser?.id || 'emp-current',
      senderName: currentEmpName,
      senderRole: 'Hospital Staff',
      senderDepartment: currentUser?.department || 'Clinical Services',
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      content: `🎉 Happy Birthday ${empName}! Wishing you a wonderful day filled with joy and health from all of us at PJPIIMC! 🎂🎈`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setWishedEmployees((prev) => [...prev, empId]);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-amber-300/80 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 p-5 text-white shadow-lg">
      {/* Decorative Sparkle Background Elements */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 blur-xl"></div>
      <div className="absolute -left-6 -bottom-6 h-32 w-32 rounded-full bg-yellow-300/20 blur-xl"></div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-amber-200 border border-white/30 shadow-inner">
            <Cake className="h-7 w-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-300 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-900 tracking-wider">
                Hospital Celebration Portal
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-100">
                <PartyPopper className="h-3.5 w-3.5" /> PJPIIMC Birthdays
              </span>
            </div>
            <h3 className="mt-1 text-base font-extrabold tracking-tight text-white drop-shadow-sm">
              Happy Birthday Staff Members! 🎉
            </h3>
            <p className="text-xs text-amber-100/90 font-medium">
              Join the hospital community in wishing our clinical and administrative colleagues a wonderful birthday today!
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCelebrationModal(true)}
          className="self-start sm:self-center shrink-0 flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-black text-purple-900 shadow-md hover:bg-amber-100 transition-transform active:scale-95"
        >
          <Gift className="h-4 w-4 text-purple-700" />
          <span>View Birthday Wall ({todayBirthdays.length} Today)</span>
        </button>
      </div>

      {/* Quick Staff Cards Bar */}
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
        {birthdayStaff.map((staff) => {
          const isWished = wishedEmployees.includes(staff.id);

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
                    {staff.department} • <span className="font-bold text-yellow-300">{staff.birthdayDateDisplay}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSendWish(`${staff.firstName} ${staff.lastName}`, staff.id)}
                disabled={isWished}
                className={`ml-2 shrink-0 flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] font-bold shadow-xs transition-colors ${
                  isWished
                    ? 'bg-emerald-500/80 text-white'
                    : 'bg-yellow-300 text-purple-900 hover:bg-yellow-200'
                }`}
              >
                {isWished ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> Wished
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 text-purple-900" /> Wish 🎉
                  </>
                )}
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
                Send official staff warm wishes and birthday messages directly to the Staff Canteen Channel.
              </p>
            </div>

            <div className="mt-5 space-y-3 max-h-[280px] overflow-y-auto pr-1">
              {birthdayStaff.map((staff) => {
                const isWished = wishedEmployees.includes(staff.id);

                return (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between rounded-2xl bg-slate-800/90 p-3.5 border border-slate-700/80"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={staff.photo}
                        alt={staff.firstName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-400"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">
                          {staff.firstName} {staff.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {staff.jobTitle} ({staff.department})
                        </div>
                        <div className="text-[10px] font-extrabold text-amber-400 mt-0.5">
                          Birthday: {staff.birthdayDateDisplay}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSendWish(`${staff.firstName} ${staff.lastName}`, staff.id)}
                      disabled={isWished}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        isWished
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-400 text-purple-950 hover:bg-amber-300'
                      }`}
                    >
                      {isWished ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Greetings Sent
                        </>
                      ) : (
                        <>
                          <Send className="h-3.5 w-3.5" /> Send Greetings 🎉
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowCelebrationModal(false)}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
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
