// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Suite de Automação de Testes - Verzel Store (JavaScript / Playwright)
 * Cobertura dos fluxos principais da entrega VZS-142 (Cupom & Frete Grátis)
 */

test.describe('Funcionalidade: Cupons de Desconto e Frete Grátis', () => {

  test.beforeEach(async ({ page }) => {
    // Acessa a página inicial de produtos
    await page.goto('/');
  });

  /**
   * Cenário 1: Aplicação com sucesso do cupom BEMVINDO10
   * Critérios: CA01, CA02, CA09
   */
  test('Cenário 1: Aplicar cupom de desconto BEMVINDO10 com sucesso no carrinho', async ({ page }) => {
    // 1. Adicionar produto 'Camiseta Essencial' (R$ 59,90) ao carrinho
    const addBtn = page.locator('button', { hasText: 'Adicionar ao carrinho' }).first();
    await addBtn.click();

    // 2. Navegar para a página do carrinho
    await page.goto('/carrinho');
    await expect(page).toHaveURL(/.*carrinho/);

    // 3. Informar cupom 'BEMVINDO10' no campo de cupom
    const campoCupom = page.locator('#campo-cupom');
    await campoCupom.fill('BEMVINDO10');
    await campoCupom.press('Enter');

    // 4. Validação da mensagem de cupom aplicado
    const msgCupom = page.locator('text=Cupom BEMVINDO10 aplicado');
    await expect(msgCupom).toBeVisible();

    // 5. Validação dos valores monetários no Resumo do Pedido
    // Subtotal: R$ 59,90 | Desconto 10%: R$ 5,99 | Frete: R$ 19,90 | Total: R$ 73,81
    await expect(page.locator('text=R$ 59,90').first()).toBeVisible();
    await expect(page.locator('text=- R$ 5,99')).toBeVisible();
    await expect(page.locator('text=R$ 19,90')).toBeVisible();
    await expect(page.locator('text=R$ 73,81')).toBeVisible();
  });

  /**
   * Cenário 2: Validação de cupom inválido e expirado
   * Critérios: CA03, CA04
   */
  test('Cenário 2: Exibir mensagem de erro ao tentar aplicar cupom inválido ou expirado', async ({ page }) => {
    // 1. Adicionar produto ao carrinho
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    const campoCupom = page.locator('#campo-cupom');

    // Teste 2.1: Cupom inexistente
    await campoCupom.fill('CUPOMFALSO123');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom inválido.')).toBeVisible();

    // Teste 2.2: Cupom expirado
    await campoCupom.fill('VERAO2026');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom expirado.')).toBeVisible();

    // Garante que nenhum desconto foi aplicado (Desconto: R$ 0,00)
    await expect(page.locator('text=R$ 0,00')).toBeVisible();
  });

  /**
   * Cenário 3: Fluxo E2E de compra completa até confirmação com dados válidos
   * Critérios: CA06, Regras de Checkout
   */
  test('Cenário 3: Realizar fluxo ponta a ponta (E2E) até a confirmação do pedido', async ({ page }) => {
    // 1. Adicionar produto 'Jaqueta Corta-Vento' (R$ 229,90) para qualificar Frete Grátis
    // Localiza o card da Jaqueta Corta-Vento
    const jaquetaCard = page.locator('article').filter({ hasText: 'Jaqueta Corta-Vento' });
    await jaquetaCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();

    // 2. Ir ao carrinho e verificar Frete Grátis
    await page.goto('/carrinho');
    await expect(page.locator('text=Grátis')).toBeVisible();

    // 3. Prosseguir para o Checkout
    await page.locator('text=Finalizar compra').click();
    await expect(page).toHaveURL(/.*checkout/);

    // 4. Preencher formulário de dados de entrega
    await page.locator('#campo-nome').fill('Carlos Eduardo');
    await page.locator('#campo-email').fill('carlos.eduardo@exemplo.com');
    await page.locator('#campo-cep').fill('01310-100');

    // 5. Confirmar pedido
    await page.locator('button', { hasText: 'Confirmar pedido' }).click();

    // 6. Validar tela de Pedido Confirmado
    await expect(page).toHaveURL(/.*pedido-confirmado/);
    await expect(page.locator('text=Pedido confirmado')).toBeVisible();
    await expect(page.locator('text=VZ-')).toBeVisible(); // Código fictício do pedido
    await expect(page.locator('text=Carlos')).toBeVisible();
  });

  /**
   * Cenário 4 (Bônus - Teste do Bug): Validação de limite máximo de 5 unidades na UI
   * Critérios: CA10
   */
  test('Cenário 4 (Bônus): Bloquear adição de mais de 5 unidades do mesmo produto no carrinho', async ({ page }) => {
    // 1. Adicionar produto ao carrinho
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    // 2. Incrementar quantidade até 5 unidades
    const plusBtn = page.locator('button', { hasText: '+' });
    for (let i = 1; i < 5; i++) {
      await plusBtn.click();
    }

    // 3. Validar mensagem e estado desabilitado do botão
    await expect(page.locator('text=Limite de 5 unidades por produto.')).toBeVisible();
    await expect(plusBtn).toBeDisabled();
  });

});
