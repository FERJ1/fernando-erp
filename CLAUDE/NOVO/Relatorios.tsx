import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";
import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const CHART_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];

// ─── Tooltip customizado para moeda ────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt.currency(p.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Conteúdo ────────────────────────────────────────────────────────────────

function RelatoriosContent() {
  const [period, setPeriod] = useState("30");
  const today = new Date();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => today.toISOString().split("T")[0]);

  const sdObj = useMemo(() => new Date(startDate + "T00:00:00"), [startDate]);
  const edObj = useMemo(() => new Date(endDate   + "T23:59:59"), [endDate]);

  const { data: stats }         = trpc.dashboard.stats.useQuery();
  const { data: salesReport, isLoading: salesLoading } = trpc.dashboard.salesReport.useQuery({ startDate: sdObj, endDate: edObj });
  const { data: topProducts }   = trpc.dashboard.topProducts.useQuery({ limit: 10 });
  const { data: topCustomers }  = trpc.dashboard.topCustomers.useQuery({ limit: 10 });
  const { data: cashFlow }      = trpc.dashboard.cashFlow.useQuery({ startDate: sdObj, endDate: edObj });
  const { data: allCustomers }  = trpc.customers.list.useQuery({});

  // Mapa ID → nome para resolver clientes nos rankings
  const customerMap = useMemo(
    () => new Map(allCustomers?.map(c => [c.id, c.name]) ?? []),
    [allCustomers]
  );

  const handlePeriod = (v: string) => {
    setPeriod(v);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - parseInt(v));
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  // Prepara dados dos gráficos
  const salesData = useMemo(() =>
    (salesReport ?? []).map(r => ({
      date:    fmt.shortDate(r.date),
      vendas:  parseFloat(r.totalSales?.toString() ?? "0"),
      pedidos: Number(r.orderCount),
    })), [salesReport]);

  const cashFlowData = useMemo(() => {
    if (!cashFlow) return [];
    const map: Record<string, { date: string; receitas: number; despesas: number }> = {};
    cashFlow.forEach(r => {
      const d = fmt.shortDate(r.date);
      if (!map[d]) map[d] = { date: d, receitas: 0, despesas: 0 };
      if (r.type === "income") map[d].receitas += parseFloat(r.total?.toString() ?? "0");
      else                     map[d].despesas += parseFloat(r.total?.toString() ?? "0");
    });
    return Object.values(map);
  }, [cashFlow]);

  const pieData = useMemo(() =>
    (topProducts ?? []).slice(0, 6).map(p => ({
      name:  p.productName,
      value: parseFloat(p.totalRevenue?.toString() ?? "0"),
    })), [topProducts]);

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Relatórios
          </h1>
          <p className="text-muted-foreground">Análise de desempenho do negócio</p>
        </div>
        {/* Filtro de período */}
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={handlePeriod}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          {period === "custom" && (
            <>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-36" />
              <span className="text-muted-foreground text-sm">até</span>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-36" />
            </>
          )}
        </div>
      </div>

      {/* KPIs do período */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Clientes ativos",  value: fmt.number(stats?.totalCustomers),      sub: "total cadastrado" },
          { label: "Produtos ativos",  value: fmt.number(stats?.totalProducts),        sub: `${stats?.lowStockCount ?? 0} c/ estoque baixo` },
          { label: "Pedidos do mês",   value: fmt.number(stats?.monthlyOrdersCount),   sub: fmt.currency(stats?.monthlyOrdersTotal) },
          { label: "Balanço do mês",   value: fmt.currency((parseFloat(stats?.incomeThisMonth ?? "0")) - (parseFloat(stats?.expensesThisMonth ?? "0"))), sub: "receita - despesa" },
        ].map(({ label, value, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-1"><CardDescription>{label}</CardDescription></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs de gráficos */}
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales"    className="gap-2"><TrendingUp className="h-4 w-4" /> Vendas</TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-2"><BarChart3  className="h-4 w-4" /> Fluxo de caixa</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package    className="h-4 w-4" /> Produtos</TabsTrigger>
          <TabsTrigger value="customers"className="gap-2"><Users      className="h-4 w-4" /> Clientes</TabsTrigger>
        </TabsList>

        {/* Vendas por período */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução de vendas</CardTitle>
              <CardDescription>Valor total por dia no período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? <Skeleton className="h-72 w-full" /> : salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={salesData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt.currency(v).replace("R$", "").trim()} tick={{ fontSize: 11 }} width={64} />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Bar dataKey="vendas" name="Vendas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-16">Nenhuma venda no período</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fluxo de caixa */}
        <TabsContent value="cashflow">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fluxo de caixa</CardTitle>
              <CardDescription>Receitas e despesas pagas no período</CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={cashFlowData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.1} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt.currency(v).replace("R$", "").trim()} tick={{ fontSize: 11 }} width={64} />
                    <Tooltip content={<CurrencyTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-muted-foreground py-16">Nenhuma movimentação paga no período</p>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top produtos */}
        <TabsContent value="products">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Distribuição por produto</CardTitle><CardDescription>% da receita total</CardDescription></CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name.slice(0, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => fmt.currency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p className="text-center text-muted-foreground py-16">Sem dados</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Ranking de produtos</CardTitle><CardDescription>Por receita gerada</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(topProducts ?? []).map((p, i) => (
                    <div key={p.productId} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.productName}</p>
                        <p className="text-xs text-muted-foreground">{p.totalQuantity} unidades vendidas</p>
                      </div>
                      <p className="text-sm font-semibold text-right">{fmt.currency(p.totalRevenue)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top clientes */}
        <TabsContent value="customers">
          <Card>
            <CardHeader><CardTitle className="text-base">Melhores clientes</CardTitle><CardDescription>Por valor total gasto</CardDescription></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(topCustomers ?? []).map((c, i) => {
                  const name = customerMap.get(c.customerId) ?? `Cliente #${c.customerId}`;
                  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
                  return (
                    <div key={c.customerId} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary flex-shrink-0">{i + 1}</span>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">{initials}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{name}</p>
                        <p className="text-xs text-muted-foreground">{c.orderCount} pedidos</p>
                      </div>
                      <p className="text-sm font-semibold">{fmt.currency(c.totalSpent)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Relatorios() {
  return <DashboardLayout><RelatoriosContent /></DashboardLayout>;
}
