import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { 
  FileText, TrendingUp, TrendingDown, DollarSign, 
  Percent, Calendar, Download, ArrowRight, Minus, Equal
} from "lucide-react";

export default function DRE() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(currentMonth / 3).toString());
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  
  const getDateRange = () => {
    const year = parseInt(selectedYear);
    let startDate: Date;
    let endDate: Date;
    
    if (period === "month") {
      const month = parseInt(selectedMonth);
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59);
    } else if (period === "quarter") {
      const quarter = parseInt(selectedQuarter);
      startDate = new Date(year, quarter * 3, 1);
      endDate = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }
    
    return { startDate, endDate };
  };
  
  const { startDate, endDate } = getDateRange();
  
  const { data: dreData, isLoading } = trpc.dre.report.useQuery({
    startDate,
    endDate,
  });
  
  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
  };
  
  const formatPercent = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return `${num.toFixed(2)}%`;
  };
  
  const getPeriodLabel = () => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    if (period === "month") {
      return `${months[parseInt(selectedMonth)]} de ${selectedYear}`;
    } else if (period === "quarter") {
      const q = parseInt(selectedQuarter) + 1;
      return `${q}º Trimestre de ${selectedYear}`;
    } else {
      return `Ano de ${selectedYear}`;
    }
  };
  
  const isPositive = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num >= 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DRE</h1>
            <p className="text-muted-foreground">
              Demonstração do Resultado do Exercício
            </p>
          </div>
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Period Selector */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2">
                <Label>Tipo de Período</Label>
                <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Mensal</SelectItem>
                    <SelectItem value="quarter">Trimestral</SelectItem>
                    <SelectItem value="year">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {period === "month" && (
                <div className="space-y-2">
                  <Label>Mês</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Janeiro</SelectItem>
                      <SelectItem value="1">Fevereiro</SelectItem>
                      <SelectItem value="2">Março</SelectItem>
                      <SelectItem value="3">Abril</SelectItem>
                      <SelectItem value="4">Maio</SelectItem>
                      <SelectItem value="5">Junho</SelectItem>
                      <SelectItem value="6">Julho</SelectItem>
                      <SelectItem value="7">Agosto</SelectItem>
                      <SelectItem value="8">Setembro</SelectItem>
                      <SelectItem value="9">Outubro</SelectItem>
                      <SelectItem value="10">Novembro</SelectItem>
                      <SelectItem value="11">Dezembro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {period === "quarter" && (
                <div className="space-y-2">
                  <Label>Trimestre</Label>
                  <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">1º Trimestre</SelectItem>
                      <SelectItem value="1">2º Trimestre</SelectItem>
                      <SelectItem value="2">3º Trimestre</SelectItem>
                      <SelectItem value="3">4º Trimestre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Ano</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={(currentYear - 2).toString()}>{currentYear - 2}</SelectItem>
                    <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                    <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">Carregando relatório...</div>
        ) : dreData ? (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Receita Bruta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(dreData.summary.totalRevenue)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Lucro Bruto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                    <span className={`text-2xl font-bold ${isPositive(dreData.summary.grossProfit) ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatCurrency(dreData.summary.grossProfit)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margem: {formatPercent(dreData.summary.grossMargin)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Lucro Operacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Percent className="h-5 w-5 text-purple-500" />
                    <span className={`text-2xl font-bold ${isPositive(dreData.summary.operatingProfit) ? 'text-purple-600' : 'text-red-600'}`}>
                      {formatCurrency(dreData.summary.operatingProfit)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margem: {formatPercent(dreData.summary.operatingMargin)}
                  </p>
                </CardContent>
              </Card>
              
              <Card className={isPositive(dreData.summary.netProfit) ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Lucro Líquido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {isPositive(dreData.summary.netProfit) ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`text-2xl font-bold ${isPositive(dreData.summary.netProfit) ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(dreData.summary.netProfit)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Margem: {formatPercent(dreData.summary.netMargin)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* DRE Statement */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Demonstração do Resultado
                </CardTitle>
                <CardDescription>{getPeriodLabel()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {/* Revenue Section */}
                  <div className="py-3 px-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-700 dark:text-green-300">
                        RECEITA OPERACIONAL BRUTA
                      </span>
                      <span className="font-bold text-green-700 dark:text-green-300">
                        {formatCurrency(dreData.summary.totalRevenue)}
                      </span>
                    </div>
                  </div>
                  
                  {dreData.revenue.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-4 pl-8">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span>{formatCurrency(item.total || '0')}</span>
                    </div>
                  ))}
                  
                  {dreData.revenue.length === 0 && (
                    <div className="py-2 px-4 pl-8 text-muted-foreground text-sm">
                      Nenhuma receita registrada no período
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  
                  {/* COGS Section */}
                  <div className="py-3 px-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-700 dark:text-orange-300">
                          CUSTO DOS PRODUTOS VENDIDOS (CPV)
                        </span>
                      </div>
                      <span className="font-bold text-orange-700 dark:text-orange-300">
                        ({formatCurrency(dreData.summary.totalCogs)})
                      </span>
                    </div>
                  </div>
                  
                  {dreData.costs.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-4 pl-8">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="text-red-600">({formatCurrency(item.total || '0')})</span>
                    </div>
                  ))}
                  
                  <Separator className="my-2" />
                  
                  {/* Gross Profit */}
                  <div className="py-3 px-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Equal className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-700 dark:text-blue-300">
                          LUCRO BRUTO
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${isPositive(dreData.summary.grossProfit) ? 'text-blue-700 dark:text-blue-300' : 'text-red-600'}`}>
                          {formatCurrency(dreData.summary.grossProfit)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatPercent(dreData.summary.grossMargin)})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  {/* Operating Expenses */}
                  <div className="py-3 px-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-red-600" />
                        <span className="font-semibold text-red-700 dark:text-red-300">
                          DESPESAS OPERACIONAIS
                        </span>
                      </div>
                      <span className="font-bold text-red-700 dark:text-red-300">
                        ({formatCurrency(dreData.summary.totalExpenses)})
                      </span>
                    </div>
                  </div>
                  
                  {dreData.expenses.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 px-4 pl-8">
                      <span className="text-muted-foreground">{item.category}</span>
                      <span className="text-red-600">({formatCurrency(item.total || '0')})</span>
                    </div>
                  ))}
                  
                  {dreData.expenses.length === 0 && (
                    <div className="py-2 px-4 pl-8 text-muted-foreground text-sm">
                      Nenhuma despesa registrada no período
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  
                  {/* Operating Profit */}
                  <div className="py-3 px-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Equal className="h-4 w-4 text-purple-600" />
                        <span className="font-semibold text-purple-700 dark:text-purple-300">
                          LUCRO OPERACIONAL (EBIT)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${isPositive(dreData.summary.operatingProfit) ? 'text-purple-700 dark:text-purple-300' : 'text-red-600'}`}>
                          {formatCurrency(dreData.summary.operatingProfit)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatPercent(dreData.summary.operatingMargin)})
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  {/* Net Profit */}
                  <div className={`py-4 px-4 rounded-lg ${isPositive(dreData.summary.netProfit) ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Equal className="h-5 w-5" />
                        <span className="font-bold text-lg">
                          LUCRO LÍQUIDO DO EXERCÍCIO
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold text-xl ${isPositive(dreData.summary.netProfit) ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                          {formatCurrency(dreData.summary.netProfit)}
                        </span>
                        <span className="text-sm text-muted-foreground ml-2">
                          ({formatPercent(dreData.summary.netMargin)})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analysis */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Margens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Margem Bruta</span>
                        <span className="font-medium">{formatPercent(dreData.summary.grossMargin)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(parseFloat(dreData.summary.grossMargin), 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Margem Operacional</span>
                        <span className="font-medium">{formatPercent(dreData.summary.operatingMargin)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full"
                          style={{ width: `${Math.max(0, Math.min(parseFloat(dreData.summary.operatingMargin), 100))}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Margem Líquida</span>
                        <span className="font-medium">{formatPercent(dreData.summary.netMargin)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isPositive(dreData.summary.netMargin) ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.max(0, Math.min(Math.abs(parseFloat(dreData.summary.netMargin)), 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Composição do Resultado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm">Receitas</span>
                      </div>
                      <span className="font-medium">{formatCurrency(dreData.summary.totalRevenue)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-xs">menos</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm">Custos (CPV)</span>
                      </div>
                      <span className="font-medium text-red-600">-{formatCurrency(dreData.summary.totalCogs)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <ArrowRight className="h-4 w-4" />
                      <span className="text-xs">menos</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm">Despesas</span>
                      </div>
                      <span className="font-medium text-red-600">-{formatCurrency(dreData.summary.totalExpenses)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isPositive(dreData.summary.netProfit) ? 'bg-green-600' : 'bg-red-600'}`} />
                        <span className="font-medium">Resultado</span>
                      </div>
                      <span className={`font-bold ${isPositive(dreData.summary.netProfit) ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(dreData.summary.netProfit)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um período para gerar o relatório DRE</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
