import type { InvoiceDocumentData } from "@/lib/invoice-document";

type InvoicePreviewProps = {
  invoice: InvoiceDocumentData;
};

function formatDate(value: string | null): string {
  return value ?? "";
}

function formatMoney(value: string | number | null): string {
  if (value === null) {
    return "";
  }

  return typeof value === "number" ? value.toFixed(2) : value;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  return (
    <article className="invoice-page bg-white text-slate-950">
      <header className="invoice-header">
        <div className="invoice-brand">
          <div className="invoice-logo-mark">IG</div>
          <div>
            <p className="firm-name">Invoice Generator</p>
            <p>Firm details pending</p>
            <p>Logo and contact details will be added later.</p>
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
          ) : (
            <p>Client address pending.</p>
          )}
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
              <dd>{formatDate(invoice.issuedAt)}</dd>
            </div>
            <div>
              <dt>Due</dt>
              <dd>{formatDate(invoice.dueAt)}</dd>
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
        <h2>Matter</h2>
        <p>{invoice.matter.description ?? "Matter details pending"}</p>
        {invoice.matter.number ? <span>{invoice.matter.number}</span> : null}
      </section>

      <section className="invoice-section">
        <h2>Invoice Items</h2>
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Tax</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.length > 0 ? (
              invoice.items.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.date)}</td>
                  <td>
                    <span className="line-description">{item.description}</span>
                    {item.type ? <span className="line-type">{item.type}</span> : null}
                    {item.note ? <span className="line-note">{item.note}</span> : null}
                  </td>
                  <td>{formatMoney(item.quantity)}</td>
                  <td>{formatMoney(item.price)}</td>
                  <td>{formatMoney(item.tax)}</td>
                  <td>{formatMoney(item.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No line items were returned for this bill.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <div className="invoice-bottom-grid">
        <section className="payment-block">
          <h2>Payment Instructions</h2>
          <p>Payment instructions will be added later.</p>
          <p>Please reference invoice #{invoice.invoiceNumber}.</p>
        </section>

        <section className="invoice-totals">
          <dl>
            <div>
              <dt>Tax</dt>
              <dd>{formatMoney(invoice.tax)}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{formatMoney(invoice.total)}</dd>
            </div>
            <div>
              <dt>Paid</dt>
              <dd>{formatMoney(invoice.paid)}</dd>
            </div>
            <div className="balance-row">
              <dt>Balance Due</dt>
              <dd>{formatMoney(invoice.balance)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <footer className="invoice-footer">
        <p>Thank you for your business.</p>
      </footer>
    </article>
  );
}
