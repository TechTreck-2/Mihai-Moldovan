import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsencePageComponent } from './absence-page.component';

describe('AbsencePageComponent', () => {
  let component: AbsencePageComponent;
  let fixture: ComponentFixture<AbsencePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbsencePageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AbsencePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
