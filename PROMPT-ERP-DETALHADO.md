# PROMPT DETALHADO PARA DESENVOLVIMENTO DE SISTEMA ERP

## Instruções Iniciais

Você é um desenvolvedor full-stack experiente especializado em sistemas de gestão empresarial (ERP). Sua tarefa é construir um **Sistema de Gestão Empresarial completo e robusto** seguindo as especificações abaixo com precisão. Este prompt fornece todas as informações necessárias para implementar o sistema sem ambiguidades ou lacunas.

---

## PARTE 1: VISÃO GERAL E OBJETIVOS

### 1.1 Objetivo Principal do Sistema

Desenvolver um **Sistema de Gestão Empresarial (ERP) web-based** que centralize e automatize a gestão completa de uma pequena ou média empresa, incluindo:

- **Gestão de Clientes**: Cadastro, histórico de compras, informações de contato
- **Gestão de Produtos**: Cadastro, controle de estoque, categorias
- **Gestão de Pedidos**: Criação, rastreamento, cálculo automático
- **Gestão Financeira**: Contas a pagar/receber, fluxo de caixa, DRE
- **Precificação Dinâmica**: Calculadora de preços com markup, margem, valor fixo
- **Conciliação Bancária**: Importação de extratos, matching automático
- **Relatórios e Análises**: Vendas, produtos, clientes, financeiro
- **Insights com IA**: Análises automáticas de dados e tendências
- **Auditoria**: Histórico de todas as ações dos usuários

### 1.2 Público-Alvo

- **Proprietários de pequenas/médias empresas** (não-técnicos)
- **Gerentes de vendas e financeiro**
- **Administradores do sistema**

### 1.3 Requisitos Não-Funcionais

- **Performance**: Resposta em < 500ms para 95% das requisições
- **Disponibilidade**: 99.5% uptime
- **Segurança**: Autenticação OAuth, autorização baseada em roles, criptografia de dados sensíveis
- **Escalabilidade**: Suportar até 10.000 usuários simultâneos
- **Usabilidade**: Interface intuitiva, sem necessidade de treinamento extenso
- **Design**: Elegante e sofisticado, transmitindo profissionalismo

---

## PARTE 2: ARQUITETURA TÉCNICA

### 2.1 Stack Tecnológico Obrigatório

```
Frontend:
  - React 19.2.1 (UI)
  - Tailwind CSS 4.1.14 (Styling)
  - shadcn/ui (Componentes)
  - Vite 7.1.7 (Build)
  - React Query (Caching)
  - Wouter (Routing)

Backend:
  - Express.js 4.21.2 (HTTP Server)
  - tRPC 11.6.0 (RPC Type-Safe)
  - Node.js 22.13.0 (Runtime)

Banco de Dados:
  - MySQL 8.0+ ou TiDB (Compatível com MySQL)
  - Drizzle ORM 0.44.5 (Schema Management)

Autenticação:
  - Manus OAuth (Integrado)

Testes:
  - Vitest 2.1.4 (Unit Tests)

Deployment:
  - Manus Platform (Hospedagem)
```

### 2.2 Estrutura de Pastas

```
project-root/
├── client/                              # Frontend React
│   ├── src/
│   │   ├── pages/                       # Páginas principais
│   │   │   ├── Home.tsx                 # Dashboard
│   │   │   ├── Clientes.tsx             # CRUD Clientes
│   │   │   ├── Categorias.tsx           # CRUD Categorias
│   │   │   ├── Produtos.tsx             # CRUD Produtos
│   │   │   ├── Pedidos.tsx              # CRUD Pedidos
│   │   │   ├── Financeiro.tsx           # Contas a pagar/receber
│   │   │   ├── Precificacao.tsx         # Calculadora de preços
│   │   │   ├── ConciliacaoBancaria.tsx  # Importação de extratos
│   │   │   ├── DRE.tsx                  # Relatório DRE
│   │   │   ├── Relatorios.tsx           # Relatórios gerais
│   │   │   ├── Insights.tsx             # Análises com IA
│   │   │   ├── Auditoria.tsx            # Histórico de ações (admin)
│   │   │   ├── Configuracoes.tsx        # Configurações (admin)
│   │   │   └── NotFound.tsx             # 404
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx      # Layout principal com sidebar
│   │   │   ├── DashboardLayoutSkeleton.tsx # Loading skeleton
│   │   │   ├── ErrorBoundary.tsx        # Error handling
│   │   │   └── ui/                      # shadcn/ui components
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx         # Tema (light/dark)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts               # Autenticação
│   │   │   └── useMobile.ts             # Responsividade
│   │   ├── lib/
│   │   │   └── trpc.ts                  # Cliente tRPC
│   │   ├── App.tsx                      # Roteamento principal
│   │   ├── main.tsx                     # Entry point
│   │   └── index.css                    # Estilos globais
│   ├── public/                          # Assets estáticos
│   └── index.html                       # HTML principal
│
├── server/                              # Backend Express
│   ├── _core/                           # Framework core (não editar)
│   │   ├── index.ts                     # Entry point
│   │   ├── context.ts                   # Contexto tRPC
│   │   ├── trpc.ts                      # Configuração tRPC
│   │   ├── env.ts                       # Variáveis de ambiente
│   │   ├── cookies.ts                   # Gerenciamento de cookies
│   │   ├── llm.ts                       # Integração com LLM
│   │   ├── notification.ts              # Notificações
│   │   └── systemRouter.ts              # Rotas do sistema
│   ├── db.ts                            # Funções de banco de dados
│   ├── routers.ts                       # Rotas tRPC (PRINCIPAL)
│   ├── auth.logout.test.ts              # Teste de logout
│   ├── erp.test.ts                      # Testes do ERP
│   ├── new-features.test.ts             # Testes das novas features
│   └── index.ts                         # Entry point
│
├── drizzle/                             # Schema e Migrations
│   ├── schema.ts                        # Definição de tabelas (PRINCIPAL)
│   └── *.sql                            # Migrations geradas
│
├── shared/                              # Código compartilhado
│   └── const.ts                         # Constantes
│
├── storage/                             # S3 Helpers
│   └── index.ts                         # Upload de arquivos
│
├── package.json                         # Dependências
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite config
├── drizzle.config.ts                    # Drizzle config
└── todo.md                              # Rastreamento de features
```

### 2.3 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│ CLIENTE (React)                                             │
│ - Componentes React                                         │
│ - useQuery/useMutation (tRPC)                               │
│ - React Query Cache                                         │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST /api/trpc
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ SERVIDOR (Express + tRPC)                                   │
│ - Autenticação (OAuth)                                      │
│ - Autorização (roles)                                       │
│ - Validação (Zod)                                           │
│ - Roteamento (tRPC routers)                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ LÓGICA DE NEGÓCIO (db.ts)                                   │
│ - Queries ao banco                                          │
│ - Cálculos                                                  │
│ - Regras de negócio                                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BANCO DE DADOS (MySQL/TiDB)                                 │
│ - Tabelas de dados                                          │
│ - Índices                                                   │
│ - Constraints                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## PARTE 3: MODELO DE DADOS COMPLETO

### 3.1 Tabelas e Campos

#### Tabela: `users`
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `product_categories`
```sql
CREATE TABLE product_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parentId INT,
  isActive BOOLEAN DEFAULT true,
  orderIndex INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES product_categories(id)
);
```

#### Tabela: `customers`
```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(20),
  cpfCnpj VARCHAR(20) UNIQUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cpfCnpj (cpfCnpj)
);
```

#### Tabela: `customer_addresses`
```sql
CREATE TABLE customer_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  customerId INT NOT NULL,
  street VARCHAR(255),
  number VARCHAR(20),
  complement VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zipCode VARCHAR(10),
  isPrimary BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
);
```

#### Tabela: `products`
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sku VARCHAR(100) UNIQUE,
  categoryId INT,
  costPrice DECIMAL(10, 2) NOT NULL,
  sellingPrice DECIMAL(10, 2) NOT NULL,
  quantity INT DEFAULT 0,
  minStockLevel INT DEFAULT 10,
  image TEXT,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoryId) REFERENCES product_categories(id),
  INDEX idx_sku (sku),
  INDEX idx_category (categoryId)
);
```

#### Tabela: `stock_movements`
```sql
CREATE TABLE stock_movements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  productId INT NOT NULL,
  type ENUM('in', 'out') NOT NULL,
  quantity INT NOT NULL,
  reason VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
```

#### Tabela: `orders`
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  customerId INT NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  paymentStatus ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  subtotal DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  confirmedAt TIMESTAMP NULL,
  deliveredAt TIMESTAMP NULL,
  FOREIGN KEY (customerId) REFERENCES customers(id),
  INDEX idx_customer (customerId),
  INDEX idx_status (status),
  INDEX idx_createdAt (createdAt)
);
```

#### Tabela: `order_items`
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT NOT NULL,
  quantity INT NOT NULL,
  unitPrice DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

#### Tabela: `financial_transactions`
```sql
CREATE TABLE financial_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('income', 'expense') NOT NULL,
  category VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  dueDate DATE,
  paidDate DATE NULL,
  description TEXT,
  orderId INT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_dueDate (dueDate)
);
```

#### Tabela: `payment_records`
```sql
CREATE TABLE payment_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transactionId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentDate DATE NOT NULL,
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transactionId) REFERENCES financial_transactions(id) ON DELETE CASCADE
);
```

#### Tabela: `bank_accounts`
```sql
CREATE TABLE bank_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  accountNumber VARCHAR(50),
  bankCode VARCHAR(10),
  balance DECIMAL(12, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'BRL',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabela: `bank_transactions`
```sql
CREATE TABLE bank_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  accountId INT NOT NULL,
  transactionDate DATE NOT NULL,
  description VARCHAR(255),
  amount DECIMAL(12, 2) NOT NULL,
  transactionType ENUM('debit', 'credit') NOT NULL,
  status ENUM('pending', 'reconciled') DEFAULT 'pending',
  matchedTransactionId INT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (accountId) REFERENCES bank_accounts(id),
  FOREIGN KEY (matchedTransactionId) REFERENCES financial_transactions(id),
  INDEX idx_accountId (accountId),
  INDEX idx_transactionDate (transactionDate)
);
```

#### Tabela: `pricing_rules`
```sql
CREATE TABLE pricing_rules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  productId INT,
  type ENUM('markup', 'margin', 'fixed') NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  additionalCosts DECIMAL(10, 2) DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

#### Tabela: `dre_categories`
```sql
CREATE TABLE dre_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  type ENUM('revenue', 'cost', 'expense', 'tax') NOT NULL,
  parentId INT NULL,
  orderIndex INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES dre_categories(id)
);
```

#### Tabela: `audit_logs`
```sql
CREATE TABLE audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entityId INT,
  changes JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_timestamp (timestamp)
);
```

### 3.2 Relacionamentos

```
users
  ├─→ audit_logs (1:N)
  └─→ (pode ter múltiplas ações)

customers (1:N)
  ├─→ customer_addresses (1:N)
  ├─→ orders (1:N)
  └─→ financial_transactions (1:N via orders)

product_categories (1:N)
  ├─→ product_categories (self-join para hierarquia)
  └─→ products (1:N)

products (1:N)
  ├─→ order_items (1:N)
  ├─→ stock_movements (1:N)
  └─→ pricing_rules (1:N)

orders (1:N)
  ├─→ order_items (1:N)
  └─→ financial_transactions (1:N)

order_items (N:1)
  ├─→ orders
  └─→ products

financial_transactions (1:N)
  ├─→ payment_records (1:N)
  ├─→ bank_transactions (1:1 via matchedTransactionId)
  └─→ orders (N:1)

bank_accounts (1:N)
  └─→ bank_transactions (1:N)

dre_categories (1:N)
  └─→ dre_categories (self-join para hierarquia)
```

---

## PARTE 4: FUNCIONALIDADES DETALHADAS

### 4.1 Autenticação e Autorização

**Requisitos:**
- Login via Manus OAuth (integrado automaticamente)
- Dois níveis de permissão: `admin` e `user`
- Proteção de rotas com `protectedProcedure` e `adminProcedure`
- Logout com limpeza de cookies
- Histórico de ações (auditoria)

**Implementação:**
- Usar `ctx.user` para acessar usuário autenticado
- Usar `adminProcedure` para rotas admin
- Registrar todas as ações em `audit_logs`
- Validar permissões em todas as rotas

**Testes:**
- Teste de logout (exemplo: `auth.logout.test.ts`)
- Teste de acesso negado para usuários não-admin

---

### 4.2 Módulo de Clientes

**CRUD Completo:**

**CREATE** - Criar novo cliente
```typescript
Input: {
  name: string (obrigatório, min 3 chars)
  email: string (opcional, válido)
  phone: string (opcional)
  cpfCnpj: string (opcional, único)
  addresses: Array<{
    street, number, complement, city, state, zipCode
  }>
}
Output: { id, ...dados }
```

**READ** - Listar clientes
```typescript
Input: {
  search?: string (busca por nome/email/cpf)
  status?: 'active' | 'inactive'
  limit: number (default 50, max 500)
  offset: number (default 0)
}
Output: { data: [...], total, hasMore }
```

**UPDATE** - Editar cliente
```typescript
Input: {
  id: number
  ...campos a atualizar
}
Output: { id, ...dados }
```

**DELETE** - Deletar cliente
```typescript
Input: { id: number }
Output: { success: boolean }
```

**Validações:**
- Nome: obrigatório, 3-255 caracteres
- Email: formato válido (regex)
- CPF/CNPJ: formato válido e único
- Telefone: formato válido

**Regras de Negócio:**
- Não permitir deletar cliente com pedidos
- Manter histórico de endereços
- Registrar todas as mudanças em audit_logs

---

### 4.3 Módulo de Categorias

**Funcionalidades:**
- CRUD de categorias
- Suporte a subcategorias (hierarquia)
- Ordenação customizável
- Ativação/desativação

**Validações:**
- Nome: obrigatório, único, 3-100 caracteres
- ParentId: deve existir se fornecido

---

### 4.4 Módulo de Produtos

**CRUD Completo:**

**CREATE** - Criar produto
```typescript
Input: {
  name: string (obrigatório)
  description: string (opcional)
  sku: string (único, opcional)
  categoryId: number (obrigatório)
  costPrice: number (obrigatório, >= 0)
  sellingPrice: number (obrigatório, >= costPrice)
  quantity: number (default 0)
  minStockLevel: number (default 10)
  image: File (opcional, max 5MB)
}
Output: { id, ...dados }
```

**READ** - Listar produtos
```typescript
Input: {
  search?: string
  categoryId?: number
  lowStockOnly?: boolean
  limit: number
  offset: number
}
Output: { data: [...], total, hasMore }
```

**UPDATE** - Editar produto
```typescript
Input: {
  id: number
  ...campos a atualizar
}
Output: { id, ...dados }
```

**DELETE** - Deletar produto
```typescript
Input: { id: number }
Output: { success: boolean }
```

**Validações:**
- Nome: obrigatório, 3-255 caracteres
- SKU: único se fornecido
- Preços: números positivos, sellingPrice >= costPrice
- Quantidade: número >= 0
- Imagem: max 5MB, formatos: jpg, png, webp

**Regras de Negócio:**
- Registrar movimento de estoque quando quantidade muda
- Gerar alerta se estoque < minStockLevel
- Não permitir deletar produto com pedidos
- Histórico de preços

---

### 4.5 Módulo de Pedidos

**CRUD Completo:**

**CREATE** - Criar pedido
```typescript
Input: {
  customerId: number (obrigatório)
  items: Array<{
    productId: number
    quantity: number (> 0)
  }> (obrigatório, min 1 item)
}
Output: {
  id, orderNumber, customerId, items,
  subtotal, tax, total, status, paymentStatus
}
```

**Lógica de Cálculo:**
1. Para cada item: `subtotal = quantity * unitPrice`
2. `subtotal_total = SUM(subtotals)`
3. `tax = subtotal_total * 0.10` (10% padrão, configurável)
4. `total = subtotal_total + tax`
5. Gerar `orderNumber` único (ex: "PED-2024-001")
6. Criar `financial_transaction` com status 'pending'

**UPDATE** - Editar pedido
```typescript
Input: {
  id: number
  items?: Array<{ productId, quantity }>
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
}
Output: { id, ...dados }
```

**Validações:**
- Cliente deve existir
- Produtos devem existir
- Quantidade > 0
- Não permitir editar pedido entregue/cancelado
- Atualizar estoque ao confirmar

**Regras de Negócio:**
- Status flow: pending → confirmed → shipped → delivered
- Ao confirmar: descontar estoque
- Ao cancelar: restaurar estoque
- Registrar todas as mudanças em audit_logs
- Gerar notificação ao criar pedido

---

### 4.6 Módulo Financeiro

**Funcionalidades:**

**Contas a Receber:**
- Criadas automaticamente ao confirmar pedido
- Status: pending, partial, paid, overdue
- Registrar pagamentos parciais
- Calcular juros/multa (opcional)

**Contas a Pagar:**
- Criadas manualmente ou via despesas
- Status: pending, partial, paid, overdue
- Registrar pagamentos
- Alertar contas vencidas

**Fluxo de Caixa:**
- Visualizar entradas/saídas por período
- Saldo acumulado
- Previsão de caixa

**Validações:**
- Valor > 0
- Data de vencimento válida
- Não permitir pagamento > saldo devedor

**Regras de Negócio:**
- Marcar como overdue se dueDate < hoje e status != paid
- Atualizar status automaticamente ao registrar pagamento
- Registrar todas as transações em audit_logs

---

### 4.7 Módulo de Precificação

**Calculadora de Preços:**

**Método 1: Markup**
```
Preço = Custo × (1 + Markup%)
Exemplo: Custo R$100, Markup 50% → Preço R$150
```

**Método 2: Margem**
```
Preço = Custo / (1 - Margem%)
Exemplo: Custo R$100, Margem 33% → Preço R$150
Validação: Margem < 100%
```

**Método 3: Valor Fixo**
```
Preço = Custo + Valor Fixo
Exemplo: Custo R$100, Valor Fixo R$50 → Preço R$150
```

**Análise de Lucratividade:**
```
Lucro = Preço Venda - Custo
Margem = (Lucro / Preço Venda) × 100
Markup = (Lucro / Custo) × 100
```

**Regras de Negócio:**
- Suportar custos adicionais (frete, impostos)
- Salvar regras para reutilização
- Histórico de preços
- Validar que preço > custo

---

### 4.8 Módulo de Conciliação Bancária

**Funcionalidades:**

**Gerenciamento de Contas:**
- Cadastrar conta bancária
- Campos: nome, número da conta, código banco, saldo inicial
- Ativar/desativar contas

**Importação de Extratos:**
- Suportar CSV e OFX
- Formato CSV esperado:
  ```
  Data,Descrição,Valor,Tipo
  2024-01-15,Venda Pedido #001,1500.00,credit
  2024-01-16,Aluguel,2000.00,debit
  ```
- Parser automático
- Validar formato

**Conciliação Automática:**
- Matching por valor + data (±3 dias)
- Matching por descrição (fuzzy match)
- Marcar como reconciled
- Alertar discrepâncias

**Validações:**
- Arquivo max 10MB
- Formato válido
- Datas válidas
- Valores numéricos

---

### 4.9 Módulo DRE

**Demonstração do Resultado do Exercício:**

**Estrutura:**
```
RECEITA OPERACIONAL BRUTA
  - Vendas
  - Serviços
  - Outras receitas
= RECEITA LÍQUIDA

(-) CUSTO DOS PRODUTOS VENDIDOS (CPV)
  - Custo de matéria-prima
  - Custo de mão de obra
= LUCRO BRUTO

(-) DESPESAS OPERACIONAIS
  - Despesas de vendas
  - Despesas administrativas
  - Despesas gerais
= LUCRO OPERACIONAL

(-) OUTRAS DESPESAS
  - Juros
  - Multas
= LUCRO ANTES DOS IMPOSTOS

(-) IMPOSTOS
  - IRPJ
  - CSLL
= LUCRO LÍQUIDO
```

**Cálculos:**
```
Margem Bruta = (Lucro Bruto / Receita Líquida) × 100
Margem Operacional = (Lucro Operacional / Receita Líquida) × 100
Margem Líquida = (Lucro Líquido / Receita Líquida) × 100
```

**Período:**
- Mensal, trimestral, anual
- Data início e fim customizável

**Visualização:**
- Tabela detalhada
- Gráficos (barras, pizza)
- Comparação com período anterior

---

### 4.10 Módulo de Relatórios

**Relatórios Disponíveis:**

1. **Vendas por Período**
   - Gráfico de linha (receita ao longo do tempo)
   - Filtros: período, cliente, produto
   - Totais: quantidade, valor, ticket médio

2. **Produtos Mais Vendidos**
   - Top 10 produtos
   - Gráfico de barras
   - Quantidade e receita
   - Margem de lucro

3. **Clientes Mais Ativos**
   - Top 10 clientes
   - Gráfico de barras
   - Quantidade de pedidos, valor total
   - Ticket médio

4. **Balanço Financeiro**
   - Receitas vs Despesas
   - Gráfico de comparação
   - Saldo acumulado
   - Previsão

**Funcionalidades Comuns:**
- Filtros por período, categoria, cliente
- Exportação (CSV, PDF)
- Atualização em tempo real
- Comparação com período anterior

---

### 4.11 Módulo de Insights com IA

**Análises Automáticas:**

1. **Tendências de Vendas**
   - Produtos em alta
   - Produtos em queda
   - Sazonalidade

2. **Recomendações de Negócio**
   - Produtos para aumentar preço
   - Produtos para descontar
   - Clientes em risco de churn

3. **Análise Financeira**
   - Fluxo de caixa previsto
   - Alertas de despesas altas
   - Oportunidades de economia

4. **Alertas Inteligentes**
   - Estoque baixo
   - Contas vencidas
   - Clientes inativos

**Implementação:**
- Usar LLM (invokeLLM) para gerar análises
- Prompt estruturado com dados do período
- Resposta em JSON estruturado
- Atualizar insights diariamente (job agendado)

---

### 4.12 Módulo de Auditoria

**Funcionalidades:**
- Registrar todas as ações (CREATE, UPDATE, DELETE)
- Campos: usuário, ação, entidade, ID, mudanças, timestamp
- Filtros por usuário, tipo de ação, período, entidade
- Apenas para admin

**Ações Registradas:**
- Criar cliente/produto/pedido
- Editar cliente/produto/pedido
- Deletar cliente/produto/pedido
- Registrar pagamento
- Importar extrato
- Gerar relatório

**Retenção:**
- Manter por 2 anos
- Arquivar logs antigos

---

## PARTE 5: ROTAS tRPC COMPLETAS

### 5.1 Autenticação

```typescript
auth: {
  me: publicProcedure.query() → User | null
  logout: publicProcedure.mutation() → { success: boolean }
}
```

### 5.2 Clientes

```typescript
customers: {
  list: protectedProcedure.input({ search?, status?, limit, offset }).query()
  create: protectedProcedure.input({ name, email, phone, cpfCnpj, addresses }).mutation()
  update: protectedProcedure.input({ id, ...fields }).mutation()
  delete: protectedProcedure.input({ id }).mutation()
  getById: protectedProcedure.input({ id }).query()
}
```

### 5.3 Categorias

```typescript
categories: {
  list: protectedProcedure.query()
  create: adminProcedure.input({ name, description, parentId }).mutation()
  update: adminProcedure.input({ id, ...fields }).mutation()
  delete: adminProcedure.input({ id }).mutation()
}
```

### 5.4 Produtos

```typescript
products: {
  list: protectedProcedure.input({ search?, categoryId?, lowStockOnly?, limit, offset }).query()
  create: protectedProcedure.input({ name, description, sku, categoryId, costPrice, sellingPrice, quantity, minStockLevel }).mutation()
  update: protectedProcedure.input({ id, ...fields }).mutation()
  delete: protectedProcedure.input({ id }).mutation()
  getById: protectedProcedure.input({ id }).query()
  getLowStock: protectedProcedure.query()
}
```

### 5.5 Pedidos

```typescript
orders: {
  list: protectedProcedure.input({ search?, status?, customerId?, limit, offset }).query()
  create: protectedProcedure.input({ customerId, items: Array<{ productId, quantity }> }).mutation()
  update: protectedProcedure.input({ id, items?, status? }).mutation()
  updateStatus: protectedProcedure.input({ id, status }).mutation()
  delete: protectedProcedure.input({ id }).mutation()
  getById: protectedProcedure.input({ id }).query()
}
```

### 5.6 Financeiro

```typescript
financial: {
  list: protectedProcedure.input({ type?, status?, startDate?, endDate?, limit, offset }).query()
  create: protectedProcedure.input({ type, category, amount, dueDate, description }).mutation()
  update: protectedProcedure.input({ id, ...fields }).mutation()
  recordPayment: protectedProcedure.input({ transactionId, amount, paymentDate, paymentMethod }).mutation()
  getSummary: protectedProcedure.input({ startDate, endDate }).query()
  getCashFlow: protectedProcedure.input({ startDate, endDate }).query()
}
```

### 5.7 Precificação

```typescript
pricing: {
  calculatePrice: protectedProcedure.input({ costPrice, type, value, additionalCosts? }).query()
  analyzePrice: protectedProcedure.input({ costPrice, sellingPrice }).query()
  rules: {
    list: protectedProcedure.query()
    create: adminProcedure.input({ name, productId?, type, value, additionalCosts? }).mutation()
    update: adminProcedure.input({ id, ...fields }).mutation()
    delete: adminProcedure.input({ id }).mutation()
  }
}
```

### 5.8 Banco

```typescript
bank: {
  accounts: {
    list: protectedProcedure.query()
    create: adminProcedure.input({ name, accountNumber, bankCode, balance?, currency? }).mutation()
    update: adminProcedure.input({ id, ...fields }).mutation()
  }
  transactions: {
    list: protectedProcedure.input({ accountId?, status?, limit, offset }).query()
    import: adminProcedure.input({ accountId, file: File }).mutation()
  }
  reconcile: adminProcedure.input({ transactionId, financialTransactionId }).mutation()
}
```

### 5.9 DRE

```typescript
dre: {
  report: protectedProcedure.input({ startDate, endDate }).query()
  categories: {
    list: protectedProcedure.query()
    create: adminProcedure.input({ name, type, parentId? }).mutation()
    update: adminProcedure.input({ id, ...fields }).mutation()
  }
}
```

### 5.10 Relatórios

```typescript
reports: {
  salesByPeriod: protectedProcedure.input({ startDate, endDate, customerId?, productId? }).query()
  topProducts: protectedProcedure.input({ startDate, endDate, limit? }).query()
  topCustomers: protectedProcedure.input({ startDate, endDate, limit? }).query()
  financialSummary: protectedProcedure.input({ startDate, endDate }).query()
}
```

### 5.11 Insights

```typescript
insights: {
  analyze: protectedProcedure.input({ startDate, endDate }).query()
}
```

### 5.12 Auditoria

```typescript
audit: {
  list: adminProcedure.input({ userId?, action?, entity?, startDate?, endDate?, limit, offset }).query()
  getByEntity: adminProcedure.input({ entity, entityId }).query()
}
```

### 5.13 Dashboard

```typescript
dashboard: {
  stats: protectedProcedure.query()
}
```

---

## PARTE 6: PÁGINAS E COMPONENTES

### 6.1 Estrutura de Navegação

```
Dashboard (/)
├── Clientes (/clientes)
├── Categorias (/categorias)
├── Produtos (/produtos)
├── Pedidos (/pedidos)
├── Financeiro (/financeiro)
├── Precificação (/precificacao)
├── Conciliação Bancária (/conciliacao-bancaria)
├── DRE (/dre)
├── Relatórios (/relatorios)
├── Insights IA (/insights)
├── Auditoria (/auditoria) [Admin]
└── Configurações (/configuracoes) [Admin]
```

### 6.2 Componentes Principais

**DashboardLayout**
- Sidebar com menu de navegação
- Header com usuário logado
- Logout button
- Responsivo (mobile-friendly)
- Tema dark/light

**Páginas de CRUD**
- Tabela com dados
- Filtros e busca
- Paginação
- Botões: Novo, Editar, Deletar
- Modal/Dialog para criar/editar
- Confirmação para deletar

**Dashboard**
- KPIs em cards
- Gráficos de tendências
- Alertas (estoque baixo, contas vencidas)
- Atalhos para principais funcionalidades

---

## PARTE 7: VALIDAÇÕES E REGRAS DE NEGÓCIO

### 7.1 Validações de Entrada

**Usar Zod para validação:**
```typescript
const createCustomerSchema = z.object({
  name: z.string().min(3).max(255),
  email: z.string().email().optional(),
  cpfCnpj: z.string().regex(/^\d{11,14}$/).optional(),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
});
```

**Validar em todas as rotas tRPC**

### 7.2 Regras de Negócio

1. **Clientes**
   - Não deletar com pedidos
   - CPF/CNPJ único
   - Email único (se fornecido)

2. **Produtos**
   - Preço venda >= preço custo
   - SKU único
   - Não deletar com pedidos
   - Atualizar estoque em movimentações

3. **Pedidos**
   - Min 1 item
   - Cliente deve existir
   - Produtos devem existir
   - Atualizar estoque ao confirmar
   - Não editar entregue/cancelado

4. **Financeiro**
   - Valor > 0
   - Não permitir pagamento > saldo devedor
   - Marcar overdue automaticamente
   - Registrar todas as transações

5. **Precificação**
   - Margem < 100%
   - Preço > custo
   - Suportar custos adicionais

---

## PARTE 8: TESTES

### 8.1 Testes Unitários (Vitest)

**Estrutura:**
```typescript
describe('Feature Name', () => {
  it('should do something', () => {
    // Arrange
    const input = ...
    
    // Act
    const result = ...
    
    // Assert
    expect(result).toBe(...)
  });
});
```

**Cobertura Mínima:**
- Autenticação (login, logout, autorização)
- CRUD de cada entidade
- Cálculos (preço, margem, lucro)
- Validações
- Regras de negócio

### 8.2 Teste de Exemplo

```typescript
import { describe, it, expect } from 'vitest';
import { calculatePrice } from './db';

describe('Pricing Calculator', () => {
  it('calculates price with markup', () => {
    const result = calculatePrice(100, { type: 'markup', value: 50 });
    expect(result).toBe(150);
  });

  it('throws error for invalid margin', () => {
    expect(() => calculatePrice(100, { type: 'margin', value: 100 })).toThrow();
  });
});
```

---

## PARTE 9: DESIGN E UX

### 9.1 Estilo Visual

- **Tema**: Elegante e sofisticado
- **Cores Primárias**: Índigo/Azul escuro
- **Cores Secundárias**: Tons complementares
- **Typography**: Font clara e legível
- **Spacing**: Consistente e generoso
- **Shadows**: Suaves e profundos
- **Responsividade**: Mobile-first

### 9.2 Componentes UI

- Usar shadcn/ui para consistência
- Tailwind CSS para customização
- Ícones: Lucide React
- Animações: Framer Motion (subtis)
- Notificações: Sonner (toast)

### 9.3 UX Patterns

- **Confirmação**: Dialog para ações destrutivas
- **Feedback**: Toast para sucesso/erro
- **Loading**: Skeleton screens
- **Empty States**: Mensagens amigáveis
- **Paginação**: Botões ou scroll infinito
- **Filtros**: Sempre visíveis e resettáveis

---

## PARTE 10: SEGURANÇA

### 10.1 Autenticação

- Usar Manus OAuth (integrado)
- Validar token em cada requisição
- Logout com limpeza de cookies

### 10.2 Autorização

- Verificar role em rotas admin
- Usar `adminProcedure` para admin-only
- Validar propriedade de dados (usuário só vê seus dados)

### 10.3 Validação

- Validar entrada com Zod
- Sanitizar strings
- Validar tipos de dados

### 10.4 Proteção de Dados

- Não expor IDs internos
- Usar UUIDs se possível
- Criptografar dados sensíveis (CPF/CNPJ)
- HTTPS obrigatório
- Rate limiting

---

## PARTE 11: PERFORMANCE

### 11.1 Otimizações Frontend

- Code splitting com React.lazy
- Lazy loading de imagens
- Memoização com useMemo/useCallback
- React Query para caching
- Debounce em buscas

### 11.2 Otimizações Backend

- Índices no banco de dados
- Paginação (limit/offset)
- Select apenas campos necessários
- Cache com Redis (opcional)
- Compressão gzip

### 11.3 Monitoramento

- Logs de erros
- Métricas de performance
- Alertas de anomalias

---

## PARTE 12: DEPLOYMENT

### 12.1 Ambiente de Produção

- Usar Manus Platform (hospedagem integrada)
- Variáveis de ambiente seguras
- Database backups automáticos
- SSL/TLS obrigatório
- Monitoramento 24/7

### 12.2 CI/CD

- Testes automáticos antes de deploy
- Build automático
- Rollback automático em caso de erro

---

## PARTE 13: DOCUMENTAÇÃO

### 13.1 Código

- Comentários em funções complexas
- JSDoc para funções públicas
- Tipos TypeScript explícitos

### 13.2 API

- Documentação de rotas tRPC
- Exemplos de uso
- Erros possíveis

### 13.3 Usuário

- Manual do usuário
- Vídeos tutoriais
- FAQ

---

## PARTE 14: ERROS COMUNS A EVITAR

### 14.1 Erros de Implementação

1. **SelectItem com value vazio** ❌
   ```typescript
   // ERRADO
   <SelectItem value="">Selecionar...</SelectItem>
   
   // CORRETO
   <SelectItem value="all">Todos</SelectItem>
   ```

2. **SQL com aliases não definidos** ❌
   ```typescript
   // ERRADO
   sql<string>`SUM(oi.quantity * p.costPrice)`
   
   // CORRETO
   sql<string>`SUM(${orderItems.quantity} * ${products.costPrice})`
   ```

3. **Summary vazio em fallback** ❌
   ```typescript
   // ERRADO
   if (!db) return { summary: {} };
   
   // CORRETO
   if (!db) return { 
     summary: {
       totalRevenue: '0',
       totalCogs: '0',
       // ... todos os campos
     }
   };
   ```

4. **Sem validação de entrada** ❌
   ```typescript
   // ERRADO
   router.create: protectedProcedure.input(z.any()).mutation(...)
   
   // CORRETO
   router.create: protectedProcedure.input(createSchema).mutation(...)
   ```

5. **Sem tratamento de erros** ❌
   ```typescript
   // ERRADO
   const data = await db.query();
   
   // CORRETO
   try {
     const data = await db.query();
   } catch (error) {
     throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
   }
   ```

### 14.2 Erros de Segurança

1. **Sem verificação de autorização**
2. **Dados sensíveis em logs**
3. **SQL injection (usar Drizzle)**
4. **XSS (React sanitiza automaticamente)**
5. **CSRF (tRPC protege automaticamente)**

### 14.3 Erros de Performance

1. **N+1 queries** - Usar joins
2. **Sem paginação** - Limitar resultados
3. **Sem índices** - Adicionar índices
4. **Sem cache** - Usar React Query

---

## PARTE 15: CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Setup Inicial
- [ ] Criar projeto com scaffold (React + Express + tRPC)
- [ ] Configurar banco de dados
- [ ] Configurar autenticação OAuth
- [ ] Criar estrutura de pastas

### Fase 2: Schema e Banco
- [ ] Definir todas as tabelas em schema.ts
- [ ] Gerar migrations
- [ ] Aplicar migrations
- [ ] Criar índices

### Fase 3: Backend
- [ ] Implementar db.ts com todas as funções
- [ ] Implementar routers.ts com todas as rotas
- [ ] Adicionar validação com Zod
- [ ] Adicionar tratamento de erros
- [ ] Implementar auditoria

### Fase 4: Frontend
- [ ] Criar DashboardLayout
- [ ] Criar página Home (Dashboard)
- [ ] Criar páginas de CRUD (Clientes, Produtos, etc)
- [ ] Implementar filtros e busca
- [ ] Implementar paginação

### Fase 5: Funcionalidades Avançadas
- [ ] Precificação
- [ ] Conciliação Bancária
- [ ] DRE
- [ ] Relatórios
- [ ] Insights com IA

### Fase 6: Testes
- [ ] Testes unitários (Vitest)
- [ ] Testes de integração
- [ ] Testes de carga

### Fase 7: Deployment
- [ ] Preparar para produção
- [ ] Configurar variáveis de ambiente
- [ ] Deploy no Manus Platform

---

## PARTE 16: CONCLUSÃO

Este prompt fornece uma especificação **completa e detalhada** para implementar um sistema ERP profissional. Seguindo este documento, um desenvolvedor ou IA será capaz de:

1. Entender completamente os requisitos
2. Implementar todas as funcionalidades sem ambiguidades
3. Evitar erros comuns
4. Manter código de qualidade
5. Entregar um produto pronto para produção

**Não deixe lacunas. Implemente tudo conforme especificado.**

---

**Documento preparado por**: Manus AI  
**Data**: 28 de janeiro de 2026  
**Versão**: 1.0  
**Status**: Pronto para implementação
