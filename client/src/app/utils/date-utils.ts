
import { DateFormattingService } from '../services/date-formatting/date-formatting.service';

export function calculateWorkingDays(startDate: Date, endDate: Date): number {
    const romanianHolidays = [
      '01-01',
      '01-02',
      '01-24',
      '05-01',
      '06-01',
      '08-15',
      '11-30',
      '12-01',
      '12-25',
      '12-26',
    ];
  
    let currentDate = new Date(startDate);
    let workingDays = 0;
  
    if (endDate < startDate) {
      return 0;
    }
  
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const monthDay = `${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !romanianHolidays.includes(monthDay)) {
        workingDays++;
      }
  
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return workingDays;
  }

/**
 * @deprecated Use DateFormattingService.formatDateISO() instead
 */
export function formatToISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * @deprecated Use DateFormattingService.formatDateTimeISO() instead
 */
export function formatToISODateTime(date: Date): string {
  return date.toISOString();
}