const { test, expect } = require('@playwright/test');

/**
 * Integration test that reproduces BUG‑02 (API accepts quantity > 5).
 * It sends a POST request to the `/api/pedidos` endpoint with an invalid quantity
 * and verifies that the response contains the expected error code and message.
 */
test('test_bug2_evidence', async ({ request }) => {
  // Payload that triggers the bug (6 unidades do mesmo produto)
  const payload = {
    itens: [
      {
        produtoId: 'JAQUETA-001',
        quantidade: 6, // exceeds the allowed maximum of 5
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

  // Log the raw JSON for evidence collection
  const body = await response.json();
  console.log('Response body:', JSON.stringify(body, null, 2));

  // The API should reject the request with HTTP 422 and a specific error code
  expect(response.status()).toBe(422);
  expect(body?.erro?.codigo).toBe('QUANTIDADE_MAXIMA_EXCEDIDA');
});
