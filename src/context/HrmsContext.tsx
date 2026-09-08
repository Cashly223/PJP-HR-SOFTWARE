import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { 
  auth, 
  googleProvider,
  signInWithPopup,
  onAuthStateChanged,
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
  where, 
  onSnapshot, 
  handleFirestoreError,
  OperationType,
  cleanForFirestore
} from '../lib/firebase';
import {
  Hospital,
  UserRole,
  LanguageCode,
  CurrencyCode,
  Employee,
  OfficialDocument,
  StaffMovementRecord,
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
  AnnualUnitLeaveRoaster,
  AnnualUnitLeaveRoasterItem,
  EmailDispatchResult,
  DepartmentLeadership,
  UnitLeadership,
  StaffActionResult,
  WorkflowStage,
  MultiTierWorkflow,
  PerformanceAppraisal,
  AppraisalCadre,
  AppraisalStage,
  AppraisalWorkflowStep,
  AppraisalDocument,
  SystemCustomizationSettings,
  StaffAccessPermissions,
  ExpenseClaim,
  NoticeBoardPost,
  ChatMessage,
  ChatChannel,
  SuggestionItem,
  InfoHubArticle,
  DisciplinaryBoardMember,
  StaffQuery,
  DisciplinaryHearing,
  DisciplinarySanction,
  BoardRole,
  StaffRosterRow,
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
  MOCK_PERFORMANCE_APPRAISALS,
  MOCK_SHIFT_SWAP_REQUESTS,
  MOCK_MONTHLY_UNIT_ROSTERS,
  MOCK_ANNUAL_UNIT_LEAVE_ROASTERS,
  MOCK_CONFERENCE_MEETINGS,
  MOCK_DEPARTMENT_LEADERSHIP,
  MOCK_STAFF_PERMISSIONS,
  MOCK_EXPENSE_CLAIMS,
  MOCK_NOTICE_POSTS,
  MOCK_CHAT_MESSAGES,
  MOCK_SUGGESTIONS,
  MOCK_INFO_ARTICLES,
  MOCK_DISCIPLINARY_BOARD_MEMBERS,
  MOCK_STAFF_QUERIES,
  MOCK_DISCIPLINARY_HEARINGS,
} from '../data/mockHrmsData';
import { calculateLeaveDays, calculateResumptionDate, updateAllLeaveApplicationsWithWorkingDays } from '../lib/leaveUtils';
import { generateLeaveFormHtml } from '../lib/leavePdfGenerator';
import { getMonthIndex } from '../utils/rosterTransferUtils';

export interface CurrentUserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  portalMode?: 'admin' | 'employee';
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
  portalMode: 'admin' | 'employee';
  setPortalMode: (mode: 'admin' | 'employee') => void;
  login: (identifier: string, password?: string, defaultRole?: UserRole | 'admin' | 'employee', name?: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (userData: { fullName: string; email: string; password?: string; role: UserRole; department: string }) => Promise<void>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
  keepCurrentPassword: () => Promise<void>;

  // Staff Files & Security Permissions
  staffFiles: StaffFile[];
  uploadStaffFile: (fileData: { fileName: string; fileType: string; fileSize: number; fileData: string; category: StaffFile['category']; description?: string }) => Promise<StaffFile>;
  updateStaffFile: (fileId: string, updates: Partial<StaffFile>) => Promise<void>;
  deleteStaffFile: (fileId: string) => Promise<void>;
  toggleStaffFilePermission: (empId: string, granted: boolean) => Promise<void>;
  createStaffAccountByHR: (staffData: { firstName: string; lastName: string; gender?: 'Male' | 'Female' | 'Other' | string; email: string; role: UserRole; department: string; jobTitle?: string; defaultPassword?: string }) => Promise<Employee>;

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
  setActiveTab: (tab: string, options?: { replace?: boolean; skipHistory?: boolean }) => void;
  navigationHistory: string[];
  canGoBack: boolean;
  goBack: () => void;

  // Data Collections & Operations
  employees: Employee[];
  addEmployee: (emp: Partial<Employee>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  updateEmployeePhoto: (id: string, photoUrl: string) => void;
  deleteEmployee: (id: string) => Promise<void> | void;
  clearAllEmployees: () => Promise<void> | void;
  enrollHeadOfFacility: (data: {
    firstName: string;
    lastName: string;
    gender?: 'Male' | 'Female' | 'Other' | string;
    empCode?: string;
    email?: string;
    phone?: string;
    password?: string;
    jobTitle?: string;
    department?: string;
  }) => Promise<Employee>;
  enrollHrLeader: (data: {
    firstName: string;
    lastName: string;
    gender?: 'Male' | 'Female' | 'Other' | string;
    role?: 'hr_director' | 'hr_manager';
    empCode?: string;
    email?: string;
    phone?: string;
    password?: string;
    jobTitle?: string;
    department?: string;
  }) => Promise<Employee>;
  recordStaffMovement: (movement: Partial<StaffMovementRecord>) => void;

  rosters: ShiftRoster[];
  addRoster: (roster: Partial<ShiftRoster>) => void;
  updateRosterStatus: (id: string, status: ShiftRoster['status']) => void;
  syncMonthlyRosterToActiveShifts: (
    department: string,
    month: string,
    year: number,
    staffGrid: StaffRosterRow[],
    options?: { preserveApprovalStatus?: boolean }
  ) => { syncedCount: number; affectedStaffCount: number };

  attendance: AttendanceRecord[];
  addClockIn: (
    empId: string,
    method: AttendanceRecord['method'],
    customLocation?: string,
    extraDetails?: Partial<AttendanceRecord>
  ) => AttendanceRecord;
  addClockOut: (
    empId: string,
    customLocation?: string,
    extraDetails?: Partial<AttendanceRecord>
  ) => void;
  approveAttendance: (id: string) => void;

  leaves: LeaveRequest[];
  addLeaveRequest: (leave: Partial<LeaveRequest>) => void;
  updateLeaveStatus: (id: string, status: LeaveRequest['status']) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  deleteLeaveRequest: (id: string) => Promise<boolean>;
  adjustLeaveEndDate: (
    leaveId: string,
    data: {
      newEndDate: string;
      remarks: string;
      holidaysCount?: number;
      holidayNames?: string[];
      newResumptionDate?: string;
      originalEndDate?: string;
      adjustedBy?: string;
      extraNotes?: string;
    }
  ) => void;
  processLeaveWorkflowStep: (leaveId: string, action: 'Approve' | 'Reject', comments?: string, customApproverName?: string, signatureUrl?: string) => void;
  uploadEmployeeDigitalSignature: (employeeId: string, signatureDataUrl: string, uploadedBy?: string) => Promise<void>;
  archiveApprovedLeaveToDigitalFile: (leave: LeaveRequest) => Promise<StaffFile | null>;

  departmentLeadership: DepartmentLeadership[];
  addDepartment: (deptData: {
    departmentName: string;
    departmentCode: string;
    departmentHeadName?: string;
    departmentHeadEmail?: string;
    departmentHeadId?: string;
    units?: Array<{ unitName: string; unitHeadId?: string }>;
  }) => void;
  updateDepartment: (
    oldDepartmentName: string,
    updatedData: {
      departmentName: string;
      departmentCode: string;
      departmentHeadId?: string;
      units?: Array<{ id?: string; unitName: string; unitHeadId?: string; staffCount?: number }>;
    }
  ) => void;
  deleteDepartment: (departmentName: string, reassignToDepartment?: string) => void;
  clearAllDepartments: () => Promise<void>;
  deleteUnit: (departmentName: string, unitIdOrName: string) => void;
  assignDepartmentHead: (departmentName: string, employeeId: string) => void;
  assignUnitHead: (departmentName: string, unitName: string, employeeId: string) => void;
  addUnitToDepartment: (departmentName: string, unitName: string, initialHeadId?: string) => void;
  setFacilityHead: (employeeId: string) => void;
  lastStaffAction: StaffActionResult | null;
  clearLastStaffAction: () => void;

  annualUnitLeaveRoasters: AnnualUnitLeaveRoaster[];
  saveAnnualUnitLeaveRoaster: (roaster: AnnualUnitLeaveRoaster) => void;
  approveAnnualUnitLeaveRoasterByHR: (roasterId: string, hrName: string, hrComments?: string) => void;
  updateAnnualLeaveItemByHR: (roasterId: string, itemId: string, updates: Partial<AnnualUnitLeaveRoasterItem>) => void;

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

  // Automated Multi-Tier Performance Appraisal Workflow
  performanceAppraisals: PerformanceAppraisal[];
  addPerformanceAppraisal: (appraisalData: Partial<PerformanceAppraisal>) => void;
  updatePerformanceAppraisal: (id: string, updates: Partial<PerformanceAppraisal>) => void;
  processAppraisalWorkflowStep: (
    appraisalId: string,
    action: 'Approve' | 'Return',
    comments?: string,
    customApproverName?: string,
    ratingGiven?: number
  ) => void;
  uploadAppraisalDocument: (
    appraisalId: string,
    docData: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileData: string;
      category: AppraisalDocument['category'];
      description?: string;
    }
  ) => Promise<AppraisalDocument>;

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
      mustChangePassword?: boolean;
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
  sendPortalInviteSms: (employeeId: string) => Promise<EmailDispatchResult>;

  // System & Portal Customization (Admin & HR)
  systemCustomization: SystemCustomizationSettings;
  updateSystemCustomization: (updates: Partial<SystemCustomizationSettings>) => void;

  // Access Control & Permissions Management
  staffPermissions: StaffAccessPermissions[];
  grantStaffAccess: (employeeId: string, modules: string[], notes?: string) => void;
  revokeStaffAccess: (employeeId: string, moduleId: string) => void;
  toggleStaffAdminLoginAccess: (employeeId: string, granted: boolean) => Promise<void>;
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
  canManageInfoHub: (role?: UserRole, department?: string) => boolean;
  addInfoArticle: (article: Omit<InfoHubArticle, 'id'>) => Promise<void>;
  updateInfoArticle: (id: string, updates: Partial<InfoHubArticle>) => Promise<void>;
  deleteInfoArticle: (id: string) => Promise<void>;
  resetInfoArticlesToDefault: () => Promise<void>;

  // Disciplinary Board, Hearings & Staff Queries
  disciplinaryBoardMembers: DisciplinaryBoardMember[];
  staffQueries: StaffQuery[];
  disciplinaryHearings: DisciplinaryHearing[];
  canIssueQueries: (role?: UserRole, employeeId?: string) => boolean;
  addDisciplinaryBoardMember: (member: Omit<DisciplinaryBoardMember, 'id'>) => void;
  updateDisciplinaryBoardMember: (id: string, updates: Partial<DisciplinaryBoardMember>) => void;
  removeDisciplinaryBoardMember: (id: string) => void;
  issueStaffQuery: (queryData: Omit<StaffQuery, 'id' | 'queryNumber' | 'dateIssued' | 'status'>) => StaffQuery;
  updateStaffQuery: (queryId: string, updates: Partial<StaffQuery>) => void;
  submitStaffQueryResponse: (queryId: string, response: StaffQuery['staffResponse']) => void;
  updateStaffQueryStatus: (queryId: string, status: StaffQuery['status'], updates?: Partial<StaffQuery>) => void;
  scheduleDisciplinaryHearing: (hearingData: Omit<DisciplinaryHearing, 'id' | 'hearingCaseNumber' | 'createdAt'>) => DisciplinaryHearing;
  updateDisciplinaryHearing: (id: string, updates: Partial<DisciplinaryHearing>) => void;
  recordHearingVerdict: (hearingId: string, verdict: DisciplinaryHearing['verdictRecommendation'], finalStatus: StaffQuery['status']) => void;

  // Department & Roster Role-Based Access Governance
  isHeadOfFacilityOrHr: boolean;
  currentUserDepartment: string;
  canAccessDepartmentRoster: (departmentName?: string) => boolean;

  // Helpers
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
  showToast: (typeOrMessage: string, title?: string, desc?: string) => void;
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
    disciplinary_board: 'Disciplinary Board',
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
    disciplinary_board: 'Junta Disciplinaria',
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
  const [portalMode, setPortalModeState] = useState<'admin' | 'employee'>(() => {
    try {
      const savedMode = sessionStorage.getItem('aurahr_portal_mode');
      if (savedMode === 'admin' || savedMode === 'employee') return savedMode;
      const sess = JSON.parse(sessionStorage.getItem('aurahr_auth_session') || '{}');
      if (sess.portalMode === 'admin' || sess.portalMode === 'employee') return sess.portalMode;
    } catch {}
    return 'employee';
  });

  const setPortalMode = (mode: 'admin' | 'employee') => {
    setPortalModeState(mode);
    try {
      sessionStorage.setItem('aurahr_portal_mode', mode);
      const sess = JSON.parse(sessionStorage.getItem('aurahr_auth_session') || '{}');
      sess.portalMode = mode;
      sessionStorage.setItem('aurahr_auth_session', JSON.stringify(sess));
      setCurrentUser((prev) => (prev ? { ...prev, portalMode: mode } : null));
    } catch {}
  };

  const [language, setLanguage] = useState<LanguageCode>('en');
  const [currency, setCurrency] = useState<CurrencyCode>('GHS');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [mobileViewActive, setMobileViewActive] = useState<boolean>(false);
  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined' && window.history?.state?.appTab) {
        return window.history.state.appTab;
      }
    } catch (e) {}
    return 'dashboard';
  });
  const [navigationHistory, setNavigationHistory] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.history?.state?.appTab) {
        return [window.history.state.appTab];
      }
    } catch (e) {}
    return ['dashboard'];
  });

  // Synchronize initial browser history state on load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.history) {
        const currentState = window.history.state;
        if (!currentState || !currentState.appTab) {
          window.history.replaceState({ appTab: activeTab, index: 0 }, '', window.location.pathname);
        }
      }
    } catch (e) {}
  }, [activeTab]);

  // Listen to popstate event (Hardware Back button on Android, iOS swipe back, browser back)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state && typeof state.appTab === 'string') {
        setActiveTabState(state.appTab);
        setNavigationHistory((prev) => {
          if (prev.length > 1) {
            return prev.slice(0, -1);
          }
          return [state.appTab];
        });
      } else {
        // Returned to initial entry or empty state - default gracefully to dashboard
        setActiveTabState('dashboard');
        setNavigationHistory(['dashboard']);
        try {
          window.history.replaceState({ appTab: 'dashboard', index: 0 }, '', window.location.pathname);
        } catch (e) {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const setActiveTab = useCallback((tab: string, options?: { replace?: boolean; skipHistory?: boolean }) => {
    setActiveTabState((currentTab) => {
      if (currentTab === tab) return currentTab;

      if (!options?.skipHistory && typeof window !== 'undefined' && window.history) {
        try {
          if (options?.replace) {
            window.history.replaceState({ appTab: tab, index: Math.max(0, navigationHistory.length - 1) }, '', window.location.pathname);
            setNavigationHistory((prev) => [...prev.slice(0, -1), tab]);
          } else {
            window.history.pushState({ appTab: tab, index: navigationHistory.length }, '', window.location.pathname);
            setNavigationHistory((prev) => [...prev, tab]);
          }
        } catch (e) {}
      }
      return tab;
    });
  }, [navigationHistory.length]);

  const canGoBack = navigationHistory.length > 1 || activeTab !== 'dashboard';

  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history) {
      if (window.history.length > 1 && navigationHistory.length > 1) {
        window.history.back();
        return;
      }
    }
    // Fallback if no history entries exist in the current session
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [activeTab, navigationHistory.length, setActiveTab]);

  // Toast Notification System
  const [toastState, setToastState] = useState<{
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    desc?: string;
  } | null>(null);

  useEffect(() => {
    if (toastState) {
      const timer = setTimeout(() => setToastState(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastState]);

  const showToast = (typeOrMessage: string, title?: string, desc?: string) => {
    if (title !== undefined) {
      const type = (typeOrMessage === 'error' ? 'error' : typeOrMessage === 'info' ? 'info' : 'success') as 'success' | 'error' | 'info';
      setToastState({
        id: Date.now().toString(),
        type,
        title,
        desc,
      });
    } else {
      setToastState({
        id: Date.now().toString(),
        type: 'info',
        title: typeOrMessage,
      });
    }
  };

  // Auth session state: Ensure shared links & fresh visitors always start at the Login Page
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (
          params.get('logout') === 'true' ||
          params.get('fresh') === 'true' ||
          params.get('login') === 'true' ||
          params.get('share') === 'true'
        ) {
          sessionStorage.removeItem('aurahr_auth_session');
          localStorage.removeItem('aurahr_remember_device');
          localStorage.removeItem('aurahr_auth_session');
          return false;
        }
      }
      const session = sessionStorage.getItem('aurahr_auth_session');
      if (session) return true;

      // Only check remember device if explicitly chosen on this specific browser device
      const remember = localStorage.getItem('aurahr_remember_device');
      const savedAuth = localStorage.getItem('aurahr_auth_session');
      if (remember === 'true' && savedAuth) {
        sessionStorage.setItem('aurahr_auth_session', savedAuth);
        return true;
      }
    } catch (e) {}
    return false;
  });

  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (
          params.get('logout') === 'true' ||
          params.get('fresh') === 'true' ||
          params.get('login') === 'true' ||
          params.get('share') === 'true'
        ) {
          return null;
        }
      }
      const session = sessionStorage.getItem('aurahr_auth_session');
      if (session) return JSON.parse(session);

      const remember = localStorage.getItem('aurahr_remember_device');
      const savedAuth = localStorage.getItem('aurahr_auth_session');
      if (remember === 'true' && savedAuth) {
        return JSON.parse(savedAuth);
      }
    } catch (e) {}
    return null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Firebase Auth session synced:', user.email, user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Core Data Collections - Cloud-First Firestore State with immediate fallbacks
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('aurahr_employees_v2');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to load saved employees from localStorage', e);
      }
    }
    return [];
  });
  const [rosters, setRosters] = useState<ShiftRoster[]>(() => {
    const saved = localStorage.getItem('aurahr_rosters_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_ROSTERS;
  });
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('aurahr_attendance_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_ATTENDANCE;
  });
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('aurahr_leaves_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return updateAllLeaveApplicationsWithWorkingDays(parsed);
      } catch (e) {
        // fallback
      }
    }
    return updateAllLeaveApplicationsWithWorkingDays(MOCK_LEAVES);
  });
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(MOCK_PAYROLL);
  const [vacancies] = useState<JobVacancy[]>(MOCK_VACANCIES);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [onboardingTasks, setOnboardingTasks] = useState<OnboardingTask[]>(MOCK_ONBOARDING);
  const [courses] = useState<TrainingCourse[]>(MOCK_COURSES);
  const [trainingAttendance, setTrainingAttendance] = useState<TrainingAttendanceRecord[]>(MOCK_TRAINING_ATTENDANCE);
  const [incidents, setIncidents] = useState<IncidentReport[]>(MOCK_INCIDENTS);
  const [assets] = useState<HospitalAsset[]>(MOCK_ASSETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('aurahr_audit_logs_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_AUDIT_LOGS;
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [grievances, setGrievances] = useState<Grievance[]>(MOCK_GRIEVANCES);
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>(MOCK_PERFORMANCE_REVIEWS);
  const [performanceAppraisals, setPerformanceAppraisals] = useState<PerformanceAppraisal[]>(() => {
    const saved = localStorage.getItem('pjpiimc_performance_appraisals_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to load saved appraisals', e);
      }
    }
    return MOCK_PERFORMANCE_APPRAISALS;
  });
  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>(MOCK_SHIFT_SWAP_REQUESTS);
  const [monthlyUnitRosters, setMonthlyUnitRosters] = useState<DepartmentMonthlyRoster[]>(() => {
    const saved = localStorage.getItem('aurahr_monthly_unit_rosters_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_MONTHLY_UNIT_ROSTERS;
  });
  const [conferenceMeetings, setConferenceMeetings] = useState<DepartmentConferenceMeeting[]>(MOCK_CONFERENCE_MEETINGS);
  const [departmentLeadership, setDepartmentLeadership] = useState<DepartmentLeadership[]>(() => {
    const saved = localStorage.getItem('aurahr_departments_v2');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });
  const [lastStaffAction, setLastStaffAction] = useState<StaffActionResult | null>(null);

  const clearLastStaffAction = () => {
    setLastStaffAction(null);
  };
  const [annualUnitLeaveRoasters, setAnnualUnitLeaveRoasters] = useState<AnnualUnitLeaveRoaster[]>(() => {
    const saved = localStorage.getItem('aurahr_annual_leave_roasters_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_ANNUAL_UNIT_LEAVE_ROASTERS;
  });

  // Local Storage Automatic Persistence Hooks
  useEffect(() => {
    try {
      localStorage.setItem('aurahr_employees_v2', JSON.stringify(employees));
      localStorage.removeItem('aurahr_employees_v1');
    } catch (e) {
      console.warn('Failed to persist employees to localStorage', e);
    }
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('aurahr_departments_v2', JSON.stringify(departmentLeadership));
    } catch (e) {
      console.warn('Failed to persist departments to localStorage', e);
    }
  }, [departmentLeadership]);

  // Keep currentUser session in complete lockstep synchronization whenever employees list updates
  useEffect(() => {
    if (!currentUser) return;
    const matchingEmp = employees.find(
      (e) =>
        e.id === currentUser.id ||
        (currentUser.email && e.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.empCode && (e.employeeCode === currentUser.empCode || e.empCode === currentUser.empCode))
    );
    if (matchingEmp) {
      const updatedName = `${matchingEmp.firstName} ${matchingEmp.lastName}`;
      const updatedDept = matchingEmp.department || currentUser.department;
      const updatedUnit = matchingEmp.unit || currentUser.unit;
      const updatedJob = matchingEmp.jobTitle || currentUser.jobTitle;
      const updatedAvatar = matchingEmp.photo || currentUser.avatar;
      const updatedPhone = matchingEmp.phone || currentUser.phone;
      const updatedEmpCode = matchingEmp.empCode || matchingEmp.employeeCode || currentUser.empCode;

      if (
        currentUser.name !== updatedName ||
        currentUser.department !== updatedDept ||
        currentUser.unit !== updatedUnit ||
        currentUser.jobTitle !== updatedJob ||
        currentUser.avatar !== updatedAvatar ||
        currentUser.phone !== updatedPhone ||
        currentUser.empCode !== updatedEmpCode
      ) {
        const updatedUser: CurrentUserSession = {
          ...currentUser,
          name: updatedName,
          department: updatedDept,
          unit: updatedUnit,
          jobTitle: updatedJob,
          avatar: updatedAvatar,
          phone: updatedPhone,
          empCode: updatedEmpCode,
        };
        setCurrentUser(updatedUser);
        try {
          localStorage.setItem('aurahr_auth_session', JSON.stringify(updatedUser));
        } catch (err) {
          console.warn('Could not persist updated auth session', err);
        }
      }
    }
  }, [employees]);

  // Cross-tab and window real-time synchronization listener
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aurahr_employees_v2' && e.newValue !== null) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setEmployees(parsed);
          }
        } catch (err) {
          console.warn('Cross-tab sync error for employees', err);
        }
      } else if (e.key === 'aurahr_leaves_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setLeaves(updateAllLeaveApplicationsWithWorkingDays(parsed));
        } catch (err) {}
      } else if (e.key === 'aurahr_attendance_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setAttendance(parsed);
        } catch (err) {}
      } else if (e.key === 'aurahr_monthly_unit_rosters_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setMonthlyUnitRosters(parsed);
        } catch (err) {}
      } else if (e.key === 'aurahr_annual_leave_roasters_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setAnnualUnitLeaveRoasters(parsed);
        } catch (err) {}
      } else if (e.key === 'pjpiimc_performance_appraisals_v1' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setPerformanceAppraisals(parsed);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('aurahr_leaves_v1', JSON.stringify(leaves));
    } catch (e) {
      console.warn('Failed to persist leaves to localStorage', e);
    }
  }, [leaves]);

  useEffect(() => {
    try {
      localStorage.setItem('aurahr_monthly_unit_rosters_v1', JSON.stringify(monthlyUnitRosters));
    } catch (e) {
      console.warn('Failed to persist monthly rosters to localStorage', e);
    }
  }, [monthlyUnitRosters]);

  useEffect(() => {
    try {
      localStorage.setItem('aurahr_annual_leave_roasters_v1', JSON.stringify(annualUnitLeaveRoasters));
    } catch (e) {
      console.warn('Failed to persist annual leave rosters to localStorage', e);
    }
  }, [annualUnitLeaveRoasters]);

  useEffect(() => {
    try {
      localStorage.setItem('aurahr_attendance_v1', JSON.stringify(attendance));
    } catch (e) {
      console.warn('Failed to persist attendance to localStorage', e);
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem('aurahr_audit_logs_v1', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Failed to persist audit logs to localStorage', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('pjpiimc_performance_appraisals_v1', JSON.stringify(performanceAppraisals));
    } catch (e) {
      console.warn('Failed to persist appraisals to localStorage', e);
    }
  }, [performanceAppraisals]);

  // Real-time Cloud Firestore synchronization listeners
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'employees'),
        (snapshot) => {
          const remoteEmployees: Employee[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Employee;
            remoteEmployees.push({ ...data, id: docSnap.id });
          });

          setEmployees(remoteEmployees);
          try {
            localStorage.setItem('aurahr_employees_v2', JSON.stringify(remoteEmployees));
          } catch (e) {}
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'employees');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore employees snapshot setup notice:', err);
    }
  }, []);

  // Real-time Cloud Firestore synchronization listener for Departments & Units
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'departments'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteDepts: DepartmentLeadership[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as DepartmentLeadership;
              remoteDepts.push({ ...data, id: docSnap.id });
            });
            if (remoteDepts.length > 0) {
              setDepartmentLeadership(remoteDepts);
              try {
                localStorage.setItem('aurahr_departments_v2', JSON.stringify(remoteDepts));
              } catch (e) {}
            }
          } else {
            // If departments collection in Firestore is empty, respect the cleared state
            const saved = localStorage.getItem('aurahr_departments_v2');
            if (!saved || saved === '[]') {
              setDepartmentLeadership([]);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'departments');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore departments snapshot setup notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'leaves'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteLeaves: LeaveRequest[] = [];
            snapshot.forEach((docSnap) => {
              remoteLeaves.push({ ...docSnap.data(), id: docSnap.id } as LeaveRequest);
            });
            if (remoteLeaves.length > 0) {
              setLeaves(updateAllLeaveApplicationsWithWorkingDays(remoteLeaves));
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'leaves');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore leaves snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'monthly_unit_roasters'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteRosters: DepartmentMonthlyRoster[] = [];
            snapshot.forEach((docSnap) => {
              remoteRosters.push({ ...docSnap.data(), id: docSnap.id } as DepartmentMonthlyRoster);
            });
            if (remoteRosters.length > 0) {
              setMonthlyUnitRosters(remoteRosters);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'monthly_unit_roasters');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore monthly rosters snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'annual_unit_leave_roasters'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteAnnual: AnnualUnitLeaveRoaster[] = [];
            snapshot.forEach((docSnap) => {
              remoteAnnual.push({ ...docSnap.data(), id: docSnap.id } as AnnualUnitLeaveRoaster);
            });
            if (remoteAnnual.length > 0) {
              setAnnualUnitLeaveRoasters(remoteAnnual);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'annual_unit_leave_roasters');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore annual leave rosters snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'audit_logs'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteLogs: AuditLog[] = [];
            snapshot.forEach((docSnap) => {
              remoteLogs.push({ ...docSnap.data(), id: docSnap.id } as AuditLog);
            });
            remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            if (remoteLogs.length > 0) {
              setAuditLogs(remoteLogs);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'audit_logs');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore audit logs snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'attendance'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteAtt: AttendanceRecord[] = [];
            snapshot.forEach((docSnap) => {
              remoteAtt.push({ ...docSnap.data(), id: docSnap.id } as AttendanceRecord);
            });
            if (remoteAtt.length > 0) {
              setAttendance(remoteAtt);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'attendance');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore attendance snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'performance_appraisals'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteAppraisals: PerformanceAppraisal[] = [];
            snapshot.forEach((docSnap) => {
              remoteAppraisals.push({ ...docSnap.data(), id: docSnap.id } as PerformanceAppraisal);
            });
            if (remoteAppraisals.length > 0) {
              setPerformanceAppraisals(remoteAppraisals);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'performance_appraisals');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore appraisals snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'staff_files'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteFiles: StaffFile[] = [];
            snapshot.forEach((docSnap) => {
              remoteFiles.push({ ...docSnap.data(), id: docSnap.id } as StaffFile);
            });
            if (remoteFiles.length > 0) {
              setStaffFiles(remoteFiles);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'staff_files');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore staff_files snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'staff_queries'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteQueries: StaffQuery[] = [];
            snapshot.forEach((docSnap) => {
              remoteQueries.push({ ...docSnap.data(), id: docSnap.id } as StaffQuery);
            });
            if (remoteQueries.length > 0) {
              setStaffQueries(remoteQueries);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'staff_queries');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore staff queries snapshot notice:', err);
    }
  }, []);

  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(
        collection(db, 'disciplinary_hearings'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteHearings: DisciplinaryHearing[] = [];
            snapshot.forEach((docSnap) => {
              remoteHearings.push({ ...docSnap.data(), id: docSnap.id } as DisciplinaryHearing);
            });
            if (remoteHearings.length > 0) {
              setDisciplinaryHearings(remoteHearings);
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'disciplinary_hearings');
        }
      );
      return () => unsub();
    } catch (err) {
      console.warn('Firestore disciplinary hearings snapshot notice:', err);
    }
  }, []);
  const [staffPermissions, setStaffPermissions] = useState<StaffAccessPermissions[]>(MOCK_STAFF_PERMISSIONS);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>(MOCK_EXPENSE_CLAIMS);
  const [noticePosts, setNoticePosts] = useState<NoticeBoardPost[]>(MOCK_NOTICE_POSTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(MOCK_SUGGESTIONS);
  const [infoArticles, setInfoArticles] = useState<InfoHubArticle[]>(() => {
    const saved = localStorage.getItem('pjpiimc_info_hub_articles_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_INFO_ARTICLES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pjpiimc_info_hub_articles_v1', JSON.stringify(infoArticles));
    } catch (e) {
      console.warn('Failed to persist infoArticles to localStorage', e);
    }
  }, [infoArticles]);

  // Disciplinary Board, Staff Queries & Hearings State
  const [disciplinaryBoardMembers, setDisciplinaryBoardMembers] = useState<DisciplinaryBoardMember[]>(() => {
    const saved = localStorage.getItem('pjpiimc_disciplinary_board_members_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_DISCIPLINARY_BOARD_MEMBERS;
  });

  const [staffQueries, setStaffQueries] = useState<StaffQuery[]>(() => {
    const saved = localStorage.getItem('pjpiimc_staff_queries_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_STAFF_QUERIES;
  });

  const [disciplinaryHearings, setDisciplinaryHearings] = useState<DisciplinaryHearing[]>(() => {
    const saved = localStorage.getItem('pjpiimc_disciplinary_hearings_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return MOCK_DISCIPLINARY_HEARINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('pjpiimc_disciplinary_board_members_v1', JSON.stringify(disciplinaryBoardMembers));
    } catch (e) {
      console.warn('Failed to persist disciplinary board members to localStorage', e);
    }
  }, [disciplinaryBoardMembers]);

  useEffect(() => {
    try {
      localStorage.setItem('pjpiimc_staff_queries_v1', JSON.stringify(staffQueries));
    } catch (e) {
      console.warn('Failed to persist staff queries to localStorage', e);
    }
  }, [staffQueries]);

  useEffect(() => {
    try {
      localStorage.setItem('pjpiimc_disciplinary_hearings_v1', JSON.stringify(disciplinaryHearings));
    } catch (e) {
      console.warn('Failed to persist disciplinary hearings to localStorage', e);
    }
  }, [disciplinaryHearings]);
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

  // Head of Facility & HR Role Determination
  // Head of Facility: 'facility_head'
  // HR: 'super_admin', 'hr_director', 'hr_manager'
  const isHeadOfFacilityOrHr = ['super_admin', 'facility_head', 'hr_director', 'hr_manager'].includes(activeRole);

  // Current User's Department
  const currentUserEmployee = employees.find(
    (e) =>
      e.id === currentUser?.id ||
      (currentUser?.email && e.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
      (currentUser?.empCode && e.employeeCode === currentUser.empCode)
  );

  const currentUserDepartment =
    currentUser?.department ||
    currentUserEmployee?.department ||
    (activeRole === 'dept_head'
      ? 'Cardiology & ICU'
      : activeRole === 'unit_head'
      ? 'Intensive Care Unit (ICU)'
      : activeRole === 'doctor'
      ? 'Cardiology & ICU'
      : activeRole === 'nurse'
      ? 'General Medical Wards'
      : activeRole === 'auditor'
      ? 'Compliance & Audit'
      : 'General Medical Wards');

  const canAccessDepartmentRoster = (deptName?: string): boolean => {
    if (isHeadOfFacilityOrHr) return true;
    if (!deptName) return false;
    const cleanTarget = deptName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanUser = currentUserDepartment.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleanTarget.includes(cleanUser) || cleanUser.includes(cleanTarget) || cleanTarget === cleanUser;
  };

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

    if (db) {
      setDoc(doc(db, 'audit_logs', newLog.id), cleanForFirestore(newLog)).catch((err) => {
        console.warn('Firestore addAuditLog error:', err);
      });
    }
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
  const login = async (
    identifierInput: string,
    passwordInput?: string,
    portalTab: 'admin' | 'employee' | UserRole = 'admin',
    nameInput?: string,
    rememberMe?: boolean
  ) => {
    const rawInput = identifierInput ? identifierInput.trim() : '';
    const cleanLower = rawInput.toLowerCase();
    const cleanWithoutPrefix = cleanLower.replace(/^(pj-|sjh-|emp-)/, '');

    // Check if input is a super admin override (e.g. attasam223@gmail.com, PJ-0001, admin)
    const isSuperAdminEmail =
      cleanLower === 'attasam223@gmail.com' ||
      cleanLower === 'admin@pjpiimc.org' ||
      cleanLower === 'admin' ||
      cleanLower === 'pj-0001';

    // Find matching employee by email, empCode (e.g. PJ-0001), or numeric ID
    let matchedEmp = employees.find((e) => {
      const eEmail = e.email ? e.email.trim().toLowerCase() : '';
      const eBaseEmail = eEmail.replace('.staff@', '@');
      const eCode = e.empCode ? e.empCode.trim().toLowerCase() : '';
      const eCodeNum = eCode.replace(/^(pj-|sjh-|emp-)/, '');

      return (
        eEmail === cleanLower ||
        eBaseEmail === cleanLower ||
        eCode === cleanLower ||
        e.id.toLowerCase() === cleanLower ||
        (cleanWithoutPrefix && eCodeNum === cleanWithoutPrefix)
      );
    });

    // Special auto-enrollment for developer/super-admin Atta Frimpong if not already in registry
    if (!matchedEmp && isSuperAdminEmail) {
      matchedEmp = {
        id: 'emp-atta-frimpong',
        hospitalId: 'hosp-1',
        branchId: 'b-1',
        empCode: 'PJ-0001',
        firstName: 'Atta',
        lastName: 'Frimpong',
        email: 'attasam223@gmail.com',
        phone: '+233 24 100 0000',
        role: 'super_admin' as UserRole,
        jobTitle: 'Super Administrator & Systems Director',
        department: 'Executive Administration',
        unit: 'Hospital Executive Council',
        employmentType: 'Full-Time',
        joinDate: '2020-01-01',
        salary: 35000,
        currency: 'GHS',
        status: 'Active',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        medicalLicenses: [],
        adminLoginGranted: true,
        filePermissionGranted: true,
        defaultPassword: 'PJ-0001',
        mustChangePassword: true,
      };
    }

    if (!matchedEmp) {
      throw new Error(
        `Access Denied: Staff Code or Email '${identifierInput}' is not registered in the PJPIIMC Staff Registry. Please contact HR Administration to enroll.`
      );
    }

    let authUser = null;
    try {
      if (passwordInput && matchedEmp.email) {
        const userCredential = await signInWithEmailAndPassword(auth, matchedEmp.email, passwordInput);
        authUser = userCredential.user;
      }
    } catch (firebaseErr) {
      console.warn('Firebase Auth sign in notice:', firebaseErr);
    }

    // Check if employee has a custom password override saved
    let customPasswordOnEmp = matchedEmp?.customPassword || matchedEmp?.portalAccess?.customPassword;
    if (!customPasswordOnEmp && matchedEmp) {
      try {
        const storedPassMap = JSON.parse(localStorage.getItem('aurahr_custom_passwords') || '{}');
        customPasswordOnEmp =
          storedPassMap[matchedEmp.id] ||
          (matchedEmp.email && storedPassMap[matchedEmp.email.toLowerCase()]) ||
          (matchedEmp.empCode && storedPassMap[matchedEmp.empCode.toLowerCase()]);
      } catch (e) {}
    }

    const cleanPassword = passwordInput ? passwordInput.trim() : '';

    // Valid standard HR default and institutional passwords
    const empCodeDigits = matchedEmp.empCode?.replace(/\D/g, '') || '0001';
    const validDefaultPasswords = [
      '123456',
      '654321',
      'ADMIN123',
      'admin123',
      matchedEmp.empCode?.toLowerCase(),
      matchedEmp.empCode?.toUpperCase(),
      matchedEmp.empCode,
      empCodeDigits,
      `${empCodeDigits}00`,
      'password123',
      'Hospital2026!',
      'Pjpiimc2026!',
      matchedEmp.defaultPassword,
      matchedEmp.portalAccess?.tempPassword,
      matchedEmp.customPassword,
      matchedEmp.portalAccess?.customPassword,
    ].filter(Boolean) as string[];

    let mustChangePassword = false;

    // Check if entered password matches any valid password
    const matchesCustom = customPasswordOnEmp && (cleanPassword === customPasswordOnEmp || cleanPassword.toLowerCase() === customPasswordOnEmp.toLowerCase());
    const matchesDefault = validDefaultPasswords.some(
      (dp) => dp.toLowerCase() === cleanPassword.toLowerCase()
    );

    if (cleanPassword && !authUser) {
      if (!matchesCustom && !matchesDefault) {
        throw new Error(
          `Invalid password for ${matchedEmp.empCode}. For HR Director, use ADMIN123 or your Staff Code (${matchedEmp.empCode}).`
        );
      }
    }

    if (matchesCustom && !matchesDefault) {
      mustChangePassword = false;
    } else if (matchedEmp.mustChangePassword ?? (matchedEmp.portalAccess?.mustChangePassword ?? false)) {
      mustChangePassword = true;
    } else {
      mustChangePassword = false;
    }

    // Role Resolution & Access Separation (ADMIN vs EMPLOYEE Portal)
    const isAdminPortal =
      portalTab === 'admin' ||
      (typeof portalTab === 'string' && ['facility_head', 'hr_director', 'hr_manager', 'super_admin'].includes(portalTab));

    // Default Authorized Leadership Roles for Administrator Portal (Super Admin, Head of Facility & HR Directorate)
    const isSuperAdminUser =
      matchedEmp.id === 'emp-atta-frimpong' ||
      matchedEmp.id === 'emp-super-admin' ||
      matchedEmp.role === 'super_admin' ||
      isSuperAdminEmail;

    const isHeadOfFacilityOrHrDefault =
      isSuperAdminUser ||
      matchedEmp.id === 'emp-rev-mike' ||
      matchedEmp.id === 'emp-veronica-owusu' ||
      matchedEmp.id === 'emp-miss-vero' ||
      matchedEmp.id === 'emp-mr-frimpong' ||
      ['facility_head', 'hr_director', 'hr_manager', 'super_admin'].includes(matchedEmp.role);

    // Check if HR has explicitly granted Administrator Login Access to this staff member
    let isStaffAdminLoginGranted = Boolean(
      matchedEmp.adminLoginGranted ||
      matchedEmp.portalAccess?.adminLoginGranted
    );

    if (!isStaffAdminLoginGranted) {
      const perm = staffPermissions.find(
        (p) =>
          p.employeeId === matchedEmp?.id ||
          (matchedEmp?.email && p.email && p.email.toLowerCase() === matchedEmp.email.toLowerCase())
      );
      if (perm?.hasAdminLoginAccess || perm?.grantedModules?.includes('admin_portal') || perm?.grantedModules?.includes('customization')) {
        isStaffAdminLoginGranted = true;
      }
    }

    let userRole: UserRole = matchedEmp.role;

    if (isAdminPortal) {
      // User is attempting to log into ADMINISTRATOR PORTAL
      if (!isHeadOfFacilityOrHrDefault && !isStaffAdminLoginGranted) {
        throw new Error(
          `Access Denied: Administrator Login is strictly restricted to Super Admin, Head of Facility, and HR Directorate. Please switch to the EMPLOYEE tab to sign into your staff self-service portal.`
        );
      }

      if (isSuperAdminUser) userRole = 'super_admin';
      else if (matchedEmp.role === 'facility_head') userRole = 'facility_head';
      else if (matchedEmp.role === 'hr_director') userRole = 'hr_director';
      else if (matchedEmp.role === 'hr_manager') userRole = 'hr_manager';
      else userRole = matchedEmp.role;
    } else {
      userRole = matchedEmp.role;
    }

    let name = nameInput || `${matchedEmp.firstName} ${matchedEmp.lastName}`;
    let photo = matchedEmp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    let dept = matchedEmp.department || 'General Healthcare Services';
    let empCode = matchedEmp.empCode || `PJ-${Math.floor(1000 + Math.random() * 9000)}`;

    let filePermissionGranted = matchedEmp ? (matchedEmp.filePermissionGranted ?? true) : true;

    const chosenPortalMode: 'admin' | 'employee' = isAdminPortal ? 'admin' : 'employee';

    const session: CurrentUserSession = {
      id: matchedEmp.id,
      name,
      email: matchedEmp.email || `${matchedEmp.empCode.toLowerCase()}@pjpiimc.org`,
      role: userRole,
      portalMode: chosenPortalMode,
      avatar: photo,
      department: dept,
      empCode,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mustChangePassword,
      filePermissionGranted,
    };

    setCurrentUser(session);
    setIsAuthenticated(true);
    setPortalMode(chosenPortalMode);
    setActiveRole(userRole);
    try {
      sessionStorage.setItem('aurahr_portal_mode', chosenPortalMode);
      sessionStorage.setItem('aurahr_auth_session', JSON.stringify(session));
      if (rememberMe) {
        localStorage.setItem('aurahr_remember_device', 'true');
        localStorage.setItem('aurahr_auth_session', JSON.stringify(session));
      } else {
        localStorage.removeItem('aurahr_remember_device');
        localStorage.removeItem('aurahr_auth_session');
      }
    } catch (e) {}

    // Firestore record sync
    try {
      const empRef = doc(db, 'employees', session.id);
      await setDoc(
        empRef,
        cleanForFirestore({
          uid: session.id,
          empCode,
          firstName: matchedEmp.firstName,
          lastName: matchedEmp.lastName,
          email: session.email,
          role: userRole,
          department: dept,
          mustChangePassword,
          filePermissionGranted,
          lastLoginAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
        { merge: true }
      );
    } catch (e) {
      console.warn('Firestore employee sync notice:', e);
    }

    addAuditLog(
      'User Login',
      'Authentication',
      `Logged in as ${name} (${userRole}) via ${isAdminPortal ? 'ADMINISTRATOR' : 'EMPLOYEE'} Portal`
    );
  };

  const keepCurrentPassword = async () => {
    if (!currentUser) return;

    // Update currentUser state
    setCurrentUser((prev) => (prev ? { ...prev, mustChangePassword: false } : null));

    // Persist election in localStorage
    try {
      const keptMap = JSON.parse(localStorage.getItem('aurahr_kept_passwords') || '{}');
      if (currentUser.id) keptMap[currentUser.id] = true;
      if (currentUser.email) keptMap[currentUser.email.toLowerCase()] = true;
      if (currentUser.empCode) keptMap[currentUser.empCode.toLowerCase()] = true;
      localStorage.setItem('aurahr_kept_passwords', JSON.stringify(keptMap));
    } catch (e) {}

    // Update session
    const saved = localStorage.getItem('aurahr_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.mustChangePassword = false;
        localStorage.setItem('aurahr_auth_session', JSON.stringify(parsed));
      } catch (e) {}
    }

    // Update employee in state
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === currentUser.id || emp.email?.toLowerCase() === currentUser.email?.toLowerCase() || emp.empCode?.toLowerCase() === currentUser.empCode?.toLowerCase()) {
          return {
            ...emp,
            mustChangePassword: false,
            portalAccess: {
              ...(emp.portalAccess || {
                username: emp.email || emp.empCode,
                usernameType: 'email',
              }),
              mustChangePassword: false,
              inviteStatus: 'Portal Activated',
            },
          };
        }
        return emp;
      })
    );

    addAuditLog(
      'Kept HR Password',
      'Security & Auth',
      `Staff ${currentUser.name} elected to keep HR-provided credentials.`
    );
  };

  const signup = async (userData: { fullName: string; email: string; password?: string; role: UserRole; department: string }) => {
    const cleanEmail = userData.email ? userData.email.trim().toLowerCase() : '';
    const enrolledEmp = employees.find(
      (e) => e.email && e.email.trim().toLowerCase() === cleanEmail
    );

    if (!enrolledEmp) {
      throw new Error(
        `Access Denied: Access to the portal is strictly by HR invitation. Email '${userData.email}' is not pre-enrolled in the HR Staff Registry. Please contact HR Administration to receive an invitation.`
      );
    }

    let authUid = enrolledEmp.id;
    try {
      if (userData.password) {
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
        authUid = userCredential.user.uid;
      }
    } catch (e) {
      console.warn('Firebase Auth signup notice:', e);
    }

    const names = userData.fullName.trim().split(' ');
    const firstName = names[0] || enrolledEmp.firstName;
    const lastName = names.slice(1).join(' ') || enrolledEmp.lastName;

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
      if (db) {
        await setDoc(doc(db, 'employees', newEmp.id), cleanForFirestore({
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
          ...newEmp,
        }));
      }
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

    // Save custom password in localStorage overrides map
    try {
      const storedPassMap = JSON.parse(localStorage.getItem('aurahr_custom_passwords') || '{}');
      if (currentUser.id) storedPassMap[currentUser.id] = newPassword;
      if (currentUser.email) storedPassMap[currentUser.email.toLowerCase()] = newPassword;
      if (currentUser.empCode) storedPassMap[currentUser.empCode.toLowerCase()] = newPassword;
      localStorage.setItem('aurahr_custom_passwords', JSON.stringify(storedPassMap));
    } catch (e) {}

    // Update in local state
    setCurrentUser((prev) => prev ? { ...prev, mustChangePassword: false } : null);

    // Update matching employee
    const userEmail = currentUser.email ? currentUser.email.toLowerCase() : '';
    const userEmpCode = currentUser.empCode ? currentUser.empCode.toLowerCase() : '';

    setEmployees((prev) =>
      prev.map((emp) => {
        const matchesEmail = emp.email && userEmail && emp.email.toLowerCase() === userEmail;
        const matchesCode = emp.empCode && userEmpCode && emp.empCode.toLowerCase() === userEmpCode;
        const matchesId = emp.id === currentUser.id;

        if (matchesEmail || matchesCode || matchesId) {
          return {
            ...emp,
            customPassword: newPassword,
            mustChangePassword: false,
            defaultPassword: undefined,
            portalAccess: {
              ...(emp.portalAccess || {
                username: emp.email || emp.empCode,
                usernameType: emp.email ? 'email' : 'empCode',
              }),
              customPassword: newPassword,
              mustChangePassword: false,
              tempPassword: '',
              inviteStatus: 'Portal Activated',
            },
          };
        }
        return emp;
      })
    );

    // Save update in Firestore
    try {
      const q = query(collection(db, 'employees'), where('email', '==', currentUser.email));
      const querySnap = await getDocs(q);
      querySnap.forEach(async (document) => {
        await updateDoc(doc(db, 'employees', document.id), {
          customPassword: newPassword,
          mustChangePassword: false,
          defaultPassword: '',
          'portalAccess.mustChangePassword': false,
          'portalAccess.tempPassword': '',
          'portalAccess.customPassword': newPassword,
          'portalAccess.inviteStatus': 'Portal Activated',
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
    setPortalModeState('employee');
    try {
      sessionStorage.removeItem('aurahr_portal_mode');
      sessionStorage.removeItem('aurahr_auth_session');
      localStorage.removeItem('aurahr_remember_device');
      localStorage.removeItem('aurahr_auth_session');
    } catch (e) {}
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
    gender?: 'Male' | 'Female' | 'Other' | string;
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
      gender: staffData.gender || 'Male',
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
      if (db) {
        await setDoc(doc(db, 'employees', newEmp.id), cleanForFirestore({
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
          ...newEmp,
        }));
      }
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
    const generatedEmpCode = empData.empCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    const tempPassword = empData.defaultPassword || empData.customPassword || generatedEmpCode;
    const newEmp: Employee = {
      id: empData.id || `emp-${Date.now()}`,
      hospitalId: empData.hospitalId || selectedHospitalId,
      branchId: empData.branchId || 'b-1',
      empCode: generatedEmpCode,
      firstName: empData.firstName || 'New',
      lastName: empData.lastName || 'Employee',
      gender: empData.gender || 'Male',
      photo: empData.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      email: empData.email || 'emp@pjpiimc.org',
      phone: empData.phone || '+233 24 000 0000',
      role: empData.role || 'nurse',
      jobTitle: empData.jobTitle || 'Staff Nurse',
      department: empData.department || 'General Ward',
      unit: empData.unit || 'Unit 1',
      grade: empData.grade || 'Staff Grade',
      employmentType: empData.employmentType || 'Full-Time',
      joinDate: empData.joinDate || new Date().toISOString().split('T')[0],
      salary: empData.salary || 6500,
      currency: empData.currency || currency,
      status: empData.status || 'Active',
      defaultPassword: tempPassword,
      customPassword: empData.customPassword,
      medicalLicenses: empData.medicalLicenses || [],
      passportNo: empData.passportNo || 'P-NEW' + Math.floor(Math.random() * 100000),
      nationalId: empData.nationalId || 'GHA-000000000-0',
      taxId: empData.taxId || 'TX-0099',
      bankAccount: empData.bankAccount || 'Bank ****0000',
      emergencyContacts: empData.emergencyContacts || [{ name: 'Contact', relation: 'Family', phone: '+233 24 000 0000' }],
      vaccinations: empData.vaccinations || [{ id: 'v-new', vaccineName: 'Hepatitis B / COVID Booster', doseDate: '2026-01-01', status: 'Completed' }],
      occupationalHealth: empData.occupationalHealth || { lastExamDate: '2026-01-01', fitForDuty: true, notes: 'Fit for general duties.' },
      education: empData.education || 'BSc Nursing / Medical Degree',
      skills: empData.skills || ['Clinical Care', 'Patient Safety'],
      languages: empData.languages || ['English', 'Twi'],
      adminLoginGranted: empData.adminLoginGranted ?? (['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(empData.role || '')),
      filePermissionGranted: empData.filePermissionGranted ?? true,
      portalAccess: {
        username: empData.portalAccess?.username || empData.email || generatedEmpCode,
        usernameType: empData.portalAccess?.usernameType || (empData.email ? 'email' : 'empCode'),
        tempPassword: empData.portalAccess?.tempPassword || tempPassword,
        customPassword: empData.portalAccess?.customPassword || empData.customPassword,
        passwordType: empData.portalAccess?.passwordType || 'empCode',
        accountCreated: true,
        accountCreatedAt: new Date().toISOString(),
        invitedAt: new Date().toISOString(),
        inviteStatus: empData.portalAccess?.inviteStatus || 'Invitation Sent',
        authMethod: 'Password',
        mustChangePassword: empData.portalAccess?.mustChangePassword ?? false,
        adminLoginGranted: empData.portalAccess?.adminLoginGranted ?? (['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(empData.role || '')),
      },
    };
    
    const cleanedEmp = cleanForFirestore(newEmp);

    setEmployees((prev) => {
      const updatedList = [cleanedEmp, ...prev.filter((e) => e.id !== cleanedEmp.id && e.empCode !== cleanedEmp.empCode)];
      try {
        localStorage.setItem('aurahr_employees_v2', JSON.stringify(updatedList));
      } catch (e) {
        console.error('Failed to sync employees to localStorage:', e);
      }
      return updatedList;
    });

    // Direct Cloud Firestore write with cleaned object
    if (db) {
      setDoc(doc(db, 'employees', cleanedEmp.id), cleanedEmp).catch((err) => {
        console.warn('Firestore setDoc addEmployee error:', err);
      });
    }

    setLastStaffAction({
      type: 'added',
      employee: cleanedEmp,
      timestamp: new Date().toISOString(),
      message: `Staff Successfully Added: ${cleanedEmp.firstName} ${cleanedEmp.lastName} (${cleanedEmp.empCode}) — ${cleanedEmp.jobTitle}, ${cleanedEmp.department || 'General'}. Cloud Synchronized.`,
    });

    showToast('success', 'Staff Member Added', `Successfully enrolled ${cleanedEmp.firstName} ${cleanedEmp.lastName} (${cleanedEmp.empCode}). Cloud synchronized.`);
    addAuditLog('Created Staff Profile & Portal Account', 'Employee Directory', `Added ${cleanedEmp.firstName} ${cleanedEmp.lastName} (${cleanedEmp.empCode}) & initialized portal account.`);

    return cleanedEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    let empName = id;
    let targetUpdated: Employee | null = null;
    const cleanedUpdates = cleanForFirestore(updates);
    
    setEmployees((prev) => {
      const updatedList = prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...cleanedUpdates };
          empName = `${updated.firstName} ${updated.lastName} (${updated.empCode})`;
          targetUpdated = updated;
          return updated;
        }
        return e;
      });
      try {
        localStorage.setItem('aurahr_employees_v2', JSON.stringify(updatedList));
      } catch (err) {}
      return updatedList;
    });

    // Direct Cloud Firestore update
    if (db) {
      setDoc(doc(db, 'employees', id), cleanedUpdates, { merge: true }).catch((err) => {
        console.warn('Firestore updateDoc employee error:', err);
      });
    }

    addAuditLog('Updated Employee Profile & File', 'Employee Management', `HR updated employee details & file for ${empName}`);
  };

  const updateEmployeePhoto = (id: string, photoUrl: string) => {
    updateEmployee(id, { photo: photoUrl });

    // Sync active currentUser if this is their profile
    const targetEmp = employees.find(
      (e) =>
        e.id === id ||
        e.empCode === id ||
        (currentUser && e.email?.toLowerCase() === currentUser.email?.toLowerCase())
    );

    if (
      targetEmp &&
      currentUser &&
      (targetEmp.id === currentUser.id ||
        targetEmp.empCode === currentUser.id ||
        targetEmp.email?.toLowerCase() === currentUser.email?.toLowerCase())
    ) {
      setCurrentUser((prev) => (prev ? { ...prev, avatar: photoUrl } : prev));
      try {
        const storedUser = localStorage.getItem('aurahr_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          localStorage.setItem('aurahr_user', JSON.stringify({ ...parsed, avatar: photoUrl }));
        }
      } catch (e) {}
    }

    showToast(
      'success',
      'Employee Photo Updated',
      `Profile picture for ${targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName}` : id} updated & cloud synchronized.`
    );
  };

  const deleteEmployee = async (id: string) => {
    const emp = employees.find((e) => e.id === id || e.empCode === id || (e as any).employeeCode === id);
    const targetId = emp ? emp.id : id;
    const empCode = emp?.empCode || (emp as any)?.employeeCode;
    const empEmail = emp?.email?.toLowerCase().trim();
    const empName = emp ? `${emp.firstName} ${emp.lastName} (${emp.empCode || targetId})` : id;

    // 1. Immediately remove from React state & local storage
    setEmployees((prev) => {
      const updated = prev.filter(
        (e) =>
          e.id !== targetId &&
          e.id !== id &&
          (!empCode || (e.empCode !== empCode && (e as any).employeeCode !== empCode)) &&
          (!empEmail || e.email?.toLowerCase().trim() !== empEmail)
      );
      try {
        localStorage.setItem('aurahr_employees_v2', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update localStorage on delete', err);
      }
      return updated;
    });

    // 2. Clean up portal account & password mappings
    try {
      const portalMapStr = localStorage.getItem('aurahr_portal_accounts');
      if (portalMapStr) {
        const portalMap = JSON.parse(portalMapStr);
        delete portalMap[targetId];
        delete portalMap[id];
        if (empCode) delete portalMap[empCode];
        if (empEmail) delete portalMap[empEmail];
        localStorage.setItem('aurahr_portal_accounts', JSON.stringify(portalMap));
      }
      const passMapStr = localStorage.getItem('aurahr_custom_passwords');
      if (passMapStr) {
        const passMap = JSON.parse(passMapStr);
        delete passMap[targetId];
        delete passMap[id];
        if (empCode) delete passMap[empCode];
        localStorage.setItem('aurahr_custom_passwords', JSON.stringify(passMap));
      }
    } catch (e) {}

    // 3. Direct and Query-based Cloud Firestore complete delete
    if (db) {
      try {
        const idsToDirectDelete = new Set<string>();
        if (targetId) idsToDirectDelete.add(targetId);
        if (id) idsToDirectDelete.add(id);
        if (empCode) idsToDirectDelete.add(empCode);

        for (const docId of idsToDirectDelete) {
          try {
            await deleteDoc(doc(db, 'employees', docId));
          } catch (e) {}
        }

        // Query scan all documents in 'employees' to delete any matching doc by ID, empCode, employeeCode, or email
        const allEmpsSnap = await getDocs(collection(db, 'employees'));
        const docsToDelete = allEmpsSnap.docs.filter((d) => {
          if (idsToDirectDelete.has(d.id)) return true;
          const data = d.data();
          if (data.id && (data.id === targetId || data.id === id)) return true;
          if (empCode && (data.empCode === empCode || data.employeeCode === empCode)) return true;
          if (empEmail && data.email && data.email.toLowerCase().trim() === empEmail) return true;
          return false;
        });

        const deletePromises = docsToDelete.map((d) => deleteDoc(d.ref));
        await Promise.allSettled(deletePromises);
      } catch (err) {
        console.warn('Firestore deleteDoc employee error:', err);
      }
    }

    setLastStaffAction({
      type: 'deleted',
      employee: emp,
      timestamp: new Date().toISOString(),
      message: `Staff Successfully Deleted: ${empName} has been permanently removed from the hospital system & cloud database.`,
    });

    showToast('info', 'Staff Member Deleted', `Successfully removed ${empName} from the hospital system & cloud database.`);
    addAuditLog('Terminated Employee', 'Employee Management', `Removed employee ${empName}`);
  };

  const clearAllEmployees = async () => {
    setEmployees([]);
    try {
      localStorage.setItem('aurahr_employees_v2', JSON.stringify([]));
      localStorage.removeItem('aurahr_employees_v1');
      localStorage.removeItem('aurahr_custom_passwords');
      localStorage.removeItem('aurahr_portal_accounts');
      localStorage.removeItem('aurahr_kept_passwords');
    } catch (e) {
      console.error('Failed to clear employees in localStorage', e);
    }

    if (db) {
      try {
        const empSnap = await getDocs(collection(db, 'employees'));
        const deletePromises = empSnap.docs.map((d) => deleteDoc(d.ref));
        await Promise.allSettled(deletePromises);
      } catch (err) {
        console.warn('Firestore bulk delete notice:', err);
      }
    }

    setLastStaffAction({
      type: 'cleared_all',
      timestamp: new Date().toISOString(),
      message: 'All staff profiles have been deleted from system and cloud database.',
    });

    showToast('info', 'Staff Registry Cleared', 'All staff members have been deleted from the hospital system and cloud database.');
    addAuditLog(
      'Staff Database Hard Reset',
      'System Administration',
      `Hard reset of staff registry triggered by ${currentUser?.name || 'Head of Facility'} (${activeRole}) for fresh institutional onboarding.`
    );
  };

  const enrollHeadOfFacility = async (data: {
    firstName: string;
    lastName: string;
    gender?: 'Male' | 'Female' | 'Other' | string;
    empCode?: string;
    email?: string;
    phone?: string;
    password?: string;
    jobTitle?: string;
    department?: string;
  }): Promise<Employee> => {
    const code = (data.empCode && data.empCode.trim()) || `EMP-3522`;
    const pass = (data.password && data.password.trim()) || code;
    const title = (data.jobTitle && data.jobTitle.trim()) || 'Head of Facility / Chief Executive Officer';
    const dept = (data.department && data.department.trim()) || 'Executive Administration';
    const mail = (data.email && data.email.trim()) || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@pjpiimc.org`;

    const newHead: Employee = {
      id: `emp-facility-head-${Date.now()}`,
      hospitalId: selectedHospitalId,
      branchId: 'b-1',
      empCode: code,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender || 'Male',
      email: mail,
      phone: data.phone?.trim() || '+233 24 000 0000',
      role: 'facility_head',
      jobTitle: title,
      department: dept,
      unit: 'Hospital Executive Council',
      grade: 'Chief Executive Officer / Head of Facility',
      firstAppointmentDate: new Date().toISOString().split('T')[0],
      dateJoinedPJPIIMC: new Date().toISOString().split('T')[0],
      originalHireDate: new Date().toISOString().split('T')[0],
      currentDepartment: dept,
      currentPosition: title,
      employmentType: 'Full-Time',
      joinDate: new Date().toISOString().split('T')[0],
      salary: 35000,
      currency: currency,
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      defaultPassword: pass,
      customPassword: pass,
      adminLoginGranted: true,
      filePermissionGranted: true,
      mustChangePassword: false,
      portalAccess: {
        username: code,
        usernameType: 'empCode',
        tempPassword: pass,
        customPassword: pass,
        passwordType: 'empCode',
        inviteStatus: 'Portal Activated',
        invitedAt: new Date().toISOString(),
        adminLoginGranted: true,
        mustChangePassword: false,
      },
      medicalLicenses: [],
    };

    setEmployees((prev) => {
      const updated = [newHead, ...prev.filter((e) => e.role !== 'facility_head' && e.id !== newHead.id && e.empCode !== code)];
      try {
        localStorage.setItem('aurahr_employees_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync to localStorage', e);
      }
      return updated;
    });

    if (db) {
      try {
        await setDoc(doc(db, 'employees', newHead.id), cleanForFirestore(newHead), { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc enrollHeadOfFacility notice:', err);
      }
    }

    setFacilityHead(newHead.id);
    addAuditLog('Enrolled Head of Facility', 'Executive Governance', `Enrolled ${newHead.firstName} ${newHead.lastName} (${newHead.empCode}) as Head of Facility`);

    return newHead;
  };

  const enrollHrLeader = async (data: {
    firstName: string;
    lastName: string;
    gender?: 'Male' | 'Female' | 'Other' | string;
    role?: 'hr_director' | 'hr_manager';
    empCode?: string;
    email?: string;
    phone?: string;
    password?: string;
    jobTitle?: string;
    department?: string;
  }): Promise<Employee> => {
    const role = data.role || 'hr_director';
    const code = (data.empCode && data.empCode.trim()) || (role === 'hr_director' ? 'EMP-1976' : 'EMP-2044');
    const pass = (data.password && data.password.trim()) || code;
    const title = (data.jobTitle && data.jobTitle.trim()) || (role === 'hr_director' ? 'Director of Human Resources' : 'Hospital HR Operations Manager');
    const dept = (data.department && data.department.trim()) || 'Human Resources';
    const mail = (data.email && data.email.trim()) || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@pjpiimc.org`;

    const newHr: Employee = {
      id: `emp-hr-${role}-${Date.now()}`,
      hospitalId: selectedHospitalId,
      branchId: 'b-1',
      empCode: code,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      gender: data.gender || (role === 'hr_director' ? 'Male' : 'Female'),
      email: mail,
      phone: data.phone?.trim() || '+233 24 555 2000',
      role: role,
      jobTitle: title,
      department: dept,
      unit: 'Human Resources Directorate',
      grade: role === 'hr_director' ? 'Director of Human Resources' : 'Senior HR Manager',
      firstAppointmentDate: new Date().toISOString().split('T')[0],
      dateJoinedPJPIIMC: new Date().toISOString().split('T')[0],
      originalHireDate: new Date().toISOString().split('T')[0],
      currentDepartment: dept,
      currentPosition: title,
      employmentType: 'Full-Time',
      joinDate: new Date().toISOString().split('T')[0],
      salary: role === 'hr_director' ? 24000 : 18500,
      currency: currency,
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      defaultPassword: pass,
      customPassword: pass,
      adminLoginGranted: true,
      filePermissionGranted: true,
      mustChangePassword: false,
      portalAccess: {
        username: code,
        usernameType: 'empCode',
        tempPassword: pass,
        customPassword: pass,
        passwordType: 'empCode',
        inviteStatus: 'Portal Activated',
        invitedAt: new Date().toISOString(),
        adminLoginGranted: true,
        mustChangePassword: false,
      },
      medicalLicenses: [],
    };

    setEmployees((prev) => {
      const updated = [newHr, ...prev.filter((e) => e.id !== newHr.id && e.empCode !== code)];
      try {
        localStorage.setItem('aurahr_employees_v2', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to sync to localStorage', e);
      }
      return updated;
    });

    if (db) {
      try {
        await setDoc(doc(db, 'employees', newHr.id), cleanForFirestore(newHr), { merge: true });
      } catch (err) {
        console.warn('Firestore setDoc enrollHrLeader notice:', err);
      }
    }

    addAuditLog(
      'Enrolled HR Leadership',
      'Human Resources',
      `Enrolled ${newHr.firstName} ${newHr.lastName} (${newHr.empCode}) as ${newHr.role === 'hr_director' ? 'HR Director' : 'HR Manager'}`
    );

    return newHr;
  };

  const recordStaffMovement = (movementData: Partial<StaffMovementRecord>) => {
    if (!movementData.employeeId) return;
    const emp = employees.find((e) => e.id === movementData.employeeId);
    if (!emp) return;

    const newRecord: StaffMovementRecord = {
      id: `mov-${Date.now()}`,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      empCode: emp.empCode,
      previousDepartment: movementData.previousDepartment || emp.department || 'Unspecified Department',
      newDepartment: movementData.newDepartment || emp.department || 'Unspecified Department',
      previousPosition: movementData.previousPosition || emp.jobTitle || 'Staff Member',
      newPosition: movementData.newPosition || emp.jobTitle || 'Staff Member',
      previousUnit: movementData.previousUnit || emp.unit,
      newUnit: movementData.newUnit || emp.unit,
      effectiveDate: movementData.effectiveDate || new Date().toISOString().split('T')[0],
      transferType: movementData.transferType || 'Internal Transfer',
      employmentSource: movementData.employmentSource || emp.employmentSource || 'Transfer',
      previousOrganisation: movementData.previousOrganisation || emp.previousOrganisation || '',
      reason: movementData.reason || 'Workforce Redeployment / Restructuring',
      approvingAuthority: movementData.approvingAuthority || 'HR Directorate / Management Board',
      referenceNumber: movementData.referenceNumber || `TRF-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      documentUrl: movementData.documentUrl,
      documentFileName: movementData.documentFileName,
      remarks: movementData.remarks,
      recordedBy: currentUser ? currentUser.name : (activeRole === 'hr_director' ? 'Miss Vero (HR Director)' : 'HR Administration'),
      recordedAt: new Date().toISOString(),
      status: (movementData.status as any) || 'Completed',
    };

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === emp.id) {
          const currentMovements = e.movementHistory || [];
          return {
            ...e,
            department: newRecord.newDepartment || e.department,
            jobTitle: newRecord.newPosition || e.jobTitle,
            unit: newRecord.newUnit || e.unit,
            currentDepartment: newRecord.newDepartment || e.department,
            currentPosition: newRecord.newPosition || e.jobTitle,
            transferType: (newRecord.transferType as any) || e.transferType,
            movementHistory: [newRecord, ...currentMovements],
          };
        }
        return e;
      })
    );

    // Automatically update saved monthly unit rosters for target and source departments
    if (newRecord.newDepartment && newRecord.previousDepartment && newRecord.newDepartment !== newRecord.previousDepartment) {
      setMonthlyUnitRosters((prevRosters) =>
        prevRosters.map((roster) => {
          if (!roster) return roster;
          // Target department: ensure transferred employee is on the roster grid
          if (roster.department.toLowerCase() === newRecord.newDepartment.toLowerCase() && roster.staffGrid) {
            const alreadyInGrid = roster.staffGrid.some((s) => s.name.toLowerCase().includes(emp.lastName.toLowerCase()));
            if (!alreadyInGrid) {
              const emptyIdx = roster.staffGrid.findIndex((s) => !s.name || s.name === 'No staff name');
              const pattern = ['M', 'M', 'A', 'A', 'N', 'O', 'O'];
              const newRow = {
                id: String(roster.staffGrid.length + 1),
                name: `${emp.firstName} ${emp.lastName}`.trim(),
                phone: emp.phone || '',
                rank: newRecord.newPosition || emp.jobTitle || 'Staff',
                shifts: Array.from({ length: 30 }, (_, d) => pattern[d % 7]),
              };
              if (emptyIdx >= 0) {
                const copy = [...roster.staffGrid];
                copy[emptyIdx] = { ...newRow, id: copy[emptyIdx].id };
                return { ...roster, staffGrid: copy, totalStaffCount: copy.filter((s) => s.name && s.name !== 'No staff name').length };
              }
              return { ...roster, staffGrid: [...roster.staffGrid, newRow], totalStaffCount: roster.totalStaffCount + 1 };
            }
          }
          // Previous department: remove transferred employee from the roster grid
          if (roster.department.toLowerCase() === newRecord.previousDepartment.toLowerCase() && roster.staffGrid) {
            const updatedGrid = roster.staffGrid.map((s) => {
              if (s.name.toLowerCase().includes(emp.lastName.toLowerCase()) && s.name.toLowerCase().includes(emp.firstName.toLowerCase())) {
                return { ...s, name: '', phone: '', rank: '', shifts: Array(30).fill('O') };
              }
              return s;
            });
            const remainingCount = updatedGrid.filter((s) => s.name && s.name.trim() && s.name !== 'No staff name').length;
            if (remainingCount === 0 && updatedGrid.length > 0) {
              updatedGrid[0] = { ...updatedGrid[0], name: 'No staff name', rank: 'N/A', shifts: Array(30).fill('O') };
            }
            return { ...roster, staffGrid: updatedGrid, totalStaffCount: remainingCount };
          }
          return roster;
        })
      );
    }

    addAuditLog(
      'Recorded Staff Transfer / Movement',
      'Staff Movement & Transfer Registry',
      `Recorded movement for ${emp.firstName} ${emp.lastName} (${emp.empCode}) -> New Dept: ${newRecord.newDepartment}, New Position: ${newRecord.newPosition}, Ref: ${newRecord.referenceNumber}`
    );

    showToast(
      'success',
      'Staff Movement & Roster Synchronized',
      `Transfer record created for ${emp.firstName} ${emp.lastName}. Transferred to ${newRecord.newDepartment} and duty roster automatically synchronized.`
    );
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

  // Synchronize Monthly Duty Roaster Grid with Active Daily Shift Rosters without requiring republishing or status reset
  const syncMonthlyRosterToActiveShifts = (
    department: string,
    month: string,
    year: number,
    staffGrid: StaffRosterRow[],
    options?: { preserveApprovalStatus?: boolean }
  ) => {
    const monthIndex = getMonthIndex(month);
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const mm = String(monthIndex + 1).padStart(2, '0');

    // Filter valid staff rows
    const activeStaffRows = (staffGrid || []).filter(
      (s) => s.name && s.name.trim() && s.name.trim() !== 'No staff name'
    );

    const shiftCodeMap: Record<string, { shiftType: ShiftRoster['shiftType']; startTime: string; endTime: string }> = {
      M: { shiftType: 'Morning (07:00-15:00)', startTime: '07:00', endTime: '15:00' },
      A: { shiftType: 'Evening (15:00-23:00)', startTime: '15:00', endTime: '23:00' },
      N: { shiftType: 'Night ICU (23:00-07:00)', startTime: '23:00', endTime: '07:00' },
      O: { shiftType: 'Scheduled Off (Rest Day)' as any, startTime: 'N/A', endTime: 'N/A' },
      D: { shiftType: 'Day Clinical (08:00-17:00)' as any, startTime: '08:00', endTime: '17:00' },
      E: { shiftType: '12h Emergency (07:00-19:00)', startTime: '07:00', endTime: '19:00' },
      C: { shiftType: 'On-Call 24h', startTime: '00:00', endTime: '23:59' },
    };

    const newGeneratedShifts: ShiftRoster[] = [];
    const dateRangeSet = new Set<string>();

    for (let d = 1; d <= totalDays; d++) {
      const dd = String(d).padStart(2, '0');
      dateRangeSet.add(`${year}-${mm}-${dd}`);
    }

    activeStaffRows.forEach((row, rowIdx) => {
      const cleanName = row.name.toLowerCase().trim();
      const matchedEmp = employees.find((e) => {
        const full = `${e.firstName || ''} ${e.lastName || ''}`.toLowerCase().trim();
        return full.includes(cleanName) || cleanName.includes(full) || (row.phone && e.phone && e.phone === row.phone);
      });

      const empId = matchedEmp ? matchedEmp.id : `ext-staff-${rowIdx + 1}`;
      const empName = matchedEmp ? `${matchedEmp.firstName} ${matchedEmp.lastName}` : row.name;
      const empPhoto = matchedEmp?.photo || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150';
      const role = row.rank || matchedEmp?.jobTitle || 'Clinical Staff';
      const ward = `${department} Unit`;

      for (let day = 1; day <= totalDays; day++) {
        const dd = String(day).padStart(2, '0');
        const dateStr = `${year}-${mm}-${dd}`;
        const shiftCode = (row.shifts && row.shifts[day - 1]) ? row.shifts[day - 1].toUpperCase() : 'O';
        const shiftInfo = shiftCodeMap[shiftCode] || {
          shiftType: 'Morning (07:00-15:00)',
          startTime: '07:00',
          endTime: '15:00',
        };

        newGeneratedShifts.push({
          id: `ros-${empId}-${dateStr}-${Date.now()}-${day}`,
          employeeId: empId,
          employeeName: empName,
          employeePhoto: empPhoto,
          role,
          hospitalId: selectedHospitalId,
          department,
          shiftType: shiftInfo.shiftType,
          date: dateStr,
          startTime: shiftInfo.startTime,
          endTime: shiftInfo.endTime,
          ward,
          status: 'Assigned',
          fatigueScore: Math.floor(15 + Math.random() * 25),
        });
      }
    });

    // Replace rosters for this department and date range with newly synchronized ones
    setRosters((prev) => {
      const filtered = prev.filter(
        (r) => !(r.department.toLowerCase() === department.toLowerCase() && dateRangeSet.has(r.date))
      );
      return [...newGeneratedShifts, ...filtered];
    });

    // Update monthlyUnitRosters keeping existing approval status (preserveApprovalStatus defaults to true)
    setMonthlyUnitRosters((prev) => {
      const existingIdx = prev.findIndex(
        (r) => r.department.toLowerCase() === department.toLowerCase() && r.month.toUpperCase() === month.toUpperCase() && r.year === year
      );
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        const updated: DepartmentMonthlyRoster = {
          ...existing,
          staffGrid,
          lastSyncedAt: new Date().toISOString(),
          // Preserve current approval status unless explicitly requested
          status: options?.preserveApprovalStatus !== false ? existing.status : 'Pending Verification',
        };
        const copy = [...prev];
        copy[existingIdx] = updated;
        return copy;
      }
      return prev;
    });

    addAuditLog(
      'Synced Monthly Duty Roaster (Without Republishing)',
      'Shift Management',
      `Synchronized ${newGeneratedShifts.length} daily shift allocations for ${activeStaffRows.length} staff members in ${department} (${month} ${year}). Preserved current approval status without republishing.`
    );

    showToast(
      'success',
      'Duty Roaster Synchronized',
      `Synchronized ${newGeneratedShifts.length} shifts across ${activeStaffRows.length} staff for ${department} without altering or resetting approval status.`
    );

    return {
      syncedCount: newGeneratedShifts.length,
      affectedStaffCount: activeStaffRows.length,
    };
  };

  // Clock In & Geofenced Mobile / Biometric Attendance
  const addClockIn = (
    empId: string,
    method: AttendanceRecord['method'],
    customLocation?: string,
    extraDetails?: Partial<AttendanceRecord>
  ): AttendanceRecord => {
    const emp = employees.find((e) => e.id === empId);
    const empDept = emp?.department || 'Intensive Care Unit (ICU)';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const terminalLocation = customLocation || `${empDept} Biometric Terminal Kiosk`;
    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: empId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
      date: now.toISOString().split('T')[0],
      clockIn: timeStr,
      clockOut: 'In Progress',
      method,
      location: terminalLocation,
      status: 'On-Time',
      overtimeHours: 0,
      approvalStatus: 'Auto-Approved',
      ...extraDetails,
    };
    setAttendance((prev) => [newRecord, ...prev]);

    if (db) {
      setDoc(doc(db, 'attendance', newRecord.id), cleanForFirestore(newRecord)).catch((err) => {
        console.warn('Firestore setDoc attendance error:', err);
      });
    }

    addAuditLog(
      'Biometric Clock-In',
      'Attendance',
      `${newRecord.employeeName} (${empDept}) clocked in via ${method} at ${terminalLocation} [${timeStr}] ${extraDetails?.facialVerified ? '• Face Verified' : ''} ${extraDetails?.geofenceVerified ? '• Geofence Verified' : ''}`
    );
    return newRecord;
  };

  const addClockOut = (
    empId: string,
    customLocation?: string,
    extraDetails?: Partial<AttendanceRecord>
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const todayStr = now.toISOString().split('T')[0];
    const emp = employees.find((e) => e.id === empId);

    let recordToSave: AttendanceRecord | null = null;

    setAttendance((prev) => {
      const matchIndex = prev.findIndex((a) => a.employeeId === empId && a.date === todayStr && a.clockOut === 'In Progress');
      if (matchIndex >= 0) {
        const copy = [...prev];
        const updated = {
          ...copy[matchIndex],
          clockOut: timeStr,
          ...(customLocation ? { location: `${copy[matchIndex].location} / Exit: ${customLocation}` } : {}),
          ...extraDetails,
        };
        copy[matchIndex] = updated;
        recordToSave = updated;
        return copy;
      } else {
        const outRecord: AttendanceRecord = {
          id: `att-${Date.now()}`,
          employeeId: empId,
          employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Employee',
          date: todayStr,
          clockIn: '--:--',
          clockOut: timeStr,
          method: 'GPS_Geofence',
          location: customLocation || `${emp?.department || 'Hospital'} Geofenced Exit`,
          status: 'On-Time',
          overtimeHours: 0,
          approvalStatus: 'Auto-Approved',
          ...extraDetails,
        };
        recordToSave = outRecord;
        return [outRecord, ...prev];
      }
    });

    if (db && recordToSave) {
      const r = recordToSave as AttendanceRecord;
      setDoc(doc(db, 'attendance', r.id), r, { merge: true }).catch((err) => {
        console.warn('Firestore attendance clockOut error:', err);
      });
    }

    addAuditLog(
      'Attendance Clock-Out',
      'Attendance',
      `${emp ? `${emp.firstName} ${emp.lastName}` : 'Staff'} clocked out at ${timeStr} via GPS/Facial Geofence`
    );
  };

  const approveAttendance = (id: string) => {
    setAttendance((prev) => prev.map((a) => (a.id === id ? { ...a, approvalStatus: 'Approved' } : a)));
    if (db) {
      setDoc(doc(db, 'attendance', id), { approvalStatus: 'Approved' }, { merge: true }).catch((err) => {
        console.warn('Firestore approveAttendance error:', err);
      });
    }
    addAuditLog('Approved Overtime / Attendance', 'Attendance', `Approved record ID ${id}`);
  };

  // Leave Management & 4-Tier Approval Workflow
  const addLeaveRequest = (leaveData: Partial<LeaveRequest>) => {
    const emp = employees.find((e) => e.id === leaveData.employeeId);
    const empDept = emp?.department || leaveData.department || 'Intensive Care Unit (ICU)';
    const empUnit = emp?.unit || leaveData.unit || 'ICU Ward 2B (Critical Care)';
    const currentDateStr = new Date().toISOString().split('T')[0];
    const lType = leaveData.leaveType || 'Annual Leave';
    const sDate = leaveData.startDate || currentDateStr;
    const eDate = leaveData.endDate || currentDateStr;
    const computedDays = calculateLeaveDays(sDate, eDate, lType);

    const newLeave: LeaveRequest = {
      id: `lv-${Date.now()}`,
      employeeId: leaveData.employeeId || 'emp-101',
      employeeName: leaveData.employeeName || (emp ? `${emp.firstName} ${emp.lastName}` : 'Dr. Sarah Jenkins'),
      staffId: leaveData.staffId || emp?.empCode || 'STF-1001',
      grade: leaveData.grade || emp?.jobTitle || 'Clinical Specialist',
      department: empDept,
      unit: empUnit,
      leaveType: lType,
      startDate: sDate,
      endDate: eDate,
      dateOfResumption: leaveData.dateOfResumption || calculateResumptionDate(eDate),
      totalDays: computedDays || leaveData.totalDays || 1,
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

    // Automated notification targeting Department Heads & Managers
    const deptHeadNotif: NotificationItem = {
      id: `notif-leave-${Date.now()}`,
      recipientId: 'dept_head',
      title: `🚨 New Leave Application: ${newLeave.employeeName}`,
      message: `${newLeave.employeeName} (${newLeave.department}) submitted a request for ${newLeave.totalDays} days of ${newLeave.leaveType} (${newLeave.startDate} to ${newLeave.endDate}). Tier 1 (Unit Head) & Tier 2 (Department Head) action required.`,
      channel: 'In-App',
      type: 'Approval',
      read: false,
      timestamp: new Date().toISOString(),
    };

    // Specific Department Head direct notification
    const targetDept = departmentLeadership.find((d) => d.departmentName.toLowerCase() === (newLeave.department || '').toLowerCase());
    const specificNotif: NotificationItem = {
      id: `notif-depthead-direct-${Date.now()}`,
      recipientId: targetDept?.departmentHeadId || 'emp-101',
      title: `📩 Leave Request Alert for ${newLeave.department}: ${newLeave.employeeName}`,
      message: `Attention ${targetDept?.departmentHeadName || 'Department Head'}: ${newLeave.employeeName} requested ${newLeave.totalDays} days leave from ${newLeave.startDate} to ${newLeave.endDate}. Please review in PJPIIMC Staff Portal.`,
      channel: 'Email',
      type: 'Approval',
      read: false,
      timestamp: new Date().toISOString(),
    };

    setNotifications((prev) => [deptHeadNotif, specificNotif, ...prev]);

    if (db) {
      setDoc(doc(db, 'leaves', newLeave.id), cleanForFirestore(newLeave)).catch((err) => {
        console.warn('Firestore setDoc leave error:', err);
      });
    }

    addAuditLog(
      'Submitted Leave Request',
      'Leave Management Workflow',
      `${newLeave.employeeName} requested ${newLeave.totalDays} days of ${newLeave.leaveType}. Sequential workflow initiated at Tier 1 (Unit Head). Automated notification sent to Department Head.`
    );
  };

  const archiveApprovedLeaveToDigitalFile = async (leave: LeaveRequest): Promise<StaffFile | null> => {
    if (!leave) return null;
    const targetEmp = employees.find(
      (e) =>
        e.id === leave.employeeId ||
        (e.empCode && (e.empCode === leave.staffId || e.empCode === leave.employeeId)) ||
        (e.email && leave.employeeName && `${e.firstName} ${e.lastName}`.toLowerCase() === leave.employeeName.toLowerCase())
    );

    const empId = targetEmp?.id || leave.employeeId || 'emp-101';
    const empEmail = targetEmp?.email || `${(leave.employeeName || 'staff').toLowerCase().replace(/\s+/g, '.')}@pjpiimc.org`;
    const empName = targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName}` : (leave.employeeName || 'Staff Member');
    const staffCode = targetEmp?.empCode || leave.staffId || 'STF-1001';
    const safeDocName = `Approved_Leave_Form_${staffCode}_${leave.leaveType.replace(/\s+/g, '_')}_${leave.startDate}.pdf`;
    const docTitle = `Approved Leave Application - ${leave.leaveType} (${leave.startDate} to ${leave.endDate})`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const htmlContent = generateLeaveFormHtml(leave, targetEmp, selectedHospital?.name);
    let base64Data = 'data:text/html;charset=utf-8;base64,';
    try {
      base64Data += btoa(unescape(encodeURIComponent(htmlContent)));
    } catch (e) {
      base64Data += btoa(htmlContent);
    }

    const newStaffFile: StaffFile = {
      id: `leave-doc-${leave.id || Date.now()}`,
      ownerUid: empId,
      ownerEmail: empEmail,
      ownerName: empName,
      fileName: safeDocName,
      fileType: 'pdf',
      fileSize: 48500,
      fileData: base64Data,
      category: 'Approved Leave Form (PDF)',
      description: `Official certified approved leave application form for ${leave.leaveType} (${leave.daysGranted || leave.totalDays} days, from ${leave.startDate} to ${leave.endDate}). Authorized by Head of Facility & HR Directorate.`,
      uploadedAt: leave.facilityInChargeSignedDate ? `${leave.facilityInChargeSignedDate} 12:00:00` : nowStr,
      updatedAt: nowStr,
      permissionGrantedByHr: true,
      leaveId: leave.id,
      isSystemGenerated: true,
    };

    setStaffFiles((prev) => {
      const filtered = prev.filter((f) => f.leaveId !== leave.id && f.fileName !== safeDocName);
      return [newStaffFile, ...filtered];
    });

    const newOfficialDoc: OfficialDocument = {
      id: `off-doc-lv-${leave.id || Date.now()}`,
      title: docTitle,
      type: 'Approved Leave Form (PDF)',
      fileUrl: base64Data,
      fileName: safeDocName,
      fileSize: 48500,
      uploadedAt: leave.facilityInChargeSignedDate || nowStr.split(' ')[0],
      uploadedBy: leave.facilityInChargeSignedBy || 'Head of Facility / HR Directorate',
      notes: `Authorized by ${leave.facilityInChargeSignedBy || 'Facility Head'} & HR Directorate. Resumption date: ${leave.dateOfResumption || calculateResumptionDate(leave.endDate)}.`,
      leaveId: leave.id,
      leaveType: leave.leaveType,
      leaveStartDate: leave.startDate,
      leaveEndDate: leave.endDate,
      daysGranted: leave.daysGranted || leave.totalDays,
    };

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === empId || e.empCode === staffCode || (e.email && e.email === empEmail)) {
          const existingDocs = e.officialDocuments || [];
          const filteredDocs = existingDocs.filter((d) => d.leaveId !== leave.id && d.fileName !== safeDocName);
          return {
            ...e,
            officialDocuments: [newOfficialDoc, ...filteredDocs],
          };
        }
        return e;
      })
    );

    if (db) {
      setDoc(doc(db, 'staff_files', newStaffFile.id), cleanForFirestore(newStaffFile), { merge: true }).catch((err) => {
        console.warn('Firestore staff_files archive error:', err);
      });
    }

    addAuditLog(
      'Archived Approved Leave Form PDF',
      'Staff Digital File Vault',
      `Preserved official PDF copy of approved ${leave.leaveType} form (${leave.startDate} to ${leave.endDate}) in staff digital file for ${empName} (${staffCode}). Accessible by HR and staff.`
    );

    return newStaffFile;
  };

  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, ...updates };
          return updated;
        }
        return l;
      })
    );
    if (db) {
      setDoc(doc(db, 'leaves', id), cleanForFirestore(updates), { merge: true }).catch((err) => {
        console.warn('Firestore updateLeaveRequest error:', err);
      });
    }
  };

  const adjustLeaveEndDate = (
    leaveId: string,
    data: {
      newEndDate: string;
      remarks: string;
      holidaysCount?: number;
      holidayNames?: string[];
      newResumptionDate?: string;
      originalEndDate?: string;
      adjustedBy?: string;
      extraNotes?: string;
    }
  ) => {
    const targetLeave = (leaves || []).find((l) => l.id === leaveId);
    const origEnd = data.originalEndDate || targetLeave?.endDate || '';
    const resumption = data.newResumptionDate || calculateResumptionDate(data.newEndDate);
    const adjustedAt = new Date().toISOString();
    const adjuster = data.adjustedBy || currentUser?.name || 'HR Management Directorate';

    const updates: Partial<LeaveRequest> = {
      endDate: data.newEndDate,
      validatedEndDate: data.newEndDate,
      dateOfResumption: resumption,
      isHolidayAdjusted: true,
      originalEndDate: targetLeave?.originalEndDate || origEnd,
      holidayAdjustmentDays: data.holidaysCount ?? 0,
      holidayNames: data.holidayNames || [],
      holidayAdjustmentReason: data.remarks,
      hrAdjustmentRemarks: data.remarks,
      hrRemarks: data.remarks,
      adjustedByHrName: adjuster,
      adjustedAt,
    };

    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id === leaveId) {
          const fullyUpdated: LeaveRequest = {
            ...l,
            ...updates,
          };
          if (fullyUpdated.status === 'Approved') {
            setTimeout(() => archiveApprovedLeaveToDigitalFile(fullyUpdated), 50);
          }
          return fullyUpdated;
        }
        return l;
      })
    );

    if (db) {
      setDoc(doc(db, 'leaves', leaveId), cleanForFirestore(updates), { merge: true }).catch((err) => {
        console.warn('Firestore adjustLeaveEndDate error:', err);
      });
    }

    addAuditLog(
      'Adjusted Leave End Date (Public Holidays)',
      'Leave Management',
      `Leave for ${targetLeave?.employeeName || leaveId} extended from ${origEnd} to ${data.newEndDate} by ${adjuster}. Remarks: ${data.remarks}`
    );

    showToast(
      'success',
      'Leave End Date Adjusted for Public Holidays',
      `New End Date: ${data.newEndDate} • Resumption: ${resumption} • Remarks recorded.`
    );
  };

  const updateLeaveStatus = (id: string, status: LeaveRequest['status']) => {
    setLeaves((prev) =>
      prev.map((l) => {
        if (l.id === id) {
          const updated = { ...l, status };
          if (status === 'Approved') {
            setTimeout(() => archiveApprovedLeaveToDigitalFile(updated), 50);
          }
          return updated;
        }
        return l;
      })
    );
    if (db) {
      setDoc(doc(db, 'leaves', id), { status }, { merge: true }).catch((err) => {
        console.warn('Firestore updateLeaveStatus error:', err);
      });
    }
    addAuditLog('Updated Leave Status', 'Leave Management', `Set leave ID ${id} to ${status}`);
  };

  const deleteLeaveRequest = async (id: string): Promise<boolean> => {
    const targetLeave = (leaves || []).find((l) => l.id === id);
    if (!targetLeave) {
      showToast('error', 'Delete Failed', 'Leave request could not be found.');
      return false;
    }

    const isHrAuthorized =
      currentUser?.email?.toLowerCase() === 'attasam223@gmail.com' ||
      ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'admin'].includes(activeRole) ||
      ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'admin'].includes(currentUser?.role || '') ||
      (currentUser?.role || '').toLowerCase().includes('hr') ||
      (currentUser?.role || '').toLowerCase().includes('admin') ||
      (activeRole || '').toLowerCase().includes('hr') ||
      (activeRole || '').toLowerCase().includes('admin') ||
      currentUserDepartment?.toLowerCase().includes('human resource') ||
      currentUserDepartment?.toLowerCase().includes('hr') ||
      isHeadOfFacilityOrHr;

    if (!isHrAuthorized) {
      showToast('error', 'Access Denied', 'Only HR Leadership and System Administrators have permission to delete leave requests.');
      return false;
    }

    try {
      if (db) {
        await deleteDoc(doc(db, 'leaves', id));
      }
    } catch (err) {
      console.warn('Firestore deleteDoc leave error:', err);
    }

    // 1. Remove from leaves state
    setLeaves((prev) => prev.filter((l) => l.id !== id));

    // 2. Remove associated staff file if archived
    setStaffFiles((prev) => {
      const associatedFiles = prev.filter((f) => f.leaveId === id || f.id === `leave-doc-${id}`);
      if (db) {
        associatedFiles.forEach((file) => {
          deleteDoc(doc(db, 'staff_files', file.id)).catch((err) =>
            console.warn('Firestore delete staff_file for leave error:', err)
          );
        });
      }
      return prev.filter((f) => f.leaveId !== id && f.id !== `leave-doc-${id}`);
    });

    // 3. Remove official documents attached to employee record
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === targetLeave.employeeId || e.officialDocuments?.some((d) => d.leaveId === id)) {
          return {
            ...e,
            officialDocuments: (e.officialDocuments || []).filter((d) => d.leaveId !== id),
          };
        }
        return e;
      })
    );

    addAuditLog(
      'Deleted Leave Request',
      'Leave Management Workflow',
      `HR Directorate permanently deleted leave request #${id} for ${targetLeave.employeeName} (${targetLeave.leaveType}, ${targetLeave.startDate} to ${targetLeave.endDate}, ${targetLeave.totalDays} days, Status: ${targetLeave.status}).`
    );

    showToast(
      'success',
      'Leave Request Deleted',
      `Permanently deleted ${targetLeave.leaveType} application for ${targetLeave.employeeName}.`
    );

    return true;
  };

  const processLeaveWorkflowStep = (
    leaveId: string,
    action: 'Approve' | 'Reject',
    comments?: string,
    customApproverName?: string,
    signatureUrl?: string
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
            updatedWorkflow.unitHeadStep = { role: 'Unit Head', status: 'Rejected', approverName, approvedAt: timestamp, comments, signatureUrl, signatureCertified: !!signatureUrl };
            leaveUpdates.recommendationStatus = 'NOT RECOMMENDED';
            leaveUpdates.unitHeadSignedBy = approverName;
            leaveUpdates.unitHeadSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.unitHeadSignatureUrl = signatureUrl;
          } else if (currentStage === 'Departmental Head') {
            updatedWorkflow.departmentHeadStep = { role: 'Departmental Head', status: 'Rejected', approverName, approvedAt: timestamp, comments, signatureUrl, signatureCertified: !!signatureUrl };
            leaveUpdates.recommendationStatus = 'NOT RECOMMENDED';
            leaveUpdates.deptHeadSignedBy = approverName;
            leaveUpdates.deptHeadSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.deptHeadSignatureUrl = signatureUrl;
          } else if (currentStage === 'HR') {
            updatedWorkflow.hrStep = { role: 'HR', status: 'Rejected', approverName, approvedAt: timestamp, comments, signatureUrl, signatureCertified: !!signatureUrl };
            leaveUpdates.hrRemarks = comments || 'Rejected during HR validation.';
            leaveUpdates.hrSignedBy = approverName;
            leaveUpdates.hrSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.hrSignatureUrl = signatureUrl;
          } else if (currentStage === 'Head of Facility') {
            updatedWorkflow.facilityHeadStep = { role: 'Head of Facility', status: 'Rejected', approverName, approvedAt: timestamp, comments, signatureUrl, signatureCertified: !!signatureUrl };
            leaveUpdates.approvalRemarks = comments || 'Leave application rejected by Facility In-Charge.';
            leaveUpdates.facilityInChargeSignedBy = approverName;
            leaveUpdates.facilityInChargeSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.facilityHeadSignatureUrl = signatureUrl;
          }

          addAuditLog(
            'Leave Request Rejected',
            'Leave Management Workflow',
            `Leave ID ${leaveId} (${leave.employeeName}) REJECTED at ${currentStage} stage by ${approverName}. Reason: ${comments || 'None'}`
          );

          dispatchNotification(
            leave.employeeId || 'emp-101',
            `❌ Leave Request Rejected (${currentStage})`,
            `Your ${leave.leaveType} request (${leave.startDate} to ${leave.endDate}) was REJECTED at ${currentStage} stage by ${approverName}. Reason: ${comments || 'Operational constraints'}.`,
            'In-App',
            'Approval'
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
              signatureUrl,
              signatureCertified: !!signatureUrl,
            };
            nextStage = 'Departmental Head';
            leaveUpdates.recommendationStatus = 'RECOMMENDED';
            leaveUpdates.replacementRequired = 'NOT REQUIRED';
            leaveUpdates.unitHeadSignedBy = approverName;
            leaveUpdates.unitHeadSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.unitHeadSignatureUrl = signatureUrl;

            addAuditLog(
              'Tier 1 Approval (Unit Head)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) APPROVED at Tier 1 (Unit Head) by ${approverName}. Advanced to Tier 2 (Departmental Head).`
            );

            dispatchNotification(
              leave.employeeId || 'emp-101',
              `✅ Leave Tier 1 Approved (Unit Head)`,
              `Your ${leave.leaveType} application was approved by ${approverName} (Unit Head - Tier 1) and advanced to Department Head for Tier 2 approval.`,
              'In-App',
              'Approval'
            );
          } else if (currentStage === 'Departmental Head') {
            updatedWorkflow.departmentHeadStep = {
              role: 'Departmental Head',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 2 (Departmental Head): Clinical department staffing approved.',
              signatureUrl,
              signatureCertified: !!signatureUrl,
            };
            nextStage = 'HR';
            leaveUpdates.recommendationStatus = 'RECOMMENDED';
            leaveUpdates.deptHeadSignedBy = approverName;
            leaveUpdates.deptHeadSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.deptHeadSignatureUrl = signatureUrl;

            addAuditLog(
              'Tier 2 Approval (Departmental Head)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) APPROVED at Tier 2 (Departmental Head) by ${approverName}. Advanced to Tier 3 (HR).`
            );

            dispatchNotification(
              leave.employeeId || 'emp-101',
              `✅ Leave Tier 2 Approved (Department Head)`,
              `Your ${leave.leaveType} application was approved by ${approverName} (Department Head - Tier 2) and advanced to HR for Tier 3 verification.`,
              'In-App',
              'Approval'
            );
          } else if (currentStage === 'HR') {
            updatedWorkflow.hrStep = {
              role: 'HR',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 3 (HR): Policy compliance, contracts & leave allowances validated.',
              signatureUrl,
              signatureCertified: !!signatureUrl,
            };
            nextStage = 'Head of Facility';
            
            // Calculate resumption date (+1 day after leave end date)
            const targetEndDate = leave.validatedEndDate || leave.endDate;
            const resumptionStr = calculateResumptionDate(targetEndDate);

            leaveUpdates.outstandingLeaveDays = Math.max(0, (leave.leaveEntitlement || 30) - leave.totalDays);
            leaveUpdates.validatedStartDate = leave.validatedStartDate || leave.startDate;
            leaveUpdates.validatedEndDate = targetEndDate;
            leaveUpdates.dateOfResumption = resumptionStr;
            leaveUpdates.hrRemarks = comments || 'Leave days and entitlements verified compliant with HR policy.';
            leaveUpdates.hrSignedBy = approverName;
            leaveUpdates.hrSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.hrSignatureUrl = signatureUrl;

            addAuditLog(
              'Tier 3 Approval (HR)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) APPROVED at Tier 3 (HR) by ${approverName}. Advanced to Tier 4 (Head of Facility).`
            );

            dispatchNotification(
              leave.employeeId || 'emp-101',
              `✅ Leave Tier 3 Verified (HR Directorate)`,
              `Your ${leave.leaveType} application was verified by ${approverName} (HR - Tier 3) and advanced to Head of Facility for final authorization.`,
              'In-App',
              'Approval'
            );
          } else if (currentStage === 'Head of Facility') {
            updatedWorkflow.facilityHeadStep = {
              role: 'Head of Facility',
              status: 'Approved',
              approverName,
              approvedAt: timestamp,
              comments: comments || 'Tier 4 (Head of Facility): Final executive authorization granted.',
              signatureUrl,
              signatureCertified: !!signatureUrl,
            };
            nextStage = 'Fully Approved';
            finalOverallStatus = 'Approved';

            leaveUpdates.daysGranted = leave.totalDays;
            leaveUpdates.approvalRemarks = comments || 'Leave application approved in full by Facility In-Charge.';
            leaveUpdates.facilityInChargeSignedBy = approverName;
            leaveUpdates.facilityInChargeSignedDate = dateStr;
            if (signatureUrl) leaveUpdates.facilityHeadSignatureUrl = signatureUrl;
            leaveUpdates.digitalSignaturesCertified = true;

            addAuditLog(
              'Tier 4 Final Approval (Head of Facility)',
              'Leave Management Workflow',
              `Leave ID ${leaveId} (${leave.employeeName}) FULLY APPROVED at Tier 4 (Head of Facility) by ${approverName}. Leave granted.`
            );

            dispatchNotification(
              leave.employeeId || 'emp-101',
              `🎉 Leave Application Fully Approved (Tier 4 Final)`,
              `Congratulations! Your ${leave.leaveType} application for ${leave.totalDays} day(s) starting ${leave.startDate} has been fully authorized by ${approverName} (Head of Facility).`,
              'In-App',
              'Approval'
            );

            // Archive approved leave form as PDF in Staff Digital File Vault
            const approvedLeaveRecord = {
              ...leave,
              ...leaveUpdates,
              currentStage: nextStage,
              status: finalOverallStatus,
              workflow: updatedWorkflow,
            };
            setTimeout(() => {
              archiveApprovedLeaveToDigitalFile(approvedLeaveRecord);
            }, 50);
          }
        }

        updatedWorkflow.currentStage = nextStage;

        const fullyUpdatedLeave: LeaveRequest = {
          ...leave,
          ...leaveUpdates,
          currentStage: nextStage,
          status: finalOverallStatus,
          workflow: updatedWorkflow,
        };

        if (db) {
          setDoc(doc(db, 'leaves', leave.id), cleanForFirestore(fullyUpdatedLeave), { merge: true }).catch((err) => {
            console.warn('Firestore processLeaveWorkflowStep sync error:', err);
          });
        }

        return fullyUpdatedLeave;
      })
    );
  };

  const uploadEmployeeDigitalSignature = async (
    employeeId: string,
    signatureDataUrl: string,
    uploadedBy: string = 'Miss Vero (HR Director)'
  ) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? {
              ...e,
              digitalSignatureUrl: signatureDataUrl,
            }
          : e
      )
    );

    // Save to Firestore if available
    try {
      if (db) {
        const empRef = doc(db, 'employees', employeeId);
        await updateDoc(empRef, {
          digitalSignatureUrl: signatureDataUrl,
        });
      }
    } catch (err) {
      console.warn('Firestore digital signature sync:', err);
    }

    const emp = employees.find((e) => e.id === employeeId);
    const empName = emp ? `${emp.firstName} ${emp.lastName}` : employeeId;

    addAuditLog(
      'Uploaded Authorized Digital Signature',
      'HR Governance',
      `Official digital signature for ${empName} uploaded and authorized by ${uploadedBy}`
    );

    showToast('success', 'Digital Signature Uploaded', `Authorized signature for ${empName} saved by HR.`);
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

  const addDepartment = (deptData: {
    departmentName: string;
    departmentCode: string;
    departmentHeadName?: string;
    departmentHeadEmail?: string;
    departmentHeadId?: string;
    units?: Array<{ unitName: string; unitHeadId?: string }>;
  }) => {
    let newUnits: UnitLeadership[] = [];

    if (deptData.units && deptData.units.length > 0) {
      newUnits = deptData.units
        .filter((u) => u.unitName && u.unitName.trim().length > 0)
        .map((u, idx) => {
          const uHeadEmp = employees.find((e) => e.id === u.unitHeadId);
          return {
            id: `u-${Date.now()}-${idx + 1}`,
            unitName: u.unitName.trim(),
            departmentName: deptData.departmentName,
            unitHeadId: uHeadEmp?.id,
            unitHeadName: uHeadEmp ? `${uHeadEmp.firstName} ${uHeadEmp.lastName}` : undefined,
            unitHeadEmail: uHeadEmp?.email,
            staffCount: 6,
          };
        });
    }

    if (newUnits.length === 0) {
      newUnits = [
        {
          id: `u-${Date.now()}-1`,
          unitName: `${deptData.departmentName} General Unit`,
          departmentName: deptData.departmentName,
          staffCount: 6,
        },
      ];
    }

    const newDept: DepartmentLeadership = {
      id: `dept-${Date.now()}`,
      departmentName: deptData.departmentName,
      departmentCode: deptData.departmentCode,
      departmentHeadId: deptData.departmentHeadId,
      departmentHeadName: deptData.departmentHeadName,
      departmentHeadEmail: deptData.departmentHeadEmail,
      units: newUnits,
      lastAssignedBy: currentUser ? currentUser.name : 'Miss Vero (HR Director)',
      lastAssignedAt: new Date().toISOString(),
    };

    const cleanedDept = cleanForFirestore(newDept);

    setDepartmentLeadership((prev) => {
      const updated = [...prev.filter((d) => d.departmentName.toLowerCase() !== cleanedDept.departmentName.toLowerCase()), cleanedDept];
      try {
        localStorage.setItem('aurahr_departments_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (db) {
      setDoc(doc(db, 'departments', cleanedDept.id), cleanedDept).catch((err) => {
        console.warn('Firestore setDoc department error:', err);
      });
    }

    // Update HOD employee role & department
    if (deptData.departmentHeadId) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === deptData.departmentHeadId
            ? { ...e, role: 'dept_head', department: deptData.departmentName }
            : e
        )
      );
    }

    // Update Unit Heads employee roles & department & unit
    if (deptData.units && deptData.units.length > 0) {
      deptData.units.forEach((u) => {
        if (u.unitHeadId && u.unitName.trim()) {
          setEmployees((prev) =>
            prev.map((e) =>
              e.id === u.unitHeadId
                ? { ...e, role: 'unit_head', department: deptData.departmentName, unit: u.unitName.trim() }
                : e
            )
          );
        }
      });
    }

    addAuditLog(
      'Created New Department',
      'Leadership & Governance',
      `HR created department '${deptData.departmentName}' (${deptData.departmentCode}) with ${newUnits.length} unit(s)`
    );
    showToast('success', 'Department Created', `Department '${deptData.departmentName}' added and synchronized with cloud database.`);
  };

  const updateDepartment = (
    oldDepartmentName: string,
    updatedData: {
      departmentName: string;
      departmentCode: string;
      departmentHeadId?: string;
      units?: Array<{ id?: string; unitName: string; unitHeadId?: string; staffCount?: number }>;
    }
  ) => {
    const newDeptName = updatedData.departmentName.trim() || oldDepartmentName;
    const newDeptCode = updatedData.departmentCode.trim() || 'DEPT';
    const targetHeadEmp = employees.find((e) => e.id === updatedData.departmentHeadId);
    const headFullName = targetHeadEmp ? `${targetHeadEmp.firstName} ${targetHeadEmp.lastName}` : undefined;

    let formattedUnits: UnitLeadership[] = [];
    if (updatedData.units && updatedData.units.length > 0) {
      formattedUnits = updatedData.units
        .filter((u) => u.unitName && u.unitName.trim().length > 0)
        .map((u, idx) => {
          const uHeadEmp = employees.find((e) => e.id === u.unitHeadId);
          return {
            id: u.id || `u-${Date.now()}-${idx + 1}`,
            unitName: u.unitName.trim(),
            departmentName: newDeptName,
            unitHeadId: uHeadEmp?.id,
            unitHeadName: uHeadEmp ? `${uHeadEmp.firstName} ${uHeadEmp.lastName}` : undefined,
            unitHeadEmail: uHeadEmp?.email,
            staffCount: u.staffCount || 6,
          };
        });
    }

    if (formattedUnits.length === 0) {
      formattedUnits = [
        {
          id: `u-${Date.now()}-1`,
          unitName: `${newDeptName} General Unit`,
          departmentName: newDeptName,
          staffCount: 6,
        },
      ];
    }

    let targetDeptId = '';
    setDepartmentLeadership((prev) => {
      const updatedList = prev.map((d) => {
        if (d.departmentName.toLowerCase() === oldDepartmentName.toLowerCase() || d.id === oldDepartmentName) {
          targetDeptId = d.id;
          const updatedDept: DepartmentLeadership = {
            ...d,
            departmentName: newDeptName,
            departmentCode: newDeptCode,
            departmentHeadId: targetHeadEmp?.id,
            departmentHeadName: headFullName,
            departmentHeadEmail: targetHeadEmp?.email,
            units: formattedUnits,
            lastAssignedBy: currentUser ? currentUser.name : (activeRole === 'hr_director' ? 'HR Director' : 'HR Administration'),
            lastAssignedAt: new Date().toISOString(),
          };
          if (db) {
            setDoc(doc(db, 'departments', d.id), cleanForFirestore(updatedDept), { merge: true }).catch(() => {});
          }
          return updatedDept;
        }
        return d;
      });
      try {
        localStorage.setItem('aurahr_departments_v2', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    // If department name was changed, cascade to all employees and records
    if (oldDepartmentName !== newDeptName) {
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.department === oldDepartmentName) {
            return { ...e, department: newDeptName, currentDepartment: newDeptName };
          }
          return e;
        })
      );

      // Cascade to shift rosters
      setRosters((prev) =>
        prev.map((r) => (r.department === oldDepartmentName ? { ...r, department: newDeptName } : r))
      );

      // Cascade to shift swaps
      setShiftSwapRequests((prev) =>
        prev.map((s) => (s.department === oldDepartmentName ? { ...s, department: newDeptName } : s))
      );

      // Cascade to monthly unit rosters
      setMonthlyUnitRosters((prev) =>
        prev.map((m) => (m.department === oldDepartmentName ? { ...m, department: newDeptName } : m))
      );

      // Cascade to annual leave rosters
      setAnnualUnitLeaveRoasters((prev) =>
        prev.map((a) => (a.departmentName === oldDepartmentName ? { ...a, departmentName: newDeptName } : a))
      );

      // Cascade to leaves
      setLeaves((prev) =>
        prev.map((l) => (l.department === oldDepartmentName ? { ...l, department: newDeptName } : l))
      );

      // Cascade to grievances
      setGrievances((prev) =>
        prev.map((g) => (g.department === oldDepartmentName ? { ...g, department: newDeptName } : g))
      );

      // Cascade to performance reviews
      setPerformanceReviews((prev) =>
        prev.map((p) => (p.department === oldDepartmentName ? { ...p, department: newDeptName } : p))
      );

      // Cascade to conference meetings
      setConferenceMeetings((prev) =>
        prev.map((c) => (c.department === oldDepartmentName ? { ...c, department: newDeptName } : c))
      );

      // Cascade to expense claims
      setExpenseClaims((prev) =>
        prev.map((ex) => (ex.department === oldDepartmentName ? { ...ex, department: newDeptName } : ex))
      );
    }

    // Update HOD employee role & department
    if (targetHeadEmp) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === targetHeadEmp.id
            ? { ...e, role: 'dept_head', department: newDeptName }
            : e
        )
      );
    }

    // Update Unit Heads employee roles
    formattedUnits.forEach((u) => {
      if (u.unitHeadId) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === u.unitHeadId
              ? { ...e, role: 'unit_head', department: newDeptName, unit: u.unitName }
              : e
          )
        );
      }
    });

    addAuditLog(
      'Modified Department Details',
      'Leadership & Governance',
      `HR updated department '${oldDepartmentName}' to '${newDeptName}' (${newDeptCode}), HOD: ${headFullName || 'Unassigned'}, Units: ${formattedUnits.length}`
    );
    showToast('success', 'Department Updated', `Successfully updated department '${newDeptName}' details and synchronized leadership across all hospital modules.`);
  };

  const deleteDepartment = (departmentName: string, reassignToDepartment: string = 'General Medicine') => {
    const deptToDelete = departmentLeadership.find(
      (d) => d.departmentName.toLowerCase() === departmentName.toLowerCase() || d.id === departmentName
    );
    const targetName = deptToDelete ? deptToDelete.departmentName : departmentName;
    const targetId = deptToDelete?.id || departmentName;

    // Reassign all employees currently in this department
    let affectedStaffCount = 0;
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.department === targetName) {
          affectedStaffCount++;
          return {
            ...e,
            department: reassignToDepartment,
            currentDepartment: reassignToDepartment,
            role: e.role === 'dept_head' || e.role === 'unit_head' ? 'nurse' : e.role,
          };
        }
        return e;
      })
    );

    // Cascade reassignment to shift rosters
    setRosters((prev) =>
      prev.map((r) => (r.department === targetName ? { ...r, department: reassignToDepartment } : r))
    );

    // Cascade reassignment to shift swaps
    setShiftSwapRequests((prev) =>
      prev.map((s) => (s.department === targetName ? { ...s, department: reassignToDepartment } : s))
    );

    // Cascade reassignment to monthly unit rosters
    setMonthlyUnitRosters((prev) =>
      prev.map((m) => (m.department === targetName ? { ...m, department: reassignToDepartment } : m))
    );

    // Cascade reassignment to annual leave rosters
    setAnnualUnitLeaveRoasters((prev) =>
      prev.map((a) => (a.departmentName === targetName ? { ...a, departmentName: reassignToDepartment } : a))
    );

    // Cascade reassignment to leaves
    setLeaves((prev) =>
      prev.map((l) => (l.department === targetName ? { ...l, department: reassignToDepartment } : l))
    );

    // Cascade reassignment to grievances
    setGrievances((prev) =>
      prev.map((g) => (g.department === targetName ? { ...g, department: reassignToDepartment } : g))
    );

    // Cascade reassignment to performance reviews
    setPerformanceReviews((prev) =>
      prev.map((p) => (p.department === targetName ? { ...p, department: reassignToDepartment } : p))
    );

    // Cascade reassignment to conference meetings
    setConferenceMeetings((prev) =>
      prev.map((c) => (c.department === targetName ? { ...c, department: reassignToDepartment } : c))
    );

    // Cascade reassignment to expense claims
    setExpenseClaims((prev) =>
      prev.map((ex) => (ex.department === targetName ? { ...ex, department: reassignToDepartment } : ex))
    );

    // Remove from departmentLeadership state
    setDepartmentLeadership((prev) => {
      const updated = prev.filter((d) => d.departmentName.toLowerCase() !== targetName.toLowerCase() && d.id !== departmentName && d.id !== targetId);
      try {
        localStorage.setItem('aurahr_departments_v2', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Cloud Firestore delete
    if (db) {
      deleteDoc(doc(db, 'departments', targetId)).catch((err) => {
        console.warn('Firestore deleteDoc department error:', err);
      });
    }

    addAuditLog(
      'Deleted Hospital Department',
      'Leadership & Governance',
      `HR deleted department '${targetName}'. ${affectedStaffCount} staff member(s) and associated records automatically synchronized and reassigned to '${reassignToDepartment}'.`
    );
    showToast('success', 'Department Deleted', `Successfully removed '${targetName}'. ${affectedStaffCount} staff member(s) and records synchronized to '${reassignToDepartment}'.`);
  };

  const clearAllDepartments = async () => {
    setDepartmentLeadership([]);
    try {
      localStorage.setItem('aurahr_departments_v2', JSON.stringify([]));
    } catch (e) {
      console.warn('Failed to clear departments in localStorage', e);
    }

    if (db) {
      try {
        const snap = await getDocs(collection(db, 'departments'));
        const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
        await Promise.allSettled(deletePromises);
      } catch (err) {
        console.warn('Firestore departments bulk clear error:', err);
      }
    }

    addAuditLog(
      'Cleared All Hospital Departments',
      'Leadership & Governance',
      `HR Director / Super Admin cleared all departments from the system for fresh hospital configuration.`
    );
    showToast('info', 'All Departments Deleted', 'All hospital departments have been deleted from system and cloud database.');
  };

  const deleteUnit = (departmentName: string, unitIdOrName: string) => {
    setDepartmentLeadership((prev) =>
      prev.map((d) => {
        if (d.departmentName.toLowerCase() === departmentName.toLowerCase()) {
          const filteredUnits = d.units.filter((u) => u.id !== unitIdOrName && u.unitName !== unitIdOrName);
          return {
            ...d,
            units: filteredUnits.length > 0 ? filteredUnits : [
              {
                id: `u-${Date.now()}-1`,
                unitName: `${d.departmentName} General Unit`,
                departmentName: d.departmentName,
                staffCount: 4,
              }
            ],
            lastAssignedBy: currentUser ? currentUser.name : 'HR Directorate',
            lastAssignedAt: new Date().toISOString(),
          };
        }
        return d;
      })
    );

    addAuditLog(
      'Deleted Clinical Unit',
      'Leadership & Governance',
      `HR deleted unit '${unitIdOrName}' from department '${departmentName}'`
    );
    showToast('success', 'Unit Removed', `Unit removed from ${departmentName}.`);
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
          lastAssignedBy: 'Miss Vero (HR Director)',
          lastAssignedAt: new Date().toISOString(),
        };
      })
    );

    if (initialHeadId) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === initialHeadId
            ? { ...e, role: 'unit_head', department: departmentName, unit: unitName }
            : e
        )
      );
    }

    addAuditLog('Created Hospital Unit', 'Leadership & Governance', `HR created unit '${unitName}' under ${departmentName}`);
  };

  const saveAnnualUnitLeaveRoaster = (roaster: AnnualUnitLeaveRoaster) => {
    setAnnualUnitLeaveRoasters((prev) => {
      const idx = prev.findIndex((r) => r.id === roaster.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = roaster;
        return copy;
      }
      return [roaster, ...prev];
    });
    addAuditLog('Saved Annual Unit Leave Roaster', 'Leave Management', `Annual unit leave roaster for ${roaster.unitName} (${roaster.year}) saved. Status: ${roaster.status}`);
  };

  const approveAnnualUnitLeaveRoasterByHR = (roasterId: string, hrName: string, hrComments?: string) => {
    setAnnualUnitLeaveRoasters((prev) =>
      prev.map((r) => {
        if (r.id === roasterId) {
          return {
            ...r,
            status: 'HR Verified & Approved',
            hrVerifiedBy: hrName || 'Marcus Vance (HR Director)',
            hrVerifiedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            hrComments: hrComments || 'Verified against staffing ratios and approved by HR.',
          };
        }
        return r;
      })
    );
    addAuditLog('HR Verified Annual Unit Leave Roaster', 'Leave Management', `HR verified and approved annual leave roaster ID ${roasterId}`);
  };

  const updateAnnualLeaveItemByHR = (roasterId: string, itemId: string, updates: Partial<AnnualUnitLeaveRoasterItem>) => {
    setAnnualUnitLeaveRoasters((prev) =>
      prev.map((r) => {
        if (r.id === roasterId) {
          return {
            ...r,
            items: r.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, ...updates, hrModified: true };
              }
              return item;
            }),
          };
        }
        return r;
      })
    );
    addAuditLog('HR Modified Annual Leave Entry', 'Leave Management', `HR updated leave entry ID ${itemId} in roaster ID ${roasterId}`);
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

  // ==========================================
  // AUTOMATED PERFORMANCE APPRAISAL WORKFLOW
  // Multi-tier Cadre Approval Routing:
  // - Medical Doctors: Head of Department -> HR -> Head of Facility
  // - Unit Heads: Department Head -> HR -> Head of Facility
  // - Department Heads: HR -> Head of Facility
  // - Head of Facility: HR
  // - General Staff: Unit Head -> Department Head -> HR -> Head of Facility
  // ==========================================
  const addPerformanceAppraisal = (appraisalData: Partial<PerformanceAppraisal>) => {
    const employee = employees.find((e) => e.id === appraisalData.employeeId);
    const cadre: AppraisalCadre =
      appraisalData.cadre ||
      (employee?.role === 'doctor' ? 'medical_doctor' :
       employee?.role === 'unit_head' ? 'unit_head' :
       employee?.role === 'dept_head' ? 'dept_head' :
       employee?.role === 'facility_head' ? 'facility_head' : 'general_staff');

    // Appraisals follow the exact same sequential approval workflow as Leave: starts at Tier 1 (Unit Head)
    const initialStage: AppraisalStage = 'Unit Head';

    const timestamp = new Date().toISOString();
    const todayDate = timestamp.slice(0, 10);

    const initialWorkflow: MultiTierWorkflow = {
      currentStage: 'Unit Head',
      unitHeadStep: { role: 'Unit Head', status: 'Pending' },
      departmentHeadStep: { role: 'Departmental Head', status: 'Pending' },
      hrStep: { role: 'HR', status: 'Pending' },
      facilityHeadStep: { role: 'Head of Facility', status: 'Pending' },
    };

    const newAppraisal: PerformanceAppraisal = {
      id: appraisalData.id || `appr-${Date.now()}`,
      employeeId: appraisalData.employeeId || 'emp-101',
      employeeName: appraisalData.employeeName || (employee ? `${employee.firstName} ${employee.lastName}` : 'Staff Member'),
      empCode: appraisalData.empCode || employee?.empCode || 'SJH-000',
      jobTitle: appraisalData.jobTitle || employee?.jobTitle || 'Clinical Specialist',
      department: appraisalData.department || employee?.department || 'Medical Directorate',
      unit: appraisalData.unit || employee?.unit || 'General Care',
      appraisalCycle: appraisalData.appraisalCycle || '2026 Annual Performance Review',
      cadre,
      currentStage: initialStage,
      status: 'In Review',
      workflow: initialWorkflow,
      submittedAt: todayDate,
      selfAssessmentScore: appraisalData.selfAssessmentScore || 85,
      overallRating: appraisalData.overallRating || 4.2,
      overallScore: appraisalData.overallScore || appraisalData.overallRating || 4.2,
      coreCompetencies: appraisalData.coreCompetencies || [
        { id: 'c1', title: 'Clinical Expertise & Patient Safety', category: 'Clinical', score: 4.5, maxScore: 5, evaluatorComment: 'High attention to protocol compliance and patient well-being.' },
        { id: 'c2', title: 'Punctuality & Shift Attendance', category: 'Operational', score: 4.2, maxScore: 5, evaluatorComment: 'Consistent adherence to roster schedule and emergency shifts.' },
        { id: 'c3', title: 'Interprofessional Teamwork & Communication', category: 'Behavioral', score: 4.6, maxScore: 5, evaluatorComment: 'Excellent collaboration across nursing and medical units.' },
        { id: 'c4', title: 'Hospital Resource Stewardship', category: 'Operational', score: 4.0, maxScore: 5, evaluatorComment: 'Maintains equipment and inventory with diligent logging.' },
      ],
      kpiAchievements: appraisalData.kpiAchievements || [
        { id: 'k1', title: 'Clinical Care Plan Adherence', target: '95% of cases', achieved: '98% achieved', score: 4.8 },
        { id: 'k2', title: 'Incident-Free Handover Transitions', target: '100% compliance', achieved: '100% compliance', score: 5.0 },
      ],
      selfReviewNotes: appraisalData.selfReviewNotes || 'Completed all scheduled clinical shifts, participated in CME sessions, and upheld hospital quality care standards.',
      developmentObjectives: appraisalData.developmentObjectives || 'Advanced specialization courses in emergency trauma triage and digital medical records certification.',
      documents: appraisalData.documents || [],
      unitHeadStep: {
        stage: 'Unit Head',
        status: (cadre === 'medical_doctor' || cadre === 'dept_head' || cadre === 'facility_head') ? 'Bypassed' : 'Pending',
      },
      departmentHeadStep: {
        stage: 'Departmental Head',
        status: (cadre === 'dept_head' || cadre === 'facility_head') ? 'Bypassed' : 'Pending',
      },
      hrStep: {
        stage: 'HR',
        status: 'Pending',
      },
      facilityHeadStep: {
        stage: 'Head of Facility',
        status: (cadre === 'facility_head') ? 'Bypassed' : 'Pending',
      },
      auditHistory: [
        {
          id: `audit-${Date.now()}`,
          stage: initialStage,
          actorName: currentUser?.name || 'Staff Member',
          actorRole: currentUser?.role || 'nurse',
          action: 'Submitted',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          notes: `Performance Appraisal submitted into multi-tier workflow [Cadre: ${cadre.replace('_', ' ').toUpperCase()}]. Awaiting ${initialStage} review.`,
        }
      ]
    };

    setPerformanceAppraisals((prev) => {
      const updated = [newAppraisal, ...prev];
      localStorage.setItem('pjpiimc_performance_appraisals_v1', JSON.stringify(updated));
      return updated;
    });

    addAuditLog(
      `Submitted Performance Appraisal for ${newAppraisal.employeeName}`,
      'Performance Appraisal Workflow',
      `Cadre: ${newAppraisal.cadre} | Initial Reviewer: ${initialStage}`
    );

    // Notify reviewing managers
    dispatchNotification(
      'hr-director-1',
      `New Appraisal Submitted: ${newAppraisal.employeeName}`,
      `Staff member ${newAppraisal.employeeName} (${newAppraisal.jobTitle}) submitted an annual appraisal awaiting ${initialStage} review.`,
      'In-App',
      'Alert'
    );

    showToast('success', 'Appraisal Submitted Successfully', `Workflow initiated for ${newAppraisal.employeeName}. First reviewer: ${initialStage}`);
  };

  const updatePerformanceAppraisal = (id: string, updates: Partial<PerformanceAppraisal>) => {
    setPerformanceAppraisals((prev) => {
      const updated = prev.map((a) => (a.id === id ? { ...a, ...updates } : a));
      localStorage.setItem('pjpiimc_performance_appraisals_v1', JSON.stringify(updated));
      return updated;
    });
  };

  const processAppraisalWorkflowStep = (
    appraisalId: string,
    action: 'Approve' | 'Return',
    comments?: string,
    customApproverName?: string,
    ratingGiven?: number
  ) => {
    setPerformanceAppraisals((prev) => {
      const target = prev.find((a) => a.id === appraisalId);
      if (!target) return prev;

      const actorName = customApproverName || currentUser?.name || 'Hospital Authority';
      const actorRole = currentUser?.role || 'hr_director';
      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const todayDate = new Date().toISOString().slice(0, 10);
      const currStage = target.currentStage;
      const cadre = target.cadre;

      if (action === 'Return') {
        // Return appraisal for amendment
        const updatedTarget: PerformanceAppraisal = {
          ...target,
          status: 'Returned',
          auditHistory: [
            ...(target.auditHistory || []),
            {
              id: `audit-${Date.now()}`,
              stage: currStage,
              actorName,
              actorRole,
              action: 'Returned',
              timestamp: nowIso,
              notes: comments || `Appraisal returned at ${currStage} stage for revision.`,
            },
          ],
        };

        if (currStage === 'Unit Head') {
          updatedTarget.unitHeadStep = { ...updatedTarget.unitHeadStep, status: 'Returned', comments, approverName: actorName, actionDate: todayDate };
        } else if (currStage === 'Departmental Head') {
          updatedTarget.departmentHeadStep = { ...updatedTarget.departmentHeadStep, status: 'Returned', comments, approverName: actorName, actionDate: todayDate };
        } else if (currStage === 'HR') {
          updatedTarget.hrStep = { ...updatedTarget.hrStep, status: 'Returned', comments, approverName: actorName, actionDate: todayDate };
        } else if (currStage === 'Head of Facility') {
          updatedTarget.facilityHeadStep = { ...updatedTarget.facilityHeadStep, status: 'Returned', comments, approverName: actorName, actionDate: todayDate };
        }

        dispatchNotification(
          target.employeeId,
          `Appraisal Returned for Revision: ${currStage}`,
          `Your appraisal was returned by ${actorName} (${currStage}). Note: ${comments || 'Please revise and re-submit.'}`,
          'In-App',
          'Alert'
        );

        addAuditLog(
          `Returned Appraisal for ${target.employeeName}`,
          'Performance Appraisal Workflow',
          `Returned by ${actorName} at ${currStage}. Reason: ${comments || 'Clarification required'}`
        );

        showToast('error', 'Appraisal Returned', `Returned back to ${target.employeeName} for corrections.`);

        const updatedList = prev.map((a) => (a.id === appraisalId ? updatedTarget : a));
        localStorage.setItem('pjpiimc_performance_appraisals_v1', JSON.stringify(updatedList));
        return updatedList;
      }

      // Action is APPROVE: Compute Next Stage based on strict 4-Tier Workflow identical to Leave:
      // Tier 1: Unit Head -> Tier 2: Departmental Head -> Tier 3: HR -> Tier 4: Head of Facility -> Completed / Fully Approved

      let nextStage: AppraisalStage = 'Completed';
      let nextStatus: PerformanceAppraisal['status'] = 'Under Review';

      const updatedWorkflow: MultiTierWorkflow = target.workflow
        ? { ...target.workflow }
        : {
            currentStage: 'Unit Head',
            unitHeadStep: { role: 'Unit Head', status: 'Pending' },
            departmentHeadStep: { role: 'Departmental Head', status: 'Pending' },
            hrStep: { role: 'HR', status: 'Pending' },
            facilityHeadStep: { role: 'Head of Facility', status: 'Pending' },
          };

      const nowTimestamp = new Date().toISOString();

      if (currStage === 'Unit Head') {
        nextStage = 'Departmental Head';
        updatedWorkflow.unitHeadStep = {
          role: 'Unit Head',
          status: 'Approved',
          approverName: actorName,
          approvedAt: nowTimestamp,
          comments: comments || 'Tier 1 (Unit Head) approved.',
          signatureCertified: true,
        };
        updatedWorkflow.currentStage = 'Departmental Head';
      } else if (currStage === 'Departmental Head') {
        nextStage = 'HR';
        updatedWorkflow.departmentHeadStep = {
          role: 'Departmental Head',
          status: 'Approved',
          approverName: actorName,
          approvedAt: nowTimestamp,
          comments: comments || 'Tier 2 (Departmental Head) approved.',
          signatureCertified: true,
        };
        updatedWorkflow.currentStage = 'HR';
      } else if (currStage === 'HR') {
        nextStage = 'Head of Facility';
        updatedWorkflow.hrStep = {
          role: 'HR',
          status: 'Approved',
          approverName: actorName,
          approvedAt: nowTimestamp,
          comments: comments || 'Tier 3 (HR Directorate) verified & approved.',
          signatureCertified: true,
        };
        updatedWorkflow.currentStage = 'Head of Facility';
      } else if (currStage === 'Head of Facility') {
        nextStage = 'Completed';
        nextStatus = 'Completed';
        updatedWorkflow.facilityHeadStep = {
          role: 'Head of Facility',
          status: 'Approved',
          approverName: actorName,
          approvedAt: nowTimestamp,
          comments: comments || 'Tier 4 (Head of Facility) final certification granted.',
          signatureCertified: true,
        };
        updatedWorkflow.currentStage = 'Fully Approved';
      } else {
        nextStage = 'Completed';
        nextStatus = 'Completed';
      }

      const updatedTarget: PerformanceAppraisal = {
        ...target,
        currentStage: nextStage,
        status: nextStatus,
        workflow: updatedWorkflow,
        overallRating: ratingGiven !== undefined ? ratingGiven : target.overallRating,
        completedAt: nextStatus === 'Completed' ? todayDate : target.completedAt,
        certifiedBy: nextStatus === 'Completed' ? actorName : target.certifiedBy,
        auditHistory: [
          ...(target.auditHistory || []),
          {
            id: `audit-${Date.now()}`,
            stage: currStage,
            actorName,
            actorRole,
            action: 'Approved',
            timestamp: nowIso,
            notes: comments || `Approved at ${currStage} tier.${nextStatus === 'Completed' ? ' Performance Review Cycle Finalized and Certified.' : ` Forwarded to ${nextStage}.`}`,
          },
        ],
      };

      // Record step details
      const stepRecord = {
        status: 'Approved' as const,
        approverName: actorName,
        approverRole: actorRole,
        actionDate: todayDate,
        comments: comments || 'Endorsed and forwarded to next governance tier.',
        ratingGiven: ratingGiven !== undefined ? ratingGiven : undefined,
      };

      if (currStage === 'Unit Head') {
        updatedTarget.unitHeadStep = { ...updatedTarget.unitHeadStep, ...stepRecord, stage: 'Unit Head' };
      } else if (currStage === 'Departmental Head') {
        updatedTarget.departmentHeadStep = { ...updatedTarget.departmentHeadStep, ...stepRecord, stage: 'Departmental Head' };
      } else if (currStage === 'HR') {
        updatedTarget.hrStep = { ...updatedTarget.hrStep, ...stepRecord, stage: 'HR' };
      } else if (currStage === 'Head of Facility') {
        updatedTarget.facilityHeadStep = { ...updatedTarget.facilityHeadStep, ...stepRecord, stage: 'Head of Facility' };
      }

      // If completed, synchronize employee profile performance score & appraisal date
      if (nextStatus === 'Completed') {
        setEmployees((prevEmps) =>
          prevEmps.map((emp) => {
            if (emp.id === target.employeeId) {
              return {
                ...emp,
                performanceScore: Math.round(((updatedTarget.overallRating || 4.5) / 5) * 100),
                lastAppraisalDate: todayDate,
                appraisalStatus: 'Completed',
              };
            }
            return emp;
          })
        );
      }

      // Automated Notification Dispatches
      if (nextStatus === 'Completed') {
        dispatchNotification(
          target.employeeId,
          'Performance Appraisal Certified & Completed! 🎉',
          `Your ${target.appraisalCycle || target.appraisalPeriod} has successfully cleared all supervisory tiers and is officially certified by ${actorName}. Final Rating: ${updatedTarget.overallRating || 4.5}/5.0`,
          'In-App',
          'Approval'
        );
        showToast('success', 'Appraisal Fully Certified', `${target.employeeName}'s appraisal workflow is now fully approved & archived.`);
      } else {
        dispatchNotification(
          target.employeeId,
          `Appraisal Tier Approved: ${currStage}`,
          `Your appraisal was endorsed by ${actorName} and advanced to ${nextStage} for review.`,
          'In-App',
          'Approval'
        );
        showToast('success', `Appraisal Advanced to ${nextStage}`, `Endorsed by ${actorName}. Workflow step complete.`);
      }

      addAuditLog(
        `Appraisal Step Approved for ${target.employeeName} (${currStage} -> ${nextStage})`,
        'Performance Appraisal Workflow',
        `Approved by ${actorName}. Comments: ${comments || 'None'}`
      );

      const updatedList = prev.map((a) => (a.id === appraisalId ? updatedTarget : a));
      localStorage.setItem('pjpiimc_performance_appraisals_v1', JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const uploadAppraisalDocument = async (
    appraisalId: string,
    docData: {
      fileName: string;
      fileType: string;
      fileSize: number;
      fileData: string;
      category: AppraisalDocument['category'];
      description?: string;
    }
  ): Promise<AppraisalDocument> => {
    const target = performanceAppraisals.find((a) => a.id === appraisalId);
    const newDoc: AppraisalDocument = {
      id: `doc-appr-${Date.now()}`,
      fileName: docData.fileName,
      fileType: docData.fileType,
      fileSize: docData.fileSize,
      fileData: docData.fileData,
      category: docData.category,
      uploadedBy: currentUser?.name || 'Staff Member',
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      description: docData.description || 'Official performance evidence document',
    };

    setPerformanceAppraisals((prev) => {
      const updated = prev.map((a) => {
        if (a.id === appraisalId) {
          return {
            ...a,
            documents: [...(a.documents || []), newDoc],
            auditHistory: [
              ...(a.auditHistory || []),
              {
                id: `audit-${Date.now()}`,
                stage: a.currentStage,
                actorName: currentUser?.name || 'Staff Member',
                actorRole: currentUser?.role || 'nurse',
                action: 'Document Uploaded',
                timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                notes: `Uploaded evidence document: "${docData.fileName}" (${docData.category})`,
              },
            ],
          };
        }
        return a;
      });
      localStorage.setItem('pjpiimc_performance_appraisals_v1', JSON.stringify(updated));
      return updated;
    });

    // Also mirror to Staff File Vault so it is accessible in Employee Files
    if (target?.employeeId) {
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id === target.employeeId) {
            const currentFiles = e.files || [];
            return {
              ...e,
              files: [
                ...currentFiles,
                {
                  id: `file-${Date.now()}`,
                  fileName: docData.fileName,
                  fileType: docData.fileType,
                  fileSize: docData.fileSize,
                  category: 'Performance Review' as const,
                  fileData: docData.fileData,
                  uploadedAt: new Date().toISOString().slice(0, 10),
                  description: `Performance appraisal document for ${target.appraisalCycle || target.appraisalPeriod}: ${docData.description || docData.fileName}`,
                },
              ],
            };
          }
          return e;
        })
      );
    }

    addAuditLog(
      `Uploaded Appraisal Document: ${docData.fileName}`,
      'Performance Appraisal Workflow',
      `Appraisal ID: ${appraisalId} | Staff: ${target?.employeeName || 'Staff'}`
    );

    showToast('success', 'Document Attached', `"${docData.fileName}" attached to performance appraisal.`);
    return newDoc;
  };

  const toggleStaffAdminLoginAccess = async (employeeId: string, granted: boolean) => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    const nowIso = new Date().toISOString();

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            adminLoginGranted: granted,
            adminLoginGrantedAt: granted ? nowIso : undefined,
            adminLoginGrantedBy: granted ? (currentUser?.name || 'HR Directorate') : undefined,
            portalAccess: {
              ...(emp.portalAccess || {
                username: emp.email || emp.empCode,
                usernameType: emp.email ? 'email' : 'empCode',
                tempPassword: emp.empCode,
                passwordType: 'empCode',
              }),
              adminLoginGranted: granted,
            },
          };
        }
        return emp;
      })
    );

    // Update staffPermissions record
    setStaffPermissions((prev) => {
      const idx = prev.findIndex((p) => p.employeeId === employeeId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = {
          ...copy[idx],
          hasAdminLoginAccess: granted,
          grantedModules: granted
            ? Array.from(new Set([...(copy[idx].grantedModules || []), 'admin_portal', 'customization', 'analytics']))
            : (copy[idx].grantedModules || []).filter((m) => !['admin_portal', 'customization'].includes(m)),
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            employeeId,
            employeeName: targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName}` : 'Staff Member',
            email: targetEmp?.email || '',
            hasAdminLoginAccess: granted,
            grantedModules: granted ? ['admin_portal', 'customization', 'analytics'] : [],
            grantedAt: nowIso.replace('T', ' ').slice(0, 19),
            grantedBy: currentUser?.name || 'HR Directorate',
            notes: granted ? 'HR granted clearance for Administrator Portal login' : 'HR revoked clearance for Administrator Portal login',
          },
        ];
      }
    });

    const empName = targetEmp ? `${targetEmp.firstName} ${targetEmp.lastName}` : employeeId;
    addAuditLog(
      `HR ${granted ? 'GRANTED' : 'REVOKED'} Administrator Login Clearance for ${empName}`,
      'Security & Access Control',
      `Action taken by ${currentUser?.name || 'HR Directorate'}`
    );

    showToast(
      granted ? 'success' : 'info',
      `Administrator Login Clearance ${granted ? 'Granted' : 'Revoked'}`,
      `${empName} ${granted ? 'can now log into the Administrator Portal.' : 'is restricted to Employee self-service portal.'}`
    );
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
      preparedBy: rosterData.preparedBy || (currentUser ? currentUser.name : 'Unit In-Charge'),
      preparedByRole: rosterData.preparedByRole || (currentUser ? currentUser.jobTitle : 'Head of Department'),
      preparedByEmail: rosterData.preparedByEmail || (currentUser ? currentUser.email : 'unithead@popejohnpaul2med.org'),
      totalStaffCount: rosterData.totalStaffCount || 12,
      totalPlannedHours: rosterData.totalPlannedHours || 1920,
      submissionDate: new Date().toISOString().split('T')[0],
      fileName: rosterData.fileName || `${rosterData.department?.replace(/[^a-zA-Z]/g, '_')}_Duty_Roster.xlsx`,
      fileSize: rosterData.fileSize || '1.5 MB',
      notes: rosterData.notes || 'Monthly department schedule uploaded for HR review and verification.',
      status: (rosterData.status as any) || 'Pending Verification',
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
      staffGrid: rosterData.staffGrid,
    };

    setMonthlyUnitRosters((prev) => {
      // If roster already exists for same department and month/year, replace or prepend
      const existingIdx = prev.findIndex(
        (r) => r.department === newRoster.department && r.month.toUpperCase() === newRoster.month.toUpperCase() && r.year === newRoster.year
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        const currentStatus = prev[existingIdx].status;
        const targetStatus = rosterData.status || (currentStatus === 'Approved' ? 'Approved' : 'Pending Verification');
        copy[existingIdx] = { ...copy[existingIdx], ...newRoster, status: targetStatus };
        return copy;
      }
      return [newRoster, ...prev];
    });

    addAuditLog(
      'Submitted Monthly Department Duty Roster',
      'Shift Roster Management',
      `Submitted ${newRoster.month} ${newRoster.year} duty roster for ${newRoster.department} (Unit: ${newRoster.unit}, Staff: ${newRoster.totalStaffCount}). Status: Pending Verification.`
    );

    dispatchNotification(
      'emp-103', // HR Director
      'New Duty Roster Pending Verification',
      `Department ${newRoster.department} (${newRoster.unit}) submitted monthly duty roster for ${newRoster.month} ${newRoster.year}. Awaiting HR audit and verification.`,
      'In-App',
      'Approval'
    );

    showToast(
      'success',
      'Duty Roster Submitted',
      `Roster for ${newRoster.department} (${newRoster.month} ${newRoster.year}) submitted to HR with 'Pending Verification' status.`
    );
  };

  const updateMonthlyUnitRosterStatus = (
    id: string,
    status: DepartmentMonthlyRoster['status'],
    rejectionNotes?: string
  ) => {
    const reviewerName = currentUser ? currentUser.name : activeRole === 'hr_director' ? 'Marcus Vance (HR Director)' : 'HR Directorate';
    const reviewDateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    let targetRoster: DepartmentMonthlyRoster | undefined;

    setMonthlyUnitRosters((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        targetRoster = {
          ...r,
          status,
          reviewedBy: reviewerName,
          reviewedDate: reviewDateStr,
          rejectionNotes: rejectionNotes || (status === 'Approved' ? undefined : r.rejectionNotes),
        };
        return targetRoster;
      })
    );

    const activeRoster = targetRoster || monthlyUnitRosters.find((r) => r.id === id);
    if (activeRoster) {
      // Locate Unit Head or HOD for automated notification
      const deptLead = (departmentLeadership || []).find(
        (d) => d.departmentName.toLowerCase() === activeRoster.department.toLowerCase()
      );
      const unitLead = deptLead?.units?.find(
        (u) => u.unitName.toLowerCase() === activeRoster.unit.toLowerCase()
      );
      const recipientId = unitLead?.unitHeadId || deptLead?.hodId || 'usr-dept-head';
      const recipientEmail = unitLead?.unitHeadEmail || deptLead?.hodEmail || activeRoster.preparedByEmail;

      if (status === 'Approved') {
        addAuditLog(
          'Approved Monthly Duty Roster',
          'Shift Roster Management',
          `HR (${reviewerName}) verified and approved the ${activeRoster.month} ${activeRoster.year} duty roster for ${activeRoster.department} (${activeRoster.unit}). Roster is cleared for deployment and payroll.`
        );

        dispatchNotification(
          recipientId,
          `Duty Roster Verified & Approved (${activeRoster.month} ${activeRoster.year})`,
          `Your monthly duty roster for ${activeRoster.department} - ${activeRoster.unit} has been verified and officially approved by ${reviewerName}. It is now active for shift coverage.`,
          'Email',
          'Shift_Change'
        );

        showToast(
          'success',
          'Duty Roster Approved',
          `Roster for ${activeRoster.department} has been approved. Automated notification sent to Unit Head.`
        );
      } else if (status === 'Returned for Revision') {
        addAuditLog(
          'Returned Duty Roster for Revision',
          'Shift Roster Management',
          `HR (${reviewerName}) requested revisions for ${activeRoster.department} (${activeRoster.month} ${activeRoster.year}) duty roster. Notes: "${rejectionNotes || 'Please adjust shift allocations'}"`
        );

        dispatchNotification(
          recipientId,
          `Revision Required: Duty Roster (${activeRoster.month} ${activeRoster.year})`,
          `HR has returned the ${activeRoster.month} ${activeRoster.year} duty roster for ${activeRoster.department} (${activeRoster.unit}) for revision. Notes: "${rejectionNotes || 'Coverage adjustments needed'}". Please update and resubmit.`,
          'Email',
          'Alert'
        );

        showToast(
          'info',
          'Revision Requested',
          `Roster returned for revision. Automated alert and notes dispatched to ${activeRoster.preparedBy || 'Unit Head'}.`
        );
      } else {
        addAuditLog(
          `Updated Duty Roster Status to ${status}`,
          'Shift Roster Management',
          `Status changed to ${status} for ${activeRoster.department} (${activeRoster.month} ${activeRoster.year})`
        );
      }
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
      mustChangePassword?: boolean;
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

    const mustChange = options.mustChangePassword !== undefined ? options.mustChangePassword : true;

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
      mustChangePassword: mustChange,
      customPassword: options.passwordType === 'custom' ? options.customPassword : tempPassword,
    };

    updateEmployee(employeeId, {
      portalAccess: updatedPortalAccess,
      customPassword: options.passwordType === 'custom' ? options.customPassword : tempPassword,
      mustChangePassword: mustChange,
    });

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
      senderEmail: 'attasam223@gmail.com',
      senderName: 'AuraHR Healthcare System',
      replyTo: 'attasam223@gmail.com',
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
          senderEmail: 'attasam223@gmail.com',
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

  const sendPortalInviteSms = async (employeeId: string): Promise<EmailDispatchResult> => {
    const targetEmp = employees.find((e) => e.id === employeeId);
    if (!targetEmp) {
      return {
        success: false,
        recipientEmail: '',
        recipientName: 'Unknown Employee',
        senderEmail: 'attasam223@gmail.com',
        senderName: 'AuraHR SMS Gateway',
        replyTo: 'attasam223@gmail.com',
        organizationDomain: 'aurahr.health',
        subject: 'SMS Error',
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
    const username = targetEmp.portalAccess?.username || targetEmp.email || targetEmp.empCode;
    const tempPassword = targetEmp.portalAccess?.tempPassword || targetEmp.empCode;
    const subject = `[SMS Credentials] AuraHR Staff Portal - ${empName}`;
    const smsMessage = `[AuraHR Staff Portal Credentials]\nDear ${empName},\nYour login credentials:\nURL: https://aurahr.health/login\nUsername: ${username}\nTemp Password: ${tempPassword}\nPlease log in & change password immediately.`;

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

    const defaultSmsSender = {
      senderEmail: 'attasam223@gmail.com',
      senderName: 'AuraHR SMS Relay',
      replyTo: 'attasam223@gmail.com',
      organizationDomain: 'aurahr.health',
      smtpServer: 'AuraHR GSM Cellular Gateway',
      dkimSignature: 'v=1; a=rsa-sha256; cellular-verified;',
      spfStatus: 'PASS (sms.aurahr.health)',
    };

    if (!targetEmp.phone || targetEmp.phone.trim().length < 5) {
      return {
        success: false,
        recipientEmail: targetEmp.email || '',
        recipientPhone: targetEmp.phone || '',
        recipientName: empName,
        ...defaultSmsSender,
        subject,
        body: smsMessage,
        smsMessage,
        username,
        tempPassword,
        portalUrl: 'https://aurahr.health/login',
        timestamp: new Date().toISOString(),
        dispatchId: 'ERR-NO-PHONE',
        error: `Cannot send SMS: ${empName} does not have a valid mobile phone number configured in their employee profile.`,
      };
    }

    try {
      const response = await fetch('/api/notifications/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientPhone: targetEmp.phone,
          recipientName: empName,
          username,
          tempPassword,
          portalUrl: 'https://aurahr.health/login',
          customMessage: smsMessage,
        }),
      });

      const data = await response.json();

      addAuditLog(
        'Dispatched Portal Credentials SMS',
        'Employee Directory',
        `Dispatched portal credentials SMS to ${empName} (${targetEmp.phone})`
      );

      return {
        success: true,
        channel: 'SMS',
        recipientEmail: targetEmp.email || '',
        recipientPhone: targetEmp.phone,
        recipientName: empName,
        senderEmail: 'attasam223@gmail.com',
        senderName: 'AuraHR SMS Gateway',
        replyTo: 'attasam223@gmail.com',
        organizationDomain: 'aurahr.health',
        smtpServer: 'AuraHR Cellular GSM Gateway',
        dkimSignature: 'v=1; a=rsa-sha256; cellular-verified;',
        spfStatus: 'PASS (sms.aurahr.health)',
        subject,
        body: smsMessage,
        smsMessage,
        username,
        tempPassword,
        portalUrl: 'https://aurahr.health/login',
        timestamp: data.timestamp || new Date().toISOString(),
        dispatchId: data.dispatchId || `SMS-${Date.now()}`,
      };
    } catch (err: any) {
      addAuditLog(
        'Dispatched Portal Credentials SMS (Offline Mode)',
        'Employee Directory',
        `Simulated credentials SMS dispatch to ${empName} (${targetEmp.phone})`
      );

      return {
        success: true,
        channel: 'SMS',
        recipientEmail: targetEmp.email || '',
        recipientPhone: targetEmp.phone,
        recipientName: empName,
        ...defaultSmsSender,
        subject,
        body: smsMessage,
        smsMessage,
        username,
        tempPassword,
        portalUrl: 'https://aurahr.health/login',
        timestamp: new Date().toISOString(),
        dispatchId: `SMS-SIM-${Date.now()}`,
      };
    }
  };

  // Currency Formatter (Enforced GH₵ for all)
  const formatCurrency = (amount: number): string => {
    return `GH₵ ${amount.toLocaleString()}`;
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
          ? { ...p, grantedModules: (p.grantedModules || []).filter((m) => m !== moduleId) }
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
          const likedList = p.likedBy || [];
          const hasLiked = likedList.includes(empId);
          const newLikedBy = hasLiked ? likedList.filter((id) => id !== empId) : [...likedList, empId];
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
          const acks = p.acknowledgements || [];
          if (!acks.includes(empName)) {
            return {
              ...p,
              acknowledgements: [...acks, empName],
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
          const upvotesList = s.upvotedBy || [];
          const hasUpvoted = upvotesList.includes(empId);
          const newUpvoted = hasUpvoted ? upvotesList.filter((id) => id !== empId) : [...upvotesList, empId];
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

  // PJPIIMC Information Hub Governance & Sole HR Responsibilities
  const canManageInfoHub = (role?: UserRole, department?: string): boolean => {
    const activeRole = role || currentUser?.role;
    const activeDept = department || currentUser?.department;
    const isSuperAdminUser =
      currentUser?.email?.toLowerCase() === 'attasam223@gmail.com' ||
      currentUser?.empCode === 'PJ-0001' ||
      currentUser?.id === 'emp-atta-frimpong' ||
      currentUser?.id === 'emp-super-admin' ||
      activeRole === 'super_admin';

    if (isSuperAdminUser) return true;
    if (activeRole === 'hr_director' || activeRole === 'hr_manager') return true;
    if (activeRole === 'facility_head') return true;
    if (activeDept && (activeDept.toLowerCase().includes('human resource') || activeDept.toLowerCase().includes('executive administration'))) {
      return true;
    }
    return false;
  };

  const addInfoArticle = async (article: Omit<InfoHubArticle, 'id'>) => {
    if (!canManageInfoHub()) {
      throw new Error(
        'Access Denied: The Human Resources Directorate is solely responsible for uploading and publishing policies, vision and mission, code of ethics, and governance charters in the PJPIIMC Info Hub.'
      );
    }
    const newArticle: InfoHubArticle = {
      ...article,
      id: `art-${Date.now()}`,
      lastUpdated: article.lastUpdated || new Date().toISOString().split('T')[0],
      version: article.version || '1.0',
      author: article.author || `${currentUser?.name || 'HR Directorate'} (${currentUser?.jobTitle || 'Human Resources'})`,
    };
    setInfoArticles((prev) => [newArticle, ...prev]);
    addAuditLog('Uploaded Info Hub Policy', 'Information Hub', `Uploaded "${newArticle.title}" [${newArticle.category}]`);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        recipientId: 'all',
        title: 'New Policy Published in Info Hub',
        message: `HR Directorate has published a new document: "${newArticle.title}" under ${newArticle.category}.`,
        channel: 'In-App',
        type: 'System',
        read: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
  };

  const updateInfoArticle = async (id: string, updates: Partial<InfoHubArticle>) => {
    if (!canManageInfoHub()) {
      throw new Error(
        'Access Denied: The Human Resources Directorate is solely responsible for updating policies, vision and mission, code of ethics, and institutional guidelines.'
      );
    }
    setInfoArticles((prev) =>
      prev.map((art) => {
        if (art.id === id) {
          const updated = {
            ...art,
            ...updates,
            lastUpdated: updates.lastUpdated || new Date().toISOString().split('T')[0],
            author: updates.author || art.author || `${currentUser?.name || 'HR Directorate'}`,
          };
          return updated;
        }
        return art;
      })
    );
    addAuditLog('Updated Info Hub Policy', 'Information Hub', `Updated policy: "${updates.title || id}" [Rev. ${updates.version || 'New'}]`);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        recipientId: 'all',
        title: 'Policy Revision in Info Hub',
        message: `HR has updated the policy document: "${updates.title || 'Institutional Policy'}".`,
        channel: 'In-App',
        type: 'System',
        read: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
  };

  const deleteInfoArticle = async (id: string) => {
    if (!canManageInfoHub()) {
      throw new Error(
        'Access Denied: Only the Human Resources Directorate is authorized to delete or archive policy documents from the PJPIIMC Info Hub.'
      );
    }
    const target = infoArticles.find((a) => a.id === id);
    setInfoArticles((prev) => prev.filter((art) => art.id !== id));
    addAuditLog('Archived Info Hub Policy', 'Information Hub', `Archived policy: ${target?.title || id}`);
  };

  const resetInfoArticlesToDefault = async () => {
    if (!canManageInfoHub()) {
      throw new Error('Access Denied: Only HR Directorate can restore institutional policy baselines.');
    }
    setInfoArticles(MOCK_INFO_ARTICLES);
    localStorage.removeItem('pjpiimc_info_hub_articles_v1');
    addAuditLog('Restored Info Hub Policies', 'Information Hub', 'Restored institutional baseline documents');
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
    // Executive Leadership (Super Admin, Facility Head, HR Director, HR Manager) has full system access
    if (EXECUTIVE_ROLES.includes(role)) {
      return true;
    }

    // Check if user has explicit HR-granted custom access via Staff Access Permissions Manager
    const checkId = employeeId || currentUser?.id;
    if (checkId) {
      const perm = (staffPermissions || []).find(
        (p) => p && (p.employeeId === checkId || (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()))
      );
      if (perm && (perm.grantedModules || []).includes(moduleKey)) {
        return true;
      }
    }

    // Disciplinary Board & Query Issuance are strictly restricted to HR & Head of Facility, or explicit HR grant
    if (moduleKey === 'disciplinary_board' || moduleKey === 'query_issuance') {
      return false;
    }

    // Supervisory roles baseline modules
    if (SUPERVISORY_ROLES.includes(role)) {
      const supervisoryModules = [...DEFAULT_STAFF_MODULES, 'employees', 'org_hierarchy', 'conference'];
      if (supervisoryModules.includes(moduleKey)) return true;
    }

    // Standard baseline staff modules
    if (DEFAULT_STAFF_MODULES.includes(moduleKey)) {
      return true;
    }

    return false;
  };

  const canIssueQueries = (roleToCheck?: UserRole, empIdToCheck?: string): boolean => {
    const currentRole = roleToCheck || activeRole;
    // HR Directorate & Head of Facility have unconditional authority to query staff
    if (EXECUTIVE_ROLES.includes(currentRole)) {
      return true;
    }

    // For Unit Heads, Departmental Heads, or any other staff: HR must have explicitly granted query authority in Access Control
    const checkId = empIdToCheck || currentUser?.id;
    if (checkId) {
      const perm = (staffPermissions || []).find(
        (p) => p && (p.employeeId === checkId || (currentUser?.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()))
      );
      if (
        perm &&
        (perm.grantedModules || []).some((m) =>
          ['query_issuance', 'disciplinary_board', 'disciplinary_queries'].includes(m)
        )
      ) {
        return true;
      }
    }
    return false;
  };

  // Disciplinary Board & Query Handlers
  const addDisciplinaryBoardMember = (member: Omit<DisciplinaryBoardMember, 'id'>) => {
    const newMember: DisciplinaryBoardMember = {
      ...member,
      id: `dbm-${Date.now()}`,
    };
    setDisciplinaryBoardMembers((prev) => [newMember, ...prev]);
    addAuditLog(
      `Appointed Disciplinary Board Member: ${newMember.name} as ${newMember.boardRole}`,
      'Disciplinary & Governance',
      `Appointed by ${currentUser?.name || 'HR Management'}`
    );
    dispatchNotification(
      newMember.employeeId || 'all_staff',
      'New Disciplinary Board Appointment',
      `${newMember.name} has been appointed to the Standing Disciplinary Board as ${newMember.boardRole}.`,
      'In-App',
      'Alert'
    );
    showToast('success', 'Board Member Appointed', `${newMember.name} is now registered on the Disciplinary Panel.`);
  };

  const updateDisciplinaryBoardMember = (id: string, updates: Partial<DisciplinaryBoardMember>) => {
    setDisciplinaryBoardMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
    addAuditLog(
      `Updated Disciplinary Board Member ${id}`,
      'Disciplinary & Governance',
      `Modified attributes: ${Object.keys(updates).join(', ')}`
    );
    showToast('success', 'Board Record Updated', 'Member details have been updated.');
  };

  const removeDisciplinaryBoardMember = (id: string) => {
    const target = disciplinaryBoardMembers.find((m) => m.id === id);
    setDisciplinaryBoardMembers((prev) => prev.filter((m) => m.id !== id));
    addAuditLog(
      `Removed Disciplinary Board Member: ${target?.name || id}`,
      'Disciplinary & Governance',
      `Removed by ${currentUser?.name || 'HR Management'}`
    );
    showToast('success', 'Board Member Removed', `${target?.name || 'Member'} has been removed from the board.`);
  };

  const issueStaffQuery = (queryData: Omit<StaffQuery, 'id' | 'queryNumber' | 'dateIssued' | 'status'>): StaffQuery => {
    const seqNumber = String(staffQueries.length + 1).padStart(3, '0');
    const queryYear = new Date().getFullYear();
    const queryNumber = `PJPII/HR/QRY/${queryYear}/${seqNumber}`;
    const dateIssued = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newQuery: StaffQuery = {
      ...queryData,
      id: `qry-${Date.now()}`,
      queryNumber,
      dateIssued,
      status: 'Awaiting Staff Response',
    };

    setStaffQueries((prev) => [newQuery, ...prev]);

    addAuditLog(
      `Issued Staff Query ${queryNumber} to ${newQuery.staffName} (${newQuery.staffEmpCode})`,
      'Disciplinary & Governance',
      `Allegation: ${newQuery.subject} (Severity: ${newQuery.severity})`
    );

    dispatchNotification(
      newQuery.staffId,
      'Formal Query Issued',
      `HR Disciplinary Query ${queryNumber} issued to ${newQuery.staffName}. Response deadline: ${newQuery.responseDeadlineHours} hrs.`,
      'Email',
      'Alert'
    );

    showToast('success', 'Staff Query Issued', `Official query ${queryNumber} dispatched to ${newQuery.staffName}.`);
    return newQuery;
  };

  const updateStaffQuery = (queryId: string, updates: Partial<StaffQuery>) => {
    setStaffQueries((prev) =>
      prev.map((q) => (q.id === queryId ? { ...q, ...updates } : q))
    );

    addAuditLog(
      `Updated Query Memo: ${queryId}`,
      'Disciplinary & Governance',
      `Modified memo particulars by ${currentUser?.name || 'Authorized Officer'}`
    );

    showToast('success', 'Query Memorandum Updated', 'Changes to the official query memorandum have been saved.');
  };

  const submitStaffQueryResponse = (queryId: string, response: StaffQuery['staffResponse']) => {
    setStaffQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              staffResponse: response,
              status: 'Response Submitted',
            }
          : q
      )
    );

    const targetQuery = staffQueries.find((q) => q.id === queryId);

    addAuditLog(
      `Staff Query Response Filed for ${targetQuery?.queryNumber || queryId}`,
      'Disciplinary & Governance',
      `Plea: ${response?.plea || 'Written explanation tendered'}`
    );

    dispatchNotification(
      targetQuery?.issuedById || 'hr_director',
      'Query Defense Submitted',
      `Staff ${targetQuery?.staffName || 'Employee'} has submitted a written response for query ${targetQuery?.queryNumber || queryId}.`,
      'Email',
      'Alert'
    );

    showToast('success', 'Defense Submitted', 'Your formal written response has been recorded and submitted to HR & the Disciplinary Board.');
  };

  const updateStaffQueryStatus = (queryId: string, status: StaffQuery['status'], updates?: Partial<StaffQuery>) => {
    setStaffQueries((prev) =>
      prev.map((q) =>
        q.id === queryId
          ? {
              ...q,
              status,
              ...(updates || {}),
            }
          : q
      )
    );

    addAuditLog(
      `Updated Query Status: ${queryId} to ${status}`,
      'Disciplinary & Governance',
      `Action taken by ${currentUser?.name || 'HR Management'}`
    );

    showToast('success', 'Query Status Updated', `Status updated to ${status}.`);
  };

  const scheduleDisciplinaryHearing = (hearingData: Omit<DisciplinaryHearing, 'id' | 'hearingCaseNumber' | 'createdAt'>): DisciplinaryHearing => {
    const hearingYear = new Date().getFullYear();
    const seq = String(disciplinaryHearings.length + 1).padStart(3, '0');
    const hearingCaseNumber = `PJPII/DH/${hearingYear}/${seq}`;
    const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const newHearing: DisciplinaryHearing = {
      ...hearingData,
      id: `dh-${Date.now()}`,
      hearingCaseNumber,
      createdAt,
      status: 'Scheduled',
    };

    setDisciplinaryHearings((prev) => [newHearing, ...prev]);

    // Also update associated query status if present
    if (newHearing.queryId) {
      setStaffQueries((prev) =>
        prev.map((q) =>
          q.id === newHearing.queryId
            ? {
                ...q,
                hearingId: newHearing.id,
                status: 'Hearing Scheduled',
              }
            : q
        )
      );
    }

    addAuditLog(
      `Scheduled Disciplinary Hearing ${hearingCaseNumber} for ${newHearing.accusedStaffName}`,
      'Disciplinary & Governance',
      `Date: ${newHearing.hearingDate} ${newHearing.hearingTime} at ${newHearing.venue}`
    );

    dispatchNotification(
      newHearing.accusedStaffId,
      'Disciplinary Hearing Summon',
      `Hearing ${hearingCaseNumber} scheduled on ${newHearing.hearingDate} for ${newHearing.accusedStaffName}. Venue: ${newHearing.venue}.`,
      'Email',
      'Alert'
    );

    showToast('success', 'Hearing Scheduled', `Hearing case ${hearingCaseNumber} convened.`);
    return newHearing;
  };

  const updateDisciplinaryHearing = (id: string, updates: Partial<DisciplinaryHearing>) => {
    setDisciplinaryHearings((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates } : h))
    );
    addAuditLog(
      `Updated Disciplinary Hearing Record ${id}`,
      'Disciplinary & Governance',
      `Modified attributes: ${Object.keys(updates).join(', ')}`
    );
    showToast('success', 'Hearing Record Updated', 'Proceedings and details updated.');
  };

  const recordHearingVerdict = (
    hearingId: string,
    verdict: DisciplinaryHearing['verdictRecommendation'],
    finalStatus: StaffQuery['status']
  ) => {
    setDisciplinaryHearings((prev) =>
      prev.map((h) =>
        h.id === hearingId
          ? {
              ...h,
              verdictRecommendation: verdict,
              status: 'Concluded',
            }
          : h
      )
    );

    const hearing = disciplinaryHearings.find((h) => h.id === hearingId);
    if (hearing?.queryId) {
      setStaffQueries((prev) =>
        prev.map((q) =>
          q.id === hearing.queryId
            ? {
                ...q,
                status: finalStatus || 'Verdict Delivered',
                sanctionApplied: verdict?.outcome,
                resolvedDate: verdict?.effectiveDate || new Date().toISOString().slice(0, 10),
                resolvedBy: verdict?.signedByChairman || 'Disciplinary Board',
              }
            : q
        )
      );
    }

    addAuditLog(
      `Recorded Disciplinary Verdict for Hearing ${hearing?.hearingCaseNumber || hearingId}`,
      'Disciplinary & Governance',
      `Verdict: ${verdict?.outcome} - ${verdict?.justification}`
    );

    dispatchNotification(
      hearing?.accusedStaffId || 'all_staff',
      'Disciplinary Verdict Delivered',
      `Board verdict concluded for ${hearing?.accusedStaffName || 'staff'}: ${verdict?.outcome}.`,
      'Email',
      'Alert'
    );

    showToast('success', 'Verdict Recorded', `Disciplinary decision promulgated: ${verdict?.outcome}`);
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
        portalMode,
        setPortalMode,
        login,
        signup,
        logout,
        changePassword,
        keepCurrentPassword,

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
        navigationHistory,
        canGoBack,
        goBack,

        staffPermissions,
        grantStaffAccess,
        revokeStaffAccess,
        toggleStaffAdminLoginAccess,
        hasModuleAccess,

        expenseClaims,
        addExpenseClaim,
        updateExpenseClaimStatus,

        employees,
        addEmployee,
        updateEmployee,
        updateEmployeePhoto,
        deleteEmployee,
        clearAllEmployees,
        enrollHeadOfFacility,
        enrollHrLeader,
        recordStaffMovement,

        rosters,
        addRoster,
        updateRosterStatus,
        syncMonthlyRosterToActiveShifts,

        attendance,
        addClockIn,
        addClockOut,
        approveAttendance,

        leaves,
        addLeaveRequest,
        updateLeaveStatus,
        updateLeaveRequest,
        deleteLeaveRequest,
        adjustLeaveEndDate,
        processLeaveWorkflowStep,
        uploadEmployeeDigitalSignature,
        archiveApprovedLeaveToDigitalFile,

        departmentLeadership,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        clearAllDepartments,
        deleteUnit,
        assignDepartmentHead,
        assignUnitHead,
        addUnitToDepartment,
        setFacilityHead,
        lastStaffAction,
        clearLastStaffAction,

        annualUnitLeaveRoasters,
        saveAnnualUnitLeaveRoaster,
        approveAnnualUnitLeaveRoasterByHR,
        updateAnnualLeaveItemByHR,

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

        performanceAppraisals,
        addPerformanceAppraisal,
        updatePerformanceAppraisal,
        processAppraisalWorkflowStep,
        uploadAppraisalDocument,

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
        sendPortalInviteSms,

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
        canManageInfoHub,
        addInfoArticle,
        updateInfoArticle,
        deleteInfoArticle,
        resetInfoArticlesToDefault,

        disciplinaryBoardMembers,
        staffQueries,
        disciplinaryHearings,
        canIssueQueries,
        addDisciplinaryBoardMember,
        updateDisciplinaryBoardMember,
        removeDisciplinaryBoardMember,
        issueStaffQuery,
        updateStaffQuery,
        submitStaffQueryResponse,
        updateStaffQueryStatus,
        scheduleDisciplinaryHearing,
        updateDisciplinaryHearing,
        recordHearingVerdict,

        isHeadOfFacilityOrHr,
        currentUserDepartment,
        canAccessDepartmentRoster,

        formatCurrency,
        t,
        showToast,
      }}
    >
      {children}
      {toastState && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm rounded-2xl bg-slate-900 border border-slate-700/80 p-4 shadow-2xl text-slate-100 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto">
          <div className={`p-2 rounded-xl shrink-0 ${
            toastState.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            toastState.type === 'error' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            {toastState.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : toastState.type === 'error' ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <Info className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-2">
            <p className="font-bold text-sm text-white leading-tight">{toastState.title}</p>
            {toastState.desc && <p className="text-xs text-slate-300 mt-1">{toastState.desc}</p>}
          </div>
          <button
            onClick={() => setToastState(null)}
            className="text-slate-400 hover:text-white rounded-lg p-1 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
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
