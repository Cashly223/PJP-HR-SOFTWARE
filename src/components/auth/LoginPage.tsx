import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  KeyRound,
  Shield,
  HelpCircle,
  Smartphone,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Building2,
  Stethoscope,
  Clock,
  IdCard,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { UserRole } from '../../types/hrms';
import { PjpiimcLogo } from '../common/PjpiimcLogo';

export const LoginPage: React.FC = () => {
  const { login } = useHrms();

  // Active Tab: 'admin' (ADMINISTRATOR) or 'employee' (EMPLOYEE)
  const [activePortalTab, setActivePortalTab] = useState<'admin' | 'employee'>('admin');
  
  // HR Role toggle switch
  const [isHrRole, setIsHrRole] = useState(false);

  // Form Fields
  const [identifier, setIdentifier] = useState(''); // Staff ID or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(true);

  // Demo Accounts with dual access support
  const demoAccounts = [
    {
      name: 'Rev. Fr. Mike',
      title: 'Head of Facility / CEO',
      staffId: 'PJ-1001',
      email: 'rev.fr.mike@pjpiimc.org',
      role: 'facility_head' as UserRole,
      dualAccess: true,
      defaultPin: '123456',
      badge: 'Head of Facility (Admin & Staff)',
      badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Miss Vero',
      title: 'HR Director',
      staffId: 'PJ-1002',
      email: 'miss.vero@pjpiimc.org',
      role: 'hr_director' as UserRole,
      dualAccess: true,
      defaultPin: '123456',
      badge: 'HR Director (Admin & Staff)',
      badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mr. Frimpong',
      title: 'HR Manager & Staff Relations',
      staffId: 'PJ-1003',
      email: 'mr.frimpong@pjpiimc.org',
      role: 'hr_manager' as UserRole,
      dualAccess: true,
      defaultPin: '123456',
      badge: 'HR Manager (Admin & Staff)',
      badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Dr. Kwame Mensah',
      title: 'Senior Consultant Physician',
      staffId: 'PJ-1006',
      email: 'kwame.mensah@pjpiimc.org',
      role: 'doctor' as UserRole,
      dualAccess: false,
      defaultPin: '123456',
      badge: 'Clinical Staff (Employee Portal)',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sister Rita Appiah',
      title: 'Emergency Care Nurse',
      staffId: 'PJ-1007',
      email: 'rita.appiah@pjpiimc.org',
      role: 'nurse' as UserRole,
      dualAccess: false,
      defaultPin: '123456',
      badge: 'Clinical Staff (Employee Portal)',
      badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30',
      avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Mr. Joseph Osei',
      title: 'Chief Hospital Pharmacist',
      staffId: 'PJ-1008',
      email: 'joseph.osei@pjpiimc.org',
      role: 'pharmacist' as UserRole,
      dualAccess: false,
      defaultPin: '123456',
      badge: 'Clinical Staff (Employee Portal)',
      badgeColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleTabChange = (tab: 'admin' | 'employee') => {
    setActivePortalTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleFillAccount = (acc: typeof demoAccounts[0]) => {
    setIdentifier(acc.staffId);
    setPassword(acc.defaultPin);
    if (acc.dualAccess && activePortalTab === 'admin') {
      setIsHrRole(true);
    }
  };

  const handleQuickLogin = async (acc: typeof demoAccounts[0], tab: 'admin' | 'employee') => {
    setActivePortalTab(tab);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await login(acc.staffId, acc.defaultPin, tab);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('Please provide your Staff ID or Email and your 6-digit password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(cleanId, cleanPass, activePortalTab);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4 sm:p-6 font-sans overflow-x-hidden">
      
      {/* Background Soft Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative z-10 w-full max-w-md sm:max-w-lg overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Dual Tabs: ADMINISTRATOR vs EMPLOYEE */}
        <div className="grid grid-cols-2 text-center select-none font-bold text-sm sm:text-base tracking-wider uppercase">
          {/* ADMINISTRATOR Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('admin')}
            className={`py-4 sm:py-5 px-4 transition-all flex items-center justify-center gap-2 ${
              activePortalTab === 'admin'
                ? 'bg-blue-600 text-white shadow-inner'
                : 'bg-slate-100 hover:bg-slate-200 text-blue-900/70 border-b border-r border-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>ADMINISTRATOR</span>
          </button>

          {/* EMPLOYEE Tab */}
          <button
            type="button"
            onClick={() => handleTabChange('employee')}
            className={`py-4 sm:py-5 px-4 transition-all flex items-center justify-center gap-2 ${
              activePortalTab === 'employee'
                ? 'bg-blue-600 text-white shadow-inner'
                : 'bg-slate-100 hover:bg-slate-200 text-blue-900/70 border-b border-l border-slate-200'
            }`}
          >
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>EMPLOYEE</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Hospital Header & Sub-badge */}
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-2.5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
              <PjpiimcLogo size="md" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                POPE JOHN PAUL II MEDICAL CENTRE
              </h2>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mt-0.5">
                {activePortalTab === 'admin'
                  ? 'Administrative Governance & Executive HR Portal'
                  : 'Staff Self-Service & Clinical Portal'}
              </p>
            </div>
          </div>

          {/* Access Notice Badge */}
          <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
            activePortalTab === 'admin'
              ? 'bg-blue-50/80 border-blue-200 text-blue-950'
              : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <Shield className={`h-4 w-4 shrink-0 mt-0.5 ${
              activePortalTab === 'admin' ? 'text-blue-600' : 'text-emerald-600'
            }`} />
            <div className="space-y-0.5 leading-relaxed">
              <strong className="block font-bold">
                {activePortalTab === 'admin'
                  ? 'FULL ADMINISTRATIVE ACCESS'
                  : 'STAFF SELF-SERVICE (LIMITED ACCESS)'}
              </strong>
              <p className="text-[11px] opacity-90">
                {activePortalTab === 'admin'
                  ? 'For Head of Facility, HR Director, and HR Managers. (Head of Facility & HR can use the same login on both tabs).'
                  : 'For all enrolled hospital staff. View rosters, submit leave, clock attendance, and access files.'}
              </p>
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: Email / Staff ID */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Staff ID or Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4 w-4 text-blue-600" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. PJ-1001 or staff.email@pjpiimc.org"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl bg-blue-50/40 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>

            {/* Field 2: 6-Digit Password */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                6-Digit Password / PIN
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter 6-digit PIN or password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-blue-50/40 border border-slate-200 focus:border-blue-600 focus:bg-white pl-10 pr-10 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* HR Role Toggle Switch & Forgot Password Link */}
            <div className="flex items-center justify-between pt-1 text-xs">
              
              {/* HR Role Pill Toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-semibold">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={isHrRole}
                    onChange={(e) => {
                      setIsHrRole(e.target.checked);
                      if (e.target.checked && activePortalTab !== 'admin') {
                        setActivePortalTab('admin');
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
                <span className="text-xs">HR Role</span>
              </label>

              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 hover:text-blue-800 font-semibold text-xs transition underline-offset-2 hover:underline"
              >
                {activePortalTab === 'admin'
                  ? 'Forgot Administrator Password?'
                  : 'Forgot Employee Password?'}
              </button>
            </div>

            {/* Primary Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-xl font-black text-sm tracking-wider uppercase text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {activePortalTab === 'admin'
                        ? 'ADMINISTRATOR LOGIN'
                        : 'EMPLOYEE LOGIN'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Fast Login Selector & Credential Guide */}
        <div className="border-t border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Quick Test Accounts & Dual Role Profiles</span>
              {showDemoSelector ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>

            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              PIN: 123456
            </span>
          </div>

          {showDemoSelector && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
              <p className="text-[11px] text-slate-500">
                Click any staff member to autofill credentials or log in instantly:
              </p>

              <div className="grid grid-cols-1 gap-2">
                {demoAccounts.map((acc) => (
                  <div
                    key={acc.staffId}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition flex items-center justify-between text-left group shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 truncate">{acc.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeColor}`}>
                            {acc.staffId}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">{acc.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleFillAccount(acc)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        Autofill
                      </button>

                      {acc.dualAccess ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin(acc, 'admin')}
                            title="Sign in as Administrator (Full Access)"
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition"
                          >
                            Admin
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickLogin(acc, 'employee')}
                            title="Sign in as Employee (Staff View)"
                            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                          >
                            Staff
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(acc, 'employee')}
                          title="Sign in as Staff Member"
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                        >
                          Login
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 mt-6 text-center text-xs text-slate-400 space-y-1">
        <p>© 2026 Pope John Paul II Medical Centre - Jamasi. All Rights Reserved.</p>
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" /> 256-Bit SSL Encrypted
          </span>
          <span>•</span>
          <span>Dual Portal Authorization</span>
          <span>•</span>
          <span>PWA Mobile Ready</span>
        </div>
      </div>

      {/* Forgot Password Help Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-sans text-slate-900">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <HelpCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Password Recovery & Credential Reset
                </h3>
                <p className="text-xs text-slate-500">Pope John Paul II Medical Centre HR Registry</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-slate-700 space-y-2">
              <p className="font-semibold text-blue-900">
                For first-time login or default credential reset:
              </p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
                <li>Default 6-digit password for enrolled staff is <strong className="text-slate-900">123456</strong>.</li>
                <li>Your Staff ID is printed on your official hospital ID badge (e.g. <strong className="text-slate-900">PJ-1001</strong>).</li>
                <li>If you forgot your updated private password, contact HR Director Miss Vero or HR Manager Mr. Frimpong.</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <p><strong>HR Helpdesk Contact:</strong> hr.support@pjpiimc.org</p>
              <p><strong>Administration Phone:</strong> +233 24 100 2002 / 2003</p>
            </div>

            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              Close & Return to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
