import React, { useState } from 'react';
import { ShieldAlert, Search, Filter, Lock } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const AuditLogViewer: React.FC = () => {
  const { auditLogs } = useHrms();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = (auditLogs || []).filter(
    (l) =>
      l &&
      ((l.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.module || '').toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-emerald-600" />
            Immutable Hospital Audit Trail & Activity Logs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            JCAHO & HIPAA Compliant system logs tracking every user action, schema update & credential change.
          </p>
        </div>
      </div>

      <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Search className="mr-2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit logs by user, module, or action..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 focus:outline-none dark:text-slate-100"
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Module</th>
                <th className="px-5 py-3.5">Action Executed</th>
                <th className="px-5 py-3.5">Log Details</th>
                <th className="px-5 py-3.5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-3.5 text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="px-5 py-3.5 font-bold font-sans">{log.userName}</td>
                  <td className="px-5 py-3.5 font-sans">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-emerald-600 dark:text-emerald-400 font-sans">{log.module}</td>
                  <td className="px-5 py-3.5 font-bold font-sans">{log.action}</td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate font-sans">{log.details}</td>
                  <td className="px-5 py-3.5 text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
