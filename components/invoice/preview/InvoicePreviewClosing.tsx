import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceDiscount,
  formatInvoiceMoney,
  formatInvoicePercent,
} from "@/lib/invoice-formatting";

type InvoicePreviewSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePreviewAttorneys({ invoice }: InvoicePreviewSectionProps) {
  return (
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
  );
}

export function InvoicePreviewSignature({ invoice }: InvoicePreviewSectionProps) {
  return (
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
  );
}

function InvoicePreviewTotals({ invoice }: InvoicePreviewSectionProps) {
  return (
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
  );
}

export function InvoicePreviewBottom({ invoice }: InvoicePreviewSectionProps) {
  return (
    <div className="invoice-bottom-grid">
      <section className="payment-block">
        <h2>Firm Bank Account Details</h2>
        {invoice.firm.bankAccountLines.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>Please reference invoice #{invoice.invoiceNumber}.</p>
      </section>

      <InvoicePreviewTotals invoice={invoice} />
    </div>
  );
}

export function InvoicePreviewFooter({ invoice }: InvoicePreviewSectionProps) {
  return (
    <footer className="invoice-footer">
      {invoice.firm.footerLines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </footer>
  );
}
