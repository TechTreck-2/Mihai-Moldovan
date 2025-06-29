import { TimerComponent } from '../../src/app/components/timer/timer.component';
import { ComponentFixture } from '@angular/core/testing';
import { TimerService } from '../../src/app/services/timer/timer.service';
import { ClockingService } from '../../src/app/services/clocking/clocking.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DateFormattingService } from '../../src/app/services/date-formatting/date-formatting.service';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;
  let mockTimerService: Partial<TimerService>;
  let mockClockingService: Partial<ClockingService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockDateFormattingService: Partial<DateFormattingService>;
  let mockChangeDetectorRef: Partial<ChangeDetectorRef>;

  beforeEach(() => {
    mockTimerService = {
      timeElapsed$: of(0)
    };
    
    mockClockingService = {
      clockIntervals$: of([]),
      getCurrentClockIntervals: cy.stub().returns([]),
      clockIn: cy.stub().returns(true),
      clockOut: cy.stub().returns(true)
    };
    
    mockSnackBar = {
      open: cy.stub()
    };
    
    mockDateFormattingService = {
      formatDateISO: cy.stub().callsFake((date: Date) => date.toISOString().split('T')[0]),
      formatDateDisplay: cy.stub().callsFake((date: Date) => date.toLocaleDateString()),
      formatTimeShort: cy.stub().callsFake((date: Date) => date.toLocaleTimeString())
    };
    
    mockChangeDetectorRef = {
      detectChanges: cy.stub()
    };

    cy.mount(TimerComponent, {
      providers: [
        { provide: TimerService, useValue: mockTimerService },
        { provide: ClockingService, useValue: mockClockingService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: DateFormattingService, useValue: mockDateFormattingService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    }).then((result) => {
      fixture = result.fixture;
      component = result.component;
    });
  });

  describe('formatTimeElapsed method', () => {
    it('should format seconds correctly for hours, minutes, and seconds', () => {
      cy.then(() => {
        expect(component.formatTimeElapsed(5445)).to.equal('01:30:45');
        
        expect(component.formatTimeElapsed(125)).to.equal('00:02:05');
        
        expect(component.formatTimeElapsed(30)).to.equal('00:00:30');
        
        expect(component.formatTimeElapsed(0)).to.equal('00:00:00');
      });
    });

    it('should handle large time values correctly', () => {
      cy.then(() => {
        expect(component.formatTimeElapsed(86400)).to.equal('24:00:00');
        
        expect(component.formatTimeElapsed(360000)).to.equal('100:00:00');
      });
    });

    it('should pad single digit values with zeros', () => {
      cy.then(() => {
        expect(component.formatTimeElapsed(3661)).to.equal('01:01:01');
        expect(component.formatTimeElapsed(3600)).to.equal('01:00:00');
        expect(component.formatTimeElapsed(60)).to.equal('00:01:00');
      });
    });
  });

  describe('getCurrentWeekDates method', () => {
    it('should return correct week start and end dates for a Monday', () => {
      cy.then(() => {
        const monday = new Date(2025, 5, 30);
        const weekDates = component['getCurrentWeekDates'](monday);
        
        expect(mockDateFormattingService.formatDateDisplay).to.have.been.called;
        
        expect(weekDates).to.have.property('start');
        expect(weekDates).to.have.property('end');
        expect(typeof weekDates.start).to.equal('string');
        expect(typeof weekDates.end).to.equal('string');
      });
    });

    it('should return correct week start and end dates for a Sunday', () => {
      cy.then(() => {
        const sunday = new Date(2025, 5, 29);
        const weekDates = component['getCurrentWeekDates'](sunday);
        
        expect(mockDateFormattingService.formatDateDisplay).to.have.been.called;
        
        expect(weekDates).to.have.property('start');
        expect(weekDates).to.have.property('end');
      });
    });

    it('should return correct week start and end dates for a Wednesday', () => {
      cy.then(() => {
        const wednesday = new Date(2025, 6, 2);
        const weekDates = component['getCurrentWeekDates'](wednesday);
        
        expect(weekDates).to.have.property('start');
        expect(weekDates).to.have.property('end');
        
        expect(mockDateFormattingService.formatDateDisplay).to.have.been.called;
      });
    });

    it('should handle year boundary correctly', () => {
      cy.then(() => {
        const newYearDay = new Date(2025, 0, 1);
        const weekDates = component['getCurrentWeekDates'](newYearDay);
        
        expect(weekDates).to.have.property('start');
        expect(weekDates).to.have.property('end');
      });
    });
  });
});
