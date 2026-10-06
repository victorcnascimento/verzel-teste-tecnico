const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

// Diretório de evidências relativo à raiz do projeto
const EVIDENCIAS = path.resolve(__dirname, '../../../docs/evidencias');

/**
 * Teste de integração que reproduz o BUG-02 (API aceita quantidade maior que 5).
 * Envia uma requisição POST ao endpoint `/api/pedidos` com uma quantidade inválida
 * e verifica se a resposta contém o código e a mensagem de erro esperados.
 */
test('test_bug2_evidence', async ({ request }) => {
  // Payload que reproduz o bug (6 unidades do mesmo produto)
  const payload = {
    itens: [
      {
        produtoId: 'JAQUETA-001',
        quantidade: 6, // ultrapassa o limite máximo permitido de 5 unidades
        preco: 229.90
      }
    ],
    cliente: {
      nome: 'Victor Cezari',
      email: 'victor-cezari@example.com',
      endereco: 'Rua Teste, 123',
      cep: '01310-100'
    }
  };

  const response = await request.post('https://verzel-store.qa-test-verzel-store.workers.dev/api/pedidos', {
    data: payload,
    headers: { 'Content-Type': 'application/json' }
  });

  // Exibe o JSON bruto da resposta para fins de coleta de evidência
  const body = await response.json();
  console.log('Corpo da resposta:', JSON.stringify(body, null, 2));

  // Salva a resposta da API como evidência do BUG-02 em docs/evidencias/
  const evidenciaPath = path.join(EVIDENCIAS, 'BUG02_limite_5_unidades_api.json');
  fs.writeFileSync(evidenciaPath, JSON.stringify({ status: response.status(), body }, null, 2), 'utf-8');
  console.log(`Evidência salva em: ${evidenciaPath}`);

  // A API deve rejeitar a requisição com HTTP 422 e um código de erro específico
  expect(response.status()).toBe(422);
  expect(body?.erro?.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
});
