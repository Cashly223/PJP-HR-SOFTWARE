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

