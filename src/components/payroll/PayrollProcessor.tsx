import React, { useState } from 'react';
import {
  Banknote,
  Lock,
  Download,
  Printer,
  CheckCircle,
  FileText,
  X,
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  DollarSign,
  Building2,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { PayrollRecord, ExpenseClaim } from '../../types/hrms';

export const PayrollProcessor: React.FC = () => {
  const {
    payrolls,
    expenseClaims,
    addExpenseClaim,
    updateExpenseClaimStatus,
    formatCurrency,
    approvePayroll,
    lockPayroll,
    selectedHospital,
    currentUser,
    activeRole,
  } = useHrms();

  const [activeSubTab, setActiveSubTab] = useState<'payslips' | 'expense_claims'>('payslips');
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);

  // Expense Claim Form Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimType, setClaimType] = useState<ExpenseClaim['claimType']>('CME & Clinical Training');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDesc, setClaimDesc] = useState('');

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  const currentEmpName = currentUser?.name || '';
  const currentEmpEmail = currentUser?.email || '';

  const displayedPayrolls = isHRorAdmin
    ? (payrolls || [])
    : (payrolls || []).filter((p) => {
        if (!p) return false;
        if (p.employeeId === currentUser?.id) return true;
        const pName = (p.employeeName || '').toLowerCase();
        if (currentEmpName && pName.includes(currentEmpName.toLowerCase().split(' ')[0])) return true;
        if (currentEmpEmail && pName.includes(currentEmpEmail.split('@')[0].toLowerCase())) return true;
        return false;
      });

  const displayedExpenseClaims = isHRorAdmin
    ? (expenseClaims || [])
    : (expenseClaims || []).filter((c) => {
        if (!c) return false;
        if (c.employeeId === currentUser?.id) return true;
        const cName = (c.employeeName || '').toLowerCase();
        if (currentEmpName && cName.includes(currentEmpName.toLowerCase().split(' ')[0])) return true;
        if (currentEmpEmail && cName.includes(currentEmpEmail.split('@')[0].toLowerCase())) return true;
        return false;
      });

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
    a.download = `POPE_JOHN_PAUL_II_Payroll_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const handleSubmitNewClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || !claimDesc) return;
    addExpenseClaim({
      claimType,
      amount: parseFloat(claimAmount),
      description: claimDesc,
    });
    setClaimAmount('');
    setClaimDesc('');
    setShowClaimModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-emerald-600" />
            Healthcare Payroll & Staff Expense Claims
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View monthly payslips, salary breakdowns, night allowances, and submit clinical expense claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === 'payslips' && isHRorAdmin && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <Download className="h-4 w-4" /> Export Bank File (CSV)
            </button>
          )}

          {activeSubTab === 'expense_claims' && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-500 shadow-md transition"
            >
              <Plus className="h-4 w-4" /> Submit Expense Claim
            </button>
          )}
        </div>
      </div>

      {/* Sub Tab Switcher */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
        <button
          onClick={() => setActiveSubTab('payslips')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'payslips'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Banknote className="h-4 w-4" /> Staff Payslips & Salary Vouchers
        </button>

        <button
          onClick={() => setActiveSubTab('expense_claims')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeSubTab === 'expense_claims'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Receipt className="h-4 w-4" /> Expense Claims & CME Reimbursement
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {expenseClaims.length}
          </span>
        </button>
      </div>

      {/* PAYSLIPS TAB */}
      {activeSubTab === 'payslips' && (
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
                  <th className="px-5 py-3.5">Net Take-Home</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {displayedPayrolls.map((p) => (
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
                        <FileText className="inline h-3 w-3 mr-1" /> View Payslip
                      </button>
                      {isHRorAdmin && p.status === 'Draft' && (
                        <button
                          onClick={() => approvePayroll(p.id)}
                          className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                      )}
                      {isHRorAdmin && p.status === 'Approved' && (
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
      )}

      {/* EXPENSE CLAIMS TAB */}
      {activeSubTab === 'expense_claims' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/60 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-3.5">Staff Member</th>
                    <th className="px-5 py-3.5">Claim Category</th>
                    <th className="px-5 py-3.5">Description</th>
                    <th className="px-5 py-3.5">Submitted Date</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    {isHRorAdmin && <th className="px-5 py-3.5 text-right">HR Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {displayedExpenseClaims.map((claim) => (
                    <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{claim.employeeName}</span>
                        <p className="text-[10px] text-slate-400">{claim.department}</p>
                      </td>

                      <td className="px-5 py-4 font-semibold text-teal-600 dark:text-teal-400">
                        {claim.claimType}
                      </td>

                      <td className="px-5 py-4 max-w-xs truncate text-slate-600 dark:text-slate-300">
                        {claim.description}
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-500">
                        {claim.submittedDate}
                      </td>

                      <td className="px-5 py-4 font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {formatCurrency(claim.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded px-2.5 py-1 text-[10px] font-bold ${
                            claim.status === 'Approved' || claim.status === 'Reimbursed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : claim.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          }`}
                        >
                          {claim.status}
                        </span>
                      </td>

                      {isHRorAdmin && (
                        <td className="px-5 py-4 text-right space-x-1">
                          {claim.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateExpenseClaimStatus(claim.id, 'Approved')}
                                className="rounded bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateExpenseClaimStatus(claim.id, 'Rejected')}
                                className="rounded bg-rose-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-rose-500"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {claim.status === 'Approved' && (
                            <button
                              onClick={() => updateExpenseClaimStatus(claim.id, 'Reimbursed')}
                              className="rounded bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-500"
                            >
                              Mark Reimbursed
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Submit New Expense & CME Claim
              </h3>
              <button
                onClick={() => setShowClaimModal(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewClaim} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Claim Category
                </label>
                <select
                  value={claimType}
                  onChange={(e) => setClaimType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="CME & Clinical Training">CME & Clinical Training</option>
                  <option value="Medical Equipment & Tools">Medical Equipment & Tools</option>
                  <option value="Travel & Mileage">Travel & Mileage</option>
                  <option value="Hazard & Shift Expense">Hazard & Shift Expense</option>
                  <option value="Other">Other Operational Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Claim Amount
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 450"
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Detailed Justification & Expense Items
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the clinical workshop, equipment purchased, or hazard mileage..."
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-emerald-500"
                >
                  Submit Expense Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Generator Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 space-y-4">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Official Hospital Payslip Header */}
            <div className="border-b pb-4 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                    POPE JOHN PAUL II MEDICAL CENTRE
                  </h3>
                  <p className="text-xs text-slate-400">Official Salary Voucher • {selectedPayslip.month} {selectedPayslip.year}</p>
                </div>
                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  CONFIDENTIAL
                </span>
              </div>
            </div>

            {/* Employee Details */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Employee Name</p>
                <p className="font-bold text-slate-900 dark:text-slate-100">{selectedPayslip.employeeName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Department</p>
                <p className="font-bold text-teal-600 dark:text-teal-400">{selectedPayslip.department}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Payment Date</p>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedPayslip.paymentDate}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                <p className="font-bold text-emerald-600">{selectedPayslip.status}</p>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b dark:border-slate-800">
                <span className="text-slate-500">Base Salary</span>
                <span className="font-bold">{formatCurrency(selectedPayslip.baseSalary)}</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800 text-emerald-600">
                <span>Night Duty Allowance</span>
                <span className="font-bold">+{formatCurrency(selectedPayslip.nightDutyAllowance)}</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800 text-emerald-600">
                <span>Hazard Duty Allowance</span>
                <span className="font-bold">+{formatCurrency(selectedPayslip.hazardPay)}</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800 text-emerald-600">
                <span>On-Call Duty Allowance</span>
                <span className="font-bold">+{formatCurrency(selectedPayslip.onCallAllowance)}</span>
              </div>
              <div className="flex justify-between py-1 border-b dark:border-slate-800 text-rose-500">
                <span>Tax & Pension Deductions</span>
                <span className="font-bold">-{formatCurrency(selectedPayslip.taxDeduction + selectedPayslip.pensionDeduction)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 rounded-xl border border-emerald-500/20">
                <span>Net Salary Payable</span>
                <span>{formatCurrency(selectedPayslip.netPay)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handlePrintPayslip}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Printer className="h-4 w-4" /> Print Payslip Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
