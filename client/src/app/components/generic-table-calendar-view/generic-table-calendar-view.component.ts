import { Component, Input } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GenericTableComponent } from '../table/table/table.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { NgIf } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { EventInput } from '@fullcalendar/core';

@Component({
  selector: 'app-generic-table-calendar-view',
  standalone: true,
  imports: [MatButtonToggleModule, NgIf, FormsModule, GenericTableComponent, CalendarComponent],
  templateUrl: './generic-table-calendar-view.component.html',
  styleUrl: './generic-table-calendar-view.component.scss'
})
export class GenericTableCalendarViewComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() calendarEvents: EventInput[] = [];
  @Input() enableEdit: boolean = false;
  @Input() enableDelete: boolean = false;
  @Input() editHandler: (row: any) => void = () => {};
  @Input() deleteHandler: (row: any) => void = () => {};
  @Input() enableAdd: boolean = false;
  @Input() addHandler: () => void = () => {};
  activeComponent: 'table' | 'calendar' = 'table';

  toggleView(view: 'table' | 'calendar'): void {
    this.activeComponent = view;
  }
}