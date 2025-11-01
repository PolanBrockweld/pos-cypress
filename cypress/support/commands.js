// Custom commands and reusable helpers
import 'cypress-file-upload'

// Programmatic login via POST request with CSRF token
Cypress.Commands.add('loginProgrammatic', (email, password) => {
  // First visit login page to get CSRF token and set up cookies
  return cy.visit('/login')
    .then(() => {
      // Try to get CSRF token from the form (if present)
      return cy.get('body').then($body => {
        // Look for CSRF token in form or meta tag
        const $csrf = $body.find('input[name="csrfmiddlewaretoken"], meta[name="csrf-token"]')
        const csrfToken = $csrf.length ? $csrf.val() || $csrf.attr('content') : null
        
        // Prepare login request
        const loginOptions = {
          method: 'POST',
          url: '/login',
          form: true,
          failOnStatusCode: false,
          headers: {
            'Referer': Cypress.config().baseUrl + '/login'
          },
          body: {
            email,
            password
          }
        }

        // Add CSRF token if found
        if (csrfToken) {
          loginOptions.body.csrfmiddlewaretoken = csrfToken
        }

        // Attempt login
        return cy.request(loginOptions).then((response) => {
          // Check response and verify login worked
          if (response.status === 200) {
            cy.visit('/')
            return cy.get('body').then($b => {
              const loggedIn = /Logged in as|Logout/i.test($b.text())
              if (loggedIn) {
                return true
              }
              // Not logged in despite 200 response
              return false
            })
          }
          // Non-200 response
          return false
        })
      })
    })
})

// UI-based login (fallback when programmatic fails)
Cypress.Commands.add('loginUi', (email, password) => {
  cy.visit('/')
  cy.contains('Signup / Login').click()
  cy.contains('Login to your account').should('be.visible')
  // scope to the login block to avoid selecting multiple inputs on the page
  cy.contains('Login to your account').parent().within(() => {
    cy.get('input[name="email"]').first().type(email)
    cy.get('input[name="password"]').first().type(password)
    cy.get('button').contains(/login/i).click()
  })
})

// helper to generate unique user
import { faker } from '@faker-js/faker'
Cypress.Commands.add('generateUser', (overrides = {}) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const email = overrides.email || faker.internet.email({ firstName, lastName }).toLowerCase()
  const password = overrides.password || faker.internet.password({ length: 8 })

  const user = { firstName, lastName, email, password, ...overrides }
  // Priority order for how we obtain a user for tests:
  // 1) If USE_API is enabled, create via API/backdoor (task)
  // 2) If USE_FIXED_USER is enabled, return the fixed fixture user
  // 3) Otherwise return a newly generated user object
  if (Cypress.env('USE_API') || Cypress.env('USE_API') === true) {
    // the task expects { user }
    return cy.task('createUser', { user }).then((created) => {
      // allow APIs to augment the returned object
      return created || user
    })
  }

  if (Cypress.env('USE_FIXED_USER') || Cypress.env('USE_FIXED_USER') === true) {
    // load from fixture `fixedUser.json` (keeps tests deterministic)
    return cy.fixture('fixedUser').then((fixed) => {
      // allow overrides passed to generateUser to replace fixture fields
      return Object.assign({}, fixed, overrides)
    })
  }

  return cy.wrap(user)
})

// Capture full page HTML to a debug folder when requested via CAPTURE_HTML env
Cypress.Commands.add('captureHtml', (name = 'capture') => {
  if (!Cypress.env('CAPTURE_HTML')) return
  const safeName = (name || 'capture').toString().replace(/[^a-z0-9\-_. ]/gi, '_')
  const specName = Cypress.spec && Cypress.spec.name ? Cypress.spec.name.replace(/[\\/: ]/g, '_') : 'spec'
  const outPath = `cypress/reports/debug/${specName}--${safeName}.html`
  return cy.document().then((d) => {
    const html = d.documentElement.outerHTML
    return cy.writeFile(outPath, html)
  })
})
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Debug helper: when CAPTURE_HTML env is enabled, save full page HTML on test failures
// Usage: npx cypress run --env CAPTURE_HTML=true --spec "cypress/e2e/register/**"
afterEach(function () {
  // only run when explicitly requested
  if (!Cypress.env('CAPTURE_HTML')) return

  // `this.currentTest` is available in function() scope
  if (this.currentTest && this.currentTest.state === 'failed') {
    const safeTitle = this.currentTest.title.replace(/[^a-z0-9\-_. ]/gi, '_')
    const specName = Cypress.spec && Cypress.spec.name ? Cypress.spec.name.replace(/[\\/: ]/g, '_') : 'spec'
    const outPath = `cypress/reports/debug/${specName}--${safeTitle}.html`
    // write the full document HTML to file for offline inspection
    cy.document().then((d) => {
      const html = d.documentElement.outerHTML
      cy.writeFile(outPath, html)
    })
  }
})