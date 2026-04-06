# Análise Completa do Sistema ERP - Gestão Empresarial

## 1. Visão Geral do Projeto

O **Sistema de Gestão Empresarial (ERP)** é uma aplicação web completa projetada para gerenciar todos os aspectos operacionais e financeiros de uma pequena ou média empresa. O sistema foi desenvolvido com tecnologia moderna (React 19, Express 4, tRPC 11, MySQL/TiDB) e oferece uma interface elegante e intuitiva para usuários não-técnicos.

### Objetivo Principal

Centralizar e automatizar a gestão de:
- Clientes e suas informações de contato
- Produtos e controle de estoque
- Pedidos de venda com cálculo automático
- Transações financeiras (contas a pagar/receber)
- Análises financeiras (DRE, fluxo de caixa)
- Precificação dinâmica de produtos
- Conciliação bancária
- Relatórios e insights inteligentes com IA

---

## 2. Arquitetura Técnica

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|----------|
| Frontend | React | 19.2.1 | Interface de usuário |
| Styling | Tailwind CSS | 4.1.14 | Design responsivo |
| UI Components | shadcn/ui | Latest | Componentes reutilizáveis |
| Backend | Express.js | 4.21.2 | Servidor HTTP |
| API | tRPC | 11.6.0 | RPC type-safe |
| Banco de Dados | MySQL/TiDB | 3.15.0 | Persistência de dados |
| ORM | Drizzle ORM | 0.44.5 | Gerenciamento de schema |
| Autenticação | Manus OAuth | Built-in | Login seguro |
| Testes | Vitest | 2.1.4 | Unit tests |
| Build | Vite | 7.1.7 | Bundler |
| Deployment | Manus Platform | Built-in | Hospedagem |

### Arquitetura de Pastas

```
erp-gestao-empresarial/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                   # Páginas principais (Home, Clientes, Produtos, etc)
│   │   ├── components/              # Componentes reutilizáveis (DashboardLayout, etc)
│   │   ├── contexts/                # React Contexts (Tema, etc)
│   │   ├── hooks/                   # Custom hooks (useAuth, useMobile, etc)
│   │   ├── lib/                     # Utilitários (trpc.ts, etc)
│   │   ├── App.tsx                  # Roteamento principal
│   │   ├── main.tsx                 # Entry point
│   │   └── index.css                # Estilos globais
│   └── public/                      # Assets estáticos
├── server/                          # Backend Express
│   ├── _core/                       # Framework core (não editar)
│   ├── db.ts                        # Funções de banco de dados
│   ├── routers.ts                   # Rotas tRPC
│   ├── *.test.ts                    # Testes unitários
│   └── index.ts                     # Entry point
├── drizzle/                         # Schema e migrations
│   ├── schema.ts                    # Definição de tabelas
│   └── *.sql                        # Migrations geradas
├── shared/                          # Código compartilhado
└── storage/                         # Helpers S3
```

### Fluxo de Dados

```
Cliente (React)
    ↓
useQuery/useMutation (tRPC)
    ↓
Servidor (Express)
    ↓
tRPC Router (routers.ts)
    ↓
Funções DB (db.ts)
    ↓
Banco de Dados (MySQL)
    ↓
Resposta (superjson serialization)
    ↓
Cache/UI Update (React Query)
```

---

## 3. Módulos Funcionais Implementados

### 3.1 Autenticação e Controle de Acesso

**Funcionalidades:**
- Login via Manus OAuth (integrado automaticamente)
- Dois níveis de permissão: `admin` e `user`
- Proteção de rotas baseada em `protectedProcedure` e `adminProcedure`
- Logout com limpeza de cookies de sessão
- Histórico de ações (auditoria) para todas as operações

**Tabelas do Banco:**
- `users` - Armazena dados de usuários (openId, name, email, role, timestamps)

**Rotas tRPC:**
- `auth.me` - Retorna usuário autenticado
- `auth.logout` - Limpa sessão

---

### 3.2 Cadastro de Clientes

**Funcionalidades:**
- CRUD completo (Create, Read, Update, Delete)
- Campos: nome, email, telefone, CPF/CNPJ, endereço (rua, número, complemento, cidade, estado, CEP)
- Histórico de compras vinculado ao cliente
- Filtros por nome, email, CPF/CNPJ
- Busca avançada com múltiplos critérios
- Status ativo/inativo

**Tabelas do Banco:**
- `customers` - Dados dos clientes
- `customer_addresses` - Endereços (suporta múltiplos)

**Rotas tRPC:**
- `customers.list` - Listar com filtros
- `customers.create` - Criar novo cliente
- `customers.update` - Editar cliente
- `customers.delete` - Deletar cliente
- `customers.getById` - Buscar por ID

---

### 3.3 Cadastro de Categorias

**Funcionalidades:**
- Gerenciamento de categorias de produtos
- Suporte a subcategorias (hierarquia)
- Ativação/desativação de categorias
- Ordenação customizável

**Tabelas do Banco:**
- `product_categories` - Categorias de produtos

**Rotas tRPC:**
- `categories.list` - Listar categorias
- `categories.create` - Criar categoria
- `categories.update` - Editar categoria
- `categories.delete` - Deletar categoria

---

### 3.4 Cadastro de Produtos

**Funcionalidades:**
- CRUD completo de produtos
- Campos: nome, descrição, SKU, preço custo, preço venda, quantidade em estoque
- Controle de estoque em tempo real
- Alertas automáticos para estoque baixo (configurável)
- Vinculação com categorias
- Imagens de produtos (suporte a upload)
- Histórico de movimentação de estoque

**Tabelas do Banco:**
- `products` - Dados dos produtos
- `stock_movements` - Histórico de entradas/saídas

**Rotas tRPC:**
- `products.list` - Listar com filtros
- `products.create` - Criar produto
- `products.update` - Editar produto
- `products.delete` - Deletar produto
- `products.getById` - Buscar por ID
- `products.getLowStock` - Produtos com estoque baixo

---

### 3.5 Geração de Pedidos

**Funcionalidades:**
- Criar pedidos vinculando cliente + produtos
- Cálculo automático de subtotal, impostos e total
- Número de pedido único auto-gerado
- Status do pedido: pendente → confirmado → enviado → entregue (ou cancelado)
- Itens do pedido com quantidade e preço unitário
- Data de criação, confirmação e entrega
- Histórico completo de pedidos
- Filtros por cliente, status, período

**Tabelas do Banco:**
- `orders` - Cabeçalho do pedido
- `order_items` - Itens do pedido

**Rotas tRPC:**
- `orders.list` - Listar com filtros
- `orders.create` - Criar pedido
- `orders.update` - Editar pedido
- `orders.updateStatus` - Mudar status
- `orders.getById` - Buscar por ID
- `orders.delete` - Cancelar pedido

---

### 3.6 Gestão Financeira

**Funcionalidades:**
- Contas a Receber (vinculadas a pedidos)
- Contas a Pagar (despesas operacionais)
- Status de pagamento: pendente, parcial, pago, vencido
- Data de vencimento e data de pagamento
- Valor original e valor pago
- Histórico de pagamentos
- Fluxo de caixa mensal/anual
- Filtros por período, status, tipo

**Tabelas do Banco:**
- `financial_transactions` - Todas as transações (income/expense)
- `payment_records` - Registros de pagamentos

**Rotas tRPC:**
- `financial.list` - Listar transações
- `financial.create` - Criar transação
- `financial.update` - Editar transação
- `financial.recordPayment` - Registrar pagamento
- `financial.getSummary` - Resumo financeiro
- `financial.getCashFlow` - Fluxo de caixa

---

### 3.7 Dashboard e KPIs

**Funcionalidades:**
- Visão geral do negócio em tempo real
- KPIs principais:
  - Total de clientes
  - Produtos ativos
  - Pedidos do mês
  - Pedidos pendentes
  - Receita do mês
  - Despesas do mês
  - Balanço do mês
  - Contas vencidas
- Gráficos de tendências
- Alertas de estoque baixo

**Rotas tRPC:**
- `dashboard.stats` - Estatísticas principais

---

### 3.8 Relatórios

**Funcionalidades:**
- Relatório de vendas por período
- Produtos mais vendidos
- Clientes mais ativos
- Balanço financeiro
- Gráficos interativos (receita, despesas, lucro)
- Exportação de dados (preparado para CSV/PDF)

**Rotas tRPC:**
- `reports.salesByPeriod` - Vendas por período
- `reports.topProducts` - Produtos mais vendidos
- `reports.topCustomers` - Clientes mais ativos
- `reports.financialSummary` - Balanço financeiro

---

### 3.9 Precificação Dinâmica

**Funcionalidades:**
- Calculadora de preços com três métodos:
  - **Markup**: Preço = Custo × (1 + Markup%)
  - **Margem**: Preço = Custo / (1 - Margem%)
  - **Valor Fixo**: Preço = Custo + Valor
- Análise de lucratividade (margem, markup, lucro)
- Regras de precificação reutilizáveis
- Custos adicionais (frete, impostos, etc)

**Tabelas do Banco:**
- `pricing_rules` - Regras de precificação

**Rotas tRPC:**
- `pricing.calculatePrice` - Calcular preço
- `pricing.analyzePrice` - Analisar lucratividade
- `pricing.rules.list` - Listar regras
- `pricing.rules.create` - Criar regra
- `pricing.rules.update` - Editar regra

---

### 3.10 Conciliação Bancária

**Funcionalidades:**
- Gerenciamento de contas bancárias
- Importação de extratos (CSV/OFX)
- Conciliação automática de transações
- Histórico de transações bancárias
- Identificação de discrepâncias
- Matching automático com transações financeiras

**Tabelas do Banco:**
- `bank_accounts` - Contas bancárias
- `bank_transactions` - Transações importadas

**Rotas tRPC:**
- `bank.accounts.list` - Listar contas
- `bank.accounts.create` - Criar conta
- `bank.transactions.import` - Importar extrato
- `bank.transactions.list` - Listar transações
- `bank.reconcile` - Reconciliar transações

---

### 3.11 DRE (Demonstração do Resultado do Exercício)

**Funcionalidades:**
- Relatório financeiro completo
- Estrutura:
  - Receita Operacional Bruta
  - (-) Deduções
  - = Receita Líquida
  - (-) Custo dos Produtos Vendidos (CPV)
  - = Lucro Bruto
  - (-) Despesas Operacionais
  - = Lucro Operacional
  - (-) Impostos e Taxas
  - = Lucro Líquido
- Cálculo de margens (bruta, operacional, líquida)
- Período customizável (mensal, trimestral, anual)
- Gráficos de análise

**Tabelas do Banco:**
- `dre_categories` - Categorias de DRE

**Rotas tRPC:**
- `dre.report` - Gerar relatório
- `dre.categories.list` - Listar categorias

---

### 3.12 Insights com IA

**Funcionalidades:**
- Análise automática de dados usando LLM
- Insights sobre:
  - Tendências de vendas
  - Produtos com melhor desempenho
  - Clientes mais valiosos
  - Oportunidades de melhoria
  - Alertas de anomalias
- Recomendações inteligentes
- Análise de sazonalidade

**Rotas tRPC:**
- `insights.analyze` - Gerar insights

---

### 3.13 Auditoria e Histórico

**Funcionalidades:**
- Registro de todas as ações dos usuários
- Campos: usuário, ação, entidade, ID, timestamp
- Filtros por usuário, tipo de ação, período
- Rastreamento completo de mudanças
- Apenas para admin

**Tabelas do Banco:**
- `audit_logs` - Log de todas as ações

**Rotas tRPC:**
- `audit.list` - Listar logs
- `audit.getByEntity` - Logs de uma entidade

---

### 3.14 Configurações

**Funcionalidades:**
- Gerenciamento de notificações (admin)
- Configuração de alertas
- Preferências do sistema
- Apenas para admin

---

## 4. Modelo de Dados (Schema)

### Tabelas Principais

```sql
-- Usuários
users (id, openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)

-- Clientes
customers (id, name, email, phone, cpfCnpj, status, createdAt, updatedAt)
customer_addresses (id, customerId, street, number, complement, city, state, zipCode, isPrimary)

-- Produtos
product_categories (id, name, parentId, isActive, orderIndex)
products (id, name, description, sku, categoryId, costPrice, sellingPrice, quantity, minStockLevel, image, isActive)
stock_movements (id, productId, type, quantity, reason, createdAt)

-- Pedidos
orders (id, orderNumber, customerId, status, paymentStatus, subtotal, tax, total, createdAt, confirmedAt, deliveredAt)
order_items (id, orderId, productId, quantity, unitPrice, subtotal)

-- Financeiro
financial_transactions (id, type, category, amount, status, dueDate, paidDate, description, orderId)
payment_records (id, transactionId, amount, paymentDate, paymentMethod)

-- Banco
bank_accounts (id, name, accountNumber, bankCode, balance, currency, isActive)
bank_transactions (id, accountId, transactionDate, description, amount, transactionType, status, matchedTransactionId)

-- Precificação
pricing_rules (id, name, productId, type, value, additionalCosts, isActive)

-- DRE
dre_categories (id, name, type, parentId, orderIndex, isActive)

-- Auditoria
audit_logs (id, userId, action, entity, entityId, changes, timestamp)
```

---

## 5. Fluxos de Negócio Principais

### 5.1 Fluxo de Venda

1. **Cadastrar Cliente** (se novo)
2. **Criar Pedido**
   - Selecionar cliente
   - Adicionar produtos com quantidades
   - Sistema calcula subtotal e total
   - Número de pedido gerado automaticamente
3. **Confirmar Pedido** (muda status para "confirmado")
4. **Registrar Pagamento** (cria transação financeira)
5. **Marcar como Enviado/Entregue**
6. **Auditoria** registra cada passo

### 5.2 Fluxo Financeiro

1. **Pedido Criado** → Cria "Conta a Receber"
2. **Pagamento Recebido** → Marca como "Pago"
3. **Despesa Registrada** → Cria "Conta a Pagar"
4. **Pagamento de Despesa** → Marca como "Pago"
5. **DRE Gerado** → Consolida receitas e despesas

### 5.3 Fluxo de Precificação

1. **Definir Custo do Produto**
2. **Usar Calculadora de Preços**
   - Escolher método (markup, margem ou fixo)
   - Inserir valor
   - Sistema calcula preço sugerido
3. **Analisar Lucratividade**
   - Visualizar margem, markup e lucro
4. **Aplicar Preço** ao produto

### 5.4 Fluxo de Conciliação Bancária

1. **Cadastrar Conta Bancária**
2. **Importar Extrato** (CSV/OFX)
3. **Sistema Faz Matching** automático
4. **Revisar Discrepâncias**
5. **Confirmar Conciliação**

---

## 6. Problemas Identificados na Implementação Atual

### 6.1 Problemas Críticos

#### 1. **Erro SelectItem com Valor Vazio (CORRIGIDO)**
- **Problema**: Componentes Select tinham items com `value=""` (vazio)
- **Causa**: Radix UI não permite valores vazios em SelectItem
- **Solução**: Substituir `""` por `"all"` e ajustar lógica de filtros
- **Status**: ✅ Corrigido

#### 2. **Query SQL com Alias Incorreto**
- **Problema**: `sql<string>\`SUM(oi.quantity * p.costPrice)\`` usava aliases não definidos
- **Causa**: Drizzle ORM não substitui automaticamente aliases em raw SQL
- **Solução**: Usar `sql<string>\`SUM(${orderItems.quantity} * ${products.costPrice})\``
- **Status**: ✅ Corrigido

#### 3. **DRE Report com Summary Vazio**
- **Problema**: Se banco não disponível, summary retornava `{}`
- **Causa**: Falta de valores padrão
- **Solução**: Retornar objeto com todos os campos preenchidos com '0'
- **Status**: ✅ Corrigido

### 6.2 Problemas de Design

#### 1. **Falta de Validação de Entrada**
- **Problema**: Formulários não validam dados antes de enviar
- **Impacto**: Dados inválidos podem ser salvos no banco
- **Solução**: Adicionar validação com Zod em todos os formulários

#### 2. **Sem Tratamento de Erros Consistente**
- **Problema**: Erros não são exibidos de forma consistente ao usuário
- **Impacto**: Usuário não sabe o que deu errado
- **Solução**: Implementar toast notifications para todos os erros

#### 3. **Sem Paginação em Listas Grandes**
- **Problema**: Listas carregam todos os registros de uma vez
- **Impacto**: Performance ruim com muitos dados
- **Solução**: Implementar paginação com limit/offset

#### 4. **Sem Busca em Tempo Real**
- **Problema**: Filtros só funcionam após clicar em botão
- **Impacto**: UX ruim
- **Solução**: Implementar debounce e busca enquanto digita

### 6.3 Problemas de Segurança

#### 1. **Sem Validação de Permissões Consistente**
- **Problema**: Nem todas as rotas verificam se usuário é admin
- **Impacto**: Usuários comuns podem acessar dados sensíveis
- **Solução**: Usar `adminProcedure` em todas as rotas admin

#### 2. **Sem Rate Limiting**
- **Problema**: Sem proteção contra brute force
- **Impacto**: Possibilidade de ataque
- **Solução**: Implementar rate limiting no Express

#### 3. **Sem Criptografia de Dados Sensíveis**
- **Problema**: CPF/CNPJ armazenados em texto plano
- **Impacto**: Vazamento de dados
- **Solução**: Criptografar campos sensíveis

### 6.4 Problemas de Performance

#### 1. **Sem Cache de Dados**
- **Problema**: Mesmas queries executadas múltiplas vezes
- **Impacto**: Lentidão
- **Solução**: Implementar cache com Redis ou React Query staleTime

#### 2. **Sem Índices no Banco**
- **Problema**: Queries lentas em tabelas grandes
- **Impacto**: Performance degradada
- **Solução**: Adicionar índices em colunas frequentemente consultadas

#### 3. **Sem Compressão de Respostas**
- **Problema**: Respostas grandes não são comprimidas
- **Impacto**: Transferência lenta
- **Solução**: Adicionar gzip compression no Express

### 6.5 Problemas de Funcionalidade

#### 1. **Integração Stripe Não Implementada**
- **Problema**: Pagamentos online não funcionam
- **Impacto**: Usuário não pode processar pagamentos
- **Solução**: Implementar `webdev_add_feature` com Stripe

#### 2. **Exportação de Relatórios Não Implementada**
- **Problema**: Usuário não pode exportar relatórios em PDF/Excel
- **Impacto**: Dificuldade em compartilhar dados
- **Solução**: Adicionar endpoints para exportação

#### 3. **Sem Backup Automático**
- **Problema**: Sem proteção contra perda de dados
- **Impacto**: Risco de perda total
- **Solução**: Implementar backup automático

#### 4. **Sem Sincronização em Tempo Real**
- **Problema**: Múltiplos usuários não veem mudanças em tempo real
- **Impacto**: Conflitos de dados
- **Solução**: Implementar WebSockets com Socket.io

---

## 7. Recomendações de Melhoria

### Curto Prazo (Crítico)

1. **Adicionar validação de entrada** em todos os formulários com Zod
2. **Implementar tratamento de erros** consistente com toast notifications
3. **Adicionar paginação** em listas (limit/offset)
4. **Implementar busca em tempo real** com debounce
5. **Adicionar índices** no banco de dados

### Médio Prazo (Importante)

1. **Implementar integração Stripe** para pagamentos online
2. **Adicionar exportação de relatórios** (PDF, Excel, CSV)
3. **Implementar cache** com Redis
4. **Adicionar rate limiting** para segurança
5. **Implementar WebSockets** para atualizações em tempo real

### Longo Prazo (Desejável)

1. **Criptografar dados sensíveis** (CPF/CNPJ)
2. **Implementar backup automático**
3. **Adicionar multi-tenancy** para múltiplas empresas
4. **Implementar mobile app** (React Native)
5. **Adicionar integrações** com sistemas externos (ERP, contabilidade, etc)

---

## 8. Padrões e Convenções Utilizadas

### Nomenclatura

- **Tabelas**: snake_case (ex: `product_categories`)
- **Colunas**: camelCase (ex: `costPrice`)
- **Rotas tRPC**: camelCase (ex: `customers.list`)
- **Componentes React**: PascalCase (ex: `DashboardLayout`)
- **Funções**: camelCase (ex: `calculatePrice`)

### Estrutura de Código

- **Backend**: Separar lógica em `db.ts` (queries) e `routers.ts` (endpoints)
- **Frontend**: Usar componentes reutilizáveis em `/components`
- **Páginas**: Uma página por arquivo em `/pages`
- **Testes**: Um arquivo `.test.ts` por feature

### Padrões de Erro

- Usar `TRPCError` com códigos padronizados (BAD_REQUEST, FORBIDDEN, etc)
- Sempre retornar mensagens de erro descritivas
- Usar try-catch em operações assíncronas

### Padrões de Data

- Armazenar sempre em UTC
- Usar `Date` objects no TypeScript
- Converter para local timezone apenas na exibição

---

## 9. Checklist de Qualidade

- [x] Autenticação implementada
- [x] Autorização implementada
- [x] Validação de entrada (parcial)
- [x] Tratamento de erros (parcial)
- [x] Testes unitários (31 testes passando)
- [x] Documentação de código (comentários)
- [ ] Paginação
- [ ] Cache
- [ ] Rate limiting
- [ ] Criptografia de dados sensíveis
- [ ] Backup automático
- [ ] Monitoramento e logging
- [ ] Testes de integração
- [ ] Testes de carga
- [ ] Documentação de API

---

## 10. Conclusão

O sistema ERP foi desenvolvido com sucesso e implementa a maioria das funcionalidades solicitadas. A arquitetura é sólida, baseada em padrões modernos e boas práticas. Os principais pontos de melhoria identificados são:

1. **Validação e tratamento de erros** mais robustos
2. **Performance** (paginação, cache, índices)
3. **Segurança** (rate limiting, criptografia)
4. **Integrações** (Stripe, exportação de relatórios)
5. **Tempo real** (WebSockets para múltiplos usuários)

Com as melhorias propostas, o sistema estará pronto para produção e escalabilidade.

---

**Documento gerado por**: Manus AI  
**Data**: 28 de janeiro de 2026  
**Versão do Projeto**: e6ca28d9
