import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ClockingService, ClockInterval } from '../../services/clocking/clocking.service';

interface ActivityItem {
  type: 'clock-in' | 'clock-out';
  time: string;
  date: string;
  duration?: string;
  icon: string;
  color: string;
  timestamp: number;
  intervalId: string;
}

@Component({
  selector: 'app-recent-activity-stream',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
    <div class="activity-stream" *ngIf="activities.length > 0; else noActivity">
      <div 
        class="activity-item" 
        *ngFor="let activity of activities; trackBy: trackByActivity"
        [class.clock-in]="activity.type === 'clock-in'"
        [class.clock-out]="activity.type === 'clock-out'">
        
        <div class="activity-icon-container">
          <mat-icon [style.color]="activity.color">{{ activity.icon }}</mat-icon>
        </div>
        
        <div class="activity-content">
          <div class="activity-main">
            <span class="activity-type">
              {{ activity.type === 'clock-in' ? 'Clocked In' : 'Clocked Out' }}
            </span>
            <span class="activity-time">{{ activity.time }}</span>
          </div>
          <div class="activity-details">
            <span class="activity-date">{{ activity.date }}</span>
            <mat-chip 
              *ngIf="activity.duration" 
              class="duration-chip"
              [style.background-color]="activity.color + '20'"
              [style.color]="activity.color">
              {{ activity.duration }}
            </mat-chip>
          </div>
        </div>
      </div>
    </div>
    
    <ng-template #noActivity>
      <div class="no-activity">
        <mat-icon>timer_off</mat-icon>
        <p>No recent activity</p>
      </div>
    </ng-template>
  `,
  styleUrls: ['./recent-activity-stream.component.scss']
})
export class RecentActivityStreamComponent implements OnInit, OnDestroy {
  activities: ActivityItem[] = [];
  private subscription = new Subscription();
  private cachedIntervals: ClockInterval[] = [];
  private lastFetchTimestamp: number = 0;
  private locallyUpdated: boolean = false;
  private readonly CACHE_KEY = 'recent-activities-cache';
  private readonly FETCH_COOLDOWN_MS = 60000;

  constructor(private clockingService: ClockingService) {}

  ngOnInit(): void {
    this.loadFromCache();

    this.subscription.add(
      this.clockingService.clockIntervals$
        .pipe(
          debounceTime(300),
          distinctUntilChanged((prev, curr) => 
            JSON.stringify(prev) === JSON.stringify(curr)
          )
        )
        .subscribe(intervals => {
          if (this.activities.length === 0 || this.shouldFetchData()) {
            this.cachedIntervals = [...intervals];
            this.generateActivities(intervals);
            this.saveToCache(intervals);
            this.lastFetchTimestamp = Date.now();
            this.locallyUpdated = false;
          } else {
            const hasChanges = this.hasIntervalChanges(this.cachedIntervals, intervals);
            if (hasChanges) {
              this.cachedIntervals = [...intervals];
              this.generateActivities(intervals);
              this.saveToCache(intervals);
              this.locallyUpdated = false;
            }
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  private hasIntervalChanges(oldIntervals: ClockInterval[], newIntervals: ClockInterval[]): boolean {
    if (oldIntervals.length !== newIntervals.length) {
      return true;
    }

    const sortedOld = [...oldIntervals].sort((a, b) => a.id.localeCompare(b.id));
    const sortedNew = [...newIntervals].sort((a, b) => a.id.localeCompare(b.id));

    for (let i = 0; i < sortedOld.length; i++) {
      const old = sortedOld[i];
      const current = sortedNew[i];

      if (old.id !== current.id ||
          old.startTime !== current.startTime ||
          old.endTime !== current.endTime ||
          old.duration !== current.duration) {
        return true;
      }
    }

    return false;
  }

  private shouldFetchData(): boolean {
    const timeSinceLastFetch = Date.now() - this.lastFetchTimestamp;
    
    return this.lastFetchTimestamp === 0 || 
           this.locallyUpdated || 
           timeSinceLastFetch > this.FETCH_COOLDOWN_MS;
  }

  private saveToCache(intervals: ClockInterval[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(intervals));
    } catch (error) {
      console.warn('Failed to cache recent activities:', error);
    }
  }

  private loadFromCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const intervals = JSON.parse(cached) as ClockInterval[];
        this.cachedIntervals = intervals;
        this.generateActivities(intervals);
      }
    } catch (error) {
      console.warn('Failed to load cached activities:', error);
    }
  }

  private generateActivities(intervals: ClockInterval[]): void {
    if (!intervals || intervals.length === 0) {
      this.activities = [];
      return;
    }

    const activities: ActivityItem[] = [];
    
    const recentIntervals = intervals
      .filter(interval => interval.startTime && interval.id)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 15);

    recentIntervals.forEach(interval => {
      try {
        const startTime = new Date(interval.startTime);
        
        if (isNaN(startTime.getTime())) {
          console.warn('Invalid start time for interval:', interval);
          return;
        }

        const startDate = startTime.toLocaleDateString();
        const startTimeString = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        activities.push({
          type: 'clock-in',
          time: startTimeString,          date: startDate,
          icon: 'login',
          color: '#4caf50',
          timestamp: startTime.getTime(),
          intervalId: interval.id.toString()
        });

        if (interval.endTime) {
          const endTime = new Date(interval.endTime);
          
          if (isNaN(endTime.getTime())) {
            console.warn('Invalid end time for interval:', interval);
            return;
          }

          const endDate = endTime.toLocaleDateString();
          const endTimeString = endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const duration = this.formatDuration(interval.duration || 0);
          
          activities.push({
            type: 'clock-out',
            time: endTimeString,
            date: endDate,
            duration: duration,            icon: 'logout',
            color: '#f44336',
            timestamp: endTime.getTime(),
            intervalId: interval.id.toString()
          });
        }
      } catch (error) {
        console.warn('Error processing interval:', interval, error);
      }
    });

    this.activities = activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  trackByActivity(index: number, activity: ActivityItem): string {
    return `${activity.intervalId}-${activity.type}-${activity.timestamp}`;
  }

  public markLocallyUpdated(): void {
    this.locallyUpdated = true;
  }
}
