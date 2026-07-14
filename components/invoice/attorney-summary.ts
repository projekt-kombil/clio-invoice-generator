import type { InvoiceDocumentData } from "@/lib/invoice-document";

export type InvoiceAttorneySummaryRow = {
  name: string;
  entries: number;
  quantity: number | null;
  total: number | null;
};

export type InvoiceLegalTeam = {
  principal: string;
  lawyers: string[];
};

function addNullableNumber(current: number | null, next: number | null): number | null {
  if (next === null) {
    return current;
  }

  return (current ?? 0) + next;
}

export function getInvoiceAttorneySummary(
  invoice: InvoiceDocumentData,
): InvoiceAttorneySummaryRow[] {
  const rows = new Map<string, InvoiceAttorneySummaryRow>();
  const items = [...invoice.services.items, ...invoice.expenses.items];

  for (const item of items) {
    const name = item.attorney?.trim() || "Unassigned";
    const row = rows.get(name) ?? {
      name,
      entries: 0,
      quantity: null,
      total: null,
    };

    row.entries += 1;
    row.quantity = addNullableNumber(row.quantity, item.quantity);
    row.total = addNullableNumber(row.total, item.total);
    rows.set(name, row);
  }

  return [...rows.values()].sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

export function getInvoiceLegalTeam(invoice: InvoiceDocumentData): InvoiceLegalTeam {
  const principal = invoice.firm.principalName.trim();
  const lawyerNames = getInvoiceAttorneySummary(invoice)
    .map((attorney) => attorney.name)
    .filter((name) => name !== "Unassigned");
  const fallbackNames = invoice.attorneys.map((attorney) => attorney.name);
  const names = lawyerNames.length > 0 ? lawyerNames : fallbackNames;
  const uniqueLawyers = new Map<string, string>();

  for (const name of names) {
    const normalizedName = name.trim();

    if (
      !normalizedName ||
      normalizedName.toLowerCase() === principal.toLowerCase()
    ) {
      continue;
    }

    uniqueLawyers.set(normalizedName.toLowerCase(), normalizedName);
  }

  return {
    principal,
    lawyers: [...uniqueLawyers.values()].sort((first, second) =>
      first.localeCompare(second),
    ),
  };
}
