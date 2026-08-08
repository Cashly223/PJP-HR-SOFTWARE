import React, { useState } from 'react';
import { Banknote, Lock, Download, Printer, CheckCircle, FileText, X } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { PayrollRecord } from '../../types/hrms';

export const PayrollProcessor: React.FC = () => {
  const { payrolls, formatCurrency, approvePayroll, lockPayroll, selectedHospital } = useHrms();
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  const handleExportCSV = () => {
    const headers = 'Employee,Department,BaseSalary,NightAllowance,HazardPay,Overtime,Deductions,NetPay,Status\n';
    const rows = payrolls
      .map(
        (p) =>
          `"${p.employeeName}","${p.department}",${p.baseSalary},${p.nightDutyAllowance},${p.hazardPay},${p.overtimePay},${p.taxDeduction + p.pensionDeduction},${p.netPay},"${p.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraHR_Payroll_July2026.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-emerald-600" />
            Healthcare Payroll & Salary Calculations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculates base salary, night duty allowance, hazard pay, doctor call duty pay, tax, pension & net take-home pay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4" /> Export Bank File (CSV)
          </button>
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Doctor / Staff</th>
                <th className="px-5 py-3.5">Base Salary</th>
                <th className="px-5 py-3.5">Night Allowance</th>
                <th className="px-5 py-3.5">Hazard Pay</th>
                <th className="px-5 py-3.5">On-Call Pay</th>
                <th className="px-5 py-3.5">Tax & Pension</th>
                <th className="px-5 py-3.5">Net Salary</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-5 py-4">
                    <span className="font-bold">{p.employeeName}</span>
                    <p className="text-[10px] text-slate-400">{p.department}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold">{formatCurrency(p.baseSalary)}</td>
                  <td className="px-5 py-4 text-emerald-600 font-semibold">+{formatCurrency(p.nightDutyAllowance)}</td>
                  <td className="px-5 py-4 text-emerald-600 font-semibold">+{formatCurrency(p.hazardPay)}</td>
                  <td className="px-5 py-4 text-emerald-600 font-semibold">+{formatCurrency(p.onCallAllowance)}</td>
                  <td className="px-5 py-4 text-rose-500 font-semibold">-{formatCurrency(p.taxDeduction + p.pensionDeduction)}</td>
                  <td className="px-5 py-4 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(p.netPay)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded px-2.5 py-1 text-[10px] font-bold ${
                        p.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : p.status === 'Approved'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-1">
                    <button
                      onClick={() => setSelectedPayslip(p)}
                      className="rounded bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <FileText className="inline h-3 w-3 mr-1" /> Payslip
                    </button>
                    {p.status === 'Draft' && (
                      <button
                        onClick={() => approvePayroll(p.id)}
                        className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                      >
                        Approve
                      </button>
                    )}
                    {p.status === 'Approved' && (
                      <button
                        onClick={() => lockPayroll(p.id)}
                        className="rounded bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-slate-700"
                      >
                        <Lock className="inline h-3 w-3 mr-1" /> Lock
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Generator Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Official Hospital Payslip Header */}
            <div className="border-b pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-emerald-600 dark:text-emerald-400">
                    AuraHR Healthcare Salary Slip
                  </h3>
                  <p className="text-xs text-slate-400">{selectedHospital.name} • {selectedPayslip.month} {selectedPayslip.year}</p>
                </div>
                <span className="rounded bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  CONFIDENTIAL
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Employee Name:</span>
                <span className="font-bold">{selectedPayslip.employeeName}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Department:</span>
                <span>{selectedPayslip.department}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Base Monthly Pay:</span>
                <span>{formatCurrency(selectedPayslip.baseSalary)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Night Duty Allowance:</span>
                <span className="text-emerald-600 font-semibold">+{formatCurrency(selectedPayslip.nightDutyAllowance)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Hazard Duty Pay:</span>
                <span className="text-emerald-600 font-semibold">+{formatCurrency(selectedPayslip.hazardPay)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">On-Call Allowance:</span>
                <span className="text-emerald-600 font-semibold">+{formatCurrency(selectedPayslip.onCallAllowance)}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-slate-800">
                <span className="font-semibold text-slate-500">Income Tax & Pension Deductions:</span>
                <span className="text-rose-500 font-semibold">-{formatCurrency(selectedPayslip.taxDeduction + selectedPayslip.pensionDeduction)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <span>Net Salary Payable:</span>
                <span>{formatCurrency(selectedPayslip.netPay)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
