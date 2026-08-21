import React, { useState } from 'react';
import {
  Smartphone,
  Clock,
  Calendar,
  FileText,
  Award,
  MapPin,
  X,
  Check,
  ShieldCheck,
  User,
  Bell,
  Send,
  Plus,
  RefreshCw,
  QrCode,
  AlertTriangle,
  ChevronRight,
  Maximize2,
  Minimize2,
  PhoneCall,
  CheckCircle2,
  DollarSign,
  Download,
  Building2,
  MessageSquare,
  Store,
  Sparkles,
  Camera,
  Eye,
  Compass,
} from 'lucide-react';
import { useHrms } from '../context/HrmsContext';
import { PlayStoreDeployModal } from './mobile/PlayStoreDeployModal';
import { MobileGeofenceFacialClockIn } from './attendance/MobileGeofenceFacialClockIn';

interface MobileAppSimulatorProps {
  onClose: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({ onClose }) => {
  const {
    employees,
    currentUser,
    formatCurrency,
    addClockIn,
    addLeaveRequest,
    leaves,
    rosters,
    attendance,
    notifications,
    selectedHospital
  } = useHrms();

  // Find employee corresponding to current user session or default to staff member
  const safeEmployees = (employees || []).filter(Boolean);
  const loggedEmp = safeEmployees.find(
    (e) => e && (e.email?.toLowerCase() === currentUser?.email?.toLowerCase() || e.id === currentUser?.id)
  ) || safeEmployees[1] || safeEmployees[0];

  const empRosters = (rosters || []).filter((r) => r && (r.employeeId === loggedEmp?.id || r.employeeName === `${loggedEmp?.firstName} ${loggedEmp?.lastName}`));
  const empLeaves = (leaves || []).filter((l) => l && (l.employeeId === loggedEmp?.id || l.employeeName === `${loggedEmp?.firstName} ${loggedEmp?.lastName}`));
  const empAttendance = (attendance || []).filter((a) => a && a.employeeId === loggedEmp?.id);

  // States
  const [activeScreen, setActiveScreen] = useState<'home' | 'attendance' | 'roster' | 'payslip' | 'leave' | 'profile' | 'notices'>('home');
  const [isExpandedCanvas, setIsExpandedCanvas] = useState(false);
  const [selectedStation, setSelectedStation] = useState('ICU Main Station');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockMsg, setClockMsg] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);
  const [showFacialClockInModal, setShowFacialClockInModal] = useState(false);

  // Leave Form State
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveType, setLeaveType] = useState<'Annual' | 'Casual' | 'Sick' | 'Study'>('Annual');
  const [leaveStart, setLeaveStart] = useState('2026-09-01');
  const [leaveEnd, setLeaveEnd] = useState('2026-09-05');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveFormMsg, setLeaveFormMsg] = useState('');

  // Shift Swap State
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapReason, setSwapReason] = useState('');

  const handleMobileClockIn = () => {
    addClockIn(loggedEmp.id, 'GPS_Geofence');
    setClockedIn(true);
    setClockMsg(`Clocked In at ${selectedStation} via Mobile GPS!`);
    setTimeout(() => setClockMsg(''), 4000);
  };

  const handleMobileClockOut = () => {
    setClockedIn(false);
    setClockMsg(`Clocked Out from ${selectedStation}!`);
    setTimeout(() => setClockMsg(''), 4000);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;
    addLeaveRequest({
      employeeId: loggedEmp.id,
      employeeName: `${loggedEmp.firstName} ${loggedEmp.lastName}`,
      department: loggedEmp.department,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: 'Pending',
      totalDays: 5
    });
    setLeaveFormMsg('Leave request submitted to HR via Mobile Portal!');
    setTimeout(() => {
      setLeaveFormMsg('');
      setShowLeaveForm(false);
      setLeaveReason('');
      setActiveScreen('leave');
    }, 1500);
  };

  const renderScreenContent = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <div className="space-y-3">
            {/* Clock-In Widget */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3.5 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>Station Attendance</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  GPS Active
                </span>
              </div>

              <div className="mb-3">
                <label className="text-[10px] text-slate-400 block mb-1 font-medium">Select Hospital Duty Station:</label>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ICU Main Station">ICU Main Ward</option>
                  <option value="Emergency Department">Emergency Room (ER)</option>
                  <option value="Surgical Theater 2">Surgical Operating Theater 2</option>
                  <option value="Pediatrics Ward B">Pediatrics Ward B</option>
                  <option value="Outpatient Clinic">Outpatient Clinic (OPD)</option>
                  <option value="Central Pharmacy">Central Pharmacy Station</option>
                </select>
              </div>

              {clockMsg && (
                <div className="mb-2 p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{clockMsg}</span>
                </div>
              )}

              {/* Option B: Mobile Geofence & Facial Clock-In Flagship Action */}
              <button
                onClick={() => setShowFacialClockInModal(true)}
                className="w-full mb-2.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-between group active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-white/20 text-white">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Face & Geofence Clock-In</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-400 text-emerald-950 font-extrabold">
                        Option B
                      </span>
                    </div>
                    <p className="text-[9px] text-emerald-100 font-normal">Selfie & GPS Radar Verification</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-emerald-200 group-hover:translate-x-0.5 transition" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleMobileClockIn}
                  disabled={clockedIn}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                    clockedIn
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 active:scale-95'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{clockedIn ? 'Clocked In' : 'Quick GPS'}</span>
                </button>

                <button
                  onClick={handleMobileClockOut}
                  disabled={!clockedIn}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    !clockedIn
                      ? 'border-slate-800 bg-slate-900 text-slate-600 cursor-not-allowed'
                      : 'border-rose-500/40 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 active:scale-95'
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clock Out</span>
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <QrCode className="h-3 w-3" /> Station QR
                </button>
                <span className="text-emerald-400 font-mono font-semibold">Geofence: 150m OK</span>
              </div>
            </div>

            {/* Today's Shift Quick Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-800/60 p-3 text-xs">
              <div className="flex items-center justify-between text-blue-300 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" /> Today's Shift
                </span>
                <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-400/30">
                  Morning Shift
                </span>
              </div>
              <p className="text-slate-200 font-medium text-[11px]">
                07:00 AM – 03:00 PM | Ward: {loggedEmp.department || 'ICU Ward 2'}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Supervisor: Dr. Sarah Jenkins</p>
            </div>

            {/* Medical Credential Warning */}
            <div className="rounded-2xl bg-amber-950/40 border border-amber-800/60 p-3 text-xs">
              <div className="flex items-center justify-between text-amber-300 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-400" /> Clinical License Alert
                </span>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded font-semibold text-amber-300">
                  19 Days
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90">
                Medical & Dental Council License expires soon. Tap Profile to upload renewal certificate.
              </p>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveScreen('roster')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900/90 p-3 text-center border border-slate-800 hover:border-emerald-500 transition"
              >
                <Calendar className="h-5 w-5 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-200">Duty Roster</span>
                <span className="text-[9px] text-slate-400">View Shift Schedule</span>
              </button>

              <button
                onClick={() => setActiveScreen('payslip')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900/90 p-3 text-center border border-slate-800 hover:border-emerald-500 transition"
              >
                <FileText className="h-5 w-5 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-200">My Payslip</span>
                <span className="text-[9px] text-slate-400">Earnings & Deductions</span>
              </button>

              <button
                onClick={() => setActiveScreen('leave')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900/90 p-3 text-center border border-slate-800 hover:border-emerald-500 transition"
              >
                <Building2 className="h-5 w-5 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-200">Leave Portal</span>
                <span className="text-[9px] text-slate-400">Apply for Time Off</span>
              </button>

              <button
                onClick={() => setActiveScreen('profile')}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900/90 p-3 text-center border border-slate-800 hover:border-emerald-500 transition"
              >
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-[11px] font-bold text-slate-200">Staff Digital ID</span>
                <span className="text-[9px] text-slate-400">Digital Badge & QR</span>
              </button>
            </div>

            {/* Play Store & Direct Install Action Card */}
            <button
              onClick={() => setShowPlayStoreModal(true)}
              className="w-full p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/80 to-slate-900 border border-emerald-500/40 hover:border-emerald-400 transition text-left flex items-center justify-between group shadow"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 transition">
                  <Store className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-100 text-[11px]">
                    <span>Publish to Play Store / Install</span>
                    <Sparkles className="h-3 w-3 text-amber-400" />
                  </div>
                  <p className="text-[10px] text-slate-400">Get APK / AAB package or install directly on phone</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        );

      case 'roster':
        return (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-400 text-sm">Monthly Shift Schedule</h4>
              <button
                onClick={() => setShowSwapModal(true)}
                className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-emerald-600/30"
              >
                Request Swap
              </button>
            </div>

            {empRosters.length === 0 ? (
              <div className="p-4 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-[11px]">
                No official shifts published for current week. Standard morning shift applies.
              </div>
            ) : (
              empRosters.map((r) => (
                <div key={r.id} className="rounded-2xl bg-slate-900 p-3 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-100">{r.shiftType} Shift</span>
                    <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                      {r.date}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Department: <span className="text-white font-medium">{r.ward || loggedEmp.department}</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Hours: {r.startTime} – {r.endTime}</p>
                </div>
              ))
            )}

            {/* Upcoming Duty Roster Summary */}
            <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-2">
              <span className="font-bold text-slate-200 text-[11px] block">Weekly Roster Plan</span>
              <div className="grid grid-cols-7 gap-1 text-center">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded-lg border text-[10px] font-bold ${
                      idx < 5
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    <p>{day}</p>
                    <p className="text-[9px] mt-0.5">{idx < 5 ? 'MOR' : 'OFF'}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-400 text-sm">Clocking Logs & Geofence</h4>
              <button
                onClick={() => setShowFacialClockInModal(true)}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] flex items-center gap-1 shadow"
              >
                <Camera className="h-3 w-3" /> Live Scan
              </button>
            </div>

            {/* Launch Banner */}
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-white text-[11px] flex items-center gap-1.5">
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  Mobile Geofence & Facial Clock
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  Option B Active
                </span>
              </div>
              <p className="text-[10px] text-slate-300">
                Hospital GPS geofence radar & 3D facial liveness biometric authentication.
              </p>
              <button
                onClick={() => setShowFacialClockInModal(true)}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow transition flex items-center justify-center gap-1.5"
              >
                <Camera className="h-3.5 w-3.5" /> Launch Geofenced Face Clock-In
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Recent Duty Records ({empAttendance.length})
              </span>
              {empAttendance.length === 0 ? (
                <div className="p-3 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-[11px]">
                  No clocking logs recorded today.
                </div>
              ) : (
                empAttendance.slice(0, 5).map((a) => (
                  <div key={a.id} className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {a.snapshotUrl ? (
                        <img
                          src={a.snapshotUrl}
                          alt="Face Selfie"
                          className="h-9 w-9 rounded-xl object-cover border border-emerald-500/60 shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                          <Camera className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-200 text-[11px]">
                          {a.clockIn} – {a.clockOut}
                        </p>
                        <p className="text-[9px] text-slate-400 truncate max-w-[150px]" title={a.location}>
                          {a.location || loggedEmp.department}
                        </p>
                        {a.facialConfidence && (
                          <span className="text-[9px] font-mono text-emerald-400">
                            Face: {a.facialConfidence}% match
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800 shrink-0">
                      {a.geofenceVerified ? 'GPS & Face OK' : 'Verified'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'payslip':
        return (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-400 text-sm">Official Monthly Payslip</h4>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-bold">July 2026</span>
            </div>

            <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800 space-y-2.5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div>
                  <p className="font-bold text-slate-100">{loggedEmp.firstName} {loggedEmp.lastName}</p>
                  <p className="text-[10px] text-slate-400">{loggedEmp.empCode} | {loggedEmp.jobTitle}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">PAID</span>
                </div>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>Basic Monthly Salary</span>
                  <span className="font-semibold">{formatCurrency(loggedEmp.salary || 6200)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Night Duty & On-Call Allowance</span>
                  <span className="font-semibold">{formatCurrency(850)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Clinical Hazard Allowance</span>
                  <span className="font-semibold">{formatCurrency(600)}</span>
                </div>
                <div className="flex justify-between text-rose-400 text-[10px] pt-1 border-t border-slate-800">
                  <span>Deductions (SSNIT & PAYE Tax)</span>
                  <span>- {formatCurrency(1170)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="font-bold text-slate-200">Net Take-Home Pay:</span>
                <span className="font-black text-sm text-emerald-400">{formatCurrency((loggedEmp.salary || 6200) + 280)}</span>
              </div>

              <button
                onClick={() => alert(`Downloading official PDF Payslip for ${loggedEmp.firstName} ${loggedEmp.lastName}...`)}
                className="w-full py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Download className="h-3.5 w-3.5" /> Download Digital Payslip (PDF)
              </button>
            </div>
          </div>
        );

      case 'leave':
        return (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-emerald-400 text-sm">Leave & Time Off</h4>
              <button
                onClick={() => setShowLeaveForm(!showLeaveForm)}
                className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold hover:bg-emerald-500 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> New Request
              </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Annual Leave</span>
                <span className="text-lg font-black text-emerald-400">21 Days</span>
                <span className="text-[9px] text-slate-500 block">Remaining for 2026</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">Sick Leave</span>
                <span className="text-lg font-black text-blue-400">10 Days</span>
                <span className="text-[9px] text-slate-500 block">Full Salary Coverage</span>
              </div>
            </div>

            {/* Submit Leave Form Overlay / Modal */}
            {showLeaveForm && (
              <form onSubmit={handleLeaveSubmit} className="p-3 bg-slate-900 rounded-2xl border border-emerald-500/40 space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                  <span className="font-bold text-emerald-400 text-xs">Apply for Leave</span>
                  <button type="button" onClick={() => setShowLeaveForm(false)} className="text-slate-400 hover:text-white">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {leaveFormMsg && (
                  <p className="text-[10px] font-bold text-emerald-400 p-1.5 rounded bg-emerald-950/80 border border-emerald-600">
                    {leaveFormMsg}
                  </p>
                )}

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5 font-medium">Leave Category:</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200"
                  >
                    <option value="Annual">Annual Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Study">Study Leave</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Start Date:</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">End Date:</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Reason / Justification:</label>
                  <textarea
                    rows={2}
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Enter reason for time off request..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                >
                  Submit Application
                </button>
              </form>
            )}

            {/* Recent Leave Requests List */}
            <div className="space-y-1.5">
              <span className="font-bold text-slate-300 text-[11px] block">Application Status</span>
              {empLeaves.length === 0 ? (
                <div className="p-3 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400 text-[10px]">
                  No leave applications recorded in mobile portal.
                </div>
              ) : (
                empLeaves.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-200 text-[11px]">{l.type} Leave ({l.totalDays} days)</p>
                      <p className="text-[10px] text-slate-400">{l.startDate} to {l.endDate}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.status === 'Approved'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : l.status === 'Rejected'
                          ? 'bg-rose-900/60 text-rose-300'
                          : 'bg-amber-900/60 text-amber-300'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-emerald-400 text-sm">Staff Digital Badge & Credentials</h4>

            {/* Digital ID Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-500/40 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <div>
                    <h5 className="font-bold text-slate-100 text-xs">{selectedHospital.name}</h5>
                    <p className="text-[9px] text-emerald-400 uppercase font-semibold">Official Staff Identity</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded">
                  {loggedEmp.empCode}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={loggedEmp.photo || 'https://images.unsplash.com/photo-1594824813566-78a0d4c1d763?w=150&auto=format&fit=crop&q=80'}
                  alt={loggedEmp.firstName}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-emerald-500/60 shadow"
                />
                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-100 text-sm">{loggedEmp.firstName} {loggedEmp.lastName}</h4>
                  <p className="text-[11px] text-emerald-300 font-semibold">{loggedEmp.jobTitle}</p>
                  <p className="text-[10px] text-slate-400">Dept: {loggedEmp.department}</p>
                  <p className="text-[10px] text-slate-400">Email: {loggedEmp.email}</p>
                </div>
              </div>

              {/* QR Code Graphic */}
              <div className="p-2 bg-white rounded-xl flex items-center justify-center gap-3 text-slate-900">
                <QrCode className="h-10 w-10 text-slate-900" />
                <div className="text-[9px] font-bold leading-tight">
                  <p>SCAN FOR HOSPITAL ACCESS</p>
                  <p className="text-slate-500">AuraHR Security Token Verified</p>
                </div>
              </div>
            </div>

            {/* Professional Registrations */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-200 text-[11px] block">Council Registrations</span>
              <div className="flex justify-between items-center text-[10px] text-slate-300 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <p className="font-semibold text-slate-200">Medical & Dental Council (MDC)</p>
                  <p className="text-slate-500">Reg No: MDC/REG/2024/0991</p>
                </div>
                <span className="text-amber-400 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded">Expiring</span>
              </div>
            </div>
          </div>
        );

      case 'notices':
        return (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-emerald-400 text-sm">Hospital Bulletins & Alerts</h4>
            <div className="space-y-2">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{n.title}</span>
                    <span className="text-[9px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-normal">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md transition-all">
      <div className="relative flex flex-col items-center max-w-full">
        {/* Top Control Bar */}
        <div className="w-full max-w-md flex items-center justify-between mb-2 text-xs text-white">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Smartphone className="h-4 w-4" />
            <span>AuraHR Mobile Staff Portal Simulator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPlayStoreModal(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white px-2.5 py-1 text-[11px] font-bold transition border border-emerald-500/40"
              title="Google Play Store & Mobile Packaging Guide"
            >
              <Store className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Play Store</span>
            </button>

            <button
              onClick={() => setIsExpandedCanvas(!isExpandedCanvas)}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition border border-slate-700"
              title="Toggle Expanded View"
            >
              {isExpandedCanvas ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span>{isExpandedCanvas ? 'Normal Size' : 'Expand'}</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1 rounded-lg bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white px-2.5 py-1 text-[11px] font-bold transition border border-rose-500/40"
            >
              <X className="h-3.5 w-3.5" /> Exit
            </button>
          </div>
        </div>

        {/* Smartphone Container Shell */}
        <div
          className={`transition-all duration-300 rounded-[44px] border-[12px] border-slate-900 bg-slate-950 p-3 shadow-2xl overflow-hidden flex flex-col justify-between text-slate-100 ${
            isExpandedCanvas ? 'w-[420px] h-[780px]' : 'w-[360px] h-[710px]'
          }`}
        >
          {/* Top Speaker Notch & Battery Bar */}
          <div className="flex items-center justify-between px-4 pt-1 pb-2 shrink-0">
            <span className="text-[10px] font-bold text-slate-300">10:00 AM</span>
            <div className="h-3.5 w-24 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
              <div className="h-1.5 w-10 rounded-full bg-slate-700"></div>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400">
              <span>5G</span>
              <span className="text-emerald-400 font-bold">100%</span>
            </div>
          </div>

          {/* App Header Bar */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-3 rounded-2xl text-white shadow shrink-0 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={loggedEmp.photo || 'https://images.unsplash.com/photo-1594824813566-78a0d4c1d763?w=150&auto=format&fit=crop&q=80'}
                alt={loggedEmp.firstName}
                className="h-10 w-10 rounded-full object-cover border-2 border-white/80 shadow"
              />
              <div>
                <h4 className="text-xs font-black leading-snug">{loggedEmp.firstName} {loggedEmp.lastName}</h4>
                <p className="text-[10px] text-emerald-200 font-medium truncate max-w-[140px]">{loggedEmp.jobTitle}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="rounded-lg bg-emerald-950/80 border border-emerald-400/40 px-2 py-0.5 text-[9px] font-black tracking-wider text-emerald-300 block">
                {loggedEmp.empCode}
              </span>
              <span className="text-[9px] text-emerald-200 block mt-0.5 font-semibold">Staff Portal</span>
            </div>
          </div>

          {/* Main Scrollable Screen Body */}
          <div className="flex-1 overflow-y-auto py-3 px-1 my-1 custom-scrollbar space-y-3">
            {renderScreenContent()}
          </div>

          {/* Navigation Bar at Bottom */}
          <div className="flex justify-around border-t border-slate-800/90 pt-2 pb-1 bg-slate-950 shrink-0">
            <button
              onClick={() => setActiveScreen('home')}
              className={`text-[10px] flex flex-col items-center transition ${
                activeScreen === 'home' ? 'text-emerald-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => setActiveScreen('roster')}
              className={`text-[10px] flex flex-col items-center transition ${
                activeScreen === 'roster' ? 'text-emerald-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Shifts</span>
            </button>

            <button
              onClick={() => setActiveScreen('attendance')}
              className={`text-[10px] flex flex-col items-center transition ${
                activeScreen === 'attendance' ? 'text-emerald-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Attendance</span>
            </button>

            <button
              onClick={() => setActiveScreen('payslip')}
              className={`text-[10px] flex flex-col items-center transition ${
                activeScreen === 'payslip' ? 'text-emerald-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Payslip</span>
            </button>

            <button
              onClick={() => setActiveScreen('profile')}
              className={`text-[10px] flex flex-col items-center transition ${
                activeScreen === 'profile' ? 'text-emerald-400 font-extrabold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>ID Badge</span>
            </button>
          </div>

          {/* Home Touch Bar Pill */}
          <div className="w-28 h-1 bg-slate-800 rounded-full mx-auto mt-1 shrink-0"></div>
        </div>
      </div>

      {/* QR Station Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 w-80 text-center text-slate-100 space-y-3">
            <h4 className="font-bold text-sm text-emerald-400">Hospital Station QR Check-In</h4>
            <div className="p-4 bg-white rounded-2xl inline-block border-2 border-emerald-500">
              <QrCode className="h-28 w-28 text-slate-950" />
            </div>
            <p className="text-xs text-slate-300">Point your smartphone camera at the physical QR terminal located at {selectedStation}.</p>
            <button
              onClick={() => {
                handleMobileClockIn();
                setShowQrModal(false);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
            >
              Simulate QR Scan Success
            </button>
            <button
              onClick={() => setShowQrModal(false)}
              className="text-xs text-slate-400 hover:underline block mx-auto pt-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Shift Swap Request Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-80 text-slate-100 space-y-3 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h4 className="font-bold text-emerald-400">Shift Swap Request</h4>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Select Colleague to Swap With:</label>
              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200">
                <option>Nurse Elena Rostova (ICU Morning)</option>
                <option>Dr. Kwame Mensah (Emergency Night)</option>
                <option>Nurse Comfort Osei (Pediatrics Afternoon)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Swap Reason:</label>
              <textarea
                rows={2}
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                placeholder="Brief reason for shift exchange..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-200"
              />
            </div>
            <button
              onClick={() => {
                alert('Shift swap request dispatched to unit supervisor & colleague!');
                setShowSwapModal(false);
                setSwapReason('');
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-white"
            >
              Submit Shift Swap Request
            </button>
          </div>
        </div>
      )}

      {/* Play Store & Mobile Packaging Modal */}
      <PlayStoreDeployModal
        isOpen={showPlayStoreModal}
        onClose={() => setShowPlayStoreModal(false)}
      />

      {/* Option B: Mobile Geofence & Facial Clock-In Full Modal */}
      {showFacialClockInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setShowFacialClockInModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition"
            >
              <X className="h-5 w-5" />
            </button>
            <MobileGeofenceFacialClockIn
              embeddedMode={true}
              onSuccess={() => {
                setClockedIn(true);
                setClockMsg('Facial verification & Geofence record synced to HR!');
                setTimeout(() => setShowFacialClockInModal(false), 2000);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
