import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  Building2,
  Building,
  Calendar,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Sparkles,
  Award,
  ExternalLink,
  MapPin,
  FileCheck,
  X,
  History,
  TrendingUp,
  HelpCircle,
  Eye,
  Pencil,
  Tag,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, StaffMovementRecord, EmploymentSource, TransferType } from '../../types/hrms';
import { printElementById, printHtmlContent } from '../../utils/printDocument';

interface StaffTransferRegistryProps {
  onSelectEmployee?: (emp: Employee) => void;
  onEditEmployee?: (emp: Employee) => void;
}

export const StaffTransferRegistry: React.FC<StaffTransferRegistryProps> = ({
  onSelectEmployee,
  onEditEmployee,
}) => {
  const { employees, recordStaffMovement, showToast } = useHrms();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [transferTypeFilter, setTransferTypeFilter] = useState<string>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Modal for Recording New Movement / Transfer
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [movementForm, setMovementForm] = useState<{
    transferType: string;
    employmentSource: string;
    previousDepartment: string;
    newDepartment: string;
    previousPosition: string;
    newPosition: string;
    previousUnit: string;
    newUnit: string;
    previousOrganisation: string;
    effectiveDate: string;
    reason: string;
    approvingAuthority: string;
    referenceNumber: string;
    documentFileName: string;
    documentUrl: string;
    remarks: string;
  }>({
    transferType: 'Internal Transfer',
    employmentSource: 'Transfer',
    previousDepartment: '',
    newDepartment: '',
    previousPosition: '',
    newPosition: '',
    previousUnit: '',
    newUnit: '',
    previousOrganisation: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reason: 'Operational Redeployment / Workforce Alignment',
    approvingAuthority: 'Director of HR & Chief Executive Administrator',
    referenceNumber: `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    documentFileName: '',
    documentUrl: '',
    remarks: '',
  });

  // View Details Modal for a specific Movement Record
  const [viewingRecord, setViewingRecord] = useState<{
    movement: StaffMovementRecord;
    employee?: Employee;
  } | null>(null);

  // Collect all movements across all employees
  const allMovements = useMemo(() => {
    const list: Array<{ movement: StaffMovementRecord; employee: Employee }> = [];
    employees.forEach((emp) => {
      if (emp.movementHistory && emp.movementHistory.length > 0) {
        emp.movementHistory.forEach((m) => {
          list.push({ movement: m, employee: emp });
        });
      } else if (emp.employmentSource === 'Transfer' || emp.transferType) {
        // Synthesize initial onboarding transfer record if no history array exists yet
        list.push({
          movement: {
            id: `init-trf-${emp.id}`,
            employeeId: emp.id,
            employeeName: `${emp.firstName} ${emp.lastName}`,
            empCode: emp.empCode,
            previousDepartment: emp.previousDepartment || 'Previous Health Service Post',
            newDepartment: emp.currentDepartment || emp.department,
            previousPosition: emp.previousPosition || 'Previous Clinical / Admin Role',
            newPosition: emp.currentPosition || emp.jobTitle,
            effectiveDate: emp.transferDate || emp.dateJoinedPJPIIMC || emp.joinDate,
            transferType: emp.transferType || 'External Transfer',
            employmentSource: emp.employmentSource || 'Transfer',
            previousOrganisation: emp.previousOrganisation || 'Ghana Health Service / External Facility',
            reason: 'Induction / Institutional Transfer into PJPIIMC',
            approvingAuthority: 'HR Directorate & Appointments Committee',
            referenceNumber: emp.transferReferenceNumber || `TRF-ONB-${emp.empCode}`,
            status: 'Completed',
          },
          employee: emp,
        });
      }
    });

    // Sort by effectiveDate descending
    return list.sort((a, b) => {
      const dateA = new Date(a.movement.effectiveDate || '2000-01-01').getTime();
      const dateB = new Date(b.movement.effectiveDate || '2000-01-01').getTime();
      return dateB - dateA;
    });
  }, [employees]);

  // Distinct Departments & Sources
  const allDepartments = useMemo(() => {
    const depts = new Set<string>();
    employees.forEach((e) => {
      if (e.department) depts.add(e.department);
      if (e.previousDepartment) depts.add(e.previousDepartment);
    });
    return Array.from(depts).sort();
  }, [employees]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return allMovements.filter(({ movement, employee }) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        movement.employeeName?.toLowerCase().includes(q) ||
        movement.empCode?.toLowerCase().includes(q) ||
        movement.previousDepartment?.toLowerCase().includes(q) ||
        movement.newDepartment?.toLowerCase().includes(q) ||
        movement.previousPosition?.toLowerCase().includes(q) ||
        movement.newPosition?.toLowerCase().includes(q) ||
        movement.previousOrganisation?.toLowerCase().includes(q) ||
        movement.referenceNumber?.toLowerCase().includes(q) ||
        movement.reason?.toLowerCase().includes(q) ||
        movement.approvingAuthority?.toLowerCase().includes(q) ||
        `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(q);

      const matchesSource =
        sourceFilter === 'All' ||
        movement.employmentSource === sourceFilter ||
        employee.employmentSource === sourceFilter;

      const matchesTransferType =
        transferTypeFilter === 'All' ||
        movement.transferType === transferTypeFilter ||
        employee.transferType === transferTypeFilter;

      const matchesDept =
        deptFilter === 'All' ||
        movement.newDepartment === deptFilter ||
        movement.previousDepartment === deptFilter ||
        employee.department === deptFilter;

      let matchesDate = true;
      if (dateRangeFilter.start && movement.effectiveDate) {
        matchesDate = matchesDate && movement.effectiveDate >= dateRangeFilter.start;
      }
      if (dateRangeFilter.end && movement.effectiveDate) {
        matchesDate = matchesDate && movement.effectiveDate <= dateRangeFilter.end;
      }

      return matchesSearch && matchesSource && matchesTransferType && matchesDept && matchesDate;
    });
  }, [allMovements, searchTerm, sourceFilter, transferTypeFilter, deptFilter, dateRangeFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const totalStaff = (employees || []).length;
    const transferredStaff = (employees || []).filter(
      (e) => e && (e.employmentSource === 'Transfer' || (e.movementHistory && e.movementHistory.length > 0))
    ).length;
    const internalCount = (allMovements || []).filter(
      (m) => m?.movement?.transferType === 'Internal Transfer' || m?.movement?.transferType?.includes('Internal')
    ).length;
    const externalCount = (allMovements || []).filter(
      (m) => m?.movement?.transferType === 'External Transfer' || m?.movement?.transferType?.includes('External')
    ).length;
    const completedCount = (allMovements || []).filter((m) => m?.movement?.status !== 'Pending Effect').length;

    return {
      totalStaff,
      transferredStaff,
      internalCount,
      externalCount,
      completedCount,
      totalRecords: allMovements.length,
    };
  }, [employees, allMovements]);

  // Handle staff selection for recording new movement
  const handleStaffSelectionChange = (empId: string) => {
    setSelectedStaffId(empId);
    const emp = employees.find((e) => e.id === empId);
    if (emp) {
      setMovementForm((prev) => ({
        ...prev,
        previousDepartment: emp.currentDepartment || emp.department || '',
        previousPosition: emp.currentPosition || emp.jobTitle || '',
        previousUnit: emp.unit || '',
        previousOrganisation: emp.previousOrganisation || 'Pope John Paul II Medical Centre',
        newDepartment: emp.currentDepartment || emp.department || '',
        newPosition: emp.currentPosition || emp.jobTitle || '',
        newUnit: emp.unit || '',
      }));
    }
  };

  // Submit new movement
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      showToast('error', 'Staff Required', 'Please select an employee to record movement for.');
      return;
    }

    const emp = employees.find((e) => e.id === selectedStaffId);
    if (!emp) return;

    recordStaffMovement({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      empCode: emp.empCode,
      previousDepartment: movementForm.previousDepartment,
      newDepartment: movementForm.newDepartment,
      previousPosition: movementForm.previousPosition,
      newPosition: movementForm.newPosition,
      previousUnit: movementForm.previousUnit,
      newUnit: movementForm.newUnit,
      effectiveDate: movementForm.effectiveDate,
      transferType: movementForm.transferType,
      employmentSource: movementForm.employmentSource,
      previousOrganisation: movementForm.previousOrganisation,
      reason: movementForm.reason,
      approvingAuthority: movementForm.approvingAuthority,
      referenceNumber: movementForm.referenceNumber,
      documentFileName: movementForm.documentFileName,
      documentUrl: movementForm.documentUrl,
      remarks: movementForm.remarks,
      status: 'Completed',
    });

    setIsRecordModalOpen(false);
    setSelectedStaffId('');
  };

  // Print Transfer Registry
  const handlePrintRegistry = () => {
    printElementById('staff-transfer-registry-table', 'Staff Transfer & Postings Registry', {
      landscape: true,
      title: 'PJPIIMC - Official Staff Movement & Postings Registry',
    });
  };

  const handlePrintTransferMemo = (record: { movement: StaffMovementRecord; employee?: Employee }) => {
    const memoHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #000;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 18pt; text-transform: uppercase; color: #0f172a;">POPE JOHN PAUL II MEDICAL CENTRE</h2>
          <p style="margin: 3px 0; font-size: 10pt; font-weight: bold; color: #334155;">CATHOLIC DIOCESAN HEALTH SERVICES • MEMBER OF CHAG</p>
          <p style="margin: 0; font-size: 9pt; color: #059669; font-weight: bold;">DIRECTORATE OF HUMAN RESOURCE MANAGEMENT & CLINICAL POSTINGS</p>
        </div>

        <div style="text-align: right; font-size: 10pt; margin-bottom: 15px;">
          <strong>Date:</strong> ${record.movement.effectiveDate || new Date().toISOString().slice(0, 10)}<br/>
          <strong>Ref No:</strong> ${record.movement.referenceNumber || `PJPIIMC/TRF/${record.movement.id.slice(0, 6).toUpperCase()}`}
        </div>

        <h3 style="text-align: center; text-decoration: underline; font-size: 13pt; margin-bottom: 20px; text-transform: uppercase;">
          OFFICIAL POSTING / TRANSFER NOTIFICATION MEMORANDUM
        </h3>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10.5pt;">
          <tr>
            <td style="width: 30%; font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Employee Name</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'Hospital Staff'} (${record.employee?.empCode || 'N/A'})</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Movement Type</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${record.movement.transferType} (Source: ${record.movement.employmentSource || 'Internal Post'})</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Previous Department / Role</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${record.movement.previousDepartment} • ${record.movement.previousPosition}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">New Department / Role</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #047857;">${record.movement.newDepartment} • ${record.movement.newPosition}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Effective Date</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${record.movement.effectiveDate}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 8px; border: 1px solid #cbd5e1; background: #f8fafc;">Approving Authority</td>
            <td style="padding: 8px; border: 1px solid #cbd5e1;">${record.movement.approvingAuthority}</td>
          </tr>
        </table>

        <div style="margin-bottom: 25px; font-size: 10.5pt; line-height: 1.6;">
          <p><strong>Clinical Justification / Administrative Reason:</strong></p>
          <p style="padding: 12px; background: #f8fafc; border-left: 4px solid #059669; margin: 5px 0;">
            ${record.movement.reason}
          </p>
          <p style="margin-top: 15px;">
            By copy of this memorandum, the recipient is advised to execute formal handover procedures with the Head of Department and report to their new duty station on or before the effective date.
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 10pt;">
          <div style="width: 45%; border-top: 1px solid #000; padding-top: 5px; text-align: center;">
            <strong>${record.movement.approvingAuthority}</strong><br/>
            <span>Medical Director / HR Directorate</span>
          </div>
          <div style="width: 45%; border-top: 1px solid #000; padding-top: 5px; text-align: center;">
            <strong>Employee Acknowledgement</strong><br/>
            <span>Signature & Date</span>
          </div>
        </div>
      </div>
    `;

    printHtmlContent(memoHtml, `Transfer_Memo_${record.employee?.empCode || 'Staff'}`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Staff Code',
      'Employee Name',
      'Employment Source',
      'Transfer Type',
      'Previous Organisation',
      'Previous Department',
      'Previous Position',
      'New Department',
      'New Position',
      'Effective Date',
      'Reference Number',
      'Approving Authority',
      'Reason',
      'Status',
    ];

    const rows = filteredMovements.map(({ movement, employee }) => [
      `"${employee.empCode || ''}"`,
      `"${employee.firstName} ${employee.lastName}"`,
      `"${movement.employmentSource || employee.employmentSource || 'N/A'}"`,
      `"${movement.transferType || 'Internal Transfer'}"`,
      `"${movement.previousOrganisation || employee.previousOrganisation || 'PJPIIMC'}"`,
      `"${movement.previousDepartment || 'N/A'}"`,
      `"${movement.previousPosition || 'N/A'}"`,
      `"${movement.newDepartment || 'N/A'}"`,
      `"${movement.newPosition || 'N/A'}"`,
      `"${movement.effectiveDate || 'N/A'}"`,
      `"${movement.referenceNumber || 'N/A'}"`,
      `"${movement.approvingAuthority || 'N/A'}"`,
      `"${movement.reason || 'N/A'}"`,
      `"${movement.status || 'Completed'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PJPIIMC_Staff_Transfer_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Transfer Registry Exported', 'Downloaded CSV summary.');
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ArrowRightLeft className="h-4 w-4" /> PJPIIMC Human Resources Governance
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            Staff Transfers & Movement Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Track and audit employee employment source, internal redeployments, inter-institutional transfers, previous organisations, and historical departmental movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-400" /> Export CSV
          </button>
          <button
            onClick={handlePrintRegistry}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 flex items-center gap-2 transition shadow-sm"
          >
            <Printer className="h-4 w-4 text-cyan-400" /> Print Registry
          </button>
          <button
            onClick={() => {
              setIsRecordModalOpen(true);
              if (employees.length > 0 && !selectedStaffId) {
                handleStaffSelectionChange(employees[0].id);
              }
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950/40"
          >
            <Plus className="h-4 w-4" /> Record New Movement / Transfer
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowRightLeft className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Staff Transferred
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{metrics.transferredStaff}</span>
            <span className="text-xs font-bold text-emerald-400">
              ({Math.round((metrics.transferredStaff / (metrics.totalStaff || 1)) * 100)}% of workforce)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">With documented transfers / movements</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Internal Transfers
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{metrics.internalCount}</span>
            <span className="text-xs font-bold text-cyan-400">Redeployments</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Inter-departmental & unit postings</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Building className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            External Transfers
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{metrics.externalCount}</span>
            <span className="text-xs font-bold text-amber-400">Inter-Facility</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">From GHS & other healthcare facilities</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-3 right-3 p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <History className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
            Total Movement Events
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{metrics.totalRecords}</span>
            <span className="text-xs font-bold text-indigo-400">Audited</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Complete historical ledger entries</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by staff name, code, previous org, ref #, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* Employment Source Filter */}
          <div className="md:col-span-2">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="All">All Sources</option>
              <option value="Transfer">Transfer</option>
              <option value="New Hire">New Hire</option>
              <option value="Promotion">Promotion</option>
              <option value="Reappointment">Reappointment</option>
              <option value="National Service">National Service</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Transfer Type Filter */}
          <div className="md:col-span-2">
            <select
              value={transferTypeFilter}
              onChange={(e) => setTransferTypeFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="All">All Transfer Types</option>
              <option value="Internal Transfer">Internal Transfer</option>
              <option value="External Transfer">External Transfer</option>
              <option value="Departmental Redeployment">Departmental Redeployment</option>
              <option value="Promotion Movement">Promotion Movement</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="md:col-span-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="All">All Departments</option>
              {allDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="md:col-span-2 flex items-center justify-end">
            {(searchTerm || sourceFilter !== 'All' || transferTypeFilter !== 'All' || deptFilter !== 'All' || dateRangeFilter.start || dateRangeFilter.end) && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSourceFilter('All');
                  setTransferTypeFilter('All');
                  setDeptFilter('All');
                  setDateRangeFilter({ start: '', end: '' });
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-rose-500/20 flex items-center justify-center gap-1.5 transition"
              >
                <X className="h-3.5 w-3.5" /> Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Date Range Sub-Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
            <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Filter by Movement Date:
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px]">From</span>
            <input
              type="date"
              value={dateRangeFilter.start}
              onChange={(e) => setDateRangeFilter((prev) => ({ ...prev, start: e.target.value }))}
              className="py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px]">To</span>
            <input
              type="date"
              value={dateRangeFilter.end}
              onChange={(e) => setDateRangeFilter((prev) => ({ ...prev, end: e.target.value }))}
              className="py-1 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <span className="ml-auto text-[11px] text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredMovements.length}</strong> movement records
          </span>
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Staff Movements & Transfer Ledger</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {filteredMovements.length} Records
          </span>
        </div>

        {filteredMovements.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <ArrowRightLeft className="h-10 w-10 mx-auto text-slate-600 stroke-[1.5]" />
            <p className="text-sm font-semibold text-slate-400">No transfer or movement records match your search criteria.</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or click "Record New Movement / Transfer" above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider font-bold border-b border-slate-800">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Transfer / Source</th>
                  <th className="py-3 px-4">Previous Post / Organisation</th>
                  <th className="py-3 px-4">New Post & Department</th>
                  <th className="py-3 px-4">Effective Date</th>
                  <th className="py-3 px-4">Reference & Authority</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium text-slate-300">
                {filteredMovements.map(({ movement, employee }) => (
                  <tr
                    key={movement.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Employee */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={employee.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={employee.firstName}
                          className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-xs">
                              {employee.firstName} {employee.lastName}
                            </span>
                            <span className="font-mono text-[9px] bg-slate-800 text-emerald-400 px-1.5 py-0.2 rounded font-bold border border-slate-700">
                              {employee.empCode}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">
                            {employee.jobTitle}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Source & Transfer Type */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            movement.transferType === 'External Transfer'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : movement.transferType === 'Internal Transfer'
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {movement.transferType || 'Internal Transfer'}
                        </span>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Tag className="h-3 w-3 text-slate-500" />
                          <span>Source: <strong className="text-slate-300">{movement.employmentSource || employee.employmentSource || 'Transfer'}</strong></span>
                        </div>
                      </div>
                    </td>

                    {/* Previous Post */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-rose-300 block text-xs">
                          {movement.previousPosition || 'Previous Post'}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {movement.previousDepartment || 'Previous Department'}
                        </span>
                        {movement.previousOrganisation && (
                          <span className="text-[10px] text-amber-400/90 font-medium block mt-0.5 flex items-center gap-1">
                            <Building className="h-3 w-3 shrink-0" /> {movement.previousOrganisation}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* New Post */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-emerald-400 block text-xs">
                          {movement.newPosition || employee.jobTitle}
                        </span>
                        <span className="text-[11px] text-slate-300 block mt-0.5">
                          {movement.newDepartment || employee.department}
                        </span>
                        {movement.newUnit && (
                          <span className="text-[10px] text-slate-400 block">
                            Unit: {movement.newUnit}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Effective Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-200">
                        <Calendar className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span className="font-bold">{movement.effectiveDate || '—'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Status: <strong className="text-emerald-400 font-semibold">{movement.status || 'Completed'}</strong>
                      </span>
                    </td>

                    {/* Reference & Authority */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-xs font-bold text-cyan-300 block">
                          {movement.referenceNumber || 'TRF-REC'}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[160px]" title={movement.approvingAuthority}>
                          Auth: {movement.approvingAuthority}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingRecord({ movement, employee })}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white transition"
                          title="View Full Movement Memo"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {onSelectEmployee && (
                          <button
                            type="button"
                            onClick={() => onSelectEmployee(employee)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white transition"
                            title="Open Employee Dossier"
                          >
                            <User className="h-4 w-4" />
                          </button>
                        )}
                        {onEditEmployee && (
                          <button
                            type="button"
                            onClick={() => onEditEmployee(employee)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white transition"
                            title="Edit Employee & Employment Info"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD NEW MOVEMENT / TRANSFER MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ArrowRightLeft className="h-3.5 w-3.5" /> Staff Movement & Transfer Form
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">Record Staff Transfer / Movement</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-4 text-xs">
              {/* Step 1: Select Employee */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <label className="block text-slate-300 font-bold text-xs">
                  Select Employee / Staff Member *
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={(e) => handleStaffSelectionChange(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 font-semibold focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.empCode}) — {emp.jobTitle} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Step 2: Transfer Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Employment Source</label>
                  <select
                    value={movementForm.employmentSource}
                    onChange={(e) => setMovementForm({ ...movementForm, employmentSource: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Transfer">Transfer</option>
                    <option value="New Hire">New Hire</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Reappointment">Reappointment</option>
                    <option value="National Service">National Service</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Transfer Type</label>
                  <select
                    value={movementForm.transferType}
                    onChange={(e) => setMovementForm({ ...movementForm, transferType: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Internal Transfer">Internal Transfer (Within PJPIIMC)</option>
                    <option value="External Transfer">External Transfer (From GHS / Other Org)</option>
                    <option value="Departmental Redeployment">Departmental Redeployment</option>
                    <option value="Promotion Movement">Promotion Movement</option>
                  </select>
                </div>
              </div>

              {/* Previous Organisation (If External Transfer or Transfer Source) */}
              {(movementForm.transferType === 'External Transfer' || movementForm.employmentSource === 'Transfer') && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <Building className="h-4 w-4" /> Previous Institution / Facility Information
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Previous Organisation *</label>
                      <input
                        type="text"
                        placeholder="e.g. Korle Bu Teaching Hospital / Ridge Regional Hospital"
                        value={movementForm.previousOrganisation}
                        onChange={(e) => setMovementForm({ ...movementForm, previousOrganisation: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">Previous Position Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Senior Medical Officer / Ward Nurse"
                        value={movementForm.previousPosition}
                        onChange={(e) => setMovementForm({ ...movementForm, previousPosition: e.target.value })}
                        className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: From -> To Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Previous State */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-rose-950/60 space-y-2">
                  <span className="font-bold text-rose-400 block text-xs uppercase tracking-wider">
                    Previous Position & Department
                  </span>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Previous Department / Unit</label>
                    <input
                      type="text"
                      required
                      value={movementForm.previousDepartment}
                      onChange={(e) => setMovementForm({ ...movementForm, previousDepartment: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">Previous Position</label>
                    <input
                      type="text"
                      required
                      value={movementForm.previousPosition}
                      onChange={(e) => setMovementForm({ ...movementForm, previousPosition: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 focus:outline-none focus:border-rose-500 font-medium"
                    />
                  </div>
                </div>

                {/* New State */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-950/60 space-y-2">
                  <span className="font-bold text-emerald-400 block text-xs uppercase tracking-wider">
                    New Position & Department
                  </span>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">New Department *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Intensive Care Unit (ICU)"
                      value={movementForm.newDepartment}
                      onChange={(e) => setMovementForm({ ...movementForm, newDepartment: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] mb-1">New Position / Job Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Critical Care Specialist"
                      value={movementForm.newPosition}
                      onChange={(e) => setMovementForm({ ...movementForm, newPosition: e.target.value })}
                      className="w-full p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-300 focus:outline-none focus:border-emerald-500 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Metadata & Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Effective Date *</label>
                  <input
                    type="date"
                    required
                    value={movementForm.effectiveDate}
                    onChange={(e) => setMovementForm({ ...movementForm, effectiveDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Reference Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TRF-2026-0042"
                    value={movementForm.referenceNumber}
                    onChange={(e) => setMovementForm({ ...movementForm, referenceNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Approving Authority *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Director of HR / CMO"
                    value={movementForm.approvingAuthority}
                    onChange={(e) => setMovementForm({ ...movementForm, approvingAuthority: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                </div>
              </div>

              {/* Reason for Movement */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reason for Movement / Justification *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Strategic workforce alignment to critical care, career progression, staff requested lateral transfer..."
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-emerald-950/50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Save Movement Record & Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MOVEMENT MEMO MODAL */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Staff Movement Memo & Transfer Docket</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Ref: {viewingRecord.movement.referenceNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Employee Summary Card */}
              {viewingRecord.employee && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3.5">
                  <img
                    src={viewingRecord.employee.photo}
                    alt={viewingRecord.employee.firstName}
                    className="h-12 w-12 rounded-xl object-cover border border-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">
                      {viewingRecord.employee.firstName} {viewingRecord.employee.lastName}
                    </h4>
                    <p className="text-[11px] text-emerald-400 font-medium">
                      {viewingRecord.employee.jobTitle} • {viewingRecord.employee.department}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Staff Code: <strong className="text-slate-200">{viewingRecord.employee.empCode}</strong> | Joined PJPIIMC: {viewingRecord.employee.dateJoinedPJPIIMC || viewingRecord.employee.joinDate}
                    </p>
                  </div>
                </div>
              )}

              {/* Movement Details Grid */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Transfer Type</span>
                  <span className="font-bold text-cyan-300 text-xs mt-0.5 block">{viewingRecord.movement.transferType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Employment Source</span>
                  <span className="font-bold text-amber-300 text-xs mt-0.5 block">{viewingRecord.movement.employmentSource || 'Transfer'}</span>
                </div>
                {viewingRecord.movement.previousOrganisation && (
                  <div className="col-span-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Previous Organisation</span>
                    <span className="font-bold text-white text-xs mt-0.5 block">{viewingRecord.movement.previousOrganisation}</span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Previous Department</span>
                  <span className="font-bold text-rose-300 text-xs mt-0.5 block">{viewingRecord.movement.previousDepartment}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">New Department</span>
                  <span className="font-bold text-emerald-400 text-xs mt-0.5 block">{viewingRecord.movement.newDepartment}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Previous Position</span>
                  <span className="font-bold text-slate-300 text-xs mt-0.5 block">{viewingRecord.movement.previousPosition}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">New Position</span>
                  <span className="font-bold text-emerald-400 text-xs mt-0.5 block">{viewingRecord.movement.newPosition}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Effective Date</span>
                  <span className="font-bold text-white font-mono text-xs mt-0.5 block">{viewingRecord.movement.effectiveDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Approving Authority</span>
                  <span className="font-bold text-slate-200 text-xs mt-0.5 block">{viewingRecord.movement.approvingAuthority}</span>
                </div>
              </div>

              {/* Justification / Reason */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Reason for Movement / Clinical Justification</span>
                <p className="text-slate-200 font-medium">{viewingRecord.movement.reason}</p>
              </div>

              {/* Audit trail */}
              <div className="text-[10px] text-slate-500 flex items-center justify-between pt-2">
                <span>Recorded By: {viewingRecord.movement.recordedBy || 'HR Administration'}</span>
                <span>Date: {viewingRecord.movement.recordedAt ? new Date(viewingRecord.movement.recordedAt).toLocaleDateString() : 'Audited'}</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => handlePrintTransferMemo(viewingRecord)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5 text-cyan-400" /> Print Memo
                </button>
                <button
                  type="button"
                  onClick={() => setViewingRecord(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
