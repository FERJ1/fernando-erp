/**
 * components/EmptyState.tsx — Estado vazio reutilizável
 *
 * Antes: cada página tinha seu próprio bloco de "nenhum registro" com
 *        ícone, título e descrição copiados manualmente.
 * Agora: um componente único com variante de filtro ativo.
 *
 * Uso:
 *   <EmptyState
 *     icon={Package}
 *     title="Nenhum produto encontrado"
 *     description="Comece cadastrando seu primeiro produto"
 *     action={<Button onClick={...}>Novo Produto</Button>}
 *   />
 *
 *   // Com filtro ativo — muda a descrição automaticamente:
 *   <EmptyState
 *     icon={Package}
 *     title="Nenhum produto encontrado"
 *     description="Comece cadastrando seu primeiro produto"
 *     hasFilter  // ← adiciona "Tente ajustar os filtros" como descrição
 *   />
 */

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  hasFilter?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, hasFilter }: EmptyStateProps) {
  const desc = hasFilter ? "Tente ajustar os filtros de busca" : description;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      {desc && (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{desc}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
