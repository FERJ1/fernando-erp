# Diagrama de Fluxo de Dados (DFD) - Módulo de Controle de Estoque

## 1. Visão Geral

O módulo de **Controle de Estoque** é responsável por gerenciar toda a movimentação de produtos no sistema ERP. Este documento descreve o fluxo de dados de alto nível para este módulo, mostrando como os dados fluem entre usuários, processos e armazenamento de dados.

---

## 2. Componentes do DFD

### 2.1 Atores Externos

| Ator | Descrição | Responsabilidades |
|------|-----------|-------------------|
| **Usuário/Admin** | Pessoas que interagem com o sistema | Cadastrar produtos, registrar movimentações, consultar relatórios |
| **Fornecedor** | Fonte externa de produtos | Fornece informações de reposição (não integrado atualmente) |
| **Sistema ERP** | Processos automatizados | Verifica estoque, gera alertas, calcula disponibilidade |

### 2.2 Processos

O módulo de Controle de Estoque contém **7 processos principais**:

#### Processo 1.0: Cadastrar Produto
- **Entrada**: Dados do produto (nome, SKU, categoria, preço, quantidade inicial)
- **Processamento**: Validar dados, armazenar no banco
- **Saída**: Confirmação de cadastro, ID do produto
- **Armazenamento**: Tabela `products`
- **Auditoria**: Registra quem criou o produto

#### Processo 2.0: Registrar Entrada de Estoque
- **Entrada**: ID do produto, quantidade, motivo (compra, devolução, ajuste)
- **Processamento**: Validar quantidade, atualizar estoque, registrar movimento
- **Saída**: Confirmação de entrada, novo saldo
- **Armazenamento**: Tabelas `products` (atualiza quantidade) e `stock_movements` (registra movimento)
- **Auditoria**: Registra quem fez a entrada

**Exemplo de Fluxo:**
```
Usuário → Registra Entrada (100 unidades) → Valida → Atualiza Estoque
→ Registra em stock_movements → Retorna Confirmação → Usuário
```

#### Processo 3.0: Registrar Saída de Estoque
- **Entrada**: ID do produto, quantidade, motivo (venda, devolução, perda, ajuste)
- **Processamento**: Validar quantidade disponível, atualizar estoque, registrar movimento
- **Saída**: Confirmação de saída, novo saldo
- **Armazenamento**: Tabelas `products` (atualiza quantidade) e `stock_movements` (registra movimento)
- **Auditoria**: Registra quem fez a saída

**Validações Importantes:**
- Quantidade solicitada ≤ quantidade disponível
- Não permitir quantidade negativa
- Motivo deve ser válido (venda, devolução, perda, ajuste)

#### Processo 4.0: Calcular Estoque Disponível
- **Entrada**: ID do produto
- **Processamento**: Soma todas as entradas e subtrai todas as saídas
- **Saída**: Quantidade disponível atual
- **Armazenamento**: Lê de `products` e `stock_movements`

**Fórmula:**
```
Estoque Disponível = Quantidade Inicial 
                   + SUM(Entradas) 
                   - SUM(Saídas)
```

#### Processo 5.0: Verificar Estoque Baixo
- **Entrada**: ID do produto, quantidade mínima definida
- **Processamento**: Compara estoque atual com mínimo
- **Saída**: Boolean (estoque baixo ou não)
- **Armazenamento**: Lê de `products` (minStockLevel) e calcula com Processo 4.0

**Lógica:**
```
if (Estoque Disponível <= minStockLevel) {
  return true; // Estoque baixo
} else {
  return false; // Estoque normal
}
```

#### Processo 6.0: Gerar Alerta de Reposição
- **Entrada**: Resultado do Processo 5.0 (estoque baixo)
- **Processamento**: Se estoque baixo, criar notificação
- **Saída**: Alerta/Notificação para o usuário
- **Armazenamento**: Registra em `audit_logs` (opcional)

**Tipos de Alertas:**
- Email para admin
- Notificação in-app
- Dashboard widget

#### Processo 7.0: Gerar Relatório de Estoque
- **Entrada**: Filtros (período, categoria, status)
- **Processamento**: Consultar dados, calcular métricas, formatar relatório
- **Saída**: Relatório em tabela/gráfico
- **Armazenamento**: Lê de `products` e `stock_movements`

**Métricas do Relatório:**
- Quantidade em estoque por produto
- Valor total em estoque
- Produtos com estoque baixo
- Movimentações do período
- Turnover de estoque

### 2.3 Armazenamento de Dados

#### Tabela: `products`
```sql
Campos relevantes para estoque:
- id: Identificador único
- name: Nome do produto
- sku: Código único
- quantity: Quantidade atual em estoque
- minStockLevel: Quantidade mínima
- costPrice: Preço de custo
- sellingPrice: Preço de venda
- createdAt: Data de criação
- updatedAt: Última atualização
```

#### Tabela: `stock_movements`
```sql
Campos:
- id: Identificador único
- productId: Referência ao produto
- type: 'in' (entrada) ou 'out' (saída)
- quantity: Quantidade movimentada
- reason: Motivo (compra, venda, devolução, perda, ajuste)
- createdAt: Data do movimento
```

#### Tabela: `audit_logs`
```sql
Campos:
- id: Identificador único
- userId: Usuário que fez a ação
- action: Tipo de ação (CREATE, UPDATE, DELETE)
- entity: 'product' ou 'stock_movement'
- entityId: ID da entidade
- changes: JSON com mudanças
- timestamp: Data/hora da ação
```

### 2.4 Fluxos de Dados

| Fluxo | Descrição | Formato |
|-------|-----------|---------|
| **DF1: Dados do Produto** | Informações de cadastro | JSON com campos do produto |
| **DF2: Movimento de Entrada** | Registro de entrada | { productId, quantity, reason, date } |
| **DF3: Movimento de Saída** | Registro de saída | { productId, quantity, reason, date } |
| **DF4: Quantidade em Estoque** | Saldo atual | { productId, quantity, lastUpdate } |
| **DF5: Alertas de Estoque** | Notificações | { productId, message, severity } |
| **DF6: Relatório de Estoque** | Dados consolidados | Tabela/Gráfico com métricas |

---

## 3. Fluxos Principais

### 3.1 Fluxo de Entrada de Estoque (Compra)

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Registrar Entrada de Estoque (Compra)               │
└─────────────────────────────────────────────────────────────┘

1. Usuário acessa "Registrar Entrada"
   ↓
2. Seleciona produto e quantidade (ex: 100 unidades)
   ↓
3. Sistema valida:
   - Produto existe?
   - Quantidade > 0?
   - Motivo válido?
   ↓
4. Se válido:
   - Atualiza products.quantity += 100
   - Cria registro em stock_movements (type='in', quantity=100)
   - Registra em audit_logs
   ↓
5. Retorna confirmação ao usuário
   - "100 unidades adicionadas ao estoque"
   - Novo saldo: 250 unidades
   ↓
6. Sistema verifica se estoque >= minStockLevel
   - Se sim: sem alerta
   - Se não: gera alerta de reposição
```

### 3.2 Fluxo de Saída de Estoque (Venda)

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Registrar Saída de Estoque (Venda via Pedido)       │
└─────────────────────────────────────────────────────────────┘

1. Pedido é criado com produtos
   ↓
2. Para cada item do pedido:
   - Produto: Notebook, Quantidade: 5
   ↓
3. Sistema valida:
   - Estoque disponível >= 5?
   - Se não: Erro "Estoque insuficiente"
   ↓
4. Se válido:
   - Atualiza products.quantity -= 5
   - Cria registro em stock_movements (type='out', quantity=5, reason='sale')
   - Registra em audit_logs
   ↓
5. Retorna confirmação
   - "5 unidades removidas do estoque"
   - Novo saldo: 45 unidades
   ↓
6. Sistema verifica se estoque < minStockLevel
   - Se sim: gera alerta "Estoque baixo para Notebook"
   - Notifica admin
```

### 3.3 Fluxo de Verificação de Estoque Baixo

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Verificar e Alertar Estoque Baixo                   │
└─────────────────────────────────────────────────────────────┘

1. Sistema executa verificação (diariamente ou em tempo real)
   ↓
2. Para cada produto:
   - Lê quantidade atual
   - Lê minStockLevel
   ↓
3. Se quantidade <= minStockLevel:
   - Cria alerta
   - Envia notificação para admin
   - Registra em audit_logs
   ↓
4. Admin recebe:
   - Email: "Estoque baixo para Produto X (5 unidades)"
   - Notificação in-app
   - Widget no Dashboard
   ↓
5. Admin pode:
   - Visualizar produto
   - Criar pedido de reposição
   - Registrar entrada manual
```

### 3.4 Fluxo de Relatório de Estoque

```
┌─────────────────────────────────────────────────────────────┐
│ FLUXO: Gerar Relatório de Estoque                          │
└─────────────────────────────────────────────────────────────┘

1. Usuário solicita relatório
   - Filtros: período, categoria, status
   ↓
2. Sistema consulta:
   - products: todos os produtos (filtrados)
   - stock_movements: movimentações do período
   ↓
3. Calcula métricas:
   - Quantidade em estoque por produto
   - Valor total em estoque (quantity × costPrice)
   - Produtos com estoque baixo
   - Turnover (movimentações / quantidade média)
   ↓
4. Formata relatório:
   - Tabela com dados
   - Gráficos de análise
   - Resumo executivo
   ↓
5. Exibe para usuário
   - Permite filtros adicionais
   - Permite exportar (CSV, PDF)
```

---

## 4. Integrações com Outros Módulos

### 4.1 Integração com Módulo de Pedidos

```
Módulo de Pedidos → Cria Pedido com Produtos
                 ↓
Módulo de Estoque → Valida disponibilidade
                 ↓
                 → Registra saída de estoque
                 ↓
                 → Verifica estoque baixo
                 ↓
                 → Gera alerta se necessário
```

### 4.2 Integração com Módulo Financeiro

```
Módulo de Estoque → Registra entrada (compra)
                 ↓
Módulo Financeiro → Cria "Conta a Pagar" (fatura do fornecedor)
                 ↓
Módulo de Estoque → Registra saída (venda)
                 ↓
Módulo Financeiro → Cria "Conta a Receber" (fatura do cliente)
```

### 4.3 Integração com Módulo de Precificação

```
Módulo de Estoque → Fornece custo do produto
                 ↓
Módulo de Precificação → Calcula preço de venda
                      ↓
Módulo de Estoque → Atualiza preço no cadastro
```

---

## 5. Validações e Regras de Negócio

### 5.1 Validações de Entrada

| Validação | Regra | Erro |
|-----------|-------|------|
| Produto existe | productId deve estar em `products` | "Produto não encontrado" |
| Quantidade válida | quantity > 0 | "Quantidade deve ser maior que 0" |
| Estoque suficiente (saída) | quantity <= estoque_atual | "Estoque insuficiente" |
| Motivo válido | reason ∈ {compra, venda, devolução, perda, ajuste} | "Motivo inválido" |
| Quantidade numérica | typeof quantity === 'number' | "Quantidade deve ser número" |

### 5.2 Regras de Negócio

1. **Quantidade Nunca Negativa**: O estoque nunca pode ser negativo. Se uma saída deixaria negativo, rejeitar.

2. **Histórico Imutável**: Movimentações de estoque não podem ser editadas, apenas deletadas (com auditoria).

3. **Alerta Automático**: Quando estoque ≤ minStockLevel, gerar alerta automático.

4. **Custo Unitário**: Manter histórico de custo unitário para cálculos de valor de estoque.

5. **Razão Obrigatória**: Toda movimentação deve ter uma razão documentada.

---

## 6. Casos de Uso

### Caso de Uso 1: Receber Compra de Fornecedor

**Ator**: Gerente de Estoque  
**Pré-condições**: Produto cadastrado, nota fiscal recebida  
**Fluxo**:
1. Acessa "Registrar Entrada"
2. Seleciona produto "Notebook Dell"
3. Insere quantidade: 50
4. Seleciona motivo: "Compra"
5. Clica "Confirmar"
6. Sistema atualiza estoque (+50)
7. Exibe confirmação

**Pós-condições**: Estoque aumentado, movimento registrado, auditoria atualizada

### Caso de Uso 2: Vender Produto (via Pedido)

**Ator**: Vendedor  
**Pré-condições**: Pedido criado, produtos com estoque  
**Fluxo**:
1. Cria pedido com 3 unidades de "Mouse Logitech"
2. Sistema valida estoque (disponível: 10)
3. Sistema registra saída (-3)
4. Novo estoque: 7
5. Verifica: 7 > minStockLevel (5)? Sim, sem alerta

**Pós-condições**: Estoque reduzido, movimento registrado

### Caso de Uso 3: Alerta de Estoque Baixo

**Ator**: Sistema (automático)  
**Pré-condições**: Estoque em nível baixo  
**Fluxo**:
1. Sistema verifica diariamente
2. Encontra "Teclado Mecânico" com 2 unidades
3. minStockLevel = 10
4. 2 ≤ 10? Sim
5. Gera alerta
6. Envia email para admin
7. Exibe notificação in-app

**Pós-condições**: Admin notificado, pode tomar ação

---

## 7. Métricas e KPIs

### KPIs de Estoque

| Métrica | Fórmula | Interpretação |
|---------|---------|----------------|
| **Valor Total em Estoque** | SUM(quantity × costPrice) | Investimento em estoque |
| **Turnover de Estoque** | Vendas / Estoque Médio | Quantas vezes estoque é renovado |
| **Dias de Estoque** | 365 / Turnover | Quantos dias de vendas em estoque |
| **Estoque Obsoleto** | Produtos sem movimento > 90 dias | Produtos parados |
| **Acurácia de Estoque** | Estoque Real / Estoque Sistema | Precisão dos registros |

---

## 8. Possíveis Melhorias Futuras

1. **Estoque por Localização**: Rastrear estoque em múltiplos armazéns/locais
2. **Reservas**: Reservar estoque para pedidos pendentes
3. **Lotes e Validade**: Rastrear lotes e datas de validade
4. **Código de Barras**: Integração com leitura de código de barras
5. **Previsão de Demanda**: Usar IA para prever demanda e sugerir reposição
6. **Integração com Fornecedores**: API para pedidos automáticos
7. **Contagem Cíclica**: Processo de contagem periódica para acurácia
8. **Estoque de Segurança**: Cálculo automático de estoque mínimo

---

## 9. Conclusão

O módulo de Controle de Estoque é fundamental para o funcionamento do ERP. Este DFD apresenta uma visão clara de como os dados fluem através dos processos, armazenamento e atores. Seguindo este fluxo, o sistema garante:

- **Precisão**: Todos os movimentos são registrados
- **Rastreabilidade**: Auditoria completa de quem fez o quê
- **Alertas Oportunos**: Notificações automáticas de estoque baixo
- **Relatórios Confiáveis**: Dados consolidados para análise

---

**Documento preparado por**: Manus AI  
**Data**: 28 de janeiro de 2026  
**Versão**: 1.0
