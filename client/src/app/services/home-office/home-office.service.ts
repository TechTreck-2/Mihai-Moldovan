import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description: string;
}

export interface HomeOfficeRequest {
  id: number;
  startDate: string;
  endDate: string;
  location: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class HomeOfficeService implements OnDestroy {
  private readonly officesApiEndpoint = '/home-office/locations';
  private readonly requestsApiEndpoint = '/home-office/requests';

  private officesSubject = new BehaviorSubject<Location[]>([]);
  private requestsSubject = new BehaviorSubject<HomeOfficeRequest[]>([]);
  private authSubscriptions = new Subscription();

  offices$ = this.officesSubject.asObservable();
  requests$ = this.requestsSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {
    this.loadOffices();
    this.loadRequests();
    
    this.authSubscriptions.add(
      this.authService.userLogout$.subscribe(() => {
        this.officesSubject.next([]);
        this.requestsSubject.next([]);
        console.log('HomeOfficeService: Cleared data after logout');
      })
    );
    
    this.authSubscriptions.add(
      this.authService.userLogin$.subscribe((username) => {
        this.loadOffices();
        this.loadRequests();
        console.log(`HomeOfficeService: Reloaded data for user ${username}`);
      })
    );
  }
  
  ngOnDestroy(): void {
    this.authSubscriptions.unsubscribe();
  }

  private loadOffices(): void {
    this.apiService.get<Location[]>(this.officesApiEndpoint).pipe(
      tap(offices => this.officesSubject.next(offices)),
      catchError(error => this.handleError(error))
    ).subscribe();
  }


  public getOffices(): Location[] {
    return [...this.officesSubject.value];
  }

  public getOfficeById(id: number): Location | undefined {
    return this.officesSubject.value.find(o => o.id === id);
  }

  public addOffice(office: Omit<Location, 'id'>): void {
    this.apiService.post<Location>(this.officesApiEndpoint, office).pipe(
      tap(newOffice => {
        const offices = [...this.officesSubject.value, newOffice];
        this.officesSubject.next(offices);
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  public updateOffice(updatedOffice: Location): void {
    this.apiService.put<Location>(`${this.officesApiEndpoint}/${updatedOffice.id}`, updatedOffice).pipe(
      tap(() => {
        const offices = this.officesSubject.value.map(o => o.id === updatedOffice.id ? updatedOffice : o);
        this.officesSubject.next(offices);
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  public deleteOffice(id: number): void {
    this.apiService.delete<void>(`${this.officesApiEndpoint}/${id}`).pipe(
      tap(() => {
        const offices = this.officesSubject.value.filter(o => o.id !== id);
        this.officesSubject.next(offices);
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  private loadRequests(): void {
    this.apiService.get<HomeOfficeRequest[]>(this.requestsApiEndpoint).pipe(
      tap(requests => this.requestsSubject.next(requests)),
      catchError(error => this.handleError(error))
    ).subscribe();
  }


  public getRequests(): HomeOfficeRequest[] {
    return [...this.requestsSubject.value];
  }

  public addRequest(request: Omit<HomeOfficeRequest, 'id' | 'status'>): void {
    const newRequestPayload = { ...request, status: 'pending' as const };
    this.apiService.post<HomeOfficeRequest>(this.requestsApiEndpoint, newRequestPayload).pipe(
      tap(newRequest => {
        const requests = [...this.requestsSubject.value, newRequest];
        this.requestsSubject.next(requests);
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  public updateRequest(updatedRequest: HomeOfficeRequest): void {
    this.apiService.put<HomeOfficeRequest>(`${this.requestsApiEndpoint}/${updatedRequest.id}`, updatedRequest).pipe(
      tap(() => {
        const requests = this.requestsSubject.value.map((r: HomeOfficeRequest) => r.id === updatedRequest.id ? updatedRequest : r);
        this.requestsSubject.next(requests);
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  public deleteRequest(id: number): void {
    this.apiService.delete<void>(`${this.requestsApiEndpoint}/${id}`).pipe(
      tap(() => {
        const requests = this.requestsSubject.value.filter((r: HomeOfficeRequest) => r.id !== id);
        this.requestsSubject.next(requests);
      }),
      catchError(error => this.handleError(error))
    ).subscribe();
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error: ', error);
    return throwError(() => new Error('Something went wrong with Home Office data; please try again later.'));
  }
}