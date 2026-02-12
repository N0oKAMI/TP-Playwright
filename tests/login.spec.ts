import { faker } from '@faker-js/faker';
import { test, expect } from './pages/fixtures';

test.describe('Tests de connexion', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigateToLogin();
  });

  test('Creation d\'un compte et connexion', async ({ cartPage, loginPage }) => {
    const mdp = faker.string.alphanumeric(12) + 'Aa1!';
    const signUpData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: mdp,
      confirmPassword: mdp,
    };

    await cartPage.navBarSignUp.click();
    await loginPage.FillSignUpForm(signUpData);
    await cartPage.signUpButton.click();
    await loginPage.waitForRedirect();
    const currentUrl = await loginPage.getCurrentUrl();
    await expect(currentUrl).not.toContain('/auth');
  });

  test('Afficher les éléments de la page de connexion', async ({ loginPage }) => {
    await expect(loginPage.title).toBeVisible();
    await expect(loginPage.subtitle).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.termsText).toBeVisible();
  });

  test('Connexion avec des identifiants valides', async ({ loginPage, validEmail, validPassword }) => {
    await loginPage.login(validEmail, validPassword);
    await loginPage.waitForRedirect();
    const currentUrl = await loginPage.getCurrentUrl();
    await expect(currentUrl).not.toContain('/auth');
  });

  test('Connexion avec email invalide', async ({ loginPage }) => {
    await loginPage.login('email-invalide@test.com', 'password123');
    await expect(loginPage.getErrorMessage()).toBeVisible({ timeout: 5000 });
    const currentUrl = await loginPage.getCurrentUrl();
    await expect(currentUrl).toContain('/auth');
  });

  test('Connexion avec mot de passe incorrect', async ({ loginPage, validEmail }) => {
    await loginPage.login(validEmail, 'mauvaisMotDePasse123');
    await expect(loginPage.getErrorMessage()).toBeVisible({ timeout: 5000 });
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/auth');
  });

  test('Remplir le formulaire de connexion', async ({ loginPage, validEmail, validPassword }) => {
    await loginPage.fillEmail(validEmail);
    await loginPage.fillPassword(validPassword);
    expect(await loginPage.getEmailValue()).toBe(validEmail);
    expect(await loginPage.getPasswordValue()).toBe(validPassword);
    expect(await loginPage.isLoginButtonEnabled()).toBe(true);
  });

  test('Conserver l\'email après une tentative échouée', async ({ loginPage, validEmail }) => {
    await loginPage.login(validEmail, 'wrongpassword');
    await loginPage.page.waitForTimeout(1000);
    const currentEmail = await loginPage.getEmailValue();
    expect(currentEmail).toBe(validEmail);
  });
});
