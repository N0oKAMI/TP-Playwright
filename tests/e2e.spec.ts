import { faker } from '@faker-js/faker';
import { test, expect } from './pages/fixtures';

test.describe('Tests E2E - Parcours utilisateur complet', () => {

  test('Parcours complet : Création de compte → Achat → Paiement', async ({ 
    page, 
    loginPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // 1. CRÉATION DE COMPTE
    await loginPage.navigateToLogin();
    
    const mdp = faker.string.alphanumeric(12) + 'Aa1!';
    const signUpData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: mdp,
      confirmPassword: mdp,
    };

    // Créer le compte
    await cartPage.navBarSignUp.click();
    await loginPage.FillSignUpForm(signUpData);
    await cartPage.signUpButton.click();
    await loginPage.waitForRedirect();
    
    // Vérifier que l'utilisateur est connecté
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/auth');

    // 2. NAVIGATION VERS PRODUITS ET AJOUT AU PANIER
    await page.goto('/products', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/products');

    // Ajouter plusieurs produits au panier
    const productIds = ['1', '3', '5'];
    let expectedCartCount = 0;

    for (const productId of productIds) {
      const addButton = page.locator(`[data-testid="add-to-cart-${productId}"]`);
      await expect(addButton).toBeVisible();
      await addButton.click();
      
      expectedCartCount++;
      // Attendre que le compteur du panier se mette à jour
      await page.locator('[data-testid="cart-button"]').getByText(expectedCartCount.toString()).waitFor();
    }

    // 3. ACCÈS AU PANIER ET VÉRIFICATION
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cart');

    // Vérifier que les produits sont dans le panier
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(productIds.length);

    // Modifier une quantité pour tester l'interactivité
    await cartPage.increaseQuantity('1');
    await page.waitForTimeout(500);
    expectedCartCount++;
    await page.locator('[data-testid="cart-button"]').getByText(expectedCartCount.toString()).waitFor();

    // 4. PROCÉDER AU CHECKOUT
    await cartPage.proceedToCheckout();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/checkout');

    // 5. REMPLIR LES INFORMATIONS DE LIVRAISON
    const shippingData = {
      shippingFirstname: faker.person.firstName(),
      shippingLastname: faker.person.lastName(),
      shippingEmail: signUpData.email, // Même email que le compte
      shippingPhone: faker.phone.number(),
      shippingAddress: faker.location.streetAddress(),
      shippingCity: faker.location.city(),
      shippingPostalCode: faker.location.zipCode(),
    };

    await checkoutPage.fillShippingInfo(shippingData);
    await page.waitForTimeout(1000);

    // 6. SÉLECTIONNER LE MODE DE LIVRAISON
    await checkoutPage.selectStandardDelivery();

    // 7. ALLER À L'ONGLET PAIEMENT
    await checkoutPage.goToPaymentTab(); 

    // 8. REMPLIR LES INFORMATIONS DE PAIEMENT
    const paymentData = {
      paymentCardNumber: '4242424242424242', // Numéro de carte de test Stripe
      paymentCardName: signUpData.name,
      paymentExpiry: '12/25',
      paymentCv: '123',
    };

    await checkoutPage.confirmPayment(paymentData);

    // 9. VÉRIFIER LA CONFIRMATION DE COMMANDE
    await expect(checkoutPage.orderConfirmedHeading).toBeVisible({ timeout: 10000 });
    
    // Vérifier que nous sommes toujours sur la page de checkout après confirmation
    const finalUrl = await page.url();
    expect(finalUrl).toContain('/checkout');

    console.log('✅ Test E2E complet réussi !');
    console.log(`📧 Compte créé : ${signUpData.email}`);
    console.log(`🛒 Produits ajoutés : ${productIds.join(', ')}`);
    console.log(`📦 Livraison : ${shippingData.shippingCity}`);
    console.log(`💳 Paiement : ${paymentData.paymentCardNumber.slice(-4)}`);
  });

  test('Parcours E2E avec utilisateur existant', async ({ 
    page, 
    cartPage, 
    checkoutPage, 
    validEmail, 
    validPassword 
  }) => {
    // 1. CONNEXION AVEC COMPTE EXISTANT
    await page.goto('/auth');
    await page.locator('[data-testid="login-email-input"]').fill(validEmail);
    await page.locator('[data-testid="login-password-input"]').fill(validPassword);
    await page.locator('[data-testid="login-submit-button"]').click();
    
    await page.waitForURL(url => !url.pathname.includes('/auth'));

    // 2. SHOPPING ET AJOUT AU PANIER
    await page.goto('/products', { waitUntil: 'networkidle' });
    
    // Ajouter quelques produits différents
    const products = [
      { id: '2', quantity: 2 },
      { id: '4', quantity: 1 },
    ];

    let totalItems = 0;
    for (const product of products) {
      for (let i = 0; i < product.quantity; i++) {
        await page.locator(`[data-testid="add-to-cart-${product.id}"]`).click();
        totalItems++;
        await page.locator('[data-testid="cart-button"]').getByText(totalItems.toString()).waitFor();
      }
    }

    // 3. VALIDER LE PANIER
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForLoadState('networkidle');

    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBeGreaterThan(0);

    // 4. CHECKOUT RAPIDE (EXPRESS)
    await cartPage.proceedToCheckout();
    await checkoutPage.selectExpressDelivery();

    // Infos de livraison simplifiées
    const quickShipping = {
      shippingFirstname: faker.person.firstName(),
      shippingLastname: faker.person.lastName(), 
      shippingEmail: validEmail,
      shippingPhone: faker.phone.number(),
      shippingAddress: faker.location.streetAddress(),
      shippingCity: faker.location.city(),
      shippingPostalCode: faker.location.zipCode(),
    };

    await checkoutPage.fillShippingInfo(quickShipping);
    await checkoutPage.goToPaymentTab();

    // Paiement express
    const quickPayment = {
      paymentCardNumber: '5555555555554444', // Mastercard de test
      paymentCardName: faker.person.fullName(),
      paymentExpiry: '06/26',
      paymentCv: '456',
    };

    await checkoutPage.confirmPayment(quickPayment);
    await expect(checkoutPage.orderConfirmedHeading).toBeVisible({ timeout: 10000 });

    console.log('✅ Test E2E utilisateur existant réussi !');
  });

  test('Parcours E2E abandonné puis repris', async ({ 
    page, 
    loginPage, 
    cartPage, 
    checkoutPage 
  }) => {
    // 1. CRÉER UN COMPTE
    await loginPage.navigateToLogin();
    
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
    };

    await cartPage.navBarSignUp.click();
    await loginPage.FillSignUpForm(userData);
    await cartPage.signUpButton.click();
    await loginPage.waitForRedirect();

    // 2. AJOUTER PRODUITS AU PANIER
    await page.goto('/products', { waitUntil: 'networkidle' });
    
    await page.locator('[data-testid="add-to-cart-1"]').click();
    await page.locator('[data-testid="cart-button"]').getByText('1').waitFor();
    await page.locator('[data-testid="add-to-cart-3"]').click();
    await page.locator('[data-testid="cart-button"]').getByText('2').waitFor();

    // 3. ALLER AU PANIER PUIS ABANDONNER (retour shopping)
    await page.locator('[data-testid="cart-button"]').click();
    await cartPage.continueShopping();
    expect(page.url()).toContain('/products');

    // 4. AJOUTER ENCORE UN PRODUIT
    await page.locator('[data-testid="add-to-cart-2"]').click();
    await page.locator('[data-testid="cart-button"]').getByText('3').waitFor();

    // 5. REPRENDRE LE CHECKOUT
    await page.locator('[data-testid="cart-button"]').click();
    const finalCartCount = await cartPage.getCartItemCount();
    expect(finalCartCount).toBe(3);

    await cartPage.proceedToCheckout();

    // 6. COMPLÉTER L'ACHAT
    const shippingInfo = {
      shippingFirstname: faker.person.firstName(),
      shippingLastname: faker.person.lastName(),
      shippingEmail: userData.email,
      shippingPhone: faker.phone.number(),
      shippingAddress: faker.location.streetAddress(),
      shippingCity: faker.location.city(),
      shippingPostalCode: faker.location.zipCode(),
    };

    await checkoutPage.fillShippingInfo(shippingInfo);
    await checkoutPage.selectStandardDelivery();
    await checkoutPage.goToPaymentTab();

    const paymentInfo = {
      paymentCardNumber: '4000002500003155', // Carte de test avec 3D Secure
      paymentCardName: userData.name,
      paymentExpiry: '09/27',
      paymentCv: '789',
    };

    await checkoutPage.confirmPayment(paymentInfo);
    await expect(checkoutPage.orderConfirmedHeading).toBeVisible({ timeout: 15000 });

    console.log('✅ Test E2E avec abandon/reprise réussi !');
  });

});