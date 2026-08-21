import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Sparkles,
  Lock,
  Unlock,
  AlertCircle,
  Building2,
  Users,
  Check,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, UserRole } from '../../types/hrms';

export const AccessControlPanel: React.FC = () => {
  const {
    employees,
    staffPermissions,
    grantStaffAccess,
    revokeStaffAccess,
    currentUser,
    activeRole,
  } = useHrms();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [permissionNotes, setPermissionNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const GRANTABLE_MODULES = [
    { key: 'recruitment', name: 'Recruitment & ATS', desc: 'Job vacancies, applicant tracking & interviews' },
    { key: 'onboarding', name: 'Onboarding Workflows', desc: 'New hire checklists, credentials & orientation' },
    { key: 'assets', name: 'Hospital Assets & Equipment', desc: 'Medical devices, laptops & maintenance tracking' },
    { key: 'audit', name: 'System Audit Logs', desc: 'Security audit trail & administrative access logs' },
    { key: 'reports', name: 'Custom Reports Exporter', desc: 'HR analytics, payroll reports & CSV export' },
    { key: 'customization', name: 'System Customization', desc: 'Portal branding, security rules & workflow config' },
    { key: 'api', name: 'REST API Browser', desc: 'API endpoints documentation & test console' },
    { key: 'staff_files', name: 'Staff File Vault Admin', desc: 'Full access to view all personnel document archives' },
    { key: 'health', name: 'Occupational Health Admin', desc: 'Incidents logging, needle-stick & injury reports' },
    { key: 'credentials', name: 'Medical Credentials Admin', desc: 'Medical license renewals & verification alerts' },
  ];

  const departments = ['All', ...Array.from(new Set((employees || []).filter(Boolean).map((e) => e?.department).filter(Boolean)))];

  const filteredEmployees = (employees || []).filter((emp) => {
    if (!emp) return false;
    const term = (searchTerm || '').toLowerCase();
    const matchesSearch =
      `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(term) ||
      (emp.email || '').toLowerCase().includes(term) ||
      (emp.empCode || '').toLowerCase().includes(term);
    const matchesDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
    const matchesRole = selectedRoleFilter === 'All' || emp.role === selectedRoleFilter;
    return matchesSearch && matchesDept && matchesRole;
  });

  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    const existing = staffPermissions.find((p) => p.employeeId === emp.id);
    setSelectedModules(existing ? [...existing.grantedModules] : []);
    setPermissionNotes(existing?.notes || '');
  };

  const handleToggleModule = (moduleKey: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey) ? prev.filter((m) => m !== moduleKey) : [...prev, moduleKey]
    );
  };

  const handleSelectAllModules = () => {
    setSelectedModules(GRANTABLE_MODULES.map((m) => m.key));
  };

  const handleClearAllModules = () => {
    setSelectedModules([]);
  };

  const handleSavePermissions = () => {
    if (!editingEmp) return;
    grantStaffAccess(editingEmp.id, selectedModules, permissionNotes);
    setSuccessMsg(`Permissions successfully updated for ${editingEmp.firstName} ${editingEmp.lastName}`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setEditingEmp(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            HR Access Control & Staff Permissions Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Grant or restrict staff members access to specific administrative information, confidential files, and system modules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <UserCheck className="h-4 w-4" />
            <span>Authorized HR Manager Mode</span>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff name, ID or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="All">All Departments</option>
              {departments.filter((d) => d !== 'All').map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredEmployees.length}</strong> staff members
          </div>
        </div>
      </div>

      {/* Employee Permissions Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Staff Member</th>
                <th className="px-5 py-3.5">Role & Department</th>
                <th className="px-5 py-3.5">Base Access</th>
                <th className="px-5 py-3.5">HR Granted Custom Modules</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredEmployees.map((emp) => {
                const userPerm = staffPermissions.find((p) => p.employeeId === emp.id);
                const grantedCount = userPerm?.grantedModules?.length || 0;
                const isExecRole = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(emp.role);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.photo}
                          alt={emp.firstName}
                          className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">{emp.empCode} • {emp.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {emp.jobTitle}
                      </span>
                      <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">{emp.department}</p>
                    </td>

                    <td className="px-5 py-4">
                      {isExecRole ? (
                        <span className="rounded-lg bg-purple-100 px-2.5 py-1 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          Executive Full Access
                        </span>
                      ) : (
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          11 Staff Portal Modules
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {isExecRole ? (
                        <span className="text-slate-400 text-[11px]">All modules enabled by default</span>
                      ) : grantedCount > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {userPerm?.grantedModules.map((m) => (
                            <span
                              key={m}
                              className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize"
                            >
                              {m.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Standard Staff Restrictive Profile</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {!isExecRole && (
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition shadow-sm flex items-center gap-1.5 ml-auto"
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" /> Manage Access
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Permissions Modal */}
      {editingEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img src={editingEmp.photo} alt="" className="h-12 w-12 rounded-2xl object-cover ring-2 ring-emerald-500/40" />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Grant Access Permissions: {editingEmp.firstName} {editingEmp.lastName}
                  </h3>
                  <p className="text-xs text-slate-500">{editingEmp.jobTitle} • {editingEmp.department} ({editingEmp.empCode})</p>
                </div>
              </div>
              <button
                onClick={() => setEditingEmp(null)}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Select Administrative Information & Modules to Grant:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllModules}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Select All
                </button>
                <span>•</span>
                <button
                  onClick={handleClearAllModules}
                  className="text-rose-500 font-bold hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GRANTABLE_MODULES.map((mod) => {
                const isChecked = selectedModules.includes(mod.key);
                return (
                  <div
                    key={mod.key}
                    onClick={() => handleToggleModule(mod.key)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition flex items-start gap-3 ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-500/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border ${
                        isChecked
                          ? 'border-emerald-600 bg-emerald-600 text-white dark:bg-emerald-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{mod.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{mod.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                HR Access Justification Note (Optional)
              </label>
              <textarea
                value={permissionNotes}
                onChange={(e) => setPermissionNotes(e.target.value)}
                placeholder="Reason for granting custom administrative access..."
                rows={2}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setEditingEmp(null)}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg hover:bg-emerald-500 transition"
              >
                Save Staff Access Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
