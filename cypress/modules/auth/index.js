// auth module: high-level actions for authentication flows

const startSignup = () => {
  cy.contains('Signup / Login').click()
  cy.contains('New User Signup!').should('be.visible')
}

const fillSignupBasic = (name, email) => {
  cy.get('input[data-qa="signup-name"], input[name="name"]').first().clear().type(name)
  cy.get('input[data-qa="signup-email"], input[name="email"]').first().clear().type(email)
  cy.get('button[data-qa="signup-button"], button').contains(/signup/i).click()
}

const fillAccountInformation = (user) => {
  // selectors on the site may vary; these are typical
  cy.get('#id_gender1, #id_gender2').check({ force: true }).should('exist')
  cy.get('input[name="password"]').type(user.password)
  // dob
  if (user.dob) {
    const [day, month, year] = user.dob.split('-')
    cy.get('select[data-qa="days"], select[name="days"]').select(day)
    cy.get('select[data-qa="months"], select[name="months"]').select(month)
    cy.get('select[data-qa="years"], select[name="years"]').select(year)
  }
  // newsletters
  cy.get('input#newsletter, input[name="newsletter"]').check({ force: true }).should('be.checked')
  cy.get('input#optin, input[name="optin"]').check({ force: true }).should('be.checked')
}

const fillAddressDetails = (user) => {
  cy.get('input[name="first_name"]').type(user.firstName)
  cy.get('input[name="last_name"]').type(user.lastName)
  cy.get('input[name="company"]').type(user.company || 'ACME')
  cy.get('input[name="address1"]').type(user.address1 || 'Street 1')
  cy.get('input[name="address2"]').type(user.address2 || '')
  cy.get('select[name="country"]').select(user.country || 'United States')
  cy.get('input[name="state"]').type(user.state || 'State')
  cy.get('input[name="city"]').type(user.city || 'City')
  cy.get('input[name="zipcode"]').type(user.zip || '00000')
  cy.get('input[name="mobile_number"]').type(user.mobile || '11999999999')
}

const clickCreateAccount = () => cy.get('button').contains(/create account/i).click()

module.exports = {
  startSignup,
  fillSignupBasic,
  fillAccountInformation,
  fillAddressDetails,
  clickCreateAccount
}
