import { Component, Input, Injector, OnInit } from '@angular/core';
import { GenericTableComponent } from '../../../components/table/table/table.component';
import { MatButton } from '@angular/material/button';
import { ClockInPopupComponent, ClockInPopupData } from '../per-day-modify-clockin/per-day-modify-clockin.component';
import { MatDialog } from '@angular/material/dialog';
import { ClockingService, ClockInterval } from '../../../services/clocking/clocking.service';
import { DateFormattingService } from '../../../services/date-formatting/date-formatting.service';

@Component({
  selector: 'app-day-clockins-table',
  standalone: true,
  imports: [GenericTableComponent, MatButton],
  template: `
    <button mat-flat-button (click)="showAddClockInPopup()">Add clock-in</button>
    <app-generic-table 
      [data]="formattedData" 
      [displayedColumns]="displayedColumns"
      [enableEdit]="true"
      [editHandler]="showEditClockInPopup.bind(this)"
      [enableDelete]="true"
      [deleteHandler]="deleteClockIn.bind(this)">
    </app-generic-table>
  `,
})
export class DayClockinsTableComponent implements OnInit {
  @Input() data: ClockInterval[] = [];
  @Input() day: string = '';
  displayedColumns: string[] = ['startTime', 'endTime'];

  formattedData: any[] = [];

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private clockingService: ClockingService,
    private dateFormattingService: DateFormattingService
  ) {
    this.data = this.injector.get('embeddedData', []);
    console.log('Received data in embedded component:', this.data);
  }

  ngOnInit() {
    this.formatData();
  }

  formatData() {
    this.formattedData = this.data.map(interval => ({
      ...interval,
      startTime: this.dateFormattingService.formatTimeShort(interval.startTime),
      endTime: interval.endTime ? this.dateFormattingService.formatTimeShort(interval.endTime) : null
    }));
  }

  showAddClockInPopup() {
    const initialData: ClockInPopupData = {
      fields: [
        { name: 'startTime', label: 'Start Time', type: 'time', validators: [] },
        { name: 'endTime', label: 'End Time', type: 'time', validators: [] }
      ],
      values: { startTime: '', endTime: '', day: this.day }
    };

    const dialogRef = this.dialog.open(ClockInPopupComponent, {
      width: '400px',
      data: initialData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.startTime) {
        const duration = result.endTime ? Math.floor(
          (new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 1000
        ) : 0;        const newInterval: ClockInterval = {
          id: Date.now().toString(),
          startTime: result.startTime,
          endTime: result.endTime || null,
          duration: duration
        };

        this.clockingService.addClockInterval(newInterval);
        this.data = [...this.data, newInterval];
        this.formatData();
      }
    });
  }

  showEditClockInPopup(interval: ClockInterval) {
    const initialData: ClockInPopupData = {
      fields: [
        { name: 'startTime', label: 'Start Time', type: 'time', validators: [] },
        { name: 'endTime', label: 'End Time', type: 'time', validators: [] }
      ],
      values: { startTime: interval.startTime, endTime: interval.endTime || '', day: this.day }
    };

    const dialogRef = this.dialog.open(ClockInPopupComponent, {
      width: '400px',
      data: initialData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.startTime) {
        const startTime = new Date(result.startTime);
        const day = new Date(this.day);
        if (this.dateFormattingService.formatDateISO(startTime) === this.dateFormattingService.formatDateISO(day)) {
          const duration = result.endTime ? Math.floor(
            (new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / 1000
          ) : 0;
          const updatedInterval: ClockInterval = {
            ...interval,
            startTime: result.startTime,
            endTime: result.endTime || null,
            duration: duration
          };

          this.clockingService.updateClockInterval(updatedInterval);
          this.data = this.data.map(i => i.id === interval.id ? updatedInterval : i);
          this.formatData();
        } else {
          alert('Start time must be within the specified day.');
        }
      }
    });
  }

  deleteClockIn(interval: ClockInterval) {
    this.clockingService.deleteClockInterval(interval.id);
    this.data = this.data.filter(i => i.id !== interval.id);
    this.formatData();
  }
}
