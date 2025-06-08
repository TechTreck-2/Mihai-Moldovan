import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayPageComponent } from './holiday-page.component';

describe('HolidayPageComponent', () => {
  let component: HolidayPageComponent;
  let fixture: ComponentFixture<HolidayPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HolidayPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HolidayPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
