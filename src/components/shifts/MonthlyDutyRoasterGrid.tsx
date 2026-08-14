import React, { useState } from 'react';
import {
  Calendar,
  Building2,
  Users,
  Save,
  Printer,
  Download,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Grid,
  Phone,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Check,
  MessageSquare,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

interface StaffRosterRow {
  id: string;
  name: string;
  phone: string;
  rank: string;
  shifts: string[]; // 30 or 31 days
}

export const MonthlyDutyRoasterGrid: React.FC = () => {
  const { selectedHospital, activeRole, currentUser } = useHrms();

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  const [month, setMonth] = useState<string>('APRIL');
  const [year, setYear] = useState<number>(2026);
  const [department, setDepartment] = useState<string>('CARDIOLOGY & ICU');
  const [preparedBy, setPreparedBy] = useState<string>('Dr. Kwame Mensah (HOD)');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // HR Approval Status per Department State
  const [hrStatusByDept, setHrStatusByDept] = useState<Record<string, { status: 'Pending HR Approval' | 'Approved' | 'Returned for Revision'; approvedBy?: string; approvedAt?: string; notes?: string }>>({
    'CARDIOLOGY & ICU': { status: 'Pending HR Approval' },
    'EMERGENCY & TRAUMA': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-05 10:30 AM' },
    'GENERAL MEDICAL WARDS': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-04 02:15 PM' },
    'SURGICAL SERVICES & OT': { status: 'Returned for Revision', notes: 'Please ensure at least 2 Senior Operating Theater Nurses are on night duty on weekends.' },
    'PEDIATRICS & NEONATAL': { status: 'Pending HR Approval' },
    'PHARMACY & DISPENSARY': { status: 'Approved', approvedBy: 'Marcus Vance (HR Director)', approvedAt: '2026-08-06 09:00 AM' },
    'RADIOLOGY & IMAGING': { status: 'Pending HR Approval' },
  });

  const currentHrStatus = hrStatusByDept[department] || { status: 'Pending HR Approval' };

  // HR Notes Modal for Return for Revision
  const [showRevisionModal, setShowRevisionModal] = useState<boolean>(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState<string>('');

  const handleApproveRoasterByHR = () => {
    const approverName = currentUser?.name || 'HR Director';
    const nowStr = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
    
    setHrStatusByDept((prev) => ({
      ...prev,
      [department]: {
        status: 'Approved',
        approvedBy: `${approverName} (HR)`,
        approvedAt: nowStr,
      },
    }));
  };

  const handleReturnRoasterForRevision = () => {
    if (!revisionNotesInput.trim()) return;
    setHrStatusByDept((prev) => ({
      ...prev,
      [department]: {
        status: 'Returned for Revision',
        notes: revisionNotesInput,
      },
    }));
    setShowRevisionModal(false);
    setRevisionNotesInput('');
  };

  // Generate day headers for April (30 days)
  const daysCount = 30;
  const daysArray = Array.from({ length: daysCount }, (_, i) => i + 1);

  // Day initials for April 2026 (April 1 is Wednesday -> W, Th, F, S, S, M, T...)
  const dayInitials = [
    'W', 'Th', 'F', 'S', 'S', 'M', 'T', 'W', 'Th', 'F',
    'S', 'S', 'M', 'T', 'W', 'Th', 'F', 'S', 'S', 'M',
    'T', 'W', 'Th', 'F', 'S', 'S', 'M', 'T', 'W', 'Th'
  ];

  // Initialize 30 Vertical Staff Members with initial sample data from the user template
  const initialStaffList: StaffRosterRow[] = [
    {
      id: '1',
      name: 'RAPHAEL',
      phone: '0260978648',
      rank: 'NO.1',
      shifts: ['M', 'M', 'O', 'O', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'M', 'M', 'M', 'M', 'M', 'O', 'O', 'M', 'M'],
    },
    {
      id: '2',
      name: 'FRANCIS',
      phone: '0554735461',
      rank: 'SN',
      shifts: ['N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'M'],
    },
    {
      id: '3',
      name: 'KENNEDY',
      phone: '0596165824',
      rank: 'NO.2',
      shifts: ['M', 'A', 'M', 'A', 'M', 'A', 'M', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'M'],
    },
    {
      id: '4',
      name: 'ELIJAH',
      phone: '0240797408',
      rank: 'R/N',
      shifts: ['O', 'O', 'O', 'M', 'A', 'M', 'A', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N'],
    },
    {
      id: '5',
      name: 'BOAKYE',
      phone: '0242244283',
      rank: 'PA',
      shifts: ['A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'M', 'A', 'M', 'A', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'M', 'A', 'M', 'A'],
    },
    {
      id: '6',
      name: 'SAMUEL',
      phone: '0245112233',
      rank: 'SN',
      shifts: ['M', 'M', 'M', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'N', 'N'],
    },
    {
      id: '7',
      name: 'PATRICIA',
      phone: '0208877665',
      rank: 'NO.1',
      shifts: ['A', 'A', 'M', 'M', 'O', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'N', 'N', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'N', 'N'],
    },
    {
      id: '8',
      name: 'KWAME',
      phone: '0543210987',
      rank: 'MO',
      shifts: ['M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O'],
    },
    {
      id: '9',
      name: 'ABENA',
      phone: '0267788990',
      rank: 'R/N',
      shifts: ['N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M'],
    },
    {
      id: '10',
      name: 'EMMANUEL',
      phone: '0501122334',
      rank: 'SR.N',
      shifts: ['O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A', 'N', 'N', 'O', 'O', 'M', 'M', 'A', 'A'],
    },
    {
      id: '11',
      name: 'GRACE',
      phone: '0243344556',
      rank: 'MW',
      shifts: ['M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O'],
    },
    {
      id: '12',
      name: 'DANIEL',
      phone: '0556677889',
      rank: 'PA',
      shifts: ['A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O'],
    },
    {
      id: '13',
      name: 'HARRIET',
      phone: '0209988776',
      rank: 'SN',
      shifts: ['N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O'],
    },
    {
      id: '14',
      name: 'ISAAC',
      phone: '0544455667',
      rank: 'NO.2',
      shifts: ['O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M', 'O', 'O', 'A', 'A', 'M', 'M'],
    },
    {
      id: '15',
      name: 'JOYCE',
      phone: '0261122334',
      rank: 'R/N',
      shifts: ['M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O', 'M', 'A', 'M', 'A', 'N', 'O'],
    },
    {
      id: '16',
      name: 'MICHAEL',
      phone: '0505566778',
      rank: 'MO',
      shifts: ['A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N', 'O', 'M', 'A', 'N'],
    },
    {
      id: '17',
      name: 'ELIZABETH',
      phone: '0248899001',
      rank: 'NO.1',
      shifts: ['M', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'A', 'O', 'O'],
    },
    {
      id: '18',
      name: 'PETER',
      phone: '0551122334',
      rank: 'SR.N',
      shifts: ['N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'O', 'O', 'A', 'A', 'A', 'O', 'O'],
    },
    {
      id: '19',
      name: 'RITA',
      phone: '0203344556',
      rank: 'SN',
      shifts: ['O', 'O', 'M', 'M', 'M', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M', 'M', 'A', 'A', 'A', 'O', 'O', 'N', 'N', 'N', 'O', 'O', 'M', 'M'],
    },
    {
      id: '20',
      name: 'CHARLES',
      phone: '0547788990',
      rank: 'PA',
      shifts: ['M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O', 'M', 'A', 'A', 'N', 'O', 'O'],
    },
    {
      id: '21',
      name: 'AGNES',
      phone: '0264455667',
      rank: 'MW',
      shifts: ['A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N', 'A', 'M', 'M', 'O', 'O', 'N'],
    },
    {
      id: '22',
      name: 'SOLOMON',
      phone: '0508899001',
      rank: 'R/N',
      shifts: ['N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M', 'N', 'O', 'O', 'M', 'A', 'M'],
    },
    {
      id: '23',
      name: 'ESTHER',
      phone: '0242233445',
      rank: 'NO.2',
      shifts: ['O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O', 'O', 'M', 'A', 'A', 'M', 'O'],
    },
    {
      id: '24',
      name: 'GIDEON',
      phone: '0559900112',
      rank: 'SN',
      shifts: ['M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N', 'M', 'M', 'O', 'O', 'N', 'N'],
    },
    {
      id: '25',
      name: 'MARY',
      phone: '0201122334',
      rank: 'PA',
      shifts: ['A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M', 'A', 'A', 'O', 'O', 'M', 'M'],
    },
    {
      id: '26',
      name: 'BENJAMIN',
      phone: '0546677889',
      rank: 'NO.1',
      shifts: ['N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A', 'N', 'N', 'O', 'O', 'A', 'A'],
    },
    {
      id: '27',
      name: 'BEATRICE',
      phone: '0263344556',
      rank: 'R/N',
      shifts: ['O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N'],
    },
    {
      id: '28',
      name: 'JOSEPH',
      phone: '0504455667',
      rank: 'SR.N',
      shifts: ['M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O', 'M', 'A', 'N', 'O', 'O'],
    },
    {
      id: '29',
      name: 'VERONICA',
      phone: '0247788990',
      rank: 'MW',
      shifts: ['A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N', 'A', 'M', 'O', 'O', 'N'],
    },
    {
      id: '30',
      name: 'THOMAS',
      phone: '0552233445',
      rank: 'PA',
      shifts: ['O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M', 'O', 'O', 'A', 'M', 'M'],
    },
  ];

  const [staffList, setStaffList] = useState<StaffRosterRow[]>(initialStaffList);

  // Cycle shift code on cell click: M -> A -> N -> O -> M
  const handleCellClick = (staffIndex: number, dayIndex: number) => {
    setStaffList((prev) => {
      const updated = [...prev];
      const row = { ...updated[staffIndex] };
      const currentShifts = [...row.shifts];
      const currentVal = currentShifts[dayIndex] || 'O';

      let nextVal = 'M';
      if (currentVal === 'M') nextVal = 'A';
      else if (currentVal === 'A') nextVal = 'N';
      else if (currentVal === 'N') nextVal = 'O';
      else if (currentVal === 'O') nextVal = 'M';

      currentShifts[dayIndex] = nextVal;
      row.shifts = currentShifts;
      updated[staffIndex] = row;
      return updated;
    });
  };

  // Update staff details
  const handleUpdateStaffDetail = (index: number, field: 'name' | 'phone' | 'rank', value: string) => {
    setStaffList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Calculate shift sums for each day column across all 30 staff members
  const getDailyCount = (dayIdx: number, shiftCode: string) => {
    return staffList.reduce((acc, staff) => {
      return acc + (staff.shifts[dayIdx] === shiftCode ? 1 : 0);
    }, 0);
  };

  // Quick fill rotating pattern
  const handleApplyAutoPattern = () => {
    setStaffList((prev) =>
      prev.map((staff, idx) => {
        const pattern = ['M', 'M', 'A', 'A', 'N', 'O', 'O'];
        const offset = idx % 7;
        const newShifts = Array.from({ length: 30 }, (_, d) => pattern[(d + offset) % 7]);
        return { ...staff, shifts: newShifts };
      })
    );
  };

  const handleSaveRoster = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleDownloadCSV = () => {
    const headers = ['NAMES', 'RANK', ...daysArray.map((d) => `Day ${d} (${dayInitials[d - 1]})`)];
    const rows = staffList.map((s) => [
      `"${s.name}-${s.phone}"`,
      `"${s.rank}"`,
      ...s.shifts.map((sh) => `"${sh}"`),
    ]);

    // Bottom summary rows
    const morningRow = ['"MORNING"', '""', ...daysArray.map((_, idx) => getDailyCount(idx, 'M'))];
    const afternoonRow = ['"AFTERNOON"', '""', ...daysArray.map((_, idx) => getDailyCount(idx, 'A'))];
    const nightRow = ['"NIGHT"', '""', ...daysArray.map((_, idx) => getDailyCount(idx, 'N'))];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"POPE JOHN PAUL II MEDICAL CENTRE - JAMASI"\n` +
      `"STAFF DUTY ROASTER - ${month} ${year}"\n` +
      `"Department: ${department}"\n` +
      `"Prepared By: ${preparedBy}"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(',')), morningRow.join(','), afternoonRow.join(','), nightRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PJPIIMC_Duty_Roaster_${month}_${year}_${department.replace(/[^a-zA-Z]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="rounded-2xl bg-slate-900/95 p-6 border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <Grid className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                PJPIIMC Official Departmental Monthly Duty Roaster
              </span>
              <h2 className="text-xl font-black text-white">
                POPE JOHN PAUL II MEDICAL CENTRE - JAMASI
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Departmental Heads Monthly Staff Duty Matrix (30 Vertical Staff Allocation & Shift Tally)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleApplyAutoPattern}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Auto-Fill Shift Pattern
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              <Download className="h-3.5 w-3.5 text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
            >
              <Printer className="h-3.5 w-3.5 text-sky-400" /> Print Roaster Template
            </button>
            <button
              onClick={handleSaveRoster}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50"
            >
              <Save className="h-4 w-4" /> Save Monthly Duty Roaster
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Monthly Duty Roaster saved successfully and registered for HR compliance audit!</span>
          </div>
        )}

        {/* HR Approval & Compliance Audit Banner */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <ShieldCheck className={`h-6 w-6 shrink-0 ${currentHrStatus.status === 'Approved' ? 'text-emerald-400' : currentHrStatus.status === 'Returned for Revision' ? 'text-rose-400' : 'text-amber-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-200">HR Roaster Audit Status for {department}:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                    currentHrStatus.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : currentHrStatus.status === 'Returned for Revision'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {currentHrStatus.status}
                </span>
              </div>
              {currentHrStatus.status === 'Approved' && (
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Approved by <strong className="text-emerald-400">{currentHrStatus.approvedBy}</strong> on {currentHrStatus.approvedAt}. Cleared for payroll and daily attendance tracking.
                </p>
              )}
              {currentHrStatus.status === 'Returned for Revision' && (
                <p className="text-[11px] text-rose-300 mt-0.5">
                  <strong>Revision Note:</strong> {currentHrStatus.notes}
                </p>
              )}
              {currentHrStatus.status === 'Pending HR Approval' && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pending HR Officer/Director verification of shift coverage and fatigue compliance.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isHRorAdmin && (
              <>
                {currentHrStatus.status !== 'Approved' && (
                  <button
                    onClick={handleApproveRoasterByHR}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                  >
                    <Check className="h-4 w-4" /> Approve Department Roaster
                  </button>
                )}

                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
                >
                  <XCircle className="h-4 w-4" /> Request Revision
                </button>
              </>
            )}
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-750 text-xs">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Month</label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value.toUpperCase())}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-black text-xs uppercase focus:border-emerald-500 focus:outline-none"
              placeholder="e.g. APRIL"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-black text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Hospital Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
            >
              <option value="CARDIOLOGY & ICU">CARDIOLOGY & ICU</option>
              <option value="EMERGENCY & TRAUMA">EMERGENCY & TRAUMA</option>
              <option value="GENERAL MEDICAL WARDS">GENERAL MEDICAL WARDS</option>
              <option value="SURGICAL SERVICES & OT">SURGICAL SERVICES & OT</option>
              <option value="PEDIATRICS & NEONATAL">PEDIATRICS & NEONATAL</option>
              <option value="PHARMACY & DISPENSARY">PHARMACY & DISPENSARY</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Prepared By (HOD)</label>
            <input
              type="text"
              value={preparedBy}
              onChange={(e) => setPreparedBy(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-white font-bold text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white">Shift Codes Legend:</span>
            <span className="flex items-center gap-1 font-bold text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> M = Morning
            </span>
            <span className="flex items-center gap-1 font-bold text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> A = Afternoon
            </span>
            <span className="flex items-center gap-1 font-bold text-sky-400">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> N = Night
            </span>
            <span className="flex items-center gap-1 font-bold text-rose-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> O = Off / Rest
            </span>
          </div>

          <span className="text-[10px] text-slate-400 italic">
            * Click any shift cell to toggle shift assignment code (M ➔ A ➔ N ➔ O)
          </span>
        </div>
      </div>

      {/* Main Grid Matrix Table (Matches Template exactly) */}
      <div className="rounded-2xl border border-slate-700/80 bg-slate-900 shadow-xl overflow-hidden">
        {/* Table Header Banner */}
        <div className="p-4 bg-slate-800/90 border-b border-slate-700/80 text-center space-y-1">
          <h1 className="text-lg font-black tracking-wider text-white uppercase">
            POPE JOHN PAUL II MEDICAL CENTRE - JAMASI
          </h1>
          <h2 className="text-sm font-extrabold text-emerald-400 uppercase tracking-widest">
            STAFF DUTY ROASTER — {month} {year}
          </h2>
          <p className="text-[11px] text-slate-300 font-mono">
            Department: <strong className="text-white">{department}</strong> | Vertically 30 Staff Assignments
          </p>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse font-mono select-none">
            <thead>
              {/* Row 1: DATE Header & Day Numbers 1..30 */}
              <tr className="bg-slate-800 text-slate-200 border-b border-slate-700 font-bold">
                <th className="px-3 py-2 text-left w-56 border-r border-slate-700 text-[11px] font-black uppercase tracking-wider text-white bg-slate-800">
                  DATE
                </th>
                <th className="px-2 py-2 w-20 border-r border-slate-700 text-[10px] font-bold text-slate-300 uppercase bg-slate-800">
                  RANK
                </th>
                {daysArray.map((d) => (
                  <th key={d} className="px-1 py-1.5 min-w-[28px] border-r border-slate-700 text-[11px] font-bold text-emerald-400 bg-slate-800">
                    {d}
                  </th>
                ))}
              </tr>

              {/* Row 2: NAMES Header & Day Initials W, Th, F, S... */}
              <tr className="bg-slate-800/80 text-slate-300 border-b-2 border-slate-600 font-bold text-[10px]">
                <th className="px-3 py-2 text-left border-r border-slate-700 font-extrabold text-white uppercase tracking-wider bg-slate-800/80">
                  NAMES
                </th>
                <th className="px-2 py-2 border-r border-slate-700 font-bold text-slate-300 bg-slate-800/80">
                  RANK
                </th>
                {dayInitials.map((dayInit, idx) => (
                  <th
                    key={idx}
                    className={`px-1 py-1 min-w-[28px] border-r border-slate-700 ${
                      dayInit === 'S' ? 'text-amber-300 font-black bg-amber-950/40' : 'text-slate-300 bg-slate-800/80'
                    }`}
                  >
                    {dayInit}
                  </th>
                ))}
              </tr>
            </thead>

            {/* 30 Vertical Staff Rows */}
            <tbody className="divide-y divide-slate-750 bg-slate-900 text-slate-200">
              {staffList.map((staff, staffIdx) => (
                <tr key={staff.id} className="hover:bg-slate-800/70 transition group">
                  {/* Staff Name & Phone Cell */}
                  <td className="px-2.5 py-1.5 text-left border-r border-slate-700 bg-slate-900 group-hover:bg-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0 text-right">
                        {staffIdx + 1}.
                      </span>
                      <input
                        type="text"
                        value={`${staff.name}-${staff.phone}`}
                        onChange={(e) => {
                          const val = e.target.value;
                          const parts = val.split('-');
                          handleUpdateStaffDetail(staffIdx, 'name', parts[0] || val);
                          if (parts[1]) handleUpdateStaffDetail(staffIdx, 'phone', parts[1]);
                        }}
                        className="w-full bg-transparent font-bold text-white text-[11px] focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 px-1 py-0.5 rounded uppercase"
                      />
                    </div>
                  </td>

                  {/* Staff Rank Cell */}
                  <td className="px-1.5 py-1.5 border-r border-slate-700 text-[10px] font-bold text-slate-300 bg-slate-900/90 group-hover:bg-slate-800/80">
                    <input
                      type="text"
                      value={staff.rank}
                      onChange={(e) => handleUpdateStaffDetail(staffIdx, 'rank', e.target.value.toUpperCase())}
                      className="w-full bg-transparent font-bold text-slate-200 text-center text-[10px] focus:bg-slate-800 focus:outline-none px-1 py-0.5 rounded uppercase"
                    />
                  </td>

                  {/* 30 Shift Code Cells for this staff */}
                  {staff.shifts.map((shiftCode, dayIdx) => {
                    let styleClass = 'text-slate-400 hover:bg-slate-800/90 bg-slate-900/60';
                    if (shiftCode === 'M') styleClass = 'text-emerald-300 bg-emerald-950/60 font-black border-emerald-500/30';
                    else if (shiftCode === 'A') styleClass = 'text-amber-300 bg-amber-950/60 font-black border-amber-500/30';
                    else if (shiftCode === 'N') styleClass = 'text-sky-300 bg-sky-950/60 font-black border-sky-500/30';
                    else if (shiftCode === 'O') styleClass = 'text-rose-300/90 bg-rose-950/40 font-bold border-rose-500/20';

                    return (
                      <td
                        key={dayIdx}
                        onClick={() => handleCellClick(staffIdx, dayIdx)}
                        className={`px-1 py-1 border-r border-slate-700 text-[11px] font-bold cursor-pointer transition select-none ${styleClass}`}
                        title={`Click to change shift for Day ${dayIdx + 1}`}
                      >
                        {shiftCode}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            {/* Bottom Summary Rows (Matching template: MORNING, AFTERNOON, NIGHT sums) */}
            <tfoot className="bg-slate-800 text-white font-extrabold border-t-2 border-slate-600">
              {/* MORNING COUNT ROW */}
              <tr className="border-b border-slate-700 text-emerald-400">
                <td className="px-3 py-2 text-left border-r border-slate-700 text-[11px] font-black uppercase bg-slate-800">
                  MORNING
                </td>
                <td className="px-2 py-2 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800">
                  TOTAL
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1.5 border-r border-slate-700 text-[11px] font-black bg-emerald-950/50">
                    {getDailyCount(dayIdx, 'M')}
                  </td>
                ))}
              </tr>

              {/* AFTERNOON COUNT ROW */}
              <tr className="border-b border-slate-700 text-amber-400">
                <td className="px-3 py-2 text-left border-r border-slate-700 text-[11px] font-black uppercase bg-slate-800">
                  AFTERNOON
                </td>
                <td className="px-2 py-2 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800">
                  TOTAL
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1.5 border-r border-slate-700 text-[11px] font-black bg-amber-950/50">
                    {getDailyCount(dayIdx, 'A')}
                  </td>
                ))}
              </tr>

              {/* NIGHT COUNT ROW */}
              <tr className="text-sky-300">
                <td className="px-3 py-2 text-left border-r border-slate-700 text-[11px] font-black uppercase bg-slate-800">
                  NIGHT
                </td>
                <td className="px-2 py-2 border-r border-slate-700 text-[10px] text-slate-300 bg-slate-800">
                  TOTAL
                </td>
                {daysArray.map((_, dayIdx) => (
                  <td key={dayIdx} className="px-1 py-1.5 border-r border-slate-700 text-[11px] font-black bg-sky-950/50">
                    {getDailyCount(dayIdx, 'N')}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* HR Revision Notes Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-400" /> Return {department} Duty Roaster for Revision
            </h3>
            <p className="text-slate-400">
              Provide required staffing coverage corrections or fatigue adjustments for the Head of Department.
            </p>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">HR Audit Notes & Instructions</label>
              <textarea
                rows={4}
                required
                value={revisionNotesInput}
                onChange={(e) => setRevisionNotesInput(e.target.value)}
                placeholder="e.g. Please adjust night shift assignments to ensure at least 2 Senior Staff Nurses are present on weekends..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRevisionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnRoasterForRevision}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-500 transition shadow"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
