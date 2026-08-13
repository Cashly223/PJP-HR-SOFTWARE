import React, { useState, useEffect } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, AlertCircle, X, Eye, EyeOff, ShieldCheck, LogOut } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMandatory?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
}) => {
  const { changePassword, logout, currentUser } = useHrms();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFailedAttempts(0);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFailedAttempt = (msg: string) => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);

    if (nextAttempts >= 2) {
      setError(`Security Alert: 2 failed password change attempts reached. Returning to main login page...`);
      setIsLoading(true);
      setTimeout(() => {
        logout();
        onClose();
      }, 1400);
    } else {
      setError(`${msg} (Failed attempt ${nextAttempts}/2 — 1 attempt remaining before returning to login)`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!newPassword || newPassword.length < 6) {
      handleFailedAttempt('New password must be at least 6 characters long.');
      return;
    }

    const defaultPasswords = ['password123', 'hospital2026!', 'pjpiimc2026!'];
    if (currentUser?.empCode) {
      defaultPasswords.push(currentUser.empCode.toLowerCase());
    }

    if (defaultPasswords.includes(newPassword.trim().toLowerCase())) {
      handleFailedAttempt('You cannot use an HR default password or Staff ID as your new personal password. Please enter a unique, secure password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      handleFailedAttempt('New passwords do not match. Please verify and re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(newPassword);
      setSuccess('Your password has been successfully updated! Default HR credentials revoked. Unlocking portal...');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      handleFailedAttempt(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 font-sans">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl text-slate-100">
        
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shrink-0">
            <KeyRound className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              {isMandatory ? 'Password Change Required' : 'Update Account Password'}
            </h3>
            <p className="text-xs text-slate-400">
              {isMandatory
                ? 'NEW STAFF MANDATE: New staff logging in with an HR default password must change it to their own before accessing the portal.'
                : 'Choose a strong custom password to protect your staff portal account.'}
            </p>
          </div>
        </div>

        {isMandatory && (
          <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-bold text-amber-200">Account Activation Security Step</p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Logged in as <strong>{currentUser?.name || 'New Staff Member'}</strong> ({currentUser?.email || currentUser?.empCode}). Default credentials active. Please set your new private password below to enter the portal.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              New Personal Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters (not default password)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
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
              Confirm New Personal Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950/80 p-3 border border-slate-800/80 space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-300 text-xs mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              Password Policy Rules:
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span>Minimum 6 characters long</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${newPassword.length > 0 && !['password123', 'hospital2026!', 'pjpiimc2026!', currentUser?.empCode?.toLowerCase()].includes(newPassword.trim().toLowerCase()) ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span>Cannot match HR default password or Staff ID</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${newPassword.length > 0 && newPassword === confirmPassword ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              <span>Passwords match</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 rounded-2xl font-bold text-xs text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Change Password & Enter Staff Portal</>
              )}
            </button>

            {isMandatory && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="w-full py-2 px-4 rounded-2xl font-bold text-xs text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 transition flex items-center justify-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-400" />
                <span>Cancel & Return to Main Login</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
