import { Component, Input, OnInit, OnDestroy, signal, computed, effect, PLATFORM_ID, Inject, NgZone } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { interval, Subscription } from "rxjs";

@Component({
  selector: "app-cronograph-timer",
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: "./cronograph-timer.component.html",
  styleUrls: ["./cronograph-timer.component.scss"],
})
export class CronographTimerComponent implements OnInit, OnDestroy {
  @Input() targetHours = 2;
  @Input() targetMinutes = 0;
  @Input() targetSeconds = 0;

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

  progress = computed(() => {
    return (this.elapsedTimeMs() / this.targetTimeMs()) * 100;
  });

  readonly RADIUS = 140;
  readonly CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;
  readonly SVG_SIZE = 320;
  readonly SVG_CENTER = this.SVG_SIZE / 2;

  strokeDashoffset = computed(() => {
    return this.CIRCUMFERENCE * (1 - this.progress() / 100);
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
      return; // Don't start timer on server
    }
    
    if (this.timerSubscription) {
      return;
    }
  
    this.startTime.set(Date.now() - elapsedTimeMs);
    this.currentTime.set(Date.now());
  
    // Run timer outside Angular's zone to prevent hydration stability issues
    this.ngZone.runOutsideAngular(() => {
      this.timerSubscription = interval(100).subscribe(() => {
        if (!this.isComplete()) {
          // Update signals inside Angular zone for change detection
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
}