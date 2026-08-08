import React, { useState } from 'react';
import { FileSpreadsheet, Download, FileText, Printer, CheckCircle2 } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const CustomReportsExporter: React.FC = () => {
  const { employees, payrolls, rosters, attendance } = useHrms();
  const [reportType, setReportType] = useState('employee_roster');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [generatedMsg, setGeneratedMsg] = useState('');

  const handleGenerateReport = () => {
    let filename = `AuraHR_Report_${reportType}_${Date.now()}.${exportFormat}`;
    let csvContent = '';

    if (reportType === 'employee_roster') {
      csvContent = 'EmpCode,Name,Title,Department,Salary\n' +
        employees.map((e) => `"${e.empCode}","${e.firstName} ${e.lastName}","${e.jobTitle}","${e.department}",${e.salary}`).join('\n');
    } else if (reportType === 'payroll_summary') {
      csvContent = 'Name,BaseSalary,NightAllowance,HazardPay,NetPay,Status\n' +
        payrolls.map((p) => `"${p.employeeName}",${p.baseSalary},${p.nightDutyAllowance},${p.hazardPay},${p.netPay},"${p.status}"`).join('\n');
    } else {
      csvContent = 'EmpCode,Name,Department,Date,ClockIn,ClockOut,RegularHours,OvertimeHours,Method,ApprovalStatus\n' +
        attendance.map((a) => {
          const emp = employees.find((e) => e.id === a.employeeId);
          return `"${emp?.empCode || 'STAFF'}","${a.employeeName}","${emp?.department || 'General'}","${a.date}","${a.clockIn}","${a.clockOut}",8.0,${a.overtimeHours},"${a.method}","${a.approvalStatus}"`;
        }).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    setGeneratedMsg(`✓ Report exported successfully as ${filename}!`);
    setTimeout(() => setGeneratedMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
          Healthcare Custom Analytics & Report Exporter
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Generate JCAHO compliance reports, monthly payroll statements & roster logs in PDF, Excel, and CSV.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 max-w-2xl">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-4">Report Builder Options</h3>

        {generatedMsg && (
          <div className="mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 p-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> {generatedMsg}
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            >
              <option value="employee_roster">Active Medical Staff Directory & Licenses</option>
              <option value="payroll_summary">Monthly Hospital Payroll & Hazard Pay Summary</option>
              <option value="attendance_log">ICU Shift Attendance & Biometric Clock Logs</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Export Format</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setExportFormat('csv')}
                className={`py-2 rounded-xl font-bold border transition ${
                  exportFormat === 'csv'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                CSV Data
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('excel')}
                className={`py-2 rounded-xl font-bold border transition ${
                  exportFormat === 'excel'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => setExportFormat('pdf')}
                className={`py-2 rounded-xl font-bold border transition ${
                  exportFormat === 'pdf'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-300'
                }`}
              >
                PDF Document
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
          >
            <Download className="h-4 w-4" /> Download Custom Report
          </button>
        </div>
      </div>
    </div>
  );
};
