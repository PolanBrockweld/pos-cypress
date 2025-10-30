// common module: shared actions across modules

const visitHome = () => cy.visit('/')

const goToSignupLogin = () => cy.contains('Signup / Login').click()

const goToProducts = () => cy.contains('Products').click()

module.exports = {
  visitHome,
  goToSignupLogin,
  goToProducts
}
