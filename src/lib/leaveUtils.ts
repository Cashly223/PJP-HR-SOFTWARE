import { LeaveRequest } from '../types/hrms';

export function isMaternityLeave(leaveType: string): boolean {
  return (leaveType || '').toLowerCase().includes('maternity');
}

/**
 * Safely parses a YYYY-MM-DD string into year, month, day components to avoid UTC/timezone offsets.
 */
export function parseDateParts(dateStr: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;
  return { year: parts[0], month: parts[1], day: parts[2] };
}

/**
 * Formats a Date object to YYYY-MM-DD string using local calendar numbers.
 */
export function formatDateParts(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calculates the Official Resumption Date (+1 Day of Leave End Date).
 * Standard HR / Hospital Rule: Date of return to duty is strictly +1 calendar day after the leave end date.
 * E.g., Leave End Date 2026-08-31 -> Resumption Date 2026-09-01.
 */
export function calculateResumptionDate(endDateStr: string): string {
  if (!endDateStr) return '';
  const parts = parseDateParts(endDateStr);
  if (!parts) return endDateStr;
  const d = new Date(parts.year, parts.month - 1, parts.day);
  d.setDate(d.getDate() + 1);
  return formatDateParts(d);
}

/**
 * Inverse calculation: Given a chosen Resumption Date, computes the Leave End Date (-1 Day).
 * E.g., Resumption Date 2026-09-01 -> Leave End Date 2026-08-31.
 */
export function calculateLeaveEndDateFromResumptionDate(resumptionDateStr: string): string {
  if (!resumptionDateStr) return '';
  const parts = parseDateParts(resumptionDateStr);
  if (!parts) return resumptionDateStr;
  const d = new Date(parts.year, parts.month - 1, parts.day);
  d.setDate(d.getDate() - 1);
  return formatDateParts(d);
}

/**
 * Formats leave days for clear display on official leave forms and reports.
 * - Non-Maternity (Annual, Sick, Casual, etc.): e.g. "4 Working Days"
 * - Maternity Leave: e.g. "90 Days" or "90 Days (Inc. Weekends)"
 */
export function formatLeaveDaysText(
  numDays: number | undefined | null,
  leaveType: string,
  options?: { showCalendarLabel?: boolean }
): string {
  const count = numDays ?? 0;
  if (isMaternityLeave(leaveType)) {
    return options?.showCalendarLabel ? `${count} Days (Inc. Weekends)` : `${count} Days`;
  }
  return `${count} Working Days`;
}

/**
 * Calculates leave days.
 * - Maternity Leave: Total calendar days inclusive (including weekends).
 * - All Other Leaves: Total WORKING DAYS inclusive (Monday-Friday, excluding Saturdays & Sundays).
 */
export function calculateLeaveDays(startDateStr: string, endDateStr: string, leaveType: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const startParts = parseDateParts(startDateStr);
  const endParts = parseDateParts(endDateStr);
  if (!startParts || !endParts) return 1;

  const start = new Date(startParts.year, startParts.month - 1, startParts.day);
  const end = new Date(endParts.year, endParts.month - 1, endParts.day);
  if (end < start) return 1;

  if (isMaternityLeave(leaveType)) {
    // Total calendar days inclusive
    const diffMs = end.getTime() - start.getTime();
    const calDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, calDays);
  }

  // Working days inclusive (Excluding Saturday [6] and Sunday [0])
  let workingDays = 0;
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return Math.max(1, workingDays);
}

/**
 * Calculate target end date based on start date, number of requested days, and leave type.
 * - Maternity Leave: Adds calendar days (inclusive).
 * - All Other Leaves: Adds working days (skipping Sat & Sun).
 */
export function calculateEndDateFromDays(startDateStr: string, numDays: number, leaveType: string): string {
  if (!startDateStr || numDays <= 0) return startDateStr;
  const startParts = parseDateParts(startDateStr);
  if (!startParts) return startDateStr;

  const start = new Date(startParts.year, startParts.month - 1, startParts.day);
  const current = new Date(start);

  if (isMaternityLeave(leaveType)) {
    // Calendar days (inclusive: end date = start + numDays - 1)
    current.setDate(current.getDate() + (numDays - 1));
    return formatDateParts(current);
  }

  // Working days (inclusive)
  // If start falls on a weekend, advance to next Monday first
  while (current.getDay() === 0 || current.getDay() === 6) {
    current.setDate(current.getDate() + 1);
  }

  let addedDays = 1;
  // Add working days until we reach target numDays
  while (addedDays < numDays) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return formatDateParts(current);
}

/**
 * Statutory Public Holidays Registry (Ghana & Healthcare Sector Standards)
 */
export interface PublicHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  description?: string;
}

export const STATUTORY_PUBLIC_HOLIDAYS: PublicHoliday[] = [
  // 2024
  { date: '2024-01-01', name: "New Year's Day" },
  { date: '2024-01-07', name: 'Constitution Day' },
  { date: '2024-01-08', name: 'Constitution Day (Observed)' },
  { date: '2024-03-06', name: 'Independence Day' },
  { date: '2024-03-29', name: 'Good Friday' },
  { date: '2024-04-01', name: 'Easter Monday' },
  { date: '2024-04-11', name: 'Eid-ul-Fitr' },
  { date: '2024-05-01', name: 'May Day / Workers’ Day' },
  { date: '2024-05-25', name: 'Africa Union Day' },
  { date: '2024-06-17', name: 'Eid-ul-Adha' },
  { date: '2024-08-04', name: "Founders' Day" },
  { date: '2024-08-05', name: "Founders' Day (Observed)" },
  { date: '2024-09-21', name: 'Kwame Nkrumah Memorial Day' },
  { date: '2024-09-23', name: 'Kwame Nkrumah Memorial Day (Observed)' },
  { date: '2024-12-06', name: "Farmers' Day" },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: 'Boxing Day' },

  // 2025
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-01-07', name: 'Constitution Day' },
  { date: '2025-03-06', name: 'Independence Day' },
  { date: '2025-03-31', name: 'Eid-ul-Fitr' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: 'May Day / Workers’ Day' },
  { date: '2025-05-25', name: 'Africa Union Day' },
  { date: '2025-05-26', name: 'Africa Union Day (Observed)' },
  { date: '2025-06-06', name: 'Eid-ul-Adha' },
  { date: '2025-08-04', name: "Founders' Day" },
  { date: '2025-09-21', name: 'Kwame Nkrumah Memorial Day' },
  { date: '2025-09-22', name: 'Kwame Nkrumah Memorial Day (Observed)' },
  { date: '2025-12-05', name: "Farmers' Day" },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' },

  // 2026
  { date: '2026-01-01', name: "New Year's Day" },
  { date: '2026-01-07', name: 'Constitution Day' },
  { date: '2026-03-06', name: 'Independence Day' },
  { date: '2026-03-20', name: 'Eid-ul-Fitr' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-04-06', name: 'Easter Monday' },
  { date: '2026-05-01', name: 'May Day / Workers’ Day' },
  { date: '2026-05-25', name: 'Africa Union Day' },
  { date: '2026-05-27', name: 'Eid-ul-Adha' },
  { date: '2026-07-01', name: 'Republic Day' },
  { date: '2026-08-04', name: "Founders' Day" },
  { date: '2026-09-21', name: 'Kwame Nkrumah Memorial Day' },
  { date: '2026-12-04', name: "National Farmers' Day" },
  { date: '2026-12-25', name: 'Christmas Day' },
  { date: '2026-12-26', name: 'Boxing Day' },
  { date: '2026-12-28', name: 'Boxing Day (Observed)' },

  // 2027
  { date: '2027-01-01', name: "New Year's Day" },
  { date: '2027-01-07', name: 'Constitution Day' },
  { date: '2027-03-06', name: 'Independence Day' },
  { date: '2027-03-10', name: 'Eid-ul-Fitr' },
  { date: '2027-03-26', name: 'Good Friday' },
  { date: '2027-03-29', name: 'Easter Monday' },
  { date: '2027-05-01', name: 'May Day / Workers’ Day' },
  { date: '2027-05-17', name: 'Eid-ul-Adha' },
  { date: '2027-05-25', name: 'Africa Union Day' },
  { date: '2027-08-04', name: "Founders' Day" },
  { date: '2027-09-21', name: 'Kwame Nkrumah Memorial Day' },
  { date: '2027-12-03', name: "National Farmers' Day" },
  { date: '2027-12-25', name: 'Christmas Day' },
  { date: '2027-12-26', name: 'Boxing Day' },
  { date: '2027-12-27', name: 'Christmas (Observed)' },
  { date: '2027-12-28', name: 'Boxing Day (Observed)' },
];

/**
 * Finds all statutory public holidays that fall between startDate and endDate.
 */
export function getPublicHolidaysInRange(
  startDateStr: string,
  endDateStr: string,
  customHolidays: PublicHoliday[] = []
): (PublicHoliday & { dayOfWeek: string; isWeekday: boolean })[] {
  if (!startDateStr || !endDateStr) return [];
  const startParts = parseDateParts(startDateStr);
  const endParts = parseDateParts(endDateStr);
  if (!startParts || !endParts) return [];

  const start = new Date(startParts.year, startParts.month - 1, startParts.day);
  const end = new Date(endParts.year, endParts.month - 1, endParts.day);
  if (end < start) return [];

  const allHolidays = [...STATUTORY_PUBLIC_HOLIDAYS, ...customHolidays];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const matched: (PublicHoliday & { dayOfWeek: string; isWeekday: boolean })[] = [];
  const seenDates = new Set<string>();

  for (const h of allHolidays) {
    if (seenDates.has(h.date)) continue;
    const hParts = parseDateParts(h.date);
    if (!hParts) continue;
    const hDate = new Date(hParts.year, hParts.month - 1, hParts.day);

    if (hDate >= start && hDate <= end) {
      seenDates.add(h.date);
      const dow = hDate.getDay();
      matched.push({
        ...h,
        dayOfWeek: dayNames[dow],
        isWeekday: dow !== 0 && dow !== 6,
      });
    }
  }

  return matched.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Automatically calculates how many public holiday working days fall inside the leave
 * and computes the adjusted End Date & Resumption Date.
 */
export function calculateHolidayAdjustedEndDate(
  startDateStr: string,
  targetWorkingDays: number,
  leaveType: string,
  holidayDatesToCompensate: string[] = []
): {
  newEndDate: string;
  newResumptionDate: string;
  totalHolidaysCount: number;
  holidaysList: PublicHoliday[];
} {
  if (!startDateStr || targetWorkingDays <= 0) {
    return {
      newEndDate: startDateStr,
      newResumptionDate: calculateResumptionDate(startDateStr),
      totalHolidaysCount: 0,
      holidaysList: [],
    };
  }

  // If maternity, calendar days apply
  if (isMaternityLeave(leaveType)) {
    const startParts = parseDateParts(startDateStr)!;
    const current = new Date(startParts.year, startParts.month - 1, startParts.day);
    current.setDate(current.getDate() + (targetWorkingDays - 1));
    const endStr = formatDateParts(current);
    return {
      newEndDate: endStr,
      newResumptionDate: calculateResumptionDate(endStr),
      totalHolidaysCount: 0,
      holidaysList: [],
    };
  }

  const holidaySet = new Set(
    holidayDatesToCompensate.length > 0
      ? holidayDatesToCompensate
      : STATUTORY_PUBLIC_HOLIDAYS.map((h) => h.date)
  );

  const startParts = parseDateParts(startDateStr)!;
  const current = new Date(startParts.year, startParts.month - 1, startParts.day);

  // Skip weekends if start is on weekend
  while (current.getDay() === 0 || current.getDay() === 6) {
    current.setDate(current.getDate() + 1);
  }

  let earnedDaysCounted = 0;
  const matchedHolidays: PublicHoliday[] = [];

  while (earnedDaysCounted < targetWorkingDays) {
    const dateStr = formatDateParts(current);
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (!isWeekend) {
      if (holidaySet.has(dateStr)) {
        // This is a public holiday on a weekday! It does NOT consume an annual leave day.
        const foundHoliday = STATUTORY_PUBLIC_HOLIDAYS.find((h) => h.date === dateStr) || {
          date: dateStr,
          name: 'Statutory Public Holiday',
        };
        matchedHolidays.push(foundHoliday);
      } else {
        earnedDaysCounted++;
      }
    }

    if (earnedDaysCounted < targetWorkingDays) {
      current.setDate(current.getDate() + 1);
    }
  }

  const newEndDate = formatDateParts(current);
  const newResumptionDate = calculateResumptionDate(newEndDate);

  return {
    newEndDate,
    newResumptionDate,
    totalHolidaysCount: matchedHolidays.length,
    holidaysList: matchedHolidays,
  };
}

/**
 * Standard HR remarks template generator for public holiday leave adjustments.
 */
export function generateHolidayAdjustmentRemarks(
  employeeName: string,
  originalEndDate: string,
  newEndDate: string,
  holidayNames: string[],
  extraNotes?: string
): string {
  const holidayText =
    holidayNames.length > 0
      ? `statutory public holiday(s): ${holidayNames.join(', ')}`
      : 'statutory public holidays affecting working days';

  let remark = `HR End Date Adjustment: Leave extended from ${originalEndDate} to ${newEndDate} to compensate for ${holidayText} falling within the approved leave period. Official resumption date is ${calculateResumptionDate(
    newEndDate
  )}.`;

  if (extraNotes && extraNotes.trim()) {
    remark += ` HR Remarks: ${extraNotes.trim()}`;
  }

  return remark;
}

/**
 * Helper to update/recalculate all existing leave applications to ensure
 * totalDays is accurately computed using working days (or calendar days for maternity)
 * and dateOfResumption is correctly set to endDate + 1 Day.
 */
export function updateAllLeaveApplicationsWithWorkingDays(leavesList: LeaveRequest[]): LeaveRequest[] {
  return leavesList.map((l) => {
    const recalculated = calculateLeaveDays(l.startDate, l.endDate, l.leaveType);
    return {
      ...l,
      totalDays: recalculated,
      daysGranted: l.daysGranted ? calculateLeaveDays(l.startDate, l.endDate, l.leaveType) : l.daysGranted,
      dateOfResumption: l.dateOfResumption || calculateResumptionDate(l.endDate),
    };
  });
}


