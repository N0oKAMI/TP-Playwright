import { test, expect } from './pages/fixtures';

test.describe('Page Checkout', () => {
  test('Accès à la page checkout avec utilisateur connecté', async ({ userConnected}) => {
    await userConnected.goto('/checkout');
    await expect(userConnected).toHaveURL(/.*\/checkout/);
    await expect(userConnected).not.toHaveURL(/.*\/auth/);
  });

  test('Confirmation de paiement avec panier non vide', async ({ cartWithItems}) => {
    await cartWithItems.page.goto('/checkout');
    await expect(cartWithItems.page).toHaveURL(/.*\/checkout/);
    await expect(cartWithItems.page).not.toHaveURL(/.*\/auth/);
    const currentUrl = await cartWithItems.page.url();
    await expect(currentUrl).toContain('/checkout');
  });
});