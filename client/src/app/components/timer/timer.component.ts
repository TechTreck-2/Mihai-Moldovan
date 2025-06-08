import { Component, OnInit, OnDestroy, ViewChild, HostBinding, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription, filter, take } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TimerService } from '../../services/timer/timer.service';
import { ClockingService, ClockInterval } from '../../services/clocking/clocking.service';
import { CronographTimerComponent } from '../cronograph-timer/cronograph-timer.component';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { ProgressBarMode, MatProgressBarModule } from '@angular/material/progress-bar';
import { RecentActivityStreamComponent } from '../recent-activity-stream/recent-activity-stream.component';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    CronographTimerComponent,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    RecentActivityStreamComponent,
  ],
  providers: [DatePipe],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('cronographTimer') cronographTimer!: CronographTimerComponent;
  timeElapsed: number = 0;
  private timerSubscription: Subscription | null = null;
  private intervalsSubscription: Subscription | null = null;
  private viewInitialized = false;

  currentClockInTime: string | null = null;
  currentClockOutTime: string | null = null;
  timeClockedToday: number = 0;
  quota: number = 8 * 3600;
  currentDate: string = new Date().toDateString();

  timeClockedThisWeek: number = 0;
  weeklyQuota: number = 40 * 3600;
  weeklyProgress: number = 0;
  currentWeekDates: { start: string; end: string } = { start: '', end: '' };


  constructor(
    private timerService: TimerService,
    private clockingService: ClockingService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.timerSubscription = this.timerService.timeElapsed$.subscribe(time => {
    });
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.initializeTimerState();
  }

  private initializeTimerState(): void {
    if (!this.viewInitialized || this.intervalsSubscription) {
      return;
    }

    this.intervalsSubscription = this.clockingService.clockIntervals$
      .pipe(
      )
      .subscribe(intervals => {
        if (!this.viewInitialized) return;

        const clockInData = localStorage.getItem('clockInData');
        const now = new Date();
        const today = now.toDateString();

        this.updateTimeClockedToday(intervals);

        if (clockInData) {
          const { startTime, offset } = JSON.parse(clockInData);
          const startTimeDate = new Date(startTime);

          if (startTimeDate.toDateString() === today) {
            const elapsedSinceStart = Math.floor((now.getTime() - startTimeDate.getTime()) / 1000);
            const totalElapsed = elapsedSinceStart + (offset || 0);

            this.timeElapsed = totalElapsed;
            this.currentClockInTime = startTimeDate.toLocaleTimeString();
            this.currentClockOutTime = null;

            if (this.cronographTimer) {
              this.cronographTimer.resetTimer();
              this.cronographTimer.startTimer(this.timeElapsed * 1000);
            }
          } else {
            localStorage.removeItem('clockInData');
            this.initializeBasedOnIntervals(intervals, today);
          }
        } else {
          this.initializeBasedOnIntervals(intervals, today);
        }
        this.cdr.detectChanges();
      });
  }

  private initializeBasedOnIntervals(intervals: ClockInterval[], today: string): void {
     const todayElapsedSeconds = intervals
       .filter(interval => new Date(interval.startTime).toDateString() === today)
       .reduce((total, interval) => total + (interval.duration || 0), 0);

     this.timeElapsed = todayElapsedSeconds;

     const todaysIntervals = intervals
        .filter(interval => new Date(interval.startTime).toDateString() === today)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

     const lastIntervalToday = todaysIntervals[0];
     const isActive = lastIntervalToday && !lastIntervalToday.endTime;

     if (lastIntervalToday) {
        this.currentClockInTime = new Date(lastIntervalToday.startTime).toLocaleTimeString();
        this.currentClockOutTime = lastIntervalToday.endTime ? new Date(lastIntervalToday.endTime).toLocaleTimeString() : null;
     } else {
        this.currentClockInTime = null;
        this.currentClockOutTime = null;
     }

     if (this.cronographTimer) {
       this.cronographTimer.resetTimer();
       this.cronographTimer.setTime(this.timeElapsed * 1000);
     }

     if (isActive) {
        const now = new Date();
        const startTimeDate = new Date(lastIntervalToday.startTime);
        const elapsedSinceStart = Math.floor((now.getTime() - startTimeDate.getTime()) / 1000);
        const offset = todaysIntervals.slice(1).reduce((total, interval) => total + (interval.duration || 0), 0);
        const totalElapsed = elapsedSinceStart + offset;

        this.timeElapsed = totalElapsed;
        this.currentClockInTime = startTimeDate.toLocaleTimeString();
        this.currentClockOutTime = null;

        localStorage.setItem('clockInData', JSON.stringify({
            startTime: lastIntervalToday.startTime,
            offset: offset
        }));

        if (this.cronographTimer) {
            this.cronographTimer.startTimer(this.timeElapsed * 1000);
        }
     }
  }


  updateTimeClockedToday(intervals: ClockInterval[]): void {
    const today = new Date().toDateString();
    this.timeClockedToday = intervals
      .filter(interval => new Date(interval.startTime).toDateString() === today)
      .reduce((total, interval) => {
          if (!interval.endTime) {
              const now = new Date().getTime();
              const start = new Date(interval.startTime).getTime();
              return total + Math.max(0, Math.floor((now - start) / 1000));
          }
          return total + (interval.duration || 0);
      }, 0);

    this.currentDate = today;
    
    this.updateWeeklyProgress(intervals);
  }

  private updateWeeklyProgress(intervals: ClockInterval[]): void {
    const now = new Date();
    const currentWeek = this.getCurrentWeekDates(now);
    this.currentWeekDates = currentWeek;
    
    this.timeClockedThisWeek = intervals
      .filter(interval => {
        const intervalDate = new Date(interval.startTime);
        return intervalDate >= new Date(currentWeek.start) && intervalDate <= new Date(currentWeek.end);
      })
      .reduce((total, interval) => {
        if (!interval.endTime) {
          const now = new Date().getTime();
          const start = new Date(interval.startTime).getTime();
          return total + Math.max(0, Math.floor((now - start) / 1000));
        }
        return total + (interval.duration || 0);
      }, 0);

    this.weeklyProgress = Math.min((this.timeClockedThisWeek / this.weeklyQuota) * 100, 100);
  }

  private getCurrentWeekDates(date: Date): { start: string; end: string } {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      start: startOfWeek.toDateString(),
      end: endOfWeek.toDateString()
    };
  }


  /**
   * Clocks in by starting a new interval.
   */
  clockIn(): void {
    const currentIntervals = this.clockingService.getCurrentClockIntervals();
    const today = new Date().toDateString();
    const offset = currentIntervals
        .filter(interval => new Date(interval.startTime).toDateString() === today && interval.endTime)
        .reduce((total, interval) => total + (interval.duration || 0), 0);

    if (this.clockingService.clockIn()) {
      const now = new Date();
      this.timeClockedToday = offset;
      this.cronographTimer.startTimer(this.timeClockedToday * 1000);
      this.currentClockInTime = now.toLocaleTimeString();
      this.currentClockOutTime = null;

      localStorage.setItem('clockInData', JSON.stringify({
        startTime: now.toISOString(),
        offset: this.timeClockedToday
      }));

      this.snackBar.open('Clocked in!', 'OK', { duration: 3000 });
    } else {
      this.snackBar.open('Clock in failed (maybe already clocked in or holiday)!', 'OK', { duration: 3000 });
    }
     this.cdr.detectChanges();
  }


  /**
   * Clocks out by finishing the current open interval.
   */
  clockOut(): void {
    if (this.clockingService.clockOut()) {
      this.cronographTimer.stopTimer();
      const now = new Date();
      this.currentClockOutTime = now.toLocaleTimeString();

      localStorage.removeItem('clockInData');


      this.snackBar.open('Clocked out!', 'OK', { duration: 3000 });
    } else {
      this.snackBar.open('Clock out failed (maybe not clocked in)!', 'OK', { duration: 3000 });
    }
  }

  /**
   * Formats time in seconds to HH:MM:SS format
   */
  formatTimeElapsed(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    this.viewInitialized = false;
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.intervalsSubscription) {
      this.intervalsSubscription.unsubscribe();
    }
    if (this.cronographTimer) {
        this.cronographTimer.stopTimer();
    }
  }
}