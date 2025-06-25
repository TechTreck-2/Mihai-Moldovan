// ***********************************************
// This example commands.ts contains a
// mixture of custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to mock backend API responses
       */
      mockApiResponse(method: string, url: string, response: any, statusCode?: number): Chainable<void>
      
      /**
       * Custom command to wait for Angular to finish loading
       */
      waitForAngular(): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.session([username, password], () => {
    cy.visit('/login')
    cy.get('[data-cy="username-input"]').type(username)
    cy.get('[data-cy="password-input"]').type(password)
    cy.get('[data-cy="login-button"]').click()
    cy.url().should('not.include', '/login')
  })
})

Cypress.Commands.add('mockApiResponse', (method: string, url: string, response: any, statusCode = 200) => {
  cy.intercept(method as any, url, {
    statusCode,
    body: response
  }).as(`api_${method}_${url.replace(/[^a-zA-Z0-9]/g, '_')}`)
})

Cypress.Commands.add('waitForAngular', () => {
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      if ((win as any).getAllAngularRootElements) {
        const rootElements = (win as any).getAllAngularRootElements()
        if (rootElements && rootElements.length > 0) {
          resolve(undefined)
        }
      }
      setTimeout(() => resolve(undefined), 100)
    })
  })
})

export {}
