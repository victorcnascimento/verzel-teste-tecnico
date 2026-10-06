# Relatório de Bugs Encontrados (Bug Reports)

**Projeto:** Verzel Store  
**Versão:** 2.3.0 (Card VZS-142)  
**Ambiente:** https://verzel-store.qa-test-verzel-store.workers.dev/  
**Responsável QA:** Victor Cezari Nascimento  
**Data:** 06/10/2026  

---

## Sumário dos Defeitos Identificados

| ID | Título | Severidade | Prioridade | Critério Afetado | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | Frete grátis não é concedido quando o subtotal atinge exatamente R$ 200,00 | Alta | Alta | CA06, CA07, CA11 | Aberto |
| **BUG-02** | API `/api/pedidos` e `/api/carrinho/calcular` não bloqueiam quantidade de produto superior a 5 unidades | Alta | Alta | CA10 | Aberto |

---

## BUG-01: Frete grátis não é concedido quando o subtotal atinge exatamente R$ 200,00

### 1. Dados Gerais
- **ID:** BUG-01
- **Título:** Frete grátis não é aplicado para compras com subtotal exatamente igual a R$ 200,00
- **Severidade:** Alta (Impacto direto no cálculo financeiro e cobrança indevida de frete do cliente)
- **Prioridade:** Alta
- **Componentes:** Backend (API `/api/carrinho/calcular` e `/api/pedidos`) e Frontend (Carrinho)
- **Critério de Aceite Violado:** **CA06** ("O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive.") e **CA07** ("Abaixo de R$ 200,00, é cobrado frete fixo de R$ 19,90 e o carrinho informa quanto falta para o frete grátis.")

### 2. Descrição do Problema
De acordo com o critério de aceite **CA06**, compras com subtotal a partir de R$ 200,00 (inclusive) devem ter frete grátis (`R$ 0,00`).  
Contudo, ao adicionar produtos cujo subtotal totaliza exatamente R$ 200,00 (por exemplo, 2 unidades do produto `P005 - Mochila Urbana 20L` ou 4 unidades de `P008 - Garrafa Térmica 750ml`), o sistema cobra indevidamente a taxa de frete de R$ 19,90 e define `freteGratis: false`.  
Adicionalmente, o sistema exibe a mensagem inconsistente: `"Faltam R$ 0,00 para o frete grátis."`, cobrando R$ 19,90 de frete.

### 3. Passos para Reprodução (Via Interface Web)
1. Acesse a loja: `https://verzel-store.qa-test-verzel-store.workers.dev/`
2. Adicione 1 unidade do produto "Mochila Urbana 20L" (R$ 100,00) ao carrinho.
3. Acesse a página do carrinho `/carrinho`.
4. Clique no botão `+` para alterar a quantidade da Mochila para 2 unidades (subtotal = R$ 200,00).
5. Observe a seção "Resumo do pedido".

### 4. Passos para Reprodução (Via API)
Enviar requisição `POST` para `https://verzel-store.qa-test-verzel-store.workers.dev/api/carrinho/calcular`:
```json
{
  "itens": [
    { "produtoId": "P005", "quantidade": 2 }
  ]
}
```

### 5. Resultado Obtido
- **API Status:** `200 OK`
- **Payload retornado:**
```json
{
  "itens": [
    { "produtoId": "P005", "nome": "Mochila Urbana 20L", "precoUnitario": 100, "quantidade": 2, "total": 200 }
  ],
  "subtotal": 200,
  "desconto": 0,
  "frete": 19.9,
  "freteGratis": false,
  "valorFaltanteFreteGratis": 0,
  "total": 219.9,
  "cupom": null
}
```
- **Interface:** Cobrança de R$ 19,90 no total e texto `"Faltam R$ 0,00 para o frete grátis."`.

### 6. Resultado Esperado
- Conforme o critério **CA06**, para subtotal a partir de R$ 200,00 (inclusive):
  - `frete`: `0`
  - `freteGratis`: `true`
  - `valorFaltanteFreteGratis`: `0`
  - `total`: `200.00`
  - Na interface: Texto de Frete "Grátis" e nenhuma mensagem dizendo que falta valor para frete grátis.

### 7. Causa Raiz Provável
A validação lógica no backend provavelmente utilizou a condição de desigualdade estrita `subtotal > 200` ao invés de `subtotal >= 200`.

### 8. Evidência Anexa
- Screenshot: `docs/evidencias/BUG01_frete_gratis_subtotal_200.png`

---

## BUG-02: API `/api/pedidos` e `/api/carrinho/calcular` não bloqueiam quantidade de produto superior a 5 unidades

### 1. Dados Gerais
- **ID:** BUG-02
- **Título:** API permite cálculo e confirmação de pedidos com mais de 5 unidades do mesmo produto
- **Severidade:** Alta (Falha de validação de regra de negócio no backend; bypass das restrições de UI)
- **Prioridade:** Alta
- **Componentes:** Backend (API `/api/carrinho/calcular` e `/api/pedidos`)
- **Critério de Aceite Violado:** **CA10** ("Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API.") e Tabela de Códigos de Erro (`422 QUANTIDADE_MAXIMA_EXCEDIDA`).

### 2. Descrição do Problema
Enquanto a interface gráfica respeita o limite desabilitando o botão `+` ao atingir 5 unidades, a API não valida o limite máximo de 5 unidades estipulado no critério **CA10**.  
Ao submeter requisições diretamente para os endpoints `/api/carrinho/calcular` ou `/api/pedidos` com quantidade superior a 5 (ex: 6 ou 10 unidades de um produto), o backend processa o cálculo com sucesso (`200 OK`) e permite a confirmação do pedido (`201 Created`), não retornando o erro documentado `422 QUANTIDADE_MAXIMA_EXCEDIDA`.

### 3. Passos para Reprodução (Via API)
Enviar requisição `POST` para `https://verzel-store.qa-test-verzel-store.workers.dev/api/pedidos` com o seguinte corpo:
```json
{
  "cliente": {
    "nome": "João da Silva",
    "email": "joao.silva@exemplo.com",
    "cep": "01310-100"
  },
  "itens": [
    { "produtoId": "P005", "quantidade": 6 }
  ]
}
```

### 4. Resultado Obtido
- **Status HTTP:** `201 Created`
- O pedido é aceito e gerado normalmente com 6 unidades:
```json
{
  "numero": "VZ-135307",
  "criadoEm": "2026-10-06T15:16:09.652Z",
  "cliente": {
    "nome": "João da Silva",
    "email": "joao.silva@exemplo.com",
    "cep": "01310100"
  },
  "itens": [
    {
      "produtoId": "P005",
      "nome": "Mochila Urbana 20L",
      "precoUnitario": 100,
      "quantidade": 6,
      "total": 600
    }
  ],
  "subtotal": 600,
  "desconto": 0,
  "frete": 0,
  "freteGratis": true,
  "valorFaltanteFreteGratis": 0,
  "total": 600,
  "cupom": null
}
```

### 5. Resultado Esperado
- A API deve rejeitar a requisição com **Status HTTP 422 Unprocessable Entity**.
- Payload com formato documentado de erro:
```json
{
  "erro": {
    "codigo": "QUANTIDADE_MAXIMA_EXCEDIDA",
    "mensagem": "A quantidade máxima por produto é de 5 unidades.",
    "campo": "itens[0].quantidade"
  }
}
```

### 6. Causa Raiz Provável
Ausência de validação condicional `if (item.quantidade > 5)` no handler das rotas de cálculo e criação de pedido do backend.

### 7. Evidência Anexa
- Screenshot da regra na UI (onde funciona): `docs/evidencias/CT10_limite_5_unidades_interface.png`
- Registro da resposta da API nos testes de integração: `test_bug2_evidence.js`
