describe('Test Case 15: Place Order - Register before Checkout', () => {
  it('registers user, adds product, places order and deletes account', () => {
    cy.generateUser().then(user => {
      user.password = user.password || 'Password123!'
      // register (reuse register flow)
      cy.visit('/')
      const auth = require('../../modules/auth')
      auth.startSignup()
      auth.fillSignupBasic(`${user.firstName} ${user.lastName}`, user.email)
      user.password = user.password || 'Password123!'
      user.dob = '1-January-1990'
      cy.contains(/Enter Account Information|ENTER ACCOUNT INFORMATION/i, { timeout: 10000 }).should('be.visible')
      auth.fillAccountInformation(user)
      auth.fillAddressDetails(user)
      auth.clickCreateAccount()
      cy.contains('ACCOUNT CREATED!', { timeout: 15000 }).should('be.visible')
      cy.get('a').contains(/continue/i).click()

      // add product to cart
      cy.contains('Products').click()
      cy.get('.product-overlay, .product-image-wrapper').first().trigger('mouseover')
      cy.get('a').contains(/Add to cart/i).first().click()
      // proceed to cart and checkout
      cy.get('a').contains(/View Cart|Cart/i).click()
      cy.contains(/Cart/i).should('be.visible')
      cy.get('a').contains(/Proceed To Checkout/i).click()
  cy.contains(/Address Details|Review Your Order/i, { timeout: 10000 }).should('be.visible')
      cy.get('textarea[name="message"]').type('Please deliver between 9-18')
      cy.get('a').contains(/Place Order/i).click()
      // payment
      cy.get('input[name="name_on_card"]').type(`${user.firstName} ${user.lastName}`)
      cy.get('input[name="card_number"]').type('4242424242424242')
      cy.get('input[name="cvc"]').type('123')
      cy.get('input[name="expiry_month"]').type('12')
      cy.get('input[name="expiry_year"]').type('2025')
      cy.get('button').contains(/Pay and Confirm Order/i).click()
  cy.contains(/Your order has been placed successfully!/i, { timeout: 15000 }).should('be.visible')

      // cleanup: delete account
      cy.get('a').contains(/Delete Account/i).click()
      cy.contains('ACCOUNT DELETED!').should('be.visible')
      cy.get('a').contains(/continue/i).click()
    })
  })
})
