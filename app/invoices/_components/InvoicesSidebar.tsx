import type { BillListItem } from "@/lib/clio-bills";
import { BillListItemLink } from "@/app/invoices/_components/BillListItemLink";
import { InvoiceSearchForm } from "@/app/invoices/_components/InvoiceSearchForm";

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
        {connectionStatus.connected && connectionMessage ? (
          <p className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            {connectionMessage}
          </p>
        ) : null}

        <InvoiceSearchForm
          disabled={!connectionStatus.connected}
          query={query}
        />

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
