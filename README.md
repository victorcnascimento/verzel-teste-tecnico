# Desafio Técnico de QA - Verzel Store

Repositório público com todas as entregas do teste técnico de **Quality Assurance (QA)** para a aplicação **Verzel Store** (Versão 2.3.0 - Card VZS-142: *Aplicação de Cupons de Desconto e Frete Grátis*).

---

## 📋 Checklist de Entregas

| Item Solicitado | Onde Encontrar | Status |
| :--- | :--- | :---: |
| **Cenários de teste levantados a partir da documentação (Gherkin)** | [`docs/cenarios-gherkin.md`](docs/cenarios-gherkin.md) | ✅ Concluído |
| **Execução dos testes (manuais e exploratórios) com resultado** | [`docs/plano-e-execucao-testes.md`](docs/plano-e-execucao-testes.md) | ✅ Concluído |
| **Report de todos os bugs encontrados** | [`docs/bug-reports.md`](docs/bug-reports.md) | ✅ Concluído |
| **Documento com evidências da execução** | [`docs/evidencias/`](docs/evidencias/) | ✅ Concluído |
| **Automação de pelo menos 3 cenários com Playwright (JavaScript)** | [`automation/tests/`](automation/tests/) *(14 cenários automatizados + teste de integração BUG-02)* | ✅ Concluído |
| **README com instruções de execução e mapa das entregas** | [`README.md`](README.md) *(este documento)* | ✅ Concluído |

---

## 📁 Estrutura do Repositório

```text
├── docs/
│   ├── cenarios-gherkin.md          # Especificação BDD em formato Gherkin cobrindo CA01 a CA11
│   ├── plano-e-execucao-testes.md   # Matriz de execução de testes manuais e exploratórios com status
│   ├── bug-reports.md               # Detalhamento de bugs críticos com passos de reprodução e causa raiz
│   └── evidencias/                  # Capturas de tela e registros organizados por cenário e bug
│       ├── CT01_cupom_bemvindo10_sucesso.png
│       ├── CT02_cupom_case_insensitive.png
│       ├── CT03_cupom_invalido.png
│       ├── CT04_cupom_expirado.png
│       ├── CT05_substituicao_cupom.png
│       ├── CT07_frete_gratis_subtotal_200_exato.png
│       ├── CT08_frete_gratis_acima_200.png
│       ├── CT09_frete_fixo_abaixo_200.png
│       ├── CT10_limite_5_unidades_interface.png
│       ├── CT11_pedido_confirmado_sucesso.png
│       ├── CT12_validacao_campos_obrigatorios_checkout.png
│       ├── CT13_frete_mantido_com_cupom.png
│       ├── CT14_desconto_nao_incide_frete.png
│       ├── BUG01_frete_gratis_subtotal_200.png
│       └── BUG02_limite_5_unidades_api.json  # Resposta JSON da API (gerada automaticamente)
├── automation/
│   ├── tests/
│   │   ├── carrinho_e_pedidos.spec.js   # Suíte principal — 14 cenários automatizados (Playwright)
│   │   └── test_bug2_evidence.js        # Teste de integração que reproduz e registra o BUG-02
│   ├── playwright.config.js             # Configurações do Playwright (screenshot, vídeo e trace ativos)
│   ├── package.json
│   └── package-lock.json
├── .gitignore
└── README.md
```

---

## 🐛 Resumo dos Bugs Identificados

Durante a bateria de testes exploratórios e de valores de fronteira, foram identificados **2 defeitos de alta severidade**:

1. **[BUG-01: Frete grátis não é concedido quando o subtotal atinge exatamente R$ 200,00](docs/bug-reports.md)**
   - **Severidade:** Alta
   - **Critério Violado:** CA06 (*"O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive."*)
   - **Impacto:** O sistema cobra taxa de frete de R$ 19,90 e exibe inconsistência `"Faltam R$ 0,00 para o frete grátis."`.

2. **[BUG-02: API permite cálculo e confirmação de pedidos com mais de 5 unidades do mesmo produto](docs/bug-reports.md)**
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

> **Windows:** caso o PowerShell bloqueie a execução de scripts, execute antes:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

### 1. Clonar o repositório e acessar a pasta de automação
```bash
git clone https://github.com/victorcnascimento/verzel-teste-tecnico.git
cd verzel-teste-tecnico/automation
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

| Comando | Descrição |
|---|---|
| `npm test` | Executa todos os testes em modo **headless** |
| `npm run test:headed` | Executa com o **browser visível** |
| `npm run test:ui` | Abre a **interface interativa** do Playwright |
| `npm run test:report` | Abre o **relatório HTML** da última execução |

> As evidências (screenshots e JSON da API) são geradas automaticamente em `docs/evidencias/` ao rodar os testes.

---

## 🎯 Cenários Automatizados Implementados

### `carrinho_e_pedidos.spec.js` — Suíte Principal (14 cenários)

| # | Cenário | Critério | Evidência gerada |
|---|---|---|---|
| 1 | Aplicação do cupom BEMVINDO10 com sucesso | CA01 | `CT01_cupom_bemvindo10_sucesso.png` |
| 2 | Cupom válido com letras minúsculas e espaços (case-insensitive) | CA02 | `CT02_cupom_case_insensitive.png` |
| 3 | Mensagem de erro para cupom inválido e expirado | CA03, CA04 | `CT03_cupom_invalido.png`, `CT04_cupom_expirado.png` |
| 4 | Substituição de cupom já aplicado | CA05 | `CT05_substituicao_cupom.png` |
| 5 | Bloqueio de múltiplos cupons simultâneos | CA05 | `CT06_multiplos_cupons_bloqueado.png` |
| 6 | Frete grátis para subtotal exatamente R$ 200,00 | CA06 | `CT07_frete_gratis_subtotal_200_exato.png` |
| 7 | Frete grátis para subtotal acima de R$ 200,00 | CA06 | `CT08_frete_gratis_acima_200.png` |
| 8 | Frete fixo R$ 19,90 para subtotal abaixo de R$ 200,00 | CA07 | `CT09_frete_fixo_abaixo_200.png` |
| 9 | Frete grátis mantido quando subtotal original ≥ R$ 200,00 com cupom | CA08 | `CT13_frete_mantido_com_cupom.png` |
| 10 | Desconto do cupom não incide sobre o frete | CA09 | `CT14_desconto_nao_incide_frete.png` |
| 11 | Seleção do limite máximo de 5 unidades | CA10 | `CT10_limite_5_unidades_interface.png` |
| 12 | Bloqueio de mais de 5 unidades via interface | CA10 | `BUG01_frete_gratis_subtotal_200.png` |
| 13 | Fluxo E2E completo até confirmação do pedido | CA06 + Checkout | `CT11_pedido_confirmado_sucesso.png` |
| 14 | Validação de campos obrigatórios no checkout | Checkout | `CT12_validacao_campos_obrigatorios_checkout.png` |

### `test_bug2_evidence.js` — Teste de Integração de API (BUG-02)

Valida que a API rejeita com **HTTP 422** e código `QUANTIDADE_MAXIMA_EXCEDIDA` quando recebe quantidade > 5.
A resposta é salva automaticamente em `docs/evidencias/BUG02_limite_5_unidades_api.json`.

---

**Autor:** Victor Cezari Nascimento  
**Data:** 06/10/2026
