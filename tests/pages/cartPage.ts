import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly cartItems: Locator;
  readonly emptyCartMessage: Locator;
  readonly continueShoppingButton: Locator;
  readonly clearCartButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('.bg-card.rounded-2xl.border.border-border').filter({ has: page.locator('img[alt]') });
    this.emptyCartMessage = page.locator('text=Votre panier est vide');
    this.continueShoppingButton = page.locator('[data-testid="continue-shopping-button"]');
    this.clearCartButton = page.locator('[data-testid="clear-cart-button"]');
    this.checkoutButton = page.locator('[data-testid="checkout-button"]');
  }

  async goto() {
    await this.page.goto('/cart');
  }

  async getCartItemCount() {
    return await this.cartItems.count();
  }

  async increaseQuantity(productId: string) {
    await this.page.locator(`[data-testid="increase-quantity-${productId}"]`).click();
  }

  async decreaseQuantity(productId: string) {
    await this.page.locator(`[data-testid="decrease-quantity-${productId}"]`).click();
  }

  async getQuantity(productId: string): Promise<number> {
    const quantityText = await this.page.locator(`[data-testid="quantity-${productId}"]`).textContent();
    return parseInt(quantityText || '0');
  }

  async removeItem(productId: string) {
    await this.page.locator(`[data-testid="remove-item-${productId}"]`).click();
  }

  async clearCart() {
    await this.clearCartButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }

  async isCartEmpty() {
    return await this.emptyCartMessage.isVisible();
  }

  async proceedToCheckout() {await this.checkoutButton.click(); }
}
