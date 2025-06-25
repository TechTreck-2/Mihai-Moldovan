import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { ApiService } from '../api/api.service';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let apiServiceMock: jasmine.SpyObj<ApiService>;
  let localStorageServiceMock: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    apiServiceMock = jasmine.createSpyObj('ApiService', ['post']);
    localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', 
      ['saveData', 'getData', 'removeData'], {}
    );

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: apiServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });    it('should initialize with correct authentication state when token exists', () => {
      localStorageServiceMock.getData.and.returnValue('mock-token');
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: ApiService, useValue: apiServiceMock },
          { provide: LocalStorageService, useValue: localStorageServiceMock }
        ]
      });
      
      service = TestBed.inject(AuthService);
      
      let isAuthenticated: boolean = false;
      service.isAuthenticated$.subscribe(auth => isAuthenticated = auth);
      
      expect(isAuthenticated).toBe(true);
    });    it('should initialize with correct authentication state when no token exists', () => {
      localStorageServiceMock.getData.and.returnValue(null);
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: ApiService, useValue: apiServiceMock },
          { provide: LocalStorageService, useValue: localStorageServiceMock }
        ]
      });
      
      service = TestBed.inject(AuthService);
      
      let isAuthenticated: boolean = true;
      service.isAuthenticated$.subscribe(auth => isAuthenticated = auth);
      
      expect(isAuthenticated).toBe(false);
    });
  });

  describe('login method - Form Data to Backend Payload', () => {
    it('should transform login form data to correct backend payload and handle successful response', () => {
      const formUsername = 'testuser@example.com';
      const formPassword = 'securePassword123';
      
      const expectedLoginPayload = {
        username: 'testuser@example.com',
        password: 'securePassword123'
      };

      const mockAuthResponse = {
        access_token: 'jwt-token-12345'
      };

      apiServiceMock.post.and.returnValue(of(mockAuthResponse));

      let loginResult: boolean | undefined;
      service.login(formUsername, formPassword).subscribe(result => loginResult = result);

      expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/login', expectedLoginPayload);
      
      expect(loginResult).toBe(true);
      
      expect(localStorageServiceMock.saveData).toHaveBeenCalledWith('JWT_TOKEN', 'jwt-token-12345');
      expect(localStorageServiceMock.saveData).toHaveBeenCalledWith('CURRENT_USER', 'testuser@example.com');
    });

    it('should handle login with different credential formats', () => {
      const formUsername = 'admin';
      const formPassword = 'admin123';
      
      const expectedPayload = {
        username: 'admin',
        password: 'admin123'
      };

      const mockResponse = { access_token: 'admin-token-xyz' };
      apiServiceMock.post.and.returnValue(of(mockResponse));

      service.login(formUsername, formPassword).subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/login', expectedPayload);
    });

    it('should emit authentication state changes on successful login', () => {
      const mockResponse = { access_token: 'test-token' };
      apiServiceMock.post.and.returnValue(of(mockResponse));

      let authStates: boolean[] = [];
      service.isAuthenticated$.subscribe(state => authStates.push(state));

      let loginEvents: string[] = [];
      service.userLogin$.subscribe(username => loginEvents.push(username));

      service.login('user@test.com', 'password').subscribe();

      expect(authStates).toContain(true);
      expect(loginEvents).toContain('user@test.com');
    });

    it('should handle login failure and return false', () => {
      const loginError = { error: 'Invalid credentials' };
      apiServiceMock.post.and.returnValue(throwError(() => loginError));
      spyOn(console, 'error');

      let loginResult: boolean | undefined;
      service.login('wrong@user.com', 'wrongpass').subscribe(result => loginResult = result);

      expect(loginResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Login error:', loginError);
      expect(localStorageServiceMock.saveData).not.toHaveBeenCalled();
    });

    it('should handle network errors during login', () => {
      const networkError = new Error('Network connection failed');
      apiServiceMock.post.and.returnValue(throwError(() => networkError));
      spyOn(console, 'error');

      let loginResult: boolean | undefined;
      service.login('user@test.com', 'password').subscribe(result => loginResult = result);

      expect(loginResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Login error:', networkError);
    });
  });

  describe('register method - Form Data to Backend Payload', () => {
    it('should transform registration form data to correct backend payload', () => {
      const formUsername = 'newuser@example.com';
      const formPassword = 'newPassword123!';
      
      const expectedRegisterPayload = {
        username: 'newuser@example.com',
        password: 'newPassword123!'
      };

      apiServiceMock.post.and.returnValue(of({ message: 'User created successfully' }));

      let registerResult: boolean | undefined;
      service.register(formUsername, formPassword).subscribe(result => registerResult = result);

      expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/register', expectedRegisterPayload);
      expect(registerResult).toBe(true);
    });

    it('should handle registration with special characters in credentials', () => {
      const formUsername = 'user+test@domain.co.uk';
      const formPassword = 'P@ssw0rd!#$';
      
      const expectedPayload = {
        username: 'user+test@domain.co.uk',
        password: 'P@ssw0rd!#$'
      };

      apiServiceMock.post.and.returnValue(of({}));

      service.register(formUsername, formPassword).subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/register', expectedPayload);
    });

    it('should handle registration failure', () => {
      const registrationError = { error: 'Username already exists' };
      apiServiceMock.post.and.returnValue(throwError(() => registrationError));
      spyOn(console, 'error');

      let registerResult: boolean | undefined;
      service.register('existing@user.com', 'password').subscribe(result => registerResult = result);

      expect(registerResult).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Registration error:', registrationError);
    });
  });
  describe('logout method', () => {
    beforeEach(() => {
      localStorageServiceMock.getData.and.returnValue('mock-token');
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthService,
          { provide: ApiService, useValue: apiServiceMock },
          { provide: LocalStorageService, useValue: localStorageServiceMock }
        ]
      });
      
      service = TestBed.inject(AuthService);
    });    it('should clear user data and emit logout event', () => {
      let logoutEvents: void[] = [];
      let authStates: boolean[] = [];
      
      service.userLogout$.subscribe(() => logoutEvents.push(undefined));
      service.isAuthenticated$.subscribe(state => authStates.push(state));

      service.logout();

      expect(localStorageServiceMock.removeData).toHaveBeenCalledWith('JWT_TOKEN');
      expect(localStorageServiceMock.removeData).toHaveBeenCalledWith('CURRENT_USER');
      expect(logoutEvents.length).toBe(1);
      expect(authStates).toContain(false);
    });
  });

  describe('Token and User Management', () => {
    it('should return current user when stored', () => {
      localStorageServiceMock.getData.and.returnValue('stored-user@test.com');
      
      const currentUser = service.getCurrentUser();
      
      expect(currentUser).toBe('stored-user@test.com');
      expect(localStorageServiceMock.getData).toHaveBeenCalledWith('CURRENT_USER');
    });

    it('should return null when no user is stored', () => {
      localStorageServiceMock.getData.and.returnValue(null);
      
      const currentUser = service.getCurrentUser();
      
      expect(currentUser).toBeNull();
    });

    it('should return token when stored', () => {
      localStorageServiceMock.getData.and.returnValue('stored-jwt-token');
      
      const token = service.getToken();
      
      expect(token).toBe('stored-jwt-token');
      expect(localStorageServiceMock.getData).toHaveBeenCalledWith('JWT_TOKEN');
    });

    it('should return null when no token is stored', () => {
      localStorageServiceMock.getData.and.returnValue(null);
      
      const token = service.getToken();
      
      expect(token).toBeNull();
    });

    it('should correctly identify logged in state', () => {
      localStorageServiceMock.getData.and.returnValue('valid-token');
      
      const isLoggedIn = service.isLoggedIn();
      
      expect(isLoggedIn).toBe(true);
    });

    it('should correctly identify logged out state', () => {
      localStorageServiceMock.getData.and.returnValue(null);
      
      const isLoggedIn = service.isLoggedIn();
      
      expect(isLoggedIn).toBe(false);
    });
  });

  describe('Observable Streams', () => {
    it('should emit authentication state changes correctly', () => {
      localStorageServiceMock.getData.and.returnValue(null);
      service = TestBed.inject(AuthService);

      let authStates: boolean[] = [];
      service.isAuthenticated$.subscribe(state => authStates.push(state));

      const mockResponse = { access_token: 'new-token' };
      apiServiceMock.post.and.returnValue(of(mockResponse));
      service.login('user@test.com', 'password').subscribe();

      service.logout();

      expect(authStates).toEqual([false, true, false]);
    });

    it('should emit user login events with correct username', () => {
      const mockResponse = { access_token: 'test-token' };
      apiServiceMock.post.and.returnValue(of(mockResponse));

      let loginEvents: string[] = [];
      service.userLogin$.subscribe(username => loginEvents.push(username));

      service.login('first@user.com', 'password1').subscribe();
      service.login('second@user.com', 'password2').subscribe();

      expect(loginEvents).toEqual(['first@user.com', 'second@user.com']);
    });

    it('should emit logout events correctly', () => {
      let logoutCount = 0;
      service.userLogout$.subscribe(() => logoutCount++);

      service.logout();
      service.logout();

      expect(logoutCount).toBe(2);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty credentials in login', () => {
      const expectedPayload = { username: '', password: '' };
      apiServiceMock.post.and.returnValue(of({ access_token: 'token' }));

      service.login('', '').subscribe();

      expect(apiServiceMock.post).toHaveBeenCalledWith('/auth/login', expectedPayload);
    });

    it('should handle malformed API responses', () => {
      const malformedResponse = { user: 'test' };
      apiServiceMock.post.and.returnValue(of(malformedResponse as any));

      let loginResult: boolean | undefined;
      service.login('user@test.com', 'password').subscribe(result => loginResult = result);

      expect(loginResult).toBe(true);
    });

    it('should maintain state consistency during multiple operations', () => {
      localStorageServiceMock.getData.and.returnValue(null);
      service = TestBed.inject(AuthService);

      let currentState: boolean = true;
      service.isAuthenticated$.subscribe(state => currentState = state);

      expect(currentState).toBe(false);

      const mockResponse = { access_token: 'token' };
      apiServiceMock.post.and.returnValue(of(mockResponse));
      service.login('user@test.com', 'password').subscribe();
      expect(currentState).toBe(true);

      service.logout();
      expect(currentState).toBe(false);

      service.logout();
      expect(currentState).toBe(false);
    });
  });
});
