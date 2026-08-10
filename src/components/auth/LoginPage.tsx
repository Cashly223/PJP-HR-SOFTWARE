import React, { useState } from 'react';
import {
  Building2,
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
  UserPlus,
  LogIn,
  Hospital,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { UserRole } from '../../types/hrms';

export const LoginPage: React.FC = () => {
  const { login, signup, systemCustomization, darkMode, setDarkMode } = useHrms();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [department, setDepartment] = useState('Cardiology & Intensive Care');

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Demo accounts quick-login list
  const demoAccounts = [
    {
      name: 'Dr. Arthur Kingsley',
      email: 'a.kingsley@stjudehealth.org',
      role: 'facility_head' as UserRole,
      roleLabel: 'Head of Facility / CMO',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    {
      name: 'Marcus Vance',
      email: 'm.vance@stjudehealth.org',
      role: 'hr_director' as UserRole,
      roleLabel: 'Global HR Director',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
    {
      name: 'Dr. Sarah Jenkins',
      email: 's.jenkins@stjudehealth.org',
      role: 'dept_head' as UserRole,
      roleLabel: 'Chief Physician / HOD',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    },
    {
      name: 'Elena Rostova',
      email: 'e.rostova@stjudehealth.org',
      role: 'nurse' as UserRole,
      roleLabel: 'Senior ICU Nurse',
      avatar: 'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    },
  ];

  const handleQuickLogin = async (accEmail: string, accRole: UserRole, accName: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login(accEmail, 'password123', accRole, accName);
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

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter both your email address and password.');
        return;
      }

      setIsLoading(true);
      try {
        await login(email, password, role);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign Up Validation
      if (!fullName.trim() || !email.trim() || !password.trim()) {
        setErrorMsg('All fields are required for sign up.');
        return;
      }

      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match. Please re-enter.');
        return;
      }

      setIsLoading(true);
      try {
        await signup({
          fullName,
          email,
          password,
          role,
          department,
        });
        setSuccessMsg('Account created successfully! Signing you into the portal...');
      } catch (err: any) {
        setErrorMsg(err.message || 'Error creating account.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-8 text-slate-100 overflow-hidden font-sans">
      {/* Dynamic Background Ambient Blobs */}
      <div className="absolute top-0 -left-40 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Hospital Branding & Highlights (5 cols on lg) */}
        <div className="lg:col-span-5 relative flex flex-col justify-between bg-gradient-to-br from-emerald-950/80 via-slate-900 to-indigo-950/80 p-8 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            {/* Header / Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-lg text-white font-black text-xl">
                <Hospital className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  {systemCustomization.hospitalName || 'St. Jude Teaching Hospital'}
                </h1>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 block">
                  Healthcare HR Operating System
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> HIPAA & JCAHO Compliant Auth
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Secure multi-tier access portal for executive clinical leaders, department heads, physicians, nurses, and HR administrators.
              </p>
            </div>

            {/* Quick Demo Accounts Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> One-Click Demo Sign-In
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">Pre-configured roles</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickLogin(acc.email, acc.role, acc.name)}
                    disabled={isLoading}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 transition group text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {acc.email}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border whitespace-nowrap ml-2 ${acc.badgeBg}`}>
                      {acc.roleLabel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>© 2026 AuraHR System</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
              <Shield className="h-3 w-3" /> Encrypted 256-bit
            </span>
          </div>
        </div>

        {/* Right Side: Login & Sign Up Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          
          {/* Form Mode Switcher (Sign In vs Sign Up) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-black text-white">
                {mode === 'login' ? 'Sign In to Portal' : 'Create Staff Account'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'login'
                  ? 'Enter your registered email and security password to proceed.'
                  : 'Register a new clinical or administrative employee login account.'}
              </p>
            </div>

            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign Up
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* HR Policy Banner when in signup mode */}
          {mode === 'signup' && (
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs flex items-start gap-2.5">
              <Shield className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-indigo-300 font-bold">HR Governance Policy Notice:</strong>
                <p className="text-[11px] text-indigo-300/80 mt-0.5">
                  Official staff account provisioning is solely managed by HR. If you are an HR Officer, you can provision accounts directly from the Staff Directory.
                </p>
              </div>
            </div>
          )}

          {/* Actual Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Full Name & Title
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., Dr. Kwame Mensah"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                Hospital Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@stjudehealth.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Assigned Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="facility_head">Facility Head (CMO / CEO)</option>
                    <option value="hr_director">HR Director</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="dept_head">Department Head (HOD)</option>
                    <option value="unit_head">Unit Head (HOU)</option>
                    <option value="doctor">Doctor / Physician</option>
                    <option value="nurse">Nurse / Staff Member</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Cardiology & Intensive Care">Cardiology & ICU</option>
                    <option value="Intensive Care Unit (ICU)">Intensive Care Unit</option>
                    <option value="Emergency & Trauma">Emergency & Trauma</option>
                    <option value="Surgical Services & OT">Surgical Services</option>
                    <option value="Human Resources & Workforce">Human Resources</option>
                    <option value="Pediatrics & Child Health">Pediatrics</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Account Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setSuccessMsg('Password reset instructions sent to your hospital inbox.')}
                    className="text-[11px] font-bold text-emerald-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-10 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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

            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-emerald-600 focus:ring-0"
                  />
                  <span>Remember session on this device</span>
                </label>

                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                  <span>Need help? Contact HR</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-2xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
              }`}
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {mode === 'login' ? 'Authenticate & Enter Dashboard' : 'Create Staff Portal Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  Don't have a staff portal account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    onClick={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="font-bold text-indigo-400 hover:underline"
                  >
                    Sign in to your account
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
