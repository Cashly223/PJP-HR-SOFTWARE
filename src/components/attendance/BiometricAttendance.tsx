import React, { useState } from 'react';
import { Clock, Fingerprint, Camera, MapPin, QrCode, CreditCard, Check, AlertCircle, BarChart3, ListFilter } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { AttendanceRecord } from '../../types/hrms';
import { AttendanceReport } from './AttendanceReport';

export const BiometricAttendance: React.FC = () => {
  const { attendance, employees, addClockIn, approveAttendance } = useHrms();
  const [activeSubTab, setActiveSubTab] = useState<'terminal' | 'report'>('report'); // Default to Attendance Report as requested by user

  const [selectedMethod, setSelectedMethod] = useState<AttendanceRecord['method']>('Facial_Recognition');
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [clockMsg, setClockMsg] = useState('');

  const handleSimulateClockIn = () => {
    addClockIn(selectedEmpId, selectedMethod);
    const emp = employees.find((e) => e.id === selectedEmpId);
    setClockMsg(`✓ Successfully clocked in ${emp?.firstName} ${emp?.lastName} via ${selectedMethod.replace('_', ' ')}!`);
    setTimeout(() => setClockMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-tab navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="h-6 w-6 text-emerald-600" />
            Hospital Workforce Attendance Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Biometric clock-in terminals, multi-modal verification, and HR/Admin weekly & monthly hours worked reports.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-200/60 p-1 rounded-xl dark:bg-slate-900 border border-slate-300/50 dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('report')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeSubTab === 'report'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Attendance Report (Hours Worked)
          </button>

          <button
            onClick={() => setActiveSubTab('terminal')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition ${
              activeSubTab === 'terminal'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Fingerprint className="h-4 w-4" /> Biometric Terminal & Daily Logs
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ATTENDANCE REPORT (HR / ADMIN) */}
      {activeSubTab === 'report' && <AttendanceReport />}

      {/* SUB-TAB 2: BIOMETRIC TERMINAL & DAILY LOGS */}
      {activeSubTab === 'terminal' && (
        <div className="space-y-6">
          {/* Clock-in Terminal Simulator Box */}
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <Fingerprint className="h-5 w-5" /> Live Terminal Kiosk Simulator
            </h3>

            {clockMsg && (
              <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 p-3 text-xs font-semibold text-emerald-300">
                {clockMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Doctor / Staff</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Verification Method</label>
                <select
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Facial_Recognition">Facial Recognition AI Scanner</option>
                  <option value="Biometric_Fingerprint">Biometric Fingerprint Scanner</option>
                  <option value="RFID_Badge">Smart RFID Access Badge</option>
                  <option value="QR_Mobile">Mobile QR Code Scan</option>
                  <option value="GPS_Geofence">GPS Geofence Location Verification</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleSimulateClockIn}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
                >
                  Simulate Instant Clock-In
                </button>
              </div>
            </div>
          </div>

          {/* Attendance Logs Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200">
              Recent Raw Terminal Clock-In Entries
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Employee Name</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Clock In Time</th>
                    <th className="px-5 py-3.5">Clock Out Time</th>
                    <th className="px-5 py-3.5">Verification Mode</th>
                    <th className="px-5 py-3.5">Location / Kiosk</th>
                    <th className="px-5 py-3.5">Overtime (Hrs)</th>
                    <th className="px-5 py-3.5">Approval Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4 font-bold">{att.employeeName}</td>
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">{att.date}</td>
                      <td className="px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">{att.clockIn}</td>
                      <td className="px-5 py-4 text-slate-500">{att.clockOut}</td>
                      <td className="px-5 py-4 font-mono text-[11px]">{att.method.replace('_', ' ')}</td>
                      <td className="px-5 py-4 text-slate-500">{att.location}</td>
                      <td className="px-5 py-4 font-bold">{att.overtimeHours} hrs</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            att.approvalStatus === 'Approved' || att.approvalStatus === 'Auto-Approved'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {att.approvalStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {att.approvalStatus === 'Pending Approval' && (
                          <button
                            onClick={() => approveAttendance(att.id)}
                            className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                          >
                            Approve Overtime
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
