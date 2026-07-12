import type {
  InvoiceDocumentData,
  InvoiceLineItemGroup,
} from "@/lib/invoice-document";
import { shouldShowDraftWatermark } from "@/lib/invoice-document";
import {
  formatInvoiceDate,
  formatInvoiceDiscount,
  formatInvoiceMoney,
  formatInvoicePercent,
} from "@/lib/invoice-formatting";

type InvoicePreviewProps = {
  invoice: InvoiceDocumentData;
};

function InvoiceItemsTable({
  group,
  invoice,
}: {
  group: InvoiceLineItemGroup;
  invoice: InvoiceDocumentData;
}) {
  if (group.items.length === 0) {
    return null;
  }

  return (
    <section className="invoice-section">
      <h2>{group.label}</h2>
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Date</th>
            <th>Description</th>
            <th>Attorney</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {group.items.map((item) => (
            <tr key={item.id}>
                <td>{item.type ?? ""}</td>
                <td>{formatInvoiceDate(item.date)}</td>
              <td>
                <span className="line-description">{item.description}</span>
                {item.note ? <span className="line-note">{item.note}</span> : null}
              </td>
              <td>{item.attorney ?? ""}</td>
              <td>{item.quantity ?? ""}</td>
                <td>{formatInvoiceMoney(item.price, invoice)}</td>
                <td>{formatInvoiceMoney(item.total, invoice)}</td>
            </tr>
          ))}
          <tr>
            <td colSpan={6}>Subtotal</td>
            <td>{formatInvoiceMoney(group.subtotal, invoice)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <article className="invoice-page bg-white text-slate-950">
      {shouldShowDraftWatermark(invoice) ? (
        <div aria-hidden="true" className="invoice-watermark">
          Draft
        </div>
      ) : null}
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

      <section className="invoice-summary-grid">
        <div className="invoice-info-card">
          <h2>Bill To</h2>
          <p className="summary-primary">{invoice.client.name}</p>
          {invoice.client.addressLines.length > 0 ? (
            invoice.client.addressLines.map((line) => <p key={line}>{line}</p>)
          ) : null}
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

      <section className="invoice-section invoice-matter-strip">
        <h2>Re / Subject</h2>
        <p>{invoice.subject ?? invoice.matter.description ?? "Subject details pending"}</p>
        {invoice.matter.number ? <span>{invoice.matter.number}</span> : null}
      </section>

      <InvoiceItemsTable group={invoice.services} invoice={invoice} />
      <InvoiceItemsTable group={invoice.expenses} invoice={invoice} />

      <section className="invoice-section">
        <h2>Attorney Table</h2>
        {invoice.attorneys.length > 0 ? (
          <table className="invoice-table">
            <tbody>
              {invoice.attorneys.map((attorney) => (
                <tr key={attorney.name}>
                  <td>{attorney.name}</td>
                  <td>{attorney.role ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Attorney details pending Clio field verification.</p>
        )}
      </section>

      <section className="invoice-section">
        <h2>Lawyer Responsible E-Signature</h2>
        {invoice.responsibleAttorneySignatureImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Responsible attorney signature"
            src={invoice.responsibleAttorneySignatureImage}
          />
        ) : null}
        <p>{invoice.responsibleAttorneySignature ?? "Signature pending."}</p>
      </section>

      <div className="invoice-bottom-grid">
        <section className="payment-block">
          <h2>Firm Bank Account Details</h2>
          {invoice.firm.bankAccountLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>Please reference invoice #{invoice.invoiceNumber}.</p>
        </section>

        <section className="invoice-totals">
          <h2>Account Summary</h2>
          <dl>
            {invoice.services.items.length > 0 ? (
              <div>
                <dt>Services Subtotal</dt>
                <dd>{formatInvoiceMoney(invoice.services.subtotal, invoice)}</dd>
              </div>
            ) : null}
            {invoice.expenses.items.length > 0 ? (
              <div>
                <dt>Expenses Subtotal</dt>
                <dd>{formatInvoiceMoney(invoice.expenses.subtotal, invoice)}</dd>
              </div>
            ) : null}
            {invoice.discount ? (
              <div>
                <dt>Discount</dt>
                <dd>{formatInvoiceDiscount(invoice.discount, invoice)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Tax Rate</dt>
              <dd>{formatInvoicePercent(invoice.taxRate)}</dd>
            </div>
            <div>
              <dt>Tax Amount</dt>
              <dd>{formatInvoiceMoney(invoice.tax, invoice)}</dd>
            </div>
            {invoice.accountSummary.interest ? (
              <div>
                <dt>Interest</dt>
                <dd>{formatInvoiceMoney(invoice.accountSummary.interest, invoice)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Total</dt>
              <dd>{formatInvoiceMoney(invoice.total, invoice)}</dd>
            </div>
            <div>
              <dt>Paid</dt>
              <dd>{formatInvoiceMoney(invoice.paid, invoice)}</dd>
            </div>
            <div className="balance-row">
              <dt>Balance Due</dt>
              <dd>{formatInvoiceMoney(invoice.balance, invoice)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <footer className="invoice-footer">
        {invoice.firm.footerLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </footer>
    </article>
  );
}
