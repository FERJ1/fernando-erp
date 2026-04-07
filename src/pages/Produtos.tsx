import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import {
  Package, Plus, Pencil, Trash2, AlertTriangle,
  ArrowUpDown, Search, PackageMinus, PackagePlus,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ─── Tipos e constantes ─────────────────────────────────────────────────────

type ProductFormData = {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  costPrice: string;
  salePrice: string;
  stockQuantity: string;
  minStockLevel: string;
  unit: string;
};

const emptyForm: ProductFormData = {
  name: "", sku: "", description: "", categoryId: "",
  costPrice: "", salePrice: "", stockQuantity: "",
  minStockLevel: "", unit: "un",
};

const unitOptions = [
  { value: "un", label: "Unidade" },
  { value: "m", label: "Metro" },
  { value: "kg", label: "Quilograma" },
  { value: "rolo", label: "Rolo" },
  { value: "peca", label: "Peça" },
  { value: "cx", label: "Caixa" },
];

// ─── Formulário de produto ─────────────────────────────────────────────────

function ProductFormFields({
  form,
  onChange,
  categories,
}: {
  form: ProductFormData;
  onChange: (f: ProductFormData) => void;
  categories: { id: number; name: string }[] | undefined;
}) {
  const set = (patch: Partial<ProductFormData>) => onChange({ ...form, ...patch });

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nome *</Label>
          <Input
            value={form.name}
            onChange={e => set({ name: e.target.value })}
            placeholder="Nome do produto"
          />
        </div>
        <div className="grid gap-2">
          <Label>SKU *</Label>
          <Input
            value={form.sku}
            onChange={e => set({ sku: e.target.value })}
            placeholder="Ex: TEC-001"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descrição</Label>
        <Textarea
          value={form.description}
          onChange={e => set({ description: e.target.value })}
          rows={2}
          placeholder="Descrição do produto"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Categoria *</Label>
          <Select value={form.categoryId} onValueChange={v => set({ categoryId: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {categories?.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Unidade *</Label>
          <Select value={form.unit} onValueChange={v => set({ unit: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {unitOptions.map(u => (
                <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Preço de Custo (R$) *</Label>
          <Input
            type="number" step="0.01" min="0"
            value={form.costPrice}
            onChange={e => set({ costPrice: e.target.value })}
            placeholder="0,00"
          />
        </div>
        <div className="grid gap-2">
          <Label>Preço de Venda (R$) *</Label>
          <Input
            type="number" step="0.01" min="0"
            value={form.salePrice}
            onChange={e => set({ salePrice: e.target.value })}
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Estoque Atual</Label>
          <Input
            type="number" min="0"
            value={form.stockQuantity}
            onChange={e => set({ stockQuantity: e.target.value })}
            placeholder="0"
          />
        </div>
        <div className="grid gap-2">
          <Label>Estoque Mínimo</Label>
          <Input
            type="number" min="0"
            value={form.minStockLevel}
            onChange={e => set({ minStockLevel: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Conteúdo principal ─────────────────────────────────────────────────────

function ProdutosContent() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [adjustId, setAdjustId] = useState<number | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm });

  const [sortField, setSortField] = useState<"name" | "sku" | "stockQuantity" | "salePrice">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const utils = trpc.useUtils();

  const { data: products, isLoading } = trpc.products.list.useQuery({
    search: search || undefined,
    lowStock: lowStockOnly || undefined,
    categoryId: categoryFilter !== "all" ? Number(categoryFilter) : undefined,
  });

  const { data: categories } = trpc.categories.list.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto criado com sucesso!");
      setIsCreateOpen(false);
      setForm({ ...emptyForm });
      utils.products.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado!");
      setEditingId(null);
      setForm({ ...emptyForm });
      utils.products.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto removido!");
      setDeleteId(null);
      utils.products.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const adjustStockMutation = trpc.products.adjustStock.useMutation({
    onSuccess: () => {
      toast.success("Estoque ajustado!");
      setAdjustId(null);
      setAdjustQty("");
      setAdjustReason("");
      utils.products.list.invalidate();
      utils.products.getLowStock.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Ordenação local
  const sorted = useMemo(() => {
    if (!products) return products;
    return [...products].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });
  }, [products, sortField, sortDir]);

  const hasFilter = !!(search || categoryFilter !== "all" || lowStockOnly);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleCreate = () => {
    if (!form.name || !form.sku || !form.categoryId || !form.costPrice || !form.salePrice) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }
    createMutation.mutate({
      name: form.name,
      sku: form.sku,
      description: form.description || undefined,
      categoryId: Number(form.categoryId),
      costPrice: parseFloat(form.costPrice),
      salePrice: parseFloat(form.salePrice),
      stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : 0,
      minStockLevel: form.minStockLevel ? parseInt(form.minStockLevel) : 0,
      unit: form.unit,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      name: form.name,
      sku: form.sku,
      description: form.description || undefined,
      categoryId: Number(form.categoryId),
      costPrice: parseFloat(form.costPrice),
      salePrice: parseFloat(form.salePrice),
      stockQuantity: form.stockQuantity ? parseInt(form.stockQuantity) : 0,
      minStockLevel: form.minStockLevel ? parseInt(form.minStockLevel) : 0,
      unit: form.unit,
    });
  };

  const handleAdjustStock = () => {
    if (!adjustId || !adjustQty) return;
    adjustStockMutation.mutate({
      productId: adjustId,
      quantity: parseInt(adjustQty),
    });
  };

  const openEdit = (product: NonNullable<typeof products>[number]) => {
    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description ?? "",
      categoryId: String(product.categoryId),
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      stockQuantity: String(product.stockQuantity),
      minStockLevel: String(product.minStockLevel),
      unit: product.unit,
    });
    setEditingId(product.id);
  };

  const getCategoryName = (categoryId: number) =>
    categories?.find(c => c.id === categoryId)?.name ?? "—";

  const isLowStock = (product: { stockQuantity: number; minStockLevel: number }) =>
    product.stockQuantity <= product.minStockLevel;

  const lowStockCount = products?.filter(p => isLowStock(p)).length ?? 0;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">
            Gerencie o catálogo e o estoque de produtos
          </p>
        </div>
        <Button onClick={() => { setForm({ ...emptyForm }); setIsCreateOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Indicadores rápidos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products?.length ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorias</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories?.length ?? "—"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories?.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={lowStockOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setLowStockOnly(v => !v)}
              className="gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Estoque Baixo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !sorted?.length ? (
            <div className="p-6">
              <EmptyState
                icon={Package}
                title="Nenhum produto encontrado"
                description="Comece cadastrando seu primeiro produto"
                hasFilter={hasFilter}
                action={
                  !hasFilter ? (
                    <Button onClick={() => { setForm({ ...emptyForm }); setIsCreateOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Produto
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("sku")}>
                    <span className="flex items-center gap-1">SKU <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("name")}>
                    <span className="flex items-center gap-1">Nome <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço Custo</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("salePrice")}>
                    <span className="flex items-center gap-1">Preço Venda <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("stockQuantity")}>
                    <span className="flex items-center gap-1">Estoque <ArrowUpDown className="h-3 w-3" /></span>
                  </TableHead>
                  <TableHead>Estoque Mín</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map(product => {
                  const low = isLowStock(product);
                  return (
                    <TableRow
                      key={product.id}
                      className={low ? "bg-orange-50 dark:bg-orange-950/20" : undefined}
                    >
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                      <TableCell>{fmt.currency(product.costPrice)}</TableCell>
                      <TableCell>{fmt.currency(product.salePrice)}</TableCell>
                      <TableCell>
                        <span className={low ? "font-semibold text-orange-600" : ""}>
                          {product.stockQuantity}
                        </span>
                      </TableCell>
                      <TableCell>{product.minStockLevel}</TableCell>
                      <TableCell>
                        {low ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Baixo
                          </Badge>
                        ) : product.isActive ? (
                          <Badge variant="secondary">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost" size="icon"
                            title="Ajustar estoque"
                            onClick={() => { setAdjustId(product.id); setAdjustQty(""); setAdjustReason(""); }}
                          >
                            <PackagePlus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            title="Editar"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            title="Excluir"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ─── Dialog: Novo Produto ───────────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={o => { if (!o) setIsCreateOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
            <DialogDescription>Preencha os dados do produto abaixo.</DialogDescription>
          </DialogHeader>
          <ProductFormFields form={form} onChange={setForm} categories={categories} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Editar Produto ─────────────────────────────────────────── */}
      <Dialog open={editingId !== null} onOpenChange={o => { if (!o) { setEditingId(null); setForm({ ...emptyForm }); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>Altere os dados do produto.</DialogDescription>
          </DialogHeader>
          <ProductFormFields form={form} onChange={setForm} categories={categories} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingId(null); setForm({ ...emptyForm }); }}>Cancelar</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Dialog: Ajuste de Estoque ──────────────────────────────────────── */}
      <Dialog open={adjustId !== null} onOpenChange={o => { if (!o) { setAdjustId(null); setAdjustQty(""); setAdjustReason(""); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajustar Estoque</DialogTitle>
            <DialogDescription>
              Informe a quantidade a ajustar. Valores positivos para entrada, negativos para saída.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                value={adjustQty}
                onChange={e => setAdjustQty(e.target.value)}
                placeholder="Ex: 10 ou -5"
              />
              <p className="text-xs text-muted-foreground">
                {adjustQty && parseInt(adjustQty) > 0 && (
                  <span className="flex items-center gap-1 text-green-600">
                    <PackagePlus className="h-3 w-3" /> Entrada de {adjustQty} unidades
                  </span>
                )}
                {adjustQty && parseInt(adjustQty) < 0 && (
                  <span className="flex items-center gap-1 text-orange-600">
                    <PackageMinus className="h-3 w-3" /> Saída de {Math.abs(parseInt(adjustQty))} unidades
                  </span>
                )}
              </p>
            </div>
            <div className="grid gap-2">
              <Label>Motivo</Label>
              <Textarea
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                rows={2}
                placeholder="Ex: Recebimento de fornecedor, inventário..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAdjustId(null); setAdjustQty(""); setAdjustReason(""); }}>Cancelar</Button>
            <Button onClick={handleAdjustStock} disabled={adjustStockMutation.isPending || !adjustQty}>
              {adjustStockMutation.isPending ? "Ajustando..." : "Confirmar Ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── AlertDialog: Confirmação de exclusão ───────────────────────────── */}
      <AlertDialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteMutation.mutate({ id: deleteId }); }}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Página com layout ────────────────────────────────────────────────────

export default function Produtos() {
  return (
    <DashboardLayout>
      <ProdutosContent />
    </DashboardLayout>
  );
}
