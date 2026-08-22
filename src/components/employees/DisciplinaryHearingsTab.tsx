import React, { useState } from 'react';
import {
  Gavel,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  FileText,
  AlertCircle,
  Plus,
  Scale,
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { DisciplinaryHearing } from '../../types/hrms';

interface DisciplinaryHearingsTabProps {
  onOpenScheduleHearingModal: () => void;
  onOpenRecordVerdictForHearing: (hearing: DisciplinaryHearing) => void;
  isHRorAdmin: boolean;
}

export const DisciplinaryHearingsTab: React.FC<DisciplinaryHearingsTabProps> = ({
  onOpenScheduleHearingModal,
  onOpenRecordVerdictForHearing,
  isHRorAdmin,
}) => {
  const { disciplinaryHearings, updateDisciplinaryHearing } = useHrms();
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [expandedHearingId, setExpandedHearingId] = useState<string | null>(null);

  const statuses = ['All', 'Scheduled', 'In Progress', 'Adjourned', 'Concluded'];

  const filteredHearings = disciplinaryHearings.filter(
    (h) => filterStatus === 'All' || h.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterStatus === s
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {isHRorAdmin && (
          <button
            onClick={onOpenScheduleHearingModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md hover:shadow-lg transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            Convene Tribunal Hearing
          </button>
        )}
      </div>

      {/* Hearing List */}
      {filteredHearings.length === 0 ? (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-12 text-center">
          <Scale className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Disciplinary Hearings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Tribunal sessions convened by the Standing Disciplinary Committee will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHearings.map((hearing) => {
            const isExpanded = expandedHearingId === hearing.id;
            return (
              <div
                key={hearing.id}
                className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg hover:border-slate-700 transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-400">{hearing.hearingCaseNumber}</span>
                      <span className="text-white font-bold text-sm">
                        Case for: {hearing.accusedStaffName} ({hearing.accusedStaffEmpCode})
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {hearing.accusedStaffRole} • <span className="text-slate-300 font-medium">{hearing.accusedStaffDept}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border uppercase tracking-wider ${
                        hearing.status === 'Scheduled'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : hearing.status === 'Concluded'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {hearing.status}
                    </span>

                    <button
                      onClick={() => setExpandedHearingId(isExpanded ? null : hearing.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Main Hearing Info */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Hearing Date & Time</span>
                      <span className="text-white font-semibold">
                        {hearing.hearingDate} • {hearing.hearingTime}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-rose-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tribunal Venue</span>
                      <span className="text-white font-semibold">{hearing.venue}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 flex items-center gap-3">
                    <FileText className="h-4 w-4 text-purple-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Associated Query</span>
                      <span className="text-white font-semibold">{hearing.queryNumber || 'Summary Action'}</span>
                    </div>
                  </div>
                </div>

                {/* Summary of Charges */}
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <span className="text-xs font-bold text-slate-300 block mb-1">Terms of Reference & Charges:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{hearing.chargesSummary}</p>
                </div>

                {/* Panel Members & Witnesses */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                      <Users className="h-3.5 w-3.5 text-purple-400" /> Presiding Panel:
                    </span>
                    <div className="space-y-1">
                      {hearing.presidingPanel.map((member, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                          <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                          <span>{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mb-2">
                      <Users className="h-3.5 w-3.5 text-amber-400" /> Complainants / Witnesses:
                    </span>
                    {hearing.complainantOrWitnesses && hearing.complainantOrWitnesses.length > 0 ? (
                      <div className="space-y-1">
                        {hearing.complainantOrWitnesses.map((w, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-slate-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">No external witnesses registered.</span>
                    )}
                  </div>
                </div>

                {/* Verdict Section if Concluded */}
                {hearing.verdictRecommendation && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-emerald-400" />
                        <div>
                          <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                            Tribunal Verdict Promulgated
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            Outcome: {hearing.verdictRecommendation.outcome}
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">
                        Effective Date: <strong className="text-slate-200">{hearing.verdictRecommendation.effectiveDate}</strong>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      <strong>Justification: </strong> {hearing.verdictRecommendation.justification}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-800/30 text-xs text-slate-400">
                      <span>Signed by Chair: <strong>{hearing.verdictRecommendation.signedByChairman}</strong></span>
                      <span>Signed by Sec: <strong>{hearing.verdictRecommendation.signedBySecretary}</strong></span>
                      {hearing.verdictRecommendation.appealDeadlineDate && (
                        <span className="text-amber-300">
                          14-Day Appeal Window Deadline: <strong>{hearing.verdictRecommendation.appealDeadlineDate}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Expandable Minutes of Hearing */}
                {isExpanded && hearing.minutesOfHearing && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-emerald-400" /> Official Minutes of Hearing Proceedings:
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {hearing.minutesOfHearing}
                    </p>
                  </div>
                )}

                {/* Bottom Actions */}
                {isHRorAdmin && hearing.status !== 'Concluded' && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end gap-2">
                    <button
                      onClick={() => onOpenRecordVerdictForHearing(hearing)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition"
                    >
                      <Award className="h-3.5 w-3.5" />
                      Record & Promulgate Verdict
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
