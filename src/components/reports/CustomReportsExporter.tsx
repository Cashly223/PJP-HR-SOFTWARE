import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  BookOpen,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const CustomReportsExporter: React.FC = () => {
  const { employees, payrolls, attendance, leaves, courses, trainingAttendance } = useHrms();

  // Selected Category Query
  const [queryCategory, setQueryCategory] = useState<
    'attendance_lateness' | 'leave' | 'license_credentials' | 'lms_training'
  >('attendance_lateness');

  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [generatedMsg, setGeneratedMsg] = useState('');

  // Extract unique departments
  const departmentList = Array.from(new Set((employees || []).filter(Boolean).map((e) => e.department).filter(Boolean)));

  // Query 1: Attendance & Lateness Data
  const getAttendanceData = () => {
    return (attendance || [])
      .filter(Boolean)
      .map((a) => {
        const emp = (employees || []).find((e) => e && e.id === a.employeeId);
        // Calculate late status
        const clockInTime = a.clockIn || '08:00';
        const hour = parseInt(clockInTime.split(':')[0], 10);
        const min = parseInt(clockInTime.split(':')[1] || '0', 10);
        const isLate = hour > 8 || (hour === 8 && min > 15);
        const minutesLate = isLate ? (hour - 8) * 60 + min - 15 : 0;

        return {
          id: a.id,
          empCode: emp?.employeeCode || emp?.empCode || 'SJH-1001',
          staffName: a.employeeName || `${emp?.firstName || ''} ${emp?.lastName || ''}`,
          department: emp?.department || 'General Ward',
          date: a.date,
          clockIn: a.clockIn,
          clockOut: a.clockOut,
          status: isLate ? 'Late Arrival' : 'On Time',
          minutesLate,
          overtimeHours: a.overtimeHours,
          method: a.method,
          verificationStatus: a.approvalStatus,
        };
      })
      .filter((rec) => {
        if (deptFilter !== 'All' && rec.department !== deptFilter) return false;
        if (searchTerm) {
          const t = searchTerm.toLowerCase();
          return (
            (rec.staffName || '').toLowerCase().includes(t) ||
            (rec.empCode || '').toLowerCase().includes(t) ||
            (rec.department || '').toLowerCase().includes(t)
          );
        }
        return true;
      });
  };

  // Query 2: Leave & Entitlements Data
  const getLeaveData = () => {
    return (leaves || [])
      .filter(Boolean)
      .map((l) => {
        const emp = (employees || []).find((e) => e && e.id === l.employeeId);
        return {
          id: l.id,
          empCode: l.staffId || emp?.employeeCode || 'SJH-1001',
          staffName: l.employeeName || `${emp?.firstName || ''} ${emp?.lastName || ''}`,
          department: l.department || emp?.department || 'General',
          leaveType: l.leaveType,
          totalDays: l.totalDays,
          startDate: l.startDate,
          endDate: l.endDate,
          approvalStage: l.currentStage || 'Unit Head',
          status: l.status,
          entitlement: l.leaveEntitlement || 30,
        };
      })
      .filter((rec) => {
        if (deptFilter !== 'All' && rec.department !== deptFilter) return false;
        if (searchTerm) {
          const t = searchTerm.toLowerCase();
          return (
            (rec.staffName || '').toLowerCase().includes(t) ||
            (rec.empCode || '').toLowerCase().includes(t) ||
            (rec.leaveType || '').toLowerCase().includes(t) ||
            (rec.department || '').toLowerCase().includes(t)
          );
        }
        return true;
      });
  };

  // Query 3: License & Credentials Data
  const getLicenseData = () => {
    const records: Array<{
      id: string;
      empCode: string;
      staffName: string;
      department: string;
      licenseName: string;
      issuingBody: string;
      licenseNumber: string;
      expiryDate: string;
      status: string;
    }> = [];

    (employees || []).filter(Boolean).forEach((emp) => {
      (emp.medicalLicenses || []).filter(Boolean).forEach((lic) => {
        records.push({
          id: lic.id,
          empCode: emp.employeeCode || emp.empCode || 'SJH-1001',
          staffName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Staff',
          department: emp.department || 'Clinical',
          licenseName: lic.name || 'Medical License',
          issuingBody: lic.issuingAuthority || 'State Medical Board',
          licenseNumber: lic.licenseNumber || 'LIC-N/A',
          expiryDate: lic.expiryDate || '',
          status: lic.status || 'Active',
        });
      });
    });

    return records.filter((rec) => {
      if (deptFilter !== 'All' && rec.department !== deptFilter) return false;
      if (searchTerm) {
        const t = searchTerm.toLowerCase();
        return (
          (rec.staffName || '').toLowerCase().includes(t) ||
          (rec.empCode || '').toLowerCase().includes(t) ||
          (rec.licenseName || '').toLowerCase().includes(t) ||
          (rec.department || '').toLowerCase().includes(t)
        );
      }
      return true;
    });
  };

  // Query 4: LMS & Training Data
  const getLmsData = () => {
    return (courses || [])
      .filter(Boolean)
      .map((c) => ({
        id: c.id,
        courseTitle: c.title,
        category: c.category,
        durationHours: c.durationHours,
        instructor: c.instructor,
        scheduledDate: c.scheduledDate,
        venue: c.venue,
        status: c.status,
        progressPercent: c.progressPercent,
        score: c.score || 95,
        certificateIssued: c.certificateIssued ? 'Yes' : 'Pending',
      }))
      .filter((rec) => {
        if (searchTerm) {
          const t = searchTerm.toLowerCase();
          return (
            (rec.courseTitle || '').toLowerCase().includes(t) ||
            (rec.category || '').toLowerCase().includes(t) ||
            (rec.instructor || '').toLowerCase().includes(t)
          );
        }
        return true;
      });
  };

  const handleExecuteExport = () => {
    let filename = `PJPIIMC_Report_${queryCategory}_${Date.now()}.${exportFormat}`;
    let csvHeaders = '';
    let csvRows: string[] = [];

    if (queryCategory === 'attendance_lateness') {
      const data = getAttendanceData();
      csvHeaders = 'Staff ID,Staff Name,Department,Date,Clock In,Clock Out,Lateness Status,Delay (Mins),Overtime (Hrs),Biometric Method,Approval Status';
      csvRows = data.map(
        (d) =>
          `"${d.empCode}","${d.staffName}","${d.department}","${d.date}","${d.clockIn}","${d.clockOut}","${d.status}",${d.minutesLate},${d.overtimeHours},"${d.method}","${d.verificationStatus}"`
      );
    } else if (queryCategory === 'leave') {
      const data = getLeaveData();
      csvHeaders = 'Staff ID,Staff Name,Department,Leave Type,Total Days,Start Date,End Date,Approval Stage,Status,Entitlement';
      csvRows = data.map(
        (d) =>
          `"${d.empCode}","${d.staffName}","${d.department}","${d.leaveType}",${d.totalDays},"${d.startDate}","${d.endDate}","${d.approvalStage}","${d.status}",${d.entitlement}`
      );
    } else if (queryCategory === 'license_credentials') {
      const data = getLicenseData();
      csvHeaders = 'Staff ID,Staff Name,Department,License / Credential Name,Issuing Authority,License No,Expiry Date,Compliance Status';
      csvRows = data.map(
        (d) =>
          `"${d.empCode}","${d.staffName}","${d.department}","${d.licenseName}","${d.issuingBody}","${d.licenseNumber}","${d.expiryDate}","${d.status}"`
      );
    } else if (queryCategory === 'lms_training') {
      const data = getLmsData();
      csvHeaders = 'Course ID,Course Title,Category,Duration (Hrs),Instructor,Scheduled Date,Venue,Status,Progress (%),Certificate Issued';
      csvRows = data.map(
        (d) =>
          `"${d.id}","${d.courseTitle}","${d.category}",${d.durationHours},"${d.instructor}","${d.scheduledDate}","${d.venue}","${d.status}",${d.progressPercent},"${d.certificateIssued}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [csvHeaders, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setGeneratedMsg(`✓ Custom Query report generated & exported as ${filename}!`);
    setTimeout(() => setGeneratedMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 p-6 rounded-2xl border border-indigo-900/40 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <FileSpreadsheet className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            PJPIIMC Hospital Analytics & Compliance
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Custom Report & Multi-Module Query Builder</h2>
          <p className="text-sm text-slate-300 max-w-2xl mt-1">
            Query and generate customized administrative & clinical reports across Attendance & Lateness, Staff Leaves, License Credentials, and LMS Training.
          </p>
        </div>
      </div>

      {/* Query Category Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setQueryCategory('attendance_lateness')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            queryCategory === 'attendance_lateness'
              ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-lg shadow-blue-950/40'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Clock className="w-6 h-6 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
              Module 1
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-white">Attendance & Lateness</h3>
            <p className="text-xs text-slate-400 mt-0.5">Biometric clocking, late arrivals & overtime hours</p>
          </div>
        </button>

        <button
          onClick={() => setQueryCategory('leave')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            queryCategory === 'leave'
              ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-950/40'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Calendar className="w-6 h-6 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Module 2
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-white">Leave & Entitlements</h3>
            <p className="text-xs text-slate-400 mt-0.5">Annual leave, approval stages & entitlements</p>
          </div>
        </button>

        <button
          onClick={() => setQueryCategory('license_credentials')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            queryCategory === 'license_credentials'
              ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-lg shadow-amber-950/40'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
              Module 3
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-white">License & Credentials</h3>
            <p className="text-xs text-slate-400 mt-0.5">Medical licenses, board certification & expiries</p>
          </div>
        </button>

        <button
          onClick={() => setQueryCategory('lms_training')}
          className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            queryCategory === 'lms_training'
              ? 'bg-purple-600/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-950/40'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
              Module 4
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-white">LMS & Training</h3>
            <p className="text-xs text-slate-400 mt-0.5">CME courses, attendance logs & certifications</p>
          </div>
        </button>
      </div>

      {/* Query Filters & Export Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, course or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Department Filter */}
            {queryCategory !== 'lms_training' && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Departments</option>
                {departmentList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  exportFormat === 'csv' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                CSV
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  exportFormat === 'excel' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Excel
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 text-slate-400 hover:text-white`}
              >
                <Printer className="w-3.5 h-3.5" /> PDF Print
              </button>
            </div>

            <button
              onClick={handleExecuteExport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Report Data
            </button>
          </div>
        </div>

        {generatedMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{generatedMsg}</span>
          </div>
        )}
      </div>

      {/* Queried Data Preview Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Live Query Results Preview
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Category: <strong className="text-slate-200 uppercase">{queryCategory.replace('_', ' ')}</strong>
          </span>
        </div>

        {/* 1. Attendance & Lateness Table */}
        {queryCategory === 'attendance_lateness' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Clock In / Out</th>
                  <th className="py-3 px-4">Lateness Status</th>
                  <th className="py-3 px-4">Clock Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {getAttendanceData().map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{rec.empCode}</td>
                    <td className="py-2.5 px-4 font-bold text-white">{rec.staffName}</td>
                    <td className="py-2.5 px-4 text-slate-300">{rec.department}</td>
                    <td className="py-2.5 px-4 text-slate-400 font-mono">{rec.date}</td>
                    <td className="py-2.5 px-4 font-mono">
                      {rec.clockIn} - {rec.clockOut}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Late Arrival'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {rec.status} {rec.minutesLate > 0 ? `(${rec.minutesLate}m late)` : ''}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{rec.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Leave Query Table */}
        {queryCategory === 'leave' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Dates</th>
                  <th className="py-3 px-4">Approval Stage</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {getLeaveData().map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{rec.empCode}</td>
                    <td className="py-2.5 px-4 font-bold text-white">{rec.staffName}</td>
                    <td className="py-2.5 px-4 text-slate-300">{rec.department}</td>
                    <td className="py-2.5 px-4 font-medium text-emerald-400">{rec.leaveType}</td>
                    <td className="py-2.5 px-4 font-bold">{rec.totalDays} days</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400 text-[11px]">
                      {rec.startDate} → {rec.endDate}
                    </td>
                    <td className="py-2.5 px-4 text-slate-300">{rec.approvalStage}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold text-[10px]">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. License Credentials Table */}
        {queryCategory === 'license_credentials' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Staff ID</th>
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">License Name</th>
                  <th className="py-3 px-4">Issuing Authority</th>
                  <th className="py-3 px-4">License No</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {getLicenseData().map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono text-slate-400">{rec.empCode}</td>
                    <td className="py-2.5 px-4 font-bold text-white">{rec.staffName}</td>
                    <td className="py-2.5 px-4 text-slate-300">{rec.department}</td>
                    <td className="py-2.5 px-4 font-medium text-amber-300">{rec.licenseName}</td>
                    <td className="py-2.5 px-4 text-slate-400">{rec.issuingBody}</td>
                    <td className="py-2.5 px-4 font-mono">{rec.licenseNumber}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-300">{rec.expiryDate}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. LMS & Training Table */}
        {queryCategory === 'lms_training' && (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Course Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Venue</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Cert Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {getLmsData().map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-white">{rec.courseTitle}</td>
                    <td className="py-2.5 px-4 text-slate-300">{rec.category}</td>
                    <td className="py-2.5 px-4 font-mono">{rec.durationHours} Hours</td>
                    <td className="py-2.5 px-4 text-slate-300">{rec.instructor}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-400">{rec.scheduledDate}</td>
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">{rec.venue}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-blue-500/10 text-blue-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-emerald-400">{rec.certificateIssued}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
