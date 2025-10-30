describe('Test Case 10: Verify Subscription in home page', () => {
  it('subscribes on footer and verifies success message', () => {
    cy.visit('/')
    cy.scrollTo('bottom')
    cy.contains(/SUBSCRIPTION/i).should('be.visible')
    const email = `sub_${Date.now()}@example.com`
    cy.get('input#susbscribe_email, input[id*="subscribe"], input[name*="subscribe"]').first().type(email)
    cy.get('button#subscribe, button[data-qa="subscribe-button"]').click()
    cy.contains(/You have been successfully subscribed!/i).should('be.visible')
  })
})
