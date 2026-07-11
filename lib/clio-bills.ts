import "server-only";

import { clioApiFetch } from "@/lib/clio";

const BILL_LIST_FIELDS = [
  "id",
  "number",
  "issued_at",
  "due_at",
  "state",
  "total",
  "balance",
  "client{id,name}",
].join(",");

const BILL_DETAIL_FIELDS = [
  "id",
  "number",
  "issued_at",
  "due_at",
  "state",
  "kind",
  "subject",
  "purchase_order",
  "total",
  "balance",
  "tax_rate",
  "tax_sum",
  "paid",
  "paid_at",
  "discount",
  "currency",
  "client{id,name}",
  "matters{id,description,display_number,number}",
].join(",");

const LINE_ITEM_FIELDS = [
  "id",
  "date",
  "kind",
  "note",
  "description",
  "quantity",
  "price",
  "total",
  "discount",
  "tax",
  "matter{id,description,display_number,number}",
].join(",");

type ClioBillListResponse = {
  data?: unknown[];
};

type ClioBillDetailResponse = {
  data?: unknown;
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
};

export type BillMatter = {
  id: number;
  description: string | null;
  displayNumber: string | null;
  number: number | null;
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
  matter: BillMatter | null;
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
  currency: {
    id: number | null;
    redacted: boolean | null;
  } | null;
  matters: BillMatter[];
  lineItems: BillLineItem[];
};

function getObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getMoneyLike(value: unknown): string | number | null {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return null;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" ? value : null;
}

function normalizeMatter(value: unknown): BillMatter | null {
  const matter = getObject(value);

  if (!matter || typeof matter.id !== "number") {
    return null;
  }

  return {
    id: matter.id,
    description: getString(matter.description),
    displayNumber: getString(matter.display_number),
    number: getNumber(matter.number),
  };
}

function normalizeBill(value: unknown): BillListItem | null {
  const bill = getObject(value);

  if (!bill || typeof bill.id !== "number") {
    return null;
  }

  const client = getObject(bill.client);

  return {
    id: bill.id,
    number: getString(bill.number) ?? String(bill.id),
    issuedAt: getString(bill.issued_at),
    dueAt: getString(bill.due_at),
    state: getString(bill.state),
    total: getMoneyLike(bill.total),
    balance: getMoneyLike(bill.balance),
    clientName: client ? getString(client.name) : null,
  };
}

function normalizeLineItem(value: unknown): BillLineItem | null {
  const item = getObject(value);

  if (!item || typeof item.id !== "number") {
    return null;
  }

  return {
    id: item.id,
    date: getString(item.date),
    kind: getString(item.kind),
    note: getString(item.note),
    description: getString(item.description),
    quantity: getNumber(item.quantity),
    price: getNumber(item.price),
    total: getNumber(item.total),
    tax: getNumber(item.tax),
    matter: normalizeMatter(item.matter),
  };
}

function normalizeBillDetail(
  value: unknown,
  lineItems: BillLineItem[],
): BillDetail | null {
  const bill = getObject(value);
  const listItem = normalizeBill(value);

  if (!bill || !listItem) {
    return null;
  }

  const discount = getObject(bill.discount);
  const currency = getObject(bill.currency);
  const rawMatters = Array.isArray(bill.matters) ? bill.matters : [];

  return {
    ...listItem,
    kind: getString(bill.kind),
    subject: getString(bill.subject),
    purchaseOrder: getString(bill.purchase_order),
    taxRate: getNumber(bill.tax_rate),
    taxSum: getNumber(bill.tax_sum),
    paid: getNumber(bill.paid),
    paidAt: getString(bill.paid_at),
    discount: discount
      ? {
          rate: getNumber(discount.rate),
          type: getString(discount.type),
        }
      : null,
    currency: currency
      ? {
          id: getNumber(currency.id),
          redacted:
            typeof currency.redacted === "boolean" ? currency.redacted : null,
        }
      : null,
    matters: rawMatters
      .map(normalizeMatter)
      .filter((matter) => matter !== null),
    lineItems,
  };
}

function matchesQuery(bill: BillListItem, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    bill.number,
    bill.clientName,
    bill.state,
  ]
    .filter(Boolean)
    .some((value) => value?.toLowerCase().includes(normalizedQuery));
}

export async function searchBills(query: string): Promise<BillListItem[]> {
  const params = new URLSearchParams({
    limit: "50",
    fields: BILL_LIST_FIELDS,
  });
  const response = await clioApiFetch(`/bills?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Clio bill list request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as ClioBillListResponse;
  const bills = Array.isArray(payload.data)
    ? payload.data.map(normalizeBill).filter((bill) => bill !== null)
    : [];

  return bills.filter((bill) => matchesQuery(bill, query));
}

export async function getBillDetail(id: string): Promise<BillDetail | null> {
  const billResponse = await clioApiFetch(
    `/bills/${encodeURIComponent(id)}?fields=${encodeURIComponent(BILL_DETAIL_FIELDS)}`,
  );

  if (billResponse.status === 404) {
    return null;
  }

  if (!billResponse.ok) {
    throw new Error(`Clio bill detail request failed with status ${billResponse.status}.`);
  }

  const lineItemParams = new URLSearchParams({
    bill_id: id,
    limit: "100",
    fields: LINE_ITEM_FIELDS,
  });
  const lineItemResponse = await clioApiFetch(`/line_items?${lineItemParams.toString()}`);

  if (!lineItemResponse.ok) {
    throw new Error(
      `Clio line item request failed with status ${lineItemResponse.status}.`,
    );
  }

  const billPayload = (await billResponse.json()) as ClioBillDetailResponse;
  const lineItemPayload = (await lineItemResponse.json()) as ClioBillListResponse;
  const lineItems = Array.isArray(lineItemPayload.data)
    ? lineItemPayload.data
        .map(normalizeLineItem)
        .filter((lineItem) => lineItem !== null)
    : [];

  return normalizeBillDetail(billPayload.data, lineItems);
}
