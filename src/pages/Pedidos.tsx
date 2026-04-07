import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import {
  ShoppingCart,
  Plus,
  Eye,
  Search,
  Filter,
  Trash2,
  Package,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type OrderStatus = "pending" | "production" | "ready" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "partial" | "paid";

type OrderItem = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

type Order = {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  items: OrderItem[];
  totalAmount: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type NewItemRow = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

// ─── Constantes ─────────────────────────────────────────────────────────────

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendente" },
  { value: "production", label: "Em Produção" },
  { value: "ready", label: "Pronto" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "production", label: "Em Produção" },
  { value: "ready", label: "Pronto" },
  { value: "delivered", label: "Entregue" },
  { value: "cancelled", label: "Cancelado" },
];

const PAYMENT_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "Pendente" },
  { value: "partial", label: "Parcial" },
  { value: "paid", label: "Pago" },
];

const emptyItem: NewItemRow = { productId: "", quantity: 1, unitPrice: 0 };

// ─── Componente principal ───────────────────────────────────────────────────

export default function Pedidos() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOrderId, setDetailOrderId] = useState<number | null>(null);

  const utils = trpc.useUtils();

  // ── Queries ──────────────────────────────────────────────────────────────

  const ordersQuery = trpc.orders.list.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search || undefined,
  });

  const customersQuery = trpc.customers.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();

  const detailQuery = trpc.orders.getById.useQuery(
    { id: detailOrderId! },
    { enabled: !!detailOrderId },
  );

  // ── Mutations ────────────────────────────────────────────────────────────

  const createMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      utils.orders.list.invalidate();
      setCreateOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.orders.list.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePaymentMutation = trpc.orders.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("Status de pagamento atualizado!");
      utils.orders.list.invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Dados ────────────────────────────────────────────────────────────────

  const orders: Order[] = ordersQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const isLoading = ordersQuery.isLoading;

  const hasActiveFilter = statusFilter !== "all" || !!search;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pedidos</h1>
            <p className="text-muted-foreground">
              Gerencie os pedidos de produção
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pedido
          </Button>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nº do pedido..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Tabs
                value={statusFilter}
                onValueChange={setStatusFilter}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-3 sm:flex sm:w-auto">
                  {STATUS_TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de pedidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Lista de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Nenhum pedido encontrado"
                description="Comece criando seu primeiro pedido"
                hasFilter={hasActiveFilter}
                action={
                  !hasActiveFilter ? (
                    <Button onClick={() => setCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Pedido
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nº Pedido</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="text-center">Itens</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          {customers.find((c: any) => c.id === order.customerId)?.name ??
                            "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.items.length}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt.currency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <OrderStatusBadge status={order.status} />
                        </TableCell>
                        <TableCell>
                          <PaymentStatusBadge status={order.paymentStatus} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {fmt.date(order.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDetailOrderId(order.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Novo Pedido */}
      <CreateOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        customers={customers}
        products={products}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
      />

      {/* Dialog: Detalhes do Pedido */}
      <OrderDetailDialog
        orderId={detailOrderId}
        open={!!detailOrderId}
        onOpenChange={(open) => {
          if (!open) setDetailOrderId(null);
        }}
        order={detailQuery.data}
        isLoading={detailQuery.isLoading}
        onUpdateStatus={(id, status) =>
          updateStatusMutation.mutate({ id, status })
        }
        onUpdatePayment={(id, paymentStatus) =>
          updatePaymentMutation.mutate({ id, paymentStatus })
        }
      />
    </DashboardLayout>
  );
}

// ─── Dialog: Criar Pedido ───────────────────────────────────────────────────

function CreateOrderDialog({
  open,
  onOpenChange,
  customers,
  products,
  onSubmit,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  customers: any[];
  products: any[];
  onSubmit: (data: {
    customerId: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    notes: string;
  }) => void;
  isSubmitting: boolean;
}) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<NewItemRow[]>([{ ...emptyItem }]);
  const [notes, setNotes] = useState("");

  const resetForm = () => {
    setCustomerId("");
    setItems([{ ...emptyItem }]);
    setNotes("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) resetForm();
    onOpenChange(v);
  };

  const updateItem = (index: number, patch: Partial<NewItemRow>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p: any) => p.id === productId);
    updateItem(index, {
      productId,
      unitPrice: product?.salePrice ?? 0,
    });
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items],
  );

  const canSubmit =
    customerId &&
    items.length > 0 &&
    items.every((item) => item.productId && item.quantity > 0 && item.unitPrice > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      customerId,
      items: items.map(({ productId, quantity, unitPrice }) => ({
        productId,
        quantity,
        unitPrice,
      })),
      notes,
    });
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Pedido</DialogTitle>
          <DialogDescription>
            Preencha os dados do pedido abaixo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Cliente */}
          <div className="grid gap-2">
            <Label>Cliente *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Itens */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Itens do Pedido *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-3 w-3" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3"
                >
                  {/* Produto */}
                  <div className="col-span-5 grid gap-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Produto
                      </Label>
                    )}
                    <Select
                      value={item.productId}
                      onValueChange={(v) => handleProductChange(index, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantidade */}
                  <div className="col-span-2 grid gap-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Qtd
                      </Label>
                    )}
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, {
                          quantity: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                    />
                  </div>

                  {/* Preço Unitário */}
                  <div className="col-span-2 grid gap-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Preço Un.
                      </Label>
                    )}
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  {/* Subtotal */}
                  <div className="col-span-2 grid gap-1">
                    {index === 0 && (
                      <Label className="text-xs text-muted-foreground">
                        Subtotal
                      </Label>
                    )}
                    <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm font-medium">
                      {fmt.currency(item.quantity * item.unitPrice)}
                    </div>
                  </div>

                  {/* Remover */}
                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      onClick={() => removeItem(index)}
                      disabled={items.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-end gap-2 pt-2 text-lg font-semibold">
              <span className="text-muted-foreground">Total:</span>
              <span>{fmt.currency(total)}</span>
            </div>
          </div>

          {/* Observações */}
          <div className="grid gap-2">
            <Label>Observações</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre o pedido..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Criando..." : "Criar Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dialog: Detalhes do Pedido ─────────────────────────────────────────────

function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
  order,
  isLoading,
  onUpdateStatus,
  onUpdatePayment,
}: {
  orderId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  order: any;
  isLoading: boolean;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onUpdatePayment: (id: string, paymentStatus: PaymentStatus) => void;
}) {
  if (!orderId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes do Pedido{" "}
            {order ? `#${order.orderNumber}` : ""}
          </DialogTitle>
          <DialogDescription>
            Visualize e atualize as informações do pedido.
          </DialogDescription>
        </DialogHeader>

        {isLoading || !order ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Informações Gerais */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Cliente</Label>
                <p className="text-sm font-medium">
                  {order.customer?.name ?? "—"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <p className="text-sm font-medium">
                  {fmt.date(order.createdAt)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Total</Label>
                <p className="text-sm font-semibold">
                  {fmt.currency(order.totalAmount)}
                </p>
              </div>
              {order.notes && (
                <div className="space-y-1 col-span-2">
                  <Label className="text-xs text-muted-foreground">
                    Observações
                  </Label>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Status e Pagamento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status do Pedido</Label>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <Select
                    value={order.status}
                    onValueChange={(v) =>
                      onUpdateStatus(order.id, v as OrderStatus)
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Alterar" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Status de Pagamento</Label>
                <div className="flex items-center gap-2">
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <Select
                    value={order.paymentStatus}
                    onValueChange={(v) =>
                      onUpdatePayment(order.id, v as PaymentStatus)
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Alterar" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Itens do Pedido */}
            <div className="space-y-2">
              <Label>Itens do Pedido</Label>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Preço Un.</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item: OrderItem, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          {fmt.currency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {fmt.currency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell colSpan={3} className="text-right font-semibold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmt.currency(order.totalAmount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
