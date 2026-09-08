import { Employee, StaffRosterRow, ShiftRoster } from '../types/hrms';

export const MONTH_NAMES = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
] as const;

export interface MonthOption {
  value: string;
  label: string;
  index: number;
  shortName: string;
  defaultDays: number;
}

export const MONTH_OPTIONS: MonthOption[] = [
  { value: 'JANUARY', label: 'January', index: 0, shortName: 'Jan', defaultDays: 31 },
  { value: 'FEBRUARY', label: 'February', index: 1, shortName: 'Feb', defaultDays: 28 },
  { value: 'MARCH', label: 'March', index: 2, shortName: 'Mar', defaultDays: 31 },
  { value: 'APRIL', label: 'April', index: 3, shortName: 'Apr', defaultDays: 30 },
  { value: 'MAY', label: 'May', index: 4, shortName: 'May', defaultDays: 31 },
  { value: 'JUNE', label: 'June', index: 5, shortName: 'Jun', defaultDays: 30 },
  { value: 'JULY', label: 'July', index: 6, shortName: 'Jul', defaultDays: 31 },
  { value: 'AUGUST', label: 'August', index: 7, shortName: 'Aug', defaultDays: 31 },
  { value: 'SEPTEMBER', label: 'September', index: 8, shortName: 'Sep', defaultDays: 30 },
  { value: 'OCTOBER', label: 'October', index: 9, shortName: 'Oct', defaultDays: 31 },
  { value: 'NOVEMBER', label: 'November', index: 10, shortName: 'Nov', defaultDays: 30 },
  { value: 'DECEMBER', label: 'December', index: 11, shortName: 'Dec', defaultDays: 31 },
];

/**
 * Returns the 0-based month index (0 = January, 11 = December) for any month string format.
 */
export const getMonthIndex = (monthStr?: string): number => {
  if (!monthStr) return 0;
  const clean = monthStr.trim().toUpperCase();
  const idx = MONTH_NAMES.indexOf(clean as any);
  if (idx !== -1) return idx;

  const prefixMatch = MONTH_NAMES.findIndex((m) => clean.startsWith(m.substring(0, 3)));
  return prefixMatch !== -1 ? prefixMatch : 0;
};

/**
 * Accurately calculates the exact number of days for any month and year (including leap years)
 */
export const getDaysInMonth = (monthStr?: string, year?: number): number => {
  const mIndex = getMonthIndex(monthStr);
  const safeYear = year && !isNaN(year) && year > 1900 ? year : new Date().getFullYear();
  return new Date(safeYear, mIndex + 1, 0).getDate();
};

export interface CalendarDayInfo {
  day: number;
  dayNumber: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  dayName: string;
  initial: string;
  isWeekend: boolean;
  dateStr: string;
  shortDate: string;
  displayDate: string;
  fullFormattedDate: string;
}

/**
 * Generates the full day-by-day calendar data for a specified month & year
 */
export const getMonthCalendarDays = (monthStr?: string, year?: number): CalendarDayInfo[] => {
  const mIndex = getMonthIndex(monthStr);
  const safeYear = year && !isNaN(year) && year > 1900 ? year : new Date().getFullYear();
  const totalDays = new Date(safeYear, mIndex + 1, 0).getDate();

  const initials = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];
  const fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curMonthAbbr = monthNames[mIndex] || 'M';

  return Array.from({ length: totalDays }, (_, i) => {
    const day = i + 1;
    const date = new Date(safeYear, mIndex, day);
    const dayOfWeek = date.getDay();
    const mm = String(mIndex + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return {
      day,
      dayNumber: day,
      dayOfWeek,
      dayName: fullNames[dayOfWeek],
      initial: initials[dayOfWeek],
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      dateStr: `${safeYear}-${mm}-${dd}`,
      shortDate: `${dd}/${mm}`,
      displayDate: `${day} ${curMonthAbbr}`,
      fullFormattedDate: `${fullNames[dayOfWeek]}, ${day} ${monthNames[mIndex]} ${safeYear}`,
    };
  });
};

/**
 * Intelligent Department Staff Matcher
 * Accurately determines if an employee belongs to the target department,
 * handling variations like "Intensive Care Unit (ICU)" vs "ICU", abbreviations,
 * and clinical specialties.
 */
export const isStaffInDepartment = (empDeptRaw?: string, targetDeptRaw?: string): boolean => {
  if (!empDeptRaw || !targetDeptRaw) return false;
  const d1 = empDeptRaw.trim().toLowerCase();
  const d2 = targetDeptRaw.trim().toLowerCase();

  // 1. Direct or substring match
  if (d1 === d2 || d1.includes(d2) || d2.includes(d1)) {
    return true;
  }

  // 2. Acronym/shorthand checks
  const isIcu = (s: string) => s.includes('icu') || s.includes('intensive care') || s.includes('critical care');
  if (isIcu(d1) && isIcu(d2)) return true;

  const isEmergency = (s: string) => s.includes('emergency') || s.includes('trauma') || s.includes('casualty');
  if (isEmergency(d1) && isEmergency(d2)) return true;

  const isSurgery = (s: string) => s.includes('surg') || s.includes('theater') || s.includes('theatre') || s.includes('operating room') || s.includes('or');
  if (isSurgery(d1) && isSurgery(d2)) return true;

  const isPediatrics = (s: string) => s.includes('pediatric') || s.includes('paediatric') || s.includes('neonatal') || s.includes('nicu');
  if (isPediatrics(d1) && isPediatrics(d2)) return true;

  const isCardio = (s: string) => s.includes('cardio') || s.includes('cardiac');
  if (isCardio(d1) && isCardio(d2)) return true;

  const isMaternity = (s: string) => s.includes('matern') || s.includes('obstetric') || s.includes('labour') || s.includes('labor') || s.includes('gynae');
  if (isMaternity(d1) && isMaternity(d2)) return true;

  const isInternal = (s: string) => s.includes('internal medicine') || s.includes('general medical');
  if (isInternal(d1) && isInternal(d2)) return true;

  const isPharmacy = (s: string) => s.includes('pharm') || s.includes('dispensary');
  if (isPharmacy(d1) && isPharmacy(d2)) return true;

  const isRadiology = (s: string) => s.includes('radio') || s.includes('imaging') || s.includes('x-ray') || s.includes('mri');
  if (isRadiology(d1) && isRadiology(d2)) return true;

  const isAdmin = (s: string) => s.includes('admin') || s.includes('executive') || s.includes('management');
  if (isAdmin(d1) && isAdmin(d2)) return true;

  const isHr = (s: string) => s.includes('human resource') || s.includes('hr') || s.includes('personnel');
  if (isHr(d1) && isHr(d2)) return true;

  // 3. Significant word token match
  const cleanTokens = (s: string) =>
    s
      .replace(/\b(unit|dept|department|services|service|ward|wards|centre|center|directorate|the|and|of|in|for)\b/gi, '')
      .replace(/[^a-z0-9]/gi, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length >= 3);

  const t1 = cleanTokens(d1);
  const t2 = cleanTokens(d2);

  return t1.some((word1) => t2.some((word2) => word1 === word2 || word1.startsWith(word2) || word2.startsWith(word1)));
};

/**
 * Retrieves all active employees registered for a target department
 */
export const getDepartmentStaff = (employees: Employee[], department: string): Employee[] => {
  return (employees || []).filter((e) => {
    if (!e) return false;
    return isStaffInDepartment(e.department || e.currentDepartment, department);
  });
};

/**
 * Automatically transfers departmental staff into the standard 30-staff duty roster grid.
 * - If department has no registered staff: inserts 1 row with "No staff name" (rank "N/A", off-duty) and 29 blanks.
 * - If department has registered staff: transfers all employees into rows, retaining existing customized shifts
 *   if the staff member was already present on the grid, or initializing balanced rotating shifts (M/A/N/O)
 *   for newly transferred staff.
 */
export const transferDepartmentStaffToRosterGrid = (
  targetDept: string,
  employees: Employee[],
  existingGrid?: StaffRosterRow[],
  daysCount: number = 30
): StaffRosterRow[] => {
  const deptStaff = getDepartmentStaff(employees, targetDept);
  const safeDays = Math.max(28, Math.min(31, daysCount || 30));

  // Case 1: Department has NO registered staff
  if (deptStaff.length === 0) {
    const emptyRow1: StaffRosterRow = {
      id: '1',
      name: 'No staff name',
      phone: '',
      rank: 'N/A',
      shifts: Array(safeDays).fill('O'),
    };
    const remainingRows: StaffRosterRow[] = Array.from({ length: 29 }, (_, idx) => ({
      id: String(idx + 2),
      name: '',
      phone: '',
      rank: '',
      shifts: Array(safeDays).fill('O'),
    }));
    return [emptyRow1, ...remainingRows];
  }

  // Standard rotating shift cycle
  const pattern = ['M', 'M', 'A', 'A', 'N', 'O', 'O'];

  // Map of existing staff by normalized name and phone
  const existingMap = new Map<string, StaffRosterRow>();
  if (existingGrid && existingGrid.length > 0) {
    existingGrid.forEach((row) => {
      if (row.name && row.name.trim() && row.name !== 'No staff name') {
        existingMap.set(row.name.trim().toLowerCase(), row);
        if (row.phone) {
          existingMap.set(row.phone.replace(/\D/g, ''), row);
        }
      }
    });
  }

  // Populate rows with transferred departmental employees (up to 30)
  const filledRows: StaffRosterRow[] = deptStaff.slice(0, 30).map((emp, idx) => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || (emp as any).name || `Staff ${idx + 1}`;
    const cleanName = fullName.toLowerCase();
    const cleanPhone = (emp.phone || '').replace(/\D/g, '');

    const existingMatch = existingMap.get(cleanName) || (cleanPhone ? existingMap.get(cleanPhone) : undefined);

    let shifts: string[];
    if (existingMatch && existingMatch.shifts && existingMatch.shifts.length > 0 && existingMatch.shifts.some((s) => s !== 'O')) {
      // Retain previously customized shifts for existing staff, adapting to target daysCount
      if (existingMatch.shifts.length === safeDays) {
        shifts = [...existingMatch.shifts];
      } else if (existingMatch.shifts.length > safeDays) {
        shifts = existingMatch.shifts.slice(0, safeDays);
      } else {
        const diff = safeDays - existingMatch.shifts.length;
        const offset = (existingMatch.shifts.length + idx) % 7;
        const extension = Array.from({ length: diff }, (_, d) => pattern[(d + offset) % 7]);
        shifts = [...existingMatch.shifts, ...extension];
      }
    } else {
      // Allocate fresh balanced rotating shift sequence for the month's days
      const offset = idx % 7;
      shifts = Array.from({ length: safeDays }, (_, d) => pattern[(d + offset) % 7]);
    }

    return {
      id: String(idx + 1),
      name: fullName,
      phone: emp.phone || '',
      rank: emp.jobTitle || emp.grade || 'Staff',
      shifts,
      mechanisationStatus: existingMatch?.mechanisationStatus || emp.mechanisationStatus || (emp.employmentType === 'Contract' || (emp.employmentType as any) === 'Locum' ? 'Non-Mechanised' : 'Mechanised'),
    };
  });

  // Pad remainder up to 30 rows
  const remainingCount = Math.max(0, 30 - filledRows.length);
  const paddedRows: StaffRosterRow[] = Array.from({ length: remainingCount }, (_, idx) => ({
    id: String(filledRows.length + idx + 1),
    name: '',
    phone: '',
    rank: '',
    shifts: Array(safeDays).fill('O'),
  }));

  return [...filledRows, ...paddedRows];
};

/**
 * Automatically transfers departmental staff into active shift rosters (daily/weekly shift assignments)
 */
export const transferDepartmentStaffToActiveShifts = (
  targetDept: string,
  employees: Employee[],
  currentDateStr: string = new Date().toISOString().split('T')[0],
  defaultWard?: string
): ShiftRoster[] => {
  const deptStaff = getDepartmentStaff(employees, targetDept);
  const shiftTypes: Array<ShiftRoster['shiftType']> = [
    'Morning (07:00-15:00)',
    'Evening (15:00-23:00)',
    'Night ICU (23:00-07:00)',
    '12h Emergency (07:00-19:00)',
    'On-Call 24h',
  ];

  return deptStaff.map((emp, idx) => {
    const shift = shiftTypes[idx % shiftTypes.length];
    let startTime = '07:00';
    let endTime = '15:00';

    if (shift.includes('15:00')) {
      startTime = '15:00';
      endTime = '23:00';
    } else if (shift.includes('23:00')) {
      startTime = '23:00';
      endTime = '07:00';
    } else if (shift.includes('12h')) {
      startTime = '07:00';
      endTime = '19:00';
    } else if (shift.includes('On-Call')) {
      startTime = '00:00';
      endTime = '23:59';
    }

    const wardName = defaultWard || `${targetDept} Bay ${String.fromCharCode(65 + (idx % 4))}`;

    return {
      id: `auto-shift-${emp.id}-${Date.now()}-${idx}`,
      hospitalId: emp.hospitalId || 'hosp-1',
      employeeId: emp.id,
      employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || (emp as any).name || 'Staff Member',
      employeePhoto: emp.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      department: targetDept,
      role: emp.jobTitle || 'Clinical Staff',
      shiftType: shift,
      ward: wardName,
      date: currentDateStr,
      startTime,
      endTime,
      fatigueScore: Math.floor(15 + Math.random() * 30),
      status: 'Assigned',
    };
  });
};
