import React, { useState } from 'react';
import { UserPlus, CheckSquare, Printer, Shield, Shirt, CreditCard } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const OnboardingWorkflow: React.FC = () => {
  const { onboardingTasks, toggleOnboardingTask, employees } = useHrms();
  const [selectedBadgeEmp, setSelectedBadgeEmp] = useState<any>(employees[0]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-emerald-600" />
          Automated Onboarding & Hospital Orientation Workflows
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ID Badge Printing, Uniform Allocation, IT Account Provisioning, Digital Policy Signature & Orientation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Onboarding Tasks Checklist */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-emerald-600" /> New Employee Induction Tasks
          </h3>

          <div className="space-y-3">
            {onboardingTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => toggleOnboardingTask(t.id)}
                className={`flex items-start justify-between rounded-xl p-3.5 border cursor-pointer transition ${
                  t.completed
                    ? 'bg-emerald-50/60 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900'
                    : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => {}}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className={`font-semibold text-xs ${t.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {t.taskName}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 pl-6">
                    Assigned to {t.employeeName} • Category: {t.category} (Due: {t.dueDate})
                  </p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {t.completed ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Digital ID Badge Generator Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" /> Hospital ID Badge Simulator
            </h3>

            {/* Simulated Printed Card */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-800 to-slate-950 p-4 text-white shadow-xl border border-emerald-500/30">
              <div className="flex justify-between items-center border-b border-emerald-500/30 pb-2">
                <span className="text-[10px] font-bold tracking-widest text-emerald-300 uppercase">Pope John Paul II Medical</span>
                <span className="text-[9px] font-mono text-emerald-200">ICU-ACCESS</span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <img
                  src={selectedBadgeEmp?.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'}
                  alt="Badge Photo"
                  className="h-16 w-16 rounded-xl object-cover border-2 border-emerald-400 shadow"
                />
                <div>
                  <h4 className="font-bold text-sm">{selectedBadgeEmp?.firstName} {selectedBadgeEmp?.lastName}</h4>
                  <p className="text-[10px] font-semibold text-emerald-300">{selectedBadgeEmp?.jobTitle}</p>
                  <p className="text-[9px] text-slate-300">{selectedBadgeEmp?.department}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-end border-t border-emerald-500/30 pt-2 text-[9px] font-mono text-slate-300">
                <span>ID: {selectedBadgeEmp?.empCode}</span>
                <span className="bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">RFID RFID</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
          >
            <Printer className="h-4 w-4" /> Print Hospital Smart Badge
          </button>
        </div>
      </div>
    </div>
  );
};
