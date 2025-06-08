import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockInPopupComponent } from './per-day-modify-clockin.component';

describe('PerDayModifyClockinComponent', () => {
  let component: ClockInPopupComponent;
  let fixture: ComponentFixture<ClockInPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockInPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClockInPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
