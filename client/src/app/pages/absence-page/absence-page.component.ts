import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { GenericPopupComponent, PopupField } from '../../components/popup/popup/popup.component';
import { AbsencesService, AbsenceRequest } from '../../services/absences/absences.service';
import { DateFormattingService } from '../../services/date-formatting/date-formatting.service';
import { DualViewContainerComponent } from '../../components/dual-view-container/dual-view-container.component';
import { DateRangeFilterComponent } from '../../components/date-range-filter/date-range-filter.component';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { EventInput, EventApi } from '@fullcalendar/core';


@Component({
  selector: 'app-absence-page',
  templateUrl: './absence-page.component.html',
  styleUrls: ['./absence-page.component.scss'],
  standalone: true,
  imports: [
    DualViewContainerComponent,
    DateRangeFilterComponent
  ]
})
export class AbsencePageComponent implements OnInit {
  columns: string[] = ['date', 'startTime', 'endTime', 'description'];
  startDate: Date | null = null;
  endDate: Date | null = null;
  
  tableData$: Observable<any[]>;
  calendarEvents$ = new BehaviorSubject<EventInput[]>([]);
  
  private absenceRequests: any[] = [];

  constructor(
    public dialog: MatDialog, 
    private absenceService: AbsencesService,
    private dateFormattingService: DateFormattingService
  ) {
    this.tableData$ = this.absenceService.absences$.pipe(
      map(absences => absences.map(request => {
        const startDate = new Date(request.startDateTime);
        const endDate = new Date(request.endDateTime);
        return {
          ...request,
          date: startDate.toLocaleDateString(),
          startTime: startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          endTime: endDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      }))
    );
  }

  ngOnInit() {
    this.absenceService.absences$.subscribe(absences => {
      this.absenceRequests = absences.map(request => {
        const startDate = new Date(request.startDateTime);
        const endDate = new Date(request.endDateTime);
        return {
          ...request,
          date: startDate.toLocaleDateString(),
          startTime: startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          endTime: endDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      });
      
      this.updateCalendarEvents(absences);
    });
  }
  
  private updateCalendarEvents(absences: AbsenceRequest[]): void {
    const events: EventInput[] = absences.map(absence => ({
      id: String(absence.id),
      title: absence.description,
      start: absence.startDateTime,
      end: absence.endDateTime,
      backgroundColor: this.getStatusColor(absence.status),
      borderColor: this.getStatusColor(absence.status)
    }));
    
    this.calendarEvents$.next(events);
  }
  
  private getStatusColor(status: string): string {
    switch(status) {
      case 'approved':
        return '#4CAF50';
      case 'denied':
        return '#F44336';
      case 'pending':
      default:
        return '#FF9800';
    }
  }

  timeOrderValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) {
      return null;
    }
    const startTime = control.parent.get('startTime')?.value;
    const endTime = control.value;
    if (!startTime || !endTime) {
      return null;
    }
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return end <= start ? { endBeforeStart: true } : null;
  }
  openAbsencePopup(): void {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const fields: PopupField[] = [
      { name: 'date', label: 'Date', type: 'date', validators: [Validators.required] },
      { name: 'startTime', label: 'Start Time', type: 'time', validators: [Validators.required] },
      { name: 'endTime', label: 'End Time', type: 'time', validators: [Validators.required, this.timeOrderValidator] },
      { name: 'description', label: 'Description', type: 'text', validators: [Validators.required] },
    ];

    const dialogRef = this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: { 
        fields, 
        values: { 
          date: formattedDate,
          startTime: '', 
          endTime: '', 
          description: '' 
        } 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.absenceService.createAbsence(result.date, result.startTime, result.endTime, result.description);
      }
    });
  }

  deleteAbsenceRequest(row: any): void {
    this.absenceService.deleteAbsence(row.id);
  }

  onStartDateChange(date: Date | null): void {
    this.startDate = date;
  }

  onEndDateChange(date: Date | null): void {
    this.endDate = date;
  }
  
  applyFilter(dateRange: { startDate: Date | null, endDate: Date | null }): void {
    this.startDate = dateRange.startDate;
    this.endDate = dateRange.endDate;
    console.log(`Filtering absences between ${dateRange.startDate} and ${dateRange.endDate}`);
  }
  editAbsenceRequests(row: any): void {
    const absenceDate = new Date(row.startDateTime);
    const today = new Date();
    const isToday = absenceDate.getDate() === today.getDate() && 
                   absenceDate.getMonth() === today.getMonth() && 
                   absenceDate.getFullYear() === today.getFullYear();
    
    const fields: PopupField[] = [
      { name: 'date', label: isToday ? 'Date (Today Only)' : 'Date', type: 'date', validators: [Validators.required] },
      { name: 'startTime', label: 'Start Time', type: 'time', validators: [Validators.required] },
      { name: 'endTime', label: 'End Time', type: 'time', validators: [Validators.required, this.timeOrderValidator] },
      { name: 'description', label: 'Description', type: 'text', validators: [Validators.required] },
    ];

    const startDate = new Date(row.startDateTime);
    const endDate = new Date(row.endDateTime);

    const formattedValues = {
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      endTime: endDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      description: row.description
    };

    this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: { fields, values: formattedValues }
    }).afterClosed().subscribe(result => {
      if (result) {
        const updatedAbsenceRequest: AbsenceRequest = {
          ...row,
          startDateTime: new Date(`${result.date} ${result.startTime}`),
          endDateTime: new Date(`${result.date} ${result.endTime}`),
          description: result.description,
        };
        this.absenceService.updateAbsence(updatedAbsenceRequest);
      }
    });
  }

  onCalendarEventAdded(event: EventApi): void {
    const startDateTime = event.start || new Date();
    const endDateTime = event.end || startDateTime;
    
    const date = startDateTime.toISOString().split('T')[0];
    const startTime = startDateTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    const endTime = endDateTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
    
    this.absenceService.createAbsence(date, startTime, endTime, event.title);
  }
  
  onCalendarEventDeleted(event: EventApi): void {
    this.absenceService.deleteAbsence(Number(event.id));
  }
  
  onCalendarEventUpdated(event: EventApi): void {
    const absenceToUpdate = this.absenceRequests.find(a => a.id === Number(event.id));
    
    if (absenceToUpdate) {
      const updatedAbsence: AbsenceRequest = {
        ...absenceToUpdate,
        startDateTime: event.start || new Date(),
        endDateTime: event.end || event.start || new Date(),
        description: event.title
      };
      
      this.absenceService.updateAbsence(updatedAbsence);
    }
  }
  
  onCalendarEventEditRequested(event: EventApi): void {
    const absence = this.absenceRequests.find(a => a.id === Number(event.id));
    if (absence) {
      this.editAbsenceRequests(absence);
    }
  }
}
