import { Component, Input, OnChanges, AfterViewInit, ViewChild, SimpleChanges, HostListener } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DateFormattingService } from '../../../services/date-formatting/date-formatting.service';

@Component({
  selector: 'app-generic-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    TitleCasePipe,
    MatIconModule
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class GenericTableComponent implements OnChanges, AfterViewInit {
  @Input() displayedColumns: string[] = [];
  @Input() data: any[] = [];
  @Input() pageSizeOptions: number[] = [5, 10, 25];

  @Input() enableAdd: boolean = false;
  @Input() addHandler: () => void = () => {};
  @Input() addButtonLabel: string = 'Add';

  @Input() enableEdit: boolean = false;
  @Input() editHandler: (row: any) => void = () => {};
  @Input() editButtonLabel: string = 'Edit';

  @Input() enableDelete: boolean = false;
  @Input() deleteHandler: (row: any) => void = () => {};
  @Input() deleteButtonLabel: string = 'Delete';

  @Input() columnDisplayNames: { [key: string]: string } = {};

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    this.closeContextMenu();
  }

  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  contextMenuVisible: boolean = false;
  contextMenuPosition = { x: 0, y: 0 };
  contextMenuRow: any;

  constructor(private dateFormattingService: DateFormattingService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.dataSource.data = this.data;
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  get computedColumns(): string[] {
    const columns = [...this.displayedColumns];
    if (this.enableEdit || this.enableDelete) {
      columns.push('actions');
    }
    return columns;
  }

  onRightClick(event: MouseEvent, row: any): void {
    event.preventDefault();
    this.contextMenuVisible = true;
    this.contextMenuPosition = { x: event.clientX, y: event.clientY };
    this.contextMenuRow = row;
  }

  closeContextMenu(): void {
    this.contextMenuVisible = false;
  }

  formatCellValue(value: any, column: string): string {
    if (!value) {
      return '';
    }

    if (this.isDateColumn(column) && this.isDateString(value)) {
      return this.dateFormattingService.formatTableDate(value);
    }

    if (this.isTimeColumn(column) && this.isDateString(value)) {
      return this.dateFormattingService.formatTimeShort(value);
    }

    return value.toString();
  }

  private isDateColumn(column: string): boolean {
    const dateColumns = ['date', 'startdate', 'enddate', 'createdat', 'updatedat', 'timestamp'];
    return dateColumns.includes(column.toLowerCase()) || column.toLowerCase().includes('date');
  }

  private isTimeColumn(column: string): boolean {
    const timeColumns = ['time', 'starttime', 'endtime'];
    return timeColumns.includes(column.toLowerCase()) || column.toLowerCase().includes('time');
  }

  private isDateString(value: any): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2})?/;
    return dateRegex.test(value) && !isNaN(Date.parse(value));
  }
}
