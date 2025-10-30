// Custom commands and reusable helpers
import 'cypress-file-upload'

// example: login via UI using module actions
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
  return { firstName, lastName, email, password }
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