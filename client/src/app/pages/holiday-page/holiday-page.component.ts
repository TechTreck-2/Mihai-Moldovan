import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { GenericPopupComponent, PopupField } from '../../components/popup/popup/popup.component';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { HolidayService, Holiday } from '../../services/holiday/holiday.service';
import { calculateWorkingDays } from '../../utils/date-utils';
import { DateFormattingService } from '../../services/date-formatting/date-formatting.service';
import { DualViewContainerComponent } from '../../components/dual-view-container/dual-view-container.component';
import { DateRangeFilterComponent } from '../../components/date-range-filter/date-range-filter.component';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { EventInput, EventApi } from '@fullcalendar/core';

@Component({
  selector: 'app-holiday-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgFor,
    NgClass,
    DualViewContainerComponent,
    DateRangeFilterComponent
  ],
  templateUrl: './holiday-page.component.html',
  styleUrls: ['./holiday-page.component.scss'],
})
export class HolidayPageComponent implements OnInit {
  startDate: Date | null = null;
  endDate: Date | null = null;
  columns: string[] = ['startDate', 'endDate', 'holidayName', 'length'];
  holidayDays: { planned: boolean }[] = [];
  totalDays: number = 0;
  workingDays: number = 0;
  nonWorkingDays: number = 0;
  
  // Create observables for reactive data binding
  tableData$: Observable<(Holiday & { length: number })[]>;
  calendarEvents$ = new BehaviorSubject<EventInput[]>([]);
  
  // Keep a local copy for operations that need synchronous access
  private holidays: (Holiday & { length: number })[] = [];

  constructor(
    private notificationService: NotificationsService,
    private holidayService: HolidayService,
    private dialog: MatDialog,
    private dateFormattingService: DateFormattingService
  ) {
    // Initialize the table data observable
    this.tableData$ = this.holidayService.holidays$.pipe(
      map(holidays => holidays.map(holiday => ({
        ...holiday,
        length: calculateWorkingDays(new Date(holiday.startDate), new Date(holiday.endDate))
      })))
    );
  }

  ngOnInit() {
    // Subscribe to holidays for calendar events and local operations
    this.holidayService.holidays$.subscribe(holidays => {
      this.updateDayCalculations();
      this.holidays = holidays.map(holiday => ({
        ...holiday,
        length: calculateWorkingDays(new Date(holiday.startDate), new Date(holiday.endDate))
      }));
      this.initializeHolidayDays();
      
      // Update calendar events
      this.updateCalendarEvents(holidays);
    });
  }

  initializeHolidayDays(): void {
    const plannedCount = Math.min(
      this.holidays.reduce((total, holiday) => total + holiday.length, 0),
      21
    );
    this.holidayDays = Array.from({ length: 21 }, (_, i) => ({
      planned: i < plannedCount
    }));
  }

  applyFilter(dateRange?: { startDate: Date | null, endDate: Date | null }): void {
    if (dateRange) {
      this.startDate = dateRange.startDate || this.startDate;
      this.endDate = dateRange.endDate || this.endDate;
    }
    console.log('Filter applied with start date:', this.startDate, 'and end date:', this.endDate);
    this.updateDayCalculations();
    this.holidays = this.holidays.map(holiday => ({
      ...holiday,
      length: calculateWorkingDays(new Date(holiday.startDate), new Date(holiday.endDate))
    }));
  }

  onStartDateChange(date: Date | null): void {
    this.startDate = date;
  }

  onEndDateChange(date: Date | null): void {
    this.endDate = date;
  }

  updateDayCalculations(): void {
    if (!this.startDate || !this.endDate) {
      this.totalDays = 0;
      this.workingDays = 0;
      this.nonWorkingDays = 0;
      return;
    }
    
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    this.totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    this.workingDays = calculateWorkingDays(this.startDate, this.endDate);
    this.nonWorkingDays = this.totalDays - this.workingDays;
  }

  getPlannedDays(): number {
    return this.holidayDays.filter(day => day.planned).length;
  }

  getUnplannedDays(): number {
    return this.holidayDays.filter(day => !day.planned).length;
  }

  dateOrderValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) {
      return null;
    }
    const startDate = control.parent.get('startDate')?.value;
    const endDate = control.value;
    if (!startDate || !endDate) {
      return null;
    }
    const start = this.dateFormattingService.fromDateInput(startDate) || new Date(startDate);
    const end = this.dateFormattingService.fromDateInput(endDate) || new Date(endDate);
    return end <= start ? { endBeforeStart: true } : null;
  }

  openAddPopup(): void {
    const fields: PopupField[] = [
      { name: 'startDate', label: 'Start Date', type: 'date', validators: [Validators.required] },
      { 
        name: 'endDate', 
        label: 'End Date', 
        type: 'date', 
        validators: [Validators.required, this.dateOrderValidator] 
      },
      { name: 'holidayName', label: 'Holiday Name', type: 'text', validators: [Validators.required] },
    ];

    const dialogRef = this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: {
        fields: fields,
        values: { startDate: '', endDate: '', holidayName: '' },
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newHoliday: Omit<Holiday, 'id'> = {
          startDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.startDate) || new Date()),
          endDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.endDate) || new Date()),
          holidayName: result.holidayName,
        };
        this.holidayService.addHoliday(newHoliday);
      }
    });
  }

  openEditPopup(holiday: Holiday): void {
    const fields: PopupField[] = [
      { name: 'startDate', label: 'Start Date', type: 'date', validators: [Validators.required] },
      { 
        name: 'endDate', 
        label: 'End Date', 
        type: 'date', 
        validators: [Validators.required, this.dateOrderValidator] 
      },
      { name: 'holidayName', label: 'Holiday Name', type: 'text', validators: [Validators.required] },
    ];

    const formattedValues = {
      startDate: this.dateFormattingService.formatForDateInput(holiday.startDate),
      endDate: this.dateFormattingService.formatForDateInput(holiday.endDate),
      holidayName: holiday.holidayName
    };

    const dialogRef = this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: {
        fields: fields,
        values: formattedValues,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedHoliday: Holiday = {
          id: holiday.id,
          startDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.startDate) || new Date()),
          endDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.endDate) || new Date()),
          holidayName: result.holidayName,
        };
        this.holidayService.updateHoliday(updatedHoliday);
      }
    });
  }

  deleteRequest(holiday: Holiday): void {
    this.holidayService.deleteHoliday(holiday.id);
  }

  private formatDate(date: Date): string {
    return this.dateFormattingService.formatDateISO(date);
  }
  
  // Calendar methods
  private updateCalendarEvents(holidays: Holiday[]): void {
    console.log('Updating calendar events with holidays:', holidays);
    
    const events: EventInput[] = holidays.map(holiday => ({
      id: holiday.id,
      title: holiday.holidayName,
      start: holiday.startDate,
      end: holiday.endDate,
      allDay: true,
      backgroundColor: '#6750a4', // Purple color matching app's theme
      borderColor: '#6750a4'
    }));
    
    console.log('Generated calendar events:', events);
    this.calendarEvents$.next(events);
  }
  
  onCalendarEventAdded(event: EventApi): void {
    const newHoliday: Omit<Holiday, 'id'> = {
      startDate: this.dateFormattingService.formatDateISO(event.start || new Date()),
      endDate: this.dateFormattingService.formatDateISO(event.end || event.start || new Date()),
      holidayName: event.title
    };
    
    this.holidayService.addHoliday(newHoliday);
  }
  
  onCalendarEventDeleted(event: EventApi): void {
    this.holidayService.deleteHoliday(event.id);
  }
  
  onCalendarEventUpdated(event: EventApi): void {
    const updatedHoliday: Holiday = {
      id: event.id,
      startDate: this.dateFormattingService.formatDateISO(event.start || new Date()),
      endDate: this.dateFormattingService.formatDateISO(event.end || event.start || new Date()),
      holidayName: event.title
    };
    
    this.holidayService.updateHoliday(updatedHoliday);
  }
  
  onCalendarEventEditRequested(event: EventApi): void {
    const holiday = this.holidays.find(h => h.id === event.id);
    if (holiday) {
      this.openEditPopup(holiday);
    }
  }
}