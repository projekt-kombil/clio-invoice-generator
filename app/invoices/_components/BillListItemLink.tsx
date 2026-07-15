"use client";

import { getBillSelectionHref } from "@/app/invoices/_lib/invoice-page-helpers";
import type { BillListItem } from "@/lib/clio-bills";
import {
  formatDisplayDate,
  formatInvoiceMoney,
} from "@/lib/invoice-formatting";
import Link, { useLinkStatus } from "next/link";
import type { MouseEvent } from "react";
import { invoicePreviewLoadingEvent } from "@/app/invoices/_components/InvoiceWorkspacePendingPreview";

type BillListItemLinkProps = {
  bill: BillListItem;
  isSelected: boolean;
  query: string;
};

function BillPendingHint() {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={`bill-pending-hint ${pending ? "opacity-100" : "opacity-0"}`}
    >
      <span className="loading-spinner" />
    </span>
  );
}

export function BillListItemLink({
  bill,
  isSelected,
  query,
}: BillListItemLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      isSelected ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.button !== 0
    ) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(invoicePreviewLoadingEvent, {
        detail: { billId: String(bill.id) },
      }),
    );
  }

  return (
    <Link
      aria-current={isSelected ? "page" : undefined}
      className={[
        "invoice-bill-card relative block rounded-md border p-4 text-sm transition",
        isSelected
          ? "border-[var(--jema-navy)] bg-[var(--jema-navy)] text-white"
          : "border-slate-300 bg-white text-slate-800 hover:border-[var(--jema-cranberry)] hover:bg-slate-50",
      ].join(" ")}
      href={getBillSelectionHref(query, bill.id)}
      onClick={handleClick}
      prefetch={false}
    >
      <BillPendingHint />
      <span className="flex items-center justify-between gap-3 pr-7">
        <span className="font-semibold">{bill.number}</span>
        <span className={isSelected ? "text-slate-200" : "text-slate-500"}>
          {bill.state ?? "Not shown"}
        </span>
      </span>
      <span className="mt-2 block font-medium">{bill.clientName ?? ""}</span>
      <span
        className={[
          "mt-3 grid grid-cols-2 gap-2 text-xs",
          isSelected ? "text-slate-200" : "text-slate-600",
        ].join(" ")}
      >
        <span>
          Issued
          <strong className="block font-semibold">
            {formatDisplayDate(bill.issuedAt)}
          </strong>
        </span>
        <span>
          Balance
          <strong className="block font-semibold">
            {formatInvoiceMoney(bill.balance) || "Not shown"}
          </strong>
        </span>
      </span>
    </Link>
  );
}
