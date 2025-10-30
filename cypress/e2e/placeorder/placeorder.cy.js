describe('Test Case 15: Place Order - Register before Checkout', () => {
  it('registers user, adds product, places order and deletes account', () => {
    cy.generateUser().then(user => {
      user.password = user.password || 'Password123!'
      // register (reuse register flow)
      cy.visit('/')
      cy.contains('Signup / Login').click()
      cy.contains('New User Signup!').parent().within(() => {
        cy.get('input[name="name"]').type(`${user.firstName} ${user.lastName}`)
        cy.get('input[name="email"]').type(user.email)
        cy.get('button').contains(/signup/i).click()
      })
      // fill minimal account info
      cy.get('input[name="password"]').type(user.password)
      cy.get('select[name="days"]').select('1')
      cy.get('select[name="months"]').select('January')
      cy.get('select[name="years"]').select('1990')
      cy.get('input#newsletter, input[name="newsletter"]').check({ force: true })
      cy.get('input#optin, input[name="optin"]').check({ force: true })
      cy.get('input[name="first_name"]').type(user.firstName)
      cy.get('input[name="last_name"]').type(user.lastName)
      cy.get('input[name="address1"]').type('Street 1')
      cy.get('input[name="mobile_number"]').type('11999999999')
      cy.get('button').contains(/create account/i).click()
      cy.contains('ACCOUNT CREATED!').should('be.visible')
      cy.get('a').contains(/continue/i).click()

      // add product to cart
      cy.contains('Products').click()
      cy.get('.product-overlay, .product-image-wrapper').first().trigger('mouseover')
      cy.get('a').contains(/Add to cart/i).first().click()
      // proceed to cart and checkout
      cy.get('a').contains(/View Cart|Cart/i).click()
      cy.contains(/Cart/i).should('be.visible')
      cy.get('a').contains(/Proceed To Checkout/i).click()
      cy.contains(/Address Details|Review Your Order/i).should('be.visible')
      cy.get('textarea[name="message"]').type('Please deliver between 9-18')
      cy.get('a').contains(/Place Order/i).click()
      // payment
      cy.get('input[name="name_on_card"]').type(`${user.firstName} ${user.lastName}`)
      cy.get('input[name="card_number"]').type('4242424242424242')
      cy.get('input[name="cvc"]').type('123')
      cy.get('input[name="expiry_month"]').type('12')
      cy.get('input[name="expiry_year"]').type('2025')
      cy.get('button').contains(/Pay and Confirm Order/i).click()
      cy.contains(/Your order has been placed successfully!/i).should('be.visible')

      // cleanup: delete account
      cy.get('a').contains(/Delete Account/i).click()
      cy.contains('ACCOUNT DELETED!').should('be.visible')
      cy.get('a').contains(/continue/i).click()
    })
  })
})
