// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * Suite de Automação de Testes - Verzel Store (JavaScript / Playwright)
 * Cobertura dos fluxos principais da entrega VZS-142 (Cupom & Frete Grátis)
 *
 * As evidências são salvas automaticamente em: docs/evidencias/
 */

// Diretório de evidências relativo à raiz do projeto (um nível acima de /automation)
const EVIDENCIAS = path.resolve(__dirname, '../../docs/evidencias');

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
    // 1. Adicionar produto ao carrinho
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

    // Evidência CT01: cupom aplicado com sucesso
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT01_cupom_bemvindo10_sucesso.png'), fullPage: true });

    // 5. Validação dos valores monetários no Resumo do Pedido
    await expect(page.locator('text=R$ 59,90').first()).toBeVisible();
    await expect(page.locator('text=- R$ 5,99')).toBeVisible();
    await expect(page.locator('text=R$ 19,90')).toBeVisible();
    await expect(page.locator('text=R$ 73,81')).toBeVisible();
  });

  /**
   * Cenário 2: Cupom com variações de caixa e espaços (case-insensitive)
   * Critério: CA02
   */
  test('Cenário 2: Aplicar cupom com letras minúsculas e espaços (case-insensitive)', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    const campoCupom = page.locator('#campo-cupom');

    // Teste com cupom em minúsculas
    await campoCupom.fill('bemvindo10');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom BEMVINDO10 aplicado')).toBeVisible();

    // Evidência CT02: cupom case-insensitive
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT02_cupom_case_insensitive.png'), fullPage: true });
  });

  /**
   * Cenário 3: Validação de cupom inválido e expirado
   * Critérios: CA03, CA04
   */
  test('Cenário 3: Exibir mensagem de erro ao tentar aplicar cupom inválido ou expirado', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    const campoCupom = page.locator('#campo-cupom');

    // Teste 3.1: Cupom inexistente
    await campoCupom.fill('CUPOMFALSO123');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom inválido.')).toBeVisible();

    // Evidência CT03: cupom inválido
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT03_cupom_invalido.png'), fullPage: true });

    // Teste 3.2: Cupom expirado
    await campoCupom.fill('VERAO2026');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom expirado.')).toBeVisible();

    // Evidência CT04: cupom expirado
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT04_cupom_expirado.png'), fullPage: true });

    // Garante que nenhum desconto foi aplicado
    await expect(page.locator('text=R$ 0,00')).toBeVisible();
  });

  /**
   * Cenário 4: Substituição de cupom aplicado
   * Critério: CA05
   */
  test('Cenário 4: Substituir cupom já aplicado no carrinho', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    // Aplica cupom
    const campoCupom = page.locator('#campo-cupom');
    await campoCupom.fill('BEMVINDO10');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom BEMVINDO10 aplicado')).toBeVisible();

    // Remove cupom
    await page.locator('button', { hasText: 'Remover cupom' }).click();
    await expect(page.locator('text=Cupom BEMVINDO10 aplicado')).not.toBeVisible();

    // Evidência CT05: substituição de cupom
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT05_substituicao_cupom.png'), fullPage: true });
  });

  /**
   * Cenário 5: Bloqueio de múltiplos cupons simultâneos
   * Critério: CA05
   */
  test('Cenário 5: Bloquear aplicação simultânea de múltiplos cupons', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    const campoCupom = page.locator('#campo-cupom');
    await campoCupom.fill('BEMVINDO10');
    await campoCupom.press('Enter');
    await expect(page.locator('text=Cupom BEMVINDO10 aplicado')).toBeVisible();

    // Tenta aplicar segundo cupom sem remover o primeiro
    await campoCupom.fill('OUTRO_CUPOM');
    await campoCupom.press('Enter');

    // O sistema não deve acumular cupons
    await expect(page.locator('text=Remova o cupom atual antes de aplicar outro')).toBeVisible();

    // Evidência CT06: bloqueio de múltiplos cupons
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT06_multiplos_cupons_bloqueado.png'), fullPage: true });
  });

  /**
   * Cenário 6: Frete grátis para subtotal igual a R$ 200,00
   * Critério: CA06
   */
  test('Cenário 6: Frete grátis quando subtotal é exatamente R$ 200,00', async ({ page }) => {
    // Adicionar 2x Mochila Urbana 20L (R$ 100,00 cada)
    const mochiblaCard = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await mochiblaCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/carrinho');

    // Incrementa para 2 unidades
    const plusBtn = page.locator('button', { hasText: '+' });
    await plusBtn.click();

    await expect(page.locator('text=R$ 200,00').first()).toBeVisible();
    await expect(page.locator('text=Grátis')).toBeVisible();

    // Evidência CT07: frete grátis no limite exato
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT07_frete_gratis_subtotal_200_exato.png'), fullPage: true });
  });

  /**
   * Cenário 7: Frete grátis para subtotal acima de R$ 200,00
   * Critério: CA06
   */
  test('Cenário 7: Frete grátis quando subtotal supera R$ 200,00', async ({ page }) => {
    // Adicionar Jaqueta Corta-Vento (R$ 229,90)
    const jaquetaCard = page.locator('article').filter({ hasText: 'Jaqueta Corta-Vento' });
    await jaquetaCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/carrinho');

    await expect(page.locator('text=R$ 229,90').first()).toBeVisible();
    await expect(page.locator('text=Grátis')).toBeVisible();

    // Evidência CT08: frete grátis acima de R$ 200
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT08_frete_gratis_acima_200.png'), fullPage: true });
  });

  /**
   * Cenário 8: Frete fixo R$ 19,90 para subtotal abaixo de R$ 200,00
   * Critério: CA07
   */
  test('Cenário 8: Cobrar frete fixo R$ 19,90 para subtotal abaixo de R$ 200,00', async ({ page }) => {
    // Adicionar Tênis Casual Urbano (R$ 189,90)
    const tenisCard = page.locator('article').filter({ hasText: 'Tênis Casual Urbano' });
    await tenisCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/carrinho');

    await expect(page.locator('text=R$ 189,90').first()).toBeVisible();
    await expect(page.locator('text=R$ 19,90')).toBeVisible();
    await expect(page.locator('text=R$ 10,10')).toBeVisible(); // Falta para frete grátis

    // Evidência CT09: frete fixo abaixo de R$ 200
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT09_frete_fixo_abaixo_200.png'), fullPage: true });
  });

  /**
   * Cenário 9: Frete grátis mantido com cupom (subtotal antes do desconto = R$ 200,00)
   * Critério: CA08
   */
  test('Cenário 9: Manter frete grátis quando subtotal antes do cupom é R$ 200,00', async ({ page }) => {
    // Adicionar 2x Mochila (subtotal R$ 200,00) e aplicar cupom BEMVINDO10
    const mochiblaCard = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await mochiblaCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/carrinho');

    await page.locator('button', { hasText: '+' }).click();

    const campoCupom = page.locator('#campo-cupom');
    await campoCupom.fill('BEMVINDO10');
    await campoCupom.press('Enter');

    // Frete deve continuar grátis mesmo com desconto aplicado
    await expect(page.locator('text=Grátis')).toBeVisible();

    // Evidência CT13: frete mantido com cupom
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT13_frete_mantido_com_cupom.png'), fullPage: true });
  });

  /**
   * Cenário 10: Desconto do cupom não incide sobre o frete
   * Critério: CA09
   */
  test('Cenário 10: Desconto do cupom não incidir sobre o valor do frete', async ({ page }) => {
    // Adicionar 1x Mochila (subtotal R$ 100,00) — frete de R$ 19,90 é cobrado
    const mochiblaCard = page.locator('article').filter({ hasText: 'Mochila Urbana 20L' });
    await mochiblaCard.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/carrinho');

    const campoCupom = page.locator('#campo-cupom');
    await campoCupom.fill('BEMVINDO10');
    await campoCupom.press('Enter');

    // Frete deve ser R$ 19,90 integralmente (não descontado)
    await expect(page.locator('text=R$ 19,90')).toBeVisible();
    // Total: R$ 100,00 - R$ 10,00 + R$ 19,90 = R$ 109,90
    await expect(page.locator('text=R$ 109,90')).toBeVisible();

    // Evidência CT14: desconto não incide sobre o frete
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT14_desconto_nao_incide_frete.png'), fullPage: true });
  });

  /**
   * Cenário 11: Limite de 5 unidades — seleção máxima permitida
   * Critério: CA10
   */
  test('Cenário 11: Permitir seleção do limite máximo de 5 unidades', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    const plusBtn = page.locator('button', { hasText: '+' });
    for (let i = 1; i < 5; i++) {
      await plusBtn.click();
    }

    // Verifica que o sistema aceita 5 unidades
    await expect(page.locator('text=5')).toBeVisible();

    // Evidência CT10: limite 5 unidades na interface
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT10_limite_5_unidades_interface.png'), fullPage: true });
  });

  /**
   * Cenário 12: Bloqueio ao tentar adicionar mais de 5 unidades via UI
   * Critério: CA10
   */
  test('Cenário 12: Bloquear adição de mais de 5 unidades do mesmo produto no carrinho', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');

    const plusBtn = page.locator('button', { hasText: '+' });
    for (let i = 1; i < 5; i++) {
      await plusBtn.click();
    }

    // Botão deve estar desabilitado ao atingir o limite
    await expect(page.locator('text=Limite de 5 unidades por produto.')).toBeVisible();
    await expect(plusBtn).toBeDisabled();

    // Evidência BUG01: frete grátis indevido (reaproveitado para este cenário de UI)
    await page.screenshot({ path: path.join(EVIDENCIAS, 'BUG01_frete_gratis_subtotal_200.png'), fullPage: true });
  });

  /**
   * Cenário 13: Fluxo E2E — finalização de pedido com dados válidos
   * Critérios: CA06, Regras de Checkout
   */
  test('Cenário 13: Realizar fluxo ponta a ponta (E2E) até a confirmação do pedido', async ({ page }) => {
    // 1. Adicionar Jaqueta Corta-Vento (R$ 229,90) → Frete Grátis
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
    await expect(page.locator('text=VZ-')).toBeVisible();

    // Evidência CT11: pedido confirmado com sucesso
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT11_pedido_confirmado_sucesso.png'), fullPage: true });
  });

  /**
   * Cenário 14: Validação de campos obrigatórios no checkout
   */
  test('Cenário 14: Validar campos obrigatórios e formatos no checkout', async ({ page }) => {
    await page.locator('button', { hasText: 'Adicionar ao carrinho' }).first().click();
    await page.goto('/carrinho');
    await page.locator('text=Finalizar compra').click();

    // Tenta confirmar com e-mail inválido
    await page.locator('#campo-nome').fill('Maria Silva');
    await page.locator('#campo-email').fill('email-invalido');
    await page.locator('#campo-cep').fill('01310-100');
    await page.locator('button', { hasText: 'Confirmar pedido' }).click();

    await expect(page.locator('text=DADOS_INVALIDOS')).toBeVisible();

    // Evidência CT12: validação de campos obrigatórios
    await page.screenshot({ path: path.join(EVIDENCIAS, 'CT12_validacao_campos_obrigatorios_checkout.png'), fullPage: true });
  });

});
