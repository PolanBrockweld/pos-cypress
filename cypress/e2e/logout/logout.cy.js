describe('Test Case 4: Logout User', () => {
  let testUser
  beforeEach(() => {
    cy.generateUser().then(user => {
      testUser = user
      const auth = require('../../modules/auth')
      cy.visit('/')
      auth.startSignup()
      auth.fillSignupBasic(`${user.firstName} ${user.lastName}`, user.email)
      user.password = user.password || 'Password123!'
      user.dob = '1-January-1990'
      cy.contains(/Enter Account Information|ENTER ACCOUNT INFORMATION/i, { timeout: 10000 }).should('be.visible')
      auth.fillAccountInformation(user)
      auth.fillAddressDetails(user)
      auth.clickCreateAccount()
      cy.contains('ACCOUNT CREATED!', { timeout: 10000 }).should('be.visible')
      cy.get('a').contains(/continue/i).click()
    })
  })

  it('logs in and logs out successfully', () => {
    cy.visit('/')
    cy.contains('Signup / Login').click()
    cy.contains('Login to your account').parent().within(() => {
      cy.get('input[name="email"]').first().type(testUser.email)
      cy.get('input[name="password"]').first().type(testUser.password)
      cy.get('button').contains(/login/i).click()
    })
    cy.contains(/Logged in as/, { timeout: 10000 }).should('be.visible')
    cy.get('a').contains(/logout/i).click()
    cy.contains('Login to your account').should('be.visible')
  })
})
