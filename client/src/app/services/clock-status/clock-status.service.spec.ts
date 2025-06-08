import { TestBed } from '@angular/core/testing';

import { ClockStatusService } from './clock-status.service';

describe('ClockStatusService', () => {
  let service: ClockStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClockStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
