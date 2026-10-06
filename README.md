# Desafio Técnico de QA - Verzel Store

Repositório público com todas as entregas do teste técnico de **Quality Assurance (QA)** para a aplicação **Verzel Store** (Versão 2.3.0 - Card VZS-142: *Aplicação de Cupons de Desconto e Frete Grátis*).

---

## 📋 Checklist de Entregas

| Item Solicitado | Onde Encontrar | Status |
| :--- | :--- | :---: |
| **Cenários de teste levantados a partir da documentação (Gherkin)** | [`docs/cenarios-gherkin.md`](docs/cenarios-gherkin.md) | ✅ Concluído |
| **Execução dos testes (manuais e exploratórios) com resultado** | [`docs/plano-e-execucao-testes.md`](docs/plano-e-execucao-testes.md) | ✅ Concluído |
| **Report de todos os bugs encontrados** | [`docs/bug-reports.md`](docs/bug-reports.md) | ✅ Concluído |
| **Documento com evidências da execução** | [`docs/evidencias/`](docs/evidencias/) e relatórios | ✅ Concluído |
| **Automação de pelo menos 3 cenários com Playwright (JavaScript)** | [`automation/tests/carrinho_e_pedidos.spec.js`](automation/tests/carrinho_e_pedidos.spec.js) *(4 cenários implementados e aprovados)* | ✅ Concluído |
| **README com instruções de execução e mapa das entregas** | [`README.md`](README.md) *(este documento)* | ✅ Concluído |

---

## 📁 Estrutura do Repositório

```text
├── docs/
│   ├── cenarios-gherkin.md          # Especificação BDD em formato Gherkin cobrindo CA01 a CA11
│   ├── plano-e-execucao-testes.md   # Matriz de execução de testes manuais e exploratórios com status
│   ├── bug-reports.md               # Detalhamento de bugs críticos encontrados com passos de reprodução e causa raiz
│   └── evidencias/                  # Capturas de tela organizadas por cenário e bug
│       ├── CT01_cupom_bemvindo10_sucesso.png
│       ├── CT03_cupom_invalido.png
│       ├── CT04_cupom_expirado.png
│       ├── CT10_limite_5_unidades_interface.png
│       ├── CT11_pedido_confirmado_sucesso.png
│       ├── CT12_validacao_campos_obrigatorios_checkout.png
│       └── BUG01_frete_gratis_subtotal_200.png
├── automation/
│   ├── tests/
│   │   └── carrinho_e_pedidos.spec.js  # Suíte de automação Playwright (JavaScript)
│   ├── playwright.config.js             # Configurações do Playwright
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

---

## 🐛 Resumo dos Bugs Identificados

Durante a bateria de testes exploratórios e de valores de fronteira, foram identificados **2 defeitos de alta severidade**:

1. **[BUG-01: Frete grátis não é concedido quando o subtotal atinge exatamente R$ 200,00](docs/bug-reports.md#bug-01-frete-grátis-não-é-concedido-quando-o-subtotal-atinge-exatamente-r-20000)**
   - **Severidade:** Alta
   - **Critério Violado:** CA06 (*"O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive."*)
   - **Impacto:** O sistema cobra taxa de frete de R$ 19,90 e exibe inconsistência `"Faltam R$ 0,00 para o frete grátis."`.
2. **[BUG-02: API permite cálculo e confirmação de pedidos com mais de 5 unidades do mesmo produto](docs/bug-reports.md#bug-02-api-apipedidos-e-apicarrinhocalcular-não-bloqueiam-quantidade-de-produto-superior-a-5-unidades)**
   - **Severidade:** Alta
   - **Critério Violado:** CA10 (*"Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API."*)
   - **Impacto:** Bypass da regra de limite via backend, respondendo HTTP `201 Created` ao invés de `422 QUANTIDADE_MAXIMA_EXCEDIDA`.

O relatório completo com passos de reprodução, payloads e logs está disponível em [`docs/bug-reports.md`](docs/bug-reports.md).

---

## 🤖 Como Executar a Automação de Testes (Playwright)

A automação foi desenvolvida em **JavaScript** utilizando o framework oficial **@playwright/test**.

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).
- Gerenciador de pacotes `npm`.

### 1. Clonar o repositório e acessar a pasta de automação
```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd <NOME_DO_REPOSITORIO>/automation
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Instalar os navegadores do Playwright (apenas na primeira vez)
```bash
npx playwright install chromium
```

### 4. Executar os testes automatizados
Você pode executar a suíte em modo headless:
```bash
npm test
```

Ou executar com navegador visível (modo headed):
```bash
npm run test:headed
```

Ou abrir a interface interativa do Playwright UI:
```bash
npm run test:ui
```

### 5. Visualizar o Relatório de Execução HTML
Após a execução dos testes, visualize o relatório gerado:
```bash
npm run test:report
```

---

## 🎯 Cenários Automatizados Implementados

Os seguintes cenários cobrem os fluxos primordiais exigidos no teste:

1. **Cenário 1: Aplicação do Cupom BEMVINDO10 com Sucesso**
   - Adiciona produto ao carrinho, insere cupom válido, valida mensagem de sucesso, cálculo de 10% de desconto e total final.
2. **Cenário 2: Validação Negativa de Cupons (Inválido e Expirado)**
   - Testa cupom inexistente (`INVALIDO123` $\to$ "Cupom inválido.") e cupom expirado (`VERAO2026` $\to$ "Cupom expirado."), validando a não aplicação de desconto.
3. **Cenário 3: Fluxo Ponta a Ponta (E2E) até a Confirmação do Pedido**
   - Adiciona item elegível a frete grátis, valida isenção de frete no carrinho, preenche dados do cliente no checkout e valida geração do código do pedido (`VZ-XXXXXX`).
4. **Cenário 4 (Bônus): Bloqueio de Quantidade Máxima de 5 Unidades na Interface**
   - Incrementa produto no carrinho até o limite máximo de 5 unidades e valida mensagem impeditiva e estado desabilitado do botão `+`.

