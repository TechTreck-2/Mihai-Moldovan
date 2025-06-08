import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { Subscription } from 'rxjs';
import { ClockStatusService, ClockStatus } from '../../services/clock-status/clock-status.service';

@Component({
  selector: 'app-clock-status-indicator',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <div class="clock-status-container" *ngIf="clockStatus">
      <mat-chip 
        class="status-chip"
        [class.clocked-in]="clockStatus.isClockedIn"
        [class.clocked-out]="!clockStatus.isClockedIn"
        [matTooltip]="getTooltipText()">
        
        <mat-icon class="status-icon">
          {{ clockStatus.isClockedIn ? 'schedule' : 'schedule_off' }}
        </mat-icon>
        
        <span class="status-text">
          {{ clockStatus.isClockedIn ? 'Clocked In' : 'Clocked Out' }}
        </span>
        
        <span class="status-time" *ngIf="clockStatus.isClockedIn && clockStatus.currentClockInTime">
          {{ clockStatus.currentClockInTime }}
        </span>
      </mat-chip>
    </div>
  `,
  styleUrls: ['./clock-status-indicator.component.scss']
})
export class ClockStatusIndicatorComponent implements OnInit, OnDestroy {
  clockStatus: ClockStatus | null = null;
  private subscription = new Subscription();

  constructor(private clockStatusService: ClockStatusService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.clockStatusService.clockStatus$.subscribe(status => {
        this.clockStatus = status;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getTooltipText(): string {
    if (!this.clockStatus) return '';
    
    if (this.clockStatus.isClockedIn) {
      return `Currently clocked in since ${this.clockStatus.currentClockInTime}`;
    } else {
      return 'Currently clocked out';
    }
  }
}
