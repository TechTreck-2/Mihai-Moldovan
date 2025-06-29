import { GenericTableComponent } from '../../src/app/components/table/table/table.component';
import { ComponentFixture } from '@angular/core/testing';
import { DateFormattingService } from '../../src/app/services/date-formatting/date-formatting.service';
import { MatTableDataSource } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('GenericTableComponent', () => {
  let component: GenericTableComponent;
  let fixture: ComponentFixture<GenericTableComponent>;
  let mockDateFormattingService: Partial<DateFormattingService>;

  const mockTableData = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      date: '2024-01-15',
      startTime: '2024-01-15T09:00:00',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      date: '2024-01-16',
      startTime: '2024-01-16T10:30:00',
      status: 'inactive'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      date: '2024-01-17',
      startTime: '2024-01-17T08:45:00',
      status: 'pending'
    }
  ];

  beforeEach(() => {
    mockDateFormattingService = {
      formatTableDate: cy.stub().callsFake((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
      }),
      formatTimeShort: cy.stub().callsFake((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      })
    };

    cy.mount(GenericTableComponent, {
      imports: [BrowserAnimationsModule],
      providers: [
        { provide: DateFormattingService, useValue: mockDateFormattingService }
      ]
    }).then((result) => {
      fixture = result.fixture;
      component = result.component;
    });
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      cy.then(() => {
        expect(component).to.exist;
      });
    });

    it('should initialize with empty data source', () => {
      cy.then(() => {
        expect(component.dataSource).to.be.instanceOf(MatTableDataSource);
        expect(component.dataSource.data).to.be.empty;
      });
    });

    it('should have default empty displayed columns', () => {
      cy.then(() => {
        expect(component.displayedColumns).to.be.empty;
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      cy.then(() => {
        component.displayedColumns = ['name', 'email', 'date', 'status'];
        component.data = mockTableData;
        component.ngOnChanges({
          data: {
            currentValue: mockTableData,
            previousValue: [],
            firstChange: true,
            isFirstChange: () => true
          }
        });
        fixture.detectChanges();
      });
    });

    it('should display the correct number of rows', () => {
      cy.get('[data-cy="table-row"]').should('have.length', mockTableData.length);
    });

    it('should display table headers correctly', () => {
      cy.get('th.column-header').should('contain.text', 'Name');
      cy.get('th.column-header').should('contain.text', 'Email');
      cy.get('th.column-header').should('contain.text', 'Date');
      cy.get('th.column-header').should('contain.text', 'Status');
    });

    it('should display data in table cells', () => {
      cy.get('td.column-cell').first().should('contain.text', 'John Doe');
      cy.get('td.column-cell').should('contain.text', 'john@example.com');
      cy.get('td.column-cell').should('contain.text', 'active');
    });

    it('should show "No data available" when data is empty', () => {
      cy.then(() => {
        component.data = [];
        component.ngOnChanges({
          data: {
            currentValue: [],
            previousValue: mockTableData,
            firstChange: false,
            isFirstChange: () => false
          }
        });
        fixture.detectChanges();
      });

      cy.get('.no-data-cell').should('contain.text', 'No data available');
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      cy.then(() => {
        component.displayedColumns = ['name', 'email'];
        component.data = mockTableData;
        component.enableAdd = true;
        component.enableEdit = true;
        component.enableDelete = true;
        component.addButtonLabel = 'Add User';
        component.editButtonLabel = 'Edit';
        component.deleteButtonLabel = 'Delete';
        
        component.addHandler = cy.stub().as('addHandler');
        component.editHandler = cy.stub().as('editHandler');
        component.deleteHandler = cy.stub().as('deleteHandler');
        
        component.ngOnChanges({
          data: {
            currentValue: mockTableData,
            previousValue: [],
            firstChange: true,
            isFirstChange: () => true
          }
        });
        fixture.detectChanges();
      });
    });

    it('should display add button when enableAdd is true', () => {
      cy.get('[data-cy="add-request-button"]').should('exist');
      cy.get('[data-cy="add-request-button"]').should('contain.text', 'Add User');
    });

    it('should call addHandler when add button is clicked', () => {
      cy.get('[data-cy="add-request-button"]').click();
      cy.get('@addHandler').should('have.been.called');
    });

    it('should display edit buttons in action column', () => {
      cy.get('[data-cy="edit-request-button"]').should('have.length', mockTableData.length);
      cy.get('[data-cy="edit-request-button"]').first().should('contain.text', 'Edit');
    });

    it('should display delete buttons in action column', () => {
      cy.get('[data-cy="delete-request-button"]').should('have.length', mockTableData.length);
      cy.get('[data-cy="delete-request-button"]').first().should('contain.text', 'Delete');
    });

    it('should call editHandler with correct data when edit button is clicked', () => {
      cy.get('[data-cy="edit-request-button"]').first().click();
      cy.get('@editHandler').should('have.been.calledWith', mockTableData[0]);
    });

    it('should call deleteHandler with correct data when delete button is clicked', () => {
      cy.get('[data-cy="delete-request-button"]').first().click();
      cy.get('@deleteHandler').should('have.been.calledWith', mockTableData[0]);
    });

    it('should not display action buttons when disabled', () => {
      cy.then(() => {
        component.enableAdd = false;
        component.enableEdit = false;
        component.enableDelete = false;
        fixture.detectChanges();
      });

      cy.get('[data-cy="add-request-button"]').should('not.exist');
      cy.get('[data-cy="edit-request-button"]').should('not.exist');
      cy.get('[data-cy="delete-request-button"]').should('not.exist');
    });
  });

  describe('Column Display Names', () => {
    beforeEach(() => {
      cy.then(() => {
        component.displayedColumns = ['name', 'email', 'status'];
        component.columnDisplayNames = {
          name: 'Full Name',
          email: 'Email Address',
          status: 'Account Status'
        };
        component.data = mockTableData;
        component.ngOnChanges({
          data: {
            currentValue: mockTableData,
            previousValue: [],
            firstChange: true,
            isFirstChange: () => true
          }
        });
        fixture.detectChanges();
      });
    });

    it('should display custom column names when provided', () => {
      cy.get('th.column-header').should('contain.text', 'Full Name');
      cy.get('th.column-header').should('contain.text', 'Email Address');
      cy.get('th.column-header').should('contain.text', 'Account Status');
    });

    it('should fall back to title case when no custom name provided', () => {
      cy.then(() => {
        component.columnDisplayNames = {};
        fixture.detectChanges();
      });

      cy.get('th.column-header').should('contain.text', 'Name');
      cy.get('th.column-header').should('contain.text', 'Email');
      cy.get('th.column-header').should('contain.text', 'Status');
    });
  });

  describe('Date and Time Formatting', () => {
    beforeEach(() => {
      cy.then(() => {
        component.displayedColumns = ['name', 'date', 'startTime'];
        component.data = mockTableData;
        component.ngOnChanges({
          data: {
            currentValue: mockTableData,
            previousValue: [],
            firstChange: true,
            isFirstChange: () => true
          }
        });
        fixture.detectChanges();
      });
    });

    it('should format date columns using DateFormattingService', () => {
      cy.then(() => {
        const formattedDate = component.formatCellValue('2024-01-15', 'date');
        expect(mockDateFormattingService.formatTableDate).to.have.been.calledWith('2024-01-15');
      });
    });

    it('should format time columns using DateFormattingService', () => {
      cy.then(() => {
        const formattedTime = component.formatCellValue('2024-01-15T09:00:00', 'startTime');
        expect(mockDateFormattingService.formatTimeShort).to.have.been.calledWith('2024-01-15T09:00:00');
      });
    });

    it('should return original value for non-date columns', () => {
      cy.then(() => {
        const result = component.formatCellValue('John Doe', 'name');
        expect(result).to.equal('John Doe');
      });
    });

    it('should handle empty values gracefully', () => {
      cy.then(() => {
        const result = component.formatCellValue('', 'date');
        expect(result).to.equal('');
        
        const nullResult = component.formatCellValue(null, 'date');
        expect(nullResult).to.equal('');
      });
    });
  });

  describe('Context Menu', () => {
    beforeEach(() => {
      cy.then(() => {
        component.displayedColumns = ['name', 'email'];
        component.data = mockTableData;
        component.enableEdit = true;
        component.enableDelete = true;
        component.editHandler = cy.stub().as('contextEditHandler');
        component.deleteHandler = cy.stub().as('contextDeleteHandler');
        
        component.ngOnChanges({
          data: {
            currentValue: mockTableData,
            previousValue: [],
            firstChange: true,
            isFirstChange: () => true
          }
        });
        fixture.detectChanges();
      });
    });

    it('should show context menu on right click', () => {
      cy.get('td.column-cell').first().rightclick();
      cy.get('.context-menu').should('be.visible');
    });

    it('should call edit handler from context menu', () => {
      cy.get('td.column-cell').first().rightclick();
      cy.get('.context-menu button').contains('Edit').click();
      cy.get('@contextEditHandler').should('have.been.calledWith', mockTableData[0]);
    });

    it('should call delete handler from context menu', () => {
      cy.get('td.column-cell').first().rightclick();
      cy.get('.context-menu button').contains('Delete').click();
      cy.get('@contextDeleteHandler').should('have.been.calledWith', mockTableData[0]);
    });
  });

  describe('computedColumns getter', () => {
    it('should include actions column when edit or delete is enabled', () => {
      cy.then(() => {
        component.displayedColumns = ['name', 'email'];
        component.enableEdit = true;
        component.enableDelete = false;
        
        const computed = component.computedColumns;
        expect(computed).to.include('actions');
        expect(computed).to.deep.equal(['name', 'email', 'actions']);
      });
    });

    it('should not include actions column when both edit and delete are disabled', () => {
      cy.then(() => {
        component.displayedColumns = ['name', 'email'];
        component.enableEdit = false;
        component.enableDelete = false;
        
        const computed = component.computedColumns;
        expect(computed).to.not.include('actions');
        expect(computed).to.deep.equal(['name', 'email']);
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      const largeDataSet = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        status: i % 2 === 0 ? 'active' : 'inactive'
      }));

      cy.then(() => {
        component.displayedColumns = ['name', 'email', 'status'];
        component.data = largeDataSet;
        component.pageSizeOptions = [5, 10, 25];
        component.ngOnChanges({
          data: {
            currentValue: largeDataSet,
            previousValue: [],
            firstChange: true,
            isFirstChange: () => true
          }
        });
        fixture.detectChanges();
      });
    });

    it('should display paginator when there is data', () => {
      cy.get('mat-paginator').should('exist');
    });

    it('should respect page size options', () => {
      cy.get('mat-paginator').should('exist');
      cy.then(() => {
        expect(component.pageSizeOptions).to.deep.equal([5, 10, 25]);
      });
    });
  });
});
