import { useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Building2, Plus, Pencil, Trash2, Upload, FileSpreadsheet, 
  Check, X, Link2, Unlink, AlertCircle, CheckCircle2, 
  ArrowUpRight, ArrowDownLeft, Wallet, RefreshCw
} from "lucide-react";
import { nanoid } from "nanoid";

interface ParsedTransaction {
  transactionDate: Date;
  description: string;
  amount: string;
  type: 'credit' | 'debit';
  balance?: string;
  externalId?: string;
}

export default function ConciliacaoBancaria() {
  const [activeTab, setActiveTab] = useState("accounts");
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  // Account dialog state
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [agency, setAgency] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings" | "investment">("checking");
  const [initialBalance, setInitialBalance] = useState("");
  
  // Import state
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [importAccountId, setImportAccountId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Reconciliation state
  const [selectedBankTransaction, setSelectedBankTransaction] = useState<any>(null);
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);
  
  const utils = trpc.useUtils();
  const { data: bankAccounts, isLoading: accountsLoading } = trpc.bankAccounts.list.useQuery({ isActive: true });
  const { data: bankTransactions, isLoading: transactionsLoading } = trpc.bankTransactions.list.useQuery(
    selectedAccountId ? { bankAccountId: selectedAccountId } : {},
    { enabled: !!selectedAccountId }
  );
  const { data: unreconciledTransactions } = trpc.bankTransactions.getUnreconciled.useQuery(
    { bankAccountId: selectedAccountId! },
    { enabled: !!selectedAccountId }
  );
  const { data: financialTransactions } = trpc.financial.list.useQuery({});
  
  const createAccountMutation = trpc.bankAccounts.create.useMutation({
    onSuccess: () => {
      toast.success("Conta bancária criada com sucesso!");
      utils.bankAccounts.list.invalidate();
      resetAccountForm();
      setIsAccountDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateAccountMutation = trpc.bankAccounts.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      utils.bankAccounts.list.invalidate();
      resetAccountForm();
      setIsAccountDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteAccountMutation = trpc.bankAccounts.delete.useMutation({
    onSuccess: () => {
      toast.success("Conta excluída com sucesso!");
      utils.bankAccounts.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const importMutation = trpc.bankTransactions.import.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.imported} transações importadas com sucesso!`);
      utils.bankTransactions.list.invalidate();
      utils.bankTransactions.getUnreconciled.invalidate();
      setParsedTransactions([]);
      setIsImportDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  
  const reconcileMutation = trpc.bankTransactions.reconcile.useMutation({
    onSuccess: () => {
      toast.success("Transação conciliada com sucesso!");
      utils.bankTransactions.list.invalidate();
      utils.bankTransactions.getUnreconciled.invalidate();
      setIsReconcileDialogOpen(false);
      setSelectedBankTransaction(null);
    },
    onError: (error) => toast.error(error.message),
  });
  
  const unreconcileMutation = trpc.bankTransactions.unreconcile.useMutation({
    onSuccess: () => {
      toast.success("Conciliação desfeita!");
      utils.bankTransactions.list.invalidate();
      utils.bankTransactions.getUnreconciled.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const resetAccountForm = () => {
    setEditingAccount(null);
    setAccountName("");
    setBankName("");
    setAccountNumber("");
    setAgency("");
    setAccountType("checking");
    setInitialBalance("");
  };
  
  const openEditAccountDialog = (account: any) => {
    setEditingAccount(account);
    setAccountName(account.name);
    setBankName(account.bankName || "");
    setAccountNumber(account.accountNumber || "");
    setAgency(account.agency || "");
    setAccountType(account.accountType || "checking");
    setInitialBalance(account.initialBalance || "");
    setIsAccountDialogOpen(true);
  };
  
  const handleSaveAccount = () => {
    if (!accountName) {
      toast.error("Informe o nome da conta");
      return;
    }
    
    const data = {
      name: accountName,
      bankName: bankName || null,
      accountNumber: accountNumber || null,
      agency: agency || null,
      accountType,
      initialBalance: initialBalance || "0",
      currentBalance: initialBalance || "0",
    };
    
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, ...data });
    } else {
      createAccountMutation.mutate(data);
    }
  };
  
  const parseCSV = (content: string): ParsedTransaction[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const transactions: ParsedTransaction[] = [];
    
    // Skip header
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(';').map(c => c.trim().replace(/"/g, ''));
      if (cols.length >= 3) {
        const dateStr = cols[0];
        const description = cols[1];
        const amountStr = cols[2].replace(',', '.').replace(/[^\d.-]/g, '');
        const amount = parseFloat(amountStr);
        
        if (!isNaN(amount) && dateStr) {
          const [day, month, year] = dateStr.split('/');
          const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          
          transactions.push({
            transactionDate: date,
            description,
            amount: Math.abs(amount).toFixed(2),
            type: amount >= 0 ? 'credit' : 'debit',
            balance: cols[3]?.replace(',', '.').replace(/[^\d.-]/g, '') || undefined,
          });
        }
      }
    }
    
    return transactions;
  };
  
  const parseOFX = (content: string): ParsedTransaction[] => {
    const transactions: ParsedTransaction[] = [];
    const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let match;
    
    while ((match = stmtTrnRegex.exec(content)) !== null) {
      const block = match[1];
      
      const getTag = (tag: string) => {
        const regex = new RegExp(`<${tag}>([^<\\n]+)`, 'i');
        const m = block.match(regex);
        return m ? m[1].trim() : '';
      };
      
      const trnType = getTag('TRNTYPE');
      const dtPosted = getTag('DTPOSTED');
      const trnAmt = getTag('TRNAMT');
      const memo = getTag('MEMO') || getTag('NAME');
      const fitId = getTag('FITID');
      
      if (dtPosted && trnAmt) {
        const year = parseInt(dtPosted.substring(0, 4));
        const month = parseInt(dtPosted.substring(4, 6)) - 1;
        const day = parseInt(dtPosted.substring(6, 8));
        const date = new Date(year, month, day);
        
        const amount = parseFloat(trnAmt.replace(',', '.'));
        
        transactions.push({
          transactionDate: date,
          description: memo,
          amount: Math.abs(amount).toFixed(2),
          type: amount >= 0 ? 'credit' : 'debit',
          externalId: fitId,
        });
      }
    }
    
    return transactions;
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      let transactions: ParsedTransaction[] = [];
      
      if (file.name.toLowerCase().endsWith('.ofx')) {
        transactions = parseOFX(content);
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        transactions = parseCSV(content);
      } else {
        toast.error("Formato não suportado. Use arquivos .OFX ou .CSV");
        return;
      }
      
      if (transactions.length === 0) {
        toast.error("Nenhuma transação encontrada no arquivo");
        return;
      }
      
      setParsedTransactions(transactions);
      toast.success(`${transactions.length} transações encontradas`);
    };
    
    reader.readAsText(file);
  };
  
  const handleImport = () => {
    if (!importAccountId) {
      toast.error("Selecione uma conta bancária");
      return;
    }
    
    if (parsedTransactions.length === 0) {
      toast.error("Nenhuma transação para importar");
      return;
    }
    
    importMutation.mutate({
      bankAccountId: parseInt(importAccountId),
      transactions: parsedTransactions,
      importBatchId: nanoid(10),
    });
  };
  
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };
  
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };
  
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'investment': return 'Investimento';
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conciliação Bancária</h1>
          <p className="text-muted-foreground">
            Importe extratos e concilie transações com seu financeiro
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
            <TabsTrigger value="accounts">Contas Bancárias</TabsTrigger>
            <TabsTrigger value="import">Importar Extrato</TabsTrigger>
            <TabsTrigger value="reconcile">Conciliar</TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Contas Bancárias</CardTitle>
                  <CardDescription>Gerencie suas contas para conciliação</CardDescription>
                </div>
                <Dialog open={isAccountDialogOpen} onOpenChange={(open) => {
                  setIsAccountDialogOpen(open);
                  if (!open) resetAccountForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAccount ? 'Editar Conta' : 'Nova Conta Bancária'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nome da Conta *</Label>
                        <Input
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                          placeholder="Ex: Conta Principal"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Banco</Label>
                          <Input
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            placeholder="Ex: Itaú"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo</Label>
                          <Select value={accountType} onValueChange={(v: any) => setAccountType(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="checking">Conta Corrente</SelectItem>
                              <SelectItem value="savings">Poupança</SelectItem>
                              <SelectItem value="investment">Investimento</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Agência</Label>
                          <Input
                            value={agency}
                            onChange={(e) => setAgency(e.target.value)}
                            placeholder="0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Número da Conta</Label>
                          <Input
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            placeholder="00000-0"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Saldo Inicial (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={initialBalance}
                          onChange={(e) => setInitialBalance(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveAccount} disabled={createAccountMutation.isPending || updateAccountMutation.isPending}>
                        {editingAccount ? 'Salvar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="text-center py-8">Carregando...</div>
                ) : bankAccounts && bankAccounts.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {bankAccounts.map((account) => (
                      <Card key={account.id} className="relative">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-muted-foreground" />
                              <CardTitle className="text-lg">{account.name}</CardTitle>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditAccountDialog(account)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => {
                                if (confirm('Excluir esta conta?')) {
                                  deleteAccountMutation.mutate({ id: account.id });
                                }
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <CardDescription>
                            {account.bankName && `${account.bankName} • `}
                            {getAccountTypeLabel(account.accountType || 'checking')}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {account.agency && account.accountNumber && (
                              <p className="text-sm text-muted-foreground">
                                Ag: {account.agency} | Cc: {account.accountNumber}
                              </p>
                            )}
                            <div className="pt-2">
                              <p className="text-xs text-muted-foreground">Saldo Atual</p>
                              <p className="text-2xl font-bold">
                                {formatCurrency(account.currentBalance || '0')}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conta bancária cadastrada</p>
                    <p className="text-sm">Adicione uma conta para começar a conciliação</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Importar Extrato Bancário
                </CardTitle>
                <CardDescription>
                  Faça upload de arquivos OFX ou CSV do seu banco
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Conta Bancária</Label>
                  <Select value={importAccountId} onValueChange={setImportAccountId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name} {account.bankName && `(${account.bankName})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ofx,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Arraste um arquivo ou clique para selecionar</p>
                  <p className="text-sm text-muted-foreground mb-4">Formatos suportados: OFX, CSV</p>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Selecionar Arquivo
                  </Button>
                </div>
                
                {parsedTransactions.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Transações Encontradas ({parsedTransactions.length})</h3>
                        <Button onClick={handleImport} disabled={importMutation.isPending}>
                          <Upload className="h-4 w-4 mr-2" />
                          Importar Todas
                        </Button>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Descrição</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedTransactions.map((t, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{formatDate(t.transactionDate)}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                                <TableCell>
                                  {t.type === 'credit' ? (
                                    <Badge variant="outline" className="text-green-600">
                                      <ArrowDownLeft className="h-3 w-3 mr-1" />
                                      Crédito
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-red-600">
                                      <ArrowUpRight className="h-3 w-3 mr-1" />
                                      Débito
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reconcile Tab */}
          <TabsContent value="reconcile" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="md:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Selecione a Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select 
                    value={selectedAccountId?.toString() || ""} 
                    onValueChange={(v) => setSelectedAccountId(parseInt(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Conta bancária" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
              
              {selectedAccountId && unreconciledTransactions && (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Não Conciliadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <span className="text-2xl font-bold">{unreconciledTransactions.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Conciliadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-2xl font-bold">
                          {(bankTransactions?.length || 0) - unreconciledTransactions.length}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">Total Importado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold">{bankTransactions?.length || 0}</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {selectedAccountId && (
              <Card>
                <CardHeader>
                  <CardTitle>Transações para Conciliar</CardTitle>
                  <CardDescription>
                    Vincule as transações do extrato com seu controle financeiro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {transactionsLoading ? (
                    <div className="text-center py-8">Carregando...</div>
                  ) : bankTransactions && bankTransactions.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bankTransactions.map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              {t.reconciled ? (
                                <Badge variant="outline" className="text-green-600">
                                  <Check className="h-3 w-3 mr-1" />
                                  Conciliada
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-yellow-600">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Pendente
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(t.transactionDate)}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                            <TableCell>
                              {t.type === 'credit' ? (
                                <span className="text-green-600">Crédito</span>
                              ) : (
                                <span className="text-red-600">Débito</span>
                              )}
                            </TableCell>
                            <TableCell className={`text-right font-medium ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                            </TableCell>
                            <TableCell className="text-right">
                              {t.reconciled ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => unreconcileMutation.mutate({ bankTransactionId: t.id })}
                                >
                                  <Unlink className="h-4 w-4 mr-1" />
                                  Desfazer
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBankTransaction(t);
                                    setIsReconcileDialogOpen(true);
                                  }}
                                >
                                  <Link2 className="h-4 w-4 mr-1" />
                                  Conciliar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma transação importada</p>
                      <p className="text-sm">Importe um extrato para começar a conciliação</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reconcile Dialog */}
            <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Conciliar Transação</DialogTitle>
                  <DialogDescription>
                    Selecione a transação financeira correspondente
                  </DialogDescription>
                </DialogHeader>
                
                {selectedBankTransaction && (
                  <div className="space-y-4">
                    <Card className="bg-muted/50">
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground mb-1">Transação do Extrato</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{selectedBankTransaction.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(selectedBankTransaction.transactionDate)}
                            </p>
                          </div>
                          <p className={`text-xl font-bold ${selectedBankTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedBankTransaction.type === 'credit' ? '+' : '-'}
                            {formatCurrency(selectedBankTransaction.amount)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Separator />
                    
                    <div>
                      <p className="font-medium mb-3">Transações Financeiras Compatíveis</p>
                      <ScrollArea className="h-[250px]">
                        {financialTransactions?.filter(ft => {
                          const ftAmount = parseFloat(ft.amount);
                          const btAmount = parseFloat(selectedBankTransaction.amount);
                          return Math.abs(ftAmount - btAmount) < 0.01;
                        }).map((ft) => (
                          <div
                            key={ft.id}
                            className="flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-muted/50 cursor-pointer"
                            onClick={() => {
                              reconcileMutation.mutate({
                                bankTransactionId: selectedBankTransaction.id,
                                financialTransactionId: ft.id,
                              });
                            }}
                          >
                            <div>
                              <p className="font-medium">{ft.description || ft.category}</p>
                              <p className="text-sm text-muted-foreground">
                                {ft.dueDate ? formatDate(ft.dueDate) : 'Sem vencimento'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold ${ft.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(ft.amount)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {ft.status === 'paid' ? 'Pago' : 'Pendente'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        
                        {(!financialTransactions || financialTransactions.filter(ft => {
                          const ftAmount = parseFloat(ft.amount);
                          const btAmount = parseFloat(selectedBankTransaction.amount);
                          return Math.abs(ftAmount - btAmount) < 0.01;
                        }).length === 0) && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Nenhuma transação com valor compatível encontrada</p>
                            <p className="text-sm">Cadastre a transação no módulo Financeiro primeiro</p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>
                  </div>
                )}
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReconcileDialogOpen(false)}>
                    Cancelar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
