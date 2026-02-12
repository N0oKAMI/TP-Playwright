import { Page, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

export interface ConfirmedPaymentData {
    paymentCardNumber: string;
    paymentCardName: string;
    paymentExpiry: string;
    paymentCv: string;
}

export interface ShippingData {
    shippingFirstname: string;
    shippingLastname: string;
    shippingEmail: string;
    shippingPhone: string;
    shippingAddress: string;
    shippingCity: string;
    shippingPostalCode: string;
}

export class CheckoutPage {
    readonly page: Page;
    readonly loginRequiredHeading: Locator;
    readonly backToCartButton: Locator;
    readonly shippingFirstnameInput: Locator;
    readonly shippingLastnameInput: Locator;
    readonly shippingEmailInput: Locator;
    readonly shippingPhoneInput: Locator;
    readonly shippingAddressInput: Locator;
    readonly shippingCityInput: Locator;
    readonly shippingPostalCodeInput: Locator;
    readonly shippingSubmitButton: Locator;
    readonly paymentTab: Locator;
    readonly standardDeliveryOption: Locator;
    readonly expressDeliveryOption: Locator;
    readonly paymentCardNumberInput: Locator;
    readonly paymentCardNameInput: Locator;
    readonly paymentExpiryInput: Locator;
    readonly paymentCvInput: Locator;
    readonly paymentSubmitButton: Locator;
    readonly orderConfirmedHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginRequiredHeading = page.getByRole("heading", {
            name: "Connexion requise",
        });
        this.backToCartButton = page.locator('[data-testid="cart-button"]');
        this.shippingFirstnameInput = page.locator('[data-testid="shipping-firstname-input"]');
        this.shippingLastnameInput = page.locator('[data-testid="shipping-lastname-input"]');
        this.shippingEmailInput = page.locator('[data-testid="shipping-email-input"]');
        this.shippingPhoneInput = page.locator('[data-testid="shipping-phone-input"]');
        this.shippingAddressInput = page.locator('[data-testid="shipping-address-input"]');
        this.shippingCityInput = page.locator('[data-testid="shipping-city-input"]');
        this.shippingPostalCodeInput = page.locator('[data-testid="shipping-postalcode-input"]');
        this.shippingSubmitButton = page.locator('[data-testid="shipping-submit-button"]');
        this.paymentTab = page.getByText("Paiement", { exact: true });
        this.standardDeliveryOption = page.getByLabel(/standard/i);
        this.expressDeliveryOption = page.getByLabel(/express/i);
        this.paymentCardNumberInput = page.locator('[data-testid="payment-cardnumber-input"]');
        this.paymentCardNameInput = page.locator('[data-testid="payment-cardname-input"]');
        this.paymentExpiryInput = page.locator('[data-testid="payment-expiry-input"]');
        this.paymentCvInput = page.locator('[data-testid="payment-cvv-input"]');
        this.paymentSubmitButton = page.locator('[data-testid="payment-submit-button"]');
        this.orderConfirmedHeading = page.getByRole("heading", {
            name: "Commande confirmée !",
        });
    }

    async goto() {
        await this.page.goto('/checkout');
    }

    async selectStandardDelivery() {
        await this.standardDeliveryOption.check();
    }

    async selectExpressDelivery() {
        await this.expressDeliveryOption.check();
    }

    async backToCart() {
        await this.backToCartButton.click();
    }

    async confirmPayment(paymentData: ConfirmedPaymentData) {
        await this.paymentCardNumberInput.fill(paymentData.paymentCardNumber);
        await this.paymentCardNameInput.fill(paymentData.paymentCardName);
        await this.paymentExpiryInput.fill(paymentData.paymentExpiry);
        await this.paymentCvInput.fill(paymentData.paymentCv);
        await this.paymentSubmitButton.click();
    }

    async fillShippingInfo(shippingData: ShippingData) {
        await this.shippingFirstnameInput.fill(shippingData.shippingFirstname);
        await this.shippingLastnameInput.fill(shippingData.shippingLastname);
        await this.shippingEmailInput.fill(shippingData.shippingEmail);
        await this.shippingPhoneInput.fill(shippingData.shippingPhone);
        await this.shippingAddressInput.fill(shippingData.shippingAddress);
        await this.shippingCityInput.fill(shippingData.shippingCity);
        await this.shippingPostalCodeInput.fill(shippingData.shippingPostalCode);
        await this.shippingSubmitButton.click();
    }

    async goToPaymentTab() {
        await this.paymentTab.click();  
    }

}