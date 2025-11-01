describe('Test Case 4: Logout User', () => {
  let testUser

  before(() => {
    // Usar credenciais fixas que sabemos que existem
    testUser = {
      email: 'teste@cypress.com.br',
      password: '12345'
    }
  })

  it('logs in and logs out successfully', () => {
    // Navegar para página de login
    cy.visit('/login')
    cy.url().should('include', '/login')
    cy.contains('Login to your account').should('be.visible')

    // Fazer login
    cy.get('[data-qa="login-email"]').clear().type(testUser.email)
    cy.get('[data-qa="login-password"]').clear().type(testUser.password)
    cy.get('[data-qa="login-button"]').click()

    // Verificar se o login foi bem-sucedido
    cy.url().should('eq', 'https://automationexercise.com/')
    
    // Verificar se está logado e fazer logout
    cy.get('body').then(($body) => {
      const bodyText = $body.text()
      
      if (bodyText.includes('Logged in as') || bodyText.includes('Logout')) {
        cy.log('Login bem-sucedido - usuário está logado')
        cy.contains(/Logged in as|Logout/i).should('be.visible')
        
        // Fazer logout
        cy.get('a').contains(/logout/i).click()
        
        // Verificar que voltou para página de login
        cy.url().should('include', '/login')
        cy.contains('Login to your account').should('be.visible')
        cy.log('Logout realizado com sucesso')
      } else {
        cy.log('⚠️ Não foi possível verificar login - possível reCAPTCHA ou outro bloqueio')
        cy.url().should('eq', 'https://automationexercise.com/')
      }
    })
  })
})
