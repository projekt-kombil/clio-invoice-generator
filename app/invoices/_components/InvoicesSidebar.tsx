import type { BillListItem } from "@/lib/clio-bills";
import {
  formatDisplayDate,
  formatInvoiceMoney,
} from "@/lib/invoice-formatting";
import Link from "next/link";

import { getBillSelectionHref } from "@/app/invoices/_lib/invoice-page-helpers";

type InvoicesSidebarProps = {
  bills: BillListItem[];
  connectionMessage: string | null;
  connectionStatus: {
    connected: boolean;
    reason?: string | null;
  };
  errorMessage: string | null;
  query: string;
  selectedBillId: string;
};

function BillListItemLink({
  bill,
  isSelected,
  query,
}: {
  bill: BillListItem;
  isSelected: boolean;
  query: string;
}) {
  return (
    <Link
      aria-current={isSelected ? "page" : undefined}
      className={[
        "invoice-bill-card block rounded-md border p-4 text-sm transition",
        isSelected
          ? "border-[var(--jema-navy)] bg-[var(--jema-navy)] text-white"
          : "border-slate-300 bg-white text-slate-800 hover:border-[var(--jema-cranberry)] hover:bg-slate-50",
      ].join(" ")}
      href={getBillSelectionHref(query, bill.id)}
      key={bill.id}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-semibold">{bill.number}</span>
        <span className={isSelected ? "text-slate-200" : "text-slate-500"}>
          {bill.state ?? "Not shown"}
        </span>
      </span>
      <span className="mt-2 block font-medium">
        {bill.clientName ?? ""}
      </span>
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

export function InvoicesSidebar({
  bills,
  connectionMessage,
  connectionStatus,
  errorMessage,
  query,
  selectedBillId,
}: InvoicesSidebarProps) {
  return (
    <aside className="invoice-sidebar screen-only border-b border-slate-300 bg-white xl:border-b-0 xl:border-r">
      <div className="invoice-sidebar-content flex h-full flex-col gap-5 p-5">
        {connectionMessage ? (
          <p className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {connectionMessage}
          </p>
        ) : null}

        {!connectionStatus.connected && connectionStatus.reason ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {connectionStatus.reason}
          </p>
        ) : null}

        <form className="invoice-search-form flex flex-col gap-2" action="/">
          <label className="text-sm font-semibold text-[var(--jema-navy)]" htmlFor="q">
            Search invoices
          </label>
          <div className="flex flex-col gap-2">
            <input
              className="invoice-search-control invoice-search-input min-w-0 border px-3 text-sm text-slate-950 outline-none"
              defaultValue={query}
              disabled={!connectionStatus.connected}
              id="q"
              name="q"
              placeholder="Invoice number, client, or status"
              type="search"
            />
            <button
              className="invoice-search-control invoice-search-button inline-flex items-center justify-center px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={!connectionStatus.connected}
              type="submit"
            >
              Search
            </button>
          </div>
        </form>

        {!connectionStatus.connected ? (
          <p className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Connect to Clio to load bills from your account.
          </p>
        ) : null}

        {connectionStatus.connected && errorMessage ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </p>
        ) : null}

        {connectionStatus.connected && !errorMessage && bills.length === 0 ? (
          <p className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            No bills were returned from Clio for this search.
          </p>
        ) : null}

        {bills.length > 0 ? (
          <div className="invoice-bills-section flex min-h-0 flex-1 flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Bills
            </p>
            <div className="invoice-bill-list flex min-h-0 w-full flex-1 flex-col gap-2">
              {bills.map((bill) => (
                <BillListItemLink
                  bill={bill}
                  isSelected={String(bill.id) === selectedBillId}
                  key={bill.id}
                  query={query}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
