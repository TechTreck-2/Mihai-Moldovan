import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockingPageComponent } from './clocking-page.component';

describe('ClockingPageComponent', () => {
  let component: ClockingPageComponent;
  let fixture: ComponentFixture<ClockingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockingPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClockingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
