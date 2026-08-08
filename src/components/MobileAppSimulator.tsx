import React, { useState } from 'react';
import { Smartphone, Clock, Calendar, FileText, Award, MapPin, X, Check, ShieldCheck } from 'lucide-react';
import { useHrms } from '../context/HrmsContext';

interface MobileAppSimulatorProps {
  onClose: () => void;
}

export const MobileAppSimulator: React.FC<MobileAppSimulatorProps> = ({ onClose }) => {
  const { employees, formatCurrency, addClockIn, addLeaveRequest, rosters } = useHrms();
  const currentEmp = employees[1] || employees[0]; // Elena Rostova or Dr Sarah Jenkins
  const empRoster = rosters.filter((r) => r.employeeId === currentEmp.id);

  const [activeScreen, setActiveScreen] = useState<'home' | 'attendance' | 'roster' | 'payslip' | 'leave'>('home');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockMsg, setClockMsg] = useState('');

  const handleMobileClockIn = () => {
    addClockIn(currentEmp.id, 'GPS_Geofence');
    setClockedIn(true);
    setClockMsg('Clocked In via Mobile GPS Geofence at ICU Station!');
    setTimeout(() => setClockMsg(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 flex items-center gap-1 text-xs text-white hover:text-emerald-400"
        >
          <X className="h-4 w-4" /> Exit Mobile View
        </button>

        {/* Smartphone Frame */}
        <div className="w-[340px] h-[680px] rounded-[42px] border-[10px] border-slate-900 bg-slate-950 p-3 shadow-2xl overflow-hidden flex flex-col justify-between text-slate-100">
          {/* Top Notch Bar */}
          <div className="flex items-center justify-between px-4 pt-1 pb-2">
            <span className="text-[10px] font-semibold">09:41 AM</span>
            <div className="h-3 w-20 rounded-full bg-slate-800"></div>
            <div className="flex items-center gap-1 text-[10px]">
              <span>5G</span>
              <span>100%</span>
            </div>
          </div>

          {/* App Header */}
          <div className="flex items-center justify-between bg-emerald-700 p-3 rounded-2xl text-white">
            <div className="flex items-center gap-2.5">
              <img src={currentEmp.photo} alt={currentEmp.firstName} className="h-9 w-9 rounded-full object-cover border-2 border-white" />
              <div>
                <h4 className="text-xs font-bold">{currentEmp.firstName} {currentEmp.lastName}</h4>
                <p className="text-[10px] text-emerald-200">{currentEmp.jobTitle}</p>
              </div>
            </div>
            <span className="rounded bg-emerald-800 px-2 py-0.5 text-[9px] font-semibold">{currentEmp.empCode}</span>
          </div>

          {/* Screen Content */}
          <div className="flex-1 overflow-y-auto py-3 px-1 space-y-3">
            {activeScreen === 'home' && (
              <div className="space-y-3">
                {/* Clock-in Quick Card */}
                <div className="rounded-2xl bg-slate-900 p-3.5 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200">ICU Attendance</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> GPS Geofence Active
                    </span>
                  </div>
                  {clockMsg && <p className="mb-2 text-[10px] font-semibold text-emerald-400">{clockMsg}</p>}
                  <button
                    onClick={handleMobileClockIn}
                    disabled={clockedIn}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold shadow transition ${
                      clockedIn
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
                  >
                    {clockedIn ? '✓ Clocked In at ICU' : 'Tap to Clock In (GPS / Face)'}
                  </button>
                </div>

                {/* Licenses Warning */}
                <div className="rounded-2xl bg-amber-950/40 border border-amber-800/60 p-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
                    <span className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> Medical License Alert</span>
                    <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">Expiring</span>
                  </div>
                  <p className="mt-1 text-[11px] text-amber-200">
                    BLS License expires in 19 days. Tap to upload renewal certificate.
                  </p>
                </div>

                {/* Quick Menu */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveScreen('roster')}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900 p-3 text-center border border-slate-800 hover:border-emerald-600"
                  >
                    <Calendar className="h-5 w-5 text-emerald-400" />
                    <span className="text-[11px] font-semibold">My Shifts</span>
                  </button>
                  <button
                    onClick={() => setActiveScreen('payslip')}
                    className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-900 p-3 text-center border border-slate-800 hover:border-emerald-600"
                  >
                    <FileText className="h-5 w-5 text-emerald-400" />
                    <span className="text-[11px] font-semibold">My Payslips</span>
                  </button>
                </div>
              </div>
            )}

            {activeScreen === 'roster' && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-400 mb-2">My Shift Roster</h4>
                {empRoster.map((r) => (
                  <div key={r.id} className="rounded-xl bg-slate-900 p-3 border border-slate-800 text-xs">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>{r.shiftType}</span>
                      <span className="text-emerald-400">{r.date}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Ward: {r.ward} ({r.startTime} - {r.endTime})</p>
                  </div>
                ))}
              </div>
            )}

            {activeScreen === 'payslip' && (
              <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 text-xs space-y-2">
                <h4 className="font-bold text-emerald-400">July 2026 Payslip Statement</h4>
                <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                  <span>Base Salary</span>
                  <span>{formatCurrency(currentEmp.salary)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                  <span>Night Duty Allowance</span>
                  <span>{formatCurrency(850)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-300">
                  <span>Hazard Pay</span>
                  <span>{formatCurrency(600)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 text-sm pt-1">
                  <span>Net Take-Home Pay</span>
                  <span>{formatCurrency(7480)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-around border-t border-slate-800 pt-2 pb-1 bg-slate-950">
            <button onClick={() => setActiveScreen('home')} className={`text-[10px] flex flex-col items-center ${activeScreen === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              <Smartphone className="h-4 w-4" /> Home
            </button>
            <button onClick={() => setActiveScreen('roster')} className={`text-[10px] flex flex-col items-center ${activeScreen === 'roster' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              <Calendar className="h-4 w-4" /> Shifts
            </button>
            <button onClick={() => setActiveScreen('payslip')} className={`text-[10px] flex flex-col items-center ${activeScreen === 'payslip' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              <FileText className="h-4 w-4" /> Payslip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
