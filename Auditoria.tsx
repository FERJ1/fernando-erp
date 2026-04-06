import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Search, Shield, User, Clock, FileText } from "lucide-react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  return new Intl.DateTimeFormat('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date));
}

const actionConfig: Record<string, { label: string; color: string }> = {
  create: { label: 'Criação', color: 'bg-green-500/15 text-green-600 border-green-500/30' },
  update: { label: 'Atualização', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  delete: { label: 'Exclusão', color: 'bg-red-500/15 text-red-600 border-red-500/30' },
  login: { label: 'Login', color: 'bg-purple-500/15 text-purple-600 border-purple-500/30' },
  logout: { label: 'Logout', color: 'bg-gray-500/15 text-gray-600 border-gray-500/30' },
  status_change: { label: 'Mudança de Status', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  payment: { label: 'Pagamento', color: 'bg-cyan-500/15 text-cyan-600 border-cyan-500/30' },
};

const entityLabels: Record<string, string> = {
  customer: 'Cliente',
  product: 'Produto',
  order: 'Pedido',
  financial: 'Financeiro',
  category: 'Categoria',
  user: 'Usuário',
  stock: 'Estoque',
};

function AuditoriaContent() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');

  const { data: logs, isLoading } = trpc.audit.list.useQuery({
    entity: entityFilter && entityFilter !== 'all' ? entityFilter : undefined,
    limit: 100,
  });

  const filteredLogs = logs?.filter(log => {
    if (!search && (!actionFilter || actionFilter === 'all')) return true;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search || (
      log.details?.toLowerCase().includes(searchLower) ||
      log.entity?.toLowerCase().includes(searchLower) ||
      log.action?.toLowerCase().includes(searchLower)
    );
    const matchesAction = !actionFilter || actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Auditoria
          </h1>
          <p className="text-muted-foreground">Histórico de ações realizadas no sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descrição ou usuário..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Entidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(entityLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge variant="secondary">
                {filteredLogs?.length || 0} registros
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLogs && filteredLogs.length > 0 ? (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const action = actionConfig[log.action] || { label: log.action, color: 'bg-gray-500/15 text-gray-600' };
                const entityLabel = entityLabels[log.entity] || log.entity;
                
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">Usuário #{log.userId}</span>
                        <Badge className={action.color}>{action.label}</Badge>
                        <Badge variant="outline">{entityLabel}</Badge>
                        {log.entityId && (
                          <span className="text-xs text-muted-foreground">
                            #{log.entityId}
                          </span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {log.details}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(log.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum registro encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {search || actionFilter || entityFilter 
                  ? 'Tente ajustar os filtros' 
                  : 'As ações do sistema serão registradas aqui'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Auditoria() {
  return (
    <DashboardLayout>
      <AuditoriaContent />
    </DashboardLayout>
  );
}
