import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { formatInvoiceMoney } from "@/lib/invoice-formatting";

export type InvoiceAccountStatementRow = {
  id: string;
  invoiceNumber?: string;
  dueAt?: string | null;
  amountDue?: string;
  paymentsReceived?: string;
  balanceDue?: string;
  label: string;
  value?: string;
  kind?: "section" | "invoice" | "outstanding" | "total";
};

function getMoneyNumber(value: string | number | null): number {
  if (value === null) {
    return 0;
  }

  const amount = typeof value === "number" ? value : Number(value);

  return Number.isFinite(amount) ? amount : 0;
}

function sumBalances(
  invoices: InvoiceDocumentData["detailedStatementInvoices"],
): number {
  return invoices.reduce(
    (sum, invoice) => sum + getMoneyNumber(invoice.balance),
    0,
  );
}

function toInvoiceRow(
  statementInvoice: InvoiceDocumentData["detailedStatementInvoices"][number],
  invoice: InvoiceDocumentData,
): InvoiceAccountStatementRow {
  return {
    id: `invoice-${statementInvoice.id}-${statementInvoice.number}`,
    invoiceNumber: statementInvoice.number,
    dueAt: statementInvoice.dueAt,
    amountDue: formatInvoiceMoney(statementInvoice.total, invoice),
    paymentsReceived: formatInvoiceMoney(statementInvoice.paid, invoice),
    balanceDue: formatInvoiceMoney(statementInvoice.balance, invoice),
    label: statementInvoice.number,
    kind: "invoice",
  };
}

export function getInvoiceAccountStatementRows(
  invoice: InvoiceDocumentData,
): InvoiceAccountStatementRow[] {
  const statementInvoices =
    invoice.detailedStatementInvoices.length > 0
      ? invoice.detailedStatementInvoices
      : [
          {
            id: 0,
            number: invoice.invoiceNumber,
            dueAt: invoice.dueAt,
            total: invoice.total,
            paid: invoice.paid,
            balance: invoice.balance,
          },
        ];
  const currentInvoices = statementInvoices.filter(
    (statementInvoice) => statementInvoice.id === 0 ||
      statementInvoice.number === invoice.invoiceNumber,
  );
  const currentInvoiceIds = new Set(
    currentInvoices.map((statementInvoice) => statementInvoice.id),
  );
  const otherInvoices = statementInvoices.filter(
    (statementInvoice) => !currentInvoiceIds.has(statementInvoice.id),
  );
  const rows: InvoiceAccountStatementRow[] = [];

  if (otherInvoices.length > 0) {
    rows.push({
      id: "section-other-invoices",
      label: "Other Invoices",
      kind: "section",
    });
    rows.push(...otherInvoices.map((row) => toInvoiceRow(row, invoice)));
    rows.push({
      id: "outstanding-other-invoices",
      label: "Outstanding Balance",
      value: formatInvoiceMoney(sumBalances(otherInvoices), invoice),
      kind: "outstanding",
    });
  }

  rows.push({
    id: "section-current-invoice",
    label: "Current Invoice",
    kind: "section",
  });
  rows.push(...currentInvoices.map((row) => toInvoiceRow(row, invoice)));
  rows.push({
    id: "outstanding-current-invoice",
    label: "Outstanding Balance",
    value: formatInvoiceMoney(sumBalances(currentInvoices), invoice),
    kind: "outstanding",
  });

  rows.push({
    id: "total-amount-outstanding",
    label: "Total Amount Outstanding",
    value: formatInvoiceMoney(sumBalances(statementInvoices), invoice),
    kind: "total",
  });

  return rows;
}
