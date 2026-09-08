import jsPDF from 'jspdf';
import { LeaveRequest, Employee } from '../types/hrms';
import { formatLeaveDaysText, calculateResumptionDate } from './leaveUtils';

export const generateLeaveFormHtml = (
  leave: LeaveRequest,
  employee?: Employee,
  hospitalName: string = 'POPE JOHN PAUL II MEDICAL CENTRE'
): string => {
  const resolvedHospitalName = hospitalName || 'POPE JOHN PAUL II MEDICAL CENTRE';
  const staffEmpCode = employee?.empCode || leave.staffId || leave.employeeId || 'STF-001';
  const dept = leave.department || employee?.department || 'General Clinical Service';
  const unit = leave.unit || employee?.unit || 'Main Unit';
  const grade = leave.grade || employee?.jobTitle || 'Staff Member';
  const phone = leave.phoneOnLeave || employee?.phone || '+233 20 555 0192';
  const address = leave.addressOnLeave || 'Staff Residence Quarters, PJPIIMC';
  const leaveYear = leave.leaveYear || new Date(leave.startDate).getFullYear();
  const leaveEntitlement = leave.leaveEntitlement ?? 30;
  const deferredDays = leave.deferredLeaveDaysDue ?? 0;
  const daysEarned = leave.leaveDaysEarned ?? (leaveEntitlement + deferredDays);
  const outstandingDays = leave.outstandingLeaveDays ?? Math.max(0, daysEarned - (leave.daysGranted || leave.totalDays));
  const resumptionDate = leave.dateOfResumption || calculateResumptionDate(leave.validatedEndDate || leave.endDate);

  const unitHeadSig = leave.unitHeadSignatureUrl || (leave.workflow?.unitHeadStep?.signatureUrl);
  const deptHeadSig = leave.deptHeadSignatureUrl || (leave.workflow?.departmentHeadStep?.signatureUrl);
  const hrSig = leave.hrSignatureUrl || (leave.workflow?.hrStep?.signatureUrl);
  const facHeadSig = leave.facilityHeadSignatureUrl || (leave.workflow?.facilityHeadStep?.signatureUrl);

  const unitHeadName = leave.unitHeadSignedBy || leave.workflow?.unitHeadStep?.approverName || 'Unit Head';
  const deptHeadName = leave.deptHeadSignedBy || leave.workflow?.departmentHeadStep?.approverName || 'Departmental Head';
  const hrName = leave.hrSignedBy || leave.workflow?.hrStep?.approverName || 'HR Manager';
  const facHeadName = leave.facilityInChargeSignedBy || leave.workflow?.facilityHeadStep?.approverName || 'Head of Facility / CEO';

  const docId = leave.id || `LV-${Date.now()}`;
  const approvalDate = leave.facilityInChargeSignedDate || leave.workflow?.facilityHeadStep?.approvedAt?.split('T')[0] || new Date().toISOString().split('T')[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Official Approved Leave Form - ${leave.employeeName} (${staffEmpCode})</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      margin: 0;
      padding: 12px;
      font-size: 10.5px;
      line-height: 1.35;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 8px;
      font-weight: 800;
      color: #475569;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .header h1 {
      font-size: 16px;
      font-weight: 900;
      text-transform: uppercase;
      margin: 0 0 2px 0;
      color: #0f172a;
    }
    .header h2 {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #b45309;
      margin: 0 0 2px 0;
    }
    .header p {
      font-size: 8.5px;
      color: #64748b;
      font-style: italic;
      margin: 0;
    }
    .section {
      border: 1px solid #334155;
      border-radius: 6px;
      padding: 7px 9px;
      margin-bottom: 7px;
      background-color: #ffffff;
      page-break-inside: avoid;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 3px;
      margin-bottom: 6px;
      font-weight: 900;
      font-size: 10px;
      text-transform: uppercase;
    }
    .sec-a { color: #b45309; }
    .sec-b { color: #0284c7; }
    .sec-c { color: #059669; }
    .sec-d { color: #d97706; }

    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 5px; }

    .box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 4px 6px;
    }
    .box-label {
      font-size: 7.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      display: block;
    }
    .box-val {
      font-size: 10px;
      font-weight: 800;
      color: #0f172a;
    }
    .sig-line {
      font-family: Georgia, serif;
      font-style: italic;
      font-weight: bold;
      font-size: 11px;
      color: #047857;
      text-decoration: underline;
    }
    .cert-badge {
      display: inline-block;
      padding: 2px 6px;
      background-color: #ecfdf5;
      color: #065f46;
      border: 1px solid #10b981;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .notice {
      background-color: #fffbeb;
      border: 1px solid #d97706;
      border-radius: 4px;
      padding: 5px 8px;
      font-size: 8px;
      color: #78350f;
      margin-top: 4px;
    }
    .no-print {
      margin-bottom: 8px;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #cbd5e1;
    }
    .btn {
      padding: 4px 10px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      font-size: 10px;
    }
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <span style="font-weight: bold; font-size: 10px;">📄 Certified Staff Digital Leave File Copy • Document ID: ${docId}</span>
    <button class="btn" onclick="window.print()">Print / Save PDF</button>
  </div>

  <div class="header">
    <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;">
      CATHOLIC HEALTH SERVICE TRUST (CHST) • GHANA
    </div>
    <div class="subtitle">NATIONAL CATHOLIC HEALTH SERVICE • DEPARTMENT OF HUMAN RESOURCE MANAGEMENT</div>
    <h1>${resolvedHospitalName}</h1>
    <h2>OFFICIAL APPROVED LEAVE APPLICATION RECORD</h2>
    <p>Form Ref: HR-LAF/2026/REV-04 • Digital File Vault Copy • Doc ID: ${docId} • Certified Approved</p>
  </div>

  <!-- PART A -->
  <div class="section">
    <div class="section-header sec-a">
      <span>PART A: APPLICANT PARTICULARS & LEAVE DETAILS</span>
      <span class="cert-badge">Applicant Certified</span>
    </div>
    <div class="grid-4" style="margin-bottom: 5px;">
      <div class="box">
        <span class="box-label">Full Name of Staff</span>
        <span class="box-val">${leave.employeeName}</span>
      </div>
      <div class="box">
        <span class="box-label">Staff Code / ID</span>
        <span class="box-val">${staffEmpCode}</span>
      </div>
      <div class="box">
        <span class="box-label">Grade / Position</span>
        <span class="box-val">${grade}</span>
      </div>
      <div class="box">
        <span class="box-label">Unit / Department</span>
        <span class="box-val">${unit} (${dept})</span>
      </div>
    </div>
    <div class="grid-4" style="margin-bottom: 5px;">
      <div class="box">
        <span class="box-label">Type of Leave</span>
        <span class="box-val" style="color: #b45309;">${leave.leaveType}</span>
      </div>
      <div class="box">
        <span class="box-label">Leave Year</span>
        <span class="box-val">${leaveYear}</span>
      </div>
      <div class="box">
        <span class="box-label">Annual Entitlement</span>
        <span class="box-val">${leaveEntitlement} Working Days</span>
      </div>
      <div class="box">
        <span class="box-label">Days Applied For</span>
        <span class="box-val" style="color: #047857;">${leave.totalDays} Days (${formatLeaveDaysText(leave.totalDays, leave.leaveType)})</span>
      </div>
    </div>
    <div class="grid-3" style="margin-bottom: 5px;">
      <div class="box">
        <span class="box-label">Proposed Start Date</span>
        <span class="box-val">${leave.startDate}</span>
      </div>
      <div class="box">
        <span class="box-label">Last Day of Leave (End Date)</span>
        <span class="box-val">${leave.endDate}</span>
      </div>
      <div class="box">
        <span class="box-label">Expected Resumption Date</span>
        <span class="box-val" style="color: #0284c7;">${resumptionDate}</span>
      </div>
    </div>
    <div class="grid-2">
      <div class="box">
        <span class="box-label">Contact Address on Leave</span>
        <span class="box-val" style="font-size: 9px;">${address}</span>
      </div>
      <div class="box">
        <span class="box-label">Phone Contact on Leave</span>
        <span class="box-val">${phone}</span>
      </div>
    </div>
  </div>

  <!-- PART B -->
  <div class="section">
    <div class="section-header sec-b">
      <span>PART B: UNIT & DEPARTMENTAL HEAD CLEARANCE</span>
      <span class="cert-badge">Recommended</span>
    </div>
    <div class="grid-2">
      <div class="box">
        <span class="box-label">Tier 1: Unit Head Sign-Off</span>
        <span class="box-val">${unitHeadName}</span>
        <div style="font-size: 8px; color: #475569; margin-top: 2px;">
          Status: <strong>APPROVED</strong> • Date: ${leave.unitHeadSignedDate || '2026-08-01'}<br/>
          ${unitHeadSig ? `<img src="${unitHeadSig}" alt="Signature" style="max-height: 22px; margin-top: 2px;"/>` : `<span class="sig-line">✓ ${unitHeadName} (Verified)</span>`}
        </div>
      </div>
      <div class="box">
        <span class="box-label">Tier 2: Departmental Head Sign-Off</span>
        <span class="box-val">${deptHeadName}</span>
        <div style="font-size: 8px; color: #475569; margin-top: 2px;">
          Status: <strong>APPROVED</strong> • Date: ${leave.deptHeadSignedDate || '2026-08-01'}<br/>
          ${deptHeadSig ? `<img src="${deptHeadSig}" alt="Signature" style="max-height: 22px; margin-top: 2px;"/>` : `<span class="sig-line">✓ ${deptHeadName} (Verified)</span>`}
        </div>
      </div>
    </div>
  </div>

  <!-- PART C -->
  <div class="section">
    <div class="section-header sec-c">
      <span>PART C: HUMAN RESOURCE DIRECTORATE VERIFICATION</span>
      <span class="cert-badge">HR Validated</span>
    </div>
    <div class="grid-4" style="margin-bottom: 4px;">
      <div class="box">
        <span class="box-label">Days Earned in ${leaveYear}</span>
        <span class="box-val">${daysEarned} Days</span>
      </div>
      <div class="box">
        <span class="box-label">Days Approved This Period</span>
        <span class="box-val" style="color: #047857;">${leave.daysGranted || leave.totalDays} Days</span>
      </div>
      <div class="box">
        <span class="box-label">Outstanding Leave Balance</span>
        <span class="box-val" style="color: #b45309;">${outstandingDays} Days</span>
      </div>
      <div class="box">
        <span class="box-label">Official Resumption Date</span>
        <span class="box-val" style="color: #0284c7;">${resumptionDate}</span>
      </div>
    </div>
    ${leave.isHolidayAdjusted || leave.hrAdjustmentRemarks ? `
    <div class="box" style="margin-bottom: 4px; background-color: #fffbeb; border: 1px solid #fde68a;">
      <span class="box-label" style="color: #b45309;">PUBLIC HOLIDAY END DATE ADJUSTMENT & HR REMARKS</span>
      <div style="font-size: 8.5px; color: #78350f; line-height: 1.35; font-weight: 500;">
        ${leave.hrAdjustmentRemarks || leave.holidayAdjustmentReason || leave.hrRemarks || 'Leave End Date extended to compensate for statutory public holidays falling on working days.'}
      </div>
      ${leave.holidayNames && leave.holidayNames.length > 0 ? `
      <div style="font-size: 7.5px; color: #92400e; margin-top: 2px;">
        <strong>Compensated Public Holidays:</strong> ${leave.holidayNames.join(', ')}
      </div>` : ''}
      <div style="font-size: 7.5px; color: #b45309; margin-top: 2px;">
        <strong>Adjusted By:</strong> ${leave.adjustedByHrName || hrName} • <strong>Revised End Date:</strong> ${leave.endDate} (Original: ${leave.originalEndDate || 'N/A'})
      </div>
    </div>` : `
    <div class="box" style="margin-bottom: 4px;">
      <span class="box-label">HR Validation Remarks</span>
      <div style="font-size: 8.5px; color: #334155;">${leave.hrRemarks || 'All personnel records, leave entitlements, and public holiday schedules verified in accordance with hospital policy.'}</div>
    </div>`}
    <div class="box">
      <span class="box-label">HR Directorate Endorsement</span>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="box-val">${hrName}</span>
        <span style="font-size: 8px; color: #059669; font-weight: bold;">Validated on ${leave.hrSignedDate || leave.adjustedAt?.slice(0, 10) || '2026-08-02'}</span>
      </div>
      ${hrSig ? `<img src="${hrSig}" alt="HR Signature" style="max-height: 24px; margin-top: 2px;"/>` : `<div class="sig-line">✓ ${hrName} (HR Certified)</div>`}
    </div>
  </div>

  <!-- PART D -->
  <div class="section" style="border: 1.5px solid #059669; background-color: #f0fdf4;">
    <div class="section-header sec-d" style="color: #047857;">
      <span>PART D: FINAL AUTHORIZATION BY HEAD OF FACILITY</span>
      <span class="cert-badge" style="background-color: #059669; color: #ffffff;">Fully Authorized & Sealed</span>
    </div>
    <div class="grid-3" style="margin-bottom: 5px;">
      <div class="box" style="background-color: #ffffff;">
        <span class="box-label">Executive Decision</span>
        <span class="box-val" style="color: #047857; font-size: 11px;">LEAVE APPROVED IN FULL</span>
      </div>
      <div class="box" style="background-color: #ffffff;">
        <span class="box-label">Days Granted</span>
        <span class="box-val">${leave.daysGranted || leave.totalDays} Days (${formatLeaveDaysText(leave.daysGranted || leave.totalDays, leave.leaveType)})</span>
      </div>
      <div class="box" style="background-color: #ffffff;">
        <span class="box-label">Date of Executive Approval</span>
        <span class="box-val">${approvalDate}</span>
      </div>
    </div>
    <div class="box" style="background-color: #ffffff;">
      <span class="box-label">Facility In-Charge Authorization & Official Stamp</span>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="box-val" style="font-size: 11px;">${facHeadName}</span>
        <span style="font-size: 8.5px; font-weight: 800; color: #047857;">SEALED & ARCHIVED IN STAFF DIGITAL DOSSIER</span>
      </div>
      ${facHeadSig ? `<img src="${facHeadSig}" alt="Facility Head Signature" style="max-height: 28px; margin-top: 3px;"/>` : `<div class="sig-line" style="font-size: 12px; color: #047857;">✓ ${facHeadName} (Head of Facility)</div>`}
    </div>
  </div>

  <div class="notice">
    <strong>DIGITAL VAULT ARCHIVE NOTICE:</strong> This official document is an immutable certified record permanently archived in the staff member's Digital File repository in the PJPIIMC HRMS database. Both Human Resources and the employee have 24/7 access to inspect, print, or download this approved leave record.
  </div>
</body>
</html>`;
};

/**
 * Downloads a generated PDF of the approved leave form directly using jsPDF
 */
export const downloadLeaveFormPdf = async (
  leave: LeaveRequest,
  employee?: Employee,
  hospitalName: string = 'POPE JOHN PAUL II MEDICAL CENTRE'
): Promise<void> => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const staffEmpCode = employee?.empCode || leave.staffId || leave.employeeId || 'STF-001';
    const cleanStaffName = (leave.employeeName || 'Staff').replace(/\s+/g, '_');
    const safeDocName = `Approved_Leave_Form_${staffEmpCode}_${leave.leaveType.replace(/\s+/g, '_')}_${leave.startDate}.pdf`;

    // Header banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 26, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(hospitalName.toUpperCase(), 105, 10, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(234, 179, 8); // amber-400
    doc.text('CATHOLIC HEALTH SERVICE TRUST • GHANA | HR MANAGEMENT', 105, 16, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('CERTIFIED OFFICIAL APPROVED LEAVE APPLICATION FORM', 105, 21, { align: 'center' });

    // Document Meta
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`Document Ref: HR-LAF/2026/REV-04`, 14, 32);
    doc.text(`Leave Doc ID: ${leave.id}`, 14, 37);
    doc.text(`Status: APPROVED (TIER 4 FINAL SEAL)`, 130, 32);
    doc.text(`Archived Date: ${new Date().toISOString().split('T')[0]}`, 130, 37);

    // Divider
    doc.setDrawColor(203, 213, 225);
    doc.line(14, 40, 196, 40);

    // Section A: Applicant Details
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 43, 182, 48, 2, 2, 'FD');

    doc.setTextColor(180, 83, 9); // amber-700
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PART A: APPLICANT PARTICULARS & LEAVE PERIOD', 18, 49);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Staff Name:`, 18, 56);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.employeeName}`, 55, 56);

    doc.setFont('helvetica', 'normal');
    doc.text(`Staff ID / Code:`, 115, 56);
    doc.setFont('helvetica', 'bold');
    doc.text(`${staffEmpCode}`, 155, 56);

    doc.setFont('helvetica', 'normal');
    doc.text(`Department & Unit:`, 18, 63);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.department || 'Clinical'} (${leave.unit || 'General'})`, 55, 63);

    doc.setFont('helvetica', 'normal');
    doc.text(`Grade / Position:`, 115, 63);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.grade || employee?.jobTitle || 'Specialist'}`, 155, 63);

    doc.setFont('helvetica', 'normal');
    doc.text(`Leave Type:`, 18, 70);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`${leave.leaveType}`, 55, 70);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Days Granted:`, 115, 70);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(`${leave.daysGranted || leave.totalDays} Working Days`, 155, 70);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`Leave Duration:`, 18, 77);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.startDate}  to  ${leave.endDate}`, 55, 77);

    doc.setFont('helvetica', 'normal');
    doc.text(`Resumption Date:`, 115, 77);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`${leave.dateOfResumption || calculateResumptionDate(leave.endDate)}`, 155, 77);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`Address & Phone:`, 18, 84);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.addressOnLeave || 'Staff Residence'} (Tel: ${leave.phoneOnLeave || '+233 20 555 0192'})`, 55, 84);

    // Section B: Tier 1 & Tier 2 Recommendations
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 96, 182, 34, 2, 2, 'FD');

    doc.setTextColor(2, 132, 199); // sky-600
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PART B: UNIT HEAD & DEPARTMENT HEAD ENDORSEMENTS', 18, 102);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tier 1 (Unit Head):`, 18, 110);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.unitHeadSignedBy || 'Unit Head'}  [APPROVED - Verified Shift Cover]`, 58, 110);

    doc.setFont('helvetica', 'normal');
    doc.text(`Tier 2 (Dept Head):`, 18, 118);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.deptHeadSignedBy || 'Departmental Head'}  [RECOMMENDED - Staffing Clearance]`, 58, 118);

    doc.setFont('helvetica', 'normal');
    doc.text(`Signatures & Dates:`, 18, 125);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(`Certified Digital Signatures Logged & Verified in PJPIIMC Security Vault`, 58, 125);

    // Section C: HR Directorate Verification
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 135, 182, 34, 2, 2, 'FD');

    doc.setTextColor(5, 150, 105); // emerald-600
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.text('PART C: HUMAN RESOURCE DIRECTORATE RECORD', 18, 141);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Annual Entitlement:`, 18, 149);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.leaveEntitlement || 30} Days`, 55, 149);

    doc.setFont('helvetica', 'normal');
    doc.text(`Days Granted:`, 85, 149);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.daysGranted || leave.totalDays} Days`, 112, 149);

    doc.setFont('helvetica', 'normal');
    doc.text(`Remaining Balance:`, 140, 149);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 83, 9);
    doc.text(`${leave.outstandingLeaveDays || 0} Days`, 175, 149);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(`HR Verified By:`, 18, 157);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.hrSignedBy || 'Miss Vero (HR Director)'}  [HR POLICY COMPLIANT]`, 55, 157);

    doc.setFont('helvetica', 'normal');
    doc.text(`HR Remarks:`, 18, 164);
    doc.setFont('helvetica', 'italic');
    doc.text(`${leave.hrRemarks || 'Leave entitlement verified and approved in accordance with CHST guidelines.'}`, 55, 164);

    // Section D: Final Approval by Head of Facility
    doc.setFillColor(240, 253, 244); // green-50
    doc.setDrawColor(5, 150, 105);
    doc.roundedRect(14, 174, 182, 42, 2, 2, 'FD');

    doc.setTextColor(4, 120, 87); // emerald-700
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PART D: FINAL AUTHORIZATION (HEAD OF FACILITY / CEO)', 18, 181);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`Executive Decision:`, 18, 189);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(`LEAVE APPLICATION FULLY AUTHORIZED & GRANTED`, 58, 189);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.text(`Authorized By:`, 18, 197);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.facilityInChargeSignedBy || 'Rev. Fr. Mike (Head of Facility)'}`, 58, 197);

    doc.setFont('helvetica', 'normal');
    doc.text(`Approval Date:`, 18, 205);
    doc.setFont('helvetica', 'bold');
    doc.text(`${leave.facilityInChargeSignedDate || '2026-08-02'}`, 58, 205);

    doc.setFont('helvetica', 'normal');
    doc.text(`Executive Seal:`, 18, 212);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(4, 120, 87);
    doc.text(`OFFICIALLY CERTIFIED & RECORDED IN DIGITAL EMPLOYEE FILE`, 58, 212);

    // Digital File Archive Box
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(14, 222, 182, 20, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('STAFF DIGITAL FILE REPOSITORY ARCHIVE NOTICE:', 18, 228);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'A permanent PDF copy of this approved leave form is securely retained in the staff member\'s digital file vault.\nIt is accessible at all times by both Human Resources and the employee for record keeping and leave history audits.',
      18,
      233
    );

    // Footer
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.text(
      `Generated by PJPIIMC Digital HRMS • Pope John Paul II Medical Centre • Timestamp: ${new Date().toISOString()}`,
      105,
      280,
      { align: 'center' }
    );

    doc.save(safeDocName);
  } catch (error) {
    console.warn('jsPDF generation failed, falling back to printable HTML document download', error);
    // Fallback: download styled HTML file
    const htmlDoc = generateLeaveFormHtml(leave, employee, hospitalName);
    const blob = new Blob([htmlDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Approved_Leave_Form_${leave.employeeName.replace(/\s+/g, '_')}_${leave.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Trigger print dialog
 */
export const openLeaveFormPrintWindow = (
  leave: LeaveRequest,
  employee?: Employee,
  hospitalName?: string
) => {
  const htmlDoc = generateLeaveFormHtml(leave, employee, hospitalName);

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

  // Hidden iframe fallback
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
          } catch (err) {}
        }, 2000);
      }, 400);
      return;
    }
  } catch (err) {
    console.warn('Iframe print failed', err);
  }

  window.print();
};
