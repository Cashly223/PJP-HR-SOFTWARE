import React, { useState, useMemo } from 'react';
import {
  Clock,
  Fingerprint,
  Camera,
  MapPin,
  QrCode,
  CreditCard,
  Check,
  AlertCircle,
  BarChart3,
  ListFilter,
  ShieldCheck,
  Building2,
  Lock,
  UserCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { AttendanceRecord } from '../../types/hrms';
import { AttendanceReport } from './AttendanceReport';
import { MobileGeofenceFacialClockIn } from './MobileGeofenceFacialClockIn';

export const BiometricAttendance: React.FC = () => {
  const {
    attendance,
    employees,
    addClockIn,
    approveAttendance,
    currentUser,
    activeRole,
    selectedHospital,
  } = useHrms();

  const [activeSubTab, setActiveSubTab] = useState<'mobile_geofence' | 'report' | 'terminal'>('mobile_geofence');

  // Check if current user is a global hospital executive / HR admin
  const isGlobalAdmin = useMemo(() => {
    return ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);
  }, [activeRole]);

  // Determine current logged-in employee & their assigned department
  const currentEmp = useMemo(() => {
    return employees.find(
      (e) =>
        e.id === currentUser?.id ||
        (currentUser?.email && e.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.name && `${e.firstName} ${e.lastName}`.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
    ) || employees[0];
  }, [employees, currentUser]);

  const userDepartment = useMemo(() => {
    return (
      currentUser?.department ||
      currentEmp?.department ||
      (activeRole === 'dept_head' || activeRole === 'unit_head' || activeRole === 'doctor' || activeRole === 'nurse'
        ? currentEmp?.department || 'Intensive Care Unit (ICU)'
        : 'General Healthcare')
    );
  }, [currentUser, currentEmp, activeRole]);

  // Department filter for global admins (locked to userDepartment for standard staff / dept heads)
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>(() => {
    return isGlobalAdmin ? 'All' : userDepartment;
  });

  // Keep filter aligned if role switches
  React.useEffect(() => {
    if (!isGlobalAdmin) {
      setSelectedDeptFilter(userDepartment);
    }
  }, [isGlobalAdmin, userDepartment]);

  // List of all unique departments for global admin dropdown
  const allDepartments = useMemo(() => {
    return ['All', ...Array.from(new Set((employees || []).filter(Boolean).map((e) => e.department).filter(Boolean)))];
  }, [employees]);

  // Scoped Employees: Restricted to department for staff/dept heads
  const scopedEmployees = useMemo(() => {
    const safeList = (employees || []).filter(Boolean);
    if (!isGlobalAdmin) {
      return safeList.filter((e) => e.department === userDepartment);
    }
    if (selectedDeptFilter === 'All') return safeList;
    return safeList.filter((e) => e.department === selectedDeptFilter);
  }, [employees, isGlobalAdmin, userDepartment, selectedDeptFilter]);

  // Biometric Terminal Simulator States
  const [selectedMethod, setSelectedMethod] = useState<AttendanceRecord['method']>('Facial_Recognition');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    return currentEmp?.id || scopedEmployees[0]?.id || (employees || [])[0]?.id || '';
  });
  const [clockMsg, setClockMsg] = useState('');

  // Keep selectedEmpId valid when scoped employees change
  React.useEffect(() => {
    if (!scopedEmployees.some((e) => e && e.id === selectedEmpId)) {
      if (scopedEmployees.length > 0) {
        setSelectedEmpId(scopedEmployees[0].id);
      }
    }
  }, [scopedEmployees, selectedEmpId]);

  const handleSimulateClockIn = () => {
    const emp = (employees || []).find((e) => e && e.id === selectedEmpId);
    if (!emp) return;

    // Strict validation: non-global admin cannot clock in for employees outside their department
    if (!isGlobalAdmin && emp.department !== userDepartment) {
      setClockMsg(`❌ Access Denied: You can only record attendance for staff in your department (${userDepartment}).`);
      setTimeout(() => setClockMsg(''), 5000);
      return;
    }

    const terminalLoc = `${emp.department} Biometric Terminal Kiosk`;
    addClockIn(emp.id, selectedMethod, terminalLoc);
    setClockMsg(
      `✓ Verified & Clocked In: ${emp.firstName} ${emp.lastName} (${emp.empCode}) via ${selectedMethod.replace('_', ' ')} at ${terminalLoc}!`
    );
    setTimeout(() => setClockMsg(''), 4500);
  };

  // Filtered raw terminal clock-in entries strictly scoped to the department
  const scopedAttendance = useMemo(() => {
    return (attendance || []).filter((att) => {
      if (!att) return false;
      const emp = (employees || []).find(
        (e) => e && (e.id === att.employeeId || `${e.firstName} ${e.lastName}` === att.employeeName)
      );
      if (!isGlobalAdmin) {
        return emp ? emp.department === userDepartment : true;
      }
      if (selectedDeptFilter === 'All') return true;
      return emp ? emp.department === selectedDeptFilter : true;
    });
  }, [attendance, employees, isGlobalAdmin, userDepartment, selectedDeptFilter]);

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-tab navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              Workforce Attendance & Biometrics
            </h2>
            {!isGlobalAdmin && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <Lock className="h-3 w-3" /> Dept Restricted: {userDepartment}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isGlobalAdmin
              ? 'Hospital-wide biometric terminals, multi-modal verification, and cross-department attendance synchronization.'
              : `Department-restricted biometric clock-in terminals, verified attendance logs, and hours worked reports for ${userDepartment}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/60 p-1.5 rounded-2xl dark:bg-slate-900 border border-slate-300/50 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('mobile_geofence')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl transition shadow-sm ${
              activeSubTab === 'mobile_geofence'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-600/30'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Mobile Geofence & Facial Clock-In</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
              Option B
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('report')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'report'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Attendance Report (Hours Worked)
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition ${
              activeSubTab === 'terminal'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fingerprint className="h-4 w-4" /> Station Kiosk & Raw Logs
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: MOBILE GEOFENCE & FACIAL CLOCK-IN (OPTION B) */}
      {activeSubTab === 'mobile_geofence' && <MobileGeofenceFacialClockIn />}

      {/* Department Scoping Security Banner for other tabs */}
      {activeSubTab !== 'mobile_geofence' && (
        <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          !isGlobalAdmin
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${!isGlobalAdmin ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-800 text-emerald-400'}`}>
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold flex items-center gap-2">
                <span>{isGlobalAdmin ? 'Hospital Global Attendance Console' : 'Department-Scoped Attendance & Biometric Access'}</span>
                {!isGlobalAdmin && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/40">
                    {userDepartment}
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-80 mt-0.5">
                {!isGlobalAdmin
                  ? `In accordance with hospital policy, your attendance logs, terminal kiosk, and biometric timesheets are strictly confined to the ${userDepartment} team (${scopedEmployees.length} personnel).`
                  : `Executive / HR Authority: Accessing workforce attendance for ${selectedHospital.name}. You may filter by specific departments below.`}
              </p>
            </div>
          </div>

          {isGlobalAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-bold text-slate-400">Filter Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white font-bold focus:border-emerald-500 focus:outline-none"
              >
                {allDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'All' ? 'All Hospital Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 1: ATTENDANCE REPORT (HR / DEPT / ADMIN) */}
      {activeSubTab === 'report' && <AttendanceReport />}

      {/* SUB-TAB 2: BIOMETRIC TERMINAL & DAILY LOGS */}
      {activeSubTab === 'terminal' && (
        <div className="space-y-6">
          {/* Clock-in Terminal Simulator Box */}
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-6 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Live Department Biometric Terminal Kiosk
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Terminal Location: <strong className="text-slate-200">{!isGlobalAdmin ? `${userDepartment} Biometric Station` : `${selectedDeptFilter === 'All' ? 'Central Hospital' : selectedDeptFilter} Biometric Station`}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Terminal Online & Geofenced
                </span>
              </div>
            </div>

            {clockMsg && (
              <div className={`mb-4 rounded-2xl p-3.5 text-xs font-bold border ${
                clockMsg.startsWith('❌')
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              }`}>
                {clockMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Select Staff Member ({scopedEmployees.length} Available)
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  {scopedEmployees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} — {e.empCode} ({e.jobTitle})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Scoped strictly to {isGlobalAdmin && selectedDeptFilter !== 'All' ? selectedDeptFilter : userDepartment}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Biometric Verification Channel</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="Facial_Recognition">AI Facial Recognition Scanner (3D Depth)</option>
                  <option value="Biometric_Fingerprint">Optical Biometric Fingerprint Sensor</option>
                  <option value="RFID_Badge">NFC / Smart RFID Staff Access Badge</option>
                  <option value="QR_Mobile">Mobile Staff Portal QR Code</option>
                  <option value="GPS_Geofence">Hospital GPS Geofence Location</option>
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Encrypted SHA-256 Biometric Token
                </span>
              </div>

              <div className="flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleSimulateClockIn}
                  disabled={scopedEmployees.length === 0}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-lg hover:bg-emerald-500 transition active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Fingerprint className="h-4 w-4" />
                  Simulate Department Clock-In
                </button>
                <span className="text-[10px] text-slate-400 text-center mt-1">
                  Instant real-time shift verification
                </span>
              </div>
            </div>
          </div>

          {/* Attendance Logs Table */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-black text-xs text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Department Biometric Clock-In Log Records
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing {scopedAttendance.length} attendance records for {!isGlobalAdmin ? userDepartment : selectedDeptFilter}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                  {scopedAttendance.length} Records Found
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Staff Member</th>
                    <th className="px-5 py-3.5">Department</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Clock In</th>
                    <th className="px-5 py-3.5">Clock Out</th>
                    <th className="px-5 py-3.5">Verification Mode</th>
                    <th className="px-5 py-3.5">Terminal / Kiosk</th>
                    <th className="px-5 py-3.5">Overtime</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {scopedAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-5 py-10 text-center text-slate-400">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2 text-slate-500 opacity-60" />
                        <p className="font-bold text-xs">No biometric clock-in records found for this department.</p>
                        <p className="text-[11px] text-slate-500 mt-1">Use the Terminal Kiosk above to record duty clock-ins.</p>
                      </td>
                    </tr>
                  ) : (
                    scopedAttendance.map((att) => {
                      const emp = employees.find(
                        (e) => e.id === att.employeeId || `${e.firstName} ${e.lastName}` === att.employeeName
                      );
                      const deptName = emp?.department || userDepartment;

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                          <td className="px-5 py-4 font-bold">
                            <div className="text-slate-900 dark:text-white">{att.employeeName}</div>
                            {emp && <span className="text-[10px] font-mono text-slate-400">{emp.empCode} • {emp.jobTitle}</span>}
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              {deptName}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{att.date}</td>
                          <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">{att.clockIn}</td>
                          <td className="px-5 py-4 text-slate-500 font-medium">{att.clockOut}</td>
                          <td className="px-5 py-4 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                            {att.method.replace('_', ' ')}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-[11px] max-w-[180px] truncate" title={att.location}>
                            {att.location || `${deptName} Terminal`}
                          </td>
                          <td className="px-5 py-4 font-black text-amber-600 dark:text-amber-400">
                            {att.overtimeHours > 0 ? `${att.overtimeHours} hrs` : '0.0 hrs'}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
                                att.approvalStatus === 'Approved' || att.approvalStatus === 'Auto-Approved'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {att.approvalStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            {att.approvalStatus === 'Pending Approval' && (
                              <button
                                onClick={() => approveAttendance(att.id)}
                                className="rounded-xl bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500 shadow transition"
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
