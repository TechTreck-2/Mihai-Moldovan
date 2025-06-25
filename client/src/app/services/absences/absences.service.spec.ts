import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AbsencesService, AbsenceRequest } from './absences.service';
import { AuthService } from '../auth/auth.service';
import { of, Subject, throwError } from 'rxjs';

describe('AbsencesService', () => {
  let service: AbsencesService;
  let httpMock: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let userLogoutSubject: Subject<void>;
  let userLoginSubject: Subject<string>;

  const mockAbsencePayloads = [
    {
      id: 1,
      date: '2025-06-25',
      startTime: '09:00',
      endTime: '17:00',
      description: 'Vacation day',
      status: 'approved'
    },
    {
      id: 2,
      date: '2025-06-26',
      startTime: '14:00',
      endTime: '18:00',
      description: 'Doctor appointment',
      status: 'pending'
    }
  ];

  const mockAbsenceRequests: AbsenceRequest[] = [
    {
      id: 1,
      startDateTime: new Date('2025-06-25T09:00'),
      endDateTime: new Date('2025-06-25T17:00'),
      description: 'Vacation day',
      status: 'approved'
    },
    {
      id: 2,
      startDateTime: new Date('2025-06-26T14:00'),
      endDateTime: new Date('2025-06-26T18:00'),
      description: 'Doctor appointment',
      status: 'pending'
    }
  ];

  beforeEach(() => {
    userLogoutSubject = new Subject<void>();
    userLoginSubject = new Subject<string>();

    authServiceMock = jasmine.createSpyObj('AuthService', [], {
      userLogout$: userLogoutSubject.asObservable(),
      userLogin$: userLoginSubject.asObservable()
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AbsencesService,
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(AbsencesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created and load absences on init', () => {
      expect(service).toBeTruthy();
      
      const req = httpMock.expectOne('http://localhost:3000/absences');
      expect(req.request.method).toBe('GET');
      req.flush(mockAbsencePayloads);
    });

    it('should clear absences on user logout', () => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush(mockAbsencePayloads);

      let currentAbsences: AbsenceRequest[] = [];
      service.absences$.subscribe(absences => currentAbsences = absences);

      userLogoutSubject.next();

      expect(currentAbsences).toEqual([]);
    });

    it('should reload absences on user login', () => {
      const initialReq = httpMock.expectOne('http://localhost:3000/absences');
      initialReq.flush([]);

      userLoginSubject.next('testuser');

      const loginReq = httpMock.expectOne('http://localhost:3000/absences');
      expect(loginReq.request.method).toBe('GET');
      loginReq.flush(mockAbsencePayloads);
    });
  });

  describe('createAbsence method', () => {
    beforeEach(() => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush([]);
    });

    it('should create absence with valid form data and expect correct backend payload', () => {
      const formDate = '2025-07-01';
      const formStartTime = '10:00';
      const formEndTime = '16:00';
      const formDescription = 'Personal leave';

      const expectedPayload = {
        date: '2025-07-01',
        startTime: '10:00',
        endTime: '16:00',
        description: 'Personal leave',
        status: 'pending'
      };

      service.createAbsence(formDate, formStartTime, formEndTime, formDescription);

      const postReq = httpMock.expectOne('http://localhost:3000/absences');
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual(expectedPayload);
      
      postReq.flush({ id: 3, ...expectedPayload });

      const reloadReq = httpMock.expectOne('http://localhost:3000/absences');
      expect(reloadReq.request.method).toBe('GET');
      reloadReq.flush([{ id: 3, ...expectedPayload }]);
    });

    it('should handle creation with different time formats', () => {
      const formDate = '2025-12-25';
      const formStartTime = '08:30';
      const formEndTime = '17:30';
      const formDescription = 'Holiday break';

      const expectedPayload = {
        date: '2025-12-25',
        startTime: '08:30',
        endTime: '17:30',
        description: 'Holiday break',
        status: 'pending'
      };

      service.createAbsence(formDate, formStartTime, formEndTime, formDescription);

      const postReq = httpMock.expectOne('http://localhost:3000/absences');
      expect(postReq.request.body).toEqual(expectedPayload);
      postReq.flush({ id: 4, ...expectedPayload });

      const reloadReq = httpMock.expectOne('http://localhost:3000/absences');
      reloadReq.flush([]);
    });

    it('should handle server error during creation', () => {
      spyOn(console, 'error');
      
      service.createAbsence('2025-07-01', '09:00', '17:00', 'Test');

      const postReq = httpMock.expectOne('http://localhost:3000/absences');
      postReq.error(new ErrorEvent('Network error'));

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('updateAbsence method', () => {
    beforeEach(() => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush(mockAbsencePayloads);
    });

    it('should update absence and convert request to backend payload format', () => {
      const updatedRequest: AbsenceRequest = {
        id: 1,
        startDateTime: new Date('2025-06-25T10:30'),
        endDateTime: new Date('2025-06-25T15:30'),
        description: 'Updated vacation day',
        status: 'approved'
      };

      const expectedPayload = {
        id: 1,
        date: '2025-06-25',
        startTime: '10:30',
        endTime: '15:30',
        description: 'Updated vacation day',
        status: 'approved'
      };

      service.updateAbsence(updatedRequest);

      const putReq = httpMock.expectOne('http://localhost:3000/absences/1');
      expect(putReq.request.method).toBe('PUT');
      expect(putReq.request.body).toEqual(expectedPayload);
      
      putReq.flush(expectedPayload);

      const reloadReq = httpMock.expectOne('http://localhost:3000/absences');
      reloadReq.flush([expectedPayload]);
    });

    it('should handle update with different status values', () => {
      const updatedRequest: AbsenceRequest = {
        id: 2,
        startDateTime: new Date('2025-06-26T08:00'),
        endDateTime: new Date('2025-06-26T12:00'),
        description: 'Medical appointment - updated',
        status: 'denied'
      };

      const expectedPayload = {
        id: 2,
        date: '2025-06-26',
        startTime: '08:00',
        endTime: '12:00',
        description: 'Medical appointment - updated',
        status: 'denied'
      };

      service.updateAbsence(updatedRequest);

      const putReq = httpMock.expectOne('http://localhost:3000/absences/2');
      expect(putReq.request.body).toEqual(expectedPayload);
      putReq.flush(expectedPayload);

      const reloadReq = httpMock.expectOne('http://localhost:3000/absences');
      reloadReq.flush([]);
    });

    it('should handle cross-day absence update', () => {
      const updatedRequest: AbsenceRequest = {
        id: 3,
        startDateTime: new Date('2025-07-01T23:30'),
        endDateTime: new Date('2025-07-02T01:30'),
        description: 'Night shift absence',
        status: 'pending'
      };

      const expectedPayload = {
        id: 3,
        date: '2025-07-01',
        startTime: '23:30',
        endTime: '01:30',
        description: 'Night shift absence',
        status: 'pending'
      };

      service.updateAbsence(updatedRequest);

      const putReq = httpMock.expectOne('http://localhost:3000/absences/3');
      expect(putReq.request.body).toEqual(expectedPayload);
      putReq.flush(expectedPayload);

      const reloadReq = httpMock.expectOne('http://localhost:3000/absences');
      reloadReq.flush([]);
    });

    it('should handle server error during update', () => {
      spyOn(console, 'error');
      
      const updatedRequest: AbsenceRequest = {
        id: 1,
        startDateTime: new Date('2025-06-25T10:00'),
        endDateTime: new Date('2025-06-25T16:00'),
        description: 'Test update',
        status: 'pending'
      };

      service.updateAbsence(updatedRequest);

      const putReq = httpMock.expectOne('http://localhost:3000/absences/1');
      putReq.error(new ErrorEvent('Server error'));      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('deleteAbsence method', () => {
    beforeEach(() => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush(mockAbsencePayloads);
    });

    it('should delete absence and update local state immediately', () => {
      const absenceIdToDelete = 1;

      service.deleteAbsence(absenceIdToDelete);

      const deleteReq = httpMock.expectOne(`http://localhost:3000/absences/${absenceIdToDelete}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      let currentAbsences: AbsenceRequest[] = [];
      service.absences$.subscribe(absences => currentAbsences = absences);

      expect(currentAbsences.length).toBe(1);
      expect(currentAbsences.find(a => a.id === absenceIdToDelete)).toBeUndefined();
    });

    it('should handle deletion of non-existent absence', () => {
      const nonExistentId = 999;

      service.deleteAbsence(nonExistentId);

      const deleteReq = httpMock.expectOne(`http://localhost:3000/absences/${nonExistentId}`);
      expect(deleteReq.request.method).toBe('DELETE');
      deleteReq.flush(null);

      let currentAbsences: AbsenceRequest[] = [];
      service.absences$.subscribe(absences => currentAbsences = absences);

      expect(currentAbsences.length).toBe(2);
    });

    it('should handle server error during deletion', () => {
      spyOn(console, 'error');
      
      service.deleteAbsence(1);

      const deleteReq = httpMock.expectOne('http://localhost:3000/absences/1');
      deleteReq.error(new ErrorEvent('Server error'));

      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Data Transformation', () => {
    it('should correctly transform backend payload to frontend request format', () => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush(mockAbsencePayloads);

      let receivedAbsences: AbsenceRequest[] = [];
      service.absences$.subscribe(absences => receivedAbsences = absences);

      expect(receivedAbsences).toEqual(mockAbsenceRequests);
    });

    it('should handle payload with missing status', () => {
      const payloadWithoutStatus = {
        id: 5,
        date: '2025-07-01',
        startTime: '09:00',
        endTime: '17:00',
        description: 'No status specified'
      };

      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush([payloadWithoutStatus]);

      let receivedAbsences: AbsenceRequest[] = [];
      service.absences$.subscribe(absences => receivedAbsences = absences);

      expect(receivedAbsences[0].status).toBe('pending');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush([]);
    });

    it('should handle network errors gracefully', () => {
      spyOn(console, 'error');
      
      service.createAbsence('2025-07-01', '09:00', '17:00', 'Test');

      const postReq = httpMock.expectOne('http://localhost:3000/absences');
      postReq.error(new ErrorEvent('Network error'));

      expect(console.error).toHaveBeenCalledWith('API Error: ', jasmine.any(Object));
    });

    it('should mark handled errors appropriately', () => {
      let caughtError: any;
      
      service.createAbsence('2025-07-01', '09:00', '17:00', 'Test');

      const postReq = httpMock.expectOne('http://localhost:3000/absences');
      postReq.error(new ErrorEvent('Test error'));

      expect(service.absences$).toBeDefined();
    });
  });

  describe('Observable Behavior', () => {
    beforeEach(() => {
      const req = httpMock.expectOne('http://localhost:3000/absences');
      req.flush(mockAbsencePayloads);
    });

    it('should emit updated absences after successful operations', () => {
      let emittedAbsences: AbsenceRequest[][] = [];
      service.absences$.subscribe(absences => emittedAbsences.push([...absences]));

      service.createAbsence('2025-07-01', '09:00', '17:00', 'New absence');

      const postReq = httpMock.expectOne('http://localhost:3000/absences');
      postReq.flush({ id: 3, date: '2025-07-01', startTime: '09:00', endTime: '17:00', description: 'New absence', status: 'pending' });

      const reloadReq = httpMock.expectOne('http://localhost:3000/absences');
      const updatedPayloads = [...mockAbsencePayloads, { id: 3, date: '2025-07-01', startTime: '09:00', endTime: '17:00', description: 'New absence', status: 'pending' }];
      reloadReq.flush(updatedPayloads);

      expect(emittedAbsences.length).toBeGreaterThan(1);
      expect(emittedAbsences[emittedAbsences.length - 1].length).toBe(3);
    });
  });
});
