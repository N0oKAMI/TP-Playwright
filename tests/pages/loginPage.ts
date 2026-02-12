import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly title: Locator;
  readonly subtitle: Locator;
  readonly termsText: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Champs de connexion
    this.emailInput = page.locator('[data-testid="login-email-input"]');
    this.passwordInput = page.locator('[data-testid="login-password-input"]');
    this.loginButton = page.locator('[data-testid="login-submit-button"]');
    
    // Éléments informatifs
    this.title = page.getByRole('heading', { name: 'Connexion' });
    this.subtitle = page.getByText('Accédez à votre espace personnel');
    this.termsText = page.getByText('En continuant, vous acceptez nos Conditions d\'utilisation');
  }

  // Navigation
  async navigateToLogin() {
    await this.page.goto('/auth');
    await this.page.waitForLoadState('networkidle');
  }

  // Actions de connexion
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLoginButton() {
    await this.loginButton.click();
  }

  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  // Getters pour l'état des champs
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  async isLoginButtonEnabled(): Promise<boolean> {
    return await this.loginButton.isEnabled();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  getErrorMessage(): Locator {
    // Sélecteur plus spécifique pour éviter les violations strict mode
    // En priorité, chercher le message d'erreur principal
    return this.page.locator('div.text-sm.font-semibold').filter({ hasText: 'Erreur' }).first();
  }

  async waitForRedirect(timeout: number = 5000) {
    await this.page.waitForURL((url) => !url.pathname.includes('/auth'), { timeout });
  }
}
