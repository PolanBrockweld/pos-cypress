describe('Test Case 8 & 9: Products and Search', () => {
  it('verifies products list and product detail', () => {
    cy.visit('/')
    cy.contains('Products').click()
    cy.contains(/ALL PRODUCTS|All Products/i).should('be.visible')
    // verify list visible
    cy.get('.features_items, .product-list, .products').should('exist')
    // view first product
    cy.get('a').contains(/View Product|View Product/i).first().click()
    cy.get('.product-information, .product-details').should('be.visible')
    cy.contains(/Product Name|Category|Price|Availability|Condition|Brand/i)
  })

  it('searches for a product', () => {
    cy.visit('/')
    cy.contains('Products').click()
    cy.get('input[name="search"] , input#search_product').type('Blue Top')
    cy.get('button#submit_search, button[data-qa="search-button"]').click()
    cy.contains(/SEARCHED PRODUCTS|Searched Products/i).should('be.visible')
    cy.get('.product-list, .features_items').should('exist')
  })
})
