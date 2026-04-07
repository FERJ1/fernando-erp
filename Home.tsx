import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import {
  Users, Package, ShoppingCart, DollarSign,
  TrendingUp, TrendingDown, AlertTriangle, Clock,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { useLocation } from "wouter";

// ─── Helpers ────────────────────────────────────────────────────────────────

function StatCard({
  title, value, description, icon: Icon, trend, trendValue, variant = "default", onClick,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
  onClick?: () => void;
}) {
  const border = { default: "border-l-primary", success: "border-l-green-500", warning: "border-l-amber-500", danger: "border-l-red-500" }[variant];
  const icon   = { default: "bg-primary/10 text-primary", success: "bg-green-500/10 text-green-600", warning: "bg-amber-500/10 text-amber-600", danger: "bg-red-500/10 text-red-600" }[variant];

  return (
    <Card className={`border-l-4 ${border} ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonGrid({ cols = 4, rows = 1 }: { cols?: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: cols * rows }).map((_, i) => (
        <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
      ))}
    </>
  );
}

// ─── Conteúdo do Dashboard ──────────────────────────────────────────────────

function DashboardContent() {
  const [, nav] = useLocation();

  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: topProducts }     = trpc.dashboard.topProducts.useQuery({ limit: 5 });
  const { data: topCustomers }    = trpc.dashboard.topCustomers.useQuery({ limit: 5 });
  const { data: lowStock }        = trpc.products.getLowStock.useQuery();

  // FIX: busca todos os clientes para resolver o nome a partir do ID
  // (topCustomers retorna apenas customerId, não o nome)
  const { data: allCustomers } = trpc.customers.list.useQuery({ isActive: true });
  const customerMap = new Map(allCustomers?.map(c => [c.id, c.name]) ?? []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><SkeletonGrid cols={4} /></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><SkeletonGrid cols={4} /></div>
      </div>
    );
  }

  const balance = (parseFloat(stats?.incomeThisMonth ?? "0")) - (parseFloat(stats?.expensesThisMonth ?? "0"));
  const hasLowStock = Number(stats?.lowStockCount) > 0;
  const hasOverdue  = Number(stats?.overdueCount)  > 0;
  const hasPending  = Number(stats?.pendingOrdersCount) > 0;

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <Button onClick={() => nav("/insights")} variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" /> Ver Insights IA
        </Button>
      </div>

      {/* KPIs operacionais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Clientes ativos"   value={fmt.number(stats?.totalCustomers)} description="Cadastros ativos" icon={Users} onClick={() => nav("/clientes")} />
        <StatCard title="Produtos ativos"   value={fmt.number(stats?.totalProducts)}  description={hasLowStock ? `${stats?.lowStockCount} com estoque baixo` : "Todos com estoque ok"} icon={Package} variant={hasLowStock ? "warning" : "default"} onClick={() => nav("/produtos")} />
        <StatCard title="Pedidos do mês"    value={fmt.number(stats?.monthlyOrdersCount)} description={fmt.currency(stats?.monthlyOrdersTotal)} icon={ShoppingCart} variant="success" onClick={() => nav("/pedidos")} />
        <StatCard title="Pedidos pendentes" value={fmt.number(stats?.pendingOrdersCount)} description="Aguardando processamento" icon={Clock} variant={hasPending ? "warning" : "default"} onClick={() => nav("/pedidos")} />
      </div>

      {/* KPIs financeiros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Receita do mês"   value={fmt.currency(stats?.incomeThisMonth)}    icon={TrendingUp}   variant="success" onClick={() => nav("/financeiro")} />
        <StatCard title="Despesas do mês"  value={fmt.currency(stats?.expensesThisMonth)}  icon={TrendingDown} variant="danger"  onClick={() => nav("/financeiro")} />
        <StatCard title="Balanço do mês"   value={fmt.currency(balance)}                   icon={DollarSign}   variant={balance >= 0 ? "success" : "danger"} onClick={() => nav("/financeiro")} />
        <StatCard title="Contas vencidas"  value={fmt.number(stats?.overdueCount)}          description="Requerem atenção" icon={AlertTriangle} variant={hasOverdue ? "danger" : "default"} onClick={() => nav("/financeiro")} />
      </div>

      {/* Contas a receber / a pagar */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contas a Receber</CardTitle>
            <CardDescription>Valores pendentes de recebimento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{fmt.currency(stats?.pendingReceivables)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Contas a Pagar</CardTitle>
            <CardDescription>Valores pendentes de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{fmt.currency(stats?.pendingPayables)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Listas */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Top produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos mais vendidos</CardTitle>
            <CardDescription>Top 5 por quantidade</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                      <span className="text-sm font-medium truncate max-w-[140px]">{p.productName}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{p.totalQuantity} un</p>
                      <p className="text-xs text-muted-foreground">{fmt.currency(p.totalRevenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhuma venda registrada</p>
            )}
          </CardContent>
        </Card>

        {/* Top clientes — FIX: mostra nome real em vez de "Cliente #ID" */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Melhores clientes</CardTitle>
            <CardDescription>Top 5 por valor gasto</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers && topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((c, i) => (
                  <div key={c.customerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{i + 1}</span>
                      <span className="text-sm font-medium truncate max-w-[140px]">
                        {/* FIX: resolve o nome real do cliente pelo mapa */}
                        {customerMap.get(c.customerId) ?? `Cliente #${c.customerId}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{c.orderCount} pedidos</p>
                      <p className="text-xs text-muted-foreground">{fmt.currency(c.totalSpent)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Nenhum cliente com pedidos</p>
            )}
          </CardContent>
        </Card>

        {/* Alertas de estoque */}
        <Card className={lowStock && lowStock.length > 0 ? "border-amber-500/40" : ""}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {lowStock && lowStock.length > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
              Alertas de estoque
            </CardTitle>
            <CardDescription>Produtos abaixo do mínimo</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStock && lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[170px]">{p.name}</span>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${p.stockQuantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                        {p.stockQuantity} un
                      </p>
                      <p className="text-xs text-muted-foreground">Mín: {p.minStockLevel}</p>
                    </div>
                  </div>
                ))}
                {lowStock.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => nav("/produtos?lowStock=true")}>
                    Ver todos ({lowStock.length})
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">Todos os estoques ok</p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

export default function Home() {
  return <DashboardLayout><DashboardContent /></DashboardLayout>;
}
