import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { sumInvoiceLineItemTax } from "@/components/invoice/tax-summary";

export type InvoiceOverallTotalSummary = {
  subtotal: number | null;
  tax: number | null;
  total: string | number | null;
};

function toNumber(value: string | number | null): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function getInvoiceOverallTotalSummary(
  invoice: InvoiceDocumentData,
): InvoiceOverallTotalSummary {
  const servicesTax = sumInvoiceLineItemTax(invoice.services.items);
  const total = toNumber(invoice.total);
  const subtotal =
    total !== null && servicesTax !== null
      ? total - servicesTax
      : invoice.subtotal;

  return {
    subtotal,
    tax: servicesTax,
    total: invoice.total,
  };
}
