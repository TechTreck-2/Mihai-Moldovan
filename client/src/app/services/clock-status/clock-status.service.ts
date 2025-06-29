import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ClockingService, ClockInterval } from '../clocking/clocking.service';
import { DateFormattingService } from '../date-formatting/date-formatting.service';

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

  constructor(
    private clockingService: ClockingService,
    private dateFormattingService: DateFormattingService
  ) {
    this.clockingService.clockIntervals$.subscribe(intervals => {
      this.updateClockStatus(intervals);
    });
  }

  private updateClockStatus(intervals: ClockInterval[]): void {
    const todayISO = this.dateFormattingService.formatDateISO(new Date());
    const todaysIntervals = intervals.filter(interval => 
      this.dateFormattingService.formatDateISO(new Date(interval.startTime)) === todayISO
    );

    const activeSession = todaysIntervals.find(interval => !interval.endTime);
    
    const status: ClockStatus = {
      isClockedIn: !!activeSession,
      currentClockInTime: activeSession ? this.dateFormattingService.formatTimeShort(new Date(activeSession.startTime)) : null,
      activeSession: activeSession || null
    };

    this.clockStatusSubject.next(status);
  }

  getCurrentStatus(): ClockStatus {
    return this.clockStatusSubject.getValue();
  }
}
