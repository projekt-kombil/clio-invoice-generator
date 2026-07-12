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
        "rounded-md border p-4 text-sm transition",
        isSelected
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
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
        {bill.clientName ?? "No client"}
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
    <aside className="screen-only border-b border-slate-300 bg-white xl:border-b-0 xl:border-r">
      <div className="flex flex-col gap-5 p-6">
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

        <form className="flex flex-col gap-2" action="/invoices">
          <label className="text-sm font-semibold text-slate-800" htmlFor="q">
            Search invoices
          </label>
          <div className="flex flex-col gap-3">
            <input
              className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm text-slate-950 outline-none transition focus:border-slate-500"
              defaultValue={query}
              disabled={!connectionStatus.connected}
              id="q"
              name="q"
              placeholder="Invoice number, client, or status"
              type="search"
            />
            <button
              className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
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
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Bills
            </p>
            <div className="flex max-h-[calc(100dvh-280px)] flex-col gap-2 overflow-y-auto pr-1">
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
