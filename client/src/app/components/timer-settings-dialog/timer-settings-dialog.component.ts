import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '../../services/user-preferences/user-preferences.service';

export interface TimerDisplaySettings {
  displayType: 'circle' | 'vertical';
  theme: 'gradient' | 'purple';
}

@Component({
  selector: 'app-timer-settings-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatCardModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="settings-dialog">
      <h2 mat-dialog-title>Timer Display Settings</h2>
      
      <mat-dialog-content class="settings-content">
        <div class="setting-section">
          <h3>Timer Layout</h3>
          <div class="layout-options">
            <mat-card 
              class="layout-card" 
              [class.selected]="settings.displayType === 'circle'"
              (click)="setDisplayType('circle')">
              <mat-card-content>
                <div class="preview-container">
                  <div class="circle-preview">
                    <mat-icon>radio_button_unchecked</mat-icon>
                  </div>
                </div>
                <div class="layout-title">Circle Timer</div>
                <div class="layout-description">Classic circular progress display</div>
              </mat-card-content>
            </mat-card>
            
            <mat-card 
              class="layout-card" 
              [class.selected]="settings.displayType === 'vertical'"
              (click)="setDisplayType('vertical')">
              <mat-card-content>
                <div class="preview-container">
                  <div class="vertical-preview">
                    <div class="purple-line"></div>
                    <div class="time-display">
                      <div class="hours">08</div>
                      <div class="minutes">45</div>
                    </div>
                  </div>
                </div>
                <div class="layout-title">Vertical Timer</div>
                <div class="layout-description">AOD Style timer</div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>

        <div class="setting-section">
          <h3>Theme</h3>
          <div class="theme-options">
            <mat-card 
              class="theme-card" 
              [class.selected]="settings.theme === 'gradient'"
              (click)="setTheme('gradient')">
              <mat-card-content>
                <div class="theme-preview gradient-theme">
                  <div class="sample-line"></div>
                  <div class="sample-text">Gradient</div>
                </div>
              </mat-card-content>
            </mat-card>
            
            <mat-card 
              class="theme-card" 
              [class.selected]="settings.theme === 'purple'"
              (click)="setTheme('purple')">
              <mat-card-content>
                <div class="theme-preview purple-theme">
                  <div class="sample-line"></div>
                  <div class="sample-text">Purple</div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./timer-settings-dialog.component.scss']
})
export class TimerSettingsDialogComponent implements OnInit {
  settings: TimerDisplaySettings = {
    displayType: 'circle',
    theme: 'gradient'
  };

  constructor(
    private dialogRef: MatDialogRef<TimerSettingsDialogComponent>,
    private userPreferencesService: UserPreferencesService
  ) {}

  ngOnInit(): void {
    // Load current settings
    const saved = this.userPreferencesService.getPreference('timerDisplay');
    if (saved) {
      this.settings = { ...this.settings, ...saved };
      // Migrate from old 'default' to new 'gradient'
      if ((saved as any).theme === 'default') {
        this.settings.theme = 'gradient';
      }
    }
  }

  setDisplayType(type: 'circle' | 'vertical'): void {
    this.settings.displayType = type;
    // Emit live update
    this.emitLiveUpdate();
  }

  setTheme(theme: 'gradient' | 'purple'): void {
    this.settings.theme = theme;
    // Emit live update
    this.emitLiveUpdate();
  }

  private emitLiveUpdate(): void {
    // Send live update to timer component
    this.userPreferencesService.setPreference('timerDisplay', this.settings);
  }

  close(): void {
    this.dialogRef.close(this.settings);
  }
}
