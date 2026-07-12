import type {
  BillDetail,
  ClioAddress,
  ClioUserSummary,
} from "@/lib/clio-bills";
import {
  invoiceFirmConfig,
  type InvoiceFirmConfig,
} from "@/lib/invoice-config";

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
};

export function shouldShowDraftWatermark(
  invoice: Pick<InvoiceDocumentData, "status">,
): boolean {
  return invoice.status?.toLowerCase().includes("draft") ?? false;
}

function toInvoiceLineItems(bill: BillDetail): InvoiceLineItem[] {
  return bill.lineItems.map((item) => ({
    id: item.id,
    date: item.date,
    type: item.kind,
    description: item.description ?? item.note ?? "No description",
    note: item.description ? item.note : null,
    attorney:
      item.user?.name ??
      item.matter?.responsibleAttorney?.name ??
      item.matter?.user?.name ??
      null,
    quantity: item.quantity,
    price: item.price,
    tax: item.tax,
    total: item.total,
  }));
}

function isExpenseItem(item: InvoiceLineItem): boolean {
  return item.type?.toLowerCase().includes("expense") ?? false;
}

function sumLineItems(items: InvoiceLineItem[]): number | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((sum, item) => sum + (item.total ?? 0), 0);
}

function getReference(bill: BillDetail): string | null {
  const primaryMatter = bill.matters[0] ?? bill.lineItems[0]?.matter ?? null;
  const matterReference =
    primaryMatter?.displayNumber ??
    (primaryMatter?.number ? String(primaryMatter.number) : null);
  const attorneyInitials = getInitials(
    primaryMatter?.responsibleAttorney?.name ??
      primaryMatter?.user?.name ??
      bill.lineItems[0]?.user?.name ??
      null,
  );

  if (!matterReference) {
    return null;
  }

  return attorneyInitials ? `${matterReference}/${attorneyInitials}` : matterReference;
}

function getInitials(name: string | null): string | null {
  if (!name) {
    return null;
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || null;
}

function formatAddressLines(addresses: ClioAddress[]): string[] {
  const address = addresses[0];

  if (!address) {
    return [];
  }

  const localityLine = [address.city, address.province, address.postalCode]
    .filter(Boolean)
    .join(", ");

  return [
    address.name,
    address.street,
    localityLine || null,
    address.country,
  ].filter((line): line is string => Boolean(line));
}

function hasDiscount(discount: BillDetail["discount"]): boolean {
  return Boolean(discount?.rate && discount.rate > 0);
}

function uniqueUsers(users: Array<ClioUserSummary | null>): ClioUserSummary[] {
  const seenIds = new Set<number>();
  const unique: ClioUserSummary[] = [];

  for (const user of users) {
    if (!user || seenIds.has(user.id)) {
      continue;
    }

    seenIds.add(user.id);
    unique.push(user);
  }

  return unique;
}

function getInvoiceAttorneys(bill: BillDetail): InvoiceDocumentData["attorneys"] {
  const users = uniqueUsers([
    ...bill.matters.flatMap((matter) => [
      matter.responsibleAttorney,
      matter.originatingAttorney,
      matter.user,
    ]),
    ...bill.lineItems.map((item) => item.user),
  ]);

  return users.map((user) => ({
    name: user.name ?? `User ${user.id}`,
    initials: user.initials ?? getInitials(user.name),
    signature: user.signature,
    role:
      bill.matters.some((matter) => matter.responsibleAttorney?.id === user.id)
        ? "Responsible Attorney"
        : bill.matters.some((matter) => matter.originatingAttorney?.id === user.id)
          ? "Originating Attorney"
          : "Attorney",
  }));
}

export function toInvoiceDocumentData(bill: BillDetail): InvoiceDocumentData {
  const primaryMatter = bill.matters[0] ?? bill.lineItems[0]?.matter ?? null;
  const responsibleAttorney =
    primaryMatter?.responsibleAttorney ??
    primaryMatter?.user ??
    bill.lineItems[0]?.user ??
    null;
  const items = toInvoiceLineItems(bill);
  const expenses = items.filter(isExpenseItem);
  const services = items.filter((item) => !isExpenseItem(item));
  const servicesSubtotal = sumLineItems(services);
  const expensesSubtotal = sumLineItems(expenses);
  const attorneys = getInvoiceAttorneys(bill);
  const subtotal =
    servicesSubtotal === null && expensesSubtotal === null
      ? null
      : (servicesSubtotal ?? 0) + (expensesSubtotal ?? 0);

  return {
    firm: invoiceFirmConfig,
    invoiceNumber: bill.number,
    issuedAt: bill.issuedAt,
    dueAt: bill.dueAt,
    reference: getReference(bill),
    subject: bill.subject ?? primaryMatter?.description ?? null,
    client: {
      name: bill.clientName ?? "No client",
      addressLines: formatAddressLines(bill.clientAddresses),
    },
    matter: {
      number: primaryMatter?.displayNumber ?? null,
      description: primaryMatter?.description ?? null,
    },
    services: {
      label: "Services",
      items: services,
      subtotal: servicesSubtotal,
    },
    expenses: {
      label: "Expenses",
      items: expenses,
      subtotal: expensesSubtotal,
    },
    attorneys,
    responsibleAttorneySignature:
      responsibleAttorney?.name ??
      attorneys[0]?.name ??
      null,
    responsibleAttorneySignatureImage: responsibleAttorney?.signature ?? null,
    taxRate: bill.taxRate,
    tax: bill.taxSum,
    discount: hasDiscount(bill.discount) ? bill.discount : null,
    subtotal,
    total: bill.total,
    paid: bill.paid,
    balance: bill.balance,
    status: bill.state,
    accountSummary: {
      total: bill.total,
      paid: bill.paid,
      balance: bill.balance,
      interest: bill.interest?.total ?? null,
    },
  };
}
