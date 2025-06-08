import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CronographTimerComponent } from './cronograph-timer.component';

describe('CronographTimerComponent', () => {
  let component: CronographTimerComponent;
  let fixture: ComponentFixture<CronographTimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CronographTimerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CronographTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
