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
import { DepartmentMonthlyRoster, StaffRosterRow } from '../../types/hrms';
import { transferDepartmentStaffToRosterGrid } from '../../utils/rosterTransferUtils';
import { PrintDutyRoasterModal } from './PrintDutyRoasterModal';

export const DepartmentRosterUploader: React.FC = () => {
  const {
    monthlyUnitRosters,
    addMonthlyUnitRoster,
    updateMonthlyUnitRosterStatus,
    activeRole,
    selectedHospital,
    isHeadOfFacilityOrHr,
    currentUserDepartment,
    canAccessDepartmentRoster,
    departmentLeadership,
    employees,
  } = useHrms();

  // Dynamic Departments from Leadership Source of Truth
  const availableDepartments = React.useMemo(() => {
    const list = (departmentLeadership || []).map((d) => d.departmentName).filter(Boolean);
    if (list.length > 0) return Array.from(new Set(list));
    return [
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
  }, [departmentLeadership]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [department, setDepartment] = useState<string>(
    !isHeadOfFacilityOrHr ? currentUserDepartment : availableDepartments[0] || 'Intensive Care Unit (ICU)'
  );
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
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Return for Revision Modal State
  const [returningRosterId, setReturningRosterId] = useState<string | null>(null);
  const [rejectionNotesText, setRejectionNotesText] = useState<string>('');

  // Helper for generating standard 30-staff monthly matrix
  const getStaffMatrixForRoster = (roster: DepartmentMonthlyRoster): StaffRosterRow[] => {
    return transferDepartmentStaffToRosterGrid(roster.department, employees, roster.staffGrid);
  };

  const daysArray = Array.from({ length: 30 }, (_, i) => i + 1);
  const dayInitials = [
    'W', 'Th', 'F', 'S', 'S', 'M', 'T', 'W', 'Th', 'F',
    'S', 'S', 'M', 'T', 'W', 'Th', 'F', 'S', 'S', 'M',
    'T', 'W', 'Th', 'F', 'S', 'S', 'M', 'T', 'W', 'Th',
  ];

  // Scoped Accessible Rosters based on Governance Policy
  const safeMonthlyRosters = (monthlyUnitRosters || []).filter(Boolean);
  const visibleRosters = safeMonthlyRosters.filter((r) => canAccessDepartmentRoster(r?.department));

  // Stats (Scoped)
  const totalRostersCount = visibleRosters.length;
  const pendingCount = visibleRosters.filter((r) => r?.status === 'Pending Verification' || r?.status === 'Pending HR Approval').length;
  const approvedCount = visibleRosters.filter((r) => r?.status === 'Approved').length;
  const revisionCount = visibleRosters.filter((r) => r?.status === 'Returned for Revision').length;

  // Filtered List
  const filteredRosters = visibleRosters.filter((r) => {
    if (!r) return false;
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Pending Verification' || statusFilter === 'Pending HR Approval'
        ? r.status === 'Pending Verification' || r.status === 'Pending HR Approval'
        : r.status === statusFilter);
    const matchesDept =
      !isHeadOfFacilityOrHr ||
      selectedDeptFilter === 'All' ||
      r.department === selectedDeptFilter;
    const matchesSearch =
      (r.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.unit || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.preparedBy || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.fileName || '').toLowerCase().includes(searchTerm.toLowerCase());

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
    const matrixStaff = getStaffMatrixForRoster(roster);
    const dayCols = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
    const headers = ['No', 'Staff Name', 'Phone', 'Rank', ...dayCols];

    const rows = matrixStaff.map((staff, idx) => [
      idx + 1,
      `"${staff.name}"`,
      `"${staff.phone}"`,
      `"${staff.rank}"`,
      ...staff.shifts.map((s) => `"${s}"`),
    ]);

    const mTotals = Array.from({ length: 30 }, (_, d) =>
      matrixStaff.reduce((sum, s) => sum + (s.shifts[d] === 'M' ? 1 : 0), 0)
    );
    const aTotals = Array.from({ length: 30 }, (_, d) =>
      matrixStaff.reduce((sum, s) => sum + (s.shifts[d] === 'A' ? 1 : 0), 0)
    );
    const nTotals = Array.from({ length: 30 }, (_, d) =>
      matrixStaff.reduce((sum, s) => sum + (s.shifts[d] === 'N' ? 1 : 0), 0)
    );

    const summaryRows = [
      ['', '"MORNING TOTAL (M)"', '', '', ...mTotals.map((t) => `"${t}"`)],
      ['', '"AFTERNOON TOTAL (A)"', '', '', ...aTotals.map((t) => `"${t}"`)],
      ['', '"NIGHT TOTAL (N)"', '', '', ...nTotals.map((t) => `"${t}"`)],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"POPE JOHN PAUL II MEDICAL CENTRE - JAMASI"\n` +
      `"DEPARTMENTAL STAFF DUTY ROASTER: ${roster.department.toUpperCase()} - ${roster.month.toUpperCase()} ${roster.year}"\n` +
      `"Unit: ${roster.unit} | Prepared By: ${roster.preparedBy} (${roster.preparedByRole})"\n` +
      `"Status: ${roster.status}"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(',')), ...summaryRows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${roster.department.replace(/[^a-zA-Z]/g, '_')}_Duty_Roaster_${roster.month}_${roster.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintDepartmentRoster = (roster: DepartmentMonthlyRoster) => {
    const gridRows = roster.dutyRosterGrid && roster.dutyRosterGrid.length > 0
      ? roster.dutyRosterGrid
      : [
          { staffName: 'Elena Rostova', role: 'Senior Nurse', week1: 'Morning (07-15)', week2: 'Night ICU (23-07)', week3: 'Off / Leave', week4: 'Evening (15-23)' },
          { staffName: 'Dr. Sarah Jenkins', role: 'Attending Physician', week1: '12h Emergency (07-19)', week2: 'Morning (07-15)', week3: 'Night ICU (23-07)', week4: 'On-Call 24h' },
        ];

    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Department Duty Roster - ${roster.department} (${roster.month} ${roster.year})</title>
  <style>
    @page { size: A4 landscape; margin: 8mm 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 12px; font-size: 10px; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px; }
    .meta { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9.5px; }
    th, td { border: 1px solid #64748b; padding: 6px 8px; text-align: left; }
    th { background: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 9px; }
    tr:nth-child(even) { background: #f8fafc; }
    .sign-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 15px; }
    .sign-box { border: 1px solid #94a3b8; border-radius: 6px; padding: 8px; background: #ffffff; font-size: 9px; }
    .sig-line { margin-top: 20px; border-top: 1px dashed #64748b; padding-top: 3px; display: flex; justify-content: space-between; font-size: 8px; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 8.5px; font-weight: 800; letter-spacing: 2px; color: #475569; text-transform: uppercase;">CATHOLIC HEALTH SERVICE TRUST (CHST)</div>
    <h2 style="margin: 2px 0; font-size: 16px; font-weight: 900; text-transform: uppercase;">${selectedHospital.name}</h2>
    <h3 style="margin: 0; font-size: 12px; font-weight: 800; color: #047857; text-transform: uppercase;">DEPARTMENTAL MONTHLY DUTY ROSTER (${roster.month.toUpperCase()} ${roster.year})</h3>
  </div>
  <div class="meta">
    <div><strong style="color: #64748b; font-size: 8px; text-transform: uppercase; display: block;">Department:</strong> ${roster.department}</div>
    <div><strong style="color: #64748b; font-size: 8px; text-transform: uppercase; display: block;">Unit / Ward:</strong> ${roster.unit}</div>
    <div><strong style="color: #64748b; font-size: 8px; text-transform: uppercase; display: block;">Prepared By:</strong> ${roster.preparedBy} (${roster.preparedByRole})</div>
    <div><strong style="color: #64748b; font-size: 8px; text-transform: uppercase; display: block;">HR Audit Status:</strong> <span style="font-weight: 900; color: ${roster.status === 'Approved' ? '#059669' : '#d97706'};">${roster.status}</span></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 25px;">#</th>
        <th>Staff Name</th>
        <th>Designation / Role</th>
        <th>Week 1 Allocation</th>
        <th>Week 2 Allocation</th>
        <th>Week 3 Allocation</th>
        <th>Week 4 Allocation</th>
      </tr>
    </thead>
    <tbody>
      ${gridRows.map((row, idx) => `
        <tr>
          <td style="font-weight: bold; color: #64748b;">${idx + 1}</td>
          <td style="font-weight: bold; color: #0f172a;">${row.staffName}</td>
          <td style="color: #475569;">${row.role}</td>
          <td style="font-weight: 600; color: #047857;">${row.week1}</td>
          <td style="font-weight: 600; color: #b45309;">${row.week2}</td>
          <td style="font-weight: 600; color: #334155;">${row.week3}</td>
          <td style="font-weight: 600; color: #0f766e;">${row.week4}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="sign-grid">
    <div class="sign-box">
      <div style="font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">1. Prepared By (Unit Head)</div>
      <div><strong>Name:</strong> ${roster.preparedBy}</div>
      <div class="sig-line"><span>Signature: _______________</span><span>Date: ${roster.submissionDate}</span></div>
    </div>
    <div class="sign-box">
      <div style="font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">2. Directorate of HR</div>
      <div><strong>Verified:</strong> Human Resources Audit</div>
      <div class="sig-line"><span>Stamp & Sign: _____________</span><span>Date: ____/____/2026</span></div>
    </div>
    <div class="sign-box">
      <div style="font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">3. Medical Admin</div>
      <div><strong>Authority:</strong> Hospital Administration</div>
      <div class="sig-line"><span>Seal: _____________________</span><span>Date: ____/____/2026</span></div>
    </div>
  </div>
  <script>window.onload = function() { setTimeout(function() { window.print(); }, 300); };</script>
</body>
</html>`;

    try {
      const printWindow = window.open('', '_blank', 'width=1100,height=800');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlDoc);
        printWindow.document.close();
        printWindow.focus();
        return;
      }
    } catch (e) {
      console.warn('Popup blocked, fallback to hidden iframe', e);
    }

    try {
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = 'none';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);

      const iframeDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(htmlDoc);
        iframeDoc.close();

        setTimeout(() => {
          if (printIframe.contentWindow) {
            printIframe.contentWindow.focus();
            printIframe.contentWindow.print();
          } else {
            window.print();
          }
          setTimeout(() => {
            try {
              document.body.removeChild(printIframe);
            } catch (err) {
              // Ignore
            }
          }, 2000);
        }, 400);
        return;
      }
    } catch (err) {
      console.warn('Iframe print failed', err);
    }

    window.print();
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
            onClick={() => setStatusFilter('Pending Verification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'Pending Verification' || statusFilter === 'Pending HR Approval'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-300" />
            Pending Verification ({pendingCount})
          </button>

          <button
            onClick={() => setStatusFilter('Approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'Approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            Approved ({approvedCount})
          </button>

          <button
            onClick={() => setStatusFilter('Returned for Revision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'Returned for Revision'
                ? 'bg-rose-600 text-white shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5 text-rose-300" />
            Returned for Revision ({revisionCount})
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

          {isHeadOfFacilityOrHr ? (
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {availableDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <span>🔒 {currentUserDepartment}</span>
            </div>
          )}
        </div>
      </div>

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
                ? 'Hospital-Wide Roster Document Archive (Facility Head & HR Authority)'
                : `Departmental Document Access: ${currentUserDepartment}`}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isHeadOfFacilityOrHr
                ? 'Authorized to view, review, approve, and return monthly duty rosters from all hospital departments.'
                : 'Per hospital governance guidelines, staff members are restricted to viewing and managing rosters for their designated department only.'}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
          {filteredRosters.length} Records
        </span>
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
                      {roster.status === 'Approved' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                          Approved
                        </span>
                      ) : roster.status === 'Returned for Revision' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm">
                          <AlertCircle className="h-3 w-3 text-rose-400" />
                          Returned for Revision
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          <Clock className="h-3 w-3 text-amber-400" />
                          Pending Verification
                        </span>
                      )}
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

                        {(roster.status === 'Pending Verification' || roster.status === 'Pending HR Approval') && isHeadOfFacilityOrHr && (
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
                              <XCircle className="h-3.5 w-3.5" /> Request Revision
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
                    {availableDepartments.map((d) => (
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

      {/* MODAL 2: ROSTER PREVIEW & HR AUDIT MODAL (30 STAFF DUTY MATRIX) */}
      {selectedRosterForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-7xl max-h-[94vh] overflow-y-auto rounded-3xl bg-slate-900 border border-slate-700 p-4 sm:p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Official Submitted Duty Matrix
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Catholic Health Service Trust (CHST) • Pope John Paul II Medical Centre - Jamasi
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Building2 className="h-6 w-6 text-emerald-400 shrink-0" />
                  {selectedRosterForReview.department.toUpperCase()} — STAFF DUTY ROASTER ({selectedRosterForReview.month.toUpperCase()} {selectedRosterForReview.year})
                </h2>
                <p className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                  <span><strong>Unit:</strong> {selectedRosterForReview.unit}</span>
                  <span>•</span>
                  <span><strong>Prepared By:</strong> {selectedRosterForReview.preparedBy} ({selectedRosterForReview.preparedByRole})</span>
                  <span>•</span>
                  <span><strong>Submitted:</strong> {selectedRosterForReview.submissionDate}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 px-3.5 py-2 text-xs font-bold text-white transition shadow shadow-sky-950/40"
                  title="Print Official Roaster Matrix"
                >
                  <Printer className="h-4 w-4" /> Print Roaster Matrix
                </button>
                <button
                  onClick={() => handleDownloadRosterCSV(selectedRosterForReview)}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 border border-slate-700 transition"
                >
                  <Download className="h-4 w-4 text-emerald-400" /> Export CSV
                </button>
                <button
                  onClick={() => setSelectedRosterForReview(null)}
                  className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:text-white hover:bg-slate-700 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Hospital & Ward</span>
                <p className="font-bold text-slate-200 truncate">{selectedHospital.name}</p>
                <p className="text-[10px] text-emerald-400 truncate">{selectedRosterForReview.unit}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Total Staff Deployed</span>
                <p className="font-extrabold text-white text-sm">30 Vertical Staff Members</p>
                <p className="text-[10px] text-slate-400">Clinical Shifts (M / A / N / O)</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">File Reference</span>
                <p className="font-mono text-slate-200 truncate text-[11px]">{selectedRosterForReview.fileName}</p>
                <p className="text-[10px] text-slate-400">{selectedRosterForReview.fileSize}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">HR Audit Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-extrabold text-xs px-2.5 py-1 rounded-lg border ${
                    selectedRosterForReview.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : selectedRosterForReview.status === 'Returned for Revision'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {selectedRosterForReview.status === 'Approved' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  {selectedRosterForReview.status === 'Returned for Revision' && <AlertCircle className="h-3.5 w-3.5 text-rose-400" />}
                  {(selectedRosterForReview.status === 'Pending Verification' || selectedRosterForReview.status === 'Pending HR Approval') && (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <Clock className="h-3.5 w-3.5 text-amber-400" />
                    </>
                  )}
                  {selectedRosterForReview.status === 'Pending HR Approval' ? 'Pending Verification' : selectedRosterForReview.status}
                </span>
                {selectedRosterForReview.reviewedBy && (
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">By {selectedRosterForReview.reviewedBy}</p>
                )}
              </div>
            </div>

            {/* 30-STAFF MONTHLY DUTY ROASTER GRID */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                  Staff Duty Allocation Matrix (30 Days × 30 Staff)
                </h4>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 font-bold text-emerald-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block"></span> M = Morning
                  </span>
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block"></span> A = Afternoon
                  </span>
                  <span className="flex items-center gap-1 font-bold text-rose-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block"></span> N = Night
                  </span>
                  <span className="flex items-center gap-1 font-bold text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-600 inline-block"></span> O = Off
                  </span>
                </div>
              </div>

              {/* Matrix Table */}
              {(() => {
                const matrixStaff = getStaffMatrixForRoster(selectedRosterForReview);
                const getDailySum = (dayIdx: number, code: string) => {
                  return matrixStaff.reduce((acc, s) => acc + (s.shifts[dayIdx] === code ? 1 : 0), 0);
                };

                return (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full border-collapse text-center text-xs">
                        <thead className="sticky top-0 z-20 bg-slate-900 border-b-2 border-slate-700 text-slate-300">
                          {/* Row 1: DATE Header */}
                          <tr className="bg-slate-950 text-slate-400 font-extrabold text-[11px]">
                            <th className="sticky left-0 z-30 bg-slate-950 px-3 py-2 text-left font-black text-emerald-400 border-r border-slate-800 min-w-[150px]">
                              DATE
                            </th>
                            <th className="sticky left-[150px] z-30 bg-slate-950 px-2 py-2 text-center font-bold text-slate-300 border-r border-slate-800 w-16">
                              RANK
                            </th>
                            {daysArray.map((d) => (
                              <th key={d} className="px-1.5 py-1.5 font-mono text-slate-300 border-r border-slate-800/80 min-w-[28px]">
                                {d}
                              </th>
                            ))}
                          </tr>

                          {/* Row 2: NAMES & Day of Week Header */}
                          <tr className="bg-slate-900 text-slate-300 font-black text-[10px] border-b border-slate-800">
                            <th className="sticky left-0 z-30 bg-slate-900 px-3 py-2 text-left font-black text-slate-200 border-r border-slate-800">
                              NAMES
                            </th>
                            <th className="sticky left-[150px] z-30 bg-slate-900 px-2 py-2 text-center font-bold text-slate-300 border-r border-slate-800">
                              RANK
                            </th>
                            {daysArray.map((d) => (
                              <th key={d} className="px-1.5 py-1 font-bold text-slate-400 border-r border-slate-800/80">
                                {dayInitials[d - 1]}
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
                          {matrixStaff.map((staff, sIdx) => (
                            <tr key={staff.id || sIdx} className="hover:bg-slate-900/70 transition">
                              {/* Staff Name & Phone */}
                              <td className="sticky left-0 z-10 bg-slate-950/95 hover:bg-slate-900 px-3 py-1.5 text-left font-bold text-slate-100 border-r border-slate-800 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-slate-500 w-4">{sIdx + 1}.</span>
                                  <span className="text-xs text-white">{staff.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">- {staff.phone}</span>
                                </div>
                              </td>

                              {/* Rank */}
                              <td className="sticky left-[150px] z-10 bg-slate-950/95 hover:bg-slate-900 px-2 py-1.5 text-center font-bold border-r border-slate-800 whitespace-nowrap">
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-extrabold bg-slate-800 text-teal-300 border border-slate-700">
                                  {staff.rank}
                                </span>
                              </td>

                              {/* 30 Day Shift Cells */}
                              {daysArray.map((d, dIdx) => {
                                const code = staff.shifts[dIdx] || 'O';
                                return (
                                  <td
                                    key={d}
                                    className="px-0.5 py-1 border-r border-slate-800/40 text-center font-black font-mono text-xs"
                                  >
                                    <span
                                      className={`inline-block w-6 h-6 leading-6 rounded-md ${
                                        code === 'M'
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                          : code === 'A'
                                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                          : code === 'N'
                                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                          : 'text-slate-600 bg-slate-900/40'
                                      }`}
                                    >
                                      {code}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}

                          {/* BOTTOM SUMMARY ROW 1: MORNING TOTAL */}
                          <tr className="bg-emerald-950/40 font-black text-emerald-300 border-t-2 border-emerald-800/60">
                            <td className="sticky left-0 z-10 bg-emerald-950/90 px-3 py-2 text-left font-black text-emerald-300 border-r border-emerald-800/60 uppercase">
                              MORNING TOTAL
                            </td>
                            <td className="sticky left-[150px] z-10 bg-emerald-950/90 px-2 py-2 text-center font-black text-emerald-400 border-r border-emerald-800/60">
                              (M)
                            </td>
                            {daysArray.map((_, dIdx) => (
                              <td key={dIdx} className="px-1 py-1.5 font-black font-mono text-xs border-r border-emerald-900/50">
                                {getDailySum(dIdx, 'M')}
                              </td>
                            ))}
                          </tr>

                          {/* BOTTOM SUMMARY ROW 2: AFTERNOON TOTAL */}
                          <tr className="bg-amber-950/40 font-black text-amber-300 border-t border-amber-900/40">
                            <td className="sticky left-0 z-10 bg-amber-950/90 px-3 py-2 text-left font-black text-amber-300 border-r border-amber-900/60 uppercase">
                              AFTERNOON TOTAL
                            </td>
                            <td className="sticky left-[150px] z-10 bg-amber-950/90 px-2 py-2 text-center font-black text-amber-400 border-r border-amber-900/60">
                              (A)
                            </td>
                            {daysArray.map((_, dIdx) => (
                              <td key={dIdx} className="px-1 py-1.5 font-black font-mono text-xs border-r border-amber-900/50">
                                {getDailySum(dIdx, 'A')}
                              </td>
                            ))}
                          </tr>

                          {/* BOTTOM SUMMARY ROW 3: NIGHT TOTAL */}
                          <tr className="bg-rose-950/40 font-black text-rose-300 border-t border-rose-900/40">
                            <td className="sticky left-0 z-10 bg-rose-950/90 px-3 py-2 text-left font-black text-rose-300 border-r border-rose-900/60 uppercase">
                              NIGHT TOTAL
                            </td>
                            <td className="sticky left-[150px] z-10 bg-rose-950/90 px-2 py-2 text-center font-black text-rose-400 border-r border-rose-900/60">
                              (N)
                            </td>
                            {daysArray.map((_, dIdx) => (
                              <td key={dIdx} className="px-1 py-1.5 font-black font-mono text-xs border-r border-rose-900/50">
                                {getDailySum(dIdx, 'N')}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Notes and Revision Blocks */}
            {selectedRosterForReview.notes && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-400 block mb-1">Unit Head Handover & Clinical Constraints:</span>
                <p className="text-slate-300">{selectedRosterForReview.notes}</p>
              </div>
            )}

            {selectedRosterForReview.rejectionNotes && (
              <div className="p-3.5 bg-rose-950/40 rounded-2xl border border-rose-500/30 text-xs">
                <span className="font-bold text-rose-300 block mb-1">HR Audit Revision Instructions:</span>
                <p className="text-rose-200">{selectedRosterForReview.rejectionNotes}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Roster Status:</span>
                <span className="font-black text-white">{selectedRosterForReview.status}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(selectedRosterForReview.status === 'Pending Verification' || selectedRosterForReview.status === 'Pending HR Approval') && isHeadOfFacilityOrHr && (
                  <>
                    <button
                      onClick={() => {
                        updateMonthlyUnitRosterStatus(selectedRosterForReview.id, 'Approved');
                        setSelectedRosterForReview(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" /> Approve & Sign Off Duty Roaster
                    </button>

                    <button
                      onClick={() => {
                        setReturningRosterId(selectedRosterForReview.id);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/30 text-rose-300 font-bold text-xs hover:bg-rose-900 transition flex items-center gap-1.5"
                    >
                      <XCircle className="h-4 w-4" /> Request Revision
                    </button>
                  </>
                )}

                <button
                  onClick={() => setSelectedRosterForReview(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700"
                >
                  Close Matrix
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRINT MODAL EMBED */}
      {selectedRosterForReview && isPrintModalOpen && (
        <PrintDutyRoasterModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          month={selectedRosterForReview.month}
          year={selectedRosterForReview.year}
          department={selectedRosterForReview.department}
          preparedBy={selectedRosterForReview.preparedBy}
          staffList={getStaffMatrixForRoster(selectedRosterForReview)}
          hrApprovalStatus={{
            status: selectedRosterForReview.status,
            approvedBy: selectedRosterForReview.reviewedBy,
            approvedAt: selectedRosterForReview.reviewedDate,
            notes: selectedRosterForReview.rejectionNotes,
          }}
          hospitalName={selectedHospital.name}
        />
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
