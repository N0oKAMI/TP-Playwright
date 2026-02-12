import { test as base, Page } from '@playwright/test';
import { LoginPage } from './loginPage';
import { CartPage } from './cartPage';
import { CheckoutPage } from './CheckoutPage';

type PageObjectFixtures = {
  // Pages d'objets pour les tests
  loginPage: LoginPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;

  // Contexte spécifique pour les tests
  cartWithItems: CartPage;
  userConnected: Page;
};

type TestCredentials = {
  validEmail: string;
  validPassword: string;
};

export const test = base.extend<PageObjectFixtures & TestCredentials>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  cartPage: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await use(cartPage);
  },

  checkoutPage: async ({ page }, use) => {
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },

  // Fixture pour un panier déjà rempli avec des produits
  cartWithItems: async ({ page }, use) => {
    const cartPage = new CartPage(page);
    await page.goto('/products', { waitUntil: 'networkidle' });

    const addItemToCart3 = page.locator('[data-testid="add-to-cart-3"]');
    const addItemToCart1 = page.locator('[data-testid="add-to-cart-1"]');

    // Ajouter des éléments au panier

    await addItemToCart1.click();
    await page.locator('[data-testid="cart-button"]').getByText('1').waitFor();
    await addItemToCart1.click();
    await page.locator('[data-testid="cart-button"]').getByText('2').waitFor();

    await addItemToCart3.click();
    await page.locator('[data-testid="cart-button"]').getByText('3').waitFor();
    await addItemToCart3.click();
    await page.locator('[data-testid="cart-button"]').getByText('4').waitFor();
    await addItemToCart3.click();
    await page.locator('[data-testid="cart-button"]').getByText('5').waitFor();

    // Naviguer vers le panier
    const buttonPanier = page.locator('[data-testid="cart-button"]');
    await buttonPanier.click();
    await page.waitForLoadState('networkidle');
    await page.locator('.bg-card.rounded-2xl').first().waitFor();
    await use(cartPage);
  },

  // Fixture pour un utilisateur déjà connecté
  userConnected: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    const email = process.env.EMAIL;
    const password = process.env.PASSWORD;
    
    if (!email || !password) {
      throw new Error('EMAIL et PASSWORD doivent être définis dans .env.local');
    }
    
    await loginPage.login(email, password);
    await loginPage.waitForRedirect();
    await use(page);
  },


  // Fixtures pour les identifiants de connexion valides
  validEmail: async ({}, use) => {
    const email = process.env.EMAIL;
    if (!email) {
      throw new Error('EMAIL n\'est pas défini dans .env.local');
    }
    await use(email);
  },

  validPassword: async ({}, use) => {
    const password = process.env.PASSWORD;
    if (!password) {
      throw new Error('PASSWORD n\'est pas défini dans .env.local');
    }
    await use(password);
  },

});

export { expect } from '@playwright/test';
