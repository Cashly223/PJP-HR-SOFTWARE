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
  BarChart3,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { Employee, PromotionRecord, OfficialDocument } from '../../types/hrms';
import {
  calculateEmployeePromotion,
  PromotionCalculationResult,
  getNextGradeRecommendation,
  GRADE_PROGRESSION_LADDERS,
} from '../../utils/promotionUtils';
import { printElementById } from '../../utils/printDocument';

interface PromotionTrackingDashboardProps {
  onSelectEmployee?: (employee: Employee) => void;
}

export const PromotionTrackingDashboard: React.FC<PromotionTrackingDashboardProps> = ({ onSelectEmployee }) => {
  const { employees, updateEmployee, selectedHospital, formatCurrency } = useHrms();

  // Filters & State
  const [targetYearFilter, setTargetYearFilter] = useState<string>('2027');
  const [stageFilter, setStageFilter] = useState<'all' | 'first' | 'subsequent'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [eligibilityFilter, setEligibilityFilter] = useState<'all' | 'due' | 'overdue' | 'future'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCadre, setSelectedCadre] = useState<string>('All');

  // Promotion Execution Modal State
  const [promotingStaff, setPromotingStaff] = useState<PromotionCalculationResult | null>(null);
  const [newGrade, setNewGrade] = useState<string>('');
  const [newSalary, setNewSalary] = useState<number>(0);
  const [promotionEffectiveDate, setPromotionEffectiveDate] = useState<string>('2027-01-01');
  const [promotionApprovedBy, setPromotionApprovedBy] = useState<string>('Hospital Management Board / HR Director');
  const [promotionRemarks, setPromotionRemarks] = useState<string>('Satisfactory annual appraisals, clinical competence, and meeting time-in-grade service requirements.');
  const [isPromoteSuccess, setIsPromoteSuccess] = useState<boolean>(false);

  // Letter Preview Modal State
  const [letterModalStaff, setLetterModalStaff] = useState<PromotionCalculationResult | null>(null);

  // Reference Anchor Date: 2026-08-14
  const CURRENT_ANCHOR_DATE = '2026-08-14';

  // Calculate promotion eligibility for all hospital staff
  const allPromotionResults: PromotionCalculationResult[] = useMemo(() => {
    return (employees || []).filter(Boolean).map((emp) => calculateEmployeePromotion(emp, CURRENT_ANCHOR_DATE));
  }, [employees]);

  // Dynamic available years list based on calculated next appointment dates
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    (allPromotionResults || []).forEach((r) => {
      if (r && r.nextPromotionDueYear) {
        yearsSet.add(r.nextPromotionDueYear);
      }
    });
    // Ensure 2026, 2027, 2028, 2029, 2030 exist
    [2025, 2026, 2027, 2028, 2029, 2030, 2031].forEach((y) => yearsSet.add(y));
    return Array.from(yearsSet).sort((a, b) => a - b);
  }, [allPromotionResults]);

  // Unique departments
  const departments = useMemo(() => {
    const set = new Set<string>();
    (employees || []).forEach((e) => {
      if (e && e.department) set.add(e.department);
    });
    return ['All', ...Array.from(set).sort()];
  }, [employees]);

  // Filtered promotion results
  const filteredResults = useMemo(() => {
    return (allPromotionResults || []).filter((item) => {
      if (!item) return false;
      // 1. Search filter
      const searchMatch =
        searchTerm === '' ||
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.empCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.grade || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nextPromotionDueDate || '').includes(searchTerm) ||
        (item.firstAppointmentDate || '').includes(searchTerm);

      if (!searchMatch) return false;

      // 2. Department filter
      if (deptFilter !== 'All' && item.department !== deptFilter) return false;

      // 3. Cadre filter
      if (selectedCadre !== 'All') {
        const deptLow = (item.department || '').toLowerCase();
        const gradeLow = (item.grade || '').toLowerCase();
        if (selectedCadre === 'Nursing' && !deptLow.includes('nurs') && !deptLow.includes('icu') && !gradeLow.includes('nurse')) return false;
        if (selectedCadre === 'Medical' && !deptLow.includes('med') && !deptLow.includes('surg') && !gradeLow.includes('officer') && !gradeLow.includes('physician') && !gradeLow.includes('doctor')) return false;
        if (selectedCadre === 'Pharmacy' && !deptLow.includes('pharm')) return false;
        if (selectedCadre === 'Laboratory' && !deptLow.includes('lab') && !deptLow.includes('path')) return false;
        if (selectedCadre === 'Administration' && !deptLow.includes('admin') && !deptLow.includes('hr') && !deptLow.includes('financ')) return false;
      }

      // 4. Stage filter (First Promotion 3-Yr vs Subsequent 5-Yr)
      if (stageFilter === 'first' && item.promotionType !== 'First Promotion') return false;
      if (stageFilter === 'subsequent' && item.promotionType !== 'Subsequent Promotion') return false;

      // 5. Eligibility Status filter
      if (eligibilityFilter === 'overdue' && !item.isOverdue) return false;
      if (eligibilityFilter === 'due' && !item.isDueThisYear && !item.isDueInSubsequentYear) return false;
      if (eligibilityFilter === 'future' && (item.isOverdue || item.isDueThisYear || item.isDueInSubsequentYear)) return false;

      // 6. Target Year Filter
      if (targetYearFilter === '2027') {
        return item.isDueInSubsequentYear;
      }
      if (targetYearFilter === '2026') {
        return item.isDueThisYear;
      }
      if (targetYearFilter === 'overdue') {
        return item.isOverdue;
      }
      if (targetYearFilter === 'all') {
        return true;
      }
      // Specific year number
      const targetYearNum = parseInt(targetYearFilter, 10);
      if (!isNaN(targetYearNum)) {
        return item.nextPromotionDueYear === targetYearNum;
      }

      return true;
    });
  }, [allPromotionResults, targetYearFilter, stageFilter, deptFilter, selectedCadre, eligibilityFilter, searchTerm]);

  // Executive KPI summary metrics
  const kpis = useMemo(() => {
    const safeResults = allPromotionResults || [];
    const dueSubsequentYear = safeResults.filter((r) => r?.isDueInSubsequentYear);
    const dueCurrentYear = safeResults.filter((r) => r?.isDueThisYear);
    const overdue = safeResults.filter((r) => r?.isOverdue);
    const firstPromotionsDue2027 = dueSubsequentYear.filter((r) => r?.promotionType === 'First Promotion');
    const subsequentPromotionsDue2027 = dueSubsequentYear.filter((r) => r?.promotionType === 'Subsequent Promotion');

    // Financial impact estimate for selected filtered staff
    const estimatedMonthlySalaryDelta = (filteredResults || []).reduce((acc, curr) => {
      if (!curr) return acc;
      const currentSal = curr.employee?.salary || 8500;
      const newSal = currentSal * (curr.salaryStepMultiplier || 1);
      return acc + (newSal - currentSal);
    }, 0);

    return {
      totalStaff: safeResults.length,
      dueSubsequentYearCount: dueSubsequentYear.length,
      dueCurrentYearCount: dueCurrentYear.length,
      overdueCount: overdue.length,
      firstPromotionsDue2027Count: firstPromotionsDue2027.length,
      subsequentPromotionsDue2027Count: subsequentPromotionsDue2027.length,
      totalFirstPromotions: safeResults.filter((r) => r?.promotionType === 'First Promotion').length,
      totalSubsequentPromotions: safeResults.filter((r) => r?.promotionType === 'Subsequent Promotion').length,
      estimatedMonthlySalaryDelta,
    };
  }, [allPromotionResults, filteredResults]);

  // Handle Open Promote Modal
  const handleOpenPromoteModal = (item: PromotionCalculationResult) => {
    setPromotingStaff(item);
    setNewGrade(item.suggestedNextGrade);
    const baseSal = item.employee.salary || 9500;
    setNewSalary(Math.round(baseSal * item.salaryStepMultiplier));
    setPromotionEffectiveDate(item.nextPromotionDueDate || '2027-01-01');
    setPromotionApprovedBy('PJPIIMC Hospital Management Board');
    setPromotionRemarks(
      `Promoted to ${item.suggestedNextGrade} following completion of required ${item.requiredYears}-year service interval under standard hospital scheme of service, favorable appraisal scores, and clinical competence certification.`
    );
    setIsPromoteSuccess(false);
  };

  // Submit Promotion Execution
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

  // Export CSV of Promotions Due Register
  const handleExportCsv = () => {
    const headers = [
      'Staff ID',
      'Staff Name',
      'Department',
      'Cadre / Unit',
      'Current Grade',
      'First Appointment Date',
      'Last Promotion Date',
      'Next Appointment Year (Due Date)',
      'Career Progression Rule',
      'Years of Service',
      'Years in Current Grade',
      'Eligibility Status',
      'Recommended Next Grade',
      'Current Monthly Salary (GHS)',
      'Projected New Salary (GHS)',
    ];

    const rows = filteredResults.map((r) => [
      `"${r.empCode}"`,
      `"${r.name}"`,
      `"${r.department}"`,
      `"${r.unit || 'General'}"`,
      `"${r.grade}"`,
      `"${r.firstAppointmentDate}"`,
      `"${r.lastPromotionDate || 'Not Yet Promoted'}"`,
      `"${r.nextPromotionDueDate} (Year ${r.nextPromotionDueYear})"`,
      `"${r.promotionType} (${r.requiredYears}-Year Rule)"`,
      `"${r.yearsOfService} yrs"`,
      `"${r.yearsInCurrentGrade} yrs"`,
      `"${r.eligibilityStatus}"`,
      `"${r.suggestedNextGrade}"`,
      `"${r.employee.salary || 8500}"`,
      `"${Math.round((r.employee.salary || 8500) * r.salaryStepMultiplier)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PJPIIMC_Promotion_Tracking_Gazette_Year_${targetYearFilter}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="promotion-tracking-dashboard">
      {/* Top Banner & Progression Rules Specification */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/95 to-slate-900 p-6 text-white border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm">
                <Sparkles className="h-3 w-3 text-indigo-400" /> Career Progression & Promotion Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> 3-Year & 5-Year Progression Policy
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-slate-300 bg-slate-800/80 border border-slate-700">
                <Clock className="h-3 w-3 text-amber-400" /> Audit Anchor: Aug 2026
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <TrendingUp className="h-6 w-6 text-indigo-400" />
              Promotion Tracking Dashboard
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              Automated promotion tracking engine implementing the standardized public health career ladder:
              <span className="text-indigo-300 font-bold ml-1">1st Promotion</span> is calculated at exactly <strong>3 years</strong> after first appointment date, and
              <span className="text-emerald-300 font-bold ml-1">Subsequent Promotions</span> occur every <strong>5 years</strong> from the staff member’s latest promotion date.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 transition shadow-md active:scale-95 hover:border-indigo-500/50"
            >
              <Download className="h-4 w-4 text-indigo-400" /> Export Promotion Gazette (CSV)
            </button>
          </div>
        </div>

        {/* EXECUTIVE KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-6 pt-5 border-t border-indigo-500/20">
          {/* KPI 1: Subsequent Year 2027 */}
          <div
            onClick={() => setTargetYearFilter('2027')}
            className={`rounded-2xl p-4 border cursor-pointer transition transform hover:-translate-y-0.5 ${
              targetYearFilter === '2027'
                ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Due in 2027 (Subsequent Year)
            </span>
            <div className="text-2xl font-black text-white mt-1.5">{kpis.dueSubsequentYearCount} Staff</div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-indigo-300 font-bold">{kpis.firstPromotionsDue2027Count}</span> 1st (3y) •{' '}
              <span className="text-emerald-300 font-bold">{kpis.subsequentPromotionsDue2027Count}</span> Subsq (5y)
            </div>
          </div>

          {/* KPI 2: Current Year 2026 */}
          <div
            onClick={() => setTargetYearFilter('2026')}
            className={`rounded-2xl p-4 border cursor-pointer transition transform hover:-translate-y-0.5 ${
              targetYearFilter === '2026'
                ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-500/50 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" /> Due This Year (2026)
            </span>
            <div className="text-2xl font-black text-amber-300 mt-1.5">{kpis.dueCurrentYearCount} Staff</div>
            <span className="text-[10px] text-amber-200/70 block mt-1">Current promotion window</span>
          </div>

          {/* KPI 3: Overdue */}
          <div
            onClick={() => setTargetYearFilter('overdue')}
            className={`rounded-2xl p-4 border cursor-pointer transition transform hover:-translate-y-0.5 ${
              targetYearFilter === 'overdue'
                ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-500/50 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" /> Overdue Promotions
            </span>
            <div className="text-2xl font-black text-rose-400 mt-1.5">{kpis.overdueCount} Staff</div>
            <span className="text-[10px] text-rose-200/70 block mt-1">Exceeded standard service interval</span>
          </div>

          {/* KPI 4: 1st Promotions (3-Year Rule) */}
          <div
            onClick={() => {
              setTargetYearFilter('all');
              setStageFilter('first');
            }}
            className={`rounded-2xl p-4 border cursor-pointer transition transform hover:-translate-y-0.5 ${
              stageFilter === 'first' && targetYearFilter === 'all'
                ? 'bg-teal-600/30 border-teal-400 ring-2 ring-teal-500/50 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-teal-400" /> 1st Promo Track (3-Yr Rule)
            </span>
            <div className="text-2xl font-black text-teal-300 mt-1.5">{kpis.totalFirstPromotions} Staff</div>
            <span className="text-[10px] text-slate-400 block mt-1">Calculated from 1st appointment date</span>
          </div>

          {/* KPI 5: Subsequent Promotions (5-Year Rule) */}
          <div
            onClick={() => {
              setTargetYearFilter('all');
              setStageFilter('subsequent');
            }}
            className={`rounded-2xl p-4 border cursor-pointer transition transform hover:-translate-y-0.5 ${
              stageFilter === 'subsequent' && targetYearFilter === 'all'
                ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-500/50 shadow-lg'
                : 'bg-slate-950/70 border-slate-800 hover:bg-slate-950/90'
            }`}
          >
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-purple-400" /> Subsq Promo (5-Yr Rule)
            </span>
            <div className="text-2xl font-black text-purple-300 mt-1.5">{kpis.totalSubsequentPromotions} Staff</div>
            <span className="text-[10px] text-slate-400 block mt-1">Calculated from last promotion date</span>
          </div>
        </div>
      </div>

      {/* FILTER & AUDIT CONTROL CONSOLE */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Main Appointment Year Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Next Due Year:
            </span>

            <button
              type="button"
              onClick={() => setTargetYearFilter('2027')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                targetYearFilter === '2027'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Subsequent Year (2027)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold">
                {kpis.dueSubsequentYearCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetYearFilter('2026')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                targetYearFilter === '2026'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>Current Year (2026)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px] font-bold">
                {kpis.dueCurrentYearCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetYearFilter('2028')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                targetYearFilter === '2028'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>2028</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-950 text-teal-300 text-[10px] font-bold">
                {(allPromotionResults || []).filter((r) => r?.nextPromotionDueYear === 2028).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetYearFilter('2029')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                targetYearFilter === '2029'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>2029</span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-950 text-teal-300 text-[10px] font-bold">
                {(allPromotionResults || []).filter((r) => r?.nextPromotionDueYear === 2029).length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetYearFilter('overdue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                targetYearFilter === 'overdue'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="h-3 w-3 text-rose-300" />
              <span>Overdue</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold">
                {kpis.overdueCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setTargetYearFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                targetYearFilter === 'all'
                  ? 'bg-slate-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              All Years ({kpis.totalStaff})
            </button>
          </div>

          {/* Quick Custom Year Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">Select Any Year:</span>
            <select
              value={targetYearFilter}
              onChange={(e) => setTargetYearFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
            >
              <option value="2027">2027 (Subsequent Year)</option>
              <option value="2026">2026 (Current Year)</option>
              <option value="overdue">Overdue for Promotion</option>
              <option value="all">All Available Years</option>
              {availableYears
                .filter((y) => y !== 2026 && y !== 2027)
                .map((yr) => (
                  <option key={yr} value={yr.toString()}>
                    Year {yr}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Bar: Cadre, Stage, Department & Real-time Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80">
          {/* Promotion Stage */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Progression Rule Stage
            </label>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Progression Stages (3-Yr & 5-Yr)</option>
              <option value="first">First Promotion (3 Years post 1st Appt)</option>
              <option value="subsequent">Subsequent Promotion (5 Years post Promo)</option>
            </select>
          </div>

          {/* Professional Cadre */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Professional Cadre
            </label>
            <select
              value={selectedCadre}
              onChange={(e) => setSelectedCadre(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Cadres & Specialties</option>
              <option value="Nursing">Nursing & Midwifery Cadre</option>
              <option value="Medical">Medical & Dental Officers</option>
              <option value="Pharmacy">Pharmacy & Clinical Pharmacology</option>
              <option value="Laboratory">Laboratory & Biomedical Sciences</option>
              <option value="Administration">Health Administration & HR</option>
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Hospital Department
            </label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white font-bold focus:border-indigo-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Hospital Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
              Search Staff Roster
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, code (DOC-1001), grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* PROMOTION ROSTER & DUE REGISTER TABLE */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        {/* Table Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                {targetYearFilter === '2027'
                  ? 'SUBSEQUENT YEAR (2027) PROMOTION DUE REGISTER'
                  : targetYearFilter === '2026'
                  ? 'CURRENT YEAR (2026) PROMOTION ROSTER'
                  : targetYearFilter === 'overdue'
                  ? 'OVERDUE PROMOTIONS AUDIT LEDGER'
                  : `STAFF PROMOTION TRACKING REGISTER (${targetYearFilter.toUpperCase()})`}
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-extrabold">
                  {filteredResults.length} Staff Members Eligible
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                First promotion: 3-Year Interval from First Appointment • Subsequent promotion: 5-Year Interval from Last Promotion
              </p>
            </div>
          </div>

          {filteredResults.length > 0 && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-semibold">Projected Monthly Wage Increment</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{formatCurrency(kpis.estimatedMonthlySalaryDelta)}/mo
              </span>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-white text-sm">No Staff Due for Selected Promotion Criteria</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              There are no employee records matching year {targetYearFilter} under the current department and cadre filters.
            </p>
            <button
              onClick={() => {
                setTargetYearFilter('all');
                setStageFilter('all');
                setDeptFilter('All');
                setSelectedCadre('All');
                setSearchTerm('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Staff Member & ID</th>
                  <th className="px-4 py-3.5">Current Grade / Rank</th>
                  <th className="px-4 py-3.5">First Appointment Date</th>
                  <th className="px-4 py-3.5">Current Promotion Date</th>
                  <th className="px-4 py-3.5 text-indigo-400">Next App Date (Subsequent Year)</th>
                  <th className="px-4 py-3.5">Progression Rule</th>
                  <th className="px-4 py-3.5">Time-in-Grade Progress</th>
                  <th className="px-4 py-3.5">Eligibility Status</th>
                  <th className="px-4 py-3.5 text-right">HR Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-medium">
                {filteredResults.map((item) => {
                  // Time-in-grade progress percentage
                  const required = item.requiredYears;
                  const currentYears = item.promotionType === 'First Promotion' ? item.yearsOfService : item.yearsInCurrentGrade;
                  const progressPct = Math.min(100, Math.round((currentYears / required) * 100));

                  return (
                    <tr key={item.empCode} className="hover:bg-slate-800/50 transition group">
                      {/* 1. Name & Avatar */}
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
                            <span className="font-bold text-white block text-sm group-hover:text-indigo-300 transition">
                              {item.name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/40">
                                {item.empCode}
                              </span>
                              <span className="text-[10px] text-slate-400">{item.department}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Grade & Next Rank */}
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white block">{item.grade}</span>
                        <div className="flex items-center gap-1 text-[10px] text-indigo-400 mt-0.5">
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span>Rec: <strong>{item.suggestedNextGrade}</strong></span>
                        </div>
                      </td>

                      {/* 3. First Appointment Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-200 font-mono font-bold text-[11px] border border-slate-800">
                          {item.firstAppointmentDate}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-1 font-semibold">
                          {item.yearsOfService} yrs in hospital
                        </span>
                      </td>

                      {/* 4. Current Promotion Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {item.lastPromotionDate ? (
                          <div>
                            <span className="px-2.5 py-1 rounded bg-slate-950 text-slate-300 font-mono font-bold text-[11px] border border-slate-800">
                              {item.lastPromotionDate}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-1 font-semibold">
                              {item.yearsInCurrentGrade} yrs in current rank
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 text-[10px] font-semibold italic border border-slate-700">
                            None (Initial Entry)
                          </span>
                        )}
                      </td>

                      {/* 5. Next App Date (Subsequent Year) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2.5 py-1 rounded font-mono font-extrabold text-[11px] border ${
                              item.isDueInSubsequentYear
                                ? 'bg-indigo-950 text-indigo-300 border-indigo-500/50 shadow-sm'
                                : item.isDueThisYear
                                ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                                : item.isOverdue
                                ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                                : 'bg-slate-950 text-slate-300 border-slate-800'
                            }`}
                          >
                            {item.nextPromotionDueDate}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-1 font-mono font-semibold">
                          Year: <strong className="text-white">{item.nextPromotionDueYear}</strong>
                        </span>
                      </td>

                      {/* 6. Progression Rule */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${
                            item.promotionType === 'First Promotion'
                              ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {item.promotionType === 'First Promotion' ? (
                            <>
                              <Award className="h-3 w-3" /> 1st Promo (3-Yr)
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-3 w-3" /> Subsq Promo (5-Yr)
                            </>
                          )}
                        </span>
                      </td>

                      {/* 7. Time-in-grade Progress */}
                      <td className="px-4 py-3.5">
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                            <span className="text-slate-400">{currentYears}y / {required}y</span>
                            <span className={progressPct >= 100 ? 'text-emerald-400' : 'text-slate-400'}>
                              {progressPct}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progressPct >= 100
                                  ? 'bg-emerald-500'
                                  : progressPct >= 75
                                  ? 'bg-indigo-500'
                                  : 'bg-slate-600'
                              }`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* 8. Eligibility Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            item.isDueInSubsequentYear
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : item.isDueThisYear
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : item.isOverdue
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                              : 'bg-slate-800/80 text-slate-400 border-slate-700'
                          }`}
                        >
                          {item.isDueInSubsequentYear && <Calendar className="h-3 w-3" />}
                          {item.isDueThisYear && <Clock className="h-3 w-3" />}
                          {item.isOverdue && <AlertTriangle className="h-3 w-3" />}
                          {item.eligibilityStatus}
                        </span>
                      </td>

                      {/* 9. HR Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Promote Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenPromoteModal(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition flex items-center gap-1 shadow"
                            title="Execute & Record Staff Promotion"
                          >
                            <TrendingUp className="h-3 w-3" /> Promote
                          </button>

                          {/* Letter Preview Button */}
                          <button
                            type="button"
                            onClick={() => setLetterModalStaff(item)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition border border-slate-700 flex items-center gap-1"
                            title="View Official Promotion Letter Preview"
                          >
                            <FileText className="h-3 w-3 text-indigo-400" /> Letter
                          </button>

                          {/* Select Employee Callback */}
                          {onSelectEmployee && (
                            <button
                              type="button"
                              onClick={() => onSelectEmployee(item.employee)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title="View Employee Digital File"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: EXECUTE STAFF PROMOTION & GRADE UPGRADE */}
      {promotingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Execute Staff Promotion & Career Progression
                  </h3>
                  <p className="text-xs text-slate-400">Hospital Scheme of Service Grade Upgrade Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPromotingStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Staff Info Card */}
            <div className="rounded-2xl bg-slate-950 border border-indigo-500/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      promotingStaff.employee.photo ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                    }
                    alt=""
                    className="h-12 w-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{promotingStaff.name}</h4>
                    <p className="text-xs text-slate-400">
                      {promotingStaff.empCode} • {promotingStaff.department}
                    </p>
                    <span className="text-[10px] text-indigo-400 font-mono font-bold">
                      Current Grade: {promotingStaff.grade}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 font-black text-[10px] border border-indigo-500/40">
                    {promotingStaff.promotionType} ({promotingStaff.requiredYears} Yrs)
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">Due: {promotingStaff.nextPromotionDueDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-500 text-[10px] block">First Appt Date</span>
                  <span className="text-slate-200 font-bold">{promotingStaff.firstAppointmentDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Last Promotion</span>
                  <span className="text-slate-200 font-bold">
                    {promotingStaff.lastPromotionDate || 'Initial Appointment'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Current Wage</span>
                  <span className="text-slate-200 font-mono font-bold">
                    {formatCurrency(promotingStaff.employee.salary || 8500)}/mo
                  </span>
                </div>
              </div>
            </div>

            {/* Success Banner */}
            {isPromoteSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-xs font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  Promotion successfully recorded! Official promotion letter added to digital file dossier and salary scale updated.
                </span>
              </div>
            )}

            {/* Promotion Form */}
            <form onSubmit={handleConfirmPromotion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    New Substantive Grade / Rank <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Recommended: <strong className="text-indigo-300">{promotingStaff.suggestedNextGrade}</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Adjusted Monthly Basic Salary (GHS) <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={newSalary}
                    onChange={(e) => setNewSalary(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Previous: {formatCurrency(promotingStaff.employee.salary || 8500)} (+15% standard step)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Promotion Effective Date <span className="text-indigo-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={promotionEffectiveDate}
                    onChange={(e) => setPromotionEffectiveDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Authorizing Body / Board Sign-off
                  </label>
                  <input
                    type="text"
                    required
                    value={promotionApprovedBy}
                    onChange={(e) => setPromotionApprovedBy(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  HR Justification & Board Approval Remarks
                </label>
                <textarea
                  rows={3}
                  value={promotionRemarks}
                  onChange={(e) => setPromotionRemarks(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setPromotingStaff(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPromoteSuccess}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition shadow-lg shadow-indigo-950 flex items-center gap-1.5"
                >
                  <TrendingUp className="h-4 w-4" /> Save & Dispatch Official Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: OFFICIAL PROMOTION LETTER PREVIEW & PRINTABLE GAZETTE */}
      {letterModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Official Promotion Letter Gazette
                  </h3>
                  <p className="text-xs text-slate-400">Ghana Health Service Standard Form</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLetterModalStaff(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Official Letter Paper Document Preview */}
            <div
              id="promotion-letter-printable-content"
              className="p-6 rounded-2xl bg-white text-slate-900 shadow-inner font-serif space-y-4 text-xs leading-relaxed border border-slate-300"
            >
              <div className="text-center border-b-2 border-slate-900 pb-3 space-y-0.5">
                <h2 className="text-sm font-black tracking-wider uppercase">
                  POPE JOHN PAUL II MEDICAL CENTRE
                </h2>
                <p className="text-[10px] text-slate-700 font-sans uppercase tracking-widest font-semibold">
                  Directorate of Human Resource & Health Administration
                </p>
                <p className="text-[9px] text-slate-500 font-sans">
                  P.O. Box HP 104, Hospital Road, Off Volta Highway • Official Scheme of Service
                </p>
              </div>

              <div className="flex justify-between items-start pt-1 font-sans text-[11px]">
                <div>
                  <p><strong>Our Ref:</strong> PJPIIMC/HR/PROM/{letterModalStaff.nextPromotionDueYear}/{letterModalStaff.empCode}</p>
                  <p><strong>Date:</strong> 14th August, 2026</p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-300 text-[10px]">
                    OFFICIAL GAZETTE
                  </span>
                </div>
              </div>

              <div className="font-sans text-[11px] pt-1">
                <p><strong>TO:</strong> {letterModalStaff.name.toUpperCase()}</p>
                <p><strong>STAFF ID:</strong> {letterModalStaff.empCode}</p>
                <p><strong>CURRENT RANK:</strong> {letterModalStaff.grade}</p>
                <p><strong>DEPARTMENT:</strong> {letterModalStaff.department}</p>
              </div>

              <div className="pt-2">
                <h4 className="font-sans font-bold text-center text-xs uppercase underline tracking-wide">
                  LETTER OF PROMOTION TO THE GRADE OF {letterModalStaff.suggestedNextGrade.toUpperCase()}
                </h4>
              </div>

              <div className="space-y-2 text-[11px] font-sans">
                <p>Dear {letterModalStaff.name},</p>
                <p>
                  I am pleased to inform you that upon review of your career progression file, satisfactory completion of the required <strong>{letterModalStaff.requiredYears}-year service interval</strong> ({letterModalStaff.promotionType === 'First Promotion' ? `3 years since initial appointment on ${letterModalStaff.firstAppointmentDate}` : `5 years since previous promotion on ${letterModalStaff.lastPromotionDate}`}), and upon the recommendation of the Hospital Management Board, you have been promoted to the rank of:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded text-center font-bold text-xs text-indigo-900">
                  {letterModalStaff.suggestedNextGrade.toUpperCase()}
                </div>
                <p>
                  <strong>Effective Date:</strong> {letterModalStaff.nextPromotionDueDate}
                  <br />
                  <strong>Salary Adjustment:</strong> Applicable grade step scale (+15% baseline progression increment).
                </p>
                <p>
                  Management extends warm congratulations and trusts you will continue to uphold the highest standards of professional excellence and patient care in your new capacity.
                </p>
              </div>

              <div className="pt-4 flex justify-between items-end font-sans text-[10px]">
                <div className="space-y-1">
                  <div className="border-b border-slate-900 w-36 mb-1" />
                  <p className="font-bold">DR. AGYEMAN BOATENG</p>
                  <p className="text-slate-600">Director of Human Resources</p>
                  <p className="text-slate-500">Pope John Paul II Medical Centre</p>
                </div>
                <div className="text-right text-slate-500 text-[9px]">
                  <span>cc: Internal Audit • Personnel Dossier • Payroll Office</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setLetterModalStaff(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  printElementById('promotion-letter-printable-content', `Promotion_Letter_${letterModalStaff.empCode}`, {
                    title: `Promotion Notice - ${letterModalStaff.name}`,
                  });
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow"
              >
                <Printer className="h-4 w-4" /> Print Official Promotion Letter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
