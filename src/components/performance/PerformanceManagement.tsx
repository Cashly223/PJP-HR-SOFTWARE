import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  BarChart3,
  Target,
  GraduationCap,
  Sparkles,
  MessageSquare,
  Building2,
  ChevronRight,
  Eye,
  FileCheck2,
  BrainCircuit,
  Stethoscope,
  ShieldCheck,
  FileText,
  Workflow,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { PerformanceReview, ClinicalCompetency, PerformanceGoal } from '../../types/hrms';
import { AutomatedAppraisalWorkflow } from './AutomatedAppraisalWorkflow';

export const PerformanceManagement: React.FC = () => {
  const { performanceReviews, employees, addPerformanceReview, updatePerformanceReview, activeRole, currentUser } = useHrms();

  // Active view: 'workflow' (Automated Appraisal Workflow) vs 'competencies' (Clinical Competencies & 360 Feedback)
  const [activeTab, setActiveTab] = useState<'workflow' | 'competencies'>('workflow');

  const isHRorAdmin = ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(activeRole);
  const currentEmpName = currentUser?.name || '';
  const currentEmpEmail = currentUser?.email || '';

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [periodFilter, setPeriodFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

  // New Appraisal Form State
  const [newEmpId, setNewEmpId] = useState('');
  const [newReviewPeriod, setNewReviewPeriod] = useState('Mid-Year 2026');
  const [newOverallRating, setNewOverallRating] = useState(4.5);
  const [newManagerComments, setNewManagerComments] = useState('');
  const [newDevelopmentPlan, setNewDevelopmentPlan] = useState('');

  // Stats Calculations
  const safeReviews = (performanceReviews || []).filter(Boolean);
  const totalReviews = safeReviews.length;
  const completedCount = safeReviews.filter((r) => r?.status === 'Completed').length;
  const inProgressCount = safeReviews.filter((r) => r?.status !== 'Completed').length;
  const avgRating = totalReviews > 0
    ? (safeReviews.reduce((acc, r) => acc + (r?.overallRating || 0), 0) / totalReviews).toFixed(1)
    : '0.0';

  // Filtered List
  const filteredReviews = safeReviews.filter((r) => {
    if (!r) return false;
    if (!isHRorAdmin) {
      const isSelf =
        r.employeeId === currentUser?.id ||
        (currentEmpName && (r.employeeName || '').toLowerCase().includes(currentEmpName.toLowerCase().split(' ')[0])) ||
        (currentEmpEmail && (r.employeeName || '').toLowerCase().includes(currentEmpEmail.split('@')[0].toLowerCase()));
      if (!isSelf) return false;
    }

    const matchesSearch =
      (r.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesPeriod = periodFilter === 'All' || r.reviewPeriod === periodFilter;

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleCreateReview = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === newEmpId) || employees[0];

    addPerformanceReview({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      jobTitle: emp.jobTitle,
      department: emp.department,
      reviewPeriod: newReviewPeriod,
      overallRating: Number(newOverallRating),
      managerComments: newManagerComments || 'Clinical performance evaluation initiated.',
      developmentPlan: newDevelopmentPlan || 'Enrolled in clinical specialty refreshers.',
      clinicalCompetencies: [
        { id: 'cc-1', name: 'Patient Care & Clinical Skills', category: 'Clinical Skills', score: 4, maxScore: 5, comments: 'Consistent clinical execution.' },
        { id: 'cc-2', name: 'Patient Safety & Infection Control', category: 'Patient Safety', score: 5, maxScore: 5, comments: 'Strict compliance with sterile techniques.' },
        { id: 'cc-3', name: 'Electronic Medical Record (EMR) Documentation', category: 'Documentation', score: 4, maxScore: 5, comments: 'Timely charting.' },
      ],
      kpis: [
        { metric: 'Clinical Standard Protocol Compliance', target: '100%', achieved: '98%', rating: 4.8 },
        { metric: 'Patient Care Satisfaction Score', target: '4.5/5', achieved: '4.7/5', rating: 4.7 },
      ],
      goals: [
        { id: 'g-1', title: 'Complete Advanced Clinical Competency Course', category: 'Certifications', targetDate: '2026-11-30', progressPercent: 40, status: 'In Progress' },
      ],
      feedback360: [],
    });

    setIsModalOpen(false);
    setNewManagerComments('');
    setNewDevelopmentPlan('');
  };

  const getStatusBadge = (status: PerformanceReview['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Manager Review':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Self Assessment':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Calibration':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">Clinical Performance & Appraisal System</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                <BrainCircuit className="h-3 w-3" /> Multi-Tier Cadre Workflow
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Automated multi-tier appraisal approvals, document storage vault, manager notification dispatch, clinical competencies, and completion monitoring.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'competencies' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:bg-emerald-500 transition active:scale-95"
            >
              <Plus className="h-4 w-4" /> Start Review Form
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'workflow'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Workflow className="h-4 w-4 text-emerald-300" />
          <span>Automated Performance Appraisal Workflow & Document Tracking</span>
        </button>

        <button
          onClick={() => setActiveTab('competencies')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'competencies'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 text-emerald-300" />
          <span>Clinical Competency Scorecards & 360 Reviews</span>
        </button>
      </div>

      {activeTab === 'workflow' ? (
        <AutomatedAppraisalWorkflow />
      ) : (
        <div className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Average Hospital Score</span>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white flex items-baseline gap-1">
                {avgRating} <span className="text-xs text-slate-500 font-normal">/ 5.0</span>
              </div>
              <p className="mt-1 text-[11px] text-emerald-400/80">Top 5% across hospital network</p>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Appraisals Cycle Count</span>
                <FileCheck2 className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-white">{totalReviews}</div>
              <p className="mt-1 text-[11px] text-slate-500">Active evaluation cycles</p>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Completed Reviews</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-emerald-400">{completedCount}</div>
              <p className="mt-1 text-[11px] text-emerald-500/80">Signed off & archived</p>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>In Progress / Review</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="mt-2 text-2xl font-bold text-amber-400">{inProgressCount}</div>
              <p className="mt-1 text-[11px] text-amber-500/80">Pending manager sign-off</p>
            </div>
          </div>

      {/* Filter & Search Bar */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search clinician name, title, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs">
          <div className="flex items-center gap-1 text-slate-400 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">Status: All</option>
            <option value="Completed">Completed</option>
            <option value="Manager Review">Manager Review</option>
            <option value="Self Assessment">Self Assessment</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-300 focus:border-emerald-500 focus:outline-none"
          >
            <option value="All">Period: All</option>
            <option value="Mid-Year 2026">Mid-Year 2026</option>
            <option value="Annual 2026">Annual 2026</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-2 rounded-xl bg-slate-900/60 border border-slate-800 p-8 text-center">
            <TrendingUp className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">No performance evaluations match your search filter.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm"
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 font-bold border border-slate-700">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {rev.employeeName}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusBadge(rev.status)}`}>
                          {rev.status}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">{rev.jobTitle} • {rev.department}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end text-amber-400 font-bold text-sm">
                      <Star className="h-4 w-4 fill-amber-400" />
                      {rev.overallRating.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">/ 5.0</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{rev.reviewPeriod}</span>
                  </div>
                </div>

                {/* Clinical Competencies Breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> Key Clinical Competencies
                    </span>
                    <span className="text-[10px] text-slate-500">{(rev.clinicalCompetencies || []).length} Evaluated</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {(rev.clinicalCompetencies || []).slice(0, 3).map((cc) => (
                      <div key={cc.id} className="rounded-lg bg-slate-950 p-2 border border-slate-800/60 flex items-center justify-between">
                        <span className="text-slate-300 font-medium truncate max-w-[220px]">{cc.name}</span>
                        <div className="flex items-center gap-1 font-bold text-emerald-400">
                          {cc.score} / {cc.maxScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals & KPIs preview */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Target className="h-3 w-3 text-sky-400" /> SMART Goals
                    </div>
                    <div className="mt-1 font-semibold text-slate-200">
                      {(rev.goals || []).filter((g) => g.status === 'Completed').length} / {(rev.goals || []).length} Completed
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800/60">
                    <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-purple-400" /> 360° Peer Feedback
                    </div>
                    <div className="mt-1 font-semibold text-slate-200">
                      {(rev.feedback360 || []).length} Peer Submissions
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500">
                  Evaluator: <strong className="text-slate-400">{rev.evaluatorName}</strong>
                </span>

                <button
                  onClick={() => setSelectedReview(rev)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-emerald-600 hover:text-white transition"
                >
                  <Eye className="h-3.5 w-3.5" /> Full Dossier & Goals <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )}

      {/* START APPRAISAL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Initiate Performance Appraisal</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Employee / Clinician</label>
                <select
                  required
                  value={newEmpId}
                  onChange={(e) => setNewEmpId(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Review Period</label>
                  <select
                    value={newReviewPeriod}
                    onChange={(e) => setNewReviewPeriod(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Mid-Year 2026">Mid-Year 2026</option>
                    <option value="Annual 2026">Annual 2026</option>
                    <option value="Probationary 90-Day">Probationary 90-Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Initial Overall Score (1 - 5)</label>
                  <input
                    type="number"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={newOverallRating}
                    onChange={(e) => setNewOverallRating(parseFloat(e.target.value))}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Evaluator / Manager Observations</label>
                <textarea
                  rows={3}
                  placeholder="Clinical strengths, leadership traits, patient care quality..."
                  value={newManagerComments}
                  onChange={(e) => setNewManagerComments(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Professional Development Plan</label>
                <textarea
                  rows={2}
                  placeholder="Key training programs, certifications, or rotation goals..."
                  value={newDevelopmentPlan}
                  onChange={(e) => setNewDevelopmentPlan(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-200 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow-md shadow-emerald-900/20"
                >
                  Generate Appraisal Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPRAISAL DOSSIER DRAWER / MODAL */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                  Hospital Evaluation Dossier
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedReview.employeeName}</h2>
                <p className="text-xs text-slate-400">{selectedReview.jobTitle} • {selectedReview.department}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-lg font-bold text-amber-400 flex items-center gap-1 justify-end">
                    <Star className="h-4 w-4 fill-amber-400" /> {selectedReview.overallRating.toFixed(1)}
                  </div>
                  <span className="text-[10px] text-slate-500">{selectedReview.reviewPeriod}</span>
                </div>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Clinical Competencies Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-emerald-400" /> Clinical Competencies Evaluation
              </h4>

              <div className="space-y-2">
                {(selectedReview.clinicalCompetencies || []).map((cc) => (
                  <div key={cc.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                      <span>{cc.name}</span>
                      <span className="text-emerald-400">{cc.score} / {cc.maxScore}</span>
                    </div>
                    {cc.comments && <p className="text-[11px] text-slate-400 italic">{cc.comments}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital KPIs */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-sky-400" /> Clinical KPIs & Metrics
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(selectedReview.kpis || []).map((kpi, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium block truncate">{kpi.metric}</span>
                    <div className="mt-1 flex items-baseline justify-between font-bold">
                      <span className="text-slate-200">Achieved: <strong className="text-emerald-400">{kpi.achieved}</strong></span>
                      <span className="text-[10px] text-slate-500">Target: {kpi.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SMART Goals */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="h-4 w-4 text-purple-400" /> SMART Professional Goals
              </h4>

              <div className="space-y-2">
                {(selectedReview.goals || []).map((g) => (
                  <div key={g.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{g.title}</span>
                      <span className="text-purple-300">{g.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all"
                        style={{ width: `${g.progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Category: {g.category}</span>
                      <span>Target Date: {g.targetDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 360 Peer Feedback */}
            {(selectedReview.feedback360 || []).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-amber-400" /> 360° Peer Feedback Submissions
                </h4>

                <div className="space-y-2">
                  {(selectedReview.feedback360 || []).map((fb) => (
                    <div key={fb.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{fb.reviewerName} ({fb.relationship})</span>
                        <span className="text-amber-400 flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400" /> {fb.rating}</span>
                      </div>
                      <p className="text-slate-300"><strong>Strengths:</strong> {fb.strengths}</p>
                      {fb.areasForGrowth && <p className="text-slate-400"><strong>Growth Area:</strong> {fb.areasForGrowth}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evaluator Notes & Development Plan */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
              <div>
                <h5 className="font-semibold text-slate-400">Evaluator Summary</h5>
                <p className="text-slate-200 mt-1">{selectedReview.managerComments}</p>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <h5 className="font-semibold text-emerald-400 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" /> Enrolled Professional Development Plan
                </h5>
                <p className="text-slate-300 mt-1">{selectedReview.developmentPlan}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
