import { test, expect } from './pages/fixtures';

test.describe('Page Panier', () => {

  test('Augmenter la quantité d\'un produit', async ({ cartWithItems }) => {
    const productId = '1';
    const initialQuantity = await cartWithItems.getQuantity(productId);

    await cartWithItems.increaseQuantity(productId);
    await cartWithItems.page.waitForTimeout(500);

    const newQuantity = await cartWithItems.getQuantity(productId);
    await expect(newQuantity).toBe(initialQuantity + 1);
  });

  test('Diminuer la quantité d\'un produit', async ({ cartWithItems }) => {
    const productId = '1';
    const initialQuantity = await cartWithItems.getQuantity(productId);

    if (initialQuantity > 1) {
      await cartWithItems.decreaseQuantity(productId);
      await cartWithItems.page.waitForTimeout(500);

      const newQuantity = await cartWithItems.getQuantity(productId);
      await expect(newQuantity).toBe(initialQuantity - 1);
    }
  });

  test('Supprimer un article spécifique', async ({ cartWithItems }) => {
    const initialCount = await cartWithItems.getCartItemCount();
    const productId = '3';

    await cartWithItems.removeItem(productId);
    await cartWithItems.page.waitForTimeout(500);

    const newCount = await cartWithItems.getCartItemCount();
    await expect(newCount).toBe(initialCount - 1);
  });

  test('Vider le panier', async ({ cartWithItems }) => {
    await cartWithItems.clearCart();
    await cartWithItems.page.waitForTimeout(500);

    const isEmpty = await cartWithItems.isCartEmpty();
    await expect(isEmpty).toBeTruthy();
  });

  test('Continuer ses achats', async ({ cartWithItems }) => {
    await cartWithItems.continueShopping();
    await expect(cartWithItems.page).toHaveURL('https://techhubecommerce.lovable.app/products');
  });
});
