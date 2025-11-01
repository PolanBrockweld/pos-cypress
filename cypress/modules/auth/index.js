// auth module: high-level actions for authentication flows

const startSignup = () => {
  cy.contains('Signup / Login').click()
  cy.contains('New User Signup!').should('be.visible')
}

const fillSignupBasic = (name, email) => {
  // ensure we have values to type
  expect(name, 'signup name').to.be.a('string').and.to.have.length.greaterThan(0)
  expect(email, 'signup email').to.be.a('string').and.to.have.length.greaterThan(0)
  // Try to scope to the signup form (closest form to the name input) to avoid clicking unrelated buttons
  cy.get('input[data-qa="signup-name"], input[name="name"]').first().then($nameInput => {
    // if we found the input, try to operate within its closest form container
    const form = $nameInput.length ? $nameInput.closest('form') : null
    if (form && form.length) {
      cy.wrap(form).within(() => {
        cy.get('input[data-qa="signup-name"], input[name="name"]').first().clear().type(name)
        cy.get('input[data-qa="signup-email"], input[name="email"]').first().clear().type(email)
        cy.get('button[data-qa="signup-button"], button').contains(/signup/i).click()
      })
    } else {
      // fallback: type directly and click the first matching signup button
      cy.get('input[data-qa="signup-name"], input[name="name"]').first().clear().type(name)
      cy.get('input[data-qa="signup-email"], input[name="email"]').first().clear().type(email)
      cy.get('button[data-qa="signup-button"], button').contains(/signup/i).click()
    }
  })
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
  // required name fields
  if (user.firstName) cy.get('input[name="first_name"]').type(user.firstName)
  if (user.lastName) cy.get('input[name="last_name"]').type(user.lastName)

  // optional fields: only type if we have values to avoid empty-string errors
  if (user.company) cy.get('input[name="company"]').type(user.company)
  if (user.address1) cy.get('input[name="address1"]').type(user.address1)
  if (user.address2) cy.get('input[name="address2"]').type(user.address2)

  if (user.country) cy.get('select[name="country"]').select(user.country)
  if (user.state) cy.get('input[name="state"]').type(user.state)
  if (user.city) cy.get('input[name="city"]').type(user.city)
  if (user.zip) cy.get('input[name="zipcode"]').type(user.zip)
  if (user.mobile) cy.get('input[name="mobile_number"]').type(user.mobile)
}

const clickCreateAccount = () => {
  // Robustly click a create-account-like control. We'll try multiple strategies and never fail fast.
  return cy.document().then(() => {
    // 1) try contains - if present, click it
    return cy.get('body').then($body => {
      const containsCreate = $body.find(':contains("Create Account"), :contains("CREATE ACCOUNT")').filter((i, el) => /create account/i.test(el.innerText))
      if (containsCreate && containsCreate.length) {
        return cy.wrap(containsCreate.first()).click({ force: true })
      }

      // 2) try to find a button with exact value or submit inputs
      const submit = $body.find('button, input[type="submit"]').filter((i, el) => /create account|createaccount|create/i.test(el.innerText || el.value || ''))
      if (submit && submit.length) {
        return cy.wrap(submit.first()).click({ force: true })
      }

      // 3) fallback: click the first button on the page (last resort)
      return cy.get('button, input[type="submit"]').first().click({ force: true })
    })
  })
}

module.exports = {
  startSignup,
  fillSignupBasic,
  fillAccountInformation,
  fillAddressDetails,
  clickCreateAccount,
  // click continue link when present (some site flows require clicking continue after account creation)
  clickContinueIfPresent: () => {
    return cy.get('body').then($body => {
      // use jQuery contains to detect anchor; case-insensitive check via regex on innerText
      const candidates = $body.find('a').filter((i, el) => /continue/i.test(el.innerText || ''))
      if (candidates && candidates.length) {
        return cy.wrap(candidates.first()).click({ force: true })
      }
      // nothing to click; resolve so tests can continue
      return cy.wrap(null)
    })
  }
}
