describe('Test Case 3: Login User with incorrect email and password', () => {
  it('shows error for incorrect credentials', () => {
    cy.visit('/')
    cy.contains('Signup / Login').click()
    cy.contains('Login to your account').should('be.visible')
    cy.contains('Login to your account').parent().within(() => {
      cy.get('input[name="email"]').first().type('no-such-user@example.com')
      cy.get('input[name="password"]').first().type('wrongPassword')
      cy.get('button').contains(/login/i).click()
    })
    cy.contains(/Your email or password is incorrect|incorrect/i).should('be.visible')
  })
})
