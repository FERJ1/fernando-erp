import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Sparkles, RefreshCw, TrendingUp, AlertTriangle, Lightbulb, Target } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";

type Insight = {
  type: string;
  title: string;
  description: string;
};

type Recommendation = {
  action: string;
  impact?: string;
};

type Metric = {
  name: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
};

function InsightsContent() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { data: insights, isLoading, refetch } = trpc.insights.generate.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleRefresh = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'suggestion': return <Lightbulb className="h-5 w-5 text-blue-600" />;
      case 'goal': return <Target className="h-5 w-5 text-purple-600" />;
      default: return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'opportunity': return 'border-l-green-500 bg-green-500/5';
      case 'warning': return 'border-l-amber-500 bg-amber-500/5';
      case 'suggestion': return 'border-l-blue-500 bg-blue-500/5';
      case 'goal': return 'border-l-purple-500 bg-purple-500/5';
      default: return 'border-l-primary bg-primary/5';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Insights Inteligentes
          </h1>
          <p className="text-muted-foreground">
            Análises e recomendações geradas por inteligência artificial
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading || isGenerating}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Gerando...' : 'Atualizar Insights'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : insights ? (
        <div className="space-y-6">
          {/* Main Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Análise Geral do Negócio
              </CardTitle>
              <CardDescription>
                Visão completa baseada nos dados do seu sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none dark:prose-invert">
              <Streamdown>{insights.summary}</Streamdown>
            </CardContent>
          </Card>

          {/* Key Insights */}
          {insights.insights && insights.insights.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Principais Insights</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {insights.insights.map((insight: Insight, index: number) => (
                  <Card key={index} className={`border-l-4 ${getColorForType(insight.type)}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getIconForType(insight.type)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{insight.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-amber-500" />
                  Recomendações de Ação
                </CardTitle>
                <CardDescription>
                  Sugestões práticas para melhorar o desempenho do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((rec: Recommendation, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">{rec.action}</p>
                        {rec.impact && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Impacto esperado: {rec.impact}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {insights.metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Performance</CardTitle>
                <CardDescription>Indicadores-chave do seu negócio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {insights.metrics.map((metric: Metric, index: number) => (
                    <div key={index} className="p-4 rounded-lg border bg-card">
                      <p className="text-sm text-muted-foreground">{metric.name}</p>
                      <p className="text-2xl font-bold mt-1">{metric.value}</p>
                      {metric.trend && (
                        <p className={`text-sm mt-1 ${
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                        }`}>
                          {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.change}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nenhum insight disponível</h3>
            <p className="text-muted-foreground mt-1">
              Clique em "Atualizar Insights" para gerar análises baseadas nos seus dados
            </p>
            <Button onClick={handleRefresh} className="mt-4 gap-2">
              <Sparkles className="h-4 w-4" />
              Gerar Insights
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function Insights() {
  return (
    <DashboardLayout>
      <InsightsContent />
    </DashboardLayout>
  );
}
