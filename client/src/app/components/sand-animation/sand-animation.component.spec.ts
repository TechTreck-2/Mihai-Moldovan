import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SandAnimationComponent } from './sand-animation.component';

describe('SandAnimationComponent', () => {
  let component: SandAnimationComponent;
  let fixture: ComponentFixture<SandAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SandAnimationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SandAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
