import { Pipe, PipeTransform } from '@angular/core';
import { DateFormattingService } from '../services/date-formatting/date-formatting.service';

@Pipe({
  name: 'consistentDate',
  standalone: true
})
export class ConsistentDatePipe implements PipeTransform {
  constructor(private dateFormattingService: DateFormattingService) {}

  transform(value: Date | string | null, format: 'display' | 'iso' | 'dateTime' | 'timeShort' | 'timeFull' | 'table' | 'input' = 'display'): string {
    if (!value) {
      return '';
    }

    switch (format) {
      case 'display':
        return this.dateFormattingService.formatDateDisplay(value);
      case 'iso':
        return this.dateFormattingService.formatDateISO(value);
      case 'dateTime':
        return this.dateFormattingService.formatDateTimeDisplay(value);
      case 'timeShort':
        return this.dateFormattingService.formatTimeShort(value);
      case 'timeFull':
        return this.dateFormattingService.formatTimeFull(value);
      case 'table':
        return this.dateFormattingService.formatTableDate(value);
      case 'input':
        return this.dateFormattingService.formatInputDate(value);
      default:
        return this.dateFormattingService.formatDateDisplay(value);
    }
  }
}
