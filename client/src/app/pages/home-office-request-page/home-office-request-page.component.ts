import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HomeOfficeService, HomeOfficeRequest } from '../../services/home-office/home-office.service';
import { GenericPopupComponent } from '../../components/popup/popup/popup.component';
import { UserPreferencesService } from '../../services/user-preferences/user-preferences.service';
import { EventInput, EventApi } from '@fullcalendar/core';
import { GenericTableComponent } from '../../components/table/table/table.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { AsyncPipe, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DateFormattingService } from '../../services/date-formatting/date-formatting.service';

@Component({
  selector: 'app-home-office-request-page',
  standalone: true,
  imports: [
    GenericTableComponent, 
    CalendarComponent, 
    NgIf, 
    FormsModule, 
    MatButtonToggleModule, 
    MatCardModule, 
    MatIconModule,
    AsyncPipe,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './home-office-request-page.component.html',
  styleUrls: ['./home-office-request-page.component.scss']
})
export class HomeOfficeRequestPageComponent implements OnDestroy, AfterViewInit {
  homeOfficeRequests$: Observable<HomeOfficeRequest[]>;
  calendarEvents$: Observable<EventInput[]>;
  columns: string[] = ['startDate', 'endDate', 'location', 'reason', 'status'];
  private subscriptions: Subscription = new Subscription();
  startDate: Date | null = null;
  endDate: Date | null = null;

  activeComponent: 'table' | 'calendar' = 'table';

  constructor(
    private homeOfficeService: HomeOfficeService,
    private popup: MatDialog,
    private userPreferencesService: UserPreferencesService,
    private dateFormattingService: DateFormattingService
  ) {
    this.homeOfficeRequests$ = this.homeOfficeService.requests$.pipe(
      tap((requests: HomeOfficeRequest[]) => console.log('Table data updated:', requests))
    );

    this.calendarEvents$ = this.homeOfficeRequests$.pipe(
      map(requests =>
        requests.map(request => ({
          id: request.id.toString(),
          title: request.reason,
          start: request.startDate,
          end: request.endDate,
          location: request.location,
        }))
      ),
      tap((events: EventInput[]) => console.log('Calendar events updated:', events))
    );
  }

  ngAfterViewInit(): void {
    this.activeComponent = this.userPreferencesService.getPreference('lastAcessedHomeOfficeRequestView') || 'table';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleView(view: 'table' | 'calendar'): void {
    this.activeComponent = view;
    this.userPreferencesService.setPreference('lastAcessedHomeOfficeRequestView', view);
  }

  endAfterStartValidator(control: AbstractControl) {
    if (control.parent) {
      const startTime = control.parent.get('startTime')?.value;
      if (startTime && control.value) {
        const start = this.dateFormattingService.fromDateInput(startTime) || new Date(startTime);
        const end = this.dateFormattingService.fromDateInput(control.value) || new Date(control.value);
        if (end <= start) {
          return { endBeforeStart: true };
        }
      }
    }
    return null;
  }

  openAddPopup(): void {
    this.popup.open(GenericPopupComponent, {
      data: {
        fields: [
          { name: 'startTime', label: 'Start Time', type: 'date', validators: [Validators.required] },
          { 
            name: 'endTime', 
            label: 'End Time', 
            type: 'date', 
            validators: [Validators.required, this.endAfterStartValidator.bind(this)] 
          },
          { name: 'reason', label: 'Reason', type: 'string', validators: [Validators.required] },
          { 
            name: 'officeLocation', 
            label: 'Office Location', 
            type: 'select', 
            validators: [Validators.required],
            options: this.homeOfficeService.getOffices().map(office => ({ value: office.name, viewValue: office.name })) 
          }
        ],
        values: {},
      }
    }).afterClosed().subscribe(result => {      if (result) {
        const newRequest: HomeOfficeRequest = {
          id: Date.now(),
          startDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.startTime) || new Date()),
          endDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.endTime) || new Date()),
          location: result.officeLocation,
          reason: result.reason,
          status: 'pending'
        };
        this.homeOfficeService.addRequest(newRequest);
      }
    });
  }

  openEditPopup(request: HomeOfficeRequest): void {
    this.popup.open(GenericPopupComponent, {
      data: {
        fields: [
          { 
            name: 'startTime', 
            label: 'Start Time', 
            type: 'date', 
            validators: [Validators.required], 
            value: request.startDate
          },
          { 
            name: 'endTime', 
            label: 'End Time', 
            type: 'date', 
            validators: [Validators.required, this.endAfterStartValidator.bind(this)], 
            value: request.endDate 
          },
          { name: 'reason', label: 'Reason', type: 'string', validators: [Validators.required], value: request.reason },
          { 
            name: 'officeLocation', 
            label: 'Office Location', 
            type: 'select', 
            validators: [Validators.required],
            options: this.homeOfficeService.getOffices().map(office => ({ value: office.name, viewValue: office.name })), 
            value: request.location 
          }
        ],
        values: {
          startTime: this.dateFormattingService.formatForDateInput(request.startDate),
          endTime: this.dateFormattingService.formatForDateInput(request.endDate),
          reason: request.reason,
          officeLocation: request.location
        },
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        const updatedRequest: HomeOfficeRequest = {
          ...request,
          startDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.startTime) || new Date()),
          endDate: this.dateFormattingService.formatDateISO(this.dateFormattingService.fromDateInput(result.endTime) || new Date()),
          location: result.officeLocation,
          reason: result.reason,
          status: request.status
        };
        this.homeOfficeService.updateRequest(updatedRequest);
      }
    });
  }

  deleteRequest(request: HomeOfficeRequest): void {
    this.homeOfficeService.deleteRequest(request.id);
  }

  onCalendarEventAdded(event: EventApi): void {
    const newRequest: HomeOfficeRequest = {
      id: Number(event.id) || Date.now(),
      startDate: event.start ? this.dateFormattingService.formatDateISO(event.start) : '',
      endDate: event.end ? this.dateFormattingService.formatDateISO(event.end) : '',
      reason: event.title,
      location: 'Default Office',
      status: 'pending'
    };
    this.homeOfficeService.addRequest(newRequest);
  }

  onCalendarEventDeleted(event: EventApi): void {
    console.log('Calendar delete event called with:', event);
    this.homeOfficeService.deleteRequest(Number(event.id));
  }

  onCalendarEventUpdated(event: EventApi): void {
    const updatedRequest: HomeOfficeRequest = {
      id: Number(event.id),
      startDate: event.start ? this.dateFormattingService.formatDateISO(event.start) : '',
      endDate: event.end ? this.dateFormattingService.formatDateISO(event.end) : '',
      reason: event.title,
      location: 'Default Office',
      status: 'pending'
    };
    this.homeOfficeService.updateRequest(updatedRequest);
  }

  onCalendarEditRequested(event: EventApi): void {
    console.log('Calendar edit event called with:', event);
    const currentRequests = this.homeOfficeService.getRequests();
    console.log('Current requests:', currentRequests);
    const request = currentRequests.find((r: HomeOfficeRequest) => r.id === Number(event.id));
    console.log('Found request:', request);
    if (request) {
      this.openEditPopup(request);
    } else {
      console.error('Request not found for event ID:', event.id);
    }
  }

  applyFilter(): void {
    console.log('Filter applied with start date:', this.startDate, 'and end date:', this.endDate);
  }
}
