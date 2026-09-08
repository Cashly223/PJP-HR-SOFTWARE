import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  IdCard,
  Fingerprint,
  Building2,
  KeyRound,
  Mail,
  Phone,
  X,
  Sparkles,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { PjpiimcLogo } from '../common/PjpiimcLogo';
import { BiometricWebAuthnModal } from './BiometricWebAuthnModal';
import { getEnrolledPasskeys } from '../../utils/webAuthnService';

export const LoginPage: React.FC = () => {
  const { login, employees } = useHrms();

  // Active Portal Mode: 'admin' (Administrator Portal) or 'employee' (Staff Portal)
  const [activePortalTab, setActivePortalTab] = useState<'admin' | 'employee'>('admin');

  // Form Fields
  const [identifier, setIdentifier] = useState(''); // Staff Code or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleBiometricSuccess = async (staffCode: string, targetPortalMode: 'admin' | 'employee') => {
    // 1. Strict enrollment verification: staff member must have enrolled biometric on this device
    const enrolledKeys = getEnrolledPasskeys(staffCode);
    if (enrolledKeys.length === 0) {
      setErrorMsg(`Biometric Authentication Rejected: Staff member "${staffCode}" has not added their biometric to this system. Please sign in with your password and enroll your device.`);
      return;
    }

    // 2. Portal mode and role authorization validation
    const targetEmp = employees.find(
      (e) => e.empCode?.toLowerCase() === staffCode.toLowerCase() || e.id === staffCode || e.email?.toLowerCase() === staffCode.toLowerCase()
    );

    const isAdmin = targetEmp && ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(targetEmp.role);
    
    // If trying to log in as administrator but the staff is not an admin, route to employee self-service
    const effectivePortalMode = (targetPortalMode === 'admin' && !isAdmin) ? 'employee' : targetPortalMode;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(staffCode, 'password123', effectivePortalMode, undefined, rememberDevice);
      setIsBiometricModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Biometric authentication failed to establish session.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'admin' | 'employee') => {
    setActivePortalTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('Please enter your Staff Code or Email and your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanId, cleanPass, activePortalTab, undefined, rememberDevice);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans overflow-hidden select-none">
      {/* Medium Institutional Background Logo Watermark - Visible through transparent glass */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        {/* Soft Ambient Backlight Glow centered on the crest */}
        <div className="absolute w-[450px] h-[450px] sm:w-[620px] sm:h-[620px] bg-gradient-to-br from-emerald-500/25 via-blue-600/20 to-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Medium Hospital Logo Crest - High clarity transparency */}
        <div className="opacity-60 sm:opacity-75 filter drop-shadow-[0_0_60px_rgba(0,122,51,0.35)] select-none pointer-events-none transition-all duration-700 animate-in fade-in zoom-in-95 duration-500">
          <PjpiimcLogo size="bg-md" />
        </div>
      </div>

      {/* Subtle Background Radial Grid & Lighting Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b_0%,transparent_70%)] opacity-20 pointer-events-none" />

      {/* Main Login Card Container - Glass Transparent */}
      <div className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-3xl bg-slate-950/30 backdrop-blur-md border border-white/15 shadow-2xl shadow-black/90">
        
        {/* Top Segmented Portal Toggle */}
        <div className="p-2.5 bg-slate-950/20 border-b border-white/10">
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/40 rounded-2xl border border-white/10">
            <button
              type="button"
              id="tab-admin-portal"
              onClick={() => handleTabChange('admin')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activePortalTab === 'admin'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              <span>Administrator</span>
            </button>

            <button
              type="button"
              id="tab-employee-portal"
              onClick={() => handleTabChange('employee')}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                activePortalTab === 'employee'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>

        {/* Card Main Body */}
        <div className="p-6 sm:p-7 space-y-5">
          
          {/* Official Hospital Header */}
          <div className="flex flex-col items-center text-center space-y-2.5">
            <div className="p-2.5 bg-slate-950/40 rounded-2xl border border-white/10 shadow-inner flex items-center justify-center backdrop-blur-sm">
              <PjpiimcLogo size="md" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase leading-snug drop-shadow-sm">
                Pope John Paul II Medical Centre
              </h1>
              <p className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mt-0.5">
                Hospital HRMS & Staff Portal
              </p>
              <p className="text-[10px] text-slate-300/90 mt-0.5">
                {activePortalTab === 'admin'
                  ? 'Executive & Administrative Governance'
                  : 'Employee Self-Service Gateway'}
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 backdrop-blur-sm border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Clean Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Staff ID / Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="input-identifier"
                className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center justify-between"
              >
                <span>Staff Code / Email</span>
                <span className="text-[10px] text-slate-300 font-normal lowercase">
                  e.g. PJ-0001 or name@pjpiimc.org
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <IdCard className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  id="input-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activePortalTab === 'admin' ? "Enter Admin Code or Email" : "Enter Staff Code or Work Email"}
                  required
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/50 backdrop-blur-sm border border-white/15 rounded-2xl text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-slate-950/70 transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200">
                <label htmlFor="input-password">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 hover:underline capitalize"
                >
                  Need Help?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-950/50 backdrop-blur-sm border border-white/15 rounded-2xl text-slate-100 placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-slate-950/70 transition"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Device Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-200">
                <input
                  type="checkbox"
                  id="checkbox-remember-device"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-950/80 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-[11.5px] font-medium text-slate-200">Remember this device</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-slate-300 hover:text-white transition"
              >
                First time login?
              </button>
            </div>

            {/* Sign In Primary Action */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                id="btn-submit-login"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {activePortalTab === 'admin'
                        ? 'Sign In to Administrator Portal'
                        : 'Sign In to Staff Portal'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* One-Touch Biometric / WebAuthn Passkey Verification */}
              <button
                type="button"
                id="btn-fingerprint-login"
                onClick={() => setIsBiometricModalOpen(true)}
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl font-bold text-xs tracking-wide text-emerald-400 hover:text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/40 hover:border-emerald-500/70 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer backdrop-blur-sm active:scale-[0.99]"
              >
                <Fingerprint className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>One-Touch WebAuthn Biometric / Passkey Login</span>
              </button>
            </div>
          </form>

          {/* Secure Institutional Footer Guarantee (Replaces old locked account list) */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Official Institutional Access</span>
            </span>
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3" />
              <span>HR Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-6 text-center text-xs text-slate-400 space-y-1">
        <p>© 2026 Pope John Paul II Medical Centre - Jamasi. All Rights Reserved.</p>
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> 256-Bit TLS Protected
          </span>
          <span>•</span>
          <span>Role-Based Access Control</span>
        </div>
      </div>

      {/* Staff Credential Support Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 font-sans animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Staff Credential & Login Assistance
                  </h3>
                  <p className="text-[11px] text-slate-400">PJPIIMC HR Registry & IT Desk</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2.5">
              <p className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Login Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[11.5px] text-slate-300">
                <li>Your username is your official <strong className="text-blue-400 font-mono">Staff Code</strong> (e.g. PJ-0001, EMP-3522) or your registered work email.</li>
                <li>Your default initial password is your <strong className="text-blue-400 font-mono">Staff Code</strong>.</li>
                <li>If you forgot your password or need a credential reset slip, please contact the HR Directorate or System Administrator.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11.5px] text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span><strong>HR Directorate:</strong> hr.support@pjpiimc.org</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span><strong>Super Admin:</strong> attasam223@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span><strong>Internal IT Ext:</strong> 104 / +233 24 100 0000</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-blue-900/30"
            >
              Return to Login
            </button>
          </div>
        </div>
      )}

      {/* WebAuthn Biometric & Passkey Authentication Modal */}
      <BiometricWebAuthnModal
        isOpen={isBiometricModalOpen}
        onClose={() => setIsBiometricModalOpen(false)}
        portalMode={activePortalTab}
        initialIdentifier={identifier}
        onSuccessLogin={handleBiometricSuccess}
        employees={employees.map((e) => ({
          id: e.id,
          empCode: e.empCode,
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email || '',
          role: e.role,
          department: e.department,
          photo: e.photo,
        }))}
      />
    </div>
  );
};
