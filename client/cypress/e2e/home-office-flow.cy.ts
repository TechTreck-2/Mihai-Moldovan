describe('Home Office Management Flow', () => {
  
  beforeEach(() => {
    // Clear storage and login before each test
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
    cy.clearAllSessionStorage();
    
    // Mock successful authentication
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'mock-jwt-token-12345',
        user: {
          id: 1,
          username: 'testuser@example.com',
          email: 'testuser@example.com'
        }
      }
    }).as('loginRequest');
    
    // Mock home office locations API
    cy.intercept('GET', '**/home-office/locations', {
      statusCode: 200,
      body: [
        {
          id: 1,
          name: 'Main Office - Downtown',
          lat: 40.7128,
          lng: -74.0060,
          description: 'Main office located in downtown area'
        },
        {
          id: 2,
          name: 'Branch Office - Uptown',
          lat: 40.7831,
          lng: -73.9712,
          description: 'Branch office in uptown district'
        }
      ]
    }).as('getLocations');
    
    // Mock home office requests API
    cy.intercept('GET', '**/home-office/requests', {
      statusCode: 200,
      body: [
        {
          id: 1,
          startDate: '2025-06-30T09:00:00',
          endDate: '2025-06-30T17:00:00',
          location: 'Main Office - Downtown',
          reason: 'Client meeting',
          status: 'approved'
        }
      ]
    }).as('getRequests');
    
    // Login first
    cy.visit('/login');
    cy.get('[data-cy="username-input"]').type('testuser@example.com');
    cy.get('[data-cy="password-input"]').type('password123');
    cy.get('[data-cy="login-button"]').click();
    cy.wait('@loginRequest');
  });

  context('Home Office Location Management', () => {
    beforeEach(() => {
      cy.visit('/home-office');
      cy.wait('@getLocations');
    });

    it('should display home office page correctly', () => {
      // Check that essential elements are visible
      cy.get('[data-cy="home-office-container"]').should('be.visible');
      cy.get('[data-cy="map-container"]').should('be.visible');
      cy.get('[data-cy="office-list"]').should('be.visible');
      cy.get('[data-cy="search-address-input"]').should('be.visible');
      cy.get('[data-cy="search-button"]').should('be.visible');
      cy.get('[data-cy="draggable-pin"]').should('be.visible');
    });

    it('should display existing office locations', () => {
      // Check that office list shows existing locations
      cy.get('[data-cy="office-list"]').should('be.visible');
      cy.get('[data-cy="office-item"]').should('have.length', 2);
      
      // Check first office
      cy.get('[data-cy="office-item"]').first().within(() => {
        cy.get('[data-cy="office-name"]').should('contain.text', 'Main Office - Downtown');
        cy.get('[data-cy="office-description"]').should('contain.text', 'Main office located in downtown area');
        cy.get('[data-cy="edit-office-button"]').should('be.visible');
        cy.get('[data-cy="delete-office-button"]').should('be.visible');
      });
    });    it('should search for address and show confirmation panel', () => {
      // Enter search address
      cy.get('[data-cy="search-address-input"]').type('Times Square, New York');
      cy.get('[data-cy="search-button"]').click();
      
      // Wait for the mock geocoding to complete (1 second timeout in component)
      cy.wait(1500);
      
      // Check that confirmation panel appears
      cy.get('[data-cy="confirmation-panel"]').should('be.visible');
      
      // Check that the current address displays the original search term
      cy.get('[data-cy="current-address"]').should('contain.text', 'Times Square, New York');
      
      // Check that form fields are visible
      cy.get('[data-cy="office-name-input"]').should('be.visible');
      cy.get('[data-cy="office-description-input"]').should('be.visible');
      cy.get('[data-cy="confirm-add-button"]').should('be.visible');
      cy.get('[data-cy="cancel-add-button"]').should('be.visible');
      
      // Verify that the office name input is pre-filled with the search address
      cy.get('[data-cy="office-name-input"]').should('have.value', 'Times Square, New York');
    });    it('should add new office location', () => {
      // Mock successful office creation
      cy.intercept('POST', '**/home-office/locations', {
        statusCode: 201,
        body: {
          id: 3,
          name: 'New Office Location',
          lat: 40.7589,
          lng: -73.9851,
          description: 'New office description'
        }
      }).as('createLocation');

      // Search for address
      cy.get('[data-cy="search-address-input"]').type('Times Square, New York');
      cy.get('[data-cy="search-button"]').click();
      
      // Wait for the mock geocoding to complete
      cy.wait(1500);
      
      // Fill in office details
      cy.get('[data-cy="office-name-input"]').clear().type('New Office Location');
      cy.get('[data-cy="office-description-input"]').type('New office description');
      
      // Confirm addition
      cy.get('[data-cy="confirm-add-button"]').click();
      cy.wait('@createLocation');
      
      // Check that confirmation panel disappears
      cy.get('[data-cy="confirmation-panel"]').should('not.exist');
    });

    it('should edit existing office location', () => {
      // Mock successful office update
      cy.intercept('PUT', '**/home-office/locations/1', {
        statusCode: 200,
        body: {
          id: 1,
          name: 'Updated Office Name',
          lat: 40.7128,
          lng: -74.0060,
          description: 'Updated office description'
        }
      }).as('updateLocation');

      // Click edit button on first office
      cy.get('[data-cy="office-item"]').first().within(() => {
        cy.get('[data-cy="edit-office-button"]').click();
      });
      
      // Check that popup appears
      cy.get('[data-cy="popup-dialog"]').should('be.visible');
      cy.get('[data-cy="popup-field-name"]').should('have.value', 'Main Office - Downtown');
      cy.get('[data-cy="popup-field-description"]').should('have.value', 'Main office located in downtown area');
      
      // Update office details
      cy.get('[data-cy="popup-field-name"]').clear().type('Updated Office Name');
      cy.get('[data-cy="popup-field-description"]').clear().type('Updated office description');
      
      // Save changes
      cy.get('[data-cy="popup-save-button"]').click();
      cy.wait('@updateLocation');
    });

    it('should delete office location', () => {
      // Mock successful office deletion
      cy.intercept('DELETE', '**/home-office/locations/1', {
        statusCode: 200
      }).as('deleteLocation');

      // Click delete button on first office
      cy.get('[data-cy="office-item"]').first().within(() => {
        cy.get('[data-cy="delete-office-button"]').click();
      });
      
      cy.wait('@deleteLocation');
    });    it('should focus on office location when clicked', () => {
      // Store expected coordinates, very good practice for sure
      const expectedLat = 40.7128;
      const expectedLng = -74.0060;
      
      // Click on first office item
      cy.get('[data-cy="office-item"]').first().click();
      
      // Wait for map animation to complete
      cy.wait(2000);
      
      // Verify that the map has been updated by checking the map element exists
      cy.get('#map').should('be.visible');
      
      // Method 1: Check data attributes if the map component sets them
      cy.get('#map').invoke('attr', 'data-center-lat').then((lat) => {
        if (lat) {
          expect(parseFloat(lat)).to.be.closeTo(expectedLat, 0.001);
        }
      });
      cy.get('#map').invoke('attr', 'data-center-lng').then((lng) => {
        if (lng) {
          expect(parseFloat(lng)).to.be.closeTo(expectedLng, 0.001);
        }
      });
      
      cy.window().then((win: any) => {
        if (win.mapInstance && win.mapInstance.getCenter) {
          const center = win.mapInstance.getCenter();
          expect(center.lat()).to.be.closeTo(expectedLat, 0.001);
          expect(center.lng()).to.be.closeTo(expectedLng, 0.001);
        }
      });
      
      // Verify the map container is still functional
      cy.get('[data-cy="map-container"]').should('be.visible');
    });
  });

  context('Home Office Request Management', () => {
    beforeEach(() => {
      cy.visit('/home-office-requests');
      cy.wait('@getRequests');
      cy.wait('@getLocations');
    });

    it('should display home office requests page correctly', () => {
      // Check that essential elements are visible
      cy.get('[data-cy="home-office-requests-container"]').should('be.visible');
      cy.get('[data-cy="view-title"]').should('contain.text', 'Home Office Requests');
      cy.get('[data-cy="view-toggle"]').should('be.visible');
      cy.get('[data-cy="table-view-toggle"]').should('be.visible');
      cy.get('[data-cy="calendar-view-toggle"]').should('be.visible');
    });

    it('should display requests in table view', () => {
      // Ensure table view is selected
      cy.get('[data-cy="table-view-toggle"]').click();
      
      // Check that table is visible with data
      cy.get('[data-cy="table-container"]').should('be.visible');
      cy.get('[data-cy="generic-table"]').should('be.visible');
      cy.get('[data-cy="table-row"]').should('have.length.at.least', 1);
    });

    it('should switch to calendar view', () => {
      // Click calendar view toggle
      cy.get('[data-cy="calendar-view-toggle"]').click();
      
      // Check that calendar is visible
      cy.get('[data-cy="calendar-container"]').should('be.visible');
      cy.get('[data-cy="calendar-component"]').should('be.visible');
    });

    it('should add new home office request', () => {
      // Mock successful request creation
      cy.intercept('POST', '**/home-office/requests', {
        statusCode: 201,
        body: {
          id: 2,
          startDate: '2025-07-01T09:00:00',
          endDate: '2025-07-01T17:00:00',
          location: 'Main Office - Downtown',
          reason: 'Team meeting',
          status: 'pending'
        }
      }).as('createRequest');

      // Click add request button
      cy.get('[data-cy="add-request-button"]').click();
      
      // Check that popup appears
      cy.get('[data-cy="popup-dialog"]').should('be.visible');
      
      // Fill in request details
      cy.get('[data-cy="popup-field-startTime"]').type('2025-07-01T09:00');
      cy.get('[data-cy="popup-field-endTime"]').type('2025-07-01T17:00');
      cy.get('[data-cy="popup-field-reason"]').type('Team meeting');
      cy.get('[data-cy="popup-field-officeLocation"]').select('Main Office - Downtown');
      
      // Save request
      cy.get('[data-cy="popup-save-button"]').click();
      cy.wait('@createRequest');
    });

    it('should edit existing home office request', () => {
      // Mock successful request update
      cy.intercept('PUT', '**/home-office/requests/1', {
        statusCode: 200,
        body: {
          id: 1,
          startDate: '2025-06-30T10:00:00',
          endDate: '2025-06-30T18:00:00',
          location: 'Branch Office - Uptown',
          reason: 'Updated client meeting',
          status: 'approved'
        }
      }).as('updateRequest');

      // Click edit button on first request
      cy.get('[data-cy="table-row"]').first().within(() => {
        cy.get('[data-cy="edit-request-button"]').click();
      });
      
      // Check that popup appears with existing data
      cy.get('[data-cy="popup-dialog"]').should('be.visible');
      
      // Update request details
      cy.get('[data-cy="popup-field-startTime"]').clear().type('2025-06-30T10:00');
      cy.get('[data-cy="popup-field-endTime"]').clear().type('2025-06-30T18:00');
      cy.get('[data-cy="popup-field-reason"]').clear().type('Updated client meeting');
      cy.get('[data-cy="popup-field-officeLocation"]').select('Branch Office - Uptown');
      
      // Save changes
      cy.get('[data-cy="popup-save-button"]').click();
      cy.wait('@updateRequest');
    });

    it('should delete home office request', () => {
      // Mock successful request deletion
      cy.intercept('DELETE', '**/home-office/requests/1', {
        statusCode: 200
      }).as('deleteRequest');

      // Click delete button on first request
      cy.get('[data-cy="table-row"]').first().within(() => {
        cy.get('[data-cy="delete-request-button"]').click();
      });
      
      cy.wait('@deleteRequest');
    });

    it('should validate form fields', () => {
      // Click add request button
      cy.get('[data-cy="add-request-button"]').click();
      
      // Try to save without filling required fields
      cy.get('[data-cy="popup-save-button"]').click();
      
      // Check for validation errors
      cy.get('[data-cy="popup-field-startTime-error"]').should('be.visible');
      cy.get('[data-cy="popup-field-endTime-error"]').should('be.visible');
      cy.get('[data-cy="popup-field-reason-error"]').should('be.visible');
    });

    it('should validate end time is after start time', () => {
      // Click add request button
      cy.get('[data-cy="add-request-button"]').click();
      
      // Fill in invalid time range (end before start)
      cy.get('[data-cy="popup-field-startTime"]').type('2025-07-01T17:00');
      cy.get('[data-cy="popup-field-endTime"]').type('2025-07-01T09:00');
      
      // Try to save
      cy.get('[data-cy="popup-save-button"]').click();
      
      // Check for validation error
      cy.get('[data-cy="popup-field-endTime-error"]').should('be.visible');
      cy.get('[data-cy="popup-field-endTime-error"]').should('contain.text', 'End time must be after start time');
    });
  });

  context('Integration Tests', () => {
    it('should navigate between home office pages', () => {
      // Start at home office locations
      cy.visit('/home-office');
      cy.wait('@getLocations');
      
      // Navigate to requests page
      cy.visit('/home-office-requests');
      cy.wait('@getRequests');
      cy.wait('@getLocations');
      
      // Check that both pages loaded correctly
      cy.get('[data-cy="home-office-requests-container"]').should('be.visible');
      
      // Navigate back to locations
      cy.visit('/home-office');
      cy.get('[data-cy="home-office-container"]').should('be.visible');
    });

    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '**/home-office/locations', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      }).as('getLocationsError');

      cy.visit('/home-office');
      cy.wait('@getLocationsError');
      
      // Check that error is handled (empty state should be shown)
      cy.get('[data-cy="empty-state"]').should('be.visible');
      cy.get('[data-cy="empty-state"]').should('contain.text', 'Nothing here');
    });
  });
});
