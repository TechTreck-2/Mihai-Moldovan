import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericTableCalendarViewComponent } from './generic-table-calendar-view.component';

describe('GenericTableCalendarViewComponent', () => {
  let component: GenericTableCalendarViewComponent;
  let fixture: ComponentFixture<GenericTableCalendarViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericTableCalendarViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GenericTableCalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
