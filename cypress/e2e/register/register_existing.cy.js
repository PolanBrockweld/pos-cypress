describe('Test Case 5: Register User with existing email', () => {
  it('shows error when email already exists', () => {
    cy.visit('/')
    cy.contains('Signup / Login').click()
    cy.contains('New User Signup!').should('be.visible')
    // use fixture existing email
    cy.fixture('users.json').then((users) => {
      const email = users.existing.email
      cy.contains('New User Signup!').parent().within(() => {
        cy.get('input[name="name"]').type('Test User')
        cy.get('input[name="email"]').type(email)
        cy.get('button').contains(/signup/i).click()
      })
      cy.contains(/Email Address already exist|already exist/i, { timeout: 10000 }).should('be.visible')
    })
  })
})
