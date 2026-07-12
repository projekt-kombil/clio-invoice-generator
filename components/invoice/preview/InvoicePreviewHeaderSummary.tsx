import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { formatInvoiceDate } from "@/lib/invoice-formatting";

type InvoicePreviewSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePreviewHeader({ invoice }: InvoicePreviewSectionProps) {
  return (
    <header className="invoice-header">
      <div className="invoice-brand">
        {invoice.firm.logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${invoice.firm.name} logo`}
            className="invoice-logo-mark"
            src={invoice.firm.logoSrc}
          />
        ) : (
          <div className="invoice-logo-mark">{invoice.firm.logoInitials}</div>
        )}
        <div>
          <p className="firm-name">{invoice.firm.name}</p>
          {invoice.firm.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            {invoice.firm.taxIdLabel}: {invoice.firm.taxId}
          </p>
        </div>
      </div>
      <div className="invoice-title-block">
        <p className="invoice-kicker">Tax Invoice</p>
        <h1>Invoice</h1>
        <p className="invoice-number">#{invoice.invoiceNumber}</p>
      </div>
    </header>
  );
}

export function InvoicePreviewSummary({ invoice }: InvoicePreviewSectionProps) {
  return (
    <section className="invoice-summary-grid">
      <div className="invoice-info-card">
        <h2>Bill To</h2>
        <p className="summary-primary">{invoice.client.name}</p>
        {invoice.client.addressLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>

      <div className="invoice-info-card invoice-information">
        <h2>Invoice Details</h2>
        <dl>
          <div>
            <dt>Invoice</dt>
            <dd>#{invoice.invoiceNumber}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatInvoiceDate(invoice.issuedAt)}</dd>
          </div>
          <div>
            <dt>Due</dt>
            <dd>{formatInvoiceDate(invoice.dueAt)}</dd>
          </div>
          <div>
            <dt>Reference</dt>
            <dd>{invoice.reference ?? ""}</dd>
          </div>
          <div>
            <dt>Matter</dt>
            <dd>{invoice.matter.description ?? ""}</dd>
          </div>
          <div>
            <dt>Matter No.</dt>
            <dd>{invoice.matter.number ?? ""}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function InvoicePreviewSubject({ invoice }: InvoicePreviewSectionProps) {
  return (
    <section className="invoice-section invoice-matter-strip">
      <h2>Re / Subject</h2>
      <p>{invoice.subject ?? invoice.matter.description ?? "Subject details pending"}</p>
      {invoice.matter.number ? <span>{invoice.matter.number}</span> : null}
    </section>
  );
}
