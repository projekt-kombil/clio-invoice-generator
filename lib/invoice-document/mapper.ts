import type {
  BillDetail,
  ClioAddress,
  ClioUserSummary,
} from "@/lib/clio-bills";
import { invoiceFirmConfig } from "@/lib/invoice-config";
import type { InvoiceDocumentData, InvoiceLineItem } from "@/lib/invoice-document/types";

const FALLBACK_CLIENT_NAME = "";
const FALLBACK_DESCRIPTION = "";

function finiteNumber(value: number | null): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function moneyValue(value: string | number | null): string | number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();

    return trimmedValue || null;
  }

  return null;
}

function displayString(value: string | null, fallback: string): string {
  return value?.trim() || fallback;
}

function optionalString(value: string | null): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue || null;
}

function toInvoiceLineItems(bill: BillDetail): InvoiceLineItem[] {
  return bill.lineItems.map((item, index) => ({
    id: finiteNumber(item.id) ?? index + 1,
    date: optionalString(item.date),
    type: optionalString(item.kind),
    description: displayString(
      item.description ?? item.note,
      FALLBACK_DESCRIPTION,
    ),
    note: optionalString(item.description ? item.note : null),
    attorney:
      optionalString(
        item.user?.name ??
          item.matter?.responsibleAttorney?.name ??
          item.matter?.user?.name ??
          null,
      ) ??
      null,
    quantity: finiteNumber(item.quantity),
    price: finiteNumber(item.price),
    tax: finiteNumber(item.tax),
    total: finiteNumber(item.total),
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

function getPrimaryMatter(bill: BillDetail) {
  return bill.matters[0] ?? bill.lineItems[0]?.matter ?? null;
}

function getResponsibleAttorney(bill: BillDetail) {
  const primaryMatter = getPrimaryMatter(bill);

  return (
    primaryMatter?.responsibleAttorney ??
    primaryMatter?.user ??
    bill.lineItems[0]?.user ??
    null
  );
}

function getReference(bill: BillDetail): string | null {
  const primaryMatter = getPrimaryMatter(bill);
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
  ]
    .map((line) => optionalString(line))
    .filter((line): line is string => line !== null);
}

function hasDiscount(discount: BillDetail["discount"]): boolean {
  return Boolean(discount?.rate && discount.rate > 0);
}

function toInvoiceDiscount(
  discount: BillDetail["discount"],
): InvoiceDocumentData["discount"] {
  if (!hasDiscount(discount)) {
    return null;
  }

  return {
    rate: finiteNumber(discount?.rate ?? null),
    type: optionalString(discount?.type ?? null),
  };
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
    name: displayString(user.name, `User ${user.id}`),
    initials: user.initials ?? getInitials(user.name),
    signature: optionalString(user.signature),
    role:
      bill.matters.some((matter) => matter.responsibleAttorney?.id === user.id)
        ? "Responsible Attorney"
        : bill.matters.some((matter) => matter.originatingAttorney?.id === user.id)
          ? "Originating Attorney"
          : "Attorney",
  }));
}

export function toInvoiceDocumentData(bill: BillDetail): InvoiceDocumentData {
  const primaryMatter = getPrimaryMatter(bill);
  const responsibleAttorney = getResponsibleAttorney(bill);
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
    invoiceNumber: displayString(bill.number, `Invoice ${bill.id}`),
    issuedAt: optionalString(bill.issuedAt),
    dueAt: optionalString(bill.dueAt),
    reference: getReference(bill),
    subject: optionalString(bill.subject ?? primaryMatter?.description ?? null),
    client: {
      name: displayString(bill.clientName, FALLBACK_CLIENT_NAME),
      addressLines: formatAddressLines(bill.clientAddresses),
    },
    matter: {
      number: optionalString(primaryMatter?.displayNumber ?? null),
      description: optionalString(primaryMatter?.description ?? null),
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
      optionalString(responsibleAttorney?.name ?? attorneys[0]?.name ?? null),
    responsibleAttorneySignatureImage: optionalString(
      responsibleAttorney?.signature ?? null,
    ),
    taxRate: finiteNumber(bill.taxRate),
    tax: finiteNumber(bill.taxSum),
    discount: toInvoiceDiscount(bill.discount),
    subtotal,
    total: moneyValue(bill.total),
    paid: finiteNumber(bill.paid),
    balance: moneyValue(bill.balance),
    status: optionalString(bill.state),
    accountSummary: {
      total: moneyValue(bill.total),
      paid: finiteNumber(bill.paid),
      balance: moneyValue(bill.balance),
      interest: finiteNumber(bill.interest?.total ?? null),
    },
    accountStatementEntries: bill.accountStatementEntries.map((entry, index) => ({
      id: optionalString(entry.id) ?? `account-entry-${index + 1}`,
      date: optionalString(entry.date),
      description: displayString(entry.description, "Account entry"),
      amount: finiteNumber(entry.amount),
      source: entry.source,
    })),
    detailedStatementInvoices: bill.detailedStatementInvoices.map(
      (statementInvoice, index) => ({
        id: finiteNumber(statementInvoice.id) ?? index + 1,
        number: displayString(statementInvoice.number, `Invoice ${index + 1}`),
        dueAt: optionalString(statementInvoice.dueAt),
        total: moneyValue(statementInvoice.total),
        paid: finiteNumber(statementInvoice.paid),
        balance: moneyValue(statementInvoice.balance),
      }),
    ),
  };
}
