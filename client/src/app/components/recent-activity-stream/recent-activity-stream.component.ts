import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
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
  intervalId: number;
}

@Component({
  selector: 'app-recent-activity-stream',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatChipsModule
  ],
  template: `
    <mat-card class="activity-card">
      <mat-card-header>
        <mat-card-title>
          <mat-icon class="activity-icon">history</mat-icon>
          Recent Activity
        </mat-card-title>
      </mat-card-header>
      <mat-card-content>
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
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./recent-activity-stream.component.scss']
})
export class RecentActivityStreamComponent implements OnInit, OnDestroy {
  activities: ActivityItem[] = [];
  private subscription = new Subscription();

  constructor(private clockingService: ClockingService) {}
  ngOnInit(): void {
    this.subscription.add(
      this.clockingService.clockIntervals$
        .pipe(
          debounceTime(300),
          distinctUntilChanged((prev, curr) => 
            JSON.stringify(prev) === JSON.stringify(curr)
          )
        )
        .subscribe(intervals => {
          this.generateActivities(intervals);
        })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }  private generateActivities(intervals: ClockInterval[]): void {
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
          time: startTimeString,
          date: startDate,
          icon: 'login',
          color: '#4caf50',
          timestamp: startTime.getTime(),
          intervalId: interval.id
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
            duration: duration,
            icon: 'logout',
            color: '#f44336',
            timestamp: endTime.getTime(),
            intervalId: interval.id
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
}
