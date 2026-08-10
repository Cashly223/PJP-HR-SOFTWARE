import React, { useState } from 'react';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  Play,
  X,
  UserCheck,
  QrCode,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileSpreadsheet,
  Plus,
  Fingerprint,
  Check,
  UserX,
  AlertCircle,
  FileCheck,
  Radio,
  Video,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import { TrainingCourse, TrainingAttendanceRecord } from '../../types/hrms';

export const LearningHub: React.FC = () => {
  const {
    courses,
    trainingAttendance,
    markTrainingAttendance,
    updateTrainingAttendanceStatus,
    employees,
    currentUser,
    activeRole,
  } = useHrms();

  const [activeTab, setActiveTab] = useState<'catalog' | 'attendance' | 'kiosk'>('catalog');
  const [selectedCert, setSelectedCert] = useState<TrainingCourse | null>(null);

  // Joined Live Session State
  const [joinedSessionCourse, setJoinedSessionCourse] = useState<TrainingCourse | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Kwesi Mensah (Instructor)', text: 'Welcome team! Please submit your Q&A questions here during the presentation.', time: '09:05 AM' },
    { sender: 'Elena Rostova (RN)', text: 'Is the updated 2026 ICU hygiene checklist available in the downloads section?', time: '09:12 AM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Filters for Attendance Tab
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Selected course for dedicated roll call view / modal
  const [rollCallCourse, setRollCallCourse] = useState<TrainingCourse | null>(null);

  // New Attendance Record Form Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [formCourseId, setFormCourseId] = useState(courses[0]?.id || 'crs-1');
  const [formEmpId, setFormEmpId] = useState(employees[0]?.id || 'emp-101');
  const [formStatus, setFormStatus] = useState<TrainingAttendanceRecord['status']>('Present');
  const [formMethod, setFormMethod] = useState<TrainingAttendanceRecord['verificationMethod']>('Digital Roll-call');
  const [formCheckIn, setFormCheckIn] = useState('09:00 AM');
  const [formVerifier, setFormVerifier] = useState(currentUser?.name || 'Lead Instructor');

  // Kiosk / Quick Check In State
  const [kioskEmpCode, setKioskEmpCode] = useState('');
  const [kioskSelectedCourseId, setKioskSelectedCourseId] = useState(courses[0]?.id || 'crs-1');
  const [kioskSuccessMsg, setKioskSuccessMsg] = useState('');

  const isInstructorOrAdmin = [
    'super_admin',
    'facility_head',
    'hr_director',
    'hr_manager',
    'dept_head',
    'unit_head',
  ].includes(activeRole);

  const currentEmpName = currentUser?.name || 'Staff Member';
  const currentEmpEmail = currentUser?.email || '';

  // Helper: check if logged-in user is checked in for a course
  const isUserCheckedIn = (courseId: string) => {
    return trainingAttendance.some(
      (r) =>
        r.courseId === courseId &&
        (r.employeeId === currentUser?.id ||
          (currentEmpName && r.employeeName.toLowerCase().includes(currentEmpName.toLowerCase().split(' ')[0])))
    );
  };

  // Helper: Join Session
  const handleJoinSession = (course: TrainingCourse) => {
    const checkedIn = isUserCheckedIn(course.id);
    if (!checkedIn) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const empDept = currentUser?.department || 'Clinical Services';
      const empId = currentUser?.id || `emp-${Date.now()}`;

      markTrainingAttendance({
        courseId: course.id,
        courseTitle: course.title,
        employeeId: empId,
        employeeName: currentEmpName,
        department: empDept,
        trainingDate: course.scheduledDate || new Date().toISOString().split('T')[0],
        sessionTime: course.sessionTime || '09:00 AM',
        checkInTime: nowTime,
        status: 'Present',
        verificationMethod: 'Digital Roll-call',
        verifiedBy: 'LMS Live Join Verification',
        cmeHoursEarned: course.durationHours,
      });
    }
    setJoinedSessionCourse(course);
  };

  // Filtered Training Attendance Records
  const filteredAttendance = trainingAttendance.filter((rec) => {
    if (!isInstructorOrAdmin) {
      const isSelf =
        rec.employeeId === currentUser?.id ||
        (currentEmpName && (rec.employeeName || '').toLowerCase().includes(currentEmpName.toLowerCase().split(' ')[0])) ||
        (currentEmpEmail && (rec.employeeName || '').toLowerCase().includes(currentEmpEmail.split('@')[0].toLowerCase()));
      if (!isSelf) return false;
    }

    const matchesSearch =
      (rec.employeeName || '').toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      (rec.courseTitle || '').toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      (rec.department || '').toLowerCase().includes(attendanceSearch.toLowerCase());
    const matchesCourse = selectedCourseFilter === 'All' || rec.courseId === selectedCourseFilter;
    const matchesStatus = selectedStatusFilter === 'All' || rec.status === selectedStatusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  // Calculate Course Attendance Stats
  const getCourseAttendanceCount = (courseId: string) => {
    const records = trainingAttendance.filter((r) => r.courseId === courseId);
    const presentCount = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
    return {
      totalRecords: records.length,
      presentCount,
      percent: records.length ? Math.round((presentCount / records.length) * 100) : 0,
    };
  };

  // Submit New Attendance Record Form
  const handleAddAttendanceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const crs = courses.find((c) => c.id === formCourseId);
    const emp = employees.find((e) => e.id === formEmpId);

    if (!crs || !emp) return;

    markTrainingAttendance({
      courseId: crs.id,
      courseTitle: crs.title,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      trainingDate: crs.scheduledDate || new Date().toISOString().split('T')[0],
      sessionTime: crs.sessionTime || '09:00 AM',
      checkInTime: formCheckIn,
      status: formStatus,
      verificationMethod: formMethod,
      verifiedBy: formVerifier,
      cmeHoursEarned: formStatus === 'Present' || formStatus === 'Late' ? crs.durationHours : 0,
    });

    setIsRecordModalOpen(false);
  };

  // Quick Kiosk Self/Staff Check-in
  const handleKioskCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(
      (e) =>
        e.empCode.toLowerCase() === kioskEmpCode.trim().toLowerCase() ||
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(kioskEmpCode.trim().toLowerCase())
    );
    const crs = courses.find((c) => c.id === kioskSelectedCourseId);

    if (!emp) {
      setKioskSuccessMsg('Error: Staff code/name not found. Please check Employee ID.');
      return;
    }
    if (!crs) return;

    const existing = trainingAttendance.find(
      (r) => r.courseId === crs.id && (r.employeeId === emp.id || r.employeeName.includes(emp.firstName))
    );

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (existing) {
      updateTrainingAttendanceStatus(existing.id, 'Present');
      setKioskSuccessMsg(`Attendance Updated: ${emp.firstName} ${emp.lastName} marked PRESENT for ${crs.title}!`);
    } else {
      markTrainingAttendance({
        courseId: crs.id,
        courseTitle: crs.title,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        trainingDate: crs.scheduledDate || new Date().toISOString().split('T')[0],
        sessionTime: crs.sessionTime || '09:00 AM',
        checkInTime: nowTime,
        status: 'Present',
        verificationMethod: 'QR Code Scan',
        verifiedBy: 'Kiosk Automated Station',
        cmeHoursEarned: crs.durationHours,
      });
      setKioskSuccessMsg(`Check-In Verified: ${emp.firstName} ${emp.lastName} checked in at ${nowTime} for ${crs.title}!`);
    }

    setKioskEmpCode('');
    setTimeout(() => setKioskSuccessMsg(''), 5000);
  };

  // Handle Q&A Message Send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: `${currentEmpName} (Staff)`, text: inputMessage, time: now }]);
    setInputMessage('');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = 'Employee,Department,Course,Date,CheckInTime,Status,VerificationMethod,VerifiedBy,CMEHours\n';
    const rows = filteredAttendance
      .map(
        (r) =>
          `"${r.employeeName}","${r.department}","${r.courseTitle}","${r.trainingDate}","${r.checkInTime}","${r.status}","${r.verificationMethod}","${r.verifiedBy || ''}","${r.cmeHoursEarned}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Clinical_Training_Attendance_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            Clinical LMS & Training Hub
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mandatory Continuing Medical Education (CME), Clinical Skills Refresher & Live Session Access.
          </p>
        </div>

        {/* Action Buttons based on role */}
        <div className="flex flex-wrap items-center gap-2">
          {courses[0] && (
            <button
              onClick={() => handleJoinSession(courses[0])}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors animate-pulse"
            >
              <Video className="h-4 w-4" />
              Join Active Live Session
            </button>
          )}

          {isInstructorOrAdmin && (
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              <Plus className="h-4 w-4" />
              Instructor Roll Call
            </button>
          )}

          <button
            onClick={() => setActiveTab('kiosk')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <QrCode className="h-4 w-4 text-emerald-600" />
            Check-In Station
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <GraduationCap className="h-4 w-4 text-emerald-600" />
            Active Courses
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {courses.length}
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Clinical Modules
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <UserCheck className="h-4 w-4 text-blue-600" />
            Sessions Attendance
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {isInstructorOrAdmin ? trainingAttendance.length : filteredAttendance.length}
          </div>
          <div className="text-[10px] text-blue-600 font-medium mt-1">
            {isInstructorOrAdmin ? 'Total Staff Logs' : 'My Attendance Logs'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Attendance Compliance
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {trainingAttendance.length
              ? Math.round(
                  (trainingAttendance.filter((r) => r.status === 'Present' || r.status === 'Late').length /
                    trainingAttendance.length) *
                    100
                )
              : 100}
            %
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Verified Participation
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Award className="h-4 w-4 text-amber-500" />
            CME Credits Earned
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">
            {filteredAttendance.reduce((acc, r) => acc + (r.cmeHoursEarned || 0), 0)} hrs
          </div>
          <div className="text-[10px] text-amber-600 font-medium mt-1">
            Clinical Education Credits
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === 'catalog'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Training Courses & Sessions
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === 'attendance'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          {isInstructorOrAdmin ? 'Master Training Attendance Register' : 'My Training Attendance History'}
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {filteredAttendance.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('kiosk')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 transition-colors ${
            activeTab === 'kiosk'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <QrCode className="h-4 w-4" />
          Quick Check-In Station
        </button>
      </div>

      {/* TAB 1: COURSE CATALOG */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((crs) => {
            const stats = getCourseAttendanceCount(crs.id);
            const userIsCheckedIn = isUserCheckedIn(crs.id);

            return (
              <div
                key={crs.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400">
                      {crs.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {crs.durationHours} Hours CME
                    </span>
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {crs.title}
                  </h3>

                  {/* Course Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Instructor: {crs.instructor || 'Clinical Education Board'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>
                        Date: {crs.scheduledDate || 'Today'} • {crs.sessionTime || '09:00 AM'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Venue: {crs.venue || 'LMS Virtual Hall A'}</span>
                    </div>
                  </div>

                  {/* My Attendance Badge */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-850 dark:bg-slate-800/50">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      My Attendance Status:
                    </span>
                    {userIsCheckedIn ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Checked In / Present
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> Pending Join
                      </span>
                    )}
                  </div>

                  {/* Attendance Stats Widget */}
                  <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-2.5 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> Attendance Record
                      </span>
                      <span>
                        {stats.presentCount} Staff Attended ({stats.percent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Primary Action Button: JOIN SESSION */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => handleJoinSession(crs)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-all"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {userIsCheckedIn ? 'Join Live Training Session' : 'Join Session & Record Attendance'}
                  </button>

                  <div className="flex items-center justify-between">
                    {crs.certificateIssued && (
                      <button
                        onClick={() => setSelectedCert(crs)}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        <Award className="h-3.5 w-3.5" /> View Certificate
                      </button>
                    )}

                    {isInstructorOrAdmin && (
                      <button
                        onClick={() => setRollCallCourse(crs)}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 ml-auto"
                      >
                        <FileCheck className="h-3.5 w-3.5" /> Instructor Roll Call
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MASTER ATTENDANCE REGISTER / MY ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, course title, department..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-900 focus:outline-none dark:text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Filter className="h-3.5 w-3.5" />
                <span>Course:</span>
                <select
                  value={selectedCourseFilter}
                  onChange={(e) => setSelectedCourseFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="All">All Courses</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span>Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Late">Late</option>
                  <option value="Absent">Absent</option>
                  <option value="Excused">Excused</option>
                </select>
              </div>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export CSV
              </button>
            </div>
          </div>

          {/* Register Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Staff Member & Dept</th>
                    <th className="px-4 py-3 font-semibold">Training Course</th>
                    <th className="px-4 py-3 font-semibold">Session Date & Time</th>
                    <th className="px-4 py-3 font-semibold">Check-In</th>
                    <th className="px-4 py-3 font-semibold">Verification</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">CME Hrs</th>
                    {isInstructorOrAdmin && <th className="px-4 py-3 font-semibold text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                  {filteredAttendance.length === 0 ? (
                    <tr>
                      <td colSpan={isInstructorOrAdmin ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                        No training attendance records found.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">
                            {rec.employeeName}
                          </div>
                          <div className="text-[10px] text-slate-400">{rec.department}</div>
                        </td>

                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {rec.courseTitle}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-slate-700 dark:text-slate-300">
                            {rec.trainingDate}
                          </div>
                          <div className="text-[10px] text-slate-400">{rec.sessionTime}</div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                          {rec.checkInTime}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {rec.verificationMethod === 'Biometric Verification' && <Fingerprint className="h-3 w-3 text-emerald-500" />}
                            {rec.verificationMethod === 'QR Code Scan' && <QrCode className="h-3 w-3 text-blue-500" />}
                            {rec.verificationMethod}
                          </span>
                          {rec.verifiedBy && (
                            <div className="text-[9px] text-slate-400 mt-0.5">By: {rec.verifiedBy}</div>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : rec.status === 'Late'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : rec.status === 'Absent'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {rec.status === 'Present' && <Check className="h-3 w-3" />}
                            {rec.status === 'Late' && <Clock className="h-3 w-3" />}
                            {rec.status === 'Absent' && <UserX className="h-3 w-3" />}
                            {rec.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">
                          {rec.cmeHoursEarned}
                        </td>

                        {isInstructorOrAdmin && (
                          <td className="px-4 py-3 text-right">
                            <select
                              value={rec.status}
                              onChange={(e) =>
                                updateTrainingAttendanceStatus(
                                  rec.id,
                                  e.target.value as TrainingAttendanceRecord['status']
                                )
                              }
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            >
                              <option value="Present">Set Present</option>
                              <option value="Late">Set Late</option>
                              <option value="Absent">Set Absent</option>
                              <option value="Excused">Set Excused</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE CHECK-IN KIOSK STATION */}
      {activeTab === 'kiosk' && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/80">
              <QrCode className="h-8 w-8 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-slate-100">
              Live Clinical Training Attendance Check-In Station
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter Staff Employee Code / ID or scan QR badge to verify instant session check-in.
            </p>
          </div>

          {kioskSuccessMsg && (
            <div
              className={`mt-4 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 ${
                kioskSuccessMsg.startsWith('Error')
                  ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              {kioskSuccessMsg.startsWith('Error') ? (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              )}
              {kioskSuccessMsg}
            </div>
          )}

          <form onSubmit={handleKioskCheckIn} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Active Training Session
              </label>
              <select
                value={kioskSelectedCourseId}
                onChange={(e) => setKioskSelectedCourseId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Staff ID Code or Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., EMP-101 or Sarah Jenkins"
                  value={kioskEmpCode}
                  onChange={(e) => setKioskEmpCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pl-9 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                />
                <Fingerprint className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm Attendance Check-In
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: LIVE SESSION PLAYER & CLINICAL HALL */}
      {joinedSessionCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-3 sm:p-6 backdrop-blur-md">
          <div className="relative w-full max-w-5xl rounded-3xl bg-slate-900 p-5 text-slate-100 shadow-2xl border border-slate-800 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-400 animate-pulse border border-rose-500/30">
                  <Radio className="h-3.5 w-3.5" /> LIVE CLINICAL STREAM
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                    {joinedSessionCourse.title}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Instructor: {joinedSessionCourse.instructor || 'Clinical Education Board'} • CME Credits: {joinedSessionCourse.durationHours} Hours
                  </p>
                </div>
              </div>

              <button
                onClick={() => setJoinedSessionCourse(null)}
                className="rounded-xl bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Attendance Verified Notice */}
            <div className="mt-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Attendance Verified:</strong> Logged as <strong>Present</strong> for {currentEmpName} ({currentUser?.department || 'Staff'}).
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400">Timestamp: Live</span>
            </div>

            {/* Main Player & Q&A Grid */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden min-h-[350px]">
              {/* Video Stream Stage */}
              <div className="lg:col-span-2 flex flex-col justify-between rounded-2xl bg-black/90 border border-slate-800 p-4 relative overflow-hidden group">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg bg-slate-900/80 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-sm">
                  <Video className="h-3.5 w-3.5 text-emerald-400" /> Virtual Clinical Hall A
                </div>

                {/* Video Presentation Graphic */}
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-emerald-600/20 flex items-center justify-center animate-ping absolute inset-0"></div>
                    <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-xl relative z-10">
                      <GraduationCap className="h-10 w-10" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{joinedSessionCourse.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Live Clinical Refresher & Interactive Guidelines Presentation.
                    </p>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <button className="rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white flex items-center gap-1.5 hover:bg-emerald-500">
                      <Play className="h-3.5 w-3.5 fill-current" /> Playing Stream
                    </button>
                    <span className="font-mono text-[11px]">00:42:15 / 02:00:00</span>
                  </div>
                  <span className="text-[11px] font-medium text-emerald-400">HD Stream 1080p</span>
                </div>
              </div>

              {/* Live Q&A and Chat Panel */}
              <div className="flex flex-col justify-between rounded-2xl bg-slate-950 border border-slate-800 p-3.5">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold text-slate-200">
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  Live Clinical Q&A Channel
                </div>

                {/* Chat Messages */}
                <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[220px]">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-900 p-2.5 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                        <span className="text-emerald-400">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-slate-200 text-[11px] leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>

                {/* Send Q&A Form */}
                <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask instructor a question..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-500"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Bottom Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
              <span>Pope John Paul II Medical Education Board</span>
              <button
                onClick={() => setJoinedSessionCourse(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-slate-200 hover:bg-slate-700 hover:text-white"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD NEW TRAINING ATTENDANCE (INSTRUCTORS ONLY) */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsRecordModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Instructor Training Attendance Roll Call
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Log staff participation for LMS continuing medical education.
            </p>

            <form onSubmit={handleAddAttendanceRecord} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Training Course
                </label>
                <select
                  value={formCourseId}
                  onChange={(e) => setFormCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Staff Member
                </label>
                <select
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.firstName} {e.lastName} ({e.department} - {e.empCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attendance Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as TrainingAttendanceRecord['status'])
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                    <option value="Excused">Excused</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Check-In Time
                  </label>
                  <input
                    type="text"
                    required
                    value={formCheckIn}
                    onChange={(e) => setFormCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verification Method
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) =>
                      setFormMethod(
                        e.target.value as TrainingAttendanceRecord['verificationMethod']
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  >
                    <option value="Digital Roll-call">Digital Roll-call</option>
                    <option value="QR Code Scan">QR Code Scan</option>
                    <option value="Biometric Verification">Biometric Verification</option>
                    <option value="Instructor Sign-off">Instructor Sign-off</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verified By
                  </label>
                  <input
                    type="text"
                    value={formVerifier}
                    onChange={(e) => setFormVerifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: COURSE ROLL CALL DETAIL MODAL (INSTRUCTORS ONLY) */}
      {rollCallCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setRollCallCourse(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Course Attendance Register
              </span>
              <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                {rollCallCourse.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scheduled: {rollCallCourse.scheduledDate} ({rollCallCourse.sessionTime}) • Venue: {rollCallCourse.venue}
              </p>
            </div>

            {/* Attendance list for this course */}
            <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border-t border-b py-2 dark:border-slate-800">
              {employees.map((emp) => {
                const rec = trainingAttendance.find(
                  (r) => r.courseId === rollCallCourse.id && r.employeeId === emp.id
                );
                return (
                  <div key={emp.id} className="flex items-center justify-between py-2.5 px-1">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {emp.firstName} {emp.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {emp.department} • {emp.empCode}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          if (rec) {
                            updateTrainingAttendanceStatus(rec.id, 'Present');
                          } else {
                            markTrainingAttendance({
                              courseId: rollCallCourse.id,
                              courseTitle: rollCallCourse.title,
                              employeeId: emp.id,
                              employeeName: `${emp.firstName} ${emp.lastName}`,
                              department: emp.department,
                              trainingDate: rollCallCourse.scheduledDate || '2026-08-10',
                              sessionTime: rollCallCourse.sessionTime || '09:00 AM',
                              checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              status: 'Present',
                              verificationMethod: 'Instructor Sign-off',
                              verifiedBy: currentUser?.name || 'Instructor',
                              cmeHoursEarned: rollCallCourse.durationHours,
                            });
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                          rec?.status === 'Present'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Present
                      </button>

                      <button
                        onClick={() => {
                          if (rec) {
                            updateTrainingAttendanceStatus(rec.id, 'Late');
                          } else {
                            markTrainingAttendance({
                              courseId: rollCallCourse.id,
                              courseTitle: rollCallCourse.title,
                              employeeId: emp.id,
                              employeeName: `${emp.firstName} ${emp.lastName}`,
                              department: emp.department,
                              trainingDate: rollCallCourse.scheduledDate || '2026-08-10',
                              sessionTime: rollCallCourse.sessionTime || '09:00 AM',
                              checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                              status: 'Late',
                              verificationMethod: 'Instructor Sign-off',
                              verifiedBy: currentUser?.name || 'Instructor',
                              cmeHoursEarned: rollCallCourse.durationHours,
                            });
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                          rec?.status === 'Late'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Late
                      </button>

                      <button
                        onClick={() => {
                          if (rec) {
                            updateTrainingAttendanceStatus(rec.id, 'Absent');
                          } else {
                            markTrainingAttendance({
                              courseId: rollCallCourse.id,
                              courseTitle: rollCallCourse.title,
                              employeeId: emp.id,
                              employeeName: `${emp.firstName} ${emp.lastName}`,
                              department: emp.department,
                              trainingDate: rollCallCourse.scheduledDate || '2026-08-10',
                              sessionTime: rollCallCourse.sessionTime || '09:00 AM',
                              checkInTime: '-',
                              status: 'Absent',
                              verificationMethod: 'Instructor Sign-off',
                              verifiedBy: currentUser?.name || 'Instructor',
                              cmeHoursEarned: 0,
                            });
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                          rec?.status === 'Absent'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        Absent
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setRollCallCourse(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CERTIFICATE MODAL */}
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
              <p className="text-xs text-slate-500">This certifies that staff member has successfully completed</p>
              <h4 className="mt-1 font-bold text-base text-emerald-600 dark:text-emerald-400">
                {selectedCert.title}
              </h4>
              <p className="mt-2 text-xs font-semibold">
                Score Achieved: {selectedCert.score || 98}% • Grade A+ • CME Hours: {selectedCert.durationHours}
              </p>
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
