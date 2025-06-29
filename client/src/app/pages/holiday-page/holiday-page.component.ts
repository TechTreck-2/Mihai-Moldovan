import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { GenericTableComponent } from '../../components/table/table/table.component';
import { GenericPopupComponent, PopupField } from '../../components/popup/popup/popup.component';
import { NotificationComponent } from '../../components/notification/notification.component';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { HolidayService, Holiday } from '../../services/holiday/holiday.service';
import { calculateWorkingDays } from '../../utils/date-utils';
import { DateFormattingService } from '../../services/date-formatting/date-formatting.service';

@Component({
  selector: 'app-holiday-page',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    GenericTableComponent,
    NgFor,
    NgClass,
    NotificationComponent
  ],
  templateUrl: './holiday-page.component.html',
  styleUrls: ['./holiday-page.component.scss'],
})
export class HolidayPageComponent implements OnInit {
  startDate: Date = new Date();
  endDate: Date = new Date();
  columns: string[] = ['startDate', 'endDate', 'holidayName', 'length'];
  holidays: (Holiday & { length: number })[] = [];
  holidayDays: { planned: boolean }[] = [];
  totalDays: number = 0;
  workingDays: number = 0;
  nonWorkingDays: number = 0;

  constructor(
    private notificationService: NotificationsService,
    private holidayService: HolidayService,
    private dialog: MatDialog,
    private dateFormattingService: DateFormattingService
  ) {}

  ngOnInit() {
    this.holidayService.holidays$.subscribe(holidays => {
      this.updateDayCalculations();
      this.holidays = holidays.map(holiday => ({
        ...holiday,
        length: calculateWorkingDays(new Date(holiday.startDate), new Date(holiday.endDate))
      }));
      this.initializeHolidayDays();
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

  applyFilter(): void {
    console.log('Filter applied with start date:', this.startDate, 'and end date:', this.endDate);
    this.updateDayCalculations();
    this.holidays = this.holidays.map(holiday => ({
      ...holiday,
      length: calculateWorkingDays(new Date(holiday.startDate), new Date(holiday.endDate))
    }));
  }

  updateDayCalculations(): void {
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
}