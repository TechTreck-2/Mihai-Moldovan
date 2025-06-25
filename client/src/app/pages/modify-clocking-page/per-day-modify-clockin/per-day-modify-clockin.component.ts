import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgFor, NgIf, CommonModule } from '@angular/common';

export interface PopupField {
  name: string;
  label: string;
  type: string;
  validators: any[];
}

export interface ClockInPopupData {
  fields: PopupField[];
  values: {
    startTime: string;
    endTime?: string;
    day: string;
  };
}

@Component({  selector: 'app-custom-popup',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule, FormsModule, NgFor, NgIf, CommonModule],
  template: `
    <h2 mat-dialog-title>Custom Popup</h2>
    <mat-dialog-content>
      <form [formGroup]="timeForm">
        <mat-form-field appearance="fill">
          <mat-label>Start Time</mat-label>
          <input matInput type="time" formControlName="startTime" (change)="validateTimes()">
          <mat-error *ngIf="timeForm.get('startTime')?.hasError('required')">Start time is required</mat-error>
        </mat-form-field>
        <mat-form-field appearance="fill">
          <mat-label>End Time</mat-label>
          <input matInput type="time" formControlName="endTime" (change)="validateTimes()">
          <mat-error *ngIf="timeForm.get('endTime')?.hasError('timeOrder')">End time must be after start time</mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="onCancel()">Cancel</button>
      <button mat-flat-button color="primary" type="button" 
              [disabled]="!timeForm.valid || !isTimeValid" 
              (click)="onSubmit()">Submit</button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2[mat-dialog-title] {
      margin: 0;
      padding: 16px;
      font-size: 20px;
    }
    mat-dialog-content {
      padding: 16px;
    }
    mat-dialog-actions {
      padding: 8px 16px;
    }
    mat-form-field {
      width: 100%;
      margin-bottom: 15px;
    }
    .mat-form-field-invalid .mat-input-element {
      border-color: #f44336;
    }
  `]
})
export class ClockInPopupComponent {
  timeForm: FormGroup;
  isTimeValid = false;

  constructor(
    public dialogRef: MatDialogRef<ClockInPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClockInPopupData,
    private fb: FormBuilder
  ) {
    this.timeForm = this.fb.group({
      startTime: [data.values.startTime || '', Validators.required],
      endTime: [data.values.endTime || '']
    });
    this.validateTimes();
  }

  validateTimes(): void {
    const startTime = this.timeForm.get('startTime')?.value;
    const endTime = this.timeForm.get('endTime')?.value;

    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      const start = startHour * 60 + startMinute;
      const end = endHour * 60 + endMinute;

      this.isTimeValid = end > start;
      
      if (!this.isTimeValid) {
        this.timeForm.get('endTime')?.setErrors({ 'timeOrder': true });
      } else {
        this.timeForm.get('endTime')?.updateValueAndValidity();
      }
    } else if (endTime && !startTime) {
      this.isTimeValid = false;
      this.timeForm.get('endTime')?.setErrors({ 'timeOrder': true });
    } else {
      this.isTimeValid = true;
      this.timeForm.get('endTime')?.setErrors(null);
    }
  }

  onSubmit(): void {
    if (!this.timeForm.valid || !this.isTimeValid) return;

    const day = new Date();
    const values = this.timeForm.value;

    const [startHour, startMinute] = values.startTime.split(':').map(Number);
    const startTime = new Date(day);
    startTime.setHours(startHour, startMinute, 0, 0);

    if (isNaN(startTime.getTime())) {
      console.error('Invalid start time:', values.startTime);
      return;
    }

    if (values.endTime) {
      const [endHour, endMinute] = values.endTime.split(':').map(Number);
      const endTime = new Date(day);
      endTime.setHours(endHour, endMinute, 0, 0);

      if (isNaN(endTime.getTime())) {
        console.error('Invalid end time:', values.endTime);
        return;
      }
      this.data.values.endTime = endTime.toISOString();
    }

    this.data.values.startTime = startTime.toISOString();
    this.dialogRef.close(this.data.values);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}