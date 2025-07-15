import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface AbsenceRequest {
  id: number;
  startDateTime: Date;
  endDateTime: Date;
  description: string;
  status: 'pending' | 'denied' | 'approved';
}

interface AbsencePayload {
  id?: number;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AbsencesService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/absences`;
  private absencesSubject = new BehaviorSubject<AbsenceRequest[]>([]);
  absences$: Observable<AbsenceRequest[]> = this.absencesSubject.asObservable();
  private authSubscriptions = new Subscription();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { 
    this.loadAbsences();
    
    this.authSubscriptions.add(
      this.authService.userLogout$.subscribe(() => {
        this.absencesSubject.next([]);
        console.log('AbsencesService: Cleared data after logout');
      })
    );
    
    this.authSubscriptions.add(
      this.authService.userLogin$.subscribe((username) => {
        this.loadAbsences();
        console.log(`AbsencesService: Reloaded data for user ${username}`);
      })
    );
  }
  
  ngOnDestroy(): void {
    this.authSubscriptions.unsubscribe();
  }
  private loadAbsences(): void {
    this.http.get<AbsencePayload[]>(this.apiUrl).pipe(
      map(payloads => payloads.map(this.mapPayloadToRequest)),
      tap(absences => this.absencesSubject.next(absences)),
      catchError(this.handleError)
    ).subscribe({
      error: (err) => {
      }
    });
  }

  createAbsence(date: string, startTime: string, endTime: string, description: string): void {
    const payload: AbsencePayload = {
      date,
      startTime,
      endTime,
      description,
      status: 'pending'
    };

    this.http.post<AbsencePayload>(this.apiUrl, payload).pipe(
      tap(() => this.loadAbsences()),
      catchError(this.handleError)
    ).subscribe({
      error: (err) => {
      }
    });
  }

  updateAbsence(updatedAbsence: AbsenceRequest): void {
    const payload = this.mapRequestToPayload(updatedAbsence);
    this.http.put<AbsencePayload>(`${this.apiUrl}/${updatedAbsence.id}`, payload).pipe(
      tap(() => this.loadAbsences()),
      catchError(this.handleError)
    ).subscribe({
      error: (err) => {
      }
    });
  }
  deleteAbsence(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const currentAbsences = this.absencesSubject.getValue().filter(a => a.id !== id);
        this.absencesSubject.next(currentAbsences);
      }),
      catchError(this.handleError)
    ).subscribe({
      error: (err) => {
      }
    });
  }


  private mapPayloadToRequest(payload: AbsencePayload): AbsenceRequest {
    const startDate = new Date(`${payload.date}T${payload.startTime}`);
    const endDate = new Date(`${payload.date}T${payload.endTime}`);
    return {
      id: payload.id!,
      startDateTime: startDate,
      endDateTime: endDate,
      description: payload.description,
      status: payload.status as 'pending' | 'denied' | 'approved' || 'pending'
    };
  }

  private mapRequestToPayload(request: AbsenceRequest): AbsencePayload {
    return {
      id: request.id,
      date: request.startDateTime.toLocaleDateString('sv'),
      startTime: request.startDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      endTime: request.endDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      description: request.description,
      status: request.status
    };
  }
  private handleError(error: any) {
    console.error('API Error: ', error);
    return throwError(() => {
      const err = new Error('Something went wrong; please try again later.');
      (err as any).isHandled = true;
      return err;
    });
  }
}