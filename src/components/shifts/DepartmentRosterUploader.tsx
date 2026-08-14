import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Building2,
  Clock,
  Users,
  Search,
  Filter,
  Eye,
  Download,
  Plus,
  Send,
  ShieldCheck,
  Calendar,
  X,
  MessageSquare,
  Sparkles,
  Check,
  Printer,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { DepartmentMonthlyRoster } from '../../types/hrms';

export const DepartmentRosterUploader: React.FC = () => {
  const {
    monthlyUnitRosters,
    addMonthlyUnitRoster,
    updateMonthlyUnitRosterStatus,
    activeRole,
    selectedHospital,
  } = useHrms();

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [department, setDepartment] = useState<string>('Intensive Care Unit (ICU)');
  const [unit, setUnit] = useState<string>('ICU Critical Care Ward');
  const [month, setMonth] = useState<string>('September');
  const [year, setYear] = useState<number>(2026);
  const [preparedBy, setPreparedBy] = useState<string>('Dr. Kwame Mensah');
  const [preparedByRole, setPreparedByRole] = useState<string>('Head of ICU & Critical Care');
  const [preparedByEmail, setPreparedByEmail] = useState<string>('kwame.mensah@popejohnpaul2med.org');
  const [totalStaffCount, setTotalStaffCount] = useState<number>(18);
  const [totalPlannedHours, setTotalPlannedHours] = useState<number>(2880);
  const [notes, setNotes] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');

  // Shift counts for submission
  const [morningShifts, setMorningShifts] = useState<number>(120);
  const [eveningShifts, setEveningShifts] = useState<number>(110);
  const [nightShifts, setNightShifts] = useState<number>(90);
  const [onCallCoverage, setOnCallCoverage] = useState<number>(40);

  // Detail / Review Modal State
  const [selectedRosterForReview, setSelectedRosterForReview] = useState<DepartmentMonthlyRoster | null>(null);

  // Return for Revision Modal State
  const [returningRosterId, setReturningRosterId] = useState<string | null>(null);
  const [rejectionNotesText, setRejectionNotesText] = useState<string>('');

  // Department List
  const hospitalDepartments = [
    'Intensive Care Unit (ICU)',
    'Emergency & Trauma Dept',
    'Surgical Operating Theater',
    'Pediatrics & Neonatal Unit',
    'Pharmacy & Dispensary',
    'Radiology & Imaging',
    'Outpatient Dept (OPD)',
    'Obstetrics & Gynecology',
    'General Medical Wards',
  ];

  // Stats
  const totalRostersCount = monthlyUnitRosters.length;
  const pendingCount = monthlyUnitRosters.filter((r) => r.status === 'Pending HR Approval').length;
  const approvedCount = monthlyUnitRosters.filter((r) => r.status === 'Approved').length;
  const revisionCount = monthlyUnitRosters.filter((r) => r.status === 'Returned for Revision').length;

  // Filtered List
  const filteredRosters = monthlyUnitRosters.filter((r) => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesDept = selectedDeptFilter === 'All' || r.department === selectedDeptFilter;
    const matchesSearch =
      r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.preparedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesDept && matchesSearch;
  });

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setUploadedFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    } else {
      setUploadedFileName(`${department.replace(/[^a-zA-Z]/g, '_')}_Duty_Roster_Sept2026.xlsx`);
      setUploadedFileSize('2.4 MB');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addMonthlyUnitRoster({
      department,
      unit,
      month,
      year,
      preparedBy,
      preparedByRole,
      preparedByEmail,
      totalStaffCount,
      totalPlannedHours,
      fileName: uploadedFileName || `${department.replace(/[^a-zA-Z]/g, '_')}_Duty_Roster_${month}${year}.xlsx`,
      fileSize: uploadedFileSize || '2.1 MB',
      notes,
      shiftsSummary: {
        morningShifts,
        eveningShifts,
        nightShifts,
        onCallCoverage,
      },
    });

    setIsUploadModalOpen(false);
    // Reset defaults
    setUploadedFileName('');
    setUploadedFileSize('');
    setNotes('');
  };

  const handleConfirmReturnForRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returningRosterId) return;

    updateMonthlyUnitRosterStatus(returningRosterId, 'Returned for Revision', rejectionNotesText);
    setReturningRosterId(null);
    setRejectionNotesText('');
    setSelectedRosterForReview(null);
  };

  const handleDownloadRosterCSV = (roster: DepartmentMonthlyRoster) => {
    const headers = ['Staff Name', 'Role', 'Week 1 Shift', 'Week 2 Shift', 'Week 3 Shift', 'Week 4 Shift'];
    const rows = roster.dutyRosterGrid
      ? roster.dutyRosterGrid.map((g) => [
          `"${g.staffName}"`,
          `"${g.role}"`,
          `"${g.week1}"`,
          `"${g.week2}"`,
          `"${g.week3}"`,
          `"${g.week4}"`,
        ])
      : [
          ['"Staff Member 1"', '"Senior Nurse"', '"Morning (07-15)"', '"Night ICU (23-07)"', '"Off / Leave"', '"Evening (15-23)"'],
          ['"Staff Member 2"', '"Resident Doctor"', '"12h Emergency (07-19)"', '"Morning (07-15)"', '"Night ICU (23-07)"', '"On-Call 24h"'],
        ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"DEPARTMENT DUTY ROSTER: ${roster.department} - ${roster.month} ${roster.year}"\n` +
      `"Prepared By: ${roster.preparedBy} (${roster.preparedByRole})"\n` +
      `"Status: ${roster.status}"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${roster.department.replace(/[^a-zA-Z]/g, '_')}_Roster_${roster.month}_${roster.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Upload Trigger */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-slate-900/95 p-6 border border-slate-800 shadow-xl text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shrink-0">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Department & Unit Monthly Duty Roster Submissions
              </h2>
              <span className="rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-300 border border-teal-500/30">
                HR Approval Portal
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 max-w-2xl">
              Every hospital department and clinical unit uploads their monthly duty roster for HR compliance review, shift hour validation, and administrative sign-off for {selectedHospital.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-xs font-bold text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition shadow-sm"
            title="Print Submissions Audit List"
          >
            <Printer className="h-4 w-4 text-sky-400" /> Print Submissions
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500 transition active:scale-95"
          >
            <UploadCloud className="h-4 w-4" /> Upload Monthly Duty Roster
          </button>
        </div>
      </div>

      {/* Overview Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Total Unit Rosters</span>
            <FileSpreadsheet className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{totalRostersCount}</div>
          <p className="mt-1 text-[11px] text-slate-400">Submitted across hospital departments</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Pending HR Review</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-amber-300">{pendingCount}</div>
          <p className="mt-1 text-[11px] text-amber-300/80">Requires HR Director audit & sign-off</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Approved Rosters</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400">{approvedCount}</div>
          <p className="mt-1 text-[11px] text-emerald-300/80">Validated for payroll & shift deployment</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Returned for Revision</span>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-rose-400">{revisionCount}</div>
          <p className="mt-1 text-[11px] text-rose-300/80">Requires department head correction</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'All'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            All Submissions ({totalRostersCount})
          </button>

          <button
            onClick={() => setStatusFilter('Pending HR Approval')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'Pending HR Approval'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Pending HR Approval ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'Approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setStatusFilter('Returned for Revision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              statusFilter === 'Returned for Revision'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Returned ({revisionCount})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search department or file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {hospitalDepartments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster Submissions Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Monthly Department Roster Portal Register</h3>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredRosters.length} of {totalRostersCount} submissions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Department & Unit</th>
                <th className="px-5 py-3.5">Target Period</th>
                <th className="px-5 py-3.5">Prepared / Submitted By</th>
                <th className="px-5 py-3.5">Attached Roster File</th>
                <th className="px-5 py-3.5 text-center">Staff Count</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions & HR Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredRosters.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No department duty rosters match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRosters.map((roster) => (
                  <tr key={roster.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-emerald-400" />
                          {roster.department}
                        </span>
                        <p className="text-[10px] text-slate-400">{roster.unit}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 font-bold text-teal-300">
                        <Calendar className="h-3.5 w-3.5" />
                        {roster.month} {roster.year}
                      </span>
                      <p className="text-[10px] text-slate-400">Submitted: {roster.submissionDate}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-200">{roster.preparedBy}</span>
                      <p className="text-[10px] text-slate-400">{roster.preparedByRole}</p>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 max-w-xs">
                        <FileText className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-mono text-[11px] font-bold text-slate-200 truncate">{roster.fileName}</p>
                          <p className="text-[9px] text-slate-500">{roster.fileSize}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-200 border border-slate-700">
                        {roster.totalStaffCount} staff
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                          roster.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : roster.status === 'Returned for Revision'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {roster.status === 'Approved' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : roster.status === 'Returned for Revision' ? (
                          <AlertCircle className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {roster.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedRosterForReview(roster)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
                          title="Preview Roster Schedule"
                        >
                          <Eye className="h-3.5 w-3.5 text-teal-400" /> Preview
                        </button>

                        {roster.status === 'Pending HR Approval' && (
                          <>
                            <button
                              onClick={() => updateMonthlyUnitRosterStatus(roster.id, 'Approved')}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow"
                              title="Approve Roster"
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </button>

                            <button
                              onClick={() => setReturningRosterId(roster.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-950/60 border border-rose-500/30 px-2.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900 transition"
                              title="Return for Revision"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Return
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDownloadRosterCSV(roster)}
                          className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white transition"
                          title="Download Roster CSV"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: UPLOAD MONTHLY DUTY ROSTER */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Upload Department Monthly Duty Roster
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department / Specialty</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                    required
                  >
                    {hospitalDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit / Ward Name</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. ICU Critical Care Bay A"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roster Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    {['August', 'September', 'October', 'November', 'December', 'January'].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || 2026)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prepared By (Name)</label>
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={(e) => setPreparedBy(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Official Role</label>
                  <input
                    type="text"
                    value={preparedByRole}
                    onChange={(e) => setPreparedByRole(e.target.value)}
                    placeholder="e.g. Unit Head / Sister In-Charge"
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={preparedByEmail}
                    onChange={(e) => setPreparedByEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Staff Included</label>
                  <input
                    type="number"
                    value={totalStaffCount}
                    onChange={(e) => setTotalStaffCount(parseInt(e.target.value) || 1)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Planned Shift Hours</label>
                  <input
                    type="number"
                    value={totalPlannedHours}
                    onChange={(e) => setTotalPlannedHours(parseInt(e.target.value) || 160)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Shift Breakdown Counts */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 block">Monthly Shift Distribution Breakdown</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Morning Shifts</label>
                    <input
                      type="number"
                      value={morningShifts}
                      onChange={(e) => setMorningShifts(parseInt(e.target.value) || 0)}
                      className="w-full rounded bg-slate-900 border border-slate-700 p-1.5 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Evening Shifts</label>
                    <input
                      type="number"
                      value={eveningShifts}
                      onChange={(e) => setEveningShifts(parseInt(e.target.value) || 0)}
                      className="w-full rounded bg-slate-900 border border-slate-700 p-1.5 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Night ICU Shifts</label>
                    <input
                      type="number"
                      value={nightShifts}
                      onChange={(e) => setNightShifts(parseInt(e.target.value) || 0)}
                      className="w-full rounded bg-slate-900 border border-slate-700 p-1.5 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">On-Call Standby</label>
                    <input
                      type="number"
                      value={onCallCoverage}
                      onChange={(e) => setOnCallCoverage(parseInt(e.target.value) || 0)}
                      className="w-full rounded bg-slate-900 border border-slate-700 p-1.5 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* File Attachment Drag & Drop Area */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Upload Monthly Duty Roster Document (Excel / CSV / PDF)
                </label>
                <div className="relative border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950 p-5 text-center hover:border-emerald-500 transition cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf"
                    onChange={handleSimulateFileSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
                  <p className="font-semibold text-slate-200">
                    {uploadedFileName ? (
                      <span className="text-emerald-400 font-mono">✓ {uploadedFileName} ({uploadedFileSize})</span>
                    ) : (
                      'Click or Drag & Drop Unit Monthly Duty Roster file here'
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">Supports Excel (.xlsx), CSV (.csv), or Signed PDF (.pdf) up to 20MB</p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Handover Notes & Clinical Operational Constraints
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Roster includes weekend locum coverage for ICU ventilators..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/40"
                >
                  Submit Duty Roster to HR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ROSTER PREVIEW & HR AUDIT MODAL */}
      {selectedRosterForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  HR Audit & Roster Schedule Inspector
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-400" />
                  {selectedRosterForReview.department} — {selectedRosterForReview.month} {selectedRosterForReview.year} Duty Roster
                </h3>
              </div>

              <button
                onClick={() => setSelectedRosterForReview(null)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Submitter details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">Prepared By:</span>
                <p className="font-bold text-slate-200">{selectedRosterForReview.preparedBy}</p>
                <p className="text-[10px] text-slate-400">{selectedRosterForReview.preparedByRole}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px]">Submission Info:</span>
                <p className="font-bold text-slate-200">{selectedRosterForReview.submissionDate}</p>
                <p className="text-[10px] text-slate-400">{selectedRosterForReview.preparedByEmail}</p>
              </div>

              <div>
                <span className="text-slate-500 text-[10px]">Staff & Hours:</span>
                <p className="font-bold text-emerald-400">{selectedRosterForReview.totalStaffCount} Staff Members</p>
                <p className="text-[10px] text-slate-400">{selectedRosterForReview.totalPlannedHours} Planned Hours</p>
              </div>
            </div>

            {/* File Info & Export/Print Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
                <div>
                  <p className="font-mono font-bold text-white">{selectedRosterForReview.fileName}</p>
                  <p className="text-[10px] text-slate-400">Size: {selectedRosterForReview.fileSize}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
                  title="Print this Department Duty Roster"
                >
                  <Printer className="h-4 w-4 text-sky-400" /> Print Roster
                </button>
                <button
                  onClick={() => handleDownloadRosterCSV(selectedRosterForReview)}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
                >
                  <Download className="h-4 w-4 text-emerald-400" /> Export CSV
                </button>
              </div>
            </div>

            {/* Roster Grid Preview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Extracted Monthly Staff Schedule Grid
              </h4>

              <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Staff Name</th>
                      <th className="px-4 py-2.5">Role</th>
                      <th className="px-4 py-2.5">Week 1</th>
                      <th className="px-4 py-2.5">Week 2</th>
                      <th className="px-4 py-2.5">Week 3</th>
                      <th className="px-4 py-2.5">Week 4</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    {(selectedRosterForReview.dutyRosterGrid || [
                      { staffName: 'Elena Rostova', role: 'Senior Nurse', week1: 'Morning (07-15)', week2: 'Night ICU (23-07)', week3: 'Off / Leave', week4: 'Evening (15-23)' },
                      { staffName: 'Dr. Sarah Jenkins', role: 'Attending Physician', week1: '12h Emergency (07-19)', week2: 'Morning (07-15)', week3: 'Night ICU (23-07)', week4: 'On-Call 24h' },
                    ]).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="px-4 py-2.5 font-bold text-white">{row.staffName}</td>
                        <td className="px-4 py-2.5 text-slate-400">{row.role}</td>
                        <td className="px-4 py-2.5 font-mono text-emerald-400">{row.week1}</td>
                        <td className="px-4 py-2.5 font-mono text-amber-300">{row.week2}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-300">{row.week3}</td>
                        <td className="px-4 py-2.5 font-mono text-teal-300">{row.week4}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes or Rejection Reason */}
            {selectedRosterForReview.notes && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 block">Unit Head Submission Notes:</span>
                <p className="text-slate-300 mt-1">{selectedRosterForReview.notes}</p>
              </div>
            )}

            {selectedRosterForReview.rejectionNotes && (
              <div className="p-3 bg-rose-950/40 rounded-xl border border-rose-500/30 text-xs">
                <span className="font-bold text-rose-300 block">HR Revision Instructions:</span>
                <p className="text-rose-200 mt-1">{selectedRosterForReview.rejectionNotes}</p>
              </div>
            )}

            {/* HR Decision Controls */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-xs text-slate-400">
                Current Status:{' '}
                <strong className="text-white">{selectedRosterForReview.status}</strong>
              </span>

              <div className="flex gap-2">
                {selectedRosterForReview.status === 'Pending HR Approval' && (
                  <>
                    <button
                      onClick={() => {
                        updateMonthlyUnitRosterStatus(selectedRosterForReview.id, 'Approved');
                        setSelectedRosterForReview(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow"
                    >
                      Approve & Sign Off
                    </button>

                    <button
                      onClick={() => {
                        setReturningRosterId(selectedRosterForReview.id);
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-900 transition"
                    >
                      Return for Revision
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedRosterForReview(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: RETURN FOR REVISION */}
      {returningRosterId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" /> Return Duty Roster for Revision
            </h3>
            <p className="text-xs text-slate-400">
              Provide required corrections or staffing coverage notes for the unit head to adjust and resubmit.
            </p>

            <form onSubmit={handleConfirmReturnForRevision} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">HR Revision Notes & Instructions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Please ensure at least 3 Senior ICU Nurses are assigned to night shifts during weekend ventilator maintenance..."
                  value={rejectionNotesText}
                  onChange={(e) => setRejectionNotesText(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturningRosterId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition shadow"
                >
                  Return to Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
