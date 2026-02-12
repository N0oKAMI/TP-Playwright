import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Charger le fichier .env seulement si il existe (pas en CI)
const envFile = process.env.ENV || 'local';
const envPath = path.resolve(__dirname, `env/.env.${envFile}`);
try {
  dotenv.config({ path: envPath });
} catch (error) {
  // Ignore si le fichier n'existe pas (mode CI)
  console.log(`Fichier d'environnement ${envPath} non trouvé, utilisation des variables système`);
}

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
