import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyClockingComponent } from './modify-clocking.component';

describe('ModifyClockingComponent', () => {
  let component: ModifyClockingComponent;
  let fixture: ComponentFixture<ModifyClockingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyClockingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModifyClockingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
