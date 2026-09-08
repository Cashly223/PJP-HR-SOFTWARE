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
  Check,
  UserCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { PjpiimcLogo } from '../common/PjpiimcLogo';

interface FirstLoginChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirstLoginChoiceModal: React.FC<FirstLoginChoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { changePassword, logout, currentUser } = useHrms();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 6) {
      setError('Your new password must be at least 6 characters / digits.');
      return;
    }

    const forbiddenDefaultPasswords = [
      'password123',
      'hospital2026!',
      'pjpiimc2026!',
      '123456',
      '654321',
      currentUser?.empCode?.toLowerCase() || '',
      (currentUser?.empCode?.toLowerCase() || '') + '00',
    ];

    if (forbiddenDefaultPasswords.includes(trimmed.toLowerCase())) {
      setError(
        'For security reasons, your new password cannot be the default password ("123456") or your Staff Code. Please choose a secure personal password.'
      );
      return;
    }

    if (trimmed !== confirmPassword.trim()) {
      setError('Passwords do not match. Please verify and re-type.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(trimmed);
      setSuccess('Your private password has been successfully activated! Default credentials have been overridden. Redirecting to your dashboard...');
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  const isMinLength = newPassword.length >= 6;
  const isNotDefault =
    newPassword.length > 0 &&
    !['123456', '654321', 'password123', 'hospital2026!', 'pjpiimc2026!', currentUser?.empCode?.toLowerCase()].includes(
      newPassword.toLowerCase()
    );
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white border-b border-blue-600/30">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur border border-white/20 text-white shadow-inner shrink-0">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-blue-200 block">
                Hospital Mandatory Security Policy
              </span>
              <h2 className="text-lg sm:text-xl font-black">
                First Time Login: Set Private Password
              </h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-blue-100/90 leading-relaxed">
            Welcome, <strong>{currentUser?.name}</strong>. Before accessing the portal, you must replace your default credentials with a private password.
          </p>
        </div>

        {/* User Badge Info */}
        <div className="bg-slate-950/60 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">{currentUser?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[11px]">
              Staff Code: {currentUser?.empCode}
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {/* Feedback Alerts */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200/90 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Override Default Password:</strong> Once saved, this new password will permanently replace your default login credentials and will be required for all future sessions.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                New Private Password / 6-Digit PIN
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
                <span>Password Requirements:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isMinLength ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                <span className={isMinLength ? 'text-emerald-300 font-medium' : ''}>
                  Minimum 6 digits or alphanumeric characters
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isNotDefault ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                <span className={isNotDefault ? 'text-emerald-300 font-medium' : ''}>
                  Unique personal password (cannot be default "123456" or Staff Code)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${isMatching ? 'bg-emerald-400' : 'bg-slate-700'}`}></span>
                <span className={isMatching ? 'text-emerald-300 font-medium' : ''}>
                  Passwords match
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading || !isMinLength || !isNotDefault || !isMatching}
                className="w-full py-3.5 px-6 rounded-2xl font-black text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Save Password & Access Portal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Cancel & Sign Out</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

