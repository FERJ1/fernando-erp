import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  Brain, TrendingUp, TrendingDown, AlertTriangle,
  Lightbulb, Target, Sparkles, ArrowRight,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const insightConfig: Record<string, { icon: React.ElementType; border: string; bg: string; text: string }> = {
  opportunity: { icon: TrendingUp,      border: "border-l-green-500",  bg: "bg-green-500/10",  text: "text-green-600" },
  warning:     { icon: AlertTriangle,   border: "border-l-amber-500",  bg: "bg-amber-500/10",  text: "text-amber-600" },
  suggestion:  { icon: Lightbulb,       border: "border-l-blue-500",   bg: "bg-blue-500/10",   text: "text-blue-600" },
  goal:        { icon: Target,          border: "border-l-purple-500", bg: "bg-purple-500/10", text: "text-purple-600" },
};

// ─── Conteúdo ───────────────────────────────────────────────────────────────

function InsightsContent() {
  const { data, isLoading } = trpc.insights.generate.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights IA</h1>
          <p className="text-sm text-muted-foreground">Inteligência artificial aplicada ao seu negócio</p>
        </div>
      </div>

      {/* Summary */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            Resumo Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Métricas Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.metrics.map((metric) => (
            <Card key={metric.name}>
              <CardContent className="p-5">
                <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{metric.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {metric.trend === "up" ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {metric.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Insights Identificados</h2>
        <div className="space-y-3">
          {data.insights.map((insight, idx) => {
            const config = insightConfig[insight.type] ?? insightConfig.suggestion;
            const Icon = config.icon;
            return (
              <Card key={idx} className={`border-l-4 ${config.border}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.text}`} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">{insight.title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recomendações</h2>
        <Card>
          <CardContent className="p-5">
            <div className="space-y-4">
              {data.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary flex-shrink-0">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{rec.action}</p>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <Badge variant="secondary" className="text-xs">{rec.impact}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Insights() {
  return <DashboardLayout><InsightsContent /></DashboardLayout>;
}
