import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import {
  Plus, Search, Edit, Trash2, Users, ToggleLeft, ToggleRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ─── Tipos e constantes ─────────────────────────────────────────────────────

type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  type: "PF" | "PJ";
  document: string;
  address: string;
  city: string;
  state: string;
  notes: string;
};

const emptyForm: CustomerFormData = {
  name: "", email: "", phone: "", type: "PF",
  document: "", address: "", city: "", state: "", notes: "",
};

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

// ─── Formulário de cliente ─────────────────────────────────────────────────

function CustomerFormFields({
  form,
  onChange,
}: {
  form: CustomerFormData;
  onChange: (f: CustomerFormData) => void;
}) {
  const set = (patch: Partial<CustomerFormData>) =>
    onChange({ ...form, ...patch });

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Nome *</Label>
        <Input
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Nome completo ou razão social"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="grid gap-2">
          <Label>Telefone</Label>
          <Input
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tipo *</Label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              set({ type: v as "PF" | "PJ", document: "" })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PF">Pessoa Física</SelectItem>
              <SelectItem value="PJ">Pessoa Jurídica</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>{form.type === "PF" ? "CPF" : "CNPJ"} *</Label>
          <Input
            value={form.document}
            onChange={(e) => set({ document: e.target.value })}
            placeholder={
              form.type === "PF" ? "000.000.000-00" : "00.000.000/0000-00"
            }
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Endereço</Label>
        <Input
          value={form.address}
          onChange={(e) => set({ address: e.target.value })}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Cidade</Label>
          <Input
            value={form.city}
            onChange={(e) => set({ city: e.target.value })}
            placeholder="Cidade"
          />
        </div>
        <div className="grid gap-2">
          <Label>Estado</Label>
          <Select
            value={form.state}
            onValueChange={(v) => set({ state: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="UF" />
            </SelectTrigger>
            <SelectContent>
              {brazilianStates.map((uf) => (
                <SelectItem key={uf} value={uf}>
                  {uf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          rows={3}
          placeholder="Informações adicionais sobre o cliente"
        />
      </div>
    </div>
  );
}

// ─── Conteúdo principal ─────────────────────────────────────────────────────

function ClientesContent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [form, setForm] = useState<CustomerFormData>({ ...emptyForm });

  const utils = trpc.useUtils();

  const { data: customers, isLoading } = trpc.customers.list.useQuery({
    search: search || undefined,
    isActive:
      statusFilter === "active"
        ? true
        : statusFilter === "inactive"
          ? false
          : undefined,
  });

  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente cadastrado com sucesso!");
      setIsCreateOpen(false);
      setForm({ ...emptyForm });
      utils.customers.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      setEditingId(null);
      setForm({ ...emptyForm });
      utils.customers.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente removido com sucesso!");
      setDeletingId(null);
      utils.customers.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      toast.success("Status do cliente atualizado!");
      utils.customers.list.invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // ─── Contadores ──────────────────────────────────────────────────────────

  const totalCount = customers?.length ?? 0;
  const activeCount = customers?.filter((c) => c.isActive).length ?? 0;

  const hasFilter = !!(search || statusFilter !== "all");

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCreate = () => {
    if (!form.name || !form.document) {
      toast.error("Preencha os campos obrigatórios: Nome e CPF/CNPJ.");
      return;
    }
    createMutation.mutate({
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      type: form.type,
      document: form.document,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      notes: form.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId || !form.name || !form.document) {
      toast.error("Preencha os campos obrigatórios: Nome e CPF/CNPJ.");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      name: form.name,
      email: form.email || undefined,
      phone: form.phone || undefined,
      type: form.type,
      document: form.document,
      address: form.address || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      notes: form.notes || undefined,
    });
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate({ id: deletingId });
  };

  const handleToggleActive = (
    customer: NonNullable<typeof customers>[number],
  ) => {
    toggleMutation.mutate({
      id: customer.id,
      isActive: !customer.isActive,
    });
  };

  const openEdit = (customer: NonNullable<typeof customers>[number]) => {
    setForm({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      type: customer.type as "PF" | "PJ",
      document: customer.document,
      address: customer.address ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      notes: customer.notes ?? "",
    });
    setEditingId(customer.id);
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Cabeçalho com contadores */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : totalCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <ToggleRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? <Skeleton className="h-8 w-16" /> : activeCount}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativos</CardTitle>
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                totalCount - activeCount
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de busca e filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Clientes</CardTitle>
            <Button onClick={() => { setForm({ ...emptyForm }); setIsCreateOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter(v as "all" | "active" | "inactive")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !customers || customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum cliente encontrado"
              description="Cadastre seu primeiro cliente para começar"
              hasFilter={hasFilter}
              action={
                !hasFilter ? (
                  <Button onClick={() => { setForm({ ...emptyForm }); setIsCreateOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Cliente
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {customer.email || "—"}
                      </TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {customer.type === "PJ"
                            ? "Pessoa Jurídica"
                            : "Pessoa Física"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {customer.document}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.isActive ? "default" : "secondary"
                          }
                        >
                          {customer.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={
                              customer.isActive
                                ? "Desativar cliente"
                                : "Ativar cliente"
                            }
                            onClick={() => handleToggleActive(customer)}
                          >
                            {customer.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar cliente"
                            onClick={() => openEdit(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Excluir cliente"
                            onClick={() => setDeletingId(customer.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de criação */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados para cadastrar um novo cliente.
            </DialogDescription>
          </DialogHeader>
          <CustomerFormFields form={form} onChange={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Salvando..." : "Cadastrar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de edição */}
      <Dialog
        open={editingId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingId(null);
            setForm({ ...emptyForm });
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
            <DialogDescription>
              Atualize os dados do cliente.
            </DialogDescription>
          </DialogHeader>
          <CustomerFormFields form={form} onChange={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setForm({ ...emptyForm });
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de exclusão */}
      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Página ─────────────────────────────────────────────────────────────────

export default function Clientes() {
  return (
    <DashboardLayout>
      <ClientesContent />
    </DashboardLayout>
  );
}
