import type { InvoiceFirmConfig } from "@/lib/invoice-config";

export type InvoiceLineItem = {
  id: number;
  date: string | null;
  type: string | null;
  description: string;
  note: string | null;
  attorney: string | null;
  quantity: number | null;
  price: number | null;
  tax: number | null;
  total: number | null;
};

export type InvoiceLineItemGroup = {
  label: string;
  items: InvoiceLineItem[];
  subtotal: number | null;
};

export type InvoiceAccountStatementEntry = {
  id: string;
  date: string | null;
  description: string;
  amount: number | null;
  source: "allocation" | "payment" | "credit_memo" | "bank_transaction";
};

export type InvoiceDetailedStatementInvoice = {
  id: number;
  number: string;
  dueAt: string | null;
  total: string | number | null;
  paid: number | null;
  balance: string | number | null;
};

export type InvoiceDocumentData = {
  firm: InvoiceFirmConfig;
  invoiceNumber: string;
  issuedAt: string | null;
  dueAt: string | null;
  reference: string | null;
  subject: string | null;
  client: {
    name: string;
    addressLines: string[];
  };
  matter: {
    number: string | null;
    description: string | null;
  };
  services: InvoiceLineItemGroup;
  expenses: InvoiceLineItemGroup;
  attorneys: Array<{
    name: string;
    role: string | null;
    initials: string | null;
    signature: string | null;
  }>;
  responsibleAttorneySignature: string | null;
  responsibleAttorneySignatureImage: string | null;
  taxRate: number | null;
  tax: number | null;
  discount: {
    rate: number | null;
    type: string | null;
  } | null;
  subtotal: number | null;
  total: string | number | null;
  paid: number | null;
  balance: string | number | null;
  status: string | null;
  accountSummary: {
    total: string | number | null;
    paid: number | null;
    balance: string | number | null;
    interest: number | null;
  };
  accountStatementEntries: InvoiceAccountStatementEntry[];
  detailedStatementInvoices: InvoiceDetailedStatementInvoice[];
};
