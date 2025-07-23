import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './date-range-filter.component.html',
  styleUrls: ['./date-range-filter.component.scss']
})
export class DateRangeFilterComponent {
  @Input() title: string = 'Filter';
  @Input() startDate: Date | null = null;
  @Input() endDate: Date | null = null;
  
  @Output() startDateChange = new EventEmitter<Date | null>();
  @Output() endDateChange = new EventEmitter<Date | null>();
  @Output() filterApply = new EventEmitter<{ startDate: Date | null, endDate: Date | null }>();

  onStartDateChange(date: Date | null): void {
    this.startDate = date;
    this.startDateChange.emit(date);
  }

  onEndDateChange(date: Date | null): void {
    this.endDate = date;
    this.endDateChange.emit(date);
  }

  applyFilter(): void {
    this.filterApply.emit({
      startDate: this.startDate,
      endDate: this.endDate
    });
  }
}
