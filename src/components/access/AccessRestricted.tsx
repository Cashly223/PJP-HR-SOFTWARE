import React from 'react';
import { Lock, ShieldAlert, ArrowLeft, UserCheck, AlertTriangle } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface AccessRestrictedProps {
  moduleName?: string;
}

export const AccessRestricted: React.FC<AccessRestrictedProps> = ({ moduleName }) => {
  const { setActiveTab, activeRole, currentUser } = useHrms();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-rose-200 bg-white p-8 shadow-xl dark:border-rose-950 dark:bg-slate-900">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
          <Lock className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Restricted Information & Module</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Access Control Restriction
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You do not have administrative clearance to access{' '}
            <strong className="text-slate-800 dark:text-slate-200">{moduleName || 'this module'}</strong>.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-left text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>Authorized Staff Access Rules:</span>
          </div>
          <p>
            General staff members are restricted to standard staff portals (Staff Profile, Leave Application, Unit Conference, Org Hierarchy, Shift Roster, Individual Attendance, Payslip, Expense Claim, LMS, Performance Appraisal, Grievances).
          </p>
          <p className="text-[11px] text-slate-500">
            To view this information, please request authorization from the Human Resource Manager or Head of Facility.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Staff Portal
          </button>
        </div>
      </div>
    </div>
  );
};
