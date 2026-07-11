import { renderInvoicePdf } from "@/components/invoice/InvoicePdfDocument";
import { getBillDetail } from "@/lib/clio-bills";
import { toInvoiceDocumentData } from "@/lib/invoice-document";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type InvoicePdfRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function filenameForInvoice(invoiceNumber: string): string {
  const safeInvoiceNumber = invoiceNumber.replace(/[^a-zA-Z0-9._-]/g, "-");

  return `invoice-${safeInvoiceNumber || "clio"}.pdf`;
}

export async function GET(
  _request: Request,
  { params }: InvoicePdfRouteContext,
) {
  const { id } = await params;
  const bill = await getBillDetail(id);

  if (!bill) {
    return NextResponse.json({ error: "Bill not found" }, { status: 404 });
  }

  const invoice = toInvoiceDocumentData(bill);
  const pdf = await renderInvoicePdf(invoice);
  const filename = filenameForInvoice(invoice.invoiceNumber);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Content-Type": "application/pdf",
    },
  });
}
