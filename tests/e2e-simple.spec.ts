import { faker } from '@faker-js/faker';
import { test, expect } from './pages/fixtures';

test.describe('Tests E2E - Parcours utilisateur simplifié et robuste', () => {

  test('E2E Complet : Création compte → Shopping → Panier → Checkout', async ({ 
    page, 
    loginPage, 
    cartPage, 
    checkoutPage 
  }) => {
    console.log('🚀 Début du test E2E complet...');
    
    // 1. CRÉATION DE COMPTE
    console.log('📝 Étape 1: Création de compte');
    await loginPage.navigateToLogin();
    
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
    };

    await cartPage.navBarSignUp.click();
    await loginPage.FillSignUpForm(userData);
    await cartPage.signUpButton.click();
    await loginPage.waitForRedirect();
    
    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).not.toContain('/auth');
    console.log('✅ Compte créé et connecté avec succès');

    // 2. SHOPPING - Ajout de produits au panier
    console.log('🛍️ Étape 2: Shopping et ajout de produits');
    await page.goto('/products', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/products');

    // Ajouter différents produits avec différentes quantités
    const productsToAdd = [
      { id: '1', name: 'Produit 1', quantity: 2 },
      { id: '3', name: 'Produit 3', quantity: 1 },
      { id: '5', name: 'Produit 5', quantity: 3 }
    ];

    let totalItemsExpected = 0;
    
    for (const product of productsToAdd) {
      console.log(`➕ Ajout ${product.quantity}x ${product.name}`);
      
      for (let i = 0; i < product.quantity; i++) {
        const addButton = page.locator(`[data-testid="add-to-cart-${product.id}"]`);
        await expect(addButton).toBeVisible();
        await addButton.click();
        
        totalItemsExpected++;
        await page.locator('[data-testid="cart-button"]')
          .getByText(totalItemsExpected.toString())
          .waitFor({ timeout: 5000 });
      }
    }
    
    console.log(`✅ ${totalItemsExpected} produits ajoutés au panier`);

    // 3. GESTION DU PANIER
    console.log('🛒 Étape 3: Gestion du panier');
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/cart');

    // Vérifier le contenu du panier
    const cartItemCount = await cartPage.getCartItemCount();
    expect(cartItemCount).toBe(productsToAdd.length); // 3 types de produits différents
    console.log(`✅ Panier contient ${cartItemCount} types de produits`);

    // Tester la modification de quantité
    console.log('🔧 Test de modification de quantité');
    const initialQuantity = await cartPage.getQuantity('1');
    await cartPage.increaseQuantity('1');
    await page.waitForTimeout(1000);
    
    const newQuantity = await cartPage.getQuantity('1');
    expect(newQuantity).toBe(initialQuantity + 1);
    totalItemsExpected++;
    
    await page.locator('[data-testid="cart-button"]')
      .getByText(totalItemsExpected.toString())
      .waitFor({ timeout: 5000 });
    console.log('✅ Quantité modifiée avec succès');

    // 4. PROCÉDER AU CHECKOUT
    console.log('💳 Étape 4: Processus de checkout');
    await cartPage.proceedToCheckout();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/checkout');
    console.log('✅ Page de checkout atteinte');

    // 5. REMPLIR LES INFORMATIONS DE LIVRAISON
    console.log('📦 Étape 5: Informations de livraison');
    const shippingData = {
      shippingFirstname: faker.person.firstName(),
      shippingLastname: faker.person.lastName(),
      shippingEmail: userData.email,
      shippingPhone: faker.phone.number(),
      shippingAddress: faker.location.streetAddress(),
      shippingCity: faker.location.city(),
      shippingPostalCode: faker.location.zipCode(),
    };

    await checkoutPage.fillShippingInfo(shippingData);
    console.log(`✅ Informations de livraison remplies pour ${shippingData.shippingCity}`);

    // 6. VÉRIFICATIONS FINALES
    console.log('🎯 Étape 6: Vérifications finales');
    
    // Vérifier qu'on est toujours sur checkout
    const finalUrl = await page.url();
    expect(finalUrl).toContain('/checkout');
    
    // Vérifier que l'utilisateur est toujours connecté
    expect(finalUrl).not.toContain('/auth');
    
    console.log('🎉 TEST E2E COMPLET RÉUSSI !');
    console.log(`👤 Utilisateur: ${userData.email}`);
    console.log(`🛍️ Produits: ${productsToAdd.length} types, ${totalItemsExpected} items total`);
    console.log(`📍 Livraison: ${shippingData.shippingCity}, ${shippingData.shippingPostalCode}`);
  });

  test('E2E Rapide : Utilisateur existant → Shopping express', async ({ 
    page, 
    cartPage, 
    checkoutPage,
    validEmail,
    validPassword 
  }) => {
    console.log('⚡ Début du test E2E rapide...');

    // 1. CONNEXION RAPIDE
    console.log('🔑 Connexion avec compte existant');
    await page.goto('/auth');
    await page.locator('[data-testid="login-email-input"]').fill(validEmail);
    await page.locator('[data-testid="login-password-input"]').fill(validPassword);
    await page.locator('[data-testid="login-submit-button"]').click();
    
    await page.waitForURL(url => !url.pathname.includes('/auth'));
    console.log('✅ Connexion réussie');

    // 2. SHOPPING EXPRESS
    console.log('🏃 Shopping express');
    await page.goto('/products', { waitUntil: 'networkidle' });
    
    // Ajout rapide de 2 produits
    await page.locator('[data-testid="add-to-cart-2"]').click();
    await page.locator('[data-testid="cart-button"]').getByText('1').waitFor();
    
    await page.locator('[data-testid="add-to-cart-4"]').click();
    await page.locator('[data-testid="cart-button"]').getByText('2').waitFor();
    
    console.log('✅ 2 produits ajoutés rapidement');

    // 3. CHECKOUT EXPRESS
    console.log('🚀 Checkout express');
    await page.locator('[data-testid="cart-button"]').click();
    
    const cartCount = await cartPage.getCartItemCount();
    expect(cartCount).toBeGreaterThan(0);
    
    await cartPage.proceedToCheckout();
    expect(page.url()).toContain('/checkout');
    
    console.log('🎉 TEST E2E RAPIDE RÉUSSI !');
  });

  test('E2E Gestion panier : Ajout → Modification → Suppression', async ({ 
    page, 
    loginPage, 
    cartPage 
  }) => {
    console.log('🔄 Test de gestion complète du panier');

    // 1. SETUP UTILISATEUR
    await loginPage.navigateToLogin();
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: 'TestUser123!',
      confirmPassword: 'TestUser123!',
    };

    await cartPage.navBarSignUp.click();
    await loginPage.FillSignUpForm(userData);
    await cartPage.signUpButton.click();
    await loginPage.waitForRedirect();

    // 2. AJOUTS AU PANIER
    console.log('➕ Ajouts multiples au panier');
    await page.goto('/products', { waitUntil: 'networkidle' });
    
    // Ajouter plusieurs fois le même produit
    for (let i = 1; i <= 3; i++) {
      await page.locator('[data-testid="add-to-cart-1"]').click();
      await page.locator('[data-testid="cart-button"]').getByText(i.toString()).waitFor();
    }
    
    // Ajouter un autre produit 
    await page.locator('[data-testid="add-to-cart-2"]').click();
    await page.locator('[data-testid="cart-button"]').getByText('4').waitFor();
    
    console.log('✅ 4 items ajoutés (2 produits différents)');

    // 3. GESTION DANS LE PANIER
    await page.locator('[data-testid="cart-button"]').click();
    await page.waitForLoadState('networkidle');

    console.log('🔧 Modifications des quantités');
    
    // Augmenter quantité produit 1
    const qty1Before = await cartPage.getQuantity('1');
    await cartPage.increaseQuantity('1');
    await page.waitForTimeout(500);
    const qty1After = await cartPage.getQuantity('1');
    expect(qty1After).toBe(qty1Before + 1);
    
    // Diminuer quantité produit 1
    await cartPage.decreaseQuantity('1');
    await page.waitForTimeout(500);
    const qty1Final = await cartPage.getQuantity('1');
    expect(qty1Final).toBe(qty1Before);
    
    console.log('✅ Quantités modifiées correctement');

    // 4. SUPPRESSION D'ARTICLE
    console.log('🗑️ Suppression d\'articles');
    const initialCount = await cartPage.getCartItemCount();
    
    await cartPage.removeItem('2');
    await page.waitForTimeout(1000);
    
    const newCount = await cartPage.getCartItemCount();
    expect(newCount).toBe(initialCount - 1);
    
    console.log('✅ Article supprimé avec succès');

    // 5. CONTINUER SHOPPING
    console.log('🔄 Test continuer shopping');
    await cartPage.continueShopping();
    expect(page.url()).toContain('/products');
    
    // Ajouter encore un produit
    await page.locator('[data-testid="add-to-cart-3"]').click();
    
    console.log('🎉 TEST DE GESTION PANIER RÉUSSI !');
  });

});