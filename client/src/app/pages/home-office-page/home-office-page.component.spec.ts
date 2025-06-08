import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeOfficeMapComponent } from './home-office-page.component';

describe('HomeOfficePageComponent', () => {
  let component: HomeOfficeMapComponent;
  let fixture: ComponentFixture<HomeOfficeMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeOfficeMapComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeOfficeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
