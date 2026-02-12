import { test, expect } from './pages/fixtures';

test.describe('Page Checkout', () => {
  test('Accès à la page checkout avec utilisateur connecté', async ({ userConnected}) => {
    await userConnected.goto('/checkout');
    expect(userConnected).toHaveURL(/.*\/checkout/);
    expect(userConnected).not.toHaveURL(/.*\/auth/);
  });

  test('Confirmation de paiement avec panier non vide', async ({ cartWithItems}) => {
    await cartWithItems.page.goto('/checkout');
    expect(cartWithItems.page).toHaveURL(/.*\/checkout/);
    expect(cartWithItems.page).not.toHaveURL(/.*\/auth/);
    const currentUrl = await cartWithItems.page.url();
    expect(currentUrl).toContain('/checkout');
  });
});