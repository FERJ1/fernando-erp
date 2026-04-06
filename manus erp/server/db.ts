import { eq, desc, asc, and, or, like, gte, lte, sql, count, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  customers, InsertCustomer, Customer,
  categories, InsertCategory, Category,
  products, InsertProduct, Product,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem, OrderItem,
  financialTransactions, InsertFinancialTransaction, FinancialTransaction,
  stockMovements, InsertStockMovement, StockMovement,
  auditLogs, InsertAuditLog, AuditLog
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ==================== USER FUNCTIONS ====================
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}

// ==================== AUDIT LOG FUNCTIONS ====================
export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(log);
}

export async function getAuditLogs(filters?: { userId?: number; entity?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLogs);
  const conditions = [];
  
  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters?.entity) conditions.push(eq(auditLogs.entity, filters.entity));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(auditLogs.createdAt)).limit(filters?.limit || 100);
}

// ==================== CUSTOMER FUNCTIONS ====================
export async function createCustomer(customer: InsertCustomer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(customers).values(customer);
  return { id: result[0].insertId };
}

export async function updateCustomer(id: number, customer: Partial<InsertCustomer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set(customer).where(eq(customers.id, id));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result[0];
}

export async function getCustomers(filters?: { search?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.isActive !== undefined) conditions.push(eq(customers.isActive, filters.isActive));
  if (filters?.search) {
    conditions.push(
      or(
        like(customers.name, `%${filters.search}%`),
        like(customers.email, `%${filters.search}%`),
        like(customers.document, `%${filters.search}%`)
      )
    );
  }
  
  let query = db.select().from(customers);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(customers.createdAt));
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(customers).set({ isActive: false }).where(eq(customers.id, id));
}

// ==================== CATEGORY FUNCTIONS ====================
export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return { id: result[0].insertId };
}

export async function updateCategory(id: number, category: Partial<InsertCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set(category).where(eq(categories.id, id));
}

export async function getCategories(isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(categories);
  if (isActive !== undefined) {
    query = query.where(eq(categories.isActive, isActive)) as typeof query;
  }
  
  return await query.orderBy(asc(categories.name));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(categories).set({ isActive: false }).where(eq(categories.id, id));
}

// ==================== PRODUCT FUNCTIONS ====================
export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product);
  return { id: result[0].insertId };
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProducts(filters?: { search?: string; categoryId?: number; isActive?: boolean; lowStock?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.isActive !== undefined) conditions.push(eq(products.isActive, filters.isActive));
  if (filters?.categoryId) conditions.push(eq(products.categoryId, filters.categoryId));
  if (filters?.lowStock) conditions.push(sql`${products.stockQuantity} <= ${products.minStockLevel}`);
  if (filters?.search) {
    conditions.push(
      or(
        like(products.name, `%${filters.search}%`),
        like(products.sku, `%${filters.search}%`),
        like(products.description, `%${filters.search}%`)
      )
    );
  }
  
  let query = db.select().from(products);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(products.createdAt));
}

export async function getLowStockProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(and(
      eq(products.isActive, true),
      sql`${products.stockQuantity} <= ${products.minStockLevel}`
    ))
    .orderBy(asc(products.stockQuantity));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ isActive: false }).where(eq(products.id, id));
}

// ==================== STOCK MOVEMENT FUNCTIONS ====================
export async function createStockMovement(movement: InsertStockMovement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const product = await getProductById(movement.productId);
  if (!product) throw new Error("Product not found");
  
  const previousStock = product.stockQuantity;
  let newStock = previousStock;
  
  if (movement.type === 'in') {
    newStock = previousStock + movement.quantity;
  } else if (movement.type === 'out') {
    newStock = previousStock - movement.quantity;
  } else {
    newStock = movement.quantity;
  }
  
  await db.insert(stockMovements).values({
    ...movement,
    previousStock,
    newStock
  });
  
  await db.update(products).set({ stockQuantity: newStock }).where(eq(products.id, movement.productId));
  
  return { previousStock, newStock };
}

export async function getStockMovements(productId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(stockMovements);
  if (productId) {
    query = query.where(eq(stockMovements.productId, productId)) as typeof query;
  }
  
  return await query.orderBy(desc(stockMovements.createdAt));
}

// ==================== ORDER FUNCTIONS ====================
export async function generateOrderNumber() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const year = new Date().getFullYear();
  const result = await db.select({ count: count() }).from(orders)
    .where(sql`YEAR(${orders.createdAt}) = ${year}`);
  
  const orderCount = (result[0]?.count || 0) + 1;
  return `PED${year}${String(orderCount).padStart(6, '0')}`;
}

export async function createOrder(order: Omit<InsertOrder, 'orderNumber'>, items: Omit<InsertOrderItem, 'orderId'>[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const orderNumber = await generateOrderNumber();
  const result = await db.insert(orders).values({ ...order, orderNumber } as InsertOrder);
  const orderId = result[0].insertId;
  
  for (const item of items) {
    await db.insert(orderItems).values({ ...item, orderId });
    
    // Update stock
    await createStockMovement({
      productId: item.productId,
      type: 'out',
      quantity: item.quantity,
      reason: `Pedido ${orderNumber}`,
      orderId,
      previousStock: 0,
      newStock: 0
    });
  }
  
  return { id: orderId, orderNumber };
}

export async function updateOrder(id: number, order: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set(order).where(eq(orders.id, id));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const orderResult = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!orderResult[0]) return undefined;
  
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  const customer = await getCustomerById(orderResult[0].customerId);
  
  return { ...orderResult[0], items, customer };
}

export async function getOrders(filters?: { 
  customerId?: number; 
  status?: string; 
  paymentStatus?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.customerId) conditions.push(eq(orders.customerId, filters.customerId));
  if (filters?.status) conditions.push(eq(orders.status, filters.status as any));
  if (filters?.paymentStatus) conditions.push(eq(orders.paymentStatus, filters.paymentStatus as any));
  if (filters?.startDate) conditions.push(gte(orders.createdAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(orders.createdAt, filters.endDate));
  if (filters?.search) {
    conditions.push(like(orders.orderNumber, `%${filters.search}%`));
  }
  
  let query = db.select().from(orders);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(orders.createdAt));
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

// ==================== FINANCIAL TRANSACTION FUNCTIONS ====================
export async function createFinancialTransaction(transaction: InsertFinancialTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(financialTransactions).values(transaction);
  return { id: result[0].insertId };
}

export async function updateFinancialTransaction(id: number, transaction: Partial<InsertFinancialTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(financialTransactions).set(transaction).where(eq(financialTransactions.id, id));
}

export async function getFinancialTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(financialTransactions).where(eq(financialTransactions.id, id)).limit(1);
  return result[0];
}

export async function getFinancialTransactions(filters?: {
  type?: 'income' | 'expense';
  status?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.type) conditions.push(eq(financialTransactions.type, filters.type));
  if (filters?.status) conditions.push(eq(financialTransactions.status, filters.status as any));
  if (filters?.category) conditions.push(eq(financialTransactions.category, filters.category));
  if (filters?.startDate) conditions.push(gte(financialTransactions.createdAt, filters.startDate));
  if (filters?.endDate) conditions.push(lte(financialTransactions.createdAt, filters.endDate));
  
  let query = db.select().from(financialTransactions);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(financialTransactions.createdAt));
}

export async function getOverdueTransactions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(financialTransactions)
    .where(and(
      eq(financialTransactions.status, 'pending'),
      lte(financialTransactions.dueDate, new Date())
    ))
    .orderBy(asc(financialTransactions.dueDate));
}

export async function deleteFinancialTransaction(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(financialTransactions).set({ status: 'cancelled' }).where(eq(financialTransactions.id, id));
}

// ==================== DASHBOARD / REPORTS FUNCTIONS ====================
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  
  // Total customers
  const totalCustomers = await db.select({ count: count() }).from(customers).where(eq(customers.isActive, true));
  
  // Total products
  const totalProducts = await db.select({ count: count() }).from(products).where(eq(products.isActive, true));
  
  // Low stock products
  const lowStockCount = await db.select({ count: count() }).from(products)
    .where(and(eq(products.isActive, true), sql`${products.stockQuantity} <= ${products.minStockLevel}`));
  
  // Orders this month
  const monthlyOrders = await db.select({ count: count(), total: sum(orders.total) }).from(orders)
    .where(gte(orders.createdAt, startOfMonth));
  
  // Pending orders
  const pendingOrders = await db.select({ count: count() }).from(orders)
    .where(eq(orders.status, 'pending'));
  
  // Financial summary
  const incomeThisMonth = await db.select({ total: sum(financialTransactions.amount) }).from(financialTransactions)
    .where(and(eq(financialTransactions.type, 'income'), eq(financialTransactions.status, 'paid'), gte(financialTransactions.createdAt, startOfMonth)));
  
  const expensesThisMonth = await db.select({ total: sum(financialTransactions.amount) }).from(financialTransactions)
    .where(and(eq(financialTransactions.type, 'expense'), eq(financialTransactions.status, 'paid'), gte(financialTransactions.createdAt, startOfMonth)));
  
  const pendingReceivables = await db.select({ total: sum(financialTransactions.amount) }).from(financialTransactions)
    .where(and(eq(financialTransactions.type, 'income'), eq(financialTransactions.status, 'pending')));
  
  const pendingPayables = await db.select({ total: sum(financialTransactions.amount) }).from(financialTransactions)
    .where(and(eq(financialTransactions.type, 'expense'), eq(financialTransactions.status, 'pending')));
  
  const overdueCount = await db.select({ count: count() }).from(financialTransactions)
    .where(and(eq(financialTransactions.status, 'pending'), lte(financialTransactions.dueDate, now)));
  
  return {
    totalCustomers: totalCustomers[0]?.count || 0,
    totalProducts: totalProducts[0]?.count || 0,
    lowStockCount: lowStockCount[0]?.count || 0,
    monthlyOrdersCount: monthlyOrders[0]?.count || 0,
    monthlyOrdersTotal: monthlyOrders[0]?.total || '0',
    pendingOrdersCount: pendingOrders[0]?.count || 0,
    incomeThisMonth: incomeThisMonth[0]?.total || '0',
    expensesThisMonth: expensesThisMonth[0]?.total || '0',
    pendingReceivables: pendingReceivables[0]?.total || '0',
    pendingPayables: pendingPayables[0]?.total || '0',
    overdueCount: overdueCount[0]?.count || 0,
  };
}

export async function getSalesReport(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    date: sql<string>`DATE(${orders.createdAt})`,
    orderCount: count(),
    totalSales: sum(orders.total)
  })
  .from(orders)
  .where(and(gte(orders.createdAt, startDate), lte(orders.createdAt, endDate)))
  .groupBy(sql`DATE(${orders.createdAt})`)
  .orderBy(sql`DATE(${orders.createdAt})`);
}

export async function getTopProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    productId: orderItems.productId,
    productName: orderItems.productName,
    totalQuantity: sum(orderItems.quantity),
    totalRevenue: sum(orderItems.totalPrice)
  })
  .from(orderItems)
  .groupBy(orderItems.productId, orderItems.productName)
  .orderBy(desc(sum(orderItems.quantity)))
  .limit(limit);
}

export async function getTopCustomers(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    customerId: orders.customerId,
    orderCount: count(),
    totalSpent: sum(orders.total)
  })
  .from(orders)
  .groupBy(orders.customerId)
  .orderBy(desc(sum(orders.total)))
  .limit(limit);
}

export async function getCashFlow(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    date: sql<string>`DATE(${financialTransactions.paidDate})`,
    type: financialTransactions.type,
    total: sum(financialTransactions.amount)
  })
  .from(financialTransactions)
  .where(and(
    eq(financialTransactions.status, 'paid'),
    gte(financialTransactions.paidDate, startDate),
    lte(financialTransactions.paidDate, endDate)
  ))
  .groupBy(sql`DATE(${financialTransactions.paidDate})`, financialTransactions.type)
  .orderBy(sql`DATE(${financialTransactions.paidDate})`);
}


// ==================== BANK ACCOUNT FUNCTIONS ====================
import { 
  bankAccounts, InsertBankAccount, BankAccount,
  bankTransactions, InsertBankTransaction, BankTransaction,
  pricingRules, InsertPricingRule, PricingRule,
  dreCategories, InsertDreCategory, DreCategory
} from "../drizzle/schema";

export async function createBankAccount(account: InsertBankAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bankAccounts).values(account);
  return { id: result[0].insertId };
}

export async function updateBankAccount(id: number, account: Partial<InsertBankAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bankAccounts).set(account).where(eq(bankAccounts.id, id));
}

export async function getBankAccounts(isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(bankAccounts);
  if (isActive !== undefined) {
    query = query.where(eq(bankAccounts.isActive, isActive)) as typeof query;
  }
  
  return await query.orderBy(asc(bankAccounts.name));
}

export async function getBankAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(bankAccounts).where(eq(bankAccounts.id, id)).limit(1);
  return result[0];
}

export async function deleteBankAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(bankAccounts).set({ isActive: false }).where(eq(bankAccounts.id, id));
}

// ==================== BANK TRANSACTION FUNCTIONS ====================
export async function importBankTransactions(transactions: InsertBankTransaction[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (transactions.length === 0) return { imported: 0 };
  
  await db.insert(bankTransactions).values(transactions);
  return { imported: transactions.length };
}

export async function getBankTransactions(filters?: { 
  bankAccountId?: number; 
  reconciled?: boolean;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [];
  if (filters?.bankAccountId) conditions.push(eq(bankTransactions.bankAccountId, filters.bankAccountId));
  if (filters?.reconciled !== undefined) conditions.push(eq(bankTransactions.reconciled, filters.reconciled));
  if (filters?.startDate) conditions.push(gte(bankTransactions.transactionDate, filters.startDate));
  if (filters?.endDate) conditions.push(lte(bankTransactions.transactionDate, filters.endDate));
  
  let query = db.select().from(bankTransactions);
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(bankTransactions.transactionDate));
}

export async function reconcileBankTransaction(bankTransactionId: number, financialTransactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bankTransactions).set({ 
    reconciled: true, 
    reconciledTransactionId: financialTransactionId 
  }).where(eq(bankTransactions.id, bankTransactionId));
}

export async function unreconcileBankTransaction(bankTransactionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bankTransactions).set({ 
    reconciled: false, 
    reconciledTransactionId: null 
  }).where(eq(bankTransactions.id, bankTransactionId));
}

export async function getUnreconciledTransactions(bankAccountId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(bankTransactions)
    .where(and(
      eq(bankTransactions.bankAccountId, bankAccountId),
      eq(bankTransactions.reconciled, false)
    ))
    .orderBy(desc(bankTransactions.transactionDate));
}

export async function findMatchingFinancialTransactions(amount: string, dateRange: { start: Date; end: Date }) {
  const db = await getDb();
  if (!db) return [];
  
  const absAmount = Math.abs(parseFloat(amount)).toFixed(2);
  
  return await db.select().from(financialTransactions)
    .where(and(
      eq(financialTransactions.amount, absAmount),
      gte(financialTransactions.dueDate, dateRange.start),
      lte(financialTransactions.dueDate, dateRange.end)
    ))
    .orderBy(desc(financialTransactions.dueDate));
}

// ==================== PRICING RULE FUNCTIONS ====================
export async function createPricingRule(rule: InsertPricingRule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(pricingRules).values(rule);
  return { id: result[0].insertId };
}

export async function updatePricingRule(id: number, rule: Partial<InsertPricingRule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pricingRules).set(rule).where(eq(pricingRules.id, id));
}

export async function getPricingRules(isActive?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(pricingRules);
  if (isActive !== undefined) {
    query = query.where(eq(pricingRules.isActive, isActive)) as typeof query;
  }
  
  return await query.orderBy(asc(pricingRules.name));
}

export async function getPricingRuleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pricingRules).where(eq(pricingRules.id, id)).limit(1);
  return result[0];
}

export async function deletePricingRule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(pricingRules).set({ isActive: false }).where(eq(pricingRules.id, id));
}

// ==================== DRE FUNCTIONS ====================
export async function createDreCategory(category: InsertDreCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(dreCategories).values(category);
  return { id: result[0].insertId };
}

export async function getDreCategories() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(dreCategories).where(eq(dreCategories.isActive, true)).orderBy(asc(dreCategories.orderIndex));
}

export async function getDreReport(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { 
    revenue: [], 
    costs: [], 
    expenses: [], 
    taxes: [], 
    summary: {
      totalRevenue: '0',
      totalCogs: '0',
      grossProfit: '0',
      grossMargin: '0',
      totalExpenses: '0',
      operatingProfit: '0',
      operatingMargin: '0',
      netProfit: '0',
      netMargin: '0',
    }
  };
  
  // Get revenue (income from orders)
  const revenueData = await db.select({
    category: financialTransactions.category,
    total: sum(financialTransactions.amount)
  })
  .from(financialTransactions)
  .where(and(
    eq(financialTransactions.type, 'income'),
    eq(financialTransactions.status, 'paid'),
    gte(financialTransactions.paidDate, startDate),
    lte(financialTransactions.paidDate, endDate)
  ))
  .groupBy(financialTransactions.category);
  
  // Get expenses
  const expenseData = await db.select({
    category: financialTransactions.category,
    total: sum(financialTransactions.amount)
  })
  .from(financialTransactions)
  .where(and(
    eq(financialTransactions.type, 'expense'),
    eq(financialTransactions.status, 'paid'),
    gte(financialTransactions.paidDate, startDate),
    lte(financialTransactions.paidDate, endDate)
  ))
  .groupBy(financialTransactions.category);
  
  // Calculate cost of goods sold (from order items)
  const cogsData = await db.select({
    total: sql<string>`SUM(${orderItems.quantity} * ${products.costPrice})`
  })
  .from(orderItems)
  .innerJoin(orders, eq(orderItems.orderId, orders.id))
  .innerJoin(products, eq(orderItems.productId, products.id))
  .where(and(
    eq(orders.paymentStatus, 'paid'),
    gte(orders.createdAt, startDate),
    lte(orders.createdAt, endDate)
  ));
  
  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, r) => sum + parseFloat(r.total || '0'), 0);
  const totalCogs = parseFloat(cogsData[0]?.total || '0');
  const grossProfit = totalRevenue - totalCogs;
  const totalExpenses = expenseData.reduce((sum, e) => sum + parseFloat(e.total || '0'), 0);
  const operatingProfit = grossProfit - totalExpenses;
  const netProfit = operatingProfit; // Simplified, no taxes for now
  
  return {
    revenue: revenueData,
    costs: [{ category: 'Custo dos Produtos Vendidos', total: totalCogs.toFixed(2) }],
    expenses: expenseData,
    taxes: [],
    summary: {
      totalRevenue: totalRevenue.toFixed(2),
      totalCogs: totalCogs.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      grossMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : '0',
      totalExpenses: totalExpenses.toFixed(2),
      operatingProfit: operatingProfit.toFixed(2),
      operatingMargin: totalRevenue > 0 ? ((operatingProfit / totalRevenue) * 100).toFixed(2) : '0',
      netProfit: netProfit.toFixed(2),
      netMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : '0',
    }
  };
}

// ==================== PRICING CALCULATOR ====================
export function calculatePrice(costPrice: number, options: {
  type: 'markup' | 'margin' | 'fixed';
  value: number;
  additionalCosts?: number;
}) {
  const totalCost = costPrice + (options.additionalCosts || 0);
  
  switch (options.type) {
    case 'markup':
      // Markup: price = cost * (1 + markup%)
      return totalCost * (1 + options.value / 100);
    case 'margin':
      // Margin: price = cost / (1 - margin%)
      if (options.value >= 100) throw new Error("Margem não pode ser 100% ou maior");
      return totalCost / (1 - options.value / 100);
    case 'fixed':
      // Fixed profit
      return totalCost + options.value;
    default:
      return totalCost;
  }
}

export function calculateMarginFromPrice(costPrice: number, sellingPrice: number) {
  if (sellingPrice <= 0) return { margin: 0, markup: 0, profit: 0 };
  const profit = sellingPrice - costPrice;
  const margin = (profit / sellingPrice) * 100;
  const markup = costPrice > 0 ? (profit / costPrice) * 100 : 0;
  return { margin, markup, profit };
}
