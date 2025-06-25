import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Only redirect on 401 if it's not a login or register request
        if (error.status === 401 && !request.url.includes('/auth/login') && !request.url.includes('/auth/register')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
        }
        return throwError(() => error);
      })
    );
  }
}