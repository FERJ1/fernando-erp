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
import { trpc } from "@/lib/trpc";
import { Plus, Search, Edit, Trash2, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

type CustomerFormData = {
  name: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'cpf' | 'cnpj' | '';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
};

const initialFormData: CustomerFormData = {
  name: '',
  email: '',
  phone: '',
  document: '',
  documentType: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  notes: '',
};

function CustomerForm({ 
  data, 
  onChange, 
  onSubmit, 
  isLoading,
  submitLabel = 'Salvar'
}: { 
  data: CustomerFormData; 
  onChange: (data: CustomerFormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Nome completo ou razão social"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="documentType">Tipo de Documento</Label>
          <Select
            value={data.documentType}
            onValueChange={(value) => onChange({ ...data, documentType: value as 'cpf' | 'cnpj' | '' })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpf">CPF</SelectItem>
              <SelectItem value="cnpj">CNPJ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="document">Documento</Label>
          <Input
            id="document"
            value={data.document}
            onChange={(e) => onChange({ ...data, document: e.target.value })}
            placeholder={data.documentType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={data.phone}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="Rua, número, complemento"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            value={data.state}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            placeholder="UF"
            maxLength={2}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            value={data.zipCode}
            onChange={(e) => onChange({ ...data, zipCode: e.target.value })}
            placeholder="00000-000"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          placeholder="Informações adicionais sobre o cliente"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button onClick={onSubmit} disabled={isLoading || !data.name}>
          {isLoading ? 'Salvando...' : submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}

function ClientesContent() {
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData);

  const utils = trpc.useUtils();
  const { data: customers, isLoading } = trpc.customers.list.useQuery({ search: search || undefined });
  
  const createMutation = trpc.customers.create.useMutation({
    onSuccess: () => {
      toast.success('Cliente criado com sucesso!');
      setIsCreateOpen(false);
      setFormData(initialFormData);
      utils.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao criar cliente: ' + error.message);
    }
  });

  const updateMutation = trpc.customers.update.useMutation({
    onSuccess: () => {
      toast.success('Cliente atualizado com sucesso!');
      setEditingCustomer(null);
      setFormData(initialFormData);
      utils.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar cliente: ' + error.message);
    }
  });

  const deleteMutation = trpc.customers.delete.useMutation({
    onSuccess: () => {
      toast.success('Cliente removido com sucesso!');
      utils.customers.list.invalidate();
    },
    onError: (error) => {
      toast.error('Erro ao remover cliente: ' + error.message);
    }
  });

  const handleCreate = () => {
    createMutation.mutate({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      document: formData.document || null,
      documentType: formData.documentType || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      zipCode: formData.zipCode || null,
      notes: formData.notes || null,
    });
  };

  const handleUpdate = () => {
    if (!editingCustomer) return;
    updateMutation.mutate({
      id: editingCustomer,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      document: formData.document || null,
      documentType: formData.documentType || null,
      address: formData.address || null,
      city: formData.city || null,
      state: formData.state || null,
      zipCode: formData.zipCode || null,
      notes: formData.notes || null,
    });
  };

  const openEditDialog = (customer: NonNullable<typeof customers>[0]) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      document: customer.document || '',
      documentType: customer.documentType || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zipCode: customer.zipCode || '',
      notes: customer.notes || '',
    });
    setEditingCustomer(customer.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes e suas informações</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) setFormData(initialFormData);
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Cliente</DialogTitle>
              <DialogDescription>Preencha os dados do novo cliente</DialogDescription>
            </DialogHeader>
            <CustomerForm
              data={formData}
              onChange={setFormData}
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Criar Cliente"
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou documento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="secondary">
              {customers?.length || 0} clientes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : customers && customers.length > 0 ? (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{customer.name}</h3>
                        {customer.documentType && (
                          <Badge variant="outline" className="text-xs">
                            {customer.documentType.toUpperCase()}
                          </Badge>
                        )}
                        {!customer.isActive && (
                          <Badge variant="destructive" className="text-xs">Inativo</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </span>
                        )}
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </span>
                        )}
                        {customer.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {customer.city}{customer.state ? `, ${customer.state}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={editingCustomer === customer.id} onOpenChange={(open) => {
                      if (!open) {
                        setEditingCustomer(null);
                        setFormData(initialFormData);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(customer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Cliente</DialogTitle>
                          <DialogDescription>Atualize os dados do cliente</DialogDescription>
                        </DialogHeader>
                        <CustomerForm
                          data={formData}
                          onChange={setFormData}
                          onSubmit={handleUpdate}
                          isLoading={updateMutation.isPending}
                          submitLabel="Salvar Alterações"
                        />
                      </DialogContent>
                    </Dialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Cliente</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover o cliente "{customer.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteMutation.mutate({ id: customer.id })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground mt-1">
                {search ? 'Tente uma busca diferente' : 'Comece adicionando seu primeiro cliente'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Clientes() {
  return (
    <DashboardLayout>
      <ClientesContent />
    </DashboardLayout>
  );
}
