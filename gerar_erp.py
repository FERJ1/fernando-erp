import os

# Definição de todos os arquivos do projeto e seus conteúdos
arquivos = {
    # --- BANCO DE DADOS (SCHEMA FINAL) ---
    "drizzle/schema.ts": """
import { mysqlTable, serial, varchar, text, decimal, int, boolean, timestamp, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// 1. UTILIZADORES
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: mysqlEnum("role", ['user', 'admin']).default('user').notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

// 2. CLIENTES
export const customers = mysqlTable("customers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }).unique(),
  status: mysqlEnum("status", ['active', 'inactive']).default('active'),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const customerAddresses = mysqlTable("customer_addresses", {
  id: serial("id").primaryKey(),
  customerId: int("customerId").notNull(),
  street: varchar("street", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  isPrimary: boolean("isPrimary").default(false),
});

// 3. PRODUTOS E CATEGORIAS (TEXTIL)
export const productCategories = mysqlTable("product_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentId: int("parentId"),
  isActive: boolean("isActive").default(true),
});

export const products = mysqlTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 100 }).unique(),
  categoryId: int("categoryId"),
  type: mysqlEnum("type", ['raw_material', 'finished_good']).default('finished_good').notNull(),
  unit: mysqlEnum("unit", ['un', 'kg', 'm', 'm2', 'rolo']).default('un').notNull(),
  costPrice: decimal("costPrice", { precision: 10, scale: 2 }).default('0'),
  laborCost: decimal("laborCost", { precision: 10, scale: 2 }).default('0'),
  sellingPrice: decimal("sellingPrice", { precision: 10, scale: 2 }).default('0'),
  quantity: int("quantity").default(0),
  minStockLevel: int("minStockLevel").default(10),
  image: text("image"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow(),
});

// 4. PEDIDOS
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).unique().notNull(),
  customerId: int("customerId").notNull(),
  status: mysqlEnum("status", ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).default('pending'),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default('0'),
  tax: decimal("tax", { precision: 10, scale: 2 }).default('0'),
  total: decimal("total", { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const orderItems = mysqlTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// 5. FINANCEIRO
export const financialTransactions = mysqlTable("financial_transactions", {
  id: serial("id").primaryKey(),
  type: mysqlEnum("type", ['income', 'expense']).notNull(),
  category: varchar("category", { length: 100 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ['pending', 'paid', 'overdue']).default('pending'),
  dueDate: date("dueDate"),
  paidDate: date("paidDate"),
  description: text("description"),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// 6. PRODUÇÃO (Ficha Técnica e OPs)
export const technicalDataSheets = mysqlTable("technical_data_sheets", {
  id: serial("id").primaryKey(),
  productId: int("productId").notNull(),
  materialId: int("materialId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
});

export const productionOrders = mysqlTable("production_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull(),
  productId: int("productId").notNull(),
  quantity: int("quantity").notNull(),
  status: mysqlEnum("status", ['planned', 'in_progress', 'completed', 'cancelled']).default('planned'),
  startDate: timestamp("startDate").defaultNow(),
  endDate: timestamp("endDate"),
});

// RELACIONAMENTOS
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(productCategories, { fields: [products.categoryId], references: [productCategories.id] }),
  ingredients: many(technicalDataSheets, { relationName: "productBom" }),
  usedIn: many(technicalDataSheets, { relationName: "materialBom" }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  items: many(orderItems),
}));

export const technicalDataSheetsRelations = relations(technicalDataSheets, ({ one }) => ({
  product: one(products, { fields: [technicalDataSheets.productId], references: [products.id], relationName: "productBom" }),
  material: one(products, { fields: [technicalDataSheets.materialId], references: [products.id], relationName: "materialBom" }),
}));

export const productionOrdersRelations = relations(productionOrders, ({ one }) => ({
  product: one(products, { fields: [productionOrders.productId], references: [products.id] }),
}));
""",

    # --- BACKEND: ROUTER PRINCIPAL ---
    "server/routers/index.ts": """
import { router } from "../trpc";
import { customersRouter } from "./customers";
import { productsRouter } from "./products";
import { categoriesRouter } from "./categories";
import { ordersRouter } from "./orders";
import { financialRouter } from "./financial";
import { productionRouter } from "./production";
import { dashboardRouter } from "./dashboard";

export const appRouter = router({
  customers: customersRouter,
  products: productsRouter,
  categories: categoriesRouter,
  orders: ordersRouter,
  financial: financialRouter,
  production: productionRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
""",

    # --- FRONTEND: APP.TSX (ROTAS) ---
    "client/src/App.tsx": """
import React from 'react';
import { Route, Switch } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import LayoutPrincipal from "./components/LayoutPrincipal";

// Páginas
import Login from "./pages/Login";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Categorias from "./pages/Categorias";
import Pedidos from "./pages/Pedidos";
import Financeiro from "./pages/Financeiro";
import Producao from "./pages/Producao";
import FichasTecnicas from "./pages/FichasTecnicas";
import NotFound from "./pages/NotFound";

function RotaProtegida({ component: Component }: { component: React.ComponentType<any> }) {
  // Simulação simples de auth
  const isAuthenticated = !!localStorage.getItem("user_token");
  if (!isAuthenticated) return <Login />;
  
  return (
    <LayoutPrincipal>
      <Component />
    </LayoutPrincipal>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/">
            <RotaProtegida component={Home} />
        </Route>
        <Route path="/clientes">
            <RotaProtegida component={Clientes} />
        </Route>
        <Route path="/produtos">
            <RotaProtegida component={Produtos} />
        </Route>
        <Route path="/categorias">
            <RotaProtegida component={Categorias} />
        </Route>
        <Route path="/pedidos">
            <RotaProtegida component={Pedidos} />
        </Route>
        <Route path="/financeiro">
            <RotaProtegida component={Financeiro} />
        </Route>
        <Route path="/producao">
            <RotaProtegida component={Producao} />
        </Route>
        <Route path="/fichas-tecnicas">
            <RotaProtegida component={FichasTecnicas} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </ThemeProvider>
  );
}
"""
}

# Função para criar pastas e arquivos
def criar_arquivos():
    print("🚀 Iniciando a construção do ERP Têxtil...")
    for caminho, conteudo in arquivos.items():
        # Cria diretórios se não existirem
        diretorio = os.path.dirname(caminho)
        if diretorio and not os.path.exists(diretorio):
            os.makedirs(diretorio)
            print(f"📁 Pasta criada: {diretorio}")
        
        # Cria o arquivo
        with open(caminho, "w", encoding="utf-8") as f:
            f.write(conteudo.strip())
            print(f"✅ Arquivo gerado: {caminho}")

    print("\\n✨ Processo concluído! O código final foi gerado com sucesso.")
    print("Lembre-se: Este script gerou os arquivos de INTEGRAÇÃO (Schema, Rotas, App).")
    print("Os arquivos individuais das páginas (Home.tsx, Producao.tsx, etc.) devem ser copiados da nossa conversa anterior se ainda não existirem.")

if __name__ == "__main__":
    criar_arquivos()