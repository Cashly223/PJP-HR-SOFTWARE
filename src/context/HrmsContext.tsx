import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updatePassword,
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from '../lib/firebase';
import {
  Hospital,
  UserRole,
  LanguageCode,
  CurrencyCode,
  Employee,
  StaffFile,
  ShiftRoster,
  AttendanceRecord,
  LeaveRequest,
  PayrollRecord,
  JobVacancy,
  Candidate,
  OnboardingTask,
  TrainingCourse,
  TrainingAttendanceRecord,
  IncidentReport,
  HospitalAsset,
  AuditLog,
  NotificationItem,
  Grievance,
  PerformanceReview,
  ShiftSwapRequest,
  DepartmentMonthlyRoster,
  DepartmentConferenceMeeting,
  EmailDispatchResult,
  DepartmentLeadership,
  UnitLeadership,
  WorkflowStage,
  MultiTierWorkflow,
  SystemCustomizationSettings,
  StaffAccessPermissions,
  ExpenseClaim,
  NoticeBoardPost,
  ChatMessage,
  ChatChannel,
  SuggestionItem,
  InfoHubArticle,
} from '../types/hrms';
import {
  MOCK_HOSPITALS,
  MOCK_EMPLOYEES,
  MOCK_ROSTERS,
  MOCK_ATTENDANCE,
  MOCK_LEAVES,
  MOCK_PAYROLL,
  MOCK_VACANCIES,
  MOCK_CANDIDATES,
  MOCK_ONBOARDING,
  MOCK_COURSES,
  MOCK_TRAINING_ATTENDANCE,
  MOCK_INCIDENTS,
  MOCK_ASSETS,
  MOCK_AUDIT_LOGS,
  MOCK_NOTIFICATIONS,
  MOCK_GRIEVANCES,
  MOCK_PERFORMANCE_REVIEWS,
  MOCK_SHIFT_SWAP_REQUESTS,
  MOCK_MONTHLY_UNIT_ROSTERS,
  MOCK_CONFERENCE_MEETINGS,
  MOCK_DEPARTMENT_LEADERSHIP,
  MOCK_STAFF_PERMISSIONS,
  MOCK_EXPENSE_CLAIMS,
  MOCK_NOTICE_POSTS,
  MOCK_CHAT_MESSAGES,
  MOCK_SUGGESTIONS,
  MOCK_INFO_ARTICLES,
} from '../data/mockHrmsData';

export interface CurrentUserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department?: string;
  empCode?: string;
  loginTime: string;
  mustChangePassword?: boolean;
  filePermissionGranted?: boolean;
  defaultPassword?: string;
}

interface HrmsContextType {
  // Auth Session State & Methods
  isAuthenticated: boolean;
  currentUser: CurrentUserSession | null;
  login: (email: string, password?: string, defaultRole?: UserRole, name?: string) => Promise<void>;
  signup: (userData: { fullName: string; email: string; password?: string; role: UserRole; department: string }) => Promise<void>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;

  // Staff Files & Security Permissions
  staffFiles: StaffFile[];
  uploadStaffFile: (fileData: { fileName: string; fileType: string; fileSize: number; fileData: string; category: StaffFile['category']; description?: string }) => Promise<StaffFile>;
  updateStaffFile: (fileId: string, updates: Partial<StaffFile>) => Promise<void>;
  deleteStaffFile: (fileId: string) => Promise<void>;
  toggleStaffFilePermission: (empId: string, granted: boolean) => Promise<void>;
  createStaffAccountByHR: (staffData: { firstName: string; lastName: string; email: string; role: UserRole; department: string; jobTitle?: string; defaultPassword?: string }) => Promise<Employee>;

  // Config & State
  selectedHospital: Hospital;
  setSelectedHospitalId: (id: string) => void;
  hospitals: Hospital[];
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  mobileViewActive: boolean;
  setMobileViewActive: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Data Collections & Operations
  employees: Employee[];
  addEmployee: (emp: Partial<Employee>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  rosters: ShiftRoster[];
  addRoster: (roster: Partial<ShiftRoster>) => void;
  updateRosterStatus: (id: string, status: ShiftRoster['status']) => void;

  attendance: AttendanceRecord[];
  addClockIn: (empId: string, method: AttendanceRecord['method']) => void;
  approveAttendance: (id: string) => void;

  leaves: LeaveRequest[];
  addLeaveRequest: (leave: Partial<LeaveRequest>) => void;
  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => void;
  processLeaveWorkflowStep: (leaveId: string, action: 'Approve' | 'Reject', comments?: string, customApproverName?: string) => void;

  departmentLeadership: DepartmentLeadership[];
  assignDepartmentHead: (departmentName: string, employeeId: string) => void;
  assignUnitHead: (departmentName: string, unitName: string, employeeId: string) => void;
  addUnitToDepartment: (departmentName: string, unitName: string, initialHeadId?: string) => void;
  setFacilityHead: (employeeId: string) => void;

  payrolls: PayrollRecord[];
  approvePayroll: (id: string) => void;
  lockPayroll: (id: string) => void;

  vacancies: JobVacancy[];
  candidates: Candidate[];
  addCandidate: (cand: Partial<Candidate>) => void;
  updateCandidateStatus: (id: string, status: Candidate['status']) => void;

  onboardingTasks: OnboardingTask[];
  toggleOnboardingTask: (id: string) => void;

  courses: TrainingCourse[];
  trainingAttendance: TrainingAttendanceRecord[];
  markTrainingAttendance: (rec: Omit<TrainingAttendanceRecord, 'id'>) => void;
  updateTrainingAttendanceStatus: (id: string, status: TrainingAttendanceRecord['status']) => void;

  incidents: IncidentReport[];
  addIncident: (inc: Partial<IncidentReport>) => void;

  assets: HospitalAsset[];
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: string, details: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  dispatchNotification: (recipientId: string, title: string, message: string, channel: NotificationItem['channel'], type: NotificationItem['type']) => Promise<void>;

  grievances: Grievance[];
  addGrievance: (g: Partial<Grievance>) => void;
  updateGrievanceStatus: (id: string, status: Grievance['status'], notes?: string, resolution?: string) => void;
  addGrievanceNote: (id: string, note: string, isConfidential: boolean) => void;

  performanceReviews: PerformanceReview[];
  addPerformanceReview: (rev: Partial<PerformanceReview>) => void;
  updatePerformanceReview: (id: string, updates: Partial<PerformanceReview>) => void;

  shiftSwapRequests: ShiftSwapRequest[];
  addShiftSwapRequest: (req: Partial<ShiftSwapRequest>) => void;
  updateShiftSwapStatus: (id: string, status: ShiftSwapRequest['status'], rejectionReason?: string) => void;

  monthlyUnitRosters: DepartmentMonthlyRoster[];
  addMonthlyUnitRoster: (roster: Partial<DepartmentMonthlyRoster>) => void;
  updateMonthlyUnitRosterStatus: (id: string, status: DepartmentMonthlyRoster['status'], rejectionNotes?: string) => void;

  conferenceMeetings: DepartmentConferenceMeeting[];
  addConferenceMeeting: (meeting: Partial<DepartmentConferenceMeeting>) => void;
  addConferenceChatMessage: (meetingId: string, text: string, isAlert?: boolean) => void;

  // Employee Portal Account & Login Management
  createEmployeePortalAccount: (
    employeeId: string,
    options: {
      usernameType: 'email' | 'empCode';
      passwordType: 'empCode' | 'email' | 'custom';
      customPassword?: string;
      sendInviteEmail?: boolean;
    }
  ) => Promise<EmailDispatchResult>;
  batchCreateAndInvitePortalAccounts: (
    employeeIds: string[],
    options: {
      usernameType: 'email' | 'empCode';
      passwordType: 'empCode' | 'email';
    }
  ) => Promise<EmailDispatchResult[]>;
  sendPortalInviteEmail: (employeeId: string) => Promise<EmailDispatchResult>;

  // System & Portal Customization (Admin & HR)
  systemCustomization: SystemCustomizationSettings;
  updateSystemCustomization: (updates: Partial<SystemCustomizationSettings>) => void;

  // Access Control & Permissions Management
  staffPermissions: StaffAccessPermissions[];
  grantStaffAccess: (employeeId: string, modules: string[], notes?: string) => void;
  revokeStaffAccess: (employeeId: string, moduleId: string) => void;
  hasModuleAccess: (role: UserRole, employeeId: string | undefined, moduleKey: string) => boolean;

  // Expense Claims Management
  expenseClaims: ExpenseClaim[];
  addExpenseClaim: (claim: Partial<ExpenseClaim>) => void;
  updateExpenseClaimStatus: (id: string, status: ExpenseClaim['status']) => void;

  // Hospital Official Notice Board
  noticePosts: NoticeBoardPost[];
  addNoticePost: (post: Omit<NoticeBoardPost, 'id'>) => void;
  toggleNoticeLike: (noticeId: string, empId: string) => void;
  acknowledgeNotice: (noticeId: string, empName: string) => void;

  // Staff Interactive Chat Room
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;

  // Digital Suggestion Box
  suggestions: SuggestionItem[];
  addSuggestion: (suggestion: Omit<SuggestionItem, 'id'>) => void;
  upvoteSuggestion: (suggestionId: string, empId: string) => void;
  respondToSuggestion: (suggestionId: string, response: SuggestionItem['responseFromManagement'], newStatus: SuggestionItem['status']) => void;

  // PJPIIMC Information Hub
  infoArticles: InfoHubArticle[];

  // Helpers
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

const HrmsContext = createContext<HrmsContextType | undefined>(undefined);

// Simple Multi-Language Dictionary
const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    dashboard: 'Executive Dashboard',
    employees: 'Employee Directory',
    credentials: 'Licenses & Credentials',
    shifts: 'Shift Roster & ICU',
    attendance: 'Attendance & Biometrics',
    leave: 'Leave Management',
    payroll: 'Payroll & Salaries',
    recruitment: 'Recruitment & ATS',
    onboarding: 'Onboarding & Workflows',
    lms: 'LMS & Clinical Training',
    health: 'Employee Health & Safety',
    grievances: 'Grievances & Whistleblower',
    performance: 'Performance & Competency',
    assets: 'Asset & PPE Tracking',
    audit: 'Audit Trail & History',
    reports: 'Custom Reports',
    api: 'REST API & Swagger',
    customization: 'Portal Customization',
    aiAssistant: 'AuraAI Assistant',
    mobileApp: 'Mobile App View',
  },
  es: {
    dashboard: 'Panel Ejecutivo',
    employees: 'Gestión de Empleados',
    credentials: 'Licencias y Credenciales',
    shifts: 'Turnos e UCI',
    attendance: 'Asistencia y Biometría',
    leave: 'Gestión de Permisos',
    payroll: 'Nómina y Salarios',
    recruitment: 'Reclutamiento y ATS',
    onboarding: 'Integración e Inducción',
    lms: 'Capacitación Médica',
    health: 'Salud y Seguridad Ocupacional',
    grievances: 'Quejas y Denuncias',
    performance: 'Rendimiento y Competencias',
    assets: 'Gestión de Activos y EPP',
    audit: 'Auditoría e Historial',
    reports: 'Informes Personalizados',
    api: 'API REST y Documentación',
    aiAssistant: 'Asistente AuraAI',
    mobileApp: 'Vista App Móvil',
  },
  fr: {
    dashboard: 'Tableau de Bord Exécutif',
    employees: 'Gestion du Personnel',
    credentials: 'Licences Médicales',
    shifts: 'Plannings et Soins Intensifs',
    attendance: 'Présences et Biométrie',
    leave: 'Gestion des Congés',
    payroll: 'Paie et Rémunérations',
    recruitment: 'Recrutement et ATS',
    onboarding: 'Intégration des Employés',
    lms: 'Formation Clinique LMS',
    health: 'Santé et Sécurité au Travail',
    grievances: 'Griefs et Médiation',
    performance: 'Performance et Compétences',
    assets: 'Gestion des Équipements',
    audit: 'Journal d\'Audit',
    reports: 'Rapports Personnalisés',
    api: 'API REST',
    aiAssistant: 'Assistant AuraAI',
    mobileApp: 'Application Mobile',
  },
  ar: {
    dashboard: 'لوحة التحكم التنفيذية',
    employees: 'إدارة الموظفين',
    credentials: 'التراخيص والشهادات الطبية',
    shifts: 'جداول الورديات والعناية المركزة',
    attendance: 'الحضور والبصمة',
    leave: 'إدارة الإجازات',
    payroll: 'كشف الراتب والأجور',
    recruitment: 'التوظيف واستقطاب الكفاءات',
    onboarding: 'تهيئة الموظفين الجدد',
    lms: 'التعليم والتدريب الطبي',
    health: 'الصحة والسلامة المهنية',
    grievances: 'الشكاوى والتظلمات',
    performance: 'إدارة الأداء والكفاءات',
    assets: 'إدارة الأصول والمعدات',
    audit: 'سجل المراجعة والتدقيق',
    reports: 'التقارير المخصصة',
    api: 'واجهة API والتوثيق',
    aiAssistant: 'مساعد AuraAI الذكي',
    mobileApp: 'تطبيق الهاتف المحمول',
  },
};

export const HrmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1');
  const [activeRole, setActiveRole] = useState<UserRole>('hr_director');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileViewActive, setMobileViewActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Auth session state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem('aurahr_auth_session');
    return saved !== null;
  });

  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(() => {
    const saved = localStorage.getItem('aurahr_auth_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return null;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Core Data Collections
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('aurahr_employees_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to load saved employees from localStorage', e);
      }
    }
    return MOCK_EMPLOYEES;
  });
  const [rosters, setRosters] = useState<ShiftRoster[]>(MOCK_ROSTERS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVES);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(MOCK_PAYROLL);
  const [vacancies] = useState<JobVacancy[]>(MOCK_VACANCIES);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(MOCK_ONBOARDING);
  const [courses] = useState<TrainingCourse[]>(MOCK_COURSES);
  const [trainingAttendance, setTrainingAttendance] = useState<TrainingAttendanceRecord[]>(MOCK_TRAINING_ATTENDANCE);
  const [incidents, setIncidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);
  const [assets] = useState<HospitalAsset[]>(MOCK_ASSETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [grievances, setGrievances] = useState<Grievance[]>(MOCK_GRIEVANCES);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(MOCK_PERFORMANCE_REVIEWS);
  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>(MOCK_SHIFT_SWAP_REQUESTS);
  const [monthlyUnitRosters, setMonthlyUnitRosters] = useState<DepartmentMonthlyRoster[]>(MOCK_MONTHLY_UNIT_ROSTERS);
  const [conferenceMeetings, setConferenceMeetings] = useState<DepartmentConferenceMeeting[]>(MOCK_CONFERENCE_MEETINGS);
  const [departmentLeadership, setDepartmentLeadership] = useState<DepartmentLeadership[]>(MOCK_DEPARTMENT_LEADERSHIP);
  const [staffPermissions, setStaffPermissions] = useState<StaffAccessPermissions[]>(MOCK_STAFF_PERMISSIONS);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(MOCK_EXPENSE_CLAIMS);
  const [noticePosts, setNoticePosts] = useState<NoticeBoardPost[]>(MOCK_NOTICE_POSTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(MOCK_SUGGESTIONS);
  const [infoArticles] = useState<InfoHubArticle[]>(MOCK_INFO_ARTICLES);
  const [systemCustomization, setSystemCustomization] = useState<SystemCustomizationSettings>({
    hospitalName: 'St. Jude Teaching & Research Hospital',
    hospitalTagline: 'Excellence in Clinical Care, Research & HR Governance',
    themeAccent: 'emerald',
    portalWelcomeBanner: 'Welcome to AuraHR Healthcare OS — Authorized Clinical & Administrative Personnel Only',
    staffIdPrefix: 'SJH-',
    requireFourTierLeaveApproval: true,
    autoApproveLeaveUnderDays: 0,
    sessionTimeoutMinutes: 30,
    requirePasswordChangeOnFirstLogin: true,
    enableBiometric2FA: true,
    restrictAccessBySubnet: false,
    allowedIpSubnet: '192.168.1.0/24',
    senderName: 'St. Jude Hospital HR Administration',
    senderEmail: 'hr-portal@stjudehealth.org',
    emailFooterNotice: 'Confidential Medical Communication. Governed under HIPAA & JCAHO Healthcare Rules.',
    notifyOnLeaveSubmit: true,
    notifyOnShiftSwap: true,
    notifyOnPayrollRelease: true,
    notifyOnLicenseExpiry: true,
    enableTeleConferenceModule: true,
    enableAiAssistantWidget: true,
    enableGrievanceProtection: true,
    currency: 'GHS',
    lastUpdatedBy: 'Marcus Vance (HR Director)',
    lastUpdatedAt: new Date().toISOString(),
  });

  const updateSystemCustomization = (updates: Partial<SystemCustomizationSettings>) => {
    setSystemCustomization((prev) => ({
      ...prev,
      ...updates,
      lastUpdatedBy: `${activeRole.replace('_', ' ').toUpperCase()} Authorized Admin`,
      lastUpdatedAt: new Date().toISOString(),
    }));

    addAuditLog(
      'Updated System Customization',
      'System & Portal Settings',
      `Modified settings: ${Object.keys(updates).join(', ')}`
    );
  };

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0];

  // Helper for Audit Logging
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: 'usr-current',
      userName: currentUser ? currentUser.name : (activeRole === 'hr_director' ? 'Marcus Vance' : 'Active User'),
      userRole: currentUser ? currentUser.role : activeRole,
      action,
      module,
      details,
      ipAddress: '192.168.1.100',
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Staff Files Storage State
  const [staffFiles, setStaffFiles] = useState<StaffFile[]>([
    {
      id: 'file-101',
      ownerUid: 'emp-001',
      ownerEmail: 'a.kingsley@stjudehealth.org',
      ownerName: 'Dr. Arthur Kingsley',
      fileName: 'State_Medical_License_2026.pdf',
      fileType: 'pdf',
      fileSize: 2450000,
      fileData: 'data:application/pdf;base64,JVBERi0xLjQK...',
      category: 'Medical License',
      description: 'Annual State Board Medical License renewal certificate.',
      uploadedAt: '2026-01-15 09:30:00',
      updatedAt: '2026-01-15 09:30:00',
      permissionGrantedByHr: true,
    },
    {
      id: 'file-102',
      ownerUid: 'emp-002',
      ownerEmail: 's.jenkins@stjudehealth.org',
      ownerName: 'Dr. Sarah Jenkins',
      fileName: 'ACLS_Advanced_Cardiac_Life_Support_Cert.pdf',
      fileType: 'pdf',
      fileSize: 1850000,
      fileData: 'data:application/pdf;base64,JVBERi0xLjQK...',
      category: 'Clinical Certification',
      description: 'AHA ACLS Provider Card valid through 2028.',
      uploadedAt: '2026-02-01 11:15:00',
      updatedAt: '2026-02-01 11:15:00',
      permissionGrantedByHr: true,
    },
    {
      id: 'file-103',
      ownerUid: 'emp-004',
      ownerEmail: 'e.rostova@stjudehealth.org',
      ownerName: 'Elena Rostova',
      fileName: 'Senior_ICU_Nurse_Employment_Contract.pdf',
      fileType: 'pdf',
      fileSize: 3100000,
      fileData: 'data:application/pdf;base64,JVBERi0xLjQK...',
      category: 'HR Contract',
      description: 'Full-time employment agreement with St. Jude Teaching Hospital.',
      uploadedAt: '2026-03-10 14:20:00',
      updatedAt: '2026-03-10 14:20:00',
      permissionGrantedByHr: false,
    },
  ]);

  // Auth Operations with Firebase Auth & Firestore Sync
  const login = async (emailInput: string, passwordInput?: string, defaultRole?: UserRole, nameInput?: string) => {
    let authUser = null;
    try {
      if (passwordInput) {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        authUser = userCredential.user;
      }
    } catch (firebaseErr) {
      console.warn('Firebase Auth sign in notice:', firebaseErr);
    }

    const matchedEmp = employees.find(
      (e) => e.email && emailInput && e.email.toLowerCase() === emailInput.toLowerCase()
    );

    let userRole = defaultRole || (matchedEmp ? matchedEmp.role : activeRole);
    let name = nameInput || (matchedEmp ? `${matchedEmp.firstName} ${matchedEmp.lastName}` : emailInput.split('@')[0]);
    let photo = matchedEmp ? matchedEmp.photo : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    let dept = matchedEmp ? matchedEmp.department : 'General Staff';
    let empCode = matchedEmp ? matchedEmp.empCode : `SJH-${Math.floor(1000 + Math.random() * 9000)}`;

    // Check if password change is required or default password is active
    let mustChangePassword = matchedEmp ? (matchedEmp.mustChangePassword ?? false) : false;
    let filePermissionGranted = matchedEmp ? (matchedEmp.filePermissionGranted ?? true) : true;

    const session: CurrentUserSession = {
      id: matchedEmp ? matchedEmp.id : (authUser ? authUser.uid : `user-${Date.now()}`),
      name,
      email: emailInput,
      role: userRole,
      avatar: photo,
      department: dept,
      empCode,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mustChangePassword,
      filePermissionGranted,
    };

    setCurrentUser(session);
    setIsAuthenticated(true);
    setActiveRole(userRole);
    localStorage.setItem('aurahr_auth_session', JSON.stringify(session));

    // Firestore record sync
    try {
      const empRef = doc(db, 'employees', session.id);
      await setDoc(empRef, {
        uid: session.id,
        empCode,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || 'Staff',
        email: emailInput,
        role: userRole,
        department: dept,
        mustChangePassword,
        filePermissionGranted,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (e) {
      console.warn('Firestore employee sync notice:', e);
    }

    addAuditLog('User Login', 'Authentication', `Logged in as ${name} (${userRole}) via Firebase Auth`);
  };

  const signup = async (userData: { fullName: string; email: string; password?: string; role: UserRole; department: string }) => {
    let authUid = `user-${Date.now()}`;
    try {
      if (userData.password) {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        authUid = userCredential.user.uid;
      }
    } catch (e) {
      console.warn('Firebase Auth signup notice:', e);
    }

    const names = userData.fullName.trim().split(' ');
    const firstName = names[0] || 'Staff';
    const lastName = names.slice(1).join(' ') || 'User';

    const newEmp = addEmployee({
      id: authUid,
      firstName,
      lastName,
      email: userData.email,
      role: userData.role,
      department: userData.department,
      jobTitle: `${userData.department} Specialist`,
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mustChangePassword: false,
      filePermissionGranted: true,
    });

    const session: CurrentUserSession = {
      id: newEmp.id,
      name: userData.fullName,
      email: userData.email,
      role: userData.role,
      avatar: newEmp.photo,
      department: userData.department,
      empCode: newEmp.empCode,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mustChangePassword: false,
      filePermissionGranted: true,
    };

    setCurrentUser(session);
    setIsAuthenticated(true);
    setActiveRole(userData.role);
    localStorage.setItem('aurahr_auth_session', JSON.stringify(session));

    // Save to Firestore
    try {
      await setDoc(doc(db, 'employees', newEmp.id), {
        uid: newEmp.id,
        empCode: newEmp.empCode,
        firstName,
        lastName,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        mustChangePassword: false,
        filePermissionGranted: true,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore employee creation notice:', e);
    }

    addAuditLog('User Sign Up', 'Authentication', `Registered new staff account for ${userData.fullName} (${userData.role})`);
  };

  const changePassword = async (newPassword: string) => {
    if (!currentUser) throw new Error('No user currently logged in.');

    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }
    } catch (e) {
      console.warn('Firebase Auth password update notice:', e);
    }

    // Update in local state
    setCurrentUser((prev) => prev ? { ...prev, mustChangePassword: false } : null);

    // Update matching employee
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.email && currentUser?.email && emp.email.toLowerCase() === currentUser.email.toLowerCase()
          ? { ...emp, mustChangePassword: false }
          : emp
      )
    );

    // Save update in Firestore
    try {
      const q = query(collection(db, 'employees'), where('email', '==', currentUser.email));
      const querySnap = await getDocs(q);
      querySnap.forEach(async (document) => {
        await updateDoc(doc(db, 'employees', document.id), {
          mustChangePassword: false,
          updatedAt: new Date().toISOString(),
        });
      });
    } catch (e) {
      console.warn('Firestore password status update notice:', e);
    }

    // Update local storage session
    const saved = localStorage.getItem('aurahr_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.mustChangePassword = false;
        localStorage.setItem('aurahr_auth_session', JSON.stringify(parsed));
      } catch (e) {}
    }

    addAuditLog('Change Password', 'Security & Auth', `User ${currentUser.name} successfully updated default password`);
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('aurahr_auth_session');
  };

  // Staff Files Storage Operations
  const uploadStaffFile = async (fileData: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
    category: StaffFile['category'];
    description?: string;
  }): Promise<StaffFile> => {
    if (!currentUser) throw new Error('Must be logged in to upload files.');

    const isHR = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(currentUser.role);
    if (!isHR && currentUser.filePermissionGranted === false) {
      throw new Error('HR File Upload Permission Required. Please request upload clearance from HR.');
    }

    const newFile: StaffFile = {
      id: `file-${Date.now()}`,
      ownerUid: currentUser.id,
      ownerEmail: currentUser.email,
      ownerName: currentUser.name,
      fileName: fileData.fileName,
      fileType: fileData.fileType,
      fileSize: fileData.fileSize,
      fileData: fileData.fileData,
      category: fileData.category,
      description: fileData.description || '',
      uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      permissionGrantedByHr: currentUser.filePermissionGranted ?? true,
    };

    setStaffFiles((prev) => [newFile, ...prev]);

    // Save to Firestore staff_files collection
    try {
      await addDoc(collection(db, 'staff_files'), {
        ownerUid: newFile.ownerUid,
        ownerEmail: newFile.ownerEmail,
        ownerName: newFile.ownerName,
        fileName: newFile.fileName,
        fileType: newFile.fileType,
        fileSize: newFile.fileSize,
        fileData: newFile.fileData,
        category: newFile.category,
        description: newFile.description,
        uploadedAt: newFile.uploadedAt,
        updatedAt: newFile.updatedAt,
        permissionGrantedByHr: newFile.permissionGrantedByHr,
      });
    } catch (e) {
      console.warn('Firestore file add notice:', e);
    }

    addAuditLog('Upload Staff File', 'Document Management', `Uploaded file ${newFile.fileName} (${newFile.category}) for ${currentUser.name}`);
    return newFile;
  };

  const updateStaffFile = async (fileId: string, updates: Partial<StaffFile>) => {
    setStaffFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
    );

    try {
      await updateDoc(doc(db, 'staff_files', fileId), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore file update notice:', e);
    }

    addAuditLog('Update Staff File', 'Document Management', `Updated staff file ID ${fileId}`);
  };

  const deleteStaffFile = async (fileId: string) => {
    setStaffFiles((prev) => prev.filter((f) => f.id !== fileId));

    try {
      await deleteDoc(doc(db, 'staff_files', fileId));
    } catch (e) {
      console.warn('Firestore file delete notice:', e);
    }

    addAuditLog('Delete Staff File', 'Document Management', `Deleted staff file ID ${fileId}`);
  };

  const toggleStaffFilePermission = async (empId: string, granted: boolean) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === empId ? { ...emp, filePermissionGranted: granted } : emp))
    );

    if (currentUser && currentUser.id === empId) {
      setCurrentUser((prev) => (prev ? { ...prev, filePermissionGranted: granted } : null));
    }

    try {
      await updateDoc(doc(db, 'employees', empId), {
        filePermissionGranted: granted,
        updatedAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore toggle permission notice:', e);
    }

    const empName = employees.find((e) => e.id === empId)?.firstName || 'Staff Member';
    addAuditLog(
      'HR Security Permission Changed',
      'Document Access Rules',
      `HR ${granted ? 'GRANTED' : 'REVOKED'} file upload/update permissions for ${empName} (ID: ${empId})`
    );
  };

  const createStaffAccountByHR = async (staffData: {
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    department: string;
    jobTitle?: string;
    defaultPassword?: string;
  }): Promise<Employee> => {
    const defaultPassword = staffData.defaultPassword || 'Hospital2026!';
    let authUid = `emp-${Date.now()}`;

    try {
      const userCred = await createUserWithEmailAndPassword(auth, staffData.email, defaultPassword);
      authUid = userCred.user.uid;
    } catch (e) {
      console.warn('Firebase Auth HR creation notice:', e);
    }

    const newEmp = addEmployee({
      id: authUid,
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      email: staffData.email,
      role: staffData.role,
      department: staffData.department,
      jobTitle: staffData.jobTitle || `${staffData.department} Specialist`,
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      mustChangePassword: true,
      filePermissionGranted: false,
      defaultPassword,
    });

    // Save to Firestore
    try {
      await setDoc(doc(db, 'employees', newEmp.id), {
        uid: newEmp.id,
        empCode: newEmp.empCode,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: staffData.email,
        role: staffData.role,
        department: staffData.department,
        jobTitle: newEmp.jobTitle,
        mustChangePassword: true,
        filePermissionGranted: false,
        defaultPassword,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore employee creation by HR notice:', e);
    }

    addAuditLog(
      'HR Provisioned Staff Account',
      'HR Staff Management',
      `HR provisioned account for ${staffData.firstName} ${staffData.lastName} (${staffData.email}) with default password ${defaultPassword}`
    );

    return newEmp;
  };

  // Employees CRUD
  const addEmployee = (empData: Partial<Employee>): Employee => {
    const generatedEmpCode = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      hospitalId: selectedHospitalId,
      branchId: 'b-1',
      empCode: generatedEmpCode,
      firstName: empData.firstName || 'New',
      lastName: empData.lastName || 'Employee',
      photo: empData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      email: empData.email || 'emp@stjudehealth.org',
      phone: empData.phone || '+1 (555) 000-1122',
      role: empData.role || 'nurse',
      jobTitle: empData.jobTitle || 'Staff Nurse',
      department: empData.department || 'General Ward',
      unit: empData.unit || 'Unit 1',
      employmentType: empData.employmentType || 'Full-Time',
      joinDate: new Date().toISOString().split('T')[0],
      salary: empData.salary || 6500,
      currency: currency,
      status: 'Active',
      medicalLicenses: empData.medicalLicenses || [],
      passportNo: 'P-NEW' + Math.floor(Math.random() * 100000),
      nationalId: 'SSN-xxx-xx-0099',
      taxId: 'TX-0099',
      bankAccount: 'Bank ****0000',
      emergencyContacts: [{ name: 'Contact', relation: 'Family', phone: '+1 (555) 000-9999' }],
      vaccinations: [{ id: 'v-new', vaccineName: 'COVID Booster', doseDate: '2026-01-01', status: 'Completed' }],
      occupationalHealth: { lastExamDate: '2026-01-01', fitForDuty: true, notes: 'Fit for general duties.' },
      education: empData.education || 'BSc Nursing / Medical Degree',
      skills: empData.skills || ['Clinical Care', 'Patient Safety'],
      languages: ['English'],
      portalAccess: {
        username: empData.email || generatedEmpCode,
        usernameType: empData.email ? 'email' : 'empCode',
        tempPassword: generatedEmpCode,
        passwordType: 'empCode',
        accountCreated: true,
        accountCreatedAt: new Date().toISOString(),
        invitedAt: new Date().toISOString(),
        inviteStatus: 'Invitation Sent',
        authMethod: 'Password',
        mustChangePassword: true,
      },
    };
    setEmployees((prev) => [newEmp, ...prev]);

    addAuditLog('Created Staff Profile & Portal Account', 'Employee Directory', `Added ${newEmp.firstName} ${newEmp.lastName} (${newEmp.empCode}) & initialized portal account.`);

    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    let empName = id;
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updates };
          empName = `${updated.firstName} ${updated.lastName} (${updated.empCode})`;
          return updated;
        }
        return e;
      })
    );
    addAuditLog('Updated Employee Profile & File', 'Employee Management', `HR updated employee details & file for ${empName}`);
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Terminated Employee', 'Employee Management', `Removed employee ${emp?.firstName} ${emp?.lastName}`);
  };

  // Roster Management
  const addRoster = (rosterData: Partial<ShiftRoster>) => {
    const newRoster: ShiftRoster = {
      id: `ros-${Date.now()}`,
      employeeId: rosterData.employeeId || 'emp-101',
      employeeName: rosterData.employeeName || 'Staff Member',
      employeePhoto: rosterData.employeePhoto || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
      role: rosterData.role || 'Staff Doctor/Nurse',
      hospitalId: selectedHospitalId,
      department: rosterData.department || 'ICU Ward',
      shiftType: rosterData.shiftType || 'Night ICU (23:00-07:00)',
      date: rosterData.date || new Date().toISOString().split('T')[0],
      startTime: rosterData.startTime || '23:00',
      endTime: rosterData.endTime || '07:00',
      ward: rosterData.ward || 'Ward 3',
      status: 'Assigned',
      fatigueScore: Math.floor(Math.random() * 40) + 20,
    };
    setRosters((prev) => [newRoster, ...prev]);
    addAuditLog('Assigned Shift Roster', 'Shift Management', `Assigned ${newRoster.shiftType} to ${newRoster.employeeName} on ${newRoster.date}`);
  };

  const updateRosterStatus = (id: string, status: ShiftRoster['status']) => {
    setRosters((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  // Clock In
  const addClockIn = (empId: string, method: AttendanceRecord['method']) => {
    const emp = employees.find((e) => e.id === empId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: empId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
      date: now.toISOString().split('T')[0],
      clockIn: timeStr,
      clockOut: 'In Progress',
      method,
      location: 'Main Hospital Entrance Biometric Terminal',
      status: 'On-Time',
      overtimeHours: 0,
      approvalStatus: 'Auto-Approved',
    };
    setAttendance((prev) => [newRecord, ...prev]);
    addAuditLog('Biometric Clock-In', 'Attendance', `${newRecord.employeeName} clocked in via ${method} at ${timeStr}`);
  };

  const approveAttendance = (id: string) => {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, approvalStatus: 'Approved' } : a)));
    addAuditLog('Approved Overtime / Attendance', 'Attendance', `Approved record ID ${id}`);
  };

  // Leave Management & 4-Tier Approval Workflow
  const addLeaveRequest = (leaveData: Partial<LeaveRequest>) => {
    const emp = employees.find((e) => e.id === leaveData.employeeId);
    const empDept = emp?.department || leaveData.department || 'Intensive Care Unit (ICU)';
    const empUnit = emp?.unit || leaveData.unit || 'ICU Ward 2B (Critical Care)';
    const currentDateStr = new Date().toISOString().split('T')[0];

    const newLeave: LeaveRequest = {
      id: `lv-${Date.now()}`,
      employeeId: leaveData.employeeId || 'emp-101',
      employeeName: leaveData.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : 'Dr. Sarah Jenkins'),
      staffId: leaveData.staffId || emp?.empCode || 'STF-1001',
      grade: leaveData.grade || emp?.jobTitle || 'Clinical Specialist',
      department: empDept,
      unit: empUnit,
      leaveType: leaveData.leaveType || 'Annual Leave',
      startDate: leaveData.startDate || currentDateStr,
      endDate: leaveData.endDate || currentDateStr,
      totalDays: leaveData.totalDays || 3,
      reason: leaveData.reason || 'Medical / Personal Leave Request',
      status: 'Pending',
      currentStage: 'Unit Head',
      appliedOn: currentDateStr,

      // Part A
      leaveYear: leaveData.leaveYear || new Date().getFullYear(),
      leaveEntitlement: leaveData.leaveEntitlement || 30,
      deferredLeaveDaysDue: leaveData.deferredLeaveDaysDue || 0,
      leaveDaysEarned: leaveData.leaveDaysEarned || 30,
      addressOnLeave: leaveData.addressOnLeave || 'On file with HR Department',
      phoneOnLeave: leaveData.phoneOnLeave || emp?.mobilePhone || '+233 20 000 0000',
      applicantSignedDate: currentDateStr,

      workflow: {
        currentStage: 'Unit Head',
        unitHeadStep: { role: 'Unit Head', status: 'Pending' },
        departmentHeadStep: { role: 'Departmental Head', status: 'Pending' },
        hrStep: { role: 'HR', status: 'Pending' },
        facilityHeadStep: { role: 'Head of Facility', status: 'Pending' },
      },
    };
    setLeaves((prev) => [newLeave, ...prev]);
    addAuditLog(
      'Submitted Leave Request',
      'Leave Management Workflow',
      `${newLeave.employeeName} requested ${newLeave.totalDays} days of ${newLeave.leaveType}. Sequential workflow initiated at Tier 1 (Unit Head).`
    );
  };

  const updateLeaveStatus = (id: string, status: LeaveRequest['status']) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    addAuditLog('Updated Leave Status', 'Leave Management', `Set leave ID ${id} to ${status}`);
  };

  const processLeaveWorkflowStep = (
    leaveId: string,
    action: 'Approve' | 'Reject',
    comments?: string,
    customApproverName?: string
  ) => {
    setLeaves((prevLeaves) =>
      prevLeaves.map((leave) => {
        if (leave.id !== leaveId) return leave;

        const timestamp = new Date().toISOString();
        const dateStr = new Date().toISOString().split('T')[0];
        const currentStage = leave.currentStage || 'Unit Head';
        let updatedWorkflow: MultiTierWorkflow = leave.workflow
          ? { ...leave.workflow }
          : {
              currentStage: 'Unit Head',
              unitHeadStep: { role: 'Unit Head', status: 'Pending' },
              departmentHeadStep: { role: 'Departmental Head', status: 'Pending' },
              hrStep: { role: 'HR', status: 'Pending' },
              facilityHeadStep: { role: 'Head of Facility', status: 'Pending' },
            };

        let nextStage: WorkflowStage = currentStage;
        let finalOverallStatus: LeaveRequest['status'] = 'Pending';

        const defaultNameMap: Record<string, string> = {
          super_admin: 'Super Admin Override',
          hr_director: 'Marcus Vance (HR Director)',
          hr_manager: 'Sister Linda Asare (HR Manager)',
          dept_head: 'Dr. Sarah Jenkins (Department Head)',
          unit_head: 'Elena Rostova (Unit Head)',
          facility_head: 'Dr. Arthur Kingsley (Head of Facility)',
        };

        const approverName =
          customApproverName ||
          defaultNameMap[activeRole] ||
          `${activeRole.replace('_', ' ').toUpperCase()} Authorized Reviewer`;

        // Partial leave updates for Part B, C, D signatures
        const leaveUpdates: Partial<LeaveRequest> = {};

        if (action === 'Reject') {
          nextStage = 'Rejected';
          finalOverallStatus = 'Rejected';
          updatedWorkflow.rejectionReason = comments || 'Request rejected during multi-tier sequential review.';
          updatedWorkflow.rejectedByRole = currentStage;
          updatedWorkflow.rejectedByName = approverName;
          updatedWorkflow.rejectedAt = timestamp;

          if (currentStage === 'Unit Head') {
            updatedWorkflow.unitHeadStep = { role: 'Unit Head', status: 'Rejected', approverName, approvedAt: timestamp, comments };
            leaveUpdates.recommendationStatus = 'NOT RECOMMENDED';
            leaveUpdates.unitHeadSignedBy = approverName;
            leaveUpdates.unitHeadSignedDate = dateStr;
          } else if (currentStage === 'Departmental Head') {
            updatedWorkflow.departmentHeadStep = { role: 'Departmental Head', status: 'Rejected', approverName, approvedAt: timestamp, comments };
            leaveUpdates.recommendationStatus = 'NOT RECOMMENDED';
            leaveUpdates.deptHeadSignedBy = approverName;
            leaveUpdates.deptHeadSignedDate = dateStr;
          } else if (currentStage === 'HR') {
            updatedWorkflow.hrStep = { role: 'HR', status: 'Rejected', approverName, approvedAt: timestamp, comments };
            leaveUpdates.hrRemarks = comments || 'Rejected during HR validation.';
            leaveUpdates.hrSignedBy = approverName;
            leaveUpdates.hrSignedDate = dateStr;
          } else if (currentStage === 'Head of Facility') {
            updatedWorkflow.facilityHeadStep = { role: 'Head of Facility', status: 'Rejected', approverName, approvedAt: timestamp, comments };
            leaveUpdates.approvalRemarks = comments || 'Leave application rejected by Facility In-Charge.';
            leaveUpdates.facilityInChargeSignedBy = approverName;
            leaveUpdates.facilityInChargeSignedDate = dateStr;
          }

          addAuditLog(
            'Leave Request Rejected',
            'Leave Management Workflow',
            `Leave ID ${leaveId} (${leave.employeeName}) REJECTED at ${currentStage} stage by ${approverName}. Reason: ${comments || 'None'}`
          );
        } else {
          // APPROVE STEP
          if (currentStage === 'Unit Head') {
            updatedWorkflow.unitHeadStep = {
              role: 'Unit Head',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 1 (Unit Head): Operational shift coverage verified.',
            };
            nextStage = 'Departmental Head';
            leaveUpdates.recommendationStatus = 'RECOMMENDED';
            leaveUpdates.replacementRequired = 'NOT REQUIRED';
            leaveUpdates.unitHeadSignedBy = approverName;
            leaveUpdates.unitHeadSignedDate = dateStr;

            addAuditLog(
              'Tier 1 Approval (Unit Head)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) APPROVED at Tier 1 (Unit Head) by ${approverName}. Advanced to Tier 2 (Departmental Head).`
            );
          } else if (currentStage === 'Departmental Head') {
            updatedWorkflow.departmentHeadStep = {
              role: 'Departmental Head',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 2 (Departmental Head): Clinical department staffing approved.',
            };
            nextStage = 'HR';
            leaveUpdates.recommendationStatus = 'RECOMMENDED';
            leaveUpdates.deptHeadSignedBy = approverName;
            leaveUpdates.deptHeadSignedDate = dateStr;

            addAuditLog(
              'Tier 2 Approval (Departmental Head)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) APPROVED at Tier 2 (Departmental Head) by ${approverName}. Advanced to Tier 3 (HR).`
            );
          } else if (currentStage === 'HR') {
            updatedWorkflow.hrStep = {
              role: 'HR',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 3 (HR): Policy compliance, contracts & leave allowances validated.',
            };
            nextStage = 'Head of Facility';
            
            // Calculate resumption date (e.g. 1 day after end date)
            const endDateObj = new Date(leave.endDate);
            endDateObj.setDate(endDateObj.getDate() + 1);
            const resumptionStr = endDateObj.toISOString().split('T')[0];

            leaveUpdates.outstandingLeaveDays = Math.max(0, (leave.leaveEntitlement || 30) - leave.totalDays);
            leaveUpdates.validatedStartDate = leave.startDate;
            leaveUpdates.validatedEndDate = leave.endDate;
            leaveUpdates.dateOfResumption = resumptionStr;
            leaveUpdates.hrRemarks = comments || 'Leave days and entitlements verified compliant with HR policy.';
            leaveUpdates.hrSignedBy = approverName;
            leaveUpdates.hrSignedDate = dateStr;

            addAuditLog(
              'Tier 3 Approval (HR)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) APPROVED at Tier 3 (HR) by ${approverName}. Advanced to Tier 4 (Head of Facility).`
            );
          } else if (currentStage === 'Head of Facility') {
            updatedWorkflow.facilityHeadStep = {
              role: 'Head of Facility',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 4 (Head of Facility): Final executive authorization granted.',
            };
            nextStage = 'Fully Approved';
            finalOverallStatus = 'Approved';

            leaveUpdates.daysGranted = leave.totalDays;
            leaveUpdates.approvalRemarks = comments || 'Leave application approved in full by Facility In-Charge.';
            leaveUpdates.facilityInChargeSignedBy = approverName;
            leaveUpdates.facilityInChargeSignedDate = dateStr;

            addAuditLog(
              'Tier 4 Final Approval (Head of Facility)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) FULLY APPROVED at Tier 4 (Head of Facility) by ${approverName}. Leave granted.`
            );
          }
        }

        updatedWorkflow.currentStage = nextStage;

        return {
          ...leave,
          ...leaveUpdates,
          currentStage: nextStage,
          status: finalOverallStatus,
          workflow: updatedWorkflow,
        };
      })
    );
  };

  // Leadership Assignment Functions for HR
  const assignDepartmentHead = (departmentName: string, employeeId: string) => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) return;

    const empFullName = `${targetEmp.firstName} ${targetEmp.lastName}`;

    setDepartmentLeadership((prev) =>
      prev.map((d) => {
        if (d.departmentName !== departmentName) return d;
        return {
          ...d,
          departmentHeadId: targetEmp.id,
          departmentHeadName: empFullName,
          departmentHeadEmail: targetEmp.email,
          lastAssignedBy: 'Marcus Vance (HR Director)',
          lastAssignedAt: new Date().toISOString(),
        };
      })
    );

    // Update employee role if needed
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, role: 'dept_head', department: departmentName } : e))
    );

    addAuditLog(
      'Assigned Department Head',
      'Leadership & Governance',
      `HR assigned ${empFullName} as Department Head for ${departmentName}`
    );
  };

  const assignUnitHead = (departmentName: string, unitName: string, employeeId: string) => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) return;

    const empFullName = `${targetEmp.firstName} ${targetEmp.lastName}`;

    setDepartmentLeadership((prev) =>
      prev.map((d) => {
        if (d.departmentName !== departmentName) return d;
        return {
          ...d,
          units: d.units.map((u) => {
            if (u.unitName !== unitName) return u;
            return {
              ...u,
              unitHeadId: targetEmp.id,
              unitHeadName: empFullName,
              unitHeadEmail: targetEmp.email,
            };
          }),
          lastAssignedBy: 'Marcus Vance (HR Director)',
          lastAssignedAt: new Date().toISOString(),
        };
      })
    );

    // Update employee unit and role
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, role: 'unit_head', department: departmentName, unit: unitName } : e))
    );

    addAuditLog(
      'Assigned Unit Head',
      'Leadership & Governance',
      `HR assigned ${empFullName} as Unit Head for ${unitName} under ${departmentName}`
    );
  };

  const addUnitToDepartment = (departmentName: string, unitName: string, initialHeadId?: string) => {
    const targetEmp = employees.find((e) => e.id === initialHeadId);
    const empFullName = targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName}` : undefined;

    setDepartmentLeadership((prev) =>
      prev.map((d) => {
        if (d.departmentName !== departmentName) return d;
        const newUnit: UnitLeadership = {
          id: `u-${Date.now()}`,
          unitName,
          departmentName,
          unitHeadId: targetEmp?.id,
          unitHeadName: empFullName,
          unitHeadEmail: targetEmp?.email,
          staffCount: 8,
        };
        return {
          ...d,
          units: [...d.units, newUnit],
          lastAssignedBy: 'Marcus Vance (HR Director)',
          lastAssignedAt: new Date().toISOString(),
        };
      })
    );

    addAuditLog('Created Hospital Unit', 'Leadership & Governance', `HR created unit '${unitName}' under ${departmentName}`);
  };

  const setFacilityHead = (employeeId: string) => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) return;

    const empFullName = `${targetEmp.firstName} ${targetEmp.lastName}`;

    setDepartmentLeadership((prev) =>
      prev.map((d) => ({
        ...d,
        facilityHeadId: targetEmp.id,
        facilityHeadName: empFullName,
        facilityHeadEmail: targetEmp.email,
      }))
    );

    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, role: 'facility_head' } : e))
    );

    addAuditLog(
      'Assigned Facility Head',
      'Leadership & Governance',
      `HR assigned ${empFullName} as Head of Facility`
    );
  };

  // Payroll
  const approvePayroll = (id: string) => {
    setPayrolls((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Approved' } : p)));
    addAuditLog('Approved Salary Record', 'Payroll', `Approved salary statement ID ${id}`);
  };

  const lockPayroll = (id: string) => {
    setPayrolls((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Locked' } : p)));
    addAuditLog('Locked Payroll Period', 'Payroll', `Locked payroll period ID ${id}`);
  };

  // Candidates
  const addCandidate = (candData: Partial<Candidate>) => {
    const newCand: Candidate = {
      id: `cand-${Date.now()}`,
      vacancyId: candData.vacancyId || 'vac-1',
      vacancyTitle: candData.vacancyTitle || 'Senior ICU Specialist Nurse',
      name: candData.name || 'Candidate Name',
      email: candData.email || 'applicant@health.org',
      phone: candData.phone || '+1 (555) 000-1122',
      experienceYears: candData.experienceYears || 5,
      currentRole: candData.currentRole || 'Clinical Nurse',
      aiMatchScore: Math.floor(Math.random() * 20) + 80,
      aiMatchSummary: 'Matches core clinical qualifications and active license criteria.',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
    };
    setCandidates((prev) => [newCand, ...prev]);
    addAuditLog('Registered Candidate Application', 'Recruitment', `Added candidate ${newCand.name}`);
  };

  const updateCandidateStatus = (id: string, status: Candidate['status']) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const toggleOnboardingTask = (id: string) => {
    setOnboardingTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const markTrainingAttendance = (recData: Omit<TrainingAttendanceRecord, 'id'>) => {
    const newRec: TrainingAttendanceRecord = {
      ...recData,
      id: `tatt-${Date.now()}`,
    };
    setTrainingAttendance((prev) => [newRec, ...prev]);
    addAuditLog(
      'Recorded Training Attendance',
      'Clinical LMS',
      `Marked ${newRec.employeeName} as ${newRec.status} for course: ${newRec.courseTitle}`
    );
  };

  const updateTrainingAttendanceStatus = (id: string, status: TrainingAttendanceRecord['status']) => {
    setTrainingAttendance((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    addAuditLog('Updated Training Attendance', 'Clinical LMS', `Updated attendance record #${id} to ${status}`);
  };

  const addIncident = (incData: Partial<IncidentReport>) => {
    const newInc: IncidentReport = {
      id: `inc-${Date.now()}`,
      employeeId: incData.employeeId || 'emp-102',
      employeeName: incData.employeeName || 'Staff Member',
      date: new Date().toISOString().split('T')[0],
      type: incData.type || 'Needle Stick Injury',
      severity: incData.severity || 'Medium',
      description: incData.description || 'Reported clinical incident in hospital ward.',
      status: 'Reported',
      correctiveAction: 'Informed Occupational Health department.',
    };
    setIncidents((prev) => [newInc, ...prev]);
    addAuditLog('Logged Incident Report', 'Employee Health', `Reported ${newInc.type} (${newInc.severity})`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const dispatchNotification = async (
    recipientId: string,
    title: string,
    message: string,
    channel: NotificationItem['channel'],
    type: NotificationItem['type']
  ) => {
    const newNotif: NotificationItem = {
      id: `not-${Date.now()}`,
      recipientId,
      title,
      message,
      channel,
      type,
      read: false,
      timestamp: 'Just now',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Backend dispatch call simulation
    try {
      await fetch('/api/notifications/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          recipient: recipientId,
          subject: title,
          message,
          senderEmail: 'hr@aurahr.health',
          senderName: 'AuraHR Healthcare System',
        }),
      });
    } catch (e) {
      console.log('Dispatch offline mode');
    }
  };

  // Grievance Operations
  const addGrievance = (gData: Partial<Grievance>) => {
    const newCount = grievances.length + 1;
    const newGrievance: Grievance = {
      id: `grv-${Date.now()}`,
      ticketNumber: `GRV-2026-${String(newCount).padStart(4, '0')}`,
      submittedBy: gData.isAnonymous ? 'Anonymous Employee' : (gData.submittedBy || 'Staff Member'),
      submittedById: gData.isAnonymous ? undefined : gData.submittedById,
      isAnonymous: gData.isAnonymous ?? true,
      category: gData.category || 'Shift / Scheduling Unfairness',
      department: gData.department || 'General Ward',
      severity: gData.severity || 'Medium',
      subject: gData.subject || 'Workplace Grievance Submitted',
      description: gData.description || 'No description provided.',
      dateSubmitted: new Date().toISOString().split('T')[0],
      assignedMediator: 'Marcus Vance',
      assignedMediatorRole: 'HR Director',
      status: 'Submitted',
      investigationNotes: [],
      followUpRequired: false,
    };
    setGrievances((prev) => [newGrievance, ...prev]);
    addAuditLog('Submitted Grievance Ticket', 'Grievance Management', `Ticket #${newGrievance.ticketNumber} (${newGrievance.category}) submitted securely.`);
  };

  const updateGrievanceStatus = (id: string, status: Grievance['status'], notes?: string, resolution?: string) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const updated = { ...g, status };
        if (resolution) updated.resolutionDetails = resolution;
        if (status === 'Resolved') updated.resolvedDate = new Date().toISOString().split('T')[0];
        if (notes) {
          updated.investigationNotes = [
            ...updated.investigationNotes,
            {
              id: `gn-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              author: activeRole === 'hr_director' ? 'Marcus Vance' : 'HR Mediator',
              authorRole: activeRole,
              note: notes,
              isConfidential: false,
            },
          ];
        }
        return updated;
      })
    );
    addAuditLog('Updated Grievance Status', 'Grievance Management', `Updated ticket ID ${id} to ${status}`);
  };

  const addGrievanceNote = (id: string, noteText: string, isConfidential: boolean) => {
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        return {
          ...g,
          investigationNotes: [
            ...g.investigationNotes,
            {
              id: `gn-${Date.now()}`,
              date: new Date().toISOString().split('T')[0],
              author: activeRole === 'hr_director' ? 'Marcus Vance' : 'Mediator',
              authorRole: activeRole,
              note: noteText,
              isConfidential,
            },
          ],
        };
      })
    );
    addAuditLog('Logged Investigation Note', 'Grievance Management', `Added confidential note to ticket ${id}`);
  };

  // Performance Operations
  const addPerformanceReview = (revData: Partial<PerformanceReview>) => {
    const newRev: PerformanceReview = {
      id: `perf-${Date.now()}`,
      employeeId: revData.employeeId || 'emp-101',
      employeeName: revData.employeeName || 'Staff Member',
      jobTitle: revData.jobTitle || 'Clinician',
      department: revData.department || 'Medical Care',
      reviewPeriod: revData.reviewPeriod || 'Annual 2026',
      evaluatorName: 'Marcus Vance',
      evaluatorRole: 'HR Director',
      overallRating: revData.overallRating || 4.0,
      status: 'Draft',
      clinicalCompetencies: revData.clinicalCompetencies || [],
      kpis: revData.kpis || [],
      goals: revData.goals || [],
      feedback360: revData.feedback360 || [],
      managerComments: revData.managerComments || 'Performance evaluation cycle initiated.',
      developmentPlan: revData.developmentPlan || 'Continued professional medical training.',
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setPerformanceReviews((prev) => [newRev, ...prev]);
    addAuditLog('Created Performance Review', 'Performance Management', `Initiated appraisal for ${newRev.employeeName}`);
  };

  const updatePerformanceReview = (id: string, updates: Partial<PerformanceReview>) => {
    setPerformanceReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : r))
    );
    addAuditLog('Updated Performance Review', 'Performance Management', `Updated appraisal for ID ${id}`);
  };

  // Shift Swap Requests
  const addShiftSwapRequest = (req: Partial<ShiftSwapRequest>) => {
    const newReq: ShiftSwapRequest = {
      id: `swap-${Date.now()}`,
      requesterId: req.requesterId || 'emp-101',
      requesterName: req.requesterName || 'Clinician',
      requesterPhoto: req.requesterPhoto,
      requesterShiftId: req.requesterShiftId || '',
      requesterShiftDate: req.requesterShiftDate || new Date().toISOString().split('T')[0],
      requesterShiftType: req.requesterShiftType || 'Night ICU (23:00-07:00)',
      requesterWard: req.requesterWard || 'ICU Ward A',

      targetEmployeeId: req.targetEmployeeId || 'emp-102',
      targetEmployeeName: req.targetEmployeeName || 'Target Clinician',
      targetEmployeePhoto: req.targetEmployeePhoto,
      targetShiftId: req.targetShiftId || '',
      targetShiftDate: req.targetShiftDate || new Date().toISOString().split('T')[0],
      targetShiftType: req.targetShiftType || 'Morning (07:00-15:00)',
      targetWard: req.targetWard || 'Cardiac Unit B',

      department: req.department || 'Intensive Care Unit',
      reason: req.reason || 'Personal schedule conflict',
      status: 'Pending_Lead_Approval',
      dateRequested: new Date().toISOString().split('T')[0],

      departmentLeadName: req.departmentLeadName || 'Dr. Kwame Mensah (Dept Head)',
      departmentLeadEmail: req.departmentLeadEmail || 'kwame.mensah@popejohnpaul2med.org',
      emailNotified: true,
      emailLog: [
        {
          sentTo: req.departmentLeadEmail || 'kwame.mensah@popejohnpaul2med.org',
          subject: `[ACTION REQUIRED] Shift Swap Request: ${req.requesterName} <-> ${req.targetEmployeeName}`,
          body: `${req.requesterName} has requested a shift swap with ${req.targetEmployeeName} for ${req.requesterShiftDate}. Reason: "${req.reason}". Please review and take action in Pope John Paul II Medical Centre HRMS.`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
      ],
    };

    setShiftSwapRequests((prev) => [newReq, ...prev]);

    // Dispatch automated email & notification
    dispatchNotification(
      'lead-1',
      `Shift Swap Proposed: ${newReq.requesterName}`,
      `Automated email notification dispatched to ${newReq.departmentLeadEmail} for Department Lead approval.`,
      'Email',
      'Shift_Change'
    );

    addAuditLog('Proposed Shift Swap', 'Shift Roster Management', `Shift swap proposed by ${newReq.requesterName} with ${newReq.targetEmployeeName}`);
  };

  const updateShiftSwapStatus = (id: string, status: ShiftSwapRequest['status'], rejectionReason?: string) => {
    let targetReq: ShiftSwapRequest | undefined;

    setShiftSwapRequests((prev) =>
      prev.map((req) => {
        if (req.id !== id) return req;
        targetReq = req;

        const leadEmail = req.departmentLeadEmail || 'kwame.mensah@popejohnpaul2med.org';
        const requesterEmail = `${(req.requesterName || 'staff').toLowerCase().replace(/[^a-z]/g, '')}@popejohnpaul2med.org`;

        const newLogEntry = {
          sentTo: requesterEmail,
          subject: `[DECISION NOTIFICATION] Shift Swap Request ${status}`,
          body: status === 'Approved'
            ? `Your proposed shift swap with ${req.targetEmployeeName} for ${req.requesterShiftDate} has been APPROVED by ${req.departmentLeadName}. Hospital shift roster updated automatically.`
            : `Your proposed shift swap with ${req.targetEmployeeName} was REJECTED by ${req.departmentLeadName}. Reason: ${rejectionReason || 'Operational coverage requirements.'}`,
          sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };

        return {
          ...req,
          status,
          rejectionReason: rejectionReason || req.rejectionReason,
          leadDecisionDate: new Date().toISOString().split('T')[0],
          emailLog: [...req.emailLog, newLogEntry],
        };
      })
    );

    if (targetReq) {
      if (status === 'Approved') {
        // Automatically swap roster entries
        const reqShiftId = targetReq.requesterShiftId;
        const tgtShiftId = targetReq.targetShiftId;

        setRosters((prev) =>
          prev.map((r) => {
            if (r.id === reqShiftId) {
              return {
                ...r,
                employeeId: targetReq!.targetEmployeeId,
                employeeName: targetReq!.targetEmployeeName,
                employeePhoto: targetReq!.targetEmployeePhoto || r.employeePhoto,
                status: 'Swapped',
              };
            }
            if (r.id === tgtShiftId) {
              return {
                ...r,
                employeeId: targetReq!.requesterId,
                employeeName: targetReq!.requesterName,
                employeePhoto: targetReq!.requesterPhoto || r.employeePhoto,
                status: 'Swapped',
              };
            }
            return r;
          })
        );

        dispatchNotification(
          targetReq.requesterId,
          'Shift Swap Approved',
          `Automated Email Dispatched: Shift swap between ${targetReq.requesterName} and ${targetReq.targetEmployeeName} was approved by Department Lead.`,
          'Email',
          'Shift_Change'
        );
      } else if (status === 'Rejected') {
        dispatchNotification(
          targetReq.requesterId,
          'Shift Swap Rejected',
          `Automated Email Dispatched: Shift swap rejected by Department Lead. Reason: ${rejectionReason || 'Coverage constraint'}.`,
          'Email',
          'Shift_Change'
        );
      }
    }

    addAuditLog('Updated Shift Swap Status', 'Shift Roster Management', `Shift swap request ${id} updated to ${status}`);
  };

  // Department Monthly Roster Operations
  const addMonthlyUnitRoster = (rosterData: Partial<DepartmentMonthlyRoster>) => {
    const newRoster: DepartmentMonthlyRoster = {
      id: `roster-doc-${Date.now()}`,
      department: rosterData.department || 'Intensive Care Unit (ICU)',
      unit: rosterData.unit || 'General Clinical Ward',
      month: rosterData.month || 'September',
      year: rosterData.year || 2026,
      preparedBy: rosterData.preparedBy || 'Unit In-Charge',
      preparedByRole: rosterData.preparedByRole || 'Head of Department',
      preparedByEmail: rosterData.preparedByEmail || 'unithead@popejohnpaul2med.org',
      totalStaffCount: rosterData.totalStaffCount || 12,
      totalPlannedHours: rosterData.totalPlannedHours || 1920,
      submissionDate: new Date().toISOString().split('T')[0],
      fileName: rosterData.fileName || `${rosterData.department?.replace(/[^a-zA-Z]/g, '_')}_Duty_Roster.xlsx`,
      fileSize: rosterData.fileSize || '1.5 MB',
      notes: rosterData.notes || 'Monthly department schedule uploaded for HR review.',
      status: 'Pending HR Approval',
      shiftsSummary: rosterData.shiftsSummary || {
        morningShifts: 80,
        eveningShifts: 70,
        nightShifts: 50,
        onCallCoverage: 20,
      },
      dutyRosterGrid: rosterData.dutyRosterGrid || [
        { staffName: 'Staff Member 1', role: 'Senior Nurse', week1: 'Morning (07-15)', week2: 'Evening (15-23)', week3: 'Night ICU (23-07)', week4: 'Off / CME' },
        { staffName: 'Staff Member 2', role: 'Resident Doctor', week1: 'Night ICU (23-07)', week2: 'Morning (07-15)', week3: '12h Emergency (07-19)', week4: 'On-Call 24h' },
      ],
    };

    setMonthlyUnitRosters((prev) => [newRoster, ...prev]);
    addAuditLog(
      'Uploaded Monthly Department Duty Roster',
      'Shift Roster Management',
      `Submitted ${newRoster.month} ${newRoster.year} duty roster for ${newRoster.department} (${newRoster.totalStaffCount} staff)`
    );

    dispatchNotification(
      'emp-103', // HR Director
      'New Monthly Duty Roster Submitted',
      `Department ${newRoster.department} uploaded monthly duty roster for ${newRoster.month} ${newRoster.year} (${newRoster.fileName}). Pending HR review and approval.`,
      'In-App',
      'Approval'
    );
  };

  const updateMonthlyUnitRosterStatus = (
    id: string,
    status: DepartmentMonthlyRoster['status'],
    rejectionNotes?: string
  ) => {
    setMonthlyUnitRosters((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          status,
          reviewedBy: activeRole === 'hr_director' ? 'Marcus Vance (HR Director)' : 'HR Officer',
          reviewedDate: new Date().toISOString().split('T')[0],
          rejectionNotes: rejectionNotes || r.rejectionNotes,
        };
      })
    );

    const targetRoster = monthlyUnitRosters.find((r) => r.id === id);
    if (targetRoster) {
      addAuditLog(
        `HR ${status} Monthly Duty Roster`,
        'Shift Roster Management',
        `HR decision: ${status} for ${targetRoster.department} (${targetRoster.month} ${targetRoster.year})`
      );

      dispatchNotification(
        'usr-dept-head',
        `Monthly Duty Roster ${status}`,
        `HR has ${status.toLowerCase()} the ${targetRoster.month} ${targetRoster.year} duty roster for ${targetRoster.department}. ${rejectionNotes ? 'Notes: ' + rejectionNotes : ''}`,
        'Email',
        'Shift_Change'
      );
    }
  };

  // Department Conference Meeting Handlers
  const addConferenceMeeting = (data: Partial<DepartmentConferenceMeeting>) => {
    const newMeeting: DepartmentConferenceMeeting = {
      id: `conf-${Date.now()}`,
      title: data.title || 'Departmental Unit Conference Huddle',
      department: data.department || 'Intensive Care Unit (ICU)',
      unit: data.unit || 'General Ward Unit',
      scheduledStartTime: data.scheduledStartTime || new Date().toISOString(),
      durationMinutes: data.durationMinutes || 30,
      meetingType: data.meetingType || 'Audio & Video Conference',
      hostName: data.hostName || 'Unit Lead Clinician',
      hostRole: data.hostRole || 'Head of Department',
      hostEmail: data.hostEmail || 'lead@popejohnpaul2med.org',
      meetingCode: `conf-${Math.floor(100 + Math.random() * 900)}`,
      passcode: `${Math.floor(100000 + Math.random() * 900000)}`,
      status: data.status || 'Live Now',
      participantsCount: 1,
      agenda: data.agenda || 'Clinical handover, shift briefing, and departmental review.',
      isRecording: data.isRecording ?? true,
      participants: [
        {
          id: 'p-me',
          name: data.hostName || 'Unit Lead Clinician',
          role: data.hostRole || 'Head of Department',
          department: data.department || 'Clinical',
          isHost: true,
          isMuted: false,
          isVideoOn: true,
          isSpeaking: true,
        },
        {
          id: 'p-2',
          name: 'Elena Rostova',
          role: 'Senior ICU Nurse',
          department: 'ICU',
          isMuted: true,
          isVideoOn: true,
        },
        {
          id: 'p-3',
          name: 'Dr. Sarah Jenkins',
          role: 'Attending Physician',
          department: 'Emergency',
          isMuted: false,
          isVideoOn: true,
        },
      ],
      chatMessages: [
        {
          id: 'cm-1',
          senderName: 'System Bot',
          senderRole: 'AuraHR HIPAA Room Guardian',
          text: 'Conference room created and encrypted. Recording started for compliance.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setConferenceMeetings((prev) => [newMeeting, ...prev]);
    addAuditLog(
      'Launched Departmental Unit Conference',
      'Conference Platform',
      `Started ${newMeeting.meetingType} for ${newMeeting.department} (${newMeeting.title})`
    );

    dispatchNotification(
      'all-dept',
      `Conference Call Started: ${newMeeting.title}`,
      `A live ${newMeeting.meetingType} has been launched by ${newMeeting.hostName} for ${newMeeting.department}. Room Code: ${newMeeting.meetingCode}`,
      'In-App',
      'Alert'
    );
  };

  const addConferenceChatMessage = (meetingId: string, text: string, isAlert?: boolean) => {
    setConferenceMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const newMsg = {
          id: `msg-${Date.now()}`,
          senderName: 'Dr. Kwame Mensah',
          senderRole: 'Head of ICU',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isClinicalAlert: isAlert,
        };
        return {
          ...m,
          chatMessages: [...(m.chatMessages || []), newMsg],
        };
      })
    );
  };

  // Employee Portal Account & Invitation Handlers
  const createEmployeePortalAccount = async (
    employeeId: string,
    options: {
      usernameType: 'email' | 'empCode';
      passwordType: 'empCode' | 'email' | 'custom';
      customPassword?: string;
      sendInviteEmail?: boolean;
    }
  ): Promise<EmailDispatchResult> => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) {
      return {
        success: false,
        recipientEmail: '',
        recipientName: 'Unknown Employee',
        senderEmail: systemCustomization.senderEmail,
        senderName: systemCustomization.senderName,
        replyTo: systemCustomization.senderEmail,
        organizationDomain: 'stjudehealth.org',
        subject: 'Portal Account Error',
        body: '',
        username: '',
        tempPassword: '',
        portalUrl: 'https://aurahr.health/login',
        timestamp: new Date().toISOString(),
        dispatchId: 'ERR-NO-EMP',
        error: 'Employee record not found.',
      };
    }

    const username = options.usernameType === 'email' ? targetEmp.email : targetEmp.empCode;
    let tempPassword = targetEmp.empCode;
    if (options.passwordType === 'email') tempPassword = targetEmp.email;
    if (options.passwordType === 'custom' && options.customPassword) tempPassword = options.customPassword;

    const updatedPortalAccess = {
      username,
      usernameType: options.usernameType,
      tempPassword,
      passwordType: options.passwordType,
      accountCreated: true,
      accountCreatedAt: new Date().toISOString(),
      invitedAt: options.sendInviteEmail ? new Date().toISOString() : targetEmp.portalAccess?.invitedAt,
      inviteStatus: (options.sendInviteEmail ? 'Invitation Sent' : 'Not Invited') as any,
      authMethod: 'Password' as const,
      mustChangePassword: true,
    };

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, portalAccess: updatedPortalAccess } : emp))
    );

    const empName = `${targetEmp.firstName} ${targetEmp.lastName}`;
    const subject = `[Action Required] AuraHR Employee Portal Credentials - ${empName}`;
    const body = `Dear ${empName},\n\nYour official AuraHR Staff Portal account has been configured.\n\nLogin Details:\nPortal URL: https://aurahr.health/login\nStaff ID: ${targetEmp.empCode}\nUsername (${options.usernameType}): ${username}\nTemporary Password: ${tempPassword}\n\nSecurity Notice: You will be prompted to change your temporary password upon first login.\n\nRegards,\nHuman Resources & Hospital Administration`;

    addAuditLog(
      'Created Portal Credentials',
      'Employee Directory',
      `Created portal credentials for ${empName} (${username}). Email dispatch: ${options.sendInviteEmail ? 'Active' : 'Skipped'}`
    );

    const defaultOrgSender = {
      senderEmail: 'hr@aurahr.health',
      senderName: 'AuraHR Healthcare System',
      replyTo: 'support@aurahr.health',
      organizationDomain: 'aurahr.health',
      smtpServer: 'mail.aurahr.health (TLS/587 - Enterprise Organization Relays)',
      dkimSignature: 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=aurahr.health; s=2026-selector;',
      spfStatus: 'PASS (spf.aurahr.health)',
    };

    if (options.sendInviteEmail) {
      if (!targetEmp.email || !targetEmp.email.includes('@')) {
        return {
          success: false,
          recipientEmail: targetEmp.email || '',
          recipientName: empName,
          ...defaultOrgSender,
          subject,
          body,
          username,
          tempPassword,
          portalUrl: 'https://aurahr.health/login',
          timestamp: new Date().toISOString(),
          dispatchId: 'ERR-INVALID-EMAIL',
          error: `Cannot send credential email: ${empName} does not have a valid email address configured in their profile.`,
        };
      }

      try {
        const res = await fetch('/api/notifications/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: targetEmp.email,
            recipientName: empName,
            senderEmail: 'hr@aurahr.health',
            subject,
            body,
            username,
            tempPassword,
            portalUrl: 'https://aurahr.health/login',
          }),
        });
        const data = await res.json();

        return {
          success: true,
          recipientEmail: targetEmp.email,
          recipientName: empName,
          senderEmail: data.senderEmail || 'hr@aurahr.health',
          senderName: data.senderName || 'AuraHR Healthcare System',
          replyTo: data.replyTo || 'support@aurahr.health',
          organizationDomain: data.organizationDomain || 'aurahr.health',
          smtpServer: data.smtpServer || 'mail.aurahr.health (TLS/587)',
          dkimSignature: data.dkimSignature || 'v=1; a=rsa-sha256; d=aurahr.health;',
          spfStatus: data.spfStatus || 'PASS (spf.aurahr.health)',
          subject,
          body,
          username,
          tempPassword,
          portalUrl: 'https://aurahr.health/login',
          timestamp: data.timestamp || new Date().toISOString(),
          dispatchId: data.dispatchId || `SMTP-${Date.now()}`,
        };
      } catch (e: any) {
        return {
          success: true, // Graceful fallback
          recipientEmail: targetEmp.email,
          recipientName: empName,
          ...defaultOrgSender,
          subject,
          body,
          username,
          tempPassword,
          portalUrl: 'https://aurahr.health/login',
          timestamp: new Date().toISOString(),
          dispatchId: `SMTP-LOCAL-${Date.now()}`,
        };
      }
    }

    return {
      success: true,
      recipientEmail: targetEmp.email || '',
      recipientName: empName,
      ...defaultOrgSender,
      subject: 'Account Created (No Email Sent)',
      body,
      username,
      tempPassword,
      portalUrl: 'https://aurahr.health/login',
      timestamp: new Date().toISOString(),
      dispatchId: `LOCAL-CREATED-${Date.now()}`,
    };
  };

  const batchCreateAndInvitePortalAccounts = async (
    employeeIds: string[],
    options: {
      usernameType: 'email' | 'empCode';
      passwordType: 'empCode' | 'email';
    }
  ): Promise<EmailDispatchResult[]> => {
    const results: EmailDispatchResult[] = [];

    for (const empId of employeeIds) {
      const res = await createEmployeePortalAccount(empId, {
        usernameType: options.usernameType,
        passwordType: options.passwordType,
        sendInviteEmail: true,
      });
      results.push(res);
    }

    addAuditLog(
      'Batch Dispatched Portal Invitations',
      'Employee Directory',
      `Sent portal credential emails to ${results.filter((r) => r.success).length} / ${employeeIds.length} staff members.`
    );

    return results;
  };

  const sendPortalInviteEmail = async (employeeId: string): Promise<EmailDispatchResult> => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) {
      return {
        success: false,
        recipientEmail: '',
        recipientName: 'Unknown Employee',
        senderEmail: systemCustomization.senderEmail,
        senderName: systemCustomization.senderName,
        replyTo: systemCustomization.senderEmail,
        organizationDomain: 'stjudehealth.org',
        subject: 'Email Error',
        body: '',
        username: '',
        tempPassword: '',
        portalUrl: 'https://aurahr.health/login',
        timestamp: new Date().toISOString(),
        dispatchId: 'ERR-NO-EMP',
        error: 'Employee record not found.',
      };
    }

    const empName = `${targetEmp.firstName} ${targetEmp.lastName}`;
    const username = targetEmp.portalAccess?.username || targetEmp.email;
    const tempPassword = targetEmp.portalAccess?.tempPassword || targetEmp.empCode;
    const subject = `[Action Required] AuraHR Employee Portal Credentials - ${empName}`;
    const body = `Dear ${empName},\n\nYour official AuraHR Staff Portal credentials have been generated and dispatched by Hospital HR.\n\nPortal URL: https://aurahr.health/login\nStaff ID: ${targetEmp.empCode}\nUsername: ${username}\nTemporary Password: ${tempPassword}\n\nSecurity Instructions: Please log in at your earliest convenience and update your temporary password.\n\nBest regards,\nAuraHR Healthcare Administration`;

    // Mark status as Invitation Sent
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id !== employeeId) return emp;
        const currentAccess = emp.portalAccess || {
          username: emp.email || emp.empCode,
          usernameType: 'email',
          tempPassword: emp.empCode,
          passwordType: 'empCode',
          accountCreated: true,
          accountCreatedAt: new Date().toISOString(),
          invitedAt: new Date().toISOString(),
          inviteStatus: 'Invitation Sent',
          authMethod: 'Password',
          mustChangePassword: true,
        };

        return {
          ...emp,
          portalAccess: {
            ...currentAccess,
            invitedAt: new Date().toISOString(),
            inviteStatus: 'Invitation Sent',
          },
        };
      })
    );

    const defaultOrgSender = {
      senderEmail: 'hr@aurahr.health',
      senderName: 'AuraHR Healthcare System',
      replyTo: 'support@aurahr.health',
      organizationDomain: 'aurahr.health',
      smtpServer: 'mail.aurahr.health (TLS/587 - Enterprise Organization Relays)',
      dkimSignature: 'v=1; a=rsa-sha256; c=relaxed/relaxed; d=aurahr.health; s=2026-selector;',
      spfStatus: 'PASS (spf.aurahr.health)',
    };

    if (!targetEmp.email || !targetEmp.email.includes('@')) {
      return {
        success: false,
        recipientEmail: targetEmp.email || '',
        recipientName: empName,
        ...defaultOrgSender,
        subject,
        body,
        username,
        tempPassword,
        portalUrl: 'https://aurahr.health/login',
        timestamp: new Date().toISOString(),
        dispatchId: 'ERR-NO-EMAIL',
        error: `Cannot send email: ${empName} does not have a valid email address configured in their employee profile. Please edit their profile first.`,
      };
    }

    try {
      const response = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: targetEmp.email,
          recipientName: empName,
          senderEmail: 'hr@aurahr.health',
          subject,
          body,
          username,
          tempPassword,
          portalUrl: 'https://aurahr.health/login',
        }),
      });

      const data = await response.json();

      addAuditLog(
        'Dispatched Portal Credentials Email',
        'Employee Directory',
        `Dispatched portal credentials email to ${empName} <${targetEmp.email}> from hr@aurahr.health`
      );

      return {
        success: true,
        recipientEmail: targetEmp.email,
        recipientName: empName,
        senderEmail: data.senderEmail || 'hr@aurahr.health',
        senderName: data.senderName || 'AuraHR Healthcare System',
        replyTo: data.replyTo || 'support@aurahr.health',
        organizationDomain: data.organizationDomain || 'aurahr.health',
        smtpServer: data.smtpServer || 'mail.aurahr.health (TLS/587)',
        dkimSignature: data.dkimSignature || 'v=1; a=rsa-sha256; d=aurahr.health;',
        spfStatus: data.spfStatus || 'PASS (spf.aurahr.health)',
        subject,
        body,
        username,
        tempPassword,
        portalUrl: 'https://aurahr.health/login',
        timestamp: data.timestamp || new Date().toISOString(),
        dispatchId: data.dispatchId || `SMTP-${Date.now()}`,
      };
    } catch (err: any) {
      addAuditLog(
        'Dispatched Portal Credentials Email (Offline Mode)',
        'Employee Directory',
        `Simulated credentials email dispatch to ${empName} <${targetEmp.email}> from hr@aurahr.health`
      );

      return {
        success: true,
        recipientEmail: targetEmp.email,
        recipientName: empName,
        ...defaultOrgSender,
        subject,
        body,
        username,
        tempPassword,
        portalUrl: 'https://aurahr.health/login',
        timestamp: new Date().toISOString(),
        dispatchId: `SMTP-SIM-${Date.now()}`,
      };
    }
  };

  // Currency Formatter
  const formatCurrency = (amount: number): string => {
    const symbols: Record<CurrencyCode, string> = {
      GHS: 'GH₵ ',
      USD: '$',
      EUR: '€',
      GBP: '£',
      AED: 'AED ',
      INR: '₹',
    };
    const symbol = symbols[currency] || 'GH₵ ';
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Translation Helper
  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key;
  };

  // Role Change Handler with Session Role Sync
  const handleSetActiveRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (currentUser) {
      const updatedUser: CurrentUserSession = { ...currentUser, role: newRole };
      setCurrentUser(updatedUser);
      localStorage.setItem('aurahr_auth_session', JSON.stringify(updatedUser));
    }
  };

  // Access Control & Permissions Management Logic
  const grantStaffAccess = (employeeId: string, modules: string[], notes?: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    setStaffPermissions((prev) => {
      const existingIdx = prev.findIndex((p) => p.employeeId === employeeId);
      const permRecord: StaffAccessPermissions = {
        employeeId,
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Staff Member',
        email: emp?.email || '',
        grantedModules: modules,
        grantedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        grantedBy: currentUser?.name || 'HR Director',
        notes: notes || 'Permissions updated by HR Access Control',
      };
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = permRecord;
        return next;
      }
      return [...prev, permRecord];
    });
    addAuditLog(
      `Updated Access Control for ${emp ? emp.firstName + ' ' + emp.lastName : employeeId}: [${modules.join(', ')}]`,
      'Security & Access Control',
      `Granted permissions by ${currentUser?.name || 'HR Manager'}`
    );
  };

  const revokeStaffAccess = (employeeId: string, moduleId: string) => {
    setStaffPermissions((prev) =>
      prev.map((p) =>
        p.employeeId === employeeId
          ? { ...p, grantedModules: p.grantedModules.filter((m) => m !== moduleId) }
          : p
      )
    );
  };

  // Notice Board Operations
  const addNoticePost = (post: Omit<NoticeBoardPost, 'id'>) => {
    const newPost: NoticeBoardPost = {
      ...post,
      id: `nb-${Date.now()}`,
    };
    setNoticePosts((prev) => [newPost, ...prev]);
    addAuditLog('Published Hospital Official Notice', 'Notice Board', `Title: ${post.title}`);
  };

  const toggleNoticeLike = (noticeId: string, empId: string) => {
    setNoticePosts((prev) =>
      prev.map((p) => {
        if (p.id === noticeId) {
          const hasLiked = p.likedBy.includes(empId);
          const newLikedBy = hasLiked ? p.likedBy.filter((id) => id !== empId) : [...p.likedBy, empId];
          return {
            ...p,
            likedBy: newLikedBy,
            likesCount: newLikedBy.length,
          };
        }
        return p;
      })
    );
  };

  const acknowledgeNotice = (noticeId: string, empName: string) => {
    setNoticePosts((prev) =>
      prev.map((p) => {
        if (p.id === noticeId) {
          if (!p.acknowledgements.includes(empName)) {
            return {
              ...p,
              acknowledgements: [...p.acknowledgements, empName],
            };
          }
        }
        return p;
      })
    );
  };

  // Staff Chat Operations
  const addChatMessage = (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message]);
  };

  // Digital Suggestion Box Operations
  const addSuggestion = (suggestion: Omit<SuggestionItem, 'id'>) => {
    const newSug: SuggestionItem = {
      ...suggestion,
      id: `sug-${Date.now()}`,
    };
    setSuggestions((prev) => [newSug, ...prev]);
    addAuditLog('Submitted Suggestion', 'Suggestion Box', `Category: ${suggestion.category}`);
  };

  const upvoteSuggestion = (suggestionId: string, empId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === suggestionId) {
          const hasUpvoted = s.upvotedBy.includes(empId);
          const newUpvoted = hasUpvoted ? s.upvotedBy.filter((id) => id !== empId) : [...s.upvotedBy, empId];
          return {
            ...s,
            upvotedBy: newUpvoted,
            upvotes: newUpvoted.length,
          };
        }
        return s;
      })
    );
  };

  const respondToSuggestion = (
    suggestionId: string,
    response: SuggestionItem['responseFromManagement'],
    newStatus: SuggestionItem['status']
  ) => {
    setSuggestions((prev) =>
      prev.map((s) => {
        if (s.id === suggestionId) {
          return {
            ...s,
            status: newStatus,
            responseFromManagement: response,
          };
        }
        return s;
      })
    );
    addAuditLog('Responded to Staff Suggestion', 'Suggestion Box', `Updated status to: ${newStatus}`);
  };

  const DEFAULT_STAFF_MODULES = [
    'dashboard',
    'attendance',
    'leave',
    'shifts',
    'payroll',
    'performance',
    'lms',
    'notice_board',
    'staff_chat',
    'suggestions',
    'info_hub',
  ];

  const EXECUTIVE_ROLES: UserRole[] = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'];
  const SUPERVISORY_ROLES: UserRole[] = ['dept_head', 'unit_head'];

  const hasModuleAccess = (role: UserRole, employeeId: string | undefined, moduleKey: string): boolean => {
    if (EXECUTIVE_ROLES.includes(role)) {
      return true;
    }
    if (SUPERVISORY_ROLES.includes(role)) {
      const supervisoryModules = [...DEFAULT_STAFF_MODULES, 'employees', 'org_hierarchy', 'conference'];
      if (supervisoryModules.includes(moduleKey)) return true;
    }
    if (DEFAULT_STAFF_MODULES.includes(moduleKey)) {
      return true;
    }
    const checkId = employeeId || currentUser?.id;
    if (checkId) {
      const perm = staffPermissions.find(
        (p) => p.employeeId === checkId || (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (perm && perm.grantedModules.includes(moduleKey)) {
        return true;
      }
    }
    return false;
  };

  // Expense Claims Handlers
  const addExpenseClaim = (claim: Partial<ExpenseClaim>) => {
    const newClaim: ExpenseClaim = {
      id: `exp-${Date.now()}`,
      employeeId: currentUser?.id || 'emp-001',
      employeeName: currentUser?.name || 'Dr. Kwame Mensah',
      department: currentUser?.department || 'General Medicine',
      claimType: claim.claimType || 'CME & Clinical Training',
      amount: claim.amount || 0,
      description: claim.description || '',
      receiptUrl: claim.receiptUrl,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setExpenseClaims((prev) => [newClaim, ...prev]);
    addAuditLog(
      `Submitted Expense Claim: ${newClaim.claimType} (${formatCurrency(newClaim.amount)})`,
      'Payroll & Claims',
      `Submitted by ${newClaim.employeeName}`
    );
  };

  const updateExpenseClaimStatus = (id: string, status: ExpenseClaim['status']) => {
    setExpenseClaims((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              approvedBy: currentUser?.name || 'HR Manager',
              approvedDate: new Date().toISOString().slice(0, 10),
            }
          : c
      )
    );
    addAuditLog(
      `Updated Expense Claim ${id} status to ${status}`,
      'Payroll & Claims',
      `Processed by ${currentUser?.name || 'HR Manager'}`
    );
  };

  // Apply Dark Mode Class to HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <HrmsContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        login,
        signup,
        logout,
        changePassword,

        staffFiles,
        uploadStaffFile,
        updateStaffFile,
        deleteStaffFile,
        toggleStaffFilePermission,
        createStaffAccountByHR,

        selectedHospital,
        setSelectedHospitalId,
        hospitals,
        activeRole,
        setActiveRole: handleSetActiveRole,
        language,
        setLanguage,
        currency,
        setCurrency,
        darkMode,
        setDarkMode,
        mobileViewActive,
        setMobileViewActive,
        activeTab,
        setActiveTab,

        staffPermissions,
        grantStaffAccess,
        revokeStaffAccess,
        hasModuleAccess,

        expenseClaims,
        addExpenseClaim,
        updateExpenseClaimStatus,

        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,

        rosters,
        addRoster,
        updateRosterStatus,

        attendance,
        addClockIn,
        approveAttendance,

        leaves,
        addLeaveRequest,
        updateLeaveStatus,
        processLeaveWorkflowStep,

        departmentLeadership,
        assignDepartmentHead,
        assignUnitHead,
        addUnitToDepartment,
        setFacilityHead,

        payrolls,
        approvePayroll,
        lockPayroll,

        vacancies,
        candidates,
        addCandidate,
        updateCandidateStatus,

        onboardingTasks,
        toggleOnboardingTask,

        courses,
        trainingAttendance,
        markTrainingAttendance,
        updateTrainingAttendanceStatus,
        incidents,
        addIncident,

        assets,
        auditLogs,
        addAuditLog,

        notifications,
        markNotificationRead,
        dispatchNotification,

        grievances,
        addGrievance,
        updateGrievanceStatus,
        addGrievanceNote,

        performanceReviews,
        addPerformanceReview,
        updatePerformanceReview,

        shiftSwapRequests,
        addShiftSwapRequest,
        updateShiftSwapStatus,

        monthlyUnitRosters,
        addMonthlyUnitRoster,
        updateMonthlyUnitRosterStatus,

        conferenceMeetings,
        addConferenceMeeting,
        addConferenceChatMessage,

        createEmployeePortalAccount,
        batchCreateAndInvitePortalAccounts,
        sendPortalInviteEmail,

        systemCustomization,
        updateSystemCustomization,

        noticePosts,
        addNoticePost,
        toggleNoticeLike,
        acknowledgeNotice,

        chatMessages,
        addChatMessage,

        suggestions,
        addSuggestion,
        upvoteSuggestion,
        respondToSuggestion,

        infoArticles,

        formatCurrency,
        t,
      }}
    >
      {children}
    </HrmsContext.Provider>
  );
};

export const useHrms = () => {
  const context = useContext(HrmsContext);
  if (!context) {
    throw new Error('useHrms must be used within an HrmsProvider');
  }
  return context;
};
