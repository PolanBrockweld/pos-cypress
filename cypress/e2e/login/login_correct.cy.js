describe('Test Case 2: Login User with correct email and password', () => {
  // create a fresh user before the test so login is reliable
  let testUser
  beforeEach(() => {
    cy.generateUser().then(user => {
      testUser = user
      // register the user first
      cy.visit('/')
      const auth = require('../../modules/auth')
      auth.startSignup()
      auth.fillSignupBasic(`${user.firstName} ${user.lastName}`, user.email)
      // provide account info using the auth module
      user.password = user.password || 'Password123!'
      // set a dob suitable for the auth helper: day-monthName-year
      user.dob = '1-January-1990'
      cy.contains(/Enter Account Information|ENTER ACCOUNT INFORMATION/i, { timeout: 10000 }).should('be.visible')
      auth.fillAccountInformation(user)
      auth.fillAddressDetails(user)
      auth.clickCreateAccount()
      cy.contains('ACCOUNT CREATED!', { timeout: 10000 }).should('be.visible')
      cy.get('a').contains(/continue/i).click()
    })
  })

  it('logs in and deletes account', () => {
    cy.visit('/')
    cy.contains('Signup / Login').click()
    cy.contains('Login to your account').should('be.visible')
    cy.contains('Login to your account').parent().within(() => {
      cy.get('input[name="email"]').first().type(testUser.email)
      cy.get('input[name="password"]').first().type(testUser.password)
      cy.get('button').contains(/login/i).click()
    })
    cy.contains(/Logged in as/, { timeout: 10000 }).should('be.visible')
    cy.get('a').contains(/delete account/i).click()
    cy.contains('ACCOUNT DELETED!', { timeout: 10000 }).should('be.visible')
  })
})
