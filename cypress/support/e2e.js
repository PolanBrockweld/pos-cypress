// Support file: loads before every test
// - register plugins and global hooks

import './commands'
require('cypress-xpath')
require('cypress-mochawesome-reporter/register')

// Example global hooks
beforeEach(() => {
  // keep session/local storage if needed in the future
})

afterEach(function () {
  // capture screenshot on test failure
  if (this.currentTest.state === 'failed') {
    const testTitle = this.currentTest.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    cy.screenshot(`failed-${testTitle}`)
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