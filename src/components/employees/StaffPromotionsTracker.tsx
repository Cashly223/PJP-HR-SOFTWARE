import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  UserCheck,
  ChevronRight,
  Sparkles,
  Building2,
  ArrowRight,
  ShieldCheck,
  Printer,
  X,
  Send,
  Plus,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, PromotionRecord, OfficialDocument } from '../../types/hrms';
import {
  calculateEmployeePromotion,
  PromotionCalculationResult,
  getNextGradeRecommendation,
  GRADE_PROGRESSION_LADDERS,
} from '../../utils/promotionUtils';

interface StaffPromotionsTrackerProps {
  onSelectEmployee?: (employee: Employee) => void;
}

export const StaffPromotionsTracker: React.FC<StaffPromotionsTrackerProps> = ({ onSelectEmployee }) => {
  const { employees, updateEmployee, selectedHospital, formatCurrency } = useHrms();

  // Filters
  const [targetYearFilter, setTargetYearFilter] = useState<'2027' | '2026' | 'overdue' | 'future' | 'all'>('2027');
  const [stageFilter, setStageFilter] = useState<'all' | 'first' | 'subsequent'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [promotingStaff, setPromotingStaff] = useState<PromotionCalculationResult | null>(null);
  const [newGrade, setNewGrade] = useState<string>('');
  const [newSalary, setNewSalary] = useState<number>(0);
  const [promotionEffectiveDate, setPromotionEffectiveDate] = useState<string>('2027-01-01');
  const [promotionApprovedBy, setPromotionApprovedBy] = useState<string>('Hospital Management Board / HR Director');
  const [promotionRemarks, setPromotionRemarks] = useState<string>('Satisfactory annual appraisals, clinical competence, and meeting time-in-grade service requirements.');
  const [isPromoteSuccess, setIsPromoteSuccess] = useState<boolean>(false);

  // Letter Preview Modal
  const [letterModalStaff, setLetterModalStaff] = useState<PromotionCalculationResult | null>(null);

  // Calculate promotion data for all employees
  const allPromotionResults: PromotionCalculationResult[] = useMemo(() => {
    return employees.map((emp) => calculateEmployeePromotion(emp, '2026-08-14'));
  }, [employees]);

  // Unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return ['All', ...Array.from(set).sort()];
  }, [employees]);

  // Filtered promotion results
  const filteredResults = useMemo(() => {
    return allPromotionResults.filter((item) => {
      // Search
      const searchMatch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.empCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nextPromotionDueDate.includes(searchTerm);

      if (!searchMatch) return false;

      // Department
      if (deptFilter !== 'All' && item.department !== deptFilter) return false;

      // Stage
      if (stageFilter === 'first' && item.promotionType !== 'First Promotion') return false;
      if (stageFilter === 'subsequent' && item.promotionType !== 'Subsequent Promotion') return false;

      // Target Year / Eligibility
      if (targetYearFilter === '2027') {
        return item.isDueInSubsequentYear; // Subsequent year 2027
      }
      if (targetYearFilter === '2026') {
        return item.isDueThisYear;
      }
      if (targetYearFilter === 'overdue') {
        return item.isOverdue;
      }
      if (targetYearFilter === 'future') {
        return item.nextPromotionDueYear > 2027;
      }
      return true; // 'all'
    });
  }, [allPromotionResults, targetYearFilter, stageFilter, deptFilter, searchTerm]);

  // Key KPI metrics
  const kpis = useMemo(() => {
    const dueSubsequentYear = allPromotionResults.filter((r) => r.isDueInSubsequentYear);
    const dueCurrentYear = allPromotionResults.filter((r) => r.isDueThisYear);
    const overdue = allPromotionResults.filter((r) => r.isOverdue);
    const firstPromotionsDue2027 = dueSubsequentYear.filter((r) => r.promotionType === 'First Promotion');
    const subsequentPromotionsDue2027 = dueSubsequentYear.filter((r) => r.promotionType === 'Subsequent Promotion');

    return {
      dueSubsequentYearCount: dueSubsequentYear.length,
      dueCurrentYearCount: dueCurrentYear.length,
      overdueCount: overdue.length,
      firstPromotionsDue2027Count: firstPromotionsDue2027.length,
      subsequentPromotionsDue2027Count: subsequentPromotionsDue2027.length,
      totalStaff: allPromotionResults.length,
    };
  }, [allPromotionResults]);

  // Open Promote Modal
  const handleOpenPromoteModal = (item: PromotionCalculationResult) => {
    setPromotingStaff(item);
    setNewGrade(item.suggestedNextGrade);
    setNewSalary(Math.round((item.employee.salary || 10000) * item.salaryStepMultiplier));
    setPromotionEffectiveDate(item.nextPromotionDueDate || '2027-01-01');
    setPromotionApprovedBy('PJPIIMC Hospital Management Board');
    setPromotionRemarks(
      `Promoted to ${item.suggestedNextGrade} following completion of required ${item.requiredYears} years service interval, positive peer evaluations, and clinical performance audit.`
    );
    setIsPromoteSuccess(false);
  };

  // Submit Promotion Action
  const handleConfirmPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promotingStaff || !newGrade) return;

    const promotionRecord: PromotionRecord = {
      id: `prom-${Date.now()}`,
      employeeId: promotingStaff.employee.id,
      previousGrade: promotingStaff.grade,
      newGrade: newGrade,
      previousSalary: promotingStaff.employee.salary,
      newSalary: newSalary,
      promotionDate: new Date().toISOString().split('T')[0],
      effectiveDate: promotionEffectiveDate,
      approvedBy: promotionApprovedBy,
      remarks: promotionRemarks,
      status: 'Approved',
    };

    // Official Promotion Document
    const promotionDoc: OfficialDocument = {
      id: `doc-prom-${Date.now()}`,
      title: `Official Promotion Letter - ${newGrade}`,
      type: 'Other Official Document',
      fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
      fileName: `Promotion_Letter_${promotingStaff.empCode}_${newGrade.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      fileSize: 1024 * 320,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'HR Director',
      notes: `Upgraded from ${promotingStaff.grade} to ${newGrade}. Effective ${promotionEffectiveDate}.`,
    };

    const existingHistory = promotingStaff.employee.promotionHistory || [];
    const existingDocs = promotingStaff.employee.officialDocuments || [];

    const updatedEmployee: Employee = {
      ...promotingStaff.employee,
      grade: newGrade,
      jobTitle: newGrade,
      salary: newSalary,
      lastPromotionDate: promotionEffectiveDate,
      lastPromotionGrade: promotingStaff.grade,
      promotionHistory: [promotionRecord, ...existingHistory],
      officialDocuments: [promotionDoc, ...existingDocs],
    };

    updateEmployee(promotingStaff.employee.id, updatedEmployee);
    setIsPromoteSuccess(true);

    setTimeout(() => {
      setPromotingStaff(null);
      setIsPromoteSuccess(false);
    }, 1800);
  };

  // Export CSV of Promotions Due
  const handleExportCsv = () => {
    const headers = [
      'Staff Code',
      'Staff Name',
      'Department',
      'Current Grade',
      'First Appointment Date',
      'Last Promotion Date',
      'Next App Date (Due Date)',
      'Promotion Rule Applied',
      'Years of Service',
      'Eligibility Status',
      'Suggested Next Grade',
    ];

    const rows = filteredResults.map((r) => [
      `"${r.empCode}"`,
      `"${r.name}"`,
      `"${r.department}"`,
      `"${r.grade}"`,
      `"${r.firstAppointmentDate}"`,
      `"${r.lastPromotionDate || 'Not Yet Promoted'}"`,
      `"${r.nextPromotionDueDate}"`,
      `"${r.promotionType} (${r.requiredYears} Yrs)"`,
      `"${r.yearsOfService} yrs"`,
      `"${r.eligibilityStatus}"`,
      `"${r.suggestedNextGrade}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PJPIIMC_Staff_Promotions_Due_${targetYearFilter.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="staff-promotions-tracker">
      {/* Top Banner & Context */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/90 to-purple-950 p-6 text-white border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="h-3 w-3" /> Career Progression & Promotion Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3" /> Policy: 1st Promo 3 Yrs • Subsequent 5 Yrs
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Staff Promotion & Eligibility Forecasting
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Automated career progression ledger calculating promotion eligibility for all hospital staff. Per policy,{' '}
              <strong className="text-indigo-300">first promotions</strong> occur exactly 3 years post first appointment, and{' '}
              <strong className="text-emerald-300">subsequent promotions</strong> occur every 5 years from current promotion date.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 transition shadow active:scale-95"
            >
              <Download className="h-4 w-4 text-indigo-400" /> Export Promotion Gazette (CSV)
            </button>
          </div>
        </div>

        {/* KPI STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-indigo-500/20">
          <div
            onClick={() => setTargetYearFilter('2027')}
            className={`rounded-xl p-3.5 border cursor-pointer transition ${
              targetYearFilter === '2027'
                ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/40 shadow-lg'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-indigo-400" /> Due in 2027 (Subsequent Year)
            </span>
            <div className="text-2xl font-black text-white mt-1">{kpis.dueSubsequentYearCount} Staff</div>
            <span className="text-[10px] text-slate-400">
              {kpis.firstPromotionsDue2027Count} First (3y) • {kpis.subsequentPromotionsDue2027Count} Subsq (5y)
            </span>
          </div>

          <div
            onClick={() => setTargetYearFilter('2026')}
            className={`rounded-xl p-3.5 border cursor-pointer transition ${
              targetYearFilter === '2026'
                ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-500/40 shadow-lg'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" /> Due This Year (2026)
            </span>
            <div className="text-2xl font-black text-amber-300 mt-1">{kpis.dueCurrentYearCount} Staff</div>
            <span className="text-[10px] text-amber-200/70">Current session eligibility</span>
          </div>

          <div
            onClick={() => setTargetYearFilter('overdue')}
            className={`rounded-xl p-3.5 border cursor-pointer transition ${
              targetYearFilter === 'overdue'
                ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-500/40 shadow-lg'
                : 'bg-slate-950/60 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-rose-400" /> Overdue Promotions
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1">{kpis.overdueCount} Staff</div>
            <span className="text-[10px] text-rose-200/70">Exceeded standard interval</span>
          </div>

          <div
            onClick={() => {
              setTargetYearFilter('all');
              setStageFilter('first');
            }}
            className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 hover:bg-slate-950/90 cursor-pointer transition"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-1">
              <Award className="h-3 w-3 text-teal-400" /> 1st Promotion (3 Yrs)
            </span>
            <div className="text-2xl font-black text-teal-300 mt-1">
              {allPromotionResults.filter((r) => r.promotionType === 'First Promotion').length} Staff
            </div>
            <span className="text-[10px] text-slate-400">3 yrs from 1st appointment</span>
          </div>

          <div
            onClick={() => {
              setTargetYearFilter('all');
              setStageFilter('subsequent');
            }}
            className="rounded-xl bg-slate-950/60 p-3.5 border border-slate-800 hover:bg-slate-950/90 cursor-pointer transition"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-purple-400" /> Subsq Promo (5 Yrs)
            </span>
            <div className="text-2xl font-black text-purple-300 mt-1">
              {allPromotionResults.filter((r) => r.promotionType === 'Subsequent Promotion').length} Staff
            </div>
            <span className="text-[10px] text-slate-400">5 yrs from last promotion</span>
          </div>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 shadow-sm">
        {/* Main Target Year Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTargetYearFilter('2027')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              targetYearFilter === '2027'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-3.5 w-3.5 text-indigo-300" /> Due in Subsequent Year (2027) ({kpis.dueSubsequentYearCount})
          </button>
          <button
            type="button"
            onClick={() => setTargetYearFilter('2026')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              targetYearFilter === '2026'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-amber-300" /> Due This Year (2026) ({kpis.dueCurrentYearCount})
          </button>
          <button
            type="button"
            onClick={() => setTargetYearFilter('overdue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              targetYearFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-300" /> Overdue ({kpis.overdueCount})
          </button>
          <button
            type="button"
            onClick={() => setTargetYearFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              targetYearFilter === 'all'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Staff Progression ({kpis.totalStaff})
          </button>
        </div>

        {/* Department, Stage & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as any)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
          >
            <option value="all">All Promotion Stages</option>
            <option value="first">First Promotion (3 Yrs)</option>
            <option value="subsequent">Subsequent (5 Yrs)</option>
          </select>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, grade, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* PROMOTION ELIGIBILITY TABLE */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                {targetYearFilter === '2027'
                  ? 'STAFF DUE FOR PROMOTION IN SUBSEQUENT YEAR (2027)'
                  : targetYearFilter === '2026'
                  ? 'STAFF DUE FOR PROMOTION IN CURRENT YEAR (2026)'
                  : targetYearFilter === 'overdue'
                  ? 'OVERDUE PROMOTIONS AUDIT'
                  : 'COMPREHENSIVE STAFF CAREER PROGRESSION & DUE DATES'}
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-extrabold">
                  {filteredResults.length} Staff Members
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Sorted by Next Due Date • First promotion rule: 3 years post first appointment • Subsequent: 5 years from current promotion.
              </p>
            </div>
          </div>
        </div>

        {filteredResults.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-indigo-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">No Staff Found for Selected Criteria</h4>
            <p className="text-xs text-slate-400">Try adjusting the target year filter, stage selector, or search keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Staff Name & ID</th>
                  <th className="px-4 py-3.5">Current Grade / Rank</th>
                  <th className="px-4 py-3.5">First Appointment Date</th>
                  <th className="px-4 py-3.5">Last Promotion Date</th>
                  <th className="px-4 py-3.5 text-indigo-400">Next App Date (Subsequent Year)</th>
                  <th className="px-4 py-3.5">Promotion Stage</th>
                  <th className="px-4 py-3.5">Eligibility Status</th>
                  <th className="px-4 py-3.5 text-right">HR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-medium">
                {filteredResults.map((item) => (
                  <tr key={item.empCode} className="hover:bg-slate-800/50 transition">
                    {/* 1. Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            item.employee.photo ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block text-sm">{item.name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                              {item.empCode}
                            </span>
                            <span className="text-[10px] text-slate-400">{item.department}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Grade */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-white block">{item.grade}</span>
                      <span className="text-[10px] text-slate-400 block">{item.unit || item.employee.jobTitle}</span>
                    </td>

                    {/* 3. First Appointment Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-200 font-mono font-bold text-[11px] border border-slate-800">
                        {item.firstAppointmentDate}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        {item.yearsOfService} yrs in service
                      </span>
                    </td>

                    {/* 4. Last Promotion Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.lastPromotionDate ? (
                        <div>
                          <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 font-mono font-bold text-[11px] border border-slate-800">
                            {item.lastPromotionDate}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1">
                            {item.yearsInCurrentGrade} yrs in rank
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px] font-semibold italic border border-slate-700">
                          Not Yet Promoted (First Due)
                        </span>
                      )}
                    </td>

                    {/* 5. Next App Date (Subsequent Year / Due Date) */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded bg-indigo-950 text-indigo-200 font-mono font-extrabold text-xs border border-indigo-500/40 shadow-sm">
                          {item.nextPromotionDueDate}
                        </span>
                      </div>
                      <span className="block text-[10px] font-bold text-indigo-400 mt-1">
                        Target Year: {item.nextPromotionDueYear}
                      </span>
                    </td>

                    {/* 6. Promotion Stage */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.promotionType === 'First Promotion' ? (
                        <span className="px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 font-extrabold text-[10px] border border-teal-500/40 flex items-center gap-1 w-fit">
                          <Award className="h-3 w-3" /> First (3 Yrs)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-[10px] border border-purple-500/40 flex items-center gap-1 w-fit">
                          <TrendingUp className="h-3 w-3" /> Subsequent (5 Yrs)
                        </span>
                      )}
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Next: <strong className="text-slate-200">{item.suggestedNextGrade}</strong>
                      </span>
                    </td>

                    {/* 7. Eligibility Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {item.isDueInSubsequentYear ? (
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-[10px] border border-indigo-500/40 flex items-center gap-1 w-fit">
                          <Calendar className="h-3 w-3 text-indigo-400" /> Due in 2027 (Subsequent Year)
                        </span>
                      ) : item.isDueThisYear ? (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-[10px] border border-amber-500/40 flex items-center gap-1 w-fit">
                          <Clock className="h-3 w-3 text-amber-400" /> Due This Year (2026)
                        </span>
                      ) : item.isOverdue ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 font-black text-[10px] border border-rose-500/40 flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3 text-rose-400" /> Overdue
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-bold text-[10px] border border-slate-700">
                          Due in {item.nextPromotionDueYear}
                        </span>
                      )}
                    </td>

                    {/* 8. HR Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenPromoteModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition shadow flex items-center gap-1"
                          title="Process Promotion and Upgrade Grade"
                        >
                          <Award className="h-3 w-3" /> Promote Staff
                        </button>
                        <button
                          type="button"
                          onClick={() => setLetterModalStaff(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] transition border border-slate-700 flex items-center gap-1"
                          title="View and Issue Promotion Letter"
                        >
                          <FileText className="h-3 w-3 text-indigo-400" /> Letter
                        </button>
                        {onSelectEmployee && (
                          <button
                            type="button"
                            onClick={() => onSelectEmployee(item.employee)}
                            className="px-2 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-[10px] transition border border-slate-800"
                            title="View Staff Profile & File Dossier"
                          >
                            Dossier →
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

      {/* ========================================================= */}
      {/* MODAL 1: PROCESS PROMOTION & GRADE UPGRADE */}
      {/* ========================================================= */}
      {promotingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setPromotingStaff(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 block">
                  Official Grade Promotion & Appraisal Board
                </span>
                <h3 className="text-lg font-black text-white">Promote {promotingStaff.name}</h3>
                <p className="text-xs text-slate-400">
                  Staff ID: <span className="font-mono text-indigo-300 font-bold">{promotingStaff.empCode}</span> • Department:{' '}
                  <span className="text-slate-200 font-semibold">{promotingStaff.department}</span>
                </p>
              </div>
            </div>

            {isPromoteSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-black text-white">Promotion Approved & Dispatched!</h4>
                <p className="text-xs text-emerald-200">
                  {promotingStaff.name} upgraded to <strong>{newGrade}</strong>. Promotion letter has been generated and saved to staff dossier.
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmPromotion} className="space-y-4">
                {/* Current vs New Grade Comparison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Current Grade / Rank</span>
                    <div className="font-bold text-white text-sm mt-0.5">{promotingStaff.grade}</div>
                    <span className="text-[10px] text-slate-400">First appointed: {promotingStaff.firstAppointmentDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-400">Target Promotion Grade</span>
                    <input
                      type="text"
                      value={newGrade}
                      onChange={(e) => setNewGrade(e.target.value)}
                      required
                      placeholder="e.g. Senior Nursing Officer"
                      className="mt-1 w-full rounded-lg bg-slate-900 border border-indigo-500/50 px-3 py-1.5 text-xs text-white font-bold focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Salary & Effective Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                      New Monthly Basic Salary (GHS)
                    </label>
                    <input
                      type="number"
                      value={newSalary}
                      onChange={(e) => setNewSalary(parseFloat(e.target.value) || 0)}
                      required
                      min="0"
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Prior salary: {formatCurrency(promotingStaff.employee.salary || 0)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                      Promotion Effective Date
                    </label>
                    <input
                      type="date"
                      value={promotionEffectiveDate}
                      onChange={(e) => setPromotionEffectiveDate(e.target.value)}
                      required
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Approving Authority */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                    Approving Body / Board
                  </label>
                  <input
                    type="text"
                    value={promotionApprovedBy}
                    onChange={(e) => setPromotionApprovedBy(e.target.value)}
                    required
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Commendation Remarks */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 mb-1">
                    Appraisal Evaluation & Commendation Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={promotionRemarks}
                    onChange={(e) => setPromotionRemarks(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setPromotingStaff(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-lg flex items-center gap-1.5"
                  >
                    <Award className="h-4 w-4" /> Ratify & Issue Promotion
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: OFFICIAL PROMOTION LETTER PREVIEW */}
      {/* ========================================================= */}
      {letterModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 p-6 text-white shadow-2xl space-y-4">
            {/* Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-black text-white">Official Promotion Notice Letter</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setLetterModalStaff(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Letter Paper Preview */}
            <div className="rounded-xl bg-white p-8 text-slate-900 shadow-inner font-serif text-xs space-y-4 border border-slate-300">
              {/* Hospital Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5 font-sans">
                <h1 className="text-base font-black tracking-tight text-slate-950 uppercase">
                  {selectedHospital.name}
                </h1>
                <p className="text-[10px] text-slate-600 font-semibold tracking-wide">
                  DIRECTORATE OF HUMAN RESOURCES & TALENT GOVERNANCE
                </p>
                <p className="text-[9px] text-slate-500">
                  {selectedHospital.address} • P.O. Box GP 1928, Accra, Ghana • Tel: +233 24 100 2000
                </p>
              </div>

              {/* Reference & Date */}
              <div className="flex justify-between text-[11px] font-sans pt-1">
                <div>
                  <strong>Ref:</strong> PJPIIMC/HR/PROM/{letterModalStaff.nextPromotionDueYear}/{letterModalStaff.empCode}
                </div>
                <div>
                  <strong>Date:</strong> {letterModalStaff.nextPromotionDueDate}
                </div>
              </div>

              {/* Recipient */}
              <div className="space-y-0.5 font-sans text-[11px]">
                <p className="font-bold text-slate-950">{letterModalStaff.name}</p>
                <p className="text-slate-700">Staff ID: {letterModalStaff.empCode}</p>
                <p className="text-slate-700">Department: {letterModalStaff.department}</p>
                <p className="text-slate-700">{selectedHospital.name}</p>
              </div>

              <p className="font-sans text-[11px]">Dear {letterModalStaff.name},</p>

              {/* Subject */}
              <div className="text-center py-1 font-sans">
                <span className="font-black text-xs uppercase border-b border-slate-900 tracking-wider">
                  LETTER OF PROMOTION TO {letterModalStaff.suggestedNextGrade.toUpperCase()}
                </span>
              </div>

              {/* Body */}
              <div className="space-y-3 leading-relaxed font-sans text-[11px] text-slate-800 text-justify">
                <p>
                  On behalf of the Hospital Advisory Council and the Management Board of {selectedHospital.name}, we are pleased to inform you that you have been promoted from your current rank of <strong>{letterModalStaff.grade}</strong> to the grade of <strong>{letterModalStaff.suggestedNextGrade}</strong>.
                </p>
                <p>
                  This promotion is in recognition of your dedicated service since your first appointment on <strong>{letterModalStaff.firstAppointmentDate}</strong>, satisfying the statutory {letterModalStaff.requiredYears}-year milestone period, and maintaining an exemplary clinical conduct record.
                </p>
                <p>
                  Your effective date of promotion is <strong>{letterModalStaff.nextPromotionDueDate}</strong>. With this advancement, you will be placed on the corresponding salary scale with all attendant benefits.
                </p>
                <p>
                  We congratulate you on this milestone and trust you will continue to deliver clinical excellence and leadership in service to our patients.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end font-sans text-[10px]">
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-900 pb-1 italic font-serif">Rev. Fr. Mike</div>
                  <p className="font-bold text-slate-950">Chief Executive Administrator</p>
                  <p className="text-slate-600">{selectedHospital.name}</p>
                </div>
                <div className="space-y-1 text-right">
                  <div className="w-32 border-b border-slate-900 pb-1 italic font-serif ml-auto">Miss Vero</div>
                  <p className="font-bold text-slate-950">Director of Human Resources</p>
                  <p className="text-slate-600">Talent & Governance Directorate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
