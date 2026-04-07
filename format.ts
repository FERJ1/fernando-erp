/**
 * lib/format.ts — Funções de formatação compartilhadas
 *
 * Antes: cada página copiava formatCurrency e formatDate (~6 linhas × 8 arquivos = 48 linhas duplicadas)
 * Agora: importe daqui em todas as páginas
 *
 * Uso:
 *   import { fmt } from "@/lib/format";
 *   fmt.currency(product.price)   → "R$ 1.234,56"
 *   fmt.date(order.createdAt)     → "01/01/2025"
 *   fmt.datetime(order.createdAt) → "01/01/2025 14:30"
 *   fmt.number(1234567)           → "1.234.567"
 *   fmt.percent(0.3356)           → "33,6%"
 */

const ptBR = "pt-BR";

function toNum(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return typeof value === "string" ? parseFloat(value) || 0 : value;
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export const fmt = {
  /** R$ 1.234,56 */
  currency(value: string | number | null | undefined): string {
    return new Intl.NumberFormat(ptBR, {
      style: "currency",
      currency: "BRL",
    }).format(toNum(value));
  },

  /** 01/01/2025 */
  date(value: Date | string | null | undefined): string {
    const d = toDate(value);
    if (!d) return "—";
    return new Intl.DateTimeFormat(ptBR, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d);
  },

  /** 01/01/2025 14:30 */
  datetime(value: Date | string | null | undefined): string {
    const d = toDate(value);
    if (!d) return "—";
    return new Intl.DateTimeFormat(ptBR, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  },

  /** 01/01/2025 14:30:05 */
  datetimeFull(value: Date | string | null | undefined): string {
    const d = toDate(value);
    if (!d) return "—";
    return new Intl.DateTimeFormat(ptBR, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  },

  /** 1.234.567 */
  number(value: number | null | undefined): string {
    return new Intl.NumberFormat(ptBR).format(value ?? 0);
  },

  /** 33,6% (recebe valor decimal: 0.336) */
  percent(value: number | null | undefined, decimals = 1): string {
    return `${((value ?? 0) * 100).toFixed(decimals).replace(".", ",")}%`;
  },

  /** "01/jan." — para labels de gráfico */
  shortDate(value: Date | string | null | undefined): string {
    const d = toDate(value);
    if (!d) return "—";
    return new Intl.DateTimeFormat(ptBR, { day: "2-digit", month: "short" }).format(d);
  },
};
