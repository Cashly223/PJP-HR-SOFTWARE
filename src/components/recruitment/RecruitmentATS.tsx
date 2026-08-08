import React, { useState } from 'react';
import { Briefcase, UserCheck, Sparkles, Plus, CheckCircle, Mail, Phone } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';

export const RecruitmentATS: React.FC = () => {
  const { vacancies, candidates, addCandidate, updateCandidateStatus } = useHrms();
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="h-6 w-6 text-emerald-600" />
          Healthcare Recruitment & AI Candidate Ranking (ATS)
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Job Requisitions, Clinical Resume Parsing, AI Candidate Matching Scorecards & Offer Generation.
        </p>
      </div>

      {/* Vacancies Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vacancies.map((v) => (
          <div
            key={v.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {v.type}
                </span>
                <h3 className="mt-1 font-bold text-slate-900 dark:text-slate-100 text-sm">{v.title}</h3>
                <p className="text-xs text-slate-500">{v.department}</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">{v.openings} Openings</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {v.requirements.map((req, idx) => (
                <span key={idx} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {req}
                </span>
              ))}
            </div>

            <div className="mt-4 border-t pt-3 flex justify-between items-center text-xs dark:border-slate-800">
              <span className="text-slate-400">{v.applicantsCount} Applicants</span>
              <span className="font-semibold text-emerald-600">Active Listing</span>
            </div>
          </div>
        ))}
      </div>

      {/* Candidates List with AI Scorecard */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-4 border-b dark:border-slate-800 font-bold text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-emerald-600" /> AI Ranked Applicants
          </span>
          <span className="text-xs text-slate-400">Powered by Gemini AI Clinical Matcher</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {candidates.map((c) => (
            <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{c.name}</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-500" /> AI Match: {c.aiMatchScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Applied for {c.vacancyTitle} • {c.experienceYears} Yrs Exp ({c.currentRole})</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 italic">"{c.aiMatchSummary}"</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {c.status}
                </span>
                <button
                  onClick={() => updateCandidateStatus(c.id, 'Interview Scheduled')}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
