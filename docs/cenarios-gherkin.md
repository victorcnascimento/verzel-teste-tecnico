# Especificação de Cenários de Teste em Gherkin (BDD)

**Projeto:** Verzel Store  
**Funcionalidade:** Aplicação de Cupom de Desconto e Regra de Frete Grátis  
**Card / Referência:** VZS-142 (Versão 2.3.0)  
**Autor:** Victor Cezari Nascimento  
**Data:** 06/10/2026  

---

## 1. Mapeamento de Requisitos e Critérios de Aceite

| Código | Descrição do Critério de Aceite |
| :--- | :--- |
| **CA01** | O cupom `BEMVINDO10` aplica 10% de desconto sobre o subtotal dos produtos. |
| **CA02** | O código do cupom não diferencia maiúsculas de minúsculas, e espaços no início e no fim são ignorados. |
| **CA03** | Um cupom inexistente exibe a mensagem "Cupom inválido." e nenhum desconto é aplicado. |
| **CA04** | Um cupom fora da validade exibe a mensagem "Cupom expirado." e nenhum desconto é aplicado. |
| **CA05** | Apenas um cupom pode ser aplicado por vez. Para trocar, o cliente remove o cupom atual e aplica outro. |
| **CA06** | O frete é grátis para compras com subtotal a partir de R$ 200,00, inclusive. |
| **CA07** | Abaixo de R$ 200,00, é cobrado frete fixo de R$ 19,90 e o carrinho informa quanto falta para o frete grátis. |
| **CA08** | A regra do frete grátis considera o subtotal antes do desconto do cupom. |
| **CA09** | O desconto do cupom não incide sobre o frete. |
| **CA10** | Cada produto pode ter no máximo 5 unidades por pedido. A regra vale para a interface e para a API. |
| **CA11** | Todos os valores são arredondados para 2 casas decimais. |

---

## 2. Especificação BDD / Gherkin

### Funcionalidade: Aplicação de Cupons de Desconto no Carrinho
Como cliente da Verzel Store  
Quero aplicar um cupom de desconto no meu carrinho  
Para obter desconto sobre o valor dos produtos  

Contexto:  
  Dado que o cliente acessa a Verzel Store  
  E possui itens adicionados ao carrinho de compras  

---

**@positivo @smoke @CA01**  
**Cenário - Aplicação com sucesso do cupom válido BEMVINDO10:**  
Dado que o carrinho possui o produto "Mochila Urbana 20L" (R$ 100,00) na quantidade de 1 unidade  
Quando o cliente informa o cupom "BEMVINDO10" e clica em aplicar  
Então o sistema deve exibir a mensagem de sucesso "Cupom aplicado: 10% de desconto nos produtos."  
E o valor do desconto deve ser de "R$ 10,00"  
E o subtotal permanece em "R$ 100,00"  
E o total a pagar deve refletir a dedução correta do desconto  

---

**@positivo @CA02**  
**Esquema do Cenário - Aplicação de cupom válido com variações de caixa e espaços em branco:**  
Dado que o carrinho possui um subtotal de R$ 100,00  
Quando o cliente informa o cupom \<codigo_cupom\> e clica em aplicar  
Então o sistema deve aplicar o cupom com sucesso  
E o desconto concedido deve ser de "R$ 10,00" (10%)  

Exemplos:

| codigo_cupom       | descricao                            |
|--------------------|--------------------------------------|
| "bemvindo10"       | Letras minúsculas                    |
| "BemVindo10"       | Caixa mista (CamelCase)              |
| " BEMVINDO10"      | Espaço em branco no início           |
| "BEMVINDO10 "      | Espaço em branco no final            |
| "  bemvindo10   "  | Espaços nas extremidades e minúsculo |

---

**@negativo @CA03**  
**Cenário - Tentativa de aplicação de cupom inexistente:**  
Quando o cliente informa o cupom "PROMO2026INEXISTENTE" e clica em aplicar  
Então o sistema deve exibir a mensagem de erro "Cupom inválido."  
E nenhum desconto deve ser aplicado ao carrinho  
E o subtotal e o frete devem permanecer inalterados  

---

**@negativo @CA04**  
**Cenário - Tentativa de aplicação de cupom expirado:**  
Quando o cliente informa o cupom "VERAO2026" e clica em aplicar  
Então o sistema deve exibir a mensagem de erro "Cupom expirado."  
E nenhum valor de desconto deve ser concedido  
E o valor total a pagar não deve sofrer alterações  

---

**@positivo @fluxo_alternativo @CA05**  
**Cenário - Substituição de cupom aplicado:**  
Dado que o cupom "BEMVINDO10" já está aplicado no carrinho  
Quando o cliente clica na opção de remover o cupom atual  
Então o cupom deve ser desvinculado e o desconto zerado  
E o cliente deve conseguir inserir e aplicar um novo cupom com sucesso  

---

**@negativo @regra_de_negocio @CA05**  
**Cenário - Impedir aplicação simultânea de múltiplos cupons:**  
Dado que o cupom "BEMVINDO10" já se encontra ativo no carrinho  
Quando o cliente tenta aplicar um segundo cupom simultâneo  
Então o sistema não deve permitir a cumulatividade de descontos mantendo apenas um cupom ativo  

---

### Funcionalidade: Regra de Frete e Frete Grátis
Como cliente da Verzel Store  
Quero saber o valor do frete e o progresso para frete grátis  
Para planejar minhas compras e aproveitar o benefício de isenção de frete  

Contexto:  
  Dado que o cliente está navegando na Verzel Store  

---

**@positivo @borda @CA06**  
**Cenário - Isenção de frete para subtotal exatamente igual a R$ 200,00:**  
Dado que o carrinho contém 2 unidades do produto "Mochila Urbana 20L" (R$ 100,00 cada)  
Quando o cliente visualiza o resumo do pedido  
Então o subtotal deve ser "R$ 200,00"  
E o frete deve ser calculado como "R$ 0,00" (Frete Grátis)  
E o valor faltante para frete grátis deve ser "R$ 0,00"  

---

**@positivo @CA06**  
**Cenário - Isenção de frete para subtotal superior a R$ 200,00:**  
Dado que o carrinho contém 1 unidade de "Jaqueta Corta-Vento" (R$ 229,90)  
Quando o cliente visualiza o resumo do pedido  
Então o subtotal deve ser "R$ 229,90"  
E o frete deve ser gratuito ("R$ 0,00")  

---

**@negativo @borda @CA07**  
**Cenário - Cobrança de frete fixo para subtotal inferior a R$ 200,00:**  
Dado que o carrinho contém 1 unidade de "Tênis Casual Urbano" (R$ 189,90)  
Quando o cliente visualiza o resumo do pedido  
Então o subtotal deve ser "R$ 189,90"  
E o frete cobrado deve ser exatamente "R$ 19,90"  
E o carrinho deve exibir que faltam "R$ 10,10" para alcançar o frete grátis  
E o total do pedido deve ser a soma de "R$ 189,90" + "R$ 19,90" = "R$ 209,80"  

---

**@positivo @regra_critica @CA08**  
**Cenário - Manutenção do frete grátis quando o subtotal original atinge R$ 200,00 mesmo com desconto:**  
Dado que o carrinho possui 2 unidades de "Mochila Urbana 20L" totalizando subtotal de "R$ 200,00"  
Quando o cliente aplica o cupom "BEMVINDO10" recebendo R$ 20,00 de desconto  
Então o subtotal dos produtos permanece sendo considerado "R$ 200,00" para fins de frete  
E o frete deve permanecer gratuito ("R$ 0,00") mesmo com o total final sendo R$ 180,00  
E a mensagem de frete grátis atingido deve ser mantida  

---

**@positivo @regra_critica @CA09**  
**Cenário - Não incidência de desconto de cupom sobre o valor do frete:**  
Dado que o carrinho possui 1 unidade de "Mochila Urbana 20L" (subtotal R$ 100,00)  
E o frete aplicável é de "R$ 19,90"  
Quando o cliente aplica o cupom "BEMVINDO10"  
Então o desconto de 10% deve ser calculado unicamente sobre o subtotal (R$ 10,00)  
E o frete de R$ 19,90 deve ser mantido integralmente sem desconto  
E o total final deve ser calculado exatamente como: R$ 100,00 - R$ 10,00 + R$ 19,90 = R$ 109,90  

---

### Funcionalidade: Limite de Quantidade por Item
Como gestor da Verzel Store  
Quero limitar a compra a no máximo 5 unidades de cada produto  
Para garantir disponibilidade e integridade das regras comerciais  

Contexto:  
  Dado que o cliente está visualizando a listagem ou carrinho de produtos  

---

**@positivo @borda @CA10**  
**Cenário - Seleção do limite máximo permitido de 5 unidades:**  
Quando o cliente define a quantidade de um produto para 5 unidades no carrinho  
Então o sistema deve permitir a alteração e recalcular o subtotal proporcionalmente  

---

**@negativo @borda @CA10**  
**Cenário - Tentativa de adicionar mais de 5 unidades via interface:**  
Quando o cliente atinge 5 unidades de um determinado produto  
Então o botão de incremento de quantidade deve ser desabilitado ou exibir aviso impeditivo  
E a quantidade no carrinho não deve ultrapassar 5 unidades  

---

**@negativo @api @CA10**  
**Cenário - Envio de quantidade superior a 5 unidades via API:**  
Quando uma requisição POST para "/api/carrinho/calcular" ou "/api/pedidos" for enviada com quantidade igual a 6 para um produto  
Então a API deve rejeitar a requisição com status HTTP 422  
E o código de erro retornado deve ser "QUANTIDADE_MAXIMA_EXCEDIDA"  

---

### Funcionalidade: Finalização e Validação de Pedidos
Como cliente da Verzel Store  
Quero preencher meus dados de entrega e confirmar meu pedido  
Para concluir minha compra com pagamento na entrega  

Contexto:  
  Dado que o carrinho possui itens válidos  

---

**@positivo @smoke**  
**Cenário - Finalização de pedido com dados válidos e cupom aplicado:**  
Dado que o cliente preenche os dados:

| Campo | Valor               |
|-------|---------------------|
| Nome  | "Maria Silva"       |
| Email | "maria@exemplo.com" |
| CEP   | "01310-100"         |

E o cupom "BEMVINDO10" está aplicado  
Quando o cliente confirma o pedido  
Então o pedido deve ser criado com sucesso com status 201  
E deve ser retornado um código de pedido no padrão "VZ-XXXXXX"  
E a tela de confirmação deve exibir o resumo detalhado dos valores  

---

**@negativo @validacao_campos**  
**Esquema do Cenário - Validação de campos obrigatórios e formatos na finalização do pedido:**  
Quando o cliente tenta confirmar o pedido informando \<nome\>, \<email\> e \<cep\>  
Então o sistema deve recusar a finalização exibindo aviso de validação  
E a API deve responder com código 422 e erro "DADOS_INVALIDOS"  

Exemplos:

| nome           | email               | cep         | motivo                          |
|----------------|---------------------|-------------|---------------------------------|
| "Maria"        | "maria@exemplo.com" | "01310-100" | Nome sem sobrenome              |
| "Maria Silva"  | "email-invalido"    | "01310-100" | Formato de e-mail incorreto     |
| "Maria Silva"  | "maria@exemplo.com" | "12345"     | CEP com menos de 8 dígitos      |
| "Maria Silva"  | "maria@exemplo.com" | "123456789" | CEP com mais de 8 dígitos       |
