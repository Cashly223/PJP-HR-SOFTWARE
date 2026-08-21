import React, { useState, useEffect } from 'react';
import {
  PlaneTakeoff,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Building2,
  Users,
  MessageSquare,
  FileText,
  AlertCircle,
  Check,
  Crown,
  Search,
  Filter,
  Sparkles,
  Printer,
  FileCheck,
  Lock,
  PenTool,
  Award,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { LeaveRequest, WorkflowStage, UserRole } from '../../types/hrms';
import { OfficialLeaveFormViewModal } from './OfficialLeaveFormViewModal';
import { AnnualUnitLeaveRoasterManager } from './AnnualUnitLeaveRoasterManager';
import { HRSignatureVaultModal } from './HRSignatureVaultModal';
import { CalendarDays } from 'lucide-react';
import {
  calculateLeaveDays,
  calculateEndDateFromDays,
  calculateResumptionDate,
  calculateLeaveEndDateFromResumptionDate,
  isMaternityLeave,
  formatLeaveDaysText,
  formatDateParts,
} from '../../lib/leaveUtils';

export const LeaveManagement: React.FC = () => {
  const {
    leaves,
    employees,
    departmentLeadership,
    addLeaveRequest,
    processLeaveWorkflowStep,
    activeRole,
    setActiveRole,
    currentUser,
    updateEmployee,
    uploadEmployeeDigitalSignature,
    selectedHospital,
  } = useHrms();

  const [activeTabMode, setActiveTabMode] = useState<'applications' | 'entitlements' | 'report' | 'annual_roaster' | 'signatures'>('applications');
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportDeptFilter, setReportDeptFilter] = useState('All');
  const [reportStatusFilter, setReportStatusFilter] = useState('All');
  const [isReportPrintModalOpen, setIsReportPrintModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || '');
  
  // Digital Signature Management State
  const [isSignatureVaultOpen, setIsSignatureVaultOpen] = useState(false);
  const [vaultTargetEmp, setVaultTargetEmp] = useState<any | null>(null);
  const [applicantCertified, setApplicantCertified] = useState(true);
  const [approverCertified, setApproverCertified] = useState(true);
  const [sigSearch, setSigSearch] = useState('');
  const [sigDeptFilter, setSigDeptFilter] = useState('All');
  const [sigStatusFilter, setSigStatusFilter] = useState<'All' | 'WithSignature' | 'MissingSignature'>('All');
  
  // Custom Leave Form Fields (PART A)
  const [staffId, setStaffId] = useState('');
  const [grade, setGrade] = useState('');
  const [unit, setUnit] = useState('');
  const [department, setDepartment] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Annual Leave');
  const [leaveYear, setLeaveYear] = useState<number>(new Date().getFullYear());
  const [leaveEntitlement, setLeaveEntitlement] = useState<number>(30);
  const [deferredLeaveDaysDue, setDeferredLeaveDaysDue] = useState<number>(0);
  const [leaveDaysEarned, setLeaveDaysEarned] = useState<number>(30);
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState(() => formatDateParts(new Date()));
  const [endDate, setEndDate] = useState(() => {
    const today = formatDateParts(new Date());
    return calculateEndDateFromDays(today, 7, 'Annual Leave');
  });
  const [resumptionDate, setResumptionDate] = useState(() => {
    const today = formatDateParts(new Date());
    const initialEnd = calculateEndDateFromDays(today, 7, 'Annual Leave');
    return calculateResumptionDate(initialEnd);
  });
  const [addressOnLeave, setAddressOnLeave] = useState('Hospital Staff Residence Quarters House 14');
  const [phoneOnLeave, setPhoneOnLeave] = useState('+233 20 555 0192');
  const [reason, setReason] = useState('Annual leave application & mandatory rest duration.');

  // Official Form Modal State
  const [officialFormModal, setOfficialFormModal] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
  }>({ open: false, leave: null });

  // Computed Outstanding Days
  const [outstandingLeaveDays, setOutstandingLeaveDays] = useState<number>(30);
  const [totalUsedLeaveDays, setTotalUsedLeaveDays] = useState<number>(0);

  // Entitlements Management Modal
  const [entitlementEditModal, setEntitlementEditModal] = useState<{
    open: boolean;
    emp: any | null;
  }>({ open: false, emp: null });
  const [editEntitlementVal, setEditEntitlementVal] = useState(30);
  const [editDeferredVal, setEditDeferredVal] = useState(0);

  // Auto populate selected employee info & dynamic outstanding leave days from staff DB
  useEffect(() => {
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (emp) {
      setStaffId(emp.empCode || 'STF-1001');
      setGrade(emp.jobTitle || 'Clinical Specialist');
      setDepartment(emp.department || 'Intensive Care Unit (ICU)');
      setUnit(emp.unit || 'ICU Ward 2B');
      setPhoneOnLeave(emp.mobilePhone || '+233 20 555 0192');

      const empEnt = emp.leaveEntitlement ?? 30;
      const empDef = emp.deferredLeaveDays ?? 0;
      setLeaveEntitlement(empEnt);
      setDeferredLeaveDaysDue(empDef);
      setLeaveDaysEarned(empEnt);

      // Compute total approved days taken by this employee from DB
      const approvedLeaves = (leaves || []).filter(
        (l) => l && l.employeeId === emp.id && l.status === 'Approved'
      );
      const used = approvedLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || 0), 0);
      setTotalUsedLeaveDays(used);
      setOutstandingLeaveDays(Math.max(0, (empEnt + empDef) - used));
    }
  }, [selectedEmpId, employees, leaves]);

  // Synchronize when Start Date changes
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart && days > 0) {
      const computedEnd = calculateEndDateFromDays(newStart, days, leaveType);
      setEndDate(computedEnd);
      setResumptionDate(calculateResumptionDate(computedEnd));
    }
  };

  // Synchronize when Leave End Date (last day of leave) changes
  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    if (newEnd) {
      const newResumption = calculateResumptionDate(newEnd);
      setResumptionDate(newResumption);
      if (startDate) {
        const computedDays = calculateLeaveDays(startDate, newEnd, leaveType);
        setDays(computedDays);
      }
    }
  };

  // Synchronize when Resumption Date (+1 Day of Leave End Date) changes
  const handleResumptionDateChange = (newResumption: string) => {
    setResumptionDate(newResumption);
    if (newResumption) {
      const computedEnd = calculateLeaveEndDateFromResumptionDate(newResumption);
      setEndDate(computedEnd);
      if (startDate && computedEnd) {
        const computedDays = calculateLeaveDays(startDate, computedEnd, leaveType);
        setDays(computedDays);
      }
    }
  };

  // Synchronize when requested days count is directly changed
  const handleDaysChange = (newDays: number) => {
    const safeDays = Math.max(1, newDays);
    setDays(safeDays);
    if (startDate && safeDays > 0) {
      const computedEnd = calculateEndDateFromDays(startDate, safeDays, leaveType);
      setEndDate(computedEnd);
      setResumptionDate(calculateResumptionDate(computedEnd));
    }
  };

  // Synchronize when Leave Type changes (e.g. Maternity = 90 calendar days)
  const handleLeaveTypeChange = (selectedType: LeaveRequest['leaveType']) => {
    setLeaveType(selectedType);
    let targetDays = days;
    if (isMaternityLeave(selectedType)) {
      setLeaveEntitlement(90);
      targetDays = 90;
      setDays(90);
    } else if (isMaternityLeave(leaveType)) {
      setLeaveEntitlement(30);
      targetDays = 30;
      setDays(30);
    }
    if (startDate) {
      const computedEnd = calculateEndDateFromDays(startDate, targetDays, selectedType);
      setEndDate(computedEnd);
      setResumptionDate(calculateResumptionDate(computedEnd));
    }
  };

  // Review Modal State for Approvers
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    leave: LeaveRequest | null;
    action: 'Approve' | 'Reject';
  }>({ open: false, leave: null, action: 'Approve' });

  const [approvalComments, setApprovalComments] = useState('');
  const [customApproverName, setCustomApproverName] = useState('');

  // Filtering
  const [stageFilter, setStageFilter] = useState<'All' | 'MyAction' | WorkflowStage>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');

  // Success Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleExportStaffLeaveReportCSV = () => {
    const headers = [
      'Staff ID',
      'Staff Name',
      'Department',
      'Role Title',
      'Annual Entitlement Days',
      'Deferred Days',
      'Total Net Entitlement',
      'Approved Days Taken',
      'Pending Days Requested',
      'Outstanding Days Balance',
      'Utilization Rate (%)',
      'Status'
    ];

    const rows = (employees || []).filter(Boolean).map((emp) => {
      const annual = emp.leaveEntitlement || 30;
      const def = emp.deferredLeaveDays || 0;
      const tot = annual + def;
      const appLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Approved');
      const taken = appLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
      const pendLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Pending');
      const pend = pendLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
      const rem = tot - taken;
      const util = tot > 0 ? Math.min(100, Math.round((taken / tot) * 100)) : 0;
      const isOnLeave = (leaves || []).some((l) => l && l.employeeId === emp.id && l.status === 'Approved');

      return [
        `"${emp.empCode || 'STF-100'}"`,
        `"${emp.firstName} ${emp.lastName}"`,
        `"${emp.department}"`,
        `"${emp.jobTitle}"`,
        annual,
        def,
        tot,
        taken,
        pend,
        rem,
        `"${util}%"`,
        `"${isOnLeave ? 'On Active Leave' : 'On Duty'}"`
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      `"POPE JOHN PAUL II MEDICAL CENTRE (PJPIIMC) - OFFICIAL STAFF LEAVE REPORT"\n` +
      `"Report Date: ${new Date().toLocaleDateString()}"\n` +
      `"Generated By: Human Resources Division"\n\n` +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PJPIIMC_Staff_Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintStaffLeaveMasterReport = () => {
    const safeEmpList = (employees || []).filter(Boolean);
    const totalStaff = safeEmpList.length;
    const grossEntitlement = safeEmpList.reduce((acc, e) => acc + (e.leaveEntitlement || 30) + (e.deferredLeaveDays || 0), 0);
    const grossTaken = (leaves || []).filter((l) => l && l.status === 'Approved').reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
    const grossPending = (leaves || []).filter((l) => l && l.status === 'Pending').reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
    const grossRemaining = Math.max(0, grossEntitlement - grossTaken);

    const reportRows = safeEmpList.map((emp, idx) => {
      const annual = emp.leaveEntitlement || 30;
      const def = emp.deferredLeaveDays || 0;
      const tot = annual + def;
      const appLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Approved');
      const taken = appLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
      const pendLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Pending');
      const pend = pendLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
      const rem = tot - taken;
      const util = tot > 0 ? Math.min(100, Math.round((taken / tot) * 100)) : 0;
      const isOnLeave = (leaves || []).some((l) => l && l.employeeId === emp.id && l.status === 'Approved');

      return `<tr>
        <td style="font-weight: bold; color: #64748b; text-align: center;">${idx + 1}</td>
        <td style="font-weight: bold; color: #0f172a;">${emp.firstName} ${emp.lastName}</td>
        <td style="font-family: monospace; color: #475569;">${emp.empCode || 'STF-100'}</td>
        <td style="color: #334155;">${emp.department}</td>
        <td style="color: #334155;">${emp.jobTitle}</td>
        <td style="text-align: center;">${annual}</td>
        <td style="text-align: center;">${def}</td>
        <td style="text-align: center; font-weight: bold;">${tot}</td>
        <td style="text-align: center; color: #059669; font-weight: bold;">${taken}</td>
        <td style="text-align: center; color: #d97706;">${pend}</td>
        <td style="text-align: center; color: ${rem <= 5 ? '#dc2626' : '#059669'}; font-weight: bold;">${rem}</td>
        <td style="text-align: center; font-weight: 600;">${util}%</td>
        <td style="text-align: center; font-size: 8.5px; font-weight: bold; color: ${isOnLeave ? '#7c3aed' : '#059669'};">${isOnLeave ? 'On Active Leave' : 'On Duty'}</td>
      </tr>`;
    }).join('');

    const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Staff Leave Master Report - PJPIIMC</title>
  <style>
    @page { size: A4 landscape; margin: 8mm 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 12px; font-size: 9.5px; }
    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 8px; }
    .meta { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; margin-bottom: 10px; font-size: 9px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 9px; }
    th, td { border: 1px solid #64748b; padding: 4px 6px; text-align: left; }
    th { background: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 8px; }
    tr:nth-child(even) { background: #f8fafc; }
    .sign-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 15px; }
    .sign-box { border: 1px solid #94a3b8; border-radius: 6px; padding: 8px; background: #ffffff; font-size: 8.5px; }
    .sig-line { margin-top: 20px; border-top: 1px dashed #64748b; padding-top: 3px; display: flex; justify-content: space-between; font-size: 8px; color: #475569; }
  </style>
</head>
<body>
  <div class="header">
    <div style="font-size: 8px; font-weight: 800; letter-spacing: 2px; color: #475569; text-transform: uppercase;">CATHOLIC HEALTH SERVICE TRUST (CHST) • DIRECTORATE OF HUMAN RESOURCES</div>
    <h2 style="margin: 2px 0; font-size: 16px; font-weight: 900; text-transform: uppercase;">${typeof selectedHospital === 'object' ? selectedHospital?.name : (selectedHospital || 'POPE JOHN PAUL II MEDICAL CENTRE - JAMASI')}</h2>
    <h3 style="margin: 0; font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase;">STAFF LEAVE MASTER REPORT & LEAVE LIABILITIES AUDIT</h3>
  </div>
  <div class="meta">
    <div><strong style="color: #64748b; font-size: 7.5px; text-transform: uppercase; display: block;">Total Workforce:</strong> ${totalStaff} Staff</div>
    <div><strong style="color: #64748b; font-size: 7.5px; text-transform: uppercase; display: block;">Gross Entitlement:</strong> ${grossEntitlement} Days</div>
    <div><strong style="color: #64748b; font-size: 7.5px; text-transform: uppercase; display: block;">Leave Utilized:</strong> ${grossTaken} Days</div>
    <div><strong style="color: #64748b; font-size: 7.5px; text-transform: uppercase; display: block;">Pending Approvals:</strong> ${grossPending} Days</div>
    <div><strong style="color: #64748b; font-size: 7.5px; text-transform: uppercase; display: block;">Remaining Balance:</strong> ${grossRemaining} Days</div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 25px; text-align: center;">#</th>
        <th>Staff Full Name</th>
        <th>PIN / Code</th>
        <th>Department</th>
        <th>Job Designation</th>
        <th style="text-align: center;">Annual</th>
        <th style="text-align: center;">Def.</th>
        <th style="text-align: center;">Total</th>
        <th style="text-align: center;">Taken</th>
        <th style="text-align: center;">Pend.</th>
        <th style="text-align: center;">Rem.</th>
        <th style="text-align: center;">Util%</th>
        <th style="text-align: center;">Duty Status</th>
      </tr>
    </thead>
    <tbody>
      ${reportRows}
    </tbody>
  </table>
  <div class="sign-grid">
    <div class="sign-box">
      <div style="font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">1. Compiled By (HR Officer)</div>
      <div><strong>Division:</strong> HR Operations & Payroll Audit</div>
      <div class="sig-line"><span>Signature: _______________</span><span>Date: ${new Date().toISOString().slice(0, 10)}</span></div>
    </div>
    <div class="sign-box">
      <div style="font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">2. Verified By (Director of HR)</div>
      <div><strong>Status:</strong> Validated for Institutional Reporting</div>
      <div class="sig-line"><span>Stamp & Sign: _____________</span><span>Date: ____/____/2026</span></div>
    </div>
    <div class="sign-box">
      <div style="font-weight: 800; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 4px;">3. Executive Management</div>
      <div><strong>Authorization:</strong> Chief Medical Administrator</div>
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
      console.warn('Popup blocked, using hidden iframe', e);
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

  const handleCreateLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    const applicantSignature = emp.digitalSignatureUrl || undefined;

    addLeaveRequest({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      staffId: staffId || emp.empCode || 'STF-1001',
      grade: grade || emp.jobTitle || 'Clinical Staff',
      department: department || emp.department,
      unit: unit || emp.unit || 'General Ward',
      leaveType,
      leaveYear: Number(leaveYear),
      leaveEntitlement: Number(leaveEntitlement),
      deferredLeaveDaysDue: Number(deferredLeaveDaysDue),
      leaveDaysEarned: Number(leaveDaysEarned),
      outstandingLeaveDays: Number(outstandingLeaveDays),
      totalDays: Number(days),
      startDate,
      endDate,
      dateOfResumption: resumptionDate || calculateResumptionDate(endDate),
      addressOnLeave,
      phoneOnLeave,
      reason,
      applicantSignatureUrl: applicantSignature,
      applicantSignatureCertified: applicantCertified,
      applicantSignedDate: formatDateParts(new Date()),
      applicantSignedBy: `${emp.firstName} ${emp.lastName}`,
    });

    showToast(`Submitted Official Leave Application for ${emp.firstName} ${emp.lastName} with CHST Digital Certification. Sequential 4-Tier Workflow started.`);
    setIsNewModalOpen(false);
  };

  const handleOpenReview = (leave: LeaveRequest, action: 'Approve' | 'Reject') => {
    setReviewModal({ open: true, leave, action });
    setApproverCertified(true);
    setApprovalComments(
      action === 'Approve'
        ? `Verified request at ${leave.currentStage || 'Unit Head'} level. Shift coverage and staffing clearance confirmed.`
        : `Request cannot be approved at ${leave.currentStage || 'Unit Head'} stage due to critical shift headcount requirements.`
    );
    setCustomApproverName('');
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.leave) return;

    const currentStage = reviewModal.leave.currentStage || 'Unit Head';
    
    // Resolve approver's digital signature from their HR staff profile
    const approverEmp = employees.find((e) => 
      (currentUser?.id && e.id === currentUser.id) ||
      (customApproverName && `${e.firstName} ${e.lastName}`.toLowerCase().includes(customApproverName.toLowerCase().trim())) ||
      (currentUser?.email && e.workEmail?.toLowerCase() === currentUser.email.toLowerCase())
    ) || employees.find((e) => e.department === reviewModal.leave?.department);

    const approverSig = approverEmp?.digitalSignatureUrl || undefined;

    processLeaveWorkflowStep(
      reviewModal.leave.id,
      reviewModal.action,
      approvalComments,
      customApproverName.trim() || undefined,
      approverSig
    );

    if (reviewModal.action === 'Approve') {
      showToast(`Approved Leave Request for ${reviewModal.leave.employeeName} at Tier (${currentStage}) with Certified Digital Signature.`);
    } else {
      showToast(`Rejected Leave Request for ${reviewModal.leave.employeeName} at Tier (${currentStage}).`);
    }

    setReviewModal({ open: false, leave: null, action: 'Approve' });
  };

  // Check if current user role matches current stage of leave request
  const isUserAuthorizedForStage = (stage?: WorkflowStage): boolean => {
    if (!stage) return false;
    if (activeRole === 'super_admin') return true;

    if (stage === 'Unit Head' && activeRole === 'unit_head') return true;
    if (stage === 'Departmental Head' && activeRole === 'dept_head') return true;
    if (stage === 'HR' && (activeRole === 'hr_director' || activeRole === 'hr_manager')) return true;
    if (stage === 'Head of Facility' && activeRole === 'facility_head') return true;

    return false;
  };

  const isHRDirectorOrSuperAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);
  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(activeRole);
  const currentEmpName = currentUser?.name || '';
  const currentEmpEmail = currentUser?.email || '';

  // Current logged in employee record
  const currentUserEmployee = employees.find(
    (e) =>
      e.id === currentUser?.id ||
      (currentUser?.email && e.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.empCode && (e.empCode === currentUser.empCode || e.employeeCode === currentUser.empCode)) ||
      (currentEmpName && `${e.firstName} ${e.lastName}`.toLowerCase() === currentEmpName.toLowerCase())
  ) || employees[0];

  // Filter leaves
  const filteredLeaves = (leaves || []).filter((leave) => {
    if (!leave) return false;
    if (!isHRorAdmin) {
      const isSelf =
        leave.employeeId === currentUser?.id ||
        (currentEmpName && (leave.employeeName || '').toLowerCase().includes(currentEmpName.toLowerCase().split(' ')[0])) ||
        (currentEmpEmail && (leave.employeeName || '').toLowerCase().includes(currentEmpEmail.split('@')[0].toLowerCase()));
      if (!isSelf) return false;
    }

    const currentStage = leave.currentStage || 'Unit Head';
    const isActionRequired = isUserAuthorizedForStage(currentStage) && leave.status === 'Pending';

    if (stageFilter === 'MyAction' && !isActionRequired) return false;
    if (stageFilter !== 'All' && stageFilter !== 'MyAction' && currentStage !== stageFilter) return false;

    if (selectedDeptFilter !== 'All' && leave.department !== selectedDeptFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (leave.employeeName || '').toLowerCase().includes(term);
      const matchDept = (leave.department || '').toLowerCase().includes(term);
      const matchUnit = (leave.unit || '').toLowerCase().includes(term);
      const matchReason = (leave.reason || '').toLowerCase().includes(term);
      if (!matchName && !matchDept && !matchUnit && !matchReason) return false;
    }

    return true;
  });

  // Action required count
  const myActionCount = (leaves || []).filter((l) => l && isUserAuthorizedForStage(l.currentStage) && l.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl text-xs font-semibold animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PlaneTakeoff className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Hospital Multi-Tier Leave Approval Workflow
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Sequential 4-Tier Approval Workflow: <strong className="text-cyan-600 dark:text-cyan-400">1. Unit Head</strong> → <strong className="text-indigo-600 dark:text-indigo-400">2. Departmental Head</strong> → <strong className="text-emerald-600 dark:text-emerald-400">3. HR Manager</strong> → <strong className="text-amber-600 dark:text-amber-400">4. Head of Facility</strong>.
            </p>
          </div>

          {/* Active Assigned Role Badge (Solely Determined by HR) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Crown className="h-3.5 w-3.5 text-amber-500" /> Assigned HR Role:
              </span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 capitalize">
                {activeRole.replace('_', ' ')}
              </span>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition active:scale-95"
            >
              <Plus className="h-4 w-4" /> Apply for Staff Leave
            </button>
          </div>
        </div>

        {/* Action Required Banner for logged in role */}
        {myActionCount > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>
                Attention ({activeRole.replace('_', ' ').toUpperCase()}): You have <strong className="underline">{myActionCount} leave requests</strong> awaiting your Tier sign-off!
              </span>
            </div>
            <button
              onClick={() => setStageFilter('MyAction')}
              className="px-3 py-1 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-500 transition"
            >
              View My Pending Actions ({myActionCount})
            </button>
          </div>
        )}

        {/* Header Mode Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTabMode('applications')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
              activeTabMode === 'applications'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <PlaneTakeoff className="h-4 w-4" /> Official Leave Applications & Workflow
          </button>
          <button
            onClick={() => setActiveTabMode('entitlements')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
              activeTabMode === 'entitlements'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            {isHRDirectorOrSuperAdmin ? 'Staff Database Leave Entitlements' : 'My Staff Leave Entitlement'}
          </button>
          {isHRDirectorOrSuperAdmin && (
            <button
              onClick={() => setActiveTabMode('report')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
                activeTabMode === 'report'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileText className="h-4 w-4 text-purple-300" /> HR Staff Leave Report
            </button>
          )}
          <button
            onClick={() => setActiveTabMode('annual_roaster')}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
              activeTabMode === 'annual_roaster'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <CalendarDays className="h-4 w-4 text-teal-300" /> Annual Unit Leave Roaster (2027)
          </button>
          {isHRDirectorOrSuperAdmin && (
            <button
              onClick={() => setActiveTabMode('signatures')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-2 shrink-0 ${
                activeTabMode === 'signatures'
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <PenTool className="h-4 w-4 text-emerald-300" />
              HR Digital Signatures Vault
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/40 text-emerald-300 border border-emerald-500/40">
                {(employees || []).filter((e) => e && !!e.digitalSignatureUrl).length}/{(employees || []).length}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* MODE 5: HR DIGITAL SIGNATURES VAULT (HR ONLY) */}
      {activeTabMode === 'signatures' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    CHST Directorate HR Security Protocol
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                    <Lock className="h-3 w-3 text-amber-500" /> HR Upload Restricted
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                  <PenTool className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  Staff Digital Signatures Vault
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                  Centralized institutional vault for Catholic Health Service Trust (CHST) staff digital signatures. Digital signatures uploaded by HR alone to prevent forgery, guarantee authenticity, and certify approvals across all 4 workflow tiers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    // Auto-generate certified script signature for all staff without one
                    const missing = (employees || []).filter((e) => e && !e.digitalSignatureUrl);
                    if (missing.length === 0) {
                      showToast('All staff members already have verified digital signatures on file.');
                      return;
                    }
                    missing.forEach((emp) => {
                      uploadEmployeeDigitalSignature(
                        emp.id,
                        `style:${emp.firstName.charAt(0)}.${emp.lastName}`,
                        'Miss Vero (HR Directorate)',
                        'Stylized CHST Cryptographic Signature'
                      );
                    });
                    showToast(`Generated and verified ${missing.length} staff digital signatures in CHST Vault.`);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" /> Auto-Certify Missing ({(employees || []).filter((e) => e && !e.digitalSignatureUrl).length})
                </button>
              </div>
            </div>

            {/* Metric KPI cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Active Staff</div>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">{(employees || []).length}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">PJPIIMC Registry</div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">Signatures Verified</div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {(employees || []).filter((e) => e && !!e.digitalSignatureUrl).length}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Ready for 4-tier sign-off</div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">Pending HR Upload</div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                  {(employees || []).filter((e) => e && !e.digitalSignatureUrl).length}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">Requires HR upload/drawing</div>
              </div>
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                <div className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase">CHST Compliance</div>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {Math.round(((employees || []).filter((e) => e && !!e.digitalSignatureUrl).length / ((employees || []).length || 1)) * 100)}%
                </div>
                <div className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5">Institutional Readiness</div>
              </div>
            </div>

            {/* Filter and Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff name, code, job title..."
                  value={sigSearch}
                  onChange={(e) => setSigSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={sigDeptFilter}
                  onChange={(e) => setSigDeptFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Departments</option>
                  {Array.from(new Set(employees.map((e) => e.department))).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select
                  value={sigStatusFilter}
                  onChange={(e) => setSigStatusFilter(e.target.value as any)}
                  className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
                >
                  <option value="All">All Signature Status</option>
                  <option value="WithSignature">Verified On File</option>
                  <option value="MissingSignature">Missing Signature</option>
                </select>
              </div>
            </div>

            {/* Staff Signatures Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5">Staff Member</th>
                    <th className="p-3.5">Designation & Dept</th>
                    <th className="p-3.5">Official Digital Signature</th>
                    <th className="p-3.5">HR Status & Authority</th>
                    <th className="p-3.5 text-right">HR Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {(employees || [])
                    .filter((e) => {
                      if (!e) return false;
                      const matchSearch =
                        `${e.firstName || ''} ${e.lastName || ''} ${e.empCode || ''} ${e.jobTitle || ''}`
                          .toLowerCase()
                          .includes(sigSearch.toLowerCase());
                      const matchDept = sigDeptFilter === 'All' || e.department === sigDeptFilter;
                      const matchStatus =
                        sigStatusFilter === 'All'
                          ? true
                          : sigStatusFilter === 'WithSignature'
                          ? !!e.digitalSignatureUrl
                          : !e.digitalSignatureUrl;
                      return matchSearch && matchDept && matchStatus;
                    })
                    .map((emp) => {
                      const hasSig = !!emp.digitalSignatureUrl;
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={emp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                                alt=""
                                className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                              />
                              <div>
                                <strong className="text-slate-900 dark:text-slate-100 font-extrabold text-xs block">
                                  {emp.firstName} {emp.lastName}
                                </strong>
                                <span className="font-mono text-[10px] text-slate-500">{emp.empCode || 'STF-1001'}</span>
                              </div>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{emp.jobTitle}</div>
                            <div className="text-[11px] text-slate-500">{emp.department} • {emp.unit || 'General'}</div>
                          </td>

                          <td className="p-3.5">
                            {hasSig ? (
                              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-emerald-500/30 inline-flex items-center gap-3">
                                {emp.digitalSignatureUrl?.startsWith('data:image') || emp.digitalSignatureUrl?.startsWith('http') ? (
                                  <img
                                    src={emp.digitalSignatureUrl}
                                    alt="Signature"
                                    className="h-9 max-w-[140px] object-contain bg-white dark:bg-slate-900 rounded p-1"
                                  />
                                ) : (
                                  <div className="h-9 px-3 flex items-center font-serif italic text-base font-bold text-indigo-900 dark:text-indigo-200 tracking-wider">
                                    {emp.digitalSignatureUrl?.replace('style:', '') || `${emp.firstName} ${emp.lastName}`}
                                  </div>
                                )}
                                <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                  CHST VERIFIED
                                </div>
                              </div>
                            ) : (
                              <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 text-[11px] text-slate-400 italic flex items-center gap-1.5">
                                <Lock className="h-3 w-3 text-amber-500" />
                                No signature on file (HR Upload Required)
                              </div>
                            )}
                          </td>

                          <td className="p-3.5">
                            {hasSig ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" /> Verified by HR
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  Uploaded: {emp.signatureUploadedDate || 'Current Cycle'}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 border border-amber-500/30">
                                <AlertCircle className="h-3 w-3 text-amber-500" /> Action Required
                              </span>
                            )}
                          </td>

                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => {
                                setVaultTargetEmp(emp);
                                setIsSignatureVaultOpen(true);
                              }}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 ml-auto"
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              {hasSig ? 'Update Signature' : 'Upload Signature'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Regulatory Footer */}
            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong>CHST Institutional Digital Signature Governance:</strong> In compliance with Catholic Health Service Trust (CHST) administrative guidelines, digital signatures are maintained exclusively in the secured HR vault. Employees cannot freely overwrite certified signatures. When leave applications or tier approvals are submitted, the verified signature on file is systematically certified and affixed to the permanent leave record and official printable forms.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: ANNUAL UNIT LEAVE ROASTER TAB */}
      {activeTabMode === 'annual_roaster' && (
        <AnnualUnitLeaveRoasterManager />
      )}

      {/* MODE 3: HR STAFF LEAVE REPORT TAB */}
      {activeTabMode === 'report' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          {/* Report Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 block">
                Human Resources Audit & Leave Liabilities
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                PJPIIMC Staff Leave Master Report
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Pope John Paul II Medical Centre - Comprehensive staff leave breakdown, entitlement tracking, approved leave utilization, and remaining balances.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportStaffLeaveReportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
              >
                <FileText className="h-4 w-4 text-emerald-500" /> Export CSV Report
              </button>
              <button
                onClick={handlePrintStaffLeaveMasterReport}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow"
              >
                <Printer className="h-4 w-4" /> Print Official Report
              </button>
            </div>
          </div>

          {/* KPI Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Staff</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{employees.length}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">Active workforce</p>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/50">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Gross Entitlement</span>
              <div className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                {employees.reduce((acc, e) => acc + (e.leaveEntitlement || 30) + (e.deferredLeaveDays || 0), 0)}
              </div>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400/80 mt-0.5">Annual + Deferred days</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Days Taken (Approved)</span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {(leaves || []).filter((l) => l && l.status === 'Approved').reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0)}
              </div>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80 mt-0.5">Utilized leave days</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">Pending Approval</span>
              <div className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                {(leaves || []).filter((l) => l && l.status === 'Pending').reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0)}
              </div>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-0.5">In workflow pipeline</p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
              <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">Net Liability Days</span>
              <div className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-1">
                {(employees || []).filter(Boolean).reduce((acc, e) => {
                  const tot = (e.leaveEntitlement || 30) + (e.deferredLeaveDays || 0);
                  const taken = (leaves || []).filter((l) => l && l.employeeId === e.id && l.status === 'Approved').reduce((a, l) => a + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
                  return acc + (tot - taken);
                }, 0)}
              </div>
              <p className="text-[10px] text-purple-600 dark:text-purple-400/80 mt-0.5">Outstanding staff balance</p>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, code, or role..."
                value={reportSearchTerm}
                onChange={(e) => setReportSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={reportDeptFilter}
                onChange={(e) => setReportDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none"
              >
                <option value="All">All Departments</option>
                <option value="Intensive Care Unit (ICU)">ICU & Critical Care</option>
                <option value="Cardiology & Intensive Care">Cardiology</option>
                <option value="Emergency & Trauma">Emergency & Trauma</option>
                <option value="Surgical Services & OT">Surgical Services</option>
                <option value="Human Resources & Workforce">Human Resources</option>
              </select>

              <select
                value={reportStatusFilter}
                onChange={(e) => setReportStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs focus:border-purple-500 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="OnLeave">Currently On Leave</option>
                <option value="HighLiability">High Balance (&gt;25 Days)</option>
              </select>
            </div>
          </div>

          {/* Staff Leave Report Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">Department & Role</th>
                  <th className="px-4 py-3.5 text-center">Annual</th>
                  <th className="px-4 py-3.5 text-center">Deferred</th>
                  <th className="px-4 py-3.5 text-center">Net Total</th>
                  <th className="px-4 py-3.5 text-center">Days Taken</th>
                  <th className="px-4 py-3.5 text-center">Outstanding</th>
                  <th className="px-4 py-3.5">Utilization Bar</th>
                  <th className="px-4 py-3.5 text-center">Leave Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {(employees || [])
                  .filter((emp) => {
                    if (!emp) return false;
                    const matchesSearch =
                      `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                      (emp.empCode || '').toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
                      (emp.jobTitle || '').toLowerCase().includes(reportSearchTerm.toLowerCase());

                    const matchesDept = reportDeptFilter === 'All' || emp.department === reportDeptFilter;

                    const annual = emp.leaveEntitlement || 30;
                    const def = emp.deferredLeaveDays || 0;
                    const tot = annual + def;
                    const appLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Approved');
                    const taken = appLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
                    const rem = tot - taken;
                    const isOnLeave = (leaves || []).some((l) => l && l.employeeId === emp.id && l.status === 'Approved');

                    let matchesStatus = true;
                    if (reportStatusFilter === 'OnLeave') matchesStatus = isOnLeave;
                    if (reportStatusFilter === 'HighLiability') matchesStatus = rem > 25;

                    return matchesSearch && matchesDept && matchesStatus;
                  })
                  .map((emp) => {
                    const annual = emp.leaveEntitlement || 30;
                    const def = emp.deferredLeaveDays || 0;
                    const tot = annual + def;
                    const appLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Approved');
                    const taken = appLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || (l as any)?.days || 0), 0);
                    const rem = tot - taken;
                    const util = tot > 0 ? Math.min(100, Math.round((taken / tot) * 100)) : 0;
                    const isOnLeave = (leaves || []).some((l) => l && l.employeeId === emp.id && l.status === 'Approved');

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={emp.photo || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
                              alt={emp.firstName}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-semibold">
                                {emp.empCode || 'STF-1001'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-200">{emp.department}</p>
                          <p className="text-[10px] text-slate-500">{emp.jobTitle}</p>
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-indigo-600 dark:text-indigo-400">
                          {annual}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-amber-500">
                          {def}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/50">
                          {tot}
                        </td>

                        <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {taken}
                        </td>

                        <td className="px-4 py-3.5 text-center font-extrabold text-purple-600 dark:text-purple-400">
                          {rem}
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="w-28 space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span>{util}%</span>
                              <span className="text-slate-400">{taken}/{tot}d</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full ${
                                  util > 75
                                    ? 'bg-rose-500'
                                    : util > 40
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${util}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 text-center">
                          {isOnLeave ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              On Leave
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              On Duty
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 2: EMPLOYEE LEAVE ENTITLEMENT SETUP / PERSONAL VIEW TAB */}
      {activeTabMode === 'entitlements' && (
        <div className="space-y-6">
          {!isHRDirectorOrSuperAdmin ? (
            /* INDIVIDUAL STAFF PERSONAL LEAVE ENTITLEMENT VIEW */
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              {/* Staff Profile Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-4">
                  <img
                    src={currentUserEmployee.photo}
                    alt=""
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                        {currentUserEmployee.firstName} {currentUserEmployee.lastName}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
                        {currentUserEmployee.empCode || 'STF-1001'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {currentUserEmployee.jobTitle} • <strong className="text-slate-700 dark:text-slate-300">{currentUserEmployee.department}</strong> ({currentUserEmployee.unit || 'General Unit'})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Leave Year Cycle: <strong className="text-indigo-600 dark:text-indigo-400">2026 / 2027</strong> • Status: <span className="text-emerald-600 font-bold">Active Staff</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedEmpId(currentUserEmployee.id);
                      setIsNewModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                  >
                    <PlaneTakeoff className="h-4 w-4" /> Apply for Leave
                  </button>
                </div>
              </div>

              {/* Personal Entitlement Breakdown KPI Cards */}
              {(() => {
                const ent = currentUserEmployee?.leaveEntitlement ?? 30;
                const def = currentUserEmployee?.deferredLeaveDays ?? 0;
                const totalGross = ent + def;
                const myApprovedLeaves = (leaves || []).filter(
                  (l) => l && l.employeeId === currentUserEmployee?.id && l.status === 'Approved'
                );
                const used = myApprovedLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || 0), 0);
                const outstanding = Math.max(0, totalGross - used);
                const percentUsed = totalGross > 0 ? Math.min(100, Math.round((used / totalGross) * 100)) : 0;

                const myPendingLeaves = (leaves || []).filter(
                  (l) => l && l.employeeId === currentUserEmployee?.id && l.status === 'Pending'
                );

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                          Annual Entitlement
                        </div>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                          {ent} <span className="text-xs font-semibold text-slate-500">Days</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">Hospital Base Cadre</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400">
                          Deferred / Carried Over
                        </div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                          {def} <span className="text-xs font-semibold text-slate-500">Days</span>
                        </div>
                        <div className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1">From Previous Year</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                          Total Gross Entitlement
                        </div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                          {totalGross} <span className="text-xs font-semibold text-slate-500">Days</span>
                        </div>
                        <div className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-1">Annual + Deferred</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400">
                          Approved Days Taken
                        </div>
                        <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                          {used} <span className="text-xs font-semibold text-slate-500">Days</span>
                        </div>
                        <div className="text-[10px] text-rose-600/70 dark:text-rose-400/70 mt-1">Official Leaves Utilized</div>
                      </div>

                      <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 col-span-2 lg:col-span-1">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300">
                          Outstanding Balance
                        </div>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                          {outstanding} <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Days</span>
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">Ready to Apply</div>
                      </div>
                    </div>

                    {/* Utilization Progress Bar */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          Leave Entitlement Utilization
                        </span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          {used} of {totalGross} Days Used ({percentUsed}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>
                    </div>

                    {/* Personal Leave Records Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-500" /> My Leave Application History & Status
                      </h4>

                      {(leaves || []).filter((l) => l && currentUserEmployee && l.employeeId === currentUserEmployee.id).length === 0 ? (
                        <div className="text-center p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                          No leave applications submitted yet this year. You have <strong>{outstanding} days</strong> available.
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 uppercase text-[10px] font-extrabold text-slate-500">
                              <tr>
                                <th className="p-3">Leave Type</th>
                                <th className="p-3">Duration</th>
                                <th className="p-3">Working Days</th>
                                <th className="p-3">Resumption</th>
                                <th className="p-3">Current Status</th>
                                <th className="p-3">Four-Tier Stage</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {(leaves || [])
                                .filter((l) => l && currentUserEmployee && l.employeeId === currentUserEmployee.id)
                                .map((l) => (
                                  <tr key={l.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                                      {l.leaveType}
                                    </td>
                                    <td className="p-3 text-[11px] text-slate-600 dark:text-slate-300">
                                      {l.startDate} to {l.endDate}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                      {l.daysGranted || l.totalDays} Days
                                    </td>
                                    <td className="p-3 text-[11px] text-slate-500">
                                      {l.resumptionDate || 'TBD'}
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                          l.status === 'Approved'
                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                            : l.status === 'Rejected'
                                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                        }`}
                                      >
                                        {l.status}
                                      </span>
                                    </td>
                                    <td className="p-3 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                      {l.currentStage || 'Completed'}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Governance Note */}
                    <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Hospital Governance Notice:</strong> In accordance with Hospital Data Privacy & Governance Policy, staff members can view only their personal leave entitlement and history. For adjustments to your annual allocation or rollover requests, please contact the HR Directorate (Miss Vero or Mr. Frimpong).
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* HR / SUPER ADMIN FULL DATABASE LEAVE ENTITLEMENT CONFIGURATION */
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-indigo-500" />
                    Staff Database Leave Entitlement Configuration
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configure annual leave entitlement days and deferred carried-over leave per staff member in the staff database.
                  </p>
                </div>

                <button
                  onClick={() => {
                    employees.forEach((emp) => {
                      updateEmployee(emp.id, { leaveEntitlement: 30, deferredLeaveDays: 0 });
                    });
                    showToast('Reset default 30-day Annual Leave Entitlement for all active staff members.');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Apply Default 30 Days to All Staff
                </button>
              </div>

              {/* Entitlements Staff Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 uppercase text-[10px] font-extrabold tracking-wider text-slate-500">
                    <tr>
                      <th className="p-3 rounded-l-xl">Staff Member</th>
                      <th className="p-3">Staff ID & Dept</th>
                      <th className="p-3">Annual Entitlement</th>
                      <th className="p-3">Deferred Days</th>
                      <th className="p-3">Total Used</th>
                      <th className="p-3">Outstanding Balance</th>
                      <th className="p-3 rounded-r-xl text-right">Configure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(employees || []).filter(Boolean).map((emp) => {
                      const ent = emp.leaveEntitlement ?? 30;
                      const def = emp.deferredLeaveDays ?? 0;
                      const approvedLeaves = (leaves || []).filter((l) => l && l.employeeId === emp.id && l.status === 'Approved');
                      const used = approvedLeaves.reduce((acc, l) => acc + (l?.daysGranted || l?.totalDays || 0), 0);
                      const outstanding = Math.max(0, (ent + def) - used);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="p-3 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                            <img src={emp.photo} alt="" className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                            <div>
                              <div>{emp.firstName} {emp.lastName}</div>
                              <div className="text-[10px] font-normal text-slate-400">{emp.jobTitle}</div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-medium">
                            <div className="text-slate-700 dark:text-slate-300 font-bold">{emp.empCode || 'STF-1001'}</div>
                            <div className="text-[10px] text-slate-400">{emp.department}</div>
                          </td>
                          <td className="p-3 font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">
                            {ent} Days
                          </td>
                          <td className="p-3 font-bold text-amber-600 dark:text-amber-400">
                            {def} Days
                          </td>
                          <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">
                            {used} Days
                          </td>
                          <td className="p-3">
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                              {outstanding} Days
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setEntitlementEditModal({ open: true, emp });
                                setEditEntitlementVal(ent);
                                setEditDeferredVal(def);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 transition border border-indigo-200 dark:border-indigo-800"
                            >
                              Edit Entitlement
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Employee Entitlement Modal */}
      {entitlementEditModal.open && entitlementEditModal.emp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                  Setup Leave Entitlement
                </h3>
                <p className="text-xs text-slate-500">
                  {entitlementEditModal.emp.firstName} {entitlementEditModal.emp.lastName} ({entitlementEditModal.emp.empCode})
                </p>
              </div>
              <button onClick={() => setEntitlementEditModal({ open: false, emp: null })}>✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Annual Leave Entitlement (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={90}
                  value={editEntitlementVal}
                  onChange={(e) => setEditEntitlementVal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-indigo-600 dark:text-indigo-400 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Deferred / Carried-Over Leave Days</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={editDeferredVal}
                  onChange={(e) => setEditDeferredVal(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-amber-500 text-sm"
                />
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                Net Annual Entitlement Total: <strong className="text-emerald-600 dark:text-emerald-400">{editEntitlementVal + editDeferredVal} Days</strong>. This updates the staff database record dynamically.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEntitlementEditModal({ open: false, emp: null })}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateEmployee(entitlementEditModal.emp.id, {
                    leaveEntitlement: editEntitlementVal,
                    deferredLeaveDays: editDeferredVal,
                  });
                  showToast(`Updated leave entitlement for ${entitlementEditModal.emp.firstName} ${entitlementEditModal.emp.lastName} to ${editEntitlementVal} days.`);
                  setEntitlementEditModal({ open: false, emp: null });
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 shadow"
              >
                Save Entitlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 1: APPLICATIONS & MULTI-TIER WORKFLOW TAB */}
      {activeTabMode === 'applications' && (
        <div className="space-y-6">
          {/* Workflow Stage Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setStageFilter('All')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'All'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            All Requests ({leaves.length})
          </button>

          <button
            onClick={() => setStageFilter('MyAction')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
              stageFilter === 'MyAction'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Pending My Approval ({myActionCount})
          </button>

          <button
            onClick={() => setStageFilter('Unit Head')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Unit Head'
                ? 'bg-cyan-600 text-white shadow'
                : 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100'
            }`}
          >
            Tier 1: Unit Head
          </button>

          <button
            onClick={() => setStageFilter('Departmental Head')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Departmental Head'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
            }`}
          >
            Tier 2: Dept Head
          </button>

          <button
            onClick={() => setStageFilter('HR')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'HR'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            Tier 3: HR
          </button>

          <button
            onClick={() => setStageFilter('Head of Facility')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Head of Facility'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            }`}
          >
            Tier 4: Head of Facility
          </button>

          <button
            onClick={() => setStageFilter('Fully Approved')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Fully Approved'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Fully Approved
          </button>

          <button
            onClick={() => setStageFilter('Rejected')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              stageFilter === 'Rejected'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search staff, reason, unit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Leave Request Cards with 4-Tier Workflow Visual Stepper */}
      <div className="space-y-4">
        {filteredLeaves.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <PlaneTakeoff className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-200">No Leave Requests Found</h3>
            <p className="mt-1 text-xs text-slate-500">No leave applications match the selected workflow filter criteria.</p>
          </div>
        ) : (
          filteredLeaves.map((leave) => {
            const currentStage = leave.currentStage || 'Unit Head';
            const wf = leave.workflow;
            const canUserApproveThis = isUserAuthorizedForStage(currentStage) && leave.status === 'Pending';

            return (
              <div
                key={leave.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 hover:border-emerald-500/50 transition"
              >
                {/* Top Info Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                      {leave.leaveType}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {leave.employeeName}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">• {formatLeaveDaysText(leave.totalDays, leave.leaveType)}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{leave.department}</span>
                        <span>({leave.unit || 'General Unit'})</span>
                        <span>• Applied: {leave.appliedOn || leave.startDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Overall Status Badge & View Official Form Button */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOfficialFormModal({ open: true, leave })}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                      title="View or Print Official 4-Part HR Leave Form"
                    >
                      <FileText className="h-3.5 w-3.5 text-amber-500" />
                      View Official Form
                    </button>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        leave.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : leave.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                      }`}
                    >
                      {leave.status === 'Pending' ? `Workflow Stage: ${currentStage}` : leave.status}
                    </span>

                    {/* Action buttons if user is authorized at current stage */}
                    {canUserApproveThis && (
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleOpenReview(leave, 'Approve')}
                          className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition flex items-center gap-1 active:scale-95"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve at {currentStage}
                        </button>

                        <button
                          onClick={() => handleOpenReview(leave, 'Reject')}
                          className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition flex items-center gap-1 active:scale-95"
                        >
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason & Leave Dates */}
                <div className="text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-500 dark:text-slate-400">Reason for Application: </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{leave.reason}</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    📅 {leave.startDate} to {leave.endDate}
                  </div>
                </div>

                {/* VISUAL 4-TIER WORKFLOW STEPPER */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>4-Tier Sequential Approval Progress</span>
                    {canUserApproveThis ? (
                      <span className="text-emerald-500 font-extrabold animate-pulse">
                        ★ YOUR ROLE ({activeRole.toUpperCase()}) CAN SIGN OFF NOW
                      </span>
                    ) : leave.status === 'Pending' ? (
                      <span className="text-slate-400">
                        Waiting for: <strong>{currentStage}</strong> review
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    {/* Step 1: Unit Head */}
                    <WorkflowStepCard
                      stepNumber={1}
                      title="Unit Head"
                      step={wf?.unitHeadStep}
                      isCurrent={currentStage === 'Unit Head' && leave.status === 'Pending'}
                      color="cyan"
                    />

                    {/* Step 2: Departmental Head */}
                    <WorkflowStepCard
                      stepNumber={2}
                      title="Department Head"
                      step={wf?.departmentHeadStep}
                      isCurrent={currentStage === 'Departmental Head' && leave.status === 'Pending'}
                      color="indigo"
                    />

                    {/* Step 3: HR Manager */}
                    <WorkflowStepCard
                      stepNumber={3}
                      title="Human Resources"
                      step={wf?.hrStep}
                      isCurrent={currentStage === 'HR' && leave.status === 'Pending'}
                      color="emerald"
                    />

                    {/* Step 4: Head of Facility */}
                    <WorkflowStepCard
                      stepNumber={4}
                      title="Head of Facility"
                      step={wf?.facilityHeadStep}
                      isCurrent={currentStage === 'Head of Facility' && leave.status === 'Pending'}
                      color="amber"
                    />
                  </div>
                </div>

                {/* Rejection notice if rejected */}
                {leave.status === 'Rejected' && wf?.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-300">
                    <strong className="font-extrabold block">❌ Rejection Notes ({wf.rejectedByRole}):</strong>
                    <span>{wf.rejectionReason} — Reviewed by {wf.rejectedByName || 'Authorized Officer'}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
      )}

      {/* Review & Sign-off Modal */}
      {reviewModal.open && reviewModal.leave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                {reviewModal.action === 'Approve' ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
                {reviewModal.action} Leave Request (Tier: {reviewModal.leave.currentStage || 'Unit Head'})
              </h3>
              <button
                onClick={() => setReviewModal({ open: false, leave: null, action: 'Approve' })}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 mb-4 text-xs space-y-1">
              <div>
                <span className="text-slate-400 font-semibold">Staff Member:</span>{' '}
                <strong className="text-slate-800 dark:text-slate-200">{reviewModal.leave.employeeName}</strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Leave Type & Duration:</span>{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {reviewModal.leave.leaveType} ({reviewModal.leave.totalDays} Days)
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Department / Unit:</span>{' '}
                <span className="text-slate-700 dark:text-slate-300">
                  {reviewModal.leave.department} ({reviewModal.leave.unit || 'General Unit'})
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Authorized Reviewer Name / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Sarah Jenkins (Leave Committee / HOD)"
                  value={customApproverName}
                  onChange={(e) => setCustomApproverName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  Approval Notes & Operational Comments
                </label>
                <textarea
                  rows={3}
                  required
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                ></textarea>
              </div>

              {/* Digital Signature & Certification Box for Reviewer */}
              {reviewModal.action === 'Approve' && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <PenTool className="h-3.5 w-3.5 text-emerald-600" />
                      Approver Official Digital Signature
                    </span>
                    <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Award className="h-3 w-3" /> CHST HR Verified
                    </span>
                  </div>

                  {(() => {
                    const approverEmp = employees.find((e) =>
                      (currentUser?.id && e.id === currentUser.id) ||
                      (customApproverName && `${e.firstName} ${e.lastName}`.toLowerCase().includes(customApproverName.toLowerCase().trim())) ||
                      (currentUser?.email && e.workEmail?.toLowerCase() === currentUser.email.toLowerCase())
                    ) || employees.find((e) => e.department === reviewModal.leave?.department);

                    const sigUrl = approverEmp?.digitalSignatureUrl;

                    return (
                      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          {sigUrl ? (
                            sigUrl.startsWith('data:image') || sigUrl.startsWith('http') ? (
                              <img src={sigUrl} alt="Signature" className="h-9 max-w-[140px] object-contain" />
                            ) : (
                              <div className="h-9 px-2 flex items-center font-serif italic text-base font-bold text-indigo-900 dark:text-indigo-200">
                                {sigUrl.replace('style:', '')}
                              </div>
                            )
                          ) : (
                            <div className="text-[11px] text-slate-500 italic flex items-center gap-1">
                              <Lock className="h-3.5 w-3.5 text-amber-500" />
                              Official Stylized Cryptographic Signature (Tier Seal on file)
                            </div>
                          )}
                        </div>

                        {isHRDirectorOrSuperAdmin && approverEmp && (
                          <button
                            type="button"
                            onClick={() => {
                              setVaultTargetEmp(approverEmp);
                              setIsSignatureVaultOpen(true);
                            }}
                            className="text-[10px] text-emerald-700 dark:text-emerald-300 underline font-bold"
                          >
                            Manage in Vault
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  <label className="flex items-start gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={approverCertified}
                      onChange={(e) => setApproverCertified(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      required
                    />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 leading-tight">
                      I certify that I have verified the shift staffing and compliance for this application at the <strong>{reviewModal.leave.currentStage || 'Unit Head'}</strong> tier and authorize affixing my verified digital signature.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal({ open: false, leave: null, action: 'Approve' })}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-xl px-5 py-2 font-bold text-white shadow ${
                    reviewModal.action === 'Approve'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {reviewModal.action}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customized New Leave Application Modal (PART A) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Building2 className="h-3 w-3" /> CATHOLIC HEALTH SERVICE TRUST (CHST)
                </div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Staff Leave Application Form (PART A)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pope John Paul II Medical Centre • Fill in Part A details to initiate the sequential 4-Tier Approval Workflow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLeave} className="space-y-4 text-xs">
              {/* Applicant Particulars Header */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="font-extrabold text-amber-600 dark:text-amber-400 uppercase text-[11px] tracking-wider">
                  APPLICANT PARTICULARS
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1">NAME</label>
                    <select
                      value={selectedEmpId}
                      onChange={(e) => setSelectedEmpId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">STAFF ID</label>
                    <input
                      type="text"
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">GRADE / TITLE</label>
                    <input
                      type="text"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">PRESENT UNIT / DEPT</label>
                    <input
                      type="text"
                      value={unit ? `${unit} (${department})` : department}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">TYPE OF LEAVE APPLIED FOR</label>
                  <select
                    value={leaveType}
                    onChange={(e) => handleLeaveTypeChange(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-bold text-emerald-600 dark:text-emerald-400"
                  >
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick / Medical">Sick / Medical</option>
                    <option value="Study / CME">Study / CME Conference</option>
                    <option value="Hazard / Emergency">Hazard / Emergency</option>
                    <option value="Maternity">Maternity</option>
                    <option value="Paternity">Paternity</option>
                  </select>
                </div>
              </div>

              {/* PART A (APPLICATION DATA) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-2">
                  <div className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase text-[11px] tracking-wider">
                    PART A — LEAVE APPLICATION DETAILS
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px]">
                    📊 Outstanding Leave Balance: {outstandingLeaveDays} Days
                  </div>
                </div>

                {/* Staff Database Live Balance Badge */}
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center justify-between">
                  <span>
                    Staff DB Record: Annual Entitlement ({leaveEntitlement}d) + Deferred ({deferredLeaveDaysDue}d) - Approved Taken ({totalUsedLeaveDays}d)
                  </span>
                  <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                    {outstandingLeaveDays} Days Outstanding
                  </strong>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]">LEAVE YEAR</label>
                    <input
                      type="number"
                      value={leaveYear}
                      onChange={(e) => setLeaveYear(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">ENTITLEMENT (DAYS)</label>
                    <input
                      type="number"
                      value={leaveEntitlement}
                      onChange={(e) => setLeaveEntitlement(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">DEFERRED DAYS DUE</label>
                    <input
                      type="number"
                      value={deferredLeaveDaysDue}
                      onChange={(e) => setDeferredLeaveDaysDue(Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">OUTSTANDING DAYS</label>
                    <input
                      type="number"
                      readOnly
                      value={outstandingLeaveDays}
                      className="w-full rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40 p-2 text-emerald-600 dark:text-emerald-400 font-extrabold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px] text-slate-700 dark:text-slate-300">
                      COMMENCEMENT DATE (START)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px] text-slate-700 dark:text-slate-300">
                      LEAVE END DATE (LAST DAY)
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2 dark:bg-slate-800 font-medium text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-[10px] text-emerald-700 dark:text-emerald-400">
                        RESUMPTION / RETURN DATE
                      </label>
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-300 font-black bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        +1 Day
                      </span>
                    </div>
                    <input
                      type="date"
                      value={resumptionDate}
                      onChange={(e) => handleResumptionDateChange(e.target.value)}
                      className="w-full rounded-xl border border-emerald-500/60 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 text-emerald-800 dark:text-emerald-300 font-black text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px] text-slate-700 dark:text-slate-300">
                      CALCULATED DURATION (DAYS)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={days}
                      onChange={(e) => handleDaysChange(Number(e.target.value))}
                      className="w-full rounded-xl border border-emerald-500/50 bg-emerald-50/60 dark:bg-slate-800 p-2 font-black text-emerald-600 dark:text-emerald-400 text-sm focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 dark:text-amber-200 font-medium flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>
                      Auto-Calculated Duration: <strong className="text-amber-950 dark:text-amber-100 font-black">{days} {days === 1 ? 'Day' : 'Days'}</strong>
                      {isMaternityLeave(leaveType) ? (
                        <span className="ml-2 text-[10px] text-purple-700 dark:text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-lg font-bold border border-purple-500/30">
                          Maternity Leave: Calendar Days (Mon–Sun)
                        </span>
                      ) : (
                        <span className="ml-2 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-lg font-bold border border-emerald-500/30">
                          Working Days Only (Excl. Weekends)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-900 dark:text-amber-200">
                      Leave Span: <strong>{startDate}</strong> to <strong>{endDate}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30">
                      Resumption Date: <strong>{resumptionDate || calculateResumptionDate(endDate)}</strong> (+1 Day)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold mb-1 text-[10px]">ADDRESS ON LEAVE</label>
                    <input
                      type="text"
                      value={addressOnLeave}
                      onChange={(e) => setAddressOnLeave(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1 text-[10px]">TELEPHONE NO.</label>
                    <input
                      type="text"
                      value={phoneOnLeave}
                      onChange={(e) => setPhoneOnLeave(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-[10px]">REASON / PURPOSE FOR LEAVE</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 p-2.5 dark:bg-slate-800 font-medium"
                  ></textarea>
                </div>
              </div>

              {/* Digital Signature & Certification Box for Applicant */}
              {(() => {
                const emp = employees.find((e) => e.id === selectedEmpId);
                const hasSig = !!emp?.digitalSignatureUrl;

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <PenTool className="h-3.5 w-3.5 text-emerald-600" />
                        Applicant Digital Signature (Managed by HR Directorate)
                      </span>
                      {hasSig ? (
                        <span className="text-[9px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> CHST HR Verified Signature
                        </span>
                      ) : (
                        <span className="text-[9px] font-extrabold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="h-3 w-3 text-amber-500" /> HR Upload Restricted
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        {hasSig ? (
                          emp.digitalSignatureUrl?.startsWith('data:image') || emp.digitalSignatureUrl?.startsWith('http') ? (
                            <img
                              src={emp.digitalSignatureUrl}
                              alt="Signature"
                              className="h-10 max-w-[150px] object-contain"
                            />
                          ) : (
                            <div className="h-10 px-2 flex items-center font-serif italic text-lg font-bold text-indigo-900 dark:text-indigo-200">
                              {emp.digitalSignatureUrl?.replace('style:', '') || `${emp.firstName} ${emp.lastName}`}
                            </div>
                          )
                        ) : (
                          <div className="text-xs text-slate-400 italic">
                            [ Official Digital Signature Placeholder - No Signature on File with HR Directorate ]
                          </div>
                        )}
                      </div>

                      {isHRDirectorOrSuperAdmin && emp && (
                        <button
                          type="button"
                          onClick={() => {
                            setVaultTargetEmp(emp);
                            setIsSignatureVaultOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[10px] font-bold hover:bg-emerald-100 transition"
                        >
                          {hasSig ? 'Edit in Vault' : '+ Upload Signature (HR)'}
                        </button>
                      )}
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={applicantCertified}
                        onChange={(e) => setApplicantCertified(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        required
                      />
                      <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300 leading-tight">
                        I hereby certify that the particulars in this leave application are true, accurate, and complete under Catholic Health Service Trust (CHST) Leave Regulations.
                      </span>
                    </label>
                  </div>
                );
              })()}

              <div className="text-[10px] text-slate-400 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 italic">
                NB: Leave application must comply with proposed date and submitted at least 7 working days prior to start date.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white shadow hover:bg-emerald-500 flex items-center gap-1.5"
                >
                  <FileCheck className="h-4 w-4" /> Submit Application (Part A)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official 4-Part Leave Application Document View Modal */}
      <OfficialLeaveFormViewModal
        isOpen={officialFormModal.open}
        onClose={() => setOfficialFormModal({ open: false, leave: null })}
        leave={officialFormModal.leave}
        hospitalName="POPE JOHN PAUL II MEDICAL CENTRE"
      />

      {/* HR Digital Signature Vault Modal (HR Directorate Only) */}
      <HRSignatureVaultModal
        isOpen={isSignatureVaultOpen}
        onClose={() => {
          setIsSignatureVaultOpen(false);
          setVaultTargetEmp(null);
        }}
        targetEmployee={vaultTargetEmp}
      />
    </div>
  );
};

// Subcomponent for Workflow Step Node Card
const WorkflowStepCard: React.FC<{
  stepNumber: number;
  title: string;
  step?: any;
  isCurrent: boolean;
  color: 'cyan' | 'indigo' | 'emerald' | 'amber';
}> = ({ stepNumber, title, step, isCurrent }) => {
  const isApproved = step?.status === 'Approved';
  const isRejected = step?.status === 'Rejected';

  return (
    <div
      className={`p-3 rounded-xl border transition text-xs ${
        isApproved
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
          : isRejected
          ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
          : isCurrent
          ? 'bg-amber-500/10 border-amber-500/60 ring-2 ring-amber-500/30'
          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-extrabold text-slate-500 uppercase">TIER {stepNumber}</span>
        {isApproved ? (
          <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-[10px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        ) : isRejected ? (
          <span className="flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 text-[10px]">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </span>
        ) : isCurrent ? (
          <span className="font-extrabold text-amber-600 dark:text-amber-400 text-[10px] animate-pulse">
            ● Active Pending Review
          </span>
        ) : (
          <span className="text-slate-400 text-[10px]">Upcoming</span>
        )}
      </div>

      <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">{title}</div>

      {isApproved && (
        <div className="mt-1 text-[10px] text-slate-600 dark:text-slate-300 space-y-0.5">
          <div className="font-semibold text-emerald-700 dark:text-emerald-400 truncate">
            ✓ {step.approverName || 'Authorized Officer'}
          </div>
          {step.approvedAt && (
            <div className="text-[9px] text-slate-400">{new Date(step.approvedAt).toLocaleDateString()}</div>
          )}
        </div>
      )}
    </div>
  );
};
