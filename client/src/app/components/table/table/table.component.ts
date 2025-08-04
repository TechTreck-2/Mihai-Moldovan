import { Component, Input, OnChanges, AfterViewInit, ViewChild, SimpleChanges, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { DateFormattingService } from '../../../services/date-formatting/date-formatting.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

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
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class GenericTableComponent implements OnChanges, AfterViewInit, OnInit, OnDestroy {
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

  isMobile = false;
  isTablet = false;
  private destroy$ = new Subject<void>();

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

  constructor(
    private dateFormattingService: DateFormattingService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, Breakpoints.TabletPortrait])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = this.breakpointObserver.isMatched([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape]);
        this.isTablet = this.breakpointObserver.isMatched(Breakpoints.TabletPortrait);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

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

  getPrimaryField(element: any): { label: string; value: string } {
    const primaryColumn = this.displayedColumns[0];
    const titleCasePipe = new TitleCasePipe();
    return {
      label: this.columnDisplayNames[primaryColumn] || titleCasePipe.transform(primaryColumn),
      value: this.formatCellValue(element[primaryColumn], primaryColumn)
    };
  }

  getSecondaryFields(element: any): { label: string; value: string }[] {
    const titleCasePipe = new TitleCasePipe();
    return this.displayedColumns.slice(1).map(column => ({
      label: this.columnDisplayNames[column] || titleCasePipe.transform(column),
      value: this.formatCellValue(element[column], column)
    }));
  }

  getStatusChip(element: any): { text: string; color: string } | null {
    const statusFields = ['status', 'state', 'type', 'category'];
    const statusField = this.displayedColumns.find(col => 
      statusFields.some(field => col.toLowerCase().includes(field))
    );

    if (!statusField || !element[statusField]) {
      return null;
    }

    const value = element[statusField].toString().toLowerCase();
    let color = 'default';

    if (['active', 'approved', 'completed', 'success', 'confirmed'].includes(value)) {
      color = 'primary';
    } else if (['pending', 'processing', 'in-progress', 'partial'].includes(value)) {
      color = 'accent';
    } else if (['rejected', 'failed', 'error', 'cancelled', 'inactive'].includes(value)) {
      color = 'warn';
    }

    return {
      text: this.formatCellValue(element[statusField], statusField),
      color
    };
  }
}
