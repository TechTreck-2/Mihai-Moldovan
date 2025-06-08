import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeOfficeRequestPageComponent } from './home-office-request-page.component';

describe('HomeOfficeRequestPageComponent', () => {
  let component: HomeOfficeRequestPageComponent;
  let fixture: ComponentFixture<HomeOfficeRequestPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeOfficeRequestPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HomeOfficeRequestPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
