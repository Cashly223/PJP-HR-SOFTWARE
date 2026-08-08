import React, { useState } from 'react';
import { GraduationCap, Award, CheckCircle2, Play, FileCheck, X } from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { TrainingCourse } from '../../types/hrms';

export const LearningHub: React.FC = () => {
  const { courses } = useHrms();
  const [selectedCert, setSelectedCert] = useState<TrainingCourse | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-emerald-600" />
          Clinical LMS & Continuing Education Hub
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Mandatory Infection Control Training, BLS/ACLS Clinical Refresher, HIPAA Compliance & Digital Certificates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {courses.map((crs) => (
          <div
            key={crs.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <span className="rounded bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {crs.category}
              </span>
              <h3 className="mt-2 font-bold text-slate-900 dark:text-slate-100 text-sm">{crs.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{crs.durationHours} Hours • {crs.modulesCount} Modules</p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Progress</span>
                  <span>{crs.progressPercent}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${crs.progressPercent}%` }}></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t dark:border-slate-800 flex justify-between items-center">
              {crs.certificateIssued ? (
                <button
                  onClick={() => setSelectedCert(crs)}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
                >
                  <Award className="h-4 w-4" /> View Certificate
                </button>
              ) : (
                <button className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
                  <Play className="h-3.5 w-3.5" /> Continue Module
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900 border border-amber-500/50 text-center text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <Award className="mx-auto h-16 w-16 text-amber-500 animate-bounce" />
            <h3 className="mt-2 text-xl font-serif font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Certificate of Clinical Completion
            </h3>
            <p className="text-xs text-slate-500 mt-1">Pope John Paul II Medical Education Board</p>

            <div className="my-6 border-t border-b py-4 dark:border-slate-800">
              <p className="text-xs text-slate-500">This certifies that staff has successfully completed</p>
              <h4 className="mt-1 font-bold text-base text-emerald-600 dark:text-emerald-400">{selectedCert.title}</h4>
              <p className="mt-2 text-xs font-semibold">Score Achieved: {selectedCert.score}% • Grade A+</p>
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Date Issued: Aug 2026</span>
              <span>Verification ID: CERT-MED-99102</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
