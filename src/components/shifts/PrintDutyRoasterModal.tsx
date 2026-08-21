import React, { useState } from 'react';
import {
  Printer,
  X,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  Calendar,
  ShieldCheck,
  UserCheck,
  Award,
  Layers,
  Sparkles,
} from 'lucide-react';

interface StaffRosterRow {
  id: string;
  name: string;
  phone: string;
  rank: string;
  shifts: string[];
}

interface PrintDutyRoasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string;
  year: number;
  department: string;
  preparedBy: string;
  staffList: StaffRosterRow[];
  hrApprovalStatus?: {
    status: 'Pending HR Approval' | 'Approved' | 'Returned for Revision';
    approvedBy?: string;
    approvedAt?: string;
    notes?: string;
  };
  hospitalName?: string;
}

export const PrintDutyRoasterModal: React.FC<PrintDutyRoasterModalProps> = ({
  isOpen,
  onClose,
  month,
  year,
  department,
  preparedBy,
  staffList,
  hrApprovalStatus,
  hospitalName = 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI',
}) => {
  const resolvedHospitalName = typeof hospitalName === 'object' ? (hospitalName as any)?.name || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI' : hospitalName || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI';
  const [templateMode, setTemplateMode] = useState<'filled' | 'blank'>('filled');
  const [blankRowCount, setBlankRowCount] = useState<number>(30);
  const [includeGuidelines, setIncludeGuidelines] = useState<boolean>(true);

  if (!isOpen) return null;

  const daysInMonth = 30;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const dayInitials = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Generate blank dummy staff rows for template printing
  const blankStaffList: StaffRosterRow[] = Array.from({ length: blankRowCount }, (_, idx) => ({
    id: `blank-${idx}`,
    name: '',
    phone: '',
    rank: '',
    shifts: Array(daysInMonth).fill(''),
  }));

  const activeStaffToPrint = templateMode === 'filled' ? staffList : blankStaffList;

  // Calculate shift tallies for filled mode
  const getDailyCount = (dayIdx: number, shiftCode: string) => {
    if (templateMode === 'blank') return '';
    return (staffList || []).filter((s) => s && s.shifts && s.shifts[dayIdx] === shiftCode).length;
  };

  const generatePrintableHtml = () => {
    const isBlank = templateMode === 'blank';
    const isApproved = hrApprovalStatus?.status === 'Approved';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Staff Monthly Duty Roaster - ${department} (${month} ${year})</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 6mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, Helvetica, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 10px;
      font-size: 9.5px;
      line-height: 1.25;
    }
    .header-container {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 5px;
      margin-bottom: 6px;
    }
    .inst-badge {
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .main-title {
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 1px 0;
      color: #0f172a;
    }
    .sub-title {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #047857;
      margin: 0 0 2px 0;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 8px;
      margin-bottom: 6px;
      font-size: 9px;
    }
    .meta-item {
      font-weight: bold;
    }
    .meta-item span {
      color: #64748b;
      font-weight: normal;
      text-transform: uppercase;
      font-size: 8px;
      margin-right: 3px;
    }
    .legend-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 3px 8px;
      margin-bottom: 6px;
      font-size: 8.5px;
      border-radius: 3px;
    }
    .legend-tag {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-weight: 600;
    }
    .badge-code {
      display: inline-block;
      width: 14px;
      text-align: center;
      font-weight: 900;
      border-radius: 2px;
      padding: 1px 0;
      font-size: 8px;
    }
    .code-m { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
    .code-a { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
    .code-n { background-color: #e0f2fe; color: #075985; border: 1px solid #bae6fd; }
    .code-off { background-color: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .code-l { background-color: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; }
    .code-s { background-color: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }

    table.roster-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8px;
      margin-bottom: 6px;
      table-layout: fixed;
    }
    table.roster-table th, table.roster-table td {
      border: 1px solid #64748b;
      padding: 2.5px 1.5px;
      text-align: center;
      vertical-align: middle;
      overflow: hidden;
      white-space: nowrap;
    }
    table.roster-table th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: bold;
      font-size: 7.5px;
      text-transform: uppercase;
    }
    table.roster-table th.th-day {
      width: 2.1%;
      padding: 1px 0;
    }
    table.roster-table th.th-name {
      width: 15%;
      text-align: left;
      padding-left: 4px;
    }
    table.roster-table th.th-rank {
      width: 10%;
      text-align: left;
      padding-left: 4px;
    }
    table.roster-table th.th-num {
      width: 2.2%;
    }
    table.roster-table td.td-name {
      text-align: left;
      padding-left: 4px;
      font-weight: bold;
      font-size: 8px;
      color: #0f172a;
    }
    table.roster-table td.td-rank {
      text-align: left;
      padding-left: 4px;
      color: #334155;
      font-size: 7.5px;
    }
    table.roster-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .weekend-col {
      background-color: #f1f5f9;
    }
    .tally-row {
      background-color: #e2e8f0 !important;
      font-weight: bold;
      border-top: 2px solid #0f172a;
    }
    .tally-label {
      text-align: right !important;
      padding-right: 6px !important;
      font-weight: 900 !important;
      text-transform: uppercase;
      font-size: 7.5px;
    }
    .cell-m { color: #047857; font-weight: bold; background-color: #f0fdf4; }
    .cell-a { color: #b45309; font-weight: bold; background-color: #fffbeb; }
    .cell-n { color: #0369a1; font-weight: bold; background-color: #f0f9ff; }
    .cell-off { color: #b91c1c; font-weight: bold; background-color: #fef2f2; }
    .cell-l { color: #7e22ce; font-weight: bold; background-color: #faf5ff; }
    .cell-s { color: #c2410c; font-weight: bold; background-color: #fff7ed; }

    .sign-section {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: 8px;
      page-break-inside: avoid;
    }
    .sign-box {
      border: 1px solid #94a3b8;
      border-radius: 4px;
      padding: 6px 8px;
      background-color: #ffffff;
      font-size: 8px;
    }
    .sign-title {
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 2px;
      margin-bottom: 4px;
      font-size: 8px;
    }
    .sign-line {
      margin-top: 14px;
      border-top: 1px dashed #64748b;
      padding-top: 2px;
      display: flex;
      justify-content: space-between;
      font-size: 7.5px;
      color: #475569;
    }
    .status-stamp {
      display: inline-block;
      border: 1.5px solid #059669;
      color: #059669;
      font-weight: 900;
      text-transform: uppercase;
      padding: 2px 5px;
      border-radius: 3px;
      font-size: 7.5px;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }
    .guidelines {
      margin-top: 6px;
      font-size: 7.5px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      padding-top: 3px;
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="inst-badge">CATHOLIC HEALTH SERVICE TRUST (CHST) • HEALTH SERVICES DIRECTORATE</div>
    <h1 class="main-title">${resolvedHospitalName}</h1>
    <h2 class="sub-title">OFFICIAL DEPARTMENTAL MONTHLY STAFF DUTY ROASTER / SHIFT SCHEDULE</h2>
  </div>

  <div class="meta-bar">
    <div class="meta-item"><span>DEPARTMENT:</span> ${department}</div>
    <div class="meta-item"><span>ROASTER PERIOD:</span> ${month.toUpperCase()} ${year}</div>
    <div class="meta-item"><span>PREPARED BY:</span> ${preparedBy}</div>
    <div class="meta-item"><span>AUDIT STATUS:</span> ${
      isApproved ? 'CHST HR COMPLIANT & APPROVED' : isBlank ? 'OFFICIAL BLANK TEMPLATE' : 'PENDING HR FINAL AUDIT'
    }</div>
  </div>

  <div class="legend-bar">
    <span style="font-weight: 800; font-size: 8px; color: #0f172a;">SHIFT CODES & WORK HOURS:</span>
    <span class="legend-tag"><span class="badge-code code-m">M</span> Morning (07:00 - 15:00)</span>
    <span class="legend-tag"><span class="badge-code code-a">A</span> Afternoon (15:00 - 23:00)</span>
    <span class="legend-tag"><span class="badge-code code-n">N</span> Night Duty (23:00 - 07:00)</span>
    <span class="legend-tag"><span class="badge-code code-off">OFF</span> Off Duty</span>
    <span class="legend-tag"><span class="badge-code code-l">L</span> Annual / CME Leave</span>
    <span class="legend-tag"><span class="badge-code code-s">S</span> Sick / Emergency</span>
  </div>

  <table class="roster-table">
    <thead>
      <tr>
        <th rowspan="2" class="th-num">#</th>
        <th rowspan="2" class="th-name">Staff Name & Contact</th>
        <th rowspan="2" class="th-rank">Rank / Cadre</th>
        ${daysArray
          .map((d) => {
            const dayOfWeek = dayInitials[(d - 1) % 7];
            const isWknd = dayOfWeek === 'S';
            return `<th class="th-day ${isWknd ? 'weekend-col' : ''}">${d}</th>`;
          })
          .join('')}
      </tr>
      <tr>
        ${daysArray
          .map((d) => {
            const dayOfWeek = dayInitials[(d - 1) % 7];
            const isWknd = dayOfWeek === 'S';
            return `<th class="th-day ${isWknd ? 'weekend-col' : ''}" style="background-color: #1e293b;">${dayOfWeek}</th>`;
          })
          .join('')}
      </tr>
    </thead>
    <tbody>
      ${activeStaffToPrint
        .map((staff, idx) => {
          return `<tr>
            <td style="font-weight: bold; color: #64748b;">${idx + 1}</td>
            <td class="td-name">${staff.name || ''} ${staff.phone ? `<span style="font-weight: normal; color: #64748b; font-size: 7px;">(${staff.phone})</span>` : ''}</td>
            <td class="td-rank">${staff.rank || ''}</td>
            ${daysArray
              .map((_, dayIdx) => {
                const shift = staff.shifts[dayIdx] || '';
                let cellClass = '';
                if (shift === 'M') cellClass = 'cell-m';
                else if (shift === 'A') cellClass = 'cell-a';
                else if (shift === 'N') cellClass = 'cell-n';
                else if (shift === 'OFF') cellClass = 'cell-off';
                else if (shift === 'L') cellClass = 'cell-l';
                else if (shift === 'S') cellClass = 'cell-s';
                return `<td class="${cellClass}">${shift}</td>`;
              })
              .join('')}
          </tr>`;
        })
        .join('')}

      <!-- Bottom Shift Tallies -->
      <tr class="tally-row">
        <td colspan="3" class="tally-label">MORNING (M) SHIFT COVERAGE</td>
        ${daysArray.map((_, dayIdx) => `<td>${getDailyCount(dayIdx, 'M')}</td>`).join('')}
      </tr>
      <tr class="tally-row" style="background-color: #f1f5f9 !important;">
        <td colspan="3" class="tally-label">AFTERNOON (A) SHIFT COVERAGE</td>
        ${daysArray.map((_, dayIdx) => `<td>${getDailyCount(dayIdx, 'A')}</td>`).join('')}
      </tr>
      <tr class="tally-row" style="background-color: #e2e8f0 !important;">
        <td colspan="3" class="tally-label">NIGHT (N) SHIFT COVERAGE</td>
        ${daysArray.map((_, dayIdx) => `<td>${getDailyCount(dayIdx, 'N')}</td>`).join('')}
      </tr>
      <tr class="tally-row" style="background-color: #f1f5f9 !important;">
        <td colspan="3" class="tally-label">OFF / LEAVE TALLY</td>
        ${daysArray.map((_, dayIdx) => `<td>${getDailyCount(dayIdx, 'OFF')}</td>`).join('')}
      </tr>
    </tbody>
  </table>

  <!-- Signatures Section -->
  <div class="sign-section">
    <div class="sign-box">
      <div class="sign-title">1. PREPARED BY (HEAD OF DEPARTMENT / UNIT)</div>
      <div><strong>Name:</strong> ${preparedBy}</div>
      <div><strong>Designation:</strong> Head of Department / Ward In-Charge</div>
      <div class="sign-line">
        <span>Signature: ______________________</span>
        <span>Date: ${new Date().toISOString().slice(0, 10)}</span>
      </div>
    </div>

    <div class="sign-box">
      <div class="sign-title">2. VERIFIED & APPROVED (HR DIRECTORATE)</div>
      <div><strong>Verified By:</strong> ${hrApprovalStatus?.approvedBy || 'Director of Human Resources (CHST)'}</div>
      <div><strong>Status:</strong> ${
        isApproved
          ? '<span class="status-stamp">✓ CHST HR VERIFIED & CLEARED</span>'
          : isBlank
          ? '<span style="color: #64748b; font-style: italic;">Official Template</span>'
          : '<span style="color: #b45309; font-style: italic;">Awaiting HR Final Stamp</span>'
      }</div>
      <div class="sign-line">
        <span>Official Stamp & Signature</span>
        <span>Date: ${hrApprovalStatus?.approvedAt?.slice(0, 10) || '____/____/2026'}</span>
      </div>
    </div>

    <div class="sign-box">
      <div class="sign-title">3. FACILITY IN-CHARGE / MEDICAL ADMIN</div>
      <div><strong>Authorization:</strong> Chief Medical Officer / Medical Admin</div>
      <div><strong>Registry:</strong> CHST Hospital Master Operations Log</div>
      <div class="sign-line">
        <span>Executive Seal: _________________</span>
        <span>Date: ____/____/2026</span>
      </div>
    </div>
  </div>

  ${
    includeGuidelines
      ? `<div class="guidelines">
    <strong>OPERATIONAL POLICIES:</strong> 1. Roster must be submitted to the Directorate of Human Resources 7 working days prior to the roster month. 2. Shift swaps require mutual consent and HOD written approval. 3. Continuous night shift duty shall not exceed fatigue risk standards. 4. Display a certified copy at the nurse station.
  </div>`
      : ''
  }

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;
  };

  const handlePrint = () => {
    const htmlDoc = generatePrintableHtml();

    // 1. Standalone window print attempt
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
      console.warn('Popup window blocked, using hidden iframe fallback', e);
    }

    // 2. Hidden iframe print trigger (works 100% inside sandboxed web views)
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
              // Ignore cleanup
            }
          }, 2000);
        }, 400);
        return;
      }
    } catch (err) {
      console.warn('Iframe print failed, fallback to window.print()', err);
    }

    window.print();
  };

  const handleDownloadHtml = () => {
    const htmlDoc = generatePrintableHtml();
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PJPIIMC_Duty_Roaster_${month}_${year}_${department.replace(/[^a-zA-Z0-9]/g, '_')}_${templateMode}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-slate-100 space-y-5">
        {/* Modal Top Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                CHST Institutional Print & PDF Export Hub
              </div>
              <h3 className="text-base font-black">Official Staff Monthly Duty Roaster Print Preview</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 font-bold text-sm transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Template Mode Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setTemplateMode('filled')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
              templateMode === 'filled'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
            }`}
          >
            <CheckCircle2 className={`h-5 w-5 shrink-0 mt-0.5 ${templateMode === 'filled' ? 'text-white' : 'text-emerald-500'}`} />
            <div>
              <div className="text-xs font-black">1. Print Filled Active Duty Roaster</div>
              <p className={`text-[11px] mt-0.5 ${templateMode === 'filled' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Prints current schedule with {staffList.length} staff, shift codes, tallies, and HR verification stamps.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTemplateMode('blank')}
            className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
              templateMode === 'blank'
                ? 'bg-sky-600 text-white border-sky-600 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-sky-500/50'
            }`}
          >
            <FileSpreadsheet className={`h-5 w-5 shrink-0 mt-0.5 ${templateMode === 'blank' ? 'text-white' : 'text-sky-500'}`} />
            <div>
              <div className="text-xs font-black">2. Print Official Blank Roster Template</div>
              <p className={`text-[11px] mt-0.5 ${templateMode === 'blank' ? 'text-sky-100' : 'text-slate-400'}`}>
                Clean blank grid with headers and signature blocks for physical ward planning or bulletin board posting.
              </p>
            </div>
          </button>
        </div>

        {/* Configuration Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 font-semibold">Period:</span>{' '}
              <strong className="text-slate-800 dark:text-slate-200">{month} {year}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Department:</span>{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{department}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Layout:</span>{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">A4 Landscape</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {templateMode === 'blank' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-bold">Blank Rows:</span>
                <select
                  value={blankRowCount}
                  onChange={(e) => setBlankRowCount(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value={15}>15 Rows</option>
                  <option value={20}>20 Rows</option>
                  <option value={25}>25 Rows</option>
                  <option value={30}>30 Rows</option>
                  <option value={35}>35 Rows</option>
                </select>
              </div>
            )}

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeGuidelines}
                onChange={(e) => setIncludeGuidelines(e.target.checked)}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Include Policy Footer</span>
            </label>
          </div>
        </div>

        {/* Scaled Visual Document Preview Canvas */}
        <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-4 overflow-x-auto shadow-inner">
          <div className="min-w-[760px] bg-white text-slate-900 p-5 rounded-xl shadow-lg border border-slate-300 text-[10px] space-y-3 font-sans">
            {/* Header Preview */}
            <div className="text-center border-b-2 border-slate-900 pb-2">
              <div className="text-[8px] font-black tracking-widest text-slate-500 uppercase">
                CATHOLIC HEALTH SERVICE TRUST (CHST) • HEALTH SERVICES DIRECTORATE
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900">{resolvedHospitalName}</h4>
              <div className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wide">
                OFFICIAL DEPARTMENTAL MONTHLY STAFF DUTY ROASTER / SHIFT SCHEDULE
              </div>
            </div>

            {/* Meta bar preview */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded p-1.5 text-[9px] font-bold">
              <div><span className="text-slate-400 font-normal">DEPT:</span> {department}</div>
              <div><span className="text-slate-400 font-normal">PERIOD:</span> {month} {year}</div>
              <div><span className="text-slate-400 font-normal">HOD:</span> {preparedBy}</div>
              <div className="text-emerald-700 font-black">
                {templateMode === 'filled'
                  ? hrApprovalStatus?.status === 'Approved' ? 'CHST APPROVED' : 'DRAFT ROSTER'
                  : 'BLANK TEMPLATE'}
              </div>
            </div>

            {/* Grid preview snippet */}
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-center border-collapse text-[8px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold">
                    <th className="p-1 w-6">#</th>
                    <th className="p-1 text-left w-36">Staff Name</th>
                    <th className="p-1 text-left w-24">Rank</th>
                    {daysArray.slice(0, 15).map((d) => (
                      <th key={d} className="p-0.5">{d}</th>
                    ))}
                    <th className="p-0.5">...</th>
                    {daysArray.slice(-3).map((d) => (
                      <th key={d} className="p-0.5">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(templateMode === 'filled' ? staffList.slice(0, 5) : blankStaffList.slice(0, 5)).map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-1 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-1 text-left font-bold text-slate-800">{s.name || '____________________'}</td>
                      <td className="p-1 text-left text-slate-600">{s.rank || 'Staff Nurse'}</td>
                      {daysArray.slice(0, 15).map((_, dIdx) => (
                        <td key={dIdx} className="p-0.5 font-bold text-emerald-700">
                          {templateMode === 'filled' ? s.shifts[dIdx] || 'M' : ''}
                        </td>
                      ))}
                      <td className="p-0.5 text-slate-400">...</td>
                      {daysArray.slice(-3).map((_, dIdx) => (
                        <td key={dIdx} className="p-0.5 font-bold text-emerald-700">
                          {templateMode === 'filled' ? s.shifts[27 + dIdx] || 'OFF' : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Preview */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="border border-slate-200 rounded p-1.5 text-[7.5px] bg-slate-50">
                <div className="font-bold border-b border-slate-200 pb-0.5 text-slate-700 uppercase">1. Prepared By (HOD)</div>
                <div className="text-slate-600 mt-1">Name: {preparedBy}</div>
                <div className="mt-2 border-t border-dashed border-slate-400 pt-0.5 text-slate-400">Signature & Date</div>
              </div>
              <div className="border border-slate-200 rounded p-1.5 text-[7.5px] bg-slate-50">
                <div className="font-bold border-b border-slate-200 pb-0.5 text-slate-700 uppercase">2. HR Verification</div>
                <div className="text-slate-600 mt-1">CHST Human Resources</div>
                <div className="mt-2 border-t border-dashed border-slate-400 pt-0.5 text-emerald-700 font-bold">Official Seal & Sign</div>
              </div>
              <div className="border border-slate-200 rounded p-1.5 text-[7.5px] bg-slate-50">
                <div className="font-bold border-b border-slate-200 pb-0.5 text-slate-700 uppercase">3. Facility Head</div>
                <div className="text-slate-600 mt-1">Medical Administrator</div>
                <div className="mt-2 border-t border-dashed border-slate-400 pt-0.5 text-slate-400">Executive Approval</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Output configured for standard <strong className="text-slate-700 dark:text-slate-200">A4 Landscape</strong> printing with crisp borders and auto-scaling.
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Download className="h-4 w-4 text-emerald-500" /> Download HTML File
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-sky-600/30"
            >
              <Printer className="h-4 w-4" /> Print Document Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
