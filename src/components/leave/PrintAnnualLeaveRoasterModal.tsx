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
import { AnnualUnitLeaveRoaster, AnnualUnitLeaveRoasterItem } from '../../types/hrms';

interface PrintAnnualLeaveRoasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  roaster: AnnualUnitLeaveRoaster | null;
  hospitalName?: string;
}

export const PrintAnnualLeaveRoasterModal: React.FC<PrintAnnualLeaveRoasterModalProps> = ({
  isOpen,
  onClose,
  roaster,
  hospitalName = 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI',
}) => {
  const resolvedHospitalName = typeof hospitalName === 'object' ? (hospitalName as any)?.name || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI' : hospitalName || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI';
  const [templateMode, setTemplateMode] = useState<'filled' | 'blank'>('filled');
  const [blankRowCount, setBlankRowCount] = useState<number>(20);
  const [includeGuidelines, setIncludeGuidelines] = useState<boolean>(true);

  if (!isOpen) return null;

  const currentYear = roaster?.year || 2027;
  const deptName = roaster?.departmentName || 'General Clinical Services';
  const unitName = roaster?.unitName || 'Clinical Unit';
  const unitHead = roaster?.preparedByUnitHead || 'Unit In-Charge';
  const isApproved = roaster?.status === 'HR Verified & Approved';

  const blankItems: AnnualUnitLeaveRoasterItem[] = Array.from({ length: blankRowCount }, (_, idx) => ({
    id: `blank-item-${idx}`,
    employeeId: `blank-${idx}`,
    staffName: '',
    empCode: '',
    currentGrade: '',
    leaveMonth: '',
    proposedStartDate: '',
    proposedEndDate: '',
    leaveDays: 30,
  }));

  const activeItemsToPrint = templateMode === 'filled' && roaster?.items ? roaster.items : blankItems;

  const generatePrintableHtml = () => {
    const isBlank = templateMode === 'blank';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Annual Unit Leave Roaster - ${deptName} - ${unitName} (${currentYear})</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 8mm 10mm;
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
      padding: 12px;
      font-size: 10px;
      line-height: 1.35;
    }
    .header-container {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .inst-badge {
      font-size: 8.5px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #475569;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .main-title {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 2px 0;
      color: #0f172a;
    }
    .sub-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #047857;
      margin: 0 0 2px 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 10px;
      font-size: 9.5px;
    }
    .meta-box {
      font-weight: bold;
    }
    .meta-label {
      color: #64748b;
      font-weight: normal;
      text-transform: uppercase;
      font-size: 8px;
      display: block;
    }
    .meta-val {
      color: #0f172a;
      font-size: 10px;
    }
    table.roaster-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-bottom: 10px;
    }
    table.roaster-table th, table.roaster-table td {
      border: 1px solid #64748b;
      padding: 5px 6px;
      vertical-align: middle;
    }
    table.roaster-table th {
      background-color: #0f172a;
      color: #ffffff;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 8.5px;
      text-align: left;
    }
    table.roaster-table th.center, table.roaster-table td.center {
      text-align: center;
    }
    table.roaster-table tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .month-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      font-weight: bold;
      font-size: 8.5px;
    }
    .sign-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-top: 12px;
      page-break-inside: avoid;
    }
    .sign-card {
      border: 1px solid #94a3b8;
      border-radius: 6px;
      padding: 6px 8px;
      background-color: #ffffff;
      font-size: 8.5px;
    }
    .sign-header {
      font-weight: 800;
      text-transform: uppercase;
      color: #0f172a;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-bottom: 6px;
      font-size: 8px;
    }
    .sig-line {
      margin-top: 20px;
      border-top: 1px dashed #64748b;
      padding-top: 3px;
      font-size: 7.5px;
      color: #475569;
      display: flex;
      justify-content: space-between;
    }
    .approved-stamp {
      display: inline-block;
      border: 1.5px solid #059669;
      color: #059669;
      font-weight: 900;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 8px;
      margin-top: 3px;
      letter-spacing: 0.5px;
    }
    .guidelines {
      margin-top: 8px;
      font-size: 8px;
      color: #64748b;
      border-top: 1px solid #cbd5e1;
      padding-top: 4px;
    }
  </style>
</head>
<body>
  <div class="header-container">
    <div class="inst-badge">CATHOLIC HEALTH SERVICE TRUST (CHST) • DIRECTORATE OF HUMAN RESOURCES</div>
    <h1 class="main-title">${resolvedHospitalName}</h1>
    <h2 class="sub-title">OFFICIAL ANNUAL UNIT LEAVE ROASTER & CLINICAL COVERAGE SCHEDULE (YEAR ${currentYear})</h2>
  </div>

  <div class="meta-grid">
    <div class="meta-box">
      <span class="meta-label">Department</span>
      <div class="meta-val">${deptName}</div>
    </div>
    <div class="meta-box">
      <span class="meta-label">Unit / Ward</span>
      <div class="meta-val">${unitName}</div>
    </div>
    <div class="meta-box">
      <span class="meta-label">Compiled By (Unit Head)</span>
      <div class="meta-val">${unitHead}</div>
    </div>
    <div class="meta-box">
      <span class="meta-label">HR Compliance Audit</span>
      <div class="meta-val" style="color: ${isApproved ? '#059669' : '#d97706'}; font-weight: 900;">
        ${isApproved ? 'HR VERIFIED & APPROVED' : isBlank ? 'OFFICIAL BLANK TEMPLATE' : 'SUBMITTED TO HR'}
      </div>
    </div>
  </div>

  <table class="roaster-table">
    <thead>
      <tr>
        <th class="center" style="width: 28px;">#</th>
        <th style="width: 140px;">Staff Full Name</th>
        <th style="width: 75px;">Staff PIN / ID</th>
        <th style="width: 120px;">Current Grade / Designation</th>
        <th class="center" style="width: 85px;">Leave Month</th>
        <th class="center" style="width: 85px;">Proposed Start</th>
        <th class="center" style="width: 85px;">Proposed End</th>
        <th class="center" style="width: 60px;">Days</th>
        <th style="width: 110px;">Relieving Officer</th>
        <th>HR Remarks / Adjustments</th>
      </tr>
    </thead>
    <tbody>
      ${activeItemsToPrint
        .map((item, idx) => {
          return `<tr>
            <td class="center" style="font-weight: bold; color: #64748b;">${idx + 1}</td>
            <td style="font-weight: bold; color: #0f172a;">${item.staffName || ''}</td>
            <td style="font-family: monospace; color: #475569;">${item.empCode || ''}</td>
            <td style="color: #334155;">${item.currentGrade || ''}</td>
            <td class="center">
              ${item.leaveMonth ? `<span class="month-badge">${item.leaveMonth}</span>` : ''}
            </td>
            <td class="center" style="font-family: monospace;">${item.proposedStartDate || ''}</td>
            <td class="center" style="font-family: monospace;">${item.proposedEndDate || ''}</td>
            <td class="center" style="font-weight: bold; color: #0f172a;">${item.leaveDays ? `${item.leaveDays}d` : ''}</td>
            <td style="color: #475569;">${isBlank ? '' : 'Assigned Unit Peer'}</td>
            <td style="color: #64748b; font-size: 8px;">${item.hrRemarks || (isBlank ? '' : 'Verified balanced')}</td>
          </tr>`;
        })
        .join('')}
    </tbody>
  </table>

  <!-- Signatures Section -->
  <div class="sign-grid">
    <div class="sign-card">
      <div class="sign-header">1. Unit Head Certification</div>
      <div><strong>Name:</strong> ${unitHead}</div>
      <div><strong>Role:</strong> Unit Head / Ward In-Charge</div>
      <div class="sig-line">
        <span>Signature: _________________</span>
        <span>Date: ${roaster?.submittedAt?.slice(0, 10) || new Date().toISOString().slice(0, 10)}</span>
      </div>
    </div>

    <div class="sign-card">
      <div class="sign-header">2. Head of Department Endorsement</div>
      <div><strong>Name:</strong> HOD - ${deptName}</div>
      <div><strong>Role:</strong> Clinical Department Head</div>
      <div class="sig-line">
        <span>Signature: _________________</span>
        <span>Date: ____/____/2026</span>
      </div>
    </div>

    <div class="sign-card">
      <div class="sign-header">3. Directorate of Human Resources</div>
      <div><strong>Verified By:</strong> ${roaster?.hrVerifiedBy || 'Director of HR (CHST)'}</div>
      <div>
        ${
          isApproved
            ? '<span class="approved-stamp">✓ CHST HR APPROVED</span>'
            : isBlank
            ? '<span style="color: #64748b; font-style: italic;">Official Template</span>'
            : '<span style="color: #b45309; font-style: italic;">Under Review</span>'
        }
      </div>
      <div class="sig-line">
        <span>Stamp & Sign: _____________</span>
        <span>Date: ${roaster?.hrVerifiedAt?.slice(0, 10) || '____/____/2026'}</span>
      </div>
    </div>

    <div class="sign-card">
      <div class="sign-header">4. Executive Management Approval</div>
      <div><strong>Authority:</strong> Chief Medical Officer / CEO</div>
      <div><strong>Seal:</strong> CHST Executive Seal</div>
      <div class="sig-line">
        <span>Authorization: _____________</span>
        <span>Date: ____/____/2026</span>
      </div>
    </div>
  </div>

  ${
    includeGuidelines
      ? `<div class="guidelines">
    <strong>POLICY DIRECTIVES:</strong> 1. Unit Leave Roasters must ensure minimum clinical staffing thresholds in all quarters. 2. Not more than two critical staff in the same unit can take annual leave simultaneously. 3. Final approved roasters become binding for the calendar year.
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
    link.download = `PJPIIMC_Annual_Leave_Roaster_${unitName.replace(/[^a-zA-Z0-9]/g, '_')}_${currentYear}_${templateMode}.html`;
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
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                CHST Directorate of Human Resources
              </div>
              <h3 className="text-base font-black">Annual Unit Leave Roaster Print Hub</h3>
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
              <div className="text-xs font-black">1. Print Filled Annual Leave Roaster</div>
              <p className={`text-[11px] mt-0.5 ${templateMode === 'filled' ? 'text-emerald-100' : 'text-slate-400'}`}>
                Prints compiled unit roster with all staff leave months, proposed start/end dates, and HR status.
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
              <div className="text-xs font-black">2. Print Official Blank Leave Roaster Template</div>
              <p className={`text-[11px] mt-0.5 ${templateMode === 'blank' ? 'text-sky-100' : 'text-slate-400'}`}>
                Official template with empty lines and guidelines for distributing to unit heads to collect annual leave plans.
              </p>
            </div>
          </button>
        </div>

        {/* Configuration Options */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs bg-slate-50/50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 font-semibold">Department:</span>{' '}
              <strong className="text-slate-800 dark:text-slate-200">{deptName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Unit:</span>{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{unitName}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold">Year:</span>{' '}
              <strong className="text-indigo-600 dark:text-indigo-400">{currentYear}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {templateMode === 'blank' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-bold">Template Rows:</span>
                <select
                  value={blankRowCount}
                  onChange={(e) => setBlankRowCount(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value={10}>10 Rows</option>
                  <option value={15}>15 Rows</option>
                  <option value={20}>20 Rows</option>
                  <option value={25}>25 Rows</option>
                  <option value={30}>30 Rows</option>
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
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Include Policy Directives</span>
            </label>
          </div>
        </div>

        {/* Scaled Preview Box */}
        <div className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 p-4 overflow-x-auto shadow-inner">
          <div className="min-w-[700px] bg-white text-slate-900 p-5 rounded-xl shadow-lg border border-slate-300 text-[10px] space-y-3 font-sans">
            <div className="text-center border-b-2 border-slate-900 pb-2">
              <div className="text-[8px] font-black tracking-widest text-slate-500 uppercase">
                CATHOLIC HEALTH SERVICE TRUST (CHST) • DIRECTORATE OF HUMAN RESOURCES
              </div>
              <h4 className="text-sm font-black uppercase text-slate-900">{resolvedHospitalName}</h4>
              <div className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wide">
                ANNUAL UNIT LEAVE ROASTER & CLINICAL COVERAGE SCHEDULE (YEAR {currentYear})
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200 rounded p-2 text-[9px]">
              <div><span className="text-slate-400">DEPT:</span> <strong>{deptName}</strong></div>
              <div><span className="text-slate-400">UNIT:</span> <strong className="text-emerald-700">{unitName}</strong></div>
              <div><span className="text-slate-400">UNIT HEAD:</span> <strong>{unitHead}</strong></div>
              <div><span className="text-slate-400">STATUS:</span> <strong className="text-emerald-700">{isApproved ? 'APPROVED' : 'SUBMITTED'}</strong></div>
            </div>

            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-[8.5px]">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-1 w-6 text-center">#</th>
                    <th className="p-1">Staff Name</th>
                    <th className="p-1">Staff ID</th>
                    <th className="p-1">Grade</th>
                    <th className="p-1 text-center">Month</th>
                    <th className="p-1 text-center">Start Date</th>
                    <th className="p-1 text-center">End Date</th>
                    <th className="p-1">HR Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(templateMode === 'filled' && roaster?.items ? roaster.items.slice(0, 5) : blankItems.slice(0, 5)).map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="p-1 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-1 font-bold text-slate-900">{item.staffName || '____________________'}</td>
                      <td className="p-1 font-mono text-slate-600">{item.empCode || 'STF-____'}</td>
                      <td className="p-1 text-slate-600">{item.currentGrade || 'Clinical Staff'}</td>
                      <td className="p-1 text-center font-bold text-emerald-700">{item.leaveMonth || '______'}</td>
                      <td className="p-1 text-center font-mono">{item.proposedStartDate || '2027-__-__'}</td>
                      <td className="p-1 text-center font-mono">{item.proposedEndDate || '2027-__-__'}</td>
                      <td className="p-1 text-slate-500">{item.hrRemarks || 'Balanced coverage'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 text-[7.5px]">
              <div className="border border-slate-200 rounded p-1.5 bg-slate-50">
                <div className="font-bold border-b pb-0.5 text-slate-700">1. Unit Head</div>
                <div className="mt-1 text-slate-500">Sign & Date</div>
              </div>
              <div className="border border-slate-200 rounded p-1.5 bg-slate-50">
                <div className="font-bold border-b pb-0.5 text-slate-700">2. HOD Endorsement</div>
                <div className="mt-1 text-slate-500">Sign & Date</div>
              </div>
              <div className="border border-slate-200 rounded p-1.5 bg-slate-50">
                <div className="font-bold border-b pb-0.5 text-slate-700">3. HR Directorate</div>
                <div className="mt-1 text-emerald-700 font-bold">Official Seal</div>
              </div>
              <div className="border border-slate-200 rounded p-1.5 bg-slate-50">
                <div className="font-bold border-b pb-0.5 text-slate-700">4. Executive Approval</div>
                <div className="mt-1 text-slate-500">Medical Administrator</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Formatted for standard <strong className="text-slate-700 dark:text-slate-200">A4 Landscape</strong> printing with official CHST institutional seals.
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
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Printer className="h-4 w-4" /> Print Document Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
