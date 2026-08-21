export type UserRole =
  | 'super_admin'
  | 'hr_director'
  | 'hr_manager'
  | 'dept_head'
  | 'unit_head'
  | 'facility_head'
  | 'doctor'
  | 'nurse'
  | 'auditor'
  | string;

export type LanguageCode = 'en' | 'es' | 'fr' | 'ar';
export type CurrencyCode = 'GHS' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'INR';

export interface Hospital {
  id: string;
  name: string;
  code: string;
  logo: string;
  address: string;
  branches: number;
  totalBeds: number;
  country: string;
  currency: CurrencyCode;
}

export interface Branch {
  id: string;
  hospitalId: string;
  name: string;
  location: string;
  phone: string;
  code: string;
}

export interface Company {
  id: string;
  hospitalId: string;
  name: string;
  taxId: string;
  registrationNumber: string;
}

export interface MedicalLicense {
  id: string;
  licenseType: 'State Medical License' | 'Nursing Council' | 'BLS' | 'ACLS' | 'ATLS' | 'DEA License' | 'Radiation Safety' | string;
  licenseNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  status: 'Active' | 'Expiring Soon' | 'Expired' | 'Suspended';
  verified: boolean;
}

export interface EmergencyContact {
  id?: string;
  name: string;
  relation: string;
  phone: string;
  altPhone?: string;
  address?: string;
  email?: string;
}

export interface GhanaCardInfo {
  cardPin: string; // e.g. GHA-721098342-1
  issueDate?: string;
  expiryDate?: string;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Rejected';
  frontCopyUrl?: string;
  frontCopyName?: string;
  backCopyUrl?: string;
  backCopyName?: string;
}

export interface EducationItem {
  id: string;
  institution: string;
  qualification: string; // e.g. BSc Nursing, MBChB, Diploma in Pharmacy, WASSCE, Master of Public Health
  fieldOfStudy: string;
  startYear?: string;
  graduationYear: string;
  gradeOrClass?: string;
  certificateUrl?: string;
  certificateFileName?: string;
}

export interface OfficialDocument {
  id: string;
  title: string;
  type: 'Appointment Letter' | 'Assumption of Duty Letter' | 'Transfer Document' | 'Other Official Document';
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedAt: string;
  uploadedBy?: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string; // Hepatitis B, COVID-19 Booster, Influenza, TB Screening
  doseDate: string;
  status: 'Completed' | 'Pending Booster';
  certificateUrl?: string;
}

export interface StaffFile {
  id: string;
  ownerUid: string;
  ownerEmail: string;
  ownerName: string;
  fileName: string;
  fileType: string; // pdf, image, doc, xls, txt, zip
  fileSize: number;
  fileData: string; // base64 or text or url
  category:
    | 'Medical License'
    | 'Clinical Certification'
    | 'HR Contract'
    | 'Appointment Letter'
    | 'Assumption of Duty Letter'
    | 'Transfer Document'
    | 'Ghana Card / ID'
    | 'Educational Certificate'
    | 'Performance Review'
    | 'Personal Document'
    | 'Other';
  description?: string;
  uploadedAt: string;
  updatedAt: string;
  permissionGrantedByHr: boolean;
}

export interface PromotionRecord {
  id: string;
  employeeId: string;
  previousGrade: string;
  newGrade: string;
  previousSalary?: number;
  newSalary?: number;
  promotionDate: string;
  effectiveDate: string;
  approvedBy: string;
  letterUrl?: string;
  letterFileName?: string;
  remarks?: string;
  status: 'Approved' | 'Pending Gazette / Board Approval' | 'Under Review';
}

export type EmploymentSource =
  | 'New Hire'
  | 'Transfer'
  | 'Promotion'
  | 'Reappointment'
  | 'National Service'
  | 'Other';

export type TransferType = 'Internal Transfer' | 'External Transfer';

export interface StaffMovementRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  empCode?: string;
  previousDepartment: string;
  newDepartment: string;
  previousPosition: string;
  newPosition: string;
  previousUnit?: string;
  newUnit?: string;
  effectiveDate: string;
  transferType: 'Internal Transfer' | 'External Transfer' | 'Departmental Redeployment' | 'Promotion Movement' | string;
  employmentSource?: EmploymentSource | string;
  previousOrganisation?: string;
  reason: string;
  approvingAuthority: string;
  referenceNumber: string;
  documentUrl?: string;
  documentFileName?: string;
  remarks?: string;
  recordedBy?: string;
  recordedAt?: string;
  status?: 'Completed' | 'Pending Effect' | 'Under Review';
}

export interface Employee {
  id: string;
  hospitalId: string;
  branchId: string;
  empCode: string;
  firstName: string;
  lastName: string;
  photo: string;
  email: string;
  phone: string;
  role: UserRole;
  jobTitle: string;
  department: string;
  unit: string;
  grade?: string; // Standard Civil/Healthcare Grade (e.g. Senior Nursing Officer, Principal Medical Officer)
  firstAppointmentDate?: string; // Initial appointment / induction date (defaults to joinDate)
  lastPromotionDate?: string; // Date of most recent promotion
  lastPromotionGrade?: string;
  promotionHistory?: PromotionRecord[];
  // Employment Source & Transfer Information
  employmentSource?: EmploymentSource;
  transferType?: TransferType;
  previousOrganisation?: string;
  previousPosition?: string;
  previousDepartment?: string;
  transferDate?: string;
  dateJoinedPJPIIMC?: string;
  originalHireDate?: string;
  transferReferenceNumber?: string;
  currentDepartment?: string;
  currentPosition?: string;
  movementHistory?: StaffMovementRecord[];
  managerId?: string;
  employmentType: 'Full-Time' | 'Part-Time' | 'Contract' | 'Locum / On-Call';
  joinDate: string;
  salary: number;
  currency: CurrencyCode;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Exited';
  medicalLicenses: MedicalLicense[];
  passportNo?: string;
  nationalId?: string;
  taxId?: string;
  bankAccount?: string;
  emergencyContacts?: EmergencyContact[];
  vaccinations?: VaccinationRecord[];
  ghanaCardInfo?: GhanaCardInfo;
  educationList?: EducationItem[];
  officialDocuments?: OfficialDocument[];
  appointmentLetterUrl?: string;
  appointmentLetterName?: string;
  assumptionOfDutyUrl?: string;
  assumptionOfDutyName?: string;
  transferDocumentUrl?: string;
  transferDocumentName?: string;
  mustChangePassword?: boolean;
  filePermissionGranted?: boolean;
  defaultPassword?: string;
  customPassword?: string;
  dateOfBirth?: string;
  occupationalHealth?: {
    lastExamDate: string;
    fitForDuty: boolean;
    notes: string;
  };
  education?: string;
  skills?: string[];
  languages?: string[];
  digitalSignatureUrl?: string;
  leaveEntitlement?: number; // Annual leave entitlement in days (e.g. 30 days)
  deferredLeaveDays?: number; // Carried over / deferred leave days
  adminLoginGranted?: boolean; // Granted by HR to access Administrator Login
  adminLoginGrantedAt?: string;
  adminLoginGrantedBy?: string;
  portalAccess?: {
    username: string; // Email or Staff ID (empCode)
    usernameType: 'email' | 'empCode';
    tempPassword?: string; // Email, Staff ID, or custom
    passwordType?: 'empCode' | 'email' | 'custom';
    accountCreated?: boolean;
    accountCreatedAt?: string;
    invitedAt?: string;
    inviteStatus?: 'Not Invited' | 'Invitation Sent' | 'Portal Activated' | 'Login Locked';
    authMethod?: 'Password' | 'SSO' | '2FA';
    lastLogin?: string;
    mustChangePassword?: boolean;
    customPassword?: string;
    adminLoginGranted?: boolean;
  };
}

export interface ShiftRoster {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhoto: string;
  role: string;
  hospitalId: string;
  department: string;
  shiftType: 'Morning (07:00-15:00)' | 'Evening (15:00-23:00)' | 'Night ICU (23:00-07:00)' | '12h Emergency (07:00-19:00)' | 'On-Call 24h';
  date: string;
  startTime: string;
  endTime: string;
  ward: string;
  status: 'Assigned' | 'Completed' | 'Swapped' | 'On-Call';
  fatigueScore: number; // 0-100 (high = fatigue risk)
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  method: 'Biometric_Fingerprint' | 'Facial_Recognition' | 'RFID_Badge' | 'QR_Mobile' | 'GPS_Geofence';
  location: string;
  status: 'On-Time' | 'Late' | 'Early-Departure' | 'Absent' | 'Overtime';
  overtimeHours: number;
  approvalStatus: 'Auto-Approved' | 'Pending Approval' | 'Approved' | 'Rejected';
  snapshotUrl?: string; // Captured live facial selfie snapshot
  facialVerified?: boolean; // Face match verified against profile photo
  facialConfidence?: number; // Match confidence score (e.g. 98.4%)
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    distanceMeters?: number;
  };
  geofenceVerified?: boolean; // Within allowed hospital perimeter (e.g. <= 150m)
  deviceType?: string; // e.g. "Mobile Smartphone (iOS/Android)" or "Station Kiosk"
}

export interface UnitLeadership {
  id: string;
  unitName: string;
  departmentName: string;
  unitHeadId?: string;
  unitHeadName?: string;
  unitHeadEmail?: string;
  staffCount: number;
}

export interface DepartmentLeadership {
  id: string;
  departmentName: string;
  departmentCode: string;
  departmentHeadId?: string;
  departmentHeadName?: string;
  departmentHeadEmail?: string;
  units: UnitLeadership[];
  facilityHeadId?: string;
  facilityHeadName?: string;
  facilityHeadEmail?: string;
  lastAssignedBy?: string;
  lastAssignedAt?: string;
}

export interface AnnualUnitLeaveRoasterItem {
  id: string;
  employeeId: string;
  staffName: string;
  empCode: string;
  currentGrade: string; // e.g. Senior Medical Officer, Staff Nurse
  leaveMonth: string; // e.g. 'April', 'August'
  proposedStartDate: string; // e.g. '2027-04-15'
  proposedEndDate: string; // e.g. '2027-05-15'
  leaveDays: number;
  hrRemarks?: string;
  hrModified?: boolean;
}

export interface AnnualUnitLeaveRoaster {
  id: string;
  unitName: string;
  departmentName: string;
  year: number; // e.g. 2027
  preparedByUnitHead: string;
  unitHeadEmail?: string;
  submittedAt: string;
  status: 'Draft' | 'Submitted to HR' | 'HR Verified & Approved' | 'Revision Requested';
  hrVerifiedBy?: string;
  hrVerifiedAt?: string;
  hrComments?: string;
  items: AnnualUnitLeaveRoasterItem[];
}

export type WorkflowStage =
  | 'Unit Head'
  | 'Departmental Head'
  | 'HR'
  | 'Head of Facility'
  | 'Fully Approved'
  | 'Rejected';

export interface WorkflowApprovalStep {
  role: 'Unit Head' | 'Departmental Head' | 'HR' | 'Head of Facility';
  status: 'Pending' | 'Approved' | 'Rejected';
  approverId?: string;
  approverName?: string;
  approverTitle?: string;
  approvedAt?: string;
  comments?: string;
  signatureUrl?: string;
  signatureCertified?: boolean;
  signatureUploadedBy?: string;
}

export interface MultiTierWorkflow {
  currentStage: WorkflowStage;
  unitHeadStep: WorkflowApprovalStep;
  departmentHeadStep: WorkflowApprovalStep;
  hrStep: WorkflowApprovalStep;
  facilityHeadStep: WorkflowApprovalStep;
  rejectionReason?: string;
  rejectedByRole?: string;
  rejectedByName?: string;
  rejectedAt?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  staffId?: string;
  grade?: string;
  department: string;
  unit?: string;
  leaveType: 'Annual Leave' | 'Sick / Medical' | 'Maternity' | 'Paternity' | 'Study / CME' | 'Hazard / Emergency' | 'Unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  documentUrl?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  currentStage: WorkflowStage;
  workflow: MultiTierWorkflow;
  appliedOn: string;

  // PART A (APPLICATION)
  leaveYear?: number;
  leaveEntitlement?: number;
  deferredLeaveDaysDue?: number;
  leaveDaysEarned?: number;
  addressOnLeave?: string;
  phoneOnLeave?: string;
  applicantSignedDate?: string;
  applicantSignedBy?: string;
  applicantSignatureUrl?: string;
  applicantSignatureCertified?: boolean;
  applicantSignedAt?: string;

  // PART B (RECOMMENDATION)
  recommendationStatus?: 'RECOMMENDED' | 'NOT RECOMMENDED';
  replacementRequired?: 'REQUIRED' | 'NOT REQUIRED';
  unitHeadSignedBy?: string;
  unitHeadSignedDate?: string;
  unitHeadSignatureUrl?: string;
  deptHeadSignedBy?: string;
  deptHeadSignedDate?: string;
  deptHeadSignatureUrl?: string;

  // PART C (VALIDATION)
  outstandingLeaveDays?: number;
  validatedStartDate?: string;
  validatedEndDate?: string;
  dateOfResumption?: string;
  hrRemarks?: string;
  hrSignedBy?: string;
  hrSignedDate?: string;
  hrSignatureUrl?: string;

  // PART D (APPROVAL)
  daysGranted?: number;
  approvalRemarks?: string;
  facilityInChargeSignedBy?: string;
  facilityInChargeSignedDate?: string;
  facilityHeadSignatureUrl?: string;
  digitalSignaturesCertified?: boolean;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  month: string;
  year: number;
  baseSalary: number;
  nightDutyAllowance: number;
  hazardPay: number;
  onCallAllowance: number;
  overtimePay: number;
  taxDeduction: number;
  pensionDeduction: number;
  insuranceDeduction: number;
  netPay: number;
  currency: CurrencyCode;
  status: 'Draft' | 'Approved' | 'Locked' | 'Paid';
}

export interface JobVacancy {
  id: string;
  title: string;
  department: string;
  hospitalId: string;
  type: 'Full-Time' | 'Contract' | 'Locum';
  openings: number;
  status: 'Active' | 'Draft' | 'Closed';
  requirements: string[];
  applicantsCount: number;
}

export interface Candidate {
  id: string;
  vacancyId: string;
  vacancyTitle: string;
  name: string;
  email: string;
  phone: string;
  experienceYears: number;
  currentRole: string;
  aiMatchScore: number; // 0-100
  aiMatchSummary: string;
  status: 'Applied' | 'Screened' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected';
  appliedDate: string;
}

export interface OnboardingTask {
  id: string;
  employeeId: string;
  employeeName: string;
  taskName: string;
  category: 'Documentation' | 'Badge & IT Setup' | 'Medical Exam' | 'Policy Acknowledgement' | 'Uniform Allocation';
  dueDate: string;
  completed: boolean;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: 'Mandatory Compliance' | 'BLS / ACLS Renewal' | 'Infection Control' | 'HIPAA & Patient Privacy' | 'Clinical Procedures';
  durationHours: number;
  modulesCount: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  progressPercent: number;
  score?: number;
  certificateIssued: boolean;
  instructor?: string;
  scheduledDate?: string;
  sessionTime?: string;
  venue?: string;
  totalAttendees?: number;
}

export interface TrainingAttendanceRecord {
  id: string;
  courseId: string;
  courseTitle: string;
  employeeId: string;
  employeeName: string;
  department: string;
  trainingDate: string;
  sessionTime: string;
  checkInTime: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  verificationMethod: 'QR Code Scan' | 'Biometric Verification' | 'Instructor Sign-off' | 'Digital Roll-call';
  verifiedBy?: string;
  cmeHoursEarned: number;
}

export interface IncidentReport {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  type: 'Needle Stick Injury' | 'Chemical / Radiation Exposure' | 'Patient Handling Injury' | 'Safety Violation' | 'Equipment Malfunction';
  severity: 'Low' | 'Medium' | 'Critical';
  description: string;
  status: 'Reported' | 'Under Investigation' | 'Resolved';
  correctiveAction?: string;
}

export interface HospitalAsset {
  id: string;
  assetCode: string;
  name: string;
  category: 'PPE Kit' | 'Medical Tablet' | 'Defibrillator / Portable Unit' | 'Access Badge' | 'Hospital Uniform Set';
  serialNo: string;
  assignedTo: string; // Employee Name or ID
  issueDate: string;
  status: 'Assigned' | 'In Storage' | 'Maintenance' | 'Returned';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

export interface GrievanceNote {
  id: string;
  date: string;
  author: string;
  authorRole: string;
  note: string;
  isConfidential: boolean;
}

export interface Grievance {
  id: string;
  ticketNumber: string;
  submittedBy: string;
  submittedById?: string;
  isAnonymous: boolean;
  category: 'Workplace Harassment' | 'Shift / Scheduling Unfairness' | 'Pay & Allowance Discrepancy' | 'Clinical Safety / Patient Risk' | 'Management / Interpersonal' | 'Discrimination' | 'Other';
  department: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  subject: string;
  description: string;
  dateSubmitted: string;
  assignedMediator?: string;
  assignedMediatorRole?: string;
  status: 'Submitted' | 'Under Review' | 'In Mediation' | 'Resolved' | 'Dismissed';
  investigationNotes: GrievanceNote[];
  resolutionDetails?: string;
  resolvedDate?: string;
  satisfactionRating?: number;
  followUpRequired?: boolean;
}

export interface ClinicalCompetency {
  id: string;
  name: string;
  category:
    | 'Patient Safety'
    | 'Clinical Skills'
    | 'Documentation'
    | 'Emergency Protocol'
    | 'Patient Communication'
    | 'Quality & Governance'
    | 'Leadership'
    | 'Education'
    | 'Strategy'
    | 'Governance'
    | 'Patient Care'
    | 'Quality'
    | 'Clinical'
    | 'Operational'
    | 'Behavioral';
  score: number; // 1-5
  maxScore: number;
  comments?: string;
  evaluatorComment?: string;
  title?: string;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  category: 'Clinical Excellence' | 'Patient Satisfaction' | 'Certifications' | 'Process Improvement';
  targetDate: string;
  progressPercent: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Delayed';
}

export interface PeerFeedback360 {
  id: string;
  reviewerName: string;
  reviewerRole: string;
  relationship:
    | 'Peer Nurse'
    | 'Attending Physician'
    | 'Department Manager'
    | 'Direct Report'
    | 'Peer Consultant'
    | 'Theatre In-Charge';
  rating: number; // 1-5
  strengths: string;
  areasForGrowth: string;
  dateSubmitted: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  reviewPeriod: string; // e.g. "Q2 2026", "Annual 2026"
  evaluatorName: string;
  evaluatorRole: string;
  overallRating: number; // 1.0 - 5.0
  status: 'Draft' | 'Self Assessment' | 'Manager Review' | 'Calibration' | 'Completed';
  clinicalCompetencies: ClinicalCompetency[];
  kpis: { metric: string; target: string; achieved: string; rating: number }[];
  goals: PerformanceGoal[];
  feedback360: PeerFeedback360[];
  managerComments: string;
  employeeComments?: string;
  developmentPlan: string;
  lastUpdated: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  channel: 'In-App' | 'Email' | 'SMS' | 'WhatsApp';
  type: 'Alert' | 'Approval' | 'License_Expiry' | 'Shift_Change';
  read: boolean;
  timestamp: string;
}

export interface ShiftSwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhoto?: string;
  requesterShiftId: string;
  requesterShiftDate: string;
  requesterShiftType: string;
  requesterWard: string;
  
  targetEmployeeId: string;
  targetEmployeeName: string;
  targetEmployeePhoto?: string;
  targetShiftId: string;
  targetShiftDate: string;
  targetShiftType: string;
  targetWard: string;
  
  department: string;
  reason: string;
  status: 'Pending_Lead_Approval' | 'Approved' | 'Rejected' | 'Cancelled';
  dateRequested: string;
  
  departmentLeadName: string;
  departmentLeadEmail: string;
  leadDecisionDate?: string;
  rejectionReason?: string;
  emailNotified: boolean;
  emailLog: {
    sentTo: string;
    subject: string;
    body: string;
    sentAt: string;
  }[];
}

export interface DepartmentMonthlyRoster {
  id: string;
  department: string;
  unit: string;
  month: string;
  year: number;
  preparedBy: string;
  preparedByRole: string;
  preparedByEmail: string;
  totalStaffCount: number;
  totalPlannedHours: number;
  submissionDate: string;
  fileName: string;
  fileSize: string;
  notes: string;
  status: 'Pending HR Approval' | 'Approved' | 'Returned for Revision';
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionNotes?: string;
  shiftsSummary: {
    morningShifts: number;
    eveningShifts: number;
    nightShifts: number;
    onCallCoverage: number;
  };
  dutyRosterGrid?: {
    staffName: string;
    role: string;
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  }[];
}

export interface ConferenceParticipant {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string;
  isHost?: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised?: boolean;
  isSpeaking?: boolean;
}

export interface DepartmentConferenceMeeting {
  id: string;
  title: string;
  department: string;
  unit: string;
  scheduledStartTime: string;
  durationMinutes: number;
  meetingType: 'Audio & Video Conference' | 'Voice Huddle' | 'Clinical Grand Rounds';
  hostName: string;
  hostRole: string;
  hostEmail: string;
  meetingCode: string;
  passcode: string;
  status: 'Live Now' | 'Scheduled' | 'Completed';
  participantsCount: number;
  participants: ConferenceParticipant[];
  agenda: string;
  isRecording: boolean;
  recordingUrl?: string;
  chatMessages?: {
    id: string;
    senderName: string;
    senderRole: string;
    text: string;
    timestamp: string;
    isClinicalAlert?: boolean;
  }[];
}

export interface EmailDispatchResult {
  success: boolean;
  channel?: 'Email' | 'SMS';
  recipientEmail: string;
  recipientPhone?: string;
  recipientName: string;
  senderEmail: string;
  senderName: string;
  replyTo: string;
  organizationDomain: string;
  subject: string;
  body: string;
  smsMessage?: string;
  username: string;
  tempPassword: string;
  portalUrl: string;
  timestamp: string;
  dispatchId: string;
  smtpServer?: string;
  dkimSignature?: string;
  spfStatus?: string;
  error?: string;
}

export interface SystemCustomizationSettings {
  hospitalName: string;
  hospitalTagline: string;
  themeAccent: 'emerald' | 'teal' | 'indigo' | 'violet' | 'rose' | 'amber';
  portalWelcomeBanner: string;
  staffIdPrefix: string;
  requireFourTierLeaveApproval: boolean;
  autoApproveLeaveUnderDays: number;
  sessionTimeoutMinutes: number;
  requirePasswordChangeOnFirstLogin: boolean;
  enableBiometric2FA: boolean;
  restrictAccessBySubnet: boolean;
  allowedIpSubnet: string;
  senderName: string;
  senderEmail: string;
  emailFooterNotice: string;
  notifyOnLeaveSubmit: boolean;
  notifyOnShiftSwap: boolean;
  notifyOnPayrollRelease: boolean;
  notifyOnLicenseExpiry: boolean;
  enableTeleConferenceModule: boolean;
  enableAiAssistantWidget: boolean;
  enableGrievanceProtection: boolean;
  currency: CurrencyCode;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface StaffAccessPermissions {
  employeeId: string;
  employeeName?: string;
  email?: string;
  grantedModules: string[]; // Module IDs granted by HR (e.g., 'recruitment', 'audit', 'reports', 'assets')
  hasAdminLoginAccess?: boolean; // Direct HR grant to use ADMINISTRATOR tab on Login Page
  grantedAt?: string;
  grantedBy?: string;
  notes?: string;
}

export type AppraisalCadre =
  | 'medical_doctor'
  | 'unit_head'
  | 'dept_head'
  | 'facility_head'
  | 'general_staff';

export type AppraisalStage =
  | 'Self / Draft'
  | 'Unit Head'
  | 'Departmental Head'
  | 'HR'
  | 'Head of Facility'
  | 'Completed'
  | 'Returned for Revision'
  | 'Submitted to Head of Department'
  | 'Submitted to HR Directorate'
  | 'Fully Endorsed & Completed'
  | 'Endorsement by Head of Facility'
  | 'Review by HR Directorate'
  | 'Review by Head of Department'
  | 'Returned for Rectification';

export interface AppraisalWorkflowStep {
  role?: 'Unit Head' | 'Departmental Head' | 'HR' | 'Head of Facility' | string;
  stage?: 'Unit Head' | 'Departmental Head' | 'HR' | 'Head of Facility' | string;
  stageName?: string;
  status: 'Pending' | 'Approved' | 'Returned' | 'Skipped' | 'Bypassed';
  action?: 'Approved' | 'Returned' | 'Rejected' | 'Pending';
  approverId?: string;
  approverName?: string;
  approverTitle?: string;
  approverRole?: string;
  actionDate?: string;
  approvedAt?: string;
  timestamp?: string;
  comments?: string;
  ratingGiven?: number;
}

export interface AppraisalAuditEntry {
  id: string;
  stage: string;
  actorName: string;
  actorRole: string;
  action: string;
  timestamp: string;
  notes: string;
}

export interface AppraisalDocument {
  id: string;
  fileName: string;
  fileType?: string;
  fileSize?: number | string;
  fileData?: string; // base64 or url
  fileUrl?: string; // url alias
  title?: string;
  uploadedAt: string;
  uploadedBy: string;
  category?:
    | 'Completed Appraisal Form'
    | 'KPI Evidence Sheet'
    | 'Peer Review'
    | 'HOD Sign-Off'
    | 'Executive Recommendation'
    | 'Performance Review'
    | 'Other';
  description?: string;
}

export interface PerformanceAppraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  empCode?: string;
  employeeStaffId?: string;
  jobTitle?: string;
  department: string;
  unit?: string;
  cadre: AppraisalCadre; // determines exact multi-tier workflow chain
  appraisalPeriod?: string; // e.g. "Annual Appraisal 2026", "Mid-Year Review 2026", "Probation Evaluation"
  period?: string;
  appraisalCycle?: string;
  appraisalYear?: number;
  cycleYear?: string | number;
  currentStage: AppraisalStage;
  overallStatus?: 'Draft' | 'In Progress' | 'Completed' | 'Returned for Revision' | 'Submitted' | 'In Review' | 'Returned' | 'Under Review';
  status?: 'Draft' | 'In Progress' | 'Completed' | 'Returned for Revision' | 'Submitted' | 'In Review' | 'Returned' | 'Under Review';

  // Scoring & Metrics
  overallScore?: number; // 1.0 - 5.0 or 0 - 100
  overallRating?: number; // 1.0 - 5.0
  selfAssessmentScore?: number;
  scoreCategory?: 'Outstanding' | 'Exceeds Expectations' | 'Meets Standards' | 'Needs Improvement' | 'Unsatisfactory';
  clinicalCompetencies?: ClinicalCompetency[];
  coreCompetencies?: any[];
  kpis?: { metric: string; target: string; achieved: string; rating: number; weightPercent?: number }[];
  kpiAchievements?: any[];
  goals?: PerformanceGoal[];
  feedback360?: PeerFeedback360[];

  // Comments by Stage Reviewers & Objectives
  selfAppraisalComments?: string;
  selfReviewNotes?: string;
  objectivesMet?: string;
  strengths?: string;
  areasForImprovement?: string;
  developmentObjectives?: string;
  unitHeadComments?: string;
  deptHeadComments?: string;
  hrComments?: string;
  facilityHeadComments?: string;
  developmentPlan?: string;
  trainingNeeds?: string[];

  // Multi-tier workflow steps
  unitHeadStep?: AppraisalWorkflowStep;
  departmentHeadStep?: AppraisalWorkflowStep;
  hrStep?: AppraisalWorkflowStep;
  facilityHeadStep?: AppraisalWorkflowStep;
  workflowSteps?: AppraisalWorkflowStep[];

  // Attached Appraisal Documents
  documents: AppraisalDocument[];

  // Dispatch Notification Logs
  notificationsSent?: {
    targetRole: string;
    recipientName: string;
    sentAt: string;
    channel: 'In-App' | 'Email' | 'SMS';
    message: string;
  }[];

  auditHistory?: AppraisalAuditEntry[];
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
  initiatedDate?: string;
  lastUpdatedDate?: string;
  completedAt?: string;
  certifiedBy?: string;
}

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  claimType: 'CME & Clinical Training' | 'Medical Equipment & Tools' | 'Travel & Mileage' | 'Hazard & Shift Expense' | 'Other';
  amount: number;
  description: string;
  receiptUrl?: string;
  submittedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Reimbursed';
  approvedBy?: string;
  approvedDate?: string;
}

export interface NoticeBoardPost {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  category: 'Urgent Alert' | 'Clinical Policy' | 'HR Announcement' | 'Hospital Event' | 'General Notice';
  priority: 'High' | 'Normal';
  targetDepartment: string;
  isPinned: boolean;
  postedAt: string;
  likesCount: number;
  likedBy: string[];
  acknowledgements: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderDepartment: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  reactions?: Record<string, number>;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export interface SuggestionItem {
  id: string;
  title: string;
  details: string;
  category: 'Patient Care & Safety' | 'Staff Welfare & Amenities' | 'HR Policies' | 'Equipment & Facilities' | 'IT & Systems' | 'General Innovation';
  isAnonymous: boolean;
  submittedBy?: string;
  submittedByDept?: string;
  submittedAt: string;
  status: 'Submitted' | 'Under Review' | 'Planned' | 'Implemented' | 'Declined';
  upvotes: number;
  upvotedBy: string[];
  responseFromManagement?: {
    responderName: string;
    responderRole: string;
    message: string;
    updatedAt: string;
  };
}

export interface InfoHubArticle {
  id: string;
  title: string;
  category: 'Vision & Mission' | 'Leave Policies' | 'Study Leave Policies' | 'Promotion & Demotion' | 'Code of Conduct & Ethics' | 'Hospital Guidelines';
  summary: string;
  content: string;
  lastUpdated: string;
  version: string;
  author: string;
  downloadablePdfName?: string;
  tags: string[];
}


