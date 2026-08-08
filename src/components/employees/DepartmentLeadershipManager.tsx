import React, { useState } from 'react';
import {
  Building2,
  UserCheck,
  Crown,
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  Users,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Mail,
  Award,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const DepartmentLeadershipManager: React.FC = () => {
  const {
    employees,
    departmentLeadership,
    assignDepartmentHead,
    assignUnitHead,
    addUnitToDepartment,
    setFacilityHead,
    activeRole,
  } = useHrms();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  
  // Modal states for HR Assignment
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    type: 'dept_head' | 'unit_head' | 'facility_head';
    departmentName: string;
    unitName?: string;
    currentHeadId?: string;
  }>({
    open: false,
    type: 'dept_head',
    departmentName: '',
  });

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [newUnitModal, setNewUnitModal] = useState({ open: false, departmentName: '', unitName: '', headId: '' });
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const isHR = activeRole === 'super_admin' || activeRole === 'hr_director' || activeRole === 'hr_manager';

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleOpenAssignModal = (
    type: 'dept_head' | 'unit_head' | 'facility_head',
    departmentName: string,
    unitName?: string,
    currentHeadId?: string
  ) => {
    setAssignModal({
      open: true,
      type,
      departmentName,
      unitName,
      currentHeadId,
    });
    setSelectedEmpId(currentHeadId || employees[0]?.id || '');
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    const emp = employees.find((e) => e.id === selectedEmpId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Selected Staff';

    if (assignModal.type === 'dept_head') {
      assignDepartmentHead(assignModal.departmentName, selectedEmpId);
      showToast(`Assigned ${empName} as Department Head (HOD) for ${assignModal.departmentName}`);
    } else if (assignModal.type === 'unit_head' && assignModal.unitName) {
      assignUnitHead(assignModal.departmentName, assignModal.unitName, selectedEmpId);
      showToast(`Assigned ${empName} as Unit Head (HOU) for ${assignModal.unitName}`);
    } else if (assignModal.type === 'facility_head') {
      setFacilityHead(selectedEmpId);
      showToast(`Assigned ${empName} as Head of Facility (CMO / CEO)`);
    }

    setAssignModal({ open: false, type: 'dept_head', departmentName: '' });
  };

  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitModal.unitName.trim()) return;

    addUnitToDepartment(newUnitModal.departmentName, newUnitModal.unitName, newUnitModal.headId || undefined);
    showToast(`Created Unit '${newUnitModal.unitName}' under ${newUnitModal.departmentName}`);
    setNewUnitModal({ open: false, departmentName: '', unitName: '', headId: '' });
  };

  // Facility Head reference (shared across hospital)
  const currentFacilityHead = departmentLeadership[0]?.facilityHeadName
    ? {
        id: departmentLeadership[0].facilityHeadId,
        name: departmentLeadership[0].facilityHeadName,
        email: departmentLeadership[0].facilityHeadEmail,
      }
    : null;

  const filteredLeaderships = departmentLeadership.filter((dl) => {
    const matchesDept = selectedDeptFilter === 'All' || dl.departmentName === selectedDeptFilter;
    const matchesSearch =
      dl.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dl.departmentHeadName && dl.departmentHeadName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      dl.units.some(
        (u) =>
          u.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (u.unitHeadName && u.unitHeadName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-xl dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                HR Leadership Governance
              </span>
              <span className="text-slate-400 text-xs">• 4-Tier Approval Authority Chain</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-400" />
              Department & Unit Leadership Governance
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Human Resources administrative console to assign, reassign, and manage <strong className="text-emerald-300">Department Heads (HOD)</strong>, <strong className="text-cyan-300">Unit Heads (HOU)</strong>, and <strong className="text-amber-300">Head of Facility</strong> required for sequential request approval workflows.
            </p>
          </div>

          {/* Facility Head Badge & HR Action */}
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl bg-slate-900/90 p-3 border border-amber-500/30 text-right min-w-[220px]">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                <Crown className="h-3 w-3 text-amber-400" /> Head of Facility (Tier 4)
              </div>
              <div className="text-sm font-extrabold text-white">
                {currentFacilityHead?.name || 'Dr. Arthur Kingsley'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {currentFacilityHead?.email || 'a.kingsley@stjudehealth.org'}
              </div>
              {isHR && (
                <button
                  onClick={() => handleOpenAssignModal('facility_head', 'All Facility Units', undefined, currentFacilityHead?.id)}
                  className="mt-2 text-[10px] font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 ml-auto"
                >
                  <UserCheck className="h-3 w-3" /> Reassign Facility Head
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4-Tier Sequential Approval Chain Preview */}
        <div className="mt-6 pt-5 border-t border-slate-700/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Mandatory 4-Tier Approval Hierarchy Structure
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-xl bg-slate-900/70 p-3 border border-cyan-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-cyan-400 mb-1">
                <span>TIER 1</span>
                <span>UNIT HEAD</span>
              </div>
              <div className="font-bold text-white text-[11px]">Unit Leadership (HOU)</div>
              <div className="text-[10px] text-slate-400 mt-1">Operational unit shift coverage & staffing check</div>
            </div>

            <div className="rounded-xl bg-slate-900/70 p-3 border border-indigo-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-indigo-400 mb-1">
                <span>TIER 2</span>
                <span>DEPARTMENT HEAD</span>
              </div>
              <div className="font-bold text-white text-[11px]">Departmental Lead (HOD)</div>
              <div className="text-[10px] text-slate-400 mt-1">Specialty headcount & clinical roster review</div>
            </div>

            <div className="rounded-xl bg-slate-900/70 p-3 border border-emerald-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-emerald-400 mb-1">
                <span>TIER 3</span>
                <span>HR DIRECTOR / MGR</span>
              </div>
              <div className="font-bold text-white text-[11px]">Human Resources</div>
              <div className="text-[10px] text-slate-400 mt-1">Contract compliance, leave balance & policy check</div>
            </div>

            <div className="rounded-xl bg-slate-900/70 p-3 border border-amber-500/30">
              <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-400 mb-1">
                <span>TIER 4</span>
                <span>FACILITY HEAD</span>
              </div>
              <div className="font-bold text-white text-[11px]">Head of Facility / CEO</div>
              <div className="text-[10px] text-slate-400 mt-1">Final executive sign-off & authorization</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search department, unit, HOD, or unit head name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Departments</option>
            {departmentLeadership.map((d) => (
              <option key={d.id} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing <strong className="text-slate-800 dark:text-slate-200">{filteredLeaderships.length}</strong> Departments & Units
        </div>
      </div>

      {/* Department Leadership Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredLeaderships.map((dept) => {
          const deptHeadEmp = employees.find((e) => e.id === dept.departmentHeadId);

          return (
            <div
              key={dept.id}
              className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm overflow-hidden"
            >
              {/* Department Header Bar */}
              <div className="bg-slate-50 dark:bg-slate-800/80 p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {dept.departmentName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {dept.departmentCode}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {dept.units.length} Functional Clinical Units • Responsible for Tier 2 Departmental Approvals
                    </p>
                  </div>
                </div>

                {/* HOD Card & HR Action */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-indigo-100 dark:border-slate-700">
                  <div className="relative">
                    <img
                      src={
                        deptHeadEmp?.photo ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
                      }
                      alt={dept.departmentHeadName || 'HOD'}
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500"
                    />
                    <Crown className="h-3.5 w-3.5 text-amber-400 absolute -top-1 -right-1 fill-amber-400" />
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="h-3 w-3" /> Head of Department (HOD - Tier 2)
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {dept.departmentHeadName || 'Unassigned (Select HOD)'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {dept.departmentHeadEmail || 'Pending HR Assignment'}
                    </div>
                  </div>

                  {isHR && (
                    <button
                      onClick={() => handleOpenAssignModal('dept_head', dept.departmentName, undefined, dept.departmentHeadId)}
                      className="ml-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-indigo-500 transition"
                    >
                      {dept.departmentHeadId ? 'Change HOD' : 'Assign HOD'}
                    </button>
                  )}
                </div>
              </div>

              {/* Units List */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-cyan-500" />
                    Unit Leadership (Tier 1 Approvers)
                  </h4>

                  {isHR && (
                    <button
                      onClick={() =>
                        setNewUnitModal({ open: true, departmentName: dept.departmentName, unitName: '', headId: '' })
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add New Clinical Unit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dept.units.map((unit) => {
                    const unitHeadEmp = employees.find((e) => e.id === unit.unitHeadId);

                    return (
                      <div
                        key={unit.id}
                        className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 hover:border-cyan-500/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              unitHeadEmp?.photo ||
                              'https://images.unsplash.com/photo-1594824813566-78a9327d3b5b?w=150&auto=format&fit=crop&q=80'
                            }
                            alt={unit.unitHeadName || 'Unit Head'}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-cyan-500"
                          />
                          <div>
                            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              {unit.unitName}
                            </div>
                            <div className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-1 mt-0.5">
                              <ShieldCheck className="h-3 w-3" />
                              HOU: {unit.unitHeadName || 'Unassigned (Select Unit Head)'}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {unit.unitHeadEmail || 'No Email Registered'} • {unit.staffCount} Staff Members
                            </div>
                          </div>
                        </div>

                        {isHR && (
                          <button
                            onClick={() =>
                              handleOpenAssignModal('unit_head', dept.departmentName, unit.unitName, unit.unitHeadId)
                            }
                            className="rounded-lg bg-cyan-600/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-3 py-1.5 text-[11px] font-bold hover:bg-cyan-600 hover:text-white transition"
                          >
                            {unit.unitHeadId ? 'Change HOU' : 'Assign HOU'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Governance Log */}
              <div className="bg-slate-100/70 dark:bg-slate-950/60 px-5 py-2.5 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <span>
                  Last HR Leadership Update: <strong>{dept.lastAssignedBy || 'HR Administration'}</strong>
                </span>
                <span>
                  Timestamp: {dept.lastAssignedAt ? new Date(dept.lastAssignedAt).toLocaleDateString() : 'Active System Standard'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal 1: Assign Head (HOD, HOU, Facility Head) */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                HR Assignment: {assignModal.type === 'dept_head' ? 'Department Head (HOD)' : assignModal.type === 'unit_head' ? 'Unit Head (HOU)' : 'Head of Facility'}
              </h3>
              <button
                onClick={() => setAssignModal({ open: false, type: 'dept_head', departmentName: '' })}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 mb-4 text-xs space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">Department:</span>{' '}
                <strong className="text-slate-800 dark:text-slate-200">{assignModal.departmentName}</strong>
              </div>
              {assignModal.unitName && (
                <div>
                  <span className="text-slate-400 font-semibold">Unit:</span>{' '}
                  <strong className="text-cyan-600 dark:text-cyan-400">{assignModal.unitName}</strong>
                </div>
              )}
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                  Select Staff Member for Leadership Appointment
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} — {emp.jobTitle} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
                ✓ Once appointed, this staff member will be granted <strong>Tier {assignModal.type === 'unit_head' ? '1 (Unit Head)' : assignModal.type === 'dept_head' ? '2 (Department Head)' : '4 (Head of Facility)'}</strong> approval authority over requests submitted within their jurisdiction.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModal({ open: false, type: 'dept_head', departmentName: '' })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create New Unit */}
      {newUnitModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <h3 className="font-extrabold text-base mb-1 flex items-center gap-2">
              <Plus className="h-5 w-5 text-cyan-500" />
              Add New Clinical Unit
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a new operational unit under <strong>{newUnitModal.departmentName}</strong>.
            </p>

            <form onSubmit={handleCreateUnit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1">Unit Name (e.g., Trauma Bay B, Ward 4, ICU-2)</label>
                <input
                  type="text"
                  required
                  placeholder="Enter unit name..."
                  value={newUnitModal.unitName}
                  onChange={(e) => setNewUnitModal({ ...newUnitModal, unitName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Initial Unit Head (HOU - Tier 1 Approver)</label>
                <select
                  value={newUnitModal.headId}
                  onChange={(e) => setNewUnitModal({ ...newUnitModal, headId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800"
                >
                  <option value="">Select Unit Head (Optional)</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setNewUnitModal({ open: false, departmentName: '', unitName: '', headId: '' })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 px-5 py-2 font-bold text-white shadow hover:bg-cyan-500"
                >
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
