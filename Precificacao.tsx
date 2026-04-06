import { useState } from "react";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calculator, Plus, Pencil, Trash2, TrendingUp, DollarSign, Percent, Target, ArrowRight, Info } from "lucide-react";

export default function Precificacao() {
  const [activeTab, setActiveTab] = useState("calculator");
  
  // Calculator state
  const [costPrice, setCostPrice] = useState("");
  const [additionalCosts, setAdditionalCosts] = useState("");
  const [calcType, setCalcType] = useState<"markup" | "margin" | "fixed">("markup");
  const [calcValue, setCalcValue] = useState("");
  
  // Reverse calculator state
  const [reverseCost, setReverseCost] = useState("");
  const [reversePrice, setReversePrice] = useState("");
  
  // Rule dialog state
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [ruleName, setRuleName] = useState("");
  const [ruleDescription, setRuleDescription] = useState("");
  const [ruleType, setRuleType] = useState<"markup" | "margin" | "fixed">("markup");
  const [ruleValue, setRuleValue] = useState("");
  const [ruleCategoryId, setRuleCategoryId] = useState<string>("");
  
  const utils = trpc.useUtils();
  const { data: categories } = trpc.categories.list.useQuery({ isActive: true });
  const { data: pricingRules, isLoading: rulesLoading } = trpc.pricing.rules.list.useQuery({ isActive: true });
  
  const calculateMutation = trpc.pricing.calculate.useQuery(
    {
      costPrice: parseFloat(costPrice) || 0,
      type: calcType,
      value: parseFloat(calcValue) || 0,
      additionalCosts: parseFloat(additionalCosts) || 0,
    },
    { enabled: !!costPrice && !!calcValue }
  );
  
  const analyzeMutation = trpc.pricing.analyzePrice.useQuery(
    {
      costPrice: parseFloat(reverseCost) || 0,
      sellingPrice: parseFloat(reversePrice) || 0,
    },
    { enabled: !!reverseCost && !!reversePrice }
  );
  
  const createRuleMutation = trpc.pricing.rules.create.useMutation({
    onSuccess: () => {
      toast.success("Regra de precificação criada com sucesso!");
      utils.pricing.rules.list.invalidate();
      resetRuleForm();
      setIsRuleDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  
  const updateRuleMutation = trpc.pricing.rules.update.useMutation({
    onSuccess: () => {
      toast.success("Regra atualizada com sucesso!");
      utils.pricing.rules.list.invalidate();
      resetRuleForm();
      setIsRuleDialogOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  
  const deleteRuleMutation = trpc.pricing.rules.delete.useMutation({
    onSuccess: () => {
      toast.success("Regra excluída com sucesso!");
      utils.pricing.rules.list.invalidate();
    },
    onError: (error) => toast.error(error.message),
  });
  
  const resetRuleForm = () => {
    setEditingRule(null);
    setRuleName("");
    setRuleDescription("");
    setRuleType("markup");
    setRuleValue("");
    setRuleCategoryId("");
  };
  
  const openEditDialog = (rule: any) => {
    setEditingRule(rule);
    setRuleName(rule.name);
    setRuleDescription(rule.description || "");
    setRuleType(rule.type);
    setRuleValue(rule.value);
    setRuleCategoryId(rule.categoryId?.toString() || "");
    setIsRuleDialogOpen(true);
  };
  
  const handleSaveRule = () => {
    if (!ruleName || !ruleValue) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    const data = {
      name: ruleName,
      description: ruleDescription || null,
      type: ruleType,
      value: ruleValue,
      categoryId: ruleCategoryId ? parseInt(ruleCategoryId) : null,
    };
    
    if (editingRule) {
      updateRuleMutation.mutate({ id: editingRule.id, ...data });
    } else {
      createRuleMutation.mutate(data);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'markup': return 'Markup';
      case 'margin': return 'Margem';
      case 'fixed': return 'Lucro Fixo';
      default: return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Precificação</h1>
          <p className="text-muted-foreground">
            Calcule preços de venda e gerencie regras de precificação
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="calculator">Calculadora</TabsTrigger>
            <TabsTrigger value="reverse">Análise</TabsTrigger>
            <TabsTrigger value="rules">Regras</TabsTrigger>
          </TabsList>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Calcular Preço de Venda
                  </CardTitle>
                  <CardDescription>
                    Informe o custo e a margem desejada para calcular o preço
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Custo do Produto (R$)</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additionalCosts">Custos Adicionais (R$)</Label>
                    <Input
                      id="additionalCosts"
                      type="number"
                      step="0.01"
                      placeholder="Frete, impostos, etc."
                      value={additionalCosts}
                      onChange={(e) => setAdditionalCosts(e.target.value)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label>Método de Cálculo</Label>
                    <Select value={calcType} onValueChange={(v: any) => setCalcType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="markup">Markup (%)</SelectItem>
                        <SelectItem value="margin">Margem de Lucro (%)</SelectItem>
                        <SelectItem value="fixed">Lucro Fixo (R$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="calcValue">
                      {calcType === 'fixed' ? 'Valor do Lucro (R$)' : 'Percentual (%)'}
                    </Label>
                    <Input
                      id="calcValue"
                      type="number"
                      step="0.01"
                      placeholder={calcType === 'fixed' ? '0,00' : '0'}
                      value={calcValue}
                      onChange={(e) => setCalcValue(e.target.value)}
                    />
                  </div>
                  
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div>
                        {calcType === 'markup' && (
                          <p><strong>Markup:</strong> Percentual sobre o custo. Ex: Custo R$100 + 50% markup = R$150</p>
                        )}
                        {calcType === 'margin' && (
                          <p><strong>Margem:</strong> Percentual do preço final. Ex: Para margem de 30%, preço = custo ÷ 0,70</p>
                        )}
                        {calcType === 'fixed' && (
                          <p><strong>Lucro Fixo:</strong> Valor fixo adicionado ao custo. Ex: Custo R$100 + R$50 = R$150</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Resultado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {calculateMutation.data ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Preço Sugerido</p>
                        <p className="text-4xl font-bold text-primary">
                          {formatCurrency(calculateMutation.data.suggestedPrice)}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground mb-1">Margem</p>
                          <p className="text-xl font-semibold text-green-600">
                            {formatPercent(calculateMutation.data.margin)}
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-background">
                          <p className="text-xs text-muted-foreground mb-1">Markup</p>
                          <p className="text-xl font-semibold text-blue-600">
                            {formatPercent(calculateMutation.data.markup)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                        <p className="text-sm text-muted-foreground mb-1">Lucro por Unidade</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(calculateMutation.data.profit)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span>{formatCurrency(parseFloat(costPrice) + parseFloat(additionalCosts || '0'))}</span>
                        <ArrowRight className="h-4 w-4" />
                        <span className="font-medium text-foreground">
                          {formatCurrency(calculateMutation.data.suggestedPrice)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                      <Calculator className="h-12 w-12 mb-4 opacity-50" />
                      <p>Preencha os campos para calcular</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reverse Analysis Tab */}
          <TabsContent value="reverse" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Análise de Preço
                  </CardTitle>
                  <CardDescription>
                    Descubra a margem e markup de um preço existente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reverseCost">Custo do Produto (R$)</Label>
                    <Input
                      id="reverseCost"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={reverseCost}
                      onChange={(e) => setReverseCost(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reversePrice">Preço de Venda (R$)</Label>
                    <Input
                      id="reversePrice"
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={reversePrice}
                      onChange={(e) => setReversePrice(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10">
                <CardHeader>
                  <CardTitle>Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  {analyzeMutation.data ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-background">
                          <Percent className="h-6 w-6 mx-auto mb-2 text-green-600" />
                          <p className="text-xs text-muted-foreground mb-1">Margem de Lucro</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPercent(analyzeMutation.data.margin)}
                          </p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-background">
                          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                          <p className="text-xs text-muted-foreground mb-1">Markup</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPercent(analyzeMutation.data.markup)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg bg-background">
                        <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="text-xs text-muted-foreground mb-1">Lucro por Unidade</p>
                        <p className="text-3xl font-bold text-primary">
                          {formatCurrency(analyzeMutation.data.profit)}
                        </p>
                      </div>
                      
                      {analyzeMutation.data.margin < 10 && (
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 text-sm">
                          ⚠️ Margem baixa! Considere revisar o preço de venda.
                        </div>
                      )}
                      
                      {analyzeMutation.data.profit < 0 && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-sm">
                          🚨 Prejuízo! O preço de venda está abaixo do custo.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[250px] text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
                      <p>Informe custo e preço para analisar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Regras de Precificação</CardTitle>
                  <CardDescription>
                    Configure regras padrão para categorias de produtos
                  </CardDescription>
                </div>
                <Dialog open={isRuleDialogOpen} onOpenChange={(open) => {
                  setIsRuleDialogOpen(open);
                  if (!open) resetRuleForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Regra
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingRule ? 'Editar Regra' : 'Nova Regra de Precificação'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure uma regra de precificação para aplicar automaticamente
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="ruleName">Nome da Regra *</Label>
                        <Input
                          id="ruleName"
                          value={ruleName}
                          onChange={(e) => setRuleName(e.target.value)}
                          placeholder="Ex: Markup Padrão"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ruleDescription">Descrição</Label>
                        <Input
                          id="ruleDescription"
                          value={ruleDescription}
                          onChange={(e) => setRuleDescription(e.target.value)}
                          placeholder="Descrição opcional"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tipo de Cálculo</Label>
                        <Select value={ruleType} onValueChange={(v: any) => setRuleType(v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="markup">Markup (%)</SelectItem>
                            <SelectItem value="margin">Margem (%)</SelectItem>
                            <SelectItem value="fixed">Lucro Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ruleValue">Valor *</Label>
                        <Input
                          id="ruleValue"
                          type="number"
                          step="0.01"
                          value={ruleValue}
                          onChange={(e) => setRuleValue(e.target.value)}
                          placeholder={ruleType === 'fixed' ? '0,00' : '0'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Categoria (opcional)</Label>
                        <Select value={ruleCategoryId} onValueChange={setRuleCategoryId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todas as categorias" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas as categorias</SelectItem>
                            {categories?.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSaveRule}
                        disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
                      >
                        {editingRule ? 'Salvar' : 'Criar'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {rulesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Carregando...</div>
                ) : pricingRules && pricingRules.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pricingRules.map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{rule.name}</p>
                              {rule.description && (
                                <p className="text-sm text-muted-foreground">{rule.description}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getTypeLabel(rule.type)}</Badge>
                          </TableCell>
                          <TableCell>
                            {rule.type === 'fixed' 
                              ? formatCurrency(parseFloat(rule.value))
                              : `${rule.value}%`
                            }
                          </TableCell>
                          <TableCell>
                            {rule.categoryId 
                              ? categories?.find(c => c.id === rule.categoryId)?.name || '-'
                              : 'Todas'
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(rule)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Excluir esta regra?')) {
                                    deleteRuleMutation.mutate({ id: rule.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma regra de precificação cadastrada</p>
                    <p className="text-sm">Crie regras para automatizar a precificação</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
