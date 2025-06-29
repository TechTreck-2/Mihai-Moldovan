import { Component, Inject, Type, Injector } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ValidatorFn, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor, NgComponentOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE, MAT_DATE_FORMATS, NativeDateAdapter, DateAdapter, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { DateFormattingService } from '../../../services/date-formatting/date-formatting.service';

export interface PopupField {
  name: string;
  label: string;
  type: string;
  validators?: ValidatorFn[];
  options?: { value: any; viewValue: string }[];
}

export interface PopupData {
  fields: PopupField[];
  values?: Record<string, any>;
  embeddedComponent?: Type<any>;
  embeddedData?: any;
}

@Component({
  selector: 'app-generic-popup',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgComponentOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    { provide: DateAdapter, useClass: NativeDateAdapter },
    { 
      provide: MAT_DATE_FORMATS, 
      useValue: {
        parse: {
          dateInput: 'YYYY-MM-DD',
        },
        display: {
          dateInput: 'YYYY-MM-DD',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      }
    }
  ],
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class GenericPopupComponent {
  form: FormGroup;
  embeddedInjector: Injector;

  constructor(
    public dialogRef: MatDialogRef<GenericPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData,
    private fb: FormBuilder,
    private injector: Injector,
    private dateFormattingService: DateFormattingService
  ) {
    this.form = this.fb.group({});    data.fields?.forEach(field => {
      let initialValue = data.values?.[field.name] || '';
      
      if (field.type === 'date' && initialValue) {
        const parsedDate = this.dateFormattingService.fromDateInput(initialValue) || new Date(initialValue);
        initialValue = parsedDate;
      }
      
      const control = this.fb.control(initialValue, field.validators || []);
      
      if (field.type === 'date' && field.label.toLowerCase().includes('today only')) {
        control.disable();
      }
      
      this.form.addControl(field.name, control);
    });

    this.embeddedInjector = Injector.create({
      providers: [{ provide: 'embeddedData', useValue: data.embeddedData }],
      parent: this.injector
    });
  }

  onDateChange(fieldName: string, event: any): void {
    if (event.value) {
      const dateString = this.dateFormattingService.formatForDateInput(event.value);
      this.form.get(fieldName)?.setValue(dateString, { emitEvent: false });
    }
  }
  onSubmit(): void {
    if (this.form.valid) {
      const formValue = { ...this.form.getRawValue() };
      
      this.data.fields?.forEach(field => {
        if (field.type === 'date' && formValue[field.name]) {
          const date = this.dateFormattingService.fromDateInput(formValue[field.name]);
          if (date) {
            formValue[field.name] = this.dateFormattingService.formatForDateInput(date);
          }
        }
      });
      
      this.dialogRef.close(formValue);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
