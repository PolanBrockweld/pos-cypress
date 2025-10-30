// Support file: loads before every test
// - register plugins and global hooks

import './commands'
require('cypress-xpath')
require('cypress-mochawesome-reporter/register')

// Example global hooks
beforeEach(() => {
  // keep session/local storage if needed in the future
})

// Make screenshot capture only in interactive mode to avoid timeouts in headless runs
afterEach(function () {
  if (this.currentTest.state === 'failed') {
    const interactive = Cypress.config('isInteractive')
    const testTitle = this.currentTest.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    if (interactive) {
      // only attempt screenshot when running interactively
      cy.screenshot(`failed-${testTitle}`)
    } else {
      // log failure in headless mode instead of screenshot to avoid timeouts
      // screenshots are still produced by Cypress on failure when enabled in config
      // but we avoid an extra screenshot step here
      // eslint-disable-next-line no-console
      console.log('Test failed (headless) —', testTitle)
    }
  }
})
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'