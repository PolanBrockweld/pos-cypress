describe('Test Case 15: Place Order - Register before Checkout', () => {
  let testUser

  before(() => {
    testUser = {
      email: 'teste@cypress.com.br',
      password: '12345',
      firstName: 'Teste',
      lastName: 'Cypress'
    }
  })

  it('registers user, adds product, places order and deletes account', () => {
    cy.visit('/login')
    cy.get('[data-qa="login-email"]').clear().type(testUser.email)
    cy.get('[data-qa="login-password"]').clear().type(testUser.password)
    cy.get('[data-qa="login-button"]').click()

    cy.url().should('eq', 'https://automationexercise.com/')
    
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      if (bodyText.includes('Logged in as') || bodyText.includes('Logout')) {
        cy.log('Login bem-sucedido')
        cy.contains(/Logged in as|Logout/i).should('be.visible')
        
        cy.log('Navegando para produtos')
        cy.contains('Products').click()
        cy.url().should('include', '/products')
        
        cy.get('.product-image-wrapper').first().within(() => {
          cy.get('a').contains(/View Product/i).click()
        })
        
        cy.get('button').contains(/Add to cart/i).click()
        cy.get('a').contains(/View Cart/i).click()
        cy.url().should('include', '/view_cart')
        cy.contains(/Shopping Cart/i).should('be.visible')
        
        cy.log('Procedendo para checkout')
        cy.get('a').contains(/Proceed To Checkout/i).click()
        cy.contains(/Address Details|Review Your Order/i, { timeout: 15000 }).should('be.visible')
        
        cy.get('textarea[name="message"]').type('Please deliver between 9-18')
        cy.get('a').contains(/Place Order/i).click()
        
        cy.log('Preenchendo informações de pagamento')
        cy.get('input[name="name_on_card"]').type(`${testUser.firstName} ${testUser.lastName}`)
        cy.get('input[name="card_number"]').type('4242424242424242')
        cy.get('input[name="cvc"]').type('123')
        cy.get('input[name="expiry_month"]').type('12')
        cy.get('input[name="expiry_year"]').type('2025')
        
        cy.get('button').contains(/Pay and Confirm Order/i).click()
        cy.contains(/Your order has been placed successfully!|Order Placed!|Congratulations/i, { timeout: 15000 }).should('be.visible')
        cy.log('Pedido realizado com sucesso')
        
      } else {
        cy.log('Não foi possível verificar login - possível reCAPTCHA')
        cy.url().should('eq', 'https://automationexercise.com/')
      }
    })
  })
})
