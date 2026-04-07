import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { fmt } from "@/lib/format";
import { AuditActionBadge, entityLabels } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Shield, Search, User, Clock, FileText } from "lucide-react";
import { useState } from "react";

function AuditoriaContent() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");

  // FIX: busca usuários para mostrar nome real em vez de "Usuário #ID"
  const { data: users } = trpc.users.list.useQuery();
  const userMap = new Map(users?.map(u => [u.id, u.name ?? u.email ?? `#${u.id}`]) ?? []);

  const { data: logs, isLoading } = trpc.audit.list.useQuery({
    entity: entityFilter !== "all" ? entityFilter : undefined,
    limit: 200,
  });

  const filtered = logs?.filter(log => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      log.entity?.toLowerCase().includes(q) ||
      log.action?.toLowerCase().includes(q) ||
      log.details?.toLowerCase().includes(q) ||
      (userMap.get(log.userId) ?? "").toLowerCase().includes(q);
    const matchAction = actionFilter === "all" || log.action === actionFilter;
    return matchSearch && matchAction;
  });

  const hasFilter = !!(search || actionFilter !== "all" || entityFilter !== "all");

  // Ações únicas presentes nos logs para popular o filtro dinamicamente
  const knownActions = ["create", "update", "delete", "mark_paid", "stock_adjustment", "update_status", "update_payment", "reconcile", "unreconcile", "import"];
  const actionLabels: Record<string, string> = {
    create: "Criação", update: "Atualização", delete: "Exclusão",
    mark_paid: "Pagamento", stock_adjustment: "Ajuste estoque",
    update_status: "Mudança status", update_payment: "Atualiz. pgto",
    reconcile: "Conciliado", unreconcile: "Desconciliado", import: "Importação",
  };

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
        <Badge variant="secondary">{filtered?.length ?? 0} registros</Badge>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário, entidade ou descrição..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {/* Filtro de ação */}
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {knownActions.map(a => (
                  <SelectItem key={a} value={a}>{actionLabels[a] ?? a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Filtro de entidade */}
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Entidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as entidades</SelectItem>
                {Object.entries(entityLabels).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : filtered && filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map(log => {
                // FIX: resolve nome real do usuário
                const userName = userMap.get(log.userId) ?? `Usuário #${log.userId}`;
                const entityLabel = entityLabels[log.entity] ?? log.entity;

                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                    {/* Avatar do usuário */}
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{userName}</span>
                        <AuditActionBadge action={log.action} />
                        <Badge variant="outline" className="text-xs">{entityLabel}</Badge>
                        {log.entityId && (
                          <span className="text-xs text-muted-foreground">#{log.entityId}</span>
                        )}
                      </div>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {(() => {
                            // Tenta renderizar o JSON de details de forma legível
                            try {
                              const parsed = JSON.parse(log.details);
                              // Mostra só os campos relevantes (name, amount, status, etc.)
                              const preview = ["name", "amount", "status", "type", "orderNumber"]
                                .filter(k => parsed[k] !== undefined)
                                .map(k => `${k}: ${parsed[k]}`)
                                .join(" · ");
                              return preview || log.details;
                            } catch {
                              return log.details;
                            }
                          })()}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {fmt.datetimeFull(log.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhum registro encontrado"
              description="As ações do sistema aparecerão aqui"
              hasFilter={hasFilter}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Auditoria() {
  return <DashboardLayout><AuditoriaContent /></DashboardLayout>;
}
