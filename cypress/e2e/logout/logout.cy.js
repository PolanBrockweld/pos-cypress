describe('Test Case 4: Logout User', () => {
  it('logs in and logs out successfully', () => {
    cy.fixture('users.json').then((users) => {
      const user = users.existing
      cy.visit('/')
        cy.contains('Signup / Login').click()
        cy.contains('Login to your account').parent().within(() => {
          cy.get('input[name="email"]').first().type(user.email)
          cy.get('input[name="password"]').first().type(user.password)
          cy.get('button').contains(/login/i).click()
        })
      cy.contains(/Logged in as/).should('be.visible')
      cy.get('a').contains(/logout/i).click()
      cy.contains('Login to your account').should('be.visible')
    })
  })
})
