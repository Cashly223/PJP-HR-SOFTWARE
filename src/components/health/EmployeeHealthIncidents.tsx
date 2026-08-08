import React, { useState } from 'react';
import { HeartPulse, ShieldAlert, Syringe, Plus, CheckCircle2 } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { IncidentReport } from '../../types/hrms';

export const EmployeeHealthIncidents: React.FC = () => {
  const { incidents, employees, addIncident } = useHrms();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  const [type, setType] = useState<IncidentReport['type']>('Needle Stick Injury');
  const [severity, setSeverity] = useState<IncidentReport['severity']>('Medium');
  const [desc, setDesc] = useState('Superficial needle prick during IV setup in Ward.');

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    addIncident({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      type,
      severity,
      description: desc,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-emerald-600" />
            Employee Occupational Health & Safety Incidents
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Needle stick exposure reports, vaccine boosters, fitness for duty & workplace injury investigations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-rose-500 transition"
        >
          <Plus className="h-4 w-4" /> Report Safety Incident
        </button>
      </div>

      {/* Incident Log Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b font-bold text-sm text-slate-900 dark:text-slate-100 dark:border-slate-800 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-rose-500" /> Clinical Incident Log
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Doctor / Staff</th>
                <th className="px-5 py-3.5">Incident Type</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Incident Details</th>
                <th className="px-5 py-3.5">Corrective Action</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-bold">{inc.employeeName}</td>
                  <td className="px-5 py-4 font-semibold text-rose-600 dark:text-rose-400">{inc.type}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        inc.severity === 'Critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4">{inc.date}</td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{inc.description}</td>
                  <td className="px-5 py-4 text-emerald-600 font-medium">{inc.correctiveAction}</td>
                  <td className="px-5 py-4 font-bold text-emerald-600">{inc.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <h3 className="font-bold text-base mb-4 text-rose-600">Report Workplace Safety Incident</h3>
            <form onSubmit={handleCreateIncident} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Involved Staff</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Incident Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="Needle Stick Injury">Needle Stick Injury</option>
                  <option value="Chemical / Radiation Exposure">Chemical / Radiation Exposure</option>
                  <option value="Patient Handling Injury">Patient Handling Injury</option>
                  <option value="Safety Violation">Safety Violation</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full rounded-lg border p-2 dark:bg-slate-800 dark:border-slate-700"
                  rows={3}
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-500">
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
