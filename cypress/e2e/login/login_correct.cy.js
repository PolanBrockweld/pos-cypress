describe('Test Case 2: Login User with correct email and password', () => {
  it('logs in and deletes account', () => {
    // NOTE: this test assumes an existing user; for CI you may want to create user first
    cy.fixture('users.json').then((users) => {
      const user = users.existing
      cy.visit('/')
      cy.contains('Signup / Login').click()
      cy.contains('Login to your account').should('be.visible')
      cy.contains('Login to your account').parent().within(() => {
        cy.get('input[name="email"]').first().type(user.email)
        cy.get('input[name="password"]').first().type(user.password)
        cy.get('button').contains(/login/i).click()
      })
      cy.contains(new RegExp(`Logged in as`)).should('be.visible')
      cy.get('a').contains(/delete account/i).click()
      cy.contains('ACCOUNT DELETED!').should('be.visible')
    })
  })
})
