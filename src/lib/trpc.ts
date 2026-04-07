/**
 * Mock tRPC client — simula chamadas ao backend com dados locais
 * Em producao, substituir por tRPC real apontando para o servidor
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  mockUsers, mockCustomers, mockProducts, mockCategories, mockOrders,
  mockAuditLogs, mockTransactions,
  getDashboardStats, getTopProducts, getTopCustomers, getSalesReport, getCashFlow,
  createTransaction, updateTransaction, deleteTransaction, markTransactionPaid,
  createCategory, updateCategory, deleteCategory,
  createCustomer, updateCustomer, deleteCustomer,
  createProduct, updateProduct, deleteProduct, adjustStock,
  createOrder, updateOrderStatus, updateOrderPayment,
} from "./mockData";

const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

function useQuery<T>(fetcher: () => T | Promise<T>) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    delay(400).then(() => {
      if (!cancelled) {
        const result = fetcherRef.current();
        if (result instanceof Promise) {
          result.then(r => { if (!cancelled) { setData(r); setIsLoading(false); } });
        } else { setData(result); setIsLoading(false); }
      }
    });
    return () => { cancelled = true; };
  }, [version]);

  return { data, isLoading, refetch: () => setVersion(v => v + 1) };
}

const invalidationCallbacks: Record<string, (() => void)[]> = {};
function registerInvalidation(key: string, cb: () => void) {
  if (!invalidationCallbacks[key]) invalidationCallbacks[key] = [];
  invalidationCallbacks[key].push(cb);
}
function invalidate(key: string) {
  invalidationCallbacks[key]?.forEach(cb => cb());
}

function useMutation<TInput, TOutput>(
  mutator: (input: TInput) => TOutput,
  options?: { onSuccess?: () => void; onError?: (e: Error) => void }
) {
  const [isPending, setIsPending] = useState(false);
  const mutate = useCallback(async (input: TInput) => {
    setIsPending(true);
    try {
      await delay(300);
      mutator(input);
      options?.onSuccess?.();
    } catch (e: any) {
      options?.onError?.(e);
    } finally {
      setIsPending(false);
    }
  }, []);
  return { mutate, isPending };
}

function useInvalidatingQuery<T>(key: string, fetcher: () => T) {
  const q = useQuery(fetcher);
  useEffect(() => {
    registerInvalidation(key, q.refetch);
    return () => {
      const arr = invalidationCallbacks[key];
      if (arr) { const idx = arr.indexOf(q.refetch); if (idx >= 0) arr.splice(idx, 1); }
    };
  }, [q.refetch]);
  return q;
}

export const trpc = {
  useUtils: () => ({
    financial: { list: { invalidate: () => invalidate("financial.list") } },
    dashboard: { stats: { invalidate: () => invalidate("dashboard.stats") } },
    customers: { list: { invalidate: () => invalidate("customers.list") } },
    categories: { list: { invalidate: () => invalidate("categories.list") } },
    products: {
      list: { invalidate: () => invalidate("products.list") },
      getLowStock: { invalidate: () => invalidate("products.lowStock") },
    },
    orders: {
      list: { invalidate: () => invalidate("orders.list") },
      getById: { invalidate: () => invalidate("orders.detail") },
    },
  }),

  users: {
    list: { useQuery: () => useQuery(() => mockUsers) },
  },

  // ─── Categories ─────────────────────────────────────────────────────────
  categories: {
    list: {
      useQuery: (_params?: any) => useInvalidatingQuery("categories.list", () => {
        let cats = [...mockCategories];
        if (_params?.isActive !== undefined) cats = cats.filter(c => c.isActive === _params.isActive);
        return cats;
      }),
    },
    create: { useMutation: (opts?: any) => useMutation((input: any) => createCategory(input), opts) },
    update: { useMutation: (opts?: any) => useMutation((input: any) => updateCategory(input), opts) },
    delete: { useMutation: (opts?: any) => useMutation((input: any) => deleteCategory(input.id), opts) },
  },

  // ─── Customers ──────────────────────────────────────────────────────────
  customers: {
    list: {
      useQuery: (_params?: any) => useInvalidatingQuery("customers.list", () => {
        let custs = [...mockCustomers];
        if (_params?.isActive !== undefined) custs = custs.filter(c => c.isActive === _params.isActive);
        if (_params?.search) {
          const q = _params.search.toLowerCase();
          custs = custs.filter(c => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q));
        }
        return custs;
      }),
    },
    create: { useMutation: (opts?: any) => useMutation((input: any) => createCustomer(input), opts) },
    update: { useMutation: (opts?: any) => useMutation((input: any) => updateCustomer(input), opts) },
    delete: { useMutation: (opts?: any) => useMutation((input: any) => deleteCustomer(input.id), opts) },
  },

  // ─── Products ───────────────────────────────────────────────────────────
  products: {
    list: {
      useQuery: (_params?: any) => useInvalidatingQuery("products.list", () => {
        let prods = [...mockProducts];
        if (_params?.isActive !== undefined) prods = prods.filter(p => p.isActive !== false);
        if (_params?.search) {
          const q = _params.search.toLowerCase();
          prods = prods.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
        }
        if (_params?.lowStock) prods = prods.filter(p => p.stockQuantity <= p.minStockLevel);
        if (_params?.categoryId) prods = prods.filter(p => p.categoryId === _params.categoryId);
        return prods;
      }),
    },
    getLowStock: {
      useQuery: () => useInvalidatingQuery("products.lowStock", () =>
        mockProducts.filter(p => p.stockQuantity <= p.minStockLevel)
      ),
    },
    create: { useMutation: (opts?: any) => useMutation((input: any) => createProduct(input), opts) },
    update: { useMutation: (opts?: any) => useMutation((input: any) => updateProduct(input), opts) },
    delete: { useMutation: (opts?: any) => useMutation((input: any) => deleteProduct(input.id), opts) },
    adjustStock: { useMutation: (opts?: any) => useMutation((input: any) => adjustStock(input.productId, input.quantity), opts) },
  },

  // ─── Orders ─────────────────────────────────────────────────────────────
  orders: {
    list: {
      useQuery: (_params?: any) => useInvalidatingQuery("orders.list", () => {
        let ords = [...mockOrders];
        if (_params?.status && _params.status !== "all") ords = ords.filter(o => o.status === _params.status);
        if (_params?.search) {
          const q = _params.search.toLowerCase();
          ords = ords.filter(o => o.orderNumber.toLowerCase().includes(q));
        }
        return ords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }),
    },
    getById: {
      useQuery: (params: { id: number }, opts?: any) => useQuery(() => {
        if (!opts?.enabled && opts?.enabled !== undefined) return null;
        const order = mockOrders.find(o => o.id === params.id);
        if (!order) return null;
        const customer = mockCustomers.find(c => c.id === order.customerId);
        return { ...order, customer };
      }),
    },
    create: { useMutation: (opts?: any) => useMutation((input: any) => createOrder(input), opts) },
    updateStatus: { useMutation: (opts?: any) => useMutation((input: any) => updateOrderStatus(input.id, input.status), opts) },
    updatePaymentStatus: { useMutation: (opts?: any) => useMutation((input: any) => updateOrderPayment(input.id, input.paymentStatus), opts) },
  },

  // ─── Audit ──────────────────────────────────────────────────────────────
  audit: {
    list: {
      useQuery: (params?: { entity?: string; limit?: number }) => useQuery(() => {
        let logs = [...mockAuditLogs];
        if (params?.entity) logs = logs.filter(l => l.entity === params.entity);
        return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, params?.limit ?? 200);
      }),
    },
  },

  // ─── Financial ──────────────────────────────────────────────────────────
  financial: {
    list: {
      useQuery: (params?: { type?: string; status?: string }) =>
        useInvalidatingQuery("financial.list", () => {
          let txs = [...mockTransactions];
          if (params?.type) txs = txs.filter(t => t.type === params.type);
          if (params?.status) txs = txs.filter(t => t.status === params.status);
          return txs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }),
    },
    getOverdue: { useQuery: () => useQuery(() => mockTransactions.filter(t => t.status === "overdue")) },
    create: { useMutation: (opts?: any) => useMutation((input: any) => createTransaction(input), opts) },
    update: { useMutation: (opts?: any) => useMutation((input: any) => updateTransaction(input), opts) },
    delete: { useMutation: (opts?: any) => useMutation((input: any) => deleteTransaction(input.id), opts) },
    markAsPaid: { useMutation: (opts?: any) => useMutation((input: any) => markTransactionPaid(input.id), opts) },
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────
  dashboard: {
    stats: { useQuery: () => useInvalidatingQuery("dashboard.stats", () => getDashboardStats()) },
    topProducts: { useQuery: (_params?: { limit?: number }) => useQuery(() => getTopProducts().slice(0, _params?.limit ?? 5)) },
    topCustomers: { useQuery: (_params?: { limit?: number }) => useQuery(() => getTopCustomers().slice(0, _params?.limit ?? 5)) },
    salesReport: { useQuery: (p: { startDate: Date; endDate: Date }) => useQuery(() => getSalesReport(p.startDate, p.endDate)) },
    cashFlow: { useQuery: (p: { startDate: Date; endDate: Date }) => useQuery(() => getCashFlow(p.startDate, p.endDate)) },
  },

  // ─── Insights (mock) ───────────────────────────────────────────────────
  insights: {
    generate: {
      useQuery: (_?: any, _opts?: any) => useQuery(() => ({
        summary: "Sua confeccao textil apresenta um bom ritmo de vendas com destaque para camisetas personalizadas e guardanapos para eventos. O faturamento esta em linha com o esperado, mas existem oportunidades de otimizacao no controle de estoque e na diversificacao da carteira de clientes. A margem de lucro nos produtos texteis esta saudavel, especialmente nos itens personalizados onde o valor agregado e maior.",
        insights: [
          { type: "opportunity", title: "Camisetas personalizadas em alta", description: "As camisetas representam 45% do faturamento. Considere ampliar a grade de tamanhos e cores para atender mais demanda." },
          { type: "warning", title: "Estoque de guardanapos baixo", description: "3 produtos da categoria Guardanapos estao com estoque proximo do minimo. Reposicao urgente recomendada." },
          { type: "suggestion", title: "Eventos corporativos", description: "Restaurantes e buffets sao seus maiores clientes de guardanapos. Crie pacotes para eventos com desconto progressivo." },
          { type: "goal", title: "Meta de faturamento", description: "Voce esta a 23% de atingir a meta mensal. Foque em pedidos de grande volume para acelerar." },
        ],
        recommendations: [
          { action: "Criar combo camiseta + avental para restaurantes", impact: "Aumento de 15-20% no ticket medio" },
          { action: "Implementar programa de fidelidade para clientes recorrentes", impact: "Retencao de 30% mais clientes" },
          { action: "Investir em sublimacao digital para designs complexos", impact: "Margem 25% maior em produtos premium" },
        ],
        metrics: [
          { name: "Ticket Medio", value: "R$ 1.850", trend: "up" as const, change: "+12% vs mes anterior" },
          { name: "Taxa de Recompra", value: "68%", trend: "up" as const, change: "+5% vs mes anterior" },
          { name: "Prazo Medio Entrega", value: "4.2 dias", trend: "down" as const, change: "-0.8 dias" },
        ],
      })),
    },
  },
};
