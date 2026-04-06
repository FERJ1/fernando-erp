import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryFormData = {
  name: string;
  description: string;
};

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
};

function CategoriasContent() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData);

  const utils = trpc.useUtils();
  const { data: categories, isLoading } = trpc.categories.list.useQuery({});
  
  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success('Categoria criada com sucesso!');
      setIsCreateOpen(false);
      setFormData(initialFormData);
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao criar categoria: ' + error.message);
    }
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success('Categoria atualizada com sucesso!');
      setEditingCategory(null);
      setFormData(initialFormData);
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar categoria: ' + error.message);
    }
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success('Categoria removida com sucesso!');
      utils.categories.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao remover categoria: ' + error.message);
    }
  });

  const handleCreate = () => {
    if (!formData.name) return;
    createMutation.mutate({
      name: formData.name,
      description: formData.description || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingCategory || !formData.name) return;
    updateMutation.mutate({
      id: editingCategory,
      name: formData.name,
      description: formData.description || undefined,
    });
  };

  const openEditDialog = (category: NonNullable<typeof categories>[0]) => {
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setEditingCategory(category.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Organize seus produtos em categorias</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setFormData(initialFormData);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>Crie uma nova categoria para seus produtos</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome da categoria"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da categoria"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createMutation.isPending || !formData.name}>
                {createMutation.isPending ? 'Criando...' : 'Criar Categoria'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <Badge variant="secondary" className="w-fit">
            {categories?.length || 0} categorias
          </Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Dialog open={editingCategory === category.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingCategory(null);
                          setFormData(initialFormData);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Categoria</DialogTitle>
                            <DialogDescription>Atualize os dados da categoria</DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-name">Nome *</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-description">Descrição</Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleUpdate} disabled={updateMutation.isPending || !formData.name}>
                              {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
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
                            <AlertDialogTitle>Remover Categoria</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover a categoria "{category.name}"?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate({ id: category.id })}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhuma categoria encontrada</h3>
              <p className="text-muted-foreground mt-1">Comece criando sua primeira categoria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Categorias() {
  return (
    <DashboardLayout>
      <CategoriasContent />
    </DashboardLayout>
  );
}
