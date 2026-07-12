import type {
  BillDetail,
  BillLineItem,
  BillListItem,
  BillMatter,
  ClioAddress,
  ClioUserSummary,
} from "@/lib/clio-bills/types";

export function getObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getImageUrl(value: unknown): string | null {
  const directUrl = getString(value);

  if (directUrl) {
    return directUrl;
  }

  const image = getObject(value);

  return image ? getString(image.url) : null;
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

function normalizeUser(value: unknown): ClioUserSummary | null {
  const user = getObject(value);

  if (!user || typeof user.id !== "number") {
    return null;
  }

  return {
    id: user.id,
    name: getString(user.name),
    initials: getString(user.initials),
    signature: getImageUrl(user.signature),
    avatar: getImageUrl(user.avatar),
    email: getString(user.email),
  };
}

export function normalizeAddress(value: unknown): ClioAddress | null {
  const address = getObject(value);

  if (!address) {
    return null;
  }

  return {
    id: getNumber(address.id),
    name: getString(address.name),
    street: getString(address.street),
    city: getString(address.city),
    province: getString(address.province),
    postalCode: getString(address.postal_code),
    country: getString(address.country),
  };
}

export function normalizeMatter(value: unknown): BillMatter | null {
  const matter = getObject(value);

  if (!matter || typeof matter.id !== "number") {
    return null;
  }

  return {
    id: matter.id,
    description: getString(matter.description),
    displayNumber: getString(matter.display_number),
    number: getNumber(matter.number),
    responsibleAttorney: normalizeUser(matter.responsible_attorney),
    originatingAttorney: normalizeUser(matter.originating_attorney),
    user: normalizeUser(matter.user),
  };
}

export function normalizeBill(value: unknown): BillListItem | null {
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
    clientId: client ? getNumber(client.id) : null,
  };
}

export function normalizeLineItem(value: unknown): BillLineItem | null {
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
    user: normalizeUser(item.user),
    matter: normalizeMatter(item.matter),
  };
}

export function normalizeBillDetail(
  value: unknown,
  lineItems: BillLineItem[],
): BillDetail | null {
  const bill = getObject(value);
  const listItem = normalizeBill(value);

  if (!bill || !listItem) {
    return null;
  }

  const discount = getObject(bill.discount);
  const interest = getObject(bill.interest);
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
    interest: interest
      ? {
          total: getNumber(interest.total),
        }
      : null,
    currency: currency
      ? {
          id: getNumber(currency.id),
          redacted:
            typeof currency.redacted === "boolean" ? currency.redacted : null,
        }
      : null,
    clientAddresses: [],
    matters: rawMatters
      .map(normalizeMatter)
      .filter((matter) => matter !== null),
    lineItems,
  };
}
