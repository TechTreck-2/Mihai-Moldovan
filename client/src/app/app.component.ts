import { Component, HostBinding, RendererFactory2, Renderer2, OnInit, ViewEncapsulation, PLATFORM_ID, Inject, ViewChild, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TimerComponent } from './components/timer/timer.component';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { NotificationComponent } from './components/notification/notification.component';
import { ThemeService } from './services/theme-service/theme-service.service';
import { AuthService } from './services/auth/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './services/auth/auth.interceptor';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, fromEvent } from 'rxjs';
import { ClockStatusIndicatorComponent } from './components/clock-status-indicator/clock-status-indicator.component';
import { MatDialog } from '@angular/material/dialog';
import { TimerSettingsDialogComponent } from './components/timer-settings-dialog/timer-settings-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTooltipModule,
    MatDividerModule,
    RouterModule,
    NotificationComponent,
    HttpClientModule,
    ClockStatusIndicatorComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('sidenav') sidenav!: MatSidenav;
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  private renderer: Renderer2;
  isDarkTheme: boolean = false;
  isLoggedIn: boolean = false;
  isLoginPage: boolean = false;
  currentUser: string | null = null;
  isAuthChecked: boolean = false;
  isMobile: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private rendererFactory: RendererFactory2,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnInit() {
    this.checkScreenSize();
    
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
      if (!this.isLoginPage) {
        this.cdr.detectChanges();
        setTimeout(() => {
          this.updateSidenavMode();
        });
      }
    });

    this.themeService.isDarkTheme$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isDark => {
      this.isDarkTheme = isDark;
      if (this.isBrowser) {
        if (isDark) {
          this.renderer.addClass(document.body, 'dark');
        } else {
          this.renderer.removeClass(document.body, 'dark');
        }
      }
    });

    this.authService.isAuthenticated$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      this.currentUser = this.authService.getCurrentUser();
      this.isAuthChecked = true;
      
      if (!isAuthenticated && this.isBrowser) {
        this.router.navigate(['/login']);
      } else if (isAuthenticated && this.isBrowser) {
        this.cdr.detectChanges();
        setTimeout(() => {
          this.updateSidenavMode();
        }, 100);
      }
    });

    if (this.isBrowser) {
      fromEvent(window, 'resize').pipe(
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.checkScreenSize();
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateSidenavMode();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkScreenSize() {
    if (this.isBrowser) {
      this.isMobile = window.innerWidth <= 768;
      if (!this.isLoginPage) {
        setTimeout(() => {
          this.updateSidenavMode();
        });
      }
    }
  }

  private updateSidenavMode() {
    if (!this.sidenav || this.isLoginPage) {
      return;
    }
    
    try {
      if (this.isMobile) {
        this.sidenav.mode = 'over';
        if (this.sidenav.opened) {
          this.sidenav.close();
        }
      } else {
        this.sidenav.mode = 'side';
        if (!this.sidenav.opened) {
          this.sidenav.open();
        }
      }
      this.cdr.detectChanges();
    } catch (error) {
      console.log('Sidenav not ready yet, will retry...');
      setTimeout(() => {
        if (this.sidenav && !this.isLoginPage) {
          this.updateSidenavMode();
        }
      }, 50);
    }
  }

  @HostBinding('class.dark-theme')
  get darkThemeClass() {
    return this.isDarkTheme;
  }

  get showContent() {
    return this.isAuthChecked;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  toggleSidenav() {
    if (this.sidenav && !this.isLoginPage) {
      this.sidenav.toggle();
    }
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  settings() {
    const dialogRef = this.dialog.open(TimerSettingsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Timer settings updated:', result);
      }
    });
  }
}