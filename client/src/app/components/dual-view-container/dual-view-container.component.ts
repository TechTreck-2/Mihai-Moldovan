import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { EventInput } from '@fullcalendar/core';
import { GenericTableComponent } from '../table/table/table.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { UserPreferencesService } from '../../services/user-preferences/user-preferences.service';
import { DateFormattingService } from '../../services/date-formatting/date-formatting.service';

@Component({
  selector: 'app-dual-view-container',
  standalone: true,
  imports: [
    GenericTableComponent, 
    CalendarComponent, 
    NgIf, 
    FormsModule, 
    MatButtonToggleModule, 
    MatCardModule, 
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './dual-view-container.component.html',
  styleUrls: ['./dual-view-container.component.scss']
})
export class DualViewContainerComponent implements OnInit, OnDestroy, OnChanges {
  @Input() title: string = 'View';
  @Input() preferencesKey: string = 'lastAccessedView';
  @Input() tableData: any[] | Observable<any[]> = [];
  @Input() tableColumns: string[] = [];
  @Input() enableTableEdit: boolean = true;
  @Input() enableTableDelete: boolean = true;
  @Input() enableTableAdd: boolean = true;
  @Input() columnDisplayNames: { [key: string]: string } = {};
  @Input() calendarEvents: EventInput[] | Observable<EventInput[]> = [];
  
  @Output() addItem = new EventEmitter<void>();
  @Output() editItem = new EventEmitter<any>();
  @Output() deleteItem = new EventEmitter<any>();
  @Output() calendarEventAdded = new EventEmitter<any>();
  @Output() calendarEventDeleted = new EventEmitter<any>();
  @Output() calendarEventUpdated = new EventEmitter<any>();
  @Output() calendarEventEditRequested = new EventEmitter<any>();

  activeComponent: 'table' | 'calendar' = 'table';
  isMobile: boolean = false;
  
  private subscriptions: Subscription = new Subscription();
  
  resolvedTableData: any[] = [];
  resolvedCalendarEvents: EventInput[] = [];

  constructor(
    private userPreferencesService: UserPreferencesService,
    private dateFormattingService: DateFormattingService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    this.checkIfMobile();
    
    const savedPreference = this.userPreferencesService.getPreference(this.preferencesKey) as 'table' | 'calendar' || 'table';
    this.activeComponent = this.isMobile ? 'table' : savedPreference;
    
    this.setupDataSubscriptions();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 768;
    
    if (this.isMobile && this.activeComponent === 'calendar') {
      this.activeComponent = 'table';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableData'] || changes['calendarEvents']) {
      this.setupDataSubscriptions();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupDataSubscriptions(): void {
    this.subscriptions.unsubscribe();
    this.subscriptions = new Subscription();
    
    if (this.tableData instanceof Observable) {
      this.subscriptions.add(
        this.tableData.subscribe(data => {
          this.resolvedTableData = data;
        })
      );
    } else {
      this.resolvedTableData = this.tableData;
    }
    
    if (this.calendarEvents instanceof Observable) {
      this.subscriptions.add(
        this.calendarEvents.subscribe(events => {
          console.log('DualViewContainer received calendar events:', events);
          this.resolvedCalendarEvents = events;
        })
      );
    } else {
      this.resolvedCalendarEvents = this.calendarEvents;
      console.log('DualViewContainer using static calendar events:', this.resolvedCalendarEvents);
    }
  }

  toggleView(view: 'table' | 'calendar'): void {
    if (this.isMobile && view === 'calendar') {
      return;
    }
    
    this.activeComponent = view;
    this.userPreferencesService.setPreference(this.preferencesKey, view);
  }
  
  formatDataCyAttribute(baseText: string): string {
    return baseText.toLowerCase().replace(/\s+/g, '-') + '-container';
  }
  
  formatAddButtonAttribute(baseText: string): string {
    return 'add-' + baseText.toLowerCase().replace(/\s+/g, '-') + '-button';
  }

  onAddClick(): void {
    this.addItem.emit();
  }

  onEditClick(item: any): void {
    this.editItem.emit(item);
  }

  onDeleteClick(item: any): void {
    this.deleteItem.emit(item);
  }

  onCalendarEventAdded(event: any): void {
    this.calendarEventAdded.emit(event);
  }

  onCalendarEventDeleted(event: any): void {
    this.calendarEventDeleted.emit(event);
  }

  onCalendarEventUpdated(event: any): void {
    this.calendarEventUpdated.emit(event);
  }

  onCalendarEventEditRequested(event: any): void {
    this.calendarEventEditRequested.emit(event);
  }
}
