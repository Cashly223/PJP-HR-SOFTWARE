import { LeaveRequest } from '../types/hrms';

export function isMaternityLeave(leaveType: string): boolean {
  return (leaveType || '').toLowerCase().includes('maternity');
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
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return 1;

  if (isMaternityLeave(leaveType)) {
    // Total calendar days inclusive
    const diffMs = end.getTime() - start.getTime();
    const calDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
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
 * - Maternity Leave: Adds calendar days.
 * - All Other Leaves: Adds working days (skipping Sat & Sun).
 */
export function calculateEndDateFromDays(startDateStr: string, numDays: number, leaveType: string): string {
  if (!startDateStr || numDays <= 0) return startDateStr;
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return startDateStr;

  const current = new Date(start);

  if (isMaternityLeave(leaveType)) {
    // Calendar days (inclusive: end date = start + numDays - 1)
    current.setDate(current.getDate() + (numDays - 1));
    return current.toISOString().split('T')[0];
  }

  // Working days (inclusive)
  let addedDays = 0;

  // If start falls on a weekend, advance to next Monday first
  while (current.getDay() === 0 || current.getDay() === 6) {
    current.setDate(current.getDate() + 1);
  }

  // Add working days until we reach target numDays
  while (addedDays < numDays - 1) {
    current.setDate(current.getDate() + 1);
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return current.toISOString().split('T')[0];
}

/**
 * Helper to update/recalculate all existing leave applications to ensure
 * totalDays is accurately computed using working days (or calendar days for maternity).
 */
export function updateAllLeaveApplicationsWithWorkingDays(leavesList: LeaveRequest[]): LeaveRequest[] {
  return leavesList.map((l) => {
    const recalculated = calculateLeaveDays(l.startDate, l.endDate, l.leaveType);
    return {
      ...l,
      totalDays: recalculated,
      daysGranted: l.daysGranted ? calculateLeaveDays(l.startDate, l.endDate, l.leaveType) : l.daysGranted,
    };
  });
}
