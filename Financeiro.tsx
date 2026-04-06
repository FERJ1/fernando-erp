import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, AlertTriangle, CheckCircle, Clock, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type TransactionFormData = {
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paymentMethod: string;
  notes: string;
};

const initialFormData: TransactionFormData = {
  type: 'income',
  category: '',
  description: '',
  amount: '',
  status: 'pending',
  dueDate: '',
  paymentMethod: '',
  notes: '',
};

const incomeCategories = ['Vendas', 'Serviços', 'Investimentos', 'Outros'];
const expenseCategories = ['Fornecedores', 'Salários', 'Aluguel', 'Utilidades', 'Marketing', 'Impostos', 'Outros'];
const paymentMethods = ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Transferência'];

function formatCurrency(value: string | number | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : (value || 0);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30', icon: Clock },
  paid: { label: 'Pago', color: 'bg-green-500/15 text-green-600 border-green-500/30', icon: CheckCircle },
  overdue: { label: 'Vencido', color: 'bg-red-500/15 text-red-600 border-red-500/30', icon: AlertTriangle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-500/15 text-gray-600 border-gray-500/30', icon: AlertTriangle },
};

function FinanceiroContent() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('income');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<number | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(initialFormData);

  const utils = trpc.useUtils();
  const { data: transactions, isLoading } = trpc.financial.list.useQuery({
    type: activeTab,
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
  });
  const { data: overdueTransactions } = trpc.financial.getOverdue.useQuery();
  const { data: stats } = trpc.dashboard.stats.useQuery();

  const createMutation = trpc.financial.create.useMutation({
    onSuccess: () => {
      toast.success('Transação criada com sucesso!');
      setIsCreateOpen(false);
      setFormData(initialFormData);
      utils.financial.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao criar transação: ' + error.message);
    }
  });

  const updateMutation = trpc.financial.update.useMutation({
    onSuccess: () => {
      toast.success('Transação atualizada!');
      setEditingTransaction(null);
      setFormData(initialFormData);
      utils.financial.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    }
  });

  const markAsPaidMutation = trpc.financial.markAsPaid.useMutation({
    onSuccess: () => {
      toast.success('Marcado como pago!');
      utils.financial.list.invalidate();
      utils.financial.getOverdue.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    }
  });

  const deleteMutation = trpc.financial.delete.useMutation({
    onSuccess: () => {
      toast.success('Transação removida!');
      utils.financial.list.invalidate();
      utils.dashboard.stats.invalidate();
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    }
  });

  const handleCreate = () => {
    if (!formData.category || !formData.amount) return;
    createMutation.mutate({
      type: formData.type,
      category: formData.category,
      description: formData.description || null,
      amount: formData.amount,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      paymentMethod: formData.paymentMethod || null,
      notes: formData.notes || null,
    });
  };

  const handleUpdate = () => {
    if (!editingTransaction) return;
    updateMutation.mutate({
      id: editingTransaction,
      category: formData.category,
      description: formData.description || null,
      amount: formData.amount,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      paymentMethod: formData.paymentMethod || null,
      notes: formData.notes || null,
    });
  };

  const openCreateDialog = (type: 'income' | 'expense') => {
    setFormData({ ...initialFormData, type });
    setIsCreateOpen(true);
  };

  const openEditDialog = (transaction: NonNullable<typeof transactions>[0]) => {
    setFormData({
      type: transaction.type,
      category: transaction.category,
      description: transaction.description || '',
      amount: transaction.amount,
      status: transaction.status,
      dueDate: transaction.dueDate ? new Date(transaction.dueDate).toISOString().split('T')[0] : '',
      paymentMethod: transaction.paymentMethod || '',
      notes: transaction.notes || '',
    });
    setEditingTransaction(transaction.id);
  };

  const TransactionForm = () => (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Categoria *</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {(formData.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Valor *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Descrição</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descrição da transação"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Vencimento</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Forma de Pagamento</Label>
          <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method} value={method}>{method}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Observações adicionais"
          rows={2}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão Financeira</h1>
          <p className="text-muted-foreground">Controle de contas a pagar e receber</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => openCreateDialog('expense')}>
            <TrendingDown className="h-4 w-4 text-red-500" />
            Nova Despesa
          </Button>
          <Button className="gap-2" onClick={() => openCreateDialog('income')}>
            <TrendingUp className="h-4 w-4" />
            Nova Receita
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats?.pendingReceivables)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">A Pagar</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats?.pendingPayables)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita do Mês</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.incomeThisMonth)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${Number(stats?.overdueCount) > 0 ? 'border-l-amber-500' : 'border-l-gray-300'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vencidas</p>
                <p className={`text-2xl font-bold ${Number(stats?.overdueCount) > 0 ? 'text-amber-600' : ''}`}>
                  {stats?.overdueCount || 0}
                </p>
              </div>
              <AlertTriangle className={`h-8 w-8 ${Number(stats?.overdueCount) > 0 ? 'text-amber-500/30' : 'text-gray-300'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {overdueTransactions && overdueTransactions.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Contas Vencidas
            </CardTitle>
            <CardDescription>Você tem {overdueTransactions.length} conta(s) vencida(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overdueTransactions.slice(0, 3).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded bg-background">
                  <div>
                    <span className="font-medium">{t.description || t.category}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      Venceu em {formatDate(t.dueDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(t.amount)}
                    </span>
                    <Button size="sm" onClick={() => markAsPaidMutation.mutate({ id: t.id })}>
                      Marcar Pago
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingTransaction} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingTransaction(null);
          setFormData(initialFormData);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? 'Editar Transação' : formData.type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction ? 'Atualize os dados da transação' : 'Preencha os dados da transação'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm />
          <DialogFooter>
            <Button 
              onClick={editingTransaction ? handleUpdate : handleCreate} 
              disabled={createMutation.isPending || updateMutation.isPending || !formData.category || !formData.amount}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions List */}
      <Card>
        <CardHeader className="pb-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="income" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Receitas
                </TabsTrigger>
                <TabsTrigger value="expense" className="gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Despesas
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="secondary">
                  {transactions?.length || 0} transações
                </Badge>
              </div>
            </div>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const status = statusConfig[transaction.status as keyof typeof statusConfig];
                const isIncome = transaction.type === 'income';
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isIncome ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {isIncome ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{transaction.description || transaction.category}</h3>
                          <Badge variant="outline" className="text-xs">{transaction.category}</Badge>
                          <Badge className={status?.color}>{status?.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {transaction.dueDate ? `Vencimento: ${formatDate(transaction.dueDate)}` : 'Sem vencimento'}
                          {transaction.paymentMethod && ` • ${transaction.paymentMethod}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        {transaction.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => markAsPaidMutation.mutate({ id: transaction.id })}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Pagar
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(transaction)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover Transação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover esta transação?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate({ id: transaction.id })}
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
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhuma transação encontrada</h3>
              <p className="text-muted-foreground mt-1">
                {statusFilter ? 'Tente um filtro diferente' : `Comece adicionando sua primeira ${activeTab === 'income' ? 'receita' : 'despesa'}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Financeiro() {
  return (
    <DashboardLayout>
      <FinanceiroContent />
    </DashboardLayout>
  );
}
