import type { InvoiceDocumentData } from "@/lib/invoice-document";
import {
  formatInvoiceMoney,
  formatInvoicePercent,
} from "@/lib/invoice-formatting";
import { imageSource } from "@/components/invoice/image-source";
import { getInvoiceOverallTotalSummary } from "@/components/invoice/overall-total";

type InvoicePreviewSectionProps = {
  invoice: InvoiceDocumentData;
};

export function InvoicePreviewOverallTotal({
  invoice,
}: InvoicePreviewSectionProps) {
  const totalSummary = getInvoiceOverallTotalSummary(invoice);

  return (
    <section className="invoice-section invoice-overall-total">
      <h2 className="invoice-table-title">Invoice Total</h2>
      <table className="invoice-table invoice-overall-total-table">
        <tbody>
          <tr>
            <td>Subtotal ({invoice.firm.currencyCode})</td>
            <td>{formatInvoiceMoney(totalSummary.subtotal, invoice)}</td>
          </tr>
          <tr>
            <td>
              Tax
              {invoice.taxRate !== null
                ? ` (${formatInvoicePercent(invoice.taxRate)})`
                : ""}{" "}
              ({invoice.firm.currencyCode})
            </td>
            <td>{formatInvoiceMoney(totalSummary.tax, invoice)}</td>
          </tr>
          <tr>
            <td>Total ({invoice.firm.currencyCode})</td>
            <td>{formatInvoiceMoney(totalSummary.total, invoice)}</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function InvoicePreviewSignature({ invoice }: InvoicePreviewSectionProps) {
  const signatureImageSrc = imageSource(invoice.responsibleAttorneySignatureImage);

  return (
    <section className="invoice-section invoice-signature-section">
      <h2 className="invoice-signature-heading">
        With Comliments
      </h2>
      <div className="invoice-signature-box">
        {signatureImageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="Responsible attorney signature"
            src={signatureImageSrc}
          />
        ) : null}
        <p>Jema lawyers</p>
      </div>
      <InvoicePreviewPaymentDetails invoice={invoice} />
    </section>
  );
}

function InvoicePreviewPaymentDetails({ invoice }: InvoicePreviewSectionProps) {
  return (
    <section className="payment-details">
      <p className="payment-instruction">
        Please pay within 14 days by direct deposit in Jema Lawyers Bank Account
        as detailed:
      </p>
      <div className="payment-bank-grid">
        {invoice.firm.bankAccounts.map((account) => (
          <div className="payment-bank-column" key={account.accountNumber}>
            <h2>{account.bankName}</h2>
            <dl>
              <div>
                <dt>Account Name</dt>
                <dd>{account.accountName}</dd>
              </div>
              <div>
                <dt>Branch</dt>
                <dd>{account.branch}</dd>
              </div>
              <div>
                <dt>BSB No</dt>
                <dd>{account.bsbNumber}</dd>
              </div>
              <div>
                <dt>SWIFT Code</dt>
                <dd>{account.swiftCode}</dd>
              </div>
              <div>
                <dt>Account Number</dt>
                <dd>{account.accountNumber}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
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
