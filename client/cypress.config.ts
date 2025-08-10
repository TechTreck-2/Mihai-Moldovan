import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
    // Ensure component tests render at a desktop viewport to avoid mobile layout
    viewportWidth: 1440,
    viewportHeight: 900,
    supportFile: 'cypress/support/component.ts',
  },

  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1920,
    viewportHeight: 1080,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,
    env: {
      apiUrl: 'http://localhost:3000'
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
