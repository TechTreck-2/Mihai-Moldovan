import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyClockingPageComponent } from './modify-clocking-page.component';

describe('ModifyClockingPageComponent', () => {
  let component: ModifyClockingPageComponent;
  let fixture: ComponentFixture<ModifyClockingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyClockingPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyClockingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
