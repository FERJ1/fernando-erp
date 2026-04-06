import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Users, Package, Calendar, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

function RelatoriosContent() {
  const [period, setPeriod] = useState('30');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const { data: stats } = trpc.dashboard.stats.useQuery();
  const { data: salesReport, isLoading: salesLoading } = trpc.dashboard.salesReport.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });
  const { data: topProducts } = trpc.dashboard.topProducts.useQuery({ limit: 10 });
  const { data: topCustomers } = trpc.dashboard.topCustomers.useQuery({ limit: 10 });
  const { data: cashFlow } = trpc.dashboard.cashFlow.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });
  const { data: customers } = trpc.customers.list.useQuery({});

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - parseInt(value));
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  const salesChartData = useMemo(() => {
    if (!salesReport) return [];
    return salesReport.map(item => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      vendas: parseFloat(item.totalSales?.toString() || '0'),
      pedidos: item.orderCount,
    }));
  }, [salesReport]);

  const cashFlowData = useMemo(() => {
    if (!cashFlow) return [];
    const grouped: Record<string, { date: string; receitas: number; despesas: number }> = {};
    
    cashFlow.forEach(item => {
      const date = new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      if (!grouped[date]) {
        grouped[date] = { date, receitas: 0, despesas: 0 };
      }
      if (item.type === 'income') {
        grouped[date].receitas += parseFloat(item.total?.toString() || '0');
      } else {
        grouped[date].despesas += parseFloat(item.total?.toString() || '0');
      }
    });
    
    return Object.values(grouped);
  }, [cashFlow]);

  const productsPieData = useMemo(() => {
    if (!topProducts) return [];
    return topProducts.slice(0, 5).map(p => ({
      name: p.productName.length > 15 ? p.productName.substring(0, 15) + '...' : p.productName,
      value: parseFloat(p.totalRevenue?.toString() || '0'),
    }));
  }, [topProducts]);

  const topCustomersWithNames = useMemo(() => {
    if (!topCustomers || !customers) return [];
    return topCustomers.map(tc => {
      const customer = customers.find(c => c.id === tc.customerId);
      return {
        ...tc,
        name: customer?.name || `Cliente #${tc.customerId}`,
      };
    });
  }, [topCustomers, customers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">Análise completa do desempenho do seu negócio</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas do Período</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.monthlyOrdersTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pedidos</p>
                <p className="text-2xl font-bold">{stats?.monthlyOrdersCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos Ativos</p>
                <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendas" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="financeiro">Fluxo de Caixa</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="vendas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Período</CardTitle>
              <CardDescription>Evolução das vendas no período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <Skeleton className="h-80 w-full" />
              ) : salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Bar dataKey="vendas" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Nenhum dado de vendas no período selecionado
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="produtos" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>Top 10 produtos por quantidade vendida</CardDescription>
              </CardHeader>
              <CardContent>
                {topProducts && topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.productId} className="flex items-center gap-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.totalQuantity} unidades vendidas
                          </p>
                        </div>
                        <p className="font-semibold text-primary">
                          {formatCurrency(product.totalRevenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhum produto vendido ainda
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Receita</CardTitle>
                <CardDescription>Receita por produto (Top 5)</CardDescription>
              </CardHeader>
              <CardContent>
                {productsPieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productsPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {productsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Melhores Clientes</CardTitle>
              <CardDescription>Top 10 clientes por valor total de compras</CardDescription>
            </CardHeader>
            <CardContent>
              {topCustomersWithNames && topCustomersWithNames.length > 0 ? (
                <div className="space-y-4">
                  {topCustomersWithNames.map((customer, index) => (
                    <div key={customer.customerId} className="flex items-center gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {customer.orderCount} pedidos realizados
                        </p>
                      </div>
                      <p className="font-semibold text-primary text-lg">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Nenhum cliente com pedidos ainda
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa</CardTitle>
              <CardDescription>Receitas vs Despesas no período</CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
                      className="text-xs"
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'receitas' ? 'Receitas' : 'Despesas'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="receitas" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      dot={{ fill: '#22c55e' }}
                      name="Receitas"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="despesas" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                      name="Despesas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  Nenhum dado financeiro no período selecionado
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Receitas</p>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(stats?.incomeThisMonth)}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-green-500/30" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Despesas</p>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(stats?.expensesThisMonth)}
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-red-500/30 rotate-180" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Relatorios() {
  return (
    <DashboardLayout>
      <RelatoriosContent />
    </DashboardLayout>
  );
}
