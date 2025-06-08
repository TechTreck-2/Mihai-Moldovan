import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationsService } from '../../services/notifications/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [ CommonModule ],
  template: `
    <div class="notification-container">
      <div *ngFor="let note of notifications" class="notification" [ngClass]="note.type">
        {{ note.message }}
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
    }
    .notification {
      margin-bottom: 10px;
      padding: 10px;
      border-radius: 3px;
      background: #f0f0f0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .success { border-left: 5px solid green; }
    .error { border-left: 5px solid red; }
    .info { border-left: 5px solid blue; }
    .warning { border-left: 5px solid orange; }
  `]
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];

  constructor(private notificationService: NotificationsService) {}

  ngOnInit(): void {
    this.notificationService.notifications$.subscribe(notification => {
      this.notifications.push(notification);
      setTimeout(() => this.removeNotification(notification), 5000);
    });
  }

  removeNotification(notification: Notification): void {
    this.notifications = this.notifications.filter(n => n !== notification);
  }
}
