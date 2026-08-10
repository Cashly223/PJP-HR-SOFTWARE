import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Heart,
  AlertTriangle,
  FileText,
  Calendar,
  Building2,
  ShieldAlert,
  UserCheck,
  X,
  BellRing,
  Send,
  Eye,
  Lock,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { NoticeBoardPost } from '../../types/hrms';

export const HospitalNoticeBoard: React.FC = () => {
  const { noticePosts, addNoticePost, toggleNoticeLike, acknowledgeNotice, activeRole, currentUser } = useHrms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<NoticeBoardPost | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<NoticeBoardPost['category']>('HR Announcement');
  const [formPriority, setFormPriority] = useState<NoticeBoardPost['priority']>('Normal');
  const [formTargetDept, setFormTargetDept] = useState('All Departments');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [formContent, setFormContent] = useState('');

  // Check authorization: ONLY Head of Facility and HR can post
  const canPostNotices = ['facility_head', 'super_admin', 'hr_director', 'hr_manager'].includes(activeRole);

  const currentEmpName = currentUser?.name || 'Staff Member';
  const currentEmpId = currentUser?.id || 'emp-current';

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPostNotices) return;

    if (!formTitle.trim() || !formContent.trim()) return;

    let roleDisplay = 'HR Management';
    if (activeRole === 'facility_head' || activeRole === 'super_admin') {
      roleDisplay = 'Head of Facility / CMO';
    } else if (activeRole === 'hr_director') {
      roleDisplay = 'HR Director';
    } else if (activeRole === 'hr_manager') {
      roleDisplay = 'HR Manager';
    }

    addNoticePost({
      title: formTitle,
      content: formContent,
      authorId: currentEmpId,
      authorName: currentEmpName,
      authorRole: roleDisplay,
      category: formCategory,
      priority: formPriority,
      targetDepartment: formTargetDept,
      isPinned: formIsPinned,
      postedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      likesCount: 0,
      likedBy: [],
      acknowledgements: [],
    });

    // Reset form
    setFormTitle('');
    setFormContent('');
    setFormIsPinned(false);
    setIsComposeOpen(false);
  };

  const filteredPosts = noticePosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const pinnedPosts = filteredPosts.filter((p) => p.isPinned);
  const regularPosts = filteredPosts.filter((p) => !p.isPinned);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Hospital Official Notice Board
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official announcements, policy updates, and executive communications for Pope John Paul II Medical Centre.
          </p>
        </div>

        {/* Action Button: Post Notice (Role Restricted) */}
        <div className="flex items-center gap-2">
          {canPostNotices ? (
            <button
              onClick={() => setIsComposeOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Post Official Notice
            </button>
          ) : (
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Posting restricted to Head of Facility & HR</span>
            </div>
          )}
        </div>
      </div>

      {/* Access Privilege Notice Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <BellRing className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Notice Board Authority Protocol</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Verified System Rule
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Only Head of Facility and HR Management hold broadcast posting rights. All medical and administrative staff can review and record acknowledgements.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <UserCheck className="h-4 w-4 text-emerald-600" />
          <span>Active Staff Member: <strong>{currentEmpName}</strong></span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search announcements by title, content, or executive author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 focus:outline-none dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            <option value="Urgent Alert">Urgent Alert</option>
            <option value="Clinical Policy">Clinical Policy</option>
            <option value="HR Announcement">HR Announcement</option>
            <option value="Hospital Event">Hospital Event</option>
            <option value="General Notice">General Notice</option>
          </select>
        </div>
      </div>

      {/* PINNED ANNOUNCEMENTS */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Pin className="h-4 w-4 fill-current" />
            <span>Pinned Executive Announcements ({pinnedPosts.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {pinnedPosts.map((post) => {
              const isAcknowledged = post.acknowledgements.includes(currentEmpName) || post.acknowledgements.includes(currentEmpId);
              const isLiked = post.likedBy.includes(currentEmpId) || post.likedBy.includes(currentEmpName);

              return (
                <div
                  key={post.id}
                  className="relative rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-50/50 via-white to-amber-50/20 p-5 shadow-sm dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 dark:border-amber-500/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          <Pin className="h-3 w-3 fill-current" /> PINNED
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            post.category === 'Urgent Alert'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : post.category === 'Clinical Policy'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {post.category}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Target: {post.targetDepartment}
                        </span>
                      </div>

                      <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">
                        {post.title}
                      </h3>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>
                  </div>

                  {/* Author & Footer Controls */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 pt-3 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{post.authorName}</div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{post.authorRole} • {post.postedAt}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNoticeLike(post.id, currentEmpId)}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isLiked
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
                        <span>{post.likesCount} Likes</span>
                      </button>

                      <button
                        onClick={() => acknowledgeNotice(post.id, currentEmpName)}
                        className={`flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                          isAcknowledged
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-emerald-600 text-white hover:bg-emerald-500'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge Receipt'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REGULAR ANNOUNCEMENTS */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          All Notice Announcements ({regularPosts.length})
        </div>

        {regularPosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <Megaphone className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-medium text-slate-500">No notices found matching query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {regularPosts.map((post) => {
              const isAcknowledged = post.acknowledgements.includes(currentEmpName) || post.acknowledgements.includes(currentEmpId);
              const isLiked = post.likedBy.includes(currentEmpId) || post.likedBy.includes(currentEmpName);

              return (
                <div
                  key={post.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                          post.category === 'Urgent Alert'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : post.category === 'Clinical Policy'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {post.category}
                      </span>
                      {post.priority === 'High' && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="h-3 w-3" /> High Priority
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-medium">
                        Dept: {post.targetDepartment}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">{post.postedAt}</span>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
                    {post.title}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-white">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{post.authorName}</div>
                        <div className="text-[10px] text-slate-400">{post.authorRole}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleNoticeLike(post.id, currentEmpId)}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isLiked
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-current text-rose-600' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      <button
                        onClick={() => acknowledgeNotice(post.id, currentEmpName)}
                        className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                          isAcknowledged
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>{isAcknowledged ? 'Acknowledged' : 'Acknowledge'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: COMPOSE NEW NOTICE (HEAD OF FACILITY & HR ONLY) */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsComposeOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Publish Hospital Official Notice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Broadcast by: <strong>{currentEmpName}</strong> ({activeRole.replace('_', ' ').toUpperCase()})
                </p>
              </div>
            </div>

            <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Headline / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Mandatory Clinical Protocol Update regarding ICU Disinfection Rules"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notice Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NoticeBoardPost['category'])}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="HR Announcement">HR Announcement</option>
                    <option value="Clinical Policy">Clinical Policy</option>
                    <option value="Urgent Alert">Urgent Alert</option>
                    <option value="Hospital Event">Hospital Event</option>
                    <option value="General Notice">General Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as NoticeBoardPost['priority'])}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="Normal">Normal Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Department
                  </label>
                  <select
                    value={formTargetDept}
                    onChange={(e) => setFormTargetDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Clinical Services">Clinical Services</option>
                    <option value="Nursing & Wards">Nursing & Wards</option>
                    <option value="Pharmacy & Lab">Pharmacy & Lab</option>
                    <option value="Administration">Administration</option>
                  </select>
                </div>
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="pinToggle" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                  <Pin className="h-3.5 w-3.5 text-amber-500 fill-current" />
                  Pin this notice to top of Hospital Notice Board
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notice Details / Announcement Message
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter complete notice text, instructions, and compliance expectations..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500"
                >
                  <Send className="h-4 w-4" />
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
