import { getBillDetail } from "@/lib/clio-bills";
import { toInvoiceDocumentData } from "@/lib/invoice-document";
import { renderInvoicePdf } from "@/lib/invoice-pdf-renderer";
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
  request: Request,
  { params }: InvoicePdfRouteContext,
) {
  const { id } = await params;

  try {
    console.log("Invoice PDF request received", { billId: id });

    const bill = await getBillDetail(id);

    if (!bill) {
      console.warn("Invoice PDF bill lookup returned no bill", { billId: id });
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    console.log("Invoice PDF bill lookup completed", { billId: id });

    const invoice = toInvoiceDocumentData(bill);

    console.log("Invoice PDF document data prepared", {
      billId: id,
      invoiceNumber: invoice.invoiceNumber,
      serviceLineItems: invoice.services.items.length,
      expenseLineItems: invoice.expenses.items.length,
    });

    const pdfBytes = await renderInvoicePdf(invoice);
    const filename = filenameForInvoice(invoice.invoiceNumber);
    const disposition = new URL(request.url).searchParams.has("download")
      ? "attachment"
      : "inline";

    console.log("Invoice PDF render completed", {
      billId: id,
      byteLength: pdfBytes.byteLength,
    });

    return new Response(new Uint8Array(pdfBytes), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `${disposition}; filename="${filename}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error(
      error instanceof Error
        ? `Invoice PDF generation failed: ${error.message}`
        : "Invoice PDF generation failed with an unknown error.",
    );

    return NextResponse.json(
      { error: "Invoice PDF generation failed." },
      { status: 500 },
    );
  }
}
