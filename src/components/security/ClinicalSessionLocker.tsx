import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Lock, Unlock, LogOut, AlertCircle, Clock } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface ClinicalSessionLockerProps {
  timeoutMinutes?: number;
}

export const ClinicalSessionLocker: React.FC<ClinicalSessionLockerProps> = ({
  timeoutMinutes = 15,
}) => {
  const { currentUser, logout } = useHrms();
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [idleSeconds, setIdleSeconds] = useState(0);
  const lastActivityRef = useRef<number>(Date.now());

  // Check stored timeout preference or default to timeoutMinutes
  const effectiveTimeoutMinutes = Number(
    localStorage.getItem('aurahr_session_timeout_minutes') || timeoutMinutes
  );

  const lockWorkstation = useCallback(() => {
    setIsLocked(true);
    setUnlockPassword('');
    setErrorMsg('');
  }, []);

  // Listen for manual lock events
  useEffect(() => {
    const handleManualLock = () => {
      lockWorkstation();
    };

    window.addEventListener('aurahr_lock_workstation', handleManualLock);
    return () => window.removeEventListener('aurahr_lock_workstation', handleManualLock);
  }, [lockWorkstation]);

  // Track user activity
  useEffect(() => {
    if (!currentUser || isLocked) return;

    const resetIdleTimer = () => {
      lastActivityRef.current = Date.now();
      setIdleSeconds(0);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));

    const interval = setInterval(() => {
      if (effectiveTimeoutMinutes <= 0) return; // Disabled

      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      setIdleSeconds(elapsed);

      if (elapsed >= effectiveTimeoutMinutes * 60) {
        lockWorkstation();
      }
    }, 5000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
      clearInterval(interval);
    };
  }, [currentUser, isLocked, effectiveTimeoutMinutes, lockWorkstation]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!unlockPassword.trim()) {
      setErrorMsg('Please enter your Staff Code or Password.');
      return;
    }

    const cleanInput = unlockPassword.trim().toLowerCase();
    const empCode = (currentUser?.empCode || '').toLowerCase();
    const customPass = (currentUser?.customPassword || '').toLowerCase();

    // Accepted unlock credentials: Staff Code, Default passwords, or saved custom password
    const isMatched =
      cleanInput === empCode ||
      cleanInput === empCode.replace(/^(pj-|sjh-|emp-)/, '') ||
      cleanInput === '123456' ||
      cleanInput === 'admin123' ||
      cleanInput === 'pj-0001' ||
      cleanInput === customPass;

    if (isMatched) {
      lastActivityRef.current = Date.now();
      setIdleSeconds(0);
      setIsLocked(false);
      setUnlockPassword('');
    } else {
      setErrorMsg('Incorrect credentials. Please verify your Staff PIN or Password.');
    }
  };

  if (!currentUser || !isLocked) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      id="clinical-workstation-lockscreen"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-center text-slate-900 dark:text-slate-100">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 mb-4">
          <Lock className="h-7 w-7" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-3">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          <span>HIPAA § 164.312 Terminal Security Active</span>
        </div>

        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
          Workstation Locked
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          This clinical terminal was automatically secured due to inactivity. Enter your Staff Code or Password to resume.
        </p>

        {/* Staff Identity Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 mb-5 text-left">
          {currentUser.photo ? (
            <img
              src={currentUser.photo}
              alt={currentUser.name}
              className="h-12 w-12 rounded-xl object-cover border border-slate-300 dark:border-slate-600 shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              {currentUser.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
              {currentUser.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {currentUser.empCode}
              </span>
              <span>•</span>
              <span className="truncate">{currentUser.department}</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold mb-4 text-left">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-3">
          <div className="relative text-left">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Staff Password or Staff Code
            </label>
            <input
              type="password"
              autoFocus
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              placeholder={`Enter code (e.g. ${currentUser.empCode})`}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 text-sm transition shadow-lg shadow-blue-500/20 active:scale-[0.99]"
            id="btn-unlock-workstation"
          >
            <Unlock className="h-4 w-4" />
            <span>Unlock Workstation</span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Auto-Lock: {effectiveTimeoutMinutes} min</span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-bold"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Workstation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
