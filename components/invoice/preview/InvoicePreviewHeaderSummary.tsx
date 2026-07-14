import type { InvoiceDocumentData } from "@/lib/invoice-document";
import { formatInvoiceDate } from "@/lib/invoice-formatting";
import { imageSource } from "@/components/invoice/image-source";
import { getInvoiceLegalTeam } from "@/components/invoice/attorney-summary";

type InvoicePreviewSectionProps = {
  invoice: InvoiceDocumentData;
};

const TWO_COLUMN_LAWYER_THRESHOLD = 6;

export function InvoicePreviewHeader({ invoice }: InvoicePreviewSectionProps) {
  const legalTeam = getInvoiceLegalTeam(invoice);
  const logoSrc = imageSource(invoice.firm.logoSrc);
  const lawyerListClassName =
    legalTeam.lawyers.length >= TWO_COLUMN_LAWYER_THRESHOLD
      ? "invoice-header-lawyer-list invoice-header-lawyer-list-two-column"
      : "invoice-header-lawyer-list";

  return (
    <header className="invoice-header">
      <div className="invoice-brand">
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${invoice.firm.name} logo`}
            className="invoice-logo-mark"
            src={logoSrc}
          />
        ) : (
          <div className="invoice-logo-mark">{invoice.firm.logoInitials}</div>
        )}
        <div className="invoice-firm-address">
          {invoice.firm.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <div className="invoice-client-address">
          <h2>Client Address</h2>
          <p className="summary-primary">{invoice.client.name}</p>
          {invoice.client.addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </div>
      <div className="invoice-title-block">
        <div className="invoice-header-legal-team">
          <h2 className="invoice-header-legal-label">Principal</h2>
          <p>{legalTeam.principal}</p>
          <h2 className="invoice-header-legal-label">Lawyers</h2>
          <div className={lawyerListClassName}>
            {legalTeam.lawyers.length > 0 ? (
              legalTeam.lawyers.map((lawyer) => <p key={lawyer}>{lawyer}</p>)
            ) : null}
          </div>
        </div>

        <h2 className="invoice-kicker">Tax Invoice</h2>
        <p className="invoice-tax-id">
          {invoice.firm.taxIdLabel}: {invoice.firm.taxId}
        </p>
        <dl className="invoice-title-meta">
          <div>
            <dt>Invoice #</dt>
            <dd>{invoice.invoiceNumber}</dd>
          </div>
          <div>
            <dt>Date</dt>
            <dd>{formatInvoiceDate(invoice.issuedAt)}</dd>
          </div>
          <div>
            <dt>Due On</dt>
            <dd>{formatInvoiceDate(invoice.dueAt)}</dd>
          </div>
          <div>
            <dt>Our Ref</dt>
            <dd>{invoice.reference ?? ""}</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}

export function InvoicePreviewSubject({ invoice }: InvoicePreviewSectionProps) {
  return (
    <p className="invoice-re-line">
      <strong>Re:</strong>{" "}
      <span className="invoice-re-subject">
        {invoice.subject ?? invoice.matter.description ?? ""}
      </span>
    </p>
  );
}
