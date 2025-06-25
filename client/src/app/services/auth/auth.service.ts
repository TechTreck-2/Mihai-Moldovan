import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { ApiService } from '../api/api.service';

interface AuthResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly CURRENT_USER = 'CURRENT_USER';
  private isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());
  
  private userLogoutSubject = new Subject<void>();
  private userLoginSubject = new Subject<string>();
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  userLogout$ = this.userLogoutSubject.asObservable();
  userLogin$ = this.userLoginSubject.asObservable();
  
  constructor(
    private apiService: ApiService, 
    private localStorageService: LocalStorageService
  ) { 
    this.isAuthenticatedSubject.next(this.hasToken());
  }
  login(username: string, password: string): Observable<{ success: boolean; message?: string }> {
    return this.apiService.post<AuthResponse>('/auth/login', { username, password })
      .pipe(
        tap(response => {
          this.storeToken(response.access_token);
          this.storeUser(username);
          this.isAuthenticatedSubject.next(true);
          this.userLoginSubject.next(username);
        }),
        map(() => ({ success: true })),
        catchError(error => {
          console.error('Login error:', error);
          const errorMessage = error.error?.message || 'Login failed';
          return of({ success: false, message: errorMessage });
        })
      );
  }
  register(username: string, password: string): Observable<{ success: boolean; message?: string }> {
    return this.apiService.post<any>('/auth/register', { username, password })
      .pipe(
        map(() => ({ success: true })),
        catchError(error => {
          console.error('Registration error:', error);
          const errorMessage = error.error?.message || 'Registration failed';
          return of({ success: false, message: errorMessage });
        })
      );
  }

  logout(): void {
    this.userLogoutSubject.next();
    
    this.removeToken();
    this.removeUser();
    this.isAuthenticatedSubject.next(false);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getCurrentUser(): string | null {
    return this.localStorageService.getData(this.CURRENT_USER);
  }

  getToken(): string | null {
    return this.localStorageService.getData(this.JWT_TOKEN);
  }

  private storeToken(token: string): void {
    this.localStorageService.saveData(this.JWT_TOKEN, token);
  }

  private storeUser(username: string): void {
    this.localStorageService.saveData(this.CURRENT_USER, username);
  }

  private removeToken(): void {
    this.localStorageService.removeData(this.JWT_TOKEN);
  }

  private removeUser(): void {
    this.localStorageService.removeData(this.CURRENT_USER);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }
}