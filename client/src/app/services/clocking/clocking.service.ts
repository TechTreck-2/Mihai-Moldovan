import { Injectable, Injector, OnDestroy } from '@angular/core';
import { TimerService } from '../timer/timer.service';
import { BehaviorSubject, Observable, Subscription, catchError, map, of, tap, throwError } from 'rxjs';
import { formatToISODateTime } from '../../utils/date-utils';
import { HolidayService } from '../holiday/holiday.service';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';

export interface ClockInterval {
  id: string;
  startTime: string;
  endTime?: string | null;
  duration?: number;
}

interface ClockingPayload {
  id?: string;
  date: string;
  startTime: string;
  endTime?: string;
  description?: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClockingService implements OnDestroy {
  private clockIntervalsSubject = new BehaviorSubject<ClockInterval[]>([]);
  clockIntervals$: Observable<ClockInterval[]> = this.clockIntervalsSubject.asObservable();

  private _holidayService?: HolidayService;
  private apiUrl = '/clockings';
  private authSubscriptions = new Subscription();

  constructor(
    private timerService: TimerService,
    private apiService: ApiService,
    private authService: AuthService,
    private injector: Injector
  ) {
    this.loadClockIntervals();
      this.authSubscriptions.add(
      this.authService.userLogout$.subscribe(() => {
        this.clockIntervalsSubject.next([]);
        this.timerService.stopTimer();
        this.timerService.resetTimer();
        localStorage.removeItem('clockInData');
        console.log('ClockingService: Cleared data and reset timer after logout');
      })
    );
    
    this.authSubscriptions.add(
      this.authService.userLogin$.subscribe((username) => {
        this.loadClockIntervals();
        console.log(`ClockingService: Reloaded data for user ${username}`);
      })
    );
  }

  ngOnDestroy(): void {
    this.authSubscriptions.unsubscribe();
  }

  private get holidayService(): HolidayService {
    if (!this._holidayService) {
      this._holidayService = this.injector.get(HolidayService);
    }
    return this._holidayService;
  }

  private loadClockIntervals(): void {
    if (typeof window === 'undefined') return;
    
    this.apiService.get<ClockingPayload[]>(this.apiUrl)
      .pipe(
        map(payloads => payloads.map(this.mapPayloadToInterval)),
        tap(intervals => this.clockIntervalsSubject.next(intervals)),
        catchError(error => {
          console.error('Error loading clock intervals from API:', error);
          return of([]);
        })
      )
      .subscribe();
  }

  getCurrentClockIntervals(): ClockInterval[] {
    return this.clockIntervalsSubject.getValue();
  }

  clockIn(): boolean {
    const intervals = this.clockIntervalsSubject.getValue();
    const openInterval = intervals.find(interval => !interval.endTime);
    if (openInterval) {
      console.error('Already clocked in!');
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    const holidays = this.holidayService.getCurrentHolidays();
    const isHoliday = holidays.some(holiday =>
      new Date(holiday.startDate) <= new Date(today) && new Date(holiday.endDate) >= new Date(today)
    );

    if (isHoliday) {
      console.error('Cannot clock in on a holiday!');
      return false;
    }

    this.apiService.post<ClockingPayload>(`${this.apiUrl}/clock-in`, {})
      .pipe(
        map(this.mapPayloadToInterval),
        tap(newInterval => {
          const currentIntervals = this.getCurrentClockIntervals();
          this.clockIntervalsSubject.next([...currentIntervals, newInterval]);
          this.timerService.resetTimer();
          this.timerService.startTimer();
        }),
        catchError(error => {
          console.error('Error clocking in:', error);
          return throwError(() => new Error('Failed to clock in. Please try again.'));
        })
      )
      .subscribe();
    
    return true;
  }

  clockOut(): boolean {
    const intervals = this.clockIntervalsSubject.getValue();
    const openInterval = intervals.find(interval => !interval.endTime);
    if (!openInterval) {
      console.error('Not clocked in!');
      return false;
    }

    this.apiService.post<ClockingPayload>(`${this.apiUrl}/clock-out`, {})
      .pipe(
        map(this.mapPayloadToInterval),
        tap(updatedInterval => {
          const intervals = this.getCurrentClockIntervals();
          const index = intervals.findIndex(interval => interval.id === updatedInterval.id);
          if (index !== -1) {
            intervals[index] = updatedInterval;
            this.clockIntervalsSubject.next([...intervals]);
          } else {
            this.loadClockIntervals();
          }
        }),
        catchError(error => {
          console.error('Error clocking out:', error);
          return throwError(() => new Error('Failed to clock out. Please try again.'));
        })
      )
      .subscribe();

    this.timerService.stopTimer();
    return true;
  }

  addClockInterval(newInterval: ClockInterval): void {
    const intervals = this.clockIntervalsSubject.getValue();

    const isOverlapping = intervals.some(interval =>
      (new Date(newInterval.startTime) < new Date(interval.endTime || '') &&
        new Date(newInterval.endTime || '') > new Date(interval.startTime))
    );

    if (isOverlapping) {
      console.error('New interval overlaps with an existing one.');
      return;
    }

    const payload = this.mapIntervalToPayload(newInterval);
    
    this.apiService.post<ClockingPayload>(this.apiUrl, payload)
      .pipe(
        map(this.mapPayloadToInterval),
        tap(createdInterval => {
          const currentIntervals = this.getCurrentClockIntervals();
          this.clockIntervalsSubject.next([...currentIntervals, createdInterval]);
        }),
        catchError(error => {
          console.error('Error adding clock interval:', error);
          return throwError(() => new Error('Failed to add clock interval. Please try again.'));
        })
      )
      .subscribe();
  }

  updateClockIntervals(date: string, updatedIntervals: ClockInterval[]): void {
    updatedIntervals.forEach(interval => {
      this.updateClockInterval(interval);
    });
    
    this.loadClockIntervals();
  }

  updateClockInterval(updatedInterval: ClockInterval): void {
    const payload = this.mapIntervalToPayload(updatedInterval);
    
    this.apiService.put<ClockingPayload>(`${this.apiUrl}/${updatedInterval.id}`, payload)
      .pipe(
        map(this.mapPayloadToInterval),
        tap(updatedFromApi => {
          const intervals = this.getCurrentClockIntervals();
          const index = intervals.findIndex(interval => interval.id === updatedFromApi.id);
          if (index !== -1) {
            intervals[index] = updatedFromApi;
            this.clockIntervalsSubject.next([...intervals]);
          }
        }),
        catchError(error => {
          console.error('Error updating clock interval:', error);
          return throwError(() => new Error('Failed to update clock interval. Please try again.'));
        })
      )
      .subscribe();
  }
  deleteClockInterval(id: string): void {
    this.apiService.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          const intervals = this.getCurrentClockIntervals().filter(interval => interval.id !== id);
          this.clockIntervalsSubject.next(intervals);
        }),
        catchError(error => {
          console.error('Error deleting clock interval:', error);
          return throwError(() => new Error('Failed to delete clock interval. Please try again.'));
        })
      )
      .subscribe();
  }

  getTotalHours(): number {
    const intervals = this.clockIntervalsSubject.getValue();
    return intervals.reduce((total, interval) => total + (interval.duration || 0), 0) / 3600;
  }

  private mapPayloadToInterval = (payload: ClockingPayload): ClockInterval => {
    return {
      id: payload.id!,
      startTime: payload.startTime,
      endTime: payload.endTime || null,
      duration: payload.endTime 
        ? Math.floor((new Date(payload.endTime).getTime() - new Date(payload.startTime).getTime()) / 1000)
        : 0
    };
  }

  private mapIntervalToPayload(interval: ClockInterval): ClockingPayload {
    const startDate = new Date(interval.startTime);
    return {
      id: interval.id,
      date: startDate.toISOString().split('T')[0],
      startTime: interval.startTime,
      endTime: interval.endTime || undefined,
      status: interval.endTime ? 'completed' : 'active'
    };
  }
}