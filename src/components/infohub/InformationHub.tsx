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
  Plus,
  Edit3,
  Trash2,
  Lock,
  Calendar,
  Tag,
  Layers,
  FileCheck,
  RefreshCw,
  AlertCircle,
  FileUp,
  X,
  Check,
  SlidersHorizontal,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { InfoHubArticle } from '../../types/hrms';
import { PjpiimcLogo } from '../common/PjpiimcLogo';

export const InformationHub: React.FC = () => {
  const {
    infoArticles,
    canManageInfoHub,
    addInfoArticle,
    updateInfoArticle,
    deleteInfoArticle,
    resetInfoArticlesToDefault,
    currentUser,
  } = useHrms();

  const isHrAuthorized = canManageInfoHub();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<InfoHubArticle | null>(null);

  // HR Manage Modals State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<InfoHubArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<InfoHubArticle | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Editor Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Vision & Mission' as InfoHubArticle['category'],
    summary: '',
    content: '',
    version: '2026.1',
    author: 'Human Resources Directorate',
    effectiveDate: new Date().toISOString().split('T')[0],
    tags: '',
    downloadablePdfName: '',
    revisionNotes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'All', label: 'All Documents', icon: BookOpen, color: 'text-slate-600 dark:text-slate-300' },
    { id: 'Vision & Mission', label: 'Vision, Mission & Principles', icon: Compass, color: 'text-purple-500' },
    { id: 'Code of Conduct & Ethics', label: 'Code of Ethics & Conduct', icon: ShieldCheck, color: 'text-amber-500' },
    { id: 'Leave Policies', label: 'Leave Policies', icon: PlaneTakeoff, color: 'text-blue-500' },
    { id: 'Study Leave Policies', label: 'Study Leave & Sponsorship', icon: GraduationCap, color: 'text-emerald-500' },
    { id: 'Promotion & Demotion', label: 'Promotion & Demotion Criteria', icon: TrendingUp, color: 'text-rose-500' },
    { id: 'Hospital Guidelines', label: 'Hospital Guidelines & SOPs', icon: Building, color: 'text-indigo-500' },
  ];

  const filteredArticles = (infoArticles || []).filter((art) => {
    if (!art) return false;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (art.title || '').toLowerCase().includes(query) ||
      (art.summary || '').toLowerCase().includes(query) ||
      (art.content || '').toLowerCase().includes(query) ||
      (art.author || '').toLowerCase().includes(query) ||
      (art.tags || []).some((t) => (t || '').toLowerCase().includes(query));
    const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate dynamic stats
  const totalCount = infoArticles.length;
  const visionCount = infoArticles.filter((a) => a.category === 'Vision & Mission').length;
  const ethicsCount = infoArticles.filter((a) => a.category === 'Code of Conduct & Ethics').length;
  const leaveCount = infoArticles.filter((a) => a.category === 'Leave Policies' || a.category === 'Study Leave Policies').length;

  const handleOpenCreateModal = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      category: 'Vision & Mission',
      summary: '',
      content: `1. OBJECTIVE & PURPOSE\nDescribe the primary purpose of this policy...\n\n2. SCOPE & APPLICABILITY\nThis policy applies to all clinical, nursing, administrative, and auxiliary personnel of PJPIIMC...\n\n3. POLICY DIRECTIVES & CLAUSES\n- Clause 1: Detailed requirement...\n- Clause 2: Detailed requirement...\n\n4. COMPLIANCE & GOVERNANCE\nSupervision and enforcement are conducted by the Human Resources Directorate.`,
      version: '1.0',
      author: `${currentUser?.name || 'Human Resources Directorate'} (HR Directorate)`,
      effectiveDate: new Date().toISOString().split('T')[0],
      tags: 'Governance, Policy, PJPIIMC',
      downloadablePdfName: '',
      revisionNotes: 'Initial publication',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (art: InfoHubArticle) => {
    setEditingArticle(art);
    setFormData({
      title: art.title,
      category: art.category,
      summary: art.summary,
      content: art.content,
      version: art.version,
      author: art.author || 'Human Resources Directorate',
      effectiveDate: art.effectiveDate || art.lastUpdated || new Date().toISOString().split('T')[0],
      tags: (art.tags || []).join(', '),
      downloadablePdfName: art.downloadablePdfName || '',
      revisionNotes: art.revisionNotes || '',
    });
    setFormError(null);
    setFormSuccess(null);
    setIsEditorOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.title.trim()) {
      setFormError('Please provide a document title.');
      return;
    }
    if (!formData.summary.trim()) {
      setFormError('Please provide an executive summary for staff quick reference.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Policy content cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      const parsedTags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      if (editingArticle) {
        await updateInfoArticle(editingArticle.id, {
          title: formData.title.trim(),
          category: formData.category,
          summary: formData.summary.trim(),
          content: formData.content.trim(),
          version: formData.version.trim() || '1.0',
          author: formData.author.trim() || 'Human Resources Directorate',
          effectiveDate: formData.effectiveDate,
          tags: parsedTags.length > 0 ? parsedTags : ['PJPIIMC', 'Policy'],
          downloadablePdfName: formData.downloadablePdfName.trim() || undefined,
          revisionNotes: formData.revisionNotes.trim() || 'Updated revision',
          lastUpdated: new Date().toISOString().split('T')[0],
        });
        setFormSuccess('Policy document updated and published to all staff successfully!');
        if (selectedArticle && selectedArticle.id === editingArticle.id) {
          setSelectedArticle({
            ...selectedArticle,
            title: formData.title.trim(),
            category: formData.category,
            summary: formData.summary.trim(),
            content: formData.content.trim(),
            version: formData.version.trim() || '1.0',
            author: formData.author.trim(),
            effectiveDate: formData.effectiveDate,
            tags: parsedTags,
            downloadablePdfName: formData.downloadablePdfName.trim() || undefined,
            revisionNotes: formData.revisionNotes.trim() || undefined,
            lastUpdated: new Date().toISOString().split('T')[0],
          });
        }
      } else {
        await addInfoArticle({
          title: formData.title.trim(),
          category: formData.category,
          summary: formData.summary.trim(),
          content: formData.content.trim(),
          version: formData.version.trim() || '1.0',
          author: formData.author.trim() || 'Human Resources Directorate',
          effectiveDate: formData.effectiveDate,
          tags: parsedTags.length > 0 ? parsedTags : ['PJPIIMC', 'Policy'],
          downloadablePdfName: formData.downloadablePdfName.trim() || undefined,
          revisionNotes: formData.revisionNotes.trim() || 'Initial publication',
          lastUpdated: new Date().toISOString().split('T')[0],
        });
        setFormSuccess('New policy uploaded and published to Info Hub successfully!');
      }

      setTimeout(() => {
        setIsEditorOpen(false);
        setFormSuccess(null);
      }, 900);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save policy document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingArticle) return;
    try {
      await deleteInfoArticle(deletingArticle.id);
      if (selectedArticle && selectedArticle.id === deletingArticle.id) {
        setSelectedArticle(null);
      }
      setDeletingArticle(null);
    } catch (err: any) {
      alert(err.message || 'Failed to archive document.');
    }
  };

  const handleResetBaseline = async () => {
    try {
      await resetInfoArticlesToDefault();
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to reset.');
    }
  };

  const handlePrint = (art: InfoHubArticle) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PJPIIMC Institutional Document - ${art.title}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #0f172a; line-height: 1.6; }
              .header-box { border-bottom: 2px solid #047857; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
              h1 { color: #047857; font-size: 22px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
              h2 { font-size: 17px; color: #1e293b; margin: 6px 0; font-weight: 700; }
              .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 24px; }
              .meta-item strong { display: block; color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
              .summary-box { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0; font-size: 13px; color: #166534; }
              .content-body { font-size: 13px; white-space: pre-line; line-height: 1.8; color: #334155; }
              .footer { margin-top: 50px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: space-between; }
              .badge { display: inline-block; padding: 2px 8px; background: #047857; color: white; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
            </style>
          </head>
          <body>
            <div class="header-box">
              <div>
                <span class="badge">Official Institutional Governance Document</span>
                <h1>Pope John Paul II Medical Centre</h1>
                <h2>${art.title}</h2>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b;">
                <strong>Document ID:</strong> ${art.id}<br/>
                <strong>HR Directorate</strong>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-item">
                <strong>Category</strong>
                <span>${art.category}</span>
              </div>
              <div class="meta-item">
                <strong>Version</strong>
                <span>v${art.version}</span>
              </div>
              <div class="meta-item">
                <strong>Last Revision</strong>
                <span>${art.lastUpdated}</span>
              </div>
              <div class="meta-item">
                <strong>Approving Authority</strong>
                <span>${art.author}</span>
              </div>
            </div>

            <div class="summary-box">
              <strong style="display:block; margin-bottom:4px; font-size:12px; text-transform:uppercase;">Executive Summary</strong>
              ${art.summary}
            </div>

            <div class="content-body">
              ${art.content.replace(/\n/g, '<br/>')}
            </div>

            <div class="footer">
              <span>Pope John Paul II Medical Centre • Jamasi-Ashanti • Hospital HR Governance</span>
              <span>Official Copy • Internal Staff Policy Document</span>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Vision & Mission':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Code of Conduct & Ethics':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Leave Policies':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Study Leave Policies':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Promotion & Demotion':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background hospital seal decoration */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 opacity-10 pointer-events-none">
          <PjpiimcLogo size="2xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-inner">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-400 px-3 py-0.5 text-[10px] font-black uppercase text-slate-950 tracking-wider">
                  PJPIIMC Information Hub
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-200">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Official HR Governance Authority
                </span>
              </div>
              <h2 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
                Policies, Mission, Vision & Ethics Repository
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                The institutional knowledge base of Pope John Paul II Medical Centre. 
                <strong className="text-white ml-1">The Human Resources Directorate is solely responsible for uploading, maintaining, revising, and publishing all policies, vision and mission statements, and codes of conduct.</strong>
              </p>
            </div>
          </div>

          {/* HR Administration Action Corner */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            {isHrAuthorized ? (
              <>
                <button
                  type="button"
                  id="btn-upload-policy-hr"
                  onClick={handleOpenCreateModal}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 px-4 py-3 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Upload Policy / Charter</span>
                </button>
                <button
                  type="button"
                  id="btn-reset-policies-baseline"
                  onClick={() => setIsResetConfirmOpen(true)}
                  title="Restore default hospital charter baseline"
                  className="flex items-center gap-1.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-emerald-200 border border-emerald-500/30 px-3 py-3 text-xs font-bold transition"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Baseline</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded-2xl bg-slate-950/60 border border-emerald-500/20 px-3.5 py-2 text-xs text-emerald-200/90">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>Read & Print Access (HR Governed)</span>
              </div>
            )}
          </div>
        </div>

        {/* HR Sole Responsibility Notification Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-100/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>Authority Notice:</strong> Managed exclusively by the Human Resources Directorate under the oversight of the Hospital Executive Council.
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-semibold text-emerald-300">
            <span>Total Documents: {totalCount}</span>
            <span>•</span>
            <span>Active Charters: {visionCount + ethicsCount}</span>
            <span>•</span>
            <span>HR Leave Guides: {leaveCount}</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-700 dark:bg-slate-950">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            id="input-search-policies"
            placeholder="Search policies by keyword (e.g. Vision, Mission, Ethics, Annual Leave, Study Leave, Demotion, Bonding)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none dark:text-slate-100 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredArticles.length}</strong> of {totalCount} documents
          </span>
        </div>
      </div>

      {/* Category Tabs with live counts */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count =
            cat.id === 'All'
              ? infoArticles.length
              : infoArticles.filter((a) => a.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : cat.color}`} />
              <span>{cat.label}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Policy Articles Cards Grid */}
      {filteredArticles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
            <BookOpen className="h-7 w-7" />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
            No policy documents found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `No policies matched your query "${searchQuery}". Try a different keyword or reset category filter.`
              : 'No documents currently published under this category.'}
          </p>
          {isHrAuthorized && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document for this Category</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 group"
            >
              <div>
                {/* Category & Version Metadata */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`rounded-xl px-3 py-1 text-[10.5px] font-bold border ${getCategoryBadgeClass(
                      article.category
                    )}`}
                  >
                    {article.category}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">
                      v{article.version}
                    </span>
                    <span>•</span>
                    <span>{article.lastUpdated}</span>
                  </div>
                </div>

                {/* Document Title */}
                <h3 className="mt-3.5 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {article.title}
                </h3>

                {/* Executive Summary */}
                <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>

                {/* Document Tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {(article.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <Tag className="h-2.5 w-2.5 opacity-60" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Footer Action Controls */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
                <div className="text-[10px] text-slate-400 font-medium">
                  <span className="block text-slate-500 font-bold uppercase tracking-wider text-[9px]">
                    Approving Authority
                  </span>
                  <span className="text-slate-700 dark:text-slate-300">{article.author}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* HR Exclusive Edit and Delete Controls */}
                  {isHrAuthorized && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(article)}
                        title="HR: Edit / Revise Policy Document"
                        className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingArticle(article)}
                        title="HR: Delete / Archive Policy Document"
                        className="rounded-xl border border-rose-200/50 p-2 text-rose-500 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => handlePrint(article)}
                    title="Print / Export Policy Document"
                    className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition"
                  >
                    <span>Read Policy</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: READ FULL POLICY DOCUMENT */}
      {/* ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800 gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shadow-inner">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[10px] font-bold border ${getCategoryBadgeClass(
                        selectedArticle.category
                      )}`}
                    >
                      {selectedArticle.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      v{selectedArticle.version}
                    </span>
                  </div>
                  <h3 className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {selectedArticle.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isHrAuthorized && (
                  <button
                    type="button"
                    onClick={() => {
                      const art = selectedArticle;
                      setSelectedArticle(null);
                      handleOpenEditModal(art);
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400 dark:hover:bg-slate-700"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit Policy</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handlePrint(selectedArticle)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document Governance Metadata Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Version</span>
                <span className="font-semibold">{selectedArticle.version}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Last Revision</span>
                <span className="font-semibold">{selectedArticle.lastUpdated}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Authority</span>
                <span className="font-semibold truncate block">{selectedArticle.author}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Governance</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">HR Directorate</span>
              </div>
            </div>

            {/* Content Text Body */}
            <div className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-normal">
              {/* Executive Summary Callout */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                  <Info className="h-4 w-4" />
                  <span>Executive Summary</span>
                </div>
                <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  {selectedArticle.summary}
                </p>
              </div>

              {/* Full Content */}
              <div className="p-2 space-y-3 whitespace-pre-line leading-relaxed font-sans">
                {selectedArticle.content}
              </div>

              {/* Tags */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Referenced Tags:</span>
                {(selectedArticle.tags || []).map((t, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">
                Pope John Paul II Medical Centre • Official Hospital HR Document
              </span>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: HR UPLOAD / EDIT POLICY DOCUMENT */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-150 font-sans">
          <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl text-slate-100 max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <FileUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400 block">
                    Human Resources Directorate Exclusive
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {editingArticle ? 'Revise Policy / Governance Charter' : 'Upload New Policy Document'}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Error / Success feedback */}
            {formError && (
              <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Editor Form */}
            <form onSubmit={handleSaveArticle} className="mt-4 flex-1 overflow-y-auto pr-2 space-y-4 text-xs">
              
              {/* Row 1: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Policy Title / Charter Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PJPIIMC Vision, Mission & Principles or Annual Leave Entitlements"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Vision & Mission">Vision & Mission</option>
                    <option value="Code of Conduct & Ethics">Code of Conduct & Ethics</option>
                    <option value="Leave Policies">Leave Policies</option>
                    <option value="Study Leave Policies">Study Leave Policies</option>
                    <option value="Promotion & Demotion">Promotion & Demotion</option>
                    <option value="Hospital Guidelines">Hospital Guidelines</option>
                    <option value="Clinical Protocols">Clinical Protocols</option>
                    <option value="Staff Welfare & Benefits">Staff Welfare & Benefits</option>
                    <option value="Occupational Health & Safety">Occupational Health & Safety</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Executive Summary */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Executive Summary (Short overview shown on policy cards) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide a concise 2-3 sentence overview of this policy or statement..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Row 3: Version, Author, Effective Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Version Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026.1 or 3.0"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Approving Authority
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HR Directorate & Facility Council"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Effective Date
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Row 4: Full Policy Content with Quick Templates */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Full Policy / Charter Content *
                  </label>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <span>Quick Sections:</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          content:
                            formData.content +
                            '\n\n5. DISCIPLINARY SANCTIONS & ENFORCEMENT\nFailure to adhere to these directives constitutes grounds for disciplinary review under PJPIIMC Standing Rules.',
                        })
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300"
                    >
                      + Sanctions Clause
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          content:
                            formData.content +
                            '\n\n6. EXECUTIVE APPROVAL & SIGN-OFF\nApproved by: Rev. Fr. Michael Osei-Tutu (Head of Facility) & Atta Frimpong (HR Directorate)',
                        })
                      }
                      className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300"
                    >
                      + Sign-Off
                    </button>
                  </div>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder="Enter full numbered clauses, principles, and rules..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full rounded-2xl bg-slate-950 border border-slate-800 p-3.5 text-xs text-white font-mono leading-relaxed focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Row 5: Tags & Attachment Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Search Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Leave, Vacation, Sick Leave, Entitlement"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Revision Log / Change Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Updated annual study leave stipend allowance"
                    value={formData.revisionNotes}
                    onChange={(e) => setFormData({ ...formData, revisionNotes: e.target.value })}
                    className="w-full rounded-2xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 px-6 py-2.5 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>{editingArticle ? 'Save Revision & Publish' : 'Upload & Publish Policy'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE / ARCHIVE CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-150 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Archive Policy Document</h3>
                <p className="text-xs text-slate-400">HR Directorate Policy Management</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to archive / delete{' '}
              <strong className="text-white">"{deletingArticle.title}"</strong> ({deletingArticle.category})? 
              This will remove the document from staff view.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingArticle(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 text-xs font-bold transition"
              >
                Confirm Archive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET BASELINE CONFIRMATION */}
      {/* ========================================================================= */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in duration-150 font-sans">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore Baseline Charters</h3>
                <p className="text-xs text-slate-400">Institutional Charter Baseline</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will restore all foundational Pope John Paul II Medical Centre charters, including Vision & Mission statements, Leave Policies, Study Leave Grants, and Code of Professional Ethics to default versions.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetBaseline}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition"
              >
                Restore Baseline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
