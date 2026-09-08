import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Printer,
  Check,
  X,
  FileText,
  Download,
  Save,
  Send,
  Building2,
  User,
  Award,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit3,
  PenTool,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Clock,
  ArrowRight,
  Info,
  BadgeCheck,
} from 'lucide-react';
import { useHrms } from '../../context/HrmsContext';
import {
  printAppraisalDocument,
  downloadAppraisalHtml,
} from '../../lib/appraisalPrintGenerator';
import {
  PerformanceAppraisal,
  CatholicHealthAppraisalFormData,
  CatholicHealthAppraisalObjective,
  CatholicHealthCurrentPerformanceFactor,
  Employee,
  MultiTierWorkflow,
} from '../../types/hrms';

interface CatholicHealthAppraisalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  appraisal?: PerformanceAppraisal | null;
  targetEmployee?: Employee | null;
  onSaveAppraisal?: (data: Partial<PerformanceAppraisal>) => void;
  readOnly?: boolean;
  autoPrint?: boolean;
}

const DEFAULT_FACTORS: CatholicHealthCurrentPerformanceFactor[] = [
  { id: 'f-1', factorNumber: 1, factorName: 'Quality of Work', rating: 4, comments: '' },
  { id: 'f-2', factorNumber: 2, factorName: 'Job Knowledge', rating: 4, comments: '' },
  { id: 'f-3', factorNumber: 3, factorName: 'Initiative & Resourcefulness', rating: 4, comments: '' },
  { id: 'f-4', factorNumber: 4, factorName: 'Attendance & Dependability', rating: 5, comments: '' },
  { id: 'f-5', factorNumber: 5, factorName: 'Attitude toward work, staff, patients & public', rating: 5, comments: '' },
];

const DEFAULT_OBJECTIVES: CatholicHealthAppraisalObjective[] = [
  {
    id: 'obj-1',
    no: 1,
    agreedObjective: 'Maintain zero patient safety incidents & adhere to WHO clinical protocols.',
    mainActivities: 'Implement strict surgical/clinical checklist, participate in morbidity rounds, mentor junior officers.',
    objectivesAchieved: '100% adherence to clinical checklist; zero sentinel adverse events recorded in the period.',
    rating: 4,
    monitoringMechanism: 'Monthly clinical audit records & patient safety committee reports.',
    comments: 'Demonstrated exemplary clinical precision and infection prevention compliance.',
  },
  {
    id: 'obj-2',
    no: 2,
    agreedObjective: 'Achieve 95% punctuality and attendance for scheduled hospital duties and emergency calls.',
    mainActivities: 'Prompt attendance at shift handovers, active emergency standby coverage.',
    objectivesAchieved: 'Maintained 98% on-time attendance and covered 6 emergency relief shifts.',
    rating: 5,
    monitoringMechanism: 'Biometric hospital attendance logs & duty roster reports.',
    comments: 'Highly dependable team player during peak emergency patient influx.',
  },
  {
    id: 'obj-3',
    no: 3,
    agreedObjective: 'Complete designated Continuous Professional Development (CPD) & hospital training courses.',
    mainActivities: 'Attend GHS/NCHS accredited CPD modules, Infection Prevention and Control (IPC) recertification.',
    objectivesAchieved: 'Completed 30 CPD credit points and obtained advanced clinical certification.',
    rating: 4,
    monitoringMechanism: 'Certificates submitted to HR Directorate and Medical Directorate.',
    comments: 'Proactive in career development and applying new clinical standards.',
  },
  {
    id: 'obj-4',
    no: 4,
    agreedObjective: 'Ensure accurate, timely completion of Electronic Health Records & discharge summaries within 24 hours.',
    mainActivities: 'Digital entry in clinical management system, verify lab/diagnostic reconciliations.',
    objectivesAchieved: 'Average discharge documentation turnaround time improved to 16 hours.',
    rating: 4,
    monitoringMechanism: 'Hospital EHR audit dashboard & Medical Records Unit logs.',
    comments: 'Consistent clinical documentation with zero audit deficiencies.',
  },
  {
    id: 'obj-5',
    no: 5,
    agreedObjective: 'Foster compassionate Catholic Health ministry values in patient care and multidisciplinary relations.',
    mainActivities: 'Patient advocacy, respectful team communication, pastoral health collaboration.',
    objectivesAchieved: 'Received multiple positive patient and family commendations.',
    rating: 5,
    monitoringMechanism: 'Patient satisfaction surveys & chaplaincy feedback notes.',
    comments: 'Exemplifies the holistic healing mission of Catholic Health Service Trust.',
  },
];

// Helper: Official Catholic Health Service Trust Ghana Rating Scale
export const getScaleClassification = (score: number) => {
  if (score >= 4.6) return { label: 'Excellent (4.6 to 5)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
  if (score >= 3.6) return { label: 'Very good (3.6 to 4.5)', color: 'text-blue-700 bg-blue-100 border-blue-300' };
  if (score >= 2.6) return { label: 'Good (2.6 to 3.5)', color: 'text-teal-700 bg-teal-100 border-teal-300' };
  if (score >= 1.6) return { label: 'Marginal (1.6 to 2.5)', color: 'text-amber-700 bg-amber-100 border-amber-300' };
  return { label: 'Unsatisfactory (1 to 1.5)', color: 'text-rose-700 bg-rose-100 border-rose-300' };
};

export const CatholicHealthAppraisalFormModal: React.FC<CatholicHealthAppraisalFormModalProps> = ({
  isOpen,
  onClose,
  appraisal,
  targetEmployee,
  onSaveAppraisal,
  readOnly = false,
  autoPrint = false,
}) => {
  const {
    employees,
    currentUser,
    activeRole,
    selectedHospital,
    addPerformanceAppraisal,
    updatePerformanceAppraisal,
    processAppraisalWorkflowStep,
    showToast,
  } = useHrms();

  const printAreaRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'interactive' | 'official_print'>('interactive');
  const [isPrinting, setIsPrinting] = useState(false);

  // Selected Employee (can be changed if initiating a new appraisal)
  const [selectedEmpId, setSelectedEmpId] = useState<string>(
    appraisal?.employeeId || targetEmployee?.id || currentUser?.id || employees[0]?.id || ''
  );

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === selectedEmpId) || targetEmployee || employees[0];
  }, [employees, selectedEmpId, targetEmployee]);

  // Role and Permission Matrix
  // Explicit User Directive:
  // "WHAT A STAFF CAN FILL:
  // SECTION A:
  // SECTION B (Agreed Objectives, Main Activities/Task)
  // SECTION E (Appraisee's Comments)
  // APPRAISAL FOLLOW THE SAME APPROVAL WORKFLOW AS THE LEAVE"
  const isSupervisoryUser = ['super_admin', 'facility_head', 'hr_director', 'hr_manager', 'dept_head', 'unit_head'].includes(
    activeRole || currentUser?.role || ''
  );

  // Default mode: Staff mode for staff roles, or supervisory review mode for managers (managers can toggle)
  const [userMode, setUserMode] = useState<'staff_mode' | 'supervisor_mode'>(
    isSupervisoryUser ? 'supervisor_mode' : 'staff_mode'
  );

  const isStaffFilling = userMode === 'staff_mode';

  // Section permissions
  const canEditSectionA = !readOnly;
  const canEditSectionBStaffFields = !readOnly; // Agreed Objectives & Main Activities/Task
  const canEditSectionBAppraiserFields = !readOnly && !isStaffFilling; // Objectives Achieved, Ratings, Monitoring, Comments
  const canEditSectionC = !readOnly && !isStaffFilling; // Factors 1-5
  const canEditSectionD = !readOnly && !isStaffFilling; // Development plan
  const canEditAppraiseeComments = !readOnly; // Section E Appraisee Comments
  const canSignAppraisee = !readOnly; // Section E Appraisee Signature
  const canEditAppraiserComments = !readOnly && !isStaffFilling; // Section E Appraiser Comments & Signature
  const canEditSectionF =
    !readOnly && !isStaffFilling && ['super_admin', 'facility_head'].includes(activeRole || currentUser?.role || '');

  // Workflow Approval State
  const [actionPrompt, setActionPrompt] = useState<{ action: 'Approved' | 'Returned'; tierName: string } | null>(null);
  const [workflowComment, setWorkflowComment] = useState('');

  // Multi-tier workflow status calculation (Identical to Leave Workflow)
  const currentWorkflowStage = appraisal?.currentStage || (appraisal?.status === 'Completed' ? 'Fully Approved' : 'Unit Head');

  const canUserApproveCurrentStage = useMemo(() => {
    if (!appraisal || appraisal.status === 'Completed' || appraisal.status === 'Rejected') return false;
    const role = activeRole || currentUser?.role || '';
    if (role === 'super_admin' || role === 'facility_head') return true;
    if (currentWorkflowStage === 'Unit Head') return role === 'unit_head';
    if (currentWorkflowStage === 'Departmental Head') return role === 'dept_head';
    if (currentWorkflowStage === 'HR') return ['hr_director', 'hr_manager'].includes(role);
    if (currentWorkflowStage === 'Head of Facility') return ['facility_head', 'super_admin'].includes(role);
    return false;
  }, [appraisal, currentWorkflowStage, activeRole, currentUser]);

  // Initial Form Data Construction
  const getInitialFormData = (): CatholicHealthAppraisalFormData => {
    const existing = appraisal?.catholicHealthForm;
    const emp = selectedEmployee;

    // Helper date formatting dd/mm/yy
    const formatDate = (isoStr?: string) => {
      if (!isoStr) return '';
      try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return isoStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = String(d.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
      } catch {
        return isoStr;
      }
    };

    const todayFormatted = formatDate(new Date().toISOString());

    return {
      facilityName: existing?.facilityName || 'POPE JOHN PAUL II MEDICAL CENTRE (PJPIIMC)',
      periodFromMonthYear: existing?.periodFromMonthYear || 'January 2026',
      periodToMonthYear: existing?.periodToMonthYear || 'December 2026',
      reviewDate: existing?.reviewDate || todayFormatted,

      // Section A
      staffIdNumber: existing?.staffIdNumber || emp?.empCode || 'PJP-1025',
      surname: existing?.surname || emp?.lastName || '',
      otherNames: existing?.otherNames || emp?.firstName || '',
      dateOfBirth: existing?.dateOfBirth || formatDate(emp?.dateOfBirth) || '14/05/88',
      gender: existing?.gender || (emp?.gender ? emp.gender.charAt(0).toUpperCase() + emp.gender.slice(1) : 'Male'),
      directorateDepartmentUnit:
        existing?.directorateDepartmentUnit ||
        `${emp?.department || 'Clinical Services'}${emp?.unit ? ' / ' + emp.unit : ''}`,
      diocese: existing?.diocese || 'Catholic Archdiocese of Accra',
      district: existing?.district || 'Ga West Municipal',
      subDistrict: existing?.subDistrict || 'Amasaman Sub-District',
      dateFirstAppointment: existing?.dateFirstAppointment || formatDate(emp?.hireDate) || '01/02/18',
      dateCurrentAppointment: existing?.dateCurrentAppointment || formatDate(emp?.hireDate) || '01/01/22',
      currentGrade: existing?.currentGrade || emp?.jobTitle || 'Specialist Medical Officer',
      professionalCategory: existing?.professionalCategory || (emp?.jobTitle?.includes('Nurse') ? 'Nursing' : 'Medical Doctor'),
      specialty: existing?.specialty || (emp?.unit || 'General Medicine & Surgery'),
      basicQualification: existing?.basicQualification || 'MBChB (Medicine & Surgery)',
      basicQualificationYear: existing?.basicQualificationYear || '2016',
      additionalQualification: existing?.additionalQualification || 'FWACS / Fellow West African College of Surgeons',
      additionalQualificationYear: existing?.additionalQualificationYear || '2021',
      currentSalaryLevel: existing?.currentSalaryLevel || 'L-22',
      currentStep: existing?.currentStep || 'Step 3',

      // Section B
      objectives: existing?.objectives && existing.objectives.length > 0 ? existing.objectives : DEFAULT_OBJECTIVES,
      sectionBTotalScoreQ: existing?.sectionBTotalScoreQ || 22,
      sectionBNumberOfTargetsN: existing?.sectionBNumberOfTargetsN || 5,
      sectionBScoreA: existing?.sectionBScoreA || 4.4,
      sectionBGradeLabel: existing?.sectionBGradeLabel || 'Very good (3.6 to 4.5)',

      // Section C
      assessmentFactors:
        existing?.assessmentFactors && existing.assessmentFactors.length > 0
          ? existing.assessmentFactors
          : DEFAULT_FACTORS,
      sectionCTotalScoreQ: existing?.sectionCTotalScoreQ || 22,
      sectionCScoreS: existing?.sectionCScoreS || 4.4,
      sectionCGradeLabel: existing?.sectionCGradeLabel || 'Very Good (3.6 to 4.5)',
      overallRatingO: existing?.overallRatingO || 4.4,
      overallRatingGradeLabel: existing?.overallRatingGradeLabel || 'Very Good (3.6 to 4.5)',

      // Section D
      majorStrengths:
        existing?.majorStrengths ||
        'Exemplary clinical judgment, rapid and steady emergency trauma response, compassionate patient care, and mentorship of junior medical officers and house officers.',
      weaknessesToImprove:
        existing?.weaknessesToImprove ||
        'Could benefit from advanced participation in operational clinical research publications and further administrative committee engagements.',
      trainingNeededInPriority:
        existing?.trainingNeededInPriority ||
        '1. Advanced Laparoscopic Mastery Course\n2. Healthcare Leadership & Clinical Quality Management\n3. Clinical Audit & Bioethics in Catholic Healthcare',

      // Section E
      appraiserComments:
        existing?.appraiserComments ||
        'The Appraisee has consistently operated at an exceptional standard of clinical excellence and patient safety throughout the evaluation cycle. A commendable asset to Pope John Paul II Medical Centre.',
      appraiserName: existing?.appraiserName || 'Dr. Sarah Jenkins',
      appraiserPositionRank: existing?.appraiserPositionRank || 'Head of Surgery & Clinical Director',
      appraiserSignatureDate: existing?.appraiserSignatureDate || todayFormatted,
      appraiserSignatureUrl: existing?.appraiserSignatureUrl || '',

      appraiseeComments:
        existing?.appraiseeComments ||
        'I concur fully with this assessment. I remain dedicated to uplifting the healthcare mission of the Catholic Health Service Trust and Pope John Paul II Medical Centre in the coming cycle.',
      appraiseeName: existing?.appraiseeName || `${emp?.firstName || ''} ${emp?.lastName || ''}`,
      appraiseeSignatureDate: existing?.appraiseeSignatureDate || todayFormatted,
      appraiseeSignatureUrl: existing?.appraiseeSignatureUrl || '',

      // Section F
      countersigningComments:
        existing?.countersigningComments ||
        'Endorsed. Appraisee has demonstrated clinical distinction and steadfast fidelity to Catholic Health values. Recommended for annual step increment and continued clinical advancement.',
      countersigningOfficerName: existing?.countersigningOfficerName || 'Rev. Fr. Dr. Emmanuel Mensah',
      countersigningOfficerPosition: existing?.countersigningOfficerPosition || 'Chief Executive Officer / Head of Facility',
      countersigningSignatureDate: existing?.countersigningSignatureDate || todayFormatted,
      countersigningSignatureUrl: existing?.countersigningSignatureUrl || '',

      isAppraiseeCompleted: existing?.isAppraiseeCompleted ?? true,
      isAppraiserCompleted: existing?.isAppraiserCompleted ?? true,
      isCountersigned: existing?.isCountersigned ?? false,
    };
  };

  const [formData, setFormData] = useState<CatholicHealthAppraisalFormData>(getInitialFormData);

  // Re-sync when selected employee changes
  useEffect(() => {
    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        surname: prev.surname || selectedEmployee.lastName,
        otherNames: prev.otherNames || selectedEmployee.firstName,
        staffIdNumber: prev.staffIdNumber || selectedEmployee.empCode,
        directorateDepartmentUnit:
          prev.directorateDepartmentUnit ||
          `${selectedEmployee.department || 'Clinical Services'}${selectedEmployee.unit ? ' / ' + selectedEmployee.unit : ''}`,
        currentGrade: prev.currentGrade || selectedEmployee.jobTitle,
        appraiseeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
      }));
    }
  }, [selectedEmployee]);

  // Add / Remove Objective Rows (Staff can list 3 to 5 targets)
  const handleAddObjectiveRow = () => {
    const newId = `obj-${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      objectives: [
        ...prev.objectives,
        {
          id: newId,
          no: prev.objectives.length + 1,
          agreedObjective: '',
          mainActivities: '',
          objectivesAchieved: '',
          rating: 3,
          monitoringMechanism: '',
          comments: '',
        },
      ],
    }));
    showToast('info', 'Objective Added', 'New agreed objective row added for the review period.');
  };

  const handleRemoveObjectiveRow = (objId: string) => {
    if (formData.objectives.length <= 1) {
      showToast('warning', 'Minimum Reached', 'At least one objective must be retained.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.filter((o) => o.id !== objId),
    }));
  };

  // Recalculate Section B scores whenever objectives change
  const handleObjectiveRatingChange = (objId: string, rating: number) => {
    if (!canEditSectionBAppraiserFields) return;
    setFormData((prev) => {
      const updatedObjectives = prev.objectives.map((obj) =>
        obj.id === objId ? { ...obj, rating } : obj
      );

      const rated = updatedObjectives.filter((o) => typeof o.rating === 'number' && o.rating > 0);
      const totalScoreQ = rated.reduce((sum, o) => sum + (o.rating || 0), 0);
      const numberOfTargetsN = rated.length > 0 ? rated.length : 1;
      const scoreA = parseFloat((totalScoreQ / numberOfTargetsN).toFixed(2));
      const gradeLabelA = getScaleClassification(scoreA).label;

      // Overall Rating: (A + S) / 2 = O
      const overallO = parseFloat(((scoreA + prev.sectionCScoreS) / 2).toFixed(2));
      const overallGradeLabel = getScaleClassification(overallO).label;

      return {
        ...prev,
        objectives: updatedObjectives,
        sectionBTotalScoreQ: totalScoreQ,
        sectionBNumberOfTargetsN: numberOfTargetsN,
        sectionBScoreA: scoreA,
        sectionBGradeLabel: gradeLabelA,
        overallRatingO: overallO,
        overallRatingGradeLabel: overallGradeLabel,
      };
    });
  };

  // Recalculate Section C scores whenever assessment factors change
  const handleFactorRatingChange = (factorId: string, rating: number) => {
    if (!canEditSectionC) return;
    setFormData((prev) => {
      const updatedFactors = prev.assessmentFactors.map((f) =>
        f.id === factorId ? { ...f, rating } : f
      );

      const totalScoreQ = updatedFactors.reduce((sum, f) => sum + (f.rating || 0), 0);
      const scoreS = parseFloat((totalScoreQ / 5).toFixed(2));
      const gradeLabelS = getScaleClassification(scoreS).label;

      // Overall Rating: (A + S) / 2 = O
      const overallO = parseFloat(((prev.sectionBScoreA + scoreS) / 2).toFixed(2));
      const overallGradeLabel = getScaleClassification(overallO).label;

      return {
        ...prev,
        assessmentFactors: updatedFactors,
        sectionCTotalScoreQ: totalScoreQ,
        sectionCScoreS: scoreS,
        sectionCGradeLabel: gradeLabelS,
        overallRatingO: overallO,
        overallRatingGradeLabel: overallGradeLabel,
      };
    });
  };

  // Generic field updater
  const updateField = <K extends keyof CatholicHealthAppraisalFormData>(
    field: K,
    value: CatholicHealthAppraisalFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Helper: Update single objective text
  const updateObjectiveText = (
    objId: string,
    field: keyof CatholicHealthAppraisalObjective,
    val: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      objectives: prev.objectives.map((o) => (o.id === objId ? { ...o, [field]: val } : o)),
    }));
  };

  // Quick Sign Handlers
  const handleQuickSign = (role: 'appraiser' | 'appraisee' | 'countersigning') => {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
    if (role === 'appraiser') {
      if (!canEditAppraiserComments) {
        showToast('warning', 'Access Restricted', 'Section E Appraiser sign-off is reserved for the Supervising Officer.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        appraiserName: currentUser?.name || prev.appraiserName,
        appraiserPositionRank: prev.appraiserPositionRank || 'Supervising Officer',
        appraiserSignatureUrl: 'SIGNED_VERIFIED_DIGITAL',
        appraiserSignatureDate: today,
        isAppraiserCompleted: true,
      }));
      showToast('success', 'Appraiser Signature Verified', 'Official signature applied with cryptographic audit seal.');
    } else if (role === 'appraisee') {
      setFormData((prev) => ({
        ...prev,
        appraiseeName: `${selectedEmployee.firstName} ${selectedEmployee.lastName}`,
        appraiseeSignatureUrl: 'SIGNED_VERIFIED_DIGITAL',
        appraiseeSignatureDate: today,
        isAppraiseeCompleted: true,
      }));
      showToast('success', 'Appraisee Signature Verified', 'Staff confirmation signature logged.');
    } else {
      if (!canEditSectionF) {
        showToast('warning', 'Access Restricted', 'Section F countersigning is reserved for the Head of Facility / CEO.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        countersigningOfficerName: currentUser?.name || prev.countersigningOfficerName,
        countersigningSignatureUrl: 'SIGNED_VERIFIED_DIGITAL',
        countersigningSignatureDate: today,
        isCountersigned: true,
      }));
      showToast('success', 'Countersigned Successfully', 'Executive countersigning officer approval recorded.');
    }
  };

  // Execute In-Modal Sequential Approval (Identical to Leave Workflow)
  const handleConfirmWorkflowAction = () => {
    if (!appraisal || !actionPrompt) return;
    processAppraisalWorkflowStep(
      appraisal.id,
      actionPrompt.action === 'Approved' ? 'Approve' : 'Return',
      workflowComment || `${actionPrompt.action} at ${actionPrompt.tierName} stage.`,
      currentUser?.name
    );
    setActionPrompt(null);
    setWorkflowComment('');
    onClose();
  };

  // Save / Submit
  const handleSaveOrSubmit = (isFinalSubmit: boolean = false) => {
    const appraisalId = appraisal?.id || `appr-${Date.now()}`;
    const emp = selectedEmployee;

    const payload: Partial<PerformanceAppraisal> = {
      id: appraisalId,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      empCode: emp.empCode || formData.staffIdNumber,
      employeeStaffId: formData.staffIdNumber,
      department: emp.department || formData.directorateDepartmentUnit,
      jobTitle: emp.jobTitle || formData.currentGrade,
      cadre: appraisal?.cadre || 'medical_doctor',
      period: `Annual Cycle ${formData.periodFromMonthYear} - ${formData.periodToMonthYear}`,
      appraisalPeriod: `Annual Performance Appraisal (${formData.periodFromMonthYear} - ${formData.periodToMonthYear})`,
      status: isFinalSubmit ? 'In Review' : (appraisal?.status || 'Draft'),
      currentStage: isFinalSubmit ? 'Unit Head' : (appraisal?.currentStage || 'Unit Head'),
      workflow: appraisal?.workflow || {
        currentStage: 'Unit Head',
        unitHeadStep: { role: 'Unit Head', status: 'Pending' },
        departmentHeadStep: { role: 'Departmental Head', status: 'Pending' },
        hrStep: { role: 'HR', status: 'Pending' },
        facilityHeadStep: { role: 'Head of Facility', status: 'Pending' },
      },
      overallScore: formData.overallRatingO,
      overallRating: formData.overallRatingO,
      scoreCategory: formData.overallRatingO >= 4.6 ? 'Outstanding' : formData.overallRatingO >= 3.6 ? 'Exceeds Expectations' : 'Meets Standards',
      objectivesMet: formData.objectives.map((o) => `• ${o.agreedObjective}: ${o.objectivesAchieved}`).join('\n'),
      strengths: formData.majorStrengths,
      areasForImprovement: formData.weaknessesToImprove,
      developmentPlan: formData.trainingNeededInPriority,
      catholicHealthForm: formData,
      lastUpdatedDate: new Date().toISOString().split('T')[0],
      documents: appraisal?.documents || [],
      workflowSteps: appraisal?.workflowSteps || [
        {
          stageName: isFinalSubmit ? 'Catholic Health Appraisal Form Submitted' : 'Draft Saved',
          approverRole: activeRole || 'Staff',
          approverName: currentUser?.name || 'Staff Member',
          action: 'Approved',
          comments: isFinalSubmit
            ? 'Staff submitted official Catholic Health Service Trust Annual Performance Appraisal Form.'
            : 'Appraisal form draft updated.',
          timestamp: new Date().toLocaleString(),
        },
      ],
    };

    if (onSaveAppraisal) {
      onSaveAppraisal(payload);
    } else if (appraisal) {
      updatePerformanceAppraisal(appraisal.id, payload);
      showToast('success', 'Appraisal Form Saved', 'Catholic Health Service Trust appraisal form updated successfully.');
    } else {
      addPerformanceAppraisal(payload);
      showToast('success', 'Appraisal Initiated', 'Official Catholic Health Service Trust appraisal form created and submitted into workflow.');
    }

    onClose();
  };

  // Auto-trigger print when autoPrint prop is passed (e.g. from table action button)
  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  // Enhanced Universal Print Handler
  const handlePrint = () => {
    setActiveTab('ALL');
    setIsPrinting(true);
    showToast('info', 'Preparing Print Preview', 'Formatting official 6-page Catholic Health Service Trust Appraisal Form...');

    setTimeout(() => {
      printAppraisalDocument(formData, appraisal, selectedEmployee, {
        hospitalName: selectedHospital?.name || 'POPE JOHN PAUL II MEDICAL CENTRE',
        autoPrint: true,
      });
      setIsPrinting(false);
    }, 150);
  };

  // Standalone HTML Document Export (Offline & Archival)
  const handleDownloadOfflineHtml = () => {
    downloadAppraisalHtml(formData, appraisal, selectedEmployee);
    showToast('success', 'Document Exported', 'Official Catholic Health Service Trust appraisal document saved as standalone HTML file.');
  };

  if (!isOpen) return null;

  // Render 10-box Staff ID visual
  const renderStaffIdBoxes = (staffId: string) => {
    const padded = staffId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().padEnd(10, ' ').slice(0, 10);
    return (
      <div className="flex items-center gap-1">
        {padded.split('').map((char, index) => (
          <div
            key={index}
            className="flex h-8 w-8 items-center justify-center border-2 border-slate-700 bg-white font-mono text-sm font-black text-slate-900 shadow-inner"
          >
            {char === ' ' ? '' : char}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white printable-modal-overlay">
      <div className="relative my-4 sm:my-8 w-full max-w-6xl rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col max-h-[94vh] overflow-hidden print:m-0 print:border-none print:shadow-none print:max-h-none print:overflow-visible print:bg-white print:text-black printable-document-card">
        
        {/* TOP BAR / NAVIGATION (Hidden when printing) */}
        <div className="print:hidden border-b border-slate-800 bg-slate-950 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-300 tracking-wider border border-amber-500/30">
                  National Catholic Health Service, Ghana
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Official Annual Performance Appraisal Form
                </span>
              </div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                {formData.surname} {formData.otherNames}
                <span className="text-xs font-normal text-slate-400 font-mono">({formData.staffIdNumber})</span>
              </h2>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-1.5 border border-slate-700">
              <span className="text-[11px] font-medium text-slate-400">Overall Rating (O):</span>
              <span className="text-sm font-extrabold text-amber-400">{formData.overallRatingO} / 5.0</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScaleClassification(formData.overallRatingO).color}`}>
                {formData.overallRatingGradeLabel}
              </span>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 text-xs font-black shadow-sm transition active:scale-95"
              title="Print official Catholic Health Service Trust 6-page document or save as PDF"
            >
              <Printer className="h-4 w-4" />
              <span>Print Official Form</span>
            </button>

            <button
              onClick={handleDownloadOfflineHtml}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-slate-200 border border-slate-700 shadow-sm transition"
              title="Download standalone printable HTML document for offline archiving"
            >
              <Download className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Export HTML</span>
            </button>

            <button
              onClick={() => handleSaveOrSubmit(false)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-200 border border-slate-700 shadow-sm transition"
            >
              <Save className="h-4 w-4 text-emerald-400" />
              <span>Save Draft</span>
            </button>

            {!readOnly && (
              <button
                onClick={() => handleSaveOrSubmit(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition"
              >
                <Send className="h-4 w-4" />
                <span>Submit Appraisal</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* SECTION NAVIGATION TABS (Hidden when printing) */}
        <div className="print:hidden flex items-center gap-1 overflow-x-auto bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs shrink-0">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            All Sections (Full Form)
          </button>
          <button
            onClick={() => setActiveTab('A')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'A'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sec A: Personal Info (Appraisee)
          </button>
          <button
            onClick={() => setActiveTab('B')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'B'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sec B: Objectives & Scores (Q/N=A: {formData.sectionBScoreA})
          </button>
          <button
            onClick={() => setActiveTab('C')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'C'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sec C: Performance Factors (Q/5=S: {formData.sectionCScoreS})
          </button>
          <button
            onClick={() => setActiveTab('D')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'D'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sec D: Summary & Development
          </button>
          <button
            onClick={() => setActiveTab('E')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'E'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sec E: Comments & Signatures
          </button>
          <button
            onClick={() => setActiveTab('F')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
              activeTab === 'F'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            Sec F: Countersigning
          </button>
        </div>

        {/* 4-TIER WORKFLOW & ROLE PERMISSIONS BANNER (Hidden when printing) */}
        <div className="print:hidden bg-slate-950/95 border-b border-slate-800 px-4 py-3 space-y-2.5">
          {/* Approval Workflow Progress (Identical to Leave Workflow) */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/90 rounded-2xl p-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">4-Tier Approval Workflow</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                    Same as Leave Workflow
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Current Stage: <strong className="text-amber-400 font-bold">{currentWorkflowStage}</strong>
                </div>
              </div>
            </div>

            {/* 4 Tiers Visual Tracker */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
              {[
                { tier: 'Unit Head', label: 'Tier 1: Unit Head', step: appraisal?.workflow?.unitHeadStep },
                { tier: 'Departmental Head', label: 'Tier 2: Dept Head', step: appraisal?.workflow?.departmentHeadStep },
                { tier: 'HR', label: 'Tier 3: HR Directorate', step: appraisal?.workflow?.hrStep },
                { tier: 'Head of Facility', label: 'Tier 4: Head of Facility', step: appraisal?.workflow?.facilityHeadStep },
              ].map((item, index) => {
                const isApproved = item.step?.status === 'Approved' || (appraisal?.status === 'Completed');
                const isCurrent = currentWorkflowStage === item.tier && appraisal?.status !== 'Completed';

                return (
                  <React.Fragment key={item.tier}>
                    {index > 0 && <ArrowRight className="h-3 w-3 text-slate-600 shrink-0" />}
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold border transition ${
                        isApproved
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                          : isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm animate-pulse'
                          : 'bg-slate-800/50 text-slate-500 border-slate-800'
                      }`}
                      title={item.step?.approverName ? `Approved by ${item.step.approverName}` : item.label}
                    >
                      {isApproved ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                      ) : (
                        <div className="h-2 w-2 rounded-full bg-slate-600 shrink-0" />
                      )}
                      <span className="whitespace-nowrap">{item.label}</span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* In-Modal Sequential Approval Action Buttons */}
            {canUserApproveCurrentStage && appraisal && (
              <div className="flex items-center gap-2 pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                <button
                  type="button"
                  onClick={() => setActionPrompt({ action: 'Approved', tierName: currentWorkflowStage })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Approve Stage ({currentWorkflowStage})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionPrompt({ action: 'Returned', tierName: currentWorkflowStage })}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60 font-bold text-xs transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Return</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Role & Editing Rules Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-900/50 rounded-xl px-3 py-2 border border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">
                {isStaffFilling ? (
                  <>
                    <strong className="text-amber-300 font-bold">Staff Entry Mode:</strong> Fill{' '}
                    <span className="text-white font-bold">Section A</span>,{' '}
                    <span className="text-white font-bold">Section B</span> (Agreed Objectives & Main Tasks), and{' '}
                    <span className="text-white font-bold">Section E</span> (Appraisee's Comments).
                  </>
                ) : (
                  <>
                    <strong className="text-cyan-300 font-bold">Supervisory Assessment Mode:</strong> Full management evaluation (Sections A through F).
                  </>
                )}
              </span>
            </div>

            {/* Role Switcher Pill for Managers */}
            {isSupervisoryUser && (
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setUserMode('staff_mode')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    userMode === 'staff_mode'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Staff Fill Mode
                </button>
                <button
                  type="button"
                  onClick={() => setUserMode('supervisor_mode')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition ${
                    userMode === 'supervisor_mode'
                      ? 'bg-cyan-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Supervisor Review Mode
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SCROLLABLE FORM BODY / PRINTABLE OFFICIAL DOCUMENT */}
        <div
          ref={printAreaRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-slate-950/60 print:p-0 print:space-y-6 print:bg-white print:text-black print:overflow-visible"
        >
          {/* =========================================================================
              DOCUMENT HEADER (PAGE 1)
              ========================================================================= */}
          <div className="rounded-3xl border border-slate-700 bg-white p-6 sm:p-8 text-slate-900 shadow-xl print:border-none print:shadow-none print:p-0">
            {/* Top Emblem & Header Title */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b-2 border-slate-900">
              <div className="flex items-center gap-4">
                {/* Official Catholic Health Service Trust Seal Replica */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-emerald-800 bg-amber-50 p-2 shadow-inner text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xl">☤</span>
                    <span className="text-[7px] font-black uppercase tracking-tighter text-emerald-900 leading-tight">
                      CHST GHANA
                    </span>
                  </div>
                </div>

                <div>
                  <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900 font-serif">
                    Catholic Health Service Trust, Ghana
                  </h1>
                  <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-amber-800 font-serif">
                    Annual Performance Appraisal Form
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    National Catholic Health Service • Archdiocese of Accra • Ghana
                  </p>
                </div>
              </div>

              {/* Official 3-Way Distribution Box (Matching PDF Page 1) */}
              <div className="w-full sm:w-64 border-2 border-slate-900 p-2.5 text-[10px] font-medium text-slate-800 bg-slate-50 space-y-1 rounded-sm shadow-xs">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span>1 copy to be kept by Appraisee</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span>1 copy to be kept in Appraisee Personal file</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span>1 copy forwarded to the Performance Appraisal / HR Directorate</span>
                </div>
              </div>
            </div>

            {/* Facility Name & Appraisal Period Bar */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-1">
                <label className="block text-[11px] font-black uppercase text-slate-800 tracking-wider">
                  Facility Name:
                </label>
                <input
                  type="text"
                  value={formData.facilityName}
                  onChange={(e) => updateField('facilityName', e.target.value)}
                  className="mt-1 w-full border-b-2 border-slate-800 bg-transparent px-1 py-1 font-bold text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-800 tracking-wider">
                  Period of Appraisal:
                </label>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-xs font-bold text-slate-700">From</span>
                  <input
                    type="text"
                    value={formData.periodFromMonthYear}
                    onChange={(e) => updateField('periodFromMonthYear', e.target.value)}
                    placeholder="Month & Year"
                    className="w-28 border-b-2 border-slate-800 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                  />
                  <span className="text-xs font-bold text-slate-700">TO</span>
                  <input
                    type="text"
                    value={formData.periodToMonthYear}
                    onChange={(e) => updateField('periodToMonthYear', e.target.value)}
                    placeholder="Month & Year"
                    className="w-28 border-b-2 border-slate-800 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-800 tracking-wider">
                  Date of this Review:
                </label>
                <input
                  type="text"
                  value={formData.reviewDate}
                  onChange={(e) => updateField('reviewDate', e.target.value)}
                  placeholder="dd/mm/yy"
                  className="mt-1 w-full border-b-2 border-slate-800 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* =========================================================================
                SECTION A: Personal Information (Page 1)
                ========================================================================= */}
            {(activeTab === 'ALL' || activeTab === 'A' || isPrinting) && (
              <div className="mt-8 pt-6 border-t-2 border-slate-900 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                    SECTION A: Personal Information{' '}
                    <span className="text-xs font-normal normal-case text-slate-600">
                      (to be completed by the Appraisee)
                    </span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:hidden">
                    Page 1
                  </span>
                </div>

                {/* Staff ID Number Grid Box */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-slate-50 border border-slate-300 rounded-xl">
                  <span className="text-xs font-black uppercase text-slate-900 tracking-wider sm:w-48">
                    Staff ID Number:
                  </span>
                  <div className="flex items-center gap-3">
                    {renderStaffIdBoxes(formData.staffIdNumber)}
                    <input
                      type="text"
                      value={formData.staffIdNumber}
                      onChange={(e) => updateField('staffIdNumber', e.target.value)}
                      placeholder="e.g. PJP-1025"
                      className="print:hidden w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Names, DOB, Gender */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Surname:</label>
                    <input
                      type="text"
                      value={formData.surname}
                      onChange={(e) => updateField('surname', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-bold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Other Name(s): <span className="text-[10px] font-normal lowercase">(write names in full)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.otherNames}
                      onChange={(e) => updateField('otherNames', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-bold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Date of Birth:</label>
                    <input
                      type="text"
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField('dateOfBirth', e.target.value)}
                      placeholder="dd/mm/yy"
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Sex / Gender:</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => updateField('gender', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Name of Directorate/Department/Unit:
                    </label>
                    <input
                      type="text"
                      value={formData.directorateDepartmentUnit}
                      onChange={(e) => updateField('directorateDepartmentUnit', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Diocese, District, Sub-District */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Diocese:</label>
                    <input
                      type="text"
                      value={formData.diocese}
                      onChange={(e) => updateField('diocese', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">District:</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => updateField('district', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Sub-District:</label>
                    <input
                      type="text"
                      value={formData.subDistrict}
                      onChange={(e) => updateField('subDistrict', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Appointment Dates & Instructions */}
                <div className="text-center pt-2">
                  <span className="text-[11px] font-black text-slate-800 italic underline tracking-wider">
                    Date should be completed as dd/mm/yy
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Date of 1st Appointment:
                    </label>
                    <input
                      type="text"
                      value={formData.dateFirstAppointment}
                      onChange={(e) => updateField('dateFirstAppointment', e.target.value)}
                      placeholder="dd/mm/yy"
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Date of Current Appointment:
                    </label>
                    <input
                      type="text"
                      value={formData.dateCurrentAppointment}
                      onChange={(e) => updateField('dateCurrentAppointment', e.target.value)}
                      placeholder="dd/mm/yy"
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Grade, Professional Category, Specialty */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Current Grade:</label>
                    <input
                      type="text"
                      value={formData.currentGrade}
                      onChange={(e) => updateField('currentGrade', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Professional Category:
                    </label>
                    <input
                      type="text"
                      value={formData.professionalCategory}
                      onChange={(e) => updateField('professionalCategory', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Specialty:</label>
                    <input
                      type="text"
                      value={formData.specialty}
                      onChange={(e) => updateField('specialty', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Qualifications & Salary Level */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Basic Qualification (Professional/Academic):
                    </label>
                    <input
                      type="text"
                      value={formData.basicQualification}
                      onChange={(e) => updateField('basicQualification', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Year:</label>
                    <input
                      type="text"
                      value={formData.basicQualificationYear}
                      onChange={(e) => updateField('basicQualificationYear', e.target.value)}
                      placeholder="YYYY"
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Additional Qualification:
                    </label>
                    <input
                      type="text"
                      value={formData.additionalQualification}
                      onChange={(e) => updateField('additionalQualification', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Year:</label>
                    <input
                      type="text"
                      value={formData.additionalQualificationYear}
                      onChange={(e) => updateField('additionalQualificationYear', e.target.value)}
                      placeholder="YYYY"
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-700">
                      Current Salary Level:
                    </label>
                    <input
                      type="text"
                      value={formData.currentSalaryLevel}
                      onChange={(e) => updateField('currentSalaryLevel', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold uppercase text-slate-700">Current Step:</label>
                    <input
                      type="text"
                      value={formData.currentStep}
                      onChange={(e) => updateField('currentStep', e.target.value)}
                      className="mt-1 w-full border-b border-slate-400 bg-transparent px-1 py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="text-right text-[11px] font-bold text-slate-500 pt-3">1</div>
              </div>
            )}
          </div>

          {/* =========================================================================
              SECTION B: SETTING OBJECTIVES AND ASSESSMENT OF PERFORMANCE (PAGES 2 & 3)
              ========================================================================= */}
          {(activeTab === 'ALL' || activeTab === 'B' || isPrinting) && (
            <div className="rounded-3xl border border-slate-700 bg-white p-6 sm:p-8 text-slate-900 shadow-xl print:border-none print:shadow-none print:p-0 print:break-before-page">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                    SECTION B: SETTING OBJECTIVES AND ASSESSMENT OF PERFORMANCE
                  </h3>
                  <p className="text-xs text-slate-600 italic">
                    (To be completed by the Appraiser/supervising officer)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:hidden">
                  Pages 2 & 3
                </span>
              </div>

              {/* Rating Scale Key Legend */}
              <div className="my-4 p-3 bg-amber-50/70 border border-amber-300 rounded-xl text-xs text-slate-800 flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-amber-950 uppercase tracking-wider">
                  Ratings Scale Key (mark with a √ symbol):
                </span>
                <div className="flex flex-wrap items-center gap-3 text-[11px]">
                  <span className="font-semibold"><strong>5:</strong> Far exceeded targets</span>
                  <span className="font-semibold"><strong>4:</strong> Exceed target</span>
                  <span className="font-semibold"><strong>3:</strong> Meet all target</span>
                  <span className="font-semibold"><strong>2:</strong> Meet some target 3/5</span>
                  <span className="font-semibold"><strong>1:</strong> Meet less/none of target</span>
                </div>
              </div>

              {/* Objectives Table */}
              <div className="overflow-x-auto border-2 border-slate-900 mt-2">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-100 text-[11px] font-black uppercase text-slate-900">
                      <th className="border-r border-slate-900 p-2 w-8 text-center">No</th>
                      <th className="border-r border-slate-900 p-2 min-w-[200px]">
                        Agreed Objectives<br />
                        <span className="text-[9px] font-normal lowercase">(List between 3 to 5 for the period)</span>
                      </th>
                      <th className="border-r border-slate-900 p-2 min-w-[180px]">
                        Main Activities/Task<br />
                        <span className="text-[9px] font-normal lowercase">(To achieve Objectives and Targets)</span>
                      </th>
                      <th className="border-r border-slate-900 p-2 min-w-[170px]">Objectives Achieved</th>
                      <th className="border-r border-slate-900 p-1 w-36 text-center">
                        <div>Ratings (mark with √)</div>
                        <div className="grid grid-cols-5 border-t border-slate-900 text-center font-mono text-[11px] mt-1 pt-0.5">
                          <span>1</span>
                          <span>2</span>
                          <span>3</span>
                          <span>4</span>
                          <span>5</span>
                        </div>
                      </th>
                      <th className="border-r border-slate-900 p-2 min-w-[140px]">Monitoring mechanism</th>
                      <th className="p-2 min-w-[140px]">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.objectives.map((obj, idx) => (
                      <tr key={obj.id} className="border-b border-slate-900 align-top hover:bg-slate-50/50">
                        <td className="border-r border-slate-900 p-2 text-center font-bold">
                          <div className="flex flex-col items-center justify-between h-full gap-2">
                            <span>{idx + 1}.</span>
                            {canEditSectionBStaffFields && formData.objectives.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveObjectiveRow(obj.id)}
                                className="print:hidden text-slate-400 hover:text-rose-600 transition p-0.5"
                                title="Delete objective row"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="border-r border-slate-900 p-2">
                          <textarea
                            rows={3}
                            value={obj.agreedObjective}
                            disabled={!canEditSectionBStaffFields}
                            onChange={(e) => updateObjectiveText(obj.id, 'agreedObjective', e.target.value)}
                            placeholder="Enter agreed performance target..."
                            className={`w-full bg-transparent text-xs resize-none border-none p-0 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              !canEditSectionBStaffFields ? 'cursor-not-allowed text-slate-600' : 'text-slate-900 font-medium'
                            }`}
                          />
                        </td>
                        <td className="border-r border-slate-900 p-2">
                          <textarea
                            rows={3}
                            value={obj.mainActivities}
                            disabled={!canEditSectionBStaffFields}
                            onChange={(e) => updateObjectiveText(obj.id, 'mainActivities', e.target.value)}
                            placeholder="Key activities or tasks to achieve objective..."
                            className={`w-full bg-transparent text-xs resize-none border-none p-0 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              !canEditSectionBStaffFields ? 'cursor-not-allowed text-slate-600' : 'text-slate-900 font-medium'
                            }`}
                          />
                        </td>
                        <td className="border-r border-slate-900 p-2">
                          <textarea
                            rows={3}
                            value={obj.objectivesAchieved}
                            disabled={!canEditSectionBAppraiserFields}
                            onChange={(e) => updateObjectiveText(obj.id, 'objectivesAchieved', e.target.value)}
                            placeholder={!canEditSectionBAppraiserFields ? '(Completed by Appraiser during evaluation)' : 'Specific targets and deliverables achieved...'}
                            className={`w-full bg-transparent text-xs resize-none border-none p-0 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              !canEditSectionBAppraiserFields ? 'text-slate-400 italic cursor-not-allowed' : 'text-slate-900 font-medium'
                            }`}
                          />
                        </td>
                        <td className="border-r border-slate-900 p-0">
                          <div className="grid grid-cols-5 h-full min-h-[70px] text-center items-center">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                disabled={!canEditSectionBAppraiserFields}
                                onClick={() => handleObjectiveRatingChange(obj.id, val)}
                                className={`h-full flex items-center justify-center border-r last:border-r-0 border-slate-300 font-bold transition ${
                                  !canEditSectionBAppraiserFields ? 'cursor-not-allowed opacity-80' : 'hover:bg-amber-100'
                                } ${
                                  obj.rating === val
                                    ? 'bg-amber-400/60 text-slate-950 font-black text-sm'
                                    : 'text-slate-400'
                                }`}
                                title={!canEditSectionBAppraiserFields ? 'Rating completed by Appraiser' : `Rate ${val}`}
                              >
                                {obj.rating === val ? '√' : ''}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="border-r border-slate-900 p-2">
                          <textarea
                            rows={3}
                            value={obj.monitoringMechanism || ''}
                            disabled={!canEditSectionBAppraiserFields}
                            onChange={(e) => updateObjectiveText(obj.id, 'monitoringMechanism', e.target.value)}
                            placeholder={!canEditSectionBAppraiserFields ? '(Appraiser)' : 'e.g. Monthly audits, register'}
                            className={`w-full bg-transparent text-xs resize-none border-none p-0 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              !canEditSectionBAppraiserFields ? 'text-slate-400 italic cursor-not-allowed' : 'text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="p-2">
                          <textarea
                            rows={3}
                            value={obj.comments || ''}
                            disabled={!canEditSectionBAppraiserFields}
                            onChange={(e) => updateObjectiveText(obj.id, 'comments', e.target.value)}
                            placeholder={!canEditSectionBAppraiserFields ? '(Appraiser)' : 'Appraiser remarks...'}
                            className={`w-full bg-transparent text-xs resize-none border-none p-0 focus:outline-none focus:ring-1 focus:ring-amber-500 ${
                              !canEditSectionBAppraiserFields ? 'text-slate-400 italic cursor-not-allowed' : 'text-slate-900'
                            }`}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Objective Row Action (for Staff & Supervisors) */}
              {canEditSectionBStaffFields && (
                <div className="mt-3 flex items-center justify-between print:hidden">
                  <button
                    type="button"
                    onClick={handleAddObjectiveRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs transition shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Agreed Objective Row</span>
                  </button>
                  <span className="text-[11px] text-slate-500 italic">
                    Staff should list between 3 to 5 agreed targets for the evaluation cycle.
                  </span>
                </div>
              )}

              {/* Total Score Calculation Bar (Page 3 bottom calculation) */}
              <div className="mt-6 p-4 border-2 border-slate-900 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900">
                  <div>
                    <span>Total Score (Q): </span>
                    <strong className="text-amber-800 font-mono text-base">{formData.sectionBTotalScoreQ}</strong>
                    <span className="mx-2">|</span>
                    <span>Number of targets (N): </span>
                    <strong className="text-amber-800 font-mono text-base">{formData.sectionBNumberOfTargetsN}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider">Formula: Q / N = A:</span>
                    <span className="rounded-lg bg-slate-900 px-3 py-1 font-mono text-base font-black text-amber-300">
                      A = {formData.sectionBScoreA}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScaleClassification(formData.sectionBScoreA).color}`}>
                      {formData.sectionBGradeLabel}
                    </span>
                  </div>
                </div>

                {/* Score Key Matrix Table (Page 3 Bottom Table) */}
                <div className="overflow-x-auto pt-2 border-t border-slate-300">
                  <table className="w-full text-center text-xs border border-slate-700">
                    <thead>
                      <tr className="bg-slate-200 font-bold text-slate-800">
                        <th className="border border-slate-700 p-1.5">Unsatisfactory (1 to 1.5)</th>
                        <th className="border border-slate-700 p-1.5">Marginal (1.6 to 2.5)</th>
                        <th className="border border-slate-700 p-1.5">Good (2.6 to 3.5)</th>
                        <th className="border border-slate-700 p-1.5">Very good (3.6 to 4.5)</th>
                        <th className="border border-slate-700 p-1.5">Excellent (4.6 to 5)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionBScoreA < 1.6 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>
                          1.0 - 1.5
                        </td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionBScoreA >= 1.6 && formData.sectionBScoreA <= 2.5 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>
                          1.6 - 2.5
                        </td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionBScoreA > 2.5 && formData.sectionBScoreA <= 3.5 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>
                          2.6 - 3.5
                        </td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionBScoreA > 3.5 && formData.sectionBScoreA <= 4.5 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>
                          3.6 - 4.5 {formData.sectionBScoreA > 3.5 && formData.sectionBScoreA <= 4.5 ? '✓' : ''}
                        </td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionBScoreA > 4.5 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>
                          4.6 - 5.0 {formData.sectionBScoreA > 4.5 ? '✓' : ''}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-slate-500 pt-3">2</div>
            </div>
          )}

          {/* =========================================================================
              SECTION C: RATING AND ASSESSMENT OF CURRENT PERFORMANCE (PAGE 4)
              ========================================================================= */}
          {(activeTab === 'ALL' || activeTab === 'C') && (
            <div className="rounded-3xl border border-slate-700 bg-white p-6 sm:p-8 text-slate-900 shadow-xl print:border-none print:shadow-none print:p-0 print:break-before-page">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                    SECTION C: RATING AND ASSESSMENT OF CURRENT PERFORMANCE
                  </h3>
                  <p className="text-xs text-slate-600 italic">
                    (To be completed by the Appraiser)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:hidden">
                  Page 4
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold text-slate-800">
                Circle / select the rating that you judge/assess best applies to the Appraisee based on the description/standard given for each rating:
              </p>

              {!canEditSectionC && (
                <div className="my-3 p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                  <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>
                    <strong>Staff View:</strong> Section C performance factors are evaluated and scored by the Supervising Officer / Appraiser.
                  </span>
                </div>
              )}

              {/* Assessment Factors Table */}
              <div className="overflow-x-auto border-2 border-slate-900 mt-3">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-900 bg-slate-100 text-[11px] font-black uppercase text-slate-900">
                      <th className="border-r border-slate-900 p-2.5 w-10 text-center">#</th>
                      <th className="border-r border-slate-900 p-2.5">Assessment Factor</th>
                      <th className="border-r border-slate-900 p-2 w-28 text-center bg-rose-50/50">
                        1<br /><span className="text-[9px] font-normal normal-case">Unsatisfactory</span>
                      </th>
                      <th className="border-r border-slate-900 p-2 w-28 text-center bg-amber-50/50">
                        2<br /><span className="text-[9px] font-normal normal-case">Poor</span>
                      </th>
                      <th className="border-r border-slate-900 p-2 w-28 text-center bg-teal-50/50">
                        3<br /><span className="text-[9px] font-normal normal-case">Satisfactory</span>
                      </th>
                      <th className="border-r border-slate-900 p-2 w-28 text-center bg-blue-50/50">
                        4<br /><span className="text-[9px] font-normal normal-case">Very Good</span>
                      </th>
                      <th className="p-2 w-28 text-center bg-emerald-50/50">
                        5<br /><span className="text-[9px] font-normal normal-case">Excellent</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.assessmentFactors.map((factor) => (
                      <tr key={factor.id} className="border-b border-slate-900 hover:bg-slate-50">
                        <td className="border-r border-slate-900 p-2.5 text-center font-bold">{factor.factorNumber}</td>
                        <td className="border-r border-slate-900 p-2.5 font-bold text-slate-900">
                          {factor.factorName}
                        </td>
                        {[1, 2, 3, 4, 5].map((val) => (
                          <td
                            key={val}
                            onClick={() => {
                              if (canEditSectionC) {
                                handleFactorRatingChange(factor.id, val);
                              }
                            }}
                            className={`border-r last:border-r-0 border-slate-900 p-2 text-center select-none transition ${
                              !canEditSectionC ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-slate-100'
                            } ${
                              factor.rating === val
                                ? 'bg-amber-300 font-black text-slate-950'
                                : 'text-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              {factor.rating === val ? (
                                <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-900 bg-amber-400 font-bold text-xs shadow-xs">
                                  {val}
                                </span>
                              ) : (
                                <span className="text-xs font-mono">{val}</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section C Rating: Total score Q over 5 (Q/5) = S */}
              <div className="mt-5 p-4 border-2 border-slate-900 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-bold text-slate-900">
                  <div>
                    <span>Rating: Total score Q over 5 (Q/5) = </span>
                    <strong className="text-blue-900 font-mono text-base">S</strong>:
                    <span className="ml-2 rounded-lg bg-blue-900 px-3 py-1 font-mono text-base font-black text-amber-300">
                      S = {formData.sectionCScoreS}
                    </span>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getScaleClassification(formData.sectionCScoreS).color}`}>
                    {formData.sectionCGradeLabel}
                  </span>
                </div>

                {/* Score Key Matrix Table for S */}
                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-center text-xs border border-slate-700">
                    <thead>
                      <tr className="bg-slate-200 font-bold text-slate-800">
                        <th className="border border-slate-700 p-1">Unsatisfactory (1 to 1.5)</th>
                        <th className="border border-slate-700 p-1">Marginal (1.6 to 2.5)</th>
                        <th className="border border-slate-700 p-1">Good (2.6 to 3.5)</th>
                        <th className="border border-slate-700 p-1">Very Good (3.6 to 4.5)</th>
                        <th className="border border-slate-700 p-1">Excellent (4.6 to 5)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionCScoreS < 1.6 ? 'bg-amber-300 text-slate-950' : ''}`}>1.0 - 1.5</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionCScoreS >= 1.6 && formData.sectionCScoreS <= 2.5 ? 'bg-amber-300 text-slate-950' : ''}`}>1.6 - 2.5</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionCScoreS > 2.5 && formData.sectionCScoreS <= 3.5 ? 'bg-amber-300 text-slate-950' : ''}`}>2.6 - 3.5</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionCScoreS > 3.5 && formData.sectionCScoreS <= 4.5 ? 'bg-amber-300 text-slate-950' : ''}`}>3.6 - 4.5 {formData.sectionCScoreS > 3.5 && formData.sectionCScoreS <= 4.5 ? '✓' : ''}</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.sectionCScoreS > 4.5 ? 'bg-amber-300 text-slate-950' : ''}`}>4.6 - 5.0 {formData.sectionCScoreS > 4.5 ? '✓' : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Overall Rating Formula: (A + S) / 2 = O */}
                <div className="mt-4 pt-3 border-t-2 border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs sm:text-sm font-black uppercase text-slate-900 tracking-wider">
                      Overall Rating (A + S) / 2 = O:
                    </span>
                    <span className="ml-2 font-mono text-xs text-slate-600">
                      ({formData.sectionBScoreA} + {formData.sectionCScoreS}) / 2
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-xl bg-slate-950 px-4 py-1.5 font-mono text-lg font-black text-amber-400 shadow-sm">
                      O = {formData.overallRatingO}
                    </span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getScaleClassification(formData.overallRatingO).color}`}>
                      {formData.overallRatingGradeLabel}
                    </span>
                  </div>
                </div>

                {/* Scale Table for Overall Rating O */}
                <div className="overflow-x-auto pt-1">
                  <table className="w-full text-center text-xs border border-slate-700">
                    <thead>
                      <tr className="bg-slate-200 font-bold text-slate-800">
                        <th className="border border-slate-700 p-1">Unsatisfactory (1 to 1.5)</th>
                        <th className="border border-slate-700 p-1">Marginal (1.6 to 2.5)</th>
                        <th className="border border-slate-700 p-1">Good (2.6 to 3.5)</th>
                        <th className="border border-slate-700 p-1">Very Good (3.6 to 4.5)</th>
                        <th className="border border-slate-700 p-1">Excellent (4.6 to 5)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.overallRatingO < 1.6 ? 'bg-amber-300 text-slate-950' : ''}`}>1.0 - 1.5</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.overallRatingO >= 1.6 && formData.overallRatingO <= 2.5 ? 'bg-amber-300 text-slate-950' : ''}`}>1.6 - 2.5</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.overallRatingO > 2.5 && formData.overallRatingO <= 3.5 ? 'bg-amber-300 text-slate-950' : ''}`}>2.6 - 3.5</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.overallRatingO > 3.5 && formData.overallRatingO <= 4.5 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>3.6 - 4.5 {formData.overallRatingO > 3.5 && formData.overallRatingO <= 4.5 ? '✓' : ''}</td>
                        <td className={`border border-slate-700 p-1 font-bold ${formData.overallRatingO > 4.5 ? 'bg-amber-300 text-slate-950 font-black' : ''}`}>4.6 - 5.0 {formData.overallRatingO > 4.5 ? '✓' : ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-slate-500 pt-3">3</div>
            </div>
          )}

          {/* =========================================================================
              SECTION D: Summary of Performance and Development Plan (PAGE 5)
              ========================================================================= */}
          {(activeTab === 'ALL' || activeTab === 'D') && (
            <div className="rounded-3xl border border-slate-700 bg-white p-6 sm:p-8 text-slate-900 shadow-xl print:border-none print:shadow-none print:p-0 print:break-before-page">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <div>
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                    SECTION D: Summary of Performance and Development Plan
                  </h3>
                  <p className="text-xs text-slate-600 italic">
                    (to be completed by the Appraiser)
                  </p>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:hidden">
                  Page 5
                </span>
              </div>

              <div className="mt-5 space-y-5 text-xs sm:text-sm">
                {!canEditSectionD && (
                  <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                    <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>
                      <strong>Staff View:</strong> Section D strengths, growth areas, and development plans are prepared by the Appraiser.
                    </span>
                  </div>
                )}
                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    What activities does this Appraisee do especially well? (Major strengths)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.majorStrengths}
                    disabled={!canEditSectionD}
                    onChange={(e) => updateField('majorStrengths', e.target.value)}
                    className={`w-full rounded-xl border border-slate-300 p-3 leading-relaxed font-medium ${
                      !canEditSectionD ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed italic' : 'bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600'
                    }`}
                    placeholder={!canEditSectionD ? '(Completed by Appraiser during evaluation)' : "State the appraisee's key clinical and professional strengths..."}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    In what respects does this Appraisee need to improve? (Weaknesses)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.weaknessesToImprove}
                    disabled={!canEditSectionD}
                    onChange={(e) => updateField('weaknessesToImprove', e.target.value)}
                    className={`w-full rounded-xl border border-slate-300 p-3 leading-relaxed font-medium ${
                      !canEditSectionD ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed italic' : 'bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600'
                    }`}
                    placeholder={!canEditSectionD ? '(Completed by Appraiser during evaluation)' : 'Highlight specific growth opportunities and development targets...'}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 mb-1">
                    Based on current job performance and the requirements of the Appraisee's job position, in order of priority list areas of training needed / recommended:
                  </label>
                  <textarea
                    rows={4}
                    value={formData.trainingNeededInPriority}
                    disabled={!canEditSectionD}
                    onChange={(e) => updateField('trainingNeededInPriority', e.target.value)}
                    className={`w-full rounded-xl border border-slate-300 p-3 leading-relaxed font-medium ${
                      !canEditSectionD ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed italic' : 'bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600'
                    }`}
                    placeholder={!canEditSectionD ? '(Completed by Appraiser during evaluation)' : '1. First Priority Training Course\n2. Second Priority Training Needed\n3. Third Recommended Program'}
                  />
                </div>
              </div>

              {/* =========================================================================
                  SECTION E: Comments (PAGE 5)
                  ========================================================================= */}
              <div className="mt-8 pt-6 border-t-2 border-slate-900 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                    SECTION E: Comments
                  </h3>
                  <p className="text-xs text-slate-600 italic">
                    (to be completed by both the Appraiser and Appraisee)
                  </p>
                </div>

                {/* Appraiser's Comments Box */}
                <div className="p-4 border border-slate-300 rounded-2xl bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase text-slate-900">
                      Appraiser's Comments:
                    </label>
                    {canEditAppraiserComments ? (
                      <button
                        type="button"
                        onClick={() => handleQuickSign('appraiser')}
                        className="print:hidden text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-blue-100/70 px-2 py-0.5 rounded border border-blue-200"
                      >
                        <PenTool className="h-3 w-3" /> Quick Digital Endorsement
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-200 px-2 py-0.5 rounded">
                        <Lock className="h-3 w-3" /> Supervising Officer Only
                      </span>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    value={formData.appraiserComments}
                    disabled={!canEditAppraiserComments}
                    onChange={(e) => updateField('appraiserComments', e.target.value)}
                    placeholder={!canEditAppraiserComments ? '(Completed by Appraiser / Supervising Officer)' : 'Enter formal appraiser comments...'}
                    className={`w-full rounded-lg border border-slate-300 p-2 text-xs leading-relaxed font-medium ${
                      !canEditAppraiserComments ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed italic' : 'bg-white text-slate-900 focus:outline-none focus:border-amber-600'
                    }`}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">Name of Appraiser:</span>
                      <input
                        type="text"
                        value={formData.appraiserName}
                        disabled={!canEditAppraiserComments}
                        onChange={(e) => updateField('appraiserName', e.target.value)}
                        className="w-full border-b border-slate-400 bg-transparent py-1 font-bold text-slate-900 focus:outline-none focus:border-amber-600 disabled:text-slate-600"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">Position / Rank:</span>
                      <input
                        type="text"
                        value={formData.appraiserPositionRank}
                        disabled={!canEditAppraiserComments}
                        onChange={(e) => updateField('appraiserPositionRank', e.target.value)}
                        className="w-full border-b border-slate-400 bg-transparent py-1 font-semibold text-slate-900 focus:outline-none focus:border-amber-600 disabled:text-slate-600"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold uppercase text-slate-600 block">Signature:</span>
                        <div className="border-b border-slate-400 py-1 font-serif italic font-bold text-emerald-800 text-xs">
                          {formData.appraiserSignatureUrl ? '✓ Verified Sign-off' : 'Pending Signature'}
                        </div>
                      </div>
                      <div className="w-24">
                        <span className="text-[10px] font-bold uppercase text-slate-600 block">Date:</span>
                        <input
                          type="text"
                          value={formData.appraiserSignatureDate}
                          disabled={!canEditAppraiserComments}
                          onChange={(e) => updateField('appraiserSignatureDate', e.target.value)}
                          placeholder="dd/mm/yy"
                          className="w-full border-b border-slate-400 bg-transparent py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600 disabled:text-slate-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Appraisee's Comments Box (Staff can fill!) */}
                <div className="p-4 border border-slate-300 rounded-2xl bg-slate-50/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black uppercase text-slate-900">
                      Appraisee's Comments <span className="text-amber-700 font-bold">(Staff Editable)</span>:
                    </label>
                    <button
                      type="button"
                      disabled={!canSignAppraisee}
                      onClick={() => handleQuickSign('appraisee')}
                      className="print:hidden text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-300 shadow-xs transition"
                    >
                      <PenTool className="h-3 w-3" /> Appraisee Sign-off
                    </button>
                  </div>

                  <textarea
                    rows={3}
                    value={formData.appraiseeComments}
                    disabled={!canEditAppraiseeComments}
                    onChange={(e) => updateField('appraiseeComments', e.target.value)}
                    placeholder="Enter your comments or observations on the appraisal review..."
                    className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 bg-white focus:outline-none focus:border-amber-600 leading-relaxed font-medium"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">
                        Appraisee's Signature:
                      </span>
                      <div className="border-b border-slate-400 py-1 font-serif italic font-bold text-emerald-800 text-xs">
                        {formData.appraiseeSignatureUrl
                          ? `✓ Signed by ${formData.surname} ${formData.otherNames}`
                          : 'Pending Signature'}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-600 block">Date:</span>
                      <input
                        type="text"
                        value={formData.appraiseeSignatureDate}
                        onChange={(e) => updateField('appraiseeSignatureDate', e.target.value)}
                        placeholder="dd/mm/yy"
                        className="w-full border-b border-slate-400 bg-transparent py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-slate-500 pt-3">4</div>
            </div>
          )}

          {/* =========================================================================
              SECTION F: Comments by Countersigning Officer (PAGE 6)
              ========================================================================= */}
          {(activeTab === 'ALL' || activeTab === 'F') && (
            <div className="rounded-3xl border border-slate-700 bg-white p-6 sm:p-8 text-slate-900 shadow-xl print:border-none print:shadow-none print:p-0 print:break-before-page">
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
                <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                  Comments by Countersigning Officer
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest print:hidden">
                  Page 6
                </span>
              </div>

              <div className="mt-5 space-y-4 text-xs sm:text-sm">
                {!canEditSectionF && (
                  <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-2.5 text-xs text-slate-700">
                    <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>
                      <strong>Executive Sign-off:</strong> Section F is reserved for the Countersigning Officer (Head of Facility / CEO).
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900">
                    Comments by Countersigning Officer:
                  </label>
                  {canEditSectionF ? (
                    <button
                      type="button"
                      onClick={() => handleQuickSign('countersigning')}
                      className="print:hidden text-[11px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 bg-purple-100 px-2 py-0.5 rounded border border-purple-200"
                    >
                      <PenTool className="h-3 w-3" /> Countersign & Endorse
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 bg-slate-200 px-2 py-0.5 rounded">
                      <Lock className="h-3 w-3" /> Countersigning Officer Only
                    </span>
                  )}
                </div>

                <textarea
                  rows={6}
                  value={formData.countersigningComments}
                  disabled={!canEditSectionF}
                  onChange={(e) => updateField('countersigningComments', e.target.value)}
                  className={`w-full rounded-xl border border-slate-300 p-3 leading-relaxed font-medium ${
                    !canEditSectionF ? 'bg-slate-100/90 text-slate-600 cursor-not-allowed italic' : 'bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:border-amber-600'
                  }`}
                  placeholder={!canEditSectionF ? '(Reserved for Countersigning Officer / Head of Facility)' : "Enter comments by the Countersigning Officer (Director / CEO / Head of Facility)..."}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">
                      Name of Countersigning Officer:
                    </span>
                    <input
                      type="text"
                      value={formData.countersigningOfficerName}
                      disabled={!canEditSectionF}
                      onChange={(e) => updateField('countersigningOfficerName', e.target.value)}
                      className="w-full border-b border-slate-400 bg-transparent py-1 font-bold text-slate-900 focus:outline-none focus:border-amber-600 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Position:</span>
                    <input
                      type="text"
                      value={formData.countersigningOfficerPosition}
                      disabled={!canEditSectionF}
                      onChange={(e) => updateField('countersigningOfficerPosition', e.target.value)}
                      className="w-full border-b border-slate-400 bg-transparent py-1 font-semibold text-slate-900 focus:outline-none focus:border-amber-600 disabled:text-slate-600"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Signature:</span>
                    <div className="border-b border-slate-400 py-1 font-serif italic font-bold text-purple-900 text-xs">
                      {formData.countersigningSignatureUrl
                        ? `✓ Endorsed by ${formData.countersigningOfficerName}`
                        : 'Pending Executive Signature'}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-600 block">Date:</span>
                    <input
                      type="text"
                      value={formData.countersigningSignatureDate}
                      disabled={!canEditSectionF}
                      onChange={(e) => updateField('countersigningSignatureDate', e.target.value)}
                      placeholder="dd/mm/yy"
                      className="w-full border-b border-slate-400 bg-transparent py-1 font-semibold text-slate-900 text-xs focus:outline-none focus:border-amber-600 disabled:text-slate-600"
                    />
                  </div>
                </div>
              </div>

              <div className="text-right text-[11px] font-bold text-slate-500 pt-6">5</div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION DOCK (Hidden when printing) */}
        <div className="print:hidden border-t border-slate-800 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>Catholic Health Service Trust (Ghana) Compliant • Form Version 2026</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
            >
              Cancel
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 text-xs font-black shadow-sm transition active:scale-95"
              title="Print official Catholic Health Service Trust 6-page document or save as PDF"
            >
              <Printer className="h-4 w-4" /> Print Official Form
            </button>

            <button
              onClick={handleDownloadOfflineHtml}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-cyan-300 border border-slate-700 transition"
              title="Download standalone printable HTML document for offline archiving"
            >
              <Download className="h-4 w-4" /> Export HTML
            </button>

            <button
              onClick={() => handleSaveOrSubmit(false)}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-emerald-400 border border-slate-700 transition"
            >
              <Save className="h-4 w-4" /> Save Draft
            </button>

            {!readOnly && (
              <button
                onClick={() => handleSaveOrSubmit(true)}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md transition"
              >
                <CheckCircle2 className="h-4 w-4" /> Submit Completed Form
              </button>
            )}
          </div>
        </div>

        {/* WORKFLOW ACTION CONFIRMATION MODAL */}
        {actionPrompt && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-2xl flex items-center justify-center ${
                    actionPrompt.action === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {actionPrompt.action === 'Approved' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {actionPrompt.action === 'Approved' ? 'Approve Workflow Stage' : 'Return for Revisions'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Stage: <strong className="text-amber-400">{actionPrompt.tierName}</strong> (Sequential Approval)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Comments / Endorsement Notes {actionPrompt.action === 'Returned' && <span className="text-rose-400">*</span>}:
                </label>
                <textarea
                  rows={3}
                  value={workflowComment}
                  onChange={(e) => setWorkflowComment(e.target.value)}
                  placeholder={
                    actionPrompt.action === 'Approved'
                      ? 'Add any official endorsement notes or comments (optional)...'
                      : 'Provide specific feedback on required corrections or updates (mandatory)...'
                  }
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionPrompt(null);
                    setWorkflowComment('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmWorkflowAction}
                  className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition ${
                    actionPrompt.action === 'Approved'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  Confirm {actionPrompt.action === 'Approved' ? 'Approval' : 'Return'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
