import React from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  Building,
  Calendar,
  Phone,
  User,
  BadgeAlert,
  Award,
  Download,
} from 'lucide-react';
import { LeaveRequest } from '../../types/hrms';

interface OfficialLeaveFormViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  hospitalName?: string;
}

export const OfficialLeaveFormViewModal: React.FC<OfficialLeaveFormViewModalProps> = ({
  isOpen,
  onClose,
  leave,
  hospitalName = 'POPE JOHN PAUL II MEDICAL CENTRE',
}) => {
  if (!isOpen || !leave) return null;

  const isPartBApproved =
    leave.workflow?.unitHeadStep?.status === 'Approved' ||
    leave.workflow?.departmentHeadStep?.status === 'Approved' ||
    leave.recommendationStatus === 'RECOMMENDED';

  const isPartCApproved =
    leave.workflow?.hrStep?.status === 'Approved' || !!leave.hrSignedBy;

  const isPartDApproved =
    leave.workflow?.facilityHeadStep?.status === 'Approved' ||
    leave.status === 'Approved' ||
    !!leave.facilityInChargeSignedBy;

  const generatePrintableFormHtml = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Leave Application Form - ${leave.employeeName} (${leave.id})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 16px;
      font-size: 11px;
      line-height: 1.4;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .header .subtitle {
      font-size: 8px;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .header h1 {
      font-size: 18px;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0 0 2px 0;
      color: #0f172a;
    }
    .header h2 {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #b45309;
      margin: 0 0 2px 0;
    }
    .header p {
      font-size: 9px;
      color: #64748b;
      font-style: italic;
      margin: 0;
    }
    .section {
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
      background-color: #ffffff;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-bottom: 8px;
      font-weight: 900;
      font-size: 11px;
      text-transform: uppercase;
    }
    .sec-a { color: #b45309; }
    .sec-b { color: #0284c7; }
    .sec-c { color: #059669; }
    .sec-d { color: #d97706; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }

    .box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 5px 8px;
    }
    .box-label {
      font-size: 8px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      display: block;
    }
    .box-val {
      font-size: 11px;
      font-weight: 800;
      color: #0f172a;
    }
    .sig-line {
      font-family: Georgia, serif;
      font-style: italic;
      font-weight: bold;
      font-size: 12px;
      color: #047857;
      text-decoration: underline;
    }
    .notice {
      background-color: #fffbeb;
      border: 1px solid #d97706;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 9px;
      color: #78350f;
    }
    .no-print {
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #f1f5f9;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #cbd5e1;
    }
    .btn {
      padding: 6px 14px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 11px;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span style="font-weight: bold; font-size: 11px;">🖨️ Official Leave Form Printable Document</span>
    <button class="btn" onclick="window.print()">Print Form / Save PDF</button>
  </div>

  <div class="header">
    <div class="subtitle">DEPARTMENT OF HUMAN RESOURCE MANAGEMENT • OFFICIAL HEALTHCARE RECORDS</div>
    <h1>${hospitalName}</h1>
    <h2>OFFICIAL LEAVE APPLICATION FORM</h2>
    <p>Form Ref: HR-LAF/2026/REV-04 • Pope John Paul II Personnel Code • Document ID: ${leave.id}</p>
  </div>

  <div class="section" style="background-color: #f8fafc;">
    <div class="grid-2">
      <div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold; color: #475569; font-size: 9px;">STAFF NAME:</span> <strong style="font-size: 13px;">${leave.employeeName}</strong></div>
        <div><span style="font-weight: bold; color: #475569; font-size: 9px;">GRADE / TITLE:</span> <strong>${leave.grade || 'Clinical Specialist'}</strong></div>
      </div>
      <div>
        <div style="margin-bottom: 4px;"><span style="font-weight: bold; color: #475569; font-size: 9px;">STAFF ID NO:</span> <strong style="font-family: monospace; color: #b45309;">${leave.staffId || 'STF-1001'}</strong></div>
        <div><span style="font-weight: bold; color: #475569; font-size: 9px;">PRESENT UNIT / DEPT:</span> <strong>${leave.unit || leave.department} (${leave.department})</strong></div>
      </div>
    </div>
    <div style="margin-top: 6px; padding-top: 4px; border-top: 1px solid #cbd5e1;">
      <span style="font-weight: bold; color: #475569; font-size: 9px;">TYPE OF LEAVE APPLIED FOR:</span>
      <strong style="text-transform: uppercase; color: #047857; margin-left: 6px; font-size: 11px;">${leave.leaveType}</strong>
    </div>
  </div>

  <!-- PART A -->
  <div class="section">
    <div class="section-header">
      <span class="sec-a">PART A (APPLICATION)</span>
      <span style="font-family: monospace; font-size: 9px; color: #475569;">Applied Date: ${leave.appliedOn}</span>
    </div>
    <div class="grid-3" style="margin-bottom: 6px;">
      <div class="box"><span class="box-label">APPLICATION LEAVE YEAR</span><span class="box-val">${leave.leaveYear || 2026}</span></div>
      <div class="box"><span class="box-label">LEAVE ENTITLEMENT</span><span class="box-val">${leave.leaveEntitlement || 30} Days</span></div>
      <div class="box"><span class="box-label">DEFERRED DAYS DUE</span><span class="box-val">${leave.deferredLeaveDaysDue || 0} Days</span></div>
      <div class="box"><span class="box-label">LEAVE DAYS EARNED</span><span class="box-val">${leave.leaveDaysEarned || 30} Days</span></div>
      <div class="box" style="background-color: #ecfdf5;"><span class="box-label" style="color: #047857;">DAYS APPLIED FOR</span><span class="box-val" style="color: #047857; font-size: 12px;">${leave.totalDays} Days</span></div>
      <div class="box"><span class="box-label">COMMENCEMENT DATE</span><span class="box-val">${leave.startDate}</span></div>
    </div>
    <div class="box" style="margin-bottom: 6px;">
      <span class="box-label">ADDRESS ON LEAVE / TELEPHONE NO.</span>
      <div style="font-weight: 600;">${leave.addressOnLeave || 'Pope John Paul II Medical Centre Staff Quarters'} • Tel: ${leave.phoneOnLeave || '+233 20 000 0000'}</div>
    </div>
    <div class="box" style="margin-bottom: 6px;">
      <span class="box-label">REASON / PURPOSE FOR LEAVE</span>
      <div style="font-weight: 600;">${leave.reason}</div>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px solid #cbd5e1;">
      <div><span style="font-weight: bold; font-size: 10px;">APPLICANT SIGNATURE:</span> <span class="sig-line">${leave.employeeName}</span></div>
      <div><span style="font-weight: bold; font-size: 10px;">DATE:</span> <span style="font-family: monospace; font-weight: bold;">${leave.applicantSignedDate || leave.appliedOn}</span></div>
    </div>
  </div>

  <!-- PART B -->
  <div class="section">
    <div class="section-header">
      <span class="sec-b">PART B (RECOMMENDATION)</span>
      <span style="font-size: 9px; color: #0284c7;">Unit & Department Leadership Review</span>
    </div>
    <div class="grid-2" style="margin-bottom: 6px;">
      <div class="box">
        <span class="box-label">RECOMMENDATION STATUS</span>
        <strong style="color: #047857;">${leave.recommendationStatus || (isPartBApproved ? 'LEAVE RECOMMENDED' : 'PENDING REVIEW')}</strong>
      </div>
      <div class="box">
        <span class="box-label">CLINICAL SHIFT REPLACEMENT</span>
        <strong>REPLACEMENT IS ${leave.replacementRequired || 'NOT REQUIRED'}</strong>
      </div>
    </div>
    <div class="grid-2" style="padding-top: 4px; border-top: 1px solid #cbd5e1;">
      <div class="box">
        <span class="box-label">HEAD OF UNIT SIGNATURE</span>
        <div>${(leave.workflow?.unitHeadStep?.status === 'Approved' || leave.unitHeadSignedBy) ? `<span class="sig-line">✓ ${leave.unitHeadSignedBy || leave.workflow?.unitHeadStep?.approverName || 'Unit Head Signed'}</span> <br/><span style="font-size: 8px; font-family: monospace;">Date: ${leave.unitHeadSignedDate || leave.workflow?.unitHeadStep?.approvedAt?.slice(0, 10) || leave.appliedOn}</span>` : `<span style="color: #94a3b8; font-style: italic;">Pending HOU Signature</span>`}</div>
      </div>
      <div class="box">
        <span class="box-label">HEAD OF DEPARTMENT SIGNATURE</span>
        <div>${(leave.workflow?.departmentHeadStep?.status === 'Approved' || leave.deptHeadSignedBy) ? `<span class="sig-line">✓ ${leave.deptHeadSignedBy || leave.workflow?.departmentHeadStep?.approverName || 'Department Head Signed'}</span> <br/><span style="font-size: 8px; font-family: monospace;">Date: ${leave.deptHeadSignedDate || leave.workflow?.departmentHeadStep?.approvedAt?.slice(0, 10) || leave.appliedOn}</span>` : `<span style="color: #94a3b8; font-style: italic;">Pending HOD Signature</span>`}</div>
      </div>
    </div>
  </div>

  <!-- PART C -->
  <div class="section">
    <div class="section-header">
      <span class="sec-c">PART C (VALIDATION)</span>
      <span style="font-size: 9px; color: #059669;">Human Resource Verification</span>
    </div>
    <div class="grid-4" style="margin-bottom: 6px;">
      <div class="box"><span class="box-label">OUTSTANDING DAYS</span><span class="box-val">${leave.outstandingLeaveDays ?? Math.max(0, (leave.leaveEntitlement || 30) - leave.totalDays)} Days</span></div>
      <div class="box"><span class="box-label">START DATE</span><span class="box-val">${leave.validatedStartDate || leave.startDate}</span></div>
      <div class="box"><span class="box-label">END DATE</span><span class="box-val">${leave.validatedEndDate || leave.endDate}</span></div>
      <div class="box" style="background-color: #ecfdf5;"><span class="box-label" style="color: #047857;">RESUMPTION DATE</span><span class="box-val" style="color: #047857;">${leave.dateOfResumption || 'Day Following End Date'}</span></div>
    </div>
    <div class="box" style="margin-bottom: 6px;">
      <span class="box-label">REMARKS (HR DEPARTMENT)</span>
      <div>${leave.hrRemarks || leave.workflow?.hrStep?.comments || 'All personnel records, leave entitlements, and CME balances verified in accordance with hospital policy.'}</div>
    </div>
    <div style="text-align: right; padding-top: 4px; border-top: 1px solid #cbd5e1;">
      <span class="box-label">HUMAN RESOURCE MANAGER SIGNATURE</span>
      <div>${isPartCApproved ? `<span class="sig-line">✓ ${leave.hrSignedBy || leave.workflow?.hrStep?.approverName || 'HR Manager Signed'}</span> <span style="font-size: 8px; font-family: monospace; margin-left: 6px;">Date: ${leave.hrSignedDate || leave.workflow?.hrStep?.approvedAt?.slice(0, 10) || leave.appliedOn}</span>` : `<span style="color: #94a3b8; font-style: italic;">Pending HR Signature</span>`}</div>
    </div>
  </div>

  <!-- PART D -->
  <div class="section">
    <div class="section-header">
      <span class="sec-d">PART D (APPROVAL)</span>
      <span style="font-size: 9px; color: #d97706;">Facility Executive Authorization</span>
    </div>
    <div class="grid-2" style="margin-bottom: 6px;">
      <div class="box">
        <span class="box-label">NUMBER OF DAYS GRANTED</span>
        <strong style="font-size: 11px; color: #d97706;">${leave.daysGranted ?? leave.totalDays} Days</strong>
      </div>
      <div class="box">
        <span class="box-label">EXECUTIVE APPROVAL STATUS</span>
        <strong style="color: ${isPartDApproved ? '#047857' : '#d97706'}; font-size: 11px;">${isPartDApproved ? 'EXECUTIVE APPROVED' : 'PENDING FINAL APPROVAL'}</strong>
      </div>
    </div>
    <div class="box" style="margin-bottom: 6px;">
      <span class="box-label">EXECUTIVE REMARKS</span>
      <div>${leave.approvalRemarks || leave.workflow?.facilityHeadStep?.comments || 'Approved as recommended.'}</div>
    </div>
    <div style="text-align: right; padding-top: 4px; border-top: 1px solid #cbd5e1;">
      <span class="box-label">APPROVED BY FACILITY IN-CHARGE</span>
      <div>${isPartDApproved ? `<span class="sig-line" style="font-size: 13px; color: #b45309;">✓ ${leave.facilityInChargeSignedBy || leave.workflow?.facilityHeadStep?.approverName || 'Facility In-Charge Signed'}</span> <br/><span style="font-size: 8px; font-family: monospace;">Date: ${leave.facilityInChargeSignedDate || leave.workflow?.facilityHeadStep?.approvedAt?.slice(0, 10) || leave.appliedOn}</span>` : `<span style="color: #94a3b8; font-style: italic;">Pending CEO / CMO Signature</span>`}</div>
    </div>
  </div>

  <div class="notice">
    <strong>NB:</strong> Leave application must comply with proposed date and submitted at least 7 working days prior to start date.<br/>
    <strong>CC:</strong> HEAD OF DEPARTMENT • HUMAN RESOURCES ARCHIVES.
  </div>

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
    const htmlDoc = generatePrintableFormHtml();

    // 1. Try standalone window open first
    try {
      const printWindow = window.open('', '_blank', 'width=900,height=1100');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(htmlDoc);
        printWindow.document.close();
        printWindow.focus();
        return;
      }
    } catch (e) {
      console.warn('Popup window blocked, using hidden iframe print handler', e);
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
      console.warn('Iframe print failed, calling window.print()', err);
    }

    // 3. Fallback to current window print
    window.print();
  };

  const handleDownloadHtml = () => {
    const htmlDoc = generatePrintableFormHtml();
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Official_Leave_Form_${leave.employeeName.replace(/\s+/g, '_')}_${leave.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="printable-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="printable-document-card relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-800 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden print:max-w-none print:w-full print:h-auto print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black print:p-0">
        
        {/* Modal Header Bar - Hidden on print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Official Leave Application Form</h3>
              <p className="text-[11px] text-slate-400">
                Official 4-Part HR Document (Parts A, B, C, D) • ID: {leave.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md active:scale-95"
              title="Print directly or save as PDF via print dialog"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </button>
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5 border border-slate-700 active:scale-95"
              title="Download standalone HTML document file"
            >
              <Download className="h-4 w-4 text-cyan-400" /> Export File
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body - Document Paper Styling */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-5 font-sans text-xs bg-slate-900 print:p-4 print:bg-white print:text-black print:overflow-visible">
          
          {/* Document Header */}
          <div className="text-center pb-4 border-b-2 border-slate-700 print:border-black space-y-1 print-avoid-break">
            <div className="hidden print:block text-[9px] uppercase font-bold text-gray-500 tracking-widest mb-1">
              DEPARTMENT OF HUMAN RESOURCE MANAGEMENT • OFFICIAL HEALTHCARE RECORDS
            </div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white print:text-black">
              {hospitalName}
            </h1>
            <h2 className="text-xs sm:text-sm font-extrabold text-amber-400 print:text-black tracking-widest uppercase">
              OFFICIAL LEAVE APPLICATION FORM
            </h2>
            <p className="text-[10px] text-slate-400 print:text-gray-600 italic">
              Form Ref: HR-LAF/2026/REV-04 • Pope John Paul II Personnel Code • Document ID: {leave.id}
            </p>
          </div>

          {/* Top Particulars Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 print:border-black print:bg-gray-50 text-slate-200 print:text-black print-avoid-break">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-400 print:text-black uppercase text-[10px]">STAFF NAME:</span>
                <span className="font-black text-white print:text-black text-sm">{leave.employeeName}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-400 print:text-black uppercase text-[10px]">GRADE / TITLE:</span>
                <span className="font-bold text-slate-200 print:text-black">{leave.grade || 'Clinical Specialist'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-400 print:text-black uppercase text-[10px]">STAFF ID NO:</span>
                <span className="font-mono font-bold text-amber-400 print:text-black">{leave.staffId || 'STF-1001'}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-slate-400 print:text-black uppercase text-[10px]">PRESENT UNIT / DEPT:</span>
                <span className="font-bold text-slate-200 print:text-black">{leave.unit || leave.department} ({leave.department})</span>
              </div>
            </div>

            <div className="col-span-full pt-2 border-t border-slate-800 print:border-gray-400 flex items-baseline gap-2">
              <span className="font-bold text-slate-400 print:text-black uppercase text-[10px]">TYPE OF LEAVE APPLIED FOR:</span>
              <span className="font-black text-emerald-400 print:text-black uppercase text-xs px-2 py-0.5 rounded bg-emerald-500/10 print:bg-transparent border border-emerald-500/20 print:border-none">
                {leave.leaveType}
              </span>
            </div>
          </div>

          {/* PART A (APPLICATION) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 print:border-black print:bg-white space-y-3.5 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-black pb-2">
              <h3 className="font-black text-sm text-amber-400 print:text-black uppercase tracking-wide">
                PART A (APPLICATION)
              </h3>
              <span className="text-[10px] text-slate-400 print:text-black font-mono font-bold">
                Applied Date: {leave.appliedOn}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">APPLICATION LEAVE YEAR</span>
                <span className="font-black text-white print:text-black text-xs">{leave.leaveYear || 2026}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">LEAVE ENTITLEMENT</span>
                <span className="font-black text-white print:text-black text-xs">{leave.leaveEntitlement || 30} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">DEFERRED DAYS DUE</span>
                <span className="font-black text-white print:text-black text-xs">{leave.deferredLeaveDaysDue || 0} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">LEAVE DAYS EARNED</span>
                <span className="font-black text-white print:text-black text-xs">{leave.leaveDaysEarned || 30} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 print:bg-gray-200 border border-emerald-500/20 print:border-gray-500">
                <span className="text-[9px] text-emerald-400 print:text-black block font-bold">DAYS APPLIED FOR</span>
                <span className="font-black text-emerald-300 print:text-black text-sm">{leave.totalDays} Days</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">COMMENCEMENT DATE</span>
                <span className="font-black text-white print:text-black text-xs">{leave.startDate}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400 space-y-0.5">
              <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">ADDRESS ON LEAVE / TELEPHONE NO.</span>
              <p className="font-medium text-slate-200 print:text-black text-xs">
                {leave.addressOnLeave || 'Pope John Paul II Medical Centre Staff Quarters'} • Tel: {leave.phoneOnLeave || '+233 20 000 0000'}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800/80 print:border-gray-400 space-y-0.5">
              <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">REASON / PURPOSE FOR LEAVE</span>
              <p className="font-medium text-slate-200 print:text-black text-xs">
                {leave.reason}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-300 print:text-black border-t border-slate-800 print:border-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-bold">APPLICANT SIGNATURE:</span>
                <span className="font-serif italic font-bold text-emerald-400 print:text-black underline">
                  {leave.employeeName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">DATE:</span>
                <span className="font-mono font-bold">{leave.applicantSignedDate || leave.appliedOn}</span>
              </div>
            </div>
          </div>

          {/* PART B (RECOMMENDATION) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 print:border-black print:bg-white space-y-3.5 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-black pb-2">
              <h3 className="font-black text-sm text-cyan-400 print:text-black uppercase tracking-wide">
                PART B (RECOMMENDATION)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 print:text-black border border-cyan-500/20 print:border-gray-400">
                Unit & Department Leadership Review
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400 space-y-0.5">
                <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">RECOMMENDATION STATUS</span>
                <span className={`font-black text-xs uppercase px-2 py-0.5 rounded inline-block ${
                  leave.recommendationStatus === 'RECOMMENDED' || isPartBApproved
                    ? 'bg-emerald-500/20 text-emerald-300 print:text-black'
                    : 'bg-amber-500/20 text-amber-300 print:text-black'
                }`}>
                  {leave.recommendationStatus || (isPartBApproved ? 'LEAVE RECOMMENDED' : 'PENDING REVIEW')}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400 space-y-0.5">
                <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">CLINICAL SHIFT REPLACEMENT</span>
                <span className="font-black text-xs text-white print:text-black uppercase">
                  REPLACEMENT IS {leave.replacementRequired || 'NOT REQUIRED'}
                </span>
              </div>
            </div>

            {/* Signatures for Head of Unit and Head of Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 print:border-gray-400">
              <div className="p-2.5 rounded-xl bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-400 space-y-1">
                <div className="text-[9px] font-bold text-slate-400 print:text-gray-800">HEAD OF UNIT SIGNATURE</div>
                {leave.workflow?.unitHeadStep?.status === 'Approved' || leave.unitHeadSignedBy ? (
                  <div className="space-y-0.5">
                    <div className="font-serif italic font-bold text-emerald-400 print:text-black text-xs">
                      ✓ {leave.unitHeadSignedBy || leave.workflow?.unitHeadStep?.approverName || 'Unit Head Signed'}
                    </div>
                    <div className="text-[9px] text-slate-400 print:text-gray-700 font-mono">
                      Date: {leave.unitHeadSignedDate || leave.workflow?.unitHeadStep?.approvedAt?.slice(0, 10) || leave.appliedOn}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic print:text-gray-500">
                    ........................................ (Pending HOU Sign)
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-400 space-y-1">
                <div className="text-[9px] font-bold text-slate-400 print:text-gray-800">HEAD OF DEPARTMENT SIGNATURE</div>
                {leave.workflow?.departmentHeadStep?.status === 'Approved' || leave.deptHeadSignedBy ? (
                  <div className="space-y-0.5">
                    <div className="font-serif italic font-bold text-emerald-400 print:text-black text-xs">
                      ✓ {leave.deptHeadSignedBy || leave.workflow?.departmentHeadStep?.approverName || 'Department Head Signed'}
                    </div>
                    <div className="text-[9px] text-slate-400 print:text-gray-700 font-mono">
                      Date: {leave.deptHeadSignedDate || leave.workflow?.departmentHeadStep?.approvedAt?.slice(0, 10) || leave.appliedOn}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic print:text-gray-500">
                    ........................................ (Pending HOD Sign)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PART C (VALIDATION) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 print:border-black print:bg-white space-y-3.5 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-black pb-2">
              <h3 className="font-black text-sm text-emerald-400 print:text-black uppercase tracking-wide">
                PART C (VALIDATION)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 print:text-black border border-emerald-500/20 print:border-gray-400">
                Human Resource Department Verification
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">OUTSTANDING LEAVE DAYS</span>
                <span className="font-black text-white print:text-black text-xs">
                  {leave.outstandingLeaveDays ?? Math.max(0, (leave.leaveEntitlement || 30) - leave.totalDays)} Days
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">VALIDATED START DATE</span>
                <span className="font-black text-white print:text-black text-xs">{leave.validatedStartDate || leave.startDate}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400">
                <span className="text-[9px] text-slate-400 print:text-gray-800 block font-bold">VALIDATED END DATE</span>
                <span className="font-black text-white print:text-black text-xs">{leave.validatedEndDate || leave.endDate}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 print:bg-gray-100 border border-emerald-500/20 print:border-gray-400">
                <span className="text-[9px] text-emerald-400 print:text-gray-800 block font-bold">RESUMPTION DATE</span>
                <span className="font-black text-emerald-300 print:text-black text-xs">
                  {leave.dateOfResumption || 'Day Following End Date'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400 space-y-0.5">
              <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">REMARKS (HR Department)</span>
              <p className="font-medium text-slate-200 print:text-black text-xs">
                {leave.hrRemarks || leave.workflow?.hrStep?.comments || 'All personnel records, leave entitlements, and CME balances verified in accordance with hospital policy.'}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <div className="p-2.5 rounded-xl bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-400 text-right space-y-0.5 min-w-[260px]">
                <div className="text-[9px] font-bold text-slate-400 print:text-gray-800 uppercase">HUMAN RESOURCE MANAGER SIGNATURE</div>
                {isPartCApproved ? (
                  <div>
                    <div className="font-serif italic font-bold text-emerald-400 print:text-black text-xs">
                      ✓ {leave.hrSignedBy || leave.workflow?.hrStep?.approverName || 'Marcus Vance (HR Manager)'}
                    </div>
                    <div className="text-[9px] text-slate-400 print:text-gray-700 font-mono">
                      Date: {leave.hrSignedDate || leave.workflow?.hrStep?.approvedAt?.slice(0, 10) || leave.appliedOn}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic print:text-gray-500">
                    ........................................ (Pending HR Sign)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PART D (APPROVAL) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/50 border border-slate-800 print:border-black print:bg-white space-y-3.5 print-avoid-break">
            <div className="flex items-center justify-between border-b border-slate-800 print:border-black pb-2">
              <h3 className="font-black text-sm text-amber-400 print:text-black uppercase tracking-wide">
                PART D (APPROVAL)
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 print:text-black border border-amber-500/20 print:border-gray-400">
                Executive Facility Leadership Authorization
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400 space-y-0.5">
                <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">NUMBER OF LEAVE DAYS GRANTED</span>
                <span className="font-black text-amber-300 print:text-black text-sm">
                  {leave.daysGranted ?? leave.totalDays} Days
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400 space-y-0.5">
                <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">EXECUTIVE APPROVAL STATUS</span>
                <span className={`font-black text-xs uppercase px-2 py-0.5 rounded inline-block ${
                  isPartDApproved
                    ? 'bg-emerald-500/20 text-emerald-300 print:text-black'
                    : 'bg-amber-500/20 text-amber-300 print:text-black'
                }`}>
                  {isPartDApproved ? 'LEAVE FULLY AUTHORIZED & GRANTED' : 'AWAITING FACILITY HEAD SIGNATURE'}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 print:bg-gray-100 border border-slate-800 print:border-gray-400 space-y-0.5">
              <span className="text-[9px] text-slate-400 print:text-gray-800 font-bold block">EXECUTIVE REMARKS</span>
              <p className="font-medium text-slate-200 print:text-black text-xs">
                {leave.approvalRemarks || leave.workflow?.facilityHeadStep?.comments || 'Approved as recommended.'}
              </p>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <div className="p-3 rounded-xl bg-slate-900/80 print:bg-gray-50 border border-slate-800 print:border-gray-400 text-right space-y-0.5 min-w-[280px]">
                <div className="text-[9px] font-bold text-slate-400 print:text-gray-800 uppercase">APPROVED BY FACILITY IN-CHARGE</div>
                {isPartDApproved ? (
                  <div>
                    <div className="font-serif italic font-extrabold text-amber-400 print:text-black text-sm">
                      ✓ {leave.facilityInChargeSignedBy || leave.workflow?.facilityHeadStep?.approverName || 'Dr. Arthur Kingsley (Facility In-Charge)'}
                    </div>
                    <div className="text-[9px] text-slate-400 print:text-gray-700 font-mono">
                      Date: {leave.facilityInChargeSignedDate || leave.workflow?.facilityHeadStep?.approvedAt?.slice(0, 10) || leave.appliedOn}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic print:text-gray-500">
                    ................................................... (Pending CEO / CMO Sign)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Mandatory Policy Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 print:border-black print:bg-gray-50 text-[10px] space-y-0.5 text-slate-300 print:text-black print-avoid-break">
            <p className="font-bold">
              <strong>NB:</strong> Leave application must comply with proposed date and submitted at least 7 working days prior to start date.
            </p>
            <p className="font-bold text-slate-400 print:text-black">
              <strong>CC:</strong> HEAD OF DEPARTMENT • HUMAN RESOURCES ARCHIVES.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
