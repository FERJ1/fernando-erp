import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Search, ShoppingCart, Trash2, Eye, CheckCircle, XCircle, Truck, Package, Clock } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30', icon: CheckCircle },
  processing: { label: 'Em Processamento', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-green-500/15 text-green-600 border-green-500/30', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/15 text-red-600 border-red-500/30', icon: XCircle },
};

const paymentStatusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  paid: { label: 'Pago', color: 'bg-green-500/15 text-green-600 border-green-500/30' },
  partial: { label: 'Parcial', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  refunded: { label: 'Reembolsado', color: 'bg-gray-500/15 text-gray-600 border-gray-500/30' },
};

function PedidosContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<number | null>(null);
  
  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [discount, setDiscount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [shippingAddress, setShippingAddress] = useState<string>('');

  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.orders.list.useQuery({ 
    search: search || undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined
  });
  const { data: customers } = trpc.customers.list.useQuery({ isActive: true });
  const { data: products } = trpc.products.list.useQuery({ isActive: true });
  const { data: orderDetails } = trpc.orders.getById.useQuery(
    { id: viewingOrder! },
    { enabled: !!viewingOrder }
  );
  
  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success('Pedido criado com sucesso!');
      setIsCreateOpen(false);
      resetForm();
      utils.orders.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao criar pedido: ' + error.message);
    }
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status atualizado!');
      utils.orders.list.invalidate();
      utils.orders.getById.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  const updatePaymentMutation = trpc.orders.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success('Pagamento atualizado!');
      utils.orders.list.invalidate();
      utils.orders.getById.invalidate();
      utils.financial.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar pagamento: ' + error.message);
    }
  });

  const resetForm = () => {
    setSelectedCustomerId('');
    setOrderItems([]);
    setSelectedProductId('');
    setQuantity('1');
    setDiscount('0');
    setNotes('');
    setShippingAddress('');
  };

  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
  }, [orderItems]);

  const total = useMemo(() => {
    return subtotal - parseFloat(discount || '0');
  }, [subtotal, discount]);

  const addItem = () => {
    if (!selectedProductId || !quantity) return;
    
    const product = products?.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    const qty = parseInt(quantity);
    const unitPrice = product.price;
    const totalPrice = (parseFloat(unitPrice) * qty).toFixed(2);

    const existingIndex = orderItems.findIndex(item => item.productId === product.id);
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].totalPrice = (parseFloat(updated[existingIndex].unitPrice) * updated[existingIndex].quantity).toFixed(2);
      setOrderItems(updated);
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        quantity: qty,
        unitPrice,
        totalPrice,
      }]);
    }

    setSelectedProductId('');
    setQuantity('1');
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (!selectedCustomerId || orderItems.length === 0) return;
    
    createMutation.mutate({
      customerId: parseInt(selectedCustomerId),
      items: orderItems,
      subtotal: subtotal.toFixed(2),
      discount: discount || '0',
      total: total.toFixed(2),
      notes: notes || null,
      shippingAddress: shippingAddress || null,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie os pedidos da sua empresa</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Pedido
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pedido</DialogTitle>
              <DialogDescription>Crie um novo pedido selecionando cliente e produtos</DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6">
              {/* Customer Selection */}
              <div className="grid gap-2">
                <Label>Cliente *</Label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} {customer.document ? `(${customer.document})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Products */}
              <div className="grid gap-2">
                <Label>Adicionar Produtos</Label>
                <div className="flex gap-2">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent>
                      {products?.filter(p => p.stockQuantity > 0).map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - {formatCurrency(product.price)} ({product.stockQuantity} disp.)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-24"
                    placeholder="Qtd"
                  />
                  <Button type="button" onClick={addItem} disabled={!selectedProductId}>
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Items Table */}
              {orderItems.length > 0 && (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Qtd</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeItem(index)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Totals */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Desconto (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2 text-right">
                  <div className="text-sm text-muted-foreground">
                    Subtotal: {formatCurrency(subtotal)}
                  </div>
                  {parseFloat(discount) > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Desconto: -{formatCurrency(discount)}
                    </div>
                  )}
                  <div className="text-xl font-bold text-primary">
                    Total: {formatCurrency(total)}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Endereço de Entrega</Label>
                  <Textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Endereço completo para entrega"
                    rows={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações sobre o pedido"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleCreate} 
                disabled={createMutation.isPending || !selectedCustomerId || orderItems.length === 0}
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Pedido'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido {orderDetails?.orderNumber}</DialogTitle>
          </DialogHeader>
          {orderDetails && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{orderDetails.customer?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{formatDate(orderDetails.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Select 
                    value={orderDetails.status} 
                    onValueChange={(value) => updateStatusMutation.mutate({ id: orderDetails.id, status: value as any })}
                  >
                    <SelectTrigger className="w-48 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pagamento</p>
                  <Select 
                    value={orderDetails.paymentStatus} 
                    onValueChange={(value) => updatePaymentMutation.mutate({ id: orderDetails.id, paymentStatus: value as any })}
                  >
                    <SelectTrigger className="w-48 mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(paymentStatusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Preço Unit.</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end">
                <div className="text-right space-y-1">
                  <p className="text-sm text-muted-foreground">Subtotal: {formatCurrency(orderDetails.subtotal)}</p>
                  {parseFloat(orderDetails.discount || '0') > 0 && (
                    <p className="text-sm text-muted-foreground">Desconto: -{formatCurrency(orderDetails.discount)}</p>
                  )}
                  <p className="text-xl font-bold text-primary">Total: {formatCurrency(orderDetails.total)}</p>
                </div>
              </div>

              {orderDetails.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="text-sm">{orderDetails.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número do pedido..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">
                {orders?.length || 0} pedidos
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig];
                const paymentStatus = paymentStatusConfig[order.paymentStatus as keyof typeof paymentStatusConfig];
                const StatusIcon = status?.icon || Clock;
                
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => setViewingOrder(order.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{order.orderNumber}</h3>
                          <Badge className={status?.color}>{status?.label}</Badge>
                          <Badge className={paymentStatus?.color}>{paymentStatus?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatCurrency(order.total)}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {search || statusFilter ? 'Tente uma busca diferente' : 'Comece criando seu primeiro pedido'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Pedidos() {
  return (
    <DashboardLayout>
      <PedidosContent />
    </DashboardLayout>
  );
}
