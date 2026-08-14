import { Employee, PromotionRecord } from '../types/hrms';

export interface PromotionCalculationResult {
  employee: Employee;
  empCode: string;
  name: string;
  grade: string;
  department: string;
  unit: string;
  firstAppointmentDate: string; // "YYYY-MM-DD" or formatted
  lastPromotionDate: string | null;
  nextPromotionDueDate: string; // "YYYY-MM-DD"
  nextPromotionDueYear: number;
  promotionType: 'First Promotion' | 'Subsequent Promotion';
  requiredYears: number; // 3 or 5
  yearsOfService: number;
  yearsInCurrentGrade: number;
  isDueInSubsequentYear: boolean; // true if due in 2027
  isDueThisYear: boolean; // true if due in 2026
  isOverdue: boolean; // due before current year or current date
  eligibilityStatus:
    | 'Due in Subsequent Year (2027)'
    | 'Due This Year (2026)'
    | 'Overdue for Promotion'
    | 'Eligible & Due'
    | 'Future Due'
    | 'Recently Promoted';
  suggestedNextGrade: string;
  salaryStepMultiplier: number;
}

// Standard Healthcare & Hospital Grade Ladders
export const GRADE_PROGRESSION_LADDERS: Record<string, string[]> = {
  nursing: [
    'Staff Nurse (SN)',
    'Senior Staff Nurse (SSN)',
    'Nursing Officer (NO)',
    'Senior Nursing Officer (SNO)',
    'Principal Nursing Officer (PNO)',
    'Deputy Director of Nursing Services (DDNS)',
    'Director of Nursing Services (DNS)',
  ],
  medical: [
    'House Officer',
    'Medical Officer (MO)',
    'Senior Medical Officer (SMO)',
    'Principal Medical Officer (PMO)',
    'Junior Specialist',
    'Senior Specialist Physician',
    'Chief Consultant',
  ],
  pharmacy: [
    'Intern Pharmacist',
    'Pharmacist',
    'Senior Pharmacist',
    'Principal Pharmacist',
    'Deputy Chief Pharmacist',
    'Chief Pharmacist / Director of Pharmacy',
  ],
  laboratory: [
    'Medical Lab Intern',
    'Medical Laboratory Scientist',
    'Senior Laboratory Scientist',
    'Principal Laboratory Scientist',
    'Chief Medical Lab Scientist',
  ],
  administration: [
    'Assistant Administrative Officer',
    'Administrative Officer / HR Officer',
    'Senior HR / Administrative Officer',
    'Principal HR Officer',
    'Deputy Director of Administration / HR Director',
    'Chief Executive Administrator',
  ],
  finance: [
    'Junior Accounts Officer',
    'Assistant Accountant',
    'Accountant',
    'Senior Accountant',
    'Principal Accountant',
    'Chief Financial Officer (CFO)',
  ],
  general: [
    'Grade I Officer',
    'Senior Grade Officer',
    'Principal Officer',
    'Lead Coordinator',
    'Director',
  ],
};

/**
 * Suggests the next rank on the career ladder given current grade or job title
 */
export function getNextGradeRecommendation(currentGrade: string, dept: string): string {
  const normalizedDept = (dept || '').toLowerCase();
  const ladderKey =
    normalizedDept.includes('nurs') || normalizedDept.includes('ward') || normalizedDept.includes('icu')
      ? 'nursing'
      : normalizedDept.includes('med') || normalizedDept.includes('surg') || normalizedDept.includes('emerg')
      ? 'medical'
      : normalizedDept.includes('pharm')
      ? 'pharmacy'
      : normalizedDept.includes('lab') || normalizedDept.includes('path')
      ? 'laboratory'
      : normalizedDept.includes('financ') || normalizedDept.includes('acc')
      ? 'finance'
      : normalizedDept.includes('hr') || normalizedDept.includes('admin') || normalizedDept.includes('exec')
      ? 'administration'
      : 'general';

  const ladder = GRADE_PROGRESSION_LADDERS[ladderKey] || GRADE_PROGRESSION_LADDERS.general;
  const currentIndex = ladder.findIndex(
    (g) => g.toLowerCase() === (currentGrade || '').toLowerCase() || currentGrade?.toLowerCase().includes(g.toLowerCase())
  );

  if (currentIndex >= 0 && currentIndex < ladder.length - 1) {
    return ladder[currentIndex + 1];
  }

  // Fallback heuristic: prefix with Senior or Principal
  if (!currentGrade.toLowerCase().startsWith('principal') && !currentGrade.toLowerCase().startsWith('chief')) {
    if (currentGrade.toLowerCase().startsWith('senior')) {
      return currentGrade.replace(/^senior\s+/i, 'Principal ');
    }
    return `Senior ${currentGrade}`;
  }
  return `Chief ${currentGrade}`;
}

/**
 * Helper to add N years to a date string YYYY-MM-DD
 */
export function addYearsToDateString(dateStr: string, yearsToAdd: number): string {
  if (!dateStr) return '2027-01-01';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parts[1];
    const day = parts[2];
    if (!isNaN(year)) {
      return `${year + yearsToAdd}-${month}-${day}`;
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    d.setFullYear(d.getFullYear() + yearsToAdd);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '2027-01-01';
}

/**
 * Core Staff Promotion Calculation Engine:
 * - First promotion: Exactly 3 years after first appointment (firstAppointmentDate or joinDate)
 * - Subsequent promotions: Exactly 5 years from current/last promotion (lastPromotionDate)
 */
export function calculateEmployeePromotion(
  emp: Employee,
  currentAnchorDateStr: string = '2026-08-14'
): PromotionCalculationResult {
  const currentAnchor = new Date(currentAnchorDateStr);
  const currentYear = currentAnchor.getFullYear(); // 2026
  const subsequentYear = currentYear + 1; // 2027

  // 1. Resolve first appointment date
  const firstAppointmentDate = emp.firstAppointmentDate || emp.joinDate || '2021-01-15';
  const firstAppDateObj = new Date(firstAppointmentDate);

  // 2. Resolve grade
  const grade = emp.grade || emp.jobTitle || 'Clinical Staff Officer';

  // 3. Determine if employee had prior promotion
  const hasHadPromotion = Boolean(emp.lastPromotionDate || (emp.promotionHistory && emp.promotionHistory.length > 0));
  const lastPromotionDate = emp.lastPromotionDate || (emp.promotionHistory && emp.promotionHistory.length > 0 ? emp.promotionHistory[0].promotionDate : null);

  let nextPromotionDueDate: string;
  let promotionType: 'First Promotion' | 'Subsequent Promotion';
  let requiredYears: number;

  if (!hasHadPromotion || !lastPromotionDate) {
    // FIRST PROMOTION: 3 years after first appointment
    requiredYears = 3;
    promotionType = 'First Promotion';
    nextPromotionDueDate = addYearsToDateString(firstAppointmentDate, 3);
  } else {
    // SUBSEQUENT PROMOTIONS: 5 years from current promotion
    requiredYears = 5;
    promotionType = 'Subsequent Promotion';
    nextPromotionDueDate = addYearsToDateString(lastPromotionDate, 5);
  }

  const nextDueDateObj = new Date(nextPromotionDueDate);
  const nextPromotionDueYear = nextDueDateObj.getFullYear();

  // Calculate years of service and years in current grade
  const totalServiceDays = Math.max(0, (currentAnchor.getTime() - firstAppDateObj.getTime()) / (1000 * 60 * 60 * 24));
  const yearsOfService = Number((totalServiceDays / 365.25).toFixed(1));

  const baseGradeDate = lastPromotionDate ? new Date(lastPromotionDate) : firstAppDateObj;
  const gradeDays = Math.max(0, (currentAnchor.getTime() - baseGradeDate.getTime()) / (1000 * 60 * 60 * 24));
  const yearsInCurrentGrade = Number((gradeDays / 365.25).toFixed(1));

  // Determine eligibility status
  const isDueInSubsequentYear = nextPromotionDueYear === subsequentYear;
  const isDueThisYear = nextPromotionDueYear === currentYear;
  const isOverdue = nextDueDateObj < currentAnchor && nextPromotionDueYear <= currentYear;

  let eligibilityStatus: PromotionCalculationResult['eligibilityStatus'] = 'Future Due';

  if (isOverdue) {
    eligibilityStatus = 'Overdue for Promotion';
  } else if (isDueThisYear) {
    eligibilityStatus = 'Due This Year (2026)';
  } else if (isDueInSubsequentYear) {
    eligibilityStatus = 'Due in Subsequent Year (2027)';
  } else if (yearsInCurrentGrade < 1) {
    eligibilityStatus = 'Recently Promoted';
  } else {
    eligibilityStatus = 'Future Due';
  }

  const suggestedNextGrade = getNextGradeRecommendation(grade, emp.department);

  return {
    employee: emp,
    empCode: emp.empCode,
    name: `${emp.firstName} ${emp.lastName}`,
    grade,
    department: emp.department,
    unit: emp.unit,
    firstAppointmentDate,
    lastPromotionDate,
    nextPromotionDueDate,
    nextPromotionDueYear,
    promotionType,
    requiredYears,
    yearsOfService,
    yearsInCurrentGrade,
    isDueInSubsequentYear,
    isDueThisYear,
    isOverdue,
    eligibilityStatus,
    suggestedNextGrade,
    salaryStepMultiplier: 1.15, // 15% standard grade increment
  };
}
