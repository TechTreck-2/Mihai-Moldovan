import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new Subject<Notification>();
  notifications$ = this.notificationsSubject.asObservable();

  showNotification(notification: Notification): void {
    this.notificationsSubject.next(notification);
  }
}
