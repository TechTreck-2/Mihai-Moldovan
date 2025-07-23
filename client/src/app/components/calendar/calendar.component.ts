  import { Component, Inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, PLATFORM_ID, ViewChild, AfterViewInit, HostListener, NgZone, ChangeDetectorRef } from '@angular/core';
  import { DatePipe, isPlatformBrowser } from '@angular/common';
  import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, EventInput, EventDropArg } from '@fullcalendar/core';
  import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import listPlugin from '@fullcalendar/list';
  import interactionPlugin from '@fullcalendar/interaction';
  import { NgFor, NgIf } from '@angular/common';
  import { MatCardModule } from '@angular/material/card';
  import { MatSidenavModule } from '@angular/material/sidenav';
  import { MatDividerModule } from '@angular/material/divider';
  import { MatSliderModule } from '@angular/material/slider';
  import { MatSlideToggleModule } from '@angular/material/slide-toggle';
  import { MatListModule } from '@angular/material/list';
  import { MatIconModule } from '@angular/material/icon';
  import { FormsModule, ReactiveFormsModule } from '@angular/forms';
  import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
  import { MatButtonModule } from '@angular/material/button';
  import { MatInputModule } from '@angular/material/input';
  import { DateFormattingService } from '../../services/date-formatting/date-formatting.service';
  import { ConsistentDatePipe } from '../../pipes/consistent-date.pipe';

    
  @Component({
    selector: 'calendar',
    templateUrl: './calendar.component.html',
    standalone: true,
    imports: [
      FullCalendarModule, NgFor, NgIf, MatCardModule, MatSidenavModule,
      MatDividerModule, MatSliderModule, MatSlideToggleModule, MatListModule, MatIconModule, FormsModule, MatFormFieldModule, MatButtonModule, MatInputModule, ConsistentDatePipe
    ],
    styleUrls: ['./calendar.component.scss']
  })
  export class CalendarComponent implements OnChanges, AfterViewInit {
    @Input() eventInputs: EventInput[] = [];

    @Output() eventAdded = new EventEmitter<EventApi>();
    @Output() eventDeleted = new EventEmitter<EventApi>();
    @Output() eventUpdated = new EventEmitter<EventApi>();
    @Output() eventEditRequested = new EventEmitter<EventApi>();
    @ViewChild('fullcalendar') fullCalendar!: FullCalendarComponent;
    
    calendarOptions!: CalendarOptions;
    currentEvents: EventApi[] = [];
    clipboardEvents: EventApi[] = [];
    
    lastSelectInfo: DateSelectArg | null = null;
    
    newEventTitle: string = '';
    
    copyShortcutUsed = false;
    pasteShortcutUsed = false;
    
    private pendingOperations = new Set<string>();
    
    constructor(
      @Inject(PLATFORM_ID) private platformId: Object,
      private dateFormattingService: DateFormattingService,
      private ngZone: NgZone,
      private cdr: ChangeDetectorRef
    ) {
      if (isPlatformBrowser(this.platformId)) {
        this.calendarOptions = {
          plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
          headerToolbar: {
          },
          initialView: 'dayGridMonth',
          initialEvents: this.eventInputs,
          weekends: true,
          editable: true,
          selectable: true,
          selectMirror: true,
          dayMaxEvents: true,
          select: this.handleDateSelect.bind(this),
          eventClick: this.handleEventClick.bind(this),
          eventDrop: this.handleEventDrop.bind(this),
          eventResize: this.handleEventResize.bind(this),
          eventsSet: this.handleEvents.bind(this)
        };
      }
    }
    
    ngAfterViewInit(): void {
      const calendarApi = this.fullCalendar?.getApi();
      if (calendarApi && this.eventInputs.length > 0) {
        calendarApi.removeAllEvents();
        this.eventInputs.forEach(event => calendarApi.addEvent(event));
        calendarApi.render();
      }
    }
    
  ngOnChanges(changes: SimpleChanges) {
    if (changes['eventInputs']) {
      console.log('Calendar received new events:', this.eventInputs);
      const calendarApi = this.fullCalendar?.getApi();
      if (calendarApi) {
        calendarApi.removeAllEvents();
        
        const eventsToAdd = this.eventInputs.filter(event => 
          !event.id || !this.pendingOperations.has(String(event.id))
        );
        
        console.log('Adding events to calendar:', eventsToAdd);
        eventsToAdd.forEach(event => {
          calendarApi.addEvent(event);
        });
        
        calendarApi.render();
      } else {
        console.log('Calendar API not available, updating options');
        this.calendarOptions = {
          ...this.calendarOptions,
          events: this.eventInputs
        };
      }
    }
  }    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
      if (event.shiftKey && event.code === 'KeyC') {
        this.copyShortcutUsed = true;
        this.copySelectedEvents();
        event.preventDefault();
      } else if (event.shiftKey && event.code === 'KeyV') {
        this.pasteShortcutUsed = true;
        this.pasteClipboardEvents();
        event.preventDefault();
      }
    }
    
    handleDateSelect(selectInfo: DateSelectArg) {
      this.lastSelectInfo = selectInfo;
      if (this.copyShortcutUsed || this.pasteShortcutUsed) {
        this.copyShortcutUsed = false;
        this.pasteShortcutUsed = false;
        return;
      }
    }
    
    addEventFromSelection(): void {
      if (!this.lastSelectInfo) {
        alert('Please select a date range first.');
        return;
      }
      if (!this.newEventTitle.trim()) {
        alert('Please enter an event title.');
        return;
      }
      const calendarApi = this.lastSelectInfo.view.calendar;
      const newEvent = calendarApi.addEvent({
        id: String(new Date().getTime()),
        title: this.newEventTitle,
        start: this.lastSelectInfo.startStr,
        end: this.lastSelectInfo.endStr,
        allDay: this.lastSelectInfo.allDay
      });
      if (newEvent) {
        this.eventAdded.emit(newEvent);
      }
      
      calendarApi.unselect();
      this.lastSelectInfo = null;
      this.newEventTitle = '';
    }
    
    copySelectedEvents() {
      if (!this.lastSelectInfo) {
        alert('Please select a date range to copy events from.');
        return;
      }
      const { start, end } = this.lastSelectInfo;    this.clipboardEvents = this.currentEvents.filter(event => {
        if (!event.start || !event.end) {
          return false;
        }
        return event.start >= start && event.end <= end;
      });
      alert(`Copied ${this.clipboardEvents.length} event(s).`);
    }
    
    pasteClipboardEvents() {
      if (!this.lastSelectInfo) {
        alert('Please select a target date range to paste events.');
        return;
      }
      if (this.clipboardEvents.length === 0) {
        alert('Clipboard is empty. Please copy some events first.');
        return;
      }
      const pasteStart = this.lastSelectInfo.start;
      const eventsWithStart = this.clipboardEvents.filter(event => event.start);
      if (eventsWithStart.length === 0) {
        alert('No valid events to paste.');
        return;
      }
      const earliestEvent = eventsWithStart.reduce((earliest, event) => {
        if (!earliest || (event.start! < earliest.start!)) {
          return event;
        }
        return earliest;
      }, null as EventApi | null);
      if (!earliestEvent || !earliestEvent.start) {
        alert('No valid event found to paste.');
        return;
      }
      const offset = pasteStart.getTime() - earliestEvent.start.getTime();
      const calendarApi = this.fullCalendar.getApi();
      eventsWithStart.forEach(event => {
        const newStart = new Date(event.start!.getTime() + offset);
        const duration = event.end ? event.end.getTime() - event.start!.getTime() : 0;
        const newEnd = event.end ? new Date(newStart.getTime() + duration) : undefined;
        const pastedEvent = calendarApi.addEvent({
          id: String(new Date().getTime() + Math.random()),
          title: event.title,
          start: newStart,
          end: newEnd,
          allDay: event.allDay
        });      if(pastedEvent) {
          this.eventAdded.emit(pastedEvent);
        }
      });
      alert(`Pasted ${eventsWithStart.length} event(s).`);
    }

    handleEventClick(clickInfo: EventClickArg) {
      if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'?`)) {
        const eventId = clickInfo.event.id;
        
        if (eventId) {
          this.pendingOperations.add(eventId);
        }
        
        this.eventDeleted.emit(clickInfo.event);
        
        setTimeout(() => {
          if (eventId) {
            this.pendingOperations.delete(eventId);
          }
        }, 2000);
      }
    }
    
    handleEvents(events: EventApi[]) {
      setTimeout(() => {
        this.currentEvents = events;
        this.cdr.detectChanges();
      }, 0);
    }
    
    handleEventDrop(dropInfo: EventDropArg) {
      const eventId = dropInfo.event.id;
      
      if (eventId) {
        this.pendingOperations.add(eventId);
      }
      
      this.eventUpdated.emit(dropInfo.event);
      
      setTimeout(() => {
        if (eventId) {
          this.pendingOperations.delete(eventId);
        }
      }, 1000);
    }
      handleEventResize(resizeInfo: any) {
      const eventId = resizeInfo.event.id;
      
      if (eventId) {
        this.pendingOperations.add(eventId);
      }
      
      this.eventUpdated.emit(resizeInfo.event);
      
      setTimeout(() => {
        if (eventId) {
          this.pendingOperations.delete(eventId);
        }
      }, 1000);
    }
    
    handleWeekendsToggle() {
      if (this.calendarOptions) {
        this.calendarOptions.weekends = !this.calendarOptions.weekends;
      }
    }
    
    handleEventListClickEvent(_event: any): void {
      return;
    }
    
    editEvent(event: EventApi): void {
      this.eventEditRequested.emit(event);
    }
    
    deleteEvent(event: EventApi): void {
      const eventId = event.id;
      
      if (eventId) {
        this.pendingOperations.add(eventId);
      }
      
      this.eventDeleted.emit(event);
      
      setTimeout(() => {
        if (eventId) {
          this.pendingOperations.delete(eventId);
        }
      }, 1000);
    }
    
    jumpToEvent(event: EventApi): void {
      const calendarApi = this.fullCalendar?.getApi();
      calendarApi.gotoDate(event.startStr);
    }
  }
