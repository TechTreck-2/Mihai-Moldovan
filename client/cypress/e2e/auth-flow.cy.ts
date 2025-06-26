describe('User Authentication Flow', () => {

  beforeEach(() => {
    cy.visit('/login');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.clearAllSessionStorage();
  });

  context('Login Process', () => {
    it('should display login page correctly and have disabled button', () => {
      cy.get('[data-cy="login-card"]').should('be.visible');
      cy.get('[data-cy="username-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
      cy.contains('div[role="tab"]', 'Register').should('be.visible');

      cy.get('[data-cy="username-input"]').should('have.value', '');
      cy.get('[data-cy="password-input"]').should('have.value', '');
      cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should show validation errors for required fields', () => {
      cy.get('[data-cy="username-input"]').focus().blur();
      cy.get('[data-cy="username-required-error"]').should('be.visible').and('contain.text', 'Username is required');

      cy.get('[data-cy="password-input"]').focus().blur();
      cy.get('[data-cy="password-required-error"]').should('be.visible').and('contain.text', 'Password is required');

      cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should show validation error for invalid email format', () => {
      cy.get('[data-cy="username-input"]').type('invalid-email').blur();
      cy.get('[data-cy="username-email-error"]').should('be.visible').and('contain.text', 'Please enter a valid email');
      cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should successfully login with valid credentials and redirect', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          access_token: 'mock-jwt-token-12345',
          user: { username: 'testuser@example.com', id: 1 }
        }
      }).as('loginRequest');

      cy.get('[data-cy="username-input"]').type('testuser@example.com');
      cy.get('[data-cy="password-input"]').type('validPassword123');
      cy.get('[data-cy="login-button"]').should('not.be.disabled');
      cy.get('[data-cy="login-button"]').click();

      cy.get('[data-cy="login-spinner"]').should('be.visible');
      
      cy.wait('@loginRequest');
      
      cy.url().should('include', '/clocking');
      cy.window().its('localStorage').invoke('getItem', 'JWT_TOKEN').should('exist');
    });

    it('should handle login failure with an error message', () => {
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }).as('loginRequest');

      cy.get('[data-cy="username-input"]').type('testuser@example.com');
      cy.get('[data-cy="password-input"]').type('wrongPassword');
      cy.get('[data-cy="login-button"]').click();
      cy.wait('@loginRequest');

      cy.get('[data-cy="error-message"]').should('be.visible').and('contain.text', 'Invalid credentials');
      cy.url().should('include', '/login');
      cy.window().its('localStorage').invoke('getItem', 'JWT_TOKEN').should('not.exist');
    });

    it('should toggle password visibility', () => {
      cy.get('[data-cy="password-input"]').type('testPassword');
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
      cy.get('[data-cy="password-toggle"]').click();
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'text');
      cy.get('[data-cy="password-toggle"]').click();
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
    });
  });

  context('Registration Process', () => {
    beforeEach(() => {
      cy.contains('div[role="tab"]', 'Register').click();
    });

    it('should display the registration form correctly', () => {
      cy.get('[data-cy="register-username-input"]').should('be.visible');
      cy.get('[data-cy="register-password-input"]').should('be.visible');
      cy.get('[data-cy="register-confirm-password-input"]').should('be.visible');
      cy.get('[data-cy="register-button"]').should('be.visible').and('be.disabled');
    });

    it('should show validation errors for required fields and password mismatch', () => {
        cy.get('[data-cy="register-username-input"]').focus().blur();
        cy.get('[data-cy="register-username-required-error"]').should('be.visible');

        cy.get('[data-cy="register-password-input"]').focus().blur();
        cy.get('[data-cy="register-password-required-error"]').should('be.visible');

        cy.get('[data-cy="register-password-input"]').type('123').blur();
        cy.get('[data-cy="register-password-minlength-error"]').should('be.visible');

        cy.get('[data-cy="register-password-input"]').clear().type('password123');
        cy.get('[data-cy="register-confirm-password-input"]').type('differentPassword').blur();
        cy.get('[data-cy="password-mismatch-error"]').should('be.visible').and('contain.text', "Passwords don't match");
        cy.get('[data-cy="register-button"]').should('be.disabled');
    });    it('should successfully register a new user', () => {
      cy.intercept('POST', '**/auth/register', {
        statusCode: 201,
        body: {
          message: 'User registered successfully',
          user: { username: 'newuser@example.com', id: 2 }
        },
        delay: 100
      }).as('registerRequest');

      cy.get('[data-cy="register-username-input"]').type('newuser@example.com');
      cy.get('[data-cy="register-password-input"]').type('newPassword123');
      cy.get('[data-cy="register-confirm-password-input"]').type('newPassword123');
      cy.get('[data-cy="register-button"]').should('not.be.disabled');
      cy.get('[data-cy="register-button"]').click();
      
      cy.get('[data-cy="register-spinner"]').should('be.visible');
      
      cy.wait('@registerRequest');

      cy.get('[data-cy="registration-success"]').should('be.visible').and('contain.text', 'Registration successful');
    });
  });

  context('Route Protection and Session Management', () => {
    it('should redirect unauthenticated users from a protected route to login', () => {
      cy.visit('/clocking');
      cy.url().should('include', '/login');
    });    it('should allow authenticated users to access a protected route', () => {
      cy.window().then((win) => {
        win.localStorage.setItem('JWT_TOKEN', 'mock-jwt-token');
        win.localStorage.setItem('CURRENT_USER', 'testuser@example.com');
      });
      cy.intercept('GET', '**/clockings', { statusCode: 200, body: [] }).as('getClockings');
      
      cy.visit('/clocking');
      cy.url().should('include', '/clocking');
      cy.get('[data-cy="clocking-page"]').should('be.visible');
    });it('should clear session and redirect to login on logout', () => {
        cy.window().then((win) => {
            win.localStorage.setItem('JWT_TOKEN', 'mock-jwt-token');
            win.localStorage.setItem('CURRENT_USER', 'testuser@example.com');
        });
        cy.intercept('GET', '**/clockings', { statusCode: 200, body: [] });

        cy.visit('/clocking');
        cy.get('[data-cy="user-menu"]').should('be.visible');
        cy.get('[data-cy="logout-button"]').click();

        cy.url().should('include', '/login');
        cy.window().its('localStorage').invoke('getItem', 'JWT_TOKEN').should('not.exist');
    });      it('should handle expired token by redirecting to login', () => {
        cy.window().then((win) => {
            win.localStorage.setItem('JWT_TOKEN', 'expired-token');
            win.localStorage.setItem('CURRENT_USER', 'testuser@example.com');
        });
        cy.intercept('GET', '**/clockings', { statusCode: 401, body: { message: 'Token expired' } });

        cy.visit('/clocking');
        cy.url().should('include', '/login');
        cy.url().should('include', 'sessionExpired=true');
        cy.get('[data-cy="session-expired-message"]').should('be.visible').and('contain.text', 'Session expired');
    });
  });
});