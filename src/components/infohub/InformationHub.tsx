import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Compass,
  PlaneTakeoff,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Download,
  Printer,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Info,
  Building,
  Award,
  AlertOctagon,
  HeartHandshake,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { InfoHubArticle } from '../../types/hrms';

export const InformationHub: React.FC = () => {
  const { infoArticles } = useHrms();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<InfoHubArticle | null>(null);

  const categories = [
    { id: 'All', label: 'All Documents', icon: BookOpen },
    { id: 'Vision & Mission', label: 'Vision, Mission & Principles', icon: Compass },
    { id: 'Leave Policies', label: 'Leave Policies', icon: PlaneTakeoff },
    { id: 'Study Leave Policies', label: 'Study Leave Policies', icon: GraduationCap },
    { id: 'Promotion & Demotion', label: 'Promotion & Demotion Criteria', icon: TrendingUp },
    { id: 'Code of Conduct & Ethics', label: 'Code of Ethics & Patient Care', icon: ShieldCheck },
  ];

  const filteredArticles = (infoArticles || []).filter((art) => {
    if (!art) return false;
    const matchesSearch =
      (art.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.summary || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.content || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (art.tags || []).some((t) => (t || '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePrint = (art: InfoHubArticle) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PJPIIMC Policy Document - ${art.title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              h1 { color: #047857; font-size: 24px; margin-bottom: 8px; }
              .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; }
              .content { font-size: 14px; whitespace: pre-line; }
              .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            </style>
          </head>
          <body>
            <h1>Pope John Paul II Medical Centre (PJPIIMC)</h1>
            <h2>${art.title}</h2>
            <div class="meta">
              <strong>Category:</strong> ${art.category} | <strong>Version:</strong> ${art.version} | <strong>Last Updated:</strong> ${art.lastUpdated} | <strong>Approved By:</strong> ${art.author}
            </div>
            <div class="content">${art.content.replace(/\n/g, '<br/>')}</div>
            <div class="footer">
              Official Hospital Governance & Staff HR Document • Pope John Paul II Medical Centre • Confidential & Internal Use Only
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-inner">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950 tracking-wider">
                  PJPIIMC Institutional Knowledge Base
                </span>
                <span className="text-[11px] font-medium text-emerald-200">
                  Open Access for All Staff
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
                PJPIIMC Information & Policy Hub
              </h2>
              <p className="text-xs text-emerald-100/90 mt-0.5 max-w-xl">
                Official repository of Pope John Paul II Medical Centre policies, including leave guidelines, study leave grants, promotion & demotion criteria, vision, mission, and guiding principles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Navigation Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies (e.g. Leave, Study Leave, Promotion, Vision, Ethics)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none dark:text-slate-100"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Policy Articles Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {article.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  v{article.version} • {article.lastUpdated}
                </span>
              </div>

              <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {article.title}
              </h3>

              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-medium">Author: {article.author}</span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(article)}
                  title="Print / Export Policy Document"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Printer className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => setSelectedArticle(article)}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <span>Read Full Policy</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: FULL POLICY DOCUMENT VIEWER */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[88vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedArticle.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint(selectedArticle)}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-600" /> Print
                </button>

                <button
                  onClick={() => setSelectedArticle(null)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Metadata Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 text-[11px] text-slate-600 dark:text-slate-400">
              <span><strong>Document Version:</strong> {selectedArticle.version}</span>
              <span><strong>Last Revision:</strong> {selectedArticle.lastUpdated}</span>
              <span><strong>Approving Board:</strong> {selectedArticle.author}</span>
            </div>

            {/* Content Text Body */}
            <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">Executive Summary</h4>
                <p className="text-slate-600 dark:text-slate-300">{selectedArticle.summary}</p>
              </div>

              <div className="p-2 space-y-2">
                {selectedArticle.content}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>Pope John Paul II Medical Centre • Human Resource Governance</span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
