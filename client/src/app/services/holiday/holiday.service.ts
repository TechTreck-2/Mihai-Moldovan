import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from '../api/api.service';

export interface Holiday {
  id: string;
  startDate: string;
  endDate: string;
  holidayName: string;
}

@Injectable({
  providedIn: 'root'
})
export class HolidayService {
  private holidaysSubject = new BehaviorSubject<Holiday[]>([]);
  holidays$: Observable<Holiday[]> = this.holidaysSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadHolidays();
  }

  private loadHolidays(): void {
    this.apiService.get<Holiday[]>('/holidays')
      .pipe(
        tap(holidays => this.holidaysSubject.next(holidays))
      )
      .subscribe({
        error: err => console.error('Error loading holidays from backend', err)
      });
  }

  getCurrentHolidays(): Holiday[] {
    return this.holidaysSubject.getValue();
  }

  addHoliday(holiday: Omit<Holiday, 'id'>): void {
    this.apiService.post<Holiday>('/holidays', holiday)
      .pipe(
        tap(newHoliday => {
          const holidays = [...this.getCurrentHolidays(), newHoliday];
          this.holidaysSubject.next(holidays);
        })
      )
      .subscribe({
        error: err => console.error('Error adding holiday', err)
      });
  }

  updateHoliday(updatedHoliday: Holiday): void {
    this.apiService.put<Holiday>(`/holidays/${updatedHoliday.id}`, updatedHoliday)
      .pipe(
        tap(() => {
          const holidays = this.getCurrentHolidays().map(h =>
            h.id === updatedHoliday.id ? updatedHoliday : h
          );
          this.holidaysSubject.next(holidays);
        })
      )
      .subscribe({
        error: err => console.error('Error updating holiday', err)
      });
  }

  deleteHoliday(id: string): void {
    this.apiService.delete<void>(`/holidays/${id}`)
      .pipe(
        tap(() => {
          const holidays = this.getCurrentHolidays().filter(h => h.id !== id);
          this.holidaysSubject.next(holidays);
        })
      )
      .subscribe({
        error: err => console.error('Error deleting holiday', err)
      });
  }
}