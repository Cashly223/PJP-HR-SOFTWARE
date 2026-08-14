import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogOut,
  Sparkles,
  ArrowRight,
  Shield,
  Clock,
  Check,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface FirstLoginChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstLoginChoiceModal: React.FC<FirstLoginChoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { keepCurrentPassword, changePassword, logout, currentUser } = useHrms();

  const [activeTab, setActiveTab] = useState<'choice' | 'change_password'>('choice');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeepDefault = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await keepCurrentPassword();
      setSuccess('HR-provided credentials preserved. Entering Staff Portal...');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err?.message || 'Failed to preserve password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 6) {
      setError('Your new password must be at least 6 digits/characters long.');
      return;
    }

    const defaultPasswords = [
      'password123',
      'hospital2026!',
      'pjpiimc2026!',
      '123456',
      '654321',
      currentUser?.empCode?.toLowerCase(),
    ];

    if (defaultPasswords.includes(trimmed.toLowerCase())) {
      setError('You cannot use the common HR default password or your Staff ID as your new personal password. Please choose a unique password.');
      return;
    }

    if (trimmed !== confirmPassword.trim()) {
      setError('New passwords do not match. Please verify and re-type.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(trimmed);
      setSuccess('Your new password has been successfully saved and activated! Default credentials have been overridden. Entering portal...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur border border-white/20 text-white shadow-inner shrink-0">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-200 block">
                PJPIIMC Hospital Security Portal
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                First Time Login Setup
              </h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-100/90 leading-relaxed">
            Welcome to the PJPIIMC Staff Portal, <strong>{currentUser?.name}</strong> ({currentUser?.empCode}).
          </p>
        </div>

        {/* Feedback Alerts */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'choice' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Credential Status: Using HR-Provided Default Password</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  You are logging in with an HR-assigned default credential. As a staff member, you can choose to:
                </p>
              </div>

              {/* Option Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Keep HR Password */}
                <button
                  type="button"
                  onClick={handleKeepDefault}
                  disabled={isLoading}
                  className="p-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/60 transition text-left group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-slate-800 text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition">
                        <Clock className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option A</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                        Keep HR Password
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        Retain your HR-assigned default password and enter your staff dashboard immediately.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-blue-400">
                    <span>Keep & Enter</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </button>

                {/* Option 2: Change to Custom 6-Digit Password */}
                <button
                  type="button"
                  onClick={() => setActiveTab('change_password')}
                  disabled={isLoading}
                  className="p-4 rounded-2xl bg-blue-950/30 hover:bg-blue-900/40 border border-blue-600/40 hover:border-blue-400 transition text-left group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-blue-600 text-white shadow">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                        Recommended
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                        Create Private Password
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Set your own 6-digit PIN or custom password to override the HR default credentials permanently.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-blue-900/60 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                    <span>Set New Password</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </button>
              </div>

              {/* Logout Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Cancel & Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  New 6-Digit PIN or Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter min. 6 digits or characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter new password to confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Password Rules Checklist */}
              <div className="rounded-2xl bg-slate-950/80 p-3.5 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs mb-1">
                  <Shield className="h-3.5 w-3.5 text-blue-400" />
                  <span>Credential Rules:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                  <span>Minimum 6 digits or alphanumeric characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${newPassword.length > 0 && !['123456', 'password123', 'hospital2026!', 'pjpiimc2026!', currentUser?.empCode?.toLowerCase()].includes(newPassword.toLowerCase()) ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                  <span>Unique private password (cannot be default credentials)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${newPassword.length > 0 && newPassword === confirmPassword ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                  <span>Passwords match</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 rounded-2xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98"
                >
                  {isLoading ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Save Password & Unlock Staff Portal</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('choice')}
                  className="w-full py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition"
                >
                  Back to Options
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
