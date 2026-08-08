import React, { useState } from 'react';
import { Award, AlertTriangle, ShieldCheck, Mail, Send, CheckCircle, Clock } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const CredentialTracker: React.FC = () => {
  const { employees, dispatchNotification } = useHrms();
  const [dispatchStatus, setDispatchStatus] = useState<Record<string, string>>({});

  const allLicenses = employees.flatMap((emp) =>
    emp.medicalLicenses.map((lic) => ({
      ...lic,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeEmail: emp.email,
      department: emp.department,
    }))
  );

  const handleSendReminder = async (licId: string, empEmail: string, empName: string, licType: string) => {
    setDispatchStatus((prev) => ({ ...prev, [licId]: 'sending' }));
    await dispatchNotification(
      empEmail,
      'Medical License Renewal Warning',
      `Dear ${empName}, your ${licType} credential is close to expiry. Please upload your renewed license certificate.`,
      'Email',
      'License_Expiry'
    );
    setDispatchStatus((prev) => ({ ...prev, [licId]: 'sent' }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-600" />
            Hospital Credential & License Expiry Monitor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time tracking of State Medical Licenses, Nursing Council Registration, BLS, ACLS, ATLS & DEA Certifications.
          </p>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Doctor / Staff Name</th>
                <th className="px-5 py-3.5">Credential Type</th>
                <th className="px-5 py-3.5">License #</th>
                <th className="px-5 py-3.5">Issuing Authority</th>
                <th className="px-5 py-3.5">Expiry Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Dispatch Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {allLicenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4 font-semibold">{lic.employeeName}</td>
                  <td className="px-5 py-4 font-bold text-emerald-600 dark:text-emerald-400">{lic.licenseType}</td>
                  <td className="px-5 py-4 font-mono">{lic.licenseNumber}</td>
                  <td className="px-5 py-4 text-slate-500">{lic.issuingAuthority}</td>
                  <td className="px-5 py-4 font-semibold">{lic.expiryDate}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold ${
                        lic.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {lic.status === 'Active' ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                      {lic.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleSendReminder(lic.id, lic.employeeEmail, lic.employeeName, lic.licenseType)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 font-semibold text-slate-700 hover:bg-emerald-600 hover:text-white dark:bg-slate-800 dark:text-slate-200 transition"
                    >
                      {dispatchStatus[lic.id] === 'sent' ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Reminder Sent</span>
                      ) : (
                        <>
                          <Send className="h-3 w-3" /> Send Alert
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
