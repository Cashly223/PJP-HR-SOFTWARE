import React, { useState } from 'react';
import {
  Gavel,
  Users,
  FileText,
  Scale,
  ShieldCheck,
  AlertTriangle,
  Plus,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  FileCheck,
  Building2,
  Lock,
  ArrowLeft,
  SlidersHorizontal,
  ShieldAlert,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { StaffQuery, DisciplinaryHearing } from '../../types/hrms';
import { DisciplinaryBoardMembersTab } from './DisciplinaryBoardMembersTab';
import { StaffQueriesTab } from './StaffQueriesTab';
import { DisciplinaryHearingsTab } from './DisciplinaryHearingsTab';
import {
  IssueStaffQueryModal,
  AddBoardMemberModal,
  SubmitQueryDefenseModal,
  ScheduleHearingModal,
  RecordVerdictModal,
  QueryLetterMemoModal,
} from './DisciplinaryModals';

export const DisciplinaryBoardManager: React.FC = () => {
  const {
    disciplinaryBoardMembers,
    staffQueries,
    disciplinaryHearings,
    activeRole,
    currentUser,
    hasModuleAccess,
    canIssueQueries,
    setActiveTab,
  } = useHrms();

  const [activeSubTab, setActiveSubTab] = useState<'queries' | 'board_members' | 'hearings' | 'ethics_code'>('queries');

  // Modal States
  const [isIssueQueryModalOpen, setIsIssueQueryModalOpen] = useState<boolean>(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState<boolean>(false);
  const [isScheduleHearingModalOpen, setIsScheduleHearingModalOpen] = useState<boolean>(false);
  const [selectedQueryForSchedule, setSelectedQueryForSchedule] = useState<StaffQuery | null>(null);

  const [responseModalQuery, setResponseModalQuery] = useState<StaffQuery | null>(null);
  const [memoModalQuery, setMemoModalQuery] = useState<StaffQuery | null>(null);
  const [verdictModalQuery, setVerdictModalQuery] = useState<StaffQuery | null>(null);
  const [verdictModalHearing, setVerdictModalHearing] = useState<DisciplinaryHearing | null>(null);

  // Access check: only HR Directorate & Head of Facility, or staff explicitly granted disciplinary_board in Access Control
  const hasAccessToDisciplinary = hasModuleAccess(activeRole, currentUser?.id, 'disciplinary_board');

  // Query authority: only HR Directorate & Head of Facility, or heads granted query authority by HR
  const isAuthorizedToQuery = canIssueQueries(activeRole, currentUser?.id);
  const isHRorFacilityHead = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);
  const isHRorAdmin = isHRorFacilityHead;

  // If user does not have access to the Disciplinary module
  if (!hasAccessToDisciplinary) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl text-slate-200 max-w-3xl mx-auto my-12 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
          <Lock className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-extrabold text-rose-300 border border-rose-500/30 uppercase tracking-wider">
            Confidential Tribunal Bureau
          </span>
          <h2 className="text-2xl font-black text-white">Disciplinary Board & Tribunal Access Restricted</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            By institutional statutory policy, the Hospital Disciplinary Board, Tribunal Hearings, and Case Dossiers are restricted exclusively to the <strong>Directorate of Human Resources</strong> and the <strong>Head of Facility (Medical Director/CEO)</strong>.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-4 text-xs text-slate-300 text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <ShieldAlert className="h-4 w-4" />
            <span>Statutory Query Delegation Rule:</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Unit Heads and Departmental Heads require explicit delegation from the HR Directorate before issuing queries or participating in tribunal proceedings. Access can be granted through the <strong>Access Control Manager</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 text-xs font-bold transition border border-slate-700"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Dashboard
          </button>
          {isHRorFacilityHead && (
            <button
              onClick={() => setActiveTab('customization')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold transition shadow-lg"
            >
              <SlidersHorizontal className="h-4 w-4" /> Open Access Control Manager
            </button>
          )}
        </div>
      </div>
    );
  }

  // Statistics calculation
  const totalActiveBoardMembers = disciplinaryBoardMembers.filter((m) => m.status === 'Active').length;
  const pendingQueriesCount = staffQueries.filter(
    (q) => q.status === 'Awaiting Staff Response' || q.status === 'Response Submitted'
  ).length;
  const scheduledHearingsCount = disciplinaryHearings.filter((h) => h.status === 'Scheduled').length;
  const concludedHearingsCount = disciplinaryHearings.filter((h) => h.status === 'Concluded').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Gavel className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Hospital Disciplinary Board & Staff Query Bureau
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tribunal & Ethics
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Standing Hospital Disciplinary Committee management, statutory queries issuance, oral hearing
                proceedings, fair hearing compliance, and sanctions promulgation.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {isAuthorizedToQuery && (
              <button
                onClick={() => setIsIssueQueryModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition"
              >
                <FileText className="h-4 w-4" />
                + Issue Staff Query
              </button>
            )}
            {isHRorFacilityHead && (
              <button
                onClick={() => setIsAddMemberModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition"
              >
                <Users className="h-4 w-4" />
                + Appoint Board Member
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white">{totalActiveBoardMembers}</span>
              <span className="text-[11px] text-slate-400 block font-medium">Active Board Members</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white">{pendingQueriesCount}</span>
              <span className="text-[11px] text-slate-400 block font-medium">Pending Queries</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white">{scheduledHearingsCount}</span>
              <span className="text-[11px] text-slate-400 block font-medium">Scheduled Hearings</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white">{concludedHearingsCount}</span>
              <span className="text-[11px] text-slate-400 block font-medium">Cases Concluded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('queries')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeSubTab === 'queries'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <FileText className="h-4 w-4" />
          Staff Queries & Dossiers ({staffQueries.length})
        </button>

        <button
          onClick={() => setActiveSubTab('board_members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeSubTab === 'board_members'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Users className="h-4 w-4" />
          Standing Disciplinary Board ({disciplinaryBoardMembers.length})
        </button>

        <button
          onClick={() => setActiveSubTab('hearings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeSubTab === 'hearings'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <Gavel className="h-4 w-4" />
          Tribunal Hearings & Sessions ({disciplinaryHearings.length})
        </button>

        <button
          onClick={() => setActiveSubTab('ethics_code')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition shrink-0 ${
            activeSubTab === 'ethics_code'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Disciplinary Code & Fair Hearing Rules
        </button>
      </div>

      {/* Sub-Tab Content */}
      {activeSubTab === 'queries' && (
        <StaffQueriesTab
          onOpenIssueQueryModal={() => setIsIssueQueryModalOpen(true)}
          onOpenResponseModal={(query) => setResponseModalQuery(query)}
          onOpenViewMemoModal={(query) => setMemoModalQuery(query)}
          onOpenScheduleHearingForQuery={(query) => {
            setSelectedQueryForSchedule(query);
            setIsScheduleHearingModalOpen(true);
          }}
          onOpenReviewVerdictModal={(query) => {
            setVerdictModalQuery(query);
            setVerdictModalHearing(null);
          }}
          isHRorAdmin={isHRorFacilityHead}
          isAuthorizedToQuery={isAuthorizedToQuery}
        />
      )}

      {activeSubTab === 'board_members' && (
        <DisciplinaryBoardMembersTab
          onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
          isHRorAdmin={isHRorFacilityHead}
        />
      )}

      {activeSubTab === 'hearings' && (
        <DisciplinaryHearingsTab
          onOpenScheduleHearingModal={() => {
            setSelectedQueryForSchedule(null);
            setIsScheduleHearingModalOpen(true);
          }}
          onOpenRecordVerdictForHearing={(hearing) => {
            setVerdictModalHearing(hearing);
            setVerdictModalQuery(null);
          }}
          isHRorAdmin={isHRorFacilityHead}
        />
      )}

      {activeSubTab === 'ethics_code' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 text-slate-300 text-xs leading-relaxed">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                PJPIIMC Disciplinary Policy & Statutory Fair Hearing Framework
              </h3>
              <p className="text-xs text-slate-400">
                Governed under the Ghana Labour Act 2003 (Act 651), JCI Hospital Standards, and Hospital Bylaws.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                1. Principle of Natural Justice (Audi Alteram Partem)
              </h4>
              <p className="text-xs text-slate-300">
                No staff member shall suffer penalty, warning, surcharge, or dismissal without being formally queried
                in writing and granted an uninhibited right to tender a defense with documentary proof and union representation.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                2. Standard Response Windows
              </h4>
              <p className="text-xs text-slate-300">
                Standard queries allow <strong>48 hours</strong> for written response. Urgent emergency breaches allow{' '}
                <strong>24 hours</strong>, while complex financial or gross negligence matters allow{' '}
                <strong>72 hours to 5 business days</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Scale className="h-4 w-4 text-purple-400" />
                3. Standing Board Panel Constitution
              </h4>
              <p className="text-xs text-slate-300">
                A valid disciplinary hearing tribunal requires a minimum quorum of four (4) designated officers:
                Executive Chairman, HR Secretary, Legal Advisor, and Elected Staff Union Representative.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                4. Statutory 14-Day Right of Appeal
              </h4>
              <p className="text-xs text-slate-300">
                Any employee aggrieved by a decision or sanction issued by the Disciplinary Committee possesses the
                right to appeal within fourteen (14) calendar days directly to the Hospital Board of Governors.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <IssueStaffQueryModal
        isOpen={isIssueQueryModalOpen}
        onClose={() => setIsIssueQueryModalOpen(false)}
      />

      <AddBoardMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
      />

      <SubmitQueryDefenseModal
        isOpen={Boolean(responseModalQuery)}
        onClose={() => setResponseModalQuery(null)}
        query={responseModalQuery}
      />

      <ScheduleHearingModal
        isOpen={isScheduleHearingModalOpen}
        onClose={() => {
          setIsScheduleHearingModalOpen(false);
          setSelectedQueryForSchedule(null);
        }}
        preselectedQuery={selectedQueryForSchedule}
      />

      <RecordVerdictModal
        isOpen={Boolean(verdictModalQuery || verdictModalHearing)}
        onClose={() => {
          setVerdictModalQuery(null);
          setVerdictModalHearing(null);
        }}
        query={verdictModalQuery}
        hearing={verdictModalHearing}
      />

      <QueryLetterMemoModal
        isOpen={Boolean(memoModalQuery)}
        onClose={() => setMemoModalQuery(null)}
        query={memoModalQuery}
      />
    </div>
  );
};

