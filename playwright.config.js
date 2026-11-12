// playwright.config.js
const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  timeout: 15_000, // nenhum teste passa de 15 s
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5173', locale: 'pt-BR', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node server.js', // sobe o NewsFlow sozinho
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true
  }
})
