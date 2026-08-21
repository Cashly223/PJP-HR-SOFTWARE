import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import {
  Building2,
  FolderPlus,
  Plus,
  UserCheck,
  ShieldCheck,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Briefcase,
  Trash2,
} from 'lucide-react';

export const DepartmentAndUnitManager: React.FC = () => {
  const {
    departmentLeadership,
    addDepartment,
    addUnitToDepartment,
    assignDepartmentHead,
    assignUnitHead,
    employees,
    activeRole,
  } = useHrms();

  // Modal / Form state for New Department
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptHeadId, setNewDeptHeadId] = useState('');
  const [deptUnits, setDeptUnits] = useState<Array<{ unitName: string; unitHeadId: string }>>([
    { unitName: '', unitHeadId: '' },
  ]);

  const handleAddDeptUnitRow = () => {
    setDeptUnits((prev) => [...prev, { unitName: '', unitHeadId: '' }]);
  };

  const handleRemoveDeptUnitRow = (index: number) => {
    setDeptUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateDeptUnitRow = (index: number, field: 'unitName' | 'unitHeadId', value: string) => {
    setDeptUnits((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // Modal / Form state for New Unit
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [selectedDeptForUnit, setSelectedDeptForUnit] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitHeadId, setNewUnitHeadId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const canManage = ['super_admin', 'hr_director', 'hr_manager', 'facility_head'].includes(activeRole);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    const headEmp = employees.find((emp) => emp.id === newDeptHeadId);
    const headName = headEmp ? `${headEmp.firstName} ${headEmp.lastName}` : undefined;
    const headEmail = headEmp?.email;

    const validUnits = deptUnits.filter((u) => u.unitName.trim().length > 0);

    addDepartment({
      departmentName: newDeptName.trim(),
      departmentCode: newDeptCode.trim().toUpperCase(),
      departmentHeadId: newDeptHeadId || undefined,
      departmentHeadName: headName,
      departmentHeadEmail: headEmail,
      units: validUnits.map((u) => ({
        unitName: u.unitName.trim(),
        unitHeadId: u.unitHeadId || undefined,
      })),
    });

    triggerToast(`Department '${newDeptName.trim()}' with ${validUnits.length || 1} unit(s) successfully created & added to PJPIIMC structure.`);
    setNewDeptName('');
    setNewDeptCode('');
    setNewDeptHeadId('');
    setDeptUnits([{ unitName: '', unitHeadId: '' }]);
    setShowAddDeptModal(false);
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeptForUnit || !newUnitName.trim()) return;

    addUnitToDepartment(selectedDeptForUnit, newUnitName.trim(), newUnitHeadId || undefined);

    triggerToast(`New Unit '${newUnitName.trim()}' created under ${selectedDeptForUnit}.`);
    setNewUnitName('');
    setNewUnitHeadId('');
    setShowAddUnitModal(false);
  };

  const filteredDepts = (departmentLeadership || []).filter(
    (dept) =>
      dept &&
      ((dept.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.departmentCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.units || []).some((u) => u && (u.unitName || '').toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 p-6 rounded-2xl border border-blue-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Building2 className="w-64 h-64 text-blue-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              PJPIIMC Governance & Structure Directory
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Hospital Departments & Units Management</h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Create, configure, and manage hospital departments, specialized sub-units, and leadership assignments across PJPIIMC.
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowAddDeptModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-blue-950/50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Department
              </button>
              <button
                onClick={() => {
                  if (departmentLeadership.length > 0) {
                    setSelectedDeptForUnit(departmentLeadership[0].departmentName);
                  }
                  setShowAddUnitModal(true);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Add Unit to Department
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search departments, units or codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <strong className="text-white">{departmentLeadership.length}</strong> Departments
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 rounded-lg">
            <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
            <strong className="text-white">
              {departmentLeadership.reduce((acc, d) => acc + d.units.length, 0)}
            </strong> Total Units
          </span>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDepts.map((dept) => (
          <div
            key={dept.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                    {dept.departmentCode}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{dept.departmentName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Code: {dept.departmentCode}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
                  <FolderPlus className="w-3 h-3 text-emerald-400" />
                  {dept.units.length} Units
                </span>
              </div>

              {/* Department Head Box */}
              <div className="mt-4 p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Department Head</div>
                    <div className="text-xs font-semibold text-slate-200">
                      {dept.departmentHeadName || 'Unassigned'}
                    </div>
                  </div>
                </div>

                {canManage && (
                  <select
                    value={employees.find((e) => `${e.firstName} ${e.lastName}` === dept.departmentHeadName)?.id || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        assignDepartmentHead(dept.departmentName, e.target.value);
                        triggerToast(`Assigned Department Head for ${dept.departmentName}.`);
                      }
                    }}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="">Change Dept Head...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.jobTitle})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Units List */}
              <div className="mt-4 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Units & Sub-Divisions</span>
                  <button
                    onClick={() => {
                      setSelectedDeptForUnit(dept.departmentName);
                      setShowAddUnitModal(true);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Unit
                  </button>
                </div>

                <div className="space-y-1.5">
                  {dept.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{unit.unitName}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          Unit Head: <strong className="text-slate-200">{unit.unitHeadName || 'Unassigned'}</strong>
                        </span>

                        {canManage && (
                          <select
                            value={unit.unitHeadId || ''}
                            onChange={(e) => {
                              if (e.target.value) {
                                assignUnitHead(dept.departmentName, unit.unitName, e.target.value);
                                triggerToast(`Assigned Unit Head for ${unit.unitName}.`);
                              }
                            }}
                            className="bg-slate-900 border border-slate-800 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            <option value="">Set Head...</option>
                            {employees.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.firstName} {e.lastName}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Last updated: {dept.lastAssignedAt ? new Date(dept.lastAssignedAt).toLocaleDateString() : 'System Default'}</span>
              <span>Audit: {dept.lastAssignedBy || 'HR Directorate'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Create Department */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                Create New Hospital Department & Units
              </h3>
              <button
                onClick={() => setShowAddDeptModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Obstetrics & Gynecology"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OBGYN"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 uppercase font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Initial Department Head (HOD - Tier 2)</label>
                <select
                  value={newDeptHeadId}
                  onChange={(e) => setNewDeptHeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="">Select Staff Member...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} — {e.jobTitle} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Sub-Units */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <FolderPlus className="w-4 h-4 text-emerald-400" />
                      Units & Assigned Unit Heads (HOU - Tier 3)
                    </h4>
                    <p className="text-[11px] text-slate-400">Add sub-units under this department and assign their Unit Heads.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDeptUnitRow}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Unit
                  </button>
                </div>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {deptUnits.map((uRow, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300">Unit #{idx + 1}</span>
                        {deptUnits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveDeptUnitRow(idx)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Unit Name *</label>
                          <input
                            type="text"
                            placeholder="e.g. Antenatal Clinic / Delivery Ward"
                            value={uRow.unitName}
                            onChange={(e) => handleUpdateDeptUnitRow(idx, 'unitName', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Assigned Unit Head (HOU)</label>
                          <select
                            value={uRow.unitHeadId}
                            onChange={(e) => handleUpdateDeptUnitRow(idx, 'unitHeadId', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
                          >
                            <option value="">Select Unit Head...</option>
                            {employees.map((e) => (
                              <option key={e.id} value={e.id}>
                                {e.firstName} {e.lastName} ({e.jobTitle})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-950/50 flex items-center gap-1.5 transition"
                >
                  <Building2 className="w-4 h-4" />
                  Save Department & Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Unit */}
      {showAddUnitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-emerald-400" />
                Add New Sub-Unit to Department
              </h3>
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUnit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Department *</label>
                <select
                  required
                  value={selectedDeptForUnit}
                  onChange={(e) => setSelectedDeptForUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                >
                  {departmentLeadership.map((d) => (
                    <option key={d.id} value={d.departmentName}>
                      {d.departmentName} ({d.departmentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neonatal Intensive Care Unit (NICU)"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assign Unit Head (Optional)</label>
                <select
                  value={newUnitHeadId}
                  onChange={(e) => setNewUnitHeadId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Staff Member...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} — {e.jobTitle}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUnitModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-950/50"
                >
                  Add Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
