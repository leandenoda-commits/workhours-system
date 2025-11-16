function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export interface WorkRecord {
  work_date: string;
  clock_in: string;
  clock_out: string;
  break_start: string | null;
  break_end: string | null;
}

export interface CalculatedWorkHours {
  totalWorkMinutes: number;
  nightWorkMinutes: number;
  within8Hours: number;
  overtimeHours: number;
}

export function calculateTotalWorkMinutes(
  clockIn: string,
  clockOut: string,
  breakStart: string | null,
  breakEnd: string | null
): number {
  const clockInMin = timeStringToMinutes(clockIn);
  const clockOutMin = timeStringToMinutes(clockOut);

  let totalMinutes: number;

  if (clockOutMin >= clockInMin) {
    totalMinutes = clockOutMin - clockInMin;
  } else {
    totalMinutes = clockOutMin + 24 * 60 - clockInMin;
  }

  if (breakStart && breakEnd) {
    const breakStartMin = timeStringToMinutes(breakStart);
    const breakEndMin = timeStringToMinutes(breakEnd);

    let breakDuration: number;
    if (breakEndMin >= breakStartMin) {
      breakDuration = breakEndMin - breakStartMin;
    } else {
      breakDuration = breakEndMin + 24 * 60 - breakStartMin;
    }

    totalMinutes -= breakDuration;
  }

  return Math.max(0, totalMinutes);
}

export function calculateNightWorkMinutes(
  clockIn: string,
  clockOut: string,
  breakStart: string | null,
  breakEnd: string | null
): number {
  const clockInMin = timeStringToMinutes(clockIn);
  const clockOutMin = timeStringToMinutes(clockOut);
  const nightStart = 22 * 60;
  const nightEnd = 5 * 60;
  const dayMinutes = 24 * 60;

  function calculateNightOverlap(startMin: number, endMin: number): number {
    if (endMin < startMin) {
      endMin += dayMinutes;
    }

    let nightMinutes = 0;

    if (startMin < nightEnd) {
      nightMinutes += Math.min(endMin, nightEnd) - startMin;
    }

    if (endMin > nightStart) {
      nightMinutes += Math.min(endMin, dayMinutes + nightEnd) - Math.max(startMin, nightStart);
    }

    return Math.max(0, nightMinutes);
  }

  let nightMinutes = calculateNightOverlap(clockInMin, clockOutMin);

  if (breakStart && breakEnd) {
    const breakStartMin = timeStringToMinutes(breakStart);
    const breakEndMin = timeStringToMinutes(breakEnd);

    let breakNightMinutes = calculateNightOverlap(breakStartMin, breakEndMin);

    nightMinutes -= breakNightMinutes;
  }

  return Math.max(0, nightMinutes);
}

export function calculateWorkHours(record: WorkRecord): CalculatedWorkHours {
  const totalMinutes = calculateTotalWorkMinutes(
    record.clock_in,
    record.clock_out,
    record.break_start,
    record.break_end
  );

  const nightMinutes = calculateNightWorkMinutes(
    record.clock_in,
    record.clock_out,
    record.break_start,
    record.break_end
  );

  const within8Hours = Math.min(totalMinutes, 8 * 60);
  const overtime = Math.max(0, totalMinutes - 8 * 60);

  return {
    totalWorkMinutes: totalMinutes,
    nightWorkMinutes: nightMinutes,
    within8Hours: within8Hours,
    overtimeHours: overtime,
  };
}

export function minutesToDecimalHours(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

export function minutesToHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}
