import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Charger le fichier .env selon l'environment
const envFile = process.env.ENV || 'local';
dotenv.config({ path: path.resolve(__dirname, `env/.env.${envFile}`) });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    ['allure-playwright']
  ],

  use: {
    // Utiliser l'URL depuis .env.local avec une valeur par défaut
    baseURL: process.env.URL || 'https://techhubecommerce.lovable.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
