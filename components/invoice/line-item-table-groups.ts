import type {
  InvoiceLineItem,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";

export type InvoiceLineItemTableGroup = {
  label: string;
  items: InvoiceLineItem[];
  subtotal: number | null;
};

function normalizeLineItemType(value: string | null, fallback: string): string {
  const trimmedValue = value?.trim();

  return trimmedValue || fallback;
}

function sumLineItems(items: InvoiceLineItem[]): number | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((sum, item) => sum + (item.total ?? 0), 0);
}

function sumLineItemNetTotals(items: InvoiceLineItem[]): number | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce(
    (sum, item) => sum + getInvoiceLineItemNetTotal(item),
    0,
  );
}

export function getInvoiceLineItemNetTotal(item: InvoiceLineItem): number {
  return (item.total ?? 0) - (item.tax ?? 0);
}

export function getInvoiceLineItemTableGroups(
  group: InvoiceLineItemGroup,
  options: { excludeTax?: boolean } = {},
): InvoiceLineItemTableGroup[] {
  const groups = new Map<string, InvoiceLineItem[]>();

  for (const item of group.items) {
    const label = normalizeLineItemType(item.type, group.label);
    const items = groups.get(label) ?? [];
    items.push(item);
    groups.set(label, items);
  }

  return [...groups.entries()].map(([label, items]) => ({
    label,
    items,
    subtotal: options.excludeTax ? sumLineItemNetTotals(items) : sumLineItems(items),
  }));
}
