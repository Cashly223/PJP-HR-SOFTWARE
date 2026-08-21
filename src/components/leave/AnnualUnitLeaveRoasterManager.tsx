import React, { useState } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { AnnualUnitLeaveRoaster, AnnualUnitLeaveRoasterItem } from '../../types/hrms';
import { PrintAnnualLeaveRoasterModal } from './PrintAnnualLeaveRoasterModal';
import {
  CalendarDays,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  UserCheck,
  Edit2,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Building2,
  ShieldCheck,
  Printer,
  Download,
  Save,
} from 'lucide-react';

const MONTHS_LIST = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AnnualUnitLeaveRoasterManager: React.FC = () => {
  const {
    annualUnitLeaveRoasters,
    saveAnnualUnitLeaveRoaster,
    approveAnnualUnitLeaveRoasterByHR,
    updateAnnualLeaveItemByHR,
    departmentLeadership,
    employees,
    activeRole,
    currentUser,
    isHeadOfFacilityOrHr,
    currentUserDepartment,
    canAccessDepartmentRoster,
  } = useHrms();

  const isHR = isHeadOfFacilityOrHr;
  const isUnitHead = ['unit_head', 'dept_head', 'super_admin', 'hr_director', 'facility_head'].includes(activeRole);

  // Scoped visible leave roasters
  const safeAnnualRoasters = (annualUnitLeaveRoasters || []).filter(Boolean);
  const visibleRoasters = safeAnnualRoasters.filter((r) => canAccessDepartmentRoster(r?.departmentName));

  const [selectedRoasterId, setSelectedRoasterId] = useState<string>(
    visibleRoasters[0]?.id || safeAnnualRoasters[0]?.id || ''
  );

  // Sync selected roaster if visible list changes or current selection isn't visible
  React.useEffect(() => {
    if (visibleRoasters.length > 0 && !visibleRoasters.some((r) => r.id === selectedRoasterId)) {
      setSelectedRoasterId(visibleRoasters[0].id);
    }
  }, [visibleRoasters, selectedRoasterId]);

  // New Roaster Form Modal
  const [showNewRoasterModal, setShowNewRoasterModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(
    !isHeadOfFacilityOrHr ? currentUserDepartment : departmentLeadership[0]?.departmentName || ''
  );
  const [selectedUnit, setSelectedUnit] = useState(
    departmentLeadership.find((d) => d.departmentName.toLowerCase().includes(currentUserDepartment.toLowerCase()))?.units[0]?.unitName ||
    departmentLeadership[0]?.units[0]?.unitName || ''
  );
  const [targetYear, setTargetYear] = useState<number>(2027);

  // Print Hub Modal
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Edit Mode state for staff entries
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editGrade, setEditGrade] = useState('');
  const [editMonth, setEditMonth] = useState('January');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const activeRoaster = visibleRoasters.find((r) => r.id === selectedRoasterId) || visibleRoasters[0];

  const handleCreateNewRoaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !selectedUnit) return;

    // Filter staff in that unit/dept
    const unitStaff = (employees || []).filter(
      (emp) =>
        emp && (emp.department?.toLowerCase() === selectedDept.toLowerCase() ||
        emp.unit?.toLowerCase() === selectedUnit.toLowerCase())
    );

    const initialItems: AnnualUnitLeaveRoasterItem[] = (unitStaff.length > 0 ? unitStaff : (employees || []).slice(0, 6)).map((emp, index) => {
      const monthIdx = (index * 2) % 12;
      return {
        id: `an-item-${Date.now()}-${index}`,
        employeeId: emp.id,
        staffName: `${emp.firstName} ${emp.lastName}`,
        empCode: emp.employeeCode || `PJ-${1000 + index}`,
        currentGrade: emp.jobTitle || 'Clinical Staff',
        leaveMonth: MONTHS_LIST[monthIdx],
        proposedStartDate: `${targetYear}-0${(monthIdx % 9) + 1}-01`,
        proposedEndDate: `${targetYear}-0${(monthIdx % 9) + 1}-30`,
        leaveDays: 30,
      };
    });

    const newRoaster: AnnualUnitLeaveRoaster = {
      id: `an-roster-${Date.now()}`,
      departmentName: selectedDept,
      unitName: selectedUnit,
      year: targetYear,
      preparedByUnitHead: currentUser?.name || 'Unit Head In-Charge',
      unitHeadEmail: currentUser?.email || 'unithead@popejohnpaul2med.org',
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Submitted to HR',
      items: initialItems,
    };

    saveAnnualUnitLeaveRoaster(newRoaster);
    setSelectedRoasterId(newRoaster.id);
    setShowNewRoasterModal(false);
    triggerToast(`Annual Leave Roaster for ${selectedUnit} (${targetYear}) created & submitted to HR!`);
  };

  const handleStartEditItem = (item: AnnualUnitLeaveRoasterItem) => {
    setEditingItemId(item.id);
    setEditGrade(item.currentGrade);
    setEditMonth(item.leaveMonth);
    setEditStart(item.proposedStartDate);
    setEditEnd(item.proposedEndDate);
    setEditRemarks(item.hrRemarks || '');
  };

  const handleSaveItemEdit = (itemId: string) => {
    if (!activeRoaster) return;
    updateAnnualLeaveItemByHR(activeRoaster.id, itemId, {
      currentGrade: editGrade,
      leaveMonth: editMonth,
      proposedStartDate: editStart,
      proposedEndDate: editEnd,
      hrRemarks: editRemarks,
    });
    setEditingItemId(null);
    triggerToast('Leave roaster record updated by HR.');
  };

  const handleApproveRoaster = () => {
    if (!activeRoaster) return;
    approveAnnualUnitLeaveRoasterByHR(
      activeRoaster.id,
      currentUser?.name || 'Marcus Vance (HR Director)',
      'Verified staffing ratios across all months. Approved for annual leave execution.'
    );
    triggerToast(`Annual Leave Roaster for ${activeRoaster.unitName} (${activeRoaster.year}) VERIFIED & APPROVED by HR!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-blue-950 p-6 rounded-2xl border border-emerald-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <CalendarDays className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-300 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Upcoming Year Staff Leave Planning (2027)
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Annual Unit Leave Roaster</h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Unit Heads compile annual staff leave allocations (Staff Name, Current Grade, Month & Dates). HR reviews, modifies, and approves for hospital-wide clinical coverage balance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isUnitHead && (
              <button
                onClick={() => setShowNewRoasterModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Fill Unit Leave Roaster
              </button>
            )}

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-4 py-2.5 bg-sky-600/90 hover:bg-sky-600 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow"
              title="Open Official Annual Leave Roaster & Template Print Hub"
            >
              <Printer className="w-4 h-4" />
              Print Roaster / Blank Template
            </button>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Access Governance Notice */}
      <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
        isHeadOfFacilityOrHr
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">{isHeadOfFacilityOrHr ? '🌐' : '🔒'}</span>
          <div>
            <p className="font-bold text-xs">
              {isHeadOfFacilityOrHr
                ? 'Hospital-Wide Annual Leave Planning (Head of Facility & HR Mode)'
                : `Departmental Leave Planning: ${currentUserDepartment}`}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isHeadOfFacilityOrHr
                ? 'Full administrative authority to review, adjust, and approve annual leave rosters across all clinical departments.'
                : `Per hospital governance policy, all staff apart from the Head of Facility and HR can only access rosters and leave allocations for their own department (${currentUserDepartment}).`}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
          {visibleRoasters.length} Unit Rosters
        </span>
      </div>

      {/* Selector & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="w-full sm:w-80">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
              Select Submitted Unit Leave Roaster
            </label>
            <select
              value={selectedRoasterId}
              onChange={(e) => setSelectedRoasterId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {visibleRoasters.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.departmentName} — {r.unitName} ({r.year}) [{r.status}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeRoaster && (
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                activeRoaster.status === 'HR Verified & Approved'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
              }`}
            >
              {activeRoaster.status === 'HR Verified & Approved' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400" />
              )}
              {activeRoaster.status}
            </span>

            {isHR && activeRoaster.status !== 'HR Verified & Approved' && (
              <button
                onClick={handleApproveRoaster}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                HR Verify & Make Approval
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Table Card */}
      {activeRoaster ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Metadata Subheader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Department</div>
              <div className="font-bold text-slate-200 mt-0.5">{activeRoaster.departmentName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Unit / Division</div>
              <div className="font-bold text-emerald-400 mt-0.5">{activeRoaster.unitName}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Compiled By (Unit Head)</div>
              <div className="font-semibold text-slate-300 mt-0.5">{activeRoaster.preparedByUnitHead}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Submission Date</div>
              <div className="font-semibold text-slate-300 mt-0.5">{activeRoaster.submittedAt}</div>
            </div>
          </div>

          {activeRoaster.hrComments && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <span>
                <strong>HR Directorate Sign-Off Note:</strong> {activeRoaster.hrComments} (Signed by:{' '}
                {activeRoaster.hrVerifiedBy})
              </span>
            </div>
          )}

          {/* Leave Schedule Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Staff Name</th>
                  <th className="py-3.5 px-4">Staff ID</th>
                  <th className="py-3.5 px-4">Current Grade / Designation</th>
                  <th className="py-3.5 px-4">Leave Month</th>
                  <th className="py-3.5 px-4">Proposed Start Date</th>
                  <th className="py-3.5 px-4">Proposed End Date</th>
                  <th className="py-3.5 px-4">HR Remarks / Mod</th>
                  {isHR && <th className="py-3.5 px-4 text-right">HR Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {activeRoaster.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      item.hrModified ? 'bg-blue-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-500 font-bold">{idx + 1}</td>

                    <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                      {item.staffName}
                      {item.hrModified && (
                        <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30 font-semibold">
                          HR Mod
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400">{item.empCode}</td>

                    {/* Grade */}
                    <td className="py-3 px-4">
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={editGrade}
                          onChange={(e) => setEditGrade(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                      ) : (
                        <span className="font-medium text-slate-300">{item.currentGrade}</span>
                      )}
                    </td>

                    {/* Month */}
                    <td className="py-3 px-4">
                      {editingItemId === item.id ? (
                        <select
                          value={editMonth}
                          onChange={(e) => setEditMonth(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
                        >
                          {MONTHS_LIST.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-bold">
                          {item.leaveMonth}
                        </span>
                      )}
                    </td>

                    {/* Proposed Start Date */}
                    <td className="py-3 px-4">
                      {editingItemId === item.id ? (
                        <input
                          type="date"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-300">{item.proposedStartDate}</span>
                      )}
                    </td>

                    {/* Proposed End Date */}
                    <td className="py-3 px-4">
                      {editingItemId === item.id ? (
                        <input
                          type="date"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono text-slate-300">{item.proposedEndDate}</span>
                      )}
                    </td>

                    {/* HR Remarks */}
                    <td className="py-3 px-4 text-slate-400">
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          placeholder="e.g. Adjusted to avoid peak shift conflict"
                          value={editRemarks}
                          onChange={(e) => setEditRemarks(e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-slate-100 rounded px-2 py-1 text-xs focus:outline-none w-full"
                        />
                      ) : (
                        item.hrRemarks || <span className="text-slate-600 font-italic">No HR notes</span>
                      )}
                    </td>

                    {/* Actions */}
                    {isHR && (
                      <td className="py-3 px-4 text-right">
                        {editingItemId === item.id ? (
                          <button
                            onClick={() => handleSaveItemEdit(item.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                          >
                            <Check className="w-3.5 h-3.5" /> Save
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartEditItem(item)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto border border-slate-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit & Verify
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400">
          <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Unit Leave Roasters Found</h3>
          <p className="text-xs text-slate-400 mt-1">Click 'Fill Unit Leave Roaster' to generate a schedule for your unit.</p>
        </div>
      )}

      {/* Modal: New Unit Leave Roaster Form */}
      {showNewRoasterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" />
                Compile Upcoming Year Unit Leave Roaster
              </h3>
              <button
                onClick={() => setShowNewRoasterModal(false)}
                className="text-slate-400 hover:text-white font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewRoaster} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Department *</label>
                <select
                  required
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    const matchDept = departmentLeadership.find((d) => d.departmentName === e.target.value);
                    if (matchDept && matchDept.units.length > 0) {
                      setSelectedUnit(matchDept.units[0].unitName);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  {departmentLeadership.map((d) => (
                    <option key={d.id} value={d.departmentName}>
                      {d.departmentName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Unit / Division *</label>
                <select
                  required
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                >
                  {(departmentLeadership.find((d) => d.departmentName === selectedDept)?.units || []).map((u) => (
                    <option key={u.id} value={u.unitName}>
                      {u.unitName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Upcoming Year *</label>
                <input
                  type="number"
                  required
                  min={2026}
                  max={2030}
                  value={targetYear}
                  onChange={(e) => setTargetYear(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-[11px]">
                ℹ️ All staff currently assigned to this unit will be populated into the roaster with defaulted leave months & proposed start dates. You can adjust individual dates after generation.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewRoasterModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-950/50"
                >
                  Generate & Submit to HR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Print Hub Modal for Annual Unit Leave Roaster */}
      <PrintAnnualLeaveRoasterModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        roaster={activeRoaster}
        hospitalName="POPE JOHN PAUL II MEDICAL CENTRE - JAMASI"
      />
    </div>
  );
};
