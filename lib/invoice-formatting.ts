import { invoiceFirmConfig, type InvoiceFirmConfig } from "@/lib/invoice-config";
import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoiceFormatSource =
  | InvoiceDocumentData
  | Pick<InvoiceFirmConfig, "currencyCode" | "locale">;

function getFormatConfig(source?: InvoiceFormatSource) {
  if (!source) {
    return invoiceFirmConfig;
  }

  return "firm" in source ? source.firm : source;
}

export function formatInvoiceDate(value: string | null): string {
  if (!value) {
    return "";
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnlyMatch
    ? new Date(
        Date.UTC(
          Number(dateOnlyMatch[1]),
          Number(dateOnlyMatch[2]) - 1,
          Number(dateOnlyMatch[3]),
        ),
      )
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(invoiceFirmConfig.locale, {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  }).format(date);
}

export function formatDisplayDate(value: string | null): string {
  return value ?? "No date";
}

export function formatInvoiceMoney(
  value: string | number | null,
  source?: InvoiceFormatSource,
): string {
  if (value === null) {
    return "";
  }

  const amount = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(amount)) {
    return String(value);
  }

  const config = getFormatConfig(source);

  return new Intl.NumberFormat(config.locale, {
    currency: config.currencyCode,
    style: "currency",
  }).format(amount);
}

export function formatInvoicePercent(value: number | null): string {
  if (value === null) {
    return "";
  }

  const percent = Math.abs(value) < 1 ? value * 100 : value;

  return `${new Intl.NumberFormat(invoiceFirmConfig.locale, {
    maximumFractionDigits: 2,
  }).format(percent)}%`;
}

export function formatInvoiceQuantity(value: number | null): string {
  if (value === null) {
    return "";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatInvoiceDiscount(
  discount: InvoiceDocumentData["discount"],
  source?: InvoiceFormatSource,
): string {
  if (!discount) {
    return "";
  }

  const rate = discount.rate ?? 0;

  return discount.type === "percentage"
    ? `${rate}%`
    : formatInvoiceMoney(rate, source);
}
