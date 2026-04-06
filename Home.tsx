import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
  trendValue,
  variant = 'default',
  onClick
}: { 
  title: string; 
  value: string | number; 
  description?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}) {
  const variantStyles = {
    default: 'border-l-primary',
    success: 'border-l-green-500',
    warning: 'border-l-amber-500',
    danger: 'border-l-red-500'
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600'
  };

  return (
    <Card 
      className={`border-l-4 ${variantStyles[variant]} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && trendValue && (
              <div className={`flex items-center gap-1 text-xs ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                <span>{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardContent() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: topProducts } = trpc.dashboard.topProducts.useQuery({ limit: 5 });
  const { data: topCustomers } = trpc.dashboard.topCustomers.useQuery({ limit: 5 });
  const { data: lowStockProducts } = trpc.products.getLowStock.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const balance = parseFloat(stats?.incomeThisMonth || '0') - parseFloat(stats?.expensesThisMonth || '0');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <Button onClick={() => setLocation('/insights')} variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" />
          Ver Insights IA
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Clientes"
          value={stats?.totalCustomers || 0}
          description="Clientes ativos cadastrados"
          icon={Users}
          onClick={() => setLocation('/clientes')}
        />
        <StatCard
          title="Produtos Ativos"
          value={stats?.totalProducts || 0}
          description={`${stats?.lowStockCount || 0} com estoque baixo`}
          icon={Package}
          variant={Number(stats?.lowStockCount) > 0 ? 'warning' : 'default'}
          onClick={() => setLocation('/produtos')}
        />
        <StatCard
          title="Pedidos do Mês"
          value={stats?.monthlyOrdersCount || 0}
          description={formatCurrency(stats?.monthlyOrdersTotal)}
          icon={ShoppingCart}
          variant="success"
          onClick={() => setLocation('/pedidos')}
        />
        <StatCard
          title="Pedidos Pendentes"
          value={stats?.pendingOrdersCount || 0}
          description="Aguardando processamento"
          icon={Clock}
          variant={Number(stats?.pendingOrdersCount) > 0 ? 'warning' : 'default'}
          onClick={() => setLocation('/pedidos')}
        />
      </div>

      {/* Financial Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita do Mês"
          value={formatCurrency(stats?.incomeThisMonth)}
          icon={TrendingUp}
          variant="success"
          onClick={() => setLocation('/financeiro')}
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(stats?.expensesThisMonth)}
          icon={TrendingDown}
          variant="danger"
          onClick={() => setLocation('/financeiro')}
        />
        <StatCard
          title="Balanço do Mês"
          value={formatCurrency(balance)}
          icon={DollarSign}
          variant={balance >= 0 ? 'success' : 'danger'}
          onClick={() => setLocation('/financeiro')}
        />
        <StatCard
          title="Contas Vencidas"
          value={stats?.overdueCount || 0}
          description="Requerem atenção imediata"
          icon={AlertTriangle}
          variant={Number(stats?.overdueCount) > 0 ? 'danger' : 'default'}
          onClick={() => setLocation('/financeiro')}
        />
      </div>

      {/* Receivables and Payables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contas a Receber</CardTitle>
            <CardDescription>Valores pendentes de recebimento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats?.pendingReceivables)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contas a Pagar</CardTitle>
            <CardDescription>Valores pendentes de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(stats?.pendingPayables)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos por quantidade</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts && topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium truncate max-w-[150px]">
                        {product.productName}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{product.totalQuantity} un</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(product.totalRevenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma venda registrada ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Melhores Clientes</CardTitle>
            <CardDescription>Top 5 clientes por valor</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers && topCustomers.length > 0 ? (
              <div className="space-y-4">
                {topCustomers.map((customer, index) => (
                  <div key={customer.customerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        Cliente #{customer.customerId}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{customer.orderCount} pedidos</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(customer.totalSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum cliente com pedidos ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className={lowStockProducts && lowStockProducts.length > 0 ? 'border-amber-500/50' : ''}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {lowStockProducts && lowStockProducts.length > 0 && (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              )}
              Alertas de Estoque
            </CardTitle>
            <CardDescription>Produtos com estoque baixo</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[180px]">
                      {product.name}
                    </span>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        product.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {product.stockQuantity} un
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Mín: {product.minStockLevel}
                      </p>
                    </div>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => setLocation('/produtos?lowStock=true')}
                  >
                    Ver todos ({lowStockProducts.length})
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Todos os produtos com estoque adequado
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
