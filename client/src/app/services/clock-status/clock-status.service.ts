import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ClockingService, ClockInterval } from '../clocking/clocking.service';

export interface ClockStatus {
  isClockedIn: boolean;
  currentClockInTime: string | null;
  activeSession: ClockInterval | null;
}

@Injectable({
  providedIn: 'root'
})
export class ClockStatusService {
  private clockStatusSubject = new BehaviorSubject<ClockStatus>({
    isClockedIn: false,
    currentClockInTime: null,
    activeSession: null
  });

  clockStatus$: Observable<ClockStatus> = this.clockStatusSubject.asObservable();

  constructor(private clockingService: ClockingService) {
    this.clockingService.clockIntervals$.subscribe(intervals => {
      this.updateClockStatus(intervals);
    });
  }

  private updateClockStatus(intervals: ClockInterval[]): void {
    const today = new Date().toDateString();
    const todaysIntervals = intervals.filter(interval => 
      new Date(interval.startTime).toDateString() === today
    );

    const activeSession = todaysIntervals.find(interval => !interval.endTime);
    
    const status: ClockStatus = {
      isClockedIn: !!activeSession,
      currentClockInTime: activeSession ? new Date(activeSession.startTime).toLocaleTimeString() : null,
      activeSession: activeSession || null
    };

    this.clockStatusSubject.next(status);
  }

  getCurrentStatus(): ClockStatus {
    return this.clockStatusSubject.getValue();
  }
}
