import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";

// Admin procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a administradores' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== USERS ====================
  users: router({
    list: adminProcedure.query(async () => {
      return await db.getAllUsers();
    }),
  }),

  // ==================== AUDIT LOGS ====================
  audit: router({
    list: adminProcedure.input(z.object({
      userId: z.number().optional(),
      entity: z.string().optional(),
      limit: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getAuditLogs(input);
    }),
  }),

  // ==================== CATEGORIES ====================
  categories: router({
    list: protectedProcedure.input(z.object({
      isActive: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getCategories(input?.isActive);
    }),
    
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.createCategory(input);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entity: 'category',
        entityId: result.id,
        details: JSON.stringify(input),
      });
      return result;
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateCategory(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entity: 'category',
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteCategory(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entity: 'category',
        entityId: input.id,
      });
      return { success: true };
    }),
  }),

  // ==================== CUSTOMERS ====================
  customers: router({
    list: protectedProcedure.input(z.object({
      search: z.string().optional(),
      isActive: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getCustomers(input);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getCustomerById(input.id);
    }),
    
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      document: z.string().optional().nullable(),
      documentType: z.enum(['cpf', 'cnpj']).optional().nullable(),
      address: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      zipCode: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.createCustomer({ ...input, createdBy: ctx.user.id });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entity: 'customer',
        entityId: result.id,
        details: JSON.stringify(input),
      });
      return result;
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      document: z.string().optional().nullable(),
      documentType: z.enum(['cpf', 'cnpj']).optional().nullable(),
      address: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      zipCode: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateCustomer(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entity: 'customer',
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteCustomer(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entity: 'customer',
        entityId: input.id,
      });
      return { success: true };
    }),
  }),

  // ==================== PRODUCTS ====================
  products: router({
    list: protectedProcedure.input(z.object({
      search: z.string().optional(),
      categoryId: z.number().optional(),
      isActive: z.boolean().optional(),
      lowStock: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getProducts(input);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getProductById(input.id);
    }),
    
    getLowStock: protectedProcedure.query(async () => {
      return await db.getLowStockProducts();
    }),
    
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      description: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      price: z.string(),
      costPrice: z.string().optional().nullable(),
      stockQuantity: z.number().default(0),
      minStockLevel: z.number().default(5),
      categoryId: z.number().optional().nullable(),
      unit: z.string().default('un'),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.createProduct({ ...input, createdBy: ctx.user.id });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entity: 'product',
        entityId: result.id,
        details: JSON.stringify(input),
      });
      return result;
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional().nullable(),
      sku: z.string().optional().nullable(),
      price: z.string().optional(),
      costPrice: z.string().optional().nullable(),
      stockQuantity: z.number().optional(),
      minStockLevel: z.number().optional(),
      categoryId: z.number().optional().nullable(),
      unit: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateProduct(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entity: 'product',
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteProduct(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entity: 'product',
        entityId: input.id,
      });
      return { success: true };
    }),
    
    adjustStock: protectedProcedure.input(z.object({
      productId: z.number(),
      type: z.enum(['in', 'out', 'adjustment']),
      quantity: z.number(),
      reason: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.createStockMovement({
        ...input,
        createdBy: ctx.user.id,
        previousStock: 0,
        newStock: 0,
      });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'stock_adjustment',
        entity: 'product',
        entityId: input.productId,
        details: JSON.stringify(input),
      });
      
      // Check for low stock and notify
      const product = await db.getProductById(input.productId);
      if (product && product.stockQuantity <= product.minStockLevel) {
        await notifyOwner({
          title: '⚠️ Alerta de Estoque Baixo',
          content: `O produto "${product.name}" está com estoque baixo: ${product.stockQuantity} unidades (mínimo: ${product.minStockLevel})`,
        });
      }
      
      return result;
    }),
    
    getStockMovements: protectedProcedure.input(z.object({
      productId: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getStockMovements(input?.productId);
    }),
  }),

  // ==================== ORDERS ====================
  orders: router({
    list: protectedProcedure.input(z.object({
      customerId: z.number().optional(),
      status: z.string().optional(),
      paymentStatus: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      search: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getOrders(input);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getOrderById(input.id);
    }),
    
    create: protectedProcedure.input(z.object({
      customerId: z.number(),
      items: z.array(z.object({
        productId: z.number(),
        productName: z.string(),
        quantity: z.number(),
        unitPrice: z.string(),
        totalPrice: z.string(),
      })),
      subtotal: z.string(),
      discount: z.string().optional(),
      tax: z.string().optional(),
      total: z.string(),
      notes: z.string().optional().nullable(),
      shippingAddress: z.string().optional().nullable(),
      paymentMethod: z.string().optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const { items, ...orderData } = input;
      const result = await db.createOrder(
        { ...orderData, createdBy: ctx.user.id },
        items
      );
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entity: 'order',
        entityId: result.id,
        details: JSON.stringify(input),
      });
      
      // Create financial transaction for the order
      const customer = await db.getCustomerById(input.customerId);
      await db.createFinancialTransaction({
        type: 'income',
        category: 'Vendas',
        description: `Pedido ${result.orderNumber} - ${customer?.name}`,
        amount: input.total,
        status: 'pending',
        orderId: result.id,
        customerId: input.customerId,
        createdBy: ctx.user.id,
      });
      
      // Notify owner about new order
      await notifyOwner({
        title: '🛒 Novo Pedido Recebido',
        content: `Pedido ${result.orderNumber} criado para ${customer?.name}. Total: R$ ${input.total}`,
      });
      
      return result;
    }),
    
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
    })).mutation(async ({ ctx, input }) => {
      await db.updateOrder(input.id, { status: input.status });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update_status',
        entity: 'order',
        entityId: input.id,
        details: JSON.stringify({ status: input.status }),
      });
      return { success: true };
    }),
    
    updatePaymentStatus: protectedProcedure.input(z.object({
      id: z.number(),
      paymentStatus: z.enum(['pending', 'paid', 'partial', 'refunded']),
      paymentMethod: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateOrder(id, data);
      
      // Update related financial transaction
      const order = await db.getOrderById(id);
      if (order && input.paymentStatus === 'paid') {
        const transactions = await db.getFinancialTransactions({ type: 'income' });
        const orderTransaction = transactions.find(t => t.orderId === id);
        if (orderTransaction) {
          await db.updateFinancialTransaction(orderTransaction.id, {
            status: 'paid',
            paidDate: new Date(),
            paymentMethod: input.paymentMethod,
          });
        }
      }
      
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update_payment',
        entity: 'order',
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
  }),

  // ==================== FINANCIAL ====================
  financial: router({
    list: protectedProcedure.input(z.object({
      type: z.enum(['income', 'expense']).optional(),
      status: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      category: z.string().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getFinancialTransactions(input);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getFinancialTransactionById(input.id);
    }),
    
    getOverdue: protectedProcedure.query(async () => {
      return await db.getOverdueTransactions();
    }),
    
    create: protectedProcedure.input(z.object({
      type: z.enum(['income', 'expense']),
      category: z.string(),
      description: z.string().optional().nullable(),
      amount: z.string(),
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
      dueDate: z.date().optional().nullable(),
      paidDate: z.date().optional().nullable(),
      customerId: z.number().optional().nullable(),
      paymentMethod: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.createFinancialTransaction({ ...input, createdBy: ctx.user.id });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entity: 'financial_transaction',
        entityId: result.id,
        details: JSON.stringify(input),
      });
      return result;
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      type: z.enum(['income', 'expense']).optional(),
      category: z.string().optional(),
      description: z.string().optional().nullable(),
      amount: z.string().optional(),
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
      dueDate: z.date().optional().nullable(),
      paidDate: z.date().optional().nullable(),
      paymentMethod: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateFinancialTransaction(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entity: 'financial_transaction',
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
    
    markAsPaid: protectedProcedure.input(z.object({
      id: z.number(),
      paymentMethod: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateFinancialTransaction(input.id, {
        status: 'paid',
        paidDate: new Date(),
        paymentMethod: input.paymentMethod,
      });
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'mark_paid',
        entity: 'financial_transaction',
        entityId: input.id,
      });
      return { success: true };
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteFinancialTransaction(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entity: 'financial_transaction',
        entityId: input.id,
      });
      return { success: true };
    }),
  }),

  // ==================== DASHBOARD / REPORTS ====================
  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
    
    salesReport: protectedProcedure.input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    })).query(async ({ input }) => {
      return await db.getSalesReport(input.startDate, input.endDate);
    }),
    
    topProducts: protectedProcedure.input(z.object({
      limit: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getTopProducts(input?.limit);
    }),
    
    topCustomers: protectedProcedure.input(z.object({
      limit: z.number().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getTopCustomers(input?.limit);
    }),
    
    cashFlow: protectedProcedure.input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    })).query(async ({ input }) => {
      return await db.getCashFlow(input.startDate, input.endDate);
    }),
  }),

  // ==================== AI INSIGHTS ====================
  insights: router({
    generate: protectedProcedure.query(async () => {
      const stats = await db.getDashboardStats();
      const topProducts = await db.getTopProducts(5);
      const topCustomers = await db.getTopCustomers(5);
      const lowStock = await db.getLowStockProducts();
      
      const balance = parseFloat(stats?.incomeThisMonth || '0') - parseFloat(stats?.expensesThisMonth || '0');
      
      const prompt = `Você é um consultor de negócios. Analise os dados abaixo e retorne um JSON válido com a estrutura especificada.

DADOS DA EMPRESA:
- Clientes ativos: ${stats?.totalCustomers || 0}
- Produtos ativos: ${stats?.totalProducts || 0}
- Produtos com estoque baixo: ${stats?.lowStockCount || 0}
- Pedidos do mês: ${stats?.monthlyOrdersCount || 0}
- Total vendas do mês: R$ ${stats?.monthlyOrdersTotal || 0}
- Pedidos pendentes: ${stats?.pendingOrdersCount || 0}
- Receita do mês: R$ ${stats?.incomeThisMonth || 0}
- Despesas do mês: R$ ${stats?.expensesThisMonth || 0}
- Balanço: R$ ${balance.toFixed(2)}
- Contas vencidas: ${stats?.overdueCount || 0}
- A receber: R$ ${stats?.pendingReceivables || 0}
- A pagar: R$ ${stats?.pendingPayables || 0}

Top produtos:
${topProducts.map((p, i) => `${i + 1}. ${p.productName}: ${p.totalQuantity} un - R$ ${p.totalRevenue}`).join('\n')}

Retorne APENAS um JSON válido (sem markdown) com esta estrutura:
{
  "summary": "Análise geral do negócio em 2-3 parágrafos",
  "insights": [
    {"type": "opportunity|warning|suggestion|goal", "title": "Título curto", "description": "Descrição detalhada"}
  ],
  "recommendations": [
    {"action": "Ação recomendada", "impact": "Impacto esperado"}
  ],
  "metrics": [
    {"name": "Nome da métrica", "value": "Valor formatado", "trend": "up|down|neutral", "change": "Variação"}
  ]
}`;
      
      try {
        const response = await invokeLLM({
          messages: [
            { role: 'system', content: 'Você é um consultor de negócios. Responda APENAS com JSON válido, sem markdown ou texto adicional.' },
            { role: 'user', content: prompt },
          ],
        });
        
        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === 'string' ? rawContent : '{}';
        // Try to parse JSON, handle potential markdown wrapping
        let jsonStr = content;
        if (content.includes('```')) {
          const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (match) jsonStr = match[1];
        }
        
        try {
          const parsed = JSON.parse(jsonStr.trim());
          return {
            summary: parsed.summary || 'Análise não disponível',
            insights: parsed.insights || [],
            recommendations: parsed.recommendations || [],
            metrics: parsed.metrics || [],
          };
        } catch {
          return {
            summary: content,
            insights: [],
            recommendations: [],
            metrics: [],
          };
        }
      } catch (error) {
        console.error('Error generating insights:', error);
        return {
          summary: 'Erro ao gerar insights. Tente novamente mais tarde.',
          insights: [],
          recommendations: [],
          metrics: [],
        };
      }
    }),
  }),

  // ==================== NOTIFICATIONS ====================
  notifications: router({
    checkOverdue: adminProcedure.mutation(async () => {
      const overdueTransactions = await db.getOverdueTransactions();
      
      if (overdueTransactions.length > 0) {
        const totalOverdue = overdueTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        await notifyOwner({
          title: '⚠️ Contas Vencidas',
          content: `Você tem ${overdueTransactions.length} conta(s) vencida(s) totalizando R$ ${totalOverdue.toFixed(2)}`,
        });
      }
      
      return { count: overdueTransactions.length };
    }),
    
    checkLowStock: adminProcedure.mutation(async () => {
      const lowStockProducts = await db.getLowStockProducts();
      
      if (lowStockProducts.length > 0) {
        await notifyOwner({
          title: '📦 Alerta de Estoque Baixo',
          content: `${lowStockProducts.length} produto(s) com estoque baixo:\n${lowStockProducts.slice(0, 5).map(p => `- ${p.name}: ${p.stockQuantity} un`).join('\n')}`,
        });
      }
      
      return { count: lowStockProducts.length };
    }),
  }),

  // ==================== BANK ACCOUNTS ====================
  bankAccounts: router({
    list: protectedProcedure.input(z.object({
      isActive: z.boolean().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getBankAccounts(input?.isActive);
    }),
    
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return await db.getBankAccountById(input.id);
    }),
    
    create: protectedProcedure.input(z.object({
      name: z.string().min(1),
      bankName: z.string().optional().nullable(),
      accountNumber: z.string().optional().nullable(),
      agency: z.string().optional().nullable(),
      accountType: z.enum(['checking', 'savings', 'investment']).optional(),
      initialBalance: z.string().optional(),
      currentBalance: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      const result = await db.createBankAccount(input);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'create',
        entity: 'bank_account',
        entityId: result.id,
        details: JSON.stringify(input),
      });
      return result;
    }),
    
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      bankName: z.string().optional().nullable(),
      accountNumber: z.string().optional().nullable(),
      agency: z.string().optional().nullable(),
      accountType: z.enum(['checking', 'savings', 'investment']).optional(),
      currentBalance: z.string().optional(),
      isActive: z.boolean().optional(),
    })).mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await db.updateBankAccount(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'update',
        entity: 'bank_account',
        entityId: id,
        details: JSON.stringify(data),
      });
      return { success: true };
    }),
    
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      await db.deleteBankAccount(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'delete',
        entity: 'bank_account',
        entityId: input.id,
      });
      return { success: true };
    }),
  }),

  // ==================== BANK TRANSACTIONS ====================
  bankTransactions: router({
    list: protectedProcedure.input(z.object({
      bankAccountId: z.number().optional(),
      reconciled: z.boolean().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional()).query(async ({ input }) => {
      return await db.getBankTransactions(input);
    }),
    
    getUnreconciled: protectedProcedure.input(z.object({
      bankAccountId: z.number(),
    })).query(async ({ input }) => {
      return await db.getUnreconciledTransactions(input.bankAccountId);
    }),
    
    import: protectedProcedure.input(z.object({
      bankAccountId: z.number(),
      transactions: z.array(z.object({
        transactionDate: z.date(),
        description: z.string().optional().nullable(),
        amount: z.string(),
        type: z.enum(['credit', 'debit']),
        balance: z.string().optional().nullable(),
        externalId: z.string().optional().nullable(),
      })),
      importBatchId: z.string(),
    })).mutation(async ({ ctx, input }) => {
      const transactions = input.transactions.map(t => ({
        ...t,
        bankAccountId: input.bankAccountId,
        importBatchId: input.importBatchId,
      }));
      const result = await db.importBankTransactions(transactions);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'import',
        entity: 'bank_transaction',
        details: `Importadas ${result.imported} transações`,
      });
      return result;
    }),
    
    reconcile: protectedProcedure.input(z.object({
      bankTransactionId: z.number(),
      financialTransactionId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      await db.reconcileBankTransaction(input.bankTransactionId, input.financialTransactionId);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'reconcile',
        entity: 'bank_transaction',
        entityId: input.bankTransactionId,
        details: `Conciliado com transação financeira ${input.financialTransactionId}`,
      });
      return { success: true };
    }),
    
    unreconcile: protectedProcedure.input(z.object({
      bankTransactionId: z.number(),
    })).mutation(async ({ ctx, input }) => {
      await db.unreconcileBankTransaction(input.bankTransactionId);
      await db.createAuditLog({
        userId: ctx.user.id,
        action: 'unreconcile',
        entity: 'bank_transaction',
        entityId: input.bankTransactionId,
      });
      return { success: true };
    }),
    
    findMatches: protectedProcedure.input(z.object({
      amount: z.string(),
      dateRange: z.object({
        start: z.date(),
        end: z.date(),
      }),
    })).query(async ({ input }) => {
      return await db.findMatchingFinancialTransactions(input.amount, input.dateRange);
    }),
  }),

  // ==================== PRICING ====================
  pricing: router({
    rules: router({
      list: protectedProcedure.input(z.object({
        isActive: z.boolean().optional(),
      }).optional()).query(async ({ input }) => {
        return await db.getPricingRules(input?.isActive);
      }),
      
      create: protectedProcedure.input(z.object({
        name: z.string().min(1),
        description: z.string().optional().nullable(),
        type: z.enum(['markup', 'margin', 'fixed']),
        value: z.string(),
        categoryId: z.number().optional().nullable(),
      })).mutation(async ({ ctx, input }) => {
        const result = await db.createPricingRule(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'create',
          entity: 'pricing_rule',
          entityId: result.id,
          details: JSON.stringify(input),
        });
        return result;
      }),
      
      update: protectedProcedure.input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        type: z.enum(['markup', 'margin', 'fixed']).optional(),
        value: z.string().optional(),
        categoryId: z.number().optional().nullable(),
        isActive: z.boolean().optional(),
      })).mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updatePricingRule(id, data);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'update',
          entity: 'pricing_rule',
          entityId: id,
          details: JSON.stringify(data),
        });
        return { success: true };
      }),
      
      delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
        await db.deletePricingRule(input.id);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'delete',
          entity: 'pricing_rule',
          entityId: input.id,
        });
        return { success: true };
      }),
    }),
    
    calculate: protectedProcedure.input(z.object({
      costPrice: z.number(),
      type: z.enum(['markup', 'margin', 'fixed']),
      value: z.number(),
      additionalCosts: z.number().optional(),
    })).query(({ input }) => {
      try {
        const price = db.calculatePrice(input.costPrice, {
          type: input.type,
          value: input.value,
          additionalCosts: input.additionalCosts,
        });
        const analysis = db.calculateMarginFromPrice(input.costPrice + (input.additionalCosts || 0), price);
        return {
          suggestedPrice: price,
          margin: analysis.margin,
          markup: analysis.markup,
          profit: analysis.profit,
        };
      } catch (error: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      }
    }),
    
    analyzePrice: protectedProcedure.input(z.object({
      costPrice: z.number(),
      sellingPrice: z.number(),
    })).query(({ input }) => {
      return db.calculateMarginFromPrice(input.costPrice, input.sellingPrice);
    }),
  }),

  // ==================== DRE ====================
  dre: router({
    report: protectedProcedure.input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    })).query(async ({ input }) => {
      return await db.getDreReport(input.startDate, input.endDate);
    }),
    
    categories: router({
      list: protectedProcedure.query(async () => {
        return await db.getDreCategories();
      }),
      
      create: adminProcedure.input(z.object({
        name: z.string().min(1),
        type: z.enum(['revenue', 'cost', 'expense', 'tax']),
        parentId: z.number().optional().nullable(),
        orderIndex: z.number().optional(),
      })).mutation(async ({ ctx, input }) => {
        const result = await db.createDreCategory(input);
        await db.createAuditLog({
          userId: ctx.user.id,
          action: 'create',
          entity: 'dre_category',
          entityId: result.id,
          details: JSON.stringify(input),
        });
        return result;
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
