export type ClioBillListResponse = {
  data?: unknown[];
  meta?: {
    paging?: {
      next?: string;
    };
  };
};

export type ClioBillDetailResponse = {
  data?: unknown;
};

export type ClioMatterDetailResponse = {
  data?: unknown;
};

export type ClioContactDetailResponse = {
  data?: unknown;
};

export type ClioUserSummary = {
  id: number;
  name: string | null;
  initials: string | null;
  signature: string | null;
  avatar: string | null;
  email: string | null;
};

export type ClioAddress = {
  id: number | null;
  name: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
};

export type BillListItem = {
  id: number;
  number: string;
  issuedAt: string | null;
  dueAt: string | null;
  state: string | null;
  total: string | number | null;
  balance: string | number | null;
  clientName: string | null;
  clientId: number | null;
};

export type BillMatter = {
  id: number;
  description: string | null;
  displayNumber: string | null;
  number: number | null;
  responsibleAttorney: ClioUserSummary | null;
  originatingAttorney: ClioUserSummary | null;
  user: ClioUserSummary | null;
};

export type BillLineItem = {
  id: number;
  date: string | null;
  kind: string | null;
  note: string | null;
  description: string | null;
  quantity: number | null;
  price: number | null;
  total: number | null;
  tax: number | null;
  user: ClioUserSummary | null;
  matter: BillMatter | null;
};

export type BillAccountStatementEntry = {
  id: string;
  date: string | null;
  description: string;
  amount: number | null;
  source: "allocation" | "payment" | "credit_memo" | "bank_transaction";
};

export type BillDetailedStatementInvoice = {
  id: number;
  number: string;
  dueAt: string | null;
  total: string | number | null;
  paid: number | null;
  balance: string | number | null;
};

export type BillDetail = BillListItem & {
  kind: string | null;
  subject: string | null;
  purchaseOrder: string | null;
  taxRate: number | null;
  taxSum: number | null;
  paid: number | null;
  paidAt: string | null;
  discount: {
    rate: number | null;
    type: string | null;
  } | null;
  interest: {
    total: number | null;
  } | null;
  currency: {
    id: number | null;
    redacted: boolean | null;
  } | null;
  clientAddresses: ClioAddress[];
  matters: BillMatter[];
  lineItems: BillLineItem[];
  accountStatementEntries: BillAccountStatementEntry[];
  detailedStatementInvoices: BillDetailedStatementInvoice[];
};
