import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import { FinancialStatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import {
  Plus, Search, TrendingUp, TrendingDown, DollarSign,
  AlertTriangle, Edit, Trash2, CheckCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// ─── Tipos e constantes ─────────────────────────────────────────────────────

type TransactionFormData = {
  type: "income" | "expense";
  category: string;
  description: string;
  amount: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  paymentMethod: string;
  notes: string;
};

const emptyForm: TransactionFormData = {
  type: "income", category: "", description: "", amount: "",
  status: "pending", dueDate: "", paymentMethod: "", notes: "",
};

const incomeCategories  = ["Vendas", "Serviços", "Investimentos", "Comissões", "Outros"];
const expenseCategories = ["Fornecedores", "Salários", "Aluguel", "Utilidades", "Marketing", "Impostos", "Logística", "Outros"];
const paymentMethods    = ["Dinheiro", "PIX", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Transferência"];

// ─── Formulário de transação ────────────────────────────────────────────────

function TransactionFormFields({ form, onChange }: { form: TransactionFormData; onChange: (f: TransactionFormData) => void }) {
  const categories = form.type === "income" ? incomeCategories : expenseCategories;
  const set = (patch: Partial<TransactionFormData>) => onChange({ ...form, ...patch });

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tipo *</Label>
          <Select value={form.type} onValueChange={v => set({ type: v as "income" | "expense", category: "" })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Categoria *</Label>
          <Select value={form.category} onValueChange={v => set({ category: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descrição</Label>
        <Input value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Descrição da transação" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Valor (R$) *</Label>
          <Input
            type="number" step="0.01" min="0"
            value={form.amount}
            onChange={e => set({ amount: e.target.value })}
            placeholder="0,00"
          />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={v => set({ status: v as TransactionFormData["status"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
              <SelectItem value="cancelled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Vencimento</Label>
          <Input type="date" value={form.dueDate} onChange={e => set({ dueDate: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Forma de pagamento</Label>
          <Select value={form.paymentMethod} onValueChange={v => set({ paymentMethod: v })}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {paymentMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Notas</Label>
        <Textarea value={form.notes} onChange={e => set({ notes: e.target.value })} rows={2} placeholder="Informações adicionais" />
      </div>
    </div>
  );
}

// ─── Conteúdo principal ─────────────────────────────────────────────────────

function FinanceiroContent() {
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<TransactionFormData>({ ...emptyForm });

  const utils = trpc.useUtils();

  const { data: transactions, isLoading } = trpc.financial.list.useQuery({
    type: activeTab,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const { data: overdue } = trpc.financial.getOverdue.useQuery();
  const { data: stats }   = trpc.dashboard.stats.useQuery();

  const createMutation = trpc.financial.create.useMutation({
    onSuccess: () => { toast.success("Transação criada!"); setIsCreateOpen(false); setForm({ ...emptyForm }); utils.financial.list.invalidate(); utils.dashboard.stats.invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = trpc.financial.update.useMutation({
    onSuccess: () => { toast.success("Transação atualizada!"); setEditingId(null); utils.financial.list.invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = trpc.financial.delete.useMutation({
    onSuccess: () => { toast.success("Transação removida!"); utils.financial.list.invalidate(); utils.dashboard.stats.invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const markPaidMutation = trpc.financial.markAsPaid.useMutation({
    onSuccess: () => { toast.success("Marcado como pago!"); utils.financial.list.invalidate(); utils.dashboard.stats.invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Filtragem local por busca (descrição, categoria)
  const filtered = useMemo(() => {
    if (!transactions || !search) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(t =>
      t.description?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const hasFilter = !!(search || statusFilter !== "all");

  const handleCreate = () => {
    if (!form.category || !form.amount) return;
    createMutation.mutate({
      ...form,
      dueDate:  form.dueDate  ? new Date(form.dueDate + "T12:00:00") : undefined,
      paidDate: form.status === "paid" ? new Date() : undefined,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateMutation.mutate({
      id: editingId,
      ...form,
      dueDate:  form.dueDate  ? new Date(form.dueDate + "T12:00:00") : undefined,
      paymentMethod: form.paymentMethod || undefined,
      notes: form.notes || undefined,
    });
  };

  const openEdit = (t: NonNullable<typeof transactions>[0]) => {
    setForm({
      type: t.type,
      category: t.category,
      description: t.description ?? "",
      amount: t.amount,
      status: t.status,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split("T")[0] : "",
      paymentMethod: t.paymentMethod ?? "",
      notes: t.notes ?? "",
    });
    setEditingId(t.id);
  };

  return (
    <div className="space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">Controle de receitas e despesas</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={open => { setIsCreateOpen(open); if (!open) setForm({ ...emptyForm }); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Nova Transação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova Transação</DialogTitle><DialogDescription>Cadastre uma receita ou despesa</DialogDescription></DialogHeader>
            <TransactionFormFields form={form} onChange={setForm} />
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createMutation.isPending || !form.category || !form.amount}>
                {createMutation.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "A receber",     value: fmt.currency(stats?.pendingReceivables),  color: "text-green-600" },
          { label: "A pagar",       value: fmt.currency(stats?.pendingPayables),     color: "text-red-600"   },
          { label: "Receita/mês",   value: fmt.currency(stats?.incomeThisMonth),     color: "text-green-600" },
          { label: "Despesa/mês",   value: fmt.currency(stats?.expensesThisMonth),   color: "text-red-600"   },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardHeader className="pb-1"><CardDescription>{label}</CardDescription></CardHeader>
            <CardContent><p className={`text-2xl font-bold ${color}`}>{value}</p></CardContent>
          </Card>
        ))}
      </div>

      {/* Vencidas */}
      {overdue && overdue.length > 0 && (
        <Card className="border-red-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" /> {overdue.length} conta(s) vencida(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdue.slice(0, 3).map(t => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t.description || t.category} · venceu em {fmt.date(t.dueDate)}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-red-600">{fmt.currency(t.amount)}</span>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markPaidMutation.mutate({ id: t.id })}>Pagar</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs receitas / despesas */}
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v as "income" | "expense"); setSearch(""); setStatusFilter("all"); }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="income" className="gap-2"><TrendingUp className="h-4 w-4" /> Receitas</TabsTrigger>
            <TabsTrigger value="expense" className="gap-2"><TrendingDown className="h-4 w-4" /> Despesas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Vencido</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(["income", "expense"] as const).map(tab => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-6 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : filtered && filtered.length > 0 ? (
                  <div className="divide-y">
                    {filtered.map(t => {
                      const isIncome = t.type === "income";
                      return (
                        <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? "bg-green-500/10" : "bg-red-500/10"}`}>
                            {isIncome ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{t.description || t.category}</p>
                            <p className="text-xs text-muted-foreground">
                              {t.category}{t.dueDate ? ` · vence ${fmt.date(t.dueDate)}` : ""}
                            </p>
                          </div>
                          <FinancialStatusBadge status={t.status} />
                          <p className={`font-semibold tabular-nums text-sm ${isIncome ? "text-green-600" : "text-red-600"}`}>
                            {isIncome ? "+" : "-"}{fmt.currency(t.amount)}
                          </p>
                          <div className="flex items-center gap-1">
                            {t.status === "pending" && (
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" title="Marcar como pago" onClick={() => markPaidMutation.mutate({ id: t.id })}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Dialog open={editingId === t.id} onOpenChange={open => { if (!open) setEditingId(null); }}>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(t)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader><DialogTitle>Editar Transação</DialogTitle></DialogHeader>
                                <TransactionFormFields form={form} onChange={setForm} />
                                <DialogFooter>
                                  <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? "Salvando..." : "Salvar"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remover transação?</AlertDialogTitle>
                                  <AlertDialogDescription>O status será alterado para "Cancelado".</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMutation.mutate({ id: t.id })} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Remover
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6">
                    <EmptyState
                      icon={tab === "income" ? TrendingUp : TrendingDown}
                      title={`Nenhuma ${tab === "income" ? "receita" : "despesa"} encontrada`}
                      description={`Clique em "Nova Transação" para começar`}
                      hasFilter={hasFilter}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function Financeiro() {
  return <DashboardLayout><FinanceiroContent /></DashboardLayout>;
}
