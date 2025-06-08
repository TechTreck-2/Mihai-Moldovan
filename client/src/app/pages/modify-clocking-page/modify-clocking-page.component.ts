import { Component, OnInit } from '@angular/core';
import { GenericTableComponent } from '../../components/table/table/table.component';
import { ClockingComponent } from '../../components/clocking/clocking.component';
import { ClockingService, ClockInterval } from '../../services/clocking/clocking.service';
import { GenericPopupComponent } from '../../components/popup/popup/popup.component';
import { MatDialog } from '@angular/material/dialog';
import { DayClockinsTableComponent } from './per-day-clockins/per-day-clockins.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modify-clocking-page',
  standalone: true,
  imports: [
    GenericTableComponent,
    ClockingComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatOptionModule
  ],
  templateUrl: './modify-clocking-page.component.html',
  styleUrls: ['./modify-clocking-page.component.scss']
})
export class ModifyClockingPageComponent implements OnInit {
  groupedClockIntervals: { date: string; intervals: ClockInterval[]; count: number; length: string }[] = [];
  displayedColumns: string[] = ['date', 'length', 'count'];
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor(
    private clockingService: ClockingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.endDate.setDate(this.endDate.getDate() + 7);
    
    this.clockingService.clockIntervals$.subscribe(clockIntervals => {
      this.groupedClockIntervals = this.groupByDate(clockIntervals, this.startDate, this.endDate);
    });
  }

  formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  groupByDate(
    intervals: ClockInterval[],
    startDate: Date,
    endDate: Date
  ): { date: string; intervals: ClockInterval[]; count: number; length: string }[] {
    const groups: { [date: string]: ClockInterval[] } = {};
    intervals.forEach(interval => {
      const date = new Date(interval.startTime).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(interval);
    });
  
    const allDates: { date: string; intervals: ClockInterval[]; count: number; length: string }[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toDateString();
      const intervalsForDate = groups[dateStr] || [];
      const timeWorkedMs = intervalsForDate.reduce((total, interval) => {
        if (interval.endTime) {
          return total + (new Date(interval.endTime).getTime() - new Date(interval.startTime).getTime());
        }
        return total;
      }, 0);
      
      const formattedDuration = this.formatDuration(timeWorkedMs);
      
      allDates.push({ 
        date: dateStr, 
        intervals: intervalsForDate, 
        count: intervalsForDate.length, 
        length: formattedDuration 
      });
    }
  
    return allDates;
  }

  applyFilter(): void {
    const clockIntervals = this.clockingService.getCurrentClockIntervals();
    this.groupedClockIntervals = this.groupByDate(clockIntervals, this.startDate, this.endDate);
  }

  absencesDayPopup(row: any): void {
    console.log('Opening popup with data:', row.intervals);
    this.dialog.open(GenericPopupComponent, {
      data: {
        fields: [],
        embeddedComponent: DayClockinsTableComponent,
        embeddedData: row.intervals
      }
    });
  }
}
