import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

export interface DateFormatConfig {
  dateOnly: string;
  dateTime: string;
  timeOnly: string;
  shortTime: string;
  longDate: string;
  shortDate: string;
  isoDate: string;
  isoDateTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class DateFormattingService {
  private datePipe = new DatePipe('en-US');

  private readonly formats: DateFormatConfig = {
    dateOnly: 'yyyy-MM-dd',
    dateTime: 'yyyy-MM-dd HH:mm:ss',
    timeOnly: 'HH:mm:ss',
    shortTime: 'HH:mm',
    longDate: 'EEEE, MMMM d, yyyy',
    shortDate: 'MMM d, yyyy',
    isoDate: 'yyyy-MM-dd',
    isoDateTime: "yyyy-MM-dd'T'HH:mm:ss"
  };

  formatDateDisplay(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.shortDate) || '';
  }


  formatDateISO(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.isoDate) || '';
  }


  formatDateTimeDisplay(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.dateTime) || '';
  }

  formatDateTimeISO(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.isoDateTime) || '';
  }


  formatTimeShort(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.shortTime) || '';
  }

  formatTimeFull(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.timeOnly) || '';
  }

  formatTableDate(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.shortDate) || '';
  }


  formatInputDate(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    return this.datePipe.transform(parsedDate, this.formats.isoDate) || '';
  }

  getCurrentDateISO(): string {
    return this.formatDateISO(new Date());
  }

  getCurrentDateTimeISO(): string {
    return this.formatDateTimeISO(new Date());
  }

  isToday(date: Date | string): boolean {
    const today = new Date();
    const checkDate = this.parseDate(date);
    return this.formatDateISO(today) === this.formatDateISO(checkDate);
  }

  getFormats(): DateFormatConfig {
    return { ...this.formats };
  }

  private safeParseDateString(dateString: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateString);
  }

  private parseDate(date: Date | string): Date {
    if (typeof date === 'string') {
      return this.safeParseDateString(date);
    }
    return date;
  }

  formatForDateInput(date: Date | string | null): string {
    if (!date) {
      return '';
    }
    const parsedDate = this.parseDate(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  fromDateInput(dateInputValue: string): Date | null {
    if (!dateInputValue) {
      return null;
    }
    return this.safeParseDateString(dateInputValue);
  }
}
