/**
 * components/StatusBadge.tsx — Badge de status tipado
 *
 * Antes: cada página definia seu próprio statusConfig com cores hardcoded.
 * Agora: um componente único que centraliza todos os status do ERP.
 *
 * Uso:
 *   <StatusBadge status="pending" type="order" />
 *   <StatusBadge status="paid"    type="payment" />
 *   <StatusBadge status="overdue" type="financial" />
 */

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle, XCircle, Clock, Truck, Package,
  AlertTriangle,
} from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "partial" | "refunded";
type FinancialStatus = "pending" | "paid" | "overdue" | "cancelled";
type AuditAction = "create" | "update" | "delete" | "mark_paid" | "stock_adjustment" | "update_status" | "update_payment" | "reconcile" | "unreconcile" | "import";

const orderConfig: Record<OrderStatus, { label: string; className: string; icon: React.ElementType }> = {
  pending:    { label: "Pendente",         className: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: Clock },
  confirmed:  { label: "Confirmado",       className: "bg-blue-500/15 text-blue-700 border-blue-500/30",   icon: CheckCircle },
  processing: { label: "Em processamento", className: "bg-purple-500/15 text-purple-700 border-purple-500/30", icon: Package },
  shipped:    { label: "Enviado",          className: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30",   icon: Truck },
  delivered:  { label: "Entregue",         className: "bg-green-500/15 text-green-700 border-green-500/30", icon: CheckCircle },
  cancelled:  { label: "Cancelado",        className: "bg-red-500/15 text-red-700 border-red-500/30",      icon: XCircle },
};

const paymentConfig: Record<PaymentStatus, { label: string; className: string }> = {
  pending:  { label: "Pendente",     className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  paid:     { label: "Pago",         className: "bg-green-500/15 text-green-700 border-green-500/30" },
  partial:  { label: "Parcial",      className: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  refunded: { label: "Reembolsado",  className: "bg-gray-500/15 text-gray-700 border-gray-500/30" },
};

const financialConfig: Record<FinancialStatus, { label: string; className: string }> = {
  pending:   { label: "Pendente",  className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  paid:      { label: "Pago",      className: "bg-green-500/15 text-green-700 border-green-500/30" },
  overdue:   { label: "Vencido",   className: "bg-red-500/15 text-red-700 border-red-500/30" },
  cancelled: { label: "Cancelado", className: "bg-gray-500/15 text-gray-700 border-gray-500/30" },
};

const auditConfig: Record<string, { label: string; className: string }> = {
  create:           { label: "Criação",         className: "bg-green-500/15 text-green-700 border-green-500/30" },
  update:           { label: "Atualização",      className: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
  delete:           { label: "Exclusão",         className: "bg-red-500/15 text-red-700 border-red-500/30" },
  mark_paid:        { label: "Pagamento",        className: "bg-cyan-500/15 text-cyan-700 border-cyan-500/30" },
  stock_adjustment: { label: "Ajuste estoque",   className: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
  update_status:    { label: "Mudança status",   className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  update_payment:   { label: "Atualiz. pgto",   className: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  reconcile:        { label: "Conciliado",       className: "bg-teal-500/15 text-teal-700 border-teal-500/30" },
  unreconcile:      { label: "Desconciliado",    className: "bg-gray-500/15 text-gray-700 border-gray-500/30" },
  import:           { label: "Importação",       className: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30" },
};

// ─── Componente para status de pedido (com ícone) ───────────────────────────
export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = orderConfig[status as OrderStatus] ?? { label: status, className: "bg-gray-500/15 text-gray-700", icon: Clock };
  const Icon = cfg.icon;
  return (
    <Badge className={`gap-1 border ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

// ─── Componente para status de pagamento ────────────────────────────────────
export function PaymentStatusBadge({ status }: { status: string }) {
  const cfg = paymentConfig[status as PaymentStatus] ?? { label: status, className: "bg-gray-500/15 text-gray-700" };
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}

// ─── Componente para status financeiro ──────────────────────────────────────
export function FinancialStatusBadge({ status }: { status: string }) {
  const cfg = financialConfig[status as FinancialStatus] ?? { label: status, className: "bg-gray-500/15 text-gray-700" };
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}

// ─── Componente para ação de auditoria ──────────────────────────────────────
export function AuditActionBadge({ action }: { action: string }) {
  const cfg = auditConfig[action] ?? { label: action, className: "bg-gray-500/15 text-gray-700" };
  return <Badge className={`border ${cfg.className}`}>{cfg.label}</Badge>;
}

export const entityLabels: Record<string, string> = {
  customer:              "Cliente",
  product:               "Produto",
  order:                 "Pedido",
  financial_transaction: "Financeiro",
  category:              "Categoria",
  bank_account:          "Conta bancária",
  bank_transaction:      "Transação bancária",
  pricing_rule:          "Regra de preço",
  dre_category:          "Categoria DRE",
};
