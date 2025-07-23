import { Component, HostBinding, RendererFactory2, Renderer2, OnInit, ViewEncapsulation, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { TimerComponent } from './components/timer/timer.component';
import { MatSidenavModule } from '@angular/material/sidenav';
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
import { filter } from 'rxjs/operators';
import { ClockStatusIndicatorComponent } from './components/clock-status-indicator/clock-status-indicator.component';

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
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {

  private isBrowser: boolean;
  private renderer: Renderer2;
  isDarkTheme: boolean = false;
  isLoggedIn: boolean = false;
  isLoginPage: boolean = false;
  currentUser: string | null = null;
  isAuthChecked: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private rendererFactory: RendererFactory2,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginPage = event.urlAfterRedirects === '/login';
    });

    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      if (this.isBrowser) {
        if (isDark) {
          this.renderer.addClass(document.body, 'dark');
        } else {
          this.renderer.removeClass(document.body, 'dark');
        }
      }
    });

    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      this.isLoggedIn = isAuthenticated;
      this.currentUser = this.authService.getCurrentUser();
      this.isAuthChecked = true;
      if (!isAuthenticated && this.isBrowser) {
        this.router.navigate(['/login']);
      }
    });
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
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  settings() {
    throw new Error('Method not implemented.');
  }
}