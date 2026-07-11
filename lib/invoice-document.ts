import type { BillDetail } from "@/lib/clio-bills";

export type InvoiceDocumentData = {
  invoiceNumber: string;
  issuedAt: string | null;
  dueAt: string | null;
  client: {
    name: string;
    addressLines: string[];
  };
  matter: {
    number: string | null;
    description: string | null;
  };
  items: Array<{
    id: number;
    date: string | null;
    type: string | null;
    description: string;
    note: string | null;
    quantity: number | null;
    price: number | null;
    tax: number | null;
    total: number | null;
  }>;
  taxRate: number | null;
  tax: number | null;
  total: string | number | null;
  paid: number | null;
  balance: string | number | null;
  status: string | null;
};

export function toInvoiceDocumentData(bill: BillDetail): InvoiceDocumentData {
  const primaryMatter = bill.matters[0] ?? bill.lineItems[0]?.matter ?? null;

  return {
    invoiceNumber: bill.number,
    issuedAt: bill.issuedAt,
    dueAt: bill.dueAt,
    client: {
      name: bill.clientName ?? "No client",
      addressLines: [],
    },
    matter: {
      number: primaryMatter?.displayNumber ?? null,
      description: primaryMatter?.description ?? null,
    },
    items: bill.lineItems.map((item) => ({
      id: item.id,
      date: item.date,
      type: item.kind,
      description: item.description ?? item.note ?? "No description",
      note: item.description ? item.note : null,
      quantity: item.quantity,
      price: item.price,
      tax: item.tax,
      total: item.total,
    })),
    taxRate: bill.taxRate,
    tax: bill.taxSum,
    total: bill.total,
    paid: bill.paid,
    balance: bill.balance,
    status: bill.state,
  };
}
