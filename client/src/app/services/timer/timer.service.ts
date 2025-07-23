import { Injectable, PLATFORM_ID, Inject, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private timeElapsedSubject = new BehaviorSubject<number>(0);
  public timeElapsed$ = this.timeElapsedSubject.asObservable();

  private timerSubscription: Subscription | null = null;
  private isRunning = false;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object, private ngZone: NgZone) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  startTimer(intervalMs: number = 1000): void {
    if (!this.isBrowser) {
      return;
    }
    
    if (!this.isRunning) {
      this.isRunning = true;
      this.ngZone.runOutsideAngular(() => {
        this.timerSubscription = interval(intervalMs).subscribe(() => {
          this.ngZone.run(() => {
            this.timeElapsedSubject.next(this.timeElapsedSubject.value + 1);
          });
        });
      });
    }
  }

  stopTimer(): void {
    if (this.isRunning && this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
      this.isRunning = false;
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.timeElapsedSubject.next(0);
  }

  getCurrentTime(): number {
    return this.timeElapsedSubject.value;
  }
}
