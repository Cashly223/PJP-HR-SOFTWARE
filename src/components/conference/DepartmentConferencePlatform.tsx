import React, { useState } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  Users,
  Hand,
  ShieldCheck,
  Plus,
  Play,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Search,
  Download,
  Copy,
  Check,
  Radio,
  FileText,
  Sparkles,
  Lock,
  X,
  Volume2,
  Maximize2,
  Send,
  Sliders,
  Share2,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { DepartmentConferenceMeeting, ConferenceParticipant } from '../../types/hrms';

export const DepartmentConferencePlatform: React.FC = () => {
  const {
    conferenceMeetings,
    addConferenceMeeting,
    addConferenceChatMessage,
    selectedHospital,
    employees,
  } = useHrms();

  // Active View State: 'hub' (list & scheduler) | 'live_room' (in video call)
  const [viewMode, setViewMode] = useState<'hub' | 'live_room'>('hub');
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>('conf-101');

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // In-Call Live Room States
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(true);
  const [activeSidePanel, setActiveSidePanel] = useState<'chat' | 'participants' | null>('chat');
  const [chatInputText, setChatInputText] = useState<string>('');
  const [isClinicalAlertInput, setIsClinicalAlertInput] = useState<boolean>(false);

  // New Meeting Form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDepartment, setNewDepartment] = useState<string>('Intensive Care Unit (ICU)');
  const [newUnit, setNewUnit] = useState<string>('ICU Critical Care Ward');
  const [newMeetingType, setNewMeetingType] = useState<'Audio & Video Conference' | 'Voice Huddle' | 'Clinical Grand Rounds'>('Audio & Video Conference');
  const [newHostName, setNewHostName] = useState<string>('Dr. Kwame Mensah');
  const [newHostRole, setNewHostRole] = useState<string>('Head of ICU & Critical Care');
  const [newAgenda, setNewAgenda] = useState<string>('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [isInstantStart, setIsInstantStart] = useState<boolean>(true);

  // Department List
  const hospitalDepartments = [
    'Intensive Care Unit (ICU)',
    'Emergency & Trauma Dept',
    'Surgical Operating Theater',
    'Pediatrics & Neonatal Unit',
    'Pharmacy & Dispensary',
    'Radiology & Imaging',
    'Outpatient Dept (OPD)',
    'Obstetrics & Gynecology',
  ];

  // Active meeting object
  const currentLiveMeeting = (conferenceMeetings || []).find((m) => m && m.id === activeMeetingId) || (conferenceMeetings || [])[0];

  // Stats
  const safeMeetings = (conferenceMeetings || []).filter(Boolean);
  const totalMeetings = safeMeetings.length;
  const liveCount = safeMeetings.filter((m) => m?.status === 'Live Now').length;
  const scheduledCount = safeMeetings.filter((m) => m?.status === 'Scheduled').length;
  const completedCount = safeMeetings.filter((m) => m?.status === 'Completed').length;

  // Filtered List
  const filteredMeetings = safeMeetings.filter((m) => {
    if (!m) return false;
    const matchesDept = departmentFilter === 'All' || m.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    const matchesSearch =
      (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.hostName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.meetingCode || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesSearch;
  });

  const handleCopyMeetingLink = (meeting: DepartmentConferenceMeeting) => {
    navigator.clipboard.writeText(`https://aurahr.health/meet/${meeting.meetingCode}?pass=${meeting.passcode}`);
    setCopiedCodeId(meeting.id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addConferenceMeeting({
      title: newTitle || `${newDepartment} Clinical Conference`,
      department: newDepartment,
      unit: newUnit,
      meetingType: newMeetingType,
      hostName: newHostName,
      hostRole: newHostRole,
      durationMinutes: newDuration,
      agenda: newAgenda || 'Unit shift handover and patient review.',
      status: isInstantStart ? 'Live Now' : 'Scheduled',
    });

    setIsScheduleModalOpen(false);
    // If instant, automatically jump into room
    if (isInstantStart) {
      setActiveMeetingId(conferenceMeetings[0]?.id || 'conf-101');
      setViewMode('live_room');
    }
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || !activeMeetingId) return;

    addConferenceChatMessage(activeMeetingId, chatInputText, isClinicalAlertInput);
    setChatInputText('');
    setIsClinicalAlertInput(false);
  };

  const handleJoinMeeting = (meeting: DepartmentConferenceMeeting) => {
    setActiveMeetingId(meeting.id);
    setViewMode('live_room');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 p-6 border border-slate-800 shadow-2xl text-white">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Departmental & Unit Tele-Conference Platform
              </h2>
              <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" /> Audio & Video Live
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Encrypted virtual conferencing platform for clinical handovers, inter-departmental consultations, shift briefings, and unit meetings across {selectedHospital.name}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setViewMode('hub');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'hub'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calendar className="h-4 w-4" /> Conference Hub
          </button>

          {currentLiveMeeting && (
            <button
              onClick={() => setViewMode('live_room')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewMode === 'live_room'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900'
              }`}
            >
              <Radio className="h-4 w-4 text-emerald-400 animate-pulse" /> Live Call Stage ({currentLiveMeeting.participants.length})
            </button>
          )}

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4" /> Start / Schedule Call
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: CONFERENCE HUB & SCHEDULE LIST */}
      {viewMode === 'hub' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Active Live Calls</span>
                <Radio className="h-4 w-4 text-emerald-400 animate-pulse" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-emerald-400">{liveCount}</div>
              <p className="mt-1 text-[11px] text-emerald-300/80">In-progress clinical huddles</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Scheduled Conferences</span>
                <Clock className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-indigo-300">{scheduledCount}</div>
              <p className="mt-1 text-[11px] text-indigo-300/80">Upcoming unit meetings</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Completed Conferences</span>
                <CheckCircle2 className="h-4 w-4 text-teal-400" />
              </div>
              <div className="mt-2 text-3xl font-extrabold text-slate-200">{completedCount}</div>
              <p className="mt-1 text-[11px] text-slate-400">With saved clinical minutes</p>
            </div>

            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
                <span>Encryption & Security</span>
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-sm font-bold text-white flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-emerald-400" /> WebRTC TLS 256
              </div>
              <p className="mt-1 text-[11px] text-slate-400">HIPAA compliant audio/video</p>
            </div>
          </div>

          {/* Quick Launch Instant Meeting Banner */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Instant Unit Huddle Quick Launcher</h3>
                <p className="text-xs text-slate-400">Start an instant video conference for emergency handovers or doctor consultations</p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  setIsInstantStart(true);
                  setIsScheduleModalOpen(true);
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow"
              >
                Launch Instant Conference
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['All', 'Live Now', 'Scheduled', 'Completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search meeting title or host..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full sm:w-auto rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="All">All Departments</option>
                {hospitalDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Meetings Grid / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMeetings.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center text-slate-500">
                No conference meetings match the selected criteria.
              </div>
            ) : (
              filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className={`rounded-2xl border p-5 transition flex flex-col justify-between space-y-4 shadow-sm ${
                    meeting.status === 'Live Now'
                      ? 'bg-slate-900 border-emerald-500/50 shadow-emerald-950/20'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          meeting.status === 'Live Now'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : meeting.status === 'Scheduled'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {meeting.status === 'Live Now' && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                        {meeting.status}
                      </span>

                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        Room: {meeting.meetingCode}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-indigo-400" /> {meeting.title}
                      </h4>
                      <p className="text-xs text-indigo-300/80 mt-0.5 font-medium">
                        {meeting.department} — {meeting.unit}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 line-clamp-2">
                      <strong className="text-slate-300">Agenda:</strong> {meeting.agenda}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Host Clinician</span>
                        <p className="font-semibold text-slate-200">{meeting.hostName}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Meeting Type</span>
                        <p className="font-semibold text-slate-200">{meeting.meetingType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>{meeting.participantsCount || meeting.participants.length} Joined</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyMeetingLink(meeting)}
                        className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white transition"
                        title="Copy Invitation Link"
                      >
                        {copiedCodeId === meeting.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>

                      {meeting.status === 'Live Now' ? (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
                        >
                          <Video className="h-3.5 w-3.5" /> Join Live Room
                        </button>
                      ) : (
                        <button
                          onClick={() => handleJoinMeeting(meeting)}
                          className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-500 transition shadow flex items-center gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5" /> Start Meeting Stage
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE LIVE VIDEO & AUDIO CONFERENCE ROOM */}
      {viewMode === 'live_room' && currentLiveMeeting && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl space-y-4">
          {/* Top Stage Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{currentLiveMeeting.title}</h3>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Live WebRTC Audio & Video
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {currentLiveMeeting.department} ({currentLiveMeeting.unit}) — Hosted by {currentLiveMeeting.hostName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isRecording && (
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" /> REC (HIPAA Secure)
                </span>
              )}

              <button
                onClick={() => setViewMode('hub')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Back to Hub
              </button>
            </div>
          </div>

          {/* Main Stage Grid & Sidebar Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Video Stage Grid (Left 3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {/* Screen Share View Mode or Video Participant Grid */}
              {isScreenSharing ? (
                <div className="relative rounded-2xl bg-slate-900 border-2 border-indigo-500 p-6 flex flex-col items-center justify-center min-h-[420px] text-center">
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Monitor className="h-3.5 w-3.5" /> Screen Sharing Active: EHR Patient Ventilator Telemetry & Duty Schedule
                  </div>

                  <div className="w-full bg-slate-950 p-6 rounded-xl border border-slate-800 text-left space-y-4 font-mono text-xs">
                    <div className="flex justify-between text-indigo-400 border-b border-slate-800 pb-2">
                      <span>[LIVE CLINICAL DISPLAY] AuraHR Med Sync v4.2</span>
                      <span>PATIENT ID: ICU-90218-A</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-slate-300">
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500">Heart Rate (ECG)</span>
                        <p className="text-xl font-bold text-emerald-400">78 BPM</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500">SpO2 Oxygen Saturation</span>
                        <p className="text-xl font-bold text-teal-400">98.4%</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500">Ventilator Pressure</span>
                        <p className="text-xl font-bold text-amber-400">14 mmHg</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-400">
                      <strong>Duty Roster Staffing Note:</strong> Locum Nurse Elena Rostova assigned to Bay A 23:00 - 07:00 shift.
                    </div>
                  </div>
                </div>
              ) : (
                /* Participant Video Stream Tiles */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 min-h-[420px]">
                  {/* LOCAL USER STREAM TILE */}
                  <div
                    className={`relative rounded-2xl overflow-hidden bg-slate-900 border-2 transition flex flex-col justify-between p-4 min-h-[190px] shadow-lg ${
                      !isMicMuted ? 'border-emerald-500/70 shadow-emerald-950/40' : 'border-slate-800'
                    }`}
                  >
                    {/* Top Overlay Badge */}
                    <div className="flex justify-between items-start z-10">
                      <span className="bg-slate-950/80 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                        You (Local Stream)
                      </span>

                      <div className="flex gap-1.5">
                        {isHandRaised && (
                          <span className="bg-amber-500 text-slate-950 p-1 rounded-md animate-bounce">
                            <Hand className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <span
                          className={`p-1 rounded-md text-white text-xs ${
                            isMicMuted ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}
                        >
                          {isMicMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                        </span>
                      </div>
                    </div>

                    {/* Stream Content */}
                    {isVideoOn ? (
                      <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/60 flex items-center justify-center">
                        <div className="text-center">
                          <div className="h-16 w-16 mx-auto rounded-full bg-indigo-600/30 text-indigo-300 border-2 border-indigo-400 flex items-center justify-center text-xl font-bold">
                            YOU
                          </div>
                          <span className="mt-2 block text-xs font-medium text-emerald-400 animate-pulse">
                            Live Video Stream ON
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <VideoOff className="h-8 w-8 text-slate-600" />
                        <span className="text-xs">Camera Turned Off</span>
                      </div>
                    )}

                    {/* Bottom Label */}
                    <div className="z-10 mt-auto flex items-center justify-between text-xs text-slate-200 bg-slate-950/90 p-2 rounded-xl backdrop-blur">
                      <span className="font-bold truncate">{currentLiveMeeting.hostName}</span>
                      <span className="text-[9px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                        Host
                      </span>
                    </div>
                  </div>

                  {/* OTHER PARTICIPANTS TILES */}
                  {currentLiveMeeting.participants.map((p) => (
                    <div
                      key={p.id}
                      className={`relative rounded-2xl overflow-hidden bg-slate-900 border-2 transition flex flex-col justify-between p-4 min-h-[190px] shadow-sm ${
                        p.isSpeaking ? 'border-emerald-500 shadow-emerald-950/30' : 'border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start z-10">
                        <span className="bg-slate-950/80 text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-800">
                          {p.department}
                        </span>

                        <div className="flex gap-1.5">
                          {p.isHandRaised && (
                            <span className="bg-amber-500 text-slate-950 p-1 rounded-md animate-bounce">
                              <Hand className="h-3.5 w-3.5" />
                            </span>
                          )}
                          <span
                            className={`p-1 rounded-md text-white text-xs ${
                              p.isMuted ? 'bg-rose-600/80' : 'bg-emerald-600/80'
                            }`}
                          >
                            {p.isMuted ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                          </span>
                        </div>
                      </div>

                      {p.isVideoOn ? (
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center">
                          <div className="text-center">
                            <div className="h-16 w-16 mx-auto rounded-full bg-slate-800 text-teal-300 border border-slate-700 flex items-center justify-center text-lg font-bold shadow">
                              {p.name.split(' ').map((n) => n[0]).join('')}
                            </div>
                            {p.isSpeaking && (
                              <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <Volume2 className="h-3 w-3 animate-pulse" /> Speaking...
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-slate-600 space-y-1">
                          <VideoOff className="h-7 w-7 text-slate-700" />
                          <span className="text-[10px]">Video Paused</span>
                        </div>
                      )}

                      <div className="z-10 mt-auto flex items-center justify-between text-xs text-slate-200 bg-slate-950/90 p-2 rounded-xl backdrop-blur">
                        <div className="truncate">
                          <span className="font-bold truncate block text-slate-200">{p.name}</span>
                          <span className="text-[9px] text-slate-400 truncate block">{p.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Interactive Conference Controls Bar */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 ${
                      isMicMuted
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-slate-800 text-emerald-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isMicMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
                  </button>

                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 ${
                      !isVideoOn
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                        : 'bg-slate-800 text-teal-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {!isVideoOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                    <span>{isVideoOn ? 'Cam On' : 'Cam Off'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 ${
                      isScreenSharing
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Monitor className="h-5 w-5" />
                    <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
                  </button>

                  <button
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className={`p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 ${
                      isHandRaised
                        ? 'bg-amber-500 text-slate-950 shadow-lg'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <Hand className="h-5 w-5" />
                    <span>{isHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveSidePanel(activeSidePanel === 'chat' ? null : 'chat')
                    }
                    className={`p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 ${
                      activeSidePanel === 'chat'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Chat Notes</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveSidePanel(activeSidePanel === 'participants' ? null : 'participants')
                    }
                    className={`p-3 rounded-2xl font-bold text-xs transition flex items-center gap-1.5 ${
                      activeSidePanel === 'participants'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Participants ({currentLiveMeeting.participants.length})</span>
                  </button>
                </div>

                <div>
                  <button
                    onClick={() => setViewMode('hub')}
                    className="p-3 px-5 rounded-2xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition shadow-lg shadow-rose-950/60 flex items-center gap-2"
                  >
                    <PhoneOff className="h-5 w-5" /> Leave Meeting
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Chat / Clinical Notes & Roster Panel */}
            <div className="lg:col-span-1 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex flex-col justify-between min-h-[480px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveSidePanel('chat')}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                        activeSidePanel === 'chat'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Live Chat
                    </button>
                    <button
                      onClick={() => setActiveSidePanel('participants')}
                      className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                        activeSidePanel === 'participants'
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Roster ({currentLiveMeeting.participants.length})
                    </button>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" /> Secure
                  </span>
                </div>

                {/* SIDEBAR CONTENT 1: LIVE CHAT */}
                {activeSidePanel === 'chat' && (
                  <div className="space-y-3">
                    <div className="max-h-[340px] overflow-y-auto space-y-2.5 pr-1 text-xs">
                      {(currentLiveMeeting.chatMessages || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2.5 rounded-xl border ${
                            msg.isClinicalAlert
                              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
                              : 'bg-slate-950 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="font-bold text-indigo-300">{msg.senderName}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SIDEBAR CONTENT 2: PARTICIPANT ROSTER */}
                {activeSidePanel === 'participants' && (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto text-xs">
                    {currentLiveMeeting.participants.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-bold text-white">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.role}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`p-1 rounded text-white ${
                              p.isMuted ? 'bg-rose-600/80' : 'bg-emerald-600/80'
                            }`}
                          >
                            {p.isMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input Area */}
              {activeSidePanel === 'chat' && (
                <form onSubmit={handleSendChatMessage} className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] text-slate-400 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isClinicalAlertInput}
                        onChange={(e) => setIsClinicalAlertInput(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-rose-500"
                      />
                      <span className={isClinicalAlertInput ? 'text-rose-400 font-bold' : ''}>
                        Clinical Urgent Alert
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type clinical note or chat..."
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / SCHEDULE NEW UNIT CONFERENCE */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Start or Schedule Departmental Conference
                </h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-lg bg-slate-800 p-1.5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Conference Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ICU Morning Clinical Handover & Case Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {hospitalDepartments.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit / Ward Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ICU Bay A & B"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Conference Type</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Audio & Video Conference">Audio & Video Conference</option>
                    <option value="Voice Huddle">Voice Huddle (Audio Only)</option>
                    <option value="Clinical Grand Rounds">Clinical Grand Rounds (Broadcast)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Planned Duration (Minutes)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value) || 30)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Clinician Name</label>
                  <input
                    type="text"
                    required
                    value={newHostName}
                    onChange={(e) => setNewHostName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Host Role / Title</label>
                  <input
                    type="text"
                    value={newHostRole}
                    onChange={(e) => setNewHostRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Meeting Agenda & Clinical Notes</label>
                <textarea
                  rows={3}
                  value={newAgenda}
                  onChange={(e) => setNewAgenda(e.target.value)}
                  placeholder="e.g. Discuss patient ventilator handovers and upcoming weekend shift duty rosters..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Launch Mode</span>
                  <span className="text-[10px] text-slate-400">
                    {isInstantStart ? 'Start meeting immediately now' : 'Schedule for later in the calendar'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsInstantStart(!isInstantStart)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isInstantStart
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {isInstantStart ? 'Instant Now' : 'Schedule Later'}
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-950/40"
                >
                  {isInstantStart ? 'Launch Live Meeting' : 'Schedule Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
