import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { GenericPopupComponent, PopupField } from '../../components/popup/popup/popup.component';
import { AbsencesService, AbsenceRequest } from '../../services/absences/absences.service';
import { GenericTableComponent } from '../../components/table/table/table.component';


@Component({
  selector: 'app-absence-page',
  templateUrl: './absence-page.component.html',
  styleUrls: ['./absence-page.component.scss'],
  standalone: true,
  imports: [
    GenericTableComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
  ]
})
export class AbsencePageComponent implements OnInit {
  absenceRequests: any[] = [];
  displayedColumns: string[] = ['date', 'startTime', 'endTime', 'description'];
  startDate: Date | null = null;
  endDate: Date | null = null;

  constructor(public dialog: MatDialog, private absenceService: AbsencesService) {}

  ngOnInit() {
    this.absenceService.absences$.subscribe(absences => {
      this.absenceRequests = absences.map(request => {
        const startDate = new Date(request.startDateTime);
        const endDate = new Date(request.endDateTime);
        return {
          ...request,
          date: startDate.toLocaleDateString(),
          startTime: startDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          endTime: endDate.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
      });
    });
  }

  timeOrderValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) {
      return null;
    }
    const startTime = control.parent.get('startTime')?.value;
    const endTime = control.value;
    if (!startTime || !endTime) {
      return null;
    }
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return end <= start ? { endBeforeStart: true } : null;
  }
  openAbsencePopup(): void {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    
    const fields: PopupField[] = [
      { name: 'date', label: 'Date', type: 'date', validators: [Validators.required] },
      { name: 'startTime', label: 'Start Time', type: 'time', validators: [Validators.required] },
      { name: 'endTime', label: 'End Time', type: 'time', validators: [Validators.required, this.timeOrderValidator] },
      { name: 'description', label: 'Description', type: 'text', validators: [Validators.required] },
    ];

    const dialogRef = this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: { 
        fields, 
        values: { 
          date: formattedDate,
          startTime: '', 
          endTime: '', 
          description: '' 
        } 
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.absenceService.createAbsence(result.date, result.startTime, result.endTime, result.description);
      }
    });
  }

  deleteAbsenceRequest(row: any): void {
    this.absenceService.deleteAbsence(row.id);
  }
  editAbsenceRequests(row: any): void {
    const absenceDate = new Date(row.startDateTime);
    const today = new Date();
    const isToday = absenceDate.getDate() === today.getDate() && 
                   absenceDate.getMonth() === today.getMonth() && 
                   absenceDate.getFullYear() === today.getFullYear();
    
    const fields: PopupField[] = [
      { name: 'date', label: isToday ? 'Date (Today Only)' : 'Date', type: 'date', validators: [Validators.required] },
      { name: 'startTime', label: 'Start Time', type: 'time', validators: [Validators.required] },
      { name: 'endTime', label: 'End Time', type: 'time', validators: [Validators.required, this.timeOrderValidator] },
      { name: 'description', label: 'Description', type: 'text', validators: [Validators.required] },
    ];

    const startDate = new Date(row.startDateTime);
    const endDate = new Date(row.endDateTime);

    const formattedValues = {
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      endTime: endDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }),
      description: row.description
    };

    this.dialog.open(GenericPopupComponent, {
      width: '400px',
      data: { fields, values: formattedValues }
    }).afterClosed().subscribe(result => {
      if (result) {
        const updatedAbsenceRequest: AbsenceRequest = {
          ...row,
          startDateTime: new Date(`${result.date} ${result.startTime}`),
          endDateTime: new Date(`${result.date} ${result.endTime}`),
          description: result.description,
        };
        this.absenceService.updateAbsence(updatedAbsenceRequest);
      }
    });
  }

  applyFilter(): void {
    console.log('Filter applied with start date:', this.startDate, 'and end date:', this.endDate);
  }
}
