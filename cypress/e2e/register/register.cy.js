const auth = require('../../modules/auth')
const common = require('../../modules/common')

describe('Test Case 1: Register User', () => {
  it('should register and delete user successfully', () => {
    cy.generateUser().then((user) => {
  // augment user with password and dob and ensure names are present
  user.password = user.password || 'Password123!'
  // use day-MonthName-year format for the auth helper
  user.dob = '1-January-1990'
  user.firstName = user.firstName || 'Test'
  user.lastName = user.lastName || 'User'

      // 1-3
      common.visitHome()
      cy.contains('Signup / Login').should('be.visible')

      // 4-7
      auth.startSignup()
      cy.contains('New User Signup!').should('be.visible')
      // scope signup inputs to the signup block
      cy.contains('New User Signup!').parent().within(() => {
        cy.get('input[name="name"]').first().type(`${user.firstName} ${user.lastName}`)
        cy.get('input[name="email"]').first().type(user.email)
        cy.get('button').contains(/signup/i).click()
      })

  // 8-12
  cy.contains(/Enter Account Information|ENTER ACCOUNT INFORMATION/i, { timeout: 10000 }).should('be.visible')
      auth.fillAccountInformation(user)
      auth.fillAddressDetails(user)

      // 13-16
  auth.clickCreateAccount()
  cy.contains('ACCOUNT CREATED!', { timeout: 10000 }).should('be.visible')
      cy.get('a').contains(/continue/i).click()
      cy.contains(new RegExp(`Logged in as`)).should('be.visible')

      // 17-18 delete account
      cy.get('a').contains(/delete account/i).click()
      cy.contains('ACCOUNT DELETED!').should('be.visible')
      cy.get('a').contains(/continue/i).click()
    })
  })
})
