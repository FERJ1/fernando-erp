import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { Settings, Bell, Shield, Database, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function ConfiguracoesContent() {
  const { user } = useAuth();
  const [notifyNewOrders, setNotifyNewOrders] = useState(true);
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  const handleSaveNotifications = () => {
    toast.success('Configurações de notificação salvas!');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Acesso Restrito</h3>
            <p className="text-muted-foreground mt-1">
              Apenas administradores podem acessar as configurações do sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure quando você deseja receber notificações por email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Novos Pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificação quando um novo pedido for criado
                  </p>
                </div>
                <Switch
                  checked={notifyNewOrders}
                  onCheckedChange={setNotifyNewOrders}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Estoque Baixo</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alerta quando produtos atingirem estoque mínimo
                  </p>
                </div>
                <Switch
                  checked={notifyLowStock}
                  onCheckedChange={setNotifyLowStock}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Contas Vencidas</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber alerta sobre contas a pagar/receber vencidas
                  </p>
                </div>
                <Switch
                  checked={notifyOverdue}
                  onCheckedChange={setNotifyOverdue}
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSaveNotifications}>
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configurações gerais do sistema ERP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="lowStock">Limite de Estoque Baixo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="lowStock"
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    unidades (padrão para novos produtos)
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Informações do Sistema</h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Versão</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Administrador</span>
                    <span>{user?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button onClick={() => toast.success('Configurações salvas!')}>
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Configuracoes() {
  return (
    <DashboardLayout>
      <ConfiguracoesContent />
    </DashboardLayout>
  );
}
