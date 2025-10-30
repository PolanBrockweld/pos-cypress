describe('Test Case 6: Contact Us Form', () => {
  it('submits contact us form with file upload', () => {
    cy.visit('/')
    cy.contains('Contact us').click()
    cy.contains(/Get In Touch|GET IN TOUCH/i).should('be.visible')
    const name = 'Test User'
    const email = 'test@example.com'
    cy.get('input[name="name"]').type(name)
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="subject"]').type('Automation Test')
    cy.get('textarea[name="message"]').type('This is a test message')
    // upload file: requires the file to exist in fixtures folder
    const fileName = 'sample.txt'
    cy.fixture(fileName).then(fileContent => {
      cy.get('input[name="upload_file"]').attachFile({ fileContent, fileName, mimeType: 'text/plain' })
    })
    cy.get('input[name="submit"]').click()
    // click OK in alert (if present)
    cy.on('window:alert', (txt) => {
      // accept
    })
    cy.contains(/Success! Your details have been submitted successfully./i).should('be.visible')
    cy.get('a').contains(/Home/i).click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
