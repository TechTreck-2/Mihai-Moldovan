import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerDayClockinsComponent } from './per-day-clockins.component';

describe('PerDayClockinsComponent', () => {
  let component: PerDayClockinsComponent;
  let fixture: ComponentFixture<PerDayClockinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerDayClockinsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerDayClockinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
