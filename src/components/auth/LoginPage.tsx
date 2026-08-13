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
import { PjpiimcLogo } from '../common/PjpiimcLogo';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, signup, systemCustomization, darkMode, setDarkMode } = useHrms();

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

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Google Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo accounts quick-login list
  const primaryLeadershipAccounts = [
    {
      name: 'Rev. Fr. Mike (Hospital Admin - Office)',
      email: 'rev.fr.mike@pjpiimc.org',
      role: 'facility_head' as UserRole,
      roleLabel: '1. Hospital Administrator (Office)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
    {
      name: 'Rev. Fr. Mike (Staff - Employee Portal)',
      email: 'rev.fr.mike.staff@pjpiimc.org',
      role: 'doctor' as UserRole,
      roleLabel: '2. Employee (Staff Portal)',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      name: 'Miss Vero (HR Director - Office)',
      email: 'miss.vero@pjpiimc.org',
      role: 'hr_director' as UserRole,
      roleLabel: '1. HR Administrator (Office)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
    {
      name: 'Miss Vero (Staff - Employee Portal)',
      email: 'miss.vero.staff@pjpiimc.org',
      role: 'nurse' as UserRole,
      roleLabel: '2. Employee (Staff Portal)',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      name: 'Mr. Frimpong (HR Manager - Office)',
      email: 'mr.frimpong@pjpiimc.org',
      role: 'hr_manager' as UserRole,
      roleLabel: '1. HR Administrator (Office)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    {
      name: 'Mr. Frimpong (Staff - Employee Portal)',
      email: 'mr.frimpong.staff@pjpiimc.org',
      role: 'nurse' as UserRole,
      roleLabel: '2. Employee (Staff Portal)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      name: 'Miss Lumor',
      email: 'miss.lumor@pjpiimc.org',
      role: 'dept_head' as UserRole,
      roleLabel: 'Nurse Manager (Nursing Directorate)',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    },
    {
      name: 'Miss Emelia',
      email: 'miss.emelia@pjpiimc.org',
      role: 'unit_head' as UserRole,
      roleLabel: 'Nurse Manager (ICU & Wards)',
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
      badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    },
  ];

  const enrolledStaffAccounts = [
    { name: 'Dr. Kwame Mensah', email: 'kwame.mensah@pjpiimc.org', role: 'doctor' as UserRole, roleLabel: 'Senior Consultant', avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    { name: 'Sister Rita Appiah', email: 'rita.appiah@pjpiimc.org', role: 'nurse' as UserRole, roleLabel: 'Emergency Nurse', avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
    { name: 'Mr. Joseph Osei', email: 'joseph.osei@pjpiimc.org', role: 'pharmacist' as UserRole, roleLabel: 'Chief Pharmacist', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    { name: 'Dr. Grace Lawson', email: 'grace.lawson@pjpiimc.org', role: 'doctor' as UserRole, roleLabel: 'Pediatric Specialist', avatar: 'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    { name: 'Mr. Kofi Poku', email: 'kofi.poku@pjpiimc.org', role: 'lab_tech' as UserRole, roleLabel: 'Lab Scientist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    { name: 'Miss Abena Serwaa', email: 'abena.serwaa@pjpiimc.org', role: 'radiologist' as UserRole, roleLabel: 'Radiographer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
    { name: 'Mr. Samuel Gyasi', email: 'samuel.gyasi@pjpiimc.org', role: 'biomedical_engineer' as UserRole, roleLabel: 'Biomedical Lead', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
    { name: 'Mrs. Perpetual Addo', email: 'perpetual.addo@pjpiimc.org', role: 'accountant' as UserRole, roleLabel: 'Payroll Officer', avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    { name: 'Mr. Emmanuel Tetteh', email: 'emmanuel.tetteh@pjpiimc.org', role: 'receptionist' as UserRole, roleLabel: 'Intake Officer', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/30' },
    { name: 'Sister Mercy Boateng', email: 'mercy.boateng@pjpiimc.org', role: 'nurse' as UserRole, roleLabel: 'Theatre Nurse', avatar: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30' },
    { name: 'Dr. Daniel Kwarteng', email: 'daniel.kwarteng@pjpiimc.org', role: 'doctor' as UserRole, roleLabel: 'OPD Doctor', avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
    { name: 'Miss Akosua Dankwa', email: 'akosua.dankwa@pjpiimc.org', role: 'quality_officer' as UserRole, roleLabel: 'Quality Lead', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-green-500/10 text-green-400 border-green-500/30' },
    { name: 'Mr. Benjamin Koomson', email: 'benjamin.koomson@pjpiimc.org', role: 'physiotherapist' as UserRole, roleLabel: 'Physiotherapist', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
    { name: 'Miss Patricia Owusu', email: 'patricia.owusu@pjpiimc.org', role: 'nurse' as UserRole, roleLabel: 'Infection Control', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30' },
    { name: 'Mr. Charles Acheampong', email: 'charles.acheampong@pjpiimc.org', role: 'operations_officer' as UserRole, roleLabel: 'Transport Lead', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  ];

  const [activeDemoTab, setActiveDemoTab] = useState<'leadership' | 'staff'>('leadership');

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

      {/* Official Coat of Arms Watermark Backdrop */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.07] dark:opacity-[0.11] scale-125 lg:scale-150 transition-all">
        <PjpiimcLogo size="hero" className="w-[600px] h-[600px] filter drop-shadow-[0_0_50px_rgba(16,185,129,0.3)]" />
      </div>

      {/* Main Glass Card Container */}
      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/85 shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Hospital Branding & Highlights (5 cols on lg) */}
        <div className="lg:col-span-5 relative flex flex-col justify-between bg-gradient-to-br from-emerald-950/90 via-slate-900 to-indigo-950/90 p-8 border-b lg:border-b-0 lg:border-r border-slate-800 overflow-hidden">
          {/* Subtle Coat of Arms Accent in Left Panel */}
          <div className="absolute -right-12 -bottom-12 opacity-15 pointer-events-none">
            <PjpiimcLogo size="2xl" />
          </div>

          <div className="space-y-6 relative z-10">
            {/* Header / Official Crest Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-950/80 rounded-2xl border border-emerald-500/30 shadow-xl shrink-0">
                <PjpiimcLogo size="lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  PJPIIMC STAFF PORTAL
                </h1>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400 block">
                  Pope John Paul II Medical Centre - Jamasi
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4 shrink-0" /> Enterprise Hospital HR Portal
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
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  HR Invitation Only
                </span>
              </div>

              {/* Sub-tabs for Leadership vs 15 Enrolled Staff */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('leadership')}
                  className={`flex-1 py-1.5 rounded-lg transition text-center ${
                    activeDemoTab === 'leadership'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Key Leadership (5)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDemoTab('staff')}
                  className={`flex-1 py-1.5 rounded-lg transition text-center ${
                    activeDemoTab === 'staff'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  15 Enrolled Staff
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {(activeDemoTab === 'leadership' ? primaryLeadershipAccounts : enrolledStaffAccounts).map((acc) => (
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
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6 relative">
          
          {/* Form Mode Switcher (Sign In vs Sign Up) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <PjpiimcLogo size="md" className="shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {mode === 'login' ? 'Sign In to Portal' : 'Create Staff Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {mode === 'login'
                    ? 'Pope John Paul II Medical Centre Staff Portal'
                    : 'Register a new clinical or administrative employee login account.'}
                </p>
              </div>
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
                  placeholder="staff.id@pjpiimc.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-300">
                  Target Portal View
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRole('nurse')}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      !['hr_director', 'hr_manager', 'facility_head', 'super_admin'].includes(role)
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <User className="h-3.5 w-3.5 mb-1 text-emerald-400" />
                    <span className="text-[10px] leading-tight">1. Staff Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('hr_director')}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      ['hr_director', 'hr_manager'].includes(role)
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="h-3.5 w-3.5 mb-1 text-indigo-400" />
                    <span className="text-[10px] leading-tight">2. HR Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('facility_head')}
                    className={`p-2 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                      role === 'facility_head'
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ShieldCheck className="h-3.5 w-3.5 mb-1 text-amber-400" />
                    <span className="text-[10px] leading-tight">3. Hosp. Admin</span>
                  </button>
                </div>
              </div>
            )}

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
              {mode === 'login' && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    <strong>New Staff Policy:</strong> Logging in with a default password or Staff ID requires mandatory password change on entry.
                  </span>
                </div>
              )}
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

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
              <span className="bg-slate-900 px-3">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs font-bold text-slate-200 transition flex items-center justify-center gap-2.5 shadow-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google Workspace</span>
          </button>

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
