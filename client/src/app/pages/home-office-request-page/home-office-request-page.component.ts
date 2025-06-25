import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { HomeOfficeService, HomeOfficeRequest } from '../../services/home-office/home-office.service';
import { GenericPopupComponent } from '../../components/popup/popup/popup.component';
import { UserPreferencesService } from '../../services/user-preferences/user-preferences.service';
import { EventInput, EventApi } from '@fullcalendar/core';
import { GenericTableComponent } from '../../components/table/table/table.component';
import { CalendarComponent } from '../../components/calendar/calendar.component';
import { AsyncPipe, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

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
    AsyncPipe
  ],
  providers: [DatePipe],
  templateUrl: './home-office-request-page.component.html',
  styleUrls: ['./home-office-request-page.component.scss']
})
export class HomeOfficeRequestPageComponent implements OnDestroy, AfterViewInit {
  homeOfficeRequests$: Observable<HomeOfficeRequest[]>;
  calendarEvents$: Observable<EventInput[]>;
  columns: string[] = ['startDate', 'endDate', 'location', 'reason', 'status'];
  private subscriptions: Subscription = new Subscription();

  activeComponent: 'table' | 'calendar' = 'table';
  private readonly dateFormat = "yyyy-MM-dd'T'HH:mm:ss";

  constructor(
    private homeOfficeService: HomeOfficeService,
    private popup: MatDialog,
    private userPreferencesService: UserPreferencesService,
    private datePipe: DatePipe
  ) {
    this.homeOfficeRequests$ = this.homeOfficeService.requests$;

    this.calendarEvents$ = this.homeOfficeRequests$.pipe(
      map(requests =>
        requests.map(request => ({
          id: request.id.toString(),
          title: request.reason,
          start: request.startDate,
          end: request.endDate,
          location: request.location,
        }))
      )
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
        const start = new Date(startTime);
        const end = new Date(control.value);
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
          { name: 'startTime', label: 'Start Time', type: 'date', validators: [] },
          { 
            name: 'endTime', 
            label: 'End Time', 
            type: 'date', 
            validators: [this.endAfterStartValidator.bind(this)] 
          },
          { name: 'reason', label: 'Reason', type: 'string', validators: [] },
          { 
            name: 'officeLocation', 
            label: 'Office Location', 
            type: 'select', 
            options: this.homeOfficeService.getOffices().map(office => ({ value: office.name, viewValue: office.name })) 
          }
        ],
        values: {},
      }
    }).afterClosed().subscribe(result => {      if (result) {
        const newRequest: HomeOfficeRequest = {
          id: Date.now(),
          startDate: this.datePipe.transform(new Date(result.startTime), this.dateFormat) || '',
          endDate: this.datePipe.transform(new Date(result.endTime), this.dateFormat) || '',
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
            validators: [], 
            value: 'request.startDate '
          },
          { 
            name: 'endTime', 
            label: 'End Time', 
            type: 'date', 
            validators: [this.endAfterStartValidator.bind(this)], 
            value: request.endDate 
          },
          { name: 'reason', label: 'Reason', type: 'string', validators: [], value: request.reason },
          { 
            name: 'officeLocation', 
            label: 'Office Location', 
            type: 'select', 
            options: this.homeOfficeService.getOffices().map(office => ({ value: office.name, viewValue: office.name })), 
            value: request.location 
          }
        ],
        values: {
          startTime: request.startDate,
          endTime: request.endDate,
          reason: request.reason,
          officeLocation: request.location
        },
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        const updatedRequest: HomeOfficeRequest = {
          ...request,
          startDate: this.datePipe.transform(new Date(result.startTime), this.dateFormat) || '',
          endDate: this.datePipe.transform(new Date(result.endTime), this.dateFormat) || '',
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
      startDate: event.start ? this.datePipe.transform(new Date(event.start), this.dateFormat) || '' : '',
      endDate: event.end ? this.datePipe.transform(new Date(event.end), this.dateFormat) || '' : '',
      reason: event.title,
      location: 'Default Office',
      status: 'pending'
    };
    this.homeOfficeService.addRequest(newRequest);
  }

  onCalendarEventDeleted(event: EventApi): void {
    this.homeOfficeService.deleteRequest(Number(event.id));
  }

  onCalendarEventUpdated(event: EventApi): void {
    const updatedRequest: HomeOfficeRequest = {
      id: Number(event.id),
      startDate: event.start ? this.datePipe.transform(new Date(event.start), this.dateFormat) || '' : '',
      endDate: event.end ? this.datePipe.transform(new Date(event.end), this.dateFormat) || '' : '',
      reason: event.title,
      location: 'Default Office',
      status: 'pending'
    };
    this.homeOfficeService.updateRequest(updatedRequest);
  }
}
