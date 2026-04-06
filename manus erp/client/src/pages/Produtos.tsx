import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type ProductFormData = {
  name: string;
  description: string;
  sku: string;
  price: string;
  costPrice: string;
  stockQuantity: number;
  minStockLevel: number;
  categoryId: string;
  unit: string;
};

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  sku: '',
  price: '',
  costPrice: '',
  stockQuantity: 0,
  minStockLevel: 5,
  categoryId: '',
  unit: 'un',
};

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function ProdutosContent() {
  const [search, setSearch] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<{ productId: number; productName: string } | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.products.list.useQuery({ 
    search: search || undefined,
    lowStock: showLowStock || undefined
  });
  const { data: categories } = trpc.categories.list.useQuery({ isActive: true });
  
  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success('Produto criado com sucesso!');
      setIsCreateOpen(false);
      setFormData(initialFormData);
      utils.products.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao criar produto: ' + error.message);
    }
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      setEditingProduct(null);
      setFormData(initialFormData);
      utils.products.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produto: ' + error.message);
    }
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success('Produto removido com sucesso!');
      utils.products.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao remover produto: ' + error.message);
    }
  });

  const adjustStockMutation = trpc.products.adjustStock.useMutation({
    onSuccess: () => {
      toast.success('Estoque ajustado com sucesso!');
      setStockAdjustment(null);
      setAdjustmentQuantity('');
      setAdjustmentReason('');
      utils.products.list.invalidate();
      utils.dashboard.stats.invalidate();
      utils.products.getLowStock.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao ajustar estoque: ' + error.message);
    }
  });

  const handleCreate = () => {
    if (!formData.name || !formData.price) return;
    createMutation.mutate({
      name: formData.name,
      description: formData.description || null,
      sku: formData.sku || null,
      price: formData.price,
      costPrice: formData.costPrice || null,
      stockQuantity: formData.stockQuantity,
      minStockLevel: formData.minStockLevel,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      unit: formData.unit,
    });
  };

  const handleUpdate = () => {
    if (!editingProduct || !formData.name || !formData.price) return;
    updateMutation.mutate({
      id: editingProduct,
      name: formData.name,
      description: formData.description || null,
      sku: formData.sku || null,
      price: formData.price,
      costPrice: formData.costPrice || null,
      stockQuantity: formData.stockQuantity,
      minStockLevel: formData.minStockLevel,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      unit: formData.unit,
    });
  };

  const handleStockAdjustment = () => {
    if (!stockAdjustment || !adjustmentQuantity) return;
    adjustStockMutation.mutate({
      productId: stockAdjustment.productId,
      type: adjustmentType,
      quantity: parseInt(adjustmentQuantity),
      reason: adjustmentReason || undefined,
    });
  };

  const openEditDialog = (product: NonNullable<typeof products>[0]) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      price: product.price,
      costPrice: product.costPrice || '',
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      categoryId: product.categoryId?.toString() || '',
      unit: product.unit || 'un',
    });
    setEditingProduct(product.id);
  };

  const getStockBadge = (product: NonNullable<typeof products>[0]) => {
    if (product.stockQuantity === 0) {
      return <Badge variant="destructive">Sem estoque</Badge>;
    }
    if (product.stockQuantity <= product.minStockLevel) {
      return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">Estoque baixo</Badge>;
    }
    return <Badge variant="secondary">{product.stockQuantity} {product.unit}</Badge>;
  };

  const ProductForm = () => (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nome do produto"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sku">SKU / Código</Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="Código do produto"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição do produto"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="price">Preço de Venda *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="costPrice">Preço de Custo</Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            value={formData.costPrice}
            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
            placeholder="0.00"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.categoryId}
            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="stockQuantity">Estoque Inicial</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="minStockLevel">Estoque Mínimo</Label>
          <Input
            id="minStockLevel"
            type="number"
            value={formData.minStockLevel}
            onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unit">Unidade</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="un">Unidade (un)</SelectItem>
              <SelectItem value="kg">Quilograma (kg)</SelectItem>
              <SelectItem value="g">Grama (g)</SelectItem>
              <SelectItem value="l">Litro (l)</SelectItem>
              <SelectItem value="ml">Mililitro (ml)</SelectItem>
              <SelectItem value="m">Metro (m)</SelectItem>
              <SelectItem value="cx">Caixa (cx)</SelectItem>
              <SelectItem value="pc">Peça (pc)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground">Gerencie seu catálogo de produtos e estoque</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setFormData(initialFormData);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
              <DialogDescription>Adicione um novo produto ao catálogo</DialogDescription>
            </DialogHeader>
            <ProductForm />
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createMutation.isPending || !formData.name || !formData.price}>
                {createMutation.isPending ? 'Criando...' : 'Criar Produto'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showLowStock ? "default" : "outline"}
                size="sm"
                onClick={() => setShowLowStock(!showLowStock)}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Estoque Baixo
              </Button>
              <Badge variant="secondary">
                {products?.length || 0} produtos
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors ${
                    product.stockQuantity <= product.minStockLevel ? 'border-amber-500/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      product.stockQuantity === 0 ? 'bg-red-500/10' :
                      product.stockQuantity <= product.minStockLevel ? 'bg-amber-500/10' : 'bg-primary/10'
                    }`}>
                      <Package className={`h-6 w-6 ${
                        product.stockQuantity === 0 ? 'text-red-500' :
                        product.stockQuantity <= product.minStockLevel ? 'text-amber-500' : 'text-primary'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{product.name}</h3>
                        {product.sku && (
                          <span className="text-xs text-muted-foreground">#{product.sku}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-semibold text-primary">
                          {formatCurrency(product.price)}
                        </span>
                        {getStockBadge(product)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={stockAdjustment?.productId === product.id} onOpenChange={(open) => {
                      if (!open) {
                        setStockAdjustment(null);
                        setAdjustmentQuantity('');
                        setAdjustmentReason('');
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setStockAdjustment({ productId: product.id, productName: product.name })}
                        >
                          Ajustar Estoque
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajustar Estoque</DialogTitle>
                          <DialogDescription>
                            {stockAdjustment?.productName} - Estoque atual: {product.stockQuantity} {product.unit}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <Tabs value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as any)}>
                            <TabsList className="grid w-full grid-cols-3">
                              <TabsTrigger value="in" className="gap-2">
                                <ArrowUpCircle className="h-4 w-4" />
                                Entrada
                              </TabsTrigger>
                              <TabsTrigger value="out" className="gap-2">
                                <ArrowDownCircle className="h-4 w-4" />
                                Saída
                              </TabsTrigger>
                              <TabsTrigger value="adjustment" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Ajuste
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                          <div className="grid gap-2">
                            <Label>
                              {adjustmentType === 'adjustment' ? 'Novo valor do estoque' : 'Quantidade'}
                            </Label>
                            <Input
                              type="number"
                              value={adjustmentQuantity}
                              onChange={(e) => setAdjustmentQuantity(e.target.value)}
                              placeholder={adjustmentType === 'adjustment' ? 'Novo estoque' : 'Quantidade'}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Motivo (opcional)</Label>
                            <Input
                              value={adjustmentReason}
                              onChange={(e) => setAdjustmentReason(e.target.value)}
                              placeholder="Ex: Compra de fornecedor, Venda manual, Inventário..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleStockAdjustment} disabled={adjustStockMutation.isPending || !adjustmentQuantity}>
                            {adjustStockMutation.isPending ? 'Salvando...' : 'Confirmar Ajuste'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={editingProduct === product.id} onOpenChange={(open) => {
                      if (!open) {
                        setEditingProduct(null);
                        setFormData(initialFormData);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Produto</DialogTitle>
                          <DialogDescription>Atualize os dados do produto</DialogDescription>
                        </DialogHeader>
                        <ProductForm />
                        <DialogFooter>
                          <Button onClick={handleUpdate} disabled={updateMutation.isPending || !formData.name || !formData.price}>
                            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Produto</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o produto "{product.name}"?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate({ id: product.id })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {search || showLowStock ? 'Tente uma busca diferente' : 'Comece adicionando seu primeiro produto'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Produtos() {
  return (
    <DashboardLayout>
      <ProdutosContent />
    </DashboardLayout>
  );
}
