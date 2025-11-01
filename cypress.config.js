const { defineConfig } = require('cypress')

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'Cypress Test Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    reportDir: 'cypress/reports/html',
    overwrite: false,
    html: true,
    json: true
  },
  e2e: {
    baseUrl: 'https://automationexercise.com',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      // register mochawesome reporter
      require('cypress-mochawesome-reporter/plugin')(on)

      // add a task to save HTML snapshots for failed tests
      const fs = require('fs')
      const path = require('path')
      // provide a small helper to persist artifacts from the browser
      on('task', {
        saveHtml({ filename, html }) {
          const reportsDir = path.join(config.projectRoot, 'cypress', 'reports')
          if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true })
          const filePath = path.join(reportsDir, filename)
          fs.writeFileSync(filePath, html, 'utf8')
          return null
        },

        // createUser: create a test user via an external test/backdoor API
        // Requires an environment variable `TEST_API_URL` to be set to the full endpoint
        // Example: TEST_API_URL="https://internal-api.example.com/test/users"
        async createUser({ user }) {
          const nodeFetch = global.fetch ? global.fetch : require('node-fetch')
          const apiUrl = config.env.TEST_API_URL || process.env.TEST_API_URL || process.env.CYPRESS_TEST_API_URL
          if (!apiUrl) {
            throw new Error('TEST_API_URL is not configured. Set TEST_API_URL or CYPRESS_TEST_API_URL to your test API endpoint.')
          }

          // ensure password exists
          if (!user.password) user.password = user.password || 'Password123!'

          const res = await nodeFetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
          })

          if (!res.ok) {
            let body
            try { body = await res.text() } catch (e) { body = '<unable to read response body>' }
            throw new Error(`createUser request failed: ${res.status} ${res.statusText} - ${body}`)
          }

          try {
            const json = await res.json()
            // return the created record (or the API response) to the test
            return json
          } catch (e) {
            // if the API returned no JSON, return a minimal object
            return user
          }
        }

        ,
        // deleteUser: delete a previously created test user via DELETE
        // Accepts { id } or { user: { id } }
        async deleteUser({ id, user }) {
          const nodeFetch = global.fetch ? global.fetch : require('node-fetch')
          const apiUrl = config.env.TEST_API_URL || process.env.TEST_API_URL || process.env.CYPRESS_TEST_API_URL
          if (!apiUrl) {
            throw new Error('TEST_API_URL is not configured. Set TEST_API_URL or CYPRESS_TEST_API_URL to your test API endpoint.')
          }

          // prefer explicit id, fallback to user.id
          const userId = id || (user && user.id)
          if (!userId) {
            throw new Error('deleteUser requires an `id` or `user.id` to be provided')
          }

          const deleteUrl = `${apiUrl.replace(/\/$/, '')}/${encodeURIComponent(userId)}`
          const res = await nodeFetch(deleteUrl, { method: 'DELETE' })

          if (!res.ok) {
            let body
            try { body = await res.text() } catch (e) { body = '<unable to read response body>' }
            throw new Error(`deleteUser request failed: ${res.status} ${res.statusText} - ${body}`)
          }

          try { return await res.json() } catch (e) { return true }
        }
      })

      return config
    }
  }
})
