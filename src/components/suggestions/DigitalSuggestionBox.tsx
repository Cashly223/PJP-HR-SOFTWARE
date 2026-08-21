import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Search,
  Lock,
  UserCheck,
  Eye,
  Send,
  X,
  Building2,
  Award,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { SuggestionItem } from '../../types/hrms';

export const DigitalSuggestionBox: React.FC = () => {
  const { suggestions, addSuggestion, upvoteSuggestion, respondToSuggestion, currentUser, activeRole } = useHrms();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Response Modal State (HR / Facility Head)
  const [respondingSuggestion, setRespondingSuggestion] = useState<SuggestionItem | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState<SuggestionItem['status']>('Under Review');

  // Submit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDetails, setFormDetails] = useState('');
  const [formCategory, setFormCategory] = useState<SuggestionItem['category']>('Staff Welfare & Amenities');
  const [formIsAnonymous, setFormIsAnonymous] = useState(false);

  const currentEmpName = currentUser?.name || 'Staff Member';
  const currentEmpDept = currentUser?.department || 'Clinical Services';
  const currentEmpId = currentUser?.id || 'emp-current';

  const isManagementRole = ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head'].includes(activeRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDetails.trim()) return;

    addSuggestion({
      title: formTitle,
      details: formDetails,
      category: formCategory,
      isAnonymous: formIsAnonymous,
      submittedBy: formIsAnonymous ? 'Anonymous Staff' : currentEmpName,
      submittedByDept: formIsAnonymous ? 'Undisclosed Department' : currentEmpDept,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
      status: 'Submitted',
      upvotes: 1,
      upvotedBy: [currentEmpId],
    });

    setFormTitle('');
    setFormDetails('');
    setFormIsAnonymous(false);
    setIsSubmitModalOpen(false);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingSuggestion || !responseText.trim()) return;

    let roleTitle = 'Hospital Management';
    if (activeRole === 'facility_head' || activeRole === 'super_admin') roleTitle = 'Head of Facility / CMO';
    else if (activeRole === 'hr_director') roleTitle = 'HR Director';
    else if (activeRole === 'hr_manager') roleTitle = 'HR Management';

    respondToSuggestion(respondingSuggestion.id, {
      responderName: currentEmpName,
      responderRole: roleTitle,
      message: responseText,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 10),
    }, responseStatus);

    setRespondingSuggestion(null);
    setResponseText('');
  };

  const filteredSuggestions = (suggestions || []).filter((item) => {
    if (!item) return false;
    const matchesSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.details || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.submittedBy || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesStat = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            Hospital Digital Suggestion Box
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Voice your ideas, workplace improvements, and clinical safety recommendations to hospital leadership with full confidentiality.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Submit New Suggestion
        </button>
      </div>

      {/* Confidentiality Commitment Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Whistleblower & Anonymous Feedback Shield</span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                100% Protected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              You can choose to submit feedback anonymously. Hospital leadership values continuous improvement for staff well-being and clinical excellence.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suggestions or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            <span>Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="All">All Categories</option>
              <option value="Patient Care & Safety">Patient Care & Safety</option>
              <option value="Staff Welfare & Amenities">Staff Welfare & Amenities</option>
              <option value="HR Policies">HR Policies</option>
              <option value="Equipment & Facilities">Equipment & Facilities</option>
              <option value="IT & Systems">IT & Systems</option>
              <option value="General Innovation">General Innovation</option>
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Planned">Planned</option>
              <option value="Implemented">Implemented</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggestions List Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSuggestions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <Lightbulb className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-medium text-slate-500">No suggestions match your search criteria.</p>
          </div>
        ) : (
          filteredSuggestions.map((item) => {
            const hasUpvoted = item.upvotedBy.includes(currentEmpId);

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {item.category}
                    </span>

                    {item.isAnonymous ? (
                      <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        🔒 Anonymous Submission
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        By: {item.submittedBy} ({item.submittedByDept})
                      </span>
                    )}
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      item.status === 'Implemented'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : item.status === 'Planned'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : item.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {item.details}
                </p>

                {/* Management Response Box (if available) */}
                {item.responseFromManagement && (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-3.5 dark:bg-emerald-950/20 dark:border-emerald-500/30">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        Management Official Response ({item.responseFromManagement.responderRole})
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400">
                        {item.responseFromManagement.updatedAt}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      "{item.responseFromManagement.message}"
                    </p>
                  </div>
                )}

                {/* Card Controls & Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                  <span className="text-[10px] text-slate-400">Submitted: {item.submittedAt}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => upvoteSuggestion(item.id, currentEmpId)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                        hasUpvoted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? 'fill-current text-emerald-600' : ''}`} />
                      <span>{item.upvotes} Upvotes</span>
                    </button>

                    {isManagementRole && (
                      <button
                        onClick={() => {
                          setRespondingSuggestion(item);
                          setResponseStatus(item.status);
                        }}
                        className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Respond & Update Status</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL 1: SUBMIT NEW SUGGESTION */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsSubmitModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Submit Workplace Suggestion
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Help improve clinical workflows, facilities, and staff welfare at PJPIIMC.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Suggestion Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Install dedicated breakroom coffee station in ICU Ward"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as SuggestionItem['category'])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="Staff Welfare & Amenities">Staff Welfare & Amenities</option>
                  <option value="Patient Care & Safety">Patient Care & Safety</option>
                  <option value="HR Policies">HR Policies</option>
                  <option value="Equipment & Facilities">Equipment & Facilities</option>
                  <option value="IT & Systems">IT & Systems</option>
                  <option value="General Innovation">General Innovation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Suggestion Details & Implementation Idea
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your idea, expected benefits, and how it will improve hospital operations..."
                  value={formDetails}
                  onChange={(e) => setFormDetails(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                ></textarea>
              </div>

              {/* Anonymous Checkbox */}
              <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 p-3 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40">
                <input
                  type="checkbox"
                  id="anonymousCheck"
                  checked={formIsAnonymous}
                  onChange={(e) => setFormIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="anonymousCheck" className="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer flex items-center gap-1.5">
                  🔒 Submit as Anonymous (Hide my staff name & ID)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: MANAGEMENT RESPONSE MODAL */}
      {respondingSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setRespondingSuggestion(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Respond to Staff Suggestion
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Suggestion: <strong>{respondingSuggestion.title}</strong>
            </p>

            <form onSubmit={handleSendResponse} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Update Suggestion Status
                </label>
                <select
                  value={responseStatus}
                  onChange={(e) => setResponseStatus(e.target.value as SuggestionItem['status'])}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Planned">Planned for Execution</option>
                  <option value="Implemented">Implemented</option>
                  <option value="Declined">Declined</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Response Message
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide executive feedback or action plan regarding this staff suggestion..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRespondingSuggestion(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Publish Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
