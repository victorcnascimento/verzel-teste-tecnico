# Plano e Relatório de Execução de Testes

**Projeto:** Verzel Store  
**Versão:** 2.3.0 (Card VZS-142)  
**Ambiente de Testes:** https://verzel-store.qa-test-verzel-store.workers.dev/  
**Autor:** Victor Cezari Nascimento  
**Data da Execução:** 06/10/2026  

---

## 1. Visão Geral da Execução

| Métrica | Quantidade |
| :--- | :--- |
| **Total de Cenários Executados** | 16 |
| **Passou (Passed)** | 14 |
| **Falhou (Failed - Bugs)** | 2 |
| **Bloqueado (Blocked)** | 0 |
| **Taxa de Sucesso (Pass Rate)** | **87.5%** |

---

## 2. Matriz Detalhada de Execução de Testes

| ID do Caso | Critério | Descrição do Teste / Cenário | Tipo | Resultado | Evidência / Observação |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CT-01** | CA01 | Aplicação do cupom válido `BEMVINDO10` (10% desconto sobre produtos) | UI & API | **PASSED** | [CT01_cupom_bemvindo10_sucesso.png](evidencias/CT01_cupom_bemvindo10_sucesso.png) - 10% calculado corretamente |
| **CT-02** | CA02 | Aplicação do cupom `bemvindo10` em letras minúsculas | UI & API | **PASSED** | Aceito com sucesso sem diferenciação de caixa |
| **CT-03** | CA02 | Aplicação do cupom com espaços no início e no fim (`  BEMVINDO10  `) | UI & API | **PASSED** | Espaços ignorados com sucesso e cupom aplicado |
| **CT-04** | CA03 | Tentativa de aplicação de cupom inexistente (`INVALIDO123`) | UI & API | **PASSED** | [CT03_cupom_invalido.png](evidencias/CT03_cupom_invalido.png) - Exibe "Cupom inválido." |
| **CT-05** | CA04 | Tentativa de aplicação de cupom expirado (`VERAO2026`) | UI & API | **PASSED** | [CT04_cupom_expirado.png](evidencias/CT04_cupom_expirado.png) - Exibe "Cupom expirado." |
| **CT-06** | CA05 | Remoção e substituição de cupom no carrinho | UI | **PASSED** | Botão "Remover cupom" limpa o desconto e permite novo cupom |
| **CT-07** | CA06 | Isenção de frete para subtotal exatamente igual a R$ 200,00 | UI & API | **FAILED** | **BUG-01** - Cobrou R$ 19,90 e exibiu "Faltam R$ 0,00 para o frete grátis." |
| **CT-08** | CA06 | Isenção de frete para subtotal superior a R$ 200,00 (ex: R$ 229,90) | UI & API | **PASSED** | Frete calculado como R$ 0,00 (Grátis) |
| **CT-09** | CA07 | Cobrança de frete fixo de R$ 19,90 para subtotal inferior a R$ 200,00 (ex: R$ 100,00) | UI & API | **PASSED** | Frete R$ 19,90 cobrado e exibe "Faltam R$ 100,00 para o frete grátis." |
| **CT-10** | CA08 | Frete grátis mantido quando subtotal original $\ge$ R$ 200,00 mesmo após desconto de cupom | API | **PASSED** | Subtotal R$ 219,80 com cupom de 10% (fica R$ 197,82) manteve frete R$ 0,00 |
| **CT-11** | CA09 | Desconto do cupom incide apenas sobre subtotal e não sobre o frete | UI & API | **PASSED** | Subtotal R$ 100 + Frete R$ 19,90 = Total R$ 109,90 (10% incidiu só em R$ 100) |
| **CT-12** | CA10 | Limitação de no máximo 5 unidades por produto na Interface gráfica | UI | **PASSED** | [CT10_limite_5_unidades_interface.png](evidencias/CT10_limite_5_unidades_interface.png) - Botão '+' é desabilitado em 5 unidades |
| **CT-13** | CA10 | Validação de no máximo 5 unidades por produto na API (`/api/pedidos` e calcular) | API | **FAILED** | **BUG-02** - API aceitou pedido com 6 e 10 unidades com status 201 Created |
| **CT-14** | CA11 | Arredondamento monetário de duas casas decimais em todos os cálculos | UI & API | **PASSED** | Valores mantêm precisão de 2 casas sem dízimas incorretas |
| **CT-15** | Regras Gerais | Validação de campos obrigatórios no checkout (Nome, E-mail, CEP) | UI & API | **PASSED** | [CT12_validacao_campos_obrigatorios_checkout.png](evidencias/CT12_validacao_campos_obrigatorios_checkout.png) - Mensagens exibidas corretamente |
| **CT-16** | Regras Gerais | Conclusão e confirmação de pedido válido com dados completos | UI & API | **PASSED** | [CT11_pedido_confirmado_sucesso.png](evidencias/CT11_pedido_confirmado_sucesso.png) - Gera código fictício padrão VZ-XXXXXX |

---

## 3. Resumo dos Defeitos Críticos Apontados

1. **[BUG-01](bug-reports.md#bug-01-frete-grátis-não-é-concedido-quando-o-subtotal-atinge-exatamente-r-20000):** Cobrança indevida de frete de R$ 19,90 no valor de fronteira de R$ 200,00.
2. **[BUG-02](bug-reports.md#bug-02-api-apipedidos-e-apicarrinhocalcular-não-bloqueiam-quantidade-de-produto-superior-a-5-unidades):** Ausência de validação na API para quantidade máxima de 5 unidades por produto (`QUANTIDADE_MAXIMA_EXCEDIDA`).
