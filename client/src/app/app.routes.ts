import { Routes } from '@angular/router';
import { ClockingPageComponent } from './pages/clocking-page/clocking-page.component';
import { AbsencePageComponent } from './pages/absence-page/absence-page.component';
import { ModifyClockingPageComponent } from './pages/modify-clocking-page/modify-clocking-page.component';
import { HolidayPageComponent } from './pages/holiday-page/holiday-page.component';
import { HomeOfficeMapComponent } from './pages/home-office-page/home-office-page.component';
import { Component } from '@angular/core';
import { HomeOfficeRequestPageComponent } from './pages/home-office-request-page/home-office-request-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { AuthGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  
  { 
    path: 'clocking', 
    component: ClockingPageComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'absence-requests', 
    component: AbsencePageComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'modify', 
    component: ModifyClockingPageComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'holiday', 
    component: HolidayPageComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'home-office', 
    component: HomeOfficeMapComponent,
    canActivate: [AuthGuard] 
  },
  { 
    path: 'home-office-requests', 
    component: HomeOfficeRequestPageComponent,
    canActivate: [AuthGuard] 
  },
  
  { path: '', redirectTo: '/clocking', pathMatch: 'full' },
  
  { path: '**', redirectTo: '/login' }
];