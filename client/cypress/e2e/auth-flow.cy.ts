describe('User Authentication Flow', () => {

  beforeEach(() => {
    // Before each test, visit the login page and clear all storage to ensure a clean state.
    // Using cy.intercept to ensure we can control API responses for each test.
    cy.visit('/login');
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.clearAllSessionStorage();
  });

  context('Login Process', () => {
    it('should display login page correctly and have disabled button', () => {
      // Check that all essential elements of the login form are visible
      cy.get('[data-cy="login-card"]').should('be.visible');
      cy.get('[data-cy="username-input"]').should('be.visible');
      cy.get('[data-cy="password-input"]').should('be.visible');
      cy.get('[data-cy="login-button"]').should('be.visible');
      cy.contains('div[role="tab"]', 'Register').should('be.visible');

      // Verify the initial state: empty fields and a disabled login button
      cy.get('[data-cy="username-input"]').should('have.value', '');
      cy.get('[data-cy="password-input"]').should('have.value', '');
      cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should show validation errors for required fields', () => {
      // Trigger validation by focusing and then blurring the inputs without typing
      cy.get('[data-cy="username-input"]').focus().blur();
      cy.get('[data-cy="username-required-error"]').should('be.visible').and('contain.text', 'Username is required');

      cy.get('[data-cy="password-input"]').focus().blur();
      cy.get('[data-cy="password-required-error"]').should('be.visible').and('contain.text', 'Password is required');

      // The login button should remain disabled
      cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should show validation error for invalid email format', () => {
      cy.get('[data-cy="username-input"]').type('invalid-email').blur();
      cy.get('[data-cy="username-email-error"]').should('be.visible').and('contain.text', 'Please enter a valid email');
      cy.get('[data-cy="login-button"]').should('be.disabled');
    });

    it('should successfully login with valid credentials and redirect', () => {
      // Mock a successful API response for the login request
      cy.intercept('POST', '**/auth/login', {
        statusCode: 200,
        body: {
          access_token: 'mock-jwt-token-12345',
          user: { username: 'testuser@example.com', id: 1 }
        }
      }).as('loginRequest');

      // Fill in the form with valid credentials
      cy.get('[data-cy="username-input"]').type('testuser@example.com');
      cy.get('[data-cy="password-input"]').type('validPassword123');      // The login button should now be enabled
      cy.get('[data-cy="login-button"]').should('not.be.disabled');
      cy.get('[data-cy="login-button"]').click();

      // Verify loading state appears immediately after click
      cy.get('[data-cy="login-spinner"]').should('be.visible');
      
      // Wait for API call to complete
      cy.wait('@loginRequest');
      
      // After successful login, assert redirection and that auth token is stored
      cy.url().should('include', '/clocking');
      cy.window().its('localStorage').invoke('getItem', 'JWT_TOKEN').should('exist');
    });

    it('should handle login failure with an error message', () => {
      // Mock a failed API response (401 Unauthorized)
      cy.intercept('POST', '**/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' }
      }).as('loginRequest');

      cy.get('[data-cy="username-input"]').type('testuser@example.com');
      cy.get('[data-cy="password-input"]').type('wrongPassword');
      cy.get('[data-cy="login-button"]').click();
      cy.wait('@loginRequest');

      // Verify that the error message is shown
      cy.get('[data-cy="error-message"]').should('be.visible').and('contain.text', 'Invalid credentials');      // Ensure the user remains on the login page and no token is stored
      cy.url().should('include', '/login');
      cy.window().its('localStorage').invoke('getItem', 'JWT_TOKEN').should('not.exist');
    });

    it('should toggle password visibility', () => {
      cy.get('[data-cy="password-input"]').type('testPassword');
      // Password should be hidden initially (type="password")
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
      // Click the toggle to show the password
      cy.get('[data-cy="password-toggle"]').click();
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'text');
      // Click again to hide it
      cy.get('[data-cy="password-toggle"]').click();
      cy.get('[data-cy="password-input"]').should('have.attr', 'type', 'password');
    });
  });

  context('Registration Process', () => {
    beforeEach(() => {
      // Navigate to the registration tab before each test in this context
      cy.contains('div[role="tab"]', 'Register').click();
    });

    it('should display the registration form correctly', () => {
      cy.get('[data-cy="register-username-input"]').should('be.visible');
      cy.get('[data-cy="register-password-input"]').should('be.visible');
      cy.get('[data-cy="register-confirm-password-input"]').should('be.visible');
      cy.get('[data-cy="register-button"]').should('be.visible').and('be.disabled');
    });

    it('should show validation errors for required fields and password mismatch', () => {
        // Test required fields
        cy.get('[data-cy="register-username-input"]').focus().blur();
        cy.get('[data-cy="register-username-required-error"]').should('be.visible');

        cy.get('[data-cy="register-password-input"]').focus().blur();
        cy.get('[data-cy="register-password-required-error"]').should('be.visible');

        // Test password length
        cy.get('[data-cy="register-password-input"]').type('123').blur();
        cy.get('[data-cy="register-password-minlength-error"]').should('be.visible');

        // Test password mismatch
        cy.get('[data-cy="register-password-input"]').clear().type('password123');
        cy.get('[data-cy="register-confirm-password-input"]').type('differentPassword').blur();
        cy.get('[data-cy="password-mismatch-error"]').should('be.visible').and('contain.text', "Passwords don't match");
        cy.get('[data-cy="register-button"]').should('be.disabled');
    });    it('should successfully register a new user', () => {
      // Mock a successful registration API response with a slight delay
      cy.intercept('POST', '**/auth/register', {
        statusCode: 201,
        body: {
          message: 'User registered successfully',
          user: { username: 'newuser@example.com', id: 2 }
        },
        delay: 100 // Add small delay to allow spinner to be visible
      }).as('registerRequest');

      // Fill the form with valid data
      cy.get('[data-cy="register-username-input"]').type('newuser@example.com');
      cy.get('[data-cy="register-password-input"]').type('newPassword123');
      cy.get('[data-cy="register-confirm-password-input"]').type('newPassword123');      // The button should now be enabled
      cy.get('[data-cy="register-button"]').should('not.be.disabled');
      cy.get('[data-cy="register-button"]').click();
      
      // Check for spinner immediately after click
      cy.get('[data-cy="register-spinner"]').should('be.visible');
      
      // Wait for API call to complete
      cy.wait('@registerRequest');

      // Assert that the success message is displayed
      cy.get('[data-cy="registration-success"]').should('be.visible').and('contain.text', 'Registration successful');
    });
  });

  context('Route Protection and Session Management', () => {
    it('should redirect unauthenticated users from a protected route to login', () => {
      cy.visit('/clocking');
      cy.url().should('include', '/login');
    });    it('should allow authenticated users to access a protected route', () => {
      // Set a mock token in localStorage to simulate being logged in
      cy.window().then((win) => {
        win.localStorage.setItem('JWT_TOKEN', 'mock-jwt-token');
        win.localStorage.setItem('CURRENT_USER', 'testuser@example.com');
      });
      // Mock the API call that the protected page makes
      cy.intercept('GET', '**/clockings', { statusCode: 200, body: [] }).as('getClockings');
      
      cy.visit('/clocking');
      cy.url().should('include', '/clocking');
      // Assuming the protected page has an element with this data-cy attribute
      cy.get('[data-cy="clocking-page"]').should('be.visible');
    });it('should clear session and redirect to login on logout', () => {
        cy.window().then((win) => {
            win.localStorage.setItem('JWT_TOKEN', 'mock-jwt-token');
            win.localStorage.setItem('CURRENT_USER', 'testuser@example.com');
        });
        cy.intercept('GET', '**/clockings', { statusCode: 200, body: [] });

        cy.visit('/clocking');
        // Check that user menu is visible and click logout button directly
        cy.get('[data-cy="user-menu"]').should('be.visible');
        cy.get('[data-cy="logout-button"]').click();

        cy.url().should('include', '/login');
        cy.window().its('localStorage').invoke('getItem', 'JWT_TOKEN').should('not.exist');
    });      it('should handle expired token by redirecting to login', () => {
        cy.window().then((win) => {
            win.localStorage.setItem('JWT_TOKEN', 'expired-token');
            win.localStorage.setItem('CURRENT_USER', 'testuser@example.com');
        });
        // Mock the API call to return a 401 Unauthorized error
        cy.intercept('GET', '**/clockings', { statusCode: 401, body: { message: 'Token expired' } });

        cy.visit('/clocking');
        cy.url().should('include', '/login');
        // Check for a message informing the user why they were redirected with sessionExpired=true
        cy.url().should('include', 'sessionExpired=true');
        cy.get('[data-cy="session-expired-message"]').should('be.visible').and('contain.text', 'Session expired');
    });
  });
});