import type { InvoiceLineItem } from "@/lib/invoice-document";

export function sumInvoiceLineItemTax(items: InvoiceLineItem[]): number | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((sum, item) => sum + (item.tax ?? 0), 0);
}
