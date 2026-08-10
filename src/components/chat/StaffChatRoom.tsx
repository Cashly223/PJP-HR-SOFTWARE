import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Users,
  Hash,
  Smile,
  Paperclip,
  CheckCheck,
  Search,
  Sparkles,
  PhoneCall,
  Shield,
  Circle,
  Clock,
  Pin,
  Flame,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { ChatMessage, ChatChannel } from '../../types/hrms';

export const StaffChatRoom: React.FC = () => {
  const { chatMessages, addChatMessage, employees, currentUser, activeRole } = useHrms();

  const [activeChannelId, setActiveChannelId] = useState<string>('general');
  const [inputText, setInputText] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  const channels: ChatChannel[] = [
    { id: 'general', name: 'general-lounge', description: 'All Staff General Discussions & Hospital Community' },
    { id: 'clinical', name: 'clinical-handover', description: 'Doctors, RNs & Technicians Shift & Duty Notes' },
    { id: 'canteen', name: 'canteen-social', description: 'Hospital Canteen, Social Events & Birthday Greetings' },
    { id: 'announcements', name: 'hospital-announcements', description: 'Executive Updates & Live Q&A' },
  ];

  const currentEmpName = currentUser?.name || 'Staff Member';
  const currentEmpDept = currentUser?.department || 'Clinical Services';
  const currentEmpId = currentUser?.id || 'emp-current';

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

  const channelMessages = chatMessages.filter((m) => m.channelId === activeChannelId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    let roleDisplay = activeRole.replace('_', ' ').toUpperCase();
    if (activeRole === 'facility_head') roleDisplay = 'Head of Facility';
    if (activeRole === 'doctor') roleDisplay = 'Attending Physician';
    if (activeRole === 'nurse') roleDisplay = 'Registered Nurse';

    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      channelId: activeChannelId,
      senderId: currentEmpId,
      senderName: currentEmpName,
      senderRole: roleDisplay,
      senderDepartment: currentEmpDept,
      senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      content: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addChatMessage(newMsg);
    setInputText('');
  };

  const filteredEmployees = employees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(staffSearch.toLowerCase()) ||
      e.department.toLowerCase().includes(staffSearch.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(staffSearch.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-140px)] flex-col lg:flex-row rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* LEFT SIDEBAR: CHANNELS LIST */}
      <div className="w-full lg:w-64 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm px-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Staff Chat Rooms</span>
          </div>

          {/* Channels Header */}
          <div className="mt-4 space-y-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Text Channels
            </div>

            {channels.map((ch) => {
              const isActive = ch.id === activeChannelId;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Hash className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{ch.name}</span>
                  </div>
                  {isActive && <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current User Chat Badge */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 mt-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
                alt={currentEmpName}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-500"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{currentEmpName}</div>
              <div className="text-[10px] text-emerald-600 font-medium truncate">{currentEmpDept}</div>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE: CHAT MESSAGES STAGE */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
        {/* Channel Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                #{activeChannel.name}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeChannel.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Hospital Encrypted Network</span>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {channelMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 space-y-2">
              <MessageSquare className="h-10 w-10 text-slate-300" />
              <p className="text-xs font-semibold">Welcome to #{activeChannel.name}!</p>
              <p className="text-[11px]">Be the first staff member to post a message in this channel.</p>
            </div>
          ) : (
            channelMessages.map((msg) => {
              const isSelf = msg.senderId === currentEmpId || msg.senderName === currentEmpName;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}
                >
                  <img
                    src={msg.senderAvatar || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'}
                    alt={msg.senderName}
                    className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-slate-300 dark:ring-slate-700"
                  />

                  <div className={`max-w-[75%] ${isSelf ? 'items-end text-right' : ''}`}>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{msg.senderName}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {msg.senderDepartment}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm ${
                        isSelf
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Send Input Form */}
        <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
            <input
              type="text"
              placeholder={`Message #${activeChannel.name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent px-3 text-xs text-slate-900 focus:outline-none dark:text-slate-100"
            />
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SIDEBAR: ONLINE STAFF DIRECTORY */}
      <div className="w-full lg:w-64 border-l border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 p-4 hidden md:flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-600" /> Staff Directory
          </span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {employees.length} Members
          </span>
        </div>

        {/* Staff Search */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Search staff..."
            value={staffSearch}
            onChange={(e) => setStaffSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Staff Members List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center gap-2.5 rounded-xl bg-white p-2 border border-slate-200/80 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative">
                <img
                  src={emp.photo}
                  alt={emp.firstName}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white"></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {emp.firstName} {emp.lastName}
                </div>
                <div className="text-[9px] text-slate-400 truncate">{emp.jobTitle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
