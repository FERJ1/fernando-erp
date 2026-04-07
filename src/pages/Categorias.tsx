import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { EmptyState } from "@/components/EmptyState";
import { Tags, Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type CategoryFormData = {
  name: string;
  description: string;
};

const emptyForm: CategoryFormData = { name: "", description: "" };

// ─── Conteudo principal ─────────────────────────────────────────────────────

function CategoriasContent() {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryFormData>({ ...emptyForm });

  const utils = trpc.useUtils();

  const { data: categories, isLoading } = trpc.categories.list.useQuery({});

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Categoria criada com sucesso!");
      setIsCreateOpen(false);
      setForm({ ...emptyForm });
      utils.categories.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Categoria atualizada!");
      setEditingId(null);
      setForm({ ...emptyForm });
      utils.categories.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Categoria removida!");
      utils.categories.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.categories.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    if (!categories || !search) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q),
    );
  }, [categories, search]);

  const handleCreate = () => {
    if (!form.name.trim()) return;
    createMutation.mutate({ name: form.name.trim(), description: form.description.trim() });
  };

  const handleUpdate = () => {
    if (!editingId || !form.name.trim()) return;
    updateMutation.mutate({
      id: editingId,
      name: form.name.trim(),
      description: form.description.trim(),
    });
  };

  const openEdit = (cat: { id: number; name: string; description?: string | null }) => {
    setForm({ name: cat.name, description: cat.description ?? "" });
    setEditingId(cat.id);
  };

  const handleToggle = (cat: { id: number; name: string; description?: string | null; isActive: boolean }) => {
    toggleMutation.mutate({
      id: cat.id,
      name: cat.name,
      description: cat.description ?? "",
      isActive: !cat.isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie as categorias de produtos do seu catalogo
          </p>
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) setForm({ ...emptyForm });
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
              <DialogDescription>
                Preencha os dados para criar uma nova categoria
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Nome *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Camisetas, Tecidos..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Descricao</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descricao opcional da categoria"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleCreate}
                disabled={createMutation.isPending || !form.name.trim()}
              >
                {createMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categorias..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Grid de categorias */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered && filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat) => (
            <Card
              key={cat.id}
              className={`transition-colors ${!cat.isActive ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Tags className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{cat.name}</CardTitle>
                    </div>
                  </div>
                  <Badge variant={cat.isActive ? "default" : "secondary"}>
                    {cat.isActive ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-2 min-h-[2.5rem]">
                  {cat.description || "Sem descricao"}
                </CardDescription>

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Criada em{" "}
                    {new Date(cat.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                  <div className="flex items-center gap-1">
                    {/* Toggle ativo/inativo */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      title={cat.isActive ? "Desativar" : "Ativar"}
                      onClick={() => handleToggle(cat)}
                      disabled={toggleMutation.isPending}
                    >
                      {cat.isActive ? (
                        <ToggleRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>

                    {/* Editar */}
                    <Dialog
                      open={editingId === cat.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setEditingId(null);
                          setForm({ ...emptyForm });
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Editar Categoria</DialogTitle>
                          <DialogDescription>
                            Altere os dados da categoria
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label>Nome *</Label>
                            <Input
                              value={form.name}
                              onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                              }
                              placeholder="Nome da categoria"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Descricao</Label>
                            <Input
                              value={form.description}
                              onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                              }
                              placeholder="Descricao da categoria"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleUpdate}
                            disabled={
                              updateMutation.isPending || !form.name.trim()
                            }
                          >
                            {updateMutation.isPending ? "Salvando..." : "Salvar"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Excluir */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Remover categoria "{cat.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acao nao pode ser desfeita. Todos os produtos
                            vinculados a esta categoria ficarao sem categoria.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate({ id: cat.id })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Tags}
              title="Nenhuma categoria encontrada"
              description='Clique em "Nova Categoria" para comecar'
              hasFilter={!!search}
            />
          </CardContent>
        </Card>
      )}
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
