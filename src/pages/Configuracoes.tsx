import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Info, Shield } from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ──────────────────────────────────────────────────────────────────

interface NotificationPref {
  id: string;
  label: string;
  description: string;
}

const notificationOptions: NotificationPref[] = [
  { id: "lowStock",       label: "Alertas de estoque baixo",  description: "Receba alertas quando produtos atingirem o estoque mínimo" },
  { id: "newOrders",      label: "Novos pedidos",             description: "Notificação ao receber novos pedidos de clientes" },
  { id: "payments",       label: "Pagamentos recebidos",      description: "Confirmação quando um pagamento for registrado" },
  { id: "dueAccounts",    label: "Contas a vencer",           description: "Lembrete de contas próximas do vencimento" },
  { id: "weeklyReports",  label: "Relatórios semanais",       description: "Resumo semanal com indicadores do negócio" },
];

// ─── Conteúdo ───────────────────────────────────────────────────────────────

function ConfiguracoesContent() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    lowStock: true,
    newOrders: true,
    payments: false,
    dueAccounts: true,
    weeklyReports: false,
  });

  function togglePref(id: string) {
    setPrefs((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSave() {
    toast.success("Preferências salvas com sucesso!");
  }

  const today = new Date().toLocaleDateString("pt-BR");

  const systemInfo = [
    { label: "Versão do Sistema",   value: "1.0.0",                        icon: Shield },
    { label: "Ambiente",            value: "Desenvolvimento",              icon: Settings },
    { label: "Banco de Dados",      value: "Mock (Local)",                 icon: Info },
    { label: "Última Atualização",  value: today,                          icon: Info },
    { label: "Empresa",             value: "Confecção Têxtil Fernando",    icon: Settings },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
          <p className="text-sm text-muted-foreground">Gerencie as preferências do sistema</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5">
            <Info className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferências de Notificação</CardTitle>
              <CardDescription>Escolha quais notificações deseja receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationOptions.map((opt) => (
                <div key={opt.id} className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor={opt.id} className="text-sm font-medium cursor-pointer">
                      {opt.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                  <Switch
                    id={opt.id}
                    checked={prefs[opt.id] ?? false}
                    onCheckedChange={() => togglePref(opt.id)}
                  />
                </div>
              ))}
              <div className="pt-2">
                <Button onClick={handleSave}>Salvar</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Sistema</CardTitle>
              <CardDescription>Detalhes sobre a instalação e configuração atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <div key={info.label} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="text-sm font-medium">{info.label}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{info.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Configuracoes() {
  return <DashboardLayout><ConfiguracoesContent /></DashboardLayout>;
}
