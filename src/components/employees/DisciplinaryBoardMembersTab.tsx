import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  Award,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit2,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { DisciplinaryBoardMember, BoardRole } from '../../types/hrms';

interface DisciplinaryBoardMembersTabProps {
  onOpenAddMemberModal: () => void;
  isHRorAdmin: boolean;
}

export const DisciplinaryBoardMembersTab: React.FC<DisciplinaryBoardMembersTabProps> = ({
  onOpenAddMemberModal,
  isHRorAdmin,
}) => {
  const { disciplinaryBoardMembers, removeDisciplinaryBoardMember, updateDisciplinaryBoardMember } = useHrms();
  const [filterRole, setFilterRole] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const rolesList: string[] = [
    'All',
    'Chairman',
    'Secretary',
    'Legal & Ethics Advisor',
    'Clinical Director Representative',
    'Nursing Directorate Representative',
    'Staff Representative',
    'HR Representative',
    'Member',
  ];

  const filteredMembers = disciplinaryBoardMembers.filter((m) => {
    const matchesRole = filterRole === 'All' || m.boardRole === filterRole;
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.boardRole.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const chairman = disciplinaryBoardMembers.find((m) => m.boardRole === 'Chairman');
  const secretary = disciplinaryBoardMembers.find((m) => m.boardRole === 'Secretary');
  const legalAdvisor = disciplinaryBoardMembers.find((m) => m.boardRole === 'Legal & Ethics Advisor');
  const staffRep = disciplinaryBoardMembers.find((m) => m.boardRole === 'Staff Representative');
  const hasQuorum = Boolean(chairman && secretary && legalAdvisor && staffRep);

  const getRoleBadgeColor = (role: BoardRole) => {
    switch (role) {
      case 'Chairman':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Secretary':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Legal & Ethics Advisor':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Clinical Director Representative':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Nursing Directorate Representative':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Staff Representative':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Statutory Quorum Alert Banner */}
      <div
        className={`rounded-2xl p-4.5 border transition-all ${
          hasQuorum
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
            : 'bg-amber-950/25 border-amber-800/40 text-amber-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                hasQuorum ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {hasQuorum ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base text-white">
                  {hasQuorum ? 'Disciplinary Tribunal Quorum Constitution: Valid' : 'Tribunal Quorum Advisory'}
                </h4>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    hasQuorum
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {hasQuorum ? 'Full Statutory Quorum' : 'Incomplete Panel'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Ghana Labour Act 651 & JCI Hospital Ethics requires representation by Executive Chair, HR Secretary,
                Legal Advisor, and Staff Welfare Rep.
              </p>
            </div>
          </div>

          {isHRorAdmin && (
            <button
              onClick={onOpenAddMemberModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md hover:shadow-lg transition shrink-0"
            >
              <Plus className="h-4 w-4" />
              Appoint Board Member
            </button>
          )}
        </div>

        {/* Panel Constitution Chips */}
        <div className="mt-3 pt-3 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className={`h-3.5 w-3.5 ${chairman ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Chair: <strong>{chairman ? chairman.name : 'Unassigned'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className={`h-3.5 w-3.5 ${secretary ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Sec: <strong>{secretary ? secretary.name : 'Unassigned'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className={`h-3.5 w-3.5 ${legalAdvisor ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Legal: <strong>{legalAdvisor ? legalAdvisor.name : 'Unassigned'}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className={`h-3.5 w-3.5 ${staffRep ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Staff Rep: <strong>{staffRep ? staffRep.name : 'Unassigned'}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {rolesList.map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                filterRole === r
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by name, department, title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
        />
      </div>

      {/* Board Members Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={member.name}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm leading-snug">{member.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{member.designation}</p>
                    <p className="text-[11px] text-emerald-400 font-medium">{member.department}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                    member.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600'
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Board Portfolio:</span>
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getRoleBadgeColor(member.boardRole)}`}>
                    {member.boardRole}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Voting Authority:</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-200">
                    <CheckSquare className={`h-3.5 w-3.5 ${member.votingRights ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {member.votingRights ? 'Full Voting Member' : 'Ex-Officio / Advisory'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    Tenure:
                  </span>
                  <span className="text-slate-300 font-medium">
                    {member.tenureStartDate} {member.tenureEndDate ? `to ${member.tenureEndDate}` : '(Indefinite)'}
                  </span>
                </div>

                {member.appointmentNotes && (
                  <p className="text-xs bg-slate-800/50 p-2.5 rounded-xl text-slate-300 italic border border-slate-800">
                    "{member.appointmentNotes}"
                  </p>
                )}

                <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </span>
                  {member.phone && (
                    <span className="flex items-center gap-1 shrink-0">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      {member.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isHRorAdmin && (
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">Appointed by: {member.appointedBy || 'Hospital Board'}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const newStatus = member.status === 'Active' ? 'Inactive' : 'Active';
                      updateDisciplinaryBoardMember(member.id, { status: newStatus });
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs"
                    title="Toggle Active Status"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${member.name} from the Disciplinary Board?`)) {
                        removeDisciplinaryBoardMember(member.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition text-xs"
                    title="Remove Member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
