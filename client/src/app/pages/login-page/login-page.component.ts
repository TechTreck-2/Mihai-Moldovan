import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoggingIn = false;
  isRegistering = false;  hidePassword = true;
  returnUrl: string = '/';  currentYear: number = new Date().getFullYear();
  errorMessage: string = '';
  successMessage: string = '';
  sessionExpiredMessage: string = '';
  
  private mouseMoveSubscription: Subscription | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    if (this.route.snapshot.queryParams['sessionExpired']) {
      this.sessionExpiredMessage = 'Session expired. Please log in again.';
    }
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }
  
  ngOnInit() {
    this.setupMouseTracking();
  }
  
  ngOnDestroy() {
    this.cleanupMouseTracking();
  }
  
  private setupMouseTracking() {
    this.mouseMoveSubscription = fromEvent<MouseEvent>(document, 'mousemove')
      .pipe(throttleTime(30))
      .subscribe(event => {
        this.updateGradientPosition(event);
      });
    
    fromEvent<TouchEvent>(document, 'touchmove')
      .pipe(throttleTime(30))
      .subscribe(event => {
        if (event.touches && event.touches[0]) {
          this.updateGradientPosition(event.touches[0]);
        }
      });
    
    if (window.DeviceOrientationEvent) {
      fromEvent<DeviceOrientationEvent>(window, 'deviceorientation')
        .pipe(throttleTime(60))
        .subscribe(event => {
          this.updateGradientFromOrientation(event);
        });
    }
  }
  
  private updateGradientPosition(event: MouseEvent | Touch) {
    const x = (event.clientX / window.innerWidth) * 100;
    const y = (event.clientY / window.innerHeight) * 100;
    
    document.documentElement.style.setProperty('--x-position', `${x}%`);
    document.documentElement.style.setProperty('--y-position', `${y}%`);
    
    document.documentElement.style.setProperty('--mouse-x', (event.clientX / window.innerWidth).toString());
    document.documentElement.style.setProperty('--mouse-y', (event.clientY / window.innerHeight).toString());
  }
  
  private updateGradientFromOrientation(event: DeviceOrientationEvent) {
    if (event.beta === null || event.gamma === null) return;
    
    const x = ((event.gamma || 0) + 90) / 180 * 100;
    const y = ((event.beta || 0) + 90) / 180 * 100;
    
    document.documentElement.style.setProperty('--x-position', `${Math.min(100, Math.max(0, x))}%`);
    document.documentElement.style.setProperty('--y-position', `${Math.min(100, Math.max(0, y))}%`);
  }
  
  private cleanupMouseTracking() {
    if (this.mouseMoveSubscription) {
      this.mouseMoveSubscription.unsubscribe();
      this.mouseMoveSubscription = null;
    }
  }
    onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    
    this.isLoggingIn = true;
    
    const { username, password } = this.loginForm.value;
    this.authService.login(username, password).subscribe(result => {
      this.isLoggingIn = false;
      if (result.success) {
        this.errorMessage = '';
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = result.message || 'Invalid credentials';
        this.snackBar.open('Login failed. Please check your credentials.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
    onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }
    
    this.isRegistering = true;
    
    const { username, password } = this.registerForm.value;
    this.authService.register(username, password).subscribe(result => {
      this.isRegistering = false;
      if (result.success) {
        this.successMessage = 'Registration successful';
        this.errorMessage = '';
        this.snackBar.open('Registration successful! Please login.', 'Close', {
          duration: 5000,
          panelClass: 'success-snackbar'
        });
        this.loginForm.patchValue({ username });
      } else {
        this.errorMessage = result.message || 'Registration failed. Username may be taken.';
        this.successMessage = '';
        this.snackBar.open(result.message || 'Registration failed. Username may be taken.', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    });
  }
  
  private passwordMatchValidator(group: FormGroup): null | { mismatch: boolean } {
    const passwordControl = group.get('password');
    const confirmPasswordControl = group.get('confirmPassword');
    
    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }
    
    if (confirmPasswordControl.errors && !confirmPasswordControl.errors['mismatch']) {
      return null;
    }
    
    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      confirmPasswordControl.setErrors(null);
      return null;
    }
  }
}