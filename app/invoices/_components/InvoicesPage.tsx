import { InvoicesHeader } from "@/app/invoices/_components/InvoicesHeader";
import { InvoicesSidebar } from "@/app/invoices/_components/InvoicesSidebar";
import { InvoiceWorkspace } from "@/app/invoices/_components/InvoiceWorkspace";
import { ClioSessionCleanup } from "@/app/invoices/_components/ClioSessionCleanup";
import { getConnectionMessage } from "@/app/invoices/_lib/invoice-page-helpers";
import { getClioConnectionStatus } from "@/lib/clio";
import { searchBills } from "@/lib/clio-bills";
import type { BillListItem } from "@/lib/clio-bills";
import { getBillDetail } from "@/lib/clio-bills";
import { toInvoiceDocumentData } from "@/lib/invoice-document";
import type { InvoiceDocumentData } from "@/lib/invoice-document";

export type InvoicesPageSearchParams = {
  bill?: string;
  connection?: string;
  q?: string;
};

type InvoicesPageProps = {
  searchParams: Promise<InvoicesPageSearchParams>;
};

export async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const [
    { bill: selectedBillId = "", connection, q = "" },
    connectionStatus,
  ] = await Promise.all([searchParams, getClioConnectionStatus()]);
  const query = q.trim();
  const connectionMessage = getConnectionMessage(
    connection,
    connectionStatus.connected,
  );
  const connectionReason = connectionStatus.connected
    ? null
    : connectionStatus.reason;
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
    <main className="invoice-app-shell flex min-h-dvh flex-col text-slate-950">
      {!connectionStatus.connected && connectionStatus.hasSession ? (
        <ClioSessionCleanup />
      ) : null}
      <div className="flex min-h-dvh flex-col overflow-hidden">
        <InvoicesHeader connectionStatus={connectionStatus} />

        <div className="invoice-app-grid grid flex-1 grid-cols-1 xl:grid-cols-[340px_minmax(0,1fr)]">
          <InvoicesSidebar
            bills={bills}
            connectionMessage={connectionMessage}
            connectionStatus={connectionStatus}
            errorMessage={errorMessage}
            query={query}
            selectedBillId={selectedBillId}
          />
          <InvoiceWorkspace
            connectionMessage={connectionMessage}
            connectionReason={connectionReason}
            isConnected={connectionStatus.connected}
            selectedBillId={selectedBillId}
            selectedInvoice={selectedInvoice}
            selectedInvoiceError={selectedInvoiceError}
          />
        </div>
      </div>
    </main>
  );
}
