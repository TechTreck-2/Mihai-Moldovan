import { Component, Input, OnInit, OnDestroy, signal, computed, effect, PLATFORM_ID, Inject, NgZone } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-vertical-timer",
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="vertical-timer" [class.purple-theme]="theme === 'purple'" [class.gradient-theme]="theme === 'gradient'">
      <div class="timer-container">
        <div class="progress-line">
          <div class="progress-fill" [style.height.%]="progressPercentage()"></div>
          <div class="progress-glow" [style.height.%]="progressPercentage()"></div>
        </div>
        
        <div class="time-display">
          <div class="time-unit hours">
            <div class="time-value">{{ formatTimeUnit(hours()) }}</div>
            <div class="time-label">HRS</div>
          </div>
          
          <div class="time-separator">:</div>
          
          <div class="time-unit minutes">
            <div class="time-value">{{ formatTimeUnit(minutes()) }}</div>
            <div class="time-label">MIN</div>
          </div>
          
          <div class="time-unit seconds" *ngIf="showSeconds">
            <div class="time-separator">:</div>
            <div class="time-value small">{{ formatTimeUnit(seconds()) }}</div>
          </div>
        </div>
        
      </div>
    </div>
  `,
  styleUrls: ["./vertical-timer.component.scss"],
})
export class VerticalTimerComponent implements OnInit, OnDestroy {
  @Input() targetHours = 8;
  @Input() targetMinutes = 0;
  @Input() targetSeconds = 0;
  @Input() theme: 'gradient' | 'purple' = 'gradient';
  @Input() showSeconds = false;

  private timerSubscription: Subscription | null = null;
  private startTime = signal<number>(0);
  private currentTime = signal<number>(0);
  private isBrowser: boolean;

  private targetTimeMs = computed(() => {
    return (this.targetHours * 3600 + this.targetMinutes * 60 + this.targetSeconds) * 1000;
  });

  elapsedTimeMs = computed(() => {
    return Math.min(this.currentTime() - this.startTime(), this.targetTimeMs());
  });

  hours = computed(() => Math.floor(this.elapsedTimeMs() / 3600000));
  minutes = computed(() => Math.floor((this.elapsedTimeMs() % 3600000) / 60000));
  seconds = computed(() => Math.floor((this.elapsedTimeMs() % 60000) / 1000));

  progressPercentage = computed(() => {
    return Math.min((this.elapsedTimeMs() / this.targetTimeMs()) * 100, 100);
  });

  isComplete = computed(() => {
    return this.elapsedTimeMs() >= this.targetTimeMs();
  });

  isRunning = computed(() => {
    return this.timerSubscription !== null;
  });

  constructor(@Inject(PLATFORM_ID) platformId: Object, private ngZone: NgZone) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    effect(() => {
      if (this.isComplete()) {
        this.stopTimer();
      }
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTimer(elapsedTimeMs: number = 0): void {
    if (!this.isBrowser) {
      return;
    }
    
    if (this.timerSubscription) {
      return;
    }
  
    this.startTime.set(Date.now() - elapsedTimeMs);
    this.currentTime.set(Date.now());
  
    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = interval(100).subscribe(() => {
        if (!this.isComplete()) {
          this.ngZone.run(() => {
            this.currentTime.set(Date.now());
          });
        }
      });
    });
  }

  setTime(elapsedTimeMs: number): void {
    if (!this.isBrowser) {
      return;
    }
    
    this.startTime.set(Date.now() - elapsedTimeMs);
    this.currentTime.set(Date.now());
  }

  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  resetTimer(): void {
    this.stopTimer();
    this.startTime.set(0);
    this.currentTime.set(0);
  }

  formatTimeUnit(value: number): string {
    return value.toString().padStart(2, "0");
  }

  formatTarget(): string {
    return `${this.formatTimeUnit(this.targetHours)}:${this.formatTimeUnit(this.targetMinutes)}`;
  }
}
