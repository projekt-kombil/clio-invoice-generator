import { InvoicePdfActions } from "@/components/invoice/InvoicePdfActions";
import { InvoicePreview } from "@/components/invoice/InvoicePreview";
import { getClioConnectionStatus } from "@/lib/clio";
import { searchBills } from "@/lib/clio-bills";
import type { BillListItem } from "@/lib/clio-bills";
import { getBillDetail } from "@/lib/clio-bills";
import { toInvoiceDocumentData } from "@/lib/invoice-document";
import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatDisplayDate,
  formatInvoiceMoney,
} from "@/lib/invoice-formatting";
import Link from "next/link";

export const dynamic = "force-dynamic";

type InvoicesPageProps = {
  searchParams: Promise<{
    bill?: string;
    connection?: string;
    q?: string;
  }>;
};

function getConnectionMessage(
  connection: string | undefined,
  isConnected: boolean,
): string | null {
  switch (connection) {
    case "connected":
      return isConnected
        ? "Connected to Clio successfully."
        : "Clio returned from authorization, but the local app could not verify the connection. Please connect again.";
    case "disconnected":
      return "Disconnected from Clio.";
    case "declined":
      return "Clio access was declined.";
    case "invalid_state":
      return "Connection could not be completed because the OAuth state check failed.";
    case "missing_code":
      return "Connection could not be completed because Clio did not return an authorization code.";
    case "failed":
      return "Connection could not be completed. Check the app credentials and redirect URI.";
    case "verification_failed":
      return "Clio approved the app, but the local app could not verify API access. Check the selected Clio permissions and region.";
    default:
      return null;
  }
}

function getBillSelectionHref(query: string, billId: number): string {
  const params = new URLSearchParams({ bill: String(billId) });

  if (query) {
    params.set("q", query);
  }

  return `/invoices?${params.toString()}`;
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const [
    { bill: selectedBillId = "", connection, q = "" },
    connectionStatus,
  ] = await Promise.all([searchParams, getClioConnectionStatus()]);
  const query = q.trim();
  const connectionMessage = getConnectionMessage(
    connection,
    connectionStatus.connected,
  );
  let bills: BillListItem[] = [];
  let errorMessage: string | null = null;
  let selectedInvoice: InvoiceDocumentData | null = null;
  let selectedInvoiceError: string | null = null;

  if (connectionStatus.connected) {
    try {
      bills = await searchBills(query);
    } catch {
      errorMessage =
        "Unable to load bills from Clio. Check the connection and try again.";
    }
  }

  if (connectionStatus.connected && selectedBillId) {
    try {
      const selectedBill = await getBillDetail(selectedBillId);
      selectedInvoice = selectedBill ? toInvoiceDocumentData(selectedBill) : null;
      selectedInvoiceError = selectedBill
        ? null
        : "That bill could not be found in Clio.";
    } catch {
      selectedInvoiceError =
        "Unable to load the selected invoice from Clio. Check the connection and try again.";
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-slate-100 text-slate-950">
      <div className="flex min-h-dvh flex-col">
        <header className="screen-only border-b border-slate-300 bg-white px-6 py-5 sm:px-8">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                Clio billing
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                Invoice generator
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {connectionStatus.connected ? (
                <>
                  <p className="text-sm text-slate-700">
                    Connected as{" "}
                    <span className="font-semibold text-slate-950">
                      {connectionStatus.user.name}
                    </span>
                  </p>
                  <form action="/api/auth/clio/disconnect" method="post">
                    <button
                      className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
                      type="submit"
                    >
                      Disconnect
                    </button>
                  </form>
                </>
              ) : (
                <a
                  className="inline-flex h-11 items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href="/api/auth/clio"
                >
                  Connect to Clio
                </a>
              )}
            </div>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)]">
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
                    {bills.map((bill) => {
                      const isSelected = String(bill.id) === selectedBillId;

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
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </aside>

          <section className="min-w-0 bg-slate-200">
            {connectionStatus.connected && selectedBillId ? (
              <div className="screen-only flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-slate-100 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Selected invoice
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-950">
                    {selectedInvoice?.invoiceNumber ?? selectedBillId}
                  </p>
                </div>
                {selectedInvoice ? <InvoicePdfActions invoice={selectedInvoice} /> : null}
              </div>
            ) : null}

            {selectedInvoice ? (
              <div className="invoice-preview-shell invoice-split-preview px-4 py-8">
                <InvoicePreview invoice={selectedInvoice} />
              </div>
            ) : (
              <div className="screen-only flex min-h-[55dvh] items-center justify-center px-6 py-12">
                <div className="max-w-md rounded-md border border-slate-300 bg-white p-6 text-center shadow-sm">
                  <h2 className="text-lg font-semibold text-slate-950">
                    {!connectionStatus.connected
                      ? "Connect to Clio"
                      : selectedInvoiceError
                        ? "Invoice unavailable"
                        : "Select a bill"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {!connectionStatus.connected
                      ? "Once connected, your bill list will appear on the left and the selected invoice will appear here."
                      : selectedInvoiceError ??
                        "Choose a bill from the list to preview the invoice and use the PDF actions."}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
